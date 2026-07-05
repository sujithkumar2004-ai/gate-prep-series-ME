import type { DailyScoreLabel, EmergencyMode, MistakeType } from "../types/planner";

export const examConfig = {
  examDate: "2027-02-07",
  syllabusCompletionDate: "2026-12-31",
  plannerStartDate: "2026-07-06",
  scoreParts: {
    conceptStudy: 25,
    pyqSolving: 25,
    revision: 20,
    mockErrorAnalysis: 20,
    discipline: 10
  },
  readinessWeights: {
    syllabusMastery: 0.3,
    pyqCompletion: 0.25,
    mockPerformance: 0.25,
    revisionConsistency: 0.1,
    disciplineScore: 0.1
  },
  revisionOffsets: [0, 1, 3, 7, 15, 30],
  mistakeTypes: [
    "Concept gap",
    "Formula mistake",
    "Calculation mistake",
    "Silly mistake",
    "Time pressure",
    "Wrong approach",
    "Memory gap",
    "Skipped revision"
  ] satisfies MistakeType[],
  emergencyModes: ["Normal Mode", "Backlog Mode", "Crash Mode", "Mock-Only Mode"] satisfies EmergencyMode[]
};

export function dailyScoreLabel(score: number): DailyScoreLabel {
  if (score >= 95) return "Superhuman Day";
  if (score >= 85) return "Strong Day";
  if (score >= 70) return "Acceptable Day";
  return "Failed Day";
}
