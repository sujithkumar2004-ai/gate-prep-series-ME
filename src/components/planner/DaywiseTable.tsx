"use client";

import { formatDate, rowKey, statuses } from "../../lib/plannerData";
import type { PlannerDay, RowEdit, Status, StoredState } from "../../types/planner";
import { statusClass } from "./Shared";

export function DaywiseTable({
  rows,
  edits,
  totalRows,
  onUpdateRow
}: {
  rows: PlannerDay[];
  edits: StoredState;
  totalRows: number;
  onUpdateRow: (key: string, patch: Partial<RowEdit>) => void;
}) {
  return (
    <section className="sheetWrap" aria-label="Daywise marking table">
      <div className="sheetInfo">
        Showing {rows.length} of {totalRows} rows
      </div>
      <div className="tableScroll">
        <table className="plannerTable">
          <thead>
            <tr>
              <th>Date</th>
              <th>Day</th>
              <th>Phase</th>
              <th>Week</th>
              <th>Subject</th>
              <th>Task</th>
              <th>Daily Work</th>
              <th>Target</th>
              <th>Kind</th>
              <th>Status</th>
              <th>Actual</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const key = rowKey(row);
              const edit = edits[key];
              const status = edit?.status ?? row.status;
              return (
                <tr key={key}>
                  <td className="dateCell">{formatDate(row.date)}</td>
                  <td>{row.day}</td>
                  <td>{row.phase}</td>
                  <td>{row.week}</td>
                  <td className="subjectCell">{row.mainSubject}</td>
                  <td className="topicCell">{row.dailyTask}</td>
                  <td className="workCell">
                    <ul>
                      {row.workItems.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </td>
                  <td className="numberCell">{row.targetHours}</td>
                  <td>{row.kind}</td>
                  <td>
                    <select
                      className={`statusSelect ${statusClass[status]}`}
                      value={status}
                      onChange={(event) => onUpdateRow(key, { status: event.target.value as Status })}
                    >
                      {statuses.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <input
                      className="hourInput"
                      type="number"
                      min="0"
                      step="0.5"
                      value={edit?.actualHours || ""}
                      onChange={(event) => onUpdateRow(key, { actualHours: Number(event.target.value) })}
                    />
                  </td>
                  <td>
                    <textarea
                      value={edit?.notes ?? ""}
                      onChange={(event) => onUpdateRow(key, { notes: event.target.value })}
                      placeholder="Mistakes, backlog, formula notes"
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
