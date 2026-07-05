"use client";

import { useState } from "react";
import { plannerData } from "../../lib/plannerData";
import { getMockSummary } from "../../services/mockService";
import type { MockTest, PlannerState } from "../../types/planner";

export function MockAnalysis({ state, onAdd }: { state: PlannerState; onAdd: (mock: Omit<MockTest, "id" | "accuracy">) => void }) {
  const [score, setScore] = useState(0);
  const [attempted, setAttempted] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [timeSpentMinutes, setTimeSpentMinutes] = useState(180);
  const [actionPlan, setActionPlan] = useState("");
  const summary = getMockSummary(state);

  function submit() {
    const mockNumber = summary.mocks.length + 1;
    onAdd({
      mockNumber,
      date: new Date().toISOString().slice(0, 10),
      totalMarks: 100,
      score,
      attempted,
      correct,
      wrong,
      timeSpentMinutes,
      subjectWiseScore: plannerData.subjects.slice(0, 3).map((subject) => ({ subjectId: subject.id, score: 0, attempted: 0, correct: 0, wrong: 0 })),
      weakTopicIds: plannerData.topics.slice(0, 1).map((topic) => topic.id),
      topMistakes: [{ mistakeType: "Concept gap", count: wrong }],
      actionPlan,
      retryTopicIds: plannerData.topics.slice(0, 2).map((topic) => topic.id)
    });
  }

  return (
    <section className="coreStack">
      <div className="summaryStrip"><span>Mock Avg {summary.average}</span><span>Last {summary.lastMock?.score ?? 0}</span><span>Mocks {summary.mocks.length}</span></div>
      <article className="widePanel">
        <div className="panelTitle"><h2>Add Mock Test</h2></div>
        <div className="formGrid">
          <label className="fieldLine">Score<input type="number" value={score || ""} onChange={(e) => setScore(Number(e.target.value))} /></label>
          <label className="fieldLine">Attempted<input type="number" value={attempted || ""} onChange={(e) => setAttempted(Number(e.target.value))} /></label>
          <label className="fieldLine">Correct<input type="number" value={correct || ""} onChange={(e) => setCorrect(Number(e.target.value))} /></label>
          <label className="fieldLine">Wrong<input type="number" value={wrong || ""} onChange={(e) => setWrong(Number(e.target.value))} /></label>
          <label className="fieldLine">Time<input type="number" value={timeSpentMinutes || ""} onChange={(e) => setTimeSpentMinutes(Number(e.target.value))} /></label>
          <label className="fieldLine formWide">Action Plan<input value={actionPlan} onChange={(e) => setActionPlan(e.target.value)} /></label>
        </div>
        <button className="iconTextButton" onClick={submit}>Save Mock</button>
      </article>
      <div className="tableScroll"><table className="plannerTable coreTable">
        <thead><tr><th>Mock</th><th>Date</th><th>Score</th><th>Attempted</th><th>Correct</th><th>Wrong</th><th>Accuracy</th><th>Time</th><th>Action Plan</th><th>Retry Topics</th></tr></thead>
        <tbody>{summary.mocks.map((mock) => <tr key={mock.id}><td>{mock.mockNumber}</td><td>{mock.date}</td><td>{mock.score}/{mock.totalMarks}</td><td>{mock.attempted}</td><td>{mock.correct}</td><td>{mock.wrong}</td><td>{mock.accuracy}%</td><td>{mock.timeSpentMinutes}m</td><td>{mock.actionPlan || "-"}</td><td>{mock.retryTopicIds.length}</td></tr>)}</tbody>
      </table></div>
      <article className="widePanel"><div className="panelTitle"><h2>Score Trend</h2></div><p>{summary.trend.map((item) => `${item.label}: ${item.score}`).join(" | ") || "No mock trend yet."}</p></article>
    </section>
  );
}
