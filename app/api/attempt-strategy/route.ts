import { NextResponse } from "next/server";
import { createInitialState, examStrategyEngine } from "../../../src/services/plannerService";

export async function GET() {
  return NextResponse.json({ strategy: examStrategyEngine(createInitialState()) });
}
