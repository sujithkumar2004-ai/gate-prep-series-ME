import { ok } from "../../../../src/server/apiResponse";
import { requireUser, unauthorized } from "../../../../src/server/auth";
import { getPlannerState } from "../../../../src/server/repository";
import { getRevisionBuckets } from "../../../../src/services/revisionService";

export async function GET(request: Request) {
  const user = requireUser(request);
  if (!user) return unauthorized();
  return ok(getRevisionBuckets(await getPlannerState(user.id)));
}
