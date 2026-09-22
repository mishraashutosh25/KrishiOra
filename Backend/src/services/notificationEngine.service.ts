/**
 * ============================================================================
 * KrishiOra Smart Crop Lifecycle & Farm Action Planner
 * Phase 8: Notification Engine Service
 * ============================================================================
 * Evaluates notification eligibility, assigns deterministic priorities,
 * computes cryptographic idempotency keys, manages queue insertion,
 * and handles non-lossy supersession and conflict suppression.
 * Zero AI. Pure deterministic agronomic state machine.
 * ============================================================================
 */

import crypto from "crypto";
import { supabaseAdmin } from "../config/supabase";
import {
  NotificationType,
  NotificationPriority,
  NotificationMetadata,
  GenerateNotificationInput,
  NotificationRecord,
} from "../types/notification.types";
import { TaskRecommendation } from "../types/ruleEngine.types";

export class NotificationEngineService {
  /**
   * Computes a deterministic SHA-256 idempotency key for an alert event.
   */
  public static computeIdempotencyKey(
    userId: string,
    cropCycleId: string,
    taskId: string | null | undefined,
    type: NotificationType,
    eventQualifier: string,
    scheduleVersion: number = 1
  ): string {
    const raw = `${userId}:${cropCycleId}:${taskId || "cycle"}:${type}:${eventQualifier}:${scheduleVersion}`;
    return crypto.createHash("sha256").update(raw).digest("hex");
  }

  /**
   * Enqueues a notification with database-level deduplication.
   * Returns the inserted or existing notification ID.
   */
  public static async enqueueNotification(
    input: GenerateNotificationInput
  ): Promise<{ id: string | null; isDuplicate: boolean }> {
    const idempotencyKey = this.computeIdempotencyKey(
      input.userId,
      input.cropCycleId,
      input.taskId,
      input.type,
      input.eventQualifier,
      input.scheduleVersion || 1
    );

    const scheduledFor = input.scheduledFor || new Date().toISOString();

    // Verify task is not already in terminal status (if taskId provided)
    if (input.taskId) {
      const { data: task } = await supabaseAdmin
        .from("farm_tasks")
        .select("status")
        .eq("id", input.taskId)
        .maybeSingle();

      if (task && ["COMPLETED", "SKIPPED", "UNABLE_TO_COMPLETE"].includes(task.status)) {
        return { id: null, isDuplicate: false };
      }
    }

    let insertedRow: any = null;

    // Attempt insert with metadata column
    const { data: inserted, error } = await supabaseAdmin
      .from("notification_queue")
      .insert([
        {
          user_id: input.userId,
          crop_cycle_id: input.cropCycleId,
          task_id: input.taskId || null,
          idempotency_key: idempotencyKey,
          type: input.type,
          priority: input.priority,
          title: input.title,
          message: input.message,
          scheduled_for: scheduledFor,
          status: "PENDING",
          metadata: input.metadata,
        },
      ])
      .select("id")
      .maybeSingle();

    if (error) {
      if (error.code === "PGRST204" || error.message.includes("metadata")) {
        // Schema cache fallback: metadata column not yet active in cache
        const { data: fbInserted, error: fbErr } = await supabaseAdmin
          .from("notification_queue")
          .insert([
            {
              user_id: input.userId,
              crop_cycle_id: input.cropCycleId,
              task_id: input.taskId || null,
              idempotency_key: idempotencyKey,
              type: input.type,
              priority: input.priority,
              title: input.title,
              message: input.message,
              scheduled_for: scheduledFor,
              status: "PENDING",
            },
          ])
          .select("id")
          .maybeSingle();

        if (fbErr) {
          if (fbErr.code === "23505" || fbErr.message.includes("idempotency_key")) {
            const { data: existing } = await supabaseAdmin
              .from("notification_queue")
              .select("id")
              .eq("idempotency_key", idempotencyKey)
              .maybeSingle();
            return { id: existing ? existing.id : null, isDuplicate: true };
          }
          throw fbErr;
        }
        insertedRow = fbInserted;
      } else if (error.code === "23505" || error.message.includes("idempotency_key")) {
        const { data: existing } = await supabaseAdmin
          .from("notification_queue")
          .select("id")
          .eq("idempotency_key", idempotencyKey)
          .maybeSingle();
        return { id: existing ? existing.id : null, isDuplicate: true };
      } else {
        throw error;
      }
    } else {
      insertedRow = inserted;
    }

    return { id: insertedRow ? insertedRow.id : null, isDuplicate: false };
  }

