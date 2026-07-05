import { NextResponse } from "next/server";
import { createInitialState } from "../../../src/services/plannerService";

export async function GET() {
  return NextResponse.json({ reminders: createInitialState().reminders });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  return NextResponse.json({ status: "backend-ready", reminder: body });
}
