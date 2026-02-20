# Vector Defense MiniGame Handover
**Project**: Portfolio 2026 (Hero MiniGame)  
**Version**: 0.8  
**Last Updated**: 2026-02-17 (Session F, post-UI/FireMode refactor)  
**Primary Entry**: `components/ui/MiniGame.tsx`

---

## 1. Scope
This document tracks the **actual current code state** of the Hero canvas minigame (`Vector Defense`) after the latest refactor/tuning pass:
- UI modularization (HUD + crosshair extraction)
- Fire mode system (wheel toggle, dual/quad behavior)
- Heat/overheat integration with fire modes
- Mode switch SFX synthesis update
- HUD alignment polish
- Operator profile animation + layout-shift fix

This handover is intended for the next engineer to pick up work without re-discovering implementation details.

---

## 2. Current File Topology (Important)
The minigame is no longer only a single giant component. Core loop stays in `MiniGame.tsx`, while some UI/audio/type concerns are split.

### 2.1 Main orchestration
- `components/ui/MiniGame.tsx`
  - Owns game loop (`requestAnimationFrame`)
  - Owns input bindings (`mousemove`, `mousedown`, `wheel`, etc.)
  - Owns refs/state synchronization (`heatRatioRef`, `fireModeRef`, etc.)
  - Calls modularized HUD/crosshair components

### 2.2 Minigame modules
- `components/ui/minigame/constants.ts`
  - Gameplay and heat/fire mode constants (including new mode-related constants)
- `components/ui/minigame/types.ts`
  - Includes new `FireMode = "dual" | "quad"`
- `components/ui/minigame/audio.ts`
  - `shoot`, `hit`, and new `modeSwitch` synthesized SFX
- `components/ui/minigame/MiniGameHud.tsx`
  - Bottom-left status block (`MODE`, `HEAT`, `TARGETS TERMINATED`)
- `components/ui/minigame/MiniGameCrosshair.tsx`
  - Crosshair and overheat lock visual

### 2.3 Related (non-minigame-core but directly coupled in Hero)
- `components/ui/OperatorComments.tsx`
  - Operator portrait/comment rendering and audio playback
  - Profile reveal animation and no-layout-shift fix applied in this session

---

## 3. Gameplay Snapshot (Current)
Unchanged base systems from previous version remain:
- Core entities:
  - `EnemyGroup` (movement/formation state)
  - `EnemyUnit` (per-unit HP/spin/fusion state)
- Unit cap:
  - `MAX_MAP_UNITS = 12` total alive units
- Spawn pacing:
  - Base `35` frames
  - Score `> 50`: `33`
  - Score `> 150`: `31`
- Spawn families:
  - `normal`, `cluster`, `caterpillar`
- Spawn chances:
  - `cluster = 0.03`
  - `caterpillar = 0.03`
- Fusion HP:
  - Spawn +2 temporary HP (`fusionBonusRemaining`)
  - Bonus removed when de-fused to single

---

## 4. New Fire Mode System (2026-02-17)
### 4.1 Modes
- `dual` (default):
  - Legacy-style single shot per firing tick
  - Left/right origin chosen randomly each tick
- `quad`:
  - Still same firing cadence (tick interval unchanged)
  - Two shots per tick (not faster cadence)
  - Spawn side randomization preserved
  - Lane behavior tuned to keep parallel-machinegun feel (see below)

### 4.2 Input: wheel toggle
- Bound on game container with passive disabled:
  - `container.addEventListener("wheel", handleWheel, { passive: false })`
- Wheel behavior:
  - Active only while game container is hovered
  - `preventDefault()` called to block page scroll while interacting
  - Direction-agnostic toggle (`dual <-> quad`)
  - Debounced via cooldown:
    - `WHEEL_MODE_SWITCH_COOLDOWN_MS = 140`

### 4.3 Shot pattern details
In `MiniGame.tsx`, firing tick gate remains:
- `time - lastShotTime.current > 40` (unchanged cadence)

Current bullet speed:
- `vx/vy` magnitude multiplier = `60` (was `45` earlier in previous state)

#### dual behavior (current)
- Random side origin each tick
- Single bullet from chosen origin center, with burst spread:
  - `burstSpread` uses `0.12` range expression for non-first burst shots

