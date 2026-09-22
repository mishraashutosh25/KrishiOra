/**
 * ============================================================================
 * KrishiOra Smart Crop Lifecycle & Farm Action Planner
 * Phase 4: Lifecycle API Controller
 * ============================================================================
 * Handles request parsing, authenticated user verification, and HTTP response
 * formatting. Contains ZERO business logic.
 * Architecture: Route -> Controller -> LifecycleGeneratorService -> Database.
 * ============================================================================
 */

import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth.middleware";
import { LifecycleGeneratorService } from "../services/lifecycleGenerator.service";

export const createLifecycle = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // Support both camelCase and snake_case keys from frontend payloads
    const farmId = req.body.farmId || req.body.farm_id;
    const cropCode = req.body.cropCode || req.body.crop_code;
    const varietyCode = req.body.varietyCode || req.body.variety_code;
    const sowingDate = req.body.sowingDate || req.body.sowing_date;
    const allocatedArea = req.body.allocatedArea ?? req.body.allocated_area;
    const areaUnit = req.body.areaUnit || req.body.area_unit || "acre";
    const soilType = req.body.soilType || req.body.soil_type;
    const irrigationType = req.body.irrigationType || req.body.irrigation_type;
    const notes = req.body.notes;
    const legacyCropId = req.body.legacyCropId || req.body.legacy_crop_id;

    // Basic body validation
    if (!farmId || !cropCode || !varietyCode || !sowingDate || allocatedArea === undefined) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: farmId, cropCode, varietyCode, sowingDate, allocatedArea",
      });
    }

    const authHeader = req.headers.authorization;
    const userJwt = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : undefined;

    const result = await LifecycleGeneratorService.generateLifecycle(
      {
        userId, // Derived STRICTLY from auth middleware
        farmId,
        cropCode,
        varietyCode,
        sowingDate,
        allocatedArea: Number(allocatedArea),
        areaUnit,
        soilType,
        irrigationType,
        notes,
        legacyCropId,
      },
      userJwt
    );

    return res.status(201).json({
      success: true,
      message: "Crop lifecycle generated successfully",
      data: result,
    });
  } catch (error: any) {
    console.error("CREATE LIFECYCLE ERROR:", error.message);

    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to generate crop lifecycle",
      code: error.code,
    });
  }
};

export const getUserLifecycles = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const farmId = (req.query.farmId || req.query.farm_id) as string | undefined;
    const cycles = await LifecycleGeneratorService.getUserLifecycles(userId, farmId);

    return res.status(200).json({
      success: true,
      count: cycles.length,
      data: cycles,
    });
  } catch (error: any) {
    console.error("GET USER LIFECYCLES ERROR:", error.message);
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to fetch crop lifecycles",
    });
  }
};

export const getLifecycleById = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const id = req.params.id as string;
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Lifecycle ID is required",
      });
    }

    const result = await LifecycleGeneratorService.getLifecycleById(id, userId);
    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Crop lifecycle not found or access denied",
      });
    }

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error("GET LIFECYCLE BY ID ERROR:", error.message);
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to fetch crop lifecycle",
    });
  }
};

export const getLifecycleTasks = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const cycleId = req.params.cycleId as string;
    if (!cycleId) {
      return res.status(400).json({
        success: false,
        message: "Cycle ID is required",
      });
    }

    const tasks = await LifecycleGeneratorService.getCycleTasks(cycleId, userId);

    return res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks,
    });
  } catch (error: any) {
    console.error("GET LIFECYCLE TASKS ERROR:", error.message);
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to fetch cycle tasks",
    });
  }
};

export const getLifecyclesByFarm = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const farmId = req.params.farmId as string;
    if (!farmId) {
      return res.status(400).json({
        success: false,
        message: "Farm ID is required",
      });
    }

    const cycles = await LifecycleGeneratorService.getLifecyclesByFarm(farmId, userId);
    return res.status(200).json({
      success: true,
      farmId,
      count: cycles.length,
      data: cycles,
    });
  } catch (error: any) {
    console.error("GET LIFECYCLES BY FARM ERROR:", error.message);
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to fetch farm crop lifecycles",
    });
  }
};

