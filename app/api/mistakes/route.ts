import { ok, readJson } from "../../../src/server/apiResponse";
import { requireUser, unauthorized } from "../../../src/server/auth";
import { getPlannerState, savePlannerState } from "../../../src/server/repository";
import { addMistake } from "../../../src/services/mistakeService";
import type { Mistake } from "../../../src/types/planner";

export async function GET(request: Request) {
  const user = requireUser(request);
  if (!user) return unauthorized();
  return ok({ mistakes: Object.values((await getPlannerState(user.id)).mistakes) });
}

export async function POST(request: Request) {
  const user = requireUser(request);
  if (!user) return unauthorized();
  const body = await readJson<Omit<Mistake, "id" | "createdAt" | "isFixed">>(request);
  if (!body) return ok({ error: "Invalid body" }, { status: 400 });
  return ok(await savePlannerState(user.id, addMistake(await getPlannerState(user.id), body)));
}
