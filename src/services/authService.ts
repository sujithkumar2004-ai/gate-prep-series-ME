import { sessionStorageKey } from "../config/appConfig";
import type { AuthSession } from "../types/planner";
import { apiFetch, localFallbackEnabled } from "./api/apiClient";

const localSessionKey = `${sessionStorageKey}-session`;

export async function login(email: string, password: string): Promise<AuthSession> {
  try {
    const session = await apiFetch<AuthSession>("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });
    saveAuthSession(session);
    return session;
  } catch (error) {
    if (!localFallbackEnabled()) throw error;
    const fallback = readAuthSession();
    if (fallback?.user.email === email) return fallback;
    throw error;
  }
}

export async function logout(token?: string) {
  try {
    if (token) await apiFetch("/auth/logout", { method: "POST" }, token);
  } catch {
    // Local cleanup still happens.
  }
  clearAuthSession();
}

export async function getCurrentUser(token: string) {
  return apiFetch<{ user: AuthSession["user"] }>("/auth/me", {}, token);
}

export function saveAuthSession(session: AuthSession) {
  window.localStorage.setItem(localSessionKey, JSON.stringify(session));
}

export function readAuthSession(): AuthSession | null {
  if (typeof window === "undefined") return null;
  const saved = window.localStorage.getItem(localSessionKey);
  if (!saved) return null;
  try {
    return JSON.parse(saved) as AuthSession;
  } catch {
    return null;
  }
}

export function clearAuthSession() {
  window.localStorage.removeItem(localSessionKey);
}
