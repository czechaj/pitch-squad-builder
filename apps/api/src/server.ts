import Fastify from "fastify";
import { PrismaClient, Role } from "@prisma/client";
import { z } from "zod";

const env = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL zorunlu"),
  DATABASE_URL_UNPOOLED: z.string().optional(),
  PORT: z.string().optional()
}).safeParse(process.env);

if (!env.success) {
  console.error("Eksik/hatali environment variables:", env.error.flatten().fieldErrors);
  process.exit(1);
}

const prisma = new PrismaClient();
const app = Fastify({ logger: true });

const otpStore = new Map<string, { code: string; expiresAt: number }>();

function normalizeTrPhone(input: string): string {
  const digits = input.replace(/\D/g, "");
  const local = digits.startsWith("90") ? digits.slice(2) : digits.startsWith("0") ? digits.slice(1) : digits;
  if (!/^5\d{9}$/.test(local)) throw new Error("Telefon TR formatında olmalı: 05XXXXXXXXX veya +905XXXXXXXXX");
  return `+90${local}`;
}

function makeRefCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

app.get("/health", async () => ({ ok: true }));

app.post("/auth/mock-otp/request", async (req, reply) => {
  const body = z.object({ phone: z.string() }).parse(req.body);
  const phoneE164 = normalizeTrPhone(body.phone);
  const code = String(Math.floor(100000 + Math.random() * 900000));
  otpStore.set(phoneE164, { code, expiresAt: Date.now() + 5 * 60 * 1000 });
  return reply.send({ ok: true, phoneE164, mockCode: code });
});

app.post("/auth/mock-otp/verify", async (req, reply) => {
  const body = z.object({ phone: z.string(), code: z.string().length(6) }).parse(req.body);
  const phoneE164 = normalizeTrPhone(body.phone);
  const otp = otpStore.get(phoneE164);
  if (!otp || otp.code !== body.code || otp.expiresAt < Date.now()) {
    return reply.code(400).send({ ok: false, error: "Geçersiz veya süresi geçmiş kod" });
  }
  otpStore.delete(phoneE164);
  let user = await prisma.user.findUnique({ where: { phoneE164 } });
  if (!user) user = await prisma.user.create({ data: { phoneE164, role: Role.USER } });
  return reply.send({ ok: true, userId: user.id, role: user.role, phoneE164 });
});

app.post("/rooms", async (req, reply) => {
  const body = z.object({ adminUserId: z.string(), name: z.string().min(2), invitedPhones: z.array(z.string()).default([]) }).parse(req.body);

  const room = await prisma.room.create({
    data: {
      name: body.name,
      adminUserId: body.adminUserId,
      members: { create: { userId: body.adminUserId, status: "ACTIVE" } }
    }
  });

  const invites = [] as { phoneE164: string; refCode: string }[];
  for (const p of body.invitedPhones) {
    const phoneE164 = normalizeTrPhone(p);
    const refCode = makeRefCode();
    await prisma.invite.create({
      data: { roomId: room.id, phoneE164, refCode, expiresAt: new Date(Date.now() + 7 * 24 * 3600 * 1000) }
    });
    invites.push({ phoneE164, refCode });
  }

  return reply.send({ ok: true, roomId: room.id, invites });
});

app.post("/rooms/join-by-ref", async (req, reply) => {
  const body = z.object({ refCode: z.string().min(4), userId: z.string(), phone: z.string() }).parse(req.body);
  const phoneE164 = normalizeTrPhone(body.phone);

  const invite = await prisma.invite.findUnique({ where: { refCode: body.refCode.toUpperCase() } });
  if (!invite) return reply.code(404).send({ ok: false, error: "Referans kodu bulunamadı" });
  if (invite.expiresAt.getTime() < Date.now()) return reply.code(400).send({ ok: false, error: "Referans kodu süresi dolmuş" });
  if (invite.phoneE164 !== phoneE164) return reply.code(403).send({ ok: false, error: "Bu kod bu telefon numarası için tanımlı değil" });

  await prisma.roomMember.upsert({
    where: { roomId_userId: { roomId: invite.roomId, userId: body.userId } },
    update: { status: "ACTIVE" },
    create: { roomId: invite.roomId, userId: body.userId, status: "ACTIVE" }
  });

  await prisma.invite.update({ where: { id: invite.id }, data: { usedAt: new Date() } });
  return reply.send({ ok: true, roomId: invite.roomId });
});

app.get("/rooms/:roomId/players", async (req, reply) => {
  const { roomId } = z.object({ roomId: z.string() }).parse(req.params);
  const players = await prisma.player.findMany({ where: { roomId }, orderBy: { createdAt: "desc" } });
  return reply.send({ ok: true, players });
});

app.get("/rooms/:roomId/match-history", async (req, reply) => {
  const { roomId } = z.object({ roomId: z.string() }).parse(req.params);

  const matches = await prisma.match.findMany({
    where: { roomId },
    include: { ratings: true },
    orderBy: { playedAt: "desc" }
  });

  const averages = await prisma.matchRating.groupBy({
    by: ["targetPlayerId"],
    where: { match: { roomId } },
    _avg: { score: true },
    _count: { score: true }
  });

  return reply.send({ ok: true, matches, playerAverages: averages.map(a => ({ playerId: a.targetPlayerId, avgScore: a._avg.score ?? 0, voteCount: a._count.score })) });
});

const port = Number(process.env.PORT || 4000);
app.listen({ port, host: "0.0.0.0" }).catch((err) => {
  app.log.error(err);
  process.exit(1);
});
