# Concepts Brief: Roguelike Card Duel (Browser-First)

## 1. Vision y Estetica
- **Plataforma:** Navegador web (HTML / CSS / JS / Canvas), carga instantanea y ejecucion fluida.
- **Tono Visual:** Casual pero de alto impacto.
  - Fondos con colores *bold*, planos y saturados.
  - Efectos especiales duros, planos y saturados (estilo *pop/arcade* limpio).
  - Personajes y elementos de juego con estetica de *casual game* amigable y legible.

## 2. Bucle Principal de Juego (Core Loop)
1. **Inicio de Run:** El jugador comienza con un mazo base permanente pequeno (10-12 cartas).
2. **Duelo 1 vs 1:** Combate por turnos contra un rival en una mesa compartida (referencia: *Slay the Spire* + *Hearthstone/Magic* + *Hero Realms*).
3. **Recompensa entre Combates:** Al ganar un duelo, el jugador elige cartas o mejoras **permanentes** para su mazo durante toda la run.
4. **Progresion:** Los duelos escalan en dificultad hasta el jefe final de la run.

## 3. Mecanicas de Combate (Duelo 1 vs 1)
- **Recursos del Turno:**
  - **Energia:** Se renueva cada turno (ej. 3/3) para jugar cartas de la mano.
  - **Oro:** Generado por ciertas cartas durante el turno; sirve exclusivamente para comprar en el Mercado Vivo.
- **Mano y Mazo:**
  - Robo de 5 cartas al inicio del turno; descarte de mano al final del turno.
  - Si el mazo se agota, el descarte se baraja automaticamente.
- **Tipos de Cartas:**
  - **Unidades:** Se colocan en tu lado de la mesa (maximo 3 huecos por lado para mantener la UI limpia). Tienen Ataque/Vida. Esperan 1 turno para atacar (salvo que tengan *Prisa*). Las unidades con *Guardia* bloquean ataques directos al Heroe.
  - **Hechizos:** Efecto inmediato (dano, robo, mejora) y van al descarte.
  - **Tacticas / Escudos:** Otorgan Armadura al Heroe o efectos defensivos.
- **Rival con Intencion Visible:**
  - El rival tiene Heroe con Vida, juega unidades en su lado de la mesa y muestra su **Intencion** del proximo turno para permitir juego tactico.

## 4. Mercado Vivo (Mecanica Hero Realms)
- **Fila de Mercado:** 4 o 5 cartas visibles en una barra compacta, alimentadas por un mazo de mercado (se rebaraja si se agota).
- **Compra durante el Combate (Solo Jugador):** El jugador puede gastar Oro en su turno para comprar cartas del Mercado. La carta comprada va **directamente al tope del mazo** (robo garantizado en el siguiente turno) y el hueco se repone al instante.
- **Regla de Efimeridad:** Todas las cartas compradas en el Mercado Vivo son **efimeras** (duran solo ese combate y se eliminan al finalizar el duelo).
- **Reglas de Borde:** El Oro sobrante se reinicia al final del turno (como la Energia). No se pueden jugar unidades si los 3 huecos estan llenos.
- **Diferencia Clave:**
  - *Cartas del Mercado:* Efimeras (tactica y adaptacion en el duelo actual).
  - *Cartas de Recompensa entre combates:* Permanentes (construccion de mazo para toda la run).
