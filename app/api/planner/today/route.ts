import { NextResponse } from "next/server";
import { plannerData } from "../../../../src/services/plannerService";

export async function GET() {
  const today = new Date().toISOString().slice(0, 10);
  return NextResponse.json(plannerData.daywisePlan.find((day) => day.date >= today) ?? plannerData.daywisePlan.at(-1));
}
