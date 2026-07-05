export {
  createInitialPlannerState,
  storageKeyFor
} from "../lib/progressStorage";
import { readUserProgress, saveUserProgress } from "../lib/progressStorage";
import type { PlannerState } from "../types/planner";
import { apiFetch, localFallbackEnabled } from "./api/apiClient";

export async function loadProgress(userId: string, token?: string): Promise<{ state: PlannerState; fallbackUsed: boolean }> {
  if (token) {
    try {
      return { state: await apiFetch<PlannerState>("/progress", {}, token), fallbackUsed: false };
    } catch {
      if (!localFallbackEnabled()) throw new Error("Unable to load progress");
    }
  }
  return { state: readUserProgress(userId), fallbackUsed: true };
}

export async function persistProgress(userId: string, state: PlannerState, token?: string) {
  if (token) {
    try {
      await apiFetch<PlannerState>("/progress", { method: "POST", body: JSON.stringify(state) }, token);
      saveUserProgress(userId, state);
      return { fallbackUsed: false };
    } catch {
      if (!localFallbackEnabled()) throw new Error("Unable to save progress");
    }
  }
  saveUserProgress(userId, state);
  return { fallbackUsed: true };
}

export { readUserProgress, saveUserProgress };
