"use client";

import { useMemo, useState } from "react";
import { presetPlayerPools, presetPlayerProfiles } from "@/lib/preset-player-pools";
const positionGrid = [
  ["LW", "ST", "RW"],
  ["", "AM", ""],
  ["", "CM", ""],
  ["", "DM", ""],
  ["LB", "CB", "RB"],
  ["", "GK", ""],
];

const statGroups: Array<{ title: string; items: string[] }> = [
  { title: "FIZIKSEL", items: ["Hizlanma", "Hiz", "Dayaniklilik", "Guc", "Ceviklik", "Ziplama"] },
  { title: "TEKNIK", items: ["Teknik", "Top Surme", "Pas", "Bitiricilik", "Ilk Kontrol", "Uzaktan Sut", "Mudahale", "Markaj"] },
  { title: "MENTAL", items: ["Vizyon", "Pozisyon Alma", "Karar Verme", "Sogukkanlilik", "Agresiflik", "Takim Oyunu", "Caliskanlik"] },
  { title: "KALECILIK", items: ["Refleks", "Top Tutma"] },
];

export default function HomePage() {
  const [tab, setTab] = useState<"register" | "teams">("register");
  const [playerName, setPlayerName] = useState("");
  const [power, setPower] = useState(2);
  const [teamProfile, setTeamProfile] = useState("");
  const [presetPlayer, setPresetPlayer] = useState("");
  const [selectedPosition, setSelectedPosition] = useState<string[]>([]);
  const [saveStatus, setSaveStatus] = useState<string>("");
  const [stats, setStats] = useState<Record<string, number>>(
    Object.fromEntries(statGroups.flatMap((group) => group.items.map((item) => [item, 10]))),
  );

  const presetPlayers = useMemo(() => (teamProfile ? presetPlayerPools[teamProfile] || [] : []), [teamProfile]);
  const defaultStats = useMemo(
    () => Object.fromEntries(statGroups.flatMap((group) => group.items.map((item) => [item, 10]))),
    [],
  );

  function togglePosition(pos: string) {
    setSelectedPosition((prev) => {
      if (prev.includes(pos)) return prev.filter((p) => p !== pos);
      return [...prev, pos];
    });
  }

  function movePriority(index: number, direction: -1 | 1) {
    setSelectedPosition((prev) => {
      const next = [...prev];
      const target = index + direction;
      if (target < 0 || target >= next.length) return prev;
      const temp = next[index];
      next[index] = next[target];
      next[target] = temp;
      return next;
    });
  }

  function onSelectPreset(name: string) {
    setPresetPlayer(name);
    if (!name) {
      setPlayerName("");
      setPower(2);
      setSelectedPosition([]);
      setStats(defaultStats);
      return;
    }
    const profile = presetPlayerProfiles[name];
    if (!profile) {
      setPlayerName(name);
      setPower(12);
      setSelectedPosition(["CM"]);
      setStats(defaultStats);
      return;
    }

    setPlayerName(name);
    setPower(profile.power);
    setSelectedPosition(profile.positions);
    setStats({ ...defaultStats, ...profile.stats });
  }

  async function onSavePlayer() {
    setSaveStatus("Kaydediliyor...");
    try {
      const response = await fetch("/api/players", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomId: "mock-room-001",
          name: playerName,
          power,
          positions: selectedPosition,
          stats,
        }),
      });
      const result = await response.json();
      if (!response.ok || !result.ok) {
        throw new Error(result.error || "Kayit basarisiz");
      }
      setSaveStatus(`Kaydedildi (id: ${result.playerId})`);
    } catch (error: any) {
      setSaveStatus(`Hata: ${error.message || "Kayit basarisiz"}`);
    }
  }

  return (
    <main className="legacy-main">
      <h1>Pitch Squad Builder</h1>
      <p>Arayuz Turkce, kod altyapisi Ingilizce kaldi.</p>
      <a className="admin-link" href="/admin">Admin Alanina Git</a>

      <section className="legacy-tabs">
        <button className={tab === "register" ? "active" : ""} onClick={() => setTab("register")}>Oyuncu Kaydet</button>
        <button className={tab === "teams" ? "active" : ""} onClick={() => setTab("teams")}>Takim Olustur</button>
      </section>

      {tab === "register" ? (
        <section className="panel">
          <h2>Oyuncu Kaydet</h2>
          <div className="form-head">
            <input placeholder="Oyuncu adi" value={playerName} onChange={(e) => setPlayerName(e.target.value)} />
            <input type="number" min={1} max={20} value={power} onChange={(e) => setPower(Number(e.target.value))} />
          </div>

          <div className="content-grid">
            <div>
              <h3>Hazir Profil (Opsiyonel)</h3>
              <div className="preset-row">
                <select value={teamProfile} onChange={(e) => setTeamProfile(e.target.value)}>
                  <option value="">Takim sec</option>
                  {Object.keys(presetPlayerPools).map((team) => <option key={team} value={team}>{team}</option>)}
                </select>
                <select value={presetPlayer} onChange={(e) => onSelectPreset(e.target.value)}>
                  <option value="">Oyuncu sec</option>
                  {presetPlayers.map((name) => <option key={name} value={name}>{name}</option>)}
                </select>
              </div>
              <p className="muted">Sinirli ornek veri. Secince form dolar, sonra duzenleyebilirsin.</p>

              <h3>Saha Uzerinden Mevki Sec</h3>
              <div className="pitch">
                {positionGrid.map((row, rowIndex) => (
                  <div key={rowIndex} className="pitch-row">
                    {row.map((pos, colIndex) => pos ? (
                      <button
                        key={`${rowIndex}-${colIndex}`}
                        className={selectedPosition.includes(pos) ? "pos-btn on" : "pos-btn"}
                        onClick={() => togglePosition(pos)}
                      >
                        {pos}
                      </button>
                    ) : <span key={`${rowIndex}-${colIndex}`} />)}
                  </div>
                ))}
              </div>

              <div className="priority-list">
                {selectedPosition.map((pos, index) => (
                  <div key={pos} className="priority-item">
                    <span>{pos}</span>
                    <span className="pill">{index === 0 ? "Birincil" : index === 1 ? "Ikincil" : "Alternatif"}</span>
                    <div className="prio-actions">
                      <button onClick={() => movePriority(index, -1)}>↑</button>
                      <button onClick={() => movePriority(index, 1)}>↓</button>
                      <button onClick={() => setSelectedPosition((prev) => prev.filter((p) => p !== pos))}>×</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3>Ozellikler (FM karti)</h3>
              <div className="stats-grid">
                {statGroups.map((group) => (
                  <fieldset key={group.title}>
                    <legend>{group.title}</legend>
                    {group.items.map((item) => (
                      <label key={item}>
                        <span>{item}</span>
                        <input
                          type="number"
                          min={1}
                          max={20}
                          value={stats[item]}
                          onChange={(e) => setStats((prev) => ({ ...prev, [item]: Number(e.target.value) }))}
                        />
                      </label>
                    ))}
                  </fieldset>
                ))}
              </div>
            </div>
          </div>

          <button className="save-btn" onClick={onSavePlayer}>Oyuncuyu Kaydet</button>
          {saveStatus ? <p className="muted">{saveStatus}</p> : null}
        </section>
      ) : (
        <section className="panel">
          <h2>Takim Olustur</h2>
          <p className="muted">Bu adimda oyuncular secilip dengeleme mutation endpointlerine gonderilecek.</p>
        </section>
      )}
    </main>
  );
}
