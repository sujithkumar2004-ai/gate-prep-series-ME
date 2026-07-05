"use client";

import { useState } from "react";
import { calculateGymStreak, weeklyGymRoutine } from "../../services/gymService";
import type { GymLog, PlannerState } from "../../types/planner";

export function GymRoutineView({ state, onSave }: { state: PlannerState; onSave: (log: Omit<GymLog, "id">) => void }) {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [bodyweight, setBodyweight] = useState(0);
  const [notes, setNotes] = useState("");
  const routine = weeklyGymRoutine[0];
  return (
    <section className="coreGrid">
      <article className="widePanel"><div className="panelTitle"><h2>Weekly Routine</h2></div><ul className="coreList">{weeklyGymRoutine.map((row) => <li key={row.day}><span>{row.day}: {row.title} - {row.exercises.join(", ")}</span></li>)}</ul></article>
      <article className="widePanel"><div className="panelTitle"><h2>Workout Log</h2></div><div className="formGrid"><label className="fieldLine">Date<input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></label><label className="fieldLine">Bodyweight<input type="number" value={bodyweight || ""} onChange={(e) => setBodyweight(Number(e.target.value))} /></label><label className="fieldLine formWide">Recovery notes<input value={notes} onChange={(e) => setNotes(e.target.value)} /></label></div><button className="iconTextButton" onClick={() => onSave({ date, routineTitle: routine.title, exercises: routine.exercises.map((name) => ({ name, sets: 3, reps: "8-12", completed: true })), workoutCompleted: true, bodyweight: bodyweight || undefined, recoveryNotes: notes })}>Mark Workout Completed</button><p>Attendance streak: {calculateGymStreak(state)} day(s)</p><p className="panelText">Keep workouts short near mock days and avoid overlap with planned study blocks.</p></article>
    </section>
  );
}
