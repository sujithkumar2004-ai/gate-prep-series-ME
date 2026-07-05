"use client";

import type { PlannerState, Reminder } from "../../types/planner";

export function ReminderSettings({ state, onUpdate, onEnable }: { state: PlannerState; onUpdate: (id: string, patch: Partial<Reminder>) => void; onEnable: () => void }) {
  return (
    <section className="coreStack">
      <article className="widePanel"><div className="panelTitle"><h2>Local Reminder Foundation</h2></div><p>Browser notification permission is requested only when you click enable. No push server is used in Phase 4.</p><button className="iconTextButton" onClick={onEnable}>Enable Browser Notifications</button></article>
      <div className="taskList">{Object.values(state.reminders).map((reminder) => <article className="taskCard" key={reminder.id}><span className="taskType">{reminder.type.replaceAll("_", " ")}</span><h3>{reminder.title}</h3><label className="fieldLine">Time<input value={reminder.time} onChange={(e) => onUpdate(reminder.id, { time: e.target.value })} /></label><label className="fieldLine">Enabled<input type="checkbox" checked={reminder.enabled} onChange={(e) => onUpdate(reminder.id, { enabled: e.target.checked })} /></label></article>)}</div>
    </section>
  );
}
