/**
 * ============================================================================
 * KrishiOra Smart Crop Lifecycle & Farm Action Planner
 * Phase 8: Notification Controller
 * ============================================================================
 * Strict tenant-scoped notification queries and interactions.
 * Core event fields are strictly immutable; farmer updates are restricted to read_at.
 * ============================================================================
 */

import { Response } from "express";
import { AuthenticatedRequest } from "../middleware/auth.middleware";
import { supabaseAdmin } from "../config/supabase";
import { createClient } from "@supabase/supabase-js";
import { NotificationSchedulerService } from "../services/notificationScheduler.service";

export class NotificationController {
  /**
   * GET /api/notifications
   * Paginated list of notifications for the authenticated farmer.
   */
  public static async getNotifications(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          code: "UNAUTHORIZED",
          message: "Authenticated session required.",
        });
      }

      const {
        status,
        cropCycleId,
        unreadOnly = "false",
        limit = "20",
        offset = "0",
      } = req.query;

      const parsedLimit = Math.min(Math.max(parseInt(String(limit), 10) || 20, 1), 100);
      const parsedOffset = Math.max(parseInt(String(offset), 10) || 0, 0);

      // Build query scoped strictly to authenticated farmer
      let query = supabaseAdmin
        .from("notification_queue")
        .select("*", { count: "exact" })
        .eq("user_id", userId);

      if (status) {
        query = query.eq("status", String(status));
      } else {
        // Default to showing delivered or pending notifications, not cancelled/failed
        query = query.in("status", ["SENT", "PENDING"]);
      }

      if (cropCycleId) {
        query = query.eq("crop_cycle_id", String(cropCycleId));
      }

      if (unreadOnly === "true") {
        query = query.is("read_at", null);
      }

      // Order by created_at descending (newest alerts first)
      query = query
        .order("created_at", { ascending: false })
        .range(parsedOffset, parsedOffset + parsedLimit - 1);

      const { data: notifications, count, error } = await query;

      if (error) {
        throw error;
      }

      // Query total unread count for badge
      const { count: unreadCount } = await supabaseAdmin
        .from("notification_queue")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("status", "SENT")
        .is("read_at", null);

      return res.status(200).json({
        success: true,
        data: {
          notifications: (notifications || []).map((n) => ({
            id: n.id,
            cropCycleId: n.crop_cycle_id,
            taskId: n.task_id,
            type: n.type,
            priority: n.priority,
            title: n.title,
            message: n.message,
            status: n.status,
            scheduledFor: n.scheduled_for,
            sentAt: n.sent_at,
            readAt: n.read_at,
            actionedAt: n.actioned_at,
            supersededAt: n.superseded_at,
            metadata: n.metadata || {},
          })),
          total: count || 0,
          unreadCount: unreadCount || 0,
        },
      });
    } catch (err: any) {
      console.error("[NotificationController] getNotifications Error:", err);
      return res.status(500).json({
        success: false,
        code: "INTERNAL_SERVER_ERROR",
        message: err.message || "Failed to fetch notifications.",
      });
    }
  }

  /**
   * GET /api/notifications/unread-count
   * Lightweight unread count for UI badges.
   */
  public static async getUnreadCount(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          code: "UNAUTHORIZED",
          message: "Authenticated session required.",
        });
      }

      const { count, error } = await supabaseAdmin
        .from("notification_queue")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("status", "SENT")
        .is("read_at", null);

      if (error) throw error;

      return res.status(200).json({
        success: true,
        data: { unreadCount: count || 0 },
      });
    } catch (err: any) {
      console.error("[NotificationController] getUnreadCount Error:", err);
      return res.status(500).json({
        success: false,
        code: "INTERNAL_SERVER_ERROR",
        message: err.message || "Failed to get unread count.",
      });
    }
  }

  /**
   * POST /api/notifications/:id/read
   * Marks a single notification as read.
   * Strictly updates ONLY read_at.
   */
  public static async markAsRead(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          code: "UNAUTHORIZED",
          message: "Authenticated session required.",
        });
      }

      const { id } = req.params;
      const now = new Date().toISOString();

      // Check ownership
      const { data: notification } = await supabaseAdmin
        .from("notification_queue")
        .select("id, user_id, read_at")
        .eq("id", id)
        .maybeSingle();

      if (!notification) {
        return res.status(404).json({
          success: false,
          code: "NOT_FOUND",
          message: `Notification not found: ${id}`,
        });
      }

      if (notification.user_id !== userId) {
        return res.status(403).json({
          success: false,
          code: "FORBIDDEN",
          message: "Unauthorized: You do not own this notification.",
        });
      }

      // If already read, idempotent 200 return
      if (notification.read_at) {
        return res.status(200).json({
          success: true,
          data: { id: notification.id, readAt: notification.read_at },
        });
      }

      const { error: updateErr } = await supabaseAdmin
        .from("notification_queue")
        .update({ read_at: now })
        .eq("id", id)
        .eq("user_id", userId);

      if (updateErr) throw updateErr;

      return res.status(200).json({
        success: true,
        data: { id, readAt: now },
      });
    } catch (err: any) {
      console.error("[NotificationController] markAsRead Error:", err);
      return res.status(500).json({
        success: false,
        code: "INTERNAL_SERVER_ERROR",
        message: err.message || "Failed to mark notification as read.",
      });
    }
  }

  /**
   * POST /api/notifications/read-all
   * Marks all unread delivered notifications as read for the farmer.
   */
  public static async markAllAsRead(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          code: "UNAUTHORIZED",
          message: "Authenticated session required.",
        });
      }

      const { cropCycleId } = req.body || {};
      const now = new Date().toISOString();

      let query = supabaseAdmin
        .from("notification_queue")
        .update({ read_at: now })
        .eq("user_id", userId)
        .eq("status", "SENT")
        .is("read_at", null);

      if (cropCycleId) {
        query = query.eq("crop_cycle_id", cropCycleId);
      }

      const { error } = await query;
      if (error) throw error;

      return res.status(200).json({
        success: true,
        message: "All unread notifications marked as read.",
      });
    } catch (err: any) {
      console.error("[NotificationController] markAllAsRead Error:", err);
      return res.status(500).json({
        success: false,
        code: "INTERNAL_SERVER_ERROR",
        message: err.message || "Failed to mark all as read.",
      });
    }
  }

  /**
   * POST /api/notifications/dispatch-due
   * Internal worker endpoint for scheduled batch dispatch.
   * Authenticated strictly via dedicated secret X-Worker-Key.
   */
  public static async dispatchDue(req: AuthenticatedRequest, res: Response) {
    try {
      const workerKeyHeader = req.headers["x-worker-key"];
      const configuredSecret = process.env.INTERNAL_WORKER_SECRET || "krishiora-internal-worker-secret";

      if (!workerKeyHeader || workerKeyHeader !== configuredSecret) {
        return res.status(403).json({
          success: false,
          code: "FORBIDDEN",
          message: "Internal worker credentials required.",
        });
      }

      const batchSize = parseInt(String(req.query.batchSize || "50"), 10);
      const result = await NotificationSchedulerService.dispatchDueNotifications(batchSize);

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err: any) {
      console.error("[NotificationController] dispatchDue Error:", err);
      return res.status(500).json({
        success: false,
        code: "INTERNAL_SERVER_ERROR",
        message: err.message || "Worker dispatch failed.",
      });
    }
  }
}
