import { NextResponse } from "next/server";
import { createInitialState } from "../../../../src/services/plannerService";
import { localCoachFallback } from "../../../../src/services/aiCoachService";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  return NextResponse.json(localCoachFallback({ kind: "weak-topic-explanation", state: createInitialState(), topic: body.topic }));
}
