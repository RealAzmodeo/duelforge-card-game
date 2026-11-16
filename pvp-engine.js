// Duelforge - Motor de Duelo VS Online (Host-Authoritative sobre PeerJS) + Selector Oficial de Facciones

(function () {
  const lobby = {
    selectedDeckId: "forja",
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
      faction: card.faction || "neutral",
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
    const id = STARTER_DECKS[deckId] ? deckId : "forja";
    const deckDef = STARTER_DECKS[id];
    const heroDef = FACTION_HEROES[id];
    const deck = shuffle(deckDef.cards).map((cid) => createCardInstance(cid, false));
    return {
      factionId: id,
      name: `${label} - ${heroDef.name}`,
      avatar: `assets/heroes/hero_${id}_${heroDef.id}.png`,
      frame: heroDef.frame || "assets/ui/portrait_frame_gold.png",
      cardBack: `assets/card_backs/back_${id}.png`,
      hp: heroDef.hp,
      maxHp: heroDef.hp,
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
        name: me.name,
        avatar: me.avatar,
        frame: me.frame,
        cardBack: me.cardBack,
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
        avatar: rival.avatar,
        frame: rival.frame,
        cardBack: rival.cardBack,
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

    const typeIcon = typeof getCardTypeIcon === "function" ? getCardTypeIcon("Unidad") : "assets/ui/type_unidad.png";
    cardSlot.innerHTML = `
      <div class="hand-card type-Unidad faction-neutral rarity-rara">
        <div class="card-type-crest" title="Tipo: Unidad"><img src="${typeIcon}" alt="Unidad" /></div>
        <div class="card-banner card-banner-cost-only">
          <span class="energy-cost"><span>${reactionData.dmg}</span></span>
        </div>
        <div class="card-art-wrap">
          <img src="${reactionData.art}" alt="${reactionData.cardName}" />
        </div>
        <div class="card-stat-icons"><span class="stat-ic"><img src="assets/ui/stat_atk.png" alt="DMG" /><b>${reactionData.dmg}</b></span></div>
        <div class="card-name-ribbon ribbon-rara"><span>${reactionData.cardName}</span></div>
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

    const playerAvatar = document.querySelector("#player-avatar-btn img:first-child");
    const playerFrame = document.getElementById("player-frame-img");
    const enemyFrame = document.getElementById("enemy-frame-img");
    const playerDeckImg = document.querySelector("#player-deck-pile img");
    if (playerAvatar && view.player?.avatar) playerAvatar.src = view.player.avatar;
    if (playerFrame && view.player?.frame) playerFrame.src = view.player.frame;
    if (playerDeckImg && view.player?.cardBack) playerDeckImg.src = view.player.cardBack;
    if (enemyFrame && view.enemy?.frame) enemyFrame.src = view.enemy.frame;

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
      while (pvpMatch[actorSide].hand.length > 0) {
        const c = pvpMatch[actorSide].hand.pop();
        if (!c.ephemeral) pvpMatch[actorSide].discard.push(c);
      }

      pvpMatch.activeSide = otherSide;
      if (otherSide === "p1") pvpMatch.turn += 1;

      const nextPlayer = pvpMatch[otherSide];
      nextPlayer.energy = nextPlayer.maxEnergy;

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
    const p2 = createPvpSide(lobby.rivalDeckId || "forja", "JUGADOR 2");
    const marketPool = shuffle(MARKET_POOL_IDS).map((id) => createCardInstance(id, true));
    const marketRow = [];
    for (let i = 0; i < 4; i++) {
      marketRow.push(marketPool.pop());
    }

    drawForSide(p1, 5);
    drawForSide(p2, 5);
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
    document.querySelector(".main-stage")?.style.setProperty("--arena-bg", 'url("assets/ui/arena_bg.png")');

    syncBothClients(
      "Duelo iniciado. Tu empiezas primero.",
      "Duelo iniciado. Turno del Jugador 1 (+1 Oro inicial por ir segundo)."
    );
  }

  // ================= LOBBY UI (REUSING OFFICIAL FACTION PILLARS & CARDS) =================
  function renderVsDeckDetail(deckIdOverride) {
    const id = deckIdOverride || lobby.selectedDeckId;
    const deck = STARTER_DECKS[id] || STARTER_DECKS.forja;
    const f = FACTIONS[deck.id];
    const nameEl = document.getElementById("vs-detail-name");
    const tagEl = document.getElementById("vs-detail-tag");
    const countEl = document.getElementById("vs-detail-count");
    const descEl = document.getElementById("vs-detail-desc");
    const cardsEl = document.getElementById("vs-deck-preview");
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

  function renderDeckSlots() {
    const slotsEl = document.getElementById("vs-deck-slots");
    if (!slotsEl || typeof STARTER_DECKS === "undefined") return;

    slotsEl.innerHTML = "";
    Object.values(STARTER_DECKS).forEach((deck) => {
      const f = FACTIONS[deck.id];
      const h = FACTION_HEROES[deck.id];
      const heroArt = `assets/heroes/hero_${deck.id}_${h.id}.png`;

      const counts = {};
      deck.cards.forEach((cid) => {
        counts[cid] = (counts[cid] || 0) + 1;
      });
      const hoverRows = Object.entries(counts)
        .map(([cid, qty]) => {
          const c = CARD_CATALOG[cid];
          if (!c) return "";
          return `<div class="deck-hover-card-row"><img src="${c.art}" alt="" /><span>${c.name}</span><b>x${qty}</b></div>`;
        })
        .join("");

      const btn = document.createElement("button");
      btn.type = "button";
      btn.dataset.faction = deck.id;
      btn.className = `deck-choice-card ${lobby.selectedDeckId === deck.id ? "selected" : ""}`;
      btn.innerHTML = `
        <img class="deck-hero-bg" src="${heroArt}" alt="${h.name}" />
        <div class="deck-hero-fade"></div>
        <div class="deck-pillar-top">
          <span class="deck-archetype-text">${f.tag}</span>
          <span class="deck-hp-text"><img class="deck-hp-ic" src="assets/ui/stat_hp.png" alt="" />${h.hp}</span>
        </div>
        <div class="deck-pillar-bottom">
          <img class="deck-choice-img" src="assets/decks/deck_${deck.id}.png" alt="${deck.name}" />
          <span class="deck-choice-name">${deck.name}</span>
          <div class="deck-hero-ribbon" style="background-image: url('assets/ui/ribbon_${deck.id}.png')"><span>${h.name}</span></div>
          <span class="deck-choice-desc">${h.passive}</span>
        </div>
        <div class="deck-hover-drawer">
          <div class="deck-hover-strategy">${f.desc}</div>
          <div class="deck-hover-cards">${hoverRows}</div>
        </div>
      `;
      btn.addEventListener("mouseenter", () => renderVsDeckDetail(deck.id));
      btn.addEventListener("mouseleave", () => renderVsDeckDetail(lobby.selectedDeckId));
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

    renderVsDeckDetail(lobby.selectedDeckId);
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
        rivalPill.textContent = "RIVAL: ELIGIENDO HEROE";
        rivalPill.classList.add("connected");
      }
    }

    if (readyBtn) {
      if (!lobby.connected) {
        readyBtn.disabled = true;
        readyBtn.textContent = "ESPERANDO CONEXION...";
      } else if (lobby.myReady) {
        readyBtn.disabled = false;
        readyBtn.textContent = "LISTO (CANCELAR)";
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
        setLobbyStatus(`Conectado en sala ${code}. Elige tu Heroe y pulsa LISTO PARA DUELO.`);
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
          document.querySelector(".main-stage")?.style.setProperty("--arena-bg", 'url("assets/ui/arena_bg.png")');
          applyLocalViewState(data.view);
          return;
        }
        if (data.type === "ACTION" && window.PvpNet.role === "host") {
          handleHostAction("p2", data.actionType, data.payload);
        }
      }
    });

    document.getElementById("play-vs-btn")?.addEventListener("click", () => {
      document.getElementById("title-screen")?.classList.add("hidden");
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
    onMatchEnded() {},
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
