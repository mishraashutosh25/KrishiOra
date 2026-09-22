import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/utils";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
  variant?: "default" | "subtle" | "forest" | "interactive";
}

export const Card = ({
  children,
  className = "",
  variant = "default",
  ...props
}: CardProps) => {
  const variantStyles = {
    default: "bg-white border border-slate-200/80 shadow-xs hover:border-slate-300/80",
    subtle: "bg-slate-50/70 border border-slate-200/60 shadow-none",
    forest: "bg-green-950 text-white border border-green-900/40 shadow-md",
    interactive:
      "bg-white border border-slate-200/80 shadow-xs hover:border-green-300 hover:shadow-md hover:-translate-y-0.5 cursor-pointer transition-all duration-200",
  };

  return (
    <div
      className={cn(
        "rounded-2xl overflow-hidden transition-all duration-200",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({
  children,
  className = "",
  ...props
}: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("px-6 py-5 border-b border-slate-100", className)} {...props}>
    {children}
  </div>
);

export const CardTitle = ({
  children,
  className = "",
  ...props
}: HTMLAttributes<HTMLHeadingElement>) => (
  <h3
    className={cn("text-lg font-bold tracking-tight text-slate-900 leading-snug", className)}
    {...props}
  >
    {children}
  </h3>
);

export const CardDescription = ({
  children,
  className = "",
  ...props
}: HTMLAttributes<HTMLParagraphElement>) => (
  <p className={cn("text-xs text-slate-500 mt-1 leading-normal", className)} {...props}>
    {children}
  </p>
);

export const CardContent = ({
  children,
  className = "",
  ...props
}: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("p-6", className)} {...props}>
    {children}
  </div>
);

export const CardFooter = ({
  children,
  className = "",
  ...props
}: HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("px-6 py-4 bg-slate-50/60 border-t border-slate-100 flex items-center", className)}
    {...props}
  >
    {children}
  </div>
);

export default Card;
