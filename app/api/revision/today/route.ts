import { NextResponse } from "next/server";
import { createInitialState, spacedRevisionSchedule } from "../../../../src/services/plannerService";

export async function GET() {
  const today = new Date().toISOString().slice(0, 10);
  return NextResponse.json(spacedRevisionSchedule(createInitialState()).filter((item) => item.revisionDate <= today));
}
