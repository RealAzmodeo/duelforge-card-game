(function (global) {
  "use strict";

  const SHAKE_TARGET = 3;
  const RARITY_ORDER = { comun: 1, rara: 2, epica: 3, legendaria: 4 };
  const AIR_SMOKE_SPRITES = Array.from({ length: 9 }, (_, i) => `assets/spraycasters/ui/smoke_air_${i}.png`);

  const PALETTE_BY_RARITY = {
    comun: {
      tint: [34, 211, 238],
      hex: "#22d3ee",
      glow: "rgba(34, 211, 238, 0.92)",
      ring: "#38bdf8"
    },
    rara: {
      tint: [59, 130, 246],
      hex: "#3b82f6",
      glow: "rgba(59, 130, 246, 0.96)",
      ring: "#60a5fa"
    },
    epica: {
      tint: [217, 70, 239],
      hex: "#d946ef",
      glow: "rgba(217, 70, 239, 0.98)",
      ring: "#f472b6"
    },
    legendaria: {
      tint: [250, 204, 21],
      hex: "#facc15",
      glow: "rgba(250, 204, 21, 1)",
      ring: "#fde047"
    }
  };

  function getHighestRarity(cards) {
    let best = "comun";
    (cards || []).forEach((c) => {
      const r = c?.rarity || "comun";
      if ((RARITY_ORDER[r] || 1) > (RARITY_ORDER[best] || 1)) best = r;
    });
    return best;
  }

  function createTintedSmokeCanvas(src, rgb, size = 460) {
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, size, size);
      ctx.drawImage(img, 0, 0, size, size);
      const imgData = ctx.getImageData(0, 0, size, size);
      const d = imgData.data;
      const [tr, tg, tb] = rgb;
      for (let i = 0; i < d.length; i += 4) {
        const a = d[i + 3];
        if (a < 8) continue;
        // Luminance-weighted tint keeping crisp highlights and rich colored shadows
        const lum = (d[i] * 0.299 + d[i + 1] * 0.587 + d[i + 2] * 0.114) / 255;
        const boost = 0.35 + lum * 0.85;
        d[i] = Math.min(255, Math.round(tr * boost + lum * 70));
        d[i + 1] = Math.min(255, Math.round(tg * boost + lum * 70));
        d[i + 2] = Math.min(255, Math.round(tb * boost + lum * 70));
      }
      ctx.putImageData(imgData, 0, 0);
    };
    img.src = src;
    return canvas;
  }

  function mount(container, cards, sprayImgSrc, onRevealComplete) {
    if (!container) return;
    container.innerHTML = "";
    container.removeAttribute("style");

    let shakes = 0;
    let exploding = false;
    const maxRarity = getHighestRarity(cards);
    const pal = PALETTE_BY_RARITY[maxRarity] || PALETTE_BY_RARITY.comun;

    // Preload 3 random mid-air smoke clouds tinted to the highest card rarity
    const shuffledSprites = [...AIR_SMOKE_SPRITES].sort(() => Math.random() - 0.5).slice(0, 3);
    const preTintedCanvases = shuffledSprites.map((src) => createTintedSmokeCanvas(src, pal.tint));

    const wrap = document.createElement("div");
    wrap.className = "spray-booster-can-wrap";

    const canImg = document.createElement("img");
    canImg.id = "booster-pack-img";
    canImg.src = sprayImgSrc;
    canImg.alt = "Lata de Spray";
    canImg.className = "spray-booster-can-img";
    canImg.style.setProperty("--spray-glow", pal.glow);

    const shakeBtn = document.createElement("button");
    shakeBtn.type = "button";
    shakeBtn.className = "game-plate-btn plate-amber spray-shake-cta";
    shakeBtn.textContent = `AGITAR LATA (0/${SHAKE_TARGET})`;

    wrap.appendChild(canImg);
    wrap.appendChild(shakeBtn);
    container.appendChild(wrap);

    function triggerSmokeExplosion() {
      exploding = true;
      shakeBtn.style.display = "none";

      // Phase 1 (0 - 160ms): Rapid overload vibration on the can
      canImg.classList.remove("spray-violent-1", "spray-violent-2");
      canImg.classList.add("spray-overload-charge");
      window.SFX?.play("spray_shake");

      // Phase 2 (160ms): Detonation - screen shake, shockwaves, splatter droplets, multi-layer aerial smoke
      setTimeout(() => {
        window.SFX?.play("spray_burst");
        window.SFX?.play("dubstep_drop_hit");

        canImg.classList.remove("spray-overload-charge");
        canImg.classList.add("spray-violent-3");

        const modalCard = container.closest(".booster-modal-card");
        if (modalCard) {
          modalCard.classList.remove("booster-impact-shake");
          void modalCard.offsetWidth;
          modalCard.classList.add("booster-impact-shake");
        }

        // Flash burst + 2 concentric shockwave rings
        const flash = document.createElement("div");
        flash.className = "spray-air-flash";
        flash.style.setProperty("--shock-color", pal.hex);
        wrap.appendChild(flash);

        [0, 1].forEach((rIdx) => {
          const ring = document.createElement("div");
          ring.className = `spray-shockwave-ring ring-${rIdx + 1}`;
          ring.style.borderColor = pal.ring;
          ring.style.boxShadow = `0 0 28px ${pal.glow}, inset 0 0 18px ${pal.glow}`;
          wrap.appendChild(ring);
        });

        // Paint droplet scatter via SprayVFX
        window.SprayVFX?.splatterAt("#booster-pack-stage", pal.hex, false);

        // Multi-layer aerial smoke clouds rotating and expanding in mid-air
        preTintedCanvases.forEach((canvasEl, idx) => {
          canvasEl.className = `spray-smoke-cloud air-layer-${idx + 1}`;
          canvasEl.style.setProperty("--smoke-glow", pal.glow);
          wrap.appendChild(canvasEl);
        });
      }, 150);

      // Phase 3 (560ms): Reveal cards emerging from the dissipating smoke
      setTimeout(() => {
        container.innerHTML = "";
        container.classList.add("hidden");
        if (typeof onRevealComplete === "function") onRevealComplete(cards);
      }, 620);
    }

    function onShake(e) {
      e.stopPropagation();
      if (exploding) return;
      shakes++;
      window.SFX?.play("spray_shake");

      canImg.classList.remove("spray-violent-1", "spray-violent-2", "spray-violent-3");
      void canImg.offsetWidth;

      if (shakes === 1) {
        canImg.classList.add("spray-violent-1");
        shakeBtn.textContent = `AGITAR LATA (1/${SHAKE_TARGET}) - PRESION SUBIENDO`;
      } else if (shakes === 2) {
        canImg.classList.add("spray-violent-2");
        shakeBtn.textContent = `AGITAR LATA (2/${SHAKE_TARGET}) - A PUNTO DE EXPLOTAR!`;
      } else {
        triggerSmokeExplosion();
      }
    }

    wrap.addEventListener("click", onShake);
  }

  global.SprayBooster = { mount };
})(window);
