import { sessionStorageKey } from "../config/appConfig";
import { readAuthSession, saveAuthSession, clearAuthSession as clearStoredAuthSession } from "./authService";
import type { AuthSession } from "../types/planner";

export function readSavedAccount() {
  if (typeof window === "undefined") return null;
  return readAuthSession()?.user ?? null;
}

export function readSavedSession() {
  return readAuthSession();
}

export function saveSession(session: AuthSession) {
  saveAuthSession(session);
  window.localStorage.setItem(sessionStorageKey, session.user.email);
}

export function clearSession() {
  window.localStorage.removeItem(sessionStorageKey);
  clearStoredAuthSession();
}
