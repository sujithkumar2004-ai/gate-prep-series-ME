import { createInitialPlannerState, storageKeyFor } from "./progressService";
import type { PlannerState } from "../types/planner";

export function detectLegacyLocalData(userId: string) {
  if (typeof window === "undefined") return false;
  return Object.keys(window.localStorage).some((key) => key.includes("gate-me-html-planner-progress") || key === storageKeyFor(userId));
}

export function migrateLocalStorageData(userId: string): PlannerState {
  const state = createInitialPlannerState();
  window.localStorage.setItem(storageKeyFor(userId), JSON.stringify(state));
  return state;
}
