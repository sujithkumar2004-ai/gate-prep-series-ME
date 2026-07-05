import { ok } from "../../../../src/server/apiResponse";
import { requireUser, unauthorized } from "../../../../src/server/auth";
import { getPlannerState } from "../../../../src/server/repository";
import { calculateDailyScore, calculateStudyStreak } from "../../../../src/services/dailyScoreService";
import { generateRecoveryPlan } from "../../../../src/services/disciplineService";

export async function GET(request: Request) {
  const user = requireUser(request);
  if (!user) return unauthorized();
  const state = await getPlannerState(user.id);
  return ok({ dailyScore: calculateDailyScore(state), streak: calculateStudyStreak(state), recovery: generateRecoveryPlan(state) });
}
