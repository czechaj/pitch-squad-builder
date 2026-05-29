"use client";

import { useState } from "react";

const samplePlayers = [
  { id: "p1", name: "Ali", positions: ["ST", "RW"] },
  { id: "p2", name: "Veli", positions: ["CB"] },
  { id: "p3", name: "Can", positions: ["CM"] },
  { id: "p4", name: "Efe", positions: ["GK"] },
];

export default function HomePage() {
  const [teamCount, setTeamCount] = useState(2);
  const [payload, setPayload] = useState(JSON.stringify({ teamCount: 2, players: samplePlayers }, null, 2));
  const [result, setResult] = useState<any>(null);
  const [rawResult, setRawResult] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleBalance() {
    setLoading(true);
    setResult(null);
    setRawResult("");
    try {
      const res = await fetch("/api/balance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload,
      });
      const data = await res.json();
      if (!res.ok) {
        setRawResult(JSON.stringify(data, null, 2));
      } else {
        setResult(data);
      }
    } catch (err) {
      setRawResult(JSON.stringify({ error: String(err) }, null, 2));
    } finally {
      setLoading(false);
    }
  }

  function syncTeamCount(nextCount: number) {
    setTeamCount(nextCount);
    try {
      const parsed = JSON.parse(payload);
      parsed.teamCount = nextCount;
      setPayload(JSON.stringify(parsed, null, 2));
    } catch {
      // Keep the raw text untouched if user entered invalid JSON.
    }
  }

  return (
    <main>
      <h1>Pitch Squad Builder</h1>
      <p>Oyuncuları dengele ve takımları anında gör.</p>
      <section className="card controls">
        <label>Takım sayısı</label>
        <div className="count-buttons">
          {[2, 3, 4].map((count) => (
            <button key={count} className={teamCount === count ? "active" : ""} onClick={() => syncTeamCount(count)}>
              {count}
            </button>
          ))}
        </div>
      </section>
      <div className="row">
        <section className="card">
          <h2>Oyuncu Listesi (JSON)</h2>
          <textarea value={payload} onChange={(e) => setPayload(e.target.value)} />
          <div style={{ marginTop: 12 }}>
            <button onClick={handleBalance} disabled={loading}>{loading ? "Hesaplanıyor..." : "Takımları Dengele"}</button>
          </div>
        </section>
        <section className="card">
          <h2>Sonuç</h2>
          {result?.teams ? (
            <div className="teams">
              {result.teams.map((team: any) => (
                <div className="team" key={team.name}>
                  <h3>{team.name}</h3>
                  <p>Toplam Güç: {team.totalPower}</p>
                  <ul>
                    {team.playerIds.map((id: string) => {
                      const player = result.players.find((p: any) => p.id === id);
                      return <li key={id}>{player?.name ?? id} ({player?.power ?? "-"})</li>;
                    })}
                  </ul>
                </div>
              ))}
            </div>
          ) : (
            <pre>{rawResult || "Henüz sonuç yok."}</pre>
          )}
        </section>
      </div>
    </main>
  );
}
