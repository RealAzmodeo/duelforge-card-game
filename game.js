// Duelforge - Roguelike Card Duel (27 Illustrated Cards + Boosters + 3-Stage Run)

const CARD_CATALOG = {
  // --- Starter Cards ---
  golpe: {
    id: "golpe",
    name: "Golpe Rapido",
    type: "Hechizo",
    rarity: "comun",
    art: "assets/cards/golpe.png",
    cost: 1,
    goldCost: 0,
    shortTag: "DMG 4",
    desc: "4 dano directo al Heroe rival.",
    vfxType: "burn",
    effect: () => {
      spawnVfxShape("#enemy-hero-panel", "vfx-slash");
      dealDamageToHero("enemy", 4);
    }
  },
  escudo: {
    id: "escudo",
    name: "Escudo Hierro",
    type: "Tactica",
    rarity: "comun",
    art: "assets/cards/escudo.png",
    cost: 1,
    goldCost: 0,
    reaction: true,
    shortTag: "SHD +5",
    desc: "[REACCION] +5 Armadura a tu Heroe.",
    vfxType: "beam",
    effect: (state) => {
      state.player.armor += 5;
      spawnVfxShape("#player-hero-panel", "vfx-beam");
      spawnFx("#player-hero-panel", "+5 SHD", "fx-shd");
    }
  },
  mercenario: {
    id: "mercenario",
    name: "Mercenario",
    type: "Unidad",
    rarity: "comun",
    art: "assets/cards/mercenario.png",
    cost: 0,
    goldCost: 0,
    atk: 4,
    hp: 4,
    guard: false,
    haste: false,
    upkeep: 1,
    shortTag: "4/4 (MANT. 1 EN/ORO)",
    desc: "[MERCENARIO] Baja gratis (0 EN). Cada turno consume 1 Energia o 1 Oro; si no puedes pagar, muere."
  },
  moneda: {
    id: "moneda",
    name: "Bolsa de Oro",
    type: "Tactica",
    rarity: "comun",
    art: "assets/cards/moneda.png",
    cost: 0,
    goldCost: 0,
    shortTag: "ORO +3 / +1 CARTA",
    desc: "+3 Oro y roba 1 carta.",
    vfxType: "beam",
    effect: (state) => {
      state.player.gold += 3;
      drawCards(1);
      spawnFx("#player-gold", "+3 ORO", "fx-gold");
    }
  },

  // --- Original Market Cards ---
  golem: {
    id: "golem",
    name: "Golem Piedra",
    type: "Unidad",
    rarity: "comun",
    art: "assets/cards/golem.png",
    cost: 2,
    goldCost: 3,
    atk: 3,
    hp: 7,
    guard: true,
    haste: false,
    shortTag: "3/7 GUARDIA",
    desc: "[GUARDIA] 3 ATK / 7 HP."
  },
  relampago: {
    id: "relampago",
    name: "Asesino Rayo",
    type: "Unidad",
    rarity: "rara",
    art: "assets/cards/relampago.png",
    cost: 2,
    goldCost: 3,
    atk: 5,
    hp: 3,
    guard: false,
    haste: true,
    stealth: true,
    shortTag: "5/3 PRISA + ESCABULLIRSE",
    desc: "[PRISA] [ESCABULLIRSE] 5 ATK / 3 HP. Ignora GUARDIA y ataca directo."
  },
  plasma: {
    id: "plasma",
    name: "Bomba Plasma",
    type: "Hechizo",
    rarity: "comun",
    art: "assets/cards/plasma.png",
    cost: 1,
    goldCost: 2,
    shortTag: "DMG 8 +1 CARTA",
    desc: "8 dano y roba 1 carta.",
    vfxType: "burn",
    effect: () => {
      spawnVfxShape("#enemy-hero-panel", "vfx-burst");
      dealDamageToHero("enemy", 8);
      drawCards(1);
    }
  },
  cofre: {
    id: "cofre",
    name: "Cofre Guerra",
    type: "Tactica",
    rarity: "comun",
    art: "assets/cards/cofre.png",
    cost: 1,
    goldCost: 2,
    shortTag: "SHD +6 / +2 ORO / +1 CARTA",
    desc: "+6 Armadura, +2 Oro y roba 1 carta.",
    vfxType: "beam",
    effect: (state) => {
      state.player.armor += 6;
      state.player.gold += 2;
      drawCards(1);
      spawnVfxShape("#player-hero-panel", "vfx-beam");
      spawnFx("#player-hero-panel", "+6 SHD", "fx-shd");
      spawnFx("#player-gold", "+2 ORO", "fx-gold");
    }
  },
  furia: {
    id: "furia",
    name: "Furia Arcana",
    type: "Hechizo",
    rarity: "rara",
    art: "assets/cards/furia.png",
    cost: 1,
    goldCost: 3,
    shortTag: "+3 ATK MESA",
    desc: "Tus unidades ganan +3 ATK.",
    vfxType: "burn",
    effect: (state) => {
      state.player.board.forEach((u, i) => {
        if (u) {
          u.atk += 3;
          const sel = `#player-slots .unit-slot:nth-child(${i + 1})`;
          spawnVfxShape(sel, "vfx-burst");
          spawnFx(sel, "+3 ATK", "fx-gold");
        }
      });
    }
  },

  // --- 18 New Expansion Cards ---
  mercader: {
    id: "mercader",
    name: "Mercader",
    type: "Unidad",
    rarity: "comun",
    art: "assets/cards/mercader.png",
    cost: 1,
    goldCost: 2,
    atk: 2,
    hp: 3,
    guard: false,
    haste: false,
    shortTag: "2/3 +2 ORO",
    desc: "Unidad 2/3. Al entrar: +2 Oro.",
    onPlay: (state) => {
      state.player.gold += 2;
      spawnFx("#player-gold", "+2 ORO", "fx-gold");
    }
  },
  lingote: {
    id: "lingote",
    name: "Lingote Oro",
    type: "Tactica",
    rarity: "comun",
    art: "assets/cards/lingote.png",
    cost: 1,
    goldCost: 2,
    shortTag: "ORO +5 / SHD +4 / +1 CARTA",
    desc: "+5 Oro, +4 Armadura y roba 1 carta.",
    vfxType: "beam",
    effect: (state) => {
      state.player.gold += 5;
      state.player.armor += 4;
      drawCards(1);
      spawnVfxShape("#player-hero-panel", "vfx-beam");
      spawnFx("#player-gold", "+5 ORO", "fx-gold");
    }
  },
  muro: {
    id: "muro",
    name: "Muro Vivo",
    type: "Unidad",
    rarity: "comun",
    art: "assets/cards/muro.png",
    cost: 2,
    goldCost: 3,
    atk: 2,
    hp: 9,
    guard: true,
    haste: false,
    shortTag: "2/9 GUARDIA",
    desc: "[GUARDIA] Tanque 2 ATK / 9 HP."
  },
  escudero: {
    id: "escudero",
    name: "Escudero Leal",
    type: "Unidad",
    rarity: "comun",
    art: "assets/cards/escudero.png",
    cost: 1,
    goldCost: 2,
    atk: 2,
    hp: 5,
    guard: true,
    haste: false,
    shortTag: "2/5 GUARDIA",
    desc: "[GUARDIA] 2 ATK / 5 HP."
  },
  goblin: {
    id: "goblin",
    name: "Goblin Piro",
    type: "Unidad",
    rarity: "rara",
    art: "assets/cards/goblin.png",
    cost: 2,
    goldCost: 3,
    atk: 4,
    hp: 2,
    guard: false,
    haste: true,
    shortTag: "4/2 PRISA +2 DMG",
    desc: "[PRISA] 4/2. Al entrar: 2 DMG.",
    onPlay: () => {
      spawnVfxShape("#enemy-hero-panel", "vfx-burst");
      dealDamageToHero("enemy", 2);
    }
  },
  drako: {
    id: "drako",
    name: "Drako Igneo",
    type: "Unidad",
    rarity: "epica",
    art: "assets/cards/drako.png",
    cost: 3,
    goldCost: 4,
    atk: 6,
    hp: 6,
    guard: false,
    haste: true,
    shortTag: "6/6 PRISA",
    desc: "[PRISA] Dragon 6 ATK / 6 HP."
  },
  cristalomante: {
    id: "cristalomante",
    name: "Cristalomante",
    type: "Unidad",
    rarity: "rara",
    art: "assets/cards/cristalomante.png",
    cost: 2,
    goldCost: 3,
    atk: 3,
    hp: 4,
    guard: false,
    haste: false,
    shortTag: "3/4 +1 CARTA",
    desc: "Unidad 3/4. Al entrar: roba 1.",
    onPlay: () => {
      drawCards(1);
    }
  },
  yunque: {
    id: "yunque",
    name: "Yunque Magico",
    type: "Tactica",
    rarity: "rara",
    art: "assets/cards/yunque.png",
    cost: 1,
    goldCost: 3,
    shortTag: "+2/+2 MESA",
    desc: "Tus unidades ganan +2 ATK / +2 HP.",
    vfxType: "beam",
    effect: (state) => {
      state.player.board.forEach((u, i) => {
        if (u) {
          u.atk += 2;
          u.hp += 2;
          spawnFx(`#player-slots .unit-slot:nth-child(${i + 1})`, "+2/+2", "fx-gold");
        }
      });
    }
  },
  botin: {
    id: "botin",
    name: "Botin Real",
    type: "Tactica",
    rarity: "epica",
    art: "assets/cards/botin.png",
    cost: 0,
    goldCost: 4,
    shortTag: "ORO +5 / +1 CARTA",
    desc: "+5 Oro y roba 1 carta.",
    vfxType: "beam",
    effect: (state) => {
      state.player.gold += 5;
      drawCards(1);
      spawnFx("#player-gold", "+5 ORO", "fx-gold");
    }
  },
  rayo: {
    id: "rayo",
    name: "Rayo Cadena",
    type: "Hechizo",
    rarity: "rara",
    art: "assets/cards/rayo.png",
    cost: 2,
    goldCost: 3,
    shortTag: "5 MESA + 6 HERO",
    desc: "5 DMG a unidad rival y 6 al Heroe.",
    vfxType: "burn",
    effect: (state) => {
      const idx = state.enemy.board.findIndex((u) => u !== null);
      if (idx !== -1) {
        const u = state.enemy.board[idx];
        u.hp -= 5;
        const sel = `#enemy-slots .unit-slot:nth-child(${idx + 1})`;
        spawnVfxShape(sel, "vfx-slash");
        spawnFx(sel, "-5", "fx-dmg");
        if (u.hp <= 0) triggerUnitDeath("enemy", idx);
      }
      spawnVfxShape("#enemy-hero-panel", "vfx-burst");
      dealDamageToHero("enemy", 6);
    }
  },
  martillo: {
    id: "martillo",
    name: "Martillo Sismo",
    type: "Hechizo",
    rarity: "epica",
    art: "assets/cards/martillo.png",
    cost: 2,
    goldCost: 4,
    shortTag: "4 A TODA MESA",
    desc: "4 DMG a todas las unidades rivales.",
    vfxType: "burn",
    effect: (state) => {
      state.enemy.board.forEach((u, idx) => {
        if (u) {
          u.hp -= 4;
          const sel = `#enemy-slots .unit-slot:nth-child(${idx + 1})`;
          spawnVfxShape(sel, "vfx-burst");
          spawnFx(sel, "-4", "fx-dmg");
          if (u.hp <= 0) triggerUnitDeath("enemy", idx);
        }
      });
    }
  },
  pocion: {
    id: "pocion",
    name: "Pocion Vital",
    type: "Tactica",
    rarity: "comun",
    art: "assets/cards/pocion.png",
    cost: 1,
    goldCost: 2,
    shortTag: "CURA +8 HP / +1 CARTA",
    desc: "Recupera 8 HP y roba 1 carta.",
    vfxType: "beam",
    effect: (state) => {
      state.player.hp = Math.min(state.player.maxHp, state.player.hp + 8);
      drawCards(1);
      spawnVfxShape("#player-hero-panel", "vfx-beam");
      spawnFx("#player-hero-panel", "+8 HP", "fx-shd");
    }
  },
  hielo: {
    id: "hielo",
    name: "Viento Glacial",
    type: "Hechizo",
    rarity: "rara",
    art: "assets/cards/hielo.png",
    cost: 1,
    goldCost: 3,
    reaction: true,
    shortTag: "SHD +7 / +1 CARTA",
    desc: "[REACCION] +7 Armadura y roba 1 carta.",
    vfxType: "beam",
    effect: (state) => {
      state.player.armor += 7;
      drawCards(1);
      spawnVfxShape("#player-hero-panel", "vfx-beam");
      spawnFx("#player-hero-panel", "+7 SHD", "fx-shd");
    }
  },
  runica: {
    id: "runica",
    name: "Espada Runica",
    type: "Hechizo",
    rarity: "rara",
    art: "assets/cards/runica.png",
    cost: 2,
    goldCost: 3,
    shortTag: "DMG 11",
    desc: "11 dano directo al Heroe rival.",
    vfxType: "burn",
    effect: () => {
      spawnVfxShape("#enemy-hero-panel", "vfx-slash");
      dealDamageToHero("enemy", 11);
    }
  },
  drenaje: {
    id: "drenaje",
    name: "Drenaje Oscuro",
    type: "Hechizo",
    rarity: "rara",
    art: "assets/cards/drenaje.png",
    cost: 1,
    goldCost: 3,
    reaction: true,
    shortTag: "DMG 5 / +4 HP",
    desc: "[REACCION] 5 DMG al rival y +4 HP para ti.",
    vfxType: "burn",
    effect: (state) => {
      spawnVfxShape("#enemy-hero-panel", "vfx-burst");
      dealDamageToHero("enemy", 5);
      state.player.hp = Math.min(state.player.maxHp, state.player.hp + 4);
      spawnFx("#player-hero-panel", "+4 HP", "fx-shd");
    }
  },
  solar: {
    id: "solar",
    name: "Escudo Solar",
    type: "Tactica",
    rarity: "epica",
    art: "assets/cards/solar.png",
    cost: 2,
    goldCost: 4,
    reaction: true,
    shortTag: "SHD +14",
    desc: "[REACCION] +14 Armadura a tu Heroe.",
    vfxType: "beam",
    effect: (state) => {
      state.player.armor += 14;
      spawnVfxShape("#player-hero-panel", "vfx-beam");
      spawnFx("#player-hero-panel", "+14 SHD", "fx-shd");
    }
  },
  sobrecarga: {
    id: "sobrecarga",
    name: "Sobrecarga",
    type: "Tactica",
    rarity: "epica",
    art: "assets/cards/sobrecarga.png",
    cost: 0,
    goldCost: 3,
    reaction: true,
    shortTag: "+2 ENERGIA",
    desc: "[REACCION] Ganas +2 Energia este turno.",
    vfxType: "beam",
    effect: (state) => {
      state.player.energy += 2;
      spawnFx("#energy-bar-box", "+2 EN", "fx-shd");
    }
  },
  corona: {
    id: "corona",
    name: "Corona Campeon",
    type: "Tactica",
    rarity: "epica",
    art: "assets/cards/corona.png",
    cost: 1,
    goldCost: 4,
    shortTag: "+2 EN / +2 CARTAS",
    desc: "+2 Energia y roba 2 cartas.",
    vfxType: "beam",
    effect: (state) => {
      state.player.energy += 2;
      drawCards(2);
      spawnFx("#energy-bar-box", "+2 EN", "fx-shd");
    }
  }
};

const MARKET_POOL_IDS = [
  "golem", "relampago", "plasma", "cofre", "furia",
  "mercader", "lingote", "muro", "escudero", "goblin",
  "drako", "cristalomante", "yunque", "botin", "rayo",
  "martillo", "pocion", "hielo", "runica", "drenaje",
  "solar", "sobrecarga", "corona"
];

function buildEffectFromData(effects = {}) {
  return (state) => {
    if (effects.armor) {
      state.player.armor += effects.armor;
      spawnVfxShape("#player-hero-panel", "vfx-beam");
      spawnFx("#player-hero-panel", `+${effects.armor} SHD`, "fx-shd");
    }
    if (effects.heal) {
      const healed = Math.min(effects.heal, state.player.maxHp - state.player.hp);
      state.player.hp += healed;
      spawnFx("#player-hero-panel", `+${healed} HP`, "fx-heal");
    }
    if (effects.gold) {
      state.player.gold += effects.gold;
      spawnFx("#gold-count", `+${effects.gold} ORO`, "fx-gold");
    }
    if (effects.energy) {
      state.player.energy += effects.energy;
      spawnFx("#energy-bar-box", `+${effects.energy} EN`, "fx-shd");
    }
    if (effects.buffAllies) {
      state.player.board.forEach((u, idx) => {
        if (!u) return;
        u.atk += effects.buffAllies.atk || 0;
        u.hp += effects.buffAllies.hp || 0;
        u.maxHp += effects.buffAllies.hp || 0;
        spawnFx(`#player-slots .unit-slot:nth-child(${idx + 1})`, `+${effects.buffAllies.atk}/+${effects.buffAllies.hp}`, "fx-heal");
      });
    }
    if (effects.damageEnemyUnitOrHero) {
      const targetIdx = state.enemy.board.findIndex((u) => u !== null);
      if (targetIdx !== -1) {
        const u = state.enemy.board[targetIdx];
        u.hp -= effects.damageEnemyUnitOrHero;
        const sel = `#enemy-slots .unit-slot:nth-child(${targetIdx + 1})`;
        spawnVfxShape(sel, "vfx-slash");
        spawnFx(sel, `-${effects.damageEnemyUnitOrHero}`, "fx-dmg");
        if (effects.stunEnemyUnit && u.hp > 0) {
          u.stunned = true;
          spawnFx(sel, "ATURDIDA", "fx-shd");
        }
        if (u.hp <= 0) triggerUnitDeath("enemy", targetIdx);
      } else {
        spawnVfxShape("#enemy-hero-panel", "vfx-slash");
        dealDamageToHero("enemy", effects.damageEnemyUnitOrHero);
      }
    } else if (effects.stunEnemyUnit) {
      const targetIdx = state.enemy.board.findIndex((u) => u && !u.stunned);
      if (targetIdx !== -1) {
        state.enemy.board[targetIdx].stunned = true;
        spawnFx(`#enemy-slots .unit-slot:nth-child(${targetIdx + 1})`, "ATURDIDA", "fx-shd");
      }
    }
    if (effects.damageAllEnemiesAndHero) {
      const dmg = effects.damageAllEnemiesAndHero;
      state.enemy.board.forEach((u, idx) => {
        if (!u) return;
        u.hp -= dmg;
        const sel = `#enemy-slots .unit-slot:nth-child(${idx + 1})`;
        spawnVfxShape(sel, "vfx-slash");
        spawnFx(sel, `-${dmg}`, "fx-dmg");
        if (effects.stunAllEnemies && u.hp > 0) {
          u.stunned = true;
          spawnFx(sel, "ATURDIDA", "fx-shd");
        }
        if (u.hp <= 0) triggerUnitDeath("enemy", idx);
      });
      spawnVfxShape("#enemy-hero-panel", "vfx-slash");
      dealDamageToHero("enemy", dmg);
    } else if (effects.stunAllEnemies) {
      state.enemy.board.forEach((u, idx) => {
        if (!u) return;
        u.stunned = true;
        spawnFx(`#enemy-slots .unit-slot:nth-child(${idx + 1})`, "ATURDIDA", "fx-shd");
      });
    }
    if (effects.damageHero) {
      spawnVfxShape("#enemy-hero-panel", "vfx-slash");
      dealDamageToHero("enemy", effects.damageHero);
    }
    if (effects.draw) {
      drawCards(effects.draw);
    }
  };
}

if (Array.isArray(window.CUSTOM_CARDS)) {
  window.CUSTOM_CARDS.forEach((cardData) => {
    const compiled = { ...cardData };
    if (compiled.effects && !compiled.effect) {
      compiled.effect = buildEffectFromData(compiled.effects);
    }
    CARD_CATALOG[compiled.id] = compiled;
    if (!MARKET_POOL_IDS.includes(compiled.id)) {
      MARKET_POOL_IDS.push(compiled.id);
    }
  });
}

const FACTIONS = {
  forja: { id: "forja", name: "Forja de Hierro", tag: "Tanque / Equipos", desc: "Guardia, Armadura, Perforar y Equipos pesados." },
  arcano: { id: "arcano", name: "Orden Arcana", tag: "Control / Magia", desc: "Hechizos, Aturdir, Robo de cartas y Reliquias." },
  sindicato: { id: "sindicato", name: "Sindicato del Oro", tag: "Economia / Mercado", desc: "Oro extra, descuentos de Mercado y Efimeras." },
  legion: { id: "legion", name: "Legion Ignea", tag: "Aggro / Velocidad", desc: "Prisa, dano directo y ataque explosivo." },
  culto: { id: "culto", name: "Culto Sombrio", tag: "Drenaje / Sacrificio", desc: "Drenaje, Escabullirse y Ultimo Aliento." },
  pastel: { id: "pastel", name: "Reino Pastel", tag: "Cute / Curacion", desc: "Princesas, unicornios, caramelos y curacion tactica." },
  neutral: { id: "neutral", name: "Neutral", tag: "Compartida", desc: "Disponible para cualquier mazo." }
};

