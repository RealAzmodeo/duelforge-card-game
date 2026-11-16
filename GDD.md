# Duelforge - Game Design Document (GDD)

Documento de referencia tecnica y de diseno para colaboradores y agentes de IA. Describe las reglas actuales, el balance validado por Monte Carlo y la plantilla exacta para crear nuevas cartas compatibles con `game.js`.

---

## 1. Vision y Bucle Principal

**Duelforge** es un duelo de cartas roguelike 1v1 en navegador que combina:
- **Construccion en vivo en mesa (Hero Realms):** las cartas compradas en el **Mercado Vivo** con Oro van **directo a tu mano** como cartas **Temporales / Efimeras** (se eliminan al usarse en lugar de ir al descarte; si no se usan en ese turno se descartan y pueden volver a salir en ese combate. Si era una Unidad, la unidad persiste en mesa hasta morir).
- **Progresion de run (Slay the Spire):** una run consta de **3 combates seguidos** conservando la vida del heroe (`30 HP` iniciales). Al pulsar **JUGAR**, entras primero a la **Camara de Descanso** (y regresas a ella tras cada victoria y booster):
  - En la fogata eliges **1 ventaja** (`DESCANSAR +12 HP` o `AVIVAR BRASAS +2 Oro inicial`).
  - En el bolso **Inventario** ves tu mazo completo y puedes **dejar de lado** cartas que te estorben en slots limitados (`2` slots iniciales, ampliables en el metagame) sin destruirlas.
  - Al cruzar la puerta **CONTINUAR** antes del Combate 1 se abre el **Booster Inicial**, y tras cada victoria se abre el booster correspondiente antes de descansar.
- **Combate tactico (Magic / Legends of Runeterra):** tablero de 3 casillas por bando con unidades fisicas sobre peanas, bloqueo manual ante ataques enemigos, ventana de reaccion de 5 segundos y boton opcional de **Auto-Battle tactico (`AUTO: ON/OFF`)**.

### Progresion de la Run (3 Combates)
| Combate | Jefe | HP | ATK Base | Invocacion | Recompensa al ganar |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **1 / 3** | Capitan Hierro | 48 | 7 | Centinela (3/5 Guardia) | Booster Basico (2 opciones) + 12 HP |
| **2 / 3** | Maga de Cristales | 56 | 8 | Golem Cristal (3/6 Guardia) | Booster Raro (3 opciones) + 12 HP + 5 HP Max |
| **3 / 3** | Senor Titan | 68 | 10 | Coloso Hierro (4/7 Guardia) | Victoria Final de la Run |

---

## 2. Reglas de Combate y Economia

- **Recursos por turno:** `3 Energia` (se reinicia cada turno, no se acumula) y `0 Oro` (se genera con cartas durante el turno y se gasta en el Mercado Vivo antes de finalizar turno).
- **Timer de turno:** `35 segundos` por turno del jugador.
- **Mano inicial y robo:** Se roban `5 cartas` al inicio de cada turno. Las cartas sobrantes se descartan al final del turno rival.
- **Tablero:** Maximo `3 unidades` por jugador. Las unidades entran en espera salvo que tengan `Prisa`.
- **Ventana de Reaccion (5.0s):** Cuando el rival lanza un ataque (que no tenga `Escabullirse`), el juego muestra la carta rival en el centro durante 5 segundos:
  - El jugador puede hacer clic en una unidad propia para **bloquear manualmente** ese ataque.
  - Puede jugar cartas con **`[REACCION]`** de su mano si tiene energia disponible.
  - Puede pulsar **DEJAR PASAR** para resolver de inmediato.

---

## 3. Palabras Clave Oficiales (Keywords)

| Keyword | Propiedad JS | Icono | Efecto |
| :--- | :--- | :--- | :--- |
| **Guardia** | `guard: true` | `badge_guard.png` | Protege al heroe: los ataques normales enemigos deben golpear primero a la unidad con Guardia. |
| **Prisa** | `haste: true` | `badge_haste.png` | La unidad puede atacar en el mismo turno en que entra al tablero. |
| **Reaccion** | `reaction: true` | `badge_reaction.png` | La carta puede jugarse durante la Ventana de Reaccion de 5s en pleno turno rival. |
| **Escabullirse** | `stealth: true` | `badge_stealth.png` | En unidad: ignora `Guardia` y ataca directo al heroe. En ataque enemigo: no permite bloqueo ni reaccion. |
| **Mercenario** | `upkeep: N` | `badge_upkeep.png` | Baja pagando menos (ej. `0 EN`), pero al inicio de cada turno consume `N` de Energia (o `N` de Oro); si no se paga, muere. |
| **Efimera** | `ephemeral: true` | `badge_ephemeral.png` | Asignada automaticamente a cartas compradas en el Mercado Vivo; desaparecen al acabar el combate. |
| **Perforar** | `pierce: true` | `PERFORA` | El dano sobrante al matar a una unidad bloqueadora golpea directo al Heroe rival. |
| **Aturdir** | `stunned: true` | `ATURDIDA` | La unidad rival pierde su proximo ataque y su `Guardia` queda desactivada ese turno. |
| **Ultimo Aliento** | `onDeath: {...}` | `AL MORIR` | Activa un efecto automatico (`gold`, `armor`, `draw`, `damageHero`) cuando la unidad muere. |

