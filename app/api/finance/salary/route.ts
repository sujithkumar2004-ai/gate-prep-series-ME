import { NextResponse } from "next/server";

export async function POST(request: Request) {
  return NextResponse.json({ saved: true, salary: await request.json() });
}
