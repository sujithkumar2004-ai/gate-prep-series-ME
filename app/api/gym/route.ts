import { ok } from "../../../src/server/apiResponse";
import { requireUser, unauthorized } from "../../../src/server/auth";
import { getPlannerState } from "../../../src/server/repository";
import { calculateGymStreak, weeklyGymRoutine } from "../../../src/services/gymService";

export async function GET(request: Request) {
  const user = requireUser(request);
  if (!user) return unauthorized();
  const state = await getPlannerState(user.id);
  return ok({ routine: weeklyGymRoutine, logs: Object.values(state.gymLogs), streak: calculateGymStreak(state) });
}
