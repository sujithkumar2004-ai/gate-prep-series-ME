import { NextResponse } from "next/server";
import { plannerData } from "../../../../src/services/plannerService";

export async function POST() {
  return NextResponse.json({ generated: true, planner: plannerData });
}
