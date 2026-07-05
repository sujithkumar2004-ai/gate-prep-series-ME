"use client";

import { LogOut, UserRound } from "lucide-react";
import { formatDate } from "../../lib/plannerData";
import type { Account, PlannerDay } from "../../types/planner";

export function PlannerHero({
  currentUser,
  completion,
  planStartDate,
  planEndDate,
  syllabusCompletionDate,
  nextRow,
  onLogout
}: {
  currentUser: Account;
  completion: number;
  planStartDate: string;
  planEndDate: string;
  syllabusCompletionDate: string;
  nextRow: PlannerDay;
  onLogout: () => void;
}) {
  return (
    <section className="hero">
      <div>
        <p className="eyebrow">GATE ME 2027</p>
        <h1>Daily Syllabus Planner</h1>
        <p className="heroCopy">
          {formatDate(planStartDate)} to {formatDate(planEndDate)}. Keep the current schedule clean, searchable,
          and markable from one planner data source.
        </p>
        <div className="dateRibbon" aria-label="Plan dates">
          <span>Starts {formatDate(planStartDate)}</span>
          <span>Syllabus lock {formatDate(syllabusCompletionDate)}</span>
          <span>Next: {formatDate(nextRow.date)}</span>
          <span>End: {formatDate(planEndDate)}</span>
        </div>
      </div>
      <div className="heroPanel" aria-label="Overall completion">
        <div className="accountPill">
          <UserRound size={16} />
          <span>{currentUser.name}</span>
        </div>
        <span>{completion}%</span>
        <p>complete</p>
        <div className="progressTrack">
          <div style={{ width: `${completion}%` }} />
        </div>
        <button className="logoutButton" onClick={onLogout}>
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </section>
  );
}
