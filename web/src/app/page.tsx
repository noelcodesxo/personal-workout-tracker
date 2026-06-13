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

const RECENT_COUNT = 3;



export default function HomePage() {
  const { data: workouts, isLoading, isError, refetch } = useGetWorkouts();

  const sorted = workouts
    ? [...workouts].sort(
      (a, b) =>
        new Date(b.workout_start_time).getTime() - new Date(a.workout_start_time).getTime(),
    )
    : [];

  const recent = sorted.slice(0, RECENT_COUNT);
  const hasMore = sorted.length > RECENT_COUNT;

  return (
    <AppShell
      appName
      bottomSticky={
        <Link href="/workouts/new">
          <Button variant="primary" fullWidth>
            Start a Workout
          </Button>
        </Link>
      }
    >
      <div className="px-6 pt-8 pb-6">
        <p className="font-display text-[26px] font-semibold text-ink">Hello</p>
        <p className="mt-1 font-body text-[13px] text-gray-400">
          {isLoading
            ? ""
            : sorted.length === 0
              ? "No workouts yet. Let's change that."
              : `${sorted.length} workout${sorted.length === 1 ? "" : "s"} logged`}
        </p>
      </div>

      {isLoading && (
        <div className="px-6">
          <div className="h-3 w-24 animate-pulse rounded bg-gray-100 mb-4" />
          <ListRowSkeleton count={3} />
        </div>
      )}

      {isError && (
        <ErrorBanner message="Could not load workouts." onRetry={() => refetch()} />
      )}

      {!isLoading && !isError && sorted.length === 0 && (
        <div className="px-6">
          <EmptyState
            title="No workouts yet"
            description="Start tracking your training. Every session counts."
          />
        </div>
      )}

      {!isLoading && !isError && recent.length > 0 && (
        <section>
          <div className="flex items-center justify-between px-6 pb-2">
            <p className="font-body text-[10px] font-medium uppercase tracking-[0.2em] text-accent opacity-70">
              Recent
            </p>
            {hasMore && (
              <Link
                href="/workouts"
                className="font-body text-[12px] text-accent hover:opacity-80 transition-opacity"
              >
                View all →
              </Link>
            )}
          </div>
          <div className="divide-y divide-border border-t border-border">
            {recent.map((w) => (
              <HomeWorkoutRow key={w.id} workout={w} />
            ))}
          </div>
          {hasMore && (
            <div className="px-6 pt-4">
              <Link href="/workouts">
                <Button variant="primary" fullWidth>
                  View All Workouts
                </Button>
              </Link>
            </div>
          )}
        </section>
      )}
    </AppShell>
  );
}

function HomeWorkoutRow({ workout }: { workout: Workout }) {
  const isActive = workout.workout_end_time === null;
  const date = new Date(workout.workout_start_time);
  const durationSec = workout.workout_end_time
    ? Math.floor(
      (new Date(workout.workout_end_time).getTime() - date.getTime()) / 1000,
    )
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
