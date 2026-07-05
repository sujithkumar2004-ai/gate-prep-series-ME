"use client";

import { Download, RotateCcw, Search } from "lucide-react";
import { statuses } from "../../lib/plannerData";
import type { Status } from "../../types/planner";
import { Select } from "./Shared";

export function PlannerToolbar({
  query,
  phase,
  subject,
  status,
  phases,
  subjects,
  onQueryChange,
  onPhaseChange,
  onSubjectChange,
  onStatusChange,
  onExport,
  onReset
}: {
  query: string;
  phase: string;
  subject: string;
  status: Status | "All";
  phases: string[];
  subjects: string[];
  onQueryChange: (value: string) => void;
  onPhaseChange: (value: string) => void;
  onSubjectChange: (value: string) => void;
  onStatusChange: (value: Status | "All") => void;
  onExport: () => void;
  onReset: () => void;
}) {
  return (
    <section className="toolbar" aria-label="Planner controls">
      <label className="searchBox">
        <Search size={18} />
        <input
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Search topics, tasks, subjects"
        />
      </label>
      <Select label="Phase" value={phase} onChange={onPhaseChange} options={phases} />
      <Select label="Subject" value={subject} onChange={onSubjectChange} options={subjects} />
      <Select label="Status" value={status} onChange={(value) => onStatusChange(value as Status | "All")} options={["All", ...statuses]} />
      <button className="iconButton" onClick={onExport} title="Export progress">
        <Download size={18} />
      </button>
      <button className="iconButton danger" onClick={onReset} title="Reset progress">
        <RotateCcw size={18} />
      </button>
    </section>
  );
}
