import { NextResponse } from "next/server";
import { plannerData } from "../../../src/lib/plannerData";

export async function GET() {
  return NextResponse.json({
    status: "connected",
    framework: "Next.js API route",
    sourceOfTruth: plannerData.metadata.sourceOfTruth,
    totalDays: plannerData.daywisePlan.length,
    phases: plannerData.phases.length,
    dailyWorkItems: plannerData.daywisePlan.reduce((count, day) => count + day.workItems.length, 0),
    subjectsCovered: plannerData.syllabusMap.map((row) => row.subject),
    syllabusCompletionDate: plannerData.metadata.syllabusCompletionDate,
    examDate: plannerData.metadata.examDate,
    firstDate: plannerData.metadata.startDate,
    lastDate: plannerData.daywisePlan[plannerData.daywisePlan.length - 1]?.date ?? null,
    rule: plannerData.metadata.rule
  });
}
