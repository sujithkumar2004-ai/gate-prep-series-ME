import { NextResponse } from "next/server";
import { autoBacklog, createInitialState, emergencyMode } from "../../../src/services/plannerService";

export async function GET() {
  const state = createInitialState();
  return NextResponse.json({ mode: emergencyMode(state), backlog: autoBacklog(state) });
}
