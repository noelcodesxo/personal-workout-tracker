"use client";

import { Suspense, use, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { IconButton } from "@/components/ui/IconButton";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Sheet } from "@/components/ui/Sheet";
import { SearchInput } from "@/components/ui/SearchInput";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { useGetWorkout, useLogWorkout, useDeleteWorkout } from "@/lib/hooks/useWorkouts";
import { useGetRoutine } from "@/lib/hooks/useRoutines";
import { useGetExercises } from "@/lib/hooks/useExercises";
import { NetworkError } from "@/api/types";
import { cn } from "@/lib/utils";
import {
  ActiveExerciseList,
  emptySet,
  type ExerciseDraft,
} from "../_components/ActiveExerciseList";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function WorkoutDetailPage({ params }: PageProps) {
  return (
    <Suspense fallback={<WorkoutDetailFallback />}>
      <WorkoutDetailContent params={params} />
    </Suspense>
  );
}

function WorkoutDetailFallback() {
  return (
    <AppShell title="Workout">
      <div className="space-y-3 px-6 pt-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-4 animate-pulse rounded bg-gray-100" />
        ))}
      </div>
    </AppShell>
  );
}

function WorkoutDetailContent({ params }: PageProps) {
  const { id } = use(params);
  const workoutId = parseInt(id, 10);
  const router = useRouter();
  const searchParams = useSearchParams();
  const routineName = searchParams.get("routineName") ?? "";

  const { data: workout, isLoading, isError } = useGetWorkout(workoutId);
  const { data: routine } = useGetRoutine(routineName);

  const isActive = !!workout && workout.workout_end_time === null;

  if (isLoading) {
    return (
      <AppShell title="Workout">
        <div className="space-y-3 px-6 pt-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-4 animate-pulse rounded bg-gray-100" />
          ))}
        </div>
      </AppShell>
    );
  }

  if (isError || !workout) {
    return (
      <AppShell
        title="Workout"
        leftSlot={
          <IconButton label="Back" onClick={() => router.back()}>
            <span className="font-body text-[20px] font-light text-ink">←</span>
          </IconButton>
        }
      >
        <ErrorBanner message="Workout not found." onRetry={() => router.back()} />
      </AppShell>
    );
  }

  if (isActive) {
    return (
      <ActiveSession
        workoutId={workout.id}
        workoutType={workout.workout_type}
        startTime={workout.workout_start_time}
        routineName={routineName}
        initialExercises={
          routine
            ? routine.routine_exercises.map((ex) => ({
                name: ex.name,
                sets: ex.planned_sets.map((ps) => ({
                  weight: ps.planned_weight != null ? String(ps.planned_weight) : "",
                  reps: ps.planned_reps != null ? String(ps.planned_reps) : "",
                  duration:
                    ps.planned_durations_in_seconds != null
                      ? String(ps.planned_durations_in_seconds)
                      : "",
                  notes: "",
                  checked: false,
                })),
              }))
            : []
        }
        router={router}
      />
    );
  }

  return <FinishedView workout={workout} router={router} />;
}

// ── Active session ────────────────────────────────────────────────────────────

interface ActiveSessionProps {
  workoutId: number;
  workoutType: string;
  startTime: string;
  routineName: string;
  initialExercises: ExerciseDraft[];
  router: ReturnType<typeof useRouter>;
}

