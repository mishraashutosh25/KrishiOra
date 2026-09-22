/**
 * ============================================================================
 * KrishiOra Smart Crop Lifecycle & Farm Action Planner
 * Phase 4: Crop Knowledge API Controller
 * ============================================================================
 * Exposes authenticated read-only endpoints for master agricultural catalogs.
 * Controller contains ZERO business logic; all operations delegate directly
 * to CropKnowledgeService.
 * ============================================================================
 */

import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth.middleware";
import { CropKnowledgeService } from "../services/cropKnowledge.service";

export const getActiveCrops = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const crops = await CropKnowledgeService.getActiveCrops();
    return res.status(200).json({
      success: true,
      count: crops.length,
      data: crops,
    });
  } catch (error: any) {
    console.error("GET ACTIVE CROPS ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve active crops",
      error: error.message,
    });
  }
};

export const getCropByCode = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const cropCode = req.params.cropCode as string;
    if (!cropCode) {
      return res.status(400).json({
        success: false,
        message: "Crop code is required",
      });
    }

    const crop = await CropKnowledgeService.getCropByCode(cropCode);
    if (!crop) {
      return res.status(404).json({
        success: false,
        message: `Crop "${cropCode}" not found or is inactive`,
      });
    }

    return res.status(200).json({
      success: true,
      data: crop,
    });
  } catch (error: any) {
    console.error("GET CROP BY CODE ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve crop record",
      error: error.message,
    });
  }
};

export const getCropVarieties = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const cropCode = req.params.cropCode as string;
    if (!cropCode) {
      return res.status(400).json({
        success: false,
        message: "Crop code is required",
      });
    }

    const varieties = await CropKnowledgeService.getVarietiesByCrop(cropCode);
    return res.status(200).json({
      success: true,
      cropCode,
      count: varieties.length,
      data: varieties,
    });
  } catch (error: any) {
    console.error("GET CROP VARIETIES ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve crop varieties",
      error: error.message,
    });
  }
};

export const getCropStages = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const cropCode = req.params.cropCode as string;
    if (!cropCode) {
      return res.status(400).json({
        success: false,
        message: "Crop code is required",
      });
    }

    const stages = await CropKnowledgeService.getStagesByCrop(cropCode);
    return res.status(200).json({
      success: true,
      cropCode,
      count: stages.length,
      data: stages,
    });
  } catch (error: any) {
    console.error("GET CROP STAGES ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve crop stages",
      error: error.message,
    });
  }
};

export const getCropActivities = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const cropCode = req.params.cropCode as string;
    if (!cropCode) {
      return res.status(400).json({
        success: false,
        message: "Crop code is required",
      });
    }

    const activities = await CropKnowledgeService.getActivitiesByCrop(cropCode);
    return res.status(200).json({
      success: true,
      cropCode,
      count: activities.length,
      data: activities,
    });
  } catch (error: any) {
    console.error("GET CROP ACTIVITIES ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve crop activity templates",
      error: error.message,
    });
  }
};

export const getActiveRules = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const rules = await CropKnowledgeService.getActiveRules();
    return res.status(200).json({
      success: true,
      count: rules.length,
      data: rules,
    });
  } catch (error: any) {
    console.error("GET ACTIVE RULES ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve active agricultural rules",
      error: error.message,
    });
  }
};

export const getRuleById = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const ruleId = req.params.ruleId as string;
    const version = req.query.version as string | undefined;

    if (!ruleId) {
      return res.status(400).json({
        success: false,
        message: "Rule ID is required",
      });
    }

    const rule = await CropKnowledgeService.getRuleByIdAndVersion(ruleId, version);
    if (!rule) {
      return res.status(404).json({
        success: false,
        message: `Rule "${ruleId}" ${version ? `(v${version})` : ""} not found`,
      });
    }

    return res.status(200).json({
      success: true,
      data: rule,
    });
  } catch (error: any) {
    console.error("GET RULE BY ID ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve agricultural rule",
      error: error.message,
    });
  }
};
