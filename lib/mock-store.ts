import { prisma } from "@/lib/prisma";

export type Role = "ADMIN" | "USER";

export type PlayerPayload = {
  userId?: string;
  name: string;
  power: number;
  positions: string[];
  stats: Record<string, number>;
};

export function normalizeTrPhone(input: string): string {
  const digits = input.replace(/\D/g, "");
  const local = digits.startsWith("90") ? digits.slice(2) : digits.startsWith("0") ? digits.slice(1) : digits;
  if (!/^5\d{9}$/.test(local)) throw new Error("Telefon TR formatında olmalı: 05XXXXXXXXX veya +905XXXXXXXXX");
  return `+90${local}`;
}

function makeRefCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

export async function requestOtp(phone: string) {
  const phoneE164 = normalizeTrPhone(phone);
  const code = String(Math.floor(100000 + Math.random() * 900000));
  await prisma.otpCode.create({ data: { phoneE164, code, expiresAt: new Date(Date.now() + 5 * 60_000) } });
  return { phoneE164, mockCode: code };
}

export async function verifyOtp(phone: string, code: string) {
  const phoneE164 = normalizeTrPhone(phone);
  const otp = await prisma.otpCode.findFirst({ where: { phoneE164, code }, orderBy: { createdAt: "desc" } });
  if (!otp || otp.expiresAt.getTime() < Date.now()) throw new Error("Geçersiz veya süresi geçmiş kod");

  await prisma.otpCode.deleteMany({ where: { phoneE164 } });

  const user = await prisma.user.upsert({
    where: { phoneE164 },
    update: {},
    create: { phoneE164, role: "USER" },
  });

  return user;
}

export async function bootstrapAdmin(phone: string) {
  const phoneE164 = normalizeTrPhone(phone);
  const adminCount = await prisma.user.count({ where: { role: "ADMIN" } });
  const existing = await prisma.user.findUnique({ where: { phoneE164 } });

  if (adminCount > 0) {
    if (!existing || existing.role !== "ADMIN") throw new Error("Ilk admin zaten tanimli. Bu ekrandan yeni admin olusturulamaz.");
    return existing;
  }

  if (existing) {
    return prisma.user.update({ where: { id: existing.id }, data: { role: "ADMIN" } });
  }

  return prisma.user.create({ data: { phoneE164, role: "ADMIN" } });
}

export async function createRoom(adminUserId: string, name: string, invitedPhones: string[]) {
  const admin = await prisma.user.findUnique({ where: { id: adminUserId } });
  if (!admin) throw new Error("Admin kullanıcı bulunamadı");
  if (admin.role !== "ADMIN") throw new Error("Sadece ADMIN oda oluşturabilir");

  const room = await prisma.room.create({ data: { name, adminUserId } });

  const createdInvites = [] as Array<{ phoneE164: string; refCode: string }>;
  for (const phone of invitedPhones) {
    const phoneE164 = normalizeTrPhone(phone);
    const invite = await prisma.invite.create({
      data: {
        roomId: room.id,
        phoneE164,
        refCode: makeRefCode(),
        expiresAt: new Date(Date.now() + 7 * 24 * 3600_000),
      },
    });
    createdInvites.push({ phoneE164: invite.phoneE164, refCode: invite.refCode });
  }

  return { roomId: room.id, invites: createdInvites };
}

export async function joinByRef(refCode: string, userId: string, phone: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("Kullanıcı bulunamadı");
  const phoneE164 = normalizeTrPhone(phone);

  const invite = await prisma.invite.findUnique({ where: { refCode: refCode.toUpperCase() } });
  if (!invite) throw new Error("Referans kodu bulunamadı");
  if (invite.expiresAt.getTime() < Date.now()) throw new Error("Referans kodu süresi dolmuş");
  if (invite.usedAt) throw new Error("Referans kodu daha önce kullanılmış");
  if (invite.phoneE164 !== phoneE164) throw new Error("Bu kod bu telefon numarası için tanımlı değil");

  await prisma.invite.update({ where: { id: invite.id }, data: { usedAt: new Date() } });
  return { roomId: invite.roomId };
}

export async function createPlayer(payload: PlayerPayload) {
  if (payload.positions.length < 1) throw new Error("En az bir mevki secilmeli");
  const [primaryPosition, secondaryPosition, ...alternatives] = payload.positions;

  const player = await prisma.player.create({
    data: {
      userId: payload.userId,
      name: payload.name,
      power: payload.power,
      primaryPosition,
      secondaryPosition: secondaryPosition || null,
      alternativePositions: JSON.stringify(alternatives),
      statsJson: JSON.stringify(payload.stats),
    },
  });

  return player;
}

export async function listPlayers(_roomId: string) {
  const players = await prisma.player.findMany({ orderBy: { createdAt: "desc" }, take: 200 });
  return players.map((p) => ({
    id: p.id,
    name: p.name,
    power: p.power,
    primaryPosition: p.primaryPosition,
    secondaryPosition: p.secondaryPosition,
    alternativePositions: JSON.parse(p.alternativePositions || "[]"),
    stats: JSON.parse(p.statsJson || "{}"),
  }));
}

export function matchHistory(_roomId: string) {
  return { matches: [], playerAverages: [] };
}
