"use client";

import { useState } from "react";
import type { AttemptStrategy, PlannerState } from "../../types/planner";

export function AttemptStrategyView({ state, onAdd }: { state: PlannerState; onAdd: (strategy: Omit<AttemptStrategy, "id">) => void }) {
  const [seen, setSeen] = useState(65);
  const [attempted, setAttempted] = useState(0);
  const [skipped, setSkipped] = useState(0);
  const [guessed, setGuessed] = useState(0);
  const [negative, setNegative] = useState(0);

  return (
    <section className="coreStack">
      <article className="widePanel">
        <div className="panelTitle"><h2>Add Attempt Strategy</h2></div>
        <div className="formGrid">
          <label className="fieldLine">Seen<input type="number" value={seen} onChange={(e) => setSeen(Number(e.target.value))} /></label>
          <label className="fieldLine">Attempted<input type="number" value={attempted} onChange={(e) => setAttempted(Number(e.target.value))} /></label>
          <label className="fieldLine">Skipped<input type="number" value={skipped} onChange={(e) => setSkipped(Number(e.target.value))} /></label>
          <label className="fieldLine">Guessed<input type="number" value={guessed} onChange={(e) => setGuessed(Number(e.target.value))} /></label>
          <label className="fieldLine">Negative Lost<input type="number" value={negative} onChange={(e) => setNegative(Number(e.target.value))} /></label>
        </div>
        <button className="iconTextButton" onClick={() => onAdd({ date: new Date().toISOString().slice(0, 10), questionsSeen: seen, questionsAttempted: attempted, questionsSkipped: skipped, guessedQuestions: guessed, negativeMarksLost: negative, timePerQuestion: attempted ? Math.round(180 / attempted) : 0, easyAccuracy: 0, mediumAccuracy: 0, hardAccuracy: 0 })}>Save Strategy</button>
      </article>
      <div className="tableScroll"><table className="plannerTable coreTable"><thead><tr><th>Date</th><th>Seen</th><th>Attempted</th><th>Skipped</th><th>Guessed</th><th>Negative</th><th>Time/Q</th><th>Easy</th><th>Medium</th><th>Hard</th></tr></thead><tbody>{Object.values(state.attemptStrategies).map((row) => <tr key={row.id}><td>{row.date}</td><td>{row.questionsSeen}</td><td>{row.questionsAttempted}</td><td>{row.questionsSkipped}</td><td>{row.guessedQuestions}</td><td>{row.negativeMarksLost}</td><td>{row.timePerQuestion}</td><td>{row.easyAccuracy}%</td><td>{row.mediumAccuracy}%</td><td>{row.hardAccuracy}%</td></tr>)}</tbody></table></div>
    </section>
  );
}
