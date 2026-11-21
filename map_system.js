// =============================================================================
// DUELFORGE - PROCEDURAL MAP SYSTEM (Slay the Spire Style Backend)
// 11 Floors x 4 Lanes, guaranteed reachability, 0 edge crossings,
// scaled encounters, persistent shop stock, and narrative events.
// =============================================================================

(function (global) {
  "use strict";

  const MAP_FLOORS = 11; // Floors 0..10 (Displayed as Piso 1..11)
  const MAP_LANES = 4;   // Lanes 0..3

  const NODE_META = {
    combat: { label: "Combate", icon: "X", img: "assets/ui/node_combat.png", desc: "Enemigo estandar y recompensa de carta + oro." },
    elite:  { label: "Elite",   icon: "E", img: "assets/ui/node_elite.png",  desc: "Rival peligroso. Da mas oro y mejor booster." },
    rest:   { label: "Descanso", icon: "H", img: "assets/ui/node_rest.png",   desc: "Hoguera: recupera HP o prepara oro inicial." },
    shop:   { label: "Tienda",  icon: "$", img: "assets/ui/node_shop.png",   desc: "Gasta tu oro de run en cartas o mejoras." },
    event:  { label: "Evento",  icon: "?", img: "assets/ui/node_event.png",  desc: "Encuentro misterioso con decisiones de riesgo." },
    boss:   { label: "Jefe",    icon: "B", img: "assets/ui/node_boss.png",   desc: "Guardian final del acto. Victoria al derrotarlo." }
  };

  function makeRng(seed) {
    if (typeof seed !== "number") return Math.random;
    let s = seed >>> 0;
    return function () {
      s = (s * 1664525 + 1013904223) >>> 0;
      return s / 4294967296;
    };
  }

  function randInt(rng, min, max) {
    return min + Math.floor(rng() * (max - min + 1));
  }

  function pickWeighted(rng, weights) {
    const entries = Object.entries(weights);
    const total = entries.reduce((acc, [, w]) => acc + w, 0);
    let roll = rng() * total;
    for (const [key, w] of entries) {
      roll -= w;
      if (roll <= 0) return key;
    }
    return entries[entries.length - 1][0];
  }

  function wouldCross(existingEdges, u, v) {
    for (const e of existingEdges) {
      if ((u < e.u && v > e.v) || (u > e.u && v < e.v)) {
        return true;
      }
    }
    return false;
  }

  function assignNodeType(floor, lane, parents, floorNodes, rng) {
    if (floor === 0) return "combat";
    if (floor === MAP_FLOORS - 2) return "rest"; // Floor 10 (index 9): pre-boss rest
    if (floor === MAP_FLOORS - 1) return "boss";

    const parentTypes = new Set(parents.map((p) => p.type));
    const sameFloorShops = floorNodes.filter((n) => n.type === "shop").length;
    const sameFloorElites = floorNodes.filter((n) => n.type === "elite").length;

    let weights;
    if (floor <= 2) {
      weights = { combat: 52, event: 26, shop: 12, rest: 10, elite: 0 };
    } else if (floor <= 5) {
      weights = { combat: 38, elite: 18, event: 22, shop: 12, rest: 10 };
    } else {
      weights = { combat: 34, elite: 24, event: 18, shop: 12, rest: 12 };
    }

    // Anti-repetition and floor caps
    if (parentTypes.has("rest")) weights.rest = 0;
    if (parentTypes.has("shop") || sameFloorShops >= 1) weights.shop = 0;
    if (parentTypes.has("elite") || sameFloorElites >= 2) weights.elite = 0;
    if (floor === 1 || floor === MAP_FLOORS - 3) weights.rest = 0; // No rest on floor 2 or right before pre-boss rest

    return pickWeighted(rng, weights);
  }

  function generateMap(seed) {
    const rng = makeRng(seed);
    const nodesById = {};
    const floors = Array.from({ length: MAP_FLOORS }, () => []);
    const floorEdges = Array.from({ length: MAP_FLOORS - 1 }, () => []);

    // 1. Build 5 random walks from floor 0 to floor MAP_FLOORS - 2
    const walkCount = 5;
    const laneGrid = Array.from({ length: MAP_FLOORS - 1 }, () => new Set());
    const startLanes = [0, 1, 2, 3];

    for (let w = 0; w < walkCount; w++) {
      let currLane = w < startLanes.length ? startLanes[w] : randInt(rng, 0, MAP_LANES - 1);
      laneGrid[0].add(currLane);

      for (let f = 0; f < MAP_FLOORS - 2; f++) {
        const candidates = [];
        for (const delta of [-1, 0, 1]) {
          const nextLane = currLane + delta;
          if (nextLane >= 0 && nextLane < MAP_LANES && !wouldCross(floorEdges[f], currLane, nextLane)) {
            candidates.push(nextLane);
          }
        }
        const chosen = candidates.length > 0
          ? candidates[randInt(rng, 0, candidates.length - 1)]
          : currLane;

        if (!floorEdges[f].some((e) => e.u === currLane && e.v === chosen)) {
          floorEdges[f].push({ u: currLane, v: chosen });
        }
        laneGrid[f + 1].add(chosen);
        currLane = chosen;
      }
    }

    // 2. Materialize nodes for floors 0..MAP_FLOORS-2
    for (let f = 0; f < MAP_FLOORS - 1; f++) {
      const sortedLanes = Array.from(laneGrid[f]).sort((a, b) => a - b);
      for (const lane of sortedLanes) {
        const id = `f${f}_l${lane}`;
        const node = {
          id,
          floor: f,
          lane,
          type: "combat",
          next: [],
          prev: []
        };
        nodesById[id] = node;
        floors[f].push(node);
      }
    }

    // 3. Connect edges for floors 0..MAP_FLOORS-3
    for (let f = 0; f < MAP_FLOORS - 2; f++) {
      for (const e of floorEdges[f]) {
        const fromId = `f${f}_l${e.u}`;
        const toId = `f${f + 1}_l${e.v}`;
        const fromNode = nodesById[fromId];
        const toNode = nodesById[toId];
        if (fromNode && toNode) {
          if (!fromNode.next.includes(toId)) fromNode.next.push(toId);
          if (!toNode.prev.includes(fromId)) toNode.prev.push(fromId);
        }
      }
    }

    // 4. Create Boss node on last floor and connect all floor MAP_FLOORS-2 nodes
    const bossFloor = MAP_FLOORS - 1;
    const bossNode = {
      id: `f${bossFloor}_boss`,
      floor: bossFloor,
      lane: 1.5, // Centered across 4 lanes (0..3)
      type: "boss",
      next: [],
      prev: []
    };
    nodesById[bossNode.id] = bossNode;
    floors[bossFloor].push(bossNode);

    for (const preBoss of floors[bossFloor - 1]) {
      preBoss.next.push(bossNode.id);
      bossNode.prev.push(preBoss.id);
    }

    // 5. Assign node types with anti-repetition rules
    for (let f = 0; f < MAP_FLOORS; f++) {
      for (const node of floors[f]) {
        const parents = node.prev.map((pid) => nodesById[pid]).filter(Boolean);
        node.type = assignNodeType(f, node.lane, parents, floors[f], rng);
      }
    }

    return {
      floorsCount: MAP_FLOORS,
      lanesCount: MAP_LANES,
      floors,
      nodesById,
      bossId: bossNode.id
    };
  }

  function createMapRunState(seed) {
    const map = generateMap(seed);
    const firstFloorIds = map.floors[0].map((n) => n.id);
    return {
      map,
      currentNodeId: null,
      visitedNodeIds: [],
      availableNodeIds: firstFloorIds,
      currentFloor: 0
    };
  }

  function canSelectNode(navState, nodeId) {
    if (!navState || !navState.availableNodeIds) return false;
    return navState.availableNodeIds.includes(nodeId);
  }

  function advanceToNode(navState, nodeId) {
    if (!canSelectNode(navState, nodeId)) {
      return null;
    }
    const node = navState.map.nodesById[nodeId];
    if (!node) return null;

    navState.currentNodeId = nodeId;
    if (!navState.visitedNodeIds.includes(nodeId)) {
      navState.visitedNodeIds.push(nodeId);
    }
    navState.currentFloor = node.floor + 1;
    navState.availableNodeIds = [...node.next];
    return node;
  }

  const DIFFICULTY_MODES = {
    estandar: {
      id: "estandar",
      label: "ESTANDAR",
      desc: "Mazos rivales completos y 2-3 jugadas por turno.",
      hpMult: 1.0,
      bonusEnergy: 0,
      bonusStartArmor: 0,
      handSize: 4,
      postCombatHeal: 5,
      upgradedDeck: false
    },
    veterano: {
      id: "veterano",
      label: "VETERANO",
      desc: "Rivales +5% HP, +1 SHD inicial y cartas mejoradas.",
      hpMult: 1.05,
      bonusEnergy: 0,
      bonusStartArmor: 1,
      handSize: 5,
      postCombatHeal: 4,
      upgradedDeck: true
    },
    titan: {
      id: "titan",
      label: "TITAN",
      desc: "Rivales +9% HP, +1 SHD inicial, escalado Turno 3 y cartas letales.",
      hpMult: 1.09,
      bonusEnergy: 0,
      bonusStartArmor: 1,
      handSize: 5,
      postCombatHeal: 3,
      upgradedDeck: true
    }
  };

  function getDifficultyConfig(difficultyId) {
    return DIFFICULTY_MODES[difficultyId] || DIFFICULTY_MODES.estandar;
  }

  // Scaled combat encounter builder based on floor (0..10), node type, and difficulty
  function getCombatEncounterForNode(node, difficultyId = "estandar") {
    const floor = node ? node.floor : 0;
    const type = node ? node.type : "combat";
    const diff = getDifficultyConfig(difficultyId);

    const buildDeck = (baseIds, extras = []) => {
      return diff.upgradedDeck ? [...baseIds, ...extras] : [...baseIds];
    };
    const isTitan = diff.id === "titan";

    if (type === "boss") {
      return {
        archetypeId: "senor_titan",
        name: "THE OVERLORD (NUCLEO BLANCO)",
        hp: Math.round(28 * diff.hpMult),
        avatar: "assets/spraycasters/order/order_overlord.png",
        frame: "assets/ui/portrait_frame_obsidian.png",
        arenaBg: "assets/spraycasters/arenas/arena_nucleo_blanco.png",
        cardBack: "assets/card_backs/back_league_6.png",
        baseAtk: 8,
        startArmor: 1 + diff.bonusStartArmor,
        baseEnergy: 2,
        scaleEnergyOnTurn3: isTitan,
        handSize: diff.handSize,
        passiveId: "boss_titan",
        passiveLabel: "+1 SHD/turno | <50% HP: Protocolo Overlord (+1 EN, +3 SHD, +1/+1 mesa)",
        vanguardCardId: diff.id === "estandar" ? null : "orden_enforcer",
        deckIds: buildDeck(
          [
            "orden_scrapper", "orden_scrapper", "orden_enforcer",
            "forja_hacha_titan", "yunque", "escudero", "ariete",
            "forja_martillazo", "golpe", "escudo", "neutral_corazon_forja"
          ],
          ["orden_overlord", "orden_enforcer"]
        ),
        summonName: "Mecha Censura",
        summonAtk: 4,
        summonHp: 6,
        boosterTier: "legendario",
        goldReward: 50,
        isBoss: true,
        isElite: false
      };
    }

    if (type === "elite") {
      const tier2 = floor >= 6;
      if (tier2) {
        return {
          archetypeId: "guardian_obsidiana",
          name: "THE ENFORCER (AZOTEAS)",
          hp: Math.round((28 + (floor - 5) * 2) * diff.hpMult),
          avatar: "assets/spraycasters/order/order_enforcer.png",
          frame: "assets/ui/portrait_frame_obsidian.png",
          arenaBg: "assets/spraycasters/arenas/arena_azoteas.png",
          cardBack: "assets/card_backs/back_league_5.png",
          baseAtk: 8,
          startArmor: 1 + diff.bonusStartArmor,
          baseEnergy: 2,
          scaleEnergyOnTurn3: isTitan,
          handSize: diff.handSize,
          passiveId: "elite_obsidiana",
          passiveLabel: "+1 SHD/turno y 2 DMG al Heroe al morir una unidad suya",
          vanguardCardId: "orden_scrapper",
          deckIds: buildDeck(
            [
              "orden_enforcer", "orden_scrapper",
              "culto_acechador", "forja_coraza", "culto_capa",
              "drenaje", "culto_altar_sangre",
              "escudo", "escudo", "golpe", "golpe"
            ],
            ["orden_enforcer", "culto_drenar_mente"]
          ),
          summonName: "Unidad Supresora",
          summonAtk: 3 + Math.floor(floor / 5),
          summonHp: 5 + Math.floor(floor / 4),
          boosterTier: "epico",
          goldReward: 26 + floor * 2,
          isBoss: false,
          isElite: true
        };
      }
      return {
        archetypeId: "comandante_cristal",
        name: "THE ENFORCER (CALLEJON NEON)",
        hp: Math.round((24 + floor * 2) * diff.hpMult),
        avatar: "assets/spraycasters/order/order_enforcer.png",
        frame: "assets/ui/portrait_frame_crystal.png",
        arenaBg: "assets/spraycasters/arenas/arena_callejon.png",
        cardBack: "assets/card_backs/back_league_4.png",
        baseAtk: 7,
        startArmor: 1 + diff.bonusStartArmor,
        baseEnergy: 2,
        scaleEnergyOnTurn3: isTitan,
        handSize: diff.handSize,
        passiveId: "elite_cristal",
        passiveLabel: "Vanguardia inicial + 1 SHD y 1 DMG directo por turno",
        vanguardCardId: "orden_scrapper",
        deckIds: buildDeck(
          [
            "orden_enforcer", "orden_scrapper", "culto_acechador",
            "relampago", "goblin", "arcano_baston", "culto_capa",
            "descarga", "trampa_hielo", "hielo",
            "sobrecarga", "golpe", "escudo"
          ],
          ["orden_enforcer", "rayo"]
        ),
        summonName: "Escuadron Riot",
        summonAtk: 3 + Math.floor(floor / 5),
        summonHp: 5 + Math.floor(floor / 4),
        boosterTier: "raro",
        goldReward: 26 + floor * 2,
        isBoss: false,
        isElite: true
      };
    }

    // Normal combat scaled by floor
    if (floor <= 2) {
      return {
        archetypeId: "capitan_hierro",
        name: "THE SCRAPPER (SKATEPARK)",
        hp: Math.round((23 + floor * 2) * diff.hpMult),
        avatar: "assets/spraycasters/order/order_scrapper.png",
        frame: "assets/ui/portrait_frame_iron.png",
        arenaBg: "assets/spraycasters/arenas/arena_skatepark.png",
        cardBack: "assets/card_backs/back_league_1.png",
        baseAtk: 6 + Math.floor(floor / 2),
        startArmor: (floor === 0 ? 0 : floor) + diff.bonusStartArmor,
        baseEnergy: 2,
        scaleEnergyOnTurn3: floor === 2,
        handSize: diff.handSize,
        passiveId: "forja_armor",
        passiveArmorPerTurn: floor === 0 ? 0 : 1,
        passiveLabel: floor === 0 ? "Brigada de Limpieza (2 jugadas/turno)" : "+1 SHD al inicio de su turno",
        vanguardCardId: null,
        deckIds: buildDeck(
          [
            "orden_scrapper", "orden_scrapper", "escudero", "escudero",
            "ariete", "golem", "forja_escudo_torre",
            "forja_martillazo", "golpe", "golpe", "escudo", "escudo"
          ],
          ["forja_coraza", "orden_enforcer"]
        ),
        summonName: "Dron Limpiador",
        summonAtk: 3,
        summonHp: 4 + Math.floor(floor / 2),
        boosterTier: "basico",
        goldReward: 14 + floor * 2,
        isBoss: false,
        isElite: false
      };
    }

    if (floor <= 6) {
      return {
        archetypeId: "maga_cristales",
        name: "THE SCRAPPER (METRO)",
        hp: Math.round((26 + (floor - 2) * 2) * diff.hpMult),
        avatar: "assets/spraycasters/order/order_scrapper.png",
        frame: "assets/ui/portrait_frame_crystal.png",
        arenaBg: "assets/spraycasters/arenas/arena_metro.png",
        cardBack: "assets/card_backs/back_league_2.png",
        baseAtk: 7 + Math.floor((floor - 2) / 2),
        startArmor: 1 + diff.bonusStartArmor,
        baseEnergy: 2,
        scaleEnergyOnTurn3: floor >= 4 || isTitan,
        handSize: diff.handSize,
        passiveId: "arcano_focus",
        passiveLabel: "+1 SHD por turno y +1 DMG en hechizos",
        vanguardCardId: null,
        deckIds: buildDeck(
          [
            "orden_scrapper", "orden_scrapper", "arcano_centinela_cristal",
            "cristalomante", "arcano_baston", "arcano_chispazo", "arcano_chispazo",
            "descarga", "descarga", "hielo", "arcano_congelacion", "arcano_orbe_eco", "escudo"
          ],
          ["orden_enforcer", "rayo"]
        ),
        summonName: "Dron Quimico",
        summonAtk: 3,
        summonHp: 5 + Math.floor((floor - 2) / 3),
        boosterTier: "raro",
        goldReward: 16 + floor * 2,
        isBoss: false,
        isElite: false
      };
    }

    return {
      archetypeId: "campeon_forja",
      name: "THE SCRAPPER (FABRIL)",
      hp: Math.round((27 + (floor - 6) * 2) * diff.hpMult),
      avatar: "assets/spraycasters/order/order_scrapper.png",
      frame: "assets/ui/portrait_frame_obsidian.png",
      arenaBg: "assets/spraycasters/arenas/arena_fabril.png",
      cardBack: "assets/card_backs/back_league_3.png",
      baseAtk: 8,
      startArmor: 1 + diff.bonusStartArmor,
      baseEnergy: 2,
      scaleEnergyOnTurn3: floor >= 8 || isTitan,
      handSize: diff.handSize,
      passiveId: "campeon_rally",
      passiveLabel: "+1 SHD y +1 ATK a su unidad lider por turno",
      vanguardCardId: null,
      deckIds: buildDeck(
        [
          "orden_scrapper", "orden_enforcer", "ariete",
          "forja_aprendiz", "escudero", "forja_hacha_titan",
          "yunque", "legion_grito", "forja_martillazo",
          "golpe", "golpe", "escudo", "escudo", "forja_coraza"
        ],
        ["orden_enforcer", "drako"]
      ),
      summonName: "Brigada Vapor",
      summonAtk: 4,
      summonHp: 6,
      boosterTier: "epico",
      goldReward: 20 + floor * 2,
      isBoss: false,
      isElite: false
    };
  }

  const MAP_EVENTS = [
    {
      id: "altar_sangre",
      title: "ALTAR DE SANGRE ANTIGUO",
      desc: "Una estatua de obsidiana ofrece poder a cambio de vitalidad.",
      choices: [
        { label: "Ofrendar sangre (-6 HP -> +45 Oro)", type: "blood_gold", hpDelta: -6, goldDelta: 45 },
        { label: "Descansar junto al altar (+5 HP)", type: "heal", hpDelta: 5 }
      ]
    },
    {
      id: "mercader_errante",
      title: "MERCADER ERRANTE",
      desc: "Un viajero encapuchado ofrece ampliar tu mochila tactica.",
      choices: [
        { label: "Comprar espacio (+1 Slot Banquillo por 30 Oro)", type: "buy_slot", goldCost: 30, slotDelta: 1 },
        { label: "Pedir provisiones (+10 Oro)", type: "gain_gold", goldDelta: 10 }
      ]
    },
    {
      id: "forja_olvidada",
      title: "FORJA OLVIDADA",
      desc: "Las brasas aun arden. Puedes templar tu equipo o recolectar chatarra.",
      choices: [
        { label: "Templar armadura (+4 HP Maximos por 25 Oro)", type: "buy_maxhp", goldCost: 25, maxHpDelta: 4 },
        { label: "Recolectar lingotes (+2 Oro inicial prox. combate)", type: "bonus_start_gold", bonusGold: 2 }
      ]
    },
    {
      id: "fuente_arcana",
      title: "FUENTE ARCANA",
      desc: "Agua luminosa brota entre ruinas selladas.",
      choices: [
        { label: "Beber del manantial (+10 HP)", type: "heal", hpDelta: 10 },
        { label: "Sumergir una carta (+1 Carta Rara al mazo, -4 HP)", type: "draft_rare", hpDelta: -4 }
      ]
    },
    {
      id: "cofre_trampeado",
      title: "COFRE SELLADO",
      desc: "Un cofre reforzado con runas de peligro.",
      choices: [
        { label: "Forzar cerradura (70% +50 Oro / 30% -7 HP)", type: "gamble_chest" },
        { label: "Dejarlo intacto (+3 HP)", type: "heal", hpDelta: 3 }
      ]
    },
    {
      id: "biblioteca_oculta",
      title: "BIBLIOTECA OCULTA",
      desc: "Pergaminos intactos esperan entre el polvo.",
      choices: [
        { label: "Tomar un pergamino (Carta Comun/Rara gratis)", type: "free_card" },
        { label: "Descifrar tomo antiguo (Carta Epica por 25 Oro)", type: "buy_epic", goldCost: 25 }
      ]
    }
  ];

  const SHOP_RARITY_PRICES = {
    comun: 25,
    rara: 45,
    epica: 70,
    legendaria: 105
  };

  const api = {
    MAP_FLOORS,
    MAP_LANES,
    NODE_META,
    MAP_EVENTS,
    SHOP_RARITY_PRICES,
    DIFFICULTY_MODES,
    getDifficultyConfig,
    generateMap,
    createMapRunState,
    canSelectNode,
    advanceToNode,
    getCombatEncounterForNode
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }
  global.MapSystem = api;
})(typeof window !== "undefined" ? window : globalThis);
