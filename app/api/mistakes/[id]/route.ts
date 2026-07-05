import { NextResponse } from "next/server";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  return NextResponse.json({ id: params.id, patch: await request.json(), saved: true });
}
