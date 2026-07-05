import { apiError } from "./apiResponse";
import { verifyToken } from "./crypto";

export function tokenFromRequest(request: Request) {
  const auth = request.headers.get("authorization");
  return auth?.startsWith("Bearer ") ? auth.slice(7) : undefined;
}

export function requireUser(request: Request) {
  const payload = verifyToken(tokenFromRequest(request));
  if (!payload?.sub || typeof payload.sub !== "string") return null;
  return { id: payload.sub, email: String(payload.email ?? ""), name: String(payload.name ?? "") };
}

export function unauthorized() {
  return apiError("Unauthorized", 401, "unauthorized");
}
