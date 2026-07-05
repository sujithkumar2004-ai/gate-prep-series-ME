import { accounts, sessionStorageKey } from "../config/appConfig";

export function readSavedAccount() {
  if (typeof window === "undefined") return null;
  const savedUser = window.localStorage.getItem(sessionStorageKey);
  return accounts.find((item) => item.username === savedUser) ?? null;
}

export function saveSession(username: string) {
  window.localStorage.setItem(sessionStorageKey, username);
}

export function clearSession() {
  window.localStorage.removeItem(sessionStorageKey);
}