---

## 4. Guia de Balance (Validado con Monte Carlo v2 - 45,000 Runs)

**Objetivos de balance actuales:**
- Tasa de victoria completa de la run: **~48% - 55%** (Aggro `48.1%`, Economia `54.6%`).
- Duracion media por combate: **6 a 9 turnos** (partidas de menos de 5 minutos).

### Presupuesto de Poder por Coste y Rareza
Para mantener el juego equilibrado al disenar cartas nuevas:

1. **Coste `0 EN` (Tacticas / Mercenarios):**
   - Utilidad pura o unidad con desventaja (`Mercenario` 4/4 con `upkeep: 1`), o generacion de `+3 Oro + 1 Carta` (basica), `+2 Energia` (epica, 3G mercado).
2. **Coste `1 EN`:**
   - **Comun (2G mercado):** `4-5 DMG` o `+5/+6 SHD`, o `+8 HP + 1 Carta`, o Unidad `2/3 +2 Oro` / `2/5 Guardia`.
   - **Rara (3G mercado):** `DMG 5 + 4 HP` (Drenaje), `+7 SHD + 1 Carta`, o `+3 ATK mesa`.
3. **Coste `2 EN`:**
   - **Comun (3G mercado):** Unidad `3/7 Guardia` o `2/9 Guardia`.
   - **Rara (3G mercado):** Unidad `5/3 Prisa + Escabullirse`, `3/4 + 1 Carta`, o Hechizo `11 DMG` / `5 Mesa + 6 Hero`.
   - **Epica (4G mercado):** Hechizo `4 a toda mesa + 4 Hero` o Tactica `+14 SHD`.
4. **Coste `3 EN`:**
   - **Epica (4G mercado):** Amenaza decisiva como Unidad `6/6 Prisa` (15 - 17 pts).
   - **Legendaria (5G mercado, max 1 copia por mazo):** Unidad `6/7 Prisa + Perforar + Ultimo Aliento` (20 - 22 pts).
5. **Rareza `Legendaria` (5G mercado):**
   - Presupuesto por coste: `0 EN` (13-15 pts), `1 EN` (16-18 pts), `2 EN` (18-20 pts), `3 EN` (20-22 pts). Aparece en el Booster Epico y Mercado Vivo.

**Reglas de oro para evitar cartas rotas o trampas:**
- Evitar cartas defensivas puras sin impacto en mesa o robo (en simulaciones, `CURA` sin `+1 CARTA` bajo por debajo del 5% de winrate).
- Cartas con `+Energia` y `+Robo` tienen el impacto mas alto (`69%-77%` winrate): limitarlas a rareza `epica` y coste de mercado `3-4G`.

---

## 5. Catalogo Actual (72 Cartas | 5 Facciones | 5 Tipos)

- **Facciones oficiales:** `forja` (Forja de Hierro), `arcano` (Orden Arcana), `sindicato` (Sindicato del Oro), `legion` (Legion Ignea), `culto` (Culto Sombrio) y `neutral`.
- **Tipos nuevos:**
  - **Reliquia:** Ocupa 1 de los 2 huecos propios junto al Heroe (`#player-relics`) con duracion en turnos (`2T` o `3T`), activando su efecto al inicio de cada turno o pasivas como descuento de Mercado.
  - **Equipo:** Se acopla a una unidad aliada en mesa otorgando `+ATK/+HP` y keywords permanentes mientras viva.
