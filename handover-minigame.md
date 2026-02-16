# Vector Defense MiniGame Handover
**Project**: Portfolio 2026 (Hero MiniGame)  
**Version**: 0.3  
**Last Updated**: 2026-02-16 (Session B)  
**Primary File**: `components/ui/MiniGame.tsx`

---

## 1. Scope
This document tracks gameplay/rendering/physics changes for the Hero canvas minigame (`Vector Defense`).
It is split from `handover.md` for faster iteration and lower context cost in follow-up sessions.

---

## 2. Current Architecture Snapshot
- Core model: `EnemyGroup + EnemyUnit`
- Map cap: `12` alive **units** (not group count)
- Spawn policy:
  - Base: 35 frames
  - Score > 50: 33 frames
  - Score > 150: 31 frames
  - `cluster` chance: 3%
  - `caterpillar` chance: 3%
- Enemy families:
  - `normal`
  - `cluster` (2/3 fused)
  - `caterpillar` (3/4/5 fused line)
- Defense rule:
  - While fused (2+), each unit has +2 fusion bonus HP
  - When reduced to single, remaining fusion bonus is canceled
- Boundary rule:
  - Units can be up to half-radius outside map bounds
  - Full map escape is blocked

---

## 3. Implemented in This Session (2026-02-16 Session B)
1. Ring fusion rendering (fixed)
- Removed contour/connector-overdraw approach.
- Implemented per-unit dashed circular ring with geometry-based connection cutouts.
- Result: each unit ring remains circular; connected seams read as smooth puyo-like fusion.

2. Split jump suppression (fixed)
- Added anchor reconstruction helper `reanchorGroupFromWorldMap(...)`.
- On unit death/split, reconstruct post-change transform from pre-hit world anchors.
- Applied to both split branch and non-split survivor branch.

3. Caterpillar movement/turning (reworked)
- Removed hard flip-like wall bounce behavior.
- Added smooth turn state:
  - `turnTargetHeading`
  - `turnAngularSpeed`
  - `getAngleDelta(...)` incremental rotation
- Prevented re-triggering a new wall turn while already turning.
- Added max turn clamp (`±0.62π`) and longer cooldown to avoid over-rotation.

4. Caterpillar body motion polish
- Increased wave amplitude and vertical sway for stronger snake-like crawling.
- Line formation head anchor is fixed by caterpillar index order (no `dir`-based flip).

---

## 4. User-Confirmed Good (After Session B)
- Caterpillar crawling feel is now strongly organic/snake-like.
- Turn over-rotation reduced after clamp + slower angular speed tuning.
- Ring fusion direction matches intent (unit circles preserved, seam blending improved).

---

## 5. Remaining Top-Priority Tasks (Next Session)
1. Caterpillar off-screen full-form spawn
- Goal: remove in-view "stretch into shape" impression.
- Requirement: spawn already fully formed from outside screen bounds.

2. Per-unit impact knockback with rotational response
- Goal: remove current whole-group uniform knockback on non-lethal hits.
- Requirement: impulse should be computed per hit unit and produce physically plausible group tilt/rotation response.

3. MiniGame modularization (without behavior/design change)
- Goal: improve maintainability and lower token cost for future edits.
- Requirement: preserve all current gameplay/rendering/UX behavior.

---

## 6. Recommended Starting Points for Next LLM
1. Off-screen full-form spawn
- Current stretch source: `spawnProgress` growth path for caterpillar.
- Touchpoints:
  - `spawnEnemyGroup(...)`
  - `getLocalOffsets(...)`
  - caterpillar update block where `spawnProgress` increments

2. Per-unit knockback/torque
- Current limitation: hit impulse is applied to group-level velocity uniformly.
- Touchpoints:
  - bullet hit handling loop
  - group orientation fields (`heading`, possibly new `angularVelocity`)
  - post-hit transform integration

3. Modularization
- Suggested split:
  - `components/ui/minigame/types.ts`
  - `components/ui/minigame/constants.ts`
  - `components/ui/minigame/spawn.ts`
  - `components/ui/minigame/physics.ts`
  - `components/ui/minigame/render.ts`
  - keep `components/ui/MiniGame.tsx` as orchestration shell

---

## 7. Regression Checklist
- Shooting feel (ROF/spread/feedback) unchanged
- Score/hit flash/floating text unchanged
- Audio/mute behavior unchanged
- Unit cap still enforced at 12
- Spawn probabilities and dynamic interval still correct
- No unreachable targets due to boundary handling
- Caterpillar: no hard flip impression on wall turn
