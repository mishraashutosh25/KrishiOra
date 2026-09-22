/**
 * ============================================================================
 * KrishiOra Smart Crop Lifecycle & Farm Action Planner
 * Phase 8: In-App Notification Channel Adapter
 * ============================================================================
 * Primary persisted delivery channel. Delivery is effectively idempotent:
 * Transitioning a notification to SENT with sent_at = NOW() makes it
 * permanently visible in the farmer's inbox query.
 * ============================================================================
 */

import {
  ChannelDeliveryResult,
  INotificationChannel,
  NotificationRecord,
} from "../../types/notification.types";

export class InAppChannelAdapter implements INotificationChannel {
  public channelName = "IN_APP";

  public async deliver(notification: NotificationRecord): Promise<ChannelDeliveryResult> {
    return {
      success: true,
      channelName: this.channelName,
      deliveredAt: new Date().toISOString(),
      responsePayload: {
        inboxVisible: true,
        notificationId: notification.id,
      },
    };
  }
}
