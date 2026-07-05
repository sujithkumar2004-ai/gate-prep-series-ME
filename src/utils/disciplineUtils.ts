import { addDays, daysBetween, todayIso } from "./dateUtils";
import { calculatePriorityScore } from "./examUtils";
import type { DailyScore, DailyScoreLabel, PlannerState, RecallRating, WeeklyReview, MonthlyReview } from "../types/planner";
import { calculateReadinessScore } from "../services/readinessService";
import { calculateSyllabusCoverage, getTopicRows } from "../services/topicService";
import { calculateWeakTopics } from "../services/weaknessService";
import { getMockSummary } from "../services/mockService";
import { getPYQSummary } from "../services/pyqService";
import { plannerData } from "../lib/plannerData";

export function getDailyScoreLabel(score: number): DailyScoreLabel {
  if (score >= 95) return "Superhuman Day";
  if (score >= 85) return "Strong Day";
  if (score >= 70) return "Acceptable Day";
  return "Failed Day";
}

export function calculateDailyScore(state: PlannerState, date = todayIso()): DailyScore {
  const tasks = Object.values(state.tasks).filter((task) => task.date === date);
  const completed = (type: string) => tasks.some((task) => task.type === type && task.status === "completed");
  const plannedMinutes = tasks.reduce((sum, task) => sum + task.plannedMinutes, 0);
  const actualMinutes = tasks.reduce((sum, task) => sum + task.actualMinutes, 0);
  const skipped = tasks.filter((task) => task.status === "skipped").length;
  const deepWorkMinutes = Object.values(state.deepWorkSessions).filter((session) => session.date === date && session.status === "completed").reduce((sum, session) => sum + session.completedMinutes, 0);
  const distractions = Object.values(state.deepWorkSessions).filter((session) => session.date === date).reduce((sum, session) => sum + session.distractions.length, 0);
  const conceptStudy = completed("concept") ? 25 : 0;
  const pyqSolving = completed("pyq") ? 25 : 0;
  const revision = completed("revision") ? 20 : 0;
  const mockErrorAnalysis = Object.values(state.mockTests).some((mock) => mock.date === date && mock.actionPlan.trim()) || Object.values(state.mistakes).some((mistake) => mistake.createdAt.slice(0, 10) === date) ? 20 : 0;
  const disciplineBase = plannedMinutes ? Math.min(10, Math.round((actualMinutes / plannedMinutes) * 10)) : 0;
  const skippedPenalty = skipped * 5;
  const distractionPenalty = distractions * 2;
  const deepWorkBonus = deepWorkMinutes >= 90 ? 5 : deepWorkMinutes >= 25 ? 2 : 0;
  const raw = conceptStudy + pyqSolving + revision + mockErrorAnalysis + disciplineBase + deepWorkBonus - skippedPenalty - distractionPenalty;
  const score = Math.max(0, Math.min(100, raw));
  return { date, score, label: getDailyScoreLabel(score), conceptStudy, pyqSolving, revision, mockErrorAnalysis, discipline: disciplineBase, skippedPenalty, distractionPenalty, deepWorkBonus };
}

export function calculateStudyStreak(state: PlannerState, date = todayIso()) {
  let streak = 0;
  let cursor = date;
  while (calculateDailyScore(state, cursor).score >= 70) {
    streak += 1;
    cursor = addDays(cursor, -1);
    if (streak > 365) break;
  }
  return streak;
}

export function detectResistanceTopics(state: PlannerState) {
  const counts = Object.values(state.tasks).reduce<Record<string, number>>((acc, task) => {
    if (task.status === "skipped") acc[task.topicId] = (acc[task.topicId] ?? 0) + 1;
    return acc;
  }, {});
  return Object.entries(counts).filter(([, count]) => count >= 2).map(([topicId, count]) => ({ topicId, count }));
}

export function detectConsecutiveFailedDays(state: PlannerState, date = todayIso()) {
  return [date, addDays(date, -1)].every((day) => calculateDailyScore(state, day).score < 70);
}

export function generateRecoveryPlan(state: PlannerState, date = todayIso()) {
  const smallestTask = Object.values(state.tasks).filter((task) => task.status === "pending").sort((a, b) => a.plannedMinutes - b.plannedMinutes)[0];
  const resistance = detectResistanceTopics(state)[0];
  const overdueTask = calculatePriorityScore(state)[0];
  const activeBacklog = Object.values(state.backlog).find((item) => item.status === "active");
  return {
    triggered: detectConsecutiveFailedDays(state, date) || Boolean(resistance) || Boolean(activeBacklog),
    restartTask: smallestTask?.title ?? "Start with 25 minutes of formula revision",
    resistanceTopic: resistance ? plannerData.topics.find((topic) => topic.id === resistance.topicId)?.title ?? resistance.topicId : "None detected",
    overdueTask: overdueTask ? plannerData.topics.find((topic) => topic.id === overdueTask.topicId)?.title ?? overdueTask.topicId : "No overdue priority",
    deepWorkBlock: "Run one Pomodoro now; if completed, do one 90-minute block in the evening.",
    backlogSuggestion: activeBacklog ? `Recover: ${activeBacklog.title}` : "No active backlog recovery needed."
  };
}

export function calculateNextRecallDate(date: string, rating: RecallRating) {
  return addDays(date, rating === "perfect" ? 7 : rating === "partial" ? 3 : 1);
}

