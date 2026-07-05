import { ok, readJson } from "../../../src/server/apiResponse";
import { requireUser, unauthorized } from "../../../src/server/auth";
import { getPlannerState, savePlannerState } from "../../../src/server/repository";
import { addQuestionBankItem } from "../../../src/services/questionBankService";
import type { QuestionBankItem } from "../../../src/types/planner";

export async function GET(request: Request) {
  const user = requireUser(request);
  if (!user) return unauthorized();
  return ok({ questions: Object.values((await getPlannerState(user.id)).questionBank) });
}

export async function POST(request: Request) {
  const user = requireUser(request);
  if (!user) return unauthorized();
  const body = await readJson<Omit<QuestionBankItem, "id">>(request);
  if (!body) return ok({ error: "Invalid body" }, { status: 400 });
  return ok(await savePlannerState(user.id, addQuestionBankItem(await getPlannerState(user.id), body)));
}
