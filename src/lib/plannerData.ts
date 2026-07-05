import plannerJson from "../data/planner.json";
import { examConfig } from "../config/examConfig";
import type {
  BacklogItem,
  DailyProgress,
  EmergencyMode,
  MasteryStatus,
  MockTestRecord,
  PlannerData,
  PlannerDay,
  PlannerState,
  ProgressStatus,
  RevisionSchedule,
  TopicProgress
} from "../types/planner";

export const plannerData = plannerJson as PlannerData;

export const statuses: ProgressStatus[] = ["Not Started", "In Progress", "Done", "Backlog"];

export const examDate = plannerData.metadata.examDate;
export const syllabusCompletionDate = plannerData.metadata.syllabusCompletionDate;
export const planStartDate = plannerData.metadata.startDate;

export function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(new Date(`${value}T00:00:00`));
}

export function createInitialDailyProgress(day: PlannerDay): DailyProgress {
  return {
    status: day.status,
    actualMinutes: 0,
    actualHours: 0,
    conceptDone: false,
    notesDone: false,
    pyqSolved: 0,
    pyqAccuracy: 0,
    mockAnalysisDone: false,
    revisionDone: false,
    workItems: day.workItems.map(() => ({ done: false })),
    skipReason: "",
    notes: ""
  };
}

export function createInitialState(): PlannerState {
  return {
    dailyProgress: plannerData.daywisePlan.reduce<Record<string, DailyProgress>>((acc, day) => {
      acc[day.id] = createInitialDailyProgress(day);
      return acc;
    }, {}),
    mockTests: plannerData.mockTests.reduce<Record<string, MockTestRecord>>((acc, mock) => {
      acc[mock.id] = mock;
      return acc;
    }, {}),
    mistakes: [],
    backlog: [],
    income: [],
    expenses: [...plannerData.salaryExpense.fixedExpenses, ...plannerData.salaryExpense.studyBudget],
    salary: {
      monthlySalary: plannerData.salaryExpense.monthlySalary,
      savingsGoal: plannerData.salaryExpense.savingsGoal
    },
    gymRoutine: plannerData.gymRoutine,
    gymLogs: []
  };
}

export function dailyScore(day: PlannerDay, progress: DailyProgress) {
  const completedWorkRatio = progress.workItems.length
    ? progress.workItems.filter((item) => item.done).length / progress.workItems.length
    : 0;
  const conceptStudy = progress.conceptDone || completedWorkRatio >= 0.34 ? examConfig.scoreParts.conceptStudy : 0;
  const pyqSolving = Math.min(
    examConfig.scoreParts.pyqSolving,
    Math.round((progress.pyqSolved / Math.max(day.pyqTarget, 1)) * examConfig.scoreParts.pyqSolving)
  );
  const revision = progress.revisionDone ? examConfig.scoreParts.revision : 0;
  const mockErrorAnalysis =
    progress.mockAnalysisDone || /analysis|mock/i.test(progress.notes)
      ? examConfig.scoreParts.mockErrorAnalysis
      : Math.round(completedWorkRatio * examConfig.scoreParts.mockErrorAnalysis);
  const discipline =
    progress.actualMinutes > 0 && progress.notes.trim() && (progress.status !== "Backlog" || progress.skipReason.trim())
      ? examConfig.scoreParts.discipline
      : 0;
  return Math.max(0, Math.min(100, conceptStudy + pyqSolving + revision + mockErrorAnalysis + discipline));
}

export function topicMastery(state: PlannerState): TopicProgress[] {
  const grouped = new Map<string, TopicProgress>();
  plannerData.daywisePlan.forEach((day) => {
    const key = `${day.subject}::${day.topic}`;
    const progress = state.dailyProgress[day.id] ?? createInitialDailyProgress(day);
    const current =
      grouped.get(key) ??
      ({
        subject: day.subject,
        topic: day.topic,
        mastery: "Not Started",
        plannedDays: 0,
        doneDays: 0,
        backlogDays: 0,
        pyqSolved: 0,
        revisionsDone: 0,
        accuracy: 0
      } satisfies TopicProgress);
    current.plannedDays += 1;
    current.doneDays += progress.status === "Done" ? 1 : 0;
    current.backlogDays += progress.status === "Backlog" ? 1 : 0;
    current.pyqSolved += progress.pyqSolved;
    current.revisionsDone += progress.revisionDone ? 1 : 0;
    current.accuracy = Math.max(current.accuracy, progress.pyqAccuracy);
    current.lastRevisionDate = progress.revisionDone ? day.date : current.lastRevisionDate;
    grouped.set(key, current);
  });

  return Array.from(grouped.values()).map((topic) => {
    const ratio = topic.doneDays / Math.max(topic.plannedDays, 1);
    const lastRevisionAge = topic.lastRevisionDate
      ? Math.floor((Date.now() - new Date(`${topic.lastRevisionDate}T00:00:00`).getTime()) / 86400000)
      : Infinity;
    let mastery: MasteryStatus = "Not Started";
    if (topic.backlogDays > 0) mastery = "Weak";
    else if (ratio >= 1 && topic.pyqSolved >= 40 && topic.revisionsDone >= 2 && topic.accuracy >= 75 && lastRevisionAge <= 30) {
      mastery = "Mastered";
    } else if (topic.revisionsDone >= 2) mastery = "Revised";
    else if (topic.revisionsDone > 0) mastery = "Revision Due";
    else if (topic.pyqSolved >= 40) mastery = "PYQ Done";
    else if (topic.pyqSolved > 0) mastery = "PYQ Started";
    else if (ratio >= 1) mastery = "Notes Done";
    else if (topic.doneDays > 0) mastery = "Learning";
    return { ...topic, mastery };
  });
}