export function calculateWeeklyReview(state: PlannerState, weekStartDate: string, reflectionNotes = ""): WeeklyReview {
  const weekEndDate = addDays(weekStartDate, 6);
  const dates = plannerData.days.filter((day) => day.date >= weekStartDate && day.date <= weekEndDate).map((day) => day.date);
  const scores = dates.map((date) => calculateDailyScore(state, date));
  const topicsCompleted = Object.values(state.tasks).filter((task) => dates.includes(task.date) && task.type === "concept" && task.status === "completed").length;
  const pyqsSolved = Object.values(state.pyqSessions).filter((session) => dates.includes(session.date)).reduce((sum, session) => sum + session.totalQuestions, 0);
  const mocksCompleted = Object.values(state.mockTests).filter((mock) => dates.includes(mock.date)).length;
  const averageDailyScore = scores.length ? Math.round(scores.reduce((sum, score) => sum + score.score, 0) / scores.length) : 0;
  const best = scores.toSorted((a, b) => b.score - a.score)[0];
  const worst = scores.toSorted((a, b) => a.score - b.score)[0];
  const revisionRows = Object.values(state.revisions).filter((revision) => revision.dueDate >= weekStartDate && revision.dueDate <= weekEndDate);
  return {
    id: `week-${weekStartDate}`,
    weekStartDate,
    weekEndDate,
    topicsCompleted,
    pyqsSolved,
    mocksCompleted,
    averageDailyScore,
    bestDay: best?.date,
    worstDay: worst?.date,
    mistakesRepeated: Object.values(state.mistakes).filter((mistake) => !mistake.isFixed).length,
    backlogAdded: Object.values(state.backlog).filter((item) => item.date >= weekStartDate && item.date <= weekEndDate).length,
    backlogCleared: Object.values(state.backlog).filter((item) => item.recoveredAt?.slice(0, 10) && item.recoveredAt.slice(0, 10) >= weekStartDate && item.recoveredAt.slice(0, 10) <= weekEndDate).length,
    revisionConsistency: revisionRows.length ? Math.round((revisionRows.filter((revision) => revision.status === "completed").length / revisionRows.length) * 100) : 0,
    nextWeekTarget: calculatePriorityScore(state)[0]?.reason ?? "Continue core plan",
    weeklyScore: averageDailyScore,
    reflectionNotes
  };
}

export function calculateMonthlyReview(state: PlannerState, month: string, reflectionNotes = ""): MonthlyReview {
  const topicRows = getTopicRows(state);
  const weak = calculateWeakTopics(state);
  const mockSummary = getMockSummary(state);
  const scores = plannerData.days.filter((day) => day.date.startsWith(month)).map((day) => calculateDailyScore(state, day.date));
  const subjectWiseReadiness = Object.fromEntries(plannerData.subjects.map((subject) => {
    const rows = topicRows.filter((topic) => topic.subjectId === subject.id);
    const mastered = rows.filter((topic) => topic.progress.status === "Mastered").length;
    return [subject.name, rows.length ? Math.round((mastered / rows.length) * 100) : 0];
  }));
  return {
    id: `month-${month}`,
    month,
    syllabusCompletion: calculateSyllabusCoverage(state),
    subjectWiseReadiness,
    mockAverage: mockSummary.average,
    strongestTopics: topicRows.filter((topic) => topic.progress.status === "Mastered").slice(0, 5).map((topic) => topic.title),
    weakestTopics: weak.slice(0, 5).map((topic) => plannerData.topics.find((row) => row.id === topic.topicId)?.title ?? topic.topicId),
    revisionDelay: Object.values(state.revisions).filter((revision) => revision.status === "pending" && revision.dueDate < todayIso()).length,
    dailyScoreAverage: scores.length ? Math.round(scores.reduce((sum, score) => sum + score.score, 0) / scores.length) : 0,
    backlogTrend: `${Object.values(state.backlog).filter((item) => item.status === "active").length} active backlog item(s)`,
    expectedExamReadiness: calculateReadinessScore(state).overall,
    nextMonthBattlePlan: calculatePriorityScore(state).slice(0, 4).map((row) => plannerData.topics.find((topic) => topic.id === row.topicId)?.title ?? row.topicId).join("; "),
    reflectionNotes
  };
}

export function calculateEnergyInsights(state: PlannerState) {
  const logs = Object.values(state.energyLogs);
  const lowSleepDays = logs.filter((log) => log.sleepHours < 6).length;
  const lowFocusDays = logs.filter((log) => log.focusLevel <= 2).length;
  const energyScorePairs = logs.map((log) => ({ energy: log.energyLevel, score: calculateDailyScore(state, log.date).score }));
  const workoutDays = logs.filter((log) => log.workoutDone).length;
  const workoutConsistency = logs.length ? Math.round((workoutDays / logs.length) * 100) : 0;
  return {
    lowSleepDays,
    lowFocusDays,
    energyVsScore: energyScorePairs.map((row) => `Energy ${row.energy}/5 -> score ${row.score}`).join(" | ") || "Add energy logs to see relation.",
    workoutConsistency,
    workoutVsStudy: workoutDays ? "Workout logged on study days; keep it short near mocks." : "No workout consistency data yet."
  };
}

export function calculateGymStreak(state: PlannerState, date = todayIso()) {
  let streak = 0;
  let cursor = date;
  while (Object.values(state.gymLogs).some((log) => log.date === cursor && log.workoutCompleted)) {
    streak += 1;
    cursor = addDays(cursor, -1);
    if (streak > 60) break;
  }
  return streak;
}
