import { createInitialState } from "./plannerData";
import type { PlannerState } from "../types/planner";

const storagePrefix = "gate-me-planner-state-v5";

export function storageKeyForUser(userId: string) {
  return `${storagePrefix}-${userId}`;
}

export async function loadProgress(userId: string, token: string): Promise<PlannerState> {
  try {
    const response = await fetch(`/api/progress?userId=${encodeURIComponent(userId)}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (response.ok) {
      return { ...createInitialState(), ...((await response.json()) as Partial<PlannerState>) };
    }
  } catch {
    // Fall through to local storage.
  }

  const saved = window.localStorage.getItem(storageKeyForUser(userId));
  if (!saved) {
    return createInitialState();
  }

  try {
    return { ...createInitialState(), ...(JSON.parse(saved) as Partial<PlannerState>) };
  } catch {
    return createInitialState();
  }
}

export async function saveProgress(userId: string, token: string, state: PlannerState) {
  try {
    const response = await fetch("/api/progress", {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(state)
    });
    if (response.ok) {
      return;
    }
  } catch {
    // Fall through to local storage.
  }

  window.localStorage.setItem(storageKeyForUser(userId), JSON.stringify(state));
}
