import { NextResponse } from "next/server";
import { createInitialState, revisionDebt } from "../../../../src/services/plannerService";

export async function GET() {
  return NextResponse.json({ debt: revisionDebt(createInitialState()) });
}
