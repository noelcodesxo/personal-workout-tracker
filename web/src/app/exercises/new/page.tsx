"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AppShell } from "@/components/layout/AppShell";
import { IconButton } from "@/components/ui/IconButton";
import { FormField, UnderlineInput } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { useCreateExercise } from "@/lib/hooks/useExercises";
import { NetworkError } from "@/api/types";

const schema = z.object({
  name: z.string().min(1, "Name is required").max(100),
});
type FormValues = z.infer<typeof schema>;

export default function NewExercisePage() {
  const router = useRouter();
  const createExercise = useCreateExercise();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormValues) {
    const result = await createExercise.mutateAsync(values.name).catch((err) => {
      throw err;
    });

    // The server returns null when the name already exists and is active
    if (!result) {
      setError("name", { message: "An exercise with this name already exists." });
      return;
    }

    router.push("/exercises");
  }

  const isNetworkError = createExercise.error instanceof NetworkError;

  return (
    <AppShell
      title="New Exercise"
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
          {isSubmitting ? "Saving…" : "Save Exercise"}
        </Button>
      }
    >
      <div className="px-6 pt-8">
        {isNetworkError && (
          <ErrorBanner
            className="mb-6 mx-0"
            message="Network error. Check your connection and try again."
            onRetry={() => createExercise.reset()}
          />
        )}

        <FormField label="Exercise Name" error={errors.name?.message}>
          <UnderlineInput
            {...register("name")}
            placeholder="e.g. Bench Press"
            autoFocus
            hasError={!!errors.name}
          />
        </FormField>
      </div>
    </AppShell>
  );
}
