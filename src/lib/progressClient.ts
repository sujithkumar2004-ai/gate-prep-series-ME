import { createInitialState, plannerData } from "./plannerData";
import type { PlannerState } from "../types/planner";

const storagePrefix = "gate-me-planner-state-v5";

export function storageKeyForUser(userId: string) {
  return `${storagePrefix}-${userId}`;
}

function normalizeState(partial?: Partial<PlannerState>): PlannerState {
  const base = createInitialState();
  const dailyProgress = { ...base.dailyProgress, ...(partial?.dailyProgress ?? {}) };
  plannerData.daywisePlan.forEach((day) => {
    dailyProgress[day.id] = {
      ...base.dailyProgress[day.id],
      ...dailyProgress[day.id],
      workItems: day.workItems.map((_, index) => dailyProgress[day.id]?.workItems?.[index] ?? { done: false })
    };
  });
  return {
    ...base,
    ...partial,
    dailyProgress,
    mockTests: { ...base.mockTests, ...(partial?.mockTests ?? {}) },
    mistakes: partial?.mistakes ?? base.mistakes,
    backlog: partial?.backlog ?? base.backlog,
    income: partial?.income ?? base.income,
    expenses: partial?.expenses ?? base.expenses,
    salary: { ...base.salary, ...(partial?.salary ?? {}) },
    gymRoutine: { ...base.gymRoutine, ...(partial?.gymRoutine ?? {}) },
    gymLogs: partial?.gymLogs ?? base.gymLogs,
    targets: { ...base.targets, ...(partial?.targets ?? {}) },
    questionBank: partial?.questionBank ?? base.questionBank,
    flashcards: partial?.flashcards ?? base.flashcards,
    deepWorkSessions: partial?.deepWorkSessions ?? base.deepWorkSessions,
    energyLogs: partial?.energyLogs ?? base.energyLogs,
    reminders: partial?.reminders ?? base.reminders,
    examSimulations: partial?.examSimulations ?? base.examSimulations
  };
}

export async function loadProgress(userId: string, token: string): Promise<PlannerState> {
  try {
    const response = await fetch(`/api/progress?userId=${encodeURIComponent(userId)}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (response.ok) {
      return normalizeState((await response.json()) as Partial<PlannerState>);
    }
  } catch {
    // Fall through to local storage.
  }

  const saved = window.localStorage.getItem(storageKeyForUser(userId));
  if (!saved) {
    return normalizeState();
  }

  try {
    return normalizeState(JSON.parse(saved) as Partial<PlannerState>);
  } catch {
    return normalizeState();
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