#### quad behavior (current)
- Two side picks generated per tick (`sidePickA`, `sidePickB`)
- For each shot:
  - base center at left or right cannon origin
  - lane offset:
    - if two shots on same side: split `-/+` lanes
    - if only one shot on side: forced random lane sign (`left or right lane`, not dead center)
  - lane offset magnitude:
    - `laneOffsetX = 4`
  - horizontal jitter:
    - `(Math.random() - 0.5) * 1.6`
  - spray term:
    - `randomSpray = (Math.random() - 0.5) * 0.1` (tuned down from `0.12`)
  - final spread:
    - `spread = burstSpread * 0.45 + randomSpray`

---

## 5. Heat / Overheat State (Current)
### 5.1 Baseline heat constants
- `HEAT_SHOTS_TO_OVERHEAT = 180`
- `HEAT_PER_SHOT = 1 / 180`
- `HEAT_WARNING_RATIO = 0.8`
- `HEAT_RECOVER_RATIO = 0.1`
- `HEAT_COOLDOWN_DURATION_MS = 1600`
- `HEAT_COOL_PER_MS = 1 / 1600`

### 5.2 Mode interaction
- `quad` heat multiplier:
  - `QUAD_MODE_HEAT_MULTIPLIER = 1.5`
- Applied per firing tick:
  - `nextHeat = heat + HEAT_PER_SHOT * multiplier`
  - multiplier is `1.5` only in quad, `1` in dual

### 5.3 Overheat rules
- Fire lock at full heat (`>= 1`)
- Recover / unlock at `<= 0.1`
- Passive cooldown when:
  - not holding mouse, or
  - overheated state

---

## 6. Audio State (Current)
`components/ui/minigame/audio.ts` now supports three game SFX types:
- `shoot`:
  - triangle osc with randomized start pitch
- `hit`:
  - sawtooth with randomized pitch envelope (same as prior behavior)
- `modeSwitch` (new):
  - two-layer synthesized click (`square` + delayed `triangle`)
  - tuned for lower "click/clack" character
  - current frequencies:
    - first tone: `180 -> 130` (fast decay)
    - second tone: `100 -> 78` (delayed start)

Mute integration:
- Shared mute gate remains at `playGameSound` entry (`if (isMuted) return`)
- So `modeSwitch` is also fully muted by same toggle

---

## 7. HUD / Crosshair UI State
### 7.1 Modularization result
UI blocks extracted from `MiniGame.tsx`:
- `MiniGameHud.tsx`
- `MiniGameCrosshair.tsx`

Game loop behavior/design were kept while extracting.

### 7.2 Current HUD composition
Bottom-left block order:
1. `MODE` row
2. `HEAT` row (thin bar)
3. `TARGETS TERMINATED` row + score

Current style/behavior details:
- MODE row:
  - shows `DUAL` and `QUAD`
  - selected option opacity: `0.5`
  - unselected option opacity: `0.15`
  - fine offset:
    - `DUAL/QUAD` container has `ml-[5px]`
- HEAT row:
  - warning pulse on `>= 80%` and not overheated
  - no extra warning color, opacity pulse only
- Score row:
  - display padding back to 3 digits:
    - `padStart(3, "0")`
  - number kept in right-aligned slot (`min-w-[4ch]`) to limit jitter
  - pop animation:
    - `scale: [1.5, 1]`, `duration: 0.15`
    - origin set to center to avoid one-sided bias

### 7.3 Crosshair
No behavior change from overheat-lock design intent:
- Normal:
  - center dot visible
  - arm motion reacts to shooting
- Overheated:
  - center dot hidden
  - arms contract/fade
  - central `X` appears (45 deg)

---

## 8. Operator Profile/Comment UI Changes (Related)
In `OperatorComments.tsx`, profile reveal was adjusted:
- removed lateral slide in/out
- now reveals with center-like scale-up:
  - `initial: { opacity: 0, scale: 0.72 }`
  - `animate: { opacity: 1, scale: 1 }`
  - faster duration `0.24s`
- image slot layout-shift fix:
  - profile container width reserved with `w-8 shrink-0` always present
  - animated image layer is absolute inside that slot
  - prevents comment text from jumping left when portrait exits

---

## 9. Notable Tunables (Quick Reference)
### 9.1 Fire mode & wheel
- `WHEEL_MODE_SWITCH_COOLDOWN_MS = 140`
- firing cadence gate:
  - `time - lastShotTime > 40`
- bullet speed multiplier:
  - `60` (`vx/vy`)

