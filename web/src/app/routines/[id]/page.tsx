"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { IconButton } from "@/components/ui/IconButton";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { Sheet } from "@/components/ui/Sheet";
import { SearchInput } from "@/components/ui/SearchInput";
import { WorkoutTypeSelect } from "@/components/ui/WorkoutTypeSelect";
import { FormField, UnderlineTextArea } from "@/components/ui/FormField";
import { useGetRoutine, useUpdateRoutine, useDeleteRoutine } from "@/lib/hooks/useRoutines";
import { useGetExercises } from "@/lib/hooks/useExercises";
import { NetworkError } from "@/api/types";
import type { Routine, WorkoutType } from "@/api/types";
import { cn } from "@/lib/utils";
import { ExerciseList } from "../_components/ExerciseList";
import type { ExerciseDraft } from "../_components/ExerciseList";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function RoutineDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const routineName = decodeURIComponent(id);

  const router = useRouter();
  const { data: routine, isLoading, isError } = useGetRoutine(routineName);
  const updateRoutine = useUpdateRoutine();
  const deleteRoutine = useDeleteRoutine();

  const [editMode, setEditMode] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (isLoading) {
    return (
      <AppShell title="Routine">
        <div className="space-y-3 px-6 pt-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-4 animate-pulse rounded bg-gray-100" />
          ))}
        </div>
      </AppShell>
    );
  }

  if (isError || !routine) {
    return (
      <AppShell
        title="Routine"
        leftSlot={
          <IconButton label="Back" onClick={() => router.back()}>
            <span className="font-body text-[20px] font-light text-ink">←</span>
          </IconButton>
        }
      >
        <ErrorBanner
          message="Routine not found or could not be loaded."
          onRetry={() => router.back()}
        />
      </AppShell>
    );
  }

  if (editMode) {
    return (
      <EditView
        routine={routine}
        updateRoutine={updateRoutine}
        deleteRoutine={deleteRoutine}
        showDeleteConfirm={showDeleteConfirm}
        setShowDeleteConfirm={setShowDeleteConfirm}
        onCancel={() => setEditMode(false)}
        onSaved={() => {
          setEditMode(false);
        }}
        onDeleted={() => router.push("/routines")}
      />
    );
  }

  return (
    <AppShell
      title={routine.name}
      leftSlot={
        <IconButton label="Back" onClick={() => router.back()}>
          <span className="font-body text-[20px] font-light text-ink">←</span>
        </IconButton>
      }
      rightSlot={
        <IconButton label="Edit routine" onClick={() => setEditMode(true)}>
          <span className="font-body text-[16px] text-ink">✎</span>
        </IconButton>
      }
      bottomSticky={
        <Button
          variant="primary"
          fullWidth
          onClick={() =>
            router.push(`/workouts/new?routineName=${encodeURIComponent(routine.name)}`)
          }
        >
          Start Workout
        </Button>
      }
    >
      <div className="px-6 pt-6 pb-8">
        <div className="mb-6 flex items-center gap-3">
          <Badge type={routine.workout_type} />
          <span className="font-body text-[12px] text-gray-500">
            {routine.routine_exercises.length}{" "}
            {routine.routine_exercises.length === 1 ? "exercise" : "exercises"}
          </span>
        </div>

        {routine.notes && (
          <p className="mb-6 font-body text-[14px] text-gray-600">{routine.notes}</p>
        )}

        {routine.routine_exercises.length === 0 && (
          <p className="font-body text-[13px] text-gray-400">
            No exercises in this routine. Tap ✎ to edit.
          </p>
        )}

        <div className="space-y-4">
          {routine.routine_exercises.map((ex) => (
            <div key={ex.name} className="rounded border border-border">
              <div className="border-b border-border px-4 py-3">
                <span className="font-body text-[14px] font-medium text-ink">{ex.name}</span>
              </div>
              <div className="px-4 py-3">
                {ex.planned_sets.length === 0 && (
                  <p className="font-body text-[12px] text-gray-400">No planned sets.</p>
                )}
                <div className="space-y-1">
                  {ex.planned_sets.map((set, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <span className="w-5 flex-shrink-0 font-body text-[11px] text-gray-400 text-right">
                        {idx + 1}
                      </span>
                      <span className="font-body text-[13px] text-ink">
                        {formatSet(set)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}

function formatSet(set: Routine["routine_exercises"][number]["planned_sets"][number]): string {
  const parts: string[] = [];
  if (set.planned_weight != null) parts.push(`${set.planned_weight} lb`);
  if (set.planned_reps != null) parts.push(`${set.planned_reps} reps`);
  if (set.planned_durations_in_seconds != null) parts.push(`${set.planned_durations_in_seconds}s`);
  return parts.length ? parts.join(" · ") : "—";
}

// ── Edit mode ────────────────────────────────────────────────────────────────

interface EditViewProps {
  routine: Routine;
  updateRoutine: ReturnType<typeof useUpdateRoutine>;
  deleteRoutine: ReturnType<typeof useDeleteRoutine>;
  showDeleteConfirm: boolean;
  setShowDeleteConfirm: (v: boolean) => void;
  onCancel: () => void;
  onSaved: () => void;
  onDeleted: () => void;
}

function EditView({
  routine,
  updateRoutine,
  deleteRoutine,
  showDeleteConfirm,
  setShowDeleteConfirm,
  onCancel,
  onSaved,
  onDeleted,
}: EditViewProps) {
  const { data: allExercises } = useGetExercises();
  const [workoutType, setWorkoutType] = useState<WorkoutType | "">(routine.workout_type);
  const [workoutTypeError, setWorkoutTypeError] = useState("");
  const [notes, setNotes] = useState(routine.notes);
  const [exercises, setExercises] = useState<ExerciseDraft[]>(
    routine.routine_exercises.map((ex) => ({
      name: ex.name,
      sets: ex.planned_sets.map((s) => ({
        weight: s.planned_weight != null ? String(s.planned_weight) : "",
        reps: s.planned_reps != null ? String(s.planned_reps) : "",
        duration: s.planned_durations_in_seconds != null ? String(s.planned_durations_in_seconds) : "",
      })),
    })),
  );
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerSearch, setPickerSearch] = useState("");
  const [saveError, setSaveError] = useState("");

  const addedNames = new Set(exercises.map((e) => e.name));
  const availableExercises = (allExercises ?? []).filter((e) =>
    e.name.toLowerCase().includes(pickerSearch.toLowerCase()),
  );

  function addExercise(name: string) {
    if (addedNames.has(name)) return;
    setExercises((prev) => [...prev, { name, sets: [] }]);
    setPickerOpen(false);
    setPickerSearch("");
  }

  async function onSave() {
    if (!workoutType) {
      setWorkoutTypeError("Workout type is required.");
      return;
    }
    setWorkoutTypeError("");
    setSaveError("");

    try {
      await updateRoutine.mutateAsync({
        name: routine.name,
        notes,
        workout_type: workoutType,
        routine_exercises: exercises.map((ex) => ({
          name: ex.name,
          planned_sets: ex.sets.map((s) => ({
            planned_weight: s.weight ? parseInt(s.weight) : null,
            planned_reps: s.reps ? parseInt(s.reps) : null,
            planned_durations_in_seconds: s.duration ? parseInt(s.duration) : null,
          })),
        })),
      });
      onSaved();
    } catch (err) {
      if (err instanceof NetworkError) {
        setSaveError("Network error. Please try again.");
      } else {
        setSaveError("Could not save changes.");
      }
    }
  }

  async function onDelete() {
    try {
      await deleteRoutine.mutateAsync(routine.name);
      onDeleted();
    } catch {
      setShowDeleteConfirm(false);
    }
  }

  return (
    <>
      <AppShell
        title={routine.name}
        leftSlot={
          <IconButton label="Cancel" onClick={onCancel}>
            <span className="font-body text-[14px] text-gray-500">Cancel</span>
          </IconButton>
        }
        bottomSticky={
          <div>
            <Button
              variant="primary"
              fullWidth
              disabled={updateRoutine.isPending}
              onClick={onSave}
            >
              {updateRoutine.isPending ? "Saving…" : "Save Changes"}
            </Button>
            {!showDeleteConfirm ? (
              <Button
                variant="destructive"
                fullWidth
                onClick={() => setShowDeleteConfirm(true)}
              >
                Delete Routine
              </Button>
            ) : (
              <div className="mt-2 flex gap-3">
                <Button
                  variant="destructive"
                  fullWidth
                  disabled={deleteRoutine.isPending}
                  onClick={onDelete}
                >
                  {deleteRoutine.isPending ? "Deleting…" : "Confirm Delete"}
                </Button>
                <Button
                  variant="destructive"
                  fullWidth
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  Cancel
                </Button>
              </div>
            )}
          </div>
        }
      >
        <div className="px-6 pt-8 pb-4">
          {saveError && (
            <ErrorBanner className="mb-6 mx-0" message={saveError} />
          )}

          {/* Name is read-only — PUT /routine/ matches by name */}
          <div className="mb-9">
            <p className="mb-[10px] font-body text-[10px] font-medium tracking-[0.2em] uppercase text-accent opacity-70">
              Routine Name
            </p>
            <p className="font-body text-[16px] text-gray-500 border-b border-border-dark pb-3">
              {routine.name}
            </p>
          </div>

          <FormField label="Workout Type" error={workoutTypeError}>
            <WorkoutTypeSelect
              value={workoutType}
              onChange={(t) => {
                setWorkoutType(t);
                setWorkoutTypeError("");
              }}
            />
          </FormField>

          <FormField label="Notes" className="mb-4">
            <UnderlineTextArea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional notes…"
              rows={2}
            />
          </FormField>
        </div>

        <div className="px-6 pb-8">
          <p className="mb-3 font-body text-[10px] font-medium tracking-[0.2em] uppercase text-accent opacity-70">
            Exercises
          </p>

          <ExerciseList exercises={exercises} onChange={setExercises} />

          <button
            type="button"
            onClick={() => setPickerOpen(true)}
            className={cn(
              "mt-3 flex w-full items-center gap-2 rounded border border-dashed border-border",
              "px-4 py-3 font-body text-[13px] text-gray-500 cursor-pointer",
              "hover:border-accent hover:text-accent transition-colors",
            )}
          >
            <span className="text-[18px] leading-none">+</span>
            Add Exercise
          </button>
        </div>
      </AppShell>

      <Sheet
        isOpen={pickerOpen}
        onClose={() => {
          setPickerOpen(false);
          setPickerSearch("");
        }}
        title="Add Exercise"
      >
        <div className="px-4 pt-3 pb-2">
          <SearchInput
            placeholder="Search exercises…"
            value={pickerSearch}
            onChange={(e) => setPickerSearch(e.target.value)}
          />
        </div>
        <div>
          {availableExercises.length === 0 && (
            <p className="px-6 py-8 text-center font-body text-[13px] text-gray-400">
              No exercises found.
            </p>
          )}
          {availableExercises.map((exercise) => {
            const already = addedNames.has(exercise.name);
            return (
              <button
                key={exercise.name}
                type="button"
                disabled={already}
                onClick={() => addExercise(exercise.name)}
                className={cn(
                  "flex w-full items-center justify-between border-b border-border px-6 py-4",
                  "font-body text-[15px] cursor-pointer",
                  already ? "text-gray-400 cursor-default" : "text-ink hover:bg-gray-50",
                )}
              >
                {exercise.name}
                {already && (
                  <span className="font-body text-[11px] tracking-[0.1em] uppercase text-accent">
                    Added
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </Sheet>
    </>
  );
}
