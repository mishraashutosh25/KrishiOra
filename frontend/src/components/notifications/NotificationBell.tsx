import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  Bell,
  Check,
  Clock,
  AlertTriangle,
  Calendar,
  Volume2,
  VolumeX,
  Sparkles,
  CloudRain,
  ShieldAlert,
  CheckCheck,
  X,
} from "lucide-react";
import notificationService from "../../services/notification.service";
import type { NotificationItem } from "../../types/lifecycle.types";
import { supabase } from "../../lib/supabase";
import authService from "../../services/auth.service";

// Audio chime generator using Web Audio API (Zero external mp3 dependency)
const playNotificationChime = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5

    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.35);
  } catch (err) {
    console.debug("Audio chime skipped:", err);
  }
};

// Formats relative time (e.g. "Just now", "5m ago", "2h ago")
const formatTimeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSec = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSec < 60) return "Just now";
  const diffInMin = Math.floor(diffInSec / 60);
  if (diffInMin < 60) return `${diffInMin}m ago`;
  const diffInHours = Math.floor(diffInMin / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;
  return date.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
};

type TabType = "ALL" | "WEATHER" | "TASKS" | "RISK";

export const NotificationBell = () => {
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<TabType>("ALL");
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [liveToast, setLiveToast] = useState<NotificationItem | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentUser = authService.getCurrentUser();
  const userId = currentUser?.id;

  // 1. Fetch initial unread count
  const fetchUnread = useCallback(async () => {
    try {
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
    } catch {
      // Ignore background polling errors
    }
  }, []);

  // 2. Fetch full list of notifications
  const loadNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const { notifications: items } = await notificationService.getNotifications(1, 25);
      setNotifications(items);
    } catch (err) {
      console.error("Failed to load notifications", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // 3. Supabase Realtime WebSocket Subscription
  useEffect(() => {
    fetchUnread();

    if (!userId) return;

    // Create Supabase Realtime channel for live alerts
    const channel = supabase
      .channel(`user-notifications-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notification_queue",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const newAlert = payload.new as NotificationItem;
          if (newAlert) {
            playNotificationChime();
            setUnreadCount((prev) => prev + 1);
            setNotifications((prev) => [newAlert, ...prev]);
            setLiveToast(newAlert);
            setTimeout(() => setLiveToast(null), 7000);
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "notification_queue",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const updatedAlert = payload.new as NotificationItem;
          if (updatedAlert) {
            setNotifications((prev) =>
              prev.map((n) => (n.id === updatedAlert.id ? updatedAlert : n))
            );
          }
        }
      )
      .subscribe();

    // Fallback polling every 60s
    const interval = setInterval(fetchUnread, 60000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [userId, fetchUnread]);

  useEffect(() => {
    if (isOpen) {
      loadNotifications();
    }
  }, [isOpen, loadNotifications]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 4. Mark single read
  const handleMarkRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read_at: new Date().toISOString() } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Mark read failed", err);
    }
  };

  // 5. Mark all read
  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, read_at: new Date().toISOString() }))
      );
      setUnreadCount(0);
    } catch (err) {
      console.error("Mark all read failed", err);
    }
  };

  // 6. Voice Text-to-Speech (Hindi & Indian English Voice Engine)
  const handleToggleVoice = (e: React.MouseEvent, item: NotificationItem) => {
    e.stopPropagation();

    if (!("speechSynthesis" in window)) {
      alert("Voice speech synthesis is not supported on this browser.");
      return;
    }

    if (speakingId === item.id) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
      return;
    }

    window.speechSynthesis.cancel();
    setSpeakingId(item.id);

    const speechText = `${item.title}। ${item.message}`;
    const utterance = new SpeechSynthesisUtterance(speechText);

    // Prefer Hindi or Indian English voice
    const voices = window.speechSynthesis.getVoices();
    const hindiVoice = voices.find((v) => v.lang.startsWith("hi") || v.lang.includes("hi-IN"));
    const indianVoice = voices.find((v) => v.lang.includes("en-IN"));

    if (hindiVoice) {
      utterance.voice = hindiVoice;
      utterance.lang = "hi-IN";
    } else if (indianVoice) {
      utterance.voice = indianVoice;
      utterance.lang = "en-IN";
    } else {
      utterance.lang = "en-US";
    }

    utterance.rate = 0.95; // Clear natural pace for farmers
    utterance.pitch = 1.0;

    utterance.onend = () => setSpeakingId(null);
    utterance.onerror = () => setSpeakingId(null);

    window.speechSynthesis.speak(utterance);
  };

  // Filter items by category
  const filteredNotifications = useMemo(() => {
    if (activeTab === "ALL") return notifications;
    if (activeTab === "WEATHER")
      return notifications.filter((n) => n.type === "WEATHER_ADVISORY");
    if (activeTab === "TASKS")
      return notifications.filter((n) => n.type === "TASK_REMINDER");
    if (activeTab === "RISK")
      return notifications.filter((n) => n.type === "RISK_ALERT" || n.priority === "CRITICAL");
    return notifications;
  }, [notifications, activeTab]);

  const getTypeIcon = (type: NotificationItem["type"], priority?: string) => {
    if (priority === "CRITICAL" || type === "RISK_ALERT") {
      return (
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-100 text-red-600 shrink-0 shadow-xs animate-pulse">
          <ShieldAlert size={16} />
        </div>
      );
    }
    switch (type) {
      case "WEATHER_ADVISORY":
        return (
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100 text-amber-700 shrink-0 shadow-xs">
            <CloudRain size={16} />
          </div>
        );
      case "TASK_REMINDER":
        return (
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 shrink-0 shadow-xs">
            <Clock size={16} />
          </div>
        );
      case "HARVEST_READINESS":
        return (
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-100 text-sky-700 shrink-0 shadow-xs">
            <Calendar size={16} />
          </div>
        );
      default:
        return (
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-600 shrink-0 shadow-xs">
            <Bell size={16} />
          </div>
        );
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* 1. Live Instant Toast Notification (Realtime Slide-In) */}
      {liveToast && (
        <div className="fixed bottom-5 right-5 z-[9999] max-w-sm w-full bg-white border border-emerald-300 rounded-2xl shadow-2xl p-4 animate-in slide-in-from-bottom-5 duration-300">
          <div className="flex items-start gap-3">
            {getTypeIcon(liveToast.type, liveToast.priority)}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700">
                  New Live Advisory
                </span>
                <button
                  onClick={() => setLiveToast(null)}
                  className="text-slate-400 hover:text-slate-600 p-0.5 rounded cursor-pointer"
                >
                  <X size={14} />
                </button>
              </div>
              <h4 className="text-xs font-bold text-slate-900 truncate mt-0.5">{liveToast.title}</h4>
              <p className="text-[11px] text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                {liveToast.message}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 2. Bell Trigger Button with Badge & Realtime Indicator */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Open notifications"
        className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200/80 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-700 cursor-pointer shadow-xs"
      >
        <Bell size={18} className={unreadCount > 0 ? "text-emerald-700" : "text-slate-600"} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-extrabold text-white shadow-md animate-pulse">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* 3. Dropdown Menu / Notification Drawer */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-[340px] sm:w-[410px] rounded-3xl border border-slate-200/90 bg-white shadow-2xl z-50 overflow-hidden flex flex-col max-h-[580px]">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3.5 bg-slate-50/70">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                Farm Alerts
                <Sparkles size={14} className="text-emerald-600" />
              </h3>
              {unreadCount > 0 ? (
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-800">
                  {unreadCount} unread
                </span>
              ) : (
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500">
                  Up to date
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-900 cursor-pointer transition-colors"
              >
                <CheckCheck size={14} />
                Mark all read
              </button>
            )}
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1 px-3 py-2 border-b border-slate-100 bg-white text-xs font-semibold text-slate-600 overflow-x-auto no-scrollbar">
            {(
              [
                { id: "ALL", label: "All" },
                { id: "WEATHER", label: "Weather (मौसम)" },
                { id: "TASKS", label: "Tasks (कार्य)" },
                { id: "RISK", label: "Urgent (चेतावनी)" },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-2.5 py-1 rounded-lg transition-all text-[11px] whitespace-nowrap cursor-pointer ${
                  activeTab === tab.id
                    ? "bg-emerald-700 text-white font-bold shadow-xs"
                    : "hover:bg-slate-100 text-slate-600"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Alert List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {loading ? (
              <div className="p-8 text-center text-xs text-slate-500 flex flex-col items-center gap-2">
                <div className="h-5 w-5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                <span>Loading latest agricultural alerts...</span>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="p-8 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 border border-slate-200 text-slate-400 mb-2.5">
                  <Bell size={20} />
                </div>
                <p className="text-xs font-bold text-slate-700">No notifications in this category</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Weather updates and farm task schedules will appear automatically
                </p>
              </div>
            ) : (
              filteredNotifications.map((item) => {
                const isUnread = !item.read_at;
                const isSpeaking = speakingId === item.id;

                return (
                  <div
                    key={item.id}
                    onClick={() => isUnread && handleMarkRead(item.id)}
                    className={`p-3.5 transition-all cursor-pointer hover:bg-slate-50 relative group ${
                      isUnread
                        ? "bg-emerald-50/40 border-l-4 border-l-emerald-600 font-medium"
                        : "opacity-85 hover:opacity-100"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {getTypeIcon(item.type, item.priority)}

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1.5">
                          <h4 className="text-xs font-bold text-slate-900 truncate">
                            {item.title}
                          </h4>
                          {isUnread && (
                            <span className="h-2 w-2 rounded-full bg-emerald-600 shrink-0" />
                          )}
                        </div>

                        <p className="mt-1 text-xs text-slate-600 leading-relaxed line-clamp-2">
                          {item.message}
                        </p>

                        <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                          <div className="flex items-center gap-2">
                            <span>{formatTimeAgo(item.scheduled_for || item.created_at)}</span>
                            {item.priority === "CRITICAL" && (
                              <span className="font-extrabold text-red-600 bg-red-50 border border-red-200 px-1.5 py-0.2 rounded text-[10px] uppercase">
                                Urgent
                              </span>
                            )}
                          </div>

                          {/* Voice Readout Button (TTS) */}
                          <button
                            type="button"
                            onClick={(e) => handleToggleVoice(e, item)}
                            title="Listen in Hindi/English voice"
                            className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-lg border transition-colors cursor-pointer ${
                              isSpeaking
                                ? "bg-amber-100 border-amber-300 text-amber-900 animate-pulse"
                                : "bg-white border-slate-200 text-slate-600 hover:text-emerald-700 hover:border-emerald-300 shadow-2xs"
                            }`}
                          >
                            {isSpeaking ? (
                              <>
                                <VolumeX size={12} className="text-amber-800" />
                                <span>Stop</span>
                              </>
                            ) : (
                              <>
                                <Volume2 size={12} className="text-emerald-700" />
                                <span>बोलें (Listen)</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
