"use client";

import type { PlannerState } from "../../types/planner";
import { getTopicRows } from "../../services/topicService";

export function SyllabusTracker({
  state,
  onAccuracyChange
}: {
  state: PlannerState;
  onAccuracyChange: (topicId: string, accuracy: number) => void;
}) {
  const rows = getTopicRows(state);
  return (
    <section className="sheetWrap" aria-label="Syllabus tracker">
      <div className="sheetInfo">Tracking {rows.length} topics from the single planner source</div>
      <div className="tableScroll">
        <table className="plannerTable coreTable">
          <thead>
            <tr>
              <th>Subject</th>
              <th>Topic</th>
              <th>Weightage</th>
              <th>Status</th>
              <th>Concept</th>
              <th>Notes</th>
              <th>PYQ</th>
              <th>Revisions</th>
              <th>Accuracy</th>
              <th>Last Revised</th>
              <th>Next Revision</th>
              <th>Mastery</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td className="subjectCell">{row.subjectName}</td>
                <td className="topicCell">{row.title}</td>
                <td className="numberCell">{row.weightage}</td>
                <td>{row.progress.status}</td>
                <td>{row.progress.conceptCompleted ? "Yes" : "No"}</td>
                <td>{row.progress.notesCompleted ? "Yes" : "No"}</td>
                <td>{row.progress.pyqCompleted ? "Yes" : "No"}</td>
                <td>{row.progress.revisionsCompleted}</td>
                <td>
                  <input
                    className="hourInput"
                    type="number"
                    min="0"
                    max="100"
                    value={row.progress.accuracy || ""}
                    onChange={(event) => onAccuracyChange(row.id, Number(event.target.value))}
                  />
                </td>
                <td>{row.progress.lastRevisedDate ?? "-"}</td>
                <td>{row.progress.nextRevisionDate ?? "-"}</td>
                <td>{row.progress.status === "Mastered" ? "Auto Mastered" : "Not mastered"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
