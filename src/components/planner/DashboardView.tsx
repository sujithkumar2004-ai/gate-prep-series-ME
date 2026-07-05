"use client";

import { AlertTriangle, CalendarDays, CheckCircle2, ClipboardList, Gauge, Target } from "lucide-react";
import type { PlannerState } from "../../types/planner";
import { getDashboardMetrics } from "../../services/plannerService";
import { Metric } from "./Shared";

export function DashboardView({ state }: { state: PlannerState }) {
  const metrics = getDashboardMetrics(state);
  return (
    <section className="coreGrid" aria-label="Core dashboard">
      <Metric icon={<CalendarDays />} label="Days to Exam" value={metrics.daysLeftForExam.toString()} />
      <Metric icon={<CalendarDays />} label="Days to Lock" value={metrics.daysLeftForSyllabusLock.toString()} />
      <Metric icon={<ClipboardList />} label="Syllabus Coverage" value={`${metrics.syllabusCoverage}%`} />
      <Metric icon={<CheckCircle2 />} label="Mastered Topics" value={`${metrics.masteredTopics}%`} />
      <Metric icon={<AlertTriangle />} label="Backlog" value={metrics.backlogCount.toString()} />
      <Metric icon={<Gauge />} label="Avg Completion" value={`${metrics.averageDailyCompletion}%`} />
      <article className="widePanel">
        <div className="panelTitle"><Target size={18} /><h2>Today&apos;s Priority</h2></div>
        <p>{metrics.todayPriority}</p>
      </article>
      <article className="widePanel">
        <div className="panelTitle"><Gauge size={18} /><h2>Current Mode</h2></div>
        <strong className="modeText">{metrics.currentMode}</strong>
      </article>
    </section>
  );
}
