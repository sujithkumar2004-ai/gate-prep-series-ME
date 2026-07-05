import { ok } from "../../../../src/server/apiResponse";
import { createInitialPlannerState } from "../../../../src/services/progressService";

export async function POST() {
  return ok({ state: createInitialPlannerState() });
}