const FACTION_HEROES = {
  forja: { id: "kaelen", name: "Kaelen, Senor del Yunque", hp: 30, frame: "assets/ui/portrait_frame_iron.png", passive: "+1 SHD al inicio de cada turno" },
  arcano: { id: "lyra", name: "Lyra, Archimaga Astral", hp: 31, frame: "assets/ui/portrait_frame_crystal.png", passive: "Robas +1 carta extra en turno 1" },
  sindicato: { id: "vex", name: "Vex, Baron del Mercado", hp: 30, frame: "assets/ui/portrait_frame_gold.png", passive: "Empiezas cada combate con +2 Oro" },
  legion: { id: "ignis", name: "Ignis, General Carmesi", hp: 29, frame: "assets/ui/portrait_frame_obsidian.png", passive: "Tus unidades con [PRISA] ganan +1 ATK" },
  culto: { id: "moros", name: "Moros, Profeta Sombrio", hp: 30, frame: "assets/ui/portrait_frame_obsidian.png", passive: "Curas +2 HP cuando muere una unidad tuya" },
  pastel: { id: "chispita", name: "Princesa Chispita", hp: 28, frame: "assets/ui/portrait_frame_crystal.png", passive: "Cada turno tu unidad con menos vida gana +1/+1" }
};

function formatHeroPassiveHtml(factionId) {
  switch (factionId) {
    case "forja":
      return `<span>+1</span><img class="deck-passive-ic" src="assets/ui/stat_shd.png" alt="SHD" /><span>al inicio de cada turno</span>`;
    case "pastel":
      return `<span>Cada turno tu unidad mas debil gana</span><img class="deck-passive-ic" src="assets/ui/stat_hp.png" alt="HP" /><span>+1/+1</span>`;
    case "arcano":
      return `<span>Robas +1</span><img class="deck-passive-ic" src="assets/ui/icon_draw.png" alt="Carta" /><span>extra en turno 1</span>`;
    case "sindicato":
      return `<span>Empiezas con +2</span><img class="deck-passive-ic" src="assets/ui/icon_coin.png" alt="Oro" /><span>por combate</span>`;
    case "legion":
      return `<span>Unidades con</span><img class="deck-passive-ic" src="assets/ui/badge_haste.png" alt="Prisa" /><span>ganan +1</span><img class="deck-passive-ic" src="assets/ui/stat_atk.png" alt="ATK" />`;
    case "culto":
      return `<span>Curas +2</span><img class="deck-passive-ic" src="assets/ui/stat_hp.png" alt="HP" /><span>al morir aliada</span><img class="deck-passive-ic" src="assets/ui/badge_ondeath.png" alt="Al morir" />`;
    default:
      return FACTION_HEROES[factionId]?.passive || "";
  }
}

const BASE_CARD_FACTIONS = {
  golpe: "legion", escudo: "forja", mercenario: "sindicato", moneda: "sindicato",
  golem: "forja", muro: "forja", escudero: "forja", yunque: "forja", martillo: "forja", solar: "forja", ariete: "forja", centinela_runico: "forja", valquiria: "forja",
  cristalomante: "arcano", rayo: "arcano", hielo: "arcano", sobrecarga: "arcano", corona: "arcano", descarga: "arcano", trampa_hielo: "arcano", cronomante: "arcano",
  mercader: "sindicato", cofre: "sindicato", lingote: "sindicato", botin: "sindicato", saqueador: "sindicato", forja_viva: "sindicato",
  goblin: "legion", furia: "legion", drako: "legion", plasma: "legion", runica: "legion", berserker: "legion",
  relampago: "culto", drenaje: "culto", pocion: "culto"
};

Object.keys(CARD_CATALOG).forEach((id) => {
  if (!CARD_CATALOG[id].faction) {
    CARD_CATALOG[id].faction = BASE_CARD_FACTIONS[id] || "neutral";
  }
});

const STARTER_DECKS = {
  forja: {
    id: "forja",
    name: "Forja de Hierro",
    archetype: "Tanque y Equipos",
    cards: ["escudo", "escudo", "escudo", "escudo", "escudero", "escudero", "golpe", "golpe", "ariete", "moneda"]
  },
  arcano: {
    id: "arcano",
    name: "Orden Arcana",
    archetype: "Control y Robo",
    cards: ["golpe", "golpe", "descarga", "descarga", "rayo", "hielo", "escudo", "escudo", "moneda", "moneda"]
  },
  sindicato: {
    id: "sindicato",
    name: "Sindicato del Oro",
    archetype: "Economia y Mercado",
    cards: ["moneda", "moneda", "mercenario", "mercenario", "saqueador", "saqueador", "golpe", "golpe", "relampago", "escudo"]
  },
  legion: {
    id: "legion",
    name: "Legion Ignea",
    archetype: "Aggro y Prisa",
    cards: ["golpe", "golpe", "golpe", "goblin", "goblin", "legion_lancero", "furia", "escudo", "escudo", "moneda"]
  },
  culto: {
    id: "culto",
    name: "Culto Sombrio",
    archetype: "Drenaje y Sacrificio",
    cards: ["golpe", "golpe", "golpe", "drenaje", "mercenario", "mercenario", "saqueador", "escudo", "escudo", "moneda"]
  },
  pastel: {
    id: "pastel",
    name: "Reino Pastel",
    archetype: "Cute y Curacion",
    secret: true,
    cards: ["pastel_hada_azucar", "pastel_hada_azucar", "pastel_caballero_caramelo", "pastel_caballero_caramelo", "pastel_unicornio", "escudo", "escudo", "golpe", "golpe", "moneda"]
  }
};

function isPastelUnlocked() {
  try {
    return localStorage.getItem("duelforge_pastel_unlocked") === "1";
  } catch {
    return false;
  }
}

function unlockPastelFaction(silent = false) {
  try {
    localStorage.setItem("duelforge_pastel_unlocked", "1");
  } catch {}
  renderDeckSelector();
  if (!silent) {
    window.SFX?.play("heal_buff");
    setHint("Faccion secreta Reino Pastel desbloqueada!");
  }
}

let selectedStarterDeckId = "forja";
let selectedCardBackId = "auto";

const PLAYER_CARD_BACKS = [
  { id: "auto", label: "Auto", src: null },
  { id: "forja", label: "Forja", src: "assets/card_backs/back_forja.png" },
  { id: "arcano", label: "Arcano", src: "assets/card_backs/back_arcano.png" },
  { id: "sindicato", label: "Oro", src: "assets/card_backs/back_sindicato.png" },
  { id: "legion", label: "Ignea", src: "assets/card_backs/back_legion.png" },
  { id: "culto", label: "Culto", src: "assets/card_backs/back_culto.png" },
  { id: "alt_plateado", label: "Plata", src: "assets/card_backs/back_alt_plateado.png" },
  { id: "alt_dorado", label: "Imperial", src: "assets/card_backs/back_alt_dorado.png" },
  { id: "alt_neoforja", label: "Neoforja", src: "assets/card_backs/back_alt_neoforja.png" },
  { id: "alt_ceniza", label: "Ceniza", src: "assets/card_backs/back_alt_ceniza.png" }
];

const ENEMY_BACKS_NORMAL = [
  "assets/card_backs/back_enemy_normal_1.png",
  "assets/card_backs/back_enemy_normal_2.png",
  "assets/card_backs/back_enemy_normal_3.png"
];

const ENEMY_BACKS_ELITE = [
  "assets/card_backs/back_enemy_elite_1.png",
  "assets/card_backs/back_enemy_elite_2.png",
  "assets/card_backs/back_enemy_elite_3.png"
];

const ENEMY_BACKS_BOSS = [
  "assets/card_backs/back_boss_1.png",
  "assets/card_backs/back_boss_2.png",
  "assets/card_backs/back_boss_3.png"
];

function getSelectedPlayerCardBack() {
  if (selectedCardBackId === "auto") {
    return `assets/card_backs/back_${selectedStarterDeckId}.png`;
  }
  const found = PLAYER_CARD_BACKS.find((b) => b.id === selectedCardBackId);
  return found?.src || `assets/card_backs/back_${selectedStarterDeckId}.png`;
}

