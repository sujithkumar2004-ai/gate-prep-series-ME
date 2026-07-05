import type { MistakeType, PlannerState, PYQSession } from "../types/planner";
import { calculatePYQAccuracy } from "../utils/examUtils";
import { addMistake } from "./mistakeService";
import { updateTopicAccuracy } from "./topicService";

export function savePYQSession(state: PlannerState, session: Omit<PYQSession, "id">): PlannerState {
  const id = `pyq-${Date.now()}`;
  const saved: PYQSession = { ...session, id };
  let next: PlannerState = { ...state, pyqSessions: { ...state.pyqSessions, [id]: saved } };
  next = updateTopicAccuracy(next, session.topicId, calculatePYQAccuracy(session.correctQuestions, session.totalQuestions));
  if (session.wrongQuestions > 0) {
    next = addMistake(next, {
      sourceType: "pyq",
      sourceId: id,
      subjectId: session.subjectId,
      topicId: session.topicId,
      mistakeType: "Concept gap" as MistakeType,
      questionLabel: `${session.sourceYear} PYQ wrong set`,
      explanation: session.notes || `${session.wrongQuestions} wrong question(s) in PYQ session.`,
      correctMethod: "Review concept notes, redo wrong PYQs, and add formula traps.",
      retryDate: session.date,
      isFixed: false
    });
  }
  return next;
}

export function getPYQSummary(state: PlannerState) {
  const sessions = Object.values(state.pyqSessions);
  const totalQuestions = sessions.reduce((sum, session) => sum + session.totalQuestions, 0);
  const correctQuestions = sessions.reduce((sum, session) => sum + session.correctQuestions, 0);
  const wrongQuestions = sessions.reduce((sum, session) => sum + session.wrongQuestions, 0);
  const timeSpentMinutes = sessions.reduce((sum, session) => sum + session.timeSpentMinutes, 0);
  return { totalQuestions, correctQuestions, wrongQuestions, timeSpentMinutes, accuracy: calculatePYQAccuracy(correctQuestions, totalQuestions) };
}
