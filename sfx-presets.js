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
  },
  {
    id: "gold_coin",
    name: "Moneda de oro",
    category: "Economia",
    pitchJitter: 0.05,
    layers: [
      { type: "sine", delayMs: 0, freqStart: 1318.5, freqEnd: 1760, durationMs: 90, filterType: "bandpass", filterFreq: 2600, volume: 0.2 },
      { type: "sine", delayMs: 55, freqStart: 1975.5, freqEnd: 2093, durationMs: 140, filterType: "lowpass", filterFreq: 4200, volume: 0.18 }
    ]
  },
  {
    id: "turn_start",
    name: "Inicio de turno",
    category: "Interfaz",
    pitchJitter: 0.02,
    layers: [
      { type: "triangle", delayMs: 0, freqStart: 392, freqEnd: 523.25, durationMs: 120, filterType: "lowpass", filterFreq: 2800, volume: 0.18 },
      { type: "sine", delayMs: 70, freqStart: 523.25, freqEnd: 659.25, durationMs: 160, filterType: "lowpass", filterFreq: 3400, volume: 0.16 }
    ]
  },
  {
    id: "epic_sting",
    name: "Destello Epico",
    category: "VFX",
    pitchJitter: 0.02,
    layers: [
      { type: "triangle", delayMs: 0, freqStart: 440, freqEnd: 659.25, durationMs: 160, filterType: "lowpass", filterFreq: 3200, volume: 0.24 },
      { type: "sine", delayMs: 70, freqStart: 659.25, freqEnd: 987.77, durationMs: 240, filterType: "lowpass", filterFreq: 4200, volume: 0.24 },
      { type: "noise", delayMs: 0, freqStart: 2200, freqEnd: 4200, durationMs: 110, filterType: "bandpass", filterFreq: 3000, volume: 0.14 }
    ]
  },
  {
    id: "legendary_fanfare",
    name: "Fanfarria Legendaria",
    category: "VFX",
    pitchJitter: 0.01,
    layers: [
      { type: "sawtooth", delayMs: 0, freqStart: 110, freqEnd: 65, durationMs: 240, filterType: "lowpass", filterFreq: 480, volume: 0.34 },
      { type: "triangle", delayMs: 40, freqStart: 523.25, freqEnd: 523.25, durationMs: 170, filterType: "lowpass", filterFreq: 3600, volume: 0.24 },
      { type: "triangle", delayMs: 130, freqStart: 659.25, freqEnd: 659.25, durationMs: 190, filterType: "lowpass", filterFreq: 3800, volume: 0.24 },
      { type: "sine", delayMs: 220, freqStart: 783.99, freqEnd: 1046.5, durationMs: 360, filterType: "lowpass", filterFreq: 4600, volume: 0.28 },
      { type: "sine", delayMs: 300, freqStart: 1567.98, freqEnd: 1567.98, durationMs: 320, filterType: "lowpass", filterFreq: 4800, volume: 0.18 }
    ]
  },
  {
    id: "unit_shatter",
    name: "Unidad Destruida",
    category: "Combate",
    pitchJitter: 0.07,
    layers: [
      { type: "sawtooth", delayMs: 0, freqStart: 190, freqEnd: 42, durationMs: 180, filterType: "lowpass", filterFreq: 680, volume: 0.35 },
      { type: "noise", delayMs: 0, freqStart: 3200, freqEnd: 420, durationMs: 150, filterType: "bandpass", filterFreq: 1800, volume: 0.32 },
      { type: "square", delayMs: 45, freqStart: 920, freqEnd: 310, durationMs: 95, filterType: "highpass", filterFreq: 600, volume: 0.14 }
    ]
  },
  {
    id: "boss_explosion",
    name: "Explosion de Jefe Final",
    category: "Estado",
    pitchJitter: 0.02,
    layers: [
      { type: "sawtooth", delayMs: 0, freqStart: 130, freqEnd: 32, durationMs: 360, filterType: "lowpass", filterFreq: 420, volume: 0.42 },
      { type: "noise", delayMs: 0, freqStart: 2400, freqEnd: 260, durationMs: 320, filterType: "lowpass", filterFreq: 1600, volume: 0.36 },
      { type: "triangle", delayMs: 260, freqStart: 523.25, freqEnd: 783.99, durationMs: 240, filterType: "lowpass", filterFreq: 3800, volume: 0.24 },
      { type: "sine", delayMs: 420, freqStart: 1046.5, freqEnd: 1318.5, durationMs: 420, filterType: "lowpass", filterFreq: 4800, volume: 0.28 }
    ]
  },
  {
    id: "event_positive",
    name: "Evento Positivo",
    category: "Eventos",
    pitchJitter: 0.03,
    layers: [
      { type: "sine", delayMs: 0, freqStart: 587.33, freqEnd: 783.99, durationMs: 150, filterType: "lowpass", filterFreq: 3600, volume: 0.22 },
      { type: "sine", delayMs: 110, freqStart: 880, freqEnd: 1174.66, durationMs: 230, filterType: "lowpass", filterFreq: 4400, volume: 0.24 }
    ]
  },
  {
    id: "event_negative",
    name: "Evento Negativo / Trampa",
    category: "Eventos",
    pitchJitter: 0.04,
    layers: [
      { type: "sawtooth", delayMs: 0, freqStart: 195, freqEnd: 75, durationMs: 170, filterType: "lowpass", filterFreq: 620, volume: 0.32 },
      { type: "noise", delayMs: 0, freqStart: 2100, freqEnd: 500, durationMs: 110, filterType: "bandpass", filterFreq: 1400, volume: 0.26 },
      { type: "square", delayMs: 90, freqStart: 135, freqEnd: 82, durationMs: 200, filterType: "lowpass", filterFreq: 500, volume: 0.2 }
    ]
  },
  {
    id: "timer_tick",
    name: "Tic-tac de urgencia",
    category: "Interfaz",
    pitchJitter: 0.01,
    layers: [
      { type: "triangle", delayMs: 0, freqStart: 980, freqEnd: 420, durationMs: 45, filterType: "bandpass", filterFreq: 1600, volume: 0.22 }
    ]
  },
  {
    id: "spray_shake",
    name: "Agitar Lata de Aerosol",
    category: "Spray Casters",
    pitchJitter: 0.07,
    layers: [
      { type: "triangle", delayMs: 0, freqStart: 1650, freqEnd: 1250, durationMs: 32, filterType: "bandpass", filterFreq: 2200, volume: 0.26 },
      { type: "noise", delayMs: 12, freqStart: 3200, freqEnd: 4600, durationMs: 40, filterType: "highpass", filterFreq: 2600, volume: 0.16 },
      { type: "triangle", delayMs: 85, freqStart: 1850, freqEnd: 1400, durationMs: 34, filterType: "bandpass", filterFreq: 2400, volume: 0.28 }
    ]
  },
  {
    id: "spray_burst",
    name: "Rociada de Spray Presurizado",
    category: "Spray Casters",
    pitchJitter: 0.05,
    layers: [
      { type: "noise", delayMs: 0, freqStart: 4200, freqEnd: 2600, durationMs: 220, filterType: "bandpass", filterFreq: 3400, volume: 0.34 },
      { type: "sine", delayMs: 0, freqStart: 140, freqEnd: 75, durationMs: 90, filterType: "lowpass", filterFreq: 420, volume: 0.22 }
    ]
  },
  {
    id: "dubstep_drop_hit",
    name: "Impacto Dubstep (Wobble Drop)",
    category: "Spray Casters",
    pitchJitter: 0.03,
    layers: [
      { type: "sawtooth", delayMs: 0, freqStart: 110, freqEnd: 42, durationMs: 260, filterType: "lowpass", filterFreq: 480, volume: 0.44 },
      { type: "square", delayMs: 15, freqStart: 220, freqEnd: 55, durationMs: 180, filterType: "bandpass", filterFreq: 760, volume: 0.28 },
      { type: "noise", delayMs: 0, freqStart: 3600, freqEnd: 450, durationMs: 110, filterType: "highpass", filterFreq: 1200, volume: 0.25 }
    ]
  },
  {
    id: "paint_capture",
    name: "Conquista de Casilla (Pintura)",
    category: "Spray Casters",
    pitchJitter: 0.04,
    layers: [
      { type: "noise", delayMs: 0, freqStart: 2800, freqEnd: 1400, durationMs: 120, filterType: "bandpass", filterFreq: 2100, volume: 0.24 },
      { type: "sine", delayMs: 35, freqStart: 392, freqEnd: 587.33, durationMs: 160, filterType: "lowpass", filterFreq: 3200, volume: 0.26 },
      { type: "sine", delayMs: 95, freqStart: 783.99, freqEnd: 1046.5, durationMs: 190, filterType: "lowpass", filterFreq: 4200, volume: 0.22 }
    ]
  },
  {
    id: "order_cleanse_beam",
    name: "Chorro Quimico de El Orden",
    category: "Spray Casters",
    pitchJitter: 0.02,
    layers: [
      { type: "square", delayMs: 0, freqStart: 880, freqEnd: 440, durationMs: 150, filterType: "bandpass", filterFreq: 1400, volume: 0.22 },
      { type: "noise", delayMs: 10, freqStart: 3800, freqEnd: 1900, durationMs: 190, filterType: "highpass", filterFreq: 2000, volume: 0.28 }
    ]
  }
];