function getCardBackTopSrc(baseSrc) {
  const src = String(baseSrc || "");
  if (!src || /assets\/ui\//i.test(src)) return "";
  return src.replace(/\.png$/i, "_top.png");
}

function applyCardBackLayers(baseEl, topEl, baseSrc) {
  if (!baseSrc) return;
  if (baseEl) baseEl.src = baseSrc;
  if (topEl) {
    const topSrc = getCardBackTopSrc(baseSrc);
    if (!topSrc) {
      topEl.removeAttribute("src");
      topEl.style.display = "none";
    } else {
      topEl.style.display = "";
      topEl.onerror = () => {
        topEl.style.display = "none";
      };
      topEl.src = topSrc;
    }
  }
}

function renderCardBack2LayerMarkup(baseSrc, altText = "Dorso", extraClass = "", tag = "div") {
  const topSrc = getCardBackTopSrc(baseSrc);
  const cls = extraClass ? `${extraClass} card-back-2layer` : "card-back-2layer";
  const topTag = topSrc
    ? `<img class="card-back-top" src="${topSrc}" alt="" onerror="this.style.display='none'" />`
    : "";
  return `
    <${tag} class="${cls}">
      <img class="card-back-base" src="${baseSrc}" alt="${altText}" />
      ${topTag}
    </${tag}>
  `;
}

function renderCardBackSelector() {
  const container = document.getElementById("card-back-selector");
  if (!container) return;
  container.innerHTML = "";
  const unlockedBacks = window.CollectionSystem;
  PLAYER_CARD_BACKS.forEach((b) => {
    const isUnlocked = !unlockedBacks || unlockedBacks.isCardBackUnlocked(b.id);
    if (!isUnlocked && selectedCardBackId === b.id) {
      selectedCardBackId = "auto";
    }
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = `card-back-choice ${selectedCardBackId === b.id ? "selected" : ""} ${!isUnlocked ? "locked" : ""}`;
    const previewSrc = b.src || `assets/card_backs/back_${selectedStarterDeckId}.png`;
    btn.title = !isUnlocked
      ? `Bloqueado: ${unlockedBacks.getCardBackRequirement(b.id)}`
      : (b.id === "auto" ? "Dorso automatico segun tu faccion" : `Dorso: ${b.label}`);
    btn.innerHTML = `
      ${renderCardBack2LayerMarkup(previewSrc, b.label, "", "span")}
      <span>${isUnlocked ? b.label : "BLOQ."}</span>
    `;
    if (isUnlocked) {
      attachCardParallax(btn, btn.querySelector(".card-back-2layer"));
      btn.addEventListener("click", () => {
        selectedCardBackId = b.id;
        renderCardBackSelector();
      });
    } else {
      btn.disabled = true;
    }
    container.appendChild(btn);
  });
}

function renderDeckSelector() {
  const container = document.getElementById("deck-selector");
  if (!container) return;
  container.innerHTML = "";
  Object.values(STARTER_DECKS).forEach((deck) => {
    const f = FACTIONS[deck.id];
    const h = FACTION_HEROES[deck.id];
    const locked = Boolean(deck.secret && !isPastelUnlocked());
    const heroArt = `assets/heroes/hero_${deck.id}_${h.id}.png`;
    const deckArt = `assets/decks/deck_${deck.id}.png`;

    const btn = document.createElement("button");
    btn.type = "button";
    btn.dataset.faction = deck.id;
    btn.className = `deck-choice-card ${selectedStarterDeckId === deck.id ? "selected" : ""} ${locked ? "secret-locked" : `faction-card-${deck.id}`}`;
    if (locked) {
      btn.innerHTML = `
        <div class="deck-pillar-top">
          <span class="deck-archetype-text">Faccion Secreta</span>
          <span class="deck-hp-text">???</span>
        </div>
        <div class="deck-pillar-bottom">
          <span class="deck-choice-name">???</span>
          <span class="deck-hero-name">Bloqueada</span>
          <span class="deck-choice-desc">Gana 1 run (o escribe CUTE)</span>
        </div>
      `;
      btn.addEventListener("click", () => {
        window.SFX?.play("invalid_action");
      });
    } else {
      btn.innerHTML = `
        <img class="deck-hero-bg" src="${heroArt}" alt="${h.name}" />
        <div class="deck-hero-fade"></div>
        <div class="deck-pillar-top">
          <span class="deck-archetype-text">${f.tag}</span>
          <span class="deck-hp-text"><img class="deck-hp-ic" src="assets/ui/stat_hp.png" alt="" />${h.hp}</span>
        </div>
        <div class="deck-pillar-bottom">
          <img class="deck-choice-img" src="${deckArt}" alt="${deck.name}" />
          <span class="deck-choice-name">${deck.name}</span>
          <span class="deck-hero-name">${h.name}</span>
          <span class="deck-choice-desc">${formatHeroPassiveHtml(deck.id)}</span>
        </div>
      `;
      attachCardParallax(btn);
      btn.addEventListener("mouseenter", () => renderDeckDetailPanel(deck.id));
      btn.addEventListener("mouseleave", () => renderDeckDetailPanel(selectedStarterDeckId));
      btn.addEventListener("click", () => {
        selectedStarterDeckId = deck.id;
        renderDeckSelector();
        renderCardBackSelector();
      });
    }
    container.appendChild(btn);
  });
  renderDeckDetailPanel(selectedStarterDeckId);
}

function renderDeckDetailPanel(deckIdOverride) {
  const deck = STARTER_DECKS[deckIdOverride || selectedStarterDeckId] || STARTER_DECKS.forja;
  const f = FACTIONS[deck.id];
  const nameEl = document.getElementById("deck-detail-name");
  const tagEl = document.getElementById("deck-detail-tag");
  const countEl = document.getElementById("deck-detail-count");
  const descEl = document.getElementById("deck-detail-desc");
  const cardsEl = document.getElementById("deck-detail-cards");
  if (!nameEl || !cardsEl) return;

  nameEl.textContent = deck.name;
  if (tagEl && f) {
    tagEl.textContent = f.tag;
    tagEl.className = `deck-choice-tag faction-tag faction-${deck.id}`;
  }
  if (countEl) countEl.textContent = `${deck.cards.length} CARTAS`;
  if (descEl && f) descEl.textContent = `${f.desc} (${deck.archetype})`;

  const counts = {};
  deck.cards.forEach((cid) => {
    counts[cid] = (counts[cid] || 0) + 1;
  });

  cardsEl.innerHTML = "";
  Object.entries(counts).forEach(([cid, qty]) => {
    const card = CARD_CATALOG[cid];
    if (!card) return;
    const item = document.createElement("div");
    item.className = "deck-detail-card-item";
    const cardEl = createVisualCardEl(card);
    const qtyEl = document.createElement("span");
    qtyEl.className = "info-plaque deck-detail-qty";
    qtyEl.textContent = `X${qty}`;
    item.appendChild(cardEl);
    item.appendChild(qtyEl);
    attachCardHoverInspector(item, card);
    cardsEl.appendChild(item);
  });
}

function getCardTypeIcon(type) {
  return `assets/ui/type_${(type || "unidad").toLowerCase()}.png`;
}

function getEffectiveGoldCost(card) {
  let cost = card.goldCost || 0;
  if (cost <= 0) return 0;
  const discount = (state.player?.relics || []).reduce((sum, r) => sum + (r?.marketDiscount || 0), 0);
  return Math.max(1, cost - discount);
}

const STAGES = [
  {
    name: "CAPITAN HIERRO",
    hp: 48,
    avatar: "assets/heroes/enemy_capitan_hierro.png",
    frame: "assets/ui/portrait_frame_iron.png",
    arenaBg: "assets/ui/arena_bg.png",
    cardBack: "assets/ui/card_back_enemy.png",
    baseAtk: 7,
    summonName: "Centinela",
    summonAtk: 3,
    summonHp: 5,
    boosterTier: "basico"
  },
  {
    name: "MAGA DE CRISTALES",
    hp: 56,
    avatar: "assets/heroes/enemy_maga_cristales.png",
    frame: "assets/ui/portrait_frame_crystal.png",
    arenaBg: "assets/ui/arena_bg_2.png",
    cardBack: "assets/ui/card_back_enemy_2.png",
    baseAtk: 8,
    summonName: "Golem Cristal",
    summonAtk: 3,
    summonHp: 6,
    boosterTier: "raro"
  },
  {
    name: "SENOR TITAN",
    hp: 68,
    avatar: "assets/heroes/enemy_senor_titan.png",
    frame: "assets/ui/portrait_frame_obsidian.png",
    arenaBg: "assets/ui/arena_bg_3.png",
    cardBack: "assets/ui/card_back_enemy_3.png",
    baseAtk: 10,
    summonName: "Coloso Hierro",
    summonAtk: 4,
    summonHp: 7,
    boosterTier: "epico"
  }
];

const BOOSTER_TIERS = {
  basico: {
    label: "BOOSTER BASICO",
    img: "assets/boosters/booster_basico.png",
    count: 2,
    rarities: ["comun", "comun", "rara"]
  },
  raro: {
    label: "BOOSTER RARO",
    img: "assets/boosters/booster_raro.png",
    count: 3,
    rarities: ["comun", "rara", "rara", "epica"]
  },
  epico: {
    label: "BOOSTER EPICO",
    img: "assets/boosters/booster_epico.png",
    count: 3,
    rarities: ["rara", "epica", "epica", "legendaria"]
  },
  legendario: {
    label: "BOOSTER LEGENDARIO",
    img: "assets/boosters/booster_legendario.png",
    count: 3,
    rarities: ["epica", "legendaria", "legendaria"]
  }
};

let runState = {};
let state = {};
let marketFilter = "Todos";
let marketSort = "none";

function createCardInstance(templateId, ephemeral = false) {
  const tpl = CARD_CATALOG[templateId];
  return {
    ...tpl,
    uid: Math.random().toString(36).slice(2, 9),
    ephemeral
  };
}

function shuffle(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function spawnFx(selector, text, cls) {
  if (state && Array.isArray(state._pvpFxQueue)) {
    state._pvpFxQueue.push({ kind: "fx", selector, text, cls });
  }
  const target = document.querySelector(selector);
  const layer = document.getElementById("fx-layer");
  if (!target || !layer) return;
  const rect = target.getBoundingClientRect();
  const el = document.createElement("div");
  el.className = `fx-pop ${cls}`;
  el.textContent = text;
  el.style.left = `${rect.left + rect.width / 2}px`;
  el.style.top = `${rect.top + rect.height / 2}px`;
  layer.appendChild(el);
  setTimeout(() => el.remove(), 860);
}

function spawnVfxShape(selector, cls) {
  if (state && Array.isArray(state._pvpFxQueue)) {
    state._pvpFxQueue.push({ kind: "vfx", selector, cls });
  }
  const target = document.querySelector(selector);
  const layer = document.getElementById("fx-layer");
  if (!target || !layer) return;
  const rect = target.getBoundingClientRect();
  const el = document.createElement("div");
  el.className = cls;
  el.style.left = `${rect.left + rect.width / 2}px`;
  el.style.top = `${rect.top + rect.height / 2}px`;
  layer.appendChild(el);
  setTimeout(() => el.remove(), 600);
}

function animateCardDissolve(handIndex, vfxType) {
  const handEl = document.getElementById("player-hand");
  const cardNode = handEl?.children[handIndex];
  const layer = document.getElementById("fx-layer");
  if (!cardNode || !layer) return;
  const rect = cardNode.getBoundingClientRect();
  const ghost = cardNode.cloneNode(true);
  ghost.classList.add("ghost-card", vfxType === "burn" ? "burn-dissolve" : "beam-dissolve");
  ghost.style.left = `${rect.left + rect.width / 2}px`;
  ghost.style.top = `${rect.top + rect.height / 2}px`;
  layer.appendChild(ghost);
  setTimeout(() => ghost.remove(), 550);
}

function animateUnitLunge(attackerSelector, targetSelector, onHit) {
  const attackerEl = document.querySelector(attackerSelector);
  const targetEl = document.querySelector(targetSelector);
  if (!attackerEl || !targetEl) {
    onHit();
    return;
  }
  const aRect = attackerEl.getBoundingClientRect();
  const tRect = targetEl.getBoundingClientRect();
  const dx = tRect.left + tRect.width / 2 - (aRect.left + aRect.width / 2);
  const dy = tRect.top + tRect.height / 2 - (aRect.top + aRect.height / 2);

  attackerEl.style.zIndex = "30";
  attackerEl.style.transition = "transform 0.16s cubic-bezier(0.2, 0.9, 0.3, 1)";
  attackerEl.style.transform = `translate(${dx * 0.72}px, ${dy * 0.72}px) scale(1.14)`;

  setTimeout(() => {
    onHit();
  }, 160);
}

function triggerShake(selector) {
  const el = document.querySelector(selector);
  if (!el) return;
  el.classList.remove("shake");
  void el.offsetWidth;
  el.classList.add("shake");
}

function startNewRun() {
  const chosenDeck = STARTER_DECKS[selectedStarterDeckId] || STARTER_DECKS.forja;
  const hero = FACTION_HEROES[chosenDeck.id] || FACTION_HEROES.forja;
  const mapNav = window.MapSystem ? window.MapSystem.createMapRunState() : null;
  runState = {
    stageIndex: 0,
    playerHp: hero.hp,
    playerMaxHp: hero.hp,
    hero,
    runGold: 35,
    nextStageBonusGold: 0,
    sidelineMaxSlots: 2,
    sidelineDeck: [],
    faction: chosenDeck.id,
    starterDeckName: chosenDeck.name,
    permanentDeck: [...chosenDeck.cards],
    mapNav,
    currentEncounter: null,
    lastEventId: null,
    inCombat: false
  };
  document.getElementById("game-over-modal")?.classList.add("hidden");
  document.getElementById("booster-modal")?.classList.add("hidden");
  document.getElementById("shop-modal")?.classList.add("hidden");
  document.getElementById("event-modal")?.classList.add("hidden");
  document.getElementById("rest-screen")?.classList.add("hidden");
  window.CollectionSystem?.recordRunStart();
  startStage(0);
  stopTurnTimer();
  runState.inCombat = false;
  openBoosterModal(true);
  setHint(`Mazo seleccionado: ${chosenDeck.name} (${chosenDeck.archetype}).`);
}

function pickEnemyCardBack(stageIdx) {
  if (stageIdx === 0) return ENEMY_BACKS_NORMAL[Math.floor(Math.random() * ENEMY_BACKS_NORMAL.length)];
  if (stageIdx === 1) return ENEMY_BACKS_ELITE[Math.floor(Math.random() * ENEMY_BACKS_ELITE.length)];
  return ENEMY_BACKS_BOSS[Math.floor(Math.random() * ENEMY_BACKS_BOSS.length)];
}

function startNodeCombat(node) {
  if (!window.MapSystem) {
    startStage(runState.stageIndex || 0);
    return;
  }
  const enc = window.MapSystem.getCombatEncounterForNode(node);
  runState.currentEncounter = enc;
  runState.inCombat = true;
  const tierIdx = enc.isBoss ? 2 : enc.isElite ? 1 : 0;
  startStageWithConfig(enc, tierIdx);
}

function startStage(stageIdx) {
  runState.stageIndex = stageIdx;
  const stage = STAGES[stageIdx];
  runState.currentEncounter = { ...stage, isBoss: stageIdx >= STAGES.length - 1, isElite: false, goldReward: 15 };
  runState.inCombat = true;
  startStageWithConfig(stage, stageIdx);
}

function startStageWithConfig(stage, tierIdx = 0) {
  const chosenEnemyBack = pickEnemyCardBack(tierIdx);
  const chosenPlayerBack = getSelectedPlayerCardBack();
  document.querySelector(".main-stage").style.setProperty("--arena-bg", `url("${stage.arenaBg}")`);
  const enemyFrameEl = document.getElementById("enemy-frame-img");
  if (enemyFrameEl && stage.frame) enemyFrameEl.src = stage.frame;
  const playerDeckImgEl = document.getElementById("player-deck-img");
  const playerDeckTopEl = document.getElementById("player-deck-top-img");
  applyCardBackLayers(playerDeckImgEl, playerDeckTopEl, chosenPlayerBack);

  const playerDeck = shuffle(runState.permanentDeck).map((id) => createCardInstance(id, false));
  const allowedPool = window.CollectionSystem
    ? window.CollectionSystem.getFilteredMarketPool(MARKET_POOL_IDS)
    : MARKET_POOL_IDS;
  const marketPool = shuffle(allowedPool).map((id) => createCardInstance(id, true));

  const hero = runState.hero || FACTION_HEROES[runState.faction] || FACTION_HEROES.forja;
  const heroNameEl = document.querySelector("#player-hero-panel .hero-name");
  if (heroNameEl) {
    heroNameEl.textContent = hero.name.toUpperCase();
    heroNameEl.title = `Poder de Heroe: ${hero.passive}`;
  }
  const playerFrameEl = document.getElementById("player-frame-img");
  if (playerFrameEl && hero.frame) playerFrameEl.src = hero.frame;

  state = {
    turn: 1,
    isPlayerTurn: true,
    selectedUnitIndex: null,
    pendingEquip: null,
    gameOver: false,
    player: {
      hp: runState.playerHp,
      maxHp: runState.playerMaxHp,
      armor: runState.faction === "forja" ? 1 : 0,
      energy: 3,
      maxEnergy: 3,
      gold: (runState.nextStageBonusGold || 0) + (runState.faction === "sindicato" ? 2 : 0),
      deck: playerDeck,
      hand: [],
      discard: [],
      board: [null, null, null],
      relics: [null, null]
    },
    enemy: {
      name: stage.name,
      avatar: stage.avatar,
      cardBack: chosenEnemyBack,
      hp: stage.hp,
      maxHp: stage.hp,
      baseAtk: stage.baseAtk,
      summonName: stage.summonName,
      summonAtk: stage.summonAtk,
      summonHp: stage.summonHp,
      armor: 0,
      handCount: 4,
      deckCount: 10,
      board: [null, null, null],
      intention: null
    },
    marketDeck: marketPool,
    marketRow: []
  };

  for (let i = 0; i < 4; i++) {
    refillMarketSlot(i);
  }

  rollEnemyIntention();
  runState.nextStageBonusGold = 0;
  drawCards(runState.faction === "arcano" ? 6 : 5);
  document.getElementById("game-over-modal").classList.add("hidden");
  document.getElementById("booster-modal").classList.add("hidden");
  clearCombatFinisherEffects();
  render();
  startTurnTimer();
  if (runState.inCombat) {
    window.FTUE?.onCombatTurnStart(state);
    window.FTUE?.onCardDrawnOrHandCheck(state);
    setTimeout(() => {
      if (runState.faction === "forja") triggerHeroPassiveFx("PASIVA: +1 SHD", "fx-shd");
      else if (runState.faction === "arcano") triggerHeroPassiveFx("PASIVA: +1 CARTA", "fx-shd");
      else if (runState.faction === "sindicato") triggerHeroPassiveFx("PASIVA: +2 ORO", "fx-gold");
    }, 320);
  }
  setTimeout(() => showSpeechBubble("enemy", "rage", `Preparate para caer!`), 450);
  if (autoBattleEnabled) setTimeout(runAutoBattleTurn, 420);
}

function refillMarketSlot(index) {
  if (state.marketDeck.length === 0) {
    state.marketDeck = shuffle(MARKET_POOL_IDS).map((id) => createCardInstance(id, true));
  }
  state.marketRow[index] = state.marketDeck.pop();
}

function drawCards(count) {
  let drawnCount = 0;
  let reshuffled = false;
  for (let i = 0; i < count; i++) {
    if (state.player.deck.length === 0) {
      if (state.player.discard.length === 0) break;
      state.player.deck = shuffle(state.player.discard);
      state.player.discard = [];
      reshuffled = true;
    }
    const drawn = state.player.deck.pop();
    drawn.justDrawn = true;
    state.player.hand.push(drawn);
    drawnCount++;
  }
  if (reshuffled) {
    window.SFX?.play("shuffle_deck");
  }
  if (drawnCount > 0) {
    window.SFX?.playBurst("draw_card", drawnCount, 60);
  }
}

function dealDamageToHero(target, amount) {
  const hero = state[target];
  const blocked = Math.min(hero.armor, amount);
  hero.armor -= blocked;
  const remaining = amount - blocked;
  hero.hp = Math.max(0, hero.hp - remaining);

  const selector = target === "enemy" ? "#enemy-hero-panel" : "#player-hero-panel";
  triggerShake(selector);
  if (remaining > 0) {
    spawnFx(selector, `-${remaining} HP`, "fx-dmg");
    window.SFX?.play("attack_hit");
    window.VFX?.playHeroHit(selector, remaining, false);
  } else {
    spawnFx(selector, "BLOQUEADO", "fx-shd");
    window.SFX?.play("shield_block");
    window.VFX?.playHeroHit(selector, 0, true);
  }
  checkGameOver();
}

function clearCombatFinisherEffects() {
  document.querySelector(".main-stage")?.classList.remove("finisher-victory", "finisher-boss", "finisher-defeat");
  document.getElementById("enemy-hero-panel")?.classList.remove("enemy-shatter");
  document.querySelector(".enemy-side")?.classList.remove("enemy-shatter");
  document.getElementById("player-hero-panel")?.classList.remove("player-shatter");
  document.querySelector(".player-side")?.classList.remove("player-shatter");
  document.getElementById("finisher-banner")?.classList.add("hidden");
  document.getElementById("finisher-banner")?.classList.remove("is-boss");
}

function playCombatFinisher(isVictory, headline, subline, onComplete, isBoss = false) {
  stopTurnTimer();
  render();
  clearCombatFinisherEffects();

  const stageEl = document.querySelector(".main-stage");
  const banner = document.getElementById("finisher-banner");
  const titleEl = document.getElementById("finisher-title");
  const subEl = document.getElementById("finisher-sub");

  stageEl?.classList.add(isVictory ? (isBoss ? "finisher-boss" : "finisher-victory") : "finisher-defeat");
  triggerShake(".main-stage");
  if (!isVictory) {
    window.SFX?.play("defeat_tone");
  } else if (!isBoss) {
    window.SFX?.play("victory_chime");
  }
  window.VFX?.playFinisherSequence(isVictory ? (isBoss ? "boss_victory" : "victory") : "defeat");

  if (isVictory) {
    document.getElementById("enemy-hero-panel")?.classList.add("enemy-shatter");
    document.querySelector(".enemy-side")?.classList.add("enemy-shatter");
    spawnFx("#enemy-hero-panel", isBoss ? "JEFE ANIQUILADO!" : "DESTRUIDO!", "fx-dmg");
  } else {
    document.getElementById("player-hero-panel")?.classList.add("player-shatter");
    document.querySelector(".player-side")?.classList.add("player-shatter");
    spawnFx("#player-hero-panel", "DERROTADO!", "fx-dmg");
  }

  if (banner && titleEl && subEl) {
    banner.classList.toggle("is-victory", isVictory);
    banner.classList.toggle("is-defeat", !isVictory);
    banner.classList.toggle("is-boss", Boolean(isVictory && isBoss));
    titleEl.textContent = headline;
    subEl.textContent = subline || "";
    banner.classList.remove("hidden");
  }

  const durationMs = isVictory && isBoss ? 2250 : 1650;
  setTimeout(() => {
    clearCombatFinisherEffects();
    if (typeof onComplete === "function") onComplete();
  }, durationMs);
}

function checkGameOver() {
  if (state.gameOver) return;
  if (state.isPvp) {
    if (state.enemy.hp <= 0 || state.player.hp <= 0) {
      state.gameOver = true;
      window.PvpEngine?.onMatchEnded?.();
    }
    return;
  }
  if (state.enemy.hp <= 0) {
    state.gameOver = true;
    runState.inCombat = false;
    runState.playerHp = Math.min(runState.playerMaxHp, state.player.hp + 5);
    const enc = runState.currentEncounter;
    if (enc && enc.goldReward) {
      runState.runGold = (runState.runGold || 0) + enc.goldReward;
    }
    const isBossWin = enc ? Boolean(enc.isBoss) : runState.stageIndex >= STAGES.length - 1;
    window.CollectionSystem?.recordEnemyDefeated(
      state.enemy.name,
      Boolean(enc?.isElite),
      isBossWin
    );
    const headline = isBossWin
      ? "JEFE DESTRUIDO!"
      : (enc?.isElite ? "ELITE ABATIDO!" : "ENEMIGO DERROTADO!");
    const subline = enc?.goldReward ? `+${enc.goldReward} ORO DE RUN` : "VICTORIA EN COMBATE";

    playCombatFinisher(true, headline, subline, () => {
      if (isBossWin) {
        unlockPastelFaction(true);
        showModal("CAMPEON DE LA RUN", "Has derrotado a todos los rivales y al Senor Titan.", true);
      } else {
        openBoosterModal(false);
      }
    }, isBossWin);
  } else if (state.player.hp <= 0) {
    state.gameOver = true;
    runState.inCombat = false;
    const floorNum = runState.mapNav ? runState.mapNav.currentFloor : (runState.stageIndex + 1);
    playCombatFinisher(false, "HAS CAIDO EN COMBATE", `Piso ${floorNum} - Tu heroe fue derrotado`, () => {
      showModal("DERROTA", `Has caido en el Piso ${floorNum}. Intentalo de nuevo.`, false);
    });
  }
}

function showModal(title, subtitle, isVictory = true) {
  stopTurnTimer();
  window.SFX?.play(isVictory ? "victory_chime" : "defeat_tone");
  if (isVictory) {
    window.VFX?.celebrate("victory");
  }
  const banner = document.getElementById("gameover-banner-img");
  if (banner) {
    banner.src = isVictory ? "assets/ui/banner_victory.png" : "assets/ui/banner_defeat.png";
  }
  document.getElementById("modal-title").textContent = title;
  document.getElementById("modal-subtitle").textContent = subtitle;
  document.getElementById("game-over-modal").classList.remove("hidden");
}

function buildCardStatIcons(card) {
  const pills = [];
  let complexNote = "";
  const tag = (card.shortTag || "").toUpperCase();

  if (card.type === "Unidad") {
    pills.push(`<span class="stat-ic"><img src="assets/ui/stat_atk.png" alt="ATK" /><b>${card.atk}</b></span>`);
    pills.push(`<span class="stat-ic"><img src="assets/ui/stat_hp.png" alt="HP" /><b>${card.hp}</b></span>`);
    if (card.upkeep) complexNote = `Mantiene: ${card.upkeep} EN/Oro cada turno`;
    else if (card.onDeath) {
      const parts = [];
      if (card.onDeath.gold) parts.push(`+${card.onDeath.gold} ORO`);
      if (card.onDeath.armor) parts.push(`+${card.onDeath.armor} SHD`);
      if (card.onDeath.damageHero) parts.push(`${card.onDeath.damageHero} DMG al Heroe`);
      if (card.onDeath.draw) parts.push(`+${card.onDeath.draw} Carta`);
      complexNote = `Al morir: ${parts.join(" / ")}`;
    }
    else if (card.pierce) complexNote = "Perfora: dano sobrante al heroe";
    else if (card.stealth) complexNote = "Escabullirse: ignora Guardia";
    else if (card.id === "mercader") pills.push(`<span class="stat-ic"><img src="assets/ui/icon_coin.png" alt="Oro" /><b>+2</b></span>`);
    else if (card.id === "cristalomante") pills.push(`<span class="stat-ic"><img src="assets/ui/card_back_player.png" alt="Carta" /><b>+1</b></span>`);
    else if (card.id === "goblin") complexNote = "Al entrar: 2 DMG directo";
  } else {
    const dmgM = tag.match(/DMG\s*(\d+)/);
    const shdM = tag.match(/SHD\s*\+?(\d+)/);
    const oroM = tag.match(/ORO\s*\+?(\d+)|\+(\d+)\s*ORO/);
    const curM = tag.match(/CURA\s*\+?(\d+)/);
    const carM = tag.match(/\+(\d+)\s*CARTA/);
    const enM = tag.match(/\+(\d+)\s*EN/);

    if (dmgM) pills.push(`<span class="stat-ic"><img src="assets/ui/stat_atk.png" alt="DMG" /><b>${dmgM[1]}</b></span>`);
    if (shdM) pills.push(`<span class="stat-ic"><img src="assets/ui/stat_shd.png" alt="SHD" /><b>+${shdM[1]}</b></span>`);
    if (curM) pills.push(`<span class="stat-ic"><img src="assets/ui/stat_hp.png" alt="HP" /><b>+${curM[1]}</b></span>`);
    if (oroM) pills.push(`<span class="stat-ic"><img src="assets/ui/icon_coin.png" alt="Oro" /><b>+${oroM[1] || oroM[2]}</b></span>`);
    if (enM) pills.push(`<span class="stat-ic"><img src="assets/ui/icon_gem.png" alt="EN" /><b>+${enM[1]}</b></span>`);
    if (carM) pills.push(`<span class="stat-ic"><img src="assets/ui/card_back_player.png" alt="Carta" /><b>+${carM[1]}</b></span>`);

    if (card.id === "furia") {
      pills.push(`<span class="stat-ic"><img src="assets/ui/stat_atk.png" alt="ATK" /><b>+3</b></span>`);
      complexNote = "A toda tu mesa";
    } else if (card.id === "yunque") {
      pills.push(`<span class="stat-ic"><img src="assets/ui/stat_atk.png" alt="ATK" /><b>+2</b></span>`);
      pills.push(`<span class="stat-ic"><img src="assets/ui/stat_hp.png" alt="HP" /><b>+2</b></span>`);
      complexNote = "A toda tu mesa";
    } else if (card.id === "rayo") {
      pills.push(`<span class="stat-ic"><img src="assets/ui/stat_atk.png" alt="DMG" /><b>5+6</b></span>`);
      complexNote = "5 a unidad + 6 al Heroe";
    } else if (card.id === "martillo") {
      pills.push(`<span class="stat-ic"><img src="assets/ui/stat_atk.png" alt="DMG" /><b>4</b></span>`);
      complexNote = "A toda la mesa rival";
    } else if (card.id === "drenaje") {
      pills.push(`<span class="stat-ic"><img src="assets/ui/stat_hp.png" alt="HP" /><b>+4</b></span>`);
    } else if (tag.includes("ATURDIR") || tag.includes("MESA")) {
      complexNote = card.shortTag;
    }
  }

  const hasTextEffect =
    pills.length === 0 ||
    Boolean(complexNote) ||
    card.type === "Reliquia" ||
    card.type === "Equipo" ||
    Boolean(card.onDeath) ||
    Boolean(card.upkeep) ||
    Boolean(card.pierce) ||
    Boolean(card.stealth);

  if (hasTextEffect) {
    pills.push(
      '<span class="stat-ic stat-scroll" title="Pasa el cursor para leer el efecto"><img src="assets/ui/icon_scroll.png" alt="Texto" /></span>'
    );
  }

  return {
    iconsHtml: `<div class="card-stat-icons">${pills.join("")}</div>`,
    complexNote
  };
}

function createVisualCardEl(card, { mini = false, showNote = false } = {}) {
  const { iconsHtml, complexNote } = buildCardStatIcons(card);
  const el = document.createElement("div");
  el.className = `hand-card type-${card.type} faction-${card.faction || "neutral"} rarity-${card.rarity || "comun"} ${card.ephemeral ? "ephemeral" : ""} ${mini ? "mini-deck-card" : ""}`;
  el.innerHTML = `
    <div class="card-type-crest" title="Tipo: ${card.type}"><img src="${getCardTypeIcon(card.type)}" alt="${card.type}" /></div>
    ${buildCardBadges(card)}
    <div class="card-banner card-banner-cost-only">
      <span class="energy-cost"><span>${card.cost}</span></span>
    </div>
    <div class="card-art-wrap">
      <img src="${card.art}" alt="${card.name}" />
    </div>
    ${iconsHtml}
    ${showNote && complexNote ? `<div class="card-complex-note">${complexNote}</div>` : ""}
  `;
  attachCardParallax(el);
  attachCardHoverInspector(el, card);
  return el;
}

function renderBoosterDeckPreview() {
  const el = document.getElementById("booster-deck-preview");
  if (!el) return;
  const counts = {};
  runState.permanentDeck.forEach((id) => {
    counts[id] = (counts[id] || 0) + 1;
  });
  el.innerHTML = `<div class="deck-preview-header">TU MAZO ACTUAL (${runState.permanentDeck.length} CARTAS)</div>`;
  const row = document.createElement("div");
  row.className = "deck-preview-cards";
  Object.entries(counts).forEach(([id, qty]) => {
    const stack = document.createElement("div");
    stack.className = "inventory-card-stack mini-stack";
    stack.appendChild(createVisualCardEl(CARD_CATALOG[id], { mini: true }));
    const qtyLabel = document.createElement("span");
    qtyLabel.className = "inv-qty-pill";
    qtyLabel.textContent = `x${qty}`;
    stack.appendChild(qtyLabel);
    row.appendChild(stack);
  });
  el.appendChild(row);
}

function openBoosterModal(isInitial = false) {
  stopTurnTimer();
  const enc = runState.currentEncounter;
  const stage = enc || STAGES[runState.stageIndex];
  const tierKey = isInitial ? "basico" : (stage?.boosterTier || "basico");
  const tier = BOOSTER_TIERS[tierKey] || BOOSTER_TIERS.basico;
  const victoryBanner = document.getElementById("booster-victory-banner");
  if (victoryBanner) {
    victoryBanner.classList.toggle("hidden", isInitial);
  }
  const rewardNote = !isInitial && enc?.goldReward ? ` (+${enc.goldReward} Oro de Run)` : "";
  document.getElementById("booster-title").textContent = isInitial
    ? `PREPARA TU MAZO - ${tier.label}`
    : `VICTORIA - ${tier.label}`;
  document.getElementById("booster-subtitle").textContent = isInitial
    ? "Abre tu sobre inicial para elegir 1 carta permanente antes de entrar al mapa."
    : `Cartas efimeras limpiadas${rewardNote}. Elige 1 carta permanente y avanza en el mapa.`;
  document.getElementById("booster-pack-img").src = tier.img;
  renderBoosterDeckPreview();

  const packStage = document.getElementById("booster-pack-stage");
  const choicesEl = document.getElementById("booster-choices");
  const burstEl = document.getElementById("booster-burst");
  packStage.classList.remove("hidden", "opening");
  burstEl.classList.remove("active");
  choicesEl.classList.add("hidden");
  choicesEl.innerHTML = "";

  packStage.onclick = () => {
    if (packStage.classList.contains("opening")) return;
    packStage.classList.add("opening");
    burstEl.classList.remove("active");
    void burstEl.offsetWidth;
    burstEl.classList.add("active");
    setTimeout(() => revealBoosterCards(tier, isInitial, tierKey), 460);
  };
  document.getElementById("booster-modal").classList.remove("hidden");
  window.FTUE?.onBoosterOpen(isInitial);
}

function buildCardBadges(card) {
  const badges = [];
  if (card.guard) badges.push('<span class="badge-icon" title="GUARDIA: Protege a tu Heroe"><img src="assets/ui/badge_guard.png" alt="Guardia" /></span>');
  if (card.haste) badges.push('<span class="badge-icon" title="PRISA: Ataca al entrar"><img src="assets/ui/badge_haste.png" alt="Prisa" /></span>');
  if (card.stealth) badges.push('<span class="badge-icon" title="ESCABULLIRSE: No puede ser bloqueado"><img src="assets/ui/badge_stealth.png" alt="Escabullirse" /></span>');
  if (card.upkeep) badges.push(`<span class="badge-icon" title="MERCENARIO: Consume ${card.upkeep} EN/Oro cada turno"><img src="assets/ui/badge_upkeep.png" alt="Mercenario" /></span>`);
  if (card.reaction) badges.push('<span class="badge-icon" title="REACCION: Jugable en turno rival"><img src="assets/ui/badge_reaction.png" alt="Reaccion" /></span>');
  if (card.pierce) badges.push('<span class="badge-icon" title="PERFORAR: Dano sobrante al Heroe"><img src="assets/ui/badge_pierce.png" alt="Perforar" /></span>');
  if (card.onDeath) badges.push('<span class="badge-icon" title="ULTIMO ALIENTO: Efecto al morir"><img src="assets/ui/badge_ondeath.png" alt="Al morir" /></span>');
  if (card.cute) badges.push('<span class="badge-icon" title="CUTE: Puede curar +1 HP a un aliado o Heroe"><img src="assets/ui/badge_cute.png" alt="Cute" /></span>');
  if (card.ephemeral) badges.push('<span class="badge-icon" title="EFIMERA: Desaparece tras el combate"><img src="assets/ui/badge_ephemeral.png" alt="Efimera" /></span>');
  if (card.equipStats) badges.push('<span class="badge-icon" title="EQUIPO: Mejora permanente a una Unidad"><img src="assets/ui/badge_equip.png" alt="Equipo" /></span>');
  if (card.type === "Reliquia") badges.push(`<span class="badge-icon" title="RELIQUIA: Activa ${card.duration || 2} turnos"><img src="assets/ui/badge_relic.png" alt="Reliquia" /></span>`);
  return badges.length ? `<div class="card-side-badges">${badges.join("")}</div>` : "";
}

function attachCardParallax(cardEl, targetEl = cardEl) {
  if (!cardEl || !targetEl) return;
  cardEl.addEventListener("mousemove", (e) => {
    const r = cardEl.getBoundingClientRect();
    const nx = (e.clientX - r.left) / r.width - 0.5;
    const ny = (e.clientY - r.top) / r.height - 0.5;
    targetEl.style.setProperty("--ry", `${(nx * 20).toFixed(1)}deg`);
    targetEl.style.setProperty("--rx", `${(-ny * 20).toFixed(1)}deg`);
    targetEl.style.setProperty("--px", `${(nx * 8).toFixed(1)}px`);
    targetEl.style.setProperty("--py", `${(ny * 8).toFixed(1)}px`);
  });
  cardEl.addEventListener("mouseleave", () => {
    targetEl.style.setProperty("--ry", "0deg");
    targetEl.style.setProperty("--rx", "0deg");
    targetEl.style.setProperty("--px", "0px");
    targetEl.style.setProperty("--py", "0px");
  });
}

function revealBoosterCards(tier, isInitial = false, tierKey = "basico") {
  window.CollectionSystem?.recordBoosterOpened(tierKey);
  const packStage = document.getElementById("booster-pack-stage");
  packStage.classList.add("hidden");
  packStage.classList.remove("opening");
  const choicesEl = document.getElementById("booster-choices");
  choicesEl.classList.remove("hidden");
  choicesEl.innerHTML = "";

  const pickedIds = [];
  for (let i = 0; i < tier.count; i++) {
    const targetRarity = tier.rarities[Math.floor(Math.random() * tier.rarities.length)];
    let candidates = MARKET_POOL_IDS.filter(
      (id) =>
        CARD_CATALOG[id].rarity === targetRarity &&
        !pickedIds.includes(id) &&
        !(CARD_CATALOG[id].rarity === "legendaria" && runState.permanentDeck.includes(id)) &&
        (i !== 0 || !runState.faction || CARD_CATALOG[id].faction === runState.faction)
    );
    if (candidates.length === 0) {
      candidates = MARKET_POOL_IDS.filter(
        (id) =>
          CARD_CATALOG[id].rarity === targetRarity &&
          !pickedIds.includes(id) &&
          !(CARD_CATALOG[id].rarity === "legendaria" && runState.permanentDeck.includes(id))
      );
    }
    if (candidates.length === 0) {
      candidates = MARKET_POOL_IDS.filter(
        (id) =>
          !pickedIds.includes(id) &&
          !(CARD_CATALOG[id].rarity === "legendaria" && runState.permanentDeck.includes(id))
      );
    }
    const chosenId = candidates[Math.floor(Math.random() * candidates.length)];
    pickedIds.push(chosenId);
  }

  pickedIds.forEach((id, idx) => {
    const card = CARD_CATALOG[id];
    const { iconsHtml, complexNote } = buildCardStatIcons(card);
    const wrap = document.createElement("div");
    wrap.className = "booster-pick-wrap";
    wrap.style.animationDelay = `${idx * 140}ms`;
    wrap.innerHTML = `
      <div class="hand-card type-${card.type} faction-${card.faction || "neutral"} rarity-${card.rarity || "comun"}" title="${card.desc}">
        <div class="card-type-crest" title="Tipo: ${card.type}"><img src="${getCardTypeIcon(card.type)}" alt="${card.type}" /></div>
        ${buildCardBadges(card)}
        <div class="card-banner card-banner-cost-only">
          <span class="energy-cost"><span>${card.cost}</span></span>
        </div>
        <div class="card-art-wrap">
          <img src="${card.art}" alt="${card.name}" />
        </div>
        ${iconsHtml}
        <div class="card-name-ribbon ribbon-${card.rarity || "comun"}"><span>${card.name}</span></div>
      </div>
      ${complexNote ? `<div class="card-complex-note">${complexNote}</div>` : ""}
    `;
    const cardEl = wrap.querySelector(".hand-card");
    attachCardParallax(cardEl);
    wrap.addEventListener("click", (ev) => pickBoosterCard(id, isInitial, ev.currentTarget));
    choicesEl.appendChild(wrap);
    if (card.rarity === "epica" || card.rarity === "legendaria" || card.rarity === "rara") {
      setTimeout(() => {
        if (!document.getElementById("booster-modal")?.classList.contains("hidden")) {
          window.VFX?.playRarityReveal(cardEl, card.rarity);
        }
      }, idx * 140 + 200);
    }
  });
  window.FTUE?.onBoosterRevealed(isInitial);
}

function pickBoosterCard(cardId, isInitial = false, sourceEl = null) {
  const card = CARD_CATALOG[cardId];
  const rarity = card?.rarity || "comun";
  if (rarity === "legendaria") {
    window.VFX?.burstAt(sourceEl || "#booster-choices", "legendary", { count: 32, ringRadius: 150 });
  } else if (rarity === "epica") {
    window.VFX?.burstAt(sourceEl || "#booster-choices", "epic", { count: 24, ringRadius: 120 });
  } else {
    window.VFX?.burstAt(sourceEl || "#booster-choices", "gold", { count: 16, ringRadius: 90 });
  }
  window.SFX?.play("heal_buff");
  window.CollectionSystem?.unlockCard(cardId);
  runState.permanentDeck.push(cardId);
  document.getElementById("booster-modal").classList.add("hidden");
  if (runState.mapNav) {
    openMapScreen(false);
    return;
  }
  if (isInitial) {
    startStage(0);
  } else {
    if (runState.stageIndex === 1) {
      runState.playerMaxHp += 5;
    }
    openRestScreen();
  }
}

function applyEquipToUnit(slotIndex, card, handIndex) {
  const unit = state.player.board[slotIndex];
  if (!unit) return;
  const st = card.equipStats || {};
  if (st.atk) unit.atk += st.atk;
  if (st.hp) {
    unit.hp += st.hp;
    unit.maxHp += st.hp;
  }
  if (st.guard) unit.guard = true;
  if (st.pierce) unit.pierce = true;
  if (st.stealth) unit.stealth = true;
  if (st.haste) unit.ready = true;
  unit.equips = unit.equips || [];
  unit.equips.push(card.name);

  window.SFX?.play("heal_buff");
  state.player.energy -= card.cost;
  state.player.hand.splice(handIndex, 1);
  if (!card.ephemeral) {
    state.player.discard.push(card);
  }
  state.pendingEquip = null;
  const targetSlotSel = `#player-slots .unit-slot:nth-child(${slotIndex + 1})`;
  spawnFx(targetSlotSel, `+${st.atk || 0}/+${st.hp || 0}`, "fx-heal");
  window.VFX?.playCardPlay(card, null, targetSlotSel);
  setHint(`Equipaste ${card.name} en ${unit.name}.`);
  render();
}

function playCard(handIndex) {
  if (state.gameOver) return;
  if (state.isPvp && !state._pvpInternal) {
    window.PvpEngine?.sendAction("PLAY_CARD", { handIndex });
    return;
  }
  const card = state.player.hand[handIndex];
  if (!card || state.player.energy < card.cost) {
    if (card) window.SFX?.play("invalid_action");
    return;
  }

  const inReaction = Boolean(state.reactionWindow);
  if (!state.isPlayerTurn && !(inReaction && card.reaction)) return;
  const handCardEl = document.querySelectorAll("#player-hand .hand-card")[handIndex] || null;
  let vfxTargetSelector = null;

  if (card.type === "Unidad") {
    const emptySlot = state.player.board.findIndex((u) => u === null);
    if (emptySlot === -1) {
      window.SFX?.play("invalid_action");
      setHint("Mesa llena (maximo 3 unidades). No puedes jugar mas unidades.");
      return;
    }
    window.SFX?.play("play_card");
    vfxTargetSelector = `#player-slots .unit-slot:nth-child(${emptySlot + 1})`;
    state.player.energy -= card.cost;
    state.player.hand.splice(handIndex, 1);
    const legionBonus = (runState.faction === "legion" && card.haste) ? 1 : 0;
    if (legionBonus > 0) {
      triggerHeroPassiveFx("PASIVA: +1 ATK PRISA", "fx-dmg");
      spawnFx(vfxTargetSelector, "PASIVA +1 ATK", "fx-dmg");
    }
    state.player.board[emptySlot] = {
      name: card.name,
      art: card.art,
      atk: card.atk + legionBonus,
      hp: card.hp,
      maxHp: card.hp,
      guard: card.guard,
      ready: card.haste,
      stealth: Boolean(card.stealth),
      pierce: Boolean(card.pierce),
      cute: Boolean(card.cute),
      onDeath: card.onDeath || null,
      upkeep: card.upkeep || 0,
      equips: [],
      ephemeral: card.ephemeral
    };
    if (card.onPlay) card.onPlay(state);
  } else if (card.type === "Reliquia") {
    const emptyRelic = state.player.relics.findIndex((r) => r === null);
    if (emptyRelic === -1) {
      window.SFX?.play("invalid_action");
      setHint("Zona de Reliquias llena (maximo 2). Espera a que expire una.");
      return;
    }
    window.SFX?.play("heal_buff");
    vfxTargetSelector = "#player-relics";
    state.player.energy -= card.cost;
    state.player.hand.splice(handIndex, 1);
    state.player.relics[emptyRelic] = {
      id: card.id,
      name: card.name,
      art: card.art,
      duration: card.duration || 3,
      effects: card.effects || null,
      marketDiscount: card.marketDiscount || 0,
      desc: card.desc
    };
    window.CollectionSystem?.recordRelicUsed(card.id);
    spawnFx("#player-relics", `${card.name} (${card.duration || 3}T)`, "fx-shd");
    setHint(`Reliquia ${card.name} activada por ${card.duration || 3} turnos.`);
  } else if (card.type === "Equipo") {
    const allyIndices = state.player.board
      .map((u, i) => (u ? i : -1))
      .filter((i) => i !== -1);
    if (allyIndices.length === 0) {
      window.SFX?.play("invalid_action");
      setHint("Necesitas al menos 1 unidad aliada en mesa para equipar.");
      return;
    }
    if (allyIndices.length === 1) {
      applyEquipToUnit(allyIndices[0], card, handIndex);
      return;
    }
    state.pendingEquip = { handIndex, card };
    setHint(`Selecciona una unidad aliada en mesa para equipar ${card.name}.`);
    render();
    return;
  } else {
    window.SFX?.play("play_card");
    vfxTargetSelector = card.vfxType === "burn" ? "#enemy-hero-panel" : "#player-hero-panel";
    animateCardDissolve(handIndex, card.vfxType || "beam");
    state.player.energy -= card.cost;
    state.player.hand.splice(handIndex, 1);
    card.effect(state);
    // Temporary Market cards are eliminated on use instead of going to discard
    if (!card.ephemeral) {
      state.player.discard.push(card);
    }
  }

  window.VFX?.playCardPlay(card, handCardEl, vfxTargetSelector);

  state.selectedUnitIndex = null;
  state.pendingEquip = null;
  render();
  window.FTUE?.onCardPlayed(card, state);
}

function buyMarketCard(marketIndex) {
  if (state.isPvp && !state._pvpInternal) {
    window.PvpEngine?.sendAction("BUY_MARKET", { marketIndex });
    return;
  }
  if (!state.isPlayerTurn || state.gameOver) return;
  const card = state.marketRow[marketIndex];
  const price = card ? getEffectiveGoldCost(card) : 0;
  if (!card || state.player.gold < price) {
    if (card) window.SFX?.play("invalid_action");
    return;
  }

  window.SFX?.play("draw_card");
  state.player.gold -= price;
  card.justDrawn = true;
  state.player.hand.push(card);
  spawnFx("#player-hand", "+1 A TU MANO", "fx-gold");
  refillMarketSlot(marketIndex);
  setHint(`Compraste ${card.name} (Temporal). Se anadio directo a tu mano.`);
  render();
  window.FTUE?.onMarketBought(state);
}

function getAttackArrowOrigin(slotIndex) {
  const el = document.querySelector(`#player-slots .unit-slot:nth-child(${slotIndex + 1}) .unit-token`);
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height * 0.35 };
}

function hideAttackArrow() {
  const svg = document.getElementById("attack-arrow-svg");
  if (svg) {
    svg.classList.add("hidden");
    svg.classList.remove("target-valid", "target-blocked");
  }
}

function updateAttackArrow(clientX, clientY, targetEl) {
  const svg = document.getElementById("attack-arrow-svg");
  const pathEl = document.getElementById("attack-arrow-path");
  const glowEl = document.getElementById("attack-arrow-glow");
  if (!svg || !pathEl || !glowEl || state.selectedUnitIndex === null) {
    hideAttackArrow();
    return;
  }
  const origin = getAttackArrowOrigin(state.selectedUnitIndex);
  if (!origin) {
    hideAttackArrow();
    return;
  }
  const cx = (origin.x + clientX) / 2;
  const cy = Math.min(origin.y, clientY) - 65;
  const d = `M ${origin.x} ${origin.y} Q ${cx} ${cy} ${clientX} ${clientY}`;
  pathEl.setAttribute("d", d);
  glowEl.setAttribute("d", d);

  svg.classList.remove("hidden", "target-valid", "target-blocked");
  if (targetEl) {
    const enemyUnit = targetEl.closest("#enemy-slots .unit-token.targetable");
    const enemyHero = targetEl.closest("#enemy-hero-panel");
    if (enemyUnit) {
      svg.classList.add("target-valid");
    } else if (enemyHero) {
      const attacker = state.player.board[state.selectedUnitIndex];
      const hasGuard = !attacker?.stealth && state.enemy.board.some((u) => u && u.guard && !u.stunned);
      svg.classList.add(hasGuard ? "target-blocked" : "target-valid");
    }
  }
}

let ignoreNextDocumentClick = false;

document.addEventListener("mousemove", (e) => {
  if (state?.selectedUnitIndex !== null && state?.isPlayerTurn && !state?.gameOver) {
    updateAttackArrow(e.clientX, e.clientY, e.target);
  }
});

document.addEventListener("click", (e) => {
  if (ignoreNextDocumentClick) {
    ignoreNextDocumentClick = false;
    return;
  }
  if (state?.selectedUnitIndex === null || !state?.isPlayerTurn || state?.gameOver) return;
  const inPlayerUnit = e.target.closest("#player-slots .unit-token");
  const inEnemyUnit = e.target.closest("#enemy-slots .unit-token");
  const inEnemyHero = e.target.closest("#enemy-hero-panel");
  if (!inPlayerUnit && !inEnemyUnit && !inEnemyHero) {
    state.selectedUnitIndex = null;
    hideAttackArrow();
    setHint("Ataque cancelado.");
    render();
  }
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && state?.selectedUnitIndex !== null) {
    state.selectedUnitIndex = null;
    hideAttackArrow();
    setHint("Ataque cancelado.");
    render();
  }
});

