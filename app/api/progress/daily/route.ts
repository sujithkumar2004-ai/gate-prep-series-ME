import { ok } from "../../../../src/server/apiResponse";
import { requireUser, unauthorized } from "../../../../src/server/auth";
import { getPlannerState } from "../../../../src/server/repository";
import { calculateDailyScore } from "../../../../src/services/dailyScoreService";

export async function GET(request: Request) {
  const user = requireUser(request);
  if (!user) return unauthorized();
  const state = await getPlannerState(user.id);
  return ok({ score: calculateDailyScore(state) });
}

export async function POST(request: Request) {
  return GET(request);
}
