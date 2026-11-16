// Presets multicapa para el laboratorio SFX.
// Cada sonido combina varias capas (papel, golpe, tono, acorde) para sonar mas rico y natural.
window.SFX_PRESETS = [
  {
    id: "draw_card",
    name: "Robar carta (Realista)",
    category: "Cartas",
    pitchJitter: 0.06,
    layers: [
      { type: "noise", delayMs: 0, freqStart: 1800, freqEnd: 3400, durationMs: 75, filterType: "bandpass", filterFreq: 2400, volume: 0.28 },
      { type: "triangle", delayMs: 15, freqStart: 320, freqEnd: 140, durationMs: 40, filterType: "lowpass", filterFreq: 900, volume: 0.18 }
    ]
  },
  {
    id: "shuffle_deck",
    name: "Barajar mazo (Rafaga)",
    category: "Cartas",
    pitchJitter: 0.08,
    layers: [
      { type: "noise", delayMs: 0, freqStart: 1200, freqEnd: 2400, durationMs: 55, filterType: "bandpass", filterFreq: 1800, volume: 0.22 },
      { type: "noise", delayMs: 65, freqStart: 1400, freqEnd: 2600, durationMs: 55, filterType: "bandpass", filterFreq: 2000, volume: 0.25 },
      { type: "noise", delayMs: 130, freqStart: 1100, freqEnd: 2200, durationMs: 65, filterType: "bandpass", filterFreq: 1700, volume: 0.22 }
    ]
  },
  {
    id: "play_card",
    name: "Jugar carta en mesa",
    category: "Cartas",
    pitchJitter: 0.05,
    layers: [
      { type: "sine", delayMs: 0, freqStart: 190, freqEnd: 55, durationMs: 80, filterType: "lowpass", filterFreq: 600, volume: 0.42 },
      { type: "noise", delayMs: 0, freqStart: 900, freqEnd: 400, durationMs: 45, filterType: "lowpass", filterFreq: 1100, volume: 0.22 }
    ]
  },
  {
    id: "hover_card",
    name: "Hover / Tick sutil",
    category: "Interfaz",
    pitchJitter: 0.04,
    layers: [
      { type: "sine", delayMs: 0, freqStart: 780, freqEnd: 980, durationMs: 28, filterType: "lowpass", filterFreq: 2500, volume: 0.14 }
    ]
  },
  {
    id: "attack_hit",
    name: "Ataque / Impacto fuerte",
    category: "Combate",
    pitchJitter: 0.06,
    layers: [
      { type: "sawtooth", delayMs: 0, freqStart: 160, freqEnd: 38, durationMs: 130, filterType: "lowpass", filterFreq: 550, volume: 0.38 },
      { type: "noise", delayMs: 0, freqStart: 2200, freqEnd: 350, durationMs: 95, filterType: "lowpass", filterFreq: 1600, volume: 0.32 }
    ]
  },
  {
    id: "shield_block",
    name: "Escudo / Bloqueo metalico",
    category: "Combate",
    pitchJitter: 0.03,
    layers: [
      { type: "square", delayMs: 0, freqStart: 480, freqEnd: 560, durationMs: 90, filterType: "bandpass", filterFreq: 1500, volume: 0.18 },
      { type: "sine", delayMs: 10, freqStart: 960, freqEnd: 720, durationMs: 150, filterType: "lowpass", filterFreq: 2800, volume: 0.24 }
    ]
  },
  {
    id: "heal_buff",
    name: "Curacion / Mejora",
    category: "Combate",
    pitchJitter: 0.02,
    layers: [
      { type: "sine", delayMs: 0, freqStart: 523.25, freqEnd: 659.25, durationMs: 140, filterType: "lowpass", filterFreq: 3500, volume: 0.22 },
      { type: "sine", delayMs: 90, freqStart: 659.25, freqEnd: 1046.5, durationMs: 200, filterType: "lowpass", filterFreq: 4000, volume: 0.25 }
    ]
  },
  {
    id: "invalid_action",
    name: "Error / Accion invalida",
    category: "Interfaz",
    pitchJitter: 0.0,
    layers: [
      { type: "sawtooth", delayMs: 0, freqStart: 155, freqEnd: 120, durationMs: 90, filterType: "lowpass", filterFreq: 520, volume: 0.25 },
      { type: "sawtooth", delayMs: 100, freqStart: 130, freqEnd: 95, durationMs: 120, filterType: "lowpass", filterFreq: 480, volume: 0.25 }
    ]
  },
  {
    id: "victory_chime",
    name: "Victoria (Acorde)",
    category: "Estado",
    pitchJitter: 0.0,
    layers: [
      { type: "triangle", delayMs: 0, freqStart: 523.25, freqEnd: 523.25, durationMs: 180, filterType: "lowpass", filterFreq: 3500, volume: 0.24 },
      { type: "triangle", delayMs: 110, freqStart: 659.25, freqEnd: 659.25, durationMs: 200, filterType: "lowpass", filterFreq: 3500, volume: 0.24 },
      { type: "triangle", delayMs: 220, freqStart: 783.99, freqEnd: 1046.5, durationMs: 320, filterType: "lowpass", filterFreq: 4200, volume: 0.28 }
    ]
  },
  {
    id: "defeat_tone",
    name: "Derrota (Descendente)",
    category: "Estado",
    pitchJitter: 0.0,
    layers: [
      { type: "sawtooth", delayMs: 0, freqStart: 220, freqEnd: 165, durationMs: 220, filterType: "lowpass", filterFreq: 600, volume: 0.24 },
      { type: "sawtooth", delayMs: 180, freqStart: 165, freqEnd: 82, durationMs: 360, filterType: "lowpass", filterFreq: 450, volume: 0.28 }
    ]
  }
];
