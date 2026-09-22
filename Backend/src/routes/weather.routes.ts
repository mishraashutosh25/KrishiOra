/**
 * ============================================================================
 * KrishiOra Smart Crop Lifecycle & Farm Action Planner
 * Phase 5: Weather Routes
 * ============================================================================
 * Authenticated routes for farm weather forecast, history, and refresh.
 * All endpoints require Bearer JWT token (verifyToken middleware).
 * ============================================================================
 */

import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import {
  getFarmForecast,
  getFarmHistory,
  refreshFarmWeather,
} from "../controllers/weather.controller";

const router = Router();

// Protected: all weather endpoints require valid auth
router.use(authMiddleware);

router.get("/farms/:farmId/forecast", getFarmForecast);
router.get("/farms/:farmId/history", getFarmHistory);
router.post("/farms/:farmId/refresh", refreshFarmWeather);

export default router;
