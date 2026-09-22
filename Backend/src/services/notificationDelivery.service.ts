/**
 * ============================================================================
 * KrishiOra Smart Crop Lifecycle & Farm Action Planner
 * Phase 8: Notification Delivery Service
 * ============================================================================
 * Manages crash-safe delivery dispatch, bounded retries, attempt auditing,
 * and channel routing.
 * In-app delivery is effectively idempotent; external delivery is at-least-once.
 * ============================================================================
 */

import { supabaseAdmin } from "../config/supabase";
import {
  NotificationRecord,
  INotificationChannel,
  ChannelDeliveryResult,
} from "../types/notification.types";
import { InAppChannelAdapter } from "../adapters/notification/inApp.adapter";

export class NotificationDeliveryService {
  private static channels: INotificationChannel[] = [new InAppChannelAdapter()];

  public static setChannels(channels: INotificationChannel[]) {
    this.channels = channels;
  }

  public static resetChannels() {
    this.channels = [new InAppChannelAdapter()];
  }

  // Non-authoritative in-process diagnostic counters
  private static diagnosticMetrics = {
    generatedTotal: 0,
    deliveredInAppTotal: 0,
    recoveredLeaseTotal: 0,
    failedExhaustedTotal: 0,
    batchDispatchLatencyMs: 0,
  };

  public static getMetrics() {
    return { ...this.diagnosticMetrics };
  }

  public static recordDiagnosticMetric(key: keyof typeof this.diagnosticMetrics, delta: number = 1) {
    this.diagnosticMetrics[key] += delta;
  }

  /**
   * Delivers a leased notification across configured channels and records
   * an immutable delivery attempt in notification_attempts.
   */
  public static async deliverNotification(
    notification: NotificationRecord
  ): Promise<{ success: boolean; deliveredAt?: string; error?: string }> {
    const attemptNumber = (notification.retryCount || 0) + 1;
    let deliverySuccess = true;
    let lastError: string | null = null;
    let combinedPayload: Record<string, any> = {};

    for (const channel of this.channels) {
      try {
        const result: ChannelDeliveryResult = await channel.deliver(notification);
        combinedPayload[channel.channelName] = result.responsePayload || { delivered: result.success };
        if (!result.success) {
          deliverySuccess = false;
          lastError = result.error || `Delivery failed on channel ${channel.channelName}`;
        }
      } catch (err: any) {
        deliverySuccess = false;
        lastError = err.message || `Unexpected error on channel ${channel.channelName}`;
        combinedPayload[channel.channelName] = { error: lastError };
      }
    }

    const now = new Date().toISOString();

    // Record immutable delivery attempt log
    await supabaseAdmin
      .from("notification_attempts")
      .insert([
        {
          notification_id: notification.id,
          attempt_number: attemptNumber,
          status: deliverySuccess ? "SUCCESS" : "FAILURE",
          response_payload: combinedPayload,
          attempted_at: now,
        },
      ]);

    if (deliverySuccess) {
      const updatePayload: Record<string, any> = {
        status: "SENT",
        sent_at: now,
        error_message: null,
      };

      const { error: updateErr } = await supabaseAdmin
        .from("notification_queue")
        .update({
          ...updatePayload,
          claim_expires_at: null,
        })
        .eq("id", notification.id);

      if (updateErr) {
        await supabaseAdmin
          .from("notification_queue")
          .update(updatePayload)
          .eq("id", notification.id);
      }

      this.recordDiagnosticMetric("deliveredInAppTotal", 1);
      return { success: true, deliveredAt: now };
    } else {
      const nextRetryCount = notification.retryCount + 1;
      const isExhausted = nextRetryCount >= notification.maxRetries;

      // Exponential backoff: 5m, 10m, 20m
      const backoffMinutes = Math.pow(2, nextRetryCount - 1) * 5;
      const nextSchedule = new Date(Date.now() + backoffMinutes * 60000).toISOString();

      const updatePayload: Record<string, any> = {
        status: isExhausted ? "FAILED" : "PENDING",
        retry_count: nextRetryCount,
        error_message: lastError,
        scheduled_for: isExhausted ? notification.scheduledFor : nextSchedule,
      };

      const { error: updateErr } = await supabaseAdmin
        .from("notification_queue")
        .update({
          ...updatePayload,
          claim_expires_at: null,
        })
        .eq("id", notification.id);

      if (updateErr) {
        await supabaseAdmin
          .from("notification_queue")
          .update(updatePayload)
          .eq("id", notification.id);
      }

      if (isExhausted) {
        this.recordDiagnosticMetric("failedExhaustedTotal", 1);
      }

      return { success: false, error: lastError || "Delivery failed" };
    }
  }
}
