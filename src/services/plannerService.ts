import { finalExamDate, plannerData, rowKey, syllabusLockDate } from "../lib/plannerData";
import { calculateDaysLeft, todayIso } from "../utils/dateUtils";
import type { PlannerMode, PlannerState } from "../types/planner";
import { calculateMasteredPercentage, calculateSyllabusCoverage, getTopicRows } from "./topicService";

export function calculatePlannerMode(state: PlannerState, currentDate = todayIso()): PlannerMode {
  const activeBacklog = Object.values(state.backlog).filter((item) => item.status === "active").length;
  if (currentDate > syllabusLockDate) return "Mock-Only Mode";
  if (activeBacklog > 7) return "Crash Mode";
  if (activeBacklog > 3) return "Backlog Mode";
  return "Normal Mode";
}

export function getDashboardMetrics(state: PlannerState, currentDate = todayIso()) {
  const taskRows = Object.values(state.tasks);
  const completed = taskRows.filter((task) => task.status === "completed").length;
  const averageDailyCompletion = taskRows.length ? Math.round((completed / taskRows.length) * 100) : 0;
  const activeBacklog = Object.values(state.backlog).filter((item) => item.status === "active");
  const priorityTask =
    taskRows.find((task) => task.date >= currentDate && task.status !== "completed" && task.status !== "skipped") ??
    taskRows.find((task) => task.status !== "completed" && task.status !== "skipped");

  return {
    daysLeftForExam: calculateDaysLeft(finalExamDate, currentDate),
    daysLeftForSyllabusLock: calculateDaysLeft(syllabusLockDate, currentDate),
    syllabusCoverage: calculateSyllabusCoverage(state),
    masteredTopics: calculateMasteredPercentage(state),
    backlogCount: activeBacklog.length,
    averageDailyCompletion,
    todayPriority: priorityTask?.title ?? "No pending task",
    currentMode: calculatePlannerMode(state, currentDate)
  };
}

export function syncRowEditFromTaskState(state: PlannerState): PlannerState {
  const rowEdits = { ...state.rowEdits };
  plannerData.days.forEach((day) => {
    const tasks = Object.values(state.tasks).filter((task) => task.sourceDayId === day.id);
    if (!tasks.length) return;
    const completed = tasks.filter((task) => task.status === "completed").length;
    const skipped = tasks.filter((task) => task.status === "skipped").length;
    const actualMinutes = tasks.reduce((sum, task) => sum + task.actualMinutes, 0);
    rowEdits[rowKey(day)] = {
      ...rowEdits[rowKey(day)],
      actualHours: Number((actualMinutes / 60).toFixed(1)),
      status: completed === tasks.length ? "Done" : skipped > 0 ? "Backlog" : completed > 0 ? "In Progress" : "Not Started"
    };
  });
  return { ...state, rowEdits };
}

export function getCorePlannerSnapshot(state: PlannerState) {
  return {
    data: plannerData,
    topics: getTopicRows(state),
    dashboard: getDashboardMetrics(state)
  };
}
