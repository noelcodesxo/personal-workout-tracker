"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AppShell } from "@/components/layout/AppShell";
import { IconButton } from "@/components/ui/IconButton";
import { FormField, UnderlineInput, UnderlineTextArea } from "@/components/ui/FormField";
import { WorkoutTypeSelect } from "@/components/ui/WorkoutTypeSelect";
import { Button } from "@/components/ui/Button";
import { Sheet } from "@/components/ui/Sheet";
import { SearchInput } from "@/components/ui/SearchInput";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { useCreateRoutine } from "@/lib/hooks/useRoutines";
import { useGetExercises } from "@/lib/hooks/useExercises";
import { NetworkError } from "@/api/types";
import type { WorkoutType } from "@/api/types";
import { cn } from "@/lib/utils";
import { ExerciseList } from "../_components/ExerciseList";
import type { ExerciseDraft } from "../_components/ExerciseList";

const schema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  notes: z.string().max(500).optional(),
});
type FormValues = z.infer<typeof schema>;

export default function NewRoutinePage() {
  const router = useRouter();
  const createRoutine = useCreateRoutine();
  const { data: allExercises } = useGetExercises();

  const [workoutType, setWorkoutType] = useState<WorkoutType | "">("");
  const [workoutTypeError, setWorkoutTypeError] = useState("");
  const [exercises, setExercises] = useState<ExerciseDraft[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerSearch, setPickerSearch] = useState("");

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const availableExercises = (allExercises ?? []).filter((e) =>
    e.name.toLowerCase().includes(pickerSearch.toLowerCase()),
  );
  const addedNames = new Set(exercises.map((e) => e.name));

  function addExercise(name: string) {
    if (addedNames.has(name)) return;
    setExercises((prev) => [...prev, { name, sets: [] }]);
    setPickerOpen(false);
    setPickerSearch("");
  }

  async function onSubmit(values: FormValues) {
    if (!workoutType) {
      setWorkoutTypeError("Workout type is required.");
      return;
    }
    setWorkoutTypeError("");

    try {
      await createRoutine.mutateAsync({
        name: values.name,
        notes: values.notes ?? "",
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
      router.push("/routines");
    } catch (err) {
      if (err instanceof NetworkError) return;
      setError("name", { message: "Could not save. The name may already be taken." });
    }
  }

  const isNetworkError = createRoutine.error instanceof NetworkError;

  return (
    <>
      <AppShell
        title="New Routine"
        leftSlot={
          <IconButton label="Back" onClick={() => router.back()}>
            <span className="font-body text-[20px] font-light text-ink">←</span>
          </IconButton>
        }
        bottomSticky={
          <Button
            variant="primary"
            fullWidth
            disabled={isSubmitting}
            onClick={handleSubmit(onSubmit)}
          >
            {isSubmitting ? "Saving…" : "Create Routine"}
          </Button>
        }
      >
        <div className="px-6 pt-8 pb-4">
          {isNetworkError && (
            <ErrorBanner
              className="mb-6 mx-0"
              message="Network error. Check your connection and try again."
              onRetry={() => createRoutine.reset()}
            />
          )}

          <FormField label="Routine Name" error={errors.name?.message}>
            <UnderlineInput
              {...register("name")}
              placeholder="e.g. Push Day A"
              autoFocus
              hasError={!!errors.name}
            />
          </FormField>

          <FormField label="Workout Type" error={workoutTypeError}>
            <WorkoutTypeSelect
              value={workoutType}
              onChange={(t) => {
                setWorkoutType(t);
                setWorkoutTypeError("");
              }}
              error={undefined}
            />
          </FormField>

          <FormField label="Notes" className="mb-4">
            <UnderlineTextArea
              {...register("notes")}
              placeholder="Optional notes…"
              rows={2}
            />
          </FormField>
        </div>

        <div className="px-6 pb-8">
          <SectionHeader title="Exercises" />

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
