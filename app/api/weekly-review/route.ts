import { NextResponse } from "next/server";
import { createInitialState, weeklyReview } from "../../../src/services/plannerService";

export async function GET() {
  return NextResponse.json(weeklyReview(createInitialState()));
}
