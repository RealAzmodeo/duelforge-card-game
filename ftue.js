// =============================================================================
// DUELFORGE - FTUE (First-Time User Experience)
// Guia interactiva contextual de bajo texto con spotlight y boton para saltar.
// =============================================================================

(function (global) {
  "use strict";

  const STORAGE_KEY = "duelforge_ftue_v1";

  const BLOCKING_OVERLAY_IDS = [
    "title-screen",
    "deck-select-screen",
    "booster-modal",
    "map-screen",
    "rest-screen",
    "shop-modal",
    "event-modal",
    "collection-screen",
    "inventory-modal",
    "vs-lobby-modal",
    "game-over-modal"
  ];

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
  let activeStepPreview = false;
  let pendingTimer = null;
  let trackingRaf = null;
  let lastLayoutSig = "";

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

  function isVisible(id) {
    const el = document.getElementById(id);
    return Boolean(el && !el.classList.contains("hidden"));
  }

  function isCombatScreenVisible() {
    return !BLOCKING_OVERLAY_IDS.some(isVisible);
  }

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

  function clearPendingTimer() {
    if (pendingTimer) {
      clearTimeout(pendingTimer);
      pendingTimer = null;
    }
  }

  function scheduleStep(delayMs, fn) {
    clearPendingTimer();
    pendingTimer = setTimeout(() => {
      pendingTimer = null;
      fn();
    }, delayMs);
  }

  function getEls() {
    return {
      overlay: document.getElementById("ftue-overlay"),
      spotlight: document.getElementById("ftue-spotlight"),
      pointer: document.getElementById("ftue-pointer"),
      popover: document.getElementById("ftue-popover"),
      badge: document.getElementById("ftue-badge"),
      text: document.getElementById("ftue-text"),
      okBtn: document.getElementById("ftue-ok-btn"),
      skipBtn: document.getElementById("ftue-skip-btn"),
      cheatsheet: document.getElementById("ftue-cheatsheet-modal")
    };
  }

  function resolveTargets(targetSpec, targetAll = false) {
    const spec = typeof targetSpec === "function" ? targetSpec() : targetSpec;
    if (!spec) return [];

    const rawList = Array.isArray(spec) ? spec : [spec];
    const elements = [];

    for (const item of rawList) {
      if (!item) continue;
      if (typeof item === "string") {
        if (targetAll) {
          document.querySelectorAll(item).forEach((el) => {
            if (!elements.includes(el)) elements.push(el);
          });
        } else {
          const el = document.querySelector(item);
          if (el && !elements.includes(el)) elements.push(el);
        }
      } else if (item instanceof Element) {
        if (!elements.includes(item)) elements.push(item);
      }
    }

    return elements.filter((el) => {
      const r = el.getBoundingClientRect();
      return r.width > 0 && r.height > 0;
    });
  }

  function computeUnionRect(elements) {
    if (!elements || elements.length === 0) return null;
    let left = Infinity;
    let top = Infinity;
    let right = -Infinity;
    let bottom = -Infinity;

    for (const el of elements) {
      const r = el.getBoundingClientRect();
      if (r.width === 0 && r.height === 0) continue;
      if (r.left < left) left = r.left;
      if (r.top < top) top = r.top;
      if (r.right > right) right = r.right;
      if (r.bottom > bottom) bottom = r.bottom;
    }

    if (!Number.isFinite(left)) return null;
    return {
      left,
      top,
      right,
      bottom,
      width: Math.max(0, right - left),
      height: Math.max(0, bottom - top)
    };
  }

  function rectsIntersect(a, b) {
    if (!a || !b) return false;
    return !(a.right <= b.left || a.left >= b.right || a.bottom <= b.top || a.top >= b.bottom);
  }

  function intersectionArea(a, b) {
    if (!rectsIntersect(a, b)) return 0;
    const w = Math.min(a.right, b.right) - Math.max(a.left, b.left);
    const h = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
    return Math.max(0, w) * Math.max(0, h);
  }

  function hasCustomPopoverLayout(stepKey) {
    const layout = global.SCENE_LAYOUT || {};
    return Boolean(
      layout["#ftue-popover"] ||
      (stepKey && layout[`#ftue-overlay[data-ftue-step="${stepKey}"] #ftue-popover`])
    );
  }

  function autoDockPopover(els, spotRect, pointerBox) {
    if (!els.popover || hasCustomPopoverLayout(activeStep?.key)) return;

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const popW = Math.min(510, vw - 32);
    const bubbleH = els.popover.querySelector(".ftue-bubble-box")?.offsetHeight || 140;
    const bottomH = Math.max(224, bubbleH + 34);
    const topH = Math.max(164, bubbleH + 24);

    const avoidSpotlight = {
      left: spotRect.left - 10,
      top: spotRect.top - 10,
      right: spotRect.right + 10,
      bottom: spotRect.bottom + 10
    };
    const avoidPointer = pointerBox
      ? {
          left: pointerBox.left - 6,
          top: pointerBox.top - 6,
          right: pointerBox.right + 6,
          bottom: pointerBox.bottom + 6
        }
      : null;

    const candidates = [
      {
        classes: [],
        box: { left: 16, top: vh - bottomH, right: 16 + popW, bottom: vh }
      },
      {
        classes: ["dock-right"],
        box: { left: vw - 16 - popW, top: vh - bottomH, right: vw - 16, bottom: vh }
      },
      {
        classes: ["dock-top"],
        box: { left: 16, top: 16, right: 16 + popW, bottom: 16 + topH }
      },
      {
        classes: ["dock-top", "dock-right"],
        box: { left: vw - 16 - popW, top: 16, right: vw - 16, bottom: 16 + topH }
      }
    ];

    let chosen = candidates[0];
    let bestOverlap = Infinity;

    for (const cand of candidates) {
      const overlap =
        intersectionArea(cand.box, avoidSpotlight) +
        (avoidPointer ? intersectionArea(cand.box, avoidPointer) : 0);
      if (overlap === 0) {
        chosen = cand;
        break;
      }
      if (overlap < bestOverlap) {
        bestOverlap = overlap;
        chosen = cand;
      }
    }

    els.popover.classList.remove("dock-right", "dock-top");
    if (chosen.classes.length > 0) {
      els.popover.classList.add(...chosen.classes);
    }
  }

  function positionStep() {
    if (!activeStep) return;
    const els = getEls();
    if (!els.overlay || els.overlay.classList.contains("hidden")) return;

    if (!activeStepPreview && typeof activeStep.isValidContext === "function" && !activeStep.isValidContext()) {
      dismissCurrent();
      return;
    }

    els.popover.style.left = "";
    els.popover.style.top = "";
    els.popover.style.transform = "";

    const targets = resolveTargets(activeStep.target, Boolean(activeStep.targetAll));
    const rect = computeUnionRect(targets);
    if (!rect || (rect.width === 0 && rect.height === 0)) {
      els.spotlight.style.opacity = "0";
      els.pointer?.classList.add("hidden");
      if (!hasCustomPopoverLayout(activeStep.key)) {
        els.popover.classList.remove("dock-right", "dock-top");
      }
      lastLayoutSig = "";
      return;
    }

    const pad = activeStep.pad ?? 8;
    const sLeft = Math.max(4, rect.left - pad);
    const sTop = Math.max(4, rect.top - pad);
    const sWidth = Math.min(window.innerWidth - sLeft - 4, rect.width + pad * 2);
    const sHeight = Math.min(window.innerHeight - sTop - 4, rect.height + pad * 2);

    const pTargets = activeStep.pointerTarget
      ? resolveTargets(activeStep.pointerTarget, false)
      : targets;
    const pRectRaw = computeUnionRect(pTargets) || rect;
    const pLeft = Math.max(4, pRectRaw.left - pad);
    const pTop = Math.max(4, pRectRaw.top - pad);
    const pWidth = Math.min(window.innerWidth - pLeft - 4, pRectRaw.width + pad * 2);
    const pHeight = Math.min(window.innerHeight - pTop - 4, pRectRaw.height + pad * 2);

    const sig = [
      activeStep.key || "",
      Math.round(sLeft),
      Math.round(sTop),
      Math.round(sWidth),
      Math.round(sHeight),
      Math.round(pLeft),
      Math.round(pTop),
      Math.round(pWidth),
      Math.round(pHeight),
      window.innerWidth,
      window.innerHeight
    ].join(":");

    if (sig === lastLayoutSig) return;
    lastLayoutSig = sig;

    els.spotlight.style.opacity = "1";
    els.spotlight.style.left = `${sLeft}px`;
    els.spotlight.style.top = `${sTop}px`;
    els.spotlight.style.width = `${sWidth}px`;
    els.spotlight.style.height = `${sHeight}px`;

    let pointerBox = null;
    if (els.pointer) {
      els.pointer.classList.remove("hidden", "dir-down", "dir-up", "dir-left", "dir-right");
      if (pTop > 64) {
        const cx = Math.round(pLeft + pWidth / 2);
        const top = Math.round(pTop - 52);
        els.pointer.classList.add("dir-down");
        els.pointer.style.left = `${cx}px`;
        els.pointer.style.top = `${top}px`;
        pointerBox = { left: cx - 22, top: top - 10, right: cx + 22, bottom: top + 44 };
      } else if (pTop + pHeight + 64 < window.innerHeight) {
        const cx = Math.round(pLeft + pWidth / 2);
        const top = Math.round(pTop + pHeight + 8);
        els.pointer.classList.add("dir-up");
        els.pointer.style.left = `${cx}px`;
        els.pointer.style.top = `${top}px`;
        pointerBox = { left: cx - 22, top, right: cx + 22, bottom: top + 54 };
      } else if (pLeft > 64) {
        const left = Math.round(pLeft - 52);
        const cy = Math.round(pTop + pHeight / 2);
        els.pointer.classList.add("dir-right");
        els.pointer.style.left = `${left}px`;
        els.pointer.style.top = `${cy}px`;
        pointerBox = { left: left - 10, top: cy - 22, right: left + 44, bottom: cy + 22 };
      } else {
        const left = Math.round(pLeft + pWidth + 8);
        const cy = Math.round(pTop + pHeight / 2);
        els.pointer.classList.add("dir-left");
        els.pointer.style.left = `${left}px`;
        els.pointer.style.top = `${cy}px`;
        pointerBox = { left, top: cy - 22, right: left + 54, bottom: cy + 22 };
      }
    }

    autoDockPopover(
      els,
      { left: sLeft, top: sTop, right: sLeft + sWidth, bottom: sTop + sHeight },
      pointerBox
    );
  }

  function startTrackingLoop() {
    if (trackingRaf) return;
    const tick = () => {
      if (!activeStep) {
        trackingRaf = null;
        return;
      }
      positionStep();
      trackingRaf = requestAnimationFrame(tick);
    };
    trackingRaf = requestAnimationFrame(tick);
  }

  function stopTrackingLoop() {
    if (trackingRaf) {
      cancelAnimationFrame(trackingRaf);
      trackingRaf = null;
    }
  }

  function renderStepUI(stepConfig, { isPreview = false } = {}) {
    const els = getEls();
    if (!els.overlay) return false;

    const wasHidden = els.overlay.classList.contains("hidden");
    const stepChanged = activeStep?.key !== stepConfig.key;

    activeStep = stepConfig;
    activeStepPreview = isPreview;
    lastLayoutSig = "";

    els.overlay.dataset.ftueStep = stepConfig.key || "";
    els.badge.textContent = stepConfig.badge || "GUIA RAPIDA";
    els.text.textContent = stepConfig.text;

    if (stepConfig.showOk) {
      els.okBtn.textContent = stepConfig.okLabel || "Entendido";
      els.okBtn.classList.remove("hidden");
    } else {
      els.okBtn.classList.add("hidden");
    }

    if ((wasHidden || stepChanged) && els.spotlight) {
      els.spotlight.classList.add("no-transition");
    }

    els.overlay.classList.remove("hidden");
    if (typeof global.applySceneLayout === "function") {
      global.applySceneLayout();
    }

    positionStep();

    requestAnimationFrame(() => {
      els.spotlight?.classList.remove("no-transition");
      positionStep();
    });

    startTrackingLoop();
    return true;
  }

  function showStep(stepConfig) {
    if (!isEnabled()) return false;
    if (stepConfig.key && hasSeen(stepConfig.key)) return false;
    if (typeof stepConfig.isValidContext === "function" && !stepConfig.isValidContext()) {
      return false;
    }

    clearPendingTimer();
    if (stepConfig.key) markSeen(stepConfig.key);
    return renderStepUI(stepConfig, { isPreview: false });
  }

  function previewStep(stepConfig) {
    clearPendingTimer();
    if (!stepConfig) {
      dismissCurrent();
      return false;
    }
    return renderStepUI(stepConfig, { isPreview: true });
  }

  function dismissCurrent() {
    clearPendingTimer();
    stopTrackingLoop();
    const els = getEls();
    activeStep = null;
    activeStepPreview = false;
    lastLayoutSig = "";
    if (els.overlay) {
      els.overlay.classList.add("hidden");
      delete els.overlay.dataset.ftueStep;
    }
    if (els.spotlight) {
      els.spotlight.style.opacity = "0";
    }
    els.pointer?.classList.add("hidden");
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

  function triggerCurrentScreenStep() {
    if (!isEnabled()) return;
    if (isVisible("deck-select-screen") && !isVisible("collection-screen")) {
      global.FTUE?.onDeckSelectOpen();
    } else if (isVisible("booster-modal")) {
      if (isVisible("booster-choices")) global.FTUE?.onBoosterRevealed(true);
      else global.FTUE?.onBoosterOpen(true);
    } else if (isVisible("map-screen") && !isVisible("inventory-modal")) {
      const isPeek = isVisible("map-close-btn");
      if (!isPeek) global.FTUE?.onMapOpen(false);
    } else if (isVisible("rest-screen") && !isVisible("inventory-modal")) {
      global.FTUE?.onRestOpen();
    } else if (isVisible("shop-modal")) {
      global.FTUE?.onShopOpen();
    } else if (isVisible("event-modal")) {
      global.FTUE?.onEventOpen();
    } else if (isCombatScreenVisible() && global.state && !global.state.isPvp && !global.state.gameOver) {
      if (global.state.reactionWindow) {
        global.FTUE?.onReactionOpen();
      } else if (global.state.isPlayerTurn) {
        global.FTUE?.onCombatTurnStart(global.state);
      }
    }
  }

  function canAffordMarketCard(state) {
    if (!state || !Array.isArray(state.marketRow)) return false;
    const discount = (state.player?.relics || []).reduce((sum, r) => sum + (r?.marketDiscount || 0), 0);
    return state.marketRow.some((c) => {
      if (!c) return false;
      const base = c.goldCost || 0;
      const price = base > 0 ? Math.max(1, base - discount) : 0;
      return price <= state.player.gold;
    });
  }

  function bindUI() {
    const els = getEls();
    els.okBtn?.addEventListener("click", () => {
      const prevKey = activeStep?.key;
      const cb = activeStep?.onOk;
      dismissCurrent();
      if (typeof cb === "function") cb();
      if (
        ["combatSummonWait", "equipCard", "relicCard"].includes(prevKey) &&
        global.state &&
        global.runState?.inCombat &&
        !global.state.gameOver &&
        global.state.isPlayerTurn &&
        !global.state.reactionWindow
      ) {
        global.FTUE?.checkCombatContextualTips(global.state);
      }
    });
    els.skipBtn?.addEventListener("click", () => {
      skipAll();
    });
    document.getElementById("ftue-help-btn")?.addEventListener("click", openCheatsheet);
    document.getElementById("ftue-cheatsheet-close")?.addEventListener("click", closeCheatsheet);
    document.getElementById("ftue-cheatsheet-restart")?.addEventListener("click", () => {
      reset();
      closeCheatsheet();
      triggerCurrentScreenStep();
    });

    const handleViewportUpdate = () => {
      if (!activeStep) return;
      lastLayoutSig = "";
      positionStep();
    };
    window.addEventListener("resize", handleViewportUpdate);
    window.addEventListener("scroll", handleViewportUpdate, true);
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
    previewStep,
    reposition: () => {
      lastLayoutSig = "";
      positionStep();
    },
    skipAll,
    reset,
    openCheatsheet,

    onDeckSelectOpen() {
      dismissCurrent();
      if (!isEnabled() || hasSeen("deckSelect")) return;
      scheduleStep(120, () => {
        showStep({
          key: "deckSelect",
          badge: "PASO 1 - MAZO",
          target: '.deck-choice-card[data-faction="forja"]',
          prefer: "bottom",
          showOk: true,
          okLabel: "Entendido",
          isValidContext: () => isVisible("deck-select-screen") && !isVisible("collection-screen"),
          text: "Forja es ideal para empezar. Pasa el raton por cualquier carta para ver que hace."
        });
      });
    },

    onBoosterOpen(isInitial) {
      dismissCurrent();
      if (!isInitial || !isEnabled() || hasSeen("boosterPack")) return;
      scheduleStep(120, () => {
        showStep({
          key: "boosterPack",
          badge: "PASO 2 - SOBRE",
          target: "#booster-pack-stage",
          prefer: "bottom",
          showOk: false,
          isValidContext: () => isVisible("booster-modal") && isVisible("booster-pack-stage"),
          text: "Haz clic en el sobre para abrirlo."
        });
      });
    },

    onBoosterRevealed(isInitial) {
      if (activeStep?.key === "boosterPack") dismissCurrent();
      if (!isInitial || !isEnabled() || hasSeen("boosterPick")) return;
      scheduleStep(160, () => {
        showStep({
          key: "boosterPick",
          badge: "PASO 2 - SOBRE",
          target: "#booster-choices",
          prefer: "top",
          showOk: false,
          isValidContext: () => isVisible("booster-modal") && isVisible("booster-choices"),
          text: "Elige 1 carta permanente para anadirla a tu mazo."
        });
      });
    },

    onMapOpen(peekOnly) {
      dismissCurrent();
      if (peekOnly || !isEnabled() || hasSeen("mapIntro")) return;
      scheduleStep(180, () => {
        const firstNode = document.querySelector(".map-node.available");
        if (!firstNode) return;
        showStep({
          key: "mapIntro",
          badge: "PASO 3 - RUTA",
          target: ".map-node.available",
          targetAll: true,
          prefer: "bottom",
          showOk: false,
          isValidContext: () => isVisible("map-screen") && !isVisible("inventory-modal"),
          text: "Tu meta es el Jefe arriba. Haz clic en el primer Combate."
        });
      });
    },

    onCombatTurnStart(state) {
      dismissCurrent();
      if (!isEnabled() || !state || state.isPvp || state.gameOver) return;
      if (!isCombatScreenVisible()) return;

      // Priority 1: Ready unit to attack on Turn 2+
      const readyIdx = state.player.board.findIndex((u) => u && u.ready);
      if (readyIdx !== -1 && !hasSeen("combatAttack")) {
        scheduleStep(160, () => {
          const slotEl = document.querySelector(`#player-slots .unit-slot:nth-child(${readyIdx + 1})`);
          if (!slotEl) return;
          showStep({
            key: "combatAttack",
            badge: "ATAQUE",
            target: slotEl,
            prefer: "top",
            showOk: false,
            isValidContext: () => isCombatScreenVisible() && Boolean(global.state?.isPlayerTurn) && !global.state?.reactionWindow,
            text: "Tu unidad ya esta lista. Haz clic en ella para atacar."
          });
        });
        return;
      }

      // Priority 2: First turn hand + energy
      if (!hasSeen("combatHand")) {
        scheduleStep(180, () => {
          showStep({
            key: "combatHand",
            badge: "COMBATE 1/3",
            target: "#player-hand",
            prefer: "top",
            showOk: false,
            isValidContext: () => isCombatScreenVisible() && Boolean(global.state?.isPlayerTurn) && !global.state?.reactionWindow,
            text: "Haz clic en una carta de tu mano para jugarla usando Energia."
          });
        });
        return;
      }

      this.checkCombatContextualTips(state);
    },

    onCardPlayed(card, state) {
      if (!isEnabled() || !state || state.isPvp || state.gameOver) return;
      if (["combatHand", "combatMarket", "combatSummonWait", "equipCard", "relicCard", "combatAttack"].includes(activeStep?.key)) {
        dismissCurrent();
      }

      if (card.type === "Unidad" && !card.haste && !hasSeen("combatSummonWait")) {
        scheduleStep(140, () => {
          showStep({
            key: "combatSummonWait",
            badge: "UNIDADES",
            target: "#player-slots",
            prefer: "top",
            showOk: true,
            okLabel: "Entendido",
            isValidContext: () => isCombatScreenVisible() && Boolean(global.state?.isPlayerTurn) && !global.state?.reactionWindow,
            text: "Las unidades descansan 1 turno al entrar (salvo Prisa)."
          });
        });
        return;
      }

      if (card.type === "Reliquia" && !hasSeen("relicCard")) {
        scheduleStep(140, () => {
          showStep({
            key: "relicCard",
            badge: "RELIQUIA",
            target: "#player-relics",
            prefer: "top",
            showOk: true,
            okLabel: "Entendido",
            isValidContext: () => isCombatScreenVisible() && Boolean(global.state?.isPlayerTurn),
            text: "Reliquia: activa efectos pasivos junto a tu heroe varios turnos."
          });
        });
        return;
      }

      this.checkCombatContextualTips(state);
    },

    onCardDrawnOrHandCheck(state) {
      if (!isEnabled() || !state || state.isPvp || state.gameOver) return false;
      if (!isCombatScreenVisible() || !state.isPlayerTurn || state.reactionWindow) return false;
      if (activeStep || pendingTimer) return false;

      const hasAlly = state.player.board.some(Boolean);
      const hasEquip = state.player.hand.some((c) => c.type === "Equipo" && c.cost <= state.player.energy);
      if (hasAlly && hasEquip && !hasSeen("equipCard")) {
        return showStep({
          key: "equipCard",
          badge: "EQUIPO",
          target: "#player-hand",
          prefer: "top",
          showOk: true,
          okLabel: "Entendido",
          isValidContext: () => isCombatScreenVisible() && Boolean(global.state?.isPlayerTurn) && !global.state?.reactionWindow,
          text: "Equipo: jugalo y luego haz clic en una unidad tuya para mejorarlo."
        });
      }

      const hasRelic = state.player.hand.some((c) => c.type === "Reliquia" && c.cost <= state.player.energy);
      if (hasRelic && !hasSeen("relicCard")) {
        return showStep({
          key: "relicCard",
          badge: "RELIQUIA",
          target: "#player-relics",
          prefer: "top",
          showOk: true,
          okLabel: "Entendido",
          isValidContext: () => isCombatScreenVisible() && Boolean(global.state?.isPlayerTurn) && !global.state?.reactionWindow,
          text: "Reliquia: activa efectos pasivos junto a tu heroe varios turnos."
        });
      }

      return false;
    },

    checkCombatContextualTips(state) {
      if (!isEnabled() || !state || state.isPvp || state.gameOver) return;
      if (!isCombatScreenVisible() || !state.isPlayerTurn || state.reactionWindow) return;
      if (activeStep || pendingTimer) return;

      // Priority 1: Suggest Market if player has >= 2 gold and can buy a card
      if (state.player.gold >= 2 && canAffordMarketCard(state) && !hasSeen("combatMarket")) {
        scheduleStep(150, () => {
          showStep({
            key: "combatMarket",
            badge: "MERCADO VIVO",
            target: ".market-sidebar",
            prefer: "left",
            showOk: false,
            isValidContext: () => isCombatScreenVisible() && Boolean(global.state?.isPlayerTurn) && !global.state?.reactionWindow,
            text: "Tienes Oro: compra una carta aqui. Va directo a tu mano solo por este combate."
          });
        });
        return;
      }

      // Priority 2: Explain Equipo or Reliquia if held and usable
      if (this.onCardDrawnOrHandCheck(state)) {
        return;
      }

      // Priority 3: Suggest End Turn if no playable cards, no ready units, no pending equip, and can't afford market card
      const canPlayAny = state.player.hand.some((c) => {
        if (c.cost > state.player.energy) return false;
        if (c.type === "Equipo" && !state.player.board.some(Boolean)) return false;
        if (c.type === "Unidad" && !state.player.board.some((u) => u === null)) return false;
        if (c.type === "Reliquia" && !state.player.relics.some((r) => r === null)) return false;
        return true;
      });
      const canAttackAny = state.player.board.some((u) => u && u.ready);
      const canBuyAny = canAffordMarketCard(state);
      if (!canPlayAny && !canAttackAny && !canBuyAny && !state.pendingEquip && !hasSeen("combatEndTurn")) {
        scheduleStep(150, () => {
          showStep({
            key: "combatEndTurn",
            badge: "TURNO",
            target: "#end-turn-btn",
            prefer: "top",
            showOk: false,
            isValidContext: () => isCombatScreenVisible() && Boolean(global.state?.isPlayerTurn) && !global.state?.reactionWindow,
            text: "Sin mas jugadas disponibles. Pulsa Fin de Turno."
          });
        });
      }
    },

    onMarketBought(state) {
      if (!isEnabled() || !state || state.isPvp) return;
      if (["combatMarket", "combatHand", "combatSummonWait", "equipCard", "relicCard"].includes(activeStep?.key)) {
        dismissCurrent();
      }
      this.checkCombatContextualTips(state);
    },

    onUnitSelectedForAttack() {
      if (!isEnabled()) return;
      if (activeStep?.key === "combatAttack") {
        dismissCurrent();
      }
    },

    onUnitAttacked() {
      if (!isEnabled()) return;
      if (activeStep?.key === "combatAttack") {
        dismissCurrent();
      }
      setTimeout(() => {
        if (global.state && !global.state.gameOver && global.state.isPlayerTurn && isCombatScreenVisible()) {
          this.checkCombatContextualTips(global.state);
        }
      }, 220);
    },

    onTurnEnd() {
      if (["combatEndTurn", "combatHand", "combatSummonWait", "combatMarket", "combatAttack", "equipCard", "relicCard"].includes(activeStep?.key)) {
        dismissCurrent();
      }
      clearPendingTimer();
    },

    onReactionOpen() {
      dismissCurrent();
      if (!isEnabled() || hasSeen("combatReaction")) return;
      scheduleStep(100, () => {
        showStep({
          key: "combatReaction",
          badge: "DEFENSA (PAUSADA)",
          target: () => {
            const hasUnits = document.querySelectorAll("#player-slots .unit-token").length > 0;
            return hasUnits ? ["#reaction-banner", "#player-slots .unit-token"] : "#reaction-banner";
          },
          targetAll: true,
          pointerTarget: "#reaction-banner",
          prefer: "bottom",
          showOk: false,
          isValidContext: () => isCombatScreenVisible() && Boolean(global.state?.reactionWindow),
          text: "El rival ataca: haz clic en una unidad tuya para bloquear o pulsa Dejar Pasar."
        });
      });
    },

    onReactionResolved() {
      if (activeStep?.key === "combatReaction") {
        dismissCurrent();
        ftueData.completed = true;
        saveState();
      }
    },

    onRestOpen() {
      dismissCurrent();
      if (!isEnabled() || hasSeen("restNode")) return;
      scheduleStep(150, () => {
        showStep({
          key: "restNode",
          badge: "DESCANSO",
          target: "#rest-fire-choices",
          prefer: "bottom",
          showOk: true,
          okLabel: "Entendido",
          isValidContext: () => isVisible("rest-screen") && !isVisible("inventory-modal"),
          text: "Elige una ventaja en la hoguera o abre el Inventario para apartar cartas."
        });
      });
    },

    onShopOpen() {
      dismissCurrent();
      if (!isEnabled() || hasSeen("shopNode")) return;
      scheduleStep(150, () => {
        showStep({
          key: "shopNode",
          badge: "TIENDA",
          target: "#shop-cards-grid",
          prefer: "top",
          showOk: true,
          okLabel: "Entendido",
          isValidContext: () => isVisible("shop-modal"),
          text: "Aqui gastas tu Oro de Run en cartas y mejoras permanentes."
        });
      });
    },

    onEventOpen() {
      dismissCurrent();
      if (!isEnabled() || hasSeen("eventNode")) return;
      scheduleStep(150, () => {
        showStep({
          key: "eventNode",
          badge: "EVENTO",
          target: "#event-choices",
          prefer: "top",
          showOk: true,
          okLabel: "Entendido",
          isValidContext: () => isVisible("event-modal"),
          text: "Cada opcion tiene riesgo y recompensa. Elige tu camino."
        });
      });
    }
  };
})(window);
