import { ok } from "../../../../src/server/apiResponse";
import { requireUser, unauthorized } from "../../../../src/server/auth";
import { getPlannerState } from "../../../../src/server/repository";
import { getDashboardMetrics } from "../../../../src/services/plannerService";

export async function GET(request: Request) {
  const user = requireUser(request);
  if (!user) return unauthorized();
  return ok(getDashboardMetrics(await getPlannerState(user.id)));
}
