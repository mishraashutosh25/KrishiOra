/**
 * ============================================================================
 * KrishiOra Smart Crop Lifecycle & Farm Action Planner
 * Phase 7: Field Activity Execution & Progress Tracking Controller
 * ============================================================================
 */

import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth.middleware";
import { FieldActivityService } from "../services/fieldActivity.service";
import { ProgressTrackingService } from "../services/progressTracking.service";
import {
  InvalidActivityDateError,
  InvalidReasonCodeError,
  TaskAlreadyCompletedError,
  TaskAlreadyResolvedError,
  IdempotencyKeyConflictError,
  TaskCycleMismatchError,
  CycleStatusError,
} from "../types/fieldActivity.types";
import { UnauthorizedFarmAccessError } from "../types/weather.types";
import { supabaseAdmin } from "../config/supabase";

function extractHeader(val: string | string[] | undefined): string | null {
  if (!val) return null;
  return Array.isArray(val) ? val[0] : val;
}

function handleFieldActivityError(err: any, res: Response) {
  if (err instanceof UnauthorizedFarmAccessError) {
    return res.status(403).json({
      success: false,
      code: "UNAUTHORIZED_FARM_ACCESS",
      message: err.message,
    });
  }

  if (err instanceof InvalidActivityDateError || err instanceof InvalidReasonCodeError) {
    return res.status(err.statusCode || 400).json({
      success: false,
      code: err.name,
      message: err.message,
    });
  }

  if (err instanceof IdempotencyKeyConflictError) {
    return res.status(err.statusCode || 409).json({
      success: false,
      code: err.name,
      message: err.message,
    });
  }

  if (
    err instanceof TaskAlreadyCompletedError ||
    err instanceof TaskAlreadyResolvedError ||
    err instanceof TaskCycleMismatchError ||
    err instanceof CycleStatusError
  ) {
    return res.status(err.statusCode || 422).json({
      success: false,
      code: err.name,
      message: err.message,
    });
  }

  if (err && err.statusCode === 404) {
    return res.status(404).json({
      success: false,
      code: "NOT_FOUND",
      message: err.message,
    });
  }

  console.error("[FieldActivityController] Error:", err);
  return res.status(500).json({
    success: false,
    code: "INTERNAL_SERVER_ERROR",
    message: err instanceof Error ? err.message : "An unexpected error occurred.",
  });
}

