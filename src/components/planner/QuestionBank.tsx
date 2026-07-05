"use client";

import { useState } from "react";
import { plannerData } from "../../lib/plannerData";
import type { PlannerState, QuestionBankItem } from "../../types/planner";
import { Select } from "./Shared";

export function QuestionBank({ state, onAdd }: { state: PlannerState; onAdd: (item: Omit<QuestionBankItem, "id">) => void }) {
  const firstTopic = plannerData.topics[0];
  const [subjectId, setSubjectId] = useState(firstTopic?.subjectId ?? "");
  const [topicId, setTopicId] = useState(firstTopic?.id ?? "");
  const [questionLabel, setQuestionLabel] = useState("");
  const topicOptions = plannerData.topics.filter((topic) => topic.subjectId === subjectId);

  function submit() {
    if (!questionLabel.trim()) {
      window.alert("Question label is required.");
      return;
    }
    onAdd({ subjectId, topicId, questionLabel, source: "PYQ", difficulty: "Medium", solved: false, accuracy: 0, retryNeeded: false, bookmarked: false, notes: "" });
    setQuestionLabel("");
  }

  return (
    <section className="coreStack">
      <article className="widePanel">
        <div className="panelTitle"><h2>Add Question</h2></div>
        <div className="formGrid">
          <Select label="Subject" value={subjectId} onChange={(value) => { setSubjectId(value); setTopicId(plannerData.topics.find((topic) => topic.subjectId === value)?.id ?? ""); }} options={plannerData.subjects.map((subject) => subject.id)} />
          <Select label="Topic" value={topicId} onChange={setTopicId} options={topicOptions.map((topic) => topic.id)} />
          <label className="fieldLine formWide">Question<label className="srOnly">Question</label><input value={questionLabel} onChange={(e) => setQuestionLabel(e.target.value)} placeholder="GATE 2021 NAT thermodynamics Q4" /></label>
        </div>
        <button className="iconTextButton" onClick={submit}>Add Question</button>
      </article>
      <div className="tableScroll">
        <table className="plannerTable coreTable">
          <thead><tr><th>Subject</th><th>Topic</th><th>Question</th><th>Source</th><th>Difficulty</th><th>Solved</th><th>Accuracy</th><th>Retry</th><th>Bookmarked</th><th>Notes</th></tr></thead>
          <tbody>{Object.values(state.questionBank).map((item) => (
            <tr key={item.id}>
              <td>{plannerData.subjects.find((subject) => subject.id === item.subjectId)?.name}</td>
              <td>{plannerData.topics.find((topic) => topic.id === item.topicId)?.title}</td>
              <td>{item.questionLabel}</td><td>{item.source}</td><td>{item.difficulty}</td><td>{item.solved ? "Yes" : "No"}</td><td>{item.accuracy}%</td><td>{item.retryNeeded ? "Yes" : "No"}</td><td>{item.bookmarked ? "Yes" : "No"}</td><td>{item.notes || "-"}</td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </section>
  );
}
