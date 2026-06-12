import { apiDelete, apiGet, apiPatch, apiPost, apiPut } from "./client";
import type {
  CompletedSetEntry,
  CreateCompletedSetRequest,
  CreateWorkoutRequest,
  ExerciseEntry,
  UpdateCompletedSetRequest,
  UpdateWorkoutRequest,
  Workout,
} from "./types";

export const workoutsApi = {
  list: () => apiGet<Workout[]>("/workouts"),
  get: (id: number) => apiGet<Workout>(`/workouts/${id}`),
  create: (data: CreateWorkoutRequest) => apiPost<Workout>("/workouts", data),
  update: (id: number, data: UpdateWorkoutRequest) => apiPatch<Workout>(`/workouts/${id}`, data),
  finish: (id: number) => apiPost<Workout>(`/workouts/${id}/finish`),
  delete: (id: number) => apiDelete(`/workouts/${id}`),

  addExercise: (workoutId: number, exerciseId: number) =>
    apiPost<ExerciseEntry>(`/workouts/${workoutId}/exercises`, { exercise_id: exerciseId }),
  removeExercise: (workoutId: number, exerciseEntryId: number) =>
    apiDelete(`/workouts/${workoutId}/exercises/${exerciseEntryId}`),

  addSet: (workoutId: number, exerciseEntryId: number, data: CreateCompletedSetRequest) =>
    apiPost<CompletedSetEntry>(`/workouts/${workoutId}/exercises/${exerciseEntryId}/sets`, data),
  updateSet: (
    workoutId: number,
    exerciseEntryId: number,
    setId: number,
    data: UpdateCompletedSetRequest,
  ) =>
    apiPut<CompletedSetEntry>(
      `/workouts/${workoutId}/exercises/${exerciseEntryId}/sets/${setId}`,
      data,
    ),
  deleteSet: (workoutId: number, exerciseEntryId: number, setId: number) =>
    apiDelete(`/workouts/${workoutId}/exercises/${exerciseEntryId}/sets/${setId}`),
};
