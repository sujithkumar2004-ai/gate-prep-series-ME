"use client";

import { useMemo, useState } from "react";
import { plannerData } from "../../lib/plannerData";
import { mistakeTypes } from "../../services/mistakeService";
import type { Mistake, MistakeType, PlannerState } from "../../types/planner";
import { Select } from "./Shared";

export function MistakeNotebook({ state, onAdd, onFix }: { state: PlannerState; onAdd: (mistake: Omit<Mistake, "id" | "createdAt" | "isFixed">) => void; onFix: (id: string) => void }) {
  const firstTopic = plannerData.topics[0];
  const [subjectId, setSubjectId] = useState("All");
  const [topicId, setTopicId] = useState("All");
  const [type, setType] = useState<MistakeType | "All">("All");
  const [fixed, setFixed] = useState("All");
  const rows = useMemo(() => Object.values(state.mistakes).filter((m) => (subjectId === "All" || m.subjectId === subjectId) && (topicId === "All" || m.topicId === topicId) && (type === "All" || m.mistakeType === type) && (fixed === "All" || String(m.isFixed) === fixed)), [fixed, state.mistakes, subjectId, topicId, type]);
  const [label, setLabel] = useState("");

  function submit() {
    if (!label.trim()) { window.alert("Question label is required."); return; }
    onAdd({ sourceType: "custom", sourceId: "manual", subjectId: firstTopic?.subjectId ?? "", topicId: firstTopic?.id ?? "", mistakeType: "Concept gap", questionLabel: label, explanation: "", correctMethod: "", retryDate: new Date().toISOString().slice(0, 10) });
    setLabel("");
  }

  return (
    <section className="coreStack">
      <article className="widePanel"><div className="panelTitle"><h2>Add Mistake</h2></div><div className="formGrid"><label className="fieldLine formWide">Question Label<input value={label} onChange={(e) => setLabel(e.target.value)} /></label></div><button className="iconTextButton" onClick={submit}>Add Mistake</button></article>
      <div className="summaryStrip">
        <Select label="Subject" value={subjectId} onChange={setSubjectId} options={["All", ...plannerData.subjects.map((s) => s.id)]} />
        <Select label="Topic" value={topicId} onChange={setTopicId} options={["All", ...plannerData.topics.map((t) => t.id)]} />
        <Select label="Type" value={type} onChange={(v) => setType(v as MistakeType | "All")} options={["All", ...mistakeTypes]} />
        <Select label="Fixed" value={fixed} onChange={setFixed} options={["All", "true", "false"]} />
      </div>
      <div className="tableScroll"><table className="plannerTable coreTable"><thead><tr><th>Question</th><th>Subject</th><th>Topic</th><th>Type</th><th>Retry</th><th>Explanation</th><th>Correct Method</th><th>Status</th><th>Action</th></tr></thead><tbody>{rows.map((m) => <tr key={m.id}><td>{m.questionLabel}</td><td>{plannerData.subjects.find((s) => s.id === m.subjectId)?.name}</td><td>{plannerData.topics.find((t) => t.id === m.topicId)?.title}</td><td>{m.mistakeType}</td><td>{m.retryDate}</td><td>{m.explanation || "-"}</td><td>{m.correctMethod || "-"}</td><td>{m.isFixed ? "Fixed" : "Open"}</td><td>{!m.isFixed && <button className="iconTextButton" onClick={() => onFix(m.id)}>Mark Fixed</button>}</td></tr>)}</tbody></table></div>
    </section>
  );
}
