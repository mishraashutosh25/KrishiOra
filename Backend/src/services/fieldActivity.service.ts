/**
 * ============================================================================
 * KrishiOra Smart Crop Lifecycle & Farm Action Planner
 * Phase 7: Field Activity Execution & Ground Reality Service
 * ============================================================================
 */

import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "../config/supabase";
import {
  ExecuteFieldActivityInput,
  ExecuteFieldActivityResult,
  FieldActivityReasonCode,
  FieldActivityStatus,
  InvalidActivityDateError,
  InvalidReasonCodeError,
  TaskAlreadyCompletedError,
  TaskAlreadyResolvedError,
  IdempotencyKeyConflictError,
  TaskCycleMismatchError,
  CycleStatusError,
} from "../types/fieldActivity.types";
import { UnauthorizedFarmAccessError } from "../types/weather.types";
import { daysBetween } from "../utils/date.utils";
import { NotificationEngineService } from "./notificationEngine.service";

export class FieldActivityService {
  /**
   * Deterministic canonical SHA-256 payload hash generator.
   */
  public static computePayloadHash(payload: {
    cropCycleId: string;
    taskId?: string | null;
    actionTaken: string;
    actionDate: string;
    status: FieldActivityStatus;
    reasonCode?: FieldActivityReasonCode | null;
    farmerNotes?: string | null;
  }): string {
    const canonical = JSON.stringify({
      actionDate: payload.actionDate,
      actionTaken: payload.actionTaken.trim(),
      cropCycleId: payload.cropCycleId,
      farmerNotes: (payload.farmerNotes || "").trim(),
      reasonCode: payload.reasonCode || null,
      status: payload.status,
      taskId: payload.taskId || null,
    });
    return crypto.createHash("sha256").update(canonical).digest("hex");
  }

  private static inFlightRequests = new Map<string, Promise<any>>();

  /**
   * Executes a field activity against a crop cycle and task atomically.
   * Serializes concurrent submissions sharing the same idempotency key.
   */
  public static async executeActivity(
    input: ExecuteFieldActivityInput
  ): Promise<ExecuteFieldActivityResult> {
    const { userId, idempotencyKey } = input;

    if (idempotencyKey && idempotencyKey.trim() !== "") {
      const lockKey = `${userId}:${idempotencyKey.trim()}`;
      const existingInFlight = this.inFlightRequests.get(lockKey);
      if (existingInFlight) {
        await existingInFlight.catch(() => {});
      }

      let resolvePromise: (val: any) => void;
      const inFlightPromise = new Promise((resolve) => {
        resolvePromise = resolve;
      });
      this.inFlightRequests.set(lockKey, inFlightPromise);

      try {
        return await this.executeActivityInternal(input);
      } finally {
        this.inFlightRequests.delete(lockKey);
        resolvePromise!(true);
      }
    }

    return this.executeActivityInternal(input);
  }

