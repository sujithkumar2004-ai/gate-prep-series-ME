import { ok, readJson } from "../../../../src/server/apiResponse";
import { requireUser, unauthorized } from "../../../../src/server/auth";
import { getPlannerState, savePlannerState } from "../../../../src/server/repository";
import { updateMistake } from "../../../../src/services/mistakeService";
import type { Mistake } from "../../../../src/types/planner";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const user = requireUser(request);
  if (!user) return unauthorized();
  const body = await readJson<Partial<Mistake>>(request);
  return ok(await savePlannerState(user.id, updateMistake(await getPlannerState(user.id), params.id, body ?? {})));
}
