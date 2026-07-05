import { ok, readJson } from "../../../src/server/apiResponse";
import { requireUser, unauthorized } from "../../../src/server/auth";
import { getPlannerState, savePlannerState } from "../../../src/server/repository";
import { addActiveRecallCard, dueRecallCards } from "../../../src/services/activeRecallService";
import type { ActiveRecallCard } from "../../../src/types/planner";

export async function GET(request: Request) {
  const user = requireUser(request);
  if (!user) return unauthorized();
  const state = await getPlannerState(user.id);
  return ok({ cards: Object.values(state.activeRecallCards), due: dueRecallCards(state) });
}

export async function POST(request: Request) {
  const user = requireUser(request);
  if (!user) return unauthorized();
  const body = await readJson<Omit<ActiveRecallCard, "id" | "createdAt">>(request);
  if (!body) return ok({ error: "Invalid body" }, { status: 400 });
  return ok(await savePlannerState(user.id, addActiveRecallCard(await getPlannerState(user.id), body)));
}
