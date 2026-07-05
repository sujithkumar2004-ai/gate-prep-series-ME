"use client";

import { phaseColors } from "../../config/appConfig";
import { formatDate, rowKey } from "../../lib/plannerData";
import type { PlannerData, StoredState } from "../../types/planner";

export function WeeklyTracker({ plannerData, edits }: { plannerData: PlannerData; edits: StoredState }) {
  return (
    <section className="weekGrid" aria-label="Weekly tracker">
      {plannerData.weeks.map((week, index) => {
        const rows = plannerData.days.filter((row) => row.date >= week.startDate && row.date <= week.endDate);
        const done = rows.filter((row) => edits[rowKey(row)]?.status === "Done").length;
        const actual = rows.reduce((sum, row) => sum + Number(edits[rowKey(row)]?.actualHours ?? 0), 0);
        const completion = rows.length ? Math.round((done / rows.length) * 100) : 0;
        return (
          <article className="weekCard" key={week.id}>
            <div className="weekHead">
              <span>Week {week.week}</span>
              <strong>{completion}%</strong>
            </div>
            <p>{formatDate(week.startDate)} to {formatDate(week.endDate)}</p>
            <h3>{week.phase}</h3>
            <div className="miniTrack">
              <div style={{ width: `${completion}%`, background: phaseColors[index % phaseColors.length] }} />
            </div>
            <dl>
              <div><dt>Target</dt><dd>{week.targetHours}h</dd></div>
              <div><dt>Actual</dt><dd>{actual}h</dd></div>
              <div><dt>Done</dt><dd>{done}/{rows.length}</dd></div>
            </dl>
          </article>
        );
      })}
    </section>
  );
}
