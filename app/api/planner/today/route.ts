import { ok } from "../../../../src/server/apiResponse";
import { plannerData } from "../../../../src/lib/plannerData";
import { todayIso } from "../../../../src/utils/dateUtils";

export async function GET() {
  const today = todayIso();
  return ok(plannerData.days.find((day) => day.date >= today) ?? plannerData.days.at(-1));
}
