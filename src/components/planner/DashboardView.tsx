"use client";

import { AlertTriangle, CalendarDays, CheckCircle2, ClipboardList, Gauge, Target } from "lucide-react";
import type { PlannerState } from "../../types/planner";
import { getDashboardMetrics } from "../../services/plannerService";
import { getMockSummary } from "../../services/mockService";
import { calculatePriorityScore } from "../../services/priorityService";
import { getPYQSummary } from "../../services/pyqService";
import { calculateReadinessScore } from "../../services/readinessService";
import { calculateWeakTopics } from "../../services/weaknessService";
import { plannerData } from "../../lib/plannerData";
import { Metric } from "./Shared";

export function DashboardView({ state }: { state: PlannerState }) {
  const metrics = getDashboardMetrics(state);
  const pyq = getPYQSummary(state);
  const mocks = getMockSummary(state);
  const readiness = calculateReadinessScore(state);
  const weakest = calculateWeakTopics(state)[0];
  const priority = calculatePriorityScore(state)[0];
  const weakestSubject = weakest ? plannerData.subjects.find((subject) => subject.id === weakest.subjectId)?.name ?? "-" : "-";
  const weakestTopic = weakest ? plannerData.topics.find((topic) => topic.id === weakest.topicId)?.title ?? "-" : "-";
  const priorityTopic = priority ? plannerData.topics.find((topic) => topic.id === priority.topicId)?.title ?? "-" : "-";
  return (
    <section className="coreGrid" aria-label="Core dashboard">
      <Metric icon={<CalendarDays />} label="Days to Exam" value={metrics.daysLeftForExam.toString()} />
      <Metric icon={<CalendarDays />} label="Days to Lock" value={metrics.daysLeftForSyllabusLock.toString()} />
      <Metric icon={<ClipboardList />} label="Syllabus Coverage" value={`${metrics.syllabusCoverage}%`} />
      <Metric icon={<CheckCircle2 />} label="Mastered Topics" value={`${metrics.masteredTopics}%`} />
      <Metric icon={<AlertTriangle />} label="Backlog" value={metrics.backlogCount.toString()} />
      <Metric icon={<Gauge />} label="Avg Completion" value={`${metrics.averageDailyCompletion}%`} />
      <Metric icon={<ClipboardList />} label="PYQ Completion" value={`${pyq.accuracy}% acc`} />
      <Metric icon={<Target />} label="Mock Average" value={`${mocks.average}`} />
      <Metric icon={<Target />} label="Last Mock" value={`${mocks.lastMock?.score ?? 0}`} />
      <Metric icon={<Gauge />} label="Readiness" value={`${readiness.overall}%`} />
      <Metric icon={<Target />} label="Score Gap" value={`${readiness.requiredScoreImprovement}`} />
      <article className="widePanel">
        <div className="panelTitle"><Target size={18} /><h2>Today&apos;s Priority</h2></div>
        <p>{priorityTopic || metrics.todayPriority}</p>
      </article>
      <article className="widePanel">
        <div className="panelTitle"><Gauge size={18} /><h2>Current Mode</h2></div>
        <strong className="modeText">{metrics.currentMode}</strong>
      </article>
      <article className="widePanel">
        <div className="panelTitle"><AlertTriangle size={18} /><h2>Weakest Area</h2></div>
        <p>{weakestSubject}: {weakestTopic}</p>
      </article>
    </section>
  );
}
