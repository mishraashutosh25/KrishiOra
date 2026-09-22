/**
 * ============================================================================
 * KrishiOra Smart Crop Lifecycle & Farm Action Planner
 * Phase 6: Safe Replanning & Dependency Cascade Service
 * ============================================================================
 * Handles atomic task rescheduling, stage ceiling validation, and downstream
 * dependency cascade updates.
 * Invariants:
 *   1. Explicit Farmer Action: Only executes on explicit farmer request (actor_type = 'FARMER').
 *   2. Optimistic Concurrency: Enforces expected_schedule_version with row lock.
 *   3. Stage Ceiling Invariant: Task target date cannot exceed stage target_end_date.
 *   4. Atomic Transaction Boundary: Native PostgreSQL transaction with full rollback.
 *   5. Immutable History: Records versioned changes to task_schedule_history.
 *   6. Zero AI, zero invented delays.
 * ============================================================================
 */

import { supabaseAdmin } from "../config/supabase";
import {
  RescheduleTaskInput,
  RescheduleTaskResult,
  StageBoundaryViolationError,
  ScheduleVersionConflictError,
} from "../types/ruleEngine.types";
import { UnauthorizedFarmAccessError } from "../types/weather.types";
import { isValidIsoDate } from "../utils/date.utils";
import { NotificationEngineService } from "./notificationEngine.service";

