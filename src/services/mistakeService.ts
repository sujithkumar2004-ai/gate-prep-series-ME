import type { Mistake, MistakeType, PlannerState } from "../types/planner";
import { addDays } from "../utils/dateUtils";

export const mistakeTypes: MistakeType[] = [
  "Concept gap",
  "Formula mistake",
  "Calculation mistake",
  "Silly mistake",
  "Time pressure",
  "Wrong approach",
  "Memory gap",
  "Skipped revision"
];

export function addMistake(state: PlannerState, mistake: Omit<Mistake, "id" | "createdAt" | "isFixed"> & { isFixed?: boolean }) {
  const id = `mistake-${Date.now()}`;
  return {
    ...state,
    mistakes: {
      ...state.mistakes,
      [id]: {
        ...mistake,
        id,
        isFixed: mistake.isFixed ?? false,
        retryDate: mistake.retryDate || addDays(new Date().toISOString().slice(0, 10), 3),
        createdAt: new Date().toISOString()
      }
    }
  };
}

export function updateMistake(state: PlannerState, mistakeId: string, patch: Partial<Mistake>) {
  const mistake = state.mistakes[mistakeId];
  if (!mistake) return state;
  return { ...state, mistakes: { ...state.mistakes, [mistakeId]: { ...mistake, ...patch } } };
}

export function markMistakeFixed(state: PlannerState, mistakeId: string) {
  return updateMistake(state, mistakeId, { isFixed: true, fixedAt: new Date().toISOString() });
}
