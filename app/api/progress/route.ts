import { ok, readJson } from "../../../src/server/apiResponse";
import { requireUser, unauthorized } from "../../../src/server/auth";
import { getPlannerState, savePlannerState } from "../../../src/server/repository";
import type { PlannerState } from "../../../src/types/planner";

export async function GET(request: Request) {
  const user = requireUser(request);
  if (!user) return unauthorized();
  return ok(await getPlannerState(user.id));
}

export async function POST(request: Request) {
  const user = requireUser(request);
  if (!user) return unauthorized();
  const body = await readJson<PlannerState>(request);
  if (!body) return ok({ status: "ignored", reason: "empty body" }, { status: 400 });
  return ok(await savePlannerState(user.id, body));
}
