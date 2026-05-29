import { z } from "zod";

const POSITIONS = ["GK", "CB", "LB", "RB", "DM", "CM", "AM", "LW", "RW", "ST"] as const;
const ATTRS = [
  "acceleration", "pace", "stamina", "strength", "agility", "jumpingReach", "dribbling", "technique",
  "passing", "longShots", "vision", "finishing", "firstTouch", "tackling", "marking", "positioning",
  "decisions", "composure", "aggression", "teamwork", "workRate", "reflexes", "handling",
] as const;

type Position = (typeof POSITIONS)[number];
type AttributeKey = (typeof ATTRS)[number];
type Player = { id: string; name: string; positions: Position[]; attributes: Record<AttributeKey, number> };

const weights: Record<Position, Partial<Record<AttributeKey, number>>> = {
  GK: { reflexes: 0.24, handling: 0.2, positioning: 0.16, agility: 0.12, decisions: 0.1, composure: 0.08, passing: 0.1 },
  CB: { tackling: 0.18, marking: 0.16, positioning: 0.14, strength: 0.14, jumpingReach: 0.1, pace: 0.1, decisions: 0.1, passing: 0.08 },
  LB: { acceleration: 0.14, pace: 0.12, stamina: 0.14, tackling: 0.14, workRate: 0.12, passing: 0.12, dribbling: 0.12, positioning: 0.1 },
  RB: { acceleration: 0.14, pace: 0.12, stamina: 0.14, tackling: 0.14, workRate: 0.12, passing: 0.12, dribbling: 0.12, positioning: 0.1 },
  DM: { tackling: 0.16, positioning: 0.14, passing: 0.14, vision: 0.12, marking: 0.12, decisions: 0.12, teamwork: 0.1, stamina: 0.1 },
  CM: { passing: 0.16, vision: 0.14, stamina: 0.12, technique: 0.12, firstTouch: 0.12, decisions: 0.12, teamwork: 0.12, workRate: 0.1 },
  AM: { vision: 0.16, passing: 0.14, technique: 0.14, firstTouch: 0.12, dribbling: 0.14, composure: 0.12, longShots: 0.1, finishing: 0.08 },
  LW: { acceleration: 0.14, pace: 0.12, agility: 0.1, dribbling: 0.16, technique: 0.12, finishing: 0.1, firstTouch: 0.12, decisions: 0.14 },
  RW: { acceleration: 0.14, pace: 0.12, agility: 0.1, dribbling: 0.16, technique: 0.12, finishing: 0.1, firstTouch: 0.12, decisions: 0.14 },
  ST: { finishing: 0.2, firstTouch: 0.14, positioning: 0.12, composure: 0.12, acceleration: 0.12, pace: 0.1, strength: 0.1, jumpingReach: 0.1 },
};

const attrShape = Object.fromEntries(ATTRS.map((k) => [k, z.number().int().min(1).max(20)])) as Record<AttributeKey, z.ZodNumber>;

const payloadSchema = z.object({
  teamCount: z.number().int().min(2).max(4).default(2),
  players: z.array(z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    positions: z.array(z.enum(POSITIONS)).min(1),
    attributes: z.object(attrShape),
  })).min(2),
});

function positionalScore(player: Player, position: Position): number {
  const ws = weights[position];
  let score = 0;
  for (const [attr, w] of Object.entries(ws)) score += player.attributes[attr as AttributeKey] * (w ?? 0);
  return score;
}

function playerPower(player: Player): number {
  return Math.max(...player.positions.map((p, i) => positionalScore(player, p) * (i === 0 ? 1 : Math.max(0.6, 1 - i * 0.15))));
}

export function calculateBalance(input: unknown) {
  const parsed = payloadSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: "Invalid payload", details: parsed.error.flatten() };

  const { players, teamCount } = parsed.data;
  const teams = Array.from({ length: teamCount }, (_, i) => ({ name: `Team ${String.fromCharCode(65 + i)}`, playerIds: [] as string[], totalPower: 0 }));
  const ranked = players.map((p) => ({ player: p, power: playerPower(p) })).sort((a, b) => b.power - a.power);

  for (const entry of ranked) {
    teams.sort((a, b) => a.totalPower - b.totalPower || a.playerIds.length - b.playerIds.length);
    teams[0].playerIds.push(entry.player.id);
    teams[0].totalPower += entry.power;
  }

  return {
    ok: true as const,
    teams: teams.map((t) => ({ ...t, totalPower: Number(t.totalPower.toFixed(2)) })),
    players: players.map((p) => ({ id: p.id, name: p.name, power: Number(playerPower(p).toFixed(2)) })),
  };
}
