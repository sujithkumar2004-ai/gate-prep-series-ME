import { ok } from "../../../../src/server/apiResponse";
import { requireUser, unauthorized } from "../../../../src/server/auth";
import { getPlannerState, savePlannerState } from "../../../../src/server/repository";
import { rescheduleBacklog } from "../../../../src/services/backlogService";

export async function POST(request: Request) {
  const user = requireUser(request);
  if (!user) return unauthorized();
  return ok(await savePlannerState(user.id, rescheduleBacklog(await getPlannerState(user.id))));
}
