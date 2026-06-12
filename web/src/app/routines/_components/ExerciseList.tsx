"use client";

import { cn } from "@/lib/utils";

export type SetDraft = {
  weight: string;
  reps: string;
  duration: string;
};

export type ExerciseDraft = {
  name: string;
  sets: SetDraft[];
};

interface ExerciseListProps {
  exercises: ExerciseDraft[];
  onChange: (exercises: ExerciseDraft[]) => void;
}

function emptySet(): SetDraft {
  return { weight: "", reps: "", duration: "" };
}

export function ExerciseList({ exercises, onChange }: ExerciseListProps) {
  function updateSet(exIdx: number, setIdx: number, patch: Partial<SetDraft>) {
    onChange(
      exercises.map((ex, i) =>
        i !== exIdx
          ? ex
          : { ...ex, sets: ex.sets.map((s, j) => (j !== setIdx ? s : { ...s, ...patch })) },
      ),
    );
  }

  function addSet(exIdx: number) {
    onChange(
      exercises.map((ex, i) =>
        i !== exIdx ? ex : { ...ex, sets: [...ex.sets, emptySet()] },
      ),
    );
  }

  function removeSet(exIdx: number, setIdx: number) {
    onChange(
      exercises.map((ex, i) =>
        i !== exIdx ? ex : { ...ex, sets: ex.sets.filter((_, j) => j !== setIdx) },
      ),
    );
  }

  function removeExercise(exIdx: number) {
    onChange(exercises.filter((_, i) => i !== exIdx));
  }

  if (exercises.length === 0) {
    return (
      <p className="py-5 font-body text-[13px] text-gray-400">
        No exercises added yet.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {exercises.map((ex, exIdx) => (
        <div
          key={ex.name}
          className="rounded border border-border bg-surface"
        >
          {/* Exercise header */}
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <span className="font-body text-[14px] font-medium text-ink">{ex.name}</span>
            <button
              type="button"
              onClick={() => removeExercise(exIdx)}
              className="font-body text-[18px] font-light text-gray-400 hover:text-danger cursor-pointer leading-none"
              aria-label={`Remove ${ex.name}`}
            >
              ×
            </button>
          </div>

          {/* Set rows */}
          <div className="px-4 pt-3 pb-2">
            {ex.sets.length === 0 && (
              <p className="pb-2 font-body text-[12px] text-gray-400">No sets planned.</p>
            )}

            {ex.sets.map((set, setIdx) => (
              <div
                key={setIdx}
                className="mb-2 flex items-center gap-2"
              >
                <span className="w-5 flex-shrink-0 font-body text-[11px] text-gray-400 text-right">
                  {setIdx + 1}
                </span>
                <SetInput
                  value={set.weight}
                  placeholder="lb"
                  onChange={(v) => updateSet(exIdx, setIdx, { weight: v })}
                />
                <SetInput
                  value={set.reps}
                  placeholder="reps"
                  onChange={(v) => updateSet(exIdx, setIdx, { reps: v })}
                />
                <SetInput
                  value={set.duration}
                  placeholder="sec"
                  onChange={(v) => updateSet(exIdx, setIdx, { duration: v })}
                />
                <button
                  type="button"
                  onClick={() => removeSet(exIdx, setIdx)}
                  className="flex-shrink-0 font-body text-[16px] font-light text-gray-400 hover:text-danger cursor-pointer leading-none"
                  aria-label="Remove set"
                >
                  ×
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={() => addSet(exIdx)}
              className={cn(
                "mt-1 mb-2 font-body text-[12px] text-accent cursor-pointer",
                "hover:opacity-80 transition-opacity",
              )}
            >
              + Add Set
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

interface SetInputProps {
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
}

function SetInput({ value, placeholder, onChange }: SetInputProps) {
  return (
    <input
      type="number"
      inputMode="numeric"
      min={0}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className={cn(
        "w-0 flex-1 rounded border border-border bg-transparent px-2 py-1",
        "font-body text-[13px] text-ink placeholder:text-gray-400",
        "outline-none focus:border-border-dark",
        "min-w-0",
      )}
    />
  );
}
