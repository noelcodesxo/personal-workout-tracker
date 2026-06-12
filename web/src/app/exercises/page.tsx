"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { IconButton } from "@/components/ui/IconButton";
import { SearchInput } from "@/components/ui/SearchInput";
import { ListRow } from "@/components/ui/ListRow";
import { EmptyState } from "@/components/ui/EmptyState";
import { ListRowSkeleton } from "@/components/ui/LoadingSkeleton";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { Button } from "@/components/ui/Button";
import { useGetExercises } from "@/lib/hooks/useExercises";

export default function ExercisesPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const { data: exercises, isLoading, isError, refetch } = useGetExercises();

  const filtered = exercises?.filter((e) =>
    e.name.toLowerCase().includes(search.toLowerCase()),
  ) ?? [];

  return (
    <AppShell
      title="Exercises"
      rightSlot={
        <IconButton label="Add exercise" onClick={() => router.push("/exercises/new")}>
          <span className="font-body text-[22px] font-light leading-none text-accent">+</span>
        </IconButton>
      }
    >
      <SearchInput
        placeholder="Search exercises…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {isError && (
        <ErrorBanner message="Could not load exercises." onRetry={() => refetch()} />
      )}

      {isLoading && <ListRowSkeleton count={7} />}

      {!isLoading && !isError && exercises?.length === 0 && (
        <EmptyState
          title="No exercises yet"
          description="Add your first exercise to start building routines."
          action={
            <Button variant="primary" fullWidth onClick={() => router.push("/exercises/new")}>
              Add Exercise
            </Button>
          }
        />
      )}

      {!isLoading && !isError && exercises && exercises.length > 0 && filtered.length === 0 && (
        <EmptyState title="No matches" description={`Nothing matches "${search}".`} />
      )}

      {!isLoading && filtered.map((exercise) => (
        <ListRow
          key={exercise.name}
          arrow
          className="cursor-pointer"
          onClick={() => router.push(`/exercises/${encodeURIComponent(exercise.name)}`)}
        >
          <span className="font-body text-[15px] font-medium tracking-[-0.01em] text-ink">
            {exercise.name}
          </span>
        </ListRow>
      ))}
    </AppShell>
  );
}
