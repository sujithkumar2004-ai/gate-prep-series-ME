import { NextResponse } from "next/server";
import { createInitialState } from "../../../src/lib/plannerData";

export async function GET() {
  return NextResponse.json(createInitialState());
}

export async function PUT(request: Request) {
  const state = await request.json();
  return NextResponse.json({ saved: true, state });
}
