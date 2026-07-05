import { plannerData, syllabusLockDate } from "../lib/plannerData";
import { daysBetween, todayIso } from "../utils/dateUtils";
import type { BacklogItem, DailyTask, PlannerState } from "../types/planner";

export function createBacklogFromMissedTasks(state: PlannerState, task: DailyTask, reason: string): PlannerState {
  const id = `backlog-${task.id}`;
  if (state.backlog[id]) return state;
  const item: BacklogItem = {
    id,
    taskId: task.id,
    date: task.date,
    subjectId: task.subjectId,
    topicId: task.topicId,
    title: task.title,
    reason,
    recoveryDate: findRecoveryDate(task.date),
    priority: task.type === "concept" || task.type === "pyq" ? "High" : "Medium",
    status: "active"
  };
  return { ...state, backlog: { ...state.backlog, [id]: item } };
}

export function rescheduleBacklog(state: PlannerState): PlannerState {
  const backlog = Object.fromEntries(
    Object.values(state.backlog).map((item) => [
      item.id,
      item.status === "active" ? { ...item, recoveryDate: findRecoveryDate(item.date) } : item
    ])
  );
  return { ...state, backlog };
}

export function markBacklogRecovered(state: PlannerState, backlogId: string): PlannerState {
  const item = state.backlog[backlogId];
  if (!item) return state;
  return {
    ...state,
    backlog: {
      ...state.backlog,
      [backlogId]: { ...item, status: "recovered", recoveredAt: new Date().toISOString() }
    }
  };
}

export function getBacklogRows(state: PlannerState, date = todayIso()) {
  const rows = Object.values(state.backlog).sort((a, b) => a.recoveryDate.localeCompare(b.recoveryDate));
  return {
    active: rows
      .filter((row) => row.status === "active")
      .map((row) => ({ ...row, age: daysBetween(row.date, date) })),
    recovered: rows
      .filter((row) => row.status === "recovered")
      .map((row) => ({ ...row, age: daysBetween(row.date, row.recoveredAt?.slice(0, 10) ?? date) }))
  };
}

function findRecoveryDate(fromDate: string) {
  const lightDays = plannerData.days.filter((day) => {
    const isSunday = day.day === "Sunday";
    const isLight = day.targetHours <= 4 || /revision|weekly|rest|buffer/i.test(day.dailyTask);
    const avoidsJanuarySyllabusPush = day.date <= syllabusLockDate || /revision|mock|analysis|recovery|buffer/i.test(day.dailyTask);
    return day.date >= fromDate && (isSunday || isLight) && avoidsJanuarySyllabusPush;
  });
  return lightDays.find((day) => day.day === "Sunday")?.date ?? lightDays[0]?.date ?? fromDate;
}
