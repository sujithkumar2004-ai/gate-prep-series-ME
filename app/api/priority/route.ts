import { NextResponse } from "next/server";
import { createInitialState, priorityEngine } from "../../../src/services/plannerService";

export async function GET() {
  return NextResponse.json({ priorities: priorityEngine(createInitialState()) });
}
