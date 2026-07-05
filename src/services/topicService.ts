import { plannerData } from "../lib/plannerData";
import { daysBetween, todayIso } from "../utils/dateUtils";
import type { PlannerState, Topic, TopicMasteryStatus, TopicProgress } from "../types/planner";

export function calculateTopicStatus(progress: TopicProgress): TopicMasteryStatus {
  if (progress.conceptCompleted && progress.notesCompleted && progress.pyqCompleted && progress.revisionsCompleted >= 2 && progress.accuracy >= 75) {
    const lastRevisionAge = progress.lastRevisedDate ? daysBetween(progress.lastRevisedDate, todayIso()) : Infinity;
    if (lastRevisionAge <= 30) return "Mastered";
  }
  if (progress.accuracy > 0 && progress.accuracy < 55) return "Weak";
  if (progress.revisionsCompleted >= 2) return "Revised";
  if (progress.revisionsCompleted > 0 || progress.nextRevisionDate) return "Revision Due";
  if (progress.pyqCompleted) return "PYQ Done";
  if (progress.conceptCompleted && progress.accuracy > 0) return "PYQ Started";
  if (progress.notesCompleted) return "Notes Done";
  if (progress.conceptCompleted) return "Learning";
  return "Not Started";
}

export function calculateTopicMastery(state: PlannerState, topic: Topic): TopicProgress {
  const topicTasks = Object.values(state.tasks).filter((task) => task.topicId === topic.id);
  const revisions = Object.values(state.revisions).filter((revision) => revision.topicId === topic.id);
  const completedRevisions = revisions.filter((revision) => revision.status === "completed");
  const stored = state.topicProgress[topic.id];
  const progress: TopicProgress = {
    topicId: topic.id,
    conceptCompleted: topicTasks.some((task) => task.type === "concept" && task.status === "completed") || stored?.conceptCompleted === true,
    notesCompleted: topicTasks.some((task) => task.type === "notes" && task.status === "completed") || stored?.notesCompleted === true,
    pyqCompleted: topicTasks.some((task) => task.type === "pyq" && task.status === "completed") || stored?.pyqCompleted === true,
    revisionsCompleted: Math.max(stored?.revisionsCompleted ?? 0, completedRevisions.length),
    accuracy: stored?.accuracy ?? 0,
    lastRevisedDate: completedRevisions.at(-1)?.completedAt?.slice(0, 10) ?? stored?.lastRevisedDate,
    nextRevisionDate: revisions.find((revision) => revision.status === "pending")?.dueDate ?? stored?.nextRevisionDate,
    status: "Not Started"
  };
  return { ...progress, status: calculateTopicStatus(progress) };
}

export function getTopicRows(state: PlannerState) {
  return plannerData.topics.map((topic) => {
    const subject = plannerData.subjects.find((item) => item.id === topic.subjectId);
    const progress = calculateTopicMastery(state, topic);
    return { ...topic, subjectName: subject?.name ?? topic.subjectId, progress };
  });
}

export function calculateSyllabusCoverage(state: PlannerState) {
  const rows = getTopicRows(state);
  const started = rows.filter((row) => row.progress.status !== "Not Started").length;
  return rows.length ? Math.round((started / rows.length) * 100) : 0;
}

export function calculateMasteredPercentage(state: PlannerState) {
  const rows = getTopicRows(state);
  const mastered = rows.filter((row) => row.progress.status === "Mastered").length;
  return rows.length ? Math.round((mastered / rows.length) * 100) : 0;
}

export function updateTopicAccuracy(state: PlannerState, topicId: string, accuracy: number): PlannerState {
  const current = calculateTopicMastery(state, plannerData.topics.find((topic) => topic.id === topicId) ?? plannerData.topics[0]);
  const next = { ...current, accuracy: Math.max(0, Math.min(100, accuracy)) };
  return {
    ...state,
    topicProgress: {
      ...state.topicProgress,
      [topicId]: { ...next, status: calculateTopicStatus(next) }
    }
  };
}
