import { ok, readJson } from "../../../../src/server/apiResponse";
import { requireUser, unauthorized } from "../../../../src/server/auth";

export async function POST(request: Request) {
  const user = requireUser(request);
  if (!user) return unauthorized();
  return ok({ status: "backend-ready", salary: await readJson(request) });
}