function selectPlayerUnit(slotIndex) {
  if (!state.isPlayerTurn || state.gameOver) return;
  const unit = state.player.board[slotIndex];
  if (!unit || !unit.ready) return;

  ignoreNextDocumentClick = true;
  setTimeout(() => { ignoreNextDocumentClick = false; }, 0);

  window.SFX?.play("hover_card");
  if (state.selectedUnitIndex === slotIndex) {
    state.selectedUnitIndex = null;
    hideAttackArrow();
    setHint("Seleccion cancelada.");
  } else {
    state.selectedUnitIndex = slotIndex;
    setHint(`Unidad ${unit.name} lista: apunta con la flecha a una unidad rival o al Heroe rival (clic fuera para cancelar).`);
    const origin = getAttackArrowOrigin(slotIndex);
    if (origin) updateAttackArrow(origin.x, origin.y - 70, null);
  }
  render();
}

function triggerUnitDeath(side, slotIndex) {
  const unit = state[side]?.board?.[slotIndex];
  if (!unit) return;
  const onDeath = unit.onDeath;
  const slotSel = `#${side === "enemy" ? "enemy" : "player"}-slots .unit-slot:nth-child(${slotIndex + 1})`;
  if (state && Array.isArray(state._pvpFxQueue)) {
    state._pvpFxQueue.push({ kind: "vfx_destroy", selector: slotSel, isEnemy: side === "enemy" });
  } else {
    window.VFX?.playUnitDestroy(slotSel, side === "enemy");
  }
  state[side].board[slotIndex] = null;
  if (side === "player" && runState.faction === "culto") {
    const healed = Math.min(2, state.player.maxHp - state.player.hp);
    if (healed > 0) {
      state.player.hp += healed;
      triggerHeroPassiveFx(`PASIVA: +${healed} HP`, "fx-heal");
    }
  }
  if (side === "player" && onDeath) {
    if (onDeath.gold) {
      state.player.gold += onDeath.gold;
      spawnFx("#gold-count", `+${onDeath.gold} ORO`, "fx-gold");
    }
    if (onDeath.armor) {
      state.player.armor += onDeath.armor;
      spawnFx("#player-hero-panel", `+${onDeath.armor} SHD`, "fx-shd");
    }
    if (onDeath.damageHero) {
      spawnVfxShape("#enemy-hero-panel", "vfx-slash");
      dealDamageToHero("enemy", onDeath.damageHero);
    }
    if (onDeath.heal) {
      const h = Math.min(onDeath.heal, state.player.maxHp - state.player.hp);
      if (h > 0) {
        state.player.hp += h;
        spawnFx("#player-hero-panel", `+${h} HP`, "fx-heal");
      }
    }
    if (onDeath.draw) {
      drawCards(onDeath.draw);
    }
  }
}

function attackEnemyUnit(enemySlotIndex) {
  if (state.selectedUnitIndex === null || !state.isPlayerTurn || state.gameOver) return;
  hideAttackArrow();
  if (state.isPvp && !state._pvpInternal) {
    const attackerIdx = state.selectedUnitIndex;
    state.selectedUnitIndex = null;
    window.PvpEngine?.sendAction("ATTACK_UNIT", { attackerIdx, enemySlotIndex });
    return;
  }
  const attackerIdx = state.selectedUnitIndex;
  const attacker = state.player.board[attackerIdx];
  const defender = state.enemy.board[enemySlotIndex];
  if (!attacker || !defender) return;

  state.selectedUnitIndex = null;
  window.FTUE?.onUnitAttacked();
  const attackerSel = `#player-slots .unit-slot:nth-child(${attackerIdx + 1}) .unit-token`;
  const defenderSel = `#enemy-slots .unit-slot:nth-child(${enemySlotIndex + 1})`;

  animateUnitLunge(attackerSel, defenderSel, () => {
    window.SFX?.play("attack_hit");
    defender.hp -= attacker.atk;
    attacker.hp -= defender.atk;
    attacker.ready = false;

    spawnVfxShape(defenderSel, "vfx-slash");
    triggerShake(defenderSel);
    spawnFx(defenderSel, `-${attacker.atk}`, "fx-dmg");
    spawnFx(`#player-slots .unit-slot:nth-child(${attackerIdx + 1})`, `-${defender.atk}`, "fx-dmg");

    if (attacker.pierce && defender.hp < 0) {
      const excess = Math.abs(defender.hp);
      spawnVfxShape("#enemy-hero-panel", "vfx-slash");
      dealDamageToHero("enemy", excess);
      spawnFx("#enemy-hero-panel", `PERFORA -${excess}`, "fx-dmg");
    }

    if (defender.hp <= 0) triggerUnitDeath("enemy", enemySlotIndex);
    if (attacker.hp <= 0) triggerUnitDeath("player", attackerIdx);

    setHint("Combate resuelto.");
    render();
  });
}

function healAllyWithCute(targetIdx) {
  if (state.selectedUnitIndex === null || !state.isPlayerTurn || state.gameOver) return;
  const healerIdx = state.selectedUnitIndex;
  const healer = state.player.board[healerIdx];
  const target = state.player.board[targetIdx];
  if (!healer || !healer.cute || !target || healerIdx === targetIdx) return;

  state.selectedUnitIndex = null;
  hideAttackArrow();
  healer.ready = false;
  const healed = Math.min(1, target.maxHp - target.hp);
  target.hp += healed;
  window.SFX?.play("heal_buff");
  spawnFx(`#player-slots .unit-slot:nth-child(${targetIdx + 1})`, `+1 HP`, "fx-heal");
  setHint(`${healer.name} curo +1 HP a ${target.name}.`);
  render();
}

function healPlayerHeroWithCute() {
  if (state.selectedUnitIndex === null || !state.isPlayerTurn || state.gameOver) return;
  const healer = state.player.board[state.selectedUnitIndex];
  if (!healer || !healer.cute) return;

  state.selectedUnitIndex = null;
  hideAttackArrow();
  healer.ready = false;
  const healed = Math.min(1, state.player.maxHp - state.player.hp);
  state.player.hp += healed;
  window.SFX?.play("heal_buff");
  spawnFx("#player-hero-panel", `+1 HP`, "fx-heal");
  setHint(`${healer.name} curo +1 HP a tu Heroe.`);
  render();
}

