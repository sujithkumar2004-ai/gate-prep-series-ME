"use client";

import { useState } from "react";
import { calculateMonthlyReview } from "../../services/monthlyReviewService";
import { calculateWeeklyReview } from "../../services/weeklyReviewService";
import type { PlannerState } from "../../types/planner";

export function WeeklyReviewView({ state }: { state: PlannerState }) {
  const [start, setStart] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState("");
  const review = calculateWeeklyReview(state, start, notes);
  return <ReviewPanel title="Weekly Review" rows={[`Window: ${review.weekStartDate} to ${review.weekEndDate}`, `Topics completed: ${review.topicsCompleted}`, `PYQs solved: ${review.pyqsSolved}`, `Mocks: ${review.mocksCompleted}`, `Average score: ${review.averageDailyScore}`, `Best day: ${review.bestDay ?? "-"}`, `Worst day: ${review.worstDay ?? "-"}`, `Backlog added: ${review.backlogAdded}`, `Backlog cleared: ${review.backlogCleared}`, `Revision consistency: ${review.revisionConsistency}%`, `Weekly score: ${review.weeklyScore}`, `Next week: ${review.nextWeekTarget}`]} dateValue={start} onDateChange={setStart} notes={notes} onNotesChange={setNotes} />;
}

export function MonthlyReviewView({ state }: { state: PlannerState }) {
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [notes, setNotes] = useState("");
  const review = calculateMonthlyReview(state, month, notes);
  return <ReviewPanel title="Monthly Review" rows={[`Month: ${review.month}`, `Syllabus: ${review.syllabusCompletion}%`, `Mock average: ${review.mockAverage}`, `Revision delay: ${review.revisionDelay}`, `Daily score avg: ${review.dailyScoreAverage}`, `Backlog: ${review.backlogTrend}`, `Expected readiness: ${review.expectedExamReadiness}%`, `Strongest: ${review.strongestTopics.join(", ") || "-"}`, `Weakest: ${review.weakestTopics.join(", ") || "-"}`, `Battle plan: ${review.nextMonthBattlePlan || "-"}`]} dateValue={month} onDateChange={setMonth} notes={notes} onNotesChange={setNotes} monthMode />;
}

function ReviewPanel({ title, rows, dateValue, onDateChange, notes, onNotesChange, monthMode }: { title: string; rows: string[]; dateValue: string; onDateChange: (value: string) => void; notes: string; onNotesChange: (value: string) => void; monthMode?: boolean }) {
  return <section className="coreStack"><article className="widePanel"><div className="panelTitle"><h2>{title}</h2></div><div className="formGrid"><label className="fieldLine">Date<input type={monthMode ? "month" : "date"} value={dateValue} onChange={(e) => onDateChange(e.target.value)} /></label><label className="fieldLine formWide">Reflection notes<input value={notes} onChange={(e) => onNotesChange(e.target.value)} /></label></div><ul className="compactList">{rows.map((row) => <li key={row}>{row}</li>)}</ul></article></section>;
}
