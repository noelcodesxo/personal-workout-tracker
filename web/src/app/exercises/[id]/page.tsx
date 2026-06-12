"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AppShell } from "@/components/layout/AppShell";
import { IconButton } from "@/components/ui/IconButton";
import { FormField, UnderlineInput } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { useGetExercise, useUpdateExercise, useDeleteExercise } from "@/lib/hooks/useExercises";
import { NetworkError } from "@/api/types";

const schema = z.object({
  name: z.string().min(1, "Name is required").max(100),
});
type FormValues = z.infer<typeof schema>;

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ExerciseDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const exerciseName = decodeURIComponent(id);

  const router = useRouter();
  const { data: exercise, isLoading, isError } = useGetExercise(exerciseName);
  const updateExercise = useUpdateExercise();
  const deleteExercise = useDeleteExercise();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: exerciseName },
  });

  // Sync form if exercise data loads (e.g. after cache miss)
  useEffect(() => {
    if (exercise) reset({ name: exercise.name });
  }, [exercise, reset]);

  async function onSave(values: FormValues) {
    if (!isDirty) return;
    try {
      await updateExercise.mutateAsync({ currentName: exerciseName, newName: values.name });
      router.push("/exercises");
    } catch {
      setError("name", { message: "Could not save. The name may already be taken." });
    }
  }

  async function onDelete() {
    try {
      await deleteExercise.mutateAsync(exerciseName);
      router.push("/exercises");
    } catch {
      setShowDeleteConfirm(false);
    }
  }

  const isNetworkError =
    updateExercise.error instanceof NetworkError ||
    deleteExercise.error instanceof NetworkError;

  if (isLoading) {
    return (
      <AppShell title="Exercise">
        <div className="px-6 pt-8">
          <div className="h-4 w-1/2 animate-pulse rounded bg-gray-100" />
        </div>
      </AppShell>
    );
  }

  if (isError || !exercise) {
    return (
      <AppShell
        title="Exercise"
        leftSlot={
          <IconButton label="Back" onClick={() => router.back()}>
            <span className="font-body text-[20px] font-light text-ink">←</span>
          </IconButton>
        }
      >
        <ErrorBanner
          message="Exercise not found or could not be loaded."
          onRetry={() => router.back()}
        />
      </AppShell>
    );
  }

  return (
    <AppShell
      title={exercise.name}
      leftSlot={
        <IconButton label="Back" onClick={() => router.back()}>
          <span className="font-body text-[20px] font-light text-ink">←</span>
        </IconButton>
      }
      bottomSticky={
        <div>
          <Button
            variant="primary"
            fullWidth
            disabled={isSubmitting || !isDirty}
            onClick={handleSubmit(onSave)}
          >
            {isSubmitting ? "Saving…" : "Save Changes"}
          </Button>
          {!showDeleteConfirm ? (
            <Button
              variant="destructive"
              fullWidth
              onClick={() => setShowDeleteConfirm(true)}
            >
              Delete Exercise
            </Button>
          ) : (
            <div className="mt-2 flex gap-3">
              <Button
                variant="destructive"
                fullWidth
                disabled={deleteExercise.isPending}
                onClick={onDelete}
              >
                {deleteExercise.isPending ? "Deleting…" : "Confirm Delete"}
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
      <div className="px-6 pt-8">
        {isNetworkError && (
          <ErrorBanner className="mb-6 mx-0" message="Network error. Please try again." />
        )}

        <FormField label="Exercise Name" error={errors.name?.message}>
          <UnderlineInput
            {...register("name")}
            placeholder="Exercise name"
            hasError={!!errors.name}
          />
        </FormField>
      </div>
    </AppShell>
  );
}