function attackEnemyHero() {
  if (state.selectedUnitIndex === null || !state.isPlayerTurn || state.gameOver) return;
  const attacker = state.player.board[state.selectedUnitIndex];
  const hasGuard = !attacker?.stealth && state.enemy.board.some((u) => u && u.guard && !u.stunned);
  if (hasGuard) {
    window.SFX?.play("invalid_action");
    spawnFx("#enemy-hero-panel", "BLOQUEADO POR GUARDIA", "fx-shd");
    setHint("Una unidad rival con [GUARDIA] bloquea el ataque directo al Heroe.");
    return;
  }
  hideAttackArrow();
  if (state.isPvp && !state._pvpInternal) {
    const attackerIdx = state.selectedUnitIndex;
    state.selectedUnitIndex = null;
    window.PvpEngine?.sendAction("ATTACK_HERO", { attackerIdx });
    return;
  }
  window.FTUE?.onUnitAttacked();

  const attackerIdx = state.selectedUnitIndex;
  if (!attacker) return;

  state.selectedUnitIndex = null;
  window.FTUE?.onUnitAttacked();
  const attackerSel = `#player-slots .unit-slot:nth-child(${attackerIdx + 1}) .unit-token`;

  animateUnitLunge(attackerSel, "#enemy-hero-panel", () => {
    spawnVfxShape("#enemy-hero-panel", "vfx-slash");
    dealDamageToHero("enemy", attacker.atk);
    attacker.ready = false;
    setHint(`Atacaste al Heroe rival por ${attacker.atk} de dano.`);
    render();
  });
}

function rollEnemyIntention() {
  const hasEmptySlot = state.enemy.board.some((u) => u === null);
  const roll = Math.random();
  if (hasEmptySlot && roll < 0.42) {
    state.enemy.intention = {
      type: "summon",
      label: `Invocar ${state.enemy.summonName} (${state.enemy.summonAtk}/${state.enemy.summonHp} GUARDIA)`
    };
  } else if (roll < 0.74) {
    const dmg = state.enemy.baseAtk + Math.floor(state.turn / 2);
    state.enemy.intention = {
      type: "attack",
      stealth: false,
      amount: dmg,
      cardName: "Golpe Brutal",
      art: "assets/cards/golpe.png",
      label: `Atacar por ${dmg}`
    };
  } else if (roll < 0.82) {
    const dmg = Math.max(4, Math.floor((state.enemy.baseAtk + Math.floor(state.turn / 2)) * 0.6));
    state.enemy.intention = {
      type: "attack",
      stealth: true,
      amount: dmg,
      cardName: "Emboscada Sigilosa",
      art: "assets/cards/relampago.png",
      label: `Emboscada Sigilosa (${dmg} - NO BLOQUEABLE)`
    };
  } else {
    const shd = 6 + runState.stageIndex * 2;
    state.enemy.intention = { type: "armor", amount: shd, label: `Ganar +${shd} SHD` };
  }
}

function endTurn() {
  if (!state.isPlayerTurn || state.gameOver) return;
  hideAttackArrow();
  if (state.isPvp && !state._pvpInternal) {
    window.PvpEngine?.sendAction("END_TURN", {});
    return;
  }
  stopTurnTimer();
  window.FTUE?.onTurnEnd();
  state.isPlayerTurn = false;
  state.selectedUnitIndex = null;
  render();

  setTimeout(() => {
    executeEnemyTurn();
  }, 320);
}

let reactionInterval = null;

function openReactionWindow(enemyCardMeta, onResolve) {
  const banner = document.getElementById("reaction-banner");
  const cardSlot = document.getElementById("reaction-enemy-card");
  const textEl = document.getElementById("reaction-text");
  const fillEl = document.getElementById("reaction-timer-fill");
  const numEl = document.getElementById("reaction-timer-num");
  const passBtn = document.getElementById("reaction-pass-btn");

  const defaultGuardIdx = state.player.board.findIndex((u) => u && u.guard);
  state.reactionWindow = {
    totalDmg: enemyCardMeta.dmg,
    blockerIdx: defaultGuardIdx !== -1 ? defaultGuardIdx : null,
    timeLeft: 5.0
  };

  cardSlot.innerHTML = `
    <div class="hand-card type-Hechizo faction-neutral rarity-rara">
      <div class="card-type-crest" title="Tipo: Hechizo"><img src="${getCardTypeIcon("Hechizo")}" alt="Hechizo" /></div>
      <div class="card-banner card-banner-cost-only">
        <span class="energy-cost"><span>${enemyCardMeta.dmg}</span></span>
      </div>
      <div class="card-art-wrap">
        <img src="${enemyCardMeta.art}" alt="${enemyCardMeta.name}" />
      </div>
      <div class="card-stat-icons"><span class="stat-ic"><img src="assets/ui/stat_atk.png" alt="DMG" /><b>${enemyCardMeta.dmg}</b></span></div>
      <div class="card-name-ribbon ribbon-rara"><span>${enemyCardMeta.name}</span></div>
    </div>
  `;

  textEl.textContent = `${state.enemy.name} juega ${enemyCardMeta.name} (${enemyCardMeta.dmg} DMG). Elige bloqueador o responde con [REACCION].`;
  banner.classList.remove("hidden");
  render();
  window.FTUE?.onReactionOpen();

  const finish = () => {
    if (reactionInterval) {
      clearInterval(reactionInterval);
      reactionInterval = null;
    }
    banner.classList.add("hidden");
    const chosenBlocker = state.reactionWindow ? state.reactionWindow.blockerIdx : null;
    state.reactionWindow = null;
    window.FTUE?.onReactionResolved();
    onResolve(chosenBlocker);
  };

  passBtn.onclick = finish;
  if (autoBattleEnabled) {
    handleAutoReaction(enemyCardMeta.dmg, finish);
  }
  reactionInterval = setInterval(() => {
    if (!state.reactionWindow || state.gameOver) {
      finish();
      return;
    }
    if (window.FTUE?.isReactionPaused()) return;
    state.reactionWindow.timeLeft = Math.max(0, state.reactionWindow.timeLeft - 0.1);
    const pct = (state.reactionWindow.timeLeft / 5.0) * 100;
    fillEl.style.width = `${pct}%`;
    numEl.textContent = `${state.reactionWindow.timeLeft.toFixed(1)}s`;
    if (state.reactionWindow.timeLeft <= 0) {
      finish();
    }
  }, 100);
}

function executeEnemyTurn() {
  if (state.gameOver) return;
  state.enemy.armor = 0;

  const readyAttackers = [];
  state.enemy.board.forEach((u, idx) => {
    if (!u) return;
    if (u.stunned) {
      u.stunned = false;
      u.ready = true;
      spawnFx(`#enemy-slots .unit-slot:nth-child(${idx + 1})`, "ATURDIDA", "fx-shd");
      return;
    }
    if (u.ready) {
      readyAttackers.push({ unit: u, idx });
    } else {
      u.ready = true;
    }
  });

  const intent = state.enemy.intention;
  if (intent.type === "armor") {
    state.enemy.armor += intent.amount;
    spawnFx("#enemy-hero-panel", `+${intent.amount} SHD`, "fx-shd");
  } else if (intent.type === "summon") {
    const emptyIdx = state.enemy.board.findIndex((u) => u === null);
    if (emptyIdx !== -1) {
      state.enemy.board[emptyIdx] = {
        name: state.enemy.summonName,
        art: "assets/cards/golem.png",
        atk: state.enemy.summonAtk,
        hp: state.enemy.summonHp,
        guard: true,
        ready: false
      };
    }
  }

  const incomingDmg =
    readyAttackers.reduce((sum, a) => sum + a.unit.atk, 0) +
    (intent.type === "attack" ? intent.amount : 0);

  if (incomingDmg <= 0) {
    finishEnemyTurn();
    return;
  }

  // Escabullirse (stealth): cannot be reacted to or blocked!
  if (intent.type === "attack" && intent.stealth && readyAttackers.length === 0) {
    spawnFx("#enemy-hero-panel", "ESCABULLIRSE!", "fx-dmg");
    dealDamageToHero("player", intent.amount);
    setHint(`${state.enemy.name} uso Emboscada Sigilosa (Escabullirse) por ${intent.amount} DMG!`);
    finishEnemyTurn();
    return;
  }

  const enemyCardMeta = {
    name: intent.type === "attack" ? (intent.cardName || "Asalto Rival") : readyAttackers[0].unit.name,
    art: intent.type === "attack" ? (intent.art || state.enemy.avatar) : readyAttackers[0].unit.art,
    dmg: incomingDmg
  };

  openReactionWindow(enemyCardMeta, (blockerIdx) => {
    // Resolve ready enemy units
    readyAttackers.forEach(({ unit, idx }) => {
      if (unit.hp <= 0) return;
      const targetIdx =
        blockerIdx !== null && state.player.board[blockerIdx]
          ? blockerIdx
          : state.player.board.findIndex((pu) => pu && pu.guard);

      if (targetIdx !== -1) {
        const pu = state.player.board[targetIdx];
        pu.hp -= unit.atk;
        unit.hp -= pu.atk;
        spawnFx(`#player-slots .unit-slot:nth-child(${targetIdx + 1})`, `-${unit.atk}`, "fx-dmg");
        spawnFx(`#enemy-slots .unit-slot:nth-child(${idx + 1})`, `-${pu.atk}`, "fx-dmg");
        if (pu.hp <= 0) triggerUnitDeath("player", targetIdx);
      } else {
        dealDamageToHero("player", unit.atk);
      }
    });

    state.enemy.board.forEach((u, idx) => {
      if (u && u.hp <= 0) triggerUnitDeath("enemy", idx);
    });

    // Resolve enemy hero direct attack
    if (intent.type === "attack" && !state.gameOver) {
      const heroBlockerIdx =
        blockerIdx !== null && state.player.board[blockerIdx] ? blockerIdx : -1;
      if (heroBlockerIdx !== -1 && readyAttackers.length === 0) {
        const pu = state.player.board[heroBlockerIdx];
        pu.hp -= intent.amount;
        spawnFx(`#player-slots .unit-slot:nth-child(${heroBlockerIdx + 1})`, `-${intent.amount} BLOQ`, "fx-dmg");
        if (pu.hp <= 0) triggerUnitDeath("player", heroBlockerIdx);
      } else {
        dealDamageToHero("player", intent.amount);
      }
    }

    finishEnemyTurn();
  });
}

function finishEnemyTurn() {
  if (state.gameOver) {
    render();
    return;
  }

  while (state.player.hand.length > 0) {
    state.player.discard.push(state.player.hand.pop());
  }

  state.turn += 1;
  state.isPlayerTurn = true;
  state.player.armor = 0;
  state.player.energy = state.player.maxEnergy;

  if (runState.faction === "forja") {
    state.player.armor += 1;
    triggerHeroPassiveFx("PASIVA: +1 SHD", "fx-shd");
  } else if (runState.faction === "pastel") {
    let weakestIdx = -1;
    state.player.board.forEach((u, idx) => {
      if (!u) return;
      if (weakestIdx === -1 || u.hp < state.player.board[weakestIdx].hp) {
        weakestIdx = idx;
      }
    });
    if (weakestIdx !== -1) {
      const target = state.player.board[weakestIdx];
      target.atk += 1;
      target.hp += 1;
      target.maxHp += 1;
      triggerHeroPassiveFx("PASIVA: +1/+1", "fx-heal");
      spawnFx(`#player-slots .unit-slot:nth-child(${weakestIdx + 1})`, "+1/+1", "fx-heal");
    }
  }

  // Trigger active Relics at start of player turn and decrement duration
  (state.player.relics || []).forEach((relic, idx) => {
    if (!relic) return;
    if (relic.effects) {
      buildEffectFromData(relic.effects)(state);
    }
    relic.duration -= 1;
    if (relic.duration <= 0) {
      spawnFx("#player-relics", `${relic.name} expiro`, "fx-shd");
      state.player.relics[idx] = null;
    }
  });

  // Upkeep for Mercenario units: pay 1 EN, else 1 Gold, else unit leaves/dies!
  state.player.board.forEach((u, idx) => {
    if (!u || !u.upkeep) return;
    if (state.player.energy >= u.upkeep) {
      state.player.energy -= u.upkeep;
      spawnFx(`#player-slots .unit-slot:nth-child(${idx + 1})`, `-${u.upkeep} EN`, "fx-shd");
    } else if (state.player.gold >= u.upkeep) {
      state.player.gold -= u.upkeep;
      spawnFx(`#player-slots .unit-slot:nth-child(${idx + 1})`, `-${u.upkeep} ORO`, "fx-gold");
    } else {
      spawnFx(`#player-slots .unit-slot:nth-child(${idx + 1})`, "SIN PAGO", "fx-dmg");
      state.player.board[idx] = null;
    }
  });

  state.player.gold = 0;
  state.player.board.forEach((u) => {
    if (u) u.ready = true;
  });

  drawCards(5);
  rollEnemyIntention();
  setHint("Tu turno: juega cartas, compra del Mercado Vivo o ataca.");
  render();
  startTurnTimer();
  window.FTUE?.onCombatTurnStart(state);
  window.FTUE?.onCardDrawnOrHandCheck(state);
  if (autoBattleEnabled) setTimeout(runAutoBattleTurn, 380);
}

function setHint(text) {
  document.getElementById("combat-hint").textContent = text;
}

function triggerHeroPassiveFx(label, fxClass = "fx-shd") {
  const panel = document.getElementById("player-hero-panel");
  const pill = document.getElementById("player-passive-pill");
  [panel, pill].forEach((el) => {
    if (!el) return;
    el.classList.remove("hero-passive-pulse");
    void el.offsetWidth;
    el.classList.add("hero-passive-pulse");
  });
  spawnFx("#player-hero-panel", label, fxClass);
}

function render() {
  const activeFaction = state.isPvp ? (state.player.factionId || "forja") : runState.faction;
  const heroInfo = FACTION_HEROES[activeFaction];
  const playerAvatarImg = document.querySelector("#player-avatar-btn img");
  if (playerAvatarImg && heroInfo) {
    playerAvatarImg.src = `assets/heroes/hero_${activeFaction}_${heroInfo.id}.png`;
    playerAvatarImg.alt = heroInfo.name;
  }
  const passivePill = document.getElementById("player-passive-pill");
  if (passivePill && heroInfo) {
    passivePill.textContent = `PASIVA: ${heroInfo.passive}`;
    passivePill.title = `${heroInfo.name} - ${heroInfo.passive}`;
  }
  document.getElementById("enemy-name").textContent = state.enemy.name;
  document.getElementById("enemy-avatar-img").src = state.enemy.avatar;
  document.getElementById("enemy-hp").textContent = `${state.enemy.hp}/${state.enemy.maxHp}`;
  document.getElementById("enemy-armor").textContent = `${state.enemy.armor}`;
  document.getElementById("enemy-intention").textContent = state.isPvp
    ? (state.isPlayerTurn ? "ESPERANDO TU JUGADA" : "TURNO DEL RIVAL")
    : `INTENCION: ${state.enemy.intention.label}`;
  document.getElementById("enemy-deck-count").textContent = `${state.enemy.deckCount}`;
  applyCardBackLayers(
    document.getElementById("enemy-deck-img"),
    document.getElementById("enemy-deck-top-img"),
    state.enemy.cardBack
  );
  const floorLabel = runState.mapNav
    ? `PISO ${Math.max(1, runState.mapNav.currentFloor)} / ${runState.mapNav.map.floorsCount}${runState.currentEncounter?.isElite ? " (ELITE)" : runState.currentEncounter?.isBoss ? " (JEFE)" : ""}`
    : `COMBATE ${runState.stageIndex + 1} / ${STAGES.length}`;
  document.getElementById("stage-indicator").textContent = state.isPvp
    ? "DUELO VS ONLINE"
    : floorLabel;

  const autoBtn = document.getElementById("auto-battle-btn");
  if (autoBtn) autoBtn.classList.toggle("hidden", Boolean(state.isPvp));
  const endTurnBtn = document.getElementById("end-turn-btn");
  if (endTurnBtn) {
    endTurnBtn.disabled = !state.isPlayerTurn || state.gameOver || Boolean(state.reactionWindow);
  }

  // Enemy Face-Down Hand
  const enemyHandEl = document.getElementById("enemy-hand");
  enemyHandEl.innerHTML = "";
  for (let i = 0; i < state.enemy.handCount; i++) {
    const back = document.createElement("div");
    back.className = "enemy-card-back";
    back.innerHTML = renderCardBack2LayerMarkup(state.enemy.cardBack, "Carta Rival");
    enemyHandEl.appendChild(back);
  }

  const enemyHeroPanel = document.getElementById("enemy-hero-panel");
  const enemyHasGuard = state.enemy.board.some((u) => u && u.guard);
  if (state.selectedUnitIndex !== null && !enemyHasGuard) {
    enemyHeroPanel.classList.add("targetable");
  } else {
    enemyHeroPanel.classList.remove("targetable");
  }

  document.getElementById("player-hp").textContent = `${state.player.hp}/${state.player.maxHp}`;
  document.getElementById("player-armor").textContent = `${state.player.armor}`;

  document.getElementById("player-energy").textContent = `${state.player.energy}/${state.player.maxEnergy}`;
  const orbsEl = document.getElementById("energy-orbs");
  orbsEl.innerHTML = "";
  for (let i = 0; i < state.player.maxEnergy; i++) {
    const orb = document.createElement("span");
    orb.className = `energy-orb ${i < state.player.energy ? "" : "spent"}`;
    orbsEl.appendChild(orb);
  }
  document.getElementById("player-gold-val").textContent = `${state.player.gold}`;
  document.getElementById("deck-count").textContent = `${state.player.deck.length}`;
  document.getElementById("discard-count").textContent = `${state.player.discard.length}`;

  // Relics Zone (2 slots)
  const relicsEl = document.getElementById("player-relics");
  if (relicsEl) {
    relicsEl.innerHTML = "";
    (state.player.relics || [null, null]).forEach((relic) => {
      const rSlot = document.createElement("div");
      rSlot.className = `relic-slot ${relic ? "filled" : ""}`;
      if (!relic) {
        rSlot.textContent = "RELIQUIA";
      } else {
        rSlot.title = `${relic.name} (${relic.duration}T): ${relic.desc}`;
        rSlot.innerHTML = `
          <img src="${relic.art}" alt="${relic.name}" />
          <span class="relic-turns-badge">${relic.duration}</span>
        `;
      }
      relicsEl.appendChild(rSlot);
    });
  }

  // Physical Discard Pile Preview
  const discardPreview = document.getElementById("discard-preview");
  if (state.player.discard.length === 0) {
    discardPreview.innerHTML = "VACIO";
  } else {
    const topDiscard = state.player.discard[state.player.discard.length - 1];
    discardPreview.innerHTML = `<img src="${topDiscard.art}" alt="${topDiscard.name}" title="Ultimo descarte: ${topDiscard.name}" />`;
  }

  document.getElementById("market-count").textContent = `Mazo: ${state.marketDeck.length}`;
  document.getElementById("turn-indicator").textContent = state.isPlayerTurn
    ? `TURNO ${state.turn} - TU TURNO`
    : `TURNO ${state.turn} - TURNO RIVAL`;

  // Market Row (Vibrant Color-Coded Mini-Cards)
  const marketRowEl = document.getElementById("market-row");
  marketRowEl.innerHTML = "";
  let visibleMarket = state.marketRow.map((card, idx) => ({ card, idx }));
  if (marketFilter !== "Todos") {
    visibleMarket = visibleMarket.filter((item) => item.card.type === marketFilter);
  }
  if (marketSort === "asc") {
    visibleMarket.sort((a, b) => a.card.goldCost - b.card.goldCost);
  } else if (marketSort === "desc") {
    visibleMarket.sort((a, b) => b.card.goldCost - a.card.goldCost);
  }

  if (visibleMarket.length === 0) {
    marketRowEl.innerHTML = `<div class="market-empty">No hay cartas de tipo "${marketFilter}" en el mercado.</div>`;
  } else {
    visibleMarket.forEach(({ card, idx }) => {
      const price = getEffectiveGoldCost(card);
      const canAfford = state.isPlayerTurn && state.player.gold >= price;
      const el = document.createElement("div");
      el.className = `market-card type-${card.type} ${canAfford ? "" : "disabled"}`;
      el.title = card.desc;
      el.innerHTML = `
        <div class="market-art">
          <img src="${card.art}" alt="${card.name}" />
        </div>
        <div class="market-info">
          <div class="market-card-top">
            <span class="market-name">${card.name}</span>
            <span class="gold-cost-pill"><img src="assets/ui/icon_coin.png" alt="Oro" />${price}</span>
          </div>
          <div class="market-meta-row">
            <span class="market-type-tag">${card.type}</span>
            <span class="market-summary">${card.shortTag}</span>
          </div>
        </div>
      `;
      if (canAfford) {
        el.addEventListener("click", () => buyMarketCard(idx));
      }
      marketRowEl.appendChild(el);
    });
  }

  // Enemy Slots (Physical Units Standing on Glowing Pedestals)
  const enemySlotsEl = document.getElementById("enemy-slots");
  enemySlotsEl.innerHTML = "";
  state.enemy.board.forEach((unit, idx) => {
    const slot = document.createElement("div");
    slot.className = "unit-slot";
    if (!unit) {
      slot.textContent = "VACIO";
    } else {
      const targetable = state.selectedUnitIndex !== null;
      const isPvpAttacking = state.isPvp && state.pvpAttackingEnemySlot === idx;
      const token = document.createElement("div");
      token.className = `unit-token enemy-unit ${targetable ? "targetable" : ""} ${unit.stunned ? "stunned" : ""} ${isPvpAttacking ? "pvp-attacking" : ""}`;
      const enemyBadges = [];
      if (unit.guard) enemyBadges.push('<span class="badge-icon" title="GUARDIA"><img src="assets/ui/badge_guard.png" alt="Guardia" /></span>');
      if (unit.stunned) enemyBadges.push('<span class="side-badge stunned" title="ATURDIDA: No ataca ni protege">ATURDIDA</span>');
      token.innerHTML = `
        <span class="unit-token-name">${unit.name}</span>
        ${enemyBadges.length ? `<div class="card-side-badges">${enemyBadges.join("")}</div>` : ""}
        <img class="unit-token-art" src="${unit.art}" alt="${unit.name}" />
        <div class="unit-pedestal"></div>
        <div class="unit-medallion atk-medallion"><img src="assets/ui/stat_atk.png" alt="ATK" /><span>${unit.atk}</span></div>
        <div class="unit-medallion hp-medallion"><img src="assets/ui/stat_hp.png" alt="HP" /><span>${unit.hp}</span></div>
      `;
      if (targetable) {
        token.addEventListener("click", () => attackEnemyUnit(idx));
      }
      slot.appendChild(token);
    }
    enemySlotsEl.appendChild(slot);
  });

  // Player Slots (Physical Units Standing on Glowing Pedestals + Manual Blocker Selection)
  const playerSlotsEl = document.getElementById("player-slots");
  playerSlotsEl.innerHTML = "";
  const selectedUnit = state.selectedUnitIndex !== null ? state.player.board[state.selectedUnitIndex] : null;
  const isCuteHealMode = Boolean(selectedUnit && selectedUnit.cute && !state.reactionWindow && !state.pendingEquip);
  document.getElementById("player-hero-panel")?.classList.toggle("cute-heal-target", isCuteHealMode);

  state.player.board.forEach((unit, idx) => {
    const slot = document.createElement("div");
    slot.className = "unit-slot";
    if (!unit) {
      slot.textContent = "VACIO";
    } else {
      const isSelected = state.selectedUnitIndex === idx;
      const isBlockerPick = Boolean(state.reactionWindow);
      const isEquipPick = Boolean(state.pendingEquip);
      const isCuteTarget = isCuteHealMode && idx !== state.selectedUnitIndex;
      const isChosenBlocker = isBlockerPick && state.reactionWindow.blockerIdx === idx;
      const token = document.createElement("div");
      token.className = `unit-token ${unit.ready && !isBlockerPick ? "ready" : ""} ${isSelected || isChosenBlocker ? "selected" : ""} ${isBlockerPick ? "blocker-candidate" : ""} ${isEquipPick ? "equip-target" : ""} ${isCuteTarget ? "cute-heal-target" : ""}`;
      const badges = [];
      if (unit.guard) badges.push('<span class="badge-icon" title="GUARDIA"><img src="assets/ui/badge_guard.png" alt="Guardia" /></span>');
      if (unit.stealth) badges.push('<span class="badge-icon" title="ESCABULLIRSE"><img src="assets/ui/badge_stealth.png" alt="Escabullirse" /></span>');
      if (unit.pierce) badges.push('<span class="badge-icon" title="PERFORAR"><img src="assets/ui/badge_pierce.png" alt="Perforar" /></span>');
      if (unit.cute) badges.push('<span class="badge-icon" title="CUTE"><img src="assets/ui/badge_cute.png" alt="Cute" /></span>');
      if (unit.onDeath) badges.push('<span class="badge-icon" title="ULTIMO ALIENTO"><img src="assets/ui/badge_ondeath.png" alt="Al morir" /></span>');
      if (unit.upkeep) badges.push('<span class="badge-icon" title="MERCENARIO: 1 EN/Oro por turno"><img src="assets/ui/badge_upkeep.png" alt="Mercenario" /></span>');
      if (isChosenBlocker) badges.push('<span class="badge-icon active-block" title="BLOQUEANDO"><img src="assets/ui/badge_guard.png" alt="Bloquea" /></span>');
      else if (unit.ready && !isBlockerPick) badges.push('<span class="badge-icon" title="LISTA PARA ATACAR"><img src="assets/ui/badge_haste.png" alt="Lista" /></span>');
      const equipsHtml = (unit.equips && unit.equips.length)
        ? `<div class="unit-equips-row">${unit.equips.map((eq) => `<span class="unit-equip-tag">${eq}</span>`).join("")}</div>`
        : "";
      token.innerHTML = `
        <span class="unit-token-name">${unit.name}</span>
        ${badges.length ? `<div class="card-side-badges">${badges.join("")}</div>` : ""}
        <img class="unit-token-art" src="${unit.art}" alt="${unit.name}" />
        ${equipsHtml}
        <div class="unit-pedestal"></div>
        <div class="unit-medallion atk-medallion"><img src="assets/ui/stat_atk.png" alt="ATK" /><span>${unit.atk}</span></div>
        <div class="unit-medallion hp-medallion"><img src="assets/ui/stat_hp.png" alt="HP" /><span>${unit.hp}</span></div>
      `;
      if (isEquipPick) {
        token.addEventListener("click", () => {
          applyEquipToUnit(idx, state.pendingEquip.card, state.pendingEquip.handIndex);
        });
      } else if (isCuteTarget) {
        token.addEventListener("click", () => healAllyWithCute(idx));
      } else if (isBlockerPick) {
        token.addEventListener("click", () => {
          state.reactionWindow.blockerIdx = idx;
          if (state.isPvp) {
            window.PvpEngine?.sendAction("REACTION_BLOCK", { blockerIdx: idx });
          }
          render();
        });
      } else if (unit.ready && state.isPlayerTurn) {
        token.addEventListener("click", () => selectPlayerUnit(idx));
      }
      slot.appendChild(token);
    }
    playerSlotsEl.appendChild(slot);
  });

  // Player Hand (3D Parallax + Overflowing Side Badges + Reaction Glow)
  const handEl = document.getElementById("player-hand");
  handEl.innerHTML = "";
  state.player.hand.forEach((card, idx) => {
    const inReaction = Boolean(state.reactionWindow);
    const playable =
      state.player.energy >= card.cost &&
      (state.isPlayerTurn || (inReaction && card.reaction));
    const el = document.createElement("div");
    el.className = `hand-card type-${card.type} faction-${card.faction || "neutral"} rarity-${card.rarity || "comun"} ${playable ? "" : "unplayable"} ${inReaction && playable ? "reaction-ready" : ""} ${card.ephemeral ? "ephemeral" : ""} ${card.justDrawn ? "deal-in" : ""}`;
    if (card.justDrawn) {
      el.style.animationDelay = `${idx * 45}ms`;
      card.justDrawn = false;
    }
    const { iconsHtml } = buildCardStatIcons(card);
    el.innerHTML = `
      <div class="card-type-crest" title="Tipo: ${card.type}"><img src="${getCardTypeIcon(card.type)}" alt="${card.type}" /></div>
      ${buildCardBadges(card)}
      <div class="card-banner card-banner-cost-only">
        <span class="energy-cost"><span>${card.cost}</span></span>
      </div>
      <div class="card-art-wrap">
        <img src="${card.art}" alt="${card.name}" />
      </div>
      ${iconsHtml}
    `;
    attachCardParallax(el);
    attachCardHoverInspector(el, card);
    if (playable) {
      el.addEventListener("click", () => playCard(idx));
    }
    handEl.appendChild(el);
  });
}

