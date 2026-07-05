import plannerJson from "../data/planner.json";
import { examConfig } from "../config/examConfig";
import type {
  BacklogItem,
  DailyProgress,
  EmergencyMode,
  Flashcard,
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
    gymLogs: [],
    targets: plannerData.defaultTargets,
    questionBank: plannerData.defaultQuestionBank,
    flashcards: plannerData.defaultFlashcards,
    deepWorkSessions: [],
    energyLogs: [],
    reminders: [
      { id: "daily-study", type: "Daily Study Start", title: "Start study block", dueAt: "07:00", enabled: true },
      { id: "weekly-review", type: "Weekly Review", title: "Weekly review", dueAt: "Sunday 18:00", enabled: true }
    ],
    examSimulations: []
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

export function currentMockAverage(state: PlannerState) {
  const scored = Object.values(state.mockTests).filter((mock) => typeof mock.score === "number");
  if (!scored.length) return 0;
  return Math.round(scored.reduce((sum, mock) => sum + (mock.score ?? 0), 0) / scored.length);
}

export function targetScoreMetrics(state: PlannerState) {
  const mockAverage = currentMockAverage(state);
  const scoreGap = Math.max(0, state.targets.targetMarks - mockAverage);
  const remainingWeeks = Math.max(1, Math.ceil((new Date(examDate).getTime() - Date.now()) / 604800000));
  return {
    ...state.targets,
    currentMockAverage: mockAverage,
    scoreGap,
    requiredWeeklyImprovement: Math.ceil(scoreGap / remainingWeeks)
  };
}

export function priorityEngine(state: PlannerState) {
  const mastery = topicMastery(state);
  const revisionDebtRows = revisionDebt(state);
  return mastery
    .map((topic) => {
      const subjectWeight =
        plannerData.syllabusMap.find((subject) => subject.subject === topic.subject)?.topics.reduce((sum, row) => sum + row.weightage, 0) ?? 1;
      const weaknessBoost = topic.mastery === "Weak" ? 40 : topic.backlogDays * 10;
      const revisionBoost = revisionDebtRows.some((debt) => debt.topic === topic.topic) ? 25 : 0;
      const difficultyBoost = /advanced|compressible|fatigue|numerical|network|thermodynamic/i.test(topic.topic) ? 15 : 5;
      return {
        ...topic,
        priorityScore: subjectWeight + weaknessBoost + revisionBoost + difficultyBoost
      };
    })
    .sort((a, b) => b.priorityScore - a.priorityScore)
    .slice(0, 20);
}

export function updateFlashcardRecall(card: Flashcard, rating: "forgot" | "partial" | "perfect"): Flashcard {
  const date = new Date();
  date.setDate(date.getDate() + (rating === "perfect" ? 7 : rating === "partial" ? 3 : 1));
  return { ...card, selfRating: rating, nextRevisionDate: date.toISOString().slice(0, 10) };
}

export function resistanceTopics(state: PlannerState) {
  const counts = new Map<string, number>();
  plannerData.daywisePlan.forEach((day) => {
    const progress = state.dailyProgress[day.id];
    if (progress?.skipReason.trim()) {
      counts.set(`${day.subject}: ${day.topic}`, (counts.get(`${day.subject}: ${day.topic}`) ?? 0) + 1);
    }
  });
  return Array.from(counts.entries())
    .filter(([, count]) => count >= 2)
    .map(([topic, count]) => ({ topic, skipped: count }));
}

export function needsRecoveryPlan(state: PlannerState) {
  const scores = plannerData.daywisePlan
    .map((day) => dailyScore(day, state.dailyProgress[day.id] ?? createInitialDailyProgress(day)))
    .slice(-2);
  return scores.length === 2 && scores.every((score) => score < 70);
}

export function restartTask(state: PlannerState) {
  const touched = plannerData.daywisePlan.some((day) => {
    const progress = state.dailyProgress[day.id];
    return progress && (progress.actualMinutes > 0 || progress.pyqSolved > 0 || progress.notes.trim());
  });
  return touched ? null : plannerData.daywisePlan[0];
}

export function weeklyReview(state: PlannerState) {
  const topicsCompleted = plannerData.daywisePlan.filter((day) => state.dailyProgress[day.id]?.status === "Done").length;
  const pyqSolved = plannerData.daywisePlan.reduce((sum, day) => sum + (state.dailyProgress[day.id]?.pyqSolved ?? 0), 0);
  return {
    week: "Current Week",
    topicsCompleted,
    pyqSolved,
    mockAverage: currentMockAverage(state),
    repeatedMistakes: resistanceTopics(state).map((item) => item.topic),
    backlogAdded: autoBacklog(state).length,
    backlogCleared: state.backlog.filter((item) => item.status === "Recovered").length,
    nextWeekTarget: priorityEngine(state)[0]?.topic ?? "Continue planned sequence",
    weeklyScore: Math.round(readinessScore(state) * 0.6 + Math.min(40, pyqSolved / 10))
  };
}

export function monthlyReview(state: PlannerState) {
  const completion = subjectCompletion(state);
  const readiness = readinessScore(state);
  const strongest = topicMastery(state).filter((topic) => topic.mastery === "Mastered").slice(0, 5);
  const weakest = weakTopics(state).slice(0, 5);
  return {
    month: "Current Month",
    syllabusCompletion: Math.round(completion.reduce((sum, row) => sum + row.completion, 0) / Math.max(completion.length, 1)),
    subjectReadiness: Object.fromEntries(completion.map((row) => [row.subject, row.completion])),
    mockAverage: currentMockAverage(state),
    strongestTopics: strongest.map((topic) => `${topic.subject}: ${topic.topic}`),
    weakestTopics: weakest.map((topic) => `${topic.subject}: ${topic.topic}`),
    revisionDelay: revisionDebt(state).length,
    expectedExamReadiness: readiness,
    nextMonthBattlePlan: priorityEngine(state).slice(0, 5).map((topic) => topic.topic).join("; ")
  };
}

export function revisionDebt(state: PlannerState) {
  const today = new Date().toISOString().slice(0, 10);
  return spacedRevisionSchedule(state)
    .filter((item) => item.revisionDate < today && !item.done)
    .map((item) => {
      const daysOverdue = Math.ceil((new Date(today).getTime() - new Date(item.revisionDate).getTime()) / 86400000);
      return {
        ...item,
        daysOverdue,
        riskLevel: daysOverdue > 14 ? "High" : daysOverdue > 7 ? "Medium" : "Low",
        debtScore: Math.min(100, daysOverdue * 5 + item.offsetDays)
      };
    });
}

export function confidenceAccuracyInsights(state: PlannerState) {
  const overconfidence = state.questionBank.filter((item) => (item.confidenceBefore ?? 0) >= 80 && item.correctAfter === false);
  const underconfidence = state.questionBank.filter((item) => (item.confidenceBefore ?? 0) < 50 && item.correctAfter === true);
  const lowConfidenceHighAccuracy = state.questionBank.filter((item) => item.accuracy >= 75 && (item.confidenceBefore ?? 0) < 50);
  return { overconfidence, underconfidence, lowConfidenceHighAccuracy };
}

export function energyCorrelation(state: PlannerState) {
  const logsWithScores = state.energyLogs.filter((log) => typeof log.linkedMockScore === "number");
  if (!logsWithScores.length) return "Add energy logs with linked mock scores to see correlation.";
  const avgSleep = logsWithScores.reduce((sum, log) => sum + log.sleepHours, 0) / logsWithScores.length;
  const avgScore = logsWithScores.reduce((sum, log) => sum + (log.linkedMockScore ?? 0), 0) / logsWithScores.length;
  return `Avg sleep ${avgSleep.toFixed(1)}h with linked mock average ${avgScore.toFixed(1)}.`;
}

export function examStrategyEngine(state: PlannerState) {
  const weak = weakTopics(state).slice(0, 3).map((topic) => topic.subject);
  const target = targetScoreMetrics(state);
  return [
    `First pass: secure GA, Maths, and strongest subject questions before risky attempts.`,
    `Avoid over-attempting weak areas: ${weak.join(", ") || "none detected yet"}.`,
    `Current score gap is ${target.scoreGap}; weekly improvement target is ${target.requiredWeeklyImprovement} marks.`,
    `Use final 20 minutes for NAT checks, unit checks, and negative-marking protection.`
  ];
}
