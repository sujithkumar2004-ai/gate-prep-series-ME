import { calculateNextRecallDate } from "../utils/disciplineUtils";
import type { ActiveRecallCard, PlannerState, RecallRating } from "../types/planner";

export function addActiveRecallCard(state: PlannerState, card: Omit<ActiveRecallCard, "id" | "createdAt">): PlannerState {
  const id = `recall-${Date.now()}`;
  return {
    ...state,
    activeRecallCards: {
      ...state.activeRecallCards,
      [id]: { ...card, id, createdAt: new Date().toISOString() }
    }
  };
}

export function rateRecallCard(state: PlannerState, cardId: string, rating: RecallRating): PlannerState {
  const card = state.activeRecallCards[cardId];
  if (!card) return state;
  const today = new Date().toISOString().slice(0, 10);
  return {
    ...state,
    activeRecallCards: {
      ...state.activeRecallCards,
      [cardId]: {
        ...card,
        rating,
        confidence: rating === "perfect" ? 5 : rating === "partial" ? 3 : 1,
        lastReviewedAt: new Date().toISOString(),
        nextReviewAt: calculateNextRecallDate(today, rating)
      }
    }
  };
}

export function dueRecallCards(state: PlannerState, date = new Date().toISOString().slice(0, 10)) {
  return Object.values(state.activeRecallCards).filter((card) => card.nextReviewAt <= date).sort((a, b) => a.nextReviewAt.localeCompare(b.nextReviewAt));
}