document.querySelectorAll("#market-filters .filter-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll("#market-filters .filter-btn").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    marketFilter = btn.dataset.filter;
    render();
  });
});

document.getElementById("market-sort-btn")?.addEventListener("click", (e) => {
  if (marketSort === "none") {
    marketSort = "asc";
    e.target.textContent = "Orden: Menor Costo";
  } else if (marketSort === "asc") {
    marketSort = "desc";
    e.target.textContent = "Orden: Mayor Costo";
  } else {
    marketSort = "none";
    e.target.textContent = "Orden: Normal";
  }
  render();
});

document.getElementById("enemy-hero-panel")?.addEventListener("click", attackEnemyHero);
document.getElementById("end-turn-btn")?.addEventListener("click", endTurn);
document.getElementById("restart-btn")?.addEventListener("click", () => {
  if (state?.isPvp && window.PvpEngine) {
    window.PvpEngine.returnToLobby();
    return;
  }
  startNewRun();
});

// ================= TURN TIMER (35s) =================
const TURN_DURATION = 35;
let turnTimeLeft = TURN_DURATION;
let turnTimerHandle = null;

function updateTimerUI() {
  const box = document.getElementById("turn-timer-box");
  const fill = document.getElementById("turn-timer-fill");
  const text = document.getElementById("turn-timer-text");
  if (!box || !fill || !text) return;
  const pct = Math.max(0, (turnTimeLeft / TURN_DURATION) * 100);
  fill.style.width = `${pct}%`;
  text.textContent = `${Math.ceil(turnTimeLeft)}s`;
  box.classList.toggle("urgent", turnTimeLeft <= 10);
  box.classList.toggle("critical", turnTimeLeft <= 5 && turnTimeLeft > 0);
  const active = Boolean(turnTimerHandle) && !window.FTUE?.isBlockingTimer() && Boolean(state?.isPlayerTurn) && !state?.gameOver;
  window.VFX?.setTimerUrgency(turnTimeLeft, active);
}

function stopTurnTimer() {
  if (turnTimerHandle) {
    clearInterval(turnTimerHandle);
    turnTimerHandle = null;
  }
  const box = document.getElementById("turn-timer-box");
  box?.classList.remove("urgent", "critical");
  window.VFX?.setTimerUrgency(TURN_DURATION, false);
}

function startTurnTimer() {
  stopTurnTimer();
  const titleVisible = !document.getElementById("title-screen")?.classList.contains("hidden");
  const boosterVisible = !document.getElementById("booster-modal")?.classList.contains("hidden");
  if (titleVisible || boosterVisible || state?.gameOver || !state?.isPlayerTurn) return;

  turnTimeLeft = TURN_DURATION;
  updateTimerUI();
  turnTimerHandle = setInterval(() => {
    const modalOpen = !document.getElementById("booster-modal")?.classList.contains("hidden")
      || !document.getElementById("game-over-modal")?.classList.contains("hidden");
    if (modalOpen || state?.gameOver || !state?.isPlayerTurn) {
      stopTurnTimer();
      return;
    }
    if (window.FTUE?.isBlockingTimer()) return;
    turnTimeLeft = Math.max(0, turnTimeLeft - 0.25);
    updateTimerUI();
    if (turnTimeLeft <= 0) {
      stopTurnTimer();
      setHint("Tiempo agotado! Turno finalizado automaticamente.");
      endTurn();
    }
  }, 250);
}

// ================= PORTRAIT FRAME CUSTOMIZER =================
const PORTRAIT_FRAMES = [
  { id: "gold", label: "Oro Real", img: "assets/ui/portrait_frame_gold.png" },
  { id: "iron", label: "Hierro Forjado", img: "assets/ui/portrait_frame_iron.png" },
  { id: "crystal", label: "Cristal Arcano", img: "assets/ui/portrait_frame_crystal.png" },
  { id: "obsidian", label: "Obsidiana Titan", img: "assets/ui/portrait_frame_obsidian.png" }
];
let currentPlayerFrame = "gold";

function initFramePicker() {
  const popover = document.getElementById("frame-picker-popover");
  const avatarBtn = document.getElementById("player-avatar-btn");
  const frameImg = document.getElementById("player-frame-img");
  if (!popover || !avatarBtn || !frameImg) return;

  popover.innerHTML = "";
  PORTRAIT_FRAMES.forEach((f) => {
    const opt = document.createElement("button");
    opt.className = `picker-option ${f.id === currentPlayerFrame ? "active" : ""}`;
    opt.title = f.label;
    opt.innerHTML = `<img src="${f.img}" alt="${f.label}" />`;
    opt.addEventListener("click", (e) => {
      e.stopPropagation();
      currentPlayerFrame = f.id;
      frameImg.src = f.img;
      popover.querySelectorAll(".picker-option").forEach((el) => el.classList.remove("active"));
      opt.classList.add("active");
      popover.classList.add("hidden");
    });
    popover.appendChild(opt);
  });

  avatarBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    document.getElementById("emote-picker-popover")?.classList.add("hidden");
    popover.classList.toggle("hidden");
  });
}

// ================= COMFYUI STICKER EMOTES & SPEECH BUBBLES =================
const EMOTES = [
  { id: "hello", img: "assets/emotes/emote_hello.png", text: "Buen duelo!", reply: ["rage", "Veamos que tienes!"] },
  { id: "gg", img: "assets/emotes/emote_gg.png", text: "Bien jugado!", reply: ["shield", "Nada mal!"] },
  { id: "wow", img: "assets/emotes/emote_wow.png", text: "Menudo golpe!", reply: ["skull", "Y eso es solo el principio!"] },
  { id: "rage", img: "assets/emotes/emote_rage.png", text: "A por todas!", reply: ["rage", "Ven si te atreves!"] },
  { id: "shield", img: "assets/emotes/emote_shield.png", text: "No pasaras!", reply: ["wow", "Buena defensa!"] },
  { id: "skull", img: "assets/emotes/emote_skull.png", text: "Jaque mate!", reply: ["skull", "No te confies!"] }
];
const bubbleTimers = { player: null, enemy: null };

function showSpeechBubble(who, emoteId, customText = null) {
  const el = document.getElementById(`${who}-bubble`);
  const emote = EMOTES.find((e) => e.id === emoteId) || EMOTES[0];
  if (!el) return;
  el.innerHTML = `<img src="${emote.img}" alt="" /><span>${customText || emote.text}</span>`;
  el.classList.remove("hidden");
  if (bubbleTimers[who]) clearTimeout(bubbleTimers[who]);
  bubbleTimers[who] = setTimeout(() => {
    el.classList.add("hidden");
  }, 2600);
}

function initEmotePicker() {
  const popover = document.getElementById("emote-picker-popover");
  const trigger = document.getElementById("emote-trigger-btn");
  if (!popover || !trigger) return;

  popover.innerHTML = "";
  EMOTES.forEach((em) => {
    const opt = document.createElement("button");
    opt.className = "picker-option";
    opt.title = em.text;
    opt.innerHTML = `<img src="${em.img}" alt="${em.text}" />`;
    opt.addEventListener("click", (e) => {
      e.stopPropagation();
      popover.classList.add("hidden");
      showSpeechBubble("player", em.id, em.text);
      if (em.reply) {
        setTimeout(() => showSpeechBubble("enemy", em.reply[0], em.reply[1]), 650);
      }
    });
    popover.appendChild(opt);
  });

  trigger.addEventListener("click", (e) => {
    e.stopPropagation();
    document.getElementById("frame-picker-popover")?.classList.add("hidden");
    popover.classList.toggle("hidden");
  });

  document.addEventListener("click", () => {
    popover.classList.add("hidden");
    document.getElementById("frame-picker-popover")?.classList.add("hidden");
  });
}

// ================= TITLE SCREEN & PARTICLE EFFECTS =================
let titleAnimId = null;

function initTitleParticles() {
  const canvas = document.getElementById("title-particles");
  const screen = document.getElementById("title-screen");
  if (!canvas || !screen) return;
  const ctx = canvas.getContext("2d");

  const resize = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };
  resize();
  window.addEventListener("resize", resize);

  const particles = Array.from({ length: 65 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    r: 1.5 + Math.random() * 3.5,
    vx: (Math.random() - 0.5) * 0.6,
    vy: -0.4 - Math.random() * 1.1,
    alpha: 0.3 + Math.random() * 0.7,
    color: Math.random() < 0.55 ? "#ffd23f" : "#00d4ff"
  }));

  function tick() {
    if (screen.classList.contains("hidden")) {
      titleAnimId = null;
      return;
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      if (p.y < -10) {
        p.y = canvas.height + 10;
        p.x = Math.random() * canvas.width;
      }
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
    titleAnimId = requestAnimationFrame(tick);
  }
  tick();
}

initFramePicker();
initEmotePicker();
initTitleParticles();

document.getElementById("play-btn")?.addEventListener("click", () => {
  document.getElementById("title-screen")?.classList.add("hidden");
  renderDeckSelector();
  renderCardBackSelector();
  document.getElementById("deck-select-screen")?.classList.remove("hidden");
  window.FTUE?.onDeckSelectOpen();
});

document.getElementById("deck-select-back-btn")?.addEventListener("click", () => {
  document.getElementById("deck-select-screen")?.classList.add("hidden");
  document.getElementById("title-screen")?.classList.remove("hidden");
});

document.getElementById("deck-start-run-btn")?.addEventListener("click", () => {
  document.getElementById("deck-select-screen")?.classList.add("hidden");
  startNewRun();
});


// ================= DUNGEON REST SCREEN & INVENTORY SIDELINE =================
let restSparksId = null;

