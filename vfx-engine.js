// Duelforge - Motor Modular de VFX y "Juice" sobre Canvas 2D + CSS
// Disenado para trabajar en paralelo con el DOM sin bloquear clics ni requerir bundler.
(function () {
  const MAX_PARTICLES = 360;
  let canvas = null;
  let ctx = null;
  let dpr = 1;
  let width = 0;
  let height = 0;
  let rafId = null;
  let lastTime = 0;

  const particles = [];
  const rings = [];
  const pillars = [];
  const bolts = [];
  let flash = null;
  let lastUrgencySecond = null;

  const reducedMotionQuery = window.matchMedia
    ? window.matchMedia("(prefers-reduced-motion: reduce)")
    : null;

  function isReducedMotion() {
    return Boolean(reducedMotionQuery && reducedMotionQuery.matches);
  }

  function ensureCanvas() {
    if (canvas && document.body.contains(canvas)) return canvas;
    canvas = document.getElementById("vfx-canvas");
    if (!canvas) {
      canvas = document.createElement("canvas");
      canvas.id = "vfx-canvas";
      canvas.className = "vfx-canvas";
      canvas.setAttribute("aria-hidden", "true");
      document.body.appendChild(canvas);
    }
    ctx = canvas.getContext("2d");
    resizeCanvas();
    return canvas;
  }

  function resizeCanvas() {
    if (!canvas) return;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth || 1280;
    height = window.innerHeight || 720;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    if (ctx) {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
  }

  window.addEventListener("resize", resizeCanvas);

  function ensureVignetteEl() {
    let el = document.getElementById("vfx-timer-vignette");
    if (!el) {
      el = document.createElement("div");
      el.id = "vfx-timer-vignette";
      el.className = "vfx-timer-vignette";
      el.setAttribute("aria-hidden", "true");
      document.body.appendChild(el);
    }
    return el;
  }

  function resolvePoint(targetOrPoint) {
    if (!targetOrPoint) {
      return { x: width / 2, y: height / 2, rect: null };
    }
    if (typeof targetOrPoint === "object" && typeof targetOrPoint.x === "number" && typeof targetOrPoint.y === "number") {
      return { x: targetOrPoint.x, y: targetOrPoint.y, rect: null };
    }
    const el = typeof targetOrPoint === "string"
      ? document.querySelector(targetOrPoint)
      : targetOrPoint;
    if (!el || typeof el.getBoundingClientRect !== "function") {
      return { x: width / 2, y: height / 2, rect: null };
    }
    const rect = el.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) {
      return { x: width / 2, y: height / 2, rect: null };
    }
    return {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
      rect
    };
  }

  function rand(min, max) {
    return min + Math.random() * (max - min);
  }

  function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function startLoop() {
    ensureCanvas();
    if (rafId !== null) return;
    lastTime = performance.now();
    rafId = requestAnimationFrame(tick);
  }

  function pushParticle(p) {
    if (particles.length >= MAX_PARTICLES) {
      particles.shift();
    }
    particles.push(p);
  }

  function spawnBurst(x, y, cfg) {
    if (isReducedMotion()) return;
    const count = cfg.count || 18;
    const colors = cfg.colors || ["#ffd23f", "#ffffff"];
    const speedMin = cfg.speedMin ?? 90;
    const speedMax = cfg.speedMax ?? 360;
    const angleMin = cfg.angleMin ?? 0;
    const angleMax = cfg.angleMax ?? Math.PI * 2;
    const kind = cfg.kind || "spark";

    for (let i = 0; i < count; i++) {
      const angle = rand(angleMin, angleMax);
      const speed = rand(speedMin, speedMax);
      const life = rand(cfg.lifeMin ?? 0.35, cfg.lifeMax ?? 0.85);
      pushParticle({
        kind,
        x: x + rand(-(cfg.jitter || 6), cfg.jitter || 6),
        y: y + rand(-(cfg.jitter || 6), cfg.jitter || 6),
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed + (cfg.vyBias || 0),
        gravity: cfg.gravity ?? 280,
        drag: cfg.drag ?? 0.94,
        size: rand(cfg.sizeMin ?? 2.5, cfg.sizeMax ?? 6.5),
        color: pick(colors),
        alpha: 1,
        life,
        maxLife: life,
        rot: rand(0, Math.PI * 2),
        vRot: rand(-9, 9),
        wobblePhase: rand(0, Math.PI * 2),
        wobbleSpeed: rand(5, 11),
        additive: cfg.additive !== false
      });
    }
    startLoop();
  }

  function spawnRing(x, y, cfg = {}) {
    if (isReducedMotion()) return;
    rings.push({
      x,
      y,
      radius: cfg.startRadius ?? 12,
      maxRadius: cfg.maxRadius ?? 140,
      color: cfg.color || "#ffd23f",
      lineWidth: cfg.lineWidth ?? 5,
      life: cfg.duration ?? 0.45,
      maxLife: cfg.duration ?? 0.45
    });
    startLoop();
  }

  function spawnPillar(x, y, cfg = {}) {
    if (isReducedMotion()) return;
    pillars.push({
      x,
      y,
      width: cfg.width ?? 110,
      height: cfg.height ?? 520,
      color: cfg.color || "#ffd23f",
      life: cfg.duration ?? 0.75,
      maxLife: cfg.duration ?? 0.75
    });
    startLoop();
  }

  function buildLightningPoints(x1, y1, x2, y2, displace, depth) {
    if (depth <= 0) {
      return [{ x: x1, y: y1 }, { x: x2, y: y2 }];
    }
    const midX = (x1 + x2) / 2 + rand(-displace, displace);
    const midY = (y1 + y2) / 2 + rand(-displace, displace);
    const left = buildLightningPoints(x1, y1, midX, midY, displace * 0.52, depth - 1);
    const right = buildLightningPoints(midX, midY, x2, y2, displace * 0.52, depth - 1);
    return left.slice(0, -1).concat(right);
  }

  function spawnLightning(fromTarget, toTarget, color = "#38bdf8") {
    if (isReducedMotion()) return;
    const p1 = resolvePoint(fromTarget);
    const p2 = resolvePoint(toTarget);
    bolts.push({
      points: buildLightningPoints(p1.x, p1.y, p2.x, p2.y, 44, 4),
      color,
      life: 0.24,
      maxLife: 0.24
    });
    startLoop();
  }

  function screenFlash(color = "rgba(255, 255, 255, 1)", peakAlpha = 0.28, durationMs = 260) {
    if (isReducedMotion()) return;
    flash = {
      color,
      peakAlpha: Math.min(peakAlpha, 0.45),
      life: durationMs / 1000,
      maxLife: durationMs / 1000
    };
    startLoop();
  }

  function shake(selector = ".main-stage", intensity = "medium") {
    if (isReducedMotion()) return;
    const el = typeof selector === "string" ? document.querySelector(selector) : selector;
    if (!el) return;
    const clsMap = {
      light: "vfx-shake-light",
      medium: "shake",
      heavy: "vfx-shake-heavy",
      boss: "vfx-shake-boss"
    };
    const cls = clsMap[intensity] || "shake";
    el.classList.remove("shake", "vfx-shake-light", "vfx-shake-heavy", "vfx-shake-boss");
    void el.offsetWidth;
    el.classList.add(cls);
  }

  function hitStop(targetSelector = ".main-stage", durationMs = 70) {
    if (isReducedMotion()) return;
    const el = typeof targetSelector === "string" ? document.querySelector(targetSelector) : targetSelector;
    if (!el) return;
    el.classList.add("vfx-hitstop");
    setTimeout(() => {
      el.classList.remove("vfx-hitstop");
    }, durationMs);
  }

  function celebrate(type = "victory") {
    if (isReducedMotion()) return;
    ensureCanvas();

    if (type === "legendary") {
      spawnBurst(width * 0.5, height * 0.42, {
        kind: "confetti",
        count: 55,
        speedMin: 180,
        speedMax: 520,
        gravity: 360,
        drag: 0.96,
        sizeMin: 5,
        sizeMax: 10,
        lifeMin: 0.9,
        lifeMax: 1.7,
        colors: ["#ffd23f", "#fbbf24", "#fef08a", "#ffffff", "#f59e0b"],
        additive: false
      });
    } else if (type === "epic") {
      spawnBurst(width * 0.5, height * 0.45, {
        kind: "spark",
        count: 34,
        speedMin: 140,
        speedMax: 420,
        gravity: 160,
        colors: ["#c084fc", "#a855f7", "#e879f9", "#ffffff"]
      });
    } else if (type === "boss_victory") {
      const volleys = [
        { delay: 0, x: width * 0.5, y: height * 0.46, count: 80 },
        { delay: 260, x: width * 0.28, y: height * 0.36, count: 55 },
        { delay: 520, x: width * 0.72, y: height * 0.36, count: 55 },
        { delay: 860, x: width * 0.5, y: height * 0.3, count: 70 }
      ];
      volleys.forEach((v) => {
        setTimeout(() => {
          spawnRing(v.x, v.y, { maxRadius: 210, color: "#ffd23f", lineWidth: 5, duration: 0.55 });
          spawnBurst(v.x, v.y, {
            kind: "confetti",
            count: v.count,
            speedMin: 200,
            speedMax: 640,
            gravity: 340,
            drag: 0.96,
            sizeMin: 6,
            sizeMax: 11,
            lifeMin: 1.1,
            lifeMax: 2.2,
            colors: ["#ffd23f", "#00e5a3", "#38bdf8", "#f43f5e", "#fef08a"],
            additive: false
          });
          spawnBurst(v.x, v.y, {
            kind: "spark",
            count: 26,
            speedMin: 160,
            speedMax: 480,
            gravity: 120,
            colors: ["#ffd23f", "#ffffff", "#00e5a3"]
          });
        }, v.delay);
      });
    } else {
      spawnBurst(width * 0.5, height * 0.46, {
        kind: "confetti",
        count: 48,
        speedMin: 170,
        speedMax: 500,
        gravity: 340,
        drag: 0.96,
        sizeMin: 5,
        sizeMax: 10,
        lifeMin: 0.9,
        lifeMax: 1.7,
        colors: ["#ffd23f", "#00e5a3", "#38bdf8", "#ffffff"],
        additive: false
      });
    }
  }

  function burstAt(targetOrPoint, preset = "gold", options = {}) {
    const pt = resolvePoint(targetOrPoint);
    const presets = {
      gold: {
        colors: ["#ffd23f", "#fbbf24", "#fef08a", "#ffffff"],
        count: 24,
        kind: "spark",
        speedMin: 110,
        speedMax: 340
      },
      epic: {
        colors: ["#c084fc", "#a855f7", "#e879f9", "#ffffff"],
        count: 28,
        kind: "spark",
        speedMin: 120,
        speedMax: 380
      },
      legendary: {
        colors: ["#ffd23f", "#f59e0b", "#fef08a", "#ffffff"],
        count: 42,
        kind: "spark",
        speedMin: 150,
        speedMax: 480
      },
      crimson: {
        colors: ["#ff2e55", "#f97316", "#ffd23f", "#ffffff"],
        count: 24,
        kind: "spark",
        speedMin: 120,
        speedMax: 390
      },
      arcane: {
        colors: ["#38bdf8", "#00d4ff", "#a5f3fc", "#ffffff"],
        count: 22,
        kind: "orb",
        speedMin: 80,
        speedMax: 280
      },
      heal: {
        colors: ["#00e5a3", "#34d399", "#a7f3d0", "#ffffff"],
        count: 22,
        kind: "orb",
        angleMin: -Math.PI * 0.85,
        angleMax: -Math.PI * 0.15,
        gravity: -40,
        speedMin: 70,
        speedMax: 210
      },
      ash: {
        colors: ["#ef4444", "#991b1b", "#64748b", "#334155"],
        count: 34,
        kind: "ember",
        angleMin: 0,
        angleMax: Math.PI * 2,
        gravity: 90,
        speedMin: 30,
        speedMax: 140,
        lifeMin: 0.7,
        lifeMax: 1.5,
        additive: false
      }
    };
    const cfg = Object.assign({}, presets[preset] || presets.gold, options);
    spawnBurst(pt.x, pt.y, cfg);
    if (options.ring !== false) {
      spawnRing(pt.x, pt.y, {
        color: cfg.colors[0],
        maxRadius: options.ringRadius || 110,
        duration: 0.4
      });
    }
  }

  function trail(fromTarget, toTarget, preset = "arcane") {
    if (isReducedMotion()) return;
    const p1 = resolvePoint(fromTarget);
    const p2 = resolvePoint(toTarget);
    const colors = preset === "legendary"
      ? ["#ffd23f", "#fef08a", "#ffffff"]
      : preset === "epic"
        ? ["#c084fc", "#e879f9", "#ffffff"]
        : preset === "crimson"
          ? ["#ff2e55", "#ff7b00", "#ffd23f"]
          : ["#00d4ff", "#38bdf8", "#ffffff"];

    const steps = 10;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const delay = i * 18;
      setTimeout(() => {
        const arcY = Math.sin(t * Math.PI) * -42;
        const px = p1.x + (p2.x - p1.x) * t;
        const py = p1.y + (p2.y - p1.y) * t + arcY;
        spawnBurst(px, py, {
          kind: "orb",
          count: 3,
          speedMin: 15,
          speedMax: 75,
          gravity: 40,
          sizeMin: 2.5,
          sizeMax: 5.5,
          lifeMin: 0.22,
          lifeMax: 0.42,
          colors
        });
      }, delay);
    }
  }

  function playRarityReveal(cardEl, rarity = "comun") {
    if (!cardEl) return;
    const r = (rarity || "comun").toLowerCase();
    const pt = resolvePoint(cardEl);

    if (r === "legendaria") {
      cardEl.classList.add("vfx-reveal-legendary");
      spawnPillar(pt.x, pt.y, { width: 150, height: 560, color: "#ffd23f", duration: 0.9 });
      spawnRing(pt.x, pt.y, { maxRadius: 190, color: "#ffd23f", lineWidth: 6, duration: 0.55 });
      screenFlash("#ffd23f", 0.24, 340);
      shake(".booster-modal-card", "medium");
      burstAt(pt, "legendary", { count: 44, ring: false });
      celebrate("legendary");
      window.SFX?.play("legendary_fanfare");
    } else if (r === "epica") {
      cardEl.classList.add("vfx-reveal-epic");
      spawnPillar(pt.x, pt.y, { width: 105, height: 420, color: "#a855f7", duration: 0.65 });
      spawnRing(pt.x, pt.y, { maxRadius: 145, color: "#c084fc", lineWidth: 4, duration: 0.45 });
      screenFlash("#a855f7", 0.14, 240);
      burstAt(pt, "epic", { count: 30, ring: false });
      window.SFX?.play("epic_sting");
    } else if (r === "rara") {
      cardEl.classList.add("vfx-reveal-rare");
      burstAt(pt, "arcane", { count: 14, ringRadius: 85 });
    }
  }

  function playCardPlay(card, originEl, targetSelector) {
    if (!card) return;
    const rarity = (card.rarity || "comun").toLowerCase();
    const pt = resolvePoint(originEl || "#player-hand");

    if (rarity === "legendaria") {
      screenFlash("#ffd23f", 0.22, 260);
      shake(".main-stage", "medium");
      hitStop(".main-stage", 65);
      spawnPillar(pt.x, pt.y, { width: 130, height: 480, color: "#ffd23f", duration: 0.6 });
      burstAt(pt, "legendary", { count: 38, ringRadius: 165 });
      if (targetSelector) {
        trail(pt, targetSelector, "legendary");
        spawnLightning(pt, targetSelector, "#ffd23f");
      }
      window.SFX?.play("legendary_fanfare");
    } else if (rarity === "epica") {
      screenFlash("#a855f7", 0.12, 200);
      shake(".main-stage", "light");
      burstAt(pt, "epic", { count: 26, ringRadius: 130 });
      if (targetSelector) {
        trail(pt, targetSelector, "epic");
      }
      window.SFX?.play("epic_sting");
    } else if (rarity === "rara") {
      burstAt(pt, "arcane", { count: 14, ringRadius: 85 });
    }
  }

  function playUnitDestroy(slotSelector, isEnemy = true) {
    const pt = resolvePoint(slotSelector);
    hitStop(".main-stage", 55);
    shake(slotSelector, "medium");
    spawnRing(pt.x, pt.y, {
      color: isEnemy ? "#ffd23f" : "#ff2e55",
      maxRadius: 95,
      lineWidth: 4,
      duration: 0.36
    });
    spawnBurst(pt.x, pt.y, {
      kind: "shard",
      count: 16,
      speedMin: 120,
      speedMax: 340,
      gravity: 520,
      drag: 0.96,
      sizeMin: 5,
      sizeMax: 11,
      lifeMin: 0.45,
      lifeMax: 0.85,
      colors: isEnemy
        ? ["#f87171", "#fbbf24", "#94a3b8", "#334155"]
        : ["#60a5fa", "#f87171", "#94a3b8", "#334155"],
      additive: false
    });
    spawnBurst(pt.x, pt.y, {
      kind: "spark",
      count: 16,
      speedMin: 100,
      speedMax: 320,
      gravity: 160,
      colors: ["#ffd23f", "#ff7b00", "#ffffff"]
    });
    window.SFX?.play("unit_shatter");
  }

  function playHeroHit(selector, amount, blocked = false) {
    const pt = resolvePoint(selector);
    if (blocked) {
      spawnRing(pt.x, pt.y, { color: "#38bdf8", maxRadius: 90, lineWidth: 4, duration: 0.32 });
      burstAt(pt, "arcane", { count: 14, ring: false });
      return;
    }
    const heavy = amount >= 7;
    if (heavy) {
      hitStop(".main-stage", 60);
      shake(".main-stage", "heavy");
    } else {
      shake(selector, "medium");
    }
    burstAt(pt, "crimson", { count: heavy ? 28 : 16, ringRadius: heavy ? 130 : 90 });
  }

  function playFinisherSequence(mode = "victory") {
    if (mode === "boss_victory") {
      const enemyPt = resolvePoint("#enemy-hero-panel");
      hitStop(".main-stage", 90);
      screenFlash("#ffffff", 0.35, 340);
      shake(".main-stage", "boss");
      spawnRing(enemyPt.x, enemyPt.y, { maxRadius: 240, color: "#ffd23f", lineWidth: 7, duration: 0.65 });
      burstAt(enemyPt, "legendary", { count: 48, ring: false });
      window.SFX?.play("boss_explosion");

      setTimeout(() => {
        shake(".main-stage", "heavy");
        burstAt({ x: enemyPt.x - 90, y: enemyPt.y + 40 }, "crimson", { count: 28, ringRadius: 130 });
      }, 280);

      setTimeout(() => {
        shake(".main-stage", "heavy");
        burstAt({ x: enemyPt.x + 90, y: enemyPt.y + 30 }, "legendary", { count: 32, ringRadius: 150 });
        celebrate("boss_victory");
      }, 560);
    } else if (mode === "victory") {
      const enemyPt = resolvePoint("#enemy-hero-panel");
      hitStop(".main-stage", 70);
      screenFlash("#ffd23f", 0.22, 280);
      shake(".main-stage", "heavy");
      spawnRing(enemyPt.x, enemyPt.y, { maxRadius: 190, color: "#ffd23f", lineWidth: 6, duration: 0.5 });
      burstAt(enemyPt, "legendary", { count: 36, ring: false });
      celebrate("victory");
    } else {
      const playerPt = resolvePoint("#player-hero-panel");
      hitStop(".main-stage", 80);
      screenFlash("#dc2626", 0.28, 360);
      shake(".main-stage", "heavy");
      spawnRing(playerPt.x, playerPt.y, { maxRadius: 180, color: "#ef4444", lineWidth: 6, duration: 0.55 });
      burstAt(playerPt, "ash", { count: 42, ring: false });
      setTimeout(() => {
        burstAt({ x: width * 0.5, y: height * 0.55 }, "ash", { count: 32, ring: false });
      }, 280);
    }
  }

  function playEventOutcome(kind = "positive", modalSelector = ".event-modal-card") {
    const modalEl = document.querySelector(modalSelector);
    const pt = resolvePoint(modalEl || document.body);
    if (modalEl) {
      modalEl.classList.remove("event-fx-positive", "event-fx-negative", "event-fx-epic");
      void modalEl.offsetWidth;
    }

    if (kind === "negative") {
      modalEl?.classList.add("event-fx-negative");
      shake(modalEl || ".event-modal-card", "heavy");
      screenFlash("#ef4444", 0.22, 260);
      burstAt(pt, "crimson", { count: 30, ringRadius: 150 });
      window.SFX?.play("event_negative");
    } else if (kind === "epic") {
      modalEl?.classList.add("event-fx-epic");
      screenFlash("#a855f7", 0.16, 240);
      burstAt(pt, "epic", { count: 34, ringRadius: 160 });
      celebrate("epic");
      window.SFX?.play("epic_sting");
    } else {
      modalEl?.classList.add("event-fx-positive");
      burstAt(pt, "heal", { count: 28, ringRadius: 140 });
      spawnBurst(pt.x, pt.y, {
        kind: "coin",
        count: 14,
        speedMin: 110,
        speedMax: 290,
        gravity: 340,
        sizeMin: 5,
        sizeMax: 8,
        lifeMin: 0.6,
        lifeMax: 1.1,
        colors: ["#ffd23f", "#fef08a"],
        additive: false
      });
      window.SFX?.play("event_positive");
    }
  }

  function setTimerUrgency(secondsLeft, isActive = true) {
    const vig = ensureVignetteEl();
    const endTurnBtn = document.getElementById("end-turn-btn");
    if (!isActive || secondsLeft > 10 || secondsLeft <= 0) {
      vig.classList.remove("warn", "critical");
      endTurnBtn?.classList.remove("timer-critical-pulse");
      lastUrgencySecond = null;
      return;
    }

    if (secondsLeft <= 5) {
      vig.classList.remove("warn");
      vig.classList.add("critical");
      endTurnBtn?.classList.add("timer-critical-pulse");
      const secCeil = Math.ceil(secondsLeft);
      if (secCeil !== lastUrgencySecond && secCeil >= 1 && secCeil <= 5) {
        lastUrgencySecond = secCeil;
        window.SFX?.play("timer_tick");
      }
    } else {
      vig.classList.add("warn");
      vig.classList.remove("critical");
      endTurnBtn?.classList.remove("timer-critical-pulse");
      lastUrgencySecond = null;
    }
  }

  function tick(now) {
    const dt = Math.min((now - lastTime) / 1000, 0.05);
    lastTime = now;

    ctx.clearRect(0, 0, width, height);

    // 1. Screen flash
    if (flash) {
      flash.life -= dt;
      if (flash.life <= 0) {
        flash = null;
      } else {
        const t = flash.life / flash.maxLife;
        ctx.save();
        ctx.globalAlpha = flash.peakAlpha * t * t;
        ctx.fillStyle = flash.color;
        ctx.fillRect(0, 0, width, height);
        ctx.restore();
      }
    }

    // 2. Vertical light pillars (Legendary / Epic)
    for (let i = pillars.length - 1; i >= 0; i--) {
      const pl = pillars[i];
      pl.life -= dt;
      if (pl.life <= 0) {
        pillars.splice(i, 1);
        continue;
      }
      const p = 1 - pl.life / pl.maxLife;
      const alpha = Math.sin(p * Math.PI) * 0.72;
      const w = pl.width * (0.65 + p * 0.5);
      const grad = ctx.createLinearGradient(pl.x - w / 2, 0, pl.x + w / 2, 0);
      grad.addColorStop(0, "rgba(255,255,255,0)");
      grad.addColorStop(0.5, pl.color);
      grad.addColorStop(1, "rgba(255,255,255,0)");
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      ctx.globalAlpha = Math.max(0, alpha);
      ctx.fillStyle = grad;
      ctx.fillRect(pl.x - w / 2, pl.y - pl.height * 0.65, w, pl.height);
      ctx.restore();
    }

    // 3. Shockwave rings
    for (let i = rings.length - 1; i >= 0; i--) {
      const r = rings[i];
      r.life -= dt;
      if (r.life <= 0) {
        rings.splice(i, 1);
        continue;
      }
      const p = 1 - r.life / r.maxLife;
      const easeOut = 1 - Math.pow(1 - p, 3);
      const curR = r.radius + (r.maxRadius - r.radius) * easeOut;
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      ctx.globalAlpha = (1 - p) * 0.9;
      ctx.strokeStyle = r.color;
      ctx.lineWidth = Math.max(1, r.lineWidth * (1 - p));
      ctx.beginPath();
      ctx.arc(r.x, r.y, curR, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // 4. Lightning arcs
    for (let i = bolts.length - 1; i >= 0; i--) {
      const b = bolts[i];
      b.life -= dt;
      if (b.life <= 0) {
        bolts.splice(i, 1);
        continue;
      }
      const alpha = b.life / b.maxLife;
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.globalAlpha = alpha * 0.85;
      ctx.strokeStyle = b.color;
      ctx.lineWidth = 6;
      ctx.beginPath();
      b.points.forEach((pt, idx) => {
        if (idx === 0) ctx.moveTo(pt.x, pt.y);
        else ctx.lineTo(pt.x, pt.y);
      });
      ctx.stroke();
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();
    }

    // 5. Particles
    for (let i = particles.length - 1; i >= 0; i--) {
      const pt = particles[i];
      pt.life -= dt;
      if (pt.life <= 0) {
        particles.splice(i, 1);
        continue;
      }
      pt.vx *= Math.pow(pt.drag, dt * 60);
      pt.vy = pt.vy * Math.pow(pt.drag, dt * 60) + pt.gravity * dt;
      pt.x += pt.vx * dt;
      pt.y += pt.vy * dt;
      pt.rot += pt.vRot * dt;
      pt.wobblePhase += pt.wobbleSpeed * dt;

      const t = pt.life / pt.maxLife;
      ctx.save();
      if (pt.additive) ctx.globalCompositeOperation = "lighter";
      ctx.globalAlpha = Math.max(0, Math.min(1, t * 1.25));
      ctx.fillStyle = pt.color;
      ctx.strokeStyle = pt.color;

      if (pt.kind === "spark") {
        const angle = Math.atan2(pt.vy, pt.vx);
        const speed = Math.hypot(pt.vx, pt.vy);
        const len = Math.max(pt.size * 1.8, Math.min(28, speed * 0.05));
        ctx.translate(pt.x, pt.y);
        ctx.rotate(angle);
        ctx.lineWidth = Math.max(1.5, pt.size * 0.55 * t);
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(-len * 0.5, 0);
        ctx.lineTo(len * 0.5, 0);
        ctx.stroke();
      } else if (pt.kind === "confetti") {
        ctx.translate(pt.x, pt.y);
        ctx.rotate(pt.rot);
        ctx.scale(1, Math.cos(pt.wobblePhase));
        ctx.fillRect(-pt.size * 0.6, -pt.size * 0.35, pt.size * 1.2, pt.size * 0.7);
      } else if (pt.kind === "shard") {
        ctx.translate(pt.x, pt.y);
        ctx.rotate(pt.rot);
        ctx.beginPath();
        ctx.moveTo(0, -pt.size);
        ctx.lineTo(pt.size * 0.8, pt.size * 0.7);
        ctx.lineTo(-pt.size * 0.75, pt.size * 0.5);
        ctx.closePath();
        ctx.fill();
      } else if (pt.kind === "coin") {
        ctx.translate(pt.x, pt.y);
        ctx.scale(Math.max(0.25, Math.abs(Math.cos(pt.wobblePhase))), 1);
        ctx.beginPath();
        ctx.arc(0, 0, pt.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#b45309";
        ctx.lineWidth = 1.5;
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, Math.max(0.8, pt.size * t), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    if (particles.length > 0 || rings.length > 0 || pillars.length > 0 || bolts.length > 0 || flash) {
      rafId = requestAnimationFrame(tick);
    } else {
      rafId = null;
    }
  }

  window.VFX = {
    burstAt,
    trail,
    screenFlash,
    shake,
    hitStop,
    celebrate,
    spawnLightning,
    playRarityReveal,
    playCardPlay,
    playUnitDestroy,
    playHeroHit,
    playFinisherSequence,
    playEventOutcome,
    setTimerUrgency
  };
})();
