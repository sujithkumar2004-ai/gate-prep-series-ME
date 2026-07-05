import { NextResponse } from "next/server";
import { createInitialState, targetScoreMetrics } from "../../../src/services/plannerService";

export async function GET() {
  const state = createInitialState();
  return NextResponse.json(targetScoreMetrics(state));
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  return NextResponse.json({ status: "backend-ready", target: body });
}
