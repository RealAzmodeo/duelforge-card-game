(function () {
  "use strict";

  const BG_VAR_MAP = {
    "#title-screen": "--title-bg",
    ".main-stage": "--arena-bg",
    "#rest-screen": "--rest-bg",
    "#map-board-canvas": "--map-bg",
  };

  const SCENE_CONTAINER_MAP = {
    title: "#title-screen",
    deck: "#deck-select-screen",
    map: "#map-screen",
    duel: ".main-stage",
    rest: "#rest-screen",
    shop: "#shop-modal .shop-modal-card",
    event: "#event-modal .event-modal-card",
    booster: "#booster-modal .booster-modal-card",
    collection: "#collection-screen",
    vslobby: "#vs-lobby-modal",
    gameover: "#game-over-modal .gameover-card",
    inventory: "#inventory-modal .inventory-modal-card",
  };

  function ensureCustomElementStyles() {
    if (document.getElementById("custom-scene-styles")) return;
    const st = document.createElement("style");
    st.id = "custom-scene-styles";
    st.textContent = `
      .custom-scene-el {
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        z-index: 35;
        user-select: none;
      }
      .custom-scene-img {
        max-width: 260px;
        max-height: 260px;
        object-fit: contain;
        display: block;
      }
      .custom-scene-button {
        padding: 12px 24px;
        border-radius: 10px;
        border: 2px solid #f59e0b;
        background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%);
        color: #f8fafc;
        font-family: "Cinzel", serif;
        font-weight: 800;
        font-size: 16px;
        letter-spacing: 0.06em;
        cursor: pointer;
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.45);
      }
      .custom-scene-text {
        color: #f8fafc;
        font-family: "Barlow Condensed", sans-serif;
        font-weight: 800;
        font-size: 26px;
        letter-spacing: 0.05em;
        text-shadow: 0 2px 10px rgba(0, 0, 0, 0.85);
        white-space: nowrap;
      }
    `;
    document.head.appendChild(st);
  }

  function syncCustomElements(customList) {
    ensureCustomElementStyles();
    const list = Array.isArray(customList) ? customList : [];
    const activeIds = new Set(list.map((item) => item.id));

    document.querySelectorAll(".custom-scene-el").forEach((el) => {
      if (!activeIds.has(el.id)) {
        el.remove();
      }
    });

    list.forEach((item) => {
      if (!item || !item.id) return;
      const containerSel = SCENE_CONTAINER_MAP[item.sceneId] || ".main-stage";
      const container = document.querySelector(containerSel);
      if (!container) return;

      let el = document.getElementById(item.id);
      if (!el) {
        if (item.type === "img") {
          el = document.createElement("img");
          el.src = item.asset || "assets/ui/icon_gem.png";
          el.alt = item.name || "Imagen";
        } else if (item.type === "button") {
          el = document.createElement("button");
          el.type = "button";
        } else {
          el = document.createElement("div");
        }
        el.id = item.id;
        el.className = `custom-scene-el custom-scene-${item.type || "text"}`;
        container.appendChild(el);
      } else if (el.parentElement !== container) {
        container.appendChild(el);
      }

      if (item.type === "img") {
        const targetSrc = item.asset || "assets/ui/icon_gem.png";
        if (el.getAttribute("src") !== targetSrc) {
          el.src = targetSrc;
        }
      } else {
        el.textContent = item.text || item.name || "Elemento";
      }
    });
  }

  function resetElementStyles(el, selector) {
    el.style.translate = "";
    el.style.scale = "";
    el.style.rotate = "";
    el.style.zIndex = "";

    const bgVar = BG_VAR_MAP[selector];
    if (bgVar) {
      el.style.removeProperty(bgVar);
    } else if (el.dataset.origAsset !== undefined) {
      if (el.tagName === "IMG") {
        el.src = el.dataset.origAsset;
      } else {
        el.style.backgroundImage = el.dataset.origAsset;
      }
      delete el.dataset.origAsset;
    }
  }

  const REF_WIDTH = 1920;
  const REF_HEIGHT = 1080;

  function applyEntry(el, selector, cfg) {
    if (!el || !cfg) return;

    const rx = window.innerWidth / REF_WIDTH;
    const ry = window.innerHeight / REF_HEIGHT;
    const x = Math.round(Number(cfg.x || 0) * rx);
    const y = Math.round(Number(cfg.y || 0) * ry);
    const scale = cfg.scale !== undefined ? Number(cfg.scale) : 1;
    const rotate = Number(cfg.rotate || 0);

    el.style.translate = x !== 0 || y !== 0 ? `${x}px ${y}px` : "";
    el.style.scale = scale !== 1 ? String(scale) : "";
    el.style.rotate = rotate !== 0 ? `${rotate}deg` : "";

    if (cfg.zIndex !== undefined && cfg.zIndex !== null && cfg.zIndex !== "") {
      el.style.zIndex = String(cfg.zIndex);
    } else {
      el.style.zIndex = "";
    }

    const bgVar = cfg.bgVar || BG_VAR_MAP[selector];
    if (cfg.asset) {
      if (bgVar) {
        el.style.setProperty(bgVar, `url("${cfg.asset}")`);
      } else if (el.tagName === "IMG") {
        if (el.dataset.origAsset === undefined) {
          el.dataset.origAsset = el.getAttribute("src") || "";
        }
        if (el.getAttribute("src") !== cfg.asset) {
          el.src = cfg.asset;
        }
      } else {
        if (el.dataset.origAsset === undefined) {
          el.dataset.origAsset = el.style.backgroundImage || "";
        }
        el.style.backgroundImage = `url("${cfg.asset}")`;
      }
    } else {
      if (bgVar) {
        el.style.removeProperty(bgVar);
      } else if (el.dataset.origAsset !== undefined) {
        if (el.tagName === "IMG") {
          el.src = el.dataset.origAsset;
        } else {
          el.style.backgroundImage = el.dataset.origAsset;
        }
        delete el.dataset.origAsset;
      }
    }
  }

  const appliedSelectors = new Set();

  function applySceneLayout(layout) {
    const data = layout || window.SCENE_LAYOUT || {};

    syncCustomElements(data._customElements);

    for (const prevSel of appliedSelectors) {
      if (!data[prevSel]) {
        document.querySelectorAll(prevSel).forEach((el) => resetElementStyles(el, prevSel));
        appliedSelectors.delete(prevSel);
      }
    }

    for (const [selector, cfg] of Object.entries(data)) {
      if (!cfg || selector.startsWith("_")) continue;
      try {
        const nodes = document.querySelectorAll(selector);
        nodes.forEach((el) => applyEntry(el, selector, cfg));
        appliedSelectors.add(selector);
      } catch (err) {
        console.warn("[SceneLayout] Selector invalido:", selector, err);
      }
    }
  }

  window.applySceneLayout = applySceneLayout;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => applySceneLayout());
  } else {
    applySceneLayout();
  }

  window.addEventListener("resize", () => applySceneLayout());

  let rafScheduled = false;
  const observer = new MutationObserver(() => {
    if (!window.SCENE_LAYOUT || Object.keys(window.SCENE_LAYOUT).length === 0) return;
    if (rafScheduled) return;
    rafScheduled = true;
    requestAnimationFrame(() => {
      rafScheduled = false;
      applySceneLayout();
    });
  });
  observer.observe(document.body, { childList: true, subtree: true });

  // =========================================================================
  // EDITOR MODE (?editor=1)
  // =========================================================================
  const isEditor = new URLSearchParams(window.location.search).get("editor") === "1";
  if (!isEditor) return;

  // Suppress FTUE overlays inside editor preview
  if (window.FTUE) {
    const noop = () => {};
    window.FTUE.onDeckSelectOpen = noop;
    window.FTUE.onBoosterOpen = noop;
    window.FTUE.onMapOpen = noop;
    window.FTUE.onCombatOpen = noop;
    window.FTUE.onRestOpen = noop;
  }

  const styleEl = document.createElement("style");
  styleEl.textContent = `
    #ftue-overlay, #ftue-cheatsheet-modal {
      display: none !important;
    }
    .editor-hover-el {
      outline: 1px dashed #60a5fa !important;
      outline-offset: 2px !important;
    }
    body.editor-active * {
      cursor: default;
    }
    .editor-selected-el {
      cursor: grab !important;
    }
    .editor-selected-el:active {
      cursor: grabbing !important;
    }
    .editor-prefab-dim {
      outline: 2px dashed #10b981 !important;
      outline-offset: 4px !important;
    }
    #editor-gizmo {
      position: fixed;
      pointer-events: none;
      border: 2px solid #3b82f6;
      box-shadow: 0 0 0 1px rgba(15, 23, 42, 0.7);
      z-index: 99999;
      display: none;
    }
    #editor-gizmo .gizmo-handle {
      position: absolute;
      width: 12px;
      height: 12px;
      background: #ffffff;
      border: 2px solid #3b82f6;
      border-radius: 3px;
      pointer-events: auto;
      transform: translate(-50%, -50%);
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.6);
    }
    #editor-gizmo .gizmo-handle.nw { left: 0%; top: 0%; cursor: nwse-resize; }
    #editor-gizmo .gizmo-handle.ne { left: 100%; top: 0%; cursor: nesw-resize; }
    #editor-gizmo .gizmo-handle.sw { left: 0%; top: 100%; cursor: nesw-resize; }
    #editor-gizmo .gizmo-handle.se { left: 100%; top: 100%; cursor: nwse-resize; }
    #editor-gizmo .gizmo-rot-stem {
      position: absolute;
      left: 50%;
      top: -24px;
      width: 2px;
      height: 24px;
      background: #10b981;
      transform: translateX(-50%);
    }
    #editor-gizmo .gizmo-handle.rot {
      left: 50%;
      top: -28px;
      width: 14px;
      height: 14px;
      border-radius: 50%;
      background: #10b981;
      border: 2px solid #ffffff;
      cursor: grab;
    }
    #editor-gizmo .gizmo-handle.rot:active {
      cursor: grabbing;
    }
  `;
  document.head.appendChild(styleEl);
  document.body.classList.add("editor-active");

  const gizmo = document.createElement("div");
  gizmo.id = "editor-gizmo";
  gizmo.innerHTML = `
    <div class="gizmo-rot-stem"></div>
    <div class="gizmo-handle rot" data-handle="rot" title="Arrastrar para rotar"></div>
    <div class="gizmo-handle nw" data-handle="nw" title="Arrastrar para escalar"></div>
    <div class="gizmo-handle ne" data-handle="ne" title="Arrastrar para escalar"></div>
    <div class="gizmo-handle sw" data-handle="sw" title="Arrastrar para escalar"></div>
    <div class="gizmo-handle se" data-handle="se" title="Arrastrar para escalar"></div>
  `;
  document.body.appendChild(gizmo);

  let selectedSelector = null;
  let knownSelectors = [];
  let activePrefab = null;
  let freePick = true;
  let dragState = null;
  let runSeeded = false;
  let allowProgrammaticClick = false;

  const ALL_SCREEN_IDS = [
    "title-screen",
    "deck-select-screen",
    "map-screen",
    "rest-screen",
    "shop-modal",
    "event-modal",
    "booster-modal",
    "collection-screen",
    "vs-lobby-modal",
    "game-over-modal",
    "inventory-modal",
  ];

  function hideAllOverlays() {
    ALL_SCREEN_IDS.forEach((id) => {
      document.getElementById(id)?.classList.add("hidden");
    });
  }

  function ensureEditorRun() {
    if (!runSeeded && typeof window.startNewRun === "function") {
      runSeeded = true;
      window.startNewRun();
      if (typeof window.stopTurnTimer === "function") window.stopTurnTimer();
    }
    if (typeof window.state === "object" && window.state && window.state.player) {
      if (Array.isArray(window.state.player.board) && !window.state.player.board.some(Boolean)) {
        window.state.player.board[0] = {
          name: "Escudero de Acero",
          art: "assets/cards/forja_escudero_acero.png",
          atk: 2,
          hp: 5,
          guard: true,
          ready: true,
          equips: ["Coraza"],
        };
      }
      if (Array.isArray(window.state.enemy?.board) && !window.state.enemy.board.some(Boolean)) {
        window.state.enemy.board[1] = {
          name: "Acechador",
          art: "assets/cards/culto_acechador.png",
          atk: 3,
          hp: 3,
          guard: false,
          stunned: false,
        };
      }
      if (Array.isArray(window.state.player.relics) && !window.state.player.relics.some(Boolean)) {
        window.state.player.relics[0] = {
          name: "Yunque Eterno",
          art: "assets/cards/forja_yunque_eterno.png",
          turnsLeft: 3,
        };
      }
      if (typeof window.render === "function") window.render();
    }
  }

  function updateGizmo() {
    if (!selectedSelector) {
      gizmo.style.display = "none";
      return;
    }
    let el = null;
    try {
      el = document.querySelector(selectedSelector);
    } catch (_) {}
    if (!el) {
      gizmo.style.display = "none";
      return;
    }
    const rect = el.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) {
      gizmo.style.display = "none";
      return;
    }
    gizmo.style.display = "block";
    gizmo.style.left = `${rect.left}px`;
    gizmo.style.top = `${rect.top}px`;
    gizmo.style.width = `${rect.width}px`;
    gizmo.style.height = `${rect.height}px`;
  }

  function buildUniqueSelector(el) {
    if (!el || el === document.body || el === document.documentElement) return null;
    if (el.id) return `#${CSS.escape(el.id)}`;

    for (const sel of knownSelectors) {
      try {
        if (el.matches(sel)) return sel;
      } catch (_) {}
    }

    const parts = [];
    let cur = el;
    while (cur && cur !== document.body && parts.length < 4) {
      if (cur.id) {
        parts.unshift(`#${CSS.escape(cur.id)}`);
        break;
      }
      let part = cur.tagName.toLowerCase();
      const cls = Array.from(cur.classList).filter(
        (c) => !c.startsWith("editor-") && c !== "hidden" && c !== "active"
      );
      if (cls.length > 0) {
        part += `.${CSS.escape(cls[0])}`;
      }
      parts.unshift(part);
      cur = cur.parentElement;
    }
    return parts.join(" > ");
  }

  function findBestTarget(startEl) {
    if (!startEl || startEl.closest("#editor-gizmo")) return null;

    if (activePrefab) {
      const rootEl = startEl.closest(activePrefab.rootSelector);
      if (!rootEl) return null;
      let cur = startEl;
      while (cur && cur !== rootEl.parentElement) {
        for (const sel of activePrefab.childSelectors) {
          try {
            if (cur.matches(sel)) return { el: cur, selector: sel };
          } catch (_) {}
        }
        cur = cur.parentElement;
      }
      if (freePick && startEl !== rootEl) {
        const sel = buildUniqueSelector(startEl);
        if (sel) return { el: startEl, selector: sel };
      }
      return null;
    }

    let cur = startEl;
    while (cur && cur !== document.body) {
      if (cur.classList && cur.classList.contains("custom-scene-el") && cur.id) {
        return { el: cur, selector: `#${CSS.escape(cur.id)}` };
      }
      for (const sel of knownSelectors) {
        try {
          if (cur.matches(sel)) return { el: cur, selector: sel };
        } catch (_) {}
      }
      cur = cur.parentElement;
    }
    if (freePick && startEl !== document.body && startEl !== document.documentElement) {
      const sel = buildUniqueSelector(startEl);
      if (sel) return { el: startEl, selector: sel };
    }
    return null;
  }

  function highlightSelected(selector) {
    document.querySelectorAll(".editor-selected-el").forEach((n) => n.classList.remove("editor-selected-el"));
    selectedSelector = selector;
    if (!selector) {
      updateGizmo();
      return;
    }
    try {
      const el = document.querySelector(selector);
      if (el) {
        el.classList.add("editor-selected-el");
        reportElementInfo(el, selector);
      }
    } catch (_) {}
    updateGizmo();
  }

  function reportElementInfo(el, selector) {
    if (!el) return;
    const bgVar = BG_VAR_MAP[selector] || null;
    let currentAsset = "";
    let supportsAsset = false;

    if (bgVar) {
      supportsAsset = true;
      const customVal = el.style.getPropertyValue(bgVar);
      if (customVal) {
        currentAsset = customVal.replace(/^url\(["']?/, "").replace(/["']?\)$/, "");
      } else {
        const bg = getComputedStyle(el).backgroundImage;
        const m = bg.match(/url\(["']?([^"')]+)["']?\)/g);
        if (m && m.length > 0) {
          const last = m[m.length - 1];
          currentAsset = last.replace(/^url\(["']?/, "").replace(/["']?\)$/, "");
        }
      }
    } else if (el.tagName === "IMG") {
      supportsAsset = true;
      currentAsset = el.getAttribute("src") || "";
    } else {
      const bg = getComputedStyle(el).backgroundImage;
      if (bg && bg !== "none" && bg.includes("url(")) {
        supportsAsset = true;
        const m = bg.match(/url\(["']?([^"')]+)["']?\)/);
        if (m) currentAsset = m[1];
      }
    }

    const assetsIdx = currentAsset.indexOf("assets/");
    if (assetsIdx !== -1) {
      currentAsset = currentAsset.slice(assetsIdx);
    }

    const compZ = getComputedStyle(el).zIndex;
    const zIndex = compZ && compZ !== "auto" ? Number(compZ) : 0;

    window.parent.postMessage(
      {
        type: "editor:elementInfo",
        selector,
        tagName: el.tagName,
        supportsAsset,
        bgVar,
        currentAsset,
        zIndex,
      },
      "*"
    );
  }

  document.addEventListener(
    "click",
    (e) => {
      if (allowProgrammaticClick) return;
      e.preventDefault();
      e.stopPropagation();
    },
    true
  );

  document.addEventListener(
    "dblclick",
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      const hit = findBestTarget(e.target);
      if (hit) {
        window.parent.postMessage({ type: "editor:dblclick", selector: hit.selector }, "*");
      }
    },
    true
  );

  let lastHover = null;
  document.addEventListener(
    "pointermove",
    (e) => {
      if (dragState) {
        window.SCENE_LAYOUT = window.SCENE_LAYOUT || {};
        const prev = window.SCENE_LAYOUT[dragState.selector] || {};

        if (dragState.mode === "move") {
          const dx = Math.round(e.clientX - dragState.startX);
          const dy = Math.round(e.clientY - dragState.startY);
          const newX = dragState.origX + dx;
          const newY = dragState.origY + dy;

          window.SCENE_LAYOUT[dragState.selector] = { ...prev, x: newX, y: newY };
          applySceneLayout(window.SCENE_LAYOUT);
          updateGizmo();

          window.parent.postMessage(
            { type: "editor:transformUpdate", selector: dragState.selector, x: newX, y: newY },
            "*"
          );
        } else if (dragState.mode === "scale") {
          const curDist = Math.hypot(e.clientX - dragState.cx, e.clientY - dragState.cy);
          const ratio = dragState.startDist > 5 ? curDist / dragState.startDist : 1;
          const newScale = Math.max(0.15, Math.min(4, Number((dragState.origScale * ratio).toFixed(2))));

          window.SCENE_LAYOUT[dragState.selector] = { ...prev, scale: newScale };
          applySceneLayout(window.SCENE_LAYOUT);
          updateGizmo();

          window.parent.postMessage(
            { type: "editor:transformUpdate", selector: dragState.selector, scale: newScale },
            "*"
          );
        } else if (dragState.mode === "rotate") {
          const angleRad = Math.atan2(e.clientY - dragState.cy, e.clientX - dragState.cx);
          const angleDeg = Math.round((angleRad * 180) / Math.PI + 90);
          const normalized = ((angleDeg + 180) % 360 + 360) % 360 - 180;

          window.SCENE_LAYOUT[dragState.selector] = { ...prev, rotate: normalized };
          applySceneLayout(window.SCENE_LAYOUT);
          updateGizmo();

          window.parent.postMessage(
            { type: "editor:transformUpdate", selector: dragState.selector, rotate: normalized },
            "*"
          );
        }
        return;
      }

      const hit = findBestTarget(e.target);
      if (lastHover && (!hit || hit.el !== lastHover)) {
        lastHover.classList.remove("editor-hover-el");
        lastHover = null;
      }
      if (hit && hit.el !== lastHover && !hit.el.classList.contains("editor-selected-el")) {
        hit.el.classList.add("editor-hover-el");
        lastHover = hit.el;
      }
    },
    true
  );

  document.addEventListener(
    "pointerdown",
    (e) => {
      if (e.button !== 0) return;

      const handleEl = e.target.closest && e.target.closest(".gizmo-handle");
      if (handleEl && selectedSelector) {
        e.preventDefault();
        e.stopPropagation();
        const el = document.querySelector(selectedSelector);
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const cfg = (window.SCENE_LAYOUT && window.SCENE_LAYOUT[selectedSelector]) || {};
        const handleType = handleEl.dataset.handle;

        if (handleType === "rot") {
          dragState = { mode: "rotate", el, selector: selectedSelector, cx, cy };
        } else {
          dragState = {
            mode: "scale",
            el,
            selector: selectedSelector,
            cx,
            cy,
            startDist: Math.hypot(e.clientX - cx, e.clientY - cy),
            origScale: cfg.scale !== undefined ? Number(cfg.scale) : 1,
          };
        }
        return;
      }

      e.preventDefault();
      e.stopPropagation();

      const hit = findBestTarget(e.target);
      if (!hit) return;

      highlightSelected(hit.selector);
      window.parent.postMessage({ type: "editor:selected", selector: hit.selector }, "*");

      const cfg = (window.SCENE_LAYOUT && window.SCENE_LAYOUT[hit.selector]) || {};
      dragState = {
        mode: "move",
        el: hit.el,
        selector: hit.selector,
        startX: e.clientX,
        startY: e.clientY,
        origX: Number(cfg.x || 0),
        origY: Number(cfg.y || 0),
      };
    },
    true
  );

  document.addEventListener(
    "pointerup",
    () => {
      if (dragState) {
        window.parent.postMessage({ type: "editor:dragEnd", selector: dragState.selector }, "*");
        dragState = null;
      }
    },
    true
  );

  window.addEventListener("resize", updateGizmo);
  window.addEventListener("scroll", updateGizmo, true);

  function setScene(sceneId) {
    hideAllOverlays();

    if (sceneId === "title") {
      document.getElementById("title-screen")?.classList.remove("hidden");
    } else if (sceneId === "deck") {
      if (typeof window.renderDeckSelector === "function") window.renderDeckSelector();
      if (typeof window.renderCardBackSelector === "function") window.renderCardBackSelector();
      document.getElementById("deck-select-screen")?.classList.remove("hidden");
    } else if (sceneId === "map") {
      ensureEditorRun();
      hideAllOverlays();
      if (typeof window.openMapScreen === "function") window.openMapScreen(true);
      document.getElementById("map-screen")?.classList.remove("hidden");
    } else if (sceneId === "duel") {
      ensureEditorRun();
      hideAllOverlays();
    } else if (sceneId === "rest") {
      ensureEditorRun();
      hideAllOverlays();
      if (typeof window.openRestScreen === "function") {
        window.openRestScreen();
      } else {
        document.getElementById("rest-screen")?.classList.remove("hidden");
      }
    } else if (sceneId === "shop") {
      ensureEditorRun();
      hideAllOverlays();
      if (typeof window.openShopModal === "function") window.openShopModal();
      document.getElementById("shop-modal")?.classList.remove("hidden");
    } else if (sceneId === "event") {
      ensureEditorRun();
      hideAllOverlays();
      if (typeof window.openEventModal === "function") window.openEventModal();
      document.getElementById("event-modal")?.classList.remove("hidden");
    } else if (sceneId === "booster") {
      ensureEditorRun();
      hideAllOverlays();
      if (typeof window.openBoosterModal === "function") window.openBoosterModal(false);
      document.getElementById("booster-modal")?.classList.remove("hidden");
    } else if (sceneId === "collection") {
      if (typeof window.openCollectionScreen === "function") window.openCollectionScreen("cards");
      document.getElementById("collection-screen")?.classList.remove("hidden");
    } else if (sceneId === "vslobby") {
      const vsBtn = document.getElementById("play-vs-btn");
      if (vsBtn) {
        allowProgrammaticClick = true;
        vsBtn.click();
        allowProgrammaticClick = false;
      }
      hideAllOverlays();
      document.getElementById("vs-lobby-modal")?.classList.remove("hidden");
    } else if (sceneId === "gameover") {
      ensureEditorRun();
      hideAllOverlays();
      document.getElementById("game-over-modal")?.classList.remove("hidden");
    } else if (sceneId === "inventory") {
      ensureEditorRun();
      hideAllOverlays();
      if (typeof window.renderInventoryModal === "function") window.renderInventoryModal();
      document.getElementById("inventory-modal")?.classList.remove("hidden");
    }

    applySceneLayout(window.SCENE_LAYOUT);
  }

  function setPrefabHighlight(prefab) {
    document.querySelectorAll(".editor-prefab-dim").forEach((el) => el.classList.remove("editor-prefab-dim"));
    activePrefab = prefab || null;
    if (activePrefab && activePrefab.rootSelector) {
      const root = document.querySelector(activePrefab.rootSelector);
      if (root) root.classList.add("editor-prefab-dim");
    }
  }

  window.addEventListener("message", (event) => {
    const msg = event.data;
    if (!msg || typeof msg !== "object") return;

    if (msg.type === "editor:init") {
      knownSelectors = Array.isArray(msg.knownSelectors) ? msg.knownSelectors : [];
      if (msg.sceneId) setScene(msg.sceneId);
      if (msg.layout) {
        window.SCENE_LAYOUT = msg.layout;
        applySceneLayout(msg.layout);
      }
      updateGizmo();
    } else if (msg.type === "editor:setScene") {
      setPrefabHighlight(null);
      setScene(msg.sceneId);
      if (Array.isArray(msg.knownSelectors)) knownSelectors = msg.knownSelectors;
      highlightSelected(null);
    } else if (msg.type === "editor:setPrefab") {
      setPrefabHighlight(msg.prefab);
      highlightSelected(null);
    } else if (msg.type === "editor:applyLayout") {
      window.SCENE_LAYOUT = msg.layout || {};
      applySceneLayout(window.SCENE_LAYOUT);
      if (selectedSelector) {
        const el = document.querySelector(selectedSelector);
        if (el) reportElementInfo(el, selectedSelector);
      }
      updateGizmo();
    } else if (msg.type === "editor:select") {
      highlightSelected(msg.selector);
    } else if (msg.type === "editor:setFreePick") {
      freePick = Boolean(msg.freePick);
    }
  });

  window.parent.postMessage({ type: "editor:ready" }, "*");
})();
