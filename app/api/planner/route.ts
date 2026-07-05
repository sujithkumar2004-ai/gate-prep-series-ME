import { NextResponse } from "next/server";
import { getPlannerSource } from "../../../src/server/repository";

export async function GET() {
  const plannerData = getPlannerSource();
  return NextResponse.json({
    status: "connected",
    framework: "Next.js API route",
    totalDays: plannerData.days.length,
    phases: plannerData.phases.length,
    dailyWorkItems: plannerData.days.reduce((count, day) => count + day.workItems.length, 0),
    subjectsCovered: plannerData.syllabus.map((row) => row.subject),
    syllabusCompletionDate: plannerData.syllabusCompletionDate,
    examDate: plannerData.planEndDate,
    firstDate: plannerData.planStartDate,
    lastDate: plannerData.planEndDate
  });
}
