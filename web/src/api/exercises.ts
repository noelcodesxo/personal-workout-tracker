import { apiDelete, apiGet, apiPatch, apiPost } from "./client";
import type { CreateExerciseRequest, Exercise, UpdateExerciseRequest } from "./types";

export const exercisesApi = {
  list: () => apiGet<Exercise[]>("/exercises"),
  get: (id: number) => apiGet<Exercise>(`/exercises/${id}`),
  create: (data: CreateExerciseRequest) => apiPost<Exercise>("/exercises", data),
  update: (id: number, data: UpdateExerciseRequest) => apiPatch<Exercise>(`/exercises/${id}`, data),
  delete: (id: number) => apiDelete(`/exercises/${id}`),
};
