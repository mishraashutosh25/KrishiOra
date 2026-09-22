import type { ReactNode } from "react";
import { cn } from "../../lib/utils";

interface ContainerProps {
  children: ReactNode;
  className?: string;
  size?: "default" | "narrow" | "wide" | "full";
}

export const Container = ({
  children,
  className = "",
  size = "default",
}: ContainerProps) => {
  const sizeClasses = {
    narrow: "max-w-4xl",
    default: "max-w-[1320px]",
    wide: "max-w-[1440px]",
    full: "max-w-full",
  };

  return (
    <div
      className={cn(
        "mx-auto w-full px-4 sm:px-6 lg:px-8 xl:px-12",
        sizeClasses[size],
        className
      )}
    >
      {children}
    </div>
  );
};

export default Container;