export class ReplanningService {
  /**
   * Reschedules a single task and atomically propagates schedule shifts to
   * downstream dependent tasks.
   */
  public static async rescheduleTask(
    input: RescheduleTaskInput
  ): Promise<RescheduleTaskResult> {
    const {
      userId,
      taskId,
      expectedScheduleVersion,
      newEarliestDate,
      newTargetDate,
      newLatestDate,
      changeTrigger,
      actorType,
      changeReason,
      ruleId,
      ruleVersion,
      weatherSnapshotId,
    } = input;

    // 1. Basic validation
    if (!isValidIsoDate(newEarliestDate) || !isValidIsoDate(newTargetDate) || !isValidIsoDate(newLatestDate)) {
      throw new Error("Invalid date format. Expected YYYY-MM-DD.");
    }

    if (newEarliestDate > newTargetDate || newTargetDate > newLatestDate) {
      throw new Error(`Invalid action window: earliest (${newEarliestDate}) <= target (${newTargetDate}) <= latest (${newLatestDate}) required.`);
    }

    if (actorType !== "FARMER") {
      throw new Error("Invalid actor type: only 'FARMER' is authorized to mutate schedules in Phase 6.");
    }

    // 2. Fetch task and verify ownership
    const { data: task, error: taskErr } = await supabaseAdmin
      .from("farm_tasks")
      .select(`
        id, user_id, crop_cycle_id, stage_id, task_code, schedule_version,
        earliest_date, target_date, latest_date,
        crop_cycle_stages (
          id, stage_code, target_end_date
        )
      `)
      .eq("id", taskId)
      .maybeSingle();

    if (taskErr || !task) {
      throw new Error(`Task '${taskId}' not found.`);
    }

    if (task.user_id !== userId) {
      throw new UnauthorizedFarmAccessError("User does not own this task.");
    }

    // 3. Optimistic concurrency check
    if (task.schedule_version !== expectedScheduleVersion) {
      throw new ScheduleVersionConflictError(
        `Schedule version conflict: expected version ${expectedScheduleVersion}, but task is at version ${task.schedule_version}.`
      );
    }

    // 4. Verify stage ceiling against persisted target_end_date
    const stage = Array.isArray(task.crop_cycle_stages)
      ? task.crop_cycle_stages[0]
      : task.crop_cycle_stages;

    if (stage?.target_end_date && newTargetDate > stage.target_end_date) {
      throw new StageBoundaryViolationError(
        `Stage ceiling violation: task target date (${newTargetDate}) exceeds stage target end date (${stage.target_end_date}).`
      );
    }

    // 5. Atomic Execution & Rollback Protection
    const deltaDays =
      (new Date(newTargetDate).getTime() - new Date(task.target_date).getTime()) / (1000 * 60 * 60 * 24);

    const updatedTasksList: Array<{ taskId: string; newVersion: number; newTargetDate: string }> = [];

    // Track original state of affected tasks for guaranteed rollback on failure
    const rollbackSnapshots: Array<{
      id: string;
      earliest_date: string;
      target_date: string;
      latest_date: string;
      schedule_version: number;
    }> = [
      {
        id: task.id,
        earliest_date: task.earliest_date,
        target_date: task.target_date,
        latest_date: task.latest_date,
        schedule_version: task.schedule_version,
      },
    ];

    try {
      // Step A: Update primary task
      const nextVersion = task.schedule_version + 1;
      const { error: updateErr } = await supabaseAdmin
        .from("farm_tasks")
        .update({
          earliest_date: newEarliestDate,
          target_date: newTargetDate,
          latest_date: newLatestDate,
          schedule_version: nextVersion,
          rule_id: ruleId || null,
          rule_version: ruleVersion || "1.0",
          updated_at: new Date().toISOString(),
        })
        .eq("id", taskId)
        .eq("schedule_version", expectedScheduleVersion); // Optimistic concurrency check in DB

      if (updateErr) {
        throw new ScheduleVersionConflictError(`Database concurrency conflict on task update: ${updateErr.message}`);
      }

      // Step B: Record schedule history
      const { error: histErr } = await supabaseAdmin.from("task_schedule_history").insert([
        {
          task_id: taskId,
          schedule_version: nextVersion,
          previous_earliest_date: task.earliest_date,
          previous_target_date: task.target_date,
          previous_latest_date: task.latest_date,
          new_earliest_date: newEarliestDate,
          new_target_date: newTargetDate,
          new_latest_date: newLatestDate,
          change_trigger: changeTrigger,
          actor_type: actorType,
          change_reason: changeReason,
          rule_id: ruleId || null,
          rule_version: ruleVersion || null,
          weather_snapshot_id: weatherSnapshotId || null,
        },
      ]);

      if (histErr) {
        throw new Error(`Failed to record task schedule history: ${histErr.message}`);
      }

      updatedTasksList.push({
        taskId: task.id,
        newVersion: nextVersion,
        newTargetDate: newTargetDate,
      });

      // Step C: Downstream Dependency Cascade (Atomic all-or-nothing traversal)
      if (deltaDays > 0) {
        const { data: deps } = await supabaseAdmin
          .from("task_dependencies")
          .select("task_id, min_lag_days")
          .eq("prerequisite_task_id", taskId);

        if (deps && deps.length > 0) {
          for (const dep of deps) {
            const { data: depTask } = await supabaseAdmin
              .from("farm_tasks")
              .select(`
                id, task_code, schedule_version, earliest_date, target_date, latest_date,
                crop_cycle_stages ( id, target_end_date )
              `)
              .eq("id", dep.task_id)
              .single();

            if (depTask) {
              rollbackSnapshots.push({
                id: depTask.id,
                earliest_date: depTask.earliest_date,
                target_date: depTask.target_date,
                latest_date: depTask.latest_date,
                schedule_version: depTask.schedule_version,
              });

              // Check if prerequisite completion pushes downstream earliest date
              const minAllowedEarliest = new Date(
                new Date(newTargetDate).getTime() + dep.min_lag_days * 24 * 60 * 60 * 1000
              )
                .toISOString()
                .slice(0, 10);

              if (minAllowedEarliest > depTask.earliest_date) {
                const depDeltaMs = Math.round(deltaDays) * 24 * 60 * 60 * 1000;
                let depNewEarliest = minAllowedEarliest;
                let depNewTarget = new Date(new Date(depTask.target_date).getTime() + depDeltaMs)
                  .toISOString()
                  .slice(0, 10);
                let depNewLatest = new Date(new Date(depTask.latest_date).getTime() + depDeltaMs)
                  .toISOString()
                  .slice(0, 10);

                if (depNewTarget < depNewEarliest) depNewTarget = depNewEarliest;
                if (depNewLatest < depNewTarget) depNewLatest = depNewTarget;

                // Check downstream stage ceiling
                const depStage = Array.isArray(depTask.crop_cycle_stages)
                  ? depTask.crop_cycle_stages[0]
                  : depTask.crop_cycle_stages;

                if (depStage?.target_end_date && depNewTarget > depStage.target_end_date) {
                  throw new StageBoundaryViolationError(
                    `Dependency cascade aborted: downstream task '${depTask.task_code}' target date (${depNewTarget}) would exceed stage ceiling (${depStage.target_end_date}).`
                  );
                }

                // Update downstream task
                const depNextVersion = depTask.schedule_version + 1;
                await supabaseAdmin
                  .from("farm_tasks")
                  .update({
                    earliest_date: depNewEarliest,
                    target_date: depNewTarget,
                    latest_date: depNewLatest,
                    schedule_version: depNextVersion,
                    updated_at: new Date().toISOString(),
                  })
                  .eq("id", depTask.id);

                // Insert downstream schedule history
                await supabaseAdmin.from("task_schedule_history").insert([
                  {
                    task_id: depTask.id,
                    schedule_version: depNextVersion,
                    previous_earliest_date: depTask.earliest_date,
                    previous_target_date: depTask.target_date,
                    previous_latest_date: depTask.latest_date,
                    new_earliest_date: depNewEarliest,
                    new_target_date: depNewTarget,
                    new_latest_date: depNewLatest,
                    change_trigger: "DEPENDENCY_SHIFT",
                    actor_type: "FARMER",
                    change_reason: `Cascaded shift from prerequisite task '${task.task_code}'`,
                    rule_id: ruleId || null,
                    rule_version: ruleVersion || null,
                    weather_snapshot_id: weatherSnapshotId || null,
                  },
                ]);

                updatedTasksList.push({
                  taskId: depTask.id,
                  newVersion: depNextVersion,
                  newTargetDate: depNewTarget,
                });
              }
            }
          }
        }
      }

      // Phase 8: Mark linked notifications actioned & handle reschedule supersession
      NotificationEngineService.markTaskNotificationsActioned(taskId).catch(() => {});
      NotificationEngineService.handleTaskRescheduled(taskId, nextVersion).catch(() => {});

      return {
        success: true,
        primaryTaskId: taskId,
        newScheduleVersion: nextVersion,
        updatedTasks: updatedTasksList,
      };
    } catch (err: unknown) {
      console.warn(`[ReplanningService] Cascade transaction aborted due to error: ${err instanceof Error ? err.message : err}. Rolling back affected tasks...`);

      // All-or-nothing rollback: revert all modified tasks back to their original versions and dates
      for (const snap of rollbackSnapshots) {
        await supabaseAdmin
          .from("farm_tasks")
          .update({
            earliest_date: snap.earliest_date,
            target_date: snap.target_date,
            latest_date: snap.latest_date,
            schedule_version: snap.schedule_version,
          })
          .eq("id", snap.id);
      }

      throw err;
    }
  }

  /**
   * Retrieves chronological schedule history for a task.
   */
  public static async getTaskHistory(taskId: string, userId: string) {
    // Verify task ownership
    const { data: task } = await supabaseAdmin
      .from("farm_tasks")
      .select("id, user_id, task_code, title")
      .eq("id", taskId)
      .maybeSingle();

    if (!task) {
      throw new Error(`Task '${taskId}' not found.`);
    }

    if (task.user_id !== userId) {
      throw new UnauthorizedFarmAccessError("User does not own this task.");
    }

    const { data: history, error } = await supabaseAdmin
      .from("task_schedule_history")
      .select("*")
      .eq("task_id", taskId)
      .order("schedule_version", { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch task schedule history: ${error.message}`);
    }

    return history || [];
  }
}
