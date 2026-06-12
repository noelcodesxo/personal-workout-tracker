import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  cornerAccent?: boolean;
}

export function Card({ cornerAccent = false, className, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded border border-border bg-surface",
        cornerAccent && "corner-notch",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
