"use client";

import { useState } from "react";
import { plannerData } from "../../lib/plannerData";
import { createDeepWorkSession, minutesForMode } from "../../services/deepWorkService";
import type { DeepWorkSession, PlannerState, TimerMode } from "../../types/planner";
import { Select } from "./Shared";

export function DeepWorkTimer({
  state,
  onCreate,
  onStart,
  onPause,
  onResume,
  onDistraction,
  onComplete
}: {
  state: PlannerState;
  onCreate: (session: DeepWorkSession) => void;
  onStart: (id: string) => void;
  onPause: (id: string, reason: string) => void;
  onResume: (id: string) => void;
  onDistraction: (id: string, reason: string) => void;
  onComplete: (id: string, minutes: number) => void;
}) {
  const firstTask = Object.values(state.tasks)[0];
  const [mode, setMode] = useState<TimerMode>("Pomodoro");
  const [customMinutes, setCustomMinutes] = useState(45);
  const [taskId, setTaskId] = useState(firstTask?.id ?? "");
  const [pauseReason, setPauseReason] = useState("");
  const [distractionReason, setDistractionReason] = useState("");
  const [notes, setNotes] = useState("");
  const task = state.tasks[taskId] ?? firstTask;
  const sessions = Object.values(state.deepWorkSessions).sort((a, b) => b.date.localeCompare(a.date));

  function create() {
    if (!task) return;
    onCreate(createDeepWorkSession({
      date: new Date().toISOString().slice(0, 10),
      mode,
      subjectId: task.subjectId,
      topicId: task.topicId,
      taskId: task.id,
      plannedMinutes: minutesForMode(mode, customMinutes),
      pauseReason: "",
      notes
    }));
  }

  return (
    <section className="coreStack">
      <article className="widePanel">
        <div className="panelTitle"><h2>Deep Work Timer</h2></div>
        <div className="formGrid">
          <Select label="Mode" value={mode} onChange={(value) => setMode(value as TimerMode)} options={["Pomodoro", "Deep Work", "Custom"]} />
          <label className="fieldLine">Custom minutes<input type="number" min="5" value={customMinutes} onChange={(e) => setCustomMinutes(Number(e.target.value))} /></label>
          <Select label="Task" value={taskId} onChange={setTaskId} options={Object.values(state.tasks).slice(0, 80).map((item) => item.id)} />
          <label className="fieldLine formWide">Session notes<input value={notes} onChange={(e) => setNotes(e.target.value)} /></label>
        </div>
        <button className="iconTextButton" onClick={create}>Create Session</button>
      </article>
      <div className="taskList">
        {sessions.slice(0, 12).map((session) => (
          <article className="taskCard" key={session.id}>
            <span className="taskType">{session.mode}</span>
            <h3>{plannerData.topics.find((topic) => topic.id === session.topicId)?.title ?? session.topicId}</h3>
            <p>{session.status} | {session.completedMinutes}/{session.plannedMinutes} min | distractions {session.distractions.length}</p>
            <label className="fieldLine">Pause/distraction reason<input value={pauseReason} onChange={(e) => setPauseReason(e.target.value)} /></label>
            <label className="fieldLine">Distraction<input value={distractionReason} onChange={(e) => setDistractionReason(e.target.value)} /></label>
            <div className="taskActions">
              <button className="iconTextButton" onClick={() => onStart(session.id)}>Start</button>
              <button className="iconTextButton" onClick={() => onPause(session.id, pauseReason)}>Pause</button>
              <button className="iconTextButton" onClick={() => onResume(session.id)}>Resume</button>
              <button className="iconTextButton" onClick={() => onDistraction(session.id, distractionReason)}>Log Distraction</button>
              <button className="iconTextButton" onClick={() => onComplete(session.id, session.plannedMinutes)}>Complete</button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
