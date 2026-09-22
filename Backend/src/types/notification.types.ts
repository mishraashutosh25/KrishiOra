/**
 * ============================================================================
 * KrishiOra Smart Crop Lifecycle & Farm Action Planner
 * Phase 8: Notification & Action Delivery Engine Types
 * ============================================================================
 * Strictly deterministic, auditable notification and delivery models.
 * Zero AI / probabilistic fields. Pure system-derived events.
 * ============================================================================
 */

export type NotificationType =
  | "TASK_REMINDER"
  | "WEATHER_ADVISORY"
  | "HARVEST_READINESS"
  | "RISK_ALERT";

export type NotificationPriority =
  | "CRITICAL"
  | "HIGH"
  | "NORMAL"
  | "LOW";

export type NotificationStatus =
  | "PENDING"
  | "PROCESSING"
  | "SENT"
  | "FAILED"
  | "CANCELLED";

export type NotificationActionType =
  | "EXECUTE_TASK"
  | "REVIEW_SCHEDULE"
  | "INSPECT_FIELD"
  | "PREPARE_HARVEST"
  | "ACKNOWLEDGE";

export interface ActionWindow {
  earliestDate: string;
  targetDate: string;
  latestDate: string;
}

export interface NotificationMetadata {
  actionType: NotificationActionType;
  targetRoute: string;
  taskId?: string;
  stageId?: string;
  stageCode?: string;
  ruleId?: string;
  ruleVersion?: string;
  decisionLogId?: string;
  observedCondition?: {
    rainfallMm?: number;
    windSpeedKmh?: number;
    tempMaxC?: number;
    forecastDate?: string;
  };
  actionWindow?: ActionWindow;
  disclaimer?: string;
  supersededByEvent?: string;
  [key: string]: any;
}

export interface NotificationRecord {
  id: string;
  userId: string;
  cropCycleId: string;
  taskId: string | null;
  idempotencyKey: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  scheduledFor: string;
  status: NotificationStatus;
  retryCount: number;
  maxRetries: number;
  errorMessage: string | null;
  createdAt: string;
  sentAt: string | null;
  readAt?: string | null;
  actionedAt?: string | null;
  supersededAt?: string | null;
  claimExpiresAt?: string | null;
  metadata: NotificationMetadata;
}

export interface NotificationAttemptRecord {
  id: string;
  notificationId: string;
  attemptNumber: number;
  status: "SUCCESS" | "FAILURE";
  responsePayload: Record<string, any> | null;
  attemptedAt: string;
}

export interface ChannelDeliveryResult {
  success: boolean;
  channelName: string;
  deliveredAt: string;
  externalMessageId?: string;
  error?: string;
  responsePayload?: Record<string, any>;
}

export interface INotificationChannel {
  channelName: string;
  deliver(notification: NotificationRecord): Promise<ChannelDeliveryResult>;
}

export interface GenerateNotificationInput {
  userId: string;
  cropCycleId: string;
  taskId?: string | null;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  scheduledFor?: string;
  eventQualifier: string;
  scheduleVersion?: number;
  metadata: NotificationMetadata;
}

export interface NotificationDispatchResult {
  processedCount: number;
  deliveredCount: number;
  failedCount: number;
  leaseRecoveredCount: number;
}
