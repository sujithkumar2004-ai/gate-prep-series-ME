import type { ApiErrorCode } from "../../types/planner";

export class ApiClientError extends Error {
  code: ApiErrorCode;
  status: number;

  constructor(message: string, code: ApiErrorCode, status = 0) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

export function apiBaseUrl() {
  return process.env.NEXT_PUBLIC_API_BASE_URL || "/api";
}

export function localFallbackEnabled() {
  return process.env.NEXT_PUBLIC_ENABLE_LOCAL_FALLBACK !== "false";
}

export async function apiFetch<T>(path: string, init: RequestInit = {}, token?: string): Promise<T> {
  try {
    const response = await fetch(`${apiBaseUrl()}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(init.headers ?? {})
      }
    });
    const data = await response.json().catch(() => null);
    if (!response.ok) {
      throw new ApiClientError(data?.error?.message ?? "API error", data?.error?.code ?? "server_error", response.status);
    }
    return data as T;
  } catch (error) {
    if (error instanceof ApiClientError) throw error;
    throw new ApiClientError("Network error", "network_error", 0);
  }
}
