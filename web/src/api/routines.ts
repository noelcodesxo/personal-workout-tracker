import { apiDelete, apiGet, apiPatch, apiPost } from "./client";
import type { CreateRoutineRequest, Routine, UpdateRoutineRequest } from "./types";

export const routinesApi = {
  list: () => apiGet<Routine[]>("/routines"),
  get: (id: number) => apiGet<Routine>(`/routines/${id}`),
  create: (data: CreateRoutineRequest) => apiPost<Routine>("/routines", data),
  update: (id: number, data: UpdateRoutineRequest) => apiPatch<Routine>(`/routines/${id}`, data),
  delete: (id: number) => apiDelete(`/routines/${id}`),
};