function ActiveSession({
  workoutId,
  workoutType,
  startTime,
  routineName,
  initialExercises,
  router,
}: ActiveSessionProps) {
  const logWorkout = useLogWorkout();
  const deleteWorkout = useDeleteWorkout();
  const { data: allExercises } = useGetExercises();

  const [exercises, setExercises] = useState<ExerciseDraft[]>(initialExercises);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerSearch, setPickerSearch] = useState("");
  const [error, setError] = useState("");
  const [showAbandon, setShowAbandon] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  const initialised = useRef(false);
  useEffect(() => {
    if (initialised.current) return;
    initialised.current = true;
    const start = new Date(startTime).getTime();
    setElapsed(Math.floor((Date.now() - start) / 1000));
    const id = setInterval(() => {
      setElapsed(Math.floor((Date.now() - start) / 1000));
    }, 1000);
    return () => clearInterval(id);
  }, [startTime]);

  const addedNames = new Set(exercises.map((e) => e.name));
  const availableExercises = (allExercises ?? []).filter((e) =>
    e.name.toLowerCase().includes(pickerSearch.toLowerCase()),
  );

  function addExercise(name: string) {
    if (addedNames.has(name)) return;
    setExercises((prev) => [...prev, { name, sets: [emptySet()] }]);
    setPickerOpen(false);
    setPickerSearch("");
  }

  async function onFinish() {
    setError("");
    try {
      await logWorkout.mutateAsync({
        id: workoutId,
        data: {
          exercise_entries: exercises.map((ex) => ({
            name: ex.name,
            completed_sets: ex.sets.map((s) => ({
              weight_in_lbs: parseInt(s.weight) || 0,
              rep_count: parseInt(s.reps) || 0,
              duration_in_seconds: parseInt(s.duration) || 0,
              notes: s.notes,
            })),
          })),
        },
      });
      router.push("/workouts");
    } catch (err) {
      setError(
        err instanceof NetworkError ? "Network error. Try again." : "Could not finish workout.",
      );
    }
  }

  async function onAbandon() {
    try {
      await deleteWorkout.mutateAsync(workoutId);
      router.push("/");
    } catch {
      setShowAbandon(false);
    }
  }

  return (
    <>
      <AppShell
        title="Active Workout"
        leftSlot={
          <IconButton label="Abandon" onClick={() => setShowAbandon(true)}>
            <span className="font-body text-[14px] text-gray-500">Abandon</span>
          </IconButton>
        }
        bottomSticky={
          <div>
            {error && <ErrorBanner className="mb-3 mx-0" message={error} />}
            <Button
              variant="primary"
              fullWidth
              disabled={logWorkout.isPending}
              onClick={onFinish}
            >
              {logWorkout.isPending ? "Finishing…" : "Finish Workout"}
            </Button>
          </div>
        }
      >
        <div className="px-6 pt-6 pb-8">
          {/* header: type badge + timer */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Badge type={workoutType as never} />
              {routineName && (
                <span className="font-body text-[12px] text-gray-500">{routineName}</span>
              )}
            </div>
            <span className="font-mono text-[18px] font-medium text-ink tabular-nums">
              {formatElapsed(elapsed)}
            </span>
          </div>

          <ActiveExerciseList exercises={exercises} onChange={setExercises} />

          <button
            type="button"
            onClick={() => setPickerOpen(true)}
            className={cn(
              "mt-4 flex w-full items-center gap-2 rounded border border-dashed border-border",
              "px-4 py-3 font-body text-[13px] text-gray-500 cursor-pointer",
              "hover:border-accent hover:text-accent transition-colors",
            )}
          >
            <span className="text-[18px] leading-none">+</span>
            Add Exercise
          </button>
        </div>
      </AppShell>

      {/* Exercise picker sheet */}
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

      {/* Abandon confirm sheet */}
      <Sheet isOpen={showAbandon} onClose={() => setShowAbandon(false)} title="Abandon Workout?">
        <div className="px-6 py-6">
          <p className="mb-6 font-body text-[14px] text-gray-600">
            This will delete the workout session. All logged sets will be lost.
          </p>
          <Button
            variant="destructive"
            fullWidth
            disabled={deleteWorkout.isPending}
            onClick={onAbandon}
          >
            {deleteWorkout.isPending ? "Abandoning…" : "Yes, Abandon"}
          </Button>
          <Button variant="primary" fullWidth onClick={() => setShowAbandon(false)}>
            Keep Going
          </Button>
        </div>
      </Sheet>
    </>
  );
}

