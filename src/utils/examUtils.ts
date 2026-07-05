import type { Mistake, MockTest, PlannerState, PriorityScore, ReadinessScore, WeakTopic } from "../types/planner";
import { calculateMasteredPercentage, getTopicRows } from "../services/topicService";
import { finalExamDate, plannerData } from "../lib/plannerData";

export function calculatePYQAccuracy(correct: number, total: number) {
  return total ? Math.round((correct / total) * 100) : 0;
}

export function calculateMockAverage(mocks: MockTest[]) {
  return mocks.length ? Math.round(mocks.reduce((sum, mock) => sum + mock.score, 0) / mocks.length) : 0;
}

export function groupMistakesByType(mistakes: Mistake[]) {
  return mistakes.reduce<Record<string, number>>((acc, mistake) => {
    acc[mistake.mistakeType] = (acc[mistake.mistakeType] ?? 0) + 1;
    return acc;
  }, {});
}

export function groupMistakesByTopic(mistakes: Mistake[]) {
  return mistakes.reduce<Record<string, number>>((acc, mistake) => {
    acc[mistake.topicId] = (acc[mistake.topicId] ?? 0) + 1;
    return acc;
  }, {});
}

export function detectRepeatedMistakes(mistakes: Mistake[]) {
  return Object.entries(groupMistakesByTopic(mistakes))
    .filter(([, count]) => count >= 2)
    .map(([topicId, count]) => ({ topicId, count }));
}

export function calculateMistakeStats(mistakes: Mistake[]) {
  return {
    total: mistakes.length,
    fixed: mistakes.filter((mistake) => mistake.isFixed).length,
    open: mistakes.filter((mistake) => !mistake.isFixed).length,
    byType: groupMistakesByType(mistakes),
    repeated: detectRepeatedMistakes(mistakes)
  };
}

export function calculateRequiredScoreImprovement(state: PlannerState, targetScore = 85) {
  const lastMock = Object.values(state.mockTests).sort((a, b) => b.date.localeCompare(a.date))[0];
  return Math.max(0, targetScore - (lastMock?.score ?? 0));
}

export function calculateReadinessScore(state: PlannerState): ReadinessScore {
  const topicRows = getTopicRows(state);
  const syllabusMastery = calculateMasteredPercentage(state);
  const pyqTarget = Math.max(1, topicRows.length * 30);
  const pyqSolved = Object.values(state.pyqSessions).reduce((sum, session) => sum + session.totalQuestions, 0);
  const pyqCompletion = Math.min(100, Math.round((pyqSolved / pyqTarget) * 100));
  const mockPerformance = Math.min(100, Math.round((calculateMockAverage(Object.values(state.mockTests)) / 100) * 100));
  const totalRevisions = Object.values(state.revisions);
  const revisionConsistency = totalRevisions.length
    ? Math.round((totalRevisions.filter((revision) => revision.status === "completed").length / totalRevisions.length) * 100)
    : 0;
  const tasks = Object.values(state.tasks);
  const disciplineScore = tasks.length ? Math.round((tasks.filter((task) => task.status === "completed").length / tasks.length) * 100) : 50;
  const overall = Math.round(
    0.3 * syllabusMastery +
      0.25 * pyqCompletion +
      0.25 * mockPerformance +
      0.1 * revisionConsistency +
      0.1 * disciplineScore
  );
  return {
    overall,
    syllabusMastery,
    pyqCompletion,
    mockPerformance,
    revisionConsistency,
    disciplineScore,
    requiredScoreImprovement: calculateRequiredScoreImprovement(state)
  };
}

export function calculateWeakTopics(state: PlannerState): WeakTopic[] {
  const mistakesByTopic = groupMistakesByTopic(Object.values(state.mistakes));
  const mockWeakIds = Object.values(state.mockTests).flatMap((mock) => mock.weakTopicIds);
  const skippedByTopic = Object.values(state.tasks).reduce<Record<string, number>>((acc, task) => {
    if (task.status === "skipped") acc[task.topicId] = (acc[task.topicId] ?? 0) + 1;
    return acc;
  }, {});

  return plannerData.topics
    .map((topic) => {
      const pyqSessions = Object.values(state.pyqSessions).filter((session) => session.topicId === topic.id);
      const pyqQuestions = pyqSessions.reduce((sum, session) => sum + session.totalQuestions, 0);
      const pyqCorrect = pyqSessions.reduce((sum, session) => sum + session.correctQuestions, 0);
      const pyqAccuracy = calculatePYQAccuracy(pyqCorrect, pyqQuestions);
      const lowPyq = pyqQuestions > 0 && pyqAccuracy < 60 ? 25 : 0;
      const mistakes = (mistakesByTopic[topic.id] ?? 0) * 12;
      const mockWeak = mockWeakIds.filter((id) => id === topic.id).length * 18;
      const overdueRevision = Object.values(state.revisions).some((revision) => revision.topicId === topic.id && revision.status === "pending" && revision.dueDate < new Date().toISOString().slice(0, 10)) ? 15 : 0;
      const skipped = (skippedByTopic[topic.id] ?? 0) * 10;
      const weaknessScore = Math.min(100, lowPyq + mistakes + mockWeak + overdueRevision + skipped);
      const reasons = [
        lowPyq ? "low PYQ accuracy" : "",
        mistakes ? "repeated mistakes" : "",
        mockWeak ? "mock weakness" : "",
        overdueRevision ? "overdue revision" : "",
        skipped ? "skipped tasks" : ""
      ].filter(Boolean);
      return {
        subjectId: topic.subjectId,
        topicId: topic.id,
        weaknessScore,
        reason: reasons.join(", ") || "stable",
        recommendedAction: weaknessScore >= 60 ? "Repair concept, redo PYQs, then revise within 48 hours" : "Keep in normal revision loop",
        priority: weaknessScore >= 60 ? "High" : weaknessScore >= 30 ? "Medium" : "Low",
        lastActivityDate: pyqSessions.at(-1)?.date
      } satisfies WeakTopic;
    })
    .filter((row) => row.weaknessScore > 0)
    .sort((a, b) => b.weaknessScore - a.weaknessScore);
}

export function calculatePriorityScore(state: PlannerState): PriorityScore[] {
  const weakRows = calculateWeakTopics(state);
  const weakMap = new Map(weakRows.map((row) => [row.topicId, row.weaknessScore]));
  const remainingDays = Math.max(1, Math.ceil((new Date(finalExamDate).getTime() - Date.now()) / 86400000));
  return getTopicRows(state)
    .map((topic) => {
      const backlog = Object.values(state.backlog).some((item) => item.topicId === topic.id && item.status === "active") ? 20 : 0;
      const mockMistake = Object.values(state.mockTests).some((mock) => mock.retryTopicIds.includes(topic.id)) ? 18 : 0;
      const revisionOverdue = topic.progress.nextRevisionDate && topic.progress.nextRevisionDate < new Date().toISOString().slice(0, 10) ? 15 : 0;
      const statusPenalty = topic.progress.status === "Not Started" ? 12 : topic.progress.status === "Weak" ? 20 : 0;
      const score = topic.weightage * 6 + (weakMap.get(topic.id) ?? 0) + backlog + mockMistake + revisionOverdue + statusPenalty + Math.round(45 / remainingDays);
      return {
        subjectId: topic.subjectId,
        topicId: topic.id,
        score,
        reason: `weight ${topic.weightage}, weakness ${weakMap.get(topic.id) ?? 0}, status ${topic.progress.status}`
      };
    })
    .sort((a, b) => b.score - a.score);
}
