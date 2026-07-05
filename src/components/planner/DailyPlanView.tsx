"use client";

import { CalendarDays, CheckCircle2, Clock, SkipForward } from "lucide-react";
import { useMemo, useState } from "react";
import { formatDate, plannerData } from "../../lib/plannerData";
import { calculateDailyProgress, generateDailyPlan } from "../../services/dailyPlanService";
import type { DailyTask, DailyTaskStatus, PlannerState } from "../../types/planner";

export function DailyPlanView({
  state,
  onTaskUpdate
}: {
  state: PlannerState;
  onTaskUpdate: (task: DailyTask, status: DailyTaskStatus, actualMinutes: number, skipReason: string) => void;
}) {
  const [selectedDate, setSelectedDate] = useState(plannerData.days[0]?.date ?? new Date().toISOString().slice(0, 10));
  const plan = useMemo(() => generateDailyPlan(state, selectedDate), [selectedDate, state]);
  const progress = useMemo(() => calculateDailyProgress(plan), [plan]);

  return (
    <section className="coreStack" aria-label="Daily plan">
      <div className="dailyHeader">
        <label className="fieldLine">
          Date
          <input type="date" value={selectedDate} onChange={(event) => setSelectedDate(event.target.value)} />
        </label>
        <button className="iconTextButton" onClick={() => setSelectedDate(new Date().toISOString().slice(0, 10))}>
          <CalendarDays size={17} /> Today
        </button>
      </div>
      <div className="summaryStrip">
        <span>{progress.completedTasks}/{progress.totalPlannedTasks} completed</span>
        <span>{progress.skippedTasks} skipped</span>
        <span>{progress.pendingTasks} pending</span>
        <span>{progress.actualMinutes}/{progress.plannedMinutes} minutes</span>
        <span>{progress.dailyScore}/100 score</span>
      </div>
      {!plan.tasks.length ? (
        <p className="emptyState">No daily tasks found for {formatDate(selectedDate)}.</p>
      ) : (
        <div className="taskList">
          {plan.tasks.map((task) => (
            <TaskCard key={task.id} task={task} onTaskUpdate={onTaskUpdate} />
          ))}
        </div>
      )}
    </section>
  );
}

function TaskCard({
  task,
  onTaskUpdate
}: {
  task: DailyTask;
  onTaskUpdate: (task: DailyTask, status: DailyTaskStatus, actualMinutes: number, skipReason: string) => void;
}) {
  const [actualMinutes, setActualMinutes] = useState(task.actualMinutes);
  const [skipReason, setSkipReason] = useState(task.skipReason);
  return (
    <article className="taskCard">
      <div>
        <span className="taskType">{task.type.replace("_", " ")}</span>
        <h3>{task.title}</h3>
        <p><Clock size={14} /> Planned {task.plannedMinutes} min</p>
      </div>
      <label className="fieldLine">
        Actual minutes
        <input type="number" min="0" value={actualMinutes || ""} onChange={(event) => setActualMinutes(Number(event.target.value))} />
      </label>
      <label className="fieldLine">
        Skip reason
        <input value={skipReason} onChange={(event) => setSkipReason(event.target.value)} placeholder="Required if skipped" />
      </label>
      <div className="taskActions">
        <button className="iconTextButton" onClick={() => onTaskUpdate(task, "in_progress", actualMinutes, skipReason)}>
          <Clock size={16} /> In Progress
        </button>
        <button className="iconTextButton" onClick={() => onTaskUpdate(task, "completed", actualMinutes || task.plannedMinutes, skipReason)}>
          <CheckCircle2 size={16} /> Completed
        </button>
        <button className="iconTextButton dangerAction" onClick={() => onTaskUpdate(task, "skipped", actualMinutes, skipReason)}>
          <SkipForward size={16} /> Skipped
        </button>
      </div>
      <strong className={`taskStatus status-${task.status}`}>{task.status.replace("_", " ")}</strong>
    </article>
  );
}
