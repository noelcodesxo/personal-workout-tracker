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
      <div role="radiogroup" aria-label="Workout type" className="flex flex-wrap gap-2">
        {TYPES.map((type) => {
          const selected = value === type;
          return (
            <button
              key={type}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(type)}
              className={cn(
                "rounded border px-3 py-[7px]",
                "font-body text-[11px] font-medium tracking-[0.16em] uppercase",
                "cursor-pointer transition-colors",
                selected
                  ? "border-accent bg-accent/10 text-accent"
                  : "border-border text-gray-500 hover:border-border-dark",
              )}
            >
              {type}
            </button>
          );
        })}
      </div>
      {error && (
        <p className="mt-2 font-body text-[11px] text-danger" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
