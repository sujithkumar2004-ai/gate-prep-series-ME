import { ok } from "../../../src/server/apiResponse";
import { requireUser, unauthorized } from "../../../src/server/auth";

export async function GET(request: Request) {
  const user = requireUser(request);
  if (!user) return unauthorized();
  return ok({ salary: [], expenses: [], status: "backend-ready" });
}
