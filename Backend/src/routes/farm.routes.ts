import { Router } from "express";

import { createFarm, deleteFarm, getFarmById, getFarms, updateFarm } from "../controllers/farm.controller";

import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.post("/", authMiddleware, createFarm);
router.get("/", authMiddleware, getFarms);
router.get("/:id", authMiddleware, getFarmById);
router.patch("/:id", authMiddleware, updateFarm);
router.delete("/:id", authMiddleware, deleteFarm);

export default router;