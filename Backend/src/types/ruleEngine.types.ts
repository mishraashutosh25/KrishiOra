/**
 * ============================================================================
 * KrishiOra Smart Crop Lifecycle & Farm Action Planner
 * Phase 6: Deterministic Rule Engine & Replanning Types
 * ============================================================================
 * Strict TypeScript contracts for agricultural rule evaluation, explainability,
 * and safe task replanning.
 * Zero AI / probabilistic fields. Pure deterministic agronomic metrics.
 * ============================================================================
 */

import { WeatherFreshness } from "./weather.types";

export type RuleEvaluationDecision =
  | "NO_CHANGE"
  | "RESCHEDULE"
  | "INSPECTION_REQUIRED"
  | "WEATHER_AFFECTED"
  | "WEATHER_UNAVAILABLE"
  | "KNOWLEDGE_UNAVAILABLE";

export type RuleActionType =
  | "RESCHEDULE_TASK"
  | "HOLD_FOR_INSPECTION"
  | "EMIT_WARNING"
  | "CONFIRM_READINESS";

export type ReplanningChangeTrigger =
  | "WEATHER_ADAPTATION"
  | "FARMER_OVERRIDE"
  | "STAGE_DRIFT"
  | "DEPENDENCY_SHIFT";

export type ReplanningActorType = "FARMER";

/**
 * Recommendation output produced by the Rule Engine for a single task.
 * Note: Producing this recommendation does NOT mutate farm_tasks.
 */
export interface TaskRecommendation {
  taskId: string;
  taskCode: string;
  taskTitle: string;
  category: string;
  decision: RuleEvaluationDecision;
  actionType: RuleActionType | null;
  ruleId: string | null;
  ruleVersion: string | null;
  sourceCitation: string | null;
  humanExplanation: string;
  currentScheduleVersion: number;
  currentEarliestDate: string;
  currentTargetDate: string;
  currentLatestDate: string;
  allowableWindow: {
    earliestDate: string;
    latestDate: string;
  };
  riskWindow: {
    startDate: string;
    endDate: string;
  } | null;
  weatherSnapshotId?: string;
  inputContext: Record<string, unknown>;
}

/**
 * Summary of a complete crop cycle rule evaluation.
 */
export interface CycleEvaluationSummary {
  cropCycleId: string;
  evaluatedAt: string;
  weatherStatus: WeatherFreshness;
  totalTasksEvaluated: number;
  tasksRequiringAttention: number;
  recommendations: TaskRecommendation[];
}

/**
 * Input contract for explicit farmer task rescheduling.
 */
export interface RescheduleTaskInput {
  userId: string;
  taskId: string;
  expectedScheduleVersion: number;
  newEarliestDate: string;
  newTargetDate: string;
  newLatestDate: string;
  changeTrigger: ReplanningChangeTrigger;
  actorType: ReplanningActorType;
  changeReason: string;
  ruleId?: string;
  ruleVersion?: string;
  weatherSnapshotId?: string;
}

/**
 * Output contract after atomic rescheduling execution.
 */
export interface RescheduleTaskResult {
  success: boolean;
  primaryTaskId: string;
  newScheduleVersion: number;
  updatedTasks: Array<{
    taskId: string;
    newVersion: number;
    newTargetDate: string;
  }>;
}

/**
 * Custom Error Hierarchy for Phase 6 Rule Engine & Replanning
 */
export class StageBoundaryViolationError extends Error {
  public readonly code = "STAGE_BOUNDARY_VIOLATION";
  public readonly statusCode = 422;
  constructor(message = "Task target date exceeds the stage target end date.") {
    super(message);
    this.name = "StageBoundaryViolationError";
  }
}

export class ScheduleVersionConflictError extends Error {
  public readonly code = "SCHEDULE_VERSION_CONFLICT";
  public readonly statusCode = 409;
  constructor(message = "Schedule version conflict: The task has already been modified by another operation.") {
    super(message);
    this.name = "ScheduleVersionConflictError";
  }
}

export class TaskNotEligibleError extends Error {
  public readonly code = "TASK_NOT_ELIGIBLE";
  public readonly statusCode = 422;
  constructor(message = "Task is not eligible for evaluation (must be SCHEDULED/PENDING_ACTION and not past).") {
    super(message);
    this.name = "TaskNotEligibleError";
  }
}
