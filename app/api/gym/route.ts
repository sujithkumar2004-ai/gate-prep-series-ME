import { NextResponse } from "next/server";
import { createInitialState } from "../../../src/services/plannerService";

export async function GET() {
  const state = createInitialState();
  return NextResponse.json({ routine: state.gymRoutine, logs: state.gymLogs });
}