function initRestSparks() {
  const canvas = document.getElementById("rest-sparks");
  const screen = document.getElementById("rest-screen");
  if (!canvas || !screen) return;
  const ctx = canvas.getContext("2d");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const sparks = Array.from({ length: 42 }, () => ({
    x: canvas.width * 0.44 + Math.random() * (canvas.width * 0.12),
    y: canvas.height * 0.72 + Math.random() * 60,
    r: 1.4 + Math.random() * 2.8,
    vx: (Math.random() - 0.5) * 0.7,
    vy: -0.7 - Math.random() * 1.4,
    alpha: 0.4 + Math.random() * 0.6
  }));

  function tick() {
    if (screen.classList.contains("hidden")) {
      restSparksId = null;
      return;
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const s of sparks) {
      s.x += s.vx + Math.sin(s.y * 0.03) * 0.35;
      s.y += s.vy;
      s.alpha -= 0.004;
      if (s.y < canvas.height * 0.25 || s.alpha <= 0) {
        s.x = canvas.width * 0.45 + Math.random() * (canvas.width * 0.1);
        s.y = canvas.height * 0.76;
        s.alpha = 0.6 + Math.random() * 0.4;
      }
      ctx.globalAlpha = Math.max(0, s.alpha);
      ctx.fillStyle = Math.random() < 0.5 ? "#ffd23f" : "#ff7b00";
      ctx.shadowColor = "#ff7b00";
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
    restSparksId = requestAnimationFrame(tick);
  }
  if (!restSparksId) tick();
}

function openRestScreen(isInitial = false) {
  stopTurnTimer();
  const screen = document.getElementById("rest-screen");
  const healBtn = document.getElementById("rest-heal-btn");
  const goldBtn = document.getElementById("rest-gold-btn");
  const nextLabel = document.getElementById("rest-next-stage");
  const hpVal = document.getElementById("rest-hp-val");

  hpVal.textContent = `${runState.playerHp}/${runState.playerMaxHp}`;
  if (runState.mapNav) {
    nextLabel.textContent = "VOLVER AL MAPA";
  } else {
    const nextStage = isInitial ? STAGES[0] : STAGES[runState.stageIndex + 1];
    nextLabel.textContent = nextStage ? `SIGUIENTE: ${nextStage.name}` : "SIGUIENTE COMBATE";
  }

  healBtn.disabled = false;
  goldBtn.disabled = false;
  healBtn.classList.remove("chosen");
  goldBtn.classList.remove("chosen");

  healBtn.onclick = () => {
    window.SFX?.play("heal_buff");
    runState.playerHp = Math.min(runState.playerMaxHp, runState.playerHp + 12);
    hpVal.textContent = `${runState.playerHp}/${runState.playerMaxHp}`;
    healBtn.classList.add("chosen");
    healBtn.disabled = true;
    goldBtn.disabled = true;
  };

  goldBtn.onclick = () => {
    window.SFX?.play("gold_coin");
    runState.nextStageBonusGold = 2;
    goldBtn.classList.add("chosen");
    healBtn.disabled = true;
    goldBtn.disabled = true;
  };

  document.getElementById("rest-continue-btn").onclick = () => {
    screen.classList.add("hidden");
    if (runState.mapNav) {
      openMapScreen(false);
    } else if (isInitial) {
      openBoosterModal(true);
    } else {
      startStage(runState.stageIndex + 1);
    }
  };

  screen.classList.remove("hidden");
  initRestSparks();
  window.FTUE?.onRestOpen();
}

function renderInventoryModal() {
  const sidelineEl = document.getElementById("sideline-slots");
  const activeEl = document.getElementById("inventory-deck-cards");
  const sideCount = document.getElementById("sideline-count");
  const actCount = document.getElementById("active-deck-count");
  if (!sidelineEl || !activeEl) return;

  sideCount.textContent = `${runState.sidelineDeck.length}/${runState.sidelineMaxSlots}`;
  actCount.textContent = `${runState.permanentDeck.length}`;

  sidelineEl.innerHTML = "";
  for (let i = 0; i < runState.sidelineMaxSlots; i++) {
    const cid = runState.sidelineDeck[i];
    if (!cid) {
      const empty = document.createElement("div");
      empty.className = "sideline-empty-slot";
      empty.textContent = "SLOT LIBRE";
      sidelineEl.appendChild(empty);
    } else {
      const stack = document.createElement("div");
      stack.className = "inventory-card-stack";
      const cardEl = createVisualCardEl(CARD_CATALOG[cid]);
      cardEl.title = "Clic para devolver al Mazo Activo";
      cardEl.addEventListener("click", () => {
        runState.sidelineDeck.splice(i, 1);
        runState.permanentDeck.push(cid);
        renderInventoryModal();
      });
      const qtyLabel = document.createElement("span");
      qtyLabel.className = "inv-qty-pill";
      qtyLabel.textContent = "x1";
      stack.appendChild(cardEl);
      stack.appendChild(qtyLabel);
      sidelineEl.appendChild(stack);
    }
  }

  activeEl.innerHTML = "";
  const counts = {};
  runState.permanentDeck.forEach((cid) => {
    counts[cid] = (counts[cid] || 0) + 1;
  });

  Object.entries(counts).forEach(([cid, qty]) => {
    const stack = document.createElement("div");
    stack.className = "inventory-card-stack";
    const cardEl = createVisualCardEl(CARD_CATALOG[cid]);
    cardEl.title = `${CARD_CATALOG[cid].desc} (Clic para dejar 1 copia de lado)`;
    cardEl.addEventListener("click", () => {
      if (runState.sidelineDeck.length >= runState.sidelineMaxSlots) return;
      if (runState.permanentDeck.length <= 6) return;
      const removeIdx = runState.permanentDeck.indexOf(cid);
      if (removeIdx !== -1) {
        runState.permanentDeck.splice(removeIdx, 1);
        runState.sidelineDeck.push(cid);
        renderInventoryModal();
      }
    });
    const qtyLabel = document.createElement("span");
    qtyLabel.className = "inv-qty-pill";
    qtyLabel.textContent = `x${qty}`;
    stack.appendChild(cardEl);
    stack.appendChild(qtyLabel);
    activeEl.appendChild(stack);
  });
}

document.getElementById("rest-bag-btn")?.addEventListener("click", () => {
  renderInventoryModal();
  document.getElementById("inventory-modal")?.classList.remove("hidden");
});

document.getElementById("inventory-close-btn")?.addEventListener("click", () => {
  document.getElementById("inventory-modal")?.classList.add("hidden");
});

(function initSfxMuteButton() {
  const btn = document.getElementById("sfx-mute-btn");
  if (!btn || !window.SFX) return;

  const syncLabel = () => {
    const muted = window.SFX.isMuted();
    btn.textContent = muted ? "SFX: OFF" : "SFX: ON";
    btn.classList.toggle("muted", muted);
  };

  btn.addEventListener("click", () => {
    window.SFX.unlock();
    window.SFX.toggleMute();
    syncLabel();
  });

  syncLabel();
})();

renderDeckSelector();
renderCardBackSelector();


// ================= SMART TACTICAL AUTO-BATTLE AI =================
let autoBattleEnabled = false;
let autoBattleBusy = false;

function isCombatActiveForAuto() {
  const titleOpen = !document.getElementById("title-screen")?.classList.contains("hidden");
  const restOpen = !document.getElementById("rest-screen")?.classList.contains("hidden");
  const boosterOpen = !document.getElementById("booster-modal")?.classList.contains("hidden");
  const gameOverOpen = !document.getElementById("game-over-modal")?.classList.contains("hidden");
  return autoBattleEnabled && !titleOpen && !restOpen && !boosterOpen && !gameOverOpen && !state?.gameOver && state?.isPlayerTurn;
}

function getIncomingEnemyThreat() {
  const unitAtk = state.enemy.board.reduce((s, u) => s + (u ? u.atk : 0), 0);
  const heroAtk = state.enemy.intention?.type === "attack" ? state.enemy.intention.amount : 0;
  return unitAtk + heroAtk;
}

function scoreHandCardForAuto(card) {
  const enemyEhp = state.enemy.hp + state.enemy.armor;
  const enemyUnits = state.enemy.board.filter(Boolean);
  const playerUnits = state.player.board.filter(Boolean);
  const hasEmptySlot = state.player.board.some((u) => u === null);
  const hpDeficit = state.player.maxHp - state.player.hp;
  const threat = getIncomingEnemyThreat();
  const needDefense = threat > state.player.armor + 3 || state.player.hp <= 15;

  if (card.type === "Unidad" && !hasEmptySlot) return -999;

  // 1. Free / resource-generating cards first to unlock full options
  if (card.id === "sobrecarga" || card.id === "corona" || card.id === "botin" || card.id === "moneda") {
    return 140;
  }

  // 2. Lethal direct damage check
  const directDmg = card.id === "runica" ? 11 : card.id === "plasma" ? 8 : card.id === "drenaje" ? 5 : card.id === "golpe" ? 4 : card.id === "martillo" ? 4 : 0;
  if (directDmg > 0 && directDmg >= enemyEhp) return 500;

  // 3. Don't waste pure healing at full HP
  if (card.id === "pocion") {
    if (hpDeficit <= 2) return -40;
    return hpDeficit >= 7 ? 95 : 45;
  }

  // 4. Buffs are much better when we already have units on board
  if (card.id === "furia" || card.id === "yunque") {
    if (playerUnits.length === 0) return -60;
    return 55 + playerUnits.length * 30;
  }

  // 5. Units (deploy before buffs; Mercenario free 0-cost is great if we can afford upkeep)
  if (card.type === "Unidad") {
    let score = (card.atk || 0) * 14 + (card.hp || 0) * 6;
    if (card.haste) score += 26;
    if (card.stealth) score += 22;
    if (card.guard) score += needDefense ? 48 : 14;
    if (card.id === "mercader" || card.id === "cristalomante") score += 24;
    if (card.upkeep && playerUnits.filter((u) => u.upkeep).length >= 2) score -= 45;
    return score - card.cost * 8;
  }

  // 6. AoE spells scale with enemy board presence
  if (card.id === "martillo" || card.id === "rayo") {
    return 35 + enemyUnits.length * 38;
  }

  // 7. Defensive tactics
  if (card.id === "solar" || card.id === "hielo" || card.id === "escudo") {
    return (needDefense ? 90 : 28) - card.cost * 6;
  }

  // 8. General spells/tactics
  let score = 45;
  if (card.id === "drenaje") score += hpDeficit >= 4 ? 42 : 20;
  if (card.id === "plasma") score += 52;
  if (card.id === "runica") score += 46;
  if (card.id === "cofre" || card.id === "lingote") score += 38;
  return score - card.cost * 5;
}

function scoreMarketCardForAuto(card) {
  const lowHp = state.player.hp <= 18;
  let score = 30;
  if (card.id === "corona" || card.id === "sobrecarga" || card.id === "botin") score = 110;
  else if (card.id === "drako" || card.id === "relampago" || card.id === "plasma") score = 88;
  else if (card.id === "drenaje" || card.id === "hielo" || card.id === "pocion") score = lowHp ? 96 : 62;
  else if (card.id === "martillo" || card.id === "rayo" || card.id === "runica") score = 78;
  else if (card.type === "Unidad") score = (card.atk || 2) * 10 + (card.hp || 2) * 5;
  return score;
}

function pickBestAutoAttack() {
  const readyUnits = state.player.board
    .map((u, idx) => ({ u, idx }))
    .filter((x) => x.u && x.u.ready);
  if (readyUnits.length === 0) return null;

  const enemyGuards = state.enemy.board
    .map((u, idx) => ({ u, idx }))
    .filter((x) => x.u && x.u.guard);
  const enemyAll = state.enemy.board
    .map((u, idx) => ({ u, idx }))
    .filter((x) => x.u);

  const enemyEhp = state.enemy.hp + state.enemy.armor;
  const unblockedDmg = readyUnits
    .filter((x) => x.u.stealth || enemyGuards.length === 0)
    .reduce((s, x) => s + x.u.atk, 0);

  // Lethal check on Enemy Hero
  if (unblockedDmg >= enemyEhp) {
    const hitter = readyUnits.find((x) => x.u.stealth || enemyGuards.length === 0);
    if (hitter) return { attackerIdx: hitter.idx, targetType: "hero" };
  }

  for (const { u, idx } of readyUnits) {
    // Stealth units bypass Guard and hit hero directly!
    if (u.stealth) {
      return { attackerIdx: idx, targetType: "hero" };
    }
    if (enemyGuards.length > 0) {
      // Pick the guard we can kill or weaken best
      enemyGuards.sort((a, b) => a.u.hp - b.u.hp);
      return { attackerIdx: idx, targetType: "unit", targetIdx: enemyGuards[0].idx };
    }
    // Favorable trade: kills enemy unit and survives, or kills high-ATK threat (>=4 ATK)
    const favorable = enemyAll.find(
      (e) => u.atk >= e.u.hp && (e.u.atk < u.hp || e.u.atk >= 4)
    );
    if (favorable) {
      return { attackerIdx: idx, targetType: "unit", targetIdx: favorable.idx };
    }
    return { attackerIdx: idx, targetType: "hero" };
  }
  return null;
}

function runAutoBattleTurn() {
  if (autoBattleBusy || !isCombatActiveForAuto()) return;
  autoBattleBusy = true;

  function step() {
    if (!isCombatActiveForAuto()) {
      autoBattleBusy = false;
      return;
    }

    // 1. Best playable card from hand
    let bestCardIdx = -1;
    let bestScore = -10; // Don't play negative-value cards like wasted heal
    state.player.hand.forEach((c, idx) => {
      if (state.player.energy < c.cost) return;
      const sc = scoreHandCardForAuto(c);
      if (sc > bestScore) {
        bestScore = sc;
        bestCardIdx = idx;
      }
    });

    if (bestCardIdx !== -1) {
      playCard(bestCardIdx);
      setTimeout(step, 340);
      return;
    }

    // 2. Best affordable Market card
    let bestMarketIdx = -1;
    let bestMarketScore = -1;
    state.marketRow.forEach((c, idx) => {
      if (!c || state.player.gold < c.goldCost) return;
      const sc = scoreMarketCardForAuto(c);
      if (sc > bestMarketScore) {
        bestMarketScore = sc;
        bestMarketIdx = idx;
      }
    });

    if (bestMarketIdx !== -1) {
      buyMarketCard(bestMarketIdx);
      setTimeout(step, 300);
      return;
    }

    // 3. Smart board attack
    const atkPlan = pickBestAutoAttack();
    if (atkPlan) {
      state.selectedUnitIndex = atkPlan.attackerIdx;
      if (atkPlan.targetType === "hero") {
        attackEnemyHero();
      } else {
        attackEnemyUnit(atkPlan.targetIdx);
      }
      setTimeout(step, 420);
      return;
    }

    // 4. End turn cleanly
    autoBattleBusy = false;
    endTurn();
  }

  step();
}

function handleAutoReaction(incomingDmg, finishFn) {
  setTimeout(() => {
    if (!autoBattleEnabled || !state.reactionWindow || state.gameOver) return;

    // Cast an affordable reaction shield/drain if damage exceeds armor
    if (incomingDmg > state.player.armor) {
      const reactIdx = state.player.hand.findIndex(
        (c) => c.reaction && state.player.energy >= c.cost
      );
      if (reactIdx !== -1) {
        playCard(reactIdx);
      }
    }

    // Pick a blocker that survives or saves a low-HP hero
    const candidates = state.player.board
      .map((u, idx) => ({ u, idx }))
      .filter((x) => x.u);
    if (candidates.length > 0) {
      const guard = candidates.find((x) => x.u.guard);
      const survivor = candidates.find((x) => x.u.hp > incomingDmg);
      const sacrifice = state.player.hp <= incomingDmg ? candidates[0] : null;
      const chosen = guard || survivor || sacrifice;
      if (chosen && state.reactionWindow) {
        state.reactionWindow.blockerIdx = chosen.idx;
        render();
      }
    }

    setTimeout(() => {
      if (autoBattleEnabled && state.reactionWindow) {
        finishFn();
      }
    }, 280);
  }, 360);
}

document.getElementById("auto-battle-btn")?.addEventListener("click", (e) => {
  autoBattleEnabled = !autoBattleEnabled;
  const btn = e.currentTarget;
  btn.textContent = autoBattleEnabled ? "AUTO: ON" : "AUTO: OFF";
  btn.classList.toggle("active", autoBattleEnabled);
  if (autoBattleEnabled && isCombatActiveForAuto()) {
    runAutoBattleTurn();
  }
});

// =============================================================================
// PROCEDURAL MAP UI, SHOP & EVENTS CONTROLLER
// =============================================================================

function openMapScreen(peekOnly = false) {
  const nav = runState.mapNav;
  const screen = document.getElementById("map-screen");
  if (!nav || !screen || !window.MapSystem) return;

  if (!peekOnly) stopTurnTimer();

  const floorNum = Math.min(nav.map.floorsCount, Math.max(1, nav.currentFloor + (peekOnly ? 0 : 1)));
  document.getElementById("map-floor-badge").textContent = `PISO ${floorNum} / ${nav.map.floorsCount}`;
  document.getElementById("map-hp-badge").textContent = `HP: ${runState.playerHp}/${runState.playerMaxHp}`;
  document.getElementById("map-gold-badge").textContent = `ORO RUN: ${runState.runGold || 0}`;

  const closeBtn = document.getElementById("map-close-btn");
  if (closeBtn) {
    closeBtn.classList.toggle("hidden", !peekOnly);
    closeBtn.onclick = () => screen.classList.add("hidden");
  }

  const deckBtn = document.getElementById("map-deck-btn");
  if (deckBtn) {
    deckBtn.onclick = () => {
      renderInventoryModal();
      document.getElementById("inventory-modal")?.classList.remove("hidden");
    };
  }

  renderProceduralMap(nav, peekOnly);
  screen.classList.remove("hidden");
  window.FTUE?.onMapOpen(peekOnly);

  // Scroll to active floor
  const scrollArea = document.getElementById("map-scroll-area");
  if (scrollArea) {
    const targetFloor = nav.currentFloor;
    const totalH = 1280;
    const targetY = totalH - ((targetFloor + 1.5) / nav.map.floorsCount) * totalH;
    scrollArea.scrollTop = Math.max(0, targetY - scrollArea.clientHeight * 0.45);
  }
}

function getMapNodeCoords(node, boardW, boardH) {
  const padX = 110;
  const padY = 85;
  const usableW = boardW - padX * 2;
  const usableH = boardH - padY * 2;
  const x = padX + (node.lane / (window.MapSystem.MAP_LANES - 1)) * usableW;
  // Floor 0 at bottom, Boss (floor 10) at top
  const y = boardH - padY - (node.floor / (window.MapSystem.MAP_FLOORS - 1)) * usableH;
  return { x, y };
}

function renderProceduralMap(nav, peekOnly) {
  const canvas = document.getElementById("map-board-canvas");
  const svg = document.getElementById("map-edges-svg");
  const layer = document.getElementById("map-nodes-layer");
  if (!canvas || !svg || !layer) return;

  const boardW = 760;
  const boardH = 1280;
  canvas.style.width = `${boardW}px`;
  canvas.style.height = `${boardH}px`;
  svg.setAttribute("viewBox", `0 0 ${boardW} ${boardH}`);
  svg.innerHTML = "";
  layer.innerHTML = "";

  const nodes = Object.values(nav.map.nodesById);

  // Draw edges
  for (const node of nodes) {
    const p1 = getMapNodeCoords(node, boardW, boardH);
    for (const nextId of node.next) {
      const target = nav.map.nodesById[nextId];
      if (!target) continue;
      const p2 = getMapNodeCoords(target, boardW, boardH);

      const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line.setAttribute("x1", p1.x);
      line.setAttribute("y1", p1.y);
      line.setAttribute("x2", p2.x);
      line.setAttribute("y2", p2.y);

      const isTraveled = nav.visitedNodeIds.includes(node.id) && nav.visitedNodeIds.includes(nextId);
      const isAvailableEdge = !peekOnly && (
        (node.id === nav.currentNodeId && nav.availableNodeIds.includes(nextId))
      );
      line.setAttribute("class", `map-edge${isTraveled ? " traveled" : ""}${isAvailableEdge ? " available" : ""}`);
      svg.appendChild(line);
    }
  }

  // Draw nodes
  for (const node of nodes) {
    const { x, y } = getMapNodeCoords(node, boardW, boardH);
    const meta = window.MapSystem.NODE_META[node.type] || window.MapSystem.NODE_META.combat;
    const isVisited = nav.visitedNodeIds.includes(node.id);
    const isCurrent = nav.currentNodeId === node.id;
    const isAvailable = !peekOnly && window.MapSystem.canSelectNode(nav, node.id);

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = [
      "map-node",
      `node-${node.type}`,
      isVisited ? "visited" : "",
      isCurrent ? "current" : "",
      isAvailable ? "available" : "locked"
    ].filter(Boolean).join(" ");
    btn.style.left = `${x}px`;
    btn.style.top = `${y}px`;
    btn.dataset.nodeId = node.id;
    btn.title = `Piso ${node.floor + 1}: ${meta.label} - ${meta.desc}`;
    btn.innerHTML = `
      ${meta.img
        ? `<img class="map-node-icon" src="${meta.img}" alt="${meta.label}" />`
        : `<span class="map-node-glyph">${meta.icon}</span>`}
      <span class="map-node-label">${meta.label}</span>
      ${isCurrent ? `<img class="map-player-marker" src="assets/ui/map_player_marker.png" alt="Posicion actual" />` : ""}
    `;

    if (isAvailable) {
      btn.addEventListener("click", () => selectMapNode(node.id));
    } else {
      btn.disabled = true;
    }

    layer.appendChild(btn);
  }
}

function selectMapNode(nodeId) {
  const nav = runState.mapNav;
  if (!nav || !window.MapSystem) return;
  const node = window.MapSystem.advanceToNode(nav, nodeId);
  if (!node) return;

  window.SFX?.play("click_soft");
  window.CollectionSystem?.recordFloorReached(node.floor + 1);
  document.getElementById("map-screen")?.classList.add("hidden");

  if (node.type === "combat" || node.type === "elite" || node.type === "boss") {
    startNodeCombat(node);
  } else if (node.type === "rest") {
    openRestScreen(false);
  } else if (node.type === "shop") {
    openShopModal();
  } else if (node.type === "event") {
    openEventModal();
  }
}

function openShopModal() {
  const modal = document.getElementById("shop-modal");
  const goldVal = document.getElementById("shop-gold-val");
  const servicesRow = document.getElementById("shop-services-row");
  const cardsGrid = document.getElementById("shop-cards-grid");
  if (!modal || !servicesRow || !cardsGrid) return;

  const prices = window.MapSystem.SHOP_RARITY_PRICES;
  const pool = shuffle(MARKET_POOL_IDS).slice(0, 4);

  function refreshShopUI() {
    goldVal.textContent = `ORO RUN: ${runState.runGold || 0}`;

    servicesRow.innerHTML = "";
    const healBtn = document.createElement("button");
    healBtn.type = "button";
    healBtn.className = "shop-service-btn";
    healBtn.innerHTML = `<img class="shop-service-icon" src="assets/ui/shop_heal.png" alt="" /><span>CURAR +12 HP (30 ORO)</span>`;
    healBtn.disabled = (runState.runGold || 0) < 30 || runState.playerHp >= runState.playerMaxHp;
    healBtn.onclick = () => {
      if ((runState.runGold || 0) < 30) return;
      runState.runGold -= 30;
      runState.playerHp = Math.min(runState.playerMaxHp, runState.playerHp + 12);
      window.SFX?.play("heal_buff");
      refreshShopUI();
    };
    servicesRow.appendChild(healBtn);

    const slotBtn = document.createElement("button");
    slotBtn.type = "button";
    slotBtn.className = "shop-service-btn";
    slotBtn.innerHTML = `<img class="shop-service-icon" src="assets/ui/shop_slot.png" alt="" /><span>+1 SLOT BANQUILLO (50 ORO)</span>`;
    slotBtn.disabled = (runState.runGold || 0) < 50;
    slotBtn.onclick = () => {
      if ((runState.runGold || 0) < 50) return;
      runState.runGold -= 50;
      runState.sidelineMaxSlots = (runState.sidelineMaxSlots || 2) + 1;
      window.SFX?.play("gold_coin");
      slotBtn.disabled = true;
      refreshShopUI();
    };
    servicesRow.appendChild(slotBtn);

    const items = cardsGrid.querySelectorAll(".shop-card-item");
    items.forEach((item) => {
      const cost = Number(item.dataset.cost || 0);
      const buyBtn = item.querySelector(".shop-buy-btn");
      if (buyBtn && !item.classList.contains("sold")) {
        buyBtn.disabled = (runState.runGold || 0) < cost;
      }
    });
  }

  cardsGrid.innerHTML = "";
  pool.forEach((cid) => {
    const card = CARD_CATALOG[cid];
    if (!card) return;
    const cost = prices[card.rarity] || 40;
    const item = document.createElement("div");
    item.className = "shop-card-item";
    item.dataset.cost = String(cost);

    const cardEl = createVisualCardEl(card);
    const buyBtn = document.createElement("button");
    buyBtn.type = "button";
    buyBtn.className = "shop-buy-btn";
    buyBtn.textContent = `COMPRAR (${cost} ORO)`;
    buyBtn.onclick = () => {
      if ((runState.runGold || 0) < cost || item.classList.contains("sold")) return;
      runState.runGold -= cost;
      window.CollectionSystem?.unlockCard(cid);
      runState.permanentDeck.push(cid);
      item.classList.add("sold");
      buyBtn.textContent = "COMPRADO";
      buyBtn.disabled = true;
      window.SFX?.play("gold_coin");
      if (card.rarity === "epica" || card.rarity === "legendaria") {
        window.VFX?.playRarityReveal(cardEl, card.rarity);
      } else {
        window.VFX?.burstAt(cardEl, "gold", { count: 14, ringRadius: 85 });
      }
      refreshShopUI();
    };

    item.appendChild(cardEl);
    item.appendChild(buyBtn);
    cardsGrid.appendChild(item);
  });

  document.getElementById("shop-leave-btn").onclick = () => {
    modal.classList.add("hidden");
    openMapScreen(false);
  };

  refreshShopUI();
  modal.classList.remove("hidden");
  window.FTUE?.onShopOpen();
}

function openEventModal() {
  const modal = document.getElementById("event-modal");
  const modalCard = modal?.querySelector(".event-modal-card");
  const titleEl = document.getElementById("event-title");
  const descEl = document.getElementById("event-desc");
  const choicesEl = document.getElementById("event-choices");
  const outcomeEl = document.getElementById("event-outcome");
  const contBtn = document.getElementById("event-continue-btn");
  if (!modal || !window.MapSystem) return;

  modalCard?.classList.remove("event-fx-positive", "event-fx-negative", "event-fx-epic");
  outcomeEl.classList.remove("outcome-positive", "outcome-negative", "outcome-epic");

  const events = window.MapSystem.MAP_EVENTS.filter((e) => e.id !== runState.lastEventId);
  const ev = events[Math.floor(Math.random() * events.length)] || window.MapSystem.MAP_EVENTS[0];
  runState.lastEventId = ev.id;

  titleEl.textContent = ev.title;
  descEl.textContent = ev.desc;
  const eventArtEl = document.getElementById("event-art-img");
  if (eventArtEl) eventArtEl.src = `assets/ui/events/event_${ev.id}.png`;
  outcomeEl.classList.add("hidden");
  outcomeEl.textContent = "";
  contBtn.classList.add("hidden");
  choicesEl.innerHTML = "";

  function finishEvent(msg, outcomeKind = "positive") {
    choicesEl.querySelectorAll("button").forEach((b) => { b.disabled = true; });
    outcomeEl.textContent = msg;
    outcomeEl.classList.remove("hidden", "outcome-positive", "outcome-negative", "outcome-epic");
    outcomeEl.classList.add(`outcome-${outcomeKind}`);
    contBtn.classList.remove("hidden");
    window.VFX?.playEventOutcome(outcomeKind, ".event-modal-card");
  }

  ev.choices.forEach((ch) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "event-choice-btn";
    btn.textContent = ch.label;
    if (ch.goldCost && (runState.runGold || 0) < ch.goldCost) {
      btn.disabled = true;
    }
    btn.onclick = () => {
      let msg = "Listo.";
      let outcomeKind = "positive";
      if (ch.type === "blood_gold") {
        runState.playerHp = Math.max(1, runState.playerHp + ch.hpDelta);
        runState.runGold = (runState.runGold || 0) + ch.goldDelta;
        msg = `Ofrendaste ${Math.abs(ch.hpDelta)} HP y obtuviste +${ch.goldDelta} Oro de Run.`;
        outcomeKind = "negative";
      } else if (ch.type === "heal") {
        runState.playerHp = Math.min(runState.playerMaxHp, runState.playerHp + ch.hpDelta);
        msg = `Recuperaste +${ch.hpDelta} HP (HP actual: ${runState.playerHp}/${runState.playerMaxHp}).`;
      } else if (ch.type === "buy_slot") {
        runState.runGold -= ch.goldCost;
        runState.sidelineMaxSlots = (runState.sidelineMaxSlots || 2) + ch.slotDelta;
        msg = `Ampliaste tu banquillo a ${runState.sidelineMaxSlots} slots.`;
      } else if (ch.type === "gain_gold") {
        runState.runGold = (runState.runGold || 0) + ch.goldDelta;
        msg = `Recibiste +${ch.goldDelta} Oro de Run.`;
      } else if (ch.type === "buy_maxhp") {
        runState.runGold -= ch.goldCost;
        runState.playerMaxHp += ch.maxHpDelta;
        runState.playerHp += ch.maxHpDelta;
        msg = `Tu HP maximo subio a ${runState.playerMaxHp}.`;
      } else if (ch.type === "bonus_start_gold") {
        runState.nextStageBonusGold = (runState.nextStageBonusGold || 0) + ch.bonusGold;
        msg = `Empezaras tu proximo combate con +${ch.bonusGold} Oro extra.`;
      } else if (ch.type === "draft_rare") {
        runState.playerHp = Math.max(1, runState.playerHp + ch.hpDelta);
        const rares = MARKET_POOL_IDS.filter((id) => CARD_CATALOG[id]?.rarity === "rara");
        const picked = rares[Math.floor(Math.random() * rares.length)] || MARKET_POOL_IDS[0];
        window.CollectionSystem?.unlockCard(picked);
        runState.permanentDeck.push(picked);
        msg = `Anadiste ${CARD_CATALOG[picked]?.name || picked} a tu mazo permanente.`;
        outcomeKind = ch.hpDelta < 0 ? "negative" : "positive";
      } else if (ch.type === "gamble_chest") {
        if (Math.random() < 0.7) {
          runState.runGold = (runState.runGold || 0) + 50;
          msg = "Abriste el cofre sin activar la trampa: +50 Oro de Run.";
          outcomeKind = "positive";
        } else {
          runState.playerHp = Math.max(1, runState.playerHp - 7);
          msg = "La trampa se activo: perdiste 7 HP.";
          outcomeKind = "negative";
        }
      } else if (ch.type === "free_card") {
        const pool = MARKET_POOL_IDS.filter((id) => ["comun", "rara"].includes(CARD_CATALOG[id]?.rarity));
        const picked = pool[Math.floor(Math.random() * pool.length)] || MARKET_POOL_IDS[0];
        window.CollectionSystem?.unlockCard(picked);
        runState.permanentDeck.push(picked);
        msg = `Sumaste ${CARD_CATALOG[picked]?.name || picked} a tu mazo permanente.`;
      } else if (ch.type === "buy_epic") {
        runState.runGold -= ch.goldCost;
        const epics = MARKET_POOL_IDS.filter((id) => CARD_CATALOG[id]?.rarity === "epica");
        const picked = epics[Math.floor(Math.random() * epics.length)] || MARKET_POOL_IDS[0];
        window.CollectionSystem?.unlockCard(picked);
        runState.permanentDeck.push(picked);
        msg = `Descifraste y anadiste ${CARD_CATALOG[picked]?.name || picked} a tu mazo.`;
        outcomeKind = "epic";
      }
      finishEvent(msg, outcomeKind);
    };
    choicesEl.appendChild(btn);
  });

  contBtn.onclick = () => {
    modal.classList.add("hidden");
    openMapScreen(false);
  };

  modal.classList.remove("hidden");
  window.FTUE?.onEventOpen();
}

