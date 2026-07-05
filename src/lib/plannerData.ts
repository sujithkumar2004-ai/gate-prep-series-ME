import plannerJson from "../data/planner.json";
import type {
  BacklogItem,
  DailyProgress,
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
    actualHours: 0,
    pyqSolved: 0,
    revisionDone: false,
    workItems: day.workItems.map(() => ({ done: false })),
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
    expenses: [...plannerData.salaryExpense.fixedExpenses, ...plannerData.salaryExpense.studyBudget],
    salary: {
      monthlySalary: plannerData.salaryExpense.monthlySalary,
      savingsGoal: plannerData.salaryExpense.savingsGoal
    },
    gymRoutine: plannerData.gymRoutine
  };
}

export function dailyScore(day: PlannerDay, progress: DailyProgress) {
  const statusScore =
    progress.status === "Done" ? 35 : progress.status === "In Progress" ? 20 : progress.status === "Backlog" ? 5 : 0;
  const hourScore = day.targetHours ? Math.min(20, Math.round((progress.actualHours / day.targetHours) * 20)) : 10;
  const workScore = progress.workItems.length
    ? Math.round((progress.workItems.filter((item) => item.done).length / progress.workItems.length) * 20)
    : 0;
  const pyqScore = Math.min(15, Math.round((progress.pyqSolved / Math.max(day.pyqTarget, 1)) * 15));
  const notesScore = progress.revisionDone || progress.notes.trim() ? 10 : 0;
  return Math.max(0, Math.min(100, statusScore + hourScore + workScore + pyqScore + notesScore));
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
        pyqSolved: 0
      } satisfies TopicProgress);
    current.plannedDays += 1;
    current.doneDays += progress.status === "Done" ? 1 : 0;
    current.backlogDays += progress.status === "Backlog" ? 1 : 0;
    current.pyqSolved += progress.pyqSolved;
    grouped.set(key, current);
  });

  return Array.from(grouped.values()).map((topic) => {
    const ratio = topic.doneDays / Math.max(topic.plannedDays, 1);
    let mastery: MasteryStatus = "Not Started";
    if (topic.backlogDays > 0) mastery = "Weak";
    else if (ratio >= 0.9 && topic.pyqSolved >= 40) mastery = "Mastered";
    else if (ratio >= 0.5 || topic.pyqSolved > 0) mastery = "Practicing";
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
  return plannerData.daywisePlan
    .filter((day) => state.dailyProgress[day.id]?.status === "Backlog")
    .map((day, index) => ({
      id: `auto-backlog-${day.id}`,
      date: day.date,
      subject: day.subject,
      topic: day.topic,
      reason: state.dailyProgress[day.id]?.notes || "Marked as backlog",
      recoveryDate: plannerData.daywisePlan[Math.min(plannerData.daywisePlan.length - 1, index + 3)]?.date ?? day.date,
      status: "Scheduled"
    }));
}

export function spacedRevisionSchedule(state: PlannerState): RevisionSchedule[] {
  const offsets = plannerData.intelligenceRules.spacedRevisionOffsets;
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
  const doneRatio =
    days.filter((day) => state.dailyProgress[day.id]?.status === "Done").length / Math.max(days.length, 1);
  const pyqTarget = days.reduce((sum, day) => sum + day.pyqTarget, 0);
  const pyqDone = days.reduce((sum, day) => sum + (state.dailyProgress[day.id]?.pyqSolved ?? 0), 0);
  const pyqRatio = Math.min(1, pyqDone / Math.max(pyqTarget, 1));
  const mocks = Object.values(state.mockTests);
  const scoredMocks = mocks.filter((mock) => typeof mock.score === "number");
  const mockRatio = scoredMocks.length
    ? Math.min(1, scoredMocks.reduce((sum, mock) => sum + (mock.score ?? 0), 0) / scoredMocks.length / 80)
    : 0;
  const weaknessRecovery = 1 - Math.min(1, weakTopics(state).length / 12);
  return Math.round((0.35 * doneRatio + 0.25 * pyqRatio + 0.25 * mockRatio + 0.15 * weaknessRecovery) * 100);
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
