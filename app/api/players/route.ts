import { NextResponse } from "next/server";
import { z } from "zod";

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
    const reqRuntime = eval("require");
    const { PrismaClient } = reqRuntime("@prisma/client") as { PrismaClient: new () => any };
    const prisma = new PrismaClient();

    const [primaryPosition, secondaryPosition, ...alternatives] = body.positions;
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
    return NextResponse.json({ ok: true, playerId: player.id });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 400 });
  }
}