// ── Finished view (read-only + edit mode) ────────────────────────────────────

import type { Workout } from "@/api/types";

interface FinishedViewProps {
  workout: Workout;
  router: ReturnType<typeof useRouter>;
}

function FinishedView({ workout, router }: FinishedViewProps) {
  const [editMode, setEditMode] = useState(false);

  if (editMode) {
    return (
      <EditView
        workout={workout}
        onCancel={() => setEditMode(false)}
        onSaved={() => setEditMode(false)}
      />
    );
  }

  return <ReadView workout={workout} onEdit={() => setEditMode(true)} router={router} />;
}

// ── Read view ─────────────────────────────────────────────────────────────────

function ReadView({
  workout,
  onEdit,
  router,
}: {
  workout: Workout;
  onEdit: () => void;
  router: ReturnType<typeof useRouter>;
}) {
  const deleteWorkout = useDeleteWorkout();
  const [showDelete, setShowDelete] = useState(false);

  const durationSec = workout.workout_end_time
    ? Math.floor(
        (new Date(workout.workout_end_time).getTime() -
          new Date(workout.workout_start_time).getTime()) /
          1000,
      )
    : 0;

  async function onDelete() {
    try {
      await deleteWorkout.mutateAsync(workout.id);
      router.push("/workouts");
    } catch {
      setShowDelete(false);
    }
  }

  return (
    <>
      <AppShell
        title="Workout"
        leftSlot={
          <IconButton label="Back" onClick={() => router.back()}>
            <span className="font-body text-[20px] font-light text-ink">←</span>
          </IconButton>
        }
        rightSlot={
          <IconButton label="Edit workout" onClick={onEdit}>
            <span className="font-body text-[16px] text-ink">✎</span>
          </IconButton>
        }
      >
        <div className="px-6 pt-6 pb-8">
          <div className="mb-6 flex items-center gap-3">
            <Badge type={workout.workout_type} />
            <span className="font-body text-[13px] text-gray-500">
              {formatElapsed(durationSec)}
            </span>
            <span className="font-body text-[12px] text-gray-400">
              {new Date(workout.workout_start_time).toLocaleDateString(undefined, {
                weekday: "short",
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>

          {workout.exercise_entries.length === 0 && (
            <p className="font-body text-[13px] text-gray-400">No exercises logged.</p>
          )}

          <div className="space-y-4">
            {workout.exercise_entries.map((entry) => (
              <div key={entry.name} className="rounded border border-border">
                <div className="border-b border-border px-4 py-3">
                  <span className="font-body text-[14px] font-medium text-ink">{entry.name}</span>
                </div>
                <div className="px-4 py-3">
                  {entry.completed_sets.length === 0 && (
                    <p className="font-body text-[12px] text-gray-400">No sets logged.</p>
                  )}
                  <div className="space-y-2">
                    {entry.completed_sets.map((set, idx) => (
                      <div key={idx}>
                        <div className="flex items-center gap-2">
                          <span className="w-5 flex-shrink-0 font-body text-[11px] text-gray-400 text-right">
                            {idx + 1}
                          </span>
                          <span className="font-body text-[13px] text-ink">
                            {formatCompletedSet(set)}
                          </span>
                        </div>
                        {set.notes && (
                          <p className="mt-0.5 pl-7 font-body text-[12px] text-gray-500">
                            {set.notes}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8">
            <Button variant="destructive" fullWidth onClick={() => setShowDelete(true)}>
              Delete Workout
            </Button>
          </div>
        </div>
      </AppShell>

      <Sheet isOpen={showDelete} onClose={() => setShowDelete(false)} title="Delete Workout?">
        <div className="px-6 py-6">
          <p className="mb-6 font-body text-[14px] text-gray-600">
            This will permanently remove this workout from your history.
          </p>
          <Button
            variant="destructive"
            fullWidth
            disabled={deleteWorkout.isPending}
            onClick={onDelete}
          >
            {deleteWorkout.isPending ? "Deleting…" : "Delete Workout"}
          </Button>
          <Button variant="primary" fullWidth onClick={() => setShowDelete(false)}>
            Cancel
          </Button>
        </div>
      </Sheet>
    </>
  );
}

// ── Edit view ─────────────────────────────────────────────────────────────────

function EditView({
  workout,
  onCancel,
  onSaved,
}: {
  workout: Workout;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const logWorkout = useLogWorkout();
  const { data: allExercises } = useGetExercises();

  const [exercises, setExercises] = useState<ExerciseDraft[]>(
    workout.exercise_entries.map((entry) => ({
      name: entry.name,
      sets: entry.completed_sets.map((s) => ({
        weight: s.weight_in_lbs > 0 ? String(s.weight_in_lbs) : "",
        reps: s.rep_count > 0 ? String(s.rep_count) : "",
        duration: s.duration_in_seconds > 0 ? String(s.duration_in_seconds) : "",
        notes: s.notes,
        checked: false,
      })),
    })),
  );
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerSearch, setPickerSearch] = useState("");
  const [error, setError] = useState("");

  const addedNames = new Set(exercises.map((e) => e.name));
  const availableExercises = (allExercises ?? []).filter((e) =>
    e.name.toLowerCase().includes(pickerSearch.toLowerCase()),
  );

  function addExercise(name: string) {
    if (addedNames.has(name)) return;
    setExercises((prev) => [...prev, { name, sets: [emptySet()] }]);
    setPickerOpen(false);
    setPickerSearch("");
  }

  async function onSave() {
    setError("");
    try {
      await logWorkout.mutateAsync({
        id: workout.id,
        data: {
          // Preserve the original end time so it's not re-stamped to now
          workout_end_time: workout.workout_end_time,
          exercise_entries: exercises.map((ex) => ({
            name: ex.name,
            completed_sets: ex.sets.map((s) => ({
              weight_in_lbs: parseInt(s.weight) || 0,
              rep_count: parseInt(s.reps) || 0,
              duration_in_seconds: parseInt(s.duration) || 0,
              notes: s.notes,
            })),
          })),
        },
      });
      onSaved();
    } catch (err) {
      setError(
        err instanceof NetworkError ? "Network error. Try again." : "Could not save changes.",
      );
    }
  }

  return (
    <>
      <AppShell
        title="Edit Workout"
        leftSlot={
          <IconButton label="Cancel" onClick={onCancel}>
            <span className="font-body text-[14px] text-gray-500">Cancel</span>
          </IconButton>
        }
        bottomSticky={
          <div>
            {error && <ErrorBanner className="mb-3 mx-0" message={error} />}
            <Button
              variant="primary"
              fullWidth
              disabled={logWorkout.isPending}
              onClick={onSave}
            >
              {logWorkout.isPending ? "Saving…" : "Save Changes"}
            </Button>
          </div>
        }
      >
        <div className="px-6 pt-6 pb-8">
          <div className="mb-6 flex items-center gap-3">
            <Badge type={workout.workout_type} />
            <span className="font-body text-[12px] text-gray-400">
              {new Date(workout.workout_start_time).toLocaleDateString(undefined, {
                weekday: "short",
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>

          <ActiveExerciseList exercises={exercises} onChange={setExercises} />

          <button
            type="button"
            onClick={() => setPickerOpen(true)}
            className={cn(
              "mt-4 flex w-full items-center gap-2 rounded border border-dashed border-border",
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

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatElapsed(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function formatCompletedSet(set: { weight_in_lbs: number; rep_count: number; duration_in_seconds: number }): string {
  const parts: string[] = [];
  if (set.weight_in_lbs > 0) parts.push(`${set.weight_in_lbs} lb`);
  if (set.rep_count > 0) parts.push(`${set.rep_count} reps`);
  if (set.duration_in_seconds > 0) parts.push(`${set.duration_in_seconds}s`);
  return parts.length ? parts.join(" · ") : "—";
}
