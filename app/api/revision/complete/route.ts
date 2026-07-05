import { ok, readJson } from "../../../../src/server/apiResponse";
import { requireUser, unauthorized } from "../../../../src/server/auth";
import { getPlannerState, savePlannerState } from "../../../../src/server/repository";
import { markRevisionCompleted } from "../../../../src/services/revisionService";

export async function POST(request: Request) {
  const user = requireUser(request);
  if (!user) return unauthorized();
  const body = await readJson<{ id?: string }>(request);
  if (!body?.id) return ok({ error: "id required" }, { status: 400 });
  return ok(await savePlannerState(user.id, markRevisionCompleted(await getPlannerState(user.id), body.id)));
}
