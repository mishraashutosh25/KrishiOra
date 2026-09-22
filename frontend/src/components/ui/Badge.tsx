import type { ReactNode } from "react";
import { cn } from "../../lib/utils";

export interface BadgeProps {
  children: ReactNode;
  variant?:
    | "healthy"
    | "harvest"
    | "watch"
    | "danger"
    | "neutral"
    | "forest"
    | "info";
  size?: "sm" | "md";
  className?: string;
  icon?: ReactNode;
  dot?: boolean;
}

export const Badge = ({
  children,
  variant = "healthy",
  size = "md",
  className = "",
  icon,
  dot = false,
}: BadgeProps) => {
  const variantStyles = {
    healthy: "bg-emerald-50 text-emerald-800 border-emerald-200/60",
    harvest: "bg-amber-50 text-amber-800 border-amber-200/60",
    watch: "bg-orange-50 text-orange-800 border-orange-200/60",
    danger: "bg-red-50 text-red-800 border-red-200/60",
    neutral: "bg-slate-100 text-slate-700 border-slate-200/70",
    forest: "bg-green-900 text-green-100 border-green-800",
    info: "bg-sky-50 text-sky-800 border-sky-200/60",
  };

  const dotColors = {
    healthy: "bg-emerald-500",
    harvest: "bg-amber-500",
    watch: "bg-orange-500",
    danger: "bg-red-500",
    neutral: "bg-slate-400",
    forest: "bg-green-300",
    info: "bg-sky-500",
  };

  const sizeStyles = {
    sm: "px-2 py-0.5 text-[10px] gap-1",
    md: "px-2.5 py-1 text-xs gap-1.5",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center font-semibold rounded-full border tracking-wide select-none",
        sizeStyles[size],
        variantStyles[variant],
        className
      )}
    >
      {dot && (
        <span
          className={cn("h-1.5 w-1.5 rounded-full shrink-0", dotColors[variant])}
          aria-hidden="true"
        />
      )}
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};

export default Badge;