document.getElementById("open-map-btn")?.addEventListener("click", () => {
  if (!runState.mapNav) return;
  openMapScreen(Boolean(runState.inCombat));
});

// =============================================================================
// COLLECTION & COMPENDIUM UI CONTROLLER
// =============================================================================

let activeCollectionTab = "cards";
let activeCollectionFilter = "todas";

window.CollectionSystem?.init(CARD_CATALOG, STARTER_DECKS);

function openCollectionScreen(initialTab = "cards") {
  activeCollectionTab = initialTab;
  activeCollectionFilter = "todas";
  document.getElementById("collection-tabs")?.querySelectorAll(".collection-tab").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.tab === activeCollectionTab);
  });
  renderCollectionScreen();
  document.getElementById("collection-screen")?.classList.remove("hidden");
}

function renderCollectionScreen() {
  const cs = window.CollectionSystem;
  if (!cs) return;
  const d = cs.getData();
  const totalCards = Object.keys(CARD_CATALOG).length;
  const totalBacks = PLAYER_CARD_BACKS.length;
  const summaryEl = document.getElementById("collection-summary-line");
  if (summaryEl) {
    summaryEl.textContent = `Cartas: ${d.unlockedCards.length}/${totalCards} | Dorsos: ${d.unlockedBacks.length}/${totalBacks} | Boosters abiertos: ${d.stats.boostersTotal}`;
  }

  const filtersEl = document.getElementById("collection-filters");
  const bodyEl = document.getElementById("collection-body");
  if (!filtersEl || !bodyEl) return;

  filtersEl.innerHTML = "";
  bodyEl.innerHTML = "";

  if (activeCollectionTab === "cards") {
    const filters = [
      { id: "todas", label: "Todas" },
      { id: "desbloqueadas", label: "Desbloqueadas" },
      { id: "bloqueadas", label: "Bloqueadas" },
      { id: "comun", label: "Comun" },
      { id: "rara", label: "Rara" },
      { id: "epica", label: "Epica" },
      { id: "legendaria", label: "Legendaria" }
    ];
    filters.forEach((f) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = `collection-filter-btn ${activeCollectionFilter === f.id ? "active" : ""}`;
      btn.textContent = f.label;
      btn.onclick = () => {
        activeCollectionFilter = f.id;
        renderCollectionScreen();
      };
      filtersEl.appendChild(btn);
    });

    const raritySections = [
      { key: "legendaria", title: "LEGENDARIAS" },
      { key: "epica", title: "EPICAS" },
      { key: "rara", title: "RARAS" },
      { key: "comun", title: "COMUNES" }
    ];

    const allCards = Object.values(CARD_CATALOG);
    raritySections.forEach((sec) => {
      if (["comun", "rara", "epica", "legendaria"].includes(activeCollectionFilter) && activeCollectionFilter !== sec.key) {
        return;
      }
      const secCards = allCards.filter((card) => {
        if (card.rarity !== sec.key) return false;
        const unlocked = cs.isCardUnlocked(card.id);
        if (activeCollectionFilter === "desbloqueadas" && !unlocked) return false;
        if (activeCollectionFilter === "bloqueadas" && unlocked) return false;
        return true;
      });
      if (secCards.length === 0) return;

      const totalOfRarity = allCards.filter((c) => c.rarity === sec.key).length;
      const unlockedOfRarity = allCards.filter((c) => c.rarity === sec.key && cs.isCardUnlocked(c.id)).length;

      const secBlock = document.createElement("div");
      secBlock.className = `collection-rarity-section rarity-sec-${sec.key}`;

      const secHead = document.createElement("div");
      secHead.className = "collection-section-header";
      secHead.innerHTML = `<span>${sec.title}</span><small>${unlockedOfRarity} / ${totalOfRarity} DESBLOQUEADAS</small>`;
      secBlock.appendChild(secHead);

      const grid = document.createElement("div");
      grid.className = "collection-cards-grid";

      secCards.forEach((card) => {
        const unlocked = cs.isCardUnlocked(card.id);
        const wrap = document.createElement("div");
        wrap.className = `collection-card-slot ${unlocked ? "unlocked" : "locked"}`;
        const cardEl = createVisualCardEl(card);
        wrap.appendChild(cardEl);

        const statusBadge = document.createElement("div");
        statusBadge.className = unlocked ? "info-plaque plaque-unlocked" : "info-plaque plaque-locked";
        statusBadge.textContent = unlocked ? "DESBLOQUEADA" : "BLOQUEADA";
        wrap.appendChild(statusBadge);
        attachCardHoverInspector(wrap, card);

        grid.appendChild(wrap);
      });

      secBlock.appendChild(grid);
      bodyEl.appendChild(secBlock);
    });
  } else if (activeCollectionTab === "backs") {
    const secHead = document.createElement("div");
    secHead.className = "collection-section-header";
    secHead.innerHTML = `<span>GALERIA DE DORSOS</span><small>${d.unlockedBacks.length} / ${PLAYER_CARD_BACKS.length} DESBLOQUEADOS</small>`;
    bodyEl.appendChild(secHead);

    const grid = document.createElement("div");
    grid.className = "collection-backs-grid";
    PLAYER_CARD_BACKS.forEach((b) => {
      const unlocked = cs.isCardBackUnlocked(b.id);
      const card = document.createElement("div");
      card.className = `collection-back-item ${unlocked ? "unlocked" : "locked"}`;
      const src = b.src || "assets/card_backs/back_forja.png";
      card.innerHTML = `
        <div class="back-pedestal">
          ${renderCardBack2LayerMarkup(src, b.label, "collection-back-preview")}
        </div>
        <div class="collection-back-ribbon">${b.label.toUpperCase()}</div>
        <div class="${unlocked ? "info-plaque plaque-unlocked" : "info-plaque plaque-locked"}">
          ${unlocked ? "DESBLOQUEADO" : cs.getCardBackRequirement(b.id)}
        </div>
      `;
      attachCardParallax(card, card.querySelector(".card-back-2layer"));
      grid.appendChild(card);
    });
    bodyEl.appendChild(grid);
  } else if (activeCollectionTab === "codex") {
    const eHead = document.createElement("div");
    eHead.className = "collection-section-header";
    const defeatedUnique = cs.ENEMY_CODEX.filter((en) => (d.enemiesDefeated[en.name] || 0) > 0).length;
    eHead.innerHTML = `<span>BESTIARIO DE ENEMIGOS</span><small>${defeatedUnique} / ${cs.ENEMY_CODEX.length} VENCIDOS</small>`;
    bodyEl.appendChild(eHead);

    const eGrid = document.createElement("div");
    eGrid.className = "collection-enemies-grid";
    cs.ENEMY_CODEX.forEach((en) => {
      const kills = d.enemiesDefeated[en.name] || 0;
      const frameSrc = en.tier === "Jefe"
        ? "assets/ui/portrait_frame_obsidian.png"
        : (en.tier === "Elite" ? "assets/ui/portrait_frame_crystal.png" : "assets/ui/portrait_frame_iron.png");
      const item = document.createElement("div");
      item.className = `codex-enemy-card ${kills > 0 ? "discovered" : "undiscovered"} tier-${en.tier.toLowerCase()}`;
      item.innerHTML = `
        <div class="codex-portrait-box">
          <img class="codex-avatar-art" src="${en.avatar}" alt="${en.name}" />
          <img class="codex-frame-overlay" src="${frameSrc}" alt="" />
        </div>
        <div class="codex-enemy-ribbon ribbon-${en.tier.toLowerCase()}">${en.name}</div>
        <span class="codex-tier-badge">${en.tier.toUpperCase()}</span>
        <p class="codex-desc">${en.desc}</p>
        <div class="info-plaque codex-kills-pill">VENCIDO: ${kills}</div>
      `;
      eGrid.appendChild(item);
    });
    bodyEl.appendChild(eGrid);

    const rHead = document.createElement("div");
    rHead.className = "collection-section-header";
    rHead.style.marginTop = "28px";
    const allRelics = Object.values(CARD_CATALOG).filter((c) => c.type === "Reliquia");
    const foundRelics = allRelics.filter((r) => Boolean(d.relicsFound[r.id] || cs.isCardUnlocked(r.id))).length;
    rHead.innerHTML = `<span>RELIQUIAS ENCONTRADAS Y USADAS</span><small>${foundRelics} / ${allRelics.length} ENCONTRADAS</small>`;
    bodyEl.appendChild(rHead);

    const rGrid = document.createElement("div");
    rGrid.className = "collection-cards-grid";
    allRelics.forEach((rel) => {
      const found = Boolean(d.relicsFound[rel.id] || cs.isCardUnlocked(rel.id));
      const usedCount = d.relicsUsed[rel.id] || 0;
      const wrap = document.createElement("div");
      wrap.className = `collection-card-slot ${found ? "unlocked" : "locked"}`;
      const cardEl = createVisualCardEl(rel);
      wrap.appendChild(cardEl);

      const pill = document.createElement("div");
      pill.className = found ? "info-plaque plaque-unlocked" : "info-plaque plaque-locked";
      pill.textContent = found ? `USADA: ${usedCount}` : "SIN DESCUBRIR";
      wrap.appendChild(pill);

      attachCardHoverInspector(wrap, rel);
      rGrid.appendChild(wrap);
    });
    bodyEl.appendChild(rGrid);
    return;
  } else if (activeCollectionTab === "stats") {
    const s = d.stats;
    const b = d.boostersByTier;
    const statsGrid = document.createElement("div");
    statsGrid.className = "collection-stats-grid";
    const cardsData = [
      { label: "RUNS INICIADAS", val: s.runsStarted },
      { label: "RUNS GANADAS", val: s.runsWon },
      { label: "PISO MAXIMO", val: `${s.maxFloorReached} / 11` },
      { label: "ELITES VENCIDOS", val: s.elitesDefeated },
      { label: "RELIQUIAS USADAS", val: s.relicsUsedTotal },
      { label: "BOOSTERS TOTALES", val: s.boostersTotal },
      { label: "BOOSTERS BASICOS", val: b.basico || 0 },
      { label: "BOOSTERS RAROS", val: b.raro || 0 },
      { label: "BOOSTERS EPICOS", val: b.epico || 0 },
      { label: "BOOSTERS LEGENDARIOS", val: b.legendario || 0 }
    ];
    cardsData.forEach((st) => {
      const box = document.createElement("div");
      box.className = "stat-summary-card";
      box.innerHTML = `<div class="stat-summary-val">${st.val}</div><div class="stat-summary-lbl">${st.label}</div>`;
      statsGrid.appendChild(box);
    });
    bodyEl.appendChild(statsGrid);
  }
}

document.getElementById("open-collection-btn")?.addEventListener("click", () => openCollectionScreen("cards"));
document.getElementById("deck-open-collection-btn")?.addEventListener("click", () => openCollectionScreen("cards"));
document.getElementById("collection-close-btn")?.addEventListener("click", () => {
  hideCardInspector();
  document.getElementById("collection-screen")?.classList.add("hidden");
  renderCardBackSelector();
});

// =============================================================================
// CARD ANATOMY HOVER INSPECTOR
// =============================================================================

function getCardKeywordsList(card) {
  const kws = [];
  if (card.guard) kws.push("GUARDIA: Bloquea ataques dirigidos al Heroe mientras viva.");
  if (card.haste) kws.push("PRISA: Puede atacar en el mismo turno en que entra.");
  if (card.stealth) kws.push("ESCABULLIRSE: Ignora a las unidades con Guardia.");
  if (card.pierce) kws.push("PERFORAR: El dano sobrante al matar una unidad pasa al Heroe.");
  if (card.reaction) kws.push("REACCION: Se puede jugar durante el turno rival.");
  if (card.upkeep) kws.push(`MANTENIMIENTO: Consume ${card.upkeep} Energia u Oro cada turno.`);
  if (card.onDeath) kws.push("ULTIMO ALIENTO: Activa su efecto especial al morir.");
  if (card.type === "Equipo") kws.push("EQUIPO: Mejora de forma permanente a una unidad aliada.");
  if (card.type === "Reliquia") kws.push(`RELIQUIA: Permanece activa ${card.duration || 3} turnos en tu zona de reliquias.`);
  return kws;
}

function showCardInspector(card, mouseEvent) {
  const el = document.getElementById("card-hover-inspector");
  if (!el || !card) return;
  const f = FACTIONS[card.faction] || { name: (card.faction || "Neutral").toUpperCase() };
  const rarityLabel = (card.rarity || "comun").toUpperCase();
  const kws = getCardKeywordsList(card);
  const statsParts = [];
  if (card.type === "Unidad") {
    statsParts.push(`<span class="insp-stat atk">ATK ${card.atk}</span>`);
    statsParts.push(`<span class="insp-stat hp">HP ${card.hp}</span>`);
  }
  if (card.goldCost) {
    statsParts.push(`<span class="insp-stat gold">MERCADO ${card.goldCost} ORO</span>`);
  }

  el.innerHTML = `
    <div class="insp-head">
      <div class="insp-title">${card.name}</div>
      <span class="insp-cost">${card.cost} EN</span>
    </div>
    <div class="insp-meta">
      <span class="insp-rarity rarity-${card.rarity || "comun"}">${rarityLabel}</span>
      <span>${card.type}</span>
      <span>${f.name || card.faction}</span>
    </div>
    ${statsParts.length ? `<div class="insp-stats-row">${statsParts.join("")}</div>` : ""}
    <div class="insp-desc">${card.desc || card.shortTag || ""}</div>
    ${kws.length ? `<ul class="insp-keywords">${kws.map((k) => `<li>${k}</li>`).join("")}</ul>` : ""}
  `;
  el.classList.remove("hidden");
  positionCardInspector(mouseEvent);
}

function positionCardInspector(e) {
  const el = document.getElementById("card-hover-inspector");
  if (!el || el.classList.contains("hidden") || !e) return;
  const pad = 16;
  const rect = el.getBoundingClientRect();
  let x = e.clientX + 20;
  let y = e.clientY - 24;
  if (x + rect.width + pad > window.innerWidth) {
    x = e.clientX - rect.width - 20;
  }
  if (y + rect.height + pad > window.innerHeight) {
    y = window.innerHeight - rect.height - pad;
  }
  if (y < pad) y = pad;
  if (x < pad) x = pad;
  el.style.left = `${x}px`;
  el.style.top = `${y}px`;
}

function hideCardInspector() {
  document.getElementById("card-hover-inspector")?.classList.add("hidden");
}

function attachCardHoverInspector(slotEl, card) {
  if (!slotEl || !card) return;
  const innerCard = slotEl.classList?.contains("hand-card") ? null : slotEl.querySelector?.(".hand-card");
  if (innerCard) {
    attachCardParallax(slotEl, innerCard);
  }
  slotEl.addEventListener("mouseenter", (e) => showCardInspector(card, e));
  slotEl.addEventListener("mousemove", (e) => positionCardInspector(e));
  slotEl.addEventListener("mouseleave", hideCardInspector);
}
document.getElementById("collection-reset-btn")?.addEventListener("click", () => {
  window.CollectionSystem?.resetProgress();
  renderCollectionScreen();
  renderCardBackSelector();
});
document.getElementById("collection-tabs")?.querySelectorAll(".collection-tab").forEach((btn) => {
  btn.addEventListener("click", () => {
    activeCollectionTab = btn.dataset.tab || "cards";
    activeCollectionFilter = "todas";
    document.getElementById("collection-tabs")?.querySelectorAll(".collection-tab").forEach((b) => {
      b.classList.toggle("active", b === btn);
    });
    renderCollectionScreen();
  });
});

document.getElementById("player-hero-panel")?.addEventListener("click", () => {
  if (state?.selectedUnitIndex !== null && state?.player?.board?.[state.selectedUnitIndex]?.cute) {
    healPlayerHeroWithCute();
  }
});

(function initSecretPastelUnlock() {
  let keyBuffer = "";
  window.addEventListener("keydown", (e) => {
    if (isPastelUnlocked()) return;
    keyBuffer = (keyBuffer + (e.key || "").toUpperCase()).slice(-4);
    if (keyBuffer === "CUTE") {
      unlockPastelFaction(false);
    }
  });
  let logoClicks = 0;
  document.querySelector(".title-logo")?.addEventListener("click", () => {
    if (isPastelUnlocked()) return;
    logoClicks += 1;
    if (logoClicks >= 5) {
      unlockPastelFaction(false);
    }
  });
})();
