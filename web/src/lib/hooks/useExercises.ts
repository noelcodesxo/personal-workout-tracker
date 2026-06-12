"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { exercisesApi } from "@/api/exercises";
import type { Exercise } from "@/api/types";

export const exerciseKeys = {
  all: ["exercises"] as const,
  detail: (name: string) => ["exercises", name] as const,
};

export function useGetExercises() {
  return useQuery({
    queryKey: exerciseKeys.all,
    queryFn: () => exercisesApi.list(),
  });
}

export function useGetExercise(name: string) {
  return useQuery({
    queryKey: exerciseKeys.detail(name),
    queryFn: () => exercisesApi.getByName(name),
    enabled: !!name,
  });
}

export function useCreateExercise() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => exercisesApi.create(name),
    onSuccess: (data) => {
      if (data) {
        queryClient.setQueryData<Exercise[]>(exerciseKeys.all, (prev) =>
          prev ? [...prev, data] : [data],
        );
      }
    },
  });
}

export function useUpdateExercise() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ currentName, newName }: { currentName: string; newName: string }) =>
      exercisesApi.update(currentName, newName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: exerciseKeys.all });
    },
  });
}

export function useDeleteExercise() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => exercisesApi.delete(name),
    onSuccess: (_data, name) => {
      queryClient.setQueryData<Exercise[]>(exerciseKeys.all, (prev) =>
        prev ? prev.filter((e) => e.name !== name) : [],
      );
    },
  });
}
