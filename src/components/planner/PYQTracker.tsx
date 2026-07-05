"use client";

import { useState } from "react";
import { plannerData } from "../../lib/plannerData";
import { getPYQSummary } from "../../services/pyqService";
import type { PlannerState, PYQSession } from "../../types/planner";
import { Select } from "./Shared";

export function PYQTracker({ state, onSave }: { state: PlannerState; onSave: (session: Omit<PYQSession, "id">) => void }) {
  const firstTopic = plannerData.topics[0];
  const [subjectId, setSubjectId] = useState(firstTopic?.subjectId ?? "");
  const [topicId, setTopicId] = useState(firstTopic?.id ?? "");
  const [totalQuestions, setTotalQuestions] = useState(25);
  const [correctQuestions, setCorrectQuestions] = useState(0);
  const [timeSpentMinutes, setTimeSpentMinutes] = useState(60);
  const [sourceYear, setSourceYear] = useState("GATE PYQ");
  const [notes, setNotes] = useState("");
  const summary = getPYQSummary(state);
  const topicOptions = plannerData.topics.filter((topic) => topic.subjectId === subjectId);

  function submit() {
    if (!subjectId || !topicId || totalQuestions <= 0 || correctQuestions > totalQuestions) {
      window.alert("Enter a valid PYQ session.");
      return;
    }
    onSave({
      date: new Date().toISOString().slice(0, 10),
      subjectId,
      topicId,
      totalQuestions,
      correctQuestions,
      wrongQuestions: totalQuestions - correctQuestions,
      timeSpentMinutes,
      sourceYear,
      retryNeeded: correctQuestions / totalQuestions < 0.75,
      bookmarked: false,
      notes
    });
  }

  return (
    <section className="coreStack">
      <div className="summaryStrip">
        <span>Total {summary.totalQuestions}</span>
        <span>Correct {summary.correctQuestions}</span>
        <span>Wrong {summary.wrongQuestions}</span>
        <span>Accuracy {summary.accuracy}%</span>
        <span>Time {summary.timeSpentMinutes}m</span>
      </div>
      <article className="widePanel">
        <div className="panelTitle"><h2>Add PYQ Session</h2></div>
        <div className="formGrid">
          <Select label="Subject" value={subjectId} onChange={(value) => { setSubjectId(value); setTopicId(plannerData.topics.find((topic) => topic.subjectId === value)?.id ?? ""); }} options={plannerData.subjects.map((subject) => subject.id)} />
          <Select label="Topic" value={topicId} onChange={setTopicId} options={topicOptions.map((topic) => topic.id)} />
          <label className="fieldLine">Total<input type="number" min="1" value={totalQuestions} onChange={(e) => setTotalQuestions(Number(e.target.value))} /></label>
          <label className="fieldLine">Correct<input type="number" min="0" value={correctQuestions} onChange={(e) => setCorrectQuestions(Number(e.target.value))} /></label>
          <label className="fieldLine">Time<input type="number" min="0" value={timeSpentMinutes} onChange={(e) => setTimeSpentMinutes(Number(e.target.value))} /></label>
          <label className="fieldLine">Source/Year<input value={sourceYear} onChange={(e) => setSourceYear(e.target.value)} /></label>
          <label className="fieldLine formWide">Notes<input value={notes} onChange={(e) => setNotes(e.target.value)} /></label>
        </div>
        <button className="iconTextButton" onClick={submit}>Save PYQ Session</button>
      </article>
      <div className="tableScroll">
        <table className="plannerTable coreTable">
          <thead><tr><th>Date</th><th>Subject</th><th>Topic</th><th>Total</th><th>Correct</th><th>Wrong</th><th>Accuracy</th><th>Source</th><th>Retry</th></tr></thead>
          <tbody>
            {Object.values(state.pyqSessions).map((session) => (
              <tr key={session.id}>
                <td>{session.date}</td>
                <td>{plannerData.subjects.find((subject) => subject.id === session.subjectId)?.name}</td>
                <td>{plannerData.topics.find((topic) => topic.id === session.topicId)?.title}</td>
                <td>{session.totalQuestions}</td>
                <td>{session.correctQuestions}</td>
                <td>{session.wrongQuestions}</td>
                <td>{Math.round((session.correctQuestions / Math.max(session.totalQuestions, 1)) * 100)}%</td>
                <td>{session.sourceYear}</td>
                <td>{session.retryNeeded ? "Yes" : "No"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
