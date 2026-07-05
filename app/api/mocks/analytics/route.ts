import { NextResponse } from "next/server";
import { createInitialState, mockTrend } from "../../../../src/services/plannerService";

export async function GET() {
  return NextResponse.json({ trend: mockTrend(createInitialState()) });
}
