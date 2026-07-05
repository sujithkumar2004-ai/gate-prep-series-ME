import { NextResponse } from "next/server";
import { createInitialState, readinessScore } from "../../../../src/services/plannerService";

export async function GET() {
  const state = createInitialState();
  return NextResponse.json({ readiness: readinessScore(state), state });
}
