import { addDays, todayIso } from "../utils/dateUtils";
import type { DailyTask, PlannerState, RevisionItem } from "../types/planner";

export const revisionCycles = [
  { cycle: "D0", offset: 0, title: "Learn topic" },
  { cycle: "D1", offset: 1, title: "First revision" },
  { cycle: "D3", offset: 3, title: "Second revision" },
  { cycle: "D7", offset: 7, title: "PYQ revision" },
  { cycle: "D15", offset: 15, title: "Mixed revision" },
  { cycle: "D30", offset: 30, title: "Mock-level revision" }
] as const;

export function generateRevisionSchedule(task: DailyTask): RevisionItem[] {
  return revisionCycles.map((cycle) => ({
    id: `${task.id}-revision-${cycle.cycle}`,
    sourceTaskId: task.id,
    subjectId: task.subjectId,
    topicId: task.topicId,
    dueDate: addDays(task.date, cycle.offset),
    cycle: cycle.cycle,
    title: `${cycle.title}: ${task.title.replace(/^New topic:\s*/i, "")}`,
    status: "pending"
  }));
}

export function ensureRevisionItems(state: PlannerState, task: DailyTask): PlannerState {
  if (task.type !== "concept" || task.status !== "completed") return state;
  const revisions = { ...state.revisions };
  generateRevisionSchedule(task).forEach((item) => {
    if (!revisions[item.id]) revisions[item.id] = item;
  });
  return { ...state, revisions };
}

export function markRevisionCompleted(state: PlannerState, revisionId: string): PlannerState {
  const revision = state.revisions[revisionId];
  if (!revision) return state;
  return {
    ...state,
    revisions: {
      ...state.revisions,
      [revisionId]: {
        ...revision,
        status: "completed",
        completedAt: new Date().toISOString()
      }
    }
  };
}

export function getRevisionBuckets(state: PlannerState, date = todayIso()) {
  const rows = Object.values(state.revisions).sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  return {
    dueToday: rows.filter((row) => row.status === "pending" && row.dueDate === date),
    overdue: rows.filter((row) => row.status === "pending" && row.dueDate < date),
    upcoming: rows.filter((row) => row.status === "pending" && row.dueDate > date).slice(0, 50),
    completed: rows.filter((row) => row.status === "completed")
  };
}
