"use client";

import { plannerData } from "../../lib/plannerData";
import { calculateWeakTopics } from "../../services/weaknessService";
import type { PlannerState } from "../../types/planner";

export function WeaknessEngine({ state }: { state: PlannerState }) {
  const rows = calculateWeakTopics(state);
  return (
    <section className="coreGrid">
      <article className="widePanel">
        <div className="panelTitle"><h2>Weak Topics</h2></div>
        {!rows.length ? <p className="emptyState">No weak topics detected yet.</p> : (
          <ul className="coreList">{rows.map((row) => {
            const subject = plannerData.subjects.find((item) => item.id === row.subjectId);
            const topic = plannerData.topics.find((item) => item.id === row.topicId);
            return <li key={row.topicId}><span>{subject?.name}: {topic?.title} | score {row.weaknessScore} | {row.reason} | {row.recommendedAction}</span><strong>{row.priority}</strong></li>;
          })}</ul>
        )}
      </article>
    </section>
  );
}
