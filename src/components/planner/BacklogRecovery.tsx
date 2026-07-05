"use client";

import { CheckCircle2, TimerReset } from "lucide-react";
import { formatDate, plannerData } from "../../lib/plannerData";
import { getBacklogRows } from "../../services/backlogService";
import type { BacklogItem, PlannerState } from "../../types/planner";

export function BacklogRecovery({
  state,
  onRecover
}: {
  state: PlannerState;
  onRecover: (backlogId: string) => void;
}) {
  const rows = getBacklogRows(state);
  return (
    <section className="coreGrid" aria-label="Backlog recovery">
      <BacklogList title="Active Backlog" rows={rows.active} onRecover={onRecover} />
      <BacklogList title="Recovered Backlog" rows={rows.recovered} onRecover={onRecover} recoveredOnly />
    </section>
  );
}

function BacklogList({
  title,
  rows,
  recoveredOnly,
  onRecover
}: {
  title: string;
  rows: (BacklogItem & { age: number })[];
  recoveredOnly?: boolean;
  onRecover: (backlogId: string) => void;
}) {
  return (
    <article className="widePanel">
      <div className="panelTitle"><TimerReset size={18} /><h2>{title}</h2></div>
      {!rows.length ? (
        <p className="emptyState">No backlog items.</p>
      ) : (
        <ul className="coreList">
          {rows.map((item) => {
            const topic = plannerData.topics.find((row) => row.id === item.topicId);
            return (
              <li key={item.id}>
                <span>
                  {topic?.title ?? item.title} | age {item.age} day(s) | recover {formatDate(item.recoveryDate)} | {item.priority}
                </span>
                {!recoveredOnly && (
                  <button className="iconTextButton" onClick={() => onRecover(item.id)}>
                    <CheckCircle2 size={15} /> Recovered
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </article>
  );
}
