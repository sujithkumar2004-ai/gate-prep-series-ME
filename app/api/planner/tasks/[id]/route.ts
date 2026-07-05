import { ok, readJson } from "../../../../../src/server/apiResponse";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  return ok({ status: "backend-ready", id: params.id, patch: await readJson(request) });
}
