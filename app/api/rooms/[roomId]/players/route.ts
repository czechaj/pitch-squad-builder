import { NextResponse } from "next/server";
import { listPlayers } from "@/lib/mock-store";

export async function GET(_: Request, { params }: { params: { roomId: string } }) {
  return NextResponse.json({ ok: true, players: await listPlayers(params.roomId) });
}
