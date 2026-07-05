import type { ReactNode } from "react";
import type { Status } from "../../types/planner";

export const statusClass: Record<Status, string> = {
  "Not Started": "statusNotStarted",
  "In Progress": "statusInProgress",
  Done: "statusDone",
  Backlog: "statusBacklog"
};

export function Metric({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <article className="metricCard">
      <div>{icon}</div>
      <p>{label}</p>
      <strong>{value}</strong>
    </article>
  );
}

export function Select({
  label,
  value,
  onChange,
  options
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <label className="selectBox">
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}
