import { NextResponse } from "next/server";
import { createInitialState, monthlyReview } from "../../../src/services/plannerService";

export async function GET() {
  return NextResponse.json(monthlyReview(createInitialState()));
}