export function weakTopics(state: PlannerState) {
  return topicMastery(state)
    .filter((topic) => topic.mastery === "Weak" || topic.backlogDays > 0)
    .sort((a, b) => b.backlogDays - a.backlogDays)
    .slice(0, 12);
}

export function autoBacklog(state: PlannerState): BacklogItem[] {
  const lightDays = plannerData.daywisePlan.filter((day) => day.kind === "Rest" || /light|recovery|buffer/i.test(day.task));
  return plannerData.daywisePlan
    .filter((day) => state.dailyProgress[day.id]?.status === "Backlog")
    .map((day, index) => ({
      id: `auto-backlog-${day.id}`,
      date: day.date,
      subject: day.subject,
      topic: day.topic,
      reason: state.dailyProgress[day.id]?.notes || "Marked as backlog",
      recoveryDate: lightDays.find((candidate) => candidate.date >= day.date)?.date ?? day.date,
      status: "Scheduled"
    }));
}

export function emergencyMode(state: PlannerState, today = new Date().toISOString().slice(0, 10)): EmergencyMode {
  const backlogCount = autoBacklog(state).length;
  if (today > examConfig.syllabusCompletionDate) return "Mock-Only Mode";
  if (backlogCount > 7) return "Crash Mode";
  if (backlogCount > 3) return "Backlog Mode";
  return "Normal Mode";
}

export function spacedRevisionSchedule(state: PlannerState): RevisionSchedule[] {
  const offsets = examConfig.revisionOffsets;
  return plannerData.daywisePlan
    .filter((day) => state.dailyProgress[day.id]?.status === "Done")
    .flatMap((day) =>
      offsets.map((offset) => {
        const date = new Date(`${day.date}T00:00:00`);
        date.setDate(date.getDate() + offset);
        return {
          id: `${day.id}-revision-${offset}`,
          sourceDate: day.date,
          revisionDate: date.toISOString().slice(0, 10),
          subject: day.subject,
          topic: day.topic,
          offsetDays: offset,
          done: false
        };
      })
    );
}

export function readinessScore(state: PlannerState) {
  const days = plannerData.daywisePlan;
  const masteryRows = topicMastery(state);
  const masteredRatio = masteryRows.filter((topic) => topic.mastery === "Mastered").length / Math.max(masteryRows.length, 1);
  const pyqTarget = days.reduce((sum, day) => sum + day.pyqTarget, 0);
  const pyqDone = days.reduce((sum, day) => sum + (state.dailyProgress[day.id]?.pyqSolved ?? 0), 0);
  const pyqRatio = Math.min(1, pyqDone / Math.max(pyqTarget, 1));
  const mocks = Object.values(state.mockTests);
  const scoredMocks = mocks.filter((mock) => typeof mock.score === "number");
  const mockRatio = scoredMocks.length
    ? Math.min(1, scoredMocks.reduce((sum, mock) => sum + (mock.score ?? 0), 0) / scoredMocks.length / 80)
    : 0;
  const revisionRows = days.filter((day) => state.dailyProgress[day.id]?.revisionDone).length / Math.max(days.length, 1);
  const discipline =
    days.reduce((sum, day) => sum + (dailyScore(day, state.dailyProgress[day.id] ?? createInitialDailyProgress(day)) >= 70 ? 1 : 0), 0) /
    Math.max(days.length, 1);
  return Math.round(
    (examConfig.readinessWeights.syllabusMastery * masteredRatio +
      examConfig.readinessWeights.pyqCompletion * pyqRatio +
      examConfig.readinessWeights.mockPerformance * mockRatio +
      examConfig.readinessWeights.revisionConsistency * revisionRows +
      examConfig.readinessWeights.disciplineScore * discipline) *
      100
  );
}

export function mockTrend(state: PlannerState) {
  return Object.values(state.mockTests)
    .filter((mock) => typeof mock.score === "number")
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function subjectCompletion(state: PlannerState) {
  return plannerData.syllabusMap.map((subject) => {
    const relatedDays = plannerData.daywisePlan.filter((day) =>
      `${day.subject} ${day.topic} ${day.task}`.toLowerCase().includes(subject.subject.toLowerCase().split("/")[0])
    );
    const done = relatedDays.filter((day) => state.dailyProgress[day.id]?.status === "Done").length;
    const completion = relatedDays.length ? Math.round((done / relatedDays.length) * 100) : 0;
    return { ...subject, completion, plannedDays: relatedDays.length };
  });
}