  /**
   * Evaluates upcoming active tasks and enqueues TASK_REMINDER notifications.
   * Applies non-lossy conflict suppression: if a fresh WEATHER_ADVISORY exists
   * for the same task on today, standard reminder is suppressed.
   */
  public static async generateTaskReminders(
    userId: string,
    cropCycleId: string,
    referenceDate?: string
  ): Promise<string[]> {
    const today = referenceDate || new Date().toISOString().slice(0, 10);
    const createdIds: string[] = [];

    // Fetch active cycle
    const { data: cycle } = await supabaseAdmin
      .from("crop_cycles")
      .select("id, user_id, status")
      .eq("id", cropCycleId)
      .eq("user_id", userId)
      .maybeSingle();

    if (!cycle || ["COMPLETED", "ABANDONED"].includes(cycle.status)) {
      return [];
    }

    // Fetch active tasks within action window
    const { data: tasks } = await supabaseAdmin
      .from("farm_tasks")
      .select("id, title, category, priority, earliest_date, target_date, latest_date, status, schedule_version, is_weather_sensitive")
      .eq("crop_cycle_id", cropCycleId)
      .in("status", ["SCHEDULED", "PENDING_ACTION", "IN_PROGRESS"])
      .lte("earliest_date", today)
      .gte("latest_date", today);

    if (!tasks || tasks.length === 0) return [];

    for (const task of tasks) {
      // Check for conflicting active WEATHER_ADVISORY for this task
      const { data: activeAdvisory } = await supabaseAdmin
        .from("notification_queue")
        .select("id")
        .eq("task_id", task.id)
        .eq("type", "WEATHER_ADVISORY")
        .in("status", ["PENDING", "SENT"])
        .limit(1)
        .maybeSingle();

      if (activeAdvisory) {
        // Suppress reminder in favor of higher-value weather alert
        continue;
      }

      // Determine deterministic priority from task.priority
      let priority: NotificationPriority = "NORMAL";
      if (task.priority === "CRITICAL") priority = "CRITICAL";
      else if (task.priority === "HIGH") priority = "HIGH";

      const isDueToday = today >= task.target_date;
      const title = isDueToday
        ? `Action Due: ${task.title}`
        : `Action Window Open: ${task.title}`;

      const message = isDueToday
        ? `Task is due today (${task.target_date}). Complete by latest date ${task.latest_date}.`
        : `Action window is open from ${task.earliest_date} to ${task.latest_date}. Target date is ${task.target_date}.`;

      const metadata: NotificationMetadata = {
        actionType: "EXECUTE_TASK",
        targetRoute: `/tasks/${task.id}`,
        taskId: task.id,
        actionWindow: {
          earliestDate: task.earliest_date,
          targetDate: task.target_date,
          latestDate: task.latest_date,
        },
      };

      const res = await this.enqueueNotification({
        userId,
        cropCycleId,
        taskId: task.id,
        type: "TASK_REMINDER",
        priority,
        title,
        message,
        eventQualifier: `due:${task.target_date}`,
        scheduleVersion: task.schedule_version,
        metadata,
      });

      if (res.id && !res.isDuplicate) {
        createdIds.push(res.id);
      }
    }

    return createdIds;
  }

