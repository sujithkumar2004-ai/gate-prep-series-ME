import { NextResponse } from "next/server";
import { autoBacklog, emergencyMode } from "../../../../src/services/plannerService";
import type { PlannerState } from "../../../../src/types/planner";

export async function POST(request: Request) {
  const state = (await request.json()) as PlannerState;
  return NextResponse.json({ mode: emergencyMode(state), backlog: autoBacklog(state) });
}
