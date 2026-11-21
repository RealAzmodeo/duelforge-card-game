# SPRAY CASTERS - Game Design Document (GDD)

Documento de referencia de diseno, produccion visual y arquitectura tecnica para la transformacion de `Card-Game` en **SPRAY CASTERS: The City is Your Canvas. Magic is Your Ammo.**

---

## 1. Nucleo de Juego y Reglas Territoriales

- **Combate 1v1 en Arena Cenital:** Tablero tactico dividido en casillas de hormigon/asfalto (3 slots por bando, expandibles segun distrito).
- **Pintura Territorial por Casilla (`paintOwner`):**
  - Cada casilla guarda su estado: `neutral` (gris de El Orden), `player` (color de tu banda) o `enemy` (color rival).
  - Jugar una unidad o lanzar un hechizo de faccion pinta la casilla correspondiente.
  - Unidades sobre pintura aliada reciben bonificaciones territoriales (ej. +ATK, escudo o activacion de habilidad).
  - *El Orden* y *The Scrapper* blanquean casillas al entrar o al final de ronda.
- **Recursos y Flujo de Turno:**
  - **Presion (Energia):** Se reinicia cada turno (`3/3` base) para desplegar unidades, objetos y trazos/hechizos.
  - **Botes / Credito Callejero (Oro):** Se genera en turno para adquirir cartas temporales en el Mercado Vivo.
  - **Mano inicial y robo:** `5 cartas` al inicio del turno; timer tactico y ventana de reaccion para bloqueos manuales y contrahechizos.
- **Apertura de Boosters en Spray:** Los paquetes de cartas son latas cerradas; el jugador agita la lata y rocia la pared virtual para revelar las piezas pintadas.

---

## 2. Facciones, Keywords y El Orden

### Las 6 Bandas
| Facción | Paleta | Estilo | Mecanica / Keywords |
| :--- | :--- | :--- | :--- |
| **Los Bombers** | Rojo carmesi, Naranja fuego, Amarillo acido | Throw-up | `Pintura Fresca` (Haste), dano directo, quemadura de casilla |
| **Los Tejedores** | Violeta real, Cian electrico, Magenta | Wildstyle geometrico | Control/redireccion, robo, combos encadenados, contrahechizo |
| **La Vanguardia Stencil** | Verde oliva, Acero, Naranja seguridad | Stencil militar | Orcos grandotes musculosos, botas pesadas, blindaje, `Provocacion` (Taunt), `Tokens` |
| **Los Rollers** | Verde esmeralda, Granate, Oro | Blockbuster de lujo | Goblins ricachones con cadenas de oro, `Overrun` (repinta la casilla rival), barrido |
| **Los Acidos** | Verde toxico, Morado profundo, Lila | Etching / Paste-up | Corrosion (`DoT`), rompe equipo, `Paste-up` (recupera del descarte) |
| **The Sugar Riot** | Rosa chicle, Magenta, Azul bebe, Amarillo neon | Kawaii-Punk / Stickers | `Dazzle` (aturdir/cegar), `Bounce` (devolver a mano), `Sticky` |

### El Orden (3 Estratos de Enemigos)
| Estrato | Nombre | Rol | Mecanica clave |
| :--- | :--- | :--- | :--- |
| **Normal** | **The Scrapper** | Brigada de limpieza | Enjambre barato; limpia pintura al entrar y debilita `Pintura Fresca`. |
| **Elite** | **The Enforcer** | Escuadron antidisturbios | `Provocacion`, `Supresion` adyacente, resiste primer golpe directo. |
| **Jefe** | **The Overlord** | Alto Comisario / Mecha | Blanquea 1 fila por turno, destruye equipo, gana blindaje por casilla limpia. |

---

## 3. Pipeline de Produccion Local (ComfyUI + Audio/VFX)

### Workflows Oficiales (`comfy-wf/`)
- **Activos individuales, personajes, cartas, iconos y aerosoles:** [Spraycasters_v1.json](comfy-wf/Spraycasters_v1.json) (preset *Super High Impact v2*).
- **Arenas y fondos de distrito (16:9):** [Spraycasters_v1_BusyBackgrounds.json](comfy-wf/Spraycasters_v1_BusyBackgrounds.json) (preset *Super High Impact Backgrounds*).
- **Recorte de fondos:** [RemoveBackground.json](comfy-wf/RemoveBackground.json) (RMBG-2.0 con salida Alpha).

### Regla de Descripcion Grafica en Prompts
- Se pueden usar palabras como `graffiti`, `scribbles`, `throw-up` o `stencil`, **siempre acompanadas de la forma concreta que representan** (ej. *"a graffiti flame bomb with angry eyes"*, *"chalk scribbles of stars and arrows"*) para evitar manchones indefinidos o letras basura.
- No usar la nomenclatura `1x1` en prompts de activos individuales (reservar `3x3`, `3x2`, `1x3` solo para hojas multi-activo).

### Regla de Detalle para Activos Individuales (`1536x1536`)
- **Personajes coleccionables:** Razas fieles al lore (Vanguardia = orcos militares grandotes con botas y escudos; Rollers = goblins ricachones con cadenas y ornamentos dorados; Bombers = humanos parkour, goblins piromanos y elementales), poses dinamicas y herramientas de pintura visibles.
- **Objetos y Reliquias:** Prompts ricos detallando materiales concretos, ornamentos/desgaste DIY, tornillos, cinta, cables y reflejos.
- **Hechizos:** Deben verse como **magia real en accion** (energia arcana luminosa, ondas de choque, rayos o barreras magicas) fusionada con pintura humeda goteando (`vertical dripping wet paint`) y salpicaduras de aerosol, sin recuadros ni bordes de icono.
- **Margen completo:** Exigir margen vacio en los 4 lados para evitar cualquier recorte en bordes.

### Direccion de VFX y SFX
- **VFX (`vfx-engine.js`):** Particulas de aerosol presurizado, goteos (*drips*) verticales, destellos neon y borrado quimico blanco/laser para El Orden.
- **SFX (`sfx-engine.js` / `sfx-presets.js`):** Diseno sonoro urbano estilo **dubstep energizante** (sub-bajos, *wobbles*, impactos sintetizados, *scratches*, agitacion de bola metalica en lata, silbido de boquilla, y pitidos/chorros esteriles de El Orden).