  /**
   * Generates WEATHER_ADVISORY notifications directly from rule engine recommendations.
   * Priority is inherited deterministically from the affected task.
   */
  public static async generateWeatherAdvisories(
    userId: string,
    cropCycleId: string,
    recommendations: TaskRecommendation[]
  ): Promise<string[]> {
    const createdIds: string[] = [];

    for (const rec of recommendations) {
      if (rec.decision === "NO_CHANGE" || !rec.actionType) {
        continue;
      }

      // Fetch task details for priority derivation
      const { data: task } = await supabaseAdmin
        .from("farm_tasks")
        .select("priority, schedule_version, target_date")
        .eq("id", rec.taskId)
        .maybeSingle();

      if (!task) continue;

      let priority: NotificationPriority = "NORMAL";
      if (task.priority === "CRITICAL") priority = "CRITICAL";
      else if (task.priority === "HIGH") priority = "HIGH";

      const title = rec.actionType === "RESCHEDULE_TASK"
        ? `Weather Alert: Reschedule Recommended for ${rec.taskTitle}`
        : `Weather Alert: Inspection Recommended for ${rec.taskTitle}`;

      const metadata: NotificationMetadata = {
        actionType: rec.actionType === "RESCHEDULE_TASK" ? "REVIEW_SCHEDULE" : "INSPECT_FIELD",
        targetRoute: `/replanning/tasks/${rec.taskId}`,
        taskId: rec.taskId,
        ruleId: rec.ruleId || undefined,
        ruleVersion: rec.ruleVersion || undefined,
        actionWindow: {
          earliestDate: rec.currentEarliestDate,
          targetDate: rec.currentTargetDate,
          latestDate: rec.currentLatestDate,
        },
        disclaimer: "Advisory generated by deterministic rule engine. Farmer remains final decision-maker.",
      };

      const res = await this.enqueueNotification({
        userId,
        cropCycleId,
        taskId: rec.taskId,
        type: "WEATHER_ADVISORY",
        priority,
        title,
        message: rec.humanExplanation,
        eventQualifier: `rule:${rec.ruleId || "unknown"}:${rec.currentTargetDate}`,
        scheduleVersion: rec.currentScheduleVersion,
        metadata,
      });

      if (res.id && !res.isDuplicate) {
        createdIds.push(res.id);
      }
    }

    return createdIds;
  }

  /**
   * Supersedes existing notifications when a task is completed, skipped, or unable to complete.
   */
  public static async handleTaskTerminal(taskId: string, eventReason: string): Promise<void> {
    const now = new Date().toISOString();

    // 1. Cancel pending notifications
    const { error: cancelErr } = await supabaseAdmin
      .from("notification_queue")
      .update({
        status: "CANCELLED",
        superseded_at: now,
      })
      .eq("task_id", taskId)
      .eq("status", "PENDING");

    if (cancelErr && (cancelErr.code === "PGRST204" || cancelErr.message?.includes("superseded_at"))) {
      await supabaseAdmin
        .from("notification_queue")
        .update({
          status: "CANCELLED",
        })
        .eq("task_id", taskId)
        .eq("status", "PENDING");
    }

    // 2. Mark sent notifications as superseded
    const { error: sentErr } = await supabaseAdmin
      .from("notification_queue")
      .update({
        superseded_at: now,
      })
      .eq("task_id", taskId)
      .eq("status", "SENT");

    if (sentErr && (sentErr.code === "PGRST204" || sentErr.message?.includes("superseded_at"))) {
      await supabaseAdmin
        .from("notification_queue")
        .update({
          status: "CANCELLED",
        })
        .eq("task_id", taskId)
        .eq("status", "SENT");
    }
  }

  /**
   * Marks notifications actioned when farmer executes a domain operation via Phase 6/7 APIs.
   */
  public static async markTaskNotificationsActioned(taskId: string): Promise<void> {
    const now = new Date().toISOString();
    const { error } = await supabaseAdmin
      .from("notification_queue")
      .update({
        actioned_at: now,
      })
      .eq("task_id", taskId)
      .is("actioned_at", null);

    if (error && (error.code === "PGRST204" || error.message?.includes("actioned_at"))) {
      // Column pending in schema cache; actioned fact is permanently recorded in field_activity_logs
    }
  }

  /**
   * Supersedes notifications when a task schedule version increments (replanning).
   */
  public static async handleTaskRescheduled(taskId: string, newScheduleVersion: number): Promise<void> {
    const now = new Date().toISOString();

    // Cancel pending and supersede sent notifications from earlier versions
    const { error: cancelErr } = await supabaseAdmin
      .from("notification_queue")
      .update({
        status: "CANCELLED",
        superseded_at: now,
      })
      .eq("task_id", taskId)
      .eq("status", "PENDING");

    if (cancelErr && (cancelErr.code === "PGRST204" || cancelErr.message?.includes("superseded_at"))) {
      await supabaseAdmin
        .from("notification_queue")
        .update({
          status: "CANCELLED",
        })
        .eq("task_id", taskId)
        .eq("status", "PENDING");
    }

    const { error: sentErr } = await supabaseAdmin
      .from("notification_queue")
      .update({
        superseded_at: now,
      })
      .eq("task_id", taskId)
      .eq("status", "SENT");

    if (sentErr && (sentErr.code === "PGRST204" || sentErr.message?.includes("superseded_at"))) {
      await supabaseAdmin
        .from("notification_queue")
        .update({
          status: "CANCELLED",
        })
        .eq("task_id", taskId)
        .eq("status", "SENT");
    }
  }
}
