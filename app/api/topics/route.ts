import { NextResponse } from "next/server";
import { plannerData } from "../../../src/services/plannerService";

export async function GET() {
  return NextResponse.json(plannerData.syllabusMap);
}

export async function POST(request: Request) {
  return NextResponse.json({ created: true, topic: await request.json() });
}
