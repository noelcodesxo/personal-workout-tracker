"use client";

import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { IconButton } from "@/components/ui/IconButton";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { CardSkeleton } from "@/components/ui/LoadingSkeleton";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { Button } from "@/components/ui/Button";
import { useGetRoutines } from "@/lib/hooks/useRoutines";

export default function RoutinesPage() {
  const router = useRouter();
  const { data: routines, isLoading, isError, refetch } = useGetRoutines();

  return (
    <AppShell
      title="Routines"
      rightSlot={
        <IconButton label="Add routine" onClick={() => router.push("/routines/new")}>
          <span className="font-body text-[22px] font-light leading-none text-accent">+</span>
        </IconButton>
      }
    >
      {isError && (
        <ErrorBanner message="Could not load routines." onRetry={() => refetch()} />
      )}

      {isLoading && <CardSkeleton count={4} />}

      {!isLoading && !isError && routines?.length === 0 && (
        <EmptyState
          title="No routines yet"
          description="Build a routine to plan your exercises and sets."
          action={
            <Button variant="primary" fullWidth onClick={() => router.push("/routines/new")}>
              Create Routine
            </Button>
          }
        />
      )}

      {!isLoading && !isError && routines && routines.length > 0 && (
        <div className="space-y-3 px-6 pt-5 pb-8">
          {routines.map((routine) => (
            <Card
              key={routine.name}
              cornerAccent
              className="cursor-pointer p-5 active:opacity-70"
              onClick={() =>
                router.push(`/routines/${encodeURIComponent(routine.name)}`)
              }
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="font-display text-[18px] font-semibold tracking-[0.02em] text-ink truncate">
                    {routine.name}
                  </p>
                  <div className="mt-2 flex items-center gap-3">
                    <Badge type={routine.workout_type} />
                    <span className="font-body text-[12px] text-gray-500">
                      {routine.routine_exercises.length}{" "}
                      {routine.routine_exercises.length === 1 ? "exercise" : "exercises"}
                    </span>
                  </div>
                  {routine.notes && (
                    <p className="mt-2 font-body text-[12px] text-gray-500 line-clamp-1">
                      {routine.notes}
                    </p>
                  )}
                </div>
                <span className="font-body text-[18px] font-light text-gray-400 flex-shrink-0">
                  →
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </AppShell>
  );
}
