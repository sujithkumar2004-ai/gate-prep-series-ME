import { NextResponse } from "next/server";
import { confidenceAccuracyInsights, createInitialState } from "../../../src/services/plannerService";

export async function GET() {
  return NextResponse.json(confidenceAccuracyInsights(createInitialState()));
}
