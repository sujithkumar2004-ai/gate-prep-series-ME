"use client";

import { useState } from "react";
import { plannerData } from "../../lib/plannerData";
import { dueRecallCards } from "../../services/activeRecallService";
import type { PlannerState, RecallRating } from "../../types/planner";

export function ActiveRecallView({ state, onRate }: { state: PlannerState; onRate: (id: string, rating: RecallRating) => void }) {
  const [openAnswers, setOpenAnswers] = useState<Record<string, boolean>>({});
  const cards = dueRecallCards(state);
  return (
    <section className="coreStack">
      {!cards.length ? <p className="emptyState">No recall cards due today.</p> : <div className="taskList">{cards.map((card) => (
        <article className="taskCard" key={card.id}>
          <span className="taskType">{card.cardType}</span>
          <h3>{card.front}</h3>
          {openAnswers[card.id] && <p>{card.back}</p>}
          <p>{plannerData.topics.find((topic) => topic.id === card.topicId)?.title} | confidence {card.confidence}/5 | next {card.nextReviewAt}</p>
          <div className="taskActions">
            <button className="iconTextButton" onClick={() => setOpenAnswers((current) => ({ ...current, [card.id]: !current[card.id] }))}>{openAnswers[card.id] ? "Hide" : "Show"} Answer</button>
            <button className="iconTextButton dangerAction" onClick={() => onRate(card.id, "forgot")}>Forgot</button>
            <button className="iconTextButton" onClick={() => onRate(card.id, "partial")}>Partial</button>
            <button className="iconTextButton" onClick={() => onRate(card.id, "perfect")}>Perfect</button>
          </div>
        </article>
      ))}</div>}
    </section>
  );
}
