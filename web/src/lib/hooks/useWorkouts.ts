"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { workoutsApi } from "@/api/workouts";
import type { CreateWorkoutRequest, LogWorkoutRequest, Workout } from "@/api/types";

export const workoutKeys = {
  all: ["workouts"] as const,
  detail: (id: number) => ["workouts", id] as const,
};

export function useGetWorkouts() {
  return useQuery({
    queryKey: workoutKeys.all,
    queryFn: () => workoutsApi.list(),
  });
}

export function useGetWorkout(id: number) {
  return useQuery({
    queryKey: workoutKeys.detail(id),
    queryFn: () => workoutsApi.get(id),
    enabled: id > 0,
  });
}

export function useCreateWorkout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateWorkoutRequest) => workoutsApi.create(data),
    onSuccess: (data) => {
      queryClient.setQueryData<Workout[]>(workoutKeys.all, (prev) =>
        prev ? [data, ...prev] : [data],
      );
      queryClient.setQueryData(workoutKeys.detail(data.id), data);
    },
  });
}

export function useLogWorkout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: LogWorkoutRequest }) =>
      workoutsApi.log(id, data),
    onSuccess: (data) => {
      queryClient.setQueryData(workoutKeys.detail(data.id), data);
      queryClient.invalidateQueries({ queryKey: workoutKeys.all });
    },
  });
}

export function useDeleteWorkout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => workoutsApi.delete(id),
    onSuccess: (_data, id) => {
      queryClient.setQueryData<Workout[]>(workoutKeys.all, (prev) =>
        prev ? prev.filter((w) => w.id !== id) : [],
      );
      queryClient.removeQueries({ queryKey: workoutKeys.detail(id) });
    },
  });
}
