import { NextResponse } from "next/server";
import { getPlannerSource } from "../../../src/server/repository";
import { validatePlannerData } from "../../../src/lib/plannerValidation";
import { validateServerEnv } from "../../../src/server/env";

export async function GET() {
  const plannerData = getPlannerSource();
  const env = validateServerEnv();
  const validation = validatePlannerData(plannerData);
  return NextResponse.json({
    status: "connected",
    framework: "Next.js API route",
    environment: env.ok ? "ready" : "needs_configuration",
    environmentErrors: env.errors,
    plannerValidation: validation,
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
