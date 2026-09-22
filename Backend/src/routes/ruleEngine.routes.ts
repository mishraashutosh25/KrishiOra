/**
 * ============================================================================
 * KrishiOra Smart Crop Lifecycle & Farm Action Planner
 * Phase 6: Rule Engine & Replanning Routes
 * ============================================================================
 * All endpoints require authentication via authMiddleware.
 * POST-only evaluation endpoints; GET-only audit queries.
 * ============================================================================
 */

import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import {
  evaluateCropCycle,
  getCycleDecisionLogs,
  rescheduleTask,
  getTaskScheduleHistory,
} from "../controllers/ruleEngine.controller";

export const ruleRoutes = Router();
ruleRoutes.use(authMiddleware);

// POST-only evaluation (generates recommendations and logs audit records)
ruleRoutes.post("/cycles/:cycleId/evaluate", evaluateCropCycle);
ruleRoutes.get("/cycles/:cycleId/decisions", getCycleDecisionLogs);

export const replanningRoutes = Router();
replanningRoutes.use(authMiddleware);

// Explicit farmer schedule mutation
replanningRoutes.post("/tasks/:taskId/reschedule", rescheduleTask);
replanningRoutes.get("/tasks/:taskId/history", getTaskScheduleHistory);
