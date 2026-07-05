import type { Reminder } from "../types/planner";
import { apiFetch, localFallbackEnabled } from "./api/apiClient";

export async function loadSettings(token?: string) {
  if (!token) return { reminders: [], fallbackUsed: true };
  try {
    return { ...(await apiFetch<{ reminders: Reminder[] }>("/settings", {}, token)), fallbackUsed: false };
  } catch {
    if (!localFallbackEnabled()) throw new Error("Unable to load settings");
    return { reminders: [], fallbackUsed: true };
  }
}

export async function saveSettingReminder(id: string, patch: Partial<Reminder>, token?: string) {
  if (!token) return { fallbackUsed: true };
  return apiFetch("/settings", { method: "PATCH", body: JSON.stringify({ id, patch }) }, token);
}
