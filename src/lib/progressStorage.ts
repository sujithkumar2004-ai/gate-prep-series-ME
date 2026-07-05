import { createInitialEdits, mergeStoredState } from "./plannerData";
import type { StoredState } from "../types/planner";

const storageKeyPrefix = "gate-me-html-planner-progress-v5";

export function storageKeyFor(username: string) {
  return `${storageKeyPrefix}-${username}`;
}

export function readUserProgress(username: string) {
  if (typeof window === "undefined") return createInitialEdits();
  const saved = window.localStorage.getItem(storageKeyFor(username));
  if (!saved) {
    return createInitialEdits();
  }
  try {
    return mergeStoredState(JSON.parse(saved) as StoredState);
  } catch {
    return createInitialEdits();
  }
}

export function saveUserProgress(username: string, edits: StoredState) {
  window.localStorage.setItem(storageKeyFor(username), JSON.stringify(edits));
}
