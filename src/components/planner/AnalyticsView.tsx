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
import { calculateDailyScore } from "../../services/dailyScoreService";
import { calculateEnergyInsights } from "../../services/energyService";
import { calculateGymStreak } from "../../services/gymService";
import { detectResistanceTopics } from "../../services/disciplineService";
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
  const dailyScores = plannerData.days.slice(0, 14).map((day) => calculateDailyScore(state, day.date));
  const energy = calculateEnergyInsights(state);
  const resistance = detectResistanceTopics(state);
  const deepWorkTrend = Object.values(state.deepWorkSessions).slice(0, 10).map((session) => `${session.date}: ${session.completedMinutes}m`);
  const distractionTrend = Object.values(state.deepWorkSessions).slice(0, 10).map((session) => `${session.date}: ${session.distractions.length}`);
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
      <Panel title="Daily Score Trend" rows={dailyScores.map((score) => `${score.date}: ${score.score} (${score.label})`)} />
      <Panel title="Deep Work Trend" rows={deepWorkTrend} />
      <Panel title="Distraction Trend" rows={distractionTrend} />
      <Panel title="Energy vs Score" rows={[energy.energyVsScore, `Low sleep days: ${energy.lowSleepDays}`, `Low focus days: ${energy.lowFocusDays}`]} />
      <Panel title="Workout Consistency" rows={[`Gym streak: ${calculateGymStreak(state)} day(s)`, `Workout consistency: ${energy.workoutConsistency}%`]} />
      <Panel title="Resistance Topics" rows={resistance.map((row) => `${plannerData.topics.find((topic) => topic.id === row.topicId)?.title}: ${row.count} skips`)} />
      <Panel title="Skip Reasons" rows={Object.values(state.tasks).filter((task) => task.skipReason).map((task) => `${task.title}: ${task.skipReason}`).slice(0, 10)} />
    </section>
  );
}

function Panel({ title, rows }: { title: string; rows: string[] }) {
  return <article className="widePanel"><div className="panelTitle"><h2>{title}</h2></div>{rows.length ? <ul className="compactList">{rows.map((row) => <li key={row}>{row}</li>)}</ul> : <p className="emptyState">No data yet.</p>}</article>;
}
