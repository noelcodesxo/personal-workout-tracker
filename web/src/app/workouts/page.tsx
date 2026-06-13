"use client";

import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { ListRowSkeleton } from "@/components/ui/LoadingSkeleton";
import { useGetWorkouts } from "@/lib/hooks/useWorkouts";
import type { Workout } from "@/api/types";

export default function WorkoutsPage() {
  const { data: workouts, isLoading, isError, refetch } = useGetWorkouts();

  return (
    <AppShell
      title="Workouts"
      bottomSticky={
        <Link href="/workouts/new">
          <Button variant="primary" fullWidth>
            Start a Workout
          </Button>
        </Link>
      }
    >
      {isLoading && <ListRowSkeleton count={4} />}

      {isError && (
        <ErrorBanner message="Could not load workouts." onRetry={() => refetch()} />
      )}

      {!isLoading && !isError && workouts?.length === 0 && (
        <EmptyState
          title="No workouts yet"
          description="Start tracking your training. Every session counts."
          action={
            <Link href="/workouts/new">
              <Button variant="primary" fullWidth>
                Start a Workout
              </Button>
            </Link>
          }
        />
      )}

      {!isLoading && !isError && workouts && workouts.length > 0 && (
        <div className="divide-y divide-border">
          {[...workouts]
            .sort(
              (a, b) =>
                new Date(b.workout_start_time).getTime() -
                new Date(a.workout_start_time).getTime(),
            )
            .map((workout) => (
              <WorkoutRow key={workout.id} workout={workout} />
            ))}
        </div>
      )}
    </AppShell>
  );
}

function WorkoutRow({ workout }: { workout: Workout }) {
  const isActive = workout.workout_end_time === null;
  const date = new Date(workout.workout_start_time);
  const durationSec = workout.workout_end_time
    ? Math.floor((new Date(workout.workout_end_time).getTime() - date.getTime()) / 1000)
    : null;
  const setCount = workout.exercise_entries.reduce(
    (sum, e) => sum + e.completed_sets.length,
    0,
  );

  return (
    <Link href={`/workouts/${workout.id}`} className="block">
      <div className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors">
        <div className="flex-1 min-w-0">
          <div className="mb-1 flex items-center gap-2">
            <Badge type={workout.workout_type} />
            {isActive && (
              <span className="font-body text-[11px] uppercase tracking-[0.1em] text-accent">
                Active
              </span>
            )}
          </div>
          <p className="font-body text-[12px] text-gray-400">
            {date.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}
            {durationSec !== null && ` · ${formatDuration(durationSec)}`}
            {setCount > 0 && ` · ${setCount} set${setCount === 1 ? "" : "s"}`}
          </p>
        </div>
        <span className="text-gray-400 font-body text-[18px]">›</span>
      </div>
    </Link>
  );
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}
