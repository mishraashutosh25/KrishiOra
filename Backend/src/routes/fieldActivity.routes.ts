/**
 * ============================================================================
 * KrishiOra Smart Crop Lifecycle & Farm Action Planner
 * Phase 7: Field Activity Routes
 * ============================================================================
 * Mounted at `/api/field-activities`.
 * All endpoints require Bearer JWT authentication.
 * ============================================================================
 */

import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { FieldActivityController } from "../controllers/fieldActivity.controller";

const router = Router();

// Authentication required for all field activity endpoints
router.use(authMiddleware);

// Task execution & postponement
router.post("/tasks/:taskId/execute", FieldActivityController.executeTaskActivity);
router.post("/tasks/:taskId/postpone", FieldActivityController.postponeTaskActivity);

// Cycle ground observations & activity history
router.post("/cycles/:cycleId/log", FieldActivityController.logCycleObservation);
router.get("/cycles/:cycleId", FieldActivityController.getCycleActivities);

export default router;
