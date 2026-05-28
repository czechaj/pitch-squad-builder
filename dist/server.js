import express from "express";
import cors from "cors";
import { z } from "zod";
import path from "node:path";
import { fileURLToPath } from "node:url";
const positionAttributeWeights = {
    GK: { reflexes: 0.24, handling: 0.2, positioning: 0.16, agility: 0.12, decisions: 0.1, composure: 0.08, passing: 0.1 },
    CB: { tackling: 0.18, marking: 0.16, positioning: 0.14, strength: 0.14, jumpingReach: 0.1, pace: 0.1, decisions: 0.1, passing: 0.08 },
    LB: { acceleration: 0.14, pace: 0.12, stamina: 0.14, tackling: 0.14, workRate: 0.12, passing: 0.12, dribbling: 0.12, positioning: 0.1 },
    RB: { acceleration: 0.14, pace: 0.12, stamina: 0.14, tackling: 0.14, workRate: 0.12, passing: 0.12, dribbling: 0.12, positioning: 0.1 },
    DM: { tackling: 0.16, positioning: 0.14, passing: 0.14, vision: 0.12, marking: 0.12, decisions: 0.12, teamwork: 0.1, stamina: 0.1 },
    CM: { passing: 0.16, vision: 0.14, stamina: 0.12, technique: 0.12, firstTouch: 0.12, decisions: 0.12, teamwork: 0.12, workRate: 0.1 },
    AM: { vision: 0.16, passing: 0.14, technique: 0.14, firstTouch: 0.12, dribbling: 0.14, composure: 0.12, longShots: 0.1, finishing: 0.08 },
    LW: { acceleration: 0.14, pace: 0.12, agility: 0.1, dribbling: 0.16, technique: 0.12, finishing: 0.1, firstTouch: 0.12, decisions: 0.14 },
    RW: { acceleration: 0.14, pace: 0.12, agility: 0.1, dribbling: 0.16, technique: 0.12, finishing: 0.1, firstTouch: 0.12, decisions: 0.14 },
    ST: { finishing: 0.2, firstTouch: 0.14, positioning: 0.12, composure: 0.12, acceleration: 0.12, pace: 0.1, strength: 0.1, jumpingReach: 0.1 }
};
const playerSchema = z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    positions: z.array(z.enum(["GK", "CB", "LB", "RB", "DM", "CM", "AM", "LW", "RW", "ST"])).min(1),
    attributes: z.object({
        acceleration: z.number().min(1).max(20),
        pace: z.number().min(1).max(20),
        stamina: z.number().min(1).max(20),
        strength: z.number().min(1).max(20),
        agility: z.number().min(1).max(20),
        jumpingReach: z.number().min(1).max(20),
        dribbling: z.number().min(1).max(20),
        technique: z.number().min(1).max(20),
        passing: z.number().min(1).max(20),
        longShots: z.number().min(1).max(20),
        vision: z.number().min(1).max(20),
        finishing: z.number().min(1).max(20),
        firstTouch: z.number().min(1).max(20),
        tackling: z.number().min(1).max(20),
        marking: z.number().min(1).max(20),
        positioning: z.number().min(1).max(20),
        decisions: z.number().min(1).max(20),
        composure: z.number().min(1).max(20),
        aggression: z.number().min(1).max(20),
        teamwork: z.number().min(1).max(20),
        workRate: z.number().min(1).max(20),
        reflexes: z.number().min(1).max(20),
        handling: z.number().min(1).max(20)
    })
});
const balanceSchema = z.object({
    players: z.array(playerSchema).min(2),
    teamCount: z.number().int().min(2).max(4).default(2)
});
function positionalScore(player, position) {
    const weights = positionAttributeWeights[position];
    let score = 0;
    for (const [attr, weight] of Object.entries(weights)) {
        score += player.attributes[attr] * (weight ?? 0);
    }
    return score;
}
function playerPower(player) {
    const scoredPositions = player.positions.map((p, index) => {
        const priorityMultiplier = index === 0 ? 1 : Math.max(0.6, 1 - index * 0.15);
        return positionalScore(player, p) * priorityMultiplier;
    });
    return Math.max(...scoredPositions);
}
function balanceTeams(players, teamCount) {
    const teams = Array.from({ length: teamCount }).map((_, i) => ({
        name: `Team ${String.fromCharCode(65 + i)}`,
        playerIds: [],
        totalPower: 0
    }));
    const playersByPower = [...players]
        .map((p) => ({ player: p, power: playerPower(p) }))
        .sort((a, b) => b.power - a.power);
    for (const entry of playersByPower) {
        teams.sort((a, b) => a.totalPower - b.totalPower || a.playerIds.length - b.playerIds.length);
        teams[0].playerIds.push(entry.player.id);
        teams[0].totalPower += entry.power;
    }
    return teams.map((t) => ({ ...t, totalPower: Number(t.totalPower.toFixed(2)) }));
}
const app = express();
app.use(cors());
app.use(express.json());
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.resolve(__dirname, "../public");
app.use(express.static(publicDir));
app.get("/", (_req, res) => {
    res.sendFile(path.join(publicDir, "index.html"));
});
app.get("/health", (_req, res) => {
    res.json({ ok: true });
});
app.post("/api/balance", (req, res) => {
    const parsed = balanceSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ error: "Invalid payload", details: parsed.error.flatten() });
    }
    const { players, teamCount } = parsed.data;
    const teams = balanceTeams(players, teamCount);
    return res.json({
        teams,
        players: players.map((p) => ({ id: p.id, name: p.name, power: Number(playerPower(p).toFixed(2)) }))
    });
});
const port = Number(process.env.PORT ?? 4000);
app.listen(port, () => {
    console.log(`API listening on http://localhost:${port}`);
});
