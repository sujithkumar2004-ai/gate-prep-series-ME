"use client";

import { useState } from "react";
import { calculateEnergyInsights } from "../../services/energyService";
import type { EnergyLog, PlannerState } from "../../types/planner";

export function EnergyTracker({ state, onSave }: { state: PlannerState; onSave: (log: Omit<EnergyLog, "id">) => void }) {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [sleepHours, setSleepHours] = useState(7);
  const [energyLevel, setEnergyLevel] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [focusLevel, setFocusLevel] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [stressLevel, setStressLevel] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [workoutDone, setWorkoutDone] = useState(false);
  const [notes, setNotes] = useState("");
  const insights = calculateEnergyInsights(state);
  return (
    <section className="coreGrid">
      <article className="widePanel"><div className="panelTitle"><h2>Energy Log</h2></div><div className="formGrid">
        <label className="fieldLine">Date<input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></label>
        <label className="fieldLine">Sleep<input type="number" value={sleepHours} onChange={(e) => setSleepHours(Number(e.target.value))} /></label>
        <label className="fieldLine">Energy<input type="number" min="1" max="5" value={energyLevel} onChange={(e) => setEnergyLevel(Number(e.target.value) as 1 | 2 | 3 | 4 | 5)} /></label>
        <label className="fieldLine">Focus<input type="number" min="1" max="5" value={focusLevel} onChange={(e) => setFocusLevel(Number(e.target.value) as 1 | 2 | 3 | 4 | 5)} /></label>
        <label className="fieldLine">Stress<input type="number" min="1" max="5" value={stressLevel} onChange={(e) => setStressLevel(Number(e.target.value) as 1 | 2 | 3 | 4 | 5)} /></label>
        <label className="fieldLine">Workout<input type="checkbox" checked={workoutDone} onChange={(e) => setWorkoutDone(e.target.checked)} /></label>
        <label className="fieldLine formWide">Notes<input value={notes} onChange={(e) => setNotes(e.target.value)} /></label>
      </div><button className="iconTextButton" onClick={() => onSave({ date, sleepHours, energyLevel, focusLevel, stressLevel, workoutDone, notes })}>Save Energy</button></article>
      <article className="widePanel"><div className="panelTitle"><h2>Productivity Insights</h2></div><ul className="compactList"><li>Low sleep days: {insights.lowSleepDays}</li><li>Low focus days: {insights.lowFocusDays}</li><li>{insights.energyVsScore}</li><li>Workout consistency: {insights.workoutConsistency}%</li><li>{insights.workoutVsStudy}</li></ul></article>
    </section>
  );
}
