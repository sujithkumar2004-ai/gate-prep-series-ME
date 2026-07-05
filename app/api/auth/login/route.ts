import { NextResponse } from "next/server";

const demoUsers = [
  { id: "user-sk001", username: "SK001", password: "SK001@123", displayName: "SK001", role: "student" },
  { id: "user-ar001", username: "AR001", password: "AR001@123", displayName: "AR001", role: "student" }
];

export async function POST(request: Request) {
  const body = (await request.json()) as { username?: string; password?: string };
  const normalizedUsername = body.username?.trim().toUpperCase();
  const user = demoUsers.find((item) => item.username === normalizedUsername && item.password === body.password);

  if (!user) {
    return NextResponse.json({ message: "Invalid username or password" }, { status: 401 });
  }

  return NextResponse.json({
    token: `demo-token-${user.id}`,
    backendConnected: true,
    user: {
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      role: user.role
    }
  });
}
