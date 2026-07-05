import { apiError, ok, readJson } from "../../../../src/server/apiResponse";
import { authenticateUser, publicUser } from "../../../../src/server/repository";
import { signToken } from "../../../../src/server/crypto";

type LoginBody = { email?: string; password?: string };

export async function POST(request: Request) {
  const body = await readJson<LoginBody>(request);
  if (!body?.email || !body.password) return apiError("Email and password are required", 400, "validation_error");
  const user = await authenticateUser(body.email, body.password);
  if (!user) return apiError("Invalid credentials", 401, "unauthorized");
  return ok({ token: signToken({ sub: user.id, email: user.email, name: user.name }), user: publicUser(user) });
}
