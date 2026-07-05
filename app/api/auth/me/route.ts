import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    id: "user-sk001",
    username: "SK001",
    displayName: "SK001",
    role: "student"
  });
}
