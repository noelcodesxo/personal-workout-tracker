import { apiFetch, apiGet, apiDelete } from "./client";
import type { Routine, RoutinePayload } from "./types";

export const routinesApi = {
  // GET /routine/ — active routines only
  list: () => apiGet<Routine[]>("/routine"),

  // GET /routine/{name}
  getByName: (name: string) => apiGet<Routine>(`/routine/${encodeURIComponent(name)}`),

  // POST /routine/
  create: (data: RoutinePayload) =>
    apiFetch<Routine>("/routine", { method: "POST", body: data }),

  // PUT /routine/ — matched by name in body; replaces exercises + sets
  update: (data: RoutinePayload) =>
    apiFetch<Routine>("/routine", { method: "PUT", body: data }),

  // DELETE /routine/{name} — soft delete
  delete: (name: string) => apiDelete(`/routine/${encodeURIComponent(name)}`),
};
