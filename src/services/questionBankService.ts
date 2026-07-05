import type { PlannerState, QuestionBankItem } from "../types/planner";

export function addQuestionBankItem(state: PlannerState, item: Omit<QuestionBankItem, "id">): PlannerState {
  const id = `question-${Date.now()}`;
  return { ...state, questionBank: { ...state.questionBank, [id]: { ...item, id } } };
}

export function updateQuestionBankItem(state: PlannerState, id: string, patch: Partial<QuestionBankItem>): PlannerState {
  const item = state.questionBank[id];
  if (!item) return state;
  return { ...state, questionBank: { ...state.questionBank, [id]: { ...item, ...patch } } };
}
