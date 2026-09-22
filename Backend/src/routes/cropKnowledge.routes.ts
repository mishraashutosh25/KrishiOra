/**
 * ============================================================================
 * KrishiOra Smart Crop Lifecycle & Farm Action Planner
 * Phase 4: Crop Knowledge Routes
 * ============================================================================
 * Read-only master knowledge endpoints mounted at `/api/crop-knowledge`.
 * ============================================================================
 */

import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import {
  getActiveCrops,
  getCropByCode,
  getCropVarieties,
  getCropStages,
  getCropActivities,
  getActiveRules,
  getRuleById,
} from "../controllers/cropKnowledge.controller";

const router = Router();

// All knowledge endpoints require authenticated user session
router.use(authMiddleware);

router.get("/crops", getActiveCrops);
router.get("/crops/:cropCode", getCropByCode);
router.get("/crops/:cropCode/varieties", getCropVarieties);
router.get("/crops/:cropCode/stages", getCropStages);
router.get("/crops/:cropCode/activities", getCropActivities);

router.get("/rules", getActiveRules);
router.get("/rules/:ruleId", getRuleById);

export default router;