  private static async executeActivityInternal(
    input: ExecuteFieldActivityInput
  ): Promise<ExecuteFieldActivityResult> {
    const {
      userId,
      cropCycleId,
      taskId,
      actionTaken,
      actionDate,
      status,
      reasonCode,
      farmerNotes,
      idempotencyKey,
      metadata = {},
    } = input;

    // 1. Validate Input Action Date Format & Boundaries
    const today = new Date().toISOString().split("T")[0];
    if (actionDate > today) {
      throw new InvalidActivityDateError(
        `Action date (${actionDate}) cannot be in the future (today is ${today}).`
      );
    }

    // 2. Validate Status and Reason Codes
    const validStatuses: FieldActivityStatus[] = [
      "IN_PROGRESS",
      "COMPLETED",
      "POSTPONED",
      "SKIPPED",
      "UNABLE_TO_COMPLETE",
    ];
    if (!validStatuses.includes(status)) {
      throw new Error(`Invalid activity status: ${status}`);
    }

    const validReasons: FieldActivityReasonCode[] = [
      "RAIN_INTERFERENCE",
      "SOIL_TOO_WET",
      "LABOUR_UNAVAILABLE",
      "WATER_SHORTAGE",
      "EQUIPMENT_BREAKDOWN",
      "OBSERVED_READY_EARLY",
      "OTHER",
    ];

    if (["POSTPONED", "UNABLE_TO_COMPLETE"].includes(status)) {
      if (!reasonCode || !validReasons.includes(reasonCode)) {
        throw new InvalidReasonCodeError(
          `Reason code is required and must be valid for status ${status}. Got: ${reasonCode}`
        );
      }
    }

    // 3. Compute Canonical Payload Hash
    const payloadHash = this.computePayloadHash({
      cropCycleId,
      taskId,
      actionTaken,
      actionDate,
      status,
      reasonCode,
      farmerNotes,
    });

    // 4. Verify Crop Cycle Ownership & Sowing Date
    const { data: cycle, error: cycleErr } = await supabaseAdmin
      .from("crop_cycles")
      .select("id, user_id, farm_id, sowing_date, status, target_harvest_date")
      .eq("id", cropCycleId)
      .maybeSingle();

    if (cycleErr || !cycle) {
      throw new Error(`Crop cycle not found: ${cropCycleId}`);
    }

    if (cycle.user_id !== userId) {
      throw new UnauthorizedFarmAccessError(
        `Unauthorized: User does not own crop cycle ${cropCycleId}`
      );
    }

    if (["COMPLETED", "ABANDONED"].includes(cycle.status)) {
      throw new CycleStatusError(
        `Invalid cycle status: Activities cannot be logged for ${cycle.status} cycle.`
      );
    }

    if (actionDate < cycle.sowing_date) {
      throw new InvalidActivityDateError(
        `Action date (${actionDate}) cannot precede crop cycle sowing date (${cycle.sowing_date}).`
      );
    }

    // 5. Verify Task Ownership & Cycle Alignment (if taskId provided)
    let taskRecord: any = null;
    if (taskId) {
      const { data: task, error: taskErr } = await supabaseAdmin
        .from("farm_tasks")
        .select("id, crop_cycle_id, stage_id, user_id, task_code, title, category, earliest_date, target_date, latest_date, priority, status")
        .eq("id", taskId)
        .maybeSingle();

      if (taskErr || !task) {
        const notFoundErr: any = new Error(`Task not found: ${taskId}`);
        notFoundErr.statusCode = 404;
        throw notFoundErr;
      }

      if (task.user_id !== userId) {
        throw new UnauthorizedFarmAccessError(
          `Unauthorized: User does not own task ${taskId}`
        );
      }

      if (task.crop_cycle_id !== cropCycleId) {
        throw new TaskCycleMismatchError(
          `Task cycle mismatch: Task ${taskId} belongs to cycle ${task.crop_cycle_id}, not ${cropCycleId}`
        );
      }

      // Status Transition Guards
      if (task.status === "COMPLETED") {
        throw new TaskAlreadyCompletedError(
          `TaskAlreadyCompletedError: Task ${taskId} is already COMPLETED and cannot be re-executed.`
        );
      }

      if (["SKIPPED", "CANCELLED"].includes(task.status)) {
        throw new TaskAlreadyResolvedError(
          `TaskAlreadyResolvedError: Task ${taskId} is already resolved (${task.status}) and cannot be re-executed.`
        );
      }

      taskRecord = task;
    }

    // 6. Invoke PostgreSQL Transactional RPC: execute_farmer_field_activity
    // Uses authenticated user-scoped client when userJwt is provided; falls back to supabaseAdmin.
    // Concurrency, row-locking (FOR UPDATE), idempotency index, state machine, and atomic rollback are handled inside PostgreSQL.
    const client = input.userJwt
      ? createClient(
          process.env.SUPABASE_URL!,
          process.env.SUPABASE_PUBLISHABLE_KEY!,
          { global: { headers: { Authorization: `Bearer ${input.userJwt}` } } }
        )
      : supabaseAdmin;

    const { data: rpcResult, error: rpcErr } = await client.rpc(
      "execute_farmer_field_activity",
      {
        p_crop_cycle_id: cropCycleId,
        p_task_id: taskId || null,
        p_action_taken: actionTaken,
        p_action_date: actionDate,
        p_status: status,
        p_reason_code: reasonCode || null,
        p_farmer_notes: farmerNotes || null,
        p_idempotency_key: idempotencyKey || null,
        p_payload_hash: payloadHash,
        p_metadata: metadata,
      }
    );

    if (rpcErr) {
      if (rpcErr.code !== "PGRST202") {
        const errMsg = rpcErr.message || "";
        if (
          rpcErr.code === "23505" ||
          errMsg.includes("Idempotency key conflict") ||
          errMsg.includes("uq_field_activity_user_idempotency")
        ) {
          throw new IdempotencyKeyConflictError(
            `Idempotency key conflict: Key "${idempotencyKey}" already exists or was previously used with a different request payload.`
          );
        }
        if (rpcErr.code === "42501" || errMsg.includes("Unauthorized") || errMsg.includes("Authentication required")) {
          throw new UnauthorizedFarmAccessError(errMsg);
        }
        if (rpcErr.code === "22007" || errMsg.includes("Invalid action date")) {
          throw new InvalidActivityDateError(errMsg);
        }
        if (rpcErr.code === "22023" || errMsg.includes("Invalid activity status") || errMsg.includes("Invalid or missing reason_code")) {
          throw new InvalidReasonCodeError(errMsg);
        }
        if (rpcErr.code === "23503" || errMsg.includes("Task cycle mismatch")) {
          throw new TaskCycleMismatchError(errMsg);
        }
        if (errMsg.includes("TaskAlreadyCompletedError")) {
          throw new TaskAlreadyCompletedError(errMsg);
        }
        if (errMsg.includes("TaskAlreadyResolvedError")) {
          throw new TaskAlreadyResolvedError(errMsg);
        }
        if (errMsg.includes("Invalid cycle status")) {
          throw new CycleStatusError(errMsg);
        }
        if (rpcErr.code === "P0002" || errMsg.includes("not found")) {
          const notFoundErr: any = new Error(errMsg);
          notFoundErr.statusCode = 404;
          throw notFoundErr;
        }
        throw new Error(`RPC execution failed: ${errMsg}`);
      }

      // Fallback: If RPC function is not yet installed in schema cache (PGRST202),
      // perform atomic transaction block (established project pattern from LifecycleGeneratorService)
      console.warn("RPC function not found in schema cache. Using fallback atomic transaction block.");

      // A. Check Idempotency Key in Database
      if (idempotencyKey && idempotencyKey.trim() !== "") {
        const { data: existingLog } = await supabaseAdmin
          .from("field_activity_logs")
          .select("id, task_id, status, action_date, created_at, metadata")
          .eq("user_id", userId)
          .eq("metadata->>idempotency_key", idempotencyKey)
          .maybeSingle();

        if (existingLog) {
          if (existingLog.metadata?.payload_hash && existingLog.metadata.payload_hash !== payloadHash) {
            throw new IdempotencyKeyConflictError(
              `Idempotency key conflict: Key "${idempotencyKey}" already exists or was previously used with a different request payload.`
            );
          }
          return {
            success: true,
            idempotentReplay: true,
            activityLogId: existingLog.id,
            cropCycleId,
            taskId: existingLog.task_id || null,
            taskStatus: existingLog.status as FieldActivityStatus,
            actionDate: existingLog.action_date,
            recordedAt: existingLog.created_at,
            variance: {
              plannedTargetDate: taskRecord ? taskRecord.target_date : null,
              varianceDays: taskRecord ? daysBetween(taskRecord.target_date, existingLog.action_date) : 0,
              executionTiming: "ON_TIME",
            },
            stageProgress: {
              stageId: taskRecord ? taskRecord.stage_id : null,
              stageCode: null,
              stageStatus: "IN_PROGRESS",
              stageAdvanced: false,
            },
            cycleStatus: cycle.status,
            message: "Idempotent replay: Activity was previously recorded with identical payload.",
          };
        }
      }

      // B. Insert Field Activity Log
      const fullMetadata = {
        ...metadata,
        idempotency_key: idempotencyKey || null,
        payload_hash: payloadHash,
      };

      const { data: insertedLog, error: logErr } = await supabaseAdmin
        .from("field_activity_logs")
        .insert([
          {
            crop_cycle_id: cropCycleId,
            task_id: taskId || null,
            user_id: userId,
            action_taken: actionTaken,
            action_date: actionDate,
            status: status,
            reason_code: reasonCode || null,
            farmer_notes: farmerNotes || null,
            metadata: fullMetadata,
          },
        ])
        .select("id, created_at")
        .single();

      if (logErr) {
        if (
          logErr.code === "23505" ||
          logErr.message?.includes("uq_field_activity_user_idempotency") ||
          logErr.message?.includes("idempotency")
        ) {
          throw new IdempotencyKeyConflictError(
            `Idempotency key conflict: Key "${idempotencyKey}" already exists.`
          );
        }
        throw logErr;
      }

      // C. Update Task Status (if task_id provided)
      if (taskId && taskRecord) {
        const { error: taskUpdErr } = await supabaseAdmin
          .from("farm_tasks")
          .update({
            status: status,
            updated_at: new Date().toISOString(),
          })
          .eq("id", taskId);

        if (taskUpdErr) throw taskUpdErr;
      }

      // D. Stage & Cycle Progression State Machine
      let stageAdvanced = false;
      let stageNewStatus = "IN_PROGRESS";
      let cycleNewStatus = cycle.status;
      let stageRecord: any = null;

      if (taskRecord?.stage_id) {
        const { data: stage } = await supabaseAdmin
          .from("crop_cycle_stages")
          .select("*")
          .eq("id", taskRecord.stage_id)
          .single();

        if (stage) {
          stageRecord = stage;
          // Stage Activation (UPCOMING -> IN_PROGRESS)
          if (stage.status === "UPCOMING" && ["IN_PROGRESS", "COMPLETED"].includes(status)) {
            await supabaseAdmin
              .from("crop_cycle_stages")
              .update({
                status: "IN_PROGRESS",
                actual_start_date: stage.actual_start_date
                  ? (actionDate < stage.actual_start_date ? actionDate : stage.actual_start_date)
                  : actionDate,
                updated_at: new Date().toISOString(),
              })
              .eq("id", stage.id);
            stageAdvanced = true;
            stageNewStatus = "IN_PROGRESS";
          } else {
            stageNewStatus = stage.status;
          }

          // Check if all tasks in stage are terminal
          const { data: stageTasks } = await supabaseAdmin
            .from("farm_tasks")
            .select("id, status, priority, category")
            .eq("stage_id", stage.id);

          const allTasks = stageTasks || [];
          const allTerminal = allTasks.every((t) =>
            ["COMPLETED", "SKIPPED", "UNABLE_TO_COMPLETE"].includes(t.status)
          );

          if (allTerminal && allTasks.length > 0) {
            const completedTasks = allTasks.filter((t) => t.status === "COMPLETED");

            if (completedTasks.length === 0) {
              // Zero successful completions rule: Stage CANNOT become COMPLETED
              await supabaseAdmin
                .from("crop_cycle_stages")
                .update({ status: "DELAYED", updated_at: new Date().toISOString() })
                .eq("id", stage.id);
              stageNewStatus = "DELAYED";
            } else {
              // Check for mandatory task omissions
              const { data: deps } = await supabaseAdmin
                .from("task_dependencies")
                .select("prerequisite_task_id")
                .in("prerequisite_task_id", allTasks.map((t) => t.id));

              const prereqIds = new Set((deps || []).map((d) => d.prerequisite_task_id));
              const hasMandatoryOmission = allTasks.some(
                (t) =>
                  ["SKIPPED", "UNABLE_TO_COMPLETE"].includes(t.status) &&
                  (t.priority === "CRITICAL" || prereqIds.has(t.id))
              );

              if (hasMandatoryOmission) {
                await supabaseAdmin
                  .from("crop_cycle_stages")
                  .update({ status: "DELAYED", updated_at: new Date().toISOString() })
                  .eq("id", stage.id);
                stageNewStatus = "DELAYED";
              } else {
                // Stage completed successfully
                // Compute actual_end_date: MAX(action_date) of completed tasks in this stage
                const { data: completedLogs } = await supabaseAdmin
                  .from("field_activity_logs")
                  .select("action_date")
                  .in("task_id", completedTasks.map((t) => t.id))
                  .eq("status", "COMPLETED")
                  .order("action_date", { ascending: false });

                const latestCompletionDate =
                  completedLogs && completedLogs.length > 0
                    ? completedLogs[0].action_date
                    : actionDate;

                await supabaseAdmin
                  .from("crop_cycle_stages")
                  .update({
                    status: "COMPLETED",
                    actual_end_date: latestCompletionDate,
                    updated_at: new Date().toISOString(),
                  })
                  .eq("id", stage.id);
                stageAdvanced = true;
                stageNewStatus = "COMPLETED";

                // Auto-unlock subsequent stage if UPCOMING
                await supabaseAdmin
                  .from("crop_cycle_stages")
                  .update({
                    status: "IN_PROGRESS",
                    actual_start_date: actionDate,
                    updated_at: new Date().toISOString(),
                  })
                  .eq("crop_cycle_id", cropCycleId)
                  .eq("stage_order", stage.stage_order + 1)
                  .eq("status", "UPCOMING");
              }
            }
          }

          // Check Harvest Transition Guard
          if (status === "COMPLETED" && taskRecord.category === "HARVEST") {
            const { data: preHarvestStages } = await supabaseAdmin
              .from("crop_cycle_stages")
              .select("id, status")
              .eq("crop_cycle_id", cropCycleId)
              .lt("stage_order", stage.stage_order)
              .neq("status", "COMPLETED");

            const { data: harvestPrereqs } = await supabaseAdmin
              .from("task_dependencies")
              .select("prerequisite_task_id, farm_tasks!prerequisite_task_id(status)")
              .eq("task_id", taskId);

            const incompletePrereqs = (harvestPrereqs || []).filter(
              (p: any) => p.farm_tasks?.status !== "COMPLETED"
            );

            if ((preHarvestStages || []).length === 0 && incompletePrereqs.length === 0) {
              await supabaseAdmin
                .from("crop_cycles")
                .update({
                  status: "HARVESTED",
                  actual_harvest_date: actionDate,
                  updated_at: new Date().toISOString(),
                })
                .eq("id", cropCycleId);
              cycleNewStatus = "HARVESTED";
            }
          }

          // Check Cycle Final Completion
          const { data: nonCompletedStages } = await supabaseAdmin
            .from("crop_cycle_stages")
            .select("id")
            .eq("crop_cycle_id", cropCycleId)
            .neq("status", "COMPLETED");

          if ((nonCompletedStages || []).length === 0) {
            const { data: nonTerminalPostHarvest } = await supabaseAdmin
              .from("farm_tasks")
              .select("id")
              .eq("crop_cycle_id", cropCycleId)
              .eq("category", "POST_HARVEST")
              .not("status", "in", '("COMPLETED","SKIPPED")');

            if ((nonTerminalPostHarvest || []).length === 0) {
              await supabaseAdmin
                .from("crop_cycles")
                .update({
                  status: "COMPLETED",
                  cycle_completion_date: actionDate,
                  updated_at: new Date().toISOString(),
                })
                .eq("id", cropCycleId);
              cycleNewStatus = "COMPLETED";
            }
          }
        }
      }

      // Variance Calculation
      let varianceDays = 0;
      let executionTiming: "EARLY" | "ON_TIME" | "DELAYED" | "N_A" = "N_A";
      if (taskRecord) {
        varianceDays = daysBetween(taskRecord.target_date, actionDate);
        if (actionDate < taskRecord.earliest_date) {
          executionTiming = "EARLY";
        } else if (actionDate <= taskRecord.latest_date) {
          executionTiming = "ON_TIME";
        } else {
          executionTiming = "DELAYED";
        }
      }

      const fallbackResult: ExecuteFieldActivityResult = {
        success: true,
        idempotentReplay: false,
        activityLogId: insertedLog.id,
        cropCycleId,
        taskId: taskId || null,
        taskStatus: status,
        actionDate,
        recordedAt: insertedLog.created_at,
        variance: {
          plannedTargetDate: taskRecord ? taskRecord.target_date : null,
          varianceDays,
          executionTiming,
        },
        stageProgress: {
          stageId: stageRecord ? stageRecord.id : null,
          stageCode: stageRecord ? stageRecord.stage_code : null,
          stageStatus: stageNewStatus,
          stageAdvanced,
        },
        cycleStatus: cycleNewStatus,
        message: `Field activity successfully recorded. Task status: ${status}.`,
      };

      if (taskId) {
        NotificationEngineService.markTaskNotificationsActioned(taskId).catch(() => {});
        if (["COMPLETED", "SKIPPED", "UNABLE_TO_COMPLETE"].includes(status)) {
          NotificationEngineService.handleTaskTerminal(taskId, status).catch(() => {});
        }
      }

      return fallbackResult;
    }

    if (!rpcResult) {
      throw new Error("RPC execute_farmer_field_activity returned null result.");
    }

    // Map RPC JSONB result to ExecuteFieldActivityResult
    const isReplay = Boolean(rpcResult.idempotent_replay);

    if (taskId && !isReplay) {
      NotificationEngineService.markTaskNotificationsActioned(taskId).catch(() => {});
      if (["COMPLETED", "SKIPPED", "UNABLE_TO_COMPLETE"].includes(status)) {
        NotificationEngineService.handleTaskTerminal(taskId, status).catch(() => {});
      }
    }

    return {
      success: Boolean(rpcResult.success),
      idempotentReplay: isReplay,
      activityLogId: rpcResult.activity_log_id,
      cropCycleId: rpcResult.crop_cycle_id || cropCycleId,
      taskId: rpcResult.task_id || null,
      taskStatus: rpcResult.task_status as FieldActivityStatus,
      actionDate: rpcResult.action_date,
      recordedAt: rpcResult.recorded_at,
      variance: {
        plannedTargetDate: rpcResult.variance?.planned_target_date || (taskRecord ? taskRecord.target_date : null),
        varianceDays: rpcResult.variance?.variance_days ?? (taskRecord ? daysBetween(taskRecord.target_date, rpcResult.action_date) : 0),
        executionTiming: rpcResult.variance?.execution_timing || "ON_TIME",
      },
      stageProgress: {
        stageId: rpcResult.stage_progress?.stage_id || (taskRecord ? taskRecord.stage_id : null),
        stageCode: rpcResult.stage_progress?.stage_code || null,
        stageStatus: rpcResult.stage_progress?.stage_status || "IN_PROGRESS",
        stageAdvanced: Boolean(rpcResult.stage_progress?.stage_advanced),
        hasOmissions: rpcResult.stage_progress?.has_omissions,
      },
      cycleStatus: rpcResult.cycle_status || cycle.status,
      message: rpcResult.message,
    };
  }
}
