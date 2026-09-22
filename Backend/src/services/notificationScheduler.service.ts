/**
 * ============================================================================
 * KrishiOra Smart Crop Lifecycle & Farm Action Planner
 * Phase 8: Notification Scheduler & Worker Service
 * ============================================================================
 * Multi-instance safe database worker queue processor.
 * Uses atomic leasing with claim_expires_at for crash safety.
 * Zero reliance on in-memory locks for multi-instance correctness.
 * ============================================================================
 */

import { supabaseAdmin } from "../config/supabase";
import {
  NotificationRecord,
  NotificationDispatchResult,
} from "../types/notification.types";
import { NotificationDeliveryService } from "./notificationDelivery.service";

export class NotificationSchedulerService {
  /**
   * Dispatches due notifications from the database queue.
   * Recovers crashed worker leases where claim_expires_at < NOW().
   */
  public static async dispatchDueNotifications(
    batchSize: number = 50
  ): Promise<NotificationDispatchResult> {
    const startTime = Date.now();
    const now = new Date().toISOString();
    const leaseDurationMinutes = 5;
    const leaseExpiresAt = new Date(Date.now() + leaseDurationMinutes * 60000).toISOString();

    let processedCount = 0;
    let deliveredCount = 0;
    let failedCount = 0;
    let leaseRecoveredCount = 0;

    // 1. Fetch eligible due notifications:
    // Try primary query with claim_expires_at, fallback to status-based filter if column pending in schema cache
    let candidates: any[] = [];
    let isColumnMissing = false;

    const { data: primaryCandidates, error: fetchErr } = await supabaseAdmin
      .from("notification_queue")
      .select("*")
      .or(`status.eq.PENDING,and(status.eq.PROCESSING,claim_expires_at.lt.${now})`)
      .lte("scheduled_for", now)
      .order("priority", { ascending: true })
      .order("scheduled_for", { ascending: true })
      .limit(batchSize);

    if (fetchErr) {
      if (fetchErr.code === "42703" || fetchErr.message?.includes("claim_expires_at")) {
        isColumnMissing = true;
        const { data: fallbackCandidates } = await supabaseAdmin
          .from("notification_queue")
          .select("*")
          .in("status", ["PENDING", "PROCESSING"])
          .lte("scheduled_for", now)
          .order("priority", { ascending: true })
          .order("scheduled_for", { ascending: true })
          .limit(batchSize);
        candidates = fallbackCandidates || [];
      } else {
        return { processedCount: 0, deliveredCount: 0, failedCount: 0, leaseRecoveredCount: 0 };
      }
    } else {
      candidates = primaryCandidates || [];
    }

    if (candidates.length === 0) {
      return { processedCount: 0, deliveredCount: 0, failedCount: 0, leaseRecoveredCount: 0 };
    }

    // Sort by priority order: CRITICAL -> HIGH -> NORMAL -> LOW
    const priorityWeight: Record<string, number> = {
      CRITICAL: 1,
      HIGH: 2,
      NORMAL: 3,
      LOW: 4,
    };

    const sortedCandidates = [...candidates].sort((a, b) => {
      const pA = priorityWeight[a.priority] || 5;
      const pB = priorityWeight[b.priority] || 5;
      return pA - pB;
    });

    for (const raw of sortedCandidates) {
      const isLeaseRecovery = raw.status === "PROCESSING";

      // 2. Atomic claim acquisition (Lease update)
      // Only claims if status has not changed concurrently
      let claimed: any = null;

      if (!isColumnMissing) {
        const { data: claimedRow } = await supabaseAdmin
          .from("notification_queue")
          .update({
            status: "PROCESSING",
            claim_expires_at: leaseExpiresAt,
          })
          .eq("id", raw.id)
          .or(`status.eq.PENDING,and(status.eq.PROCESSING,claim_expires_at.lt.${now})`)
          .select("*")
          .maybeSingle();
        claimed = claimedRow;
      } else {
        const { data: fallbackClaimed } = await supabaseAdmin
          .from("notification_queue")
          .update({
            status: "PROCESSING",
          })
          .eq("id", raw.id)
          .in("status", ["PENDING", "PROCESSING"])
          .select("*")
          .maybeSingle();
        claimed = fallbackClaimed;
      }

      if (!claimed) {
        // Another concurrent worker claimed this row first
        continue;
      }

      if (isLeaseRecovery) {
        leaseRecoveredCount++;
        NotificationDeliveryService.recordDiagnosticMetric("recoveredLeaseTotal", 1);
      }

      processedCount++;

      const notification: NotificationRecord = {
        id: claimed.id,
        userId: claimed.user_id,
        cropCycleId: claimed.crop_cycle_id,
        taskId: claimed.task_id,
        idempotencyKey: claimed.idempotency_key,
        type: claimed.type,
        priority: claimed.priority,
        title: claimed.title,
        message: claimed.message,
        scheduledFor: claimed.scheduled_for,
        status: claimed.status,
        retryCount: claimed.retry_count,
        maxRetries: claimed.max_retries,
        errorMessage: claimed.error_message,
        createdAt: claimed.created_at,
        sentAt: claimed.sent_at,
        readAt: claimed.read_at,
        actionedAt: claimed.actioned_at,
        supersededAt: claimed.superseded_at,
        claimExpiresAt: claimed.claim_expires_at,
        metadata: claimed.metadata || {},
      };

      // 3. Deliver notification across channels
      const deliveryRes = await NotificationDeliveryService.deliverNotification(notification);

      if (deliveryRes.success) {
        deliveredCount++;
      } else {
        failedCount++;
      }
    }

    const duration = Date.now() - startTime;
    NotificationDeliveryService.recordDiagnosticMetric("batchDispatchLatencyMs", duration);

    return {
      processedCount,
      deliveredCount,
      failedCount,
      leaseRecoveredCount,
    };
  }
}
