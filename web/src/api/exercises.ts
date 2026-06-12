import { apiFetch, apiGet, apiDelete } from "./client";
import type { Exercise } from "./types";

export const exercisesApi = {
  // GET /exercise/ — returns active exercises only
  list: () => apiGet<Exercise[]>("/exercise"),

  // GET /exercise/{name}
  getByName: (name: string) => apiGet<Exercise>(`/exercise/${encodeURIComponent(name)}`),

  // POST /exercise/ — body: { name }
  create: (name: string) => apiFetch<Exercise | null>("/exercise", { method: "POST", body: { name } }),

  // PUT /exercise/{name}?new_name={newName}
  update: (currentName: string, newName: string) =>
    apiFetch<Exercise>(`/exercise/${encodeURIComponent(currentName)}`, {
      method: "PUT",
      params: { new_name: newName },
    }),

  // DELETE /exercise/{name} — soft delete (sets active=false)
  delete: (name: string) => apiDelete(`/exercise/${encodeURIComponent(name)}`),
};
