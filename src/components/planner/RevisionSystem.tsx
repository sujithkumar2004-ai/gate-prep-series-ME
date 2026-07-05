"use client";

import { CheckCircle2, RotateCcw } from "lucide-react";
import { formatDate, plannerData } from "../../lib/plannerData";
import { getRevisionBuckets } from "../../services/revisionService";
import type { PlannerState, RevisionItem } from "../../types/planner";

export function RevisionSystem({
  state,
  onCompleteRevision
}: {
  state: PlannerState;
  onCompleteRevision: (revisionId: string) => void;
}) {
  const buckets = getRevisionBuckets(state);
  return (
    <section className="coreGrid" aria-label="Revision system">
      <RevisionList title="Due Today" rows={buckets.dueToday} onCompleteRevision={onCompleteRevision} />
      <RevisionList title="Overdue" rows={buckets.overdue} onCompleteRevision={onCompleteRevision} />
      <RevisionList title="Upcoming" rows={buckets.upcoming} onCompleteRevision={onCompleteRevision} />
      <RevisionList title="Completed" rows={buckets.completed} onCompleteRevision={onCompleteRevision} completedOnly />
    </section>
  );
}

function RevisionList({
  title,
  rows,
  completedOnly,
  onCompleteRevision
}: {
  title: string;
  rows: RevisionItem[];
  completedOnly?: boolean;
  onCompleteRevision: (revisionId: string) => void;
}) {
  return (
    <article className="widePanel">
      <div className="panelTitle"><RotateCcw size={18} /><h2>{title}</h2></div>
      {!rows.length ? (
        <p className="emptyState">No revisions here yet.</p>
      ) : (
        <ul className="coreList">
          {rows.slice(0, 20).map((revision) => {
            const topic = plannerData.topics.find((item) => item.id === revision.topicId);
            return (
              <li key={revision.id}>
                <span>{formatDate(revision.dueDate)} - {revision.cycle}: {topic?.title ?? revision.title}</span>
                {!completedOnly && (
                  <button className="iconTextButton" onClick={() => onCompleteRevision(revision.id)}>
                    <CheckCircle2 size={15} /> Complete
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
