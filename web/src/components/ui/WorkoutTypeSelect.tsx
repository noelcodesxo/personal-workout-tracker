import { cn } from "@/lib/utils";
import type { WorkoutType } from "@/api/types";

const TYPES: WorkoutType[] = ["pull", "push", "legs", "cardio", "core"];

interface WorkoutTypeSelectProps {
  value: WorkoutType | "";
  onChange: (type: WorkoutType) => void;
  error?: string;
}

export function WorkoutTypeSelect({ value, onChange, error }: WorkoutTypeSelectProps) {
  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {TYPES.map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => onChange(type)}
            className={cn(
              "rounded border px-3 py-[7px]",
              "font-body text-[11px] font-medium tracking-[0.16em] uppercase",
              "cursor-pointer transition-colors",
              value === type
                ? "border-accent bg-accent/10 text-accent"
                : "border-border text-gray-500 hover:border-border-dark",
            )}
          >
            {type}
          </button>
        ))}
      </div>
      {error && <p className="mt-2 font-body text-[11px] text-danger">{error}</p>}
    </div>
  );
}
