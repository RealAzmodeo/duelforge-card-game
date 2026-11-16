(function () {
  "use strict";

  const SERVER_ORIGIN = "http://127.0.0.1:8125";

  const PREFABS = {
    ".rest-fire-wrap": {
      name: "Fogata",
      children: [
        { name: "Imagen Fogata", selector: ".rest-fire-wrap img" },
        { name: "Resplandor Fogata", selector: ".rest-fire-glow" },
      ],
    },
    "#rest-bag-btn": {
      name: "Mochila Inventario",
      children: [
        { name: "Imagen Mochila", selector: "#rest-bag-btn img" },
        { name: "Etiqueta Mochila", selector: "#rest-bag-btn .rest-prop-label" },
      ],
    },
    "#enemy-hero-panel": {
      name: "Panel Heroe Rival",
      children: [
        { name: "Avatar Rival", selector: "#enemy-avatar-img" },
        { name: "Marco Rival", selector: "#enemy-frame-img" },
        { name: "Nombre Rival", selector: "#enemy-name" },
        { name: "HP Rival", selector: "#enemy-hero-panel .hp-pill" },
        { name: "Escudo Rival", selector: "#enemy-hero-panel .shd-pill" },
        { name: "Intencion Rival", selector: "#enemy-intention" },
      ],
    },
    "#player-hero-panel": {
      name: "Panel Heroe Jugador",
      children: [
        { name: "Avatar Jugador", selector: "#player-avatar-btn img:first-child" },
        { name: "Marco Jugador", selector: "#player-frame-img" },
        { name: "Nombre Jugador", selector: "#player-hero-panel .hero-name" },
        { name: "Boton Gestos", selector: "#emote-trigger-btn" },
        { name: "HP Jugador", selector: "#player-hero-panel .hp-pill" },
        { name: "Escudo Jugador", selector: "#player-hero-panel .shd-pill" },
      ],
    },
    "#energy-bar-box": {
      name: "Barra de Energia",
      children: [
        { name: "Etiqueta Energia", selector: "#energy-bar-box .energy-label" },
        { name: "Orbes Energia", selector: "#energy-orbs" },
        { name: "Numero Energia", selector: "#player-energy" },
      ],
    },
    ".hand-card": {
      name: "Carta en Mano (Todas)",
      children: [
        { name: "Badges Laterales", selector: ".hand-card .card-badges-rail" },
        { name: "Cabecera Carta", selector: ".hand-card .card-banner" },
        { name: "Titulo Carta", selector: ".hand-card .card-title" },
        { name: "Coste Energia", selector: ".hand-card .energy-cost" },
        { name: "Arte Carta", selector: ".hand-card .card-art-wrap" },
        { name: "Etiqueta Inferior", selector: ".hand-card .card-footer-badge" },
      ],
    },
    ".market-card": {
      name: "Carta Mercado (Todas)",
      children: [
        { name: "Cabecera Mercado", selector: ".market-card .card-banner" },
        { name: "Titulo Mercado", selector: ".market-card .card-title" },
        { name: "Coste Mercado", selector: ".market-card .energy-cost" },
        { name: "Arte Mercado", selector: ".market-card .card-art-wrap" },
        { name: "Precio Oro", selector: ".market-card .market-price-badge" },
      ],
    },
  };

  const SCENES = [
    {
      id: "title",
      label: "Titulo",
      elements: [
        { name: "Fondo de Titulo", selector: "#title-screen" },
        { name: "Logo del Juego", selector: ".title-logo" },
        { name: "Subtitulo", selector: ".title-tagline" },
        { name: "Boton JUGAR", selector: "#play-btn" },
      ],
    },
    {
      id: "duel",
      label: "Arena de Duelo",
      elements: [
        { name: "Fondo de Arena", selector: ".main-stage" },
        { name: "Panel Heroe Rival", selector: "#enemy-hero-panel" },
        { name: "Mazo Rival (Dorso)", selector: "#enemy-deck-img" },
        { name: "Indicador de Combate", selector: ".stage-compact-box" },
        { name: "Slots Rival", selector: "#enemy-slots" },
        { name: "Slots Jugador", selector: "#player-slots" },
        { name: "Panel Heroe Jugador", selector: "#player-hero-panel" },
        { name: "Barra de Energia", selector: "#energy-bar-box" },
        { name: "Mazo Jugador", selector: "#player-deck-pile" },
        { name: "Mano del Jugador", selector: "#player-hand" },
        { name: "Carta en Mano (Prefab)", selector: ".hand-card" },
        { name: "Descarte Jugador", selector: "#player-discard-pile" },
        { name: "Boton Fin de Turno", selector: "#end-turn-btn" },
        { name: "Barra Lateral Mercado", selector: ".market-sidebar" },
        { name: "Carta Mercado (Prefab)", selector: ".market-card" },
        { name: "Icono Oro", selector: "#player-gold img" },
      ],
    },
    {
      id: "rest",
      label: "Descanso",
      elements: [
        { name: "Fondo Descanso", selector: "#rest-screen" },
        { name: "Cabecera Descanso", selector: ".rest-hud-top" },
        { name: "Botones Eleccion", selector: "#rest-fire-choices" },
        { name: "Mochila Inventario", selector: "#rest-bag-btn" },
        { name: "Heroe Encapuchado", selector: ".rest-hero-wrap" },
        { name: "Fogata", selector: ".rest-fire-wrap" },
        { name: "Boton Continuar", selector: "#rest-continue-btn" },
      ],
    },
    {
      id: "booster",
      label: "Booster",
      elements: [
        { name: "Tarjeta Modal", selector: ".booster-modal-card" },
        { name: "Banner Victoria", selector: "#booster-victory-banner" },
        { name: "Sobre Booster", selector: "#booster-pack-img" },
        { name: "Titulo Booster", selector: "#booster-title" },
      ],
    },
    {
      id: "gameover",
      label: "Fin de Partida",
      elements: [
        { name: "Tarjeta Modal", selector: ".gameover-card" },
        { name: "Banner Fin", selector: "#gameover-banner-img" },
        { name: "Titulo Modal", selector: "#modal-title" },
        { name: "Boton Reiniciar", selector: "#restart-btn" },
      ],
    },
    {
      id: "inventory",
      label: "Inventario",
      elements: [
        { name: "Tarjeta Inventario", selector: ".inventory-modal-card" },
        { name: "Boton Cerrar", selector: "#inventory-close-btn" },
      ],
    },
  ];

  // State
  let currentSceneId = "title";
  let activePrefabSelector = null;
  let layout = (window.SCENE_LAYOUT && typeof window.SCENE_LAYOUT === "object") ? { ...window.SCENE_LAYOUT } : {};
  let selectedSelector = null;
  let allAssets = [];
  let activeAssetCategory = "all";
  let dirty = false;
  let autoSaveTimer = null;
  let currentZoom = "fit";
  let previewWidth = 1920;
  let previewHeight = 1080;

  // DOM refs
  const sceneTabsEl = document.getElementById("scene-tabs");
  const elementsListEl = document.getElementById("elements-list");
  const prefabBarEl = document.getElementById("prefab-bar");
  const prefabTitleEl = document.getElementById("prefab-title");
  const prefabExitBtn = document.getElementById("prefab-exit-btn");

  const stageLabelEl = document.getElementById("stage-label");
  const gameFrame = document.getElementById("game-frame");
  const iframeViewport = document.getElementById("iframe-viewport");
  const iframeScaler = document.getElementById("iframe-scaler");
  const resSelect = document.getElementById("res-select");
  const saveStatusEl = document.getElementById("save-status");
  const saveBtn = document.getElementById("save-btn");
  const autosaveToggle = document.getElementById("autosave-toggle");
  const resetSceneBtn = document.getElementById("reset-scene-btn");
  const freepickToggle = document.getElementById("freepick-toggle");

  const addImgBtn = document.getElementById("add-img-btn");
  const addBtnBtn = document.getElementById("add-btn-btn");
  const addTxtBtn = document.getElementById("add-txt-btn");

  const inspectorEmpty = document.getElementById("inspector-empty");
  const inspectorBody = document.getElementById("inspector-body");
  const resetElBtn = document.getElementById("reset-el-btn");
  const selNameEl = document.getElementById("sel-name");
  const selSelectorEl = document.getElementById("sel-selector");

  const customTextGroup = document.getElementById("custom-text-group");
  const customDeleteOnly = document.getElementById("custom-delete-only");
  const inpCustomText = document.getElementById("inp-custom-text");
  const deleteCustomBtn = document.getElementById("delete-custom-btn");
  const deleteCustomImgBtn = document.getElementById("delete-custom-img-btn");

  const inpX = document.getElementById("inp-x");
  const rngX = document.getElementById("rng-x");
  const inpY = document.getElementById("inp-y");
  const rngY = document.getElementById("rng-y");
  const inpScale = document.getElementById("inp-scale");
  const rngScale = document.getElementById("rng-scale");
  const inpRotate = document.getElementById("inp-rotate");
  const rngRotate = document.getElementById("rng-rotate");
  const inpZ = document.getElementById("inp-z");
  const zBackBtn = document.getElementById("z-back-btn");
  const zFrontBtn = document.getElementById("z-front-btn");

  const assetSection = document.getElementById("asset-section");
  const currentAssetThumb = document.getElementById("current-asset-thumb");
  const currentAssetPath = document.getElementById("current-asset-path");
  const clearAssetBtn = document.getElementById("clear-asset-btn");
  const assetSearch = document.getElementById("asset-search");
  const assetCats = document.getElementById("asset-cats");
  const assetGrid = document.getElementById("asset-grid");

  function apiBaseUrl() {
    if (window.location.protocol.startsWith("http") && window.location.port === "8125") {
      return "";
    }
    return SERVER_ORIGIN;
  }

  async function apiFetch(path, options) {
    const base = apiBaseUrl();
    if (base === "") {
      try {
        const res = await fetch(path, options);
        if (res.ok) return res;
      } catch (_) {}
    }
    return fetch(`${SERVER_ORIGIN}${path}`, options);
  }

  function getCustomElements() {
    if (!Array.isArray(layout._customElements)) return [];
    return layout._customElements;
  }

  function findCustomBySelector(selector) {
    if (!selector || !selector.startsWith("#")) return null;
    const id = selector.slice(1);
    return getCustomElements().find((item) => item.id === id) || null;
  }

  function getSceneObj(id) {
    return SCENES.find((s) => s.id === id) || SCENES[0];
  }

  function getElementLabel(selector) {
    const custom = findCustomBySelector(selector);
    if (custom) return custom.name || custom.id;
    for (const p of Object.values(PREFABS)) {
      const found = p.children.find((c) => c.selector === selector);
      if (found) return found.name;
    }
    for (const s of SCENES) {
      const found = s.elements.find((e) => e.selector === selector);
      if (found) return found.name;
    }
    return selector;
  }

  function setStatus(state, text) {
    saveStatusEl.className = `save-status ${state}`;
    saveStatusEl.textContent = text;
  }

  function markDirty() {
    dirty = true;
    setStatus("dirty", "Cambios sin guardar");
    if (autosaveToggle.checked) {
      clearTimeout(autoSaveTimer);
      autoSaveTimer = setTimeout(() => {
        saveLayoutToServer(true);
      }, 350);
    }
  }

  function cleanEntryIfDefault(selector) {
    const cfg = layout[selector];
    if (!cfg || selector.startsWith("_")) return;
    const x = Number(cfg.x || 0);
    const y = Number(cfg.y || 0);
    const scale = cfg.scale !== undefined ? Number(cfg.scale) : 1;
    const rotate = Number(cfg.rotate || 0);
    const asset = cfg.asset || "";
    const hasZ = cfg.zIndex !== undefined && cfg.zIndex !== null && cfg.zIndex !== "";

    if (x === 0 && y === 0 && scale === 1 && rotate === 0 && !asset && !hasZ) {
      delete layout[selector];
    }
  }

  function pushLayoutToIframe() {
    if (!gameFrame.contentWindow) return;
    gameFrame.contentWindow.postMessage(
      {
        type: "editor:applyLayout",
        layout,
      },
      "*"
    );
  }

  function renderSceneTabs() {
    sceneTabsEl.innerHTML = "";
    SCENES.forEach((sc) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = `scene-tab${sc.id === currentSceneId ? " active" : ""}`;
      btn.textContent = sc.label;
      btn.addEventListener("click", () => switchScene(sc.id));
      sceneTabsEl.appendChild(btn);
    });
  }

  function enterPrefab(rootSelector) {
    const prefab = PREFABS[rootSelector];
    if (!prefab) return;
    activePrefabSelector = rootSelector;
    selectedSelector = null;
    prefabBarEl.classList.remove("hidden");
    prefabTitleEl.textContent = `Prefab: ${prefab.name}`;
    stageLabelEl.textContent = `Escena: ${getSceneObj(currentSceneId).label} > ${prefab.name}`;
    renderElementsList();
    renderInspector();

    if (gameFrame.contentWindow) {
      gameFrame.contentWindow.postMessage(
        {
          type: "editor:setPrefab",
          prefab: {
            rootSelector,
            childSelectors: prefab.children.map((c) => c.selector),
          },
        },
        "*"
      );
    }
  }

  function exitPrefab() {
    activePrefabSelector = null;
    selectedSelector = null;
    prefabBarEl.classList.add("hidden");
    stageLabelEl.textContent = `Escena: ${getSceneObj(currentSceneId).label}`;
    renderElementsList();
    renderInspector();

    if (gameFrame.contentWindow) {
      gameFrame.contentWindow.postMessage({ type: "editor:setPrefab", prefab: null }, "*");
    }
  }

  prefabExitBtn.addEventListener("click", exitPrefab);

  function renderElementsList() {
    elementsListEl.innerHTML = "";

    let items = [];
    if (activePrefabSelector && PREFABS[activePrefabSelector]) {
      items = PREFABS[activePrefabSelector].children.map((c) => ({
        name: c.name,
        selector: c.selector,
        isPrefab: false,
      }));
    } else {
      const sc = getSceneObj(currentSceneId);
      const customs = getCustomElements()
        .filter((c) => c.sceneId === currentSceneId)
        .map((c) => ({ name: c.name || c.id, selector: `#${c.id}`, isCustom: true }));

      items = [
        ...customs,
        ...sc.elements.map((e) => ({
          ...e,
          isPrefab: Boolean(PREFABS[e.selector]),
        })),
      ];
    }

    items.forEach((item) => {
      const row = document.createElement("div");
      row.className = `el-item${item.selector === selectedSelector ? " active" : ""}`;

      const labelSpan = document.createElement("span");
      labelSpan.textContent = item.name;
      row.appendChild(labelSpan);

      const actions = document.createElement("div");
      actions.className = "el-actions";

      if (item.isCustom) {
        const badge = document.createElement("span");
        badge.className = "el-badge";
        badge.textContent = "Nuevo";
        actions.appendChild(badge);
      } else if (layout[item.selector]) {
        const badge = document.createElement("span");
        badge.className = "el-badge";
        badge.textContent = "Editado";
        actions.appendChild(badge);
      }

      if (item.isPrefab) {
        const openBtn = document.createElement("button");
        openBtn.type = "button";
        openBtn.className = "btn-mini";
        openBtn.textContent = "Abrir";
        openBtn.title = "Abrir piezas internas (doble clic)";
        openBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          enterPrefab(item.selector);
        });
        actions.appendChild(openBtn);
      }

      row.appendChild(actions);

      row.addEventListener("click", () => {
        selectElement(item.selector);
        if (gameFrame.contentWindow) {
          gameFrame.contentWindow.postMessage(
            { type: "editor:select", selector: item.selector },
            "*"
          );
        }
      });

      if (item.isPrefab) {
        row.addEventListener("dblclick", () => enterPrefab(item.selector));
      }

      elementsListEl.appendChild(row);
    });
  }

  function switchScene(sceneId) {
    currentSceneId = sceneId;
    activePrefabSelector = null;
    prefabBarEl.classList.add("hidden");
    selectedSelector = null;
    const sc = getSceneObj(sceneId);
    stageLabelEl.textContent = `Escena: ${sc.label}`;
    renderSceneTabs();
    renderElementsList();
    renderInspector();

    if (gameFrame.contentWindow) {
      gameFrame.contentWindow.postMessage(
        {
          type: "editor:setScene",
          sceneId,
          knownSelectors: sc.elements.map((e) => e.selector),
        },
        "*"
      );
    }
  }

  function selectElement(selector) {
    selectedSelector = selector;
    renderElementsList();
    renderInspector();
  }

  function renderInspector(computedZ) {
    if (!selectedSelector) {
      inspectorEmpty.classList.remove("hidden");
      inspectorBody.classList.add("hidden");
      resetElBtn.disabled = true;
      return;
    }

    inspectorEmpty.classList.add("hidden");
    inspectorBody.classList.remove("hidden");
    resetElBtn.disabled = false;

    selNameEl.textContent = getElementLabel(selectedSelector);
    selSelectorEl.textContent = selectedSelector;

    const custom = findCustomBySelector(selectedSelector);
    if (custom) {
      if (custom.type === "img") {
        customTextGroup.classList.add("hidden");
        customDeleteOnly.classList.remove("hidden");
      } else {
        customTextGroup.classList.remove("hidden");
        customDeleteOnly.classList.add("hidden");
        inpCustomText.value = custom.text || "";
      }
    } else {
      customTextGroup.classList.add("hidden");
      customDeleteOnly.classList.add("hidden");
    }

    const cfg = layout[selectedSelector] || {};
    const x = Number(cfg.x || 0);
    const y = Number(cfg.y || 0);
    const scalePct = Math.round((cfg.scale !== undefined ? Number(cfg.scale) : 1) * 100);
    const rotate = Number(cfg.rotate || 0);
    const zVal = cfg.zIndex !== undefined ? Number(cfg.zIndex) : (computedZ !== undefined ? computedZ : 0);

    inpX.value = x;
    rngX.value = Math.max(-1000, Math.min(1000, x));
    inpY.value = y;
    rngY.value = Math.max(-600, Math.min(600, y));
    inpScale.value = scalePct;
    rngScale.value = Math.max(20, Math.min(250, scalePct));
    inpRotate.value = rotate;
    rngRotate.value = Math.max(-180, Math.min(180, rotate));
    inpZ.value = zVal;
  }

  function updateSelectedProp(patch) {
    if (!selectedSelector) return;
    const prev = layout[selectedSelector] || {};
    layout[selectedSelector] = { ...prev, ...patch };
    cleanEntryIfDefault(selectedSelector);
    pushLayoutToIframe();
    renderElementsList();
    markDirty();
  }

  function addCustomElement(type) {
    if (!Array.isArray(layout._customElements)) {
      layout._customElements = [];
    }
    const uid = `custom_${type}_${Date.now().toString(36)}`;
    const count = layout._customElements.length + 1;
    const labelMap = { img: `Imagen ${count}`, button: `Boton ${count}`, text: `Texto ${count}` };
    const item = {
      id: uid,
      sceneId: currentSceneId,
      type,
      name: labelMap[type] || `Elemento ${count}`,
      text: type === "button" ? "NUEVO BOTON" : type === "text" ? "NUEVO TEXTO" : "",
      asset: type === "img" ? "assets/ui/icon_gem.png" : "",
    };
    layout._customElements.push(item);

    const sel = `#${uid}`;
    pushLayoutToIframe();
    selectElement(sel);
    setTimeout(() => {
      if (gameFrame.contentWindow) {
        gameFrame.contentWindow.postMessage({ type: "editor:select", selector: sel }, "*");
      }
    }, 50);
    markDirty();
  }

  function deleteSelectedCustomElement() {
    const custom = findCustomBySelector(selectedSelector);
    if (!custom) return;
    layout._customElements = getCustomElements().filter((c) => c.id !== custom.id);
    if (layout._customElements.length === 0) delete layout._customElements;
    delete layout[selectedSelector];
    selectedSelector = null;
    pushLayoutToIframe();
    renderElementsList();
    renderInspector();
    markDirty();
  }

  addImgBtn.addEventListener("click", () => addCustomElement("img"));
  addBtnBtn.addEventListener("click", () => addCustomElement("button"));
  addTxtBtn.addEventListener("click", () => addCustomElement("text"));

  inpCustomText.addEventListener("input", () => {
    const custom = findCustomBySelector(selectedSelector);
    if (!custom) return;
    custom.text = inpCustomText.value;
    pushLayoutToIframe();
    markDirty();
  });

  deleteCustomBtn.addEventListener("click", deleteSelectedCustomElement);
  deleteCustomImgBtn.addEventListener("click", deleteSelectedCustomElement);

  function bindTransformInputs() {
    const syncX = (val) => {
      const n = Math.round(Number(val) || 0);
      inpX.value = n;
      rngX.value = Math.max(-1000, Math.min(1000, n));
      updateSelectedProp({ x: n });
    };
    const syncY = (val) => {
      const n = Math.round(Number(val) || 0);
      inpY.value = n;
      rngY.value = Math.max(-600, Math.min(600, n));
      updateSelectedProp({ y: n });
    };
    const syncScale = (val) => {
      const pct = Math.max(10, Math.min(400, Math.round(Number(val) || 100)));
      inpScale.value = pct;
      rngScale.value = Math.max(20, Math.min(250, pct));
      updateSelectedProp({ scale: Number((pct / 100).toFixed(2)) });
    };
    const syncRotate = (val) => {
      const deg = Math.max(-180, Math.min(180, Math.round(Number(val) || 0)));
      inpRotate.value = deg;
      rngRotate.value = deg;
      updateSelectedProp({ rotate: deg });
    };
    const syncZ = (val) => {
      const z = Math.round(Number(val) || 0);
      inpZ.value = z;
      updateSelectedProp({ zIndex: z });
    };

    inpX.addEventListener("input", () => syncX(inpX.value));
    rngX.addEventListener("input", () => syncX(rngX.value));
    inpY.addEventListener("input", () => syncY(inpY.value));
    rngY.addEventListener("input", () => syncY(rngY.value));
    inpScale.addEventListener("input", () => syncScale(inpScale.value));
    rngScale.addEventListener("input", () => syncScale(rngScale.value));
    inpRotate.addEventListener("input", () => syncRotate(inpRotate.value));
    rngRotate.addEventListener("input", () => syncRotate(rngRotate.value));
    inpZ.addEventListener("input", () => syncZ(inpZ.value));
    zBackBtn.addEventListener("click", () => syncZ((Number(inpZ.value) || 0) - 1));
    zFrontBtn.addEventListener("click", () => syncZ((Number(inpZ.value) || 0) + 1));
  }

  function renderAssetCategories() {
    const cats = ["all", ...new Set(allAssets.map((a) => a.category))];
    assetCats.innerHTML = "";
    cats.forEach((cat) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = `asset-cat-btn${cat === activeAssetCategory ? " active" : ""}`;
      btn.textContent = cat === "all" ? "Todos" : cat;
      btn.addEventListener("click", () => {
        activeAssetCategory = cat;
        renderAssetCategories();
        renderAssetGrid();
      });
      assetCats.appendChild(btn);
    });
  }

  function renderAssetGrid() {
    const query = assetSearch.value.trim().toLowerCase();
    const currentAsset = (selectedSelector && layout[selectedSelector] && layout[selectedSelector].asset) || "";
    assetGrid.innerHTML = "";

    const filtered = allAssets.filter((a) => {
      if (activeAssetCategory !== "all" && a.category !== activeAssetCategory) return false;
      if (query && !a.path.toLowerCase().includes(query)) return false;
      return true;
    });

    filtered.forEach((a) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = `asset-thumb-btn${currentAsset === a.path ? " active" : ""}`;
      btn.title = a.path;

      const img = document.createElement("img");
      img.src = a.path;
      img.loading = "lazy";
      img.alt = a.name;

      const label = document.createElement("span");
      label.textContent = a.name;

      btn.appendChild(img);
      btn.appendChild(label);

      btn.addEventListener("click", () => {
        if (!selectedSelector) return;
        const custom = findCustomBySelector(selectedSelector);
        if (custom && custom.type === "img") {
          custom.asset = a.path;
        }
        currentAssetThumb.src = a.path;
        currentAssetPath.textContent = a.path;
        updateSelectedProp({ asset: a.path });
        renderAssetGrid();
      });

      assetGrid.appendChild(btn);
    });
  }

  assetSearch.addEventListener("input", renderAssetGrid);

  clearAssetBtn.addEventListener("click", () => {
    if (!selectedSelector) return;
    if (layout[selectedSelector]) {
      delete layout[selectedSelector].asset;
      cleanEntryIfDefault(selectedSelector);
    }
    pushLayoutToIframe();
    renderElementsList();
    markDirty();
  });

  resetElBtn.addEventListener("click", () => {
    if (!selectedSelector) return;
    delete layout[selectedSelector];
    pushLayoutToIframe();
    renderElementsList();
    renderInspector();
    markDirty();
  });

  resetSceneBtn.addEventListener("click", () => {
    const sc = getSceneObj(currentSceneId);
    sc.elements.forEach((e) => {
      delete layout[e.selector];
      if (PREFABS[e.selector]) {
        PREFABS[e.selector].children.forEach((c) => delete layout[c.selector]);
      }
    });
    if (Array.isArray(layout._customElements)) {
      layout._customElements = layout._customElements.filter((c) => c.sceneId !== currentSceneId);
      if (layout._customElements.length === 0) delete layout._customElements;
    }
    selectedSelector = null;
    pushLayoutToIframe();
    renderElementsList();
    renderInspector();
    markDirty();
  });

  freepickToggle.addEventListener("change", () => {
    if (gameFrame.contentWindow) {
      gameFrame.contentWindow.postMessage(
        { type: "editor:setFreePick", freePick: freepickToggle.checked },
        "*"
      );
    }
  });

  function applyZoom() {
    iframeScaler.style.width = `${previewWidth}px`;
    iframeScaler.style.height = `${previewHeight}px`;
    if (currentZoom === "fit") {
      const vw = iframeViewport.clientWidth - 28;
      const vh = iframeViewport.clientHeight - 28;
      const ratio = Math.min(vw / previewWidth, vh / previewHeight, 1);
      iframeScaler.style.transform = `scale(${ratio.toFixed(4)})`;
    } else {
      iframeScaler.style.transform = `scale(${currentZoom})`;
    }
  }

  if (resSelect) {
    resSelect.addEventListener("change", () => {
      const [w, h] = resSelect.value.split("x").map(Number);
      if (w && h) {
        previewWidth = w;
        previewHeight = h;
        applyZoom();
      }
    });
  }

  document.querySelectorAll(".zoom-controls .btn-mini").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".zoom-controls .btn-mini").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      const z = btn.dataset.zoom;
      currentZoom = z === "fit" ? "fit" : Number(z);
      applyZoom();
    });
  });
  window.addEventListener("resize", applyZoom);

  async function loadInitialData() {
    try {
      const [layoutRes, assetsRes] = await Promise.all([
        apiFetch("/api/layout"),
        apiFetch("/api/assets"),
      ]);
      if (layoutRes.ok) {
        const data = await layoutRes.json();
        layout = data.layout || {};
      }
      if (assetsRes.ok) {
        const data = await assetsRes.json();
        allAssets = data.assets || [];
      }
      setStatus("saved", "Conectado (listo para guardar)");
    } catch (err) {
      setStatus("dirty", "Modo offline (guardado manual)");
    }
    renderSceneTabs();
    renderElementsList();
    renderAssetCategories();
    renderAssetGrid();
  }

  function buildSceneLayoutFileContent() {
    const pretty = JSON.stringify(layout, null, 2);
    return (
      "// Configuracion de escena guardada por el Visor de Escenas (scene-editor.html).\n" +
      "// No edites manualmente a menos que sepas lo que haces.\n" +
      `window.SCENE_LAYOUT = ${pretty};\n`
    );
  }

  async function saveViaFilePickerOrDownload() {
    const content = buildSceneLayoutFileContent();
    if (typeof window.showSaveFilePicker === "function") {
      const handle = await window.showSaveFilePicker({
        suggestedName: "scene-layout.js",
        types: [{ description: "JavaScript", accept: { "application/javascript": [".js"] } }],
      });
      const writable = await handle.createWritable();
      await writable.write(content);
      await writable.close();
      dirty = false;
      setStatus("saved", "Guardado en archivo elegido");
      return;
    }
    const blob = new Blob([content], { type: "application/javascript" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "scene-layout.js";
    a.click();
    URL.revokeObjectURL(url);
    dirty = false;
    setStatus("saved", "Descargado scene-layout.js");
  }

  async function saveLayoutToServer(isAuto) {
    setStatus("dirty", "Guardando...");
    try {
      const res = await apiFetch("/api/layout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(layout),
      });
      if (!res.ok) throw new Error("HTTP " + res.status);
      dirty = false;
      setStatus("saved", "Guardado en scene-layout.js");
    } catch (err) {
      if (isAuto) {
        setStatus("error", "Servidor apagado (pulsa Guardar)");
        return;
      }
      try {
        await saveViaFilePickerOrDownload();
      } catch (pickerErr) {
        setStatus("error", "Guardado cancelado");
      }
    }
  }

  saveBtn.addEventListener("click", () => saveLayoutToServer(false));

  window.addEventListener("message", (event) => {
    const msg = event.data;
    if (!msg || typeof msg !== "object") return;

    if (msg.type === "editor:ready") {
      const sc = getSceneObj(currentSceneId);
      gameFrame.contentWindow.postMessage(
        {
          type: "editor:init",
          sceneId: currentSceneId,
          knownSelectors: sc.elements.map((e) => e.selector),
          layout,
        },
        "*"
      );
      applyZoom();
    } else if (msg.type === "editor:selected") {
      selectElement(msg.selector);
    } else if (msg.type === "editor:dblclick") {
      if (PREFABS[msg.selector]) {
        enterPrefab(msg.selector);
      }
    } else if (msg.type === "editor:transformUpdate") {
      const prev = layout[msg.selector] || {};
      const next = { ...prev };
      if (msg.x !== undefined) next.x = msg.x;
      if (msg.y !== undefined) next.y = msg.y;
      if (msg.scale !== undefined) next.scale = msg.scale;
      if (msg.rotate !== undefined) next.rotate = msg.rotate;
      layout[msg.selector] = next;

      if (selectedSelector === msg.selector) {
        if (msg.x !== undefined) {
          inpX.value = msg.x;
          rngX.value = Math.max(-1000, Math.min(1000, msg.x));
        }
        if (msg.y !== undefined) {
          inpY.value = msg.y;
          rngY.value = Math.max(-600, Math.min(600, msg.y));
        }
        if (msg.scale !== undefined) {
          const pct = Math.round(msg.scale * 100);
          inpScale.value = pct;
          rngScale.value = Math.max(20, Math.min(250, pct));
        }
        if (msg.rotate !== undefined) {
          inpRotate.value = msg.rotate;
          rngRotate.value = Math.max(-180, Math.min(180, msg.rotate));
        }
      }
    } else if (msg.type === "editor:dragEnd") {
      cleanEntryIfDefault(msg.selector);
      renderElementsList();
      markDirty();
    } else if (msg.type === "editor:elementInfo") {
      if (msg.selector !== selectedSelector) return;
      renderInspector(msg.zIndex);
      if (msg.supportsAsset) {
        assetSection.classList.remove("hidden");
        const shownAsset = msg.currentAsset || "";
        currentAssetThumb.src = shownAsset || "";
        currentAssetPath.textContent = shownAsset || "(Sin imagen)";
        renderAssetGrid();
      } else {
        assetSection.classList.add("hidden");
      }
    }
  });

  bindTransformInputs();
  loadInitialData();
})();
