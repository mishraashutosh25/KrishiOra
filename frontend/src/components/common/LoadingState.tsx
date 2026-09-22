import { Loader2 } from "lucide-react";
import { cn } from "../../lib/utils";

export interface LoadingStateProps {
  message?: string;
  className?: string;
}

export const LoadingState = ({
  message = "Loading farm data...",
  className = "",
}: LoadingStateProps) => {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-12 text-center rounded-2xl bg-white/50 min-h-[220px]",
        className
      )}
    >
      <Loader2 className="h-8 w-8 animate-spin text-green-700 mb-3" />
      <p className="text-xs sm:text-sm font-medium text-slate-500">{message}</p>
    </div>
  );
};

export const Skeleton = ({
  className = "",
}: {
  className?: string;
}) => {
  return (
    <div
      className={cn("animate-pulse rounded-xl bg-slate-200/80", className)}
      aria-hidden="true"
    />
  );
};

export default LoadingState;
