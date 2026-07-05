import { NextResponse } from "next/server";
import { plannerData } from "../../../src/services/plannerService";

export async function GET() {
  return NextResponse.json(plannerData.mockTests);
}

export async function POST(request: Request) {
  return NextResponse.json({ saved: true, mock: await request.json() });
}
