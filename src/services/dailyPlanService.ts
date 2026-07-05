import { plannerData, syllabusLockDate } from "../lib/plannerData";
import type { DailyPlan, DailyProgress, DailyTask, DailyTaskStatus, DailyTaskType, PlannerDay, PlannerState } from "../types/planner";

function baseTask(day: PlannerDay, type: DailyTaskType, title: string, plannedMinutes: number): DailyTask {
  return {
    id: `${day.id}-${type}`,
    date: day.date,
    sourceDayId: day.id,
    subjectId: day.subjectId,
    topicId: day.topicId,
    type,
    title,
    plannedMinutes,
    actualMinutes: 0,
    status: "pending",
    skipReason: ""
  };
}

export function generateDailyTasks(day: PlannerDay): DailyTask[] {
  const tasks: DailyTask[] = [];
  const isSyllabusLocked = day.date > syllabusLockDate;
  const isStudyDay = day.kind === "Study";
  if (isStudyDay && !isSyllabusLocked) {
    tasks.push(baseTask(day, "concept", `New topic: ${day.topic}`, Math.max(90, Math.round(day.targetHours * 28))));
    tasks.push(baseTask(day, "notes", `Short notes: ${day.topic}`, 45));
  }
  tasks.push(baseTask(day, "revision", `Revision: ${day.mainSubject}`, isSyllabusLocked ? 90 : 45));
  tasks.push(baseTask(day, "pyq", `PYQ practice: ${day.topic}`, isSyllabusLocked ? 120 : 75));
  tasks.push(baseTask(day, "weak_repair", `Weak-area repair: ${day.mainSubject}`, 30));
  return tasks;
}

export function generateAllDailyTasks() {
  return plannerData.days.flatMap((day) => generateDailyTasks(day));
}

export function generateDailyPlan(state: PlannerState, date: string): DailyPlan {
  const tasks = Object.values(state.tasks)
    .filter((task) => task.date === date)
    .sort((a, b) => taskOrder(a.type) - taskOrder(b.type));
  const backlogTasks = Object.values(state.backlog)
    .filter((item) => item.status === "active" && item.recoveryDate === date)
    .map<DailyTask>((item) => ({
      id: `backlog-task-${item.id}`,
      date,
      sourceDayId: item.taskId,
      subjectId: item.subjectId,
      topicId: item.topicId,
      type: "backlog",
      title: `Backlog recovery: ${item.title}`,
      plannedMinutes: 60,
      actualMinutes: 0,
      status: "pending",
      skipReason: ""
    }));
  const dueRevisionTasks = Object.values(state.revisions)
    .filter((revision) => revision.status === "pending" && revision.dueDate === date)
    .map<DailyTask>((revision) => ({
      id: `revision-task-${revision.id}`,
      date,
      sourceDayId: revision.sourceTaskId,
      subjectId: revision.subjectId,
      topicId: revision.topicId,
      type: "revision",
      title: revision.title,
      plannedMinutes: revision.cycle === "D30" ? 75 : 45,
      actualMinutes: 0,
      status: "pending",
      skipReason: ""
    }));
  return { date, tasks: [...tasks, ...dueRevisionTasks, ...backlogTasks] };
}

function taskOrder(type: DailyTaskType) {
  return ["concept", "notes", "revision", "pyq", "weak_repair", "backlog"].indexOf(type);
}

export function calculateDailyProgress(plan: DailyPlan): DailyProgress {
  const totalPlannedTasks = plan.tasks.length;
  const completedTasks = plan.tasks.filter((task) => task.status === "completed").length;
  const skippedTasks = plan.tasks.filter((task) => task.status === "skipped").length;
  const pendingTasks = plan.tasks.filter((task) => task.status === "pending" || task.status === "in_progress").length;
  const plannedMinutes = plan.tasks.reduce((sum, task) => sum + task.plannedMinutes, 0);
  const actualMinutes = plan.tasks.reduce((sum, task) => sum + task.actualMinutes, 0);
  const completionPercentage = totalPlannedTasks ? Math.round((completedTasks / totalPlannedTasks) * 100) : 0;
  const minutesScore = plannedMinutes ? Math.min(100, Math.round((actualMinutes / plannedMinutes) * 100)) : 0;
  return {
    date: plan.date,
    totalPlannedTasks,
    completedTasks,
    skippedTasks,
    pendingTasks,
    plannedMinutes,
    actualMinutes,
    completionPercentage,
    dailyScore: Math.round(completionPercentage * 0.7 + minutesScore * 0.3)
  };
}

export function patchTask(state: PlannerState, taskId: string, patch: Partial<DailyTask>) {
  const current = state.tasks[taskId];
  if (!current) return state;
  const nextStatus = patch.status ?? current.status;
  const completedAt = nextStatus === "completed" ? patch.completedAt ?? current.completedAt ?? new Date().toISOString() : patch.completedAt ?? current.completedAt;
  return {
    ...state,
    tasks: {
      ...state.tasks,
      [taskId]: {
        ...current,
        ...patch,
        completedAt
      }
    }
  };
}

export function validateTaskStatus(status: DailyTaskStatus, skipReason: string) {
  return status !== "skipped" || skipReason.trim().length > 0;
}
