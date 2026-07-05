import { NextResponse } from "next/server";
import { createInitialState } from "../../../src/services/plannerService";

export async function GET() {
  return NextResponse.json(createInitialState().mistakes);
}

export async function POST(request: Request) {
  return NextResponse.json({ saved: true, mistake: await request.json() });
}
