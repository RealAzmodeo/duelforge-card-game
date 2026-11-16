// Duelforge - Motor de Duelo VS Online (Host-Authoritative sobre PeerJS) + Lobby de 5 Slots

(function () {
  const PVP_TURN_DURATION = 35;

  const lobby = {
    selectedDeckId: (window.STARTER_DECKS && window.STARTER_DECKS[0]?.id) || "vanguardia",
    myReady: false,
    rivalReady: false,
    rivalDeckId: null,
    connected: false
  };

  let pvpMatch = null;
  let hostReactionTimer = null;
  let guestReactionTimer = null;

  function sanitizeCard(card) {
    if (!card) return null;
    return {
      id: card.id,
      uid: card.uid,
      name: card.name,
      type: card.type,
      rarity: card.rarity,
      art: card.art,
      cost: card.cost,
      goldCost: card.goldCost,
      atk: card.atk,
      hp: card.hp,
      guard: Boolean(card.guard),
      haste: Boolean(card.haste),
      reaction: Boolean(card.reaction),
      stealth: Boolean(card.stealth),
      pierce: Boolean(card.pierce),
      upkeep: card.upkeep || 0,
      onDeath: card.onDeath || null,
      shortTag: card.shortTag,
      desc: card.desc,
      vfxType: card.vfxType || "beam",
      ephemeral: Boolean(card.ephemeral),
      justDrawn: Boolean(card.justDrawn)
    };
  }

  function sanitizeUnit(unit) {
    if (!unit) return null;
    return {
      name: unit.name,
      art: unit.art,
      atk: unit.atk,
      hp: unit.hp,
      maxHp: unit.maxHp,
      guard: Boolean(unit.guard),
      ready: Boolean(unit.ready),
      stealth: Boolean(unit.stealth),
      pierce: Boolean(unit.pierce),
      stunned: Boolean(unit.stunned),
      onDeath: unit.onDeath || null,
      upkeep: unit.upkeep || 0,
      ephemeral: Boolean(unit.ephemeral)
    };
  }

  function createPvpSide(deckId, label) {
    const deckDef = window.getStarterDeckById ? window.getStarterDeckById(deckId) : null;
    const cardIds = deckDef ? deckDef.cards : ["golpe", "golpe", "golpe", "golpe", "escudo", "escudo", "escudo", "mercenario", "mercenario", "moneda"];
    const deck = shuffle(cardIds).map((id) => createCardInstance(id, false));
    return {
      name: label + (deckDef ? ` (${deckDef.name})` : ""),
      avatar: "assets/heroes/player_hero.png",
      cardBack: "assets/ui/card_back_enemy.png",
      hp: 30,
      maxHp: 30,
      armor: 0,
      energy: 3,
      maxEnergy: 3,
      gold: 0,
      deck,
      hand: [],
      discard: [],
      board: [null, null, null]
    };
  }

  function drawForSide(sideObj, count) {
    for (let i = 0; i < count; i++) {
      if (sideObj.deck.length === 0) {
        if (sideObj.discard.length === 0) break;
        sideObj.deck = shuffle(sideObj.discard);
        sideObj.discard = [];
      }
      const drawn = sideObj.deck.pop();
      drawn.justDrawn = true;
      sideObj.hand.push(drawn);
    }
  }

  function buildViewForSide(viewerSide, hintText = "") {
    const otherSide = viewerSide === "p1" ? "p2" : "p1";
    const me = pvpMatch[viewerSide];
    const rival = pvpMatch[otherSide];
    const isMyTurn = pvpMatch.activeSide === viewerSide;
    const reactionForMe =
      pvpMatch.pendingReaction && pvpMatch.pendingReaction.targetSide === viewerSide
        ? { ...pvpMatch.pendingReaction }
        : null;

    return {
      isPvp: true,
      viewerSide,
      turn: pvpMatch.turn,
      isPlayerTurn: isMyTurn,
      selectedUnitIndex: null,
      gameOver: pvpMatch.gameOver,
      winnerSide: pvpMatch.winnerSide,
      hintText,
      pendingReactionForMe: reactionForMe,
      waitingForRivalReaction: Boolean(pvpMatch.pendingReaction && !reactionForMe),
      player: {
        hp: me.hp,
        maxHp: me.maxHp,
        armor: me.armor,
        energy: me.energy,
        maxEnergy: me.maxEnergy,
        gold: me.gold,
        deck: me.deck.map(sanitizeCard),
        hand: me.hand.map(sanitizeCard),
        discard: me.discard.map(sanitizeCard),
        board: me.board.map(sanitizeUnit)
      },
      enemy: {
        name: rival.name,
        avatar: "assets/heroes/enemy_hero.png",
        cardBack: "assets/ui/card_back_enemy.png",
        hp: rival.hp,
        maxHp: rival.maxHp,
        armor: rival.armor,
        handCount: rival.hand.length,
        deckCount: rival.deck.length,
        board: rival.board.map(sanitizeUnit),
        intention: { label: isMyTurn ? "ESPERANDO TU JUGADA" : "TURNO DEL RIVAL" }
      },
      marketDeck: pvpMatch.marketDeck.map(sanitizeCard),
      marketRow: pvpMatch.marketRow.map(sanitizeCard)
    };
  }

  function syncBothClients(hintForP1 = "", hintForP2 = "") {
    if (!pvpMatch) return;
    const p1View = buildViewForSide("p1", hintForP1);
    const p2View = buildViewForSide("p2", hintForP2);

    applyLocalViewState(p1View);
    window.PvpNet.send({ type: "STATE_SYNC", view: p2View });
  }

  function clearReactionTimers() {
    if (hostReactionTimer) {
      clearInterval(hostReactionTimer);
      hostReactionTimer = null;
    }
    if (guestReactionTimer) {
      clearInterval(guestReactionTimer);
      guestReactionTimer = null;
    }
  }

  function openPvpReactionBanner(reactionData, isHost) {
    const banner = document.getElementById("reaction-banner");
    const cardSlot = document.getElementById("reaction-enemy-card");
    const textEl = document.getElementById("reaction-text");
    const fillEl = document.getElementById("reaction-timer-fill");
    const numEl = document.getElementById("reaction-timer-num");
    const passBtn = document.getElementById("reaction-pass-btn");
    if (!banner || !cardSlot) return;

    state.reactionWindow = {
      totalDmg: reactionData.dmg,
      blockerIdx: reactionData.blockerIdx,
      timeLeft: reactionData.timeLeft
    };

    cardSlot.innerHTML = `
      <div class="hand-card type-Unidad">
        <div class="card-banner">
          <span class="card-title">${reactionData.cardName}</span>
          <span class="energy-cost"><span>${reactionData.dmg}</span></span>
        </div>
        <div class="card-art-wrap">
          <img src="${reactionData.art}" alt="${reactionData.cardName}" />
        </div>
        <div class="card-footer-badge">DMG ${reactionData.dmg}</div>
      </div>
    `;
    textEl.textContent = `Ataque rival (${reactionData.dmg} DMG). Elige una unidad tuya para bloquear o juega [REACCION].`;
    banner.classList.remove("hidden");

    passBtn.onclick = () => {
      window.PvpEngine.sendAction("REACTION_PASS", {});
    };

    if (!isHost) {
      if (guestReactionTimer) clearInterval(guestReactionTimer);
      guestReactionTimer = setInterval(() => {
        if (!state.reactionWindow || state.gameOver) {
          clearInterval(guestReactionTimer);
          guestReactionTimer = null;
          return;
        }
        state.reactionWindow.timeLeft = Math.max(0, state.reactionWindow.timeLeft - 0.1);
        fillEl.style.width = `${(state.reactionWindow.timeLeft / 5.0) * 100}%`;
        numEl.textContent = `${state.reactionWindow.timeLeft.toFixed(1)}s`;
      }, 100);
    }
  }

  function closePvpReactionBanner() {
    const banner = document.getElementById("reaction-banner");
    if (banner) banner.classList.add("hidden");
    state.reactionWindow = null;
    if (guestReactionTimer) {
      clearInterval(guestReactionTimer);
      guestReactionTimer = null;
    }
  }

  function applyLocalViewState(view) {
    const prevSelected = state?.selectedUnitIndex ?? null;
    const prevTurn = state?.isPlayerTurn;
    state = {
      ...view,
      selectedUnitIndex: view.isPlayerTurn ? prevSelected : null,
      reactionWindow: state?.reactionWindow || null
    };

    if (view.pendingReactionForMe) {
      if (!state.reactionWindow) {
        openPvpReactionBanner(view.pendingReactionForMe, window.PvpNet.role === "host");
      } else {
        state.reactionWindow.blockerIdx = view.pendingReactionForMe.blockerIdx;
      }
    } else {
      closePvpReactionBanner();
    }

    if (view.hintText) {
      setHint(view.hintText);
    } else if (view.waitingForRivalReaction) {
      setHint("Esperando reaccion del rival (5s)...");
    } else if (view.isPlayerTurn) {
      setHint("Tu turno: juega cartas, compra del Mercado Vivo o ataca.");
    } else {
      setHint("Turno del rival. Observa sus jugadas.");
    }

    if (view.isPlayerTurn && prevTurn === false && !view.gameOver) {
      window.SFX?.play("turn_start");
    }

    render();

    if (view.isPlayerTurn && !view.gameOver && !view.pendingReactionForMe && !view.waitingForRivalReaction) {
      if (prevTurn !== true) startTurnTimer();
    } else {
      stopTurnTimer();
    }

    if (view.gameOver) {
      closePvpReactionBanner();
      const iWon = view.winnerSide === view.viewerSide;
      showModal(
        iWon ? "VICTORIA EN DUELO VS" : "DERROTA EN DUELO VS",
        iWon ? "Has derrotado a tu rival en combate 1v1." : "Tu rival ha reducido tu HP a 0.",
        iWon
      );
      const btn = document.getElementById("restart-btn");
      if (btn) btn.textContent = "VOLVER A LA SALA VS";
    }
  }

  function withHostActorContext(actorSide, fn) {
    const otherSide = actorSide === "p1" ? "p2" : "p1";
    const savedState = state;
    state = {
      isPvp: true,
      _pvpInternal: true,
      turn: pvpMatch.turn,
      isPlayerTurn: pvpMatch.activeSide === actorSide,
      selectedUnitIndex: null,
      gameOver: pvpMatch.gameOver,
      reactionWindow: pvpMatch.pendingReaction && pvpMatch.pendingReaction.targetSide === actorSide ? pvpMatch.pendingReaction : null,
      player: pvpMatch[actorSide],
      enemy: pvpMatch[otherSide],
      marketDeck: pvpMatch.marketDeck,
      marketRow: pvpMatch.marketRow
    };
    try {
      fn();
    } finally {
      pvpMatch.gameOver = state.gameOver;
      if (pvpMatch[actorSide].hp <= 0) {
        pvpMatch.gameOver = true;
        pvpMatch.winnerSide = otherSide;
      } else if (pvpMatch[otherSide].hp <= 0) {
        pvpMatch.gameOver = true;
        pvpMatch.winnerSide = actorSide;
      }
      state = savedState;
    }
  }

  function resolvePendingReaction() {
    if (!pvpMatch || !pvpMatch.pendingReaction) return;
    clearReactionTimers();
    const pending = pvpMatch.pendingReaction;
    pvpMatch.pendingReaction = null;

    const attackerSide = pending.attackerSide;
    const defenderSide = pending.targetSide;
    const attacker = pvpMatch[attackerSide].board[pending.attackerSlotIdx];
    if (!attacker) {
      syncBothClients();
      return;
    }

    const blockerIdx = pending.blockerIdx;
    const blocker = blockerIdx !== null ? pvpMatch[defenderSide].board[blockerIdx] : null;

    if (blocker) {
      blocker.hp -= attacker.atk;
      attacker.hp -= blocker.atk;
      attacker.ready = false;

      if (attacker.pierce && blocker.hp < 0) {
        const excess = Math.abs(blocker.hp);
        withHostActorContext(attackerSide, () => {
          dealDamageToHero("enemy", excess);
        });
      }
      if (blocker.hp <= 0) {
        withHostActorContext(defenderSide, () => {
          triggerUnitDeath("player", blockerIdx);
        });
      }
      if (attacker.hp <= 0) {
        withHostActorContext(attackerSide, () => {
          triggerUnitDeath("player", pending.attackerSlotIdx);
        });
      }
      syncBothClients(
        `${attacker.name} fue bloqueado por ${blocker.name}.`,
        `Bloqueaste a ${attacker.name} con ${blocker.name}.`
      );
    } else {
      withHostActorContext(attackerSide, () => {
        dealDamageToHero("enemy", attacker.atk);
      });
      attacker.ready = false;
      syncBothClients(
        `${attacker.name} golpeo al Heroe por ${attacker.atk} DMG.`,
        `${attacker.name} golpeo a tu Heroe por ${attacker.atk} DMG.`
      );
    }
  }

  function handleHostAction(actorSide, actionType, payload = {}) {
    if (!pvpMatch || pvpMatch.gameOver) return;
    const otherSide = actorSide === "p1" ? "p2" : "p1";

    if (pvpMatch.pendingReaction) {
      if (actorSide !== pvpMatch.pendingReaction.targetSide) return;
      if (actionType === "REACTION_BLOCK") {
        const idx = payload.blockerIdx;
        if (pvpMatch[actorSide].board[idx]) {
          pvpMatch.pendingReaction.blockerIdx = idx;
          syncBothClients();
        }
        return;
      }
      if (actionType === "REACTION_PASS") {
        resolvePendingReaction();
        return;
      }
      if (actionType === "PLAY_CARD") {
        const card = pvpMatch[actorSide].hand[payload.handIndex];
        if (!card || !card.reaction || pvpMatch[actorSide].energy < card.cost) return;
        withHostActorContext(actorSide, () => {
          playCard(payload.handIndex);
        });
        syncBothClients();
        return;
      }
      return;
    }

    if (actorSide !== pvpMatch.activeSide) return;

    if (actionType === "PLAY_CARD") {
      const card = pvpMatch[actorSide].hand[payload.handIndex];
      if (!card || pvpMatch[actorSide].energy < card.cost) return;
      withHostActorContext(actorSide, () => {
        playCard(payload.handIndex);
      });
      syncBothClients(
        actorSide === "p1" ? `Jugaste ${card.name}.` : `El rival jugo ${card.name}.`,
        actorSide === "p2" ? `Jugaste ${card.name}.` : `El rival jugo ${card.name}.`
      );
      return;
    }

    if (actionType === "BUY_MARKET") {
      const card = pvpMatch.marketRow[payload.marketIndex];
      if (!card || pvpMatch[actorSide].gold < card.goldCost) return;
      pvpMatch[actorSide].gold -= card.goldCost;
      card.justDrawn = true;
      pvpMatch[actorSide].hand.push(card);
      if (pvpMatch.marketDeck.length === 0) {
        pvpMatch.marketDeck = shuffle(MARKET_POOL_IDS).map((id) => createCardInstance(id, true));
      }
      pvpMatch.marketRow[payload.marketIndex] = pvpMatch.marketDeck.pop();
      syncBothClients(
        actorSide === "p1" ? `Compraste ${card.name}.` : `El rival compro ${card.name} del Mercado.`,
        actorSide === "p2" ? `Compraste ${card.name}.` : `El rival compro ${card.name} del Mercado.`
      );
      return;
    }

    if (actionType === "ATTACK_UNIT") {
      const attacker = pvpMatch[actorSide].board[payload.attackerIdx];
      const defender = pvpMatch[otherSide].board[payload.enemySlotIndex];
      if (!attacker || !attacker.ready || !defender) return;

      defender.hp -= attacker.atk;
      attacker.hp -= defender.atk;
      attacker.ready = false;

      if (attacker.pierce && defender.hp < 0) {
        const excess = Math.abs(defender.hp);
        withHostActorContext(actorSide, () => {
          dealDamageToHero("enemy", excess);
        });
      }
      if (defender.hp <= 0) {
        withHostActorContext(otherSide, () => {
          triggerUnitDeath("player", payload.enemySlotIndex);
        });
      }
      if (attacker.hp <= 0) {
        withHostActorContext(actorSide, () => {
          triggerUnitDeath("player", payload.attackerIdx);
        });
      }
      syncBothClients("Combate de unidades resuelto.", "Combate de unidades resuelto.");
      return;
    }

    if (actionType === "ATTACK_HERO") {
      const attacker = pvpMatch[actorSide].board[payload.attackerIdx];
      if (!attacker || !attacker.ready) return;
      const hasGuard = !attacker.stealth && pvpMatch[otherSide].board.some((u) => u && u.guard && !u.stunned);
      if (hasGuard) return;

      if (attacker.stealth) {
        withHostActorContext(actorSide, () => {
          dealDamageToHero("enemy", attacker.atk);
        });
        attacker.ready = false;
        syncBothClients(
          `${attacker.name} (Sigilo) golpeo al Heroe por ${attacker.atk} DMG.`,
          `${attacker.name} (Sigilo) golpeo a tu Heroe por ${attacker.atk} DMG.`
        );
        return;
      }

      const defaultGuardIdx = pvpMatch[otherSide].board.findIndex((u) => u && u.guard && !u.stunned);
      pvpMatch.pendingReaction = {
        attackerSide,
        targetSide: otherSide,
        attackerSlotIdx: payload.attackerIdx,
        dmg: attacker.atk,
        cardName: attacker.name,
        art: attacker.art,
        blockerIdx: defaultGuardIdx !== -1 ? defaultGuardIdx : null,
        timeLeft: 5.0
      };
      syncBothClients();

      clearReactionTimers();
      hostReactionTimer = setInterval(() => {
        if (!pvpMatch || !pvpMatch.pendingReaction || pvpMatch.gameOver) {
          clearReactionTimers();
          return;
        }
        pvpMatch.pendingReaction.timeLeft = Math.max(0, pvpMatch.pendingReaction.timeLeft - 0.1);
        if (pvpMatch.pendingReaction.targetSide === "p1") {
          const fillEl = document.getElementById("reaction-timer-fill");
          const numEl = document.getElementById("reaction-timer-num");
          if (fillEl) fillEl.style.width = `${(pvpMatch.pendingReaction.timeLeft / 5.0) * 100}%`;
          if (numEl) numEl.textContent = `${pvpMatch.pendingReaction.timeLeft.toFixed(1)}s`;
        }
        if (pvpMatch.pendingReaction.timeLeft <= 0) {
          resolvePendingReaction();
        }
      }, 100);
      return;
    }

    if (actionType === "END_TURN") {
      // Discard remaining hand at end of turn
      while (pvpMatch[actorSide].hand.length > 0) {
        const c = pvpMatch[actorSide].hand.pop();
        if (!c.ephemeral) pvpMatch[actorSide].discard.push(c);
      }

      pvpMatch.activeSide = otherSide;
      if (otherSide === "p1") pvpMatch.turn += 1;

      const nextPlayer = pvpMatch[otherSide];
      nextPlayer.energy = nextPlayer.maxEnergy;

      // Upkeep & ready units
      nextPlayer.board.forEach((u, idx) => {
        if (!u) return;
        if (u.upkeep && u.upkeep > 0) {
          if (nextPlayer.energy >= u.upkeep) {
            nextPlayer.energy -= u.upkeep;
          } else if (nextPlayer.gold >= u.upkeep) {
            nextPlayer.gold -= u.upkeep;
          } else {
            nextPlayer.board[idx] = null;
            return;
          }
        }
        if (u.stunned) {
          u.stunned = false;
          u.ready = false;
        } else {
          u.ready = true;
        }
      });

      drawForSide(nextPlayer, 5);
      syncBothClients();
    }
  }

  function startMatchAsHost() {
    clearReactionTimers();
    const p1 = createPvpSide(lobby.selectedDeckId, "JUGADOR 1");
    const p2 = createPvpSide(lobby.rivalDeckId || "vanguardia", "JUGADOR 2");
    const marketPool = shuffle(MARKET_POOL_IDS).map((id) => createCardInstance(id, true));
    const marketRow = [];
    for (let i = 0; i < 4; i++) {
      marketRow.push(marketPool.pop());
    }

    drawForSide(p1, 5);
    drawForSide(p2, 5);
    // Slight compensation for Player 2 going second
    p2.gold = 1;

    pvpMatch = {
      turn: 1,
      activeSide: "p1",
      p1,
      p2,
      marketDeck: marketPool,
      marketRow,
      pendingReaction: null,
      gameOver: false,
      winnerSide: null
    };

    document.getElementById("vs-lobby-modal")?.classList.add("hidden");
    document.getElementById("title-screen")?.classList.add("hidden");
    document.getElementById("game-over-modal")?.classList.add("hidden");
    document.getElementById("rest-screen")?.classList.add("hidden");
    document.querySelector(".main-stage")?.style.setProperty("--arena-bg", 'url("assets/backgrounds/arena_bg.png")');

    syncBothClients("Duelo iniciado. Tu empiezas primero.", "Duelo iniciado. Turno del Jugador 1 (+1 Oro inicial por ir segundo).");
  }

  // ================= LOBBY UI =================
  function renderDeckSlots() {
    const slotsEl = document.getElementById("vs-deck-slots");
    const previewEl = document.getElementById("vs-deck-preview");
    const nameEl = document.getElementById("vs-selected-deck-name");
    if (!slotsEl || !previewEl) return;

    const decks = window.STARTER_DECKS || [];
    slotsEl.innerHTML = "";
    decks.forEach((deck, idx) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = `vs-deck-slot ${deck.id === lobby.selectedDeckId ? "active" : ""}`;
      btn.style.setProperty("--slot-accent", deck.accent);
      btn.innerHTML = `
        <span class="vs-slot-num">SLOT ${idx + 1}</span>
        <span class="vs-slot-name">${deck.name}</span>
        <span class="vs-slot-arch">${deck.archetype}</span>
        <span class="vs-slot-tag">${deck.tagline}</span>
      `;
      btn.addEventListener("click", () => {
        if (lobby.myReady) return;
        lobby.selectedDeckId = deck.id;
        renderDeckSlots();
        if (window.PvpNet.isReady()) {
          window.PvpNet.send({ type: "DECK_SELECT", deckId: deck.id });
        }
      });
      slotsEl.appendChild(btn);
    });

    const selected = window.getStarterDeckById(lobby.selectedDeckId);
    if (selected) {
      if (nameEl) nameEl.textContent = `${selected.name} (${selected.archetype})`;
      const counts = {};
      selected.cards.forEach((id) => {
        counts[id] = (counts[id] || 0) + 1;
      });
      previewEl.innerHTML = Object.entries(counts)
        .map(([id, qty]) => {
          const card = typeof CARD_CATALOG !== "undefined" ? CARD_CATALOG[id] : null;
          return `<span class="vs-preview-chip">${qty}x ${card ? card.name : id}</span>`;
        })
        .join("");
    }
  }

  function updateLobbyUI() {
    const rivalPill = document.getElementById("vs-rival-pill");
    const readyBtn = document.getElementById("vs-ready-btn");
    if (rivalPill) {
      rivalPill.className = "vs-rival-pill";
      if (!lobby.connected) {
        rivalPill.textContent = "RIVAL: DESCONECTADO";
      } else if (lobby.rivalReady) {
        rivalPill.textContent = "RIVAL: LISTO";
        rivalPill.classList.add("ready");
      } else {
        rivalPill.textContent = "RIVAL: ELIGIENDO DECK";
        rivalPill.classList.add("connected");
      }
    }

    if (readyBtn) {
      if (!lobby.connected) {
        readyBtn.disabled = true;
        readyBtn.textContent = "ESPERANDO CONEXION...";
      } else if (lobby.myReady) {
        readyBtn.disabled = false;
        readyBtn.textContent = "LISTO (PULSA PARA CANCELAR)";
      } else {
        readyBtn.disabled = false;
        readyBtn.textContent = "LISTO PARA DUELO";
      }
    }
  }

  function setLobbyStatus(msg) {
    const el = document.getElementById("vs-status-text");
    if (el) el.textContent = msg;
  }

  function initLobby() {
    renderDeckSlots();
    updateLobbyUI();

    window.PvpNet.setCallbacks({
      onStatus: (msg) => setLobbyStatus(msg),
      onError: (msg) => setLobbyStatus(msg),
      onConnected: (role, code) => {
        lobby.connected = true;
        lobby.myReady = false;
        lobby.rivalReady = false;
        setLobbyStatus(`Conectado en sala ${code}. Elige tu slot de deck y pulsa LISTO.`);
        updateLobbyUI();
        window.PvpNet.send({ type: "DECK_SELECT", deckId: lobby.selectedDeckId });
      },
      onDisconnected: (msg) => {
        lobby.connected = false;
        lobby.myReady = false;
        lobby.rivalReady = false;
        clearReactionTimers();
        setLobbyStatus(msg);
        updateLobbyUI();
        if (state?.isPvp && !state.gameOver) {
          state.gameOver = true;
          showModal("RIVAL DESCONECTADO", "Se perdio la conexion con el otro jugador.", false);
          const btn = document.getElementById("restart-btn");
          if (btn) btn.textContent = "VOLVER A LA SALA VS";
        }
      },
      onMessage: (data) => {
        if (!data || !data.type) return;
        if (data.type === "DECK_SELECT") {
          lobby.rivalDeckId = data.deckId;
          return;
        }
        if (data.type === "READY_STATE") {
          lobby.rivalReady = Boolean(data.ready);
          if (data.deckId) lobby.rivalDeckId = data.deckId;
          updateLobbyUI();
          if (window.PvpNet.role === "host" && lobby.myReady && lobby.rivalReady) {
            startMatchAsHost();
          }
          return;
        }
        if (data.type === "STATE_SYNC" && data.view) {
          document.getElementById("vs-lobby-modal")?.classList.add("hidden");
          document.getElementById("title-screen")?.classList.add("hidden");
          document.getElementById("game-over-modal")?.classList.add("hidden");
          document.getElementById("rest-screen")?.classList.add("hidden");
          document.querySelector(".main-stage")?.style.setProperty("--arena-bg", 'url("assets/backgrounds/arena_bg.png")');
          applyLocalViewState(data.view);
          return;
        }
        if (data.type === "ACTION" && window.PvpNet.role === "host") {
          handleHostAction("p2", data.actionType, data.payload);
        }
      }
    });

    document.getElementById("play-vs-btn")?.addEventListener("click", () => {
      document.getElementById("vs-lobby-modal")?.classList.remove("hidden");
      renderDeckSlots();
      updateLobbyUI();
    });

    document.getElementById("vs-back-btn")?.addEventListener("click", () => {
      window.PvpNet.disconnect();
      lobby.connected = false;
      lobby.myReady = false;
      lobby.rivalReady = false;
      document.getElementById("vs-room-badge")?.classList.add("hidden");
      document.getElementById("vs-lobby-modal")?.classList.add("hidden");
      document.getElementById("title-screen")?.classList.remove("hidden");
    });

    document.getElementById("vs-create-btn")?.addEventListener("click", () => {
      window.PvpNet.createRoom();
      const badge = document.getElementById("vs-room-badge");
      const codeEl = document.getElementById("vs-room-code");
      if (badge && codeEl) {
        codeEl.textContent = window.PvpNet.roomCode;
        badge.classList.remove("hidden");
      }
    });

    document.getElementById("vs-copy-btn")?.addEventListener("click", () => {
      const code = document.getElementById("vs-room-code")?.textContent || "";
      if (code && navigator.clipboard) {
        navigator.clipboard.writeText(code).catch(() => {});
        setLobbyStatus(`Codigo ${code} copiado al portapapeles.`);
      }
    });

    document.getElementById("vs-join-btn")?.addEventListener("click", () => {
      const code = document.getElementById("vs-join-input")?.value || "";
      window.PvpNet.joinRoom(code);
    });

    document.getElementById("vs-ready-btn")?.addEventListener("click", () => {
      if (!lobby.connected) return;
      lobby.myReady = !lobby.myReady;
      updateLobbyUI();
      window.PvpNet.send({
        type: "READY_STATE",
        ready: lobby.myReady,
        deckId: lobby.selectedDeckId
      });
      if (window.PvpNet.role === "host" && lobby.myReady && lobby.rivalReady) {
        startMatchAsHost();
      }
    });
  }

  window.PvpEngine = {
    sendAction(actionType, payload) {
      if (window.PvpNet.role === "host") {
        handleHostAction("p1", actionType, payload);
      } else {
        window.PvpNet.send({ type: "ACTION", actionType, payload });
      }
    },
    onMatchEnded() {
      // Handled inside syncBothClients / withHostActorContext
    },
    returnToLobby() {
      clearReactionTimers();
      pvpMatch = null;
      lobby.myReady = false;
      lobby.rivalReady = false;
      document.getElementById("game-over-modal")?.classList.add("hidden");
      document.getElementById("vs-lobby-modal")?.classList.remove("hidden");
      updateLobbyUI();
      if (window.PvpNet.isReady()) {
        window.PvpNet.send({
          type: "READY_STATE",
          ready: false,
          deckId: lobby.selectedDeckId
        });
      }
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initLobby);
  } else {
    initLobby();
  }
})();
