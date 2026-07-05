import { NextResponse } from "next/server";
import { createInitialState } from "../../../src/services/plannerService";

export async function GET() {
  const state = createInitialState();
  return NextResponse.json({ salary: state.salary, income: state.income, expenses: state.expenses });
}
