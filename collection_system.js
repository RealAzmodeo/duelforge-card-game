// =============================================================================
// DUELFORGE - PERSISTENT COLLECTION, UNLOCKS & COMPENDIUM SYSTEM
// Tracks unlocked cards, card backs, defeated enemies, relics found/used,
// boosters opened, and run milestones in localStorage.
// =============================================================================

(function (global) {
  "use strict";

  const STORAGE_KEY = "duelforge_collection_v1";

  const CARD_BACK_RULES = {
    auto: { unlockedByDefault: true, req: "Disponible desde el inicio" },
    forja: { unlockedByDefault: true, req: "Disponible desde el inicio" },
    arcano: { unlockedByDefault: true, req: "Disponible desde el inicio" },
    sindicato: { unlockedByDefault: true, req: "Disponible desde el inicio" },
    legion: { unlockedByDefault: true, req: "Disponible desde el inicio" },
    culto: { unlockedByDefault: true, req: "Disponible desde el inicio" },
    alt_plateado: { unlockedByDefault: false, req: "Abre 3 Boosters" },
    alt_dorado: { unlockedByDefault: false, req: "Derrota a 1 Enemigo Elite" },
    alt_neoforja: { unlockedByDefault: false, req: "Usa 3 Reliquias en combate" },
    alt_ceniza: { unlockedByDefault: false, req: "Completa 1 Run derrotando al Jefe" }
  };

  const ENEMY_CODEX = [
    { name: "CAPITAN HIERRO", tier: "Normal", avatar: "assets/heroes/enemy_hero.png", desc: "Vanguardia inicial de las puertas exteriores." },
    { name: "MAGA DE CRISTALES", tier: "Normal", avatar: "assets/heroes/enemy_2.png", desc: "Invoca golems cristalinos en pisos medios." },
    { name: "CAMPEON DE FORJA", tier: "Normal", avatar: "assets/heroes/enemy_2.png", desc: "Duelista veterano de los pisos altos." },
    { name: "COMANDANTE CRISTAL", tier: "Elite", avatar: "assets/heroes/enemy_2.png", desc: "Elite de gran resistencia y presion constante." },
    { name: "GUARDIAN OBSIDIANA", tier: "Elite", avatar: "assets/heroes/enemy_boss.png", desc: "Elite blindado de la camara superior." },
    { name: "SENOR TITAN", tier: "Jefe", avatar: "assets/heroes/enemy_boss.png", desc: "Jefe final del acto. Custodia la victoria." }
  ];

  let memoryStorage = null;
  let catalogRef = {};
  let starterDecksRef = {};
  let data = null;

  function readStore() {
    try {
      if (typeof localStorage !== "undefined") {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : null;
      }
    } catch (_) {}
    return memoryStorage;
  }

  function writeStore(obj) {
    memoryStorage = obj;
    try {
      if (typeof localStorage !== "undefined") {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(obj));
      }
    } catch (_) {}
  }

  function buildInitialUnlockedCards(catalog, starterDecks) {
    const unlocked = new Set();
    Object.values(starterDecks || {}).forEach((deck) => {
      (deck.cards || []).forEach((cid) => unlocked.add(cid));
    });
    Object.values(catalog || {}).forEach((card) => {
      if (card && card.rarity === "comun") {
        unlocked.add(card.id);
      }
    });
    return Array.from(unlocked);
  }

  function buildDefaultData(catalog, starterDecks) {
    const defaultBacks = Object.keys(CARD_BACK_RULES).filter((k) => CARD_BACK_RULES[k].unlockedByDefault);
    return {
      version: 1,
      unlockedCards: buildInitialUnlockedCards(catalog, starterDecks),
      unlockedBacks: defaultBacks,
      enemiesDefeated: {},
      relicsFound: {},
      relicsUsed: {},
      boostersByTier: { basico: 0, raro: 0, epico: 0, legendario: 0 },
      stats: {
        runsStarted: 0,
        runsWon: 0,
        maxFloorReached: 0,
        elitesDefeated: 0,
        relicsUsedTotal: 0,
        boostersTotal: 0
      }
    };
  }

  function save() {
    if (data) writeStore(data);
  }

  function init(catalog, starterDecks) {
    catalogRef = catalog || {};
    starterDecksRef = starterDecks || {};
    const saved = readStore();
    const base = buildDefaultData(catalogRef, starterDecksRef);
    if (saved && saved.version === 1) {
      data = {
        ...base,
        ...saved,
        boostersByTier: { ...base.boostersByTier, ...(saved.boostersByTier || {}) },
        stats: { ...base.stats, ...(saved.stats || {}) }
      };
      // Ensure starter/common base cards are always unlocked
      base.unlockedCards.forEach((cid) => {
        if (!data.unlockedCards.includes(cid)) data.unlockedCards.push(cid);
      });
    } else {
      data = base;
    }
    save();
    return data;
  }

  function ensureInit() {
    if (!data) init(catalogRef, starterDecksRef);
  }

  function getData() {
    ensureInit();
    return data;
  }

  function isCardUnlocked(cardId) {
    ensureInit();
    return data.unlockedCards.includes(cardId);
  }

  function unlockCard(cardId) {
    ensureInit();
    if (!cardId || !catalogRef[cardId]) return false;
    if (!data.unlockedCards.includes(cardId)) {
      data.unlockedCards.push(cardId);
      if (catalogRef[cardId].type === "Reliquia") {
        data.relicsFound[cardId] = true;
      }
      save();
      return true;
    }
    return false;
  }

  function isCardBackUnlocked(backId) {
    ensureInit();
    return data.unlockedBacks.includes(backId);
  }

  function unlockCardBack(backId) {
    ensureInit();
    if (!data.unlockedBacks.includes(backId)) {
      data.unlockedBacks.push(backId);
      save();
      return true;
    }
    return false;
  }

  function getCardBackRequirement(backId) {
    return CARD_BACK_RULES[backId]?.req || "Desbloqueable en partida";
  }

  function checkMilestoneUnlocks() {
    ensureInit();
    const newlyUnlockedBacks = [];
    if (data.stats.boostersTotal >= 3 && unlockCardBack("alt_plateado")) {
      newlyUnlockedBacks.push("alt_plateado");
    }
    if (data.stats.elitesDefeated >= 1 && unlockCardBack("alt_dorado")) {
      newlyUnlockedBacks.push("alt_dorado");
    }
    if (data.stats.relicsUsedTotal >= 3 && unlockCardBack("alt_neoforja")) {
      newlyUnlockedBacks.push("alt_neoforja");
    }
    if (data.stats.runsWon >= 1 && unlockCardBack("alt_ceniza")) {
      newlyUnlockedBacks.push("alt_ceniza");
    }
    return newlyUnlockedBacks;
  }

  function recordRunStart() {
    ensureInit();
    data.stats.runsStarted += 1;
    save();
  }

  function recordFloorReached(floorNum) {
    ensureInit();
    if (floorNum > data.stats.maxFloorReached) {
      data.stats.maxFloorReached = floorNum;
      save();
    }
  }

  function recordBoosterOpened(tierKey) {
    ensureInit();
    const key = data.boostersByTier[tierKey] !== undefined ? tierKey : "basico";
    data.boostersByTier[key] += 1;
    data.stats.boostersTotal += 1;
    const backs = checkMilestoneUnlocks();
    save();
    return backs;
  }

  function recordRelicFound(cardId) {
    ensureInit();
    if (!cardId) return;
    data.relicsFound[cardId] = true;
    save();
  }

  function recordRelicUsed(cardId) {
    ensureInit();
    if (!cardId) return [];
    data.relicsFound[cardId] = true;
    data.relicsUsed[cardId] = (data.relicsUsed[cardId] || 0) + 1;
    data.stats.relicsUsedTotal += 1;
    const backs = checkMilestoneUnlocks();
    save();
    return backs;
  }

  function recordEnemyDefeated(enemyName, isElite, isBoss) {
    ensureInit();
    if (enemyName) {
      data.enemiesDefeated[enemyName] = (data.enemiesDefeated[enemyName] || 0) + 1;
    }
    if (isElite) data.stats.elitesDefeated += 1;
    if (isBoss) data.stats.runsWon += 1;

    // Unlock 1 random locked card on Elite or Boss victory
    let unlockedCardId = null;
    if (isElite || isBoss) {
      const lockedPool = Object.keys(catalogRef).filter((id) => !data.unlockedCards.includes(id));
      if (lockedPool.length > 0) {
        unlockedCardId = lockedPool[Math.floor(Math.random() * lockedPool.length)];
        unlockCard(unlockedCardId);
      }
    }
    const unlockedBacks = checkMilestoneUnlocks();
    save();
    return { unlockedCardId, unlockedBacks };
  }

  function getFilteredMarketPool(marketPoolIds) {
    ensureInit();
    const unlocked = (marketPoolIds || []).filter((id) => data.unlockedCards.includes(id));
    return unlocked.length > 0 ? unlocked : (marketPoolIds || []);
  }

  function resetProgress() {
    data = buildDefaultData(catalogRef, starterDecksRef);
    save();
    return data;
  }

  const api = {
    CARD_BACK_RULES,
    ENEMY_CODEX,
    init,
    getData,
    isCardUnlocked,
    unlockCard,
    isCardBackUnlocked,
    getCardBackRequirement,
    recordRunStart,
    recordFloorReached,
    recordBoosterOpened,
    recordRelicFound,
    recordRelicUsed,
    recordEnemyDefeated,
    getFilteredMarketPool,
    resetProgress
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }
  global.CollectionSystem = api;
})(typeof window !== "undefined" ? window : globalThis);
