import { cn } from "@/lib/utils";
import type { WorkoutType } from "@/api/types";

interface BadgeProps {
  type: WorkoutType;
  className?: string;
}

const LABELS: Record<WorkoutType, string> = {
  pull: "Pull",
  push: "Push",
  legs: "Legs",
  cardio: "Cardio",
  core: "Core",
};

export function Badge({ type, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-block rounded border border-accent/20 px-[6px] py-[2px]",
        "font-body text-[9px] font-medium tracking-[0.16em] uppercase text-accent",
        className,
      )}
    >
      {LABELS[type]}
    </span>
  );
}
