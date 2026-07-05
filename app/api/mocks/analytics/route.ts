import { ok } from "../../../../src/server/apiResponse";
import { requireUser, unauthorized } from "../../../../src/server/auth";
import { getPlannerState } from "../../../../src/server/repository";
import { getMockSummary } from "../../../../src/services/mockService";

export async function GET(request: Request) {
  const user = requireUser(request);
  if (!user) return unauthorized();
  return ok(getMockSummary(await getPlannerState(user.id)));
}
