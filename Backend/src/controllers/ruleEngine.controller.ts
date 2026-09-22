/**
 * ============================================================================
 * KrishiOra Smart Crop Lifecycle & Farm Action Planner
 * Phase 6: Rule Engine & Replanning Controllers
 * ============================================================================
 * Handles request parsing, authenticated identity derivation (auth.uid),
 * and error mapping.
 * Contains ZERO business logic.
 * ============================================================================
 */

import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth.middleware";
import { RuleEngineService } from "../services/ruleEngine.service";
import { ReplanningService } from "../services/replanning.service";
import {
  StageBoundaryViolationError,
  ScheduleVersionConflictError,
  TaskNotEligibleError,
} from "../types/ruleEngine.types";
import { UnauthorizedFarmAccessError } from "../types/weather.types";
import { supabaseAdmin } from "../config/supabase";

function handleRuleEngineError(err: any, res: Response) {
  if (err instanceof UnauthorizedFarmAccessError) {
    return res.status(403).json({
      success: false,
      code: "UNAUTHORIZED_FARM_ACCESS",
      message: err.message,
    });
  }

  if (err instanceof ScheduleVersionConflictError) {
    return res.status(err.statusCode || 409).json({
      success: false,
      code: err.code,
      message: err.message,
    });
  }

  if (err instanceof StageBoundaryViolationError || err instanceof TaskNotEligibleError) {
    return res.status(err.statusCode || 422).json({
      success: false,
      code: err.code,
      message: err.message,
    });
  }

  console.error("[RuleEngineController] Error:", err);
  return res.status(500).json({
    success: false,
    code: "INTERNAL_SERVER_ERROR",
    message: err instanceof Error ? err.message : "An unexpected error occurred.",
  });
}

/**
 * POST /api/rules/cycles/:cycleId/evaluate
 * POST-only because evaluation creates audit records in decision_logs.
 */
export const evaluateCropCycle = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        code: "AUTHENTICATION_REQUIRED",
        message: "Authentication required.",
      });
    }

    const cycleId = Array.isArray(req.params.cycleId) ? req.params.cycleId[0] : req.params.cycleId;
    if (!cycleId) {
      return res.status(400).json({
        success: false,
        code: "MISSING_CYCLE_ID",
        message: "Cycle ID is required.",
      });
    }

    const coords = req.body?.latitude && req.body?.longitude
      ? { latitude: Number(req.body.latitude), longitude: Number(req.body.longitude) }
      : null;

    const result = await RuleEngineService.evaluateCropCycle(userId, String(cycleId), coords);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err) {
    return handleRuleEngineError(err, res);
  }
};

/**
 * GET /api/rules/cycles/:cycleId/decisions
 * Read-only retrieval of explainable decision audit logs.
 */
export const getCycleDecisionLogs = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        code: "AUTHENTICATION_REQUIRED",
        message: "Authentication required.",
      });
    }

    const cycleId = Array.isArray(req.params.cycleId) ? req.params.cycleId[0] : req.params.cycleId;
    if (!cycleId) {
      return res.status(400).json({
        success: false,
        code: "MISSING_CYCLE_ID",
        message: "Cycle ID is required.",
      });
    }

    // Verify ownership
    const { data: cycle } = await supabaseAdmin
      .from("crop_cycles")
      .select("id, user_id")
      .eq("id", cycleId)
      .maybeSingle();

    if (!cycle || cycle.user_id !== userId) {
      return res.status(403).json({
        success: false,
        code: "UNAUTHORIZED",
        message: "You do not have access to this crop cycle's decisions.",
      });
    }

    const { data: decisions, error } = await supabaseAdmin
      .from("decision_logs")
      .select("*")
      .eq("crop_cycle_id", cycleId)
      .order("evaluation_timestamp", { ascending: false });

    if (error) {
      return res.status(500).json({
        success: false,
        message: `Failed to fetch decision logs: ${error.message}`,
      });
    }

    return res.status(200).json({
      success: true,
      data: decisions || [],
    });
  } catch (err) {
    return handleRuleEngineError(err, res);
  }
};

/**
 * POST /api/replanning/tasks/:taskId/reschedule
 * Explicit farmer action to mutate a task schedule.
 */
export const rescheduleTask = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        code: "AUTHENTICATION_REQUIRED",
        message: "Authentication required.",
      });
    }

    const taskId = Array.isArray(req.params.taskId) ? req.params.taskId[0] : req.params.taskId;
    let {
      expectedScheduleVersion,
      newEarliestDate,
      newTargetDate,
      newLatestDate,
      changeTrigger,
      changeReason,
      reason,
      ruleId,
      ruleVersion,
      weatherSnapshotId,
    } = req.body;

    const finalReason = changeReason || reason || "Farmer rescheduled task according to weather advisory";

    if (!taskId || !newTargetDate) {
      return res.status(400).json({
        success: false,
        code: "MISSING_REQUIRED_FIELDS",
        message: "Missing required fields: taskId and newTargetDate are required.",
      });
    }

    // Auto-fill missing fields if not explicitly supplied
    if (expectedScheduleVersion === undefined || !newEarliestDate || !newLatestDate) {
      const { data: existingTask } = await supabaseAdmin
        .from("farm_tasks")
        .select("id, schedule_version, earliest_date, target_date, latest_date")
        .eq("id", taskId)
        .maybeSingle();

      if (existingTask) {
        if (expectedScheduleVersion === undefined) {
          expectedScheduleVersion = existingTask.schedule_version || 1;
        }

        const deltaMs = new Date(newTargetDate).getTime() - new Date(existingTask.target_date).getTime();
        const deltaDays = Math.round(deltaMs / (1000 * 60 * 60 * 24));

        if (!newEarliestDate) {
          const originalEarliest = new Date(existingTask.earliest_date);
          newEarliestDate = new Date(originalEarliest.getTime() + deltaDays * 86400000).toISOString().split("T")[0];
          if (newEarliestDate > newTargetDate) newEarliestDate = newTargetDate;
        }

        if (!newLatestDate) {
          const originalLatest = new Date(existingTask.latest_date);
          newLatestDate = new Date(originalLatest.getTime() + deltaDays * 86400000).toISOString().split("T")[0];
          if (newLatestDate < newTargetDate) newLatestDate = newTargetDate;
        }
      }
    }

    const result = await ReplanningService.rescheduleTask({
      userId,
      taskId: String(taskId),
      expectedScheduleVersion: Number(expectedScheduleVersion ?? 1),
      newEarliestDate: String(newEarliestDate),
      newTargetDate: String(newTargetDate),
      newLatestDate: String(newLatestDate),
      changeTrigger: changeTrigger || "WEATHER_ADVISORY",
      actorType: "FARMER", // Strictly FARMER
      changeReason: String(finalReason),
      ruleId,
      ruleVersion,
      weatherSnapshotId,
    });

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err) {
    return handleRuleEngineError(err, res);
  }
};

/**
 * GET /api/replanning/tasks/:taskId/history
 * Read-only retrieval of immutable schedule versions.
 */
export const getTaskScheduleHistory = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        code: "AUTHENTICATION_REQUIRED",
        message: "Authentication required.",
      });
    }

    const taskId = Array.isArray(req.params.taskId) ? req.params.taskId[0] : req.params.taskId;
    if (!taskId) {
      return res.status(400).json({
        success: false,
        code: "MISSING_TASK_ID",
        message: "Task ID is required.",
      });
    }

    const history = await ReplanningService.getTaskHistory(String(taskId), userId);

    return res.status(200).json({
      success: true,
      data: history,
    });
  } catch (err) {
    return handleRuleEngineError(err, res);
  }
};
