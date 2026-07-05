import { createInitialEdits, mergeStoredState, plannerData } from "./plannerData";
import { generateAllDailyTasks } from "../services/dailyPlanService";
import type { PlannerState, StoredState, TopicProgress } from "../types/planner";

const storageKeyPrefix = "gate-me-core-planner-progress-v6";

export function storageKeyFor(username: string) {
  return `${storageKeyPrefix}-${username}`;
}

export function createInitialPlannerState(): PlannerState {
  const tasks = Object.fromEntries(generateAllDailyTasks().map((task) => [task.id, task]));
  const topicProgress = plannerData.topics.reduce<Record<string, TopicProgress>>((acc, topic) => {
    acc[topic.id] = {
      topicId: topic.id,
      conceptCompleted: false,
      notesCompleted: false,
      pyqCompleted: false,
      revisionsCompleted: 0,
      accuracy: 0,
      status: "Not Started"
    };
    return acc;
  }, {});
  return {
    rowEdits: createInitialEdits(),
    tasks,
    revisions: {},
    backlog: {},
    topicProgress,
    pyqSessions: {},
    questionBank: {},
    mockTests: {},
    mistakes: {},
    attemptStrategies: {}
  };
}

function normalizeState(saved: Partial<PlannerState> | null): PlannerState {
  const base = createInitialPlannerState();
  return {
    rowEdits: mergeStoredState(saved?.rowEdits ?? null),
    tasks: { ...base.tasks, ...(saved?.tasks ?? {}) },
    revisions: { ...base.revisions, ...(saved?.revisions ?? {}) },
    backlog: { ...base.backlog, ...(saved?.backlog ?? {}) },
    topicProgress: { ...base.topicProgress, ...(saved?.topicProgress ?? {}) },
    pyqSessions: { ...base.pyqSessions, ...(saved?.pyqSessions ?? {}) },
    questionBank: { ...base.questionBank, ...(saved?.questionBank ?? {}) },
    mockTests: { ...base.mockTests, ...(saved?.mockTests ?? {}) },
    mistakes: { ...base.mistakes, ...(saved?.mistakes ?? {}) },
    attemptStrategies: { ...base.attemptStrategies, ...(saved?.attemptStrategies ?? {}) }
  };
}

export function readUserProgress(username: string): PlannerState {
  if (typeof window === "undefined") return createInitialPlannerState();
  const saved = window.localStorage.getItem(storageKeyFor(username));
  if (!saved) {
    return createInitialPlannerState();
  }
  try {
    const parsed = JSON.parse(saved) as Partial<PlannerState> | StoredState;
    if ("rowEdits" in parsed || "tasks" in parsed) {
      return normalizeState(parsed as Partial<PlannerState>);
    }
    return { ...createInitialPlannerState(), rowEdits: mergeStoredState(parsed as StoredState) };
  } catch {
    return createInitialPlannerState();
  }
}

export function saveUserProgress(username: string, state: PlannerState) {
  window.localStorage.setItem(storageKeyFor(username), JSON.stringify(state));
}
