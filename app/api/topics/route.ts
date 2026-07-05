import { ok, readJson } from "../../../src/server/apiResponse";
import { getPlannerSource } from "../../../src/server/repository";

export async function GET() {
  return ok({ subjects: getPlannerSource().subjects, topics: getPlannerSource().topics });
}

export async function POST(request: Request) {
  return ok({ status: "backend-ready", topic: await readJson(request) });
}
