"use client";

import { useState } from "react";

const samplePayload = {
  teamCount: 2,
  players: [
    {
      id: "p1",
      name: "Ali",
      positions: ["ST", "RW"],
      attributes: {
        acceleration: 15, pace: 15, stamina: 13, strength: 14, agility: 15, jumpingReach: 10, dribbling: 13, technique: 14,
        passing: 10, longShots: 11, vision: 11, finishing: 16, firstTouch: 15, tackling: 6, marking: 6, positioning: 14,
        decisions: 12, composure: 13, aggression: 11, teamwork: 12, workRate: 12, reflexes: 3, handling: 2
      }
    },
    {
      id: "p2",
      name: "Veli",
      positions: ["CB"],
      attributes: {
        acceleration: 10, pace: 10, stamina: 12, strength: 16, agility: 10, jumpingReach: 15, dribbling: 8, technique: 9,
        passing: 10, longShots: 7, vision: 9, finishing: 6, firstTouch: 10, tackling: 16, marking: 15, positioning: 14,
        decisions: 13, composure: 12, aggression: 14, teamwork: 12, workRate: 12, reflexes: 4, handling: 3
      }
    }
  ]
};

export default function HomePage() {
  const [payload, setPayload] = useState(JSON.stringify(samplePayload, null, 2));
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleBalance() {
    setLoading(true);
    setResult("");
    try {
      const res = await fetch("/api/balance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload,
      });
      const data = await res.json();
      setResult(JSON.stringify(data, null, 2));
    } catch (err) {
      setResult(JSON.stringify({ error: String(err) }, null, 2));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main>
      <h1>Pitch Squad Builder</h1>
      <p>JSON payload girip takım dengelemesini canlı test et.</p>
      <div className="row">
        <section className="card">
          <textarea value={payload} onChange={(e) => setPayload(e.target.value)} />
          <div style={{ marginTop: 12 }}>
            <button onClick={handleBalance} disabled={loading}>{loading ? "Hesaplanıyor..." : "Takımları Dengele"}</button>
          </div>
        </section>
        <section className="card">
          <h2>Sonuç</h2>
          <pre>{result || "Henüz sonuç yok."}</pre>
        </section>
      </div>
    </main>
  );
}
