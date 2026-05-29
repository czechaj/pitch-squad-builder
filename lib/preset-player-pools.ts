export const presetPlayerPools: Record<string, string[]> = {
  "Fenerbahce 2024/25": [
    "Dusan Tadic", "Fred", "Irfan Can Kahveci", "Sebastian Szymanski", "Edin Dzeko",
    "Dominik Livakovic", "Ferdi Kadioglu", "Ismail Yuksek", "Bright Osayi-Samuel", "Alexander Djiku",
  ],
  "Galatasaray 2024/25": [
    "Mauro Icardi", "Lucas Torreira", "Baris Alper Yilmaz", "Dries Mertens", "Kerem Demirbay",
    "Abdulkerim Bardakci", "Davinson Sanchez", "Fernando Muslera", "Hakim Ziyech", "Kaan Ayhan",
  ],
  "Besiktas 2024/25": [
    "Ciro Immobile", "Rafa Silva", "Gedson Fernandes", "Mert Gunok", "Salih Ucan",
    "Arthur Masuaku", "Necip Uysal", "Tayyip Talha Sanuc", "Semih Kilicsoy", "Milot Rashica",
  ],
  "Trabzonspor 2024/25": [
    "Ugurcan Cakir", "Bakasetas", "Enis Bardhi", "Edin Visca", "Trezeguet",
    "Stefano Denswil", "Mendy", "Abdulkadir Omur", "Onuachu", "Eren Elmali",
  ],
  "Basaksehir 2024/25": [
    "Krzysztof Piatek", "Berkay Ozcan", "Danijel Aleksic", "Duarte", "Volkan Babacan",
    "Leo Dubois", "Omer Ali Sahiner", "Dimitrios Pelkas", "Jerome Opoku", "Serdar Gurler",
  ],
  "Adana Demirspor 2024/25": [
    "Yusuf Sari", "Badou Ndiaye", "Andreaw Gravillon", "Semih Guler", "Edouard Michut",
    "Nani", "Jonas Svensson", "Tayyip Sanu", "Arber Zeneli", "Benjamin Stambouli",
  ],
};

export type PresetPlayerProfile = {
  power: number;
  positions: string[];
  stats: Record<string, number>;
};

function makeStats(seed: number): Record<string, number> {
  const base = 8 + (seed % 5);
  return {
    Hizlanma: base + 2,
    Hiz: base + 1,
    Dayaniklilik: base,
    Guc: base,
    Ceviklik: base + 1,
    Ziplama: base,
    Teknik: base + 1,
    "Top Surme": base + 1,
    Pas: base + 1,
    Bitiricilik: base,
    "Ilk Kontrol": base + 1,
    "Uzaktan Sut": base,
    Mudahale: base - 1,
    Markaj: base - 1,
    Vizyon: base + 1,
    "Pozisyon Alma": base,
    "Karar Verme": base + 1,
    Sogukkanlilik: base,
    Agresiflik: base,
    "Takim Oyunu": base + 1,
    Caliskanlik: base,
    Refleks: base - 2,
    "Top Tutma": base - 2,
  };
}

export const presetPlayerProfiles: Record<string, PresetPlayerProfile> = {
  "Dusan Tadic": { power: 16, positions: ["LW", "AM", "RW"], stats: makeStats(9) },
  Fred: { power: 15, positions: ["CM", "DM"], stats: makeStats(8) },
  "Mauro Icardi": { power: 17, positions: ["ST"], stats: makeStats(10) },
  "Lucas Torreira": { power: 15, positions: ["DM", "CM"], stats: makeStats(7) },
  "Ciro Immobile": { power: 16, positions: ["ST"], stats: makeStats(9) },
  "Rafa Silva": { power: 15, positions: ["AM", "RW", "LW"], stats: makeStats(8) },
  "Ugurcan Cakir": { power: 16, positions: ["GK"], stats: makeStats(11) },
  "Edin Visca": { power: 14, positions: ["RW", "LW"], stats: makeStats(6) },
  "Krzysztof Piatek": { power: 14, positions: ["ST"], stats: makeStats(6) },
  "Yusuf Sari": { power: 13, positions: ["RW", "LW"], stats: makeStats(5) },
};
