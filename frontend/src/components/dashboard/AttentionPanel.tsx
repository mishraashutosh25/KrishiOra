import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { AlertCircle, Clock, ChevronRight } from "lucide-react";
import Badge from "../ui/Badge";
import notificationService from "../../services/notification.service";
import { fallbackAttentionItems, type AttentionItem } from "./dashboardFixtures";

interface AttentionPanelProps {
  items?: AttentionItem[];
}

export const AttentionPanel = ({ items }: AttentionPanelProps) => {
  const [alerts, setAlerts] = useState<AttentionItem[]>(items || fallbackAttentionItems);

  useEffect(() => {
    // If external items were passed, use them
    if (items && items.length > 0) {
      setAlerts(items);
      return;
    }

    let isMounted = true;
    notificationService
      .getNotifications(1, 4)
      .then((res) => {
        if (!isMounted) return;
        if (res.notifications && res.notifications.length > 0) {
          const mapped: AttentionItem[] = res.notifications.map((n) => ({
            id: n.id,
            severity: n.type === "WEATHER_ADVISORY" ? "watch" : "harvest",
            title: n.title,
            description: n.message,
            actionText: "View Activity",
            actionHref: "/crops",
          }));
          setAlerts(mapped);
        }
      })
      .catch((err) => {
        console.error("Failed to load notifications for AttentionPanel", err);
      });

    return () => {
      isMounted = false;
    };
  }, [items]);

  if (!alerts || alerts.length === 0) {
    return null;
  }

  return (
    <section aria-label="Farm Attention & Advisory Alerts" className="mb-7">
      <div className="rounded-2xl border border-amber-200/70 bg-amber-50/40 p-5 sm:p-6 shadow-2xs">
        <div className="flex items-center gap-2 mb-4">
          <AlertCircle size={17} className="text-amber-700 shrink-0" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-amber-900">
            Actionable Farm Tasks & Timing
          </h2>
          <span className="ml-auto text-xs font-semibold text-amber-800 bg-amber-100/70 px-2 py-0.5 rounded-full">
            {alerts.length} Pending
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {alerts.map((item) => (
            <div
              key={item.id}
              className="flex flex-col justify-between rounded-xl bg-white p-4 border border-amber-200/60 shadow-2xs"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-slate-900">
                    {item.title}
                  </span>
                  <Badge variant={item.severity === "watch" ? "watch" : "harvest"} size="sm">
                    {item.severity === "watch" ? "Advisory Due" : "Task Reminder"}
                  </Badge>
                </div>
                <p className="text-xs leading-relaxed text-slate-600">
                  {item.description}
                </p>
              </div>

              <div className="mt-3.5 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                <span className="flex items-center gap-1 text-[11px] text-slate-400">
                  <Clock size={12} />
                  <span>Due within 48h</span>
                </span>
                <Link
                  to={item.actionHref}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-green-800 hover:text-green-950 transition-colors"
                >
                  <span>{item.actionText}</span>
                  <ChevronRight size={13} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AttentionPanel;
