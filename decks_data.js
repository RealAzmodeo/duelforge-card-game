// Duelforge - 5 Slots de Decks Iniciales (10 cartas cada uno)
// Cada mazo tiene una personalidad distinta para PvP y para inicio aleatorio vs IA.

window.STARTER_DECKS = [
  {
    id: "vanguardia",
    name: "Vanguardia Clasica",
    archetype: "Equilibrado",
    tagline: "Versatil y estable: dano directo, defensa y presencia en mesa.",
    accent: "#3b82f6",
    cards: [
      "golpe", "golpe", "golpe", "golpe",
      "escudo", "escudo", "escudo",
      "mercenario", "mercenario",
      "moneda"
    ]
  },
  {
    id: "asalto",
    name: "Furia de Asalto",
    archetype: "Agresivo",
    tagline: "Presion temprana al Heroe rival con unidades rapidas y ataque extra.",
    accent: "#ef4444",
    cards: [
      "golpe", "golpe", "golpe", "golpe",
      "mercenario", "mercenario", "mercenario",
      "goblin",
      "furia",
      "escudo"
    ]
  },
  {
    id: "muralla",
    name: "Muralla de Hierro",
    archetype: "Defensivo",
    tagline: "Guardias resistentes, armadura constante y curacion para desgastar.",
    accent: "#10b981",
    cards: [
      "escudo", "escudo", "escudo",
      "escudero", "escudero",
      "golem",
      "golpe", "golpe",
      "pocion",
      "moneda"
    ]
  },
  {
    id: "gremio",
    name: "Gremio Mercader",
    archetype: "Economia",
    tagline: "Genera oro rapido para dominar las mejores cartas del Mercado Vivo.",
    accent: "#f59e0b",
    cards: [
      "moneda", "moneda", "moneda",
      "mercader", "mercader",
      "lingote",
      "golpe", "golpe",
      "escudo", "escudo"
    ]
  },
  {
    id: "arcano",
    name: "Arcano Reactivo",
    archetype: "Control",
    tagline: "Responde en el turno rival con trucos de Reaccion y robo de cartas.",
    accent: "#8b5cf6",
    cards: [
      "escudo", "escudo",
      "hielo", "hielo",
      "drenaje",
      "golpe", "golpe", "golpe",
      "cristalomante",
      "mercenario"
    ]
  }
];

window.getRandomStarterDeck = function () {
  const list = window.STARTER_DECKS || [];
  if (!list.length) return null;
  return list[Math.floor(Math.random() * list.length)];
};

window.getStarterDeckById = function (deckId) {
  const list = window.STARTER_DECKS || [];
  return list.find((d) => d.id === deckId) || list[0] || null;
};