export class FieldActivityController {
  /**
   * POST /api/field-activities/tasks/:taskId/execute
   * Executes / marks completed a farm task.
   */
  public static async executeTaskActivity(
    req: AuthenticatedRequest,
    res: Response
  ) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          code: "UNAUTHORIZED",
          message: "Authenticated session required.",
        });
      }

      const { taskId } = req.params;
      const {
        cropCycleId,
        actionTaken,
        actionDate,
        status = "COMPLETED",
        reasonCode,
        farmerNotes,
        idempotencyKey,
        metadata,
      } = req.body;

      if (!actionDate) {
        return res.status(400).json({
          success: false,
          code: "MISSING_FIELD",
          message: "actionDate (YYYY-MM-DD) is required.",
        });
      }

      // If cropCycleId not provided in body, resolve from task
      let resolvedCycleId = cropCycleId;
      if (!resolvedCycleId) {
        const { data: taskData } = await supabaseAdmin
          .from("farm_tasks")
          .select("crop_cycle_id, title")
          .eq("id", taskId)
          .maybeSingle();

        if (!taskData) {
          return res.status(404).json({
            success: false,
            code: "TASK_NOT_FOUND",
            message: `Task not found: ${taskId}`,
          });
        }
        resolvedCycleId = taskData.crop_cycle_id;
      }

      const resolvedActionTaken = actionTaken || "Completed scheduled field task";

      const headerKey = extractHeader(req.headers["idempotency-key"]);
      const resolvedIdempotencyKey = idempotencyKey || headerKey || null;

      const authHeader = req.headers.authorization;
      const userJwt = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : undefined;

      const result = await FieldActivityService.executeActivity({
        userId,
        cropCycleId: resolvedCycleId,
        taskId: String(taskId),
        actionTaken: resolvedActionTaken,
        actionDate,
        status,
        reasonCode,
        farmerNotes,
        idempotencyKey: resolvedIdempotencyKey,
        metadata,
        userJwt,
      });

      return res.status(200).json(result);
    } catch (err) {
      return handleFieldActivityError(err, res);
    }
  }

  /**
   * POST /api/field-activities/tasks/:taskId/postpone
   * Postpones a task with a required ground reason code.
   */
  public static async postponeTaskActivity(
    req: AuthenticatedRequest,
    res: Response
  ) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          code: "UNAUTHORIZED",
          message: "Authenticated session required.",
        });
      }

      const { taskId } = req.params;
      const {
        cropCycleId,
        actionDate,
        reasonCode,
        farmerNotes,
        idempotencyKey,
        metadata,
      } = req.body;

      if (!actionDate || !reasonCode) {
        return res.status(400).json({
          success: false,
          code: "MISSING_FIELDS",
          message: "actionDate and reasonCode are required to postpone a task.",
        });
      }

      // Resolve cycle ID if not provided
      let resolvedCycleId = cropCycleId;
      if (!resolvedCycleId) {
        const { data: taskData } = await supabaseAdmin
          .from("farm_tasks")
          .select("crop_cycle_id")
          .eq("id", taskId)
          .maybeSingle();

        if (!taskData) {
          return res.status(404).json({
            success: false,
            code: "TASK_NOT_FOUND",
            message: `Task not found: ${taskId}`,
          });
        }
        resolvedCycleId = taskData.crop_cycle_id;
      }

      const headerKey = extractHeader(req.headers["idempotency-key"]);
      const resolvedIdempotencyKey = idempotencyKey || headerKey || null;

      const authHeader = req.headers.authorization;
      const userJwt = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : undefined;

      const result = await FieldActivityService.executeActivity({
        userId,
        cropCycleId: resolvedCycleId,
        taskId: String(taskId),
        actionTaken: `Postponed task due to ${reasonCode}`,
        actionDate,
        status: "POSTPONED",
        reasonCode,
        farmerNotes,
        idempotencyKey: resolvedIdempotencyKey,
        metadata,
        userJwt,
      });

      return res.status(200).json(result);
    } catch (err) {
      return handleFieldActivityError(err, res);
    }
  }

  /**
   * POST /api/field-activities/cycles/:cycleId/log
   * Logs an ad-hoc ground observation unlinked to a specific task.
   */
  public static async logCycleObservation(
    req: AuthenticatedRequest,
    res: Response
  ) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          code: "UNAUTHORIZED",
          message: "Authenticated session required.",
        });
      }

      const { cycleId } = req.params;
      const {
        actionTaken,
        actionDate,
        status = "COMPLETED",
        reasonCode,
        farmerNotes,
        idempotencyKey,
        metadata,
      } = req.body;

      if (!actionTaken || !actionDate) {
        return res.status(400).json({
          success: false,
          code: "MISSING_FIELDS",
          message: "actionTaken and actionDate are required for ground observations.",
        });
      }

      const headerKey = extractHeader(req.headers["idempotency-key"]);
      const resolvedIdempotencyKey = idempotencyKey || headerKey || null;

      const authHeader = req.headers.authorization;
      const userJwt = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : undefined;

      const result = await FieldActivityService.executeActivity({
        userId,
        cropCycleId: String(cycleId),
        taskId: null,
        actionTaken,
        actionDate,
        status,
        reasonCode,
        farmerNotes,
        idempotencyKey: resolvedIdempotencyKey,
        metadata,
        userJwt,
      });

      return res.status(200).json(result);
    } catch (err) {
      return handleFieldActivityError(err, res);
    }
  }

  /**
   * GET /api/lifecycles/:cycleId/progress
   * Retrieves deterministic actual-vs-planned progress and drift analytics.
   */
  public static async getCycleProgress(
    req: AuthenticatedRequest,
    res: Response
  ) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          code: "UNAUTHORIZED",
          message: "Authenticated session required.",
        });
      }

      const cycleId = String(req.params.cycleId);
      const progress = await ProgressTrackingService.getCycleProgress(userId, cycleId);
      return res.status(200).json({
        success: true,
        data: progress,
      });
    } catch (err) {
      return handleFieldActivityError(err, res);
    }
  }

  /**
   * GET /api/field-activities/cycles/:cycleId
   * Retrieves recent field activities for a cycle.
   */
  public static async getCycleActivities(
    req: AuthenticatedRequest,
    res: Response
  ) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          code: "UNAUTHORIZED",
          message: "Authenticated session required.",
        });
      }

      const cycleId = String(req.params.cycleId);

      // Ownership verification
      const { data: cycle, error: cycleErr } = await supabaseAdmin
        .from("crop_cycles")
        .select("id, user_id")
        .eq("id", cycleId)
        .maybeSingle();

      if (cycleErr || !cycle) {
        return res.status(404).json({
          success: false,
          code: "CYCLE_NOT_FOUND",
          message: `Crop cycle not found: ${cycleId}`,
        });
      }

      if (cycle.user_id !== userId) {
        return res.status(403).json({
          success: false,
          code: "UNAUTHORIZED_FARM_ACCESS",
          message: `Unauthorized: User does not own crop cycle ${cycleId}`,
        });
      }

      const { data: activities, error: actErr } = await supabaseAdmin
        .from("field_activity_logs")
        .select("*")
        .eq("crop_cycle_id", cycleId)
        .order("action_date", { ascending: false });

      if (actErr) {
        throw new Error(`Failed to query field activities: ${actErr.message}`);
      }

      return res.status(200).json({
        success: true,
        data: activities || [],
      });
    } catch (err) {
      return handleFieldActivityError(err, res);
    }
  }
}
