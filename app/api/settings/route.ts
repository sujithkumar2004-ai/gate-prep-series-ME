import { ok, readJson } from "../../../src/server/apiResponse";
import { requireUser, unauthorized } from "../../../src/server/auth";
import { getPlannerState, savePlannerState } from "../../../src/server/repository";
import { updateReminder } from "../../../src/services/reminderService";
import type { Reminder } from "../../../src/types/planner";

export async function GET(request: Request) {
  const user = requireUser(request);
  if (!user) return unauthorized();
  return ok({ reminders: Object.values((await getPlannerState(user.id)).reminders) });
}

export async function PATCH(request: Request) {
  const user = requireUser(request);
  if (!user) return unauthorized();
  const body = await readJson<{ id?: string; patch?: Partial<Reminder> }>(request);
  if (!body?.id) return ok({ error: "id required" }, { status: 400 });
  return ok(await savePlannerState(user.id, updateReminder(await getPlannerState(user.id), body.id, body.patch ?? {})));
}
