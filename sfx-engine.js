// Motor ligero de SFX multicapa con aleatoriedad organica para Duelforge.
// Reutiliza los presets definidos en sfx-presets.js.
(function () {
  const MUTE_KEY = "duelforge_sfx_muted_v1";
  let audioCtx = null;
  let muted = localStorage.getItem(MUTE_KEY) === "true";

  const presetMap = new Map();
  if (Array.isArray(window.SFX_PRESETS)) {
    window.SFX_PRESETS.forEach((p) => {
      if (p && p.id) presetMap.set(p.id, p);
    });
  }

  function ensureContext() {
    if (!audioCtx) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return null;
      audioCtx = new Ctx();
    }
    if (audioCtx.state === "suspended") {
      audioCtx.resume().catch(() => {});
    }
    return audioCtx;
  }

  function jitterFactor(amount) {
    if (!amount) return 1;
    return 1 + (Math.random() * 2 - 1) * amount;
  }

  function playPreset(id, delayOffsetMs = 0) {
    if (muted) return;
    const preset = presetMap.get(id);
    if (!preset || !Array.isArray(preset.layers)) return;

    const ctx = ensureContext();
    if (!ctx) return;

    const baseTime = ctx.currentTime + delayOffsetMs / 1000;
    // Variacion de tono principal + micro-variacion en filtro y duracion para repeticiones naturales
    const pitchMult = jitterFactor(Math.max(0.03, preset.pitchJitter || 0));
    const filterMult = jitterFactor(0.08);
    const durMult = jitterFactor(0.06);

    preset.layers.forEach((layer) => {
      const startTime = baseTime + (layer.delayMs || 0) / 1000;
      const durationSec = Math.max(0.015, ((layer.durationMs || 100) * durMult) / 1000);
      const fStart = Math.max(20, (layer.freqStart || 440) * pitchMult);
      const fEnd = Math.max(20, (layer.freqEnd || 220) * pitchMult);

      const gainNode = ctx.createGain();
      gainNode.gain.setValueAtTime(0.0001, startTime);
      gainNode.gain.linearRampToValueAtTime(layer.volume ?? 0.3, startTime + 0.008);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + durationSec);

      const filter = ctx.createBiquadFilter();
      filter.type = layer.filterType || "lowpass";
      filter.frequency.setValueAtTime(Math.max(40, (layer.filterFreq || 1800) * filterMult), startTime);

      filter.connect(gainNode);
      gainNode.connect(ctx.destination);

      if (layer.type === "noise") {
        const sampleCount = Math.max(1, Math.floor(ctx.sampleRate * durationSec));
        const buffer = ctx.createBuffer(1, sampleCount, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < sampleCount; i++) {
          data[i] = Math.random() * 2 - 1;
        }
        const noiseSource = ctx.createBufferSource();
        noiseSource.buffer = buffer;
        filter.frequency.setValueAtTime(fStart, startTime);
        filter.frequency.exponentialRampToValueAtTime(fEnd, startTime + durationSec);
        noiseSource.connect(filter);
        noiseSource.start(startTime);
        noiseSource.stop(startTime + durationSec);
      } else {
        const osc = ctx.createOscillator();
        osc.type = layer.type || "sine";
        osc.frequency.setValueAtTime(fStart, startTime);
        osc.frequency.exponentialRampToValueAtTime(fEnd, startTime + durationSec);
        osc.connect(filter);
        osc.start(startTime);
        osc.stop(startTime + durationSec);
      }
    });
  }

  function playBurst(id, count = 1, intervalMs = 55) {
    if (muted || count <= 0) return;
    const capped = Math.min(count, 8);
    for (let i = 0; i < capped; i++) {
      playPreset(id, i * intervalMs);
    }
  }

  function setMuted(nextMuted) {
    muted = Boolean(nextMuted);
    localStorage.setItem(MUTE_KEY, String(muted));
    return muted;
  }

  function toggleMute() {
    return setMuted(!muted);
  }

  // Desbloqueo automatico tras la primera interaccion del usuario
  window.addEventListener("pointerdown", ensureContext, { once: true });
  window.addEventListener("keydown", ensureContext, { once: true });

  window.SFX = {
    play: playPreset,
    playBurst: playBurst,
    isMuted: () => muted,
    setMuted: setMuted,
    toggleMute: toggleMute,
    unlock: ensureContext
  };
})();
