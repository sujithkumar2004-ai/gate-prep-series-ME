import { ok } from "../../../src/server/apiResponse";
import { requireUser, unauthorized } from "../../../src/server/auth";
import { getPlannerState } from "../../../src/server/repository";
import { getBacklogRows } from "../../../src/services/backlogService";

export async function GET(request: Request) {
  const user = requireUser(request);
  if (!user) return unauthorized();
  return ok(getBacklogRows(await getPlannerState(user.id)));
}
