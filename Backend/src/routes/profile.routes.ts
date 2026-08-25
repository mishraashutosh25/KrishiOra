import { Router } from "express";

import { deleteProfile, getProfile, updateProfile } from "../controllers/profile.controller";

import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.get("/",authMiddleware,getProfile);

router.put("/", authMiddleware, updateProfile);

router.delete("/", authMiddleware, deleteProfile);

export default router;