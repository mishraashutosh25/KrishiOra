/**
 * ============================================================================
 * KrishiOra Smart Crop Lifecycle & Farm Action Planner
 * Phase 8: Notification Routes
 * ============================================================================
 */

import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { NotificationController } from "../controllers/notification.controller";

const router = Router();

// Farmer-facing notification endpoints (Strictly tenant-scoped)
router.get("/", authMiddleware, NotificationController.getNotifications);
router.get("/unread-count", authMiddleware, NotificationController.getUnreadCount);
router.post("/:id/read", authMiddleware, NotificationController.markAsRead);
router.post("/read-all", authMiddleware, NotificationController.markAllAsRead);

// Internal worker dispatch endpoint (Authenticated via X-Worker-Key)
router.post("/dispatch-due", NotificationController.dispatchDue);

export default router;
