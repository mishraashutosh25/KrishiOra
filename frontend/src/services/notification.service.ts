import api from "./api";
import type { NotificationItem } from "../types/lifecycle.types";

export const notificationService = {
  // Fetch user notifications
  async getNotifications(page = 1, limit = 20): Promise<{ notifications: NotificationItem[]; total: number }> {
    const res = await api.get<{ success: boolean; data: NotificationItem[]; meta?: { total: number } }>(
      "/notifications",
      { params: { page, limit } }
    );
    return {
      notifications: res.data.data || [],
      total: res.data.meta?.total || 0,
    };
  },

  // Fetch unread count for bell icon badge
  async getUnreadCount(): Promise<number> {
    const res = await api.get<{ success: boolean; data: { unread_count: number } }>(
      "/notifications/unread-count"
    );
    return res.data.data?.unread_count || 0;
  },

  // Mark single notification read
  async markAsRead(notificationId: string): Promise<boolean> {
    const res = await api.post<{ success: boolean }>(`/notifications/${notificationId}/read`);
    return res.data.success;
  },

  // Mark all notifications read
  async markAllAsRead(): Promise<number> {
    const res = await api.post<{ success: boolean; data: { updated_count: number } }>(
      "/notifications/read-all"
    );
    return res.data.data?.updated_count || 0;
  },
};

export default notificationService;
