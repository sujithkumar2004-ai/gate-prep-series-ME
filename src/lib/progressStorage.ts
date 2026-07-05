import { createInitialEdits, mergeStoredState, plannerData } from "./plannerData";
import { generateAllDailyTasks } from "../services/dailyPlanService";
import type { ActiveRecallCard, PlannerState, Reminder, StoredState, TopicProgress } from "../types/planner";

const storageKeyPrefix = "gate-me-core-planner-progress-v6";

export function storageKeyFor(username: string) {
  return `${storageKeyPrefix}-${username}`;
}

export function createInitialPlannerState(): PlannerState {
  const tasks = Object.fromEntries(generateAllDailyTasks().map((task) => [task.id, task]));
  const today = new Date().toISOString().slice(0, 10);
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
  const activeRecallCards = Object.fromEntries(
    plannerData.topics.slice(0, 12).map((topic, index): [string, ActiveRecallCard] => {
      const id = `recall-${topic.id}-${index}`;
      return [
        id,
        {
          id,
          cardType: index % 3 === 0 ? "formula" : index % 3 === 1 ? "mistake" : "concept",
          subjectId: topic.subjectId,
          topicId: topic.id,
          front: `Recall key idea for ${topic.title}`,
          back: `Write the formula, assumptions, and one standard trap for ${topic.title}.`,
          nextReviewAt: today,
          confidence: 3,
          createdAt: new Date().toISOString()
        }
      ];
    })
  );
  const reminders = defaultReminders();
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
    attemptStrategies: {},
    deepWorkSessions: {},
    activeRecallCards,
    energyLogs: {},
    gymLogs: {},
    reminders,
    weeklyReviews: {},
    monthlyReviews: {}
  };
}

function defaultReminders(): Record<string, Reminder> {
  return {
    daily: { id: "daily", type: "daily_study_start", title: "Daily study start", time: "07:00", enabled: true },
    revision: { id: "revision", type: "revision_due", title: "Revision due", time: "19:00", enabled: true },
    mock: { id: "mock", type: "mock_test", title: "Mock test", time: "09:00", enabled: false },
    backlog: { id: "backlog", type: "backlog_warning", title: "Backlog warning", time: "20:00", enabled: true },
    weekly: { id: "weekly", type: "weekly_review", title: "Weekly review", time: "18:00", enabled: true }
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
    attemptStrategies: { ...base.attemptStrategies, ...(saved?.attemptStrategies ?? {}) },
    deepWorkSessions: { ...base.deepWorkSessions, ...(saved?.deepWorkSessions ?? {}) },
    activeRecallCards: { ...base.activeRecallCards, ...(saved?.activeRecallCards ?? {}) },
    energyLogs: { ...base.energyLogs, ...(saved?.energyLogs ?? {}) },
    gymLogs: { ...base.gymLogs, ...(saved?.gymLogs ?? {}) },
    reminders: { ...base.reminders, ...(saved?.reminders ?? {}) },
    weeklyReviews: { ...base.weeklyReviews, ...(saved?.weeklyReviews ?? {}) },
    monthlyReviews: { ...base.monthlyReviews, ...(saved?.monthlyReviews ?? {}) }
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
