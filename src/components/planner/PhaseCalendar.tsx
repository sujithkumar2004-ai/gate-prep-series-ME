"use client";

import { phaseColors, phaseSoftColors } from "../../config/appConfig";
import { formatDate, rowKey } from "../../lib/plannerData";
import type { PlannerData, StoredState } from "../../types/planner";
import { statusClass } from "./Shared";

export function PhaseCalendar({
  plannerData,
  edits,
  phaseFilter
}: {
  plannerData: PlannerData;
  edits: StoredState;
  phaseFilter: string;
}) {
  return (
    <section className="phaseStack" aria-label="Phase calendar">
      {plannerData.phases
        .filter((item) => phaseFilter === "All" || item.title === phaseFilter)
        .map((item, index) => {
          const color = phaseColors[index % phaseColors.length];
          const softColor = phaseSoftColors[index % phaseSoftColors.length];
          return (
            <article className="phaseBlock" key={item.id}>
              <div className="phaseTop" style={{ background: softColor }}>
                <div>
                  <span style={{ color }}>{item.dates}</span>
                  <h2>{item.title}</h2>
                  <p>{item.goal}</p>
                </div>
                <strong>{item.weeks.length} week(s)</strong>
              </div>
              <div className="weekdayHeader">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                  <span key={day}>{day}</span>
                ))}
              </div>
              {item.weeks.map((week) => {
                const days = plannerData.days.filter((day) => day.date >= week.startDate && day.date <= week.endDate);
                return (
                  <div className="calendarWeek" key={week.id}>
                    <p>Week {week.week}</p>
                    <div className="dayGrid">
                      {days.map((day) => {
                        const edit = edits[rowKey(day)];
                        return (
                          <div
                            className={`dayCell ${day.date === plannerData.planStartDate ? "startDay" : ""} ${day.kind === "Rest" ? "restDay" : ""} ${day.kind === "Exam" ? "examDay" : ""}`}
                            key={day.id}
                          >
                            <div className="dayNum" style={{ color }}>{formatDate(day.date)}</div>
                            <div className="daySubject">{day.mainSubject}</div>
                            <ul className="dayWork">
                              {day.workItems.slice(0, 2).map((work) => (
                                <li key={work}>{work}</li>
                              ))}
                            </ul>
                            <div className="dayFoot">
                              <span>{day.targetHours}h</span>
                              {edit && <small className={statusClass[edit.status]}>{edit.status}</small>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </article>
          );
        })}
    </section>
  );
}
