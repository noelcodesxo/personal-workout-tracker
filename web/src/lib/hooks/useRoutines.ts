"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { routinesApi } from "@/api/routines";
import type { Routine, RoutinePayload } from "@/api/types";

export const routineKeys = {
  all: ["routines"] as const,
  detail: (name: string) => ["routines", name] as const,
};

export function useGetRoutines() {
  return useQuery({
    queryKey: routineKeys.all,
    queryFn: () => routinesApi.list(),
  });
}

export function useGetRoutine(name: string) {
  return useQuery({
    queryKey: routineKeys.detail(name),
    queryFn: () => routinesApi.getByName(name),
    enabled: !!name,
  });
}

export function useCreateRoutine() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: RoutinePayload) => routinesApi.create(data),
    onSuccess: (data) => {
      queryClient.setQueryData<Routine[]>(routineKeys.all, (prev) =>
        prev ? [...prev, data] : [data],
      );
    },
  });
}

export function useUpdateRoutine() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: RoutinePayload) => routinesApi.update(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: routineKeys.all });
      queryClient.setQueryData(routineKeys.detail(data.name), data);
    },
  });
}

export function useDeleteRoutine() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => routinesApi.delete(name),
    onSuccess: (_data, name) => {
      queryClient.setQueryData<Routine[]>(routineKeys.all, (prev) =>
        prev ? prev.filter((r) => r.name !== name) : [],
      );
    },
  });
}
