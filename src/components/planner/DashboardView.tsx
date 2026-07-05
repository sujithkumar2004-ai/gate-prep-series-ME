"use client";

import { AlertTriangle, BarChart3, CalendarDays, CheckCircle2, ClipboardList, Gauge, Target } from "lucide-react";
import type { PlannerState } from "../../types/planner";
import { getDashboardMetrics } from "../../services/plannerService";
import { getMockSummary } from "../../services/mockService";
import { calculatePriorityScore } from "../../services/priorityService";
import { getPYQSummary } from "../../services/pyqService";
import { calculateReadinessScore } from "../../services/readinessService";
import { calculateWeakTopics } from "../../services/weaknessService";
import { calculateStudyStreak } from "../../services/dailyScoreService";
import { deepWorkMinutesForDate, distractionCountForDate } from "../../services/deepWorkService";
import { calculateWeeklyReview } from "../../services/weeklyReviewService";
import { plannerData } from "../../lib/plannerData";
import { Metric } from "./Shared";
import type { DailyScore } from "../../types/planner";

export function DashboardView({ state, dailyScore }: { state: PlannerState; dailyScore: DailyScore }) {
  const metrics = getDashboardMetrics(state);
  const pyq = getPYQSummary(state);
  const mocks = getMockSummary(state);
  const readiness = calculateReadinessScore(state);
  const weakest = calculateWeakTopics(state)[0];
  const priority = calculatePriorityScore(state)[0];
  const weakestSubject = weakest ? plannerData.subjects.find((subject) => subject.id === weakest.subjectId)?.name ?? "-" : "-";
  const weakestTopic = weakest ? plannerData.topics.find((topic) => topic.id === weakest.topicId)?.title ?? "-" : "-";
  const priorityTopic = priority ? plannerData.topics.find((topic) => topic.id === priority.topicId)?.title ?? "-" : "-";
  const today = new Date().toISOString().slice(0, 10);
  const weekly = calculateWeeklyReview(state, today);
  const todayEnergy = Object.values(state.energyLogs).find((log) => log.date === today);
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
      <Metric icon={<Gauge />} label="Today Score" value={`${dailyScore.score}/100`} />
      <Metric icon={<CheckCircle2 />} label="Streak" value={`${calculateStudyStreak(state)} days`} />
      <Metric icon={<Target />} label="Deep Work" value={`${deepWorkMinutesForDate(state, today)}m`} />
      <Metric icon={<AlertTriangle />} label="Distractions" value={`${distractionCountForDate(state, today)}`} />
      <Metric icon={<BarChart3 />} label="Weekly Score" value={`${weekly.weeklyScore}`} />
      <Metric icon={<Gauge />} label="Energy Today" value={todayEnergy ? `${todayEnergy.energyLevel}/5` : "-"} />
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
      <article className="widePanel">
        <div className="panelTitle"><AlertTriangle size={18} /><h2>Recovery Warning</h2></div>
        <p>{dailyScore.score < 70 ? "Failed-day recovery is needed today." : "No recovery warning right now."}</p>
      </article>
    </section>
  );
}