### 9.2 Quad pattern
- `laneOffsetX = 4`
- `horizontalJitter = +-0.8` equivalent from `(rand - 0.5) * 1.6`
- `randomSpray = +-0.05` equivalent from `(rand - 0.5) * 0.1`
- `burstSpread` source range still tied to `0.12` expression for burst variation

### 9.3 Heat
- `QUAD_MODE_HEAT_MULTIPLIER = 1.5`
- cooldown to zero from full: `1.6s`

### 9.4 Mode-switch SFX
- Layer 1:
  - square, `180 -> 130`, short decay
- Layer 2:
  - triangle, delayed `100 -> 78`, short decay

---

## 10. Regression Checklist (Updated)
### 10.1 Core gameplay
- [ ] Unit cap still enforced at `12`.
- [ ] Spawn timing/chances unchanged (`35/33/31`, `0.03/0.03`).
- [ ] Fusion bonus HP cancellation on de-fusion still works.
- [ ] Triangle connector center clutter suppression still intact.
- [ ] Non-lethal fused hit torque/impact behavior unchanged.

### 10.2 Fire mode
- [ ] Default mode on load is `dual`.
- [ ] Wheel toggles dual/quad regardless of wheel direction.
- [ ] Wheel does not scroll page while hovering game area.
- [ ] Wheel toggle does nothing outside hover.
- [ ] Cooldown prevents rapid accidental multi-toggle.
- [ ] Dual fires single bullet from random side.
- [ ] Quad keeps firing cadence (not increased fire rate), but increases bullets/tick.
- [ ] Quad single-lane shot still uses left/right lane offset (not dead center).

### 10.3 Heat/overheat
- [ ] Quad heat grows faster than dual (`x1.5`).
- [ ] Overheat lock triggers at full heat and blocks firing.
- [ ] Recovery unlock at `<= 10%`.
- [ ] Heat warning pulse starts at `>= 80%`.

### 10.4 HUD/crosshair
- [ ] MODE row reflects active fire mode.
- [ ] MODE option opacity behavior (active 50%, inactive 15%).
- [ ] HUD alignment stays stable (no label wrapping).
- [ ] Score base display is 3-digit (`000` style).
- [ ] Score pop does not visually drift to one side.
- [ ] Overheat crosshair transforms to locked-X state.

### 10.5 Audio
- [ ] Mute toggle blocks `shoot`, `hit`, and `modeSwitch` all together.
- [ ] Mode switch SFX is clearly two-stage click, not a single dull tone.

### 10.6 Operator UI
- [ ] Profile appear/disappear no longer shifts comment text horizontally.
- [ ] Profile reveal has no lateral translation, only fast scale/opacity.

---

## 11. Known Risks / Notes
- Several fire-pattern values are currently inline in `MiniGame.tsx` (not constants):
  - lane offsets, jitter, spread blend, bullet speed scalar
  - acceptable for rapid tuning, but extraction may help future balancing
- `MiniGameHud` alignment currently uses mixed unit strategy:
  - `w-[calc(18ch+1.7em)]` and `grid-cols-[5.2ch_1fr]`
  - this was intentionally tuned for visual alignment under `tracking-widest`
- Score slot uses `min-w-[4ch]` while display is `padStart(3)`.
  - This intentionally reserves width and reduces jitter when value grows.

---

## 12. Suggested Next Work (Backlog)
1. Extract fire-pattern numerics (lane/jitter/spread/bullet speed) into `constants.ts` for faster A/B tuning.
2. Add in-game debug toggles (dev only) for:
   - bullet speed
   - quad heat multiplier
   - lane offset / spray
3. Optional extension backlog (low priority):
   - side-panel-only Chrome extension packaging
   - settings page (theme/spawn/voice/operator visibility)
   - non-realtime settings apply is sufficient for first cut
4. If operator reveal still feels too abrupt after user playtest, tune scale envelope only (keep no-layout-shift architecture).

---

## 13. One-Glance Change Summary (0.7 -> 0.8)
- Introduced modular HUD/crosshair components.
- Added dual/quad fire mode with wheel toggle + hover scroll lock.
- Added synthesized mode-switch SFX and mute integration.
- Implemented quad-specific heat increase (`x1.5`).
- Tuned quad lane/spray behavior for more parallel machinegun feel.
- Polished HUD alignment and score animation behavior.
- Updated operator profile reveal animation and removed text-shift on exit.
