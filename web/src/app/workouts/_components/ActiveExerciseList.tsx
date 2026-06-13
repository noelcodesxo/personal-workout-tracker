"use client";

import { cn } from "@/lib/utils";

export interface SetDraft {
  weight: string;
  reps: string;
  duration: string;
  notes: string;
  checked: boolean;
}

export interface ExerciseDraft {
  name: string;
  sets: SetDraft[];
}

export function emptySet(): SetDraft {
  return { weight: "", reps: "", duration: "", notes: "", checked: false };
}

interface Props {
  exercises: ExerciseDraft[];
  onChange: (exercises: ExerciseDraft[]) => void;
}

export function ActiveExerciseList({ exercises, onChange }: Props) {
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
      exercises.map((ex, i) => (i !== exIdx ? ex : { ...ex, sets: [...ex.sets, emptySet()] })),
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
        No exercises added yet. Tap + to add one.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {exercises.map((ex, exIdx) => (
        <div key={ex.name} className="rounded border border-border bg-surface">
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

          <div className="px-4 pt-3 pb-2">
            {/* column headers */}
            <div className="mb-1 flex items-center gap-2 pl-6">
              <span className="w-0 flex-1 min-w-0 font-body text-[10px] uppercase tracking-widest text-gray-400">lb</span>
              <span className="w-0 flex-1 min-w-0 font-body text-[10px] uppercase tracking-widest text-gray-400">reps</span>
              <span className="w-0 flex-1 min-w-0 font-body text-[10px] uppercase tracking-widest text-gray-400">sec</span>
              <span className="w-[28px]" />
            </div>

            {ex.sets.length === 0 && (
              <p className="pb-2 font-body text-[12px] text-gray-400">No sets added.</p>
            )}

            {ex.sets.map((set, setIdx) => (
              <div key={setIdx} className="mb-2">
                <div className="flex items-center gap-2">
                  {/* check-off circle */}
                  <button
                    type="button"
                    onClick={() => updateSet(exIdx, setIdx, { checked: !set.checked })}
                    className={cn(
                      "flex-shrink-0 h-5 w-5 rounded-full border transition-colors cursor-pointer",
                      set.checked
                        ? "border-accent bg-accent"
                        : "border-border-dark bg-transparent",
                    )}
                    aria-label={set.checked ? "Mark incomplete" : "Mark complete"}
                  >
                    {set.checked && (
                      <svg viewBox="0 0 10 10" fill="none" className="h-full w-full p-[3px]">
                        <path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </button>

                  <span className="w-4 flex-shrink-0 font-body text-[11px] text-gray-400 text-right">
                    {setIdx + 1}
                  </span>

                  <SetInput
                    value={set.weight}
                    placeholder="0"
                    dimmed={set.checked}
                    onChange={(v) => updateSet(exIdx, setIdx, { weight: v })}
                  />
                  <SetInput
                    value={set.reps}
                    placeholder="0"
                    dimmed={set.checked}
                    onChange={(v) => updateSet(exIdx, setIdx, { reps: v })}
                  />
                  <SetInput
                    value={set.duration}
                    placeholder="0"
                    dimmed={set.checked}
                    onChange={(v) => updateSet(exIdx, setIdx, { duration: v })}
                  />

                  <button
                    type="button"
                    onClick={() => removeSet(exIdx, setIdx)}
                    className="flex-shrink-0 w-7 font-body text-[16px] font-light text-gray-400 hover:text-danger cursor-pointer leading-none text-center"
                    aria-label="Remove set"
                  >
                    ×
                  </button>
                </div>

                {/* notes row */}
                <div className="mt-1 pl-[52px] pr-7">
                  <input
                    type="text"
                    value={set.notes}
                    placeholder="Add note…"
                    onChange={(e) => updateSet(exIdx, setIdx, { notes: e.target.value })}
                    className="w-full bg-transparent font-body text-[12px] text-gray-500 placeholder:text-gray-300 outline-none"
                  />
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={() => addSet(exIdx)}
              className="mt-1 mb-2 font-body text-[12px] text-accent cursor-pointer hover:opacity-80 transition-opacity"
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
  dimmed?: boolean;
  onChange: (value: string) => void;
}

function SetInput({ value, placeholder, dimmed, onChange }: SetInputProps) {
  return (
    <input
      type="number"
      inputMode="numeric"
      min={0}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className={cn(
        "w-0 flex-1 min-w-0 rounded border border-border bg-transparent px-2 py-1",
        "font-body text-[13px] placeholder:text-gray-300 outline-none focus:border-border-dark",
        dimmed ? "text-gray-400 line-through" : "text-ink",
      )}
    />
  );
}
