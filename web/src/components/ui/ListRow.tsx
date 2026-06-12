import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

interface ListRowProps extends HTMLAttributes<HTMLDivElement> {
  active?: boolean;
  inactive?: boolean;
  rightSlot?: React.ReactNode;
  arrow?: boolean;
}

export function ListRow({
  active = false,
  inactive = false,
  rightSlot,
  arrow = false,
  className,
  children,
  ...props
}: ListRowProps) {
  return (
    <div
      className={cn(
        "relative flex items-center justify-between border-b border-border px-6 py-[18px]",
        active && "bg-[var(--accent-dim)] pl-[22px] border-l-2 border-l-accent",
        inactive && "opacity-40",
        className,
      )}
      {...props}
    >
      <div className={cn("flex-1 min-w-0", inactive && "line-through")}>{children}</div>
      {rightSlot && <div className="flex-shrink-0 ml-3">{rightSlot}</div>}
      {arrow && (
        <span className="ml-3 flex-shrink-0 text-[14px] text-accent opacity-50">→</span>
      )}
    </div>
  );
}
