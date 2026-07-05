import { NextResponse } from "next/server";

export async function POST(request: Request) {
  return NextResponse.json({ completed: true, revision: await request.json() });
}
