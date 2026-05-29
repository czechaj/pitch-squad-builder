export type Role = "ADMIN" | "USER";

export type PlayerPayload = {
  roomId?: string;
  userId?: string;
  name: string;
  power: number;
  positions: string[];
  stats: Record<string, number>;
};

type User = { id: string; phoneE164: string; role: Role };
type Otp = { phoneE164: string; code: string; expiresAt: number };
type Invite = { roomId: string; phoneE164: string; refCode: string; expiresAt: number; usedAt?: number };
type Room = { id: string; name: string; adminUserId: string };
type Player = {
  id: string;
  roomId?: string;
  userId?: string;
  name: string;
  power: number;
  primaryPosition: string;
  secondaryPosition: string | null;
  alternativePositions: string[];
  stats: Record<string, number>;
  createdAt: number;
};

const usersByPhone = new Map<string, User>();
const usersById = new Map<string, User>();
const otps: Otp[] = [];
const invitesByCode = new Map<string, Invite>();
const roomsById = new Map<string, Room>();
const players: Player[] = [];

function id(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

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
  otps.push({ phoneE164, code, expiresAt: Date.now() + 5 * 60_000 });
  return { phoneE164, mockCode: code };
}

export async function verifyOtp(phone: string, code: string) {
  const phoneE164 = normalizeTrPhone(phone);
  const otp = [...otps].reverse().find((o) => o.phoneE164 === phoneE164 && o.code === code);
  if (!otp || otp.expiresAt < Date.now()) throw new Error("Geçersiz veya süresi geçmiş kod");

  for (let i = otps.length - 1; i >= 0; i -= 1) {
    if (otps[i].phoneE164 === phoneE164) otps.splice(i, 1);
  }

  const existing = usersByPhone.get(phoneE164);
  if (existing) return existing;

  const user: User = { id: id("usr"), phoneE164, role: "USER" };
  usersByPhone.set(phoneE164, user);
  usersById.set(user.id, user);
  return user;
}

export async function bootstrapAdmin(phone: string) {
  const phoneE164 = normalizeTrPhone(phone);
  const admins = [...usersById.values()].filter((u) => u.role === "ADMIN");
  const existing = usersByPhone.get(phoneE164);

  if (admins.length > 0) {
    if (!existing || existing.role !== "ADMIN") throw new Error("Ilk admin zaten tanimli. Bu ekrandan yeni admin olusturulamaz.");
    return existing;
  }

  if (existing) {
    existing.role = "ADMIN";
    return existing;
  }

  const admin: User = { id: id("usr"), phoneE164, role: "ADMIN" };
  usersByPhone.set(phoneE164, admin);
  usersById.set(admin.id, admin);
  return admin;
}

export async function createRoom(adminUserId: string, name: string, invitedPhones: string[]) {
  const admin = usersById.get(adminUserId);
  if (!admin) throw new Error("Admin kullanıcı bulunamadı");
  if (admin.role !== "ADMIN") throw new Error("Sadece ADMIN oda oluşturabilir");

  const room: Room = { id: id("room"), name, adminUserId };
  roomsById.set(room.id, room);

  const createdInvites = [] as Array<{ phoneE164: string; refCode: string }>;
  for (const phone of invitedPhones) {
    const phoneE164 = normalizeTrPhone(phone);
    const invite: Invite = {
      roomId: room.id,
      phoneE164,
      refCode: makeRefCode(),
      expiresAt: Date.now() + 7 * 24 * 3600_000,
    };
    invitesByCode.set(invite.refCode, invite);
    createdInvites.push({ phoneE164: invite.phoneE164, refCode: invite.refCode });
  }

  return { roomId: room.id, invites: createdInvites };
}

export async function joinByRef(refCode: string, userId: string, phone: string) {
  const user = usersById.get(userId);
  if (!user) throw new Error("Kullanıcı bulunamadı");
  const phoneE164 = normalizeTrPhone(phone);

  const invite = invitesByCode.get(refCode.toUpperCase());
  if (!invite) throw new Error("Referans kodu bulunamadı");
  if (invite.expiresAt < Date.now()) throw new Error("Referans kodu süresi dolmuş");
  if (invite.usedAt) throw new Error("Referans kodu daha önce kullanılmış");
  if (invite.phoneE164 !== phoneE164) throw new Error("Bu kod bu telefon numarası için tanımlı değil");

  invite.usedAt = Date.now();
  return { roomId: invite.roomId };
}

export async function createPlayer(payload: PlayerPayload) {
  if (payload.positions.length < 1) throw new Error("En az bir mevki secilmeli");
  const [primaryPosition, secondaryPosition, ...alternatives] = payload.positions;

  const player: Player = {
    id: id("ply"),
    roomId: payload.roomId,
    userId: payload.userId,
    name: payload.name,
    power: payload.power,
    primaryPosition,
    secondaryPosition: secondaryPosition || null,
    alternativePositions: alternatives,
    stats: payload.stats,
    createdAt: Date.now(),
  };

  players.unshift(player);
  return player;
}

export async function listPlayers(roomId: string) {
  return players
    .filter((p) => !roomId || p.roomId === roomId)
    .slice(0, 200)
    .map((p) => ({
      id: p.id,
      name: p.name,
      power: p.power,
      primaryPosition: p.primaryPosition,
      secondaryPosition: p.secondaryPosition,
      alternativePositions: p.alternativePositions,
      stats: p.stats,
    }));
}

export function matchHistory(_roomId: string) {
  return { matches: [], playerAverages: [] };
}
