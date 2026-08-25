import { Router } from "express";

import { createCrop, deleteCrop, getCropById, getCropsByFarm, updateCrop } from "../controllers/crop.controller";

import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.post("/:farmId/crops",authMiddleware,createCrop);
router.get("/:farmId/crops",authMiddleware,getCropsByFarm);
router.get("/:id",authMiddleware,getCropById);
router.put("/:id",authMiddleware,updateCrop);
router.delete("/:id",authMiddleware,deleteCrop);

export default router;