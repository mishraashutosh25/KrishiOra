/**
 * ============================================================================
 * KrishiOra Smart Crop Lifecycle & Farm Action Planner
 * Phase 5: Weather API Controller
 * ============================================================================
 * Handles request parsing, authenticated identity derivation, coordinate extraction,
 * and error mapping.
 * Architecture: Route -> Controller -> WeatherService -> OpenMeteoAdapter / Database.
 * Contains ZERO business logic.
 * ============================================================================
 */

import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth.middleware";
import { WeatherService } from "../services/weather.service";
import {
  LocationRequiredError,
  InvalidCoordinatesError,
  UnauthorizedFarmAccessError,
  FarmNotFoundError,
  OpenMeteoTimeoutError,
  OpenMeteoHttpError,
  OpenMeteoMalformedResponseError,
} from "../types/weather.types";

/**
 * Extracts coordinates from either query params or request body.
 */
function extractCoords(req: AuthenticatedRequest) {
  const latStr = req.query.lat ?? req.query.latitude ?? req.body?.lat ?? req.body?.latitude;
  const lonStr = req.query.lon ?? req.query.longitude ?? req.body?.lon ?? req.body?.longitude;

  if (latStr === undefined || latStr === null || lonStr === undefined || lonStr === null) {
    return null;
  }

  const latitude = typeof latStr === "number" ? latStr : parseFloat(String(latStr));
  const longitude = typeof lonStr === "number" ? lonStr : parseFloat(String(lonStr));

  return { latitude, longitude };
}

/**
 * Common error mapper for weather requests.
 */
function handleWeatherError(err: unknown, res: Response) {
  if (err instanceof LocationRequiredError) {
    return res.status(err.statusCode).json({
      success: false,
      code: err.code,
      message: err.message,
    });
  }

  if (err instanceof InvalidCoordinatesError) {
    return res.status(err.statusCode).json({
      success: false,
      code: err.code,
      message: err.message,
    });
  }

  if (err instanceof UnauthorizedFarmAccessError) {
    return res.status(err.statusCode).json({
      success: false,
      code: err.code,
      message: err.message,
    });
  }

  if (err instanceof FarmNotFoundError) {
    return res.status(err.statusCode).json({
      success: false,
      code: err.code,
      message: err.message,
    });
  }

  if (err instanceof OpenMeteoTimeoutError) {
    return res.status(err.statusCode).json({
      success: false,
      code: err.code,
      message: err.message,
    });
  }

  if (err instanceof OpenMeteoHttpError || err instanceof OpenMeteoMalformedResponseError) {
    return res.status(err.statusCode).json({
      success: false,
      code: err.code,
      message: err.message,
    });
  }

  console.error("[WeatherController] Unhandled error:", err);
  return res.status(500).json({
    success: false,
    code: "INTERNAL_SERVER_ERROR",
    message: err instanceof Error ? err.message : "An unexpected error occurred.",
  });
}

/**
 * GET /api/weather/farms/:farmId/forecast
 */
export const getFarmForecast = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        code: "AUTHENTICATION_REQUIRED",
        message: "Authentication required.",
      });
    }

    const farmId = Array.isArray(req.params.farmId) ? req.params.farmId[0] : req.params.farmId;
    if (!farmId) {
      return res.status(400).json({
        success: false,
        code: "MISSING_FARM_ID",
        message: "Farm ID parameter is required.",
      });
    }

    const coords = extractCoords(req);
    const result = await WeatherService.getForecast(userId, String(farmId), coords);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err: unknown) {
    return handleWeatherError(err, res);
  }
};

/**
 * GET /api/weather/farms/:farmId/history
 */
export const getFarmHistory = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        code: "AUTHENTICATION_REQUIRED",
        message: "Authentication required.",
      });
    }

    const farmId = Array.isArray(req.params.farmId) ? req.params.farmId[0] : req.params.farmId;
    if (!farmId) {
      return res.status(400).json({
        success: false,
        code: "MISSING_FARM_ID",
        message: "Farm ID parameter is required.",
      });
    }

    const coords = extractCoords(req);
    const result = await WeatherService.getHistory(userId, String(farmId), coords);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err: unknown) {
    return handleWeatherError(err, res);
  }
};

/**
 * POST /api/weather/farms/:farmId/refresh
 */
export const refreshFarmWeather = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        code: "AUTHENTICATION_REQUIRED",
        message: "Authentication required.",
      });
    }

    const farmId = Array.isArray(req.params.farmId) ? req.params.farmId[0] : req.params.farmId;
    if (!farmId) {
      return res.status(400).json({
        success: false,
        code: "MISSING_FARM_ID",
        message: "Farm ID parameter is required.",
      });
    }

    const coords = extractCoords(req);
    const result = await WeatherService.refreshWeather(userId, String(farmId), coords);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err: unknown) {
    return handleWeatherError(err, res);
  }
};
