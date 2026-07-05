"use client";

import { plannerData } from "../../lib/plannerData";
import { getBacklogRows } from "../../services/backlogService";
import { getMockSummary } from "../../services/mockService";
import { calculatePriorityScore } from "../../services/priorityService";
import { getPYQSummary } from "../../services/pyqService";
import { calculateReadinessScore } from "../../services/readinessService";
import { getRevisionBuckets } from "../../services/revisionService";
import { getTopicRows } from "../../services/topicService";
import { calculateWeakTopics } from "../../services/weaknessService";
import type { PlannerState } from "../../types/planner";

export function AnalyticsView({ state }: { state: PlannerState }) {
  const readiness = calculateReadinessScore(state);
  const pyq = getPYQSummary(state);
  const mocks = getMockSummary(state);
  const revisions = getRevisionBuckets(state);
  const backlog = getBacklogRows(state);
  const weak = calculateWeakTopics(state);
  const priorities = calculatePriorityScore(state).slice(0, 8);
  const topics = getTopicRows(state);
  const subjectCompletion = plannerData.subjects.map((subject) => {
    const rows = topics.filter((topic) => topic.subjectId === subject.id);
    const started = rows.filter((topic) => topic.progress.status !== "Not Started").length;
    return `${subject.name}: ${rows.length ? Math.round((started / rows.length) * 100) : 0}%`;
  });
  return (
    <section className="coreGrid">
      <Panel title="Readiness Breakdown" rows={[`Overall ${readiness.overall}%`, `Syllabus ${readiness.syllabusMastery}%`, `PYQ ${readiness.pyqCompletion}%`, `Mock ${readiness.mockPerformance}%`, `Revision ${readiness.revisionConsistency}%`, `Discipline ${readiness.disciplineScore}%`]} />
      <Panel title="Subject Completion" rows={subjectCompletion} />
      <Panel title="Topic Mastery" rows={topics.slice(0, 10).map((topic) => `${topic.subjectName}: ${topic.progress.status}`)} />
      <Panel title="Mock Score Trend" rows={mocks.trend.map((item) => `${item.label}: ${item.score}`)} />
      <Panel title="PYQ Accuracy Trend" rows={[`Solved ${pyq.totalQuestions}`, `Accuracy ${pyq.accuracy}%`, `Wrong ${pyq.wrongQuestions}`]} />
      <Panel title="Revision Consistency" rows={[`Due today ${revisions.dueToday.length}`, `Overdue ${revisions.overdue.length}`, `Completed ${revisions.completed.length}`]} />
      <Panel title="Backlog Trend" rows={[`Active ${backlog.active.length}`, `Recovered ${backlog.recovered.length}`]} />
      <Panel title="Weak Topic Heatmap" rows={weak.slice(0, 8).map((row) => `${plannerData.topics.find((topic) => topic.id === row.topicId)?.title}: ${row.weaknessScore}`)} />
      <Panel title="Priority Engine" rows={priorities.map((row) => `${plannerData.topics.find((topic) => topic.id === row.topicId)?.title}: ${row.score}`)} />
    </section>
  );
}

function Panel({ title, rows }: { title: string; rows: string[] }) {
  return <article className="widePanel"><div className="panelTitle"><h2>{title}</h2></div>{rows.length ? <ul className="compactList">{rows.map((row) => <li key={row}>{row}</li>)}</ul> : <p className="emptyState">No data yet.</p>}</article>;
}
