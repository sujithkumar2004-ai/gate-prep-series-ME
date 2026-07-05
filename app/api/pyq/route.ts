import { NextResponse } from "next/server";
import { plannerData } from "../../../src/services/plannerService";

export async function GET() {
  return NextResponse.json(plannerData.daywisePlan.filter((day) => day.pyqTarget > 0));
}
