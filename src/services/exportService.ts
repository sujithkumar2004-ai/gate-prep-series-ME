import { plannerData } from "../lib/plannerData";
import type { PlannerState } from "../types/planner";

type CsvValue = string | number | boolean | null | undefined;

function escapeCsv(value: CsvValue) {
  const text = String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

export function toCsv(headers: string[], rows: CsvValue[][]) {
  return [headers.map(escapeCsv).join(","), ...rows.map((row) => row.map(escapeCsv).join(","))].join("\n");
}

export function downloadText(filename: string, contents: string, type = "text/csv;charset=utf-8") {
  const blob = new Blob([contents], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function exportFullPlannerCsv(state: PlannerState) {
  return toCsv(
    ["date", "day", "phase", "subject", "topic", "dailyTask", "workItems", "targetHours", "status", "actualHours", "notes"],
    plannerData.days.map((day) => {
      const edit = state.rowEdits[day.id];
      return [day.date, day.day, day.phase, day.mainSubject, day.topic, day.dailyTask, day.workItems.join(" | "), day.targetHours, edit?.status, edit?.actualHours, edit?.notes];
    })
  );
}

export function exportSyllabusCsv(state: PlannerState) {
  return toCsv(
    ["subject", "topic", "weightage", "difficulty", "priority", "status", "conceptDone", "notesDone", "pyqDone", "revisionsCompleted", "accuracy", "lastRevised", "nextRevision"],
    plannerData.topics.map((topic) => {
      const subject = plannerData.subjects.find((item) => item.id === topic.subjectId)?.name ?? topic.subjectId;
      const progress = state.topicProgress[topic.id];
      return [
        subject,
        topic.title,
        topic.weightage,
        topic.difficulty,
        topic.priority,
        progress?.status ?? "Not Started",
        Boolean(progress?.conceptCompleted),
        Boolean(progress?.notesCompleted),
        Boolean(progress?.pyqCompleted),
        progress?.revisionsCompleted ?? 0,
        progress?.accuracy ?? 0,
        progress?.lastRevisedDate,
        progress?.nextRevisionDate
      ];
    })
  );
}

export function exportMockAnalysisCsv(state: PlannerState) {
  return toCsv(
    ["mockNumber", "date", "totalMarks", "score", "attempted", "correct", "wrong", "accuracy", "timeSpentMinutes", "weakTopics", "topMistakes", "actionPlan", "retryTopics"],
    Object.values(state.mockTests).map((mock) => [
      mock.mockNumber,
      mock.date,
      mock.totalMarks,
      mock.score,
      mock.attempted,
      mock.correct,
      mock.wrong,
      mock.accuracy,
      mock.timeSpentMinutes,
      mock.weakTopicIds.join(" | "),
      mock.topMistakes.map((item) => `${item.mistakeType}:${item.count}`).join(" | "),
      mock.actionPlan,
      mock.retryTopicIds.join(" | ")
    ])
  );
}

export function exportMistakeNotebookCsv(state: PlannerState) {
  return toCsv(
    ["createdAt", "sourceType", "question", "subject", "topic", "mistakeType", "explanation", "correctMethod", "retryDate", "fixed", "fixedAt"],
    Object.values(state.mistakes).map((mistake) => [
      mistake.createdAt,
      mistake.sourceType,
      mistake.questionLabel,
      plannerData.subjects.find((subject) => subject.id === mistake.subjectId)?.name ?? mistake.subjectId,
      plannerData.topics.find((topic) => topic.id === mistake.topicId)?.title ?? mistake.topicId,
      mistake.mistakeType,
      mistake.explanation,
      mistake.correctMethod,
      mistake.retryDate,
      mistake.isFixed,
      mistake.fixedAt
    ])
  );
}

export function exportDailyProgressCsv(state: PlannerState) {
  return toCsv(
    ["date", "taskId", "subject", "topic", "type", "title", "plannedMinutes", "actualMinutes", "status", "skipReason", "completedAt"],
    Object.values(state.tasks).map((task) => [
      task.date,
      task.id,
      plannerData.subjects.find((subject) => subject.id === task.subjectId)?.name ?? task.subjectId,
      plannerData.topics.find((topic) => topic.id === task.topicId)?.title ?? task.topicId,
      task.type,
      task.title,
      task.plannedMinutes,
      task.actualMinutes,
      task.status,
      task.skipReason,
      task.completedAt
    ])
  );
}
