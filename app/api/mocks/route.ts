import { ok, readJson } from "../../../src/server/apiResponse";
import { requireUser, unauthorized } from "../../../src/server/auth";
import { getPlannerState, savePlannerState } from "../../../src/server/repository";
import { addMockTest } from "../../../src/services/mockService";
import type { MockTest } from "../../../src/types/planner";

export async function GET(request: Request) {
  const user = requireUser(request);
  if (!user) return unauthorized();
  return ok({ mocks: Object.values((await getPlannerState(user.id)).mockTests) });
}

export async function POST(request: Request) {
  const user = requireUser(request);
  if (!user) return unauthorized();
  const body = await readJson<Omit<MockTest, "id" | "accuracy">>(request);
  if (!body) return ok({ error: "Invalid body" }, { status: 400 });
  return ok(await savePlannerState(user.id, addMockTest(await getPlannerState(user.id), body)));
}