- **Cartas dinamicas:** Las **45 cartas de expansion** (9 del lote inicial + 36 de las 5 facciones) residen en [cards_data.js](file:///d:/Proyectos/Antigravity%20Offline/Card-Game/cards_data.js).

### Mazo Inicial (10 cartas)
- `golpe` (Golpe Rapido) - Hechizo | 1 EN | `DMG 4`
- `escudo` (Escudo Hierro) - Tactica | 1 EN | `[REACCION]` | `SHD +5`
- `mercenario` (Mercenario) - Unidad | 0 EN | `[MERCENARIO 1]` | `4/4`
- `moneda` (Bolsa de Oro) - Tactica | 0 EN | `ORO +3 / +1 CARTA`

### Pool de Mercado y Boosters (23 cartas)
| ID | Nombre | Tipo | Rareza | Coste EN | Coste Oro | Resumen |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `golem` | Golem Piedra | Unidad | comun | 2 | 3 | 3/7 GUARDIA |
| `muro` | Muro Vivo | Unidad | comun | 2 | 3 | 2/9 GUARDIA |
| `escudero` | Escudero Leal | Unidad | comun | 1 | 2 | 2/5 GUARDIA |
| `mercader` | Mercader | Unidad | comun | 1 | 2 | 2/3 +2 ORO al entrar |
| `plasma` | Bomba Plasma | Hechizo | comun | 1 | 2 | DMG 8 +1 CARTA |
| `cofre` | Cofre Guerra | Tactica | comun | 1 | 2 | SHD +6 / +2 ORO |
| `lingote` | Lingote Oro | Tactica | comun | 1 | 2 | ORO +4 / SHD +3 |
| `pocion` | Pocion Vital | Tactica | comun | 1 | 2 | CURA +8 HP / +1 CARTA |
| `relampago` | Asesino Rayo | Unidad | rara | 2 | 3 | 5/3 PRISA + ESCABULLIRSE |
| `goblin` | Goblin Piro | Unidad | rara | 2 | 3 | 4/2 PRISA +2 DMG al entrar |
| `cristalomante` | Cristalomante | Unidad | rara | 2 | 3 | 3/4 +1 CARTA al entrar |
| `furia` | Furia Arcana | Hechizo | rara | 1 | 3 | +3 ATK a mesa aliada |
| `yunque` | Yunque Magico | Tactica | rara | 1 | 3 | +2/+2 a mesa aliada |
| `rayo` | Rayo Cadena | Hechizo | rara | 2 | 3 | 5 DMG a unidad + 6 Hero |
| `hielo` | Viento Glacial | Hechizo | rara | 1 | 3 | `[REACCION]` SHD +7 / +1 CARTA |
| `runica` | Espada Runica | Hechizo | rara | 2 | 3 | DMG 11 |
| `drenaje` | Drenaje Oscuro | Hechizo | rara | 1 | 3 | `[REACCION]` DMG 5 / +4 HP |
| `drako` | Drako Igneo | Unidad | epica | 3 | 4 | 6/6 PRISA |
| `botin` | Botin Real | Tactica | epica | 0 | 4 | ORO +5 / +1 CARTA |
| `martillo` | Martillo Sismico | Hechizo | epica | 2 | 4 | 4 DMG a toda mesa rival + 4 Hero |
| `solar` | Escudo Solar | Tactica | epica | 2 | 4 | `[REACCION]` SHD +14 |
| `sobrecarga` | Sobrecarga | Tactica | epica | 0 | 3 | `[REACCION]` +2 ENERGIA |
| `corona` | Corona Campeon | Tactica | epica | 1 | 4 | +2 EN / +2 CARTAS |

---

## 6. Reglas de Diseno Visual y Arte (ComfyUI)

1. **Unidades vivas:** Toda carta de tipo `Unidad` que permanezca en el tablero debe representar un personaje o criatura viva (nunca un martillo, libro u objeto inerte salvo casos muy especiales).
2. **Accion vs Objeto:** Los hechizos de dano directo deben verse como accion/impacto (tajos, explosiones, rayos), los de oro como riqueza/monedas, los de energia como fuentes de energia (cristales/orbes) y los consumibles como pociones/frascos.
3. **Lenguaje visual unificado de cartas:**
   - **Icono superior central:** indica el **tipo** (`type_unidad.png`, `type_hechizo.png`, `type_tactica.png`).
   - **Color del marco:** refuerza el **tipo** (naranja = Unidad, carmesi = Hechizo, azul = Tactica).
   - **Forma/brillo del marco:** determina la **rareza** (`comun`, `rara`, `epica`, `legendaria`).
   - **Icono temporal:** `badge_ephemeral.png` marca claramente las cartas compradas en el mercado.

## 7. Guia Tecnica para Anadir Cartas Nuevas (Sistema Dinamico `cards_data.js`)

Las cartas nuevas se definen en formato declarativo (estilo JSON) dentro de `cards_data.js` (`window.CUSTOM_CARDS`). `game.js` las carga y registra automaticamente en `CARD_CATALOG` y `MARKET_POOL_IDS` al iniciar.

Para agregar una carta nueva:
1. **Arte (ComfyUI en grillas):** generar los nuevos sprites en **grillas (`2x2`, `1536x1536`)** describiendo cada celda por coordenadas en lenguaje natural sobre fondo blanco puro (o oscuro para fuego/efectos), cortar cada celda y pasarla por `RemoveBackground.json` + trim para guardarlo en `assets/cards/<id>.png`. Si una celda queda pequena tras cortar, hacer `img2img` con bajo denoise duplicando su tamano antes de quitar el fondo.
2. **Registro en `cards_data.js`:** anadir un objeto al array `window.CUSTOM_CARDS` con `id`, `name`, `type`, `rarity` (`"comun" | "rara" | "epica" | "legendaria"`), `cost`, `goldCost`, `shortTag`, `desc`, stats de unidad (`atk`, `hp`, `guard`, `haste`, `stealth`, `pierce`, `onDeath`) o `effects` (`armor`, `heal`, `gold`, `draw`, `damageHero`, `damageEnemyUnitOrHero`, `damageAllEnemiesAndHero`, `stunEnemyUnit`, `stunAllEnemies`, `buffAllies`).
3. **Verificacion recomendada:** ejecutar pruebas en navegador y simulacion Monte Carlo tras anadir lotes de cartas para confirmar que el winrate siga en el rango objetivo (`45% - 58%`).
