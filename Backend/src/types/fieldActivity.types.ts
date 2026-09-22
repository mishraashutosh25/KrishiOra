/**
 * ============================================================================
 * KrishiOra Smart Crop Lifecycle & Farm Action Planner
 * Phase 7: Field Activity Execution & Progress Tracking Domain Types
 * ============================================================================
 */

export type FieldActivityStatus =
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'POSTPONED'
  | 'SKIPPED'
  | 'UNABLE_TO_COMPLETE';

export type FieldActivityReasonCode =
  | 'RAIN_INTERFERENCE'
  | 'SOIL_TOO_WET'
  | 'LABOUR_UNAVAILABLE'
  | 'WATER_SHORTAGE'
  | 'EQUIPMENT_BREAKDOWN'
  | 'OBSERVED_READY_EARLY'
  | 'OTHER';

export type ExecutionTiming = 'EARLY' | 'ON_TIME' | 'DELAYED' | 'N_A';

export interface FieldActivityLog {
  id: string;
  crop_cycle_id: string;
  task_id: string | null;
  user_id: string;
  action_taken: string;
  action_date: string; // YYYY-MM-DD
  status: FieldActivityStatus;
  reason_code: FieldActivityReasonCode | null;
  farmer_notes: string | null;
  metadata: Record<string, any>;
  created_at: string;
}

export interface ExecuteFieldActivityInput {
  userId: string;
  cropCycleId: string;
  taskId?: string | null;
  actionTaken: string;
  actionDate: string; // YYYY-MM-DD
  status: FieldActivityStatus;
  reasonCode?: FieldActivityReasonCode | null;
  farmerNotes?: string | null;
  idempotencyKey?: string | null;
  metadata?: Record<string, any>;
  userJwt?: string;
}

export interface FieldActivityVariance {
  plannedTargetDate: string | null;
  varianceDays: number;
  executionTiming: ExecutionTiming;
}

export interface StageProgressSummary {
  stageId: string | null;
  stageCode: string | null;
  stageStatus: string;
  stageAdvanced: boolean;
  hasOmissions?: boolean;
}

export interface ExecuteFieldActivityResult {
  success: boolean;
  idempotentReplay: boolean;
  activityLogId: string;
  cropCycleId: string;
  taskId: string | null;
  taskStatus: FieldActivityStatus;
  actionDate: string;
  recordedAt: string;
  variance: FieldActivityVariance;
  stageProgress: StageProgressSummary;
  cycleStatus: string;
  message?: string;
}

export interface StageProgressDetail {
  stageId: string;
  stageOrder: number;
  stageCode: string;
  stageName: string;
  status: 'UPCOMING' | 'IN_PROGRESS' | 'COMPLETED' | 'DELAYED';
  plannedDates: {
    start: string;
    end: string;
  };
  actualDates: {
    start: string | null;
    end: string | null;
  };
  varianceDays: number;
  tasksTotal: number;
  tasksCompleted: number;
  tasksSkipped: number;
  tasksUnable: number;
  hasOmissions: boolean;
}

export interface CycleProgressSummary {
  cycleId: string;
  cropCode: string;
  varietyCode: string | null;
  cycleStatus: string;
  sowingDate: string;
  plannedHarvestDate: string;
  operationalProjectedHarvestDate: string;
  projectionDisclaimer: string;
  netObservedSowingDriftDays: number;
  adherenceStatus: 'ON_TRACK' | 'MINOR_DRIFT' | 'SIGNIFICANT_DRIFT';
  overallProgressPct: number;
  stages: StageProgressDetail[];
  recentActivities: FieldActivityLog[];
}

// ----------------------------------------------------------------------------
// Custom Typed Domain Errors
// ----------------------------------------------------------------------------

export class InvalidActivityDateError extends Error {
  readonly statusCode = 400;
  constructor(message: string) {
    super(message);
    this.name = 'InvalidActivityDateError';
  }
}

export class InvalidReasonCodeError extends Error {
  readonly statusCode = 400;
  constructor(message: string) {
    super(message);
    this.name = 'InvalidReasonCodeError';
  }
}

export class TaskAlreadyCompletedError extends Error {
  readonly statusCode = 422;
  constructor(message: string) {
    super(message);
    this.name = 'TaskAlreadyCompletedError';
  }
}

export class TaskAlreadyResolvedError extends Error {
  readonly statusCode = 422;
  constructor(message: string) {
    super(message);
    this.name = 'TaskAlreadyResolvedError';
  }
}

export class IdempotencyKeyConflictError extends Error {
  readonly statusCode = 409;
  constructor(message: string) {
    super(message);
    this.name = 'IdempotencyKeyConflictError';
  }
}

export class TaskCycleMismatchError extends Error {
  readonly statusCode = 422;
  constructor(message: string) {
    super(message);
    this.name = 'TaskCycleMismatchError';
  }
}

export class CycleStatusError extends Error {
  readonly statusCode = 422;
  constructor(message: string) {
    super(message);
    this.name = 'CycleStatusError';
  }
}
