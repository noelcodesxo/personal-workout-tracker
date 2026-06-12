import { cn } from "@/lib/utils";

interface TopBarProps {
  title?: string;
  appName?: boolean;
  leftSlot?: React.ReactNode;
  rightSlot?: React.ReactNode;
  className?: string;
}

export function TopBar({ title, appName = false, leftSlot, rightSlot, className }: TopBarProps) {
  return (
    <div
      className={cn(
        "flex flex-shrink-0 items-center justify-between px-6 pb-3 pt-4",
        className,
      )}
    >
      <div className="flex w-11 items-center">{leftSlot}</div>

      <div className="flex-1 text-center">
        {appName ? (
          <span className="font-display text-[18px] font-semibold tracking-[0.22em] uppercase text-ink">
            Astron
          </span>
        ) : title ? (
          <span className="font-body text-[13px] font-medium tracking-[0.14em] uppercase text-ink">
            {title}
          </span>
        ) : null}
      </div>

      <div className="flex w-11 items-center justify-end">{rightSlot}</div>
    </div>
  );
}
