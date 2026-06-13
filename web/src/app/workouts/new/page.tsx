"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { IconButton } from "@/components/ui/IconButton";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { FormField } from "@/components/ui/FormField";
import { WorkoutTypeSelect } from "@/components/ui/WorkoutTypeSelect";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { useCreateWorkout } from "@/lib/hooks/useWorkouts";
import { useGetRoutine } from "@/lib/hooks/useRoutines";
import { env } from "@/config/env";
import { NetworkError } from "@/api/types";
import type { WorkoutType } from "@/api/types";

export default function NewWorkoutPage() {
  return (
    <Suspense fallback={<NewWorkoutFallback />}>
      <NewWorkoutContent />
    </Suspense>
  );
}

function NewWorkoutFallback() {
  return (
    <AppShell title="Start Workout">
      <div className="space-y-3 px-6 pt-8">
        {[1, 2].map((i) => (
          <div key={i} className="h-4 animate-pulse rounded bg-gray-100" />
        ))}
      </div>
    </AppShell>
  );
}

function NewWorkoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const routineName = searchParams.get("routineName") ?? "";

  return routineName ? (
    <FromRoutinePage routineName={routineName} router={router} />
  ) : (
    <FreestylePage router={router} />
  );
}

// ── From-routine flow ─────────────────────────────────────────────────────────

function FromRoutinePage({
  routineName,
  router,
}: {
  routineName: string;
  router: ReturnType<typeof useRouter>;
}) {
  const createWorkout = useCreateWorkout();
  const { data: routine, isLoading, isError } = useGetRoutine(routineName);
  const [error, setError] = useState("");

  async function onStart() {
    if (!routine) return;
    setError("");
    try {
      const workout = await createWorkout.mutateAsync({
        workout_type: routine.workout_type,
        user_id: parseInt(env.NEXT_PUBLIC_USER_ID, 10),
      });
      router.push(`/workouts/${workout.id}?routineName=${encodeURIComponent(routineName)}`);
    } catch (err) {
      setError(err instanceof NetworkError ? "Network error. Try again." : "Could not start workout.");
    }
  }

  if (isLoading) {
    return (
      <AppShell title="Start Workout" leftSlot={<BackButton router={router} />}>
        <div className="space-y-3 px-6 pt-8">
          {[1, 2].map((i) => <div key={i} className="h-4 animate-pulse rounded bg-gray-100" />)}
        </div>
      </AppShell>
    );
  }

  if (isError || !routine) {
    return (
      <AppShell title="Start Workout" leftSlot={<BackButton router={router} />}>
        <ErrorBanner message="Routine not found." onRetry={() => router.back()} />
      </AppShell>
    );
  }

  return (
    <AppShell
      title="Start Workout"
      leftSlot={<BackButton router={router} />}
      bottomSticky={
        <Button variant="primary" fullWidth disabled={createWorkout.isPending} onClick={onStart}>
          {createWorkout.isPending ? "Starting…" : "Start Workout"}
        </Button>
      }
    >
      <div className="px-6 pt-8 pb-8">
        {error && <ErrorBanner className="mb-6 mx-0" message={error} />}

        <div className="rounded border border-border bg-surface p-5">
          <div className="mb-3 flex items-center gap-3">
            <Badge type={routine.workout_type} />
            <span className="font-body text-[12px] text-gray-500">
              {routine.routine_exercises.length}{" "}
              {routine.routine_exercises.length === 1 ? "exercise" : "exercises"}
            </span>
          </div>
          <p className="font-display text-[20px] font-semibold text-ink">{routine.name}</p>
          {routine.notes && (
            <p className="mt-2 font-body text-[13px] text-gray-500">{routine.notes}</p>
          )}
        </div>

        <p className="mt-6 font-body text-[13px] text-gray-400">
          Exercises and planned sets will be pre-loaded into your session.
        </p>
      </div>
    </AppShell>
  );
}

// ── Freestyle flow ────────────────────────────────────────────────────────────

function FreestylePage({ router }: { router: ReturnType<typeof useRouter> }) {
  const createWorkout = useCreateWorkout();
  const [workoutType, setWorkoutType] = useState<WorkoutType | "">("");
  const [workoutTypeError, setWorkoutTypeError] = useState("");
  const [error, setError] = useState("");

  async function onStart() {
    if (!workoutType) {
      setWorkoutTypeError("Workout type is required.");
      return;
    }
    setWorkoutTypeError("");
    setError("");
    try {
      const workout = await createWorkout.mutateAsync({
        workout_type: workoutType,
        user_id: parseInt(env.NEXT_PUBLIC_USER_ID, 10),
      });
      router.push(`/workouts/${workout.id}`);
    } catch (err) {
      setError(err instanceof NetworkError ? "Network error. Try again." : "Could not start workout.");
    }
  }

  return (
    <AppShell
      title="Start Workout"
      leftSlot={<BackButton router={router} />}
      bottomSticky={
        <Button variant="primary" fullWidth disabled={createWorkout.isPending} onClick={onStart}>
          {createWorkout.isPending ? "Starting…" : "Start Workout"}
        </Button>
      }
    >
      <div className="px-6 pt-8">
        {error && <ErrorBanner className="mb-6 mx-0" message={error} />}

        <FormField label="Workout Type" error={workoutTypeError}>
          <WorkoutTypeSelect
            value={workoutType}
            onChange={(t) => {
              setWorkoutType(t);
              setWorkoutTypeError("");
            }}
          />
        </FormField>
      </div>
    </AppShell>
  );
}

function BackButton({ router }: { router: ReturnType<typeof useRouter> }) {
  return (
    <IconButton label="Back" onClick={() => router.back()}>
      <span className="font-body text-[20px] font-light text-ink">←</span>
    </IconButton>
  );
}
