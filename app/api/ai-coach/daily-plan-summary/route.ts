import { NextResponse } from "next/server";
import { createInitialState } from "../../../../src/services/plannerService";
import { localCoachFallback } from "../../../../src/services/aiCoachService";

export async function POST() {
  return NextResponse.json(localCoachFallback({ kind: "daily-plan-summary", state: createInitialState() }));
}
