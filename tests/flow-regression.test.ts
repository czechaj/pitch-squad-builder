import { describe, expect, it } from "vitest";
import { calculateBalance } from "@/lib/balance";
import { presetPlayerProfiles } from "@/lib/preset-player-pools";
import { POST as savePlayerPost } from "@/app/api/players/route";
import { POST as otpRequestPost } from "@/app/api/auth/mock-otp/request/route";

describe("flow regression: preset -> save -> balance", () => {
  it("preset profile maps to valid save payload and save succeeds", async () => {
    const preset = presetPlayerProfiles["Dusan Tadic"];
    expect(preset).toBeTruthy();
    expect(preset.positions.length).toBeGreaterThan(0);

    const req = new Request("http://localhost/api/players", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        roomId: "mock-room-001",
        name: "Dusan Tadic",
        power: preset.power,
        positions: preset.positions,
        stats: preset.stats,
      }),
    });

    const response = await savePlayerPost(req);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.ok).toBe(true);
    expect(typeof json.playerId).toBe("string");
  });

  it("balance calculation returns deterministic, bounded team totals", () => {
    const players = [
      {
        id: "p1",
        name: "A",
        positions: ["ST"],
        attributes: {
          acceleration: 13, pace: 13, stamina: 11, strength: 12, agility: 12, jumpingReach: 12,
          dribbling: 12, technique: 12, passing: 11, longShots: 11, vision: 11, finishing: 15,
          firstTouch: 14, tackling: 8, marking: 8, positioning: 13, decisions: 12, composure: 13,
          aggression: 10, teamwork: 11, workRate: 11, reflexes: 5, handling: 5,
        },
      },
      {
        id: "p2",
        name: "B",
        positions: ["CM", "DM"],
        attributes: {
          acceleration: 11, pace: 11, stamina: 14, strength: 11, agility: 11, jumpingReach: 10,
          dribbling: 11, technique: 13, passing: 14, longShots: 10, vision: 13, finishing: 9,
          firstTouch: 13, tackling: 12, marking: 11, positioning: 12, decisions: 13, composure: 12,
          aggression: 11, teamwork: 14, workRate: 14, reflexes: 5, handling: 5,
        },
      },
      {
        id: "p3",
        name: "C",
        positions: ["CB"],
        attributes: {
          acceleration: 10, pace: 11, stamina: 11, strength: 14, agility: 10, jumpingReach: 13,
          dribbling: 8, technique: 9, passing: 10, longShots: 8, vision: 9, finishing: 8,
          firstTouch: 10, tackling: 14, marking: 14, positioning: 13, decisions: 12, composure: 11,
          aggression: 13, teamwork: 11, workRate: 12, reflexes: 5, handling: 5,
        },
      },
      {
        id: "p4",
        name: "D",
        positions: ["GK"],
        attributes: {
          acceleration: 8, pace: 8, stamina: 9, strength: 10, agility: 13, jumpingReach: 11,
          dribbling: 6, technique: 8, passing: 10, longShots: 6, vision: 9, finishing: 5,
          firstTouch: 9, tackling: 5, marking: 7, positioning: 14, decisions: 12, composure: 12,
          aggression: 8, teamwork: 10, workRate: 10, reflexes: 15, handling: 14,
        },
      },
    ];

    const result = calculateBalance({ teamCount: 2, players });
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.teams).toHaveLength(2);
    expect(result.players).toHaveLength(4);

    const total = result.teams[0].totalPower + result.teams[1].totalPower;
    const sumPlayers = result.players.reduce((acc, p) => acc + p.power, 0);
    expect(Math.abs(total - Number(sumPlayers.toFixed(2)))).toBeLessThan(0.2);
  });

  it("api validation rejects invalid phone with standard error shape", async () => {
    const req = new Request("http://localhost/api/auth/mock-otp/request", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ phone: "123" }),
    });

    const response = await otpRequestPost(req);
    const json = await response.json();

    expect(response.status).toBe(422);
    expect(json.ok).toBe(false);
    expect(json.code).toBe("VALIDATION_ERROR");
    expect(typeof json.error).toBe("string");
  });
});
