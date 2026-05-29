import { NextResponse } from "next/server";
import { z } from "zod";
import { createPlayer } from "@/lib/mock-store";

const playerSchema = z.object({
  roomId: z.string().min(1),
  userId: z.string().optional(),
  name: z.string().min(2),
  power: z.number().min(1).max(20),
  positions: z.array(z.string().min(1)).min(1),
  stats: z.record(z.number().min(1).max(20)),
});

export async function POST(req: Request) {
  try {
    const body = playerSchema.parse(await req.json());
    const player = await createPlayer(body);
    return NextResponse.json({ ok: true, playerId: player.id });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 400 });
  }
}
