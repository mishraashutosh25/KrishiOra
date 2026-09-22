/**
 * ============================================================================
 * KrishiOra Smart Crop Lifecycle & Farm Action Planner
 * Phase 4: Lifecycle Routes
 * ============================================================================
 * Mounted at `/api/lifecycles`.
 * ============================================================================
 */

import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import {
  createLifecycle,
  getUserLifecycles,
  getLifecycleById,
  getLifecycleTasks,
  getLifecyclesByFarm,
} from "../controllers/lifecycle.controller";

import { FieldActivityController } from "../controllers/fieldActivity.controller";

const router = Router();

// All lifecycle operations require authentication
router.use(authMiddleware);

router.get("/", getUserLifecycles);
router.post("/", createLifecycle);
router.post("/generate", createLifecycle);
router.get("/:id", getLifecycleById);
router.get("/:cycleId/tasks", getLifecycleTasks);
router.get("/:cycleId/progress", FieldActivityController.getCycleProgress);
router.get("/farm/:farmId", getLifecyclesByFarm);

export default router;
