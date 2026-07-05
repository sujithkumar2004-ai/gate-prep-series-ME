import type { AuthSession, PlannerUser } from "../types/planner";

type LoginPayload = {
  username: string;
  password: string;
};

const fallbackUsers: Array<PlannerUser & { password: string }> = [
  { id: "user-sk001", username: "SK001", password: "SK001@123", displayName: "SK001", role: "student" },
  { id: "user-ar001", username: "AR001", password: "AR001@123", displayName: "AR001", role: "student" }
];

export async function loginWithBackendFallback(payload: LoginPayload): Promise<AuthSession> {
  try {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (response.ok) {
      return (await response.json()) as AuthSession;
    }
  } catch {
    // Local fallback keeps the app usable until a real backend is attached.
  }

  const normalizedUsername = payload.username.trim().toUpperCase();
  const user = fallbackUsers.find((item) => item.username === normalizedUsername && item.password === payload.password);
  if (!user) {
    throw new Error("Invalid username or password");
  }

  return {
    token: `local-${user.id}`,
    user: {
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      role: user.role
    },
    backendConnected: false
  };
}
