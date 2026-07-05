import { NextResponse } from "next/server";
import { createInitialState, energyCorrelation } from "../../../src/services/plannerService";

export async function GET() {
  const state = createInitialState();
  return NextResponse.json({ logs: state.energyLogs, correlation: energyCorrelation(state) });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  return NextResponse.json({ status: "backend-ready", energyLog: body });
}
