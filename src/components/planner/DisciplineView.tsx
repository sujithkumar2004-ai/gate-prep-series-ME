"use client";

import { plannerData } from "../../lib/plannerData";
import { calculateDailyScore } from "../../services/dailyScoreService";
import { detectResistanceTopics, generateRecoveryPlan } from "../../services/disciplineService";
import type { PlannerState } from "../../types/planner";

export function DisciplineView({ state }: { state: PlannerState }) {
  const score = calculateDailyScore(state);
  const resistance = detectResistanceTopics(state);
  const recovery = generateRecoveryPlan(state);
  return (
    <section className="coreGrid">
      <article className="widePanel"><div className="panelTitle"><h2>Today&apos;s Score</h2></div><strong className="modeText">{score.score}/100</strong><p>{score.label}</p></article>
      <article className="widePanel"><div className="panelTitle"><h2>Recovery Plan</h2></div><ul className="compactList"><li>Restart: {recovery.restartTask}</li><li>Resistance: {recovery.resistanceTopic}</li><li>Overdue: {recovery.overdueTask}</li><li>{recovery.deepWorkBlock}</li><li>{recovery.backlogSuggestion}</li></ul></article>
      <article className="widePanel"><div className="panelTitle"><h2>Resistance Topics</h2></div>{resistance.length ? <ul className="coreList">{resistance.map((row) => <li key={row.topicId}><span>{plannerData.topics.find((topic) => topic.id === row.topicId)?.title}: skipped {row.count} times</span></li>)}</ul> : <p className="emptyState">No resistance topic yet.</p>}</article>
    </section>
  );
}
