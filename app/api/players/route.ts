import { NextResponse } from "next/server";
import { z } from "zod";
import { createPlayer as createPlayerFallback } from "@/lib/mock-store";
import { logApiRequest, readJsonWithLimit, sanitizeError } from "@/lib/api-guard";

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
    logApiRequest(req, "/api/players");
    const body = playerSchema.parse(await readJsonWithLimit(req));
    const [primaryPosition, secondaryPosition, ...alternatives] = body.positions;
    try {
      const reqRuntime = eval("require");
      const { PrismaClient } = reqRuntime("@prisma/client") as { PrismaClient: new () => any };
      const prisma = new PrismaClient();
      const player = await prisma.player.create({
        data: {
          userId: body.userId,
          name: body.name,
          power: body.power,
          primaryPosition,
          secondaryPosition: secondaryPosition || null,
          alternativePositions: JSON.stringify(alternatives),
          statsJson: JSON.stringify(body.stats),
        },
      });
      await prisma.$disconnect();
      return NextResponse.json({ ok: true, playerId: player.id, storage: "prisma" });
    } catch {
      const player = await createPlayerFallback(body);
      return NextResponse.json({ ok: true, playerId: player.id, storage: "fallback" });
    }
  } catch (e: unknown) {
    return NextResponse.json({ ok: false, error: sanitizeError(e) }, { status: 400 });
  }
}
