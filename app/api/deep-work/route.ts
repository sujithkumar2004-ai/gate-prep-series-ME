import { ok } from "../../../src/server/apiResponse";
import { requireUser, unauthorized } from "../../../src/server/auth";
import { getPlannerState } from "../../../src/server/repository";

export async function GET(request: Request) {
  const user = requireUser(request);
  if (!user) return unauthorized();
  return ok({ sessions: Object.values((await getPlannerState(user.id)).deepWorkSessions) });
}
