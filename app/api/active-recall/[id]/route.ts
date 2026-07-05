import { ok, readJson } from "../../../../src/server/apiResponse";
import { requireUser, unauthorized } from "../../../../src/server/auth";
import { getPlannerState, savePlannerState } from "../../../../src/server/repository";
import { rateRecallCard } from "../../../../src/services/activeRecallService";
import type { RecallRating } from "../../../../src/types/planner";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const user = requireUser(request);
  if (!user) return unauthorized();
  const body = await readJson<{ rating?: RecallRating }>(request);
  if (!body?.rating) return ok({ error: "rating required" }, { status: 400 });
  return ok(await savePlannerState(user.id, rateRecallCard(await getPlannerState(user.id), params.id, body.rating)));
}
