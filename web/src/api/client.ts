import { env } from "@/config/env";
import { ApiError, ApiFieldError, NetworkError } from "./types";

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  params?: Record<string, string | number | boolean>;
};

async function parseErrorBody(res: Response): Promise<{ message: string; fieldErrors: ApiFieldError[] }> {
  try {
    const body = await res.json();
    const message: string =
      body?.detail ?? body?.message ?? body?.error ?? `Request failed with status ${res.status}`;
    const fieldErrors: ApiFieldError[] = Array.isArray(body?.errors)
      ? body.errors
      : Array.isArray(body?.detail)
        ? body.detail.map((d: { loc: string[]; msg: string }) => ({
            field: d.loc.slice(1).join("."),
            message: d.msg,
          }))
        : [];
    return { message, fieldErrors };
  } catch {
    return { message: `Request failed with status ${res.status}`, fieldErrors: [] };
  }
}

const REQUEST_TIMEOUT_MS = 10_000;

export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, params, headers: extraHeaders, ...rest } = options;

  const url = new URL(`${env.NEXT_PUBLIC_API_BASE_URL}${path}`);
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, String(v)));
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "X-User-Id": env.NEXT_PUBLIC_USER_ID,
    ...(extraHeaders as Record<string, string>),
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let res: Response;
  try {
    res = await fetch(url.toString(), {
      ...rest,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
  } catch {
    throw new NetworkError();
  } finally {
    clearTimeout(timeoutId);
  }

  if (!res.ok) {
    const { message, fieldErrors } = await parseErrorBody(res);
    throw new ApiError(res.status, message, fieldErrors);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const apiGet = <T>(path: string, params?: RequestOptions["params"]) =>
  apiFetch<T>(path, { method: "GET", params });

export const apiPost = <T>(path: string, body?: unknown) =>
  apiFetch<T>(path, { method: "POST", body });

export const apiPut = <T>(path: string, body?: unknown) =>
  apiFetch<T>(path, { method: "PUT", body });

export const apiPatch = <T>(path: string, body?: unknown) =>
  apiFetch<T>(path, { method: "PATCH", body });

export const apiDelete = <T = void>(path: string) =>
  apiFetch<T>(path, { method: "DELETE" });
