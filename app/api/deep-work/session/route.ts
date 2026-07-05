import { ok, readJson } from "../../../../src/server/apiResponse";
import { requireUser, unauthorized } from "../../../../src/server/auth";
import { getPlannerState, savePlannerState } from "../../../../src/server/repository";
import { upsertDeepWorkSession } from "../../../../src/services/deepWorkService";
import type { DeepWorkSession } from "../../../../src/types/planner";

export async function POST(request: Request) {
  const user = requireUser(request);
  if (!user) return unauthorized();
  const body = await readJson<DeepWorkSession>(request);
  if (!body) return ok({ error: "Invalid body" }, { status: 400 });
  return ok(await savePlannerState(user.id, upsertDeepWorkSession(await getPlannerState(user.id), body)));
}
