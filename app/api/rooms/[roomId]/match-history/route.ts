import { NextResponse } from "next/server";
import { matchHistory } from "@/lib/mock-store";

export async function GET(_: Request, { params }: { params: { roomId: string } }) {
  const data = matchHistory(params.roomId);
  return NextResponse.json({ ok: true, ...data });
}
