// =============================================================================
// DUELFORGE - FTUE (First-Time User Experience)
// Guia interactiva contextual de bajo texto con spotlight y boton para saltar.
// =============================================================================

(function (global) {
  "use strict";

  const STORAGE_KEY = "duelforge_ftue_v1";

  function defaultState() {
    return {
      skipped: false,
      completed: false,
      seen: {
        deckSelect: false,
        boosterPack: false,
        boosterPick: false,
        mapIntro: false,
        combatHand: false,
        combatSummonWait: false,
        combatMarket: false,
        combatEndTurn: false,
        combatReaction: false,
        combatAttack: false,
        restNode: false,
        shopNode: false,
        eventNode: false,
        equipCard: false,
        relicCard: false
      }
    };
  }

  let ftueData = null;
  let activeStep = null;
  let repositionRaf = null;

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        const def = defaultState();
        return {
          skipped: Boolean(parsed.skipped),
          completed: Boolean(parsed.completed),
          seen: { ...def.seen, ...(parsed.seen || {}) }
        };
      }
    } catch (_) {}
    return defaultState();
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(ftueData));
    } catch (_) {}
  }

  ftueData = loadState();

  function isEnabled() {
    return !ftueData.skipped;
  }

  function hasSeen(key) {
    return Boolean(ftueData.seen && ftueData.seen[key]);
  }

  function markSeen(key) {
    if (!ftueData.seen) ftueData.seen = {};
    ftueData.seen[key] = true;
    saveState();
  }

  function getEls() {
    return {
      overlay: document.getElementById("ftue-overlay"),
      spotlight: document.getElementById("ftue-spotlight"),
      popover: document.getElementById("ftue-popover"),
      badge: document.getElementById("ftue-badge"),
      text: document.getElementById("ftue-text"),
      okBtn: document.getElementById("ftue-ok-btn"),
      skipBtn: document.getElementById("ftue-skip-btn"),
      cheatsheet: document.getElementById("ftue-cheatsheet-modal")
    };
  }

  function resolveTarget(selectorOrEl) {
    if (!selectorOrEl) return null;
    if (typeof selectorOrEl === "string") {
      return document.querySelector(selectorOrEl);
    }
    return selectorOrEl;
  }

  function positionStep() {
    if (!activeStep) return;
    const els = getEls();
    if (!els.overlay || els.overlay.classList.contains("hidden")) return;

    const target = resolveTarget(activeStep.target);
    if (!target || target.offsetParent === null) {
      // Target hidden or removed; hide softly without breaking flow
      els.spotlight.style.opacity = "0";
      els.popover.style.left = "50%";
      els.popover.style.top = "18px";
      els.popover.style.transform = "translateX(-50%)";
      return;
    }

    const rect = target.getBoundingClientRect();
    const pad = activeStep.pad ?? 8;
    const sLeft = Math.max(4, rect.left - pad);
    const sTop = Math.max(4, rect.top - pad);
    const sWidth = Math.min(window.innerWidth - sLeft - 4, rect.width + pad * 2);
    const sHeight = Math.min(window.innerHeight - sTop - 4, rect.height + pad * 2);

    els.spotlight.style.opacity = "1";
    els.spotlight.style.left = `${sLeft}px`;
    els.spotlight.style.top = `${sTop}px`;
    els.spotlight.style.width = `${sWidth}px`;
    els.spotlight.style.height = `${sHeight}px`;

    // Position popover near target without overflowing viewport
    els.popover.style.transform = "none";
    const popRect = els.popover.getBoundingClientRect();
    const popW = popRect.width || 310;
    const popH = popRect.height || 110;
    const margin = 14;

    let left = rect.left + rect.width / 2 - popW / 2;
    let top = rect.top - popH - margin;

    if (activeStep.prefer === "bottom" || top < 12) {
      top = rect.bottom + margin;
    }
    if (activeStep.prefer === "left" || (top + popH > window.innerHeight - 12 && rect.left - popW - margin > 12)) {
      left = rect.left - popW - margin;
      top = Math.max(12, Math.min(window.innerHeight - popH - 12, rect.top + rect.height / 2 - popH / 2));
    } else if (activeStep.prefer === "right" && rect.right + popW + margin < window.innerWidth - 12) {
      left = rect.right + margin;
      top = Math.max(12, Math.min(window.innerHeight - popH - 12, rect.top + rect.height / 2 - popH / 2));
    }

    if (top + popH > window.innerHeight - 12) {
      top = Math.max(12, rect.top - popH - margin);
    }
    left = Math.max(12, Math.min(window.innerWidth - popW - 12, left));
    top = Math.max(12, Math.min(window.innerHeight - popH - 12, top));

    els.popover.style.left = `${left}px`;
    els.popover.style.top = `${top}px`;
  }

  function showStep(stepConfig) {
    if (!isEnabled()) return false;
    if (stepConfig.key && hasSeen(stepConfig.key)) return false;

    const els = getEls();
    if (!els.overlay) return false;

    activeStep = stepConfig;
    if (stepConfig.key) markSeen(stepConfig.key);

    els.badge.textContent = stepConfig.badge || "GUIA RAPIDA";
    els.text.textContent = stepConfig.text;

    if (stepConfig.showOk) {
      els.okBtn.textContent = stepConfig.okLabel || "Entendido";
      els.okBtn.classList.remove("hidden");
    } else {
      els.okBtn.classList.add("hidden");
    }

    els.overlay.classList.remove("hidden");
    requestAnimationFrame(() => {
      positionStep();
    });
    return true;
  }

  function dismissCurrent() {
    const els = getEls();
    activeStep = null;
    if (els.overlay) els.overlay.classList.add("hidden");
  }

  function skipAll() {
    ftueData.skipped = true;
    ftueData.completed = true;
    saveState();
    dismissCurrent();
  }

  function reset() {
    ftueData = defaultState();
    saveState();
    dismissCurrent();
  }

  function openCheatsheet() {
    const els = getEls();
    if (!els.cheatsheet) return;
    els.cheatsheet.classList.remove("hidden");
  }

  function closeCheatsheet() {
    const els = getEls();
    if (!els.cheatsheet) return;
    els.cheatsheet.classList.add("hidden");
  }

  function bindUI() {
    const els = getEls();
    els.okBtn?.addEventListener("click", () => {
      const cb = activeStep?.onOk;
      dismissCurrent();
      if (typeof cb === "function") cb();
    });
    els.skipBtn?.addEventListener("click", () => {
      skipAll();
    });
    document.getElementById("ftue-help-btn")?.addEventListener("click", openCheatsheet);
    document.getElementById("ftue-cheatsheet-close")?.addEventListener("click", closeCheatsheet);
    document.getElementById("ftue-cheatsheet-restart")?.addEventListener("click", () => {
      reset();
      closeCheatsheet();
    });
    window.addEventListener("resize", () => {
      if (!activeStep) return;
      if (repositionRaf) cancelAnimationFrame(repositionRaf);
      repositionRaf = requestAnimationFrame(positionStep);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bindUI);
  } else {
    bindUI();
  }

  // ================= PUBLIC LIFECYCLE HOOKS =================
  global.FTUE = {
    isActive: () => Boolean(activeStep),
    isBlockingTimer: () => Boolean(activeStep),
    isReactionPaused: () => Boolean(activeStep && activeStep.key === "combatReaction"),
    isEnabled,
    hasSeen,
    dismiss: dismissCurrent,
    skipAll,
    reset,
    openCheatsheet,

    onDeckSelectOpen() {
      if (!isEnabled() || hasSeen("deckSelect")) return;
      setTimeout(() => {
        showStep({
          key: "deckSelect",
          badge: "PASO 1 - MAZO",
          target: '.deck-choice-card[data-faction="forja"]',
          prefer: "bottom",
          showOk: true,
          okLabel: "Entendido",
          text: "Forja es ideal para empezar. Pasa el raton por cualquier carta para ver que hace."
        });
      }, 120);
    },

    onBoosterOpen(isInitial) {
      if (!isInitial || !isEnabled()) return;
      dismissCurrent();
      if (hasSeen("boosterPack")) return;
      setTimeout(() => {
        showStep({
          key: "boosterPack",
          badge: "PASO 2 - SOBRE",
          target: "#booster-pack-stage",
          prefer: "bottom",
          showOk: false,
          text: "Haz clic en el sobre para abrirlo."
        });
      }, 120);
    },

    onBoosterRevealed(isInitial) {
      if (!isInitial || !isEnabled()) return;
      if (activeStep?.key === "boosterPack") dismissCurrent();
      if (hasSeen("boosterPick")) return;
      setTimeout(() => {
        showStep({
          key: "boosterPick",
          badge: "PASO 2 - SOBRE",
          target: "#booster-choices",
          prefer: "top",
          showOk: false,
          text: "Elige 1 carta permanente para anadirla a tu mazo."
        });
      }, 160);
    },

    onMapOpen(peekOnly) {
      if (peekOnly || !isEnabled()) return;
      if (activeStep?.key === "boosterPick") dismissCurrent();
      if (hasSeen("mapIntro")) return;
      setTimeout(() => {
        const firstNode = document.querySelector(".map-node.available");
        if (!firstNode) return;
        showStep({
          key: "mapIntro",
          badge: "PASO 3 - RUTA",
          target: firstNode,
          prefer: "bottom",
          showOk: false,
          text: "Tu meta es el Jefe arriba. Haz clic en el primer Combate."
        });
      }, 180);
    },

    onCombatTurnStart(state) {
      if (!isEnabled() || !state || state.isPvp) return;
      if (activeStep?.key === "mapIntro" || activeStep?.key === "combatEndTurn") {
        dismissCurrent();
      }

      // Priority 1: Ready unit to attack on Turn 2+
      const readyIdx = state.player.board.findIndex((u) => u && u.ready);
      if (readyIdx !== -1 && !hasSeen("combatAttack")) {
        setTimeout(() => {
          const slotEl = document.querySelector(`#player-slots .unit-slot:nth-child(${readyIdx + 1})`);
          if (!slotEl) return;
          showStep({
            key: "combatAttack",
            badge: "ATAQUE",
            target: slotEl,
            prefer: "top",
            showOk: false,
            text: "Tu unidad ya esta lista. Haz clic en ella para atacar."
          });
        }, 160);
        return;
      }

      // Priority 2: First turn hand + energy
      if (!hasSeen("combatHand")) {
        setTimeout(() => {
          showStep({
            key: "combatHand",
            badge: "COMBATE 1/3",
            target: "#player-hand",
            prefer: "top",
            showOk: false,
            text: "Haz clic en una carta de tu mano para jugarla usando Energia."
          });
        }, 180);
      }
    },

    onCardPlayed(card, state) {
      if (!isEnabled() || !state || state.isPvp) return;
      if (activeStep?.key === "combatHand" || activeStep?.key === "combatMarket") {
        dismissCurrent();
      }

      if (card.type === "Unidad" && !card.haste && !hasSeen("combatSummonWait")) {
        setTimeout(() => {
          showStep({
            key: "combatSummonWait",
            badge: "UNIDADES",
            target: "#player-slots",
            prefer: "top",
            showOk: true,
            okLabel: "Entendido",
            text: "Las unidades descansan 1 turno al entrar (salvo Prisa)."
          });
        }, 140);
        return;
      }

      this.checkCombatContextualTips(state);
    },

    onCardDrawnOrHandCheck(state) {
      if (!isEnabled() || !state || state.isPvp) return;
      const hasEquip = state.player.hand.some((c) => c.type === "Equipo");
      if (hasEquip && !hasSeen("equipCard") && !activeStep) {
        showStep({
          key: "equipCard",
          badge: "EQUIPO",
          target: "#player-hand",
          prefer: "top",
          showOk: true,
          okLabel: "Entendido",
          text: "Equipo: jugalo y luego haz clic en una unidad tuya para mejorarlo."
        });
        return;
      }
      const hasRelic = state.player.hand.some((c) => c.type === "Reliquia");
      if (hasRelic && !hasSeen("relicCard") && !activeStep) {
        showStep({
          key: "relicCard",
          badge: "RELIQUIA",
          target: "#player-relics",
          prefer: "top",
          showOk: true,
          okLabel: "Entendido",
          text: "Reliquia: activa efectos pasivos junto a tu heroe varios turnos."
        });
      }
    },

    checkCombatContextualTips(state) {
      if (!isEnabled() || !state || state.isPvp || activeStep) return;

      // Suggest Market if player has >= 2 gold and hasn't seen Market tip
      if (state.player.gold >= 2 && !hasSeen("combatMarket")) {
        setTimeout(() => {
          showStep({
            key: "combatMarket",
            badge: "MERCADO VIVO",
            target: ".market-sidebar",
            prefer: "left",
            showOk: false,
            text: "Tienes Oro: compra una carta aqui. Va directo a tu mano solo por este combate."
          });
        }, 150);
        return;
      }

      // Suggest End Turn if no playable cards and can't afford cheapest market card
      const canPlayAny = state.player.hand.some((c) => c.cost <= state.player.energy);
      const canAttackAny = state.player.board.some((u) => u && u.ready);
      const canBuyAny = state.marketRow.some((c) => c && (c.goldCost || 2) <= state.player.gold);
      if (!canPlayAny && !canAttackAny && !canBuyAny && !hasSeen("combatEndTurn")) {
        setTimeout(() => {
          showStep({
            key: "combatEndTurn",
            badge: "TURNO",
            target: "#end-turn-btn",
            prefer: "top",
            showOk: false,
            text: "Sin mas jugadas disponibles. Pulsa Fin de Turno."
          });
        }, 150);
      }
    },

    onMarketBought(state) {
      if (!isEnabled() || !state || state.isPvp) return;
      if (activeStep?.key === "combatMarket") {
        dismissCurrent();
      }
      this.checkCombatContextualTips(state);
    },

    onUnitAttacked() {
      if (!isEnabled()) return;
      if (activeStep?.key === "combatAttack") {
        dismissCurrent();
      }
    },

    onTurnEnd() {
      if (activeStep?.key === "combatEndTurn" || activeStep?.key === "combatHand" || activeStep?.key === "combatSummonWait") {
        dismissCurrent();
      }
    },

    onReactionOpen() {
      if (!isEnabled() || hasSeen("combatReaction")) return;
      dismissCurrent();
      setTimeout(() => {
        showStep({
          key: "combatReaction",
          badge: "DEFENSA (PAUSADA)",
          target: "#reaction-banner",
          prefer: "bottom",
          showOk: false,
          text: "El rival ataca: haz clic en una unidad tuya para bloquear o pulsa Dejar Pasar."
        });
      }, 100);
    },

    onReactionResolved() {
      if (activeStep?.key === "combatReaction") {
        dismissCurrent();
        ftueData.completed = true;
        saveState();
      }
    },

    onRestOpen() {
      if (!isEnabled() || hasSeen("restNode")) return;
      setTimeout(() => {
        showStep({
          key: "restNode",
          badge: "DESCANSO",
          target: "#rest-fire-choices",
          prefer: "bottom",
          showOk: true,
          okLabel: "Entendido",
          text: "Elige una ventaja en la hoguera o abre el Inventario para apartar cartas."
        });
      }, 150);
    },

    onShopOpen() {
      if (!isEnabled() || hasSeen("shopNode")) return;
      setTimeout(() => {
        showStep({
          key: "shopNode",
          badge: "TIENDA",
          target: "#shop-cards-grid",
          prefer: "top",
          showOk: true,
          okLabel: "Entendido",
          text: "Aqui gastas tu Oro de Run en cartas y mejoras permanentes."
        });
      }, 150);
    },

    onEventOpen() {
      if (!isEnabled() || hasSeen("eventNode")) return;
      setTimeout(() => {
        showStep({
          key: "eventNode",
          badge: "EVENTO",
          target: "#event-choices",
          prefer: "top",
          showOk: true,
          okLabel: "Entendido",
          text: "Cada opcion tiene riesgo y recompensa. Elige tu camino."
        });
      }, 150);
    }
  };
})(window);
