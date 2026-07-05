import type { MockTest, PlannerState } from "../types/planner";
import { calculateMockAverage, calculatePYQAccuracy } from "../utils/examUtils";
import { addMistake } from "./mistakeService";

export function addMockTest(state: PlannerState, mock: Omit<MockTest, "id" | "accuracy">): PlannerState {
  const id = `mock-${Date.now()}`;
  const saved: MockTest = { ...mock, id, accuracy: calculatePYQAccuracy(mock.correct, mock.attempted) };
  let next: PlannerState = { ...state, mockTests: { ...state.mockTests, [id]: saved } };
  saved.topMistakes.forEach((mistake) => {
    if (mistake.count > 0 && saved.weakTopicIds[0]) {
      next = addMistake(next, {
        sourceType: "mock",
        sourceId: id,
        subjectId: saved.subjectWiseScore[0]?.subjectId ?? "",
        topicId: saved.weakTopicIds[0],
        mistakeType: mistake.mistakeType,
        questionLabel: `Mock ${saved.mockNumber} mistake cluster`,
        explanation: `${mistake.count} ${mistake.mistakeType} mistake(s) in mock.`,
        correctMethod: saved.actionPlan || "Analyze mock and retry weak topics.",
        retryDate: saved.date,
        isFixed: false
      });
    }
  });
  return next;
}

export function getMockSummary(state: PlannerState) {
  const mocks = Object.values(state.mockTests).sort((a, b) => a.date.localeCompare(b.date));
  return {
    mocks,
    average: calculateMockAverage(mocks),
    lastMock: mocks.at(-1),
    trend: mocks.map((mock) => ({ label: `Mock ${mock.mockNumber}`, score: mock.score }))
  };
}
