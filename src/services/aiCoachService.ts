import {
  examStrategyEngine,
  priorityEngine,
  readinessScore,
  targetScoreMetrics,
  weeklyReview,
  weakTopics
} from "./plannerService";
import type { PlannerState } from "../types/planner";

export type AICoachRequestKind =
  | "daily-plan-summary"
  | "weak-topic-explanation"
  | "recovery-plan"
  | "mock-analysis-summary"
  | "next-week-strategy";

export type AICoachPayload = {
  kind: AICoachRequestKind;
  state: PlannerState;
  topic?: string;
};

export async function requestAICoachSummary(payload: AICoachPayload) {
  try {
    const response = await fetch(`/api/ai-coach/${payload.kind}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (response.ok) {
      return response.json() as Promise<{ status: string; summary: string; inputs: unknown }>;
    }
  } catch {
    // Backend can be connected later; local fallback stays deterministic.
  }

  return localCoachFallback(payload);
}

export function localCoachFallback(payload: AICoachPayload) {
  const target = targetScoreMetrics(payload.state);
  const priorities = priorityEngine(payload.state).slice(0, 3).map((item) => `${item.subject}: ${item.topic}`);
  const weak = weakTopics(payload.state).slice(0, 3).map((item) => `${item.subject}: ${item.topic}`);
  const strategy = examStrategyEngine(payload.state);
  const review = weeklyReview(payload.state);

  return {
    status: "local-fallback",
    summary: [
      `Readiness ${readinessScore(payload.state)}%, target ${target.targetMarks}, gap ${target.scoreGap}.`,
      `Top priorities: ${priorities.join("; ") || "continue today's plan"}.`,
      `Weak repair: ${weak.join("; ") || "none detected yet"}.`,
      `Next week target: ${review.nextWeekTarget}.`
    ].join(" "),
    inputs: {
      kind: payload.kind,
      topic: payload.topic ?? null,
      target,
      strategy
    }
  };
}
