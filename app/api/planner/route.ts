import { NextResponse } from "next/server";
import htmlPlan from "../../../src/data/htmlPlan.json";
import excelData from "../../../src/data/planner.json";

type HtmlDay = {
  date: string;
  sub: string;
  hours: string;
  workItems?: string[];
};

type HtmlPhase = {
  id: number;
  title: string;
  dates: string;
  weeks: { days: HtmlDay[] }[];
};

type SyllabusRow = {
  Subject: string;
};

const phases = (htmlPlan as { phases: HtmlPhase[] }).phases;
const syllabusRows = (excelData as { "Syllabus Map": SyllabusRow[] })["Syllabus Map"];

export async function GET() {
  const days = phases.flatMap((phase) =>
    phase.weeks.flatMap((week) => week.days.filter((day) => day.date && day.date !== "n/a"))
  );
  const syllabusCheckpoint = days.find((day) => day.sub.includes("Syllabus completion checkpoint"));
  const examDay = days.find((day) => day.sub.includes("GATE EXAM DAY"));

  return NextResponse.json({
    status: "connected",
    framework: "Next.js API route",
    totalDays: days.length,
    phases: phases.length,
    dailyWorkItems: days.reduce((count, day) => count + (day.workItems?.length ?? 0), 0),
    subjectsCovered: syllabusRows.map((row) => row.Subject),
    syllabusCompletionDate: syllabusCheckpoint?.date ?? null,
    examDate: examDay?.date ?? null,
    firstDate: days[0]?.date ?? null,
    lastDate: days[days.length - 1]?.date ?? null
  });
}
