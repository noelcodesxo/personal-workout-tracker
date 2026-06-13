import { apiGet, apiPost, apiPut, apiDelete } from "./client";
import type { CreateWorkoutRequest, LogWorkoutRequest, Workout } from "./types";

export const workoutsApi = {
  list: () => apiGet<Workout[]>("/workout"),
  get: (id: number) => apiGet<Workout>(`/workout/${id}`),
  create: (data: CreateWorkoutRequest) => apiPost<Workout>("/workout", data),
  log: (id: number, data: LogWorkoutRequest) => apiPut<Workout>(`/workout/${id}`, data),
  delete: (id: number) => apiDelete(`/workout/${id}`),
};
