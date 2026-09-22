import type { ReactNode } from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "../../lib/utils";

export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  trend?: {
    value: number | string;
    direction: "up" | "down" | "neutral";
    label?: string;
  };
  className?: string;
  accentColor?: "green" | "amber" | "blue" | "neutral";
}

export const StatCard = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  className = "",
  accentColor = "green",
}: StatCardProps) => {
  const iconBgClasses = {
    green: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
    blue: "bg-sky-50 text-sky-700",
    neutral: "bg-slate-100 text-slate-700",
  };

  return (
    <div
      className={cn(
        "rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all duration-200 hover:border-slate-300 hover:shadow-sm",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {title}
        </span>
        {icon && (
          <div
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
              iconBgClasses[accentColor]
            )}
          >
            {icon}
          </div>
        )}
      </div>

      <div className="mt-3">
        <p className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
          {value}
        </p>
      </div>

      {(trend || subtitle) && (
        <div className="mt-2.5 flex items-center gap-2 text-xs">
          {trend && (
            <span
              className={cn(
                "inline-flex items-center gap-1 font-semibold rounded-md px-1.5 py-0.5",
                trend.direction === "up"
                  ? "bg-emerald-50 text-emerald-700"
                  : trend.direction === "down"
                  ? "bg-red-50 text-red-700"
                  : "bg-slate-100 text-slate-600"
              )}
            >
              {trend.direction === "up" ? (
                <TrendingUp size={12} />
              ) : trend.direction === "down" ? (
                <TrendingDown size={12} />
              ) : (
                <Minus size={12} />
              )}
              {trend.value}
            </span>
          )}
          <span className="text-slate-500 truncate">
            {trend?.label || subtitle}
          </span>
        </div>
      )}
    </div>
  );
};

export default StatCard;
