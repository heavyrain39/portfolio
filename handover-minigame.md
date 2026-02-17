# Vector Defense MiniGame Handover
**Project**: Portfolio 2026 (Hero MiniGame)  
**Version**: 0.7  
**Last Updated**: 2026-02-16 (Session E)  
**Primary File**: `components/ui/MiniGame.tsx`

---

## 1. Scope
This document tracks gameplay/rendering/audio/physics behavior for the Hero canvas minigame (`Vector Defense`), reflecting the current code state.

---

## 2. Current Gameplay Snapshot
- Core entities:
  - `EnemyGroup` (movement/formation state)
  - `EnemyUnit` (per-unit HP/spin/fusion state)
- Unit cap:
  - `MAX_MAP_UNITS = 12` alive units total
- Spawn pacing:
  - Base: every `35` frames
  - Score `> 50`: every `33` frames
  - Score `> 150`: every `31` frames
- Spawn families:
  - `normal`: single
  - `cluster`: fused `2` or `3`
  - `caterpillar`: fused `3`, `4`, or `5`
- Spawn family chances:
  - `cluster`: `0.03`
  - `caterpillar`: `0.03`
- Fusion HP rule:
  - Fused units spawn with `+2` temporary HP (`fusionBonusRemaining`)
  - If group becomes single, remaining fusion bonus is removed

---

## 3. Rendering State (Current)
### 3.1 Fused outline system
- Per-unit dashed rings are drawn with connection cutouts.
- Cutouts are derived from the same bridge geometry used by connector strokes.
- Main helpers:
  - `getFusionBridgeShape(...)`
  - `getFusionCutoutsForUnit(...)`
  - `drawDashedRingWithCutouts(...)`
  - `drawDashedFusionBridge(...)`

### 3.2 Connector behavior by formation
- `peanut` / `line`:
  - Draw both connector curves (top + bottom).
- `triangle`:
  - Draw only outer connector edge (to reduce center clutter).
  - Outer edge is picked by comparing curve midpoint distance to triangle centroid.

### 3.3 Current bridge shape tuning
- `paddingBase`:
  - triangle `0.35`
  - others `0.45`
- `cutoutHalfAngle = theta + 0.05`
- Pinch/waist:
  - `pinchScale = 0.9` for triangle, else `1`
  - `inwardPull = radius * (0.07 + (1 - overlapRatio) * 0.24) * pinchScale`

---

## 4. Caterpillar Motion State (Current)
### 4.1 Body wave model (`getLocalOffsets`, line formation branch)
- Head-to-tail amplitude curve:
  - `tailRatio = distFromHead / (count - 1)`
  - `ampCurve = 0.12 + tailRatio * 0.48`
- Long-wave spine phase:
  - `spinePhase = group.phase * 3.5 - distFromHead * 0.45`
- Lateral sway:
  - `lateralOffset = sin(spinePhase) * radius * ampCurve`
- Muscle contraction (X-axis squirm):
  - `muscleContraction = cos(spinePhase) * radius * 0.3 * tailRatio`

### 4.2 Turn-follow deformation (line caterpillar)
- Turn signal:
  - `pendingTurnDelta` from `turnTargetHeading - heading`
  - `turnStrength` from pending delta + angular velocity
  - `bendLag = tailRatio^1.2`
- Bend terms:
  - `turnBend = -turnSign * radius * 0.75 * turnStrength * bendLag`
  - `turnLagX = radius * 0.07 * turnStrength * bendLag`
- Effect:
  - Applies extra Y bend and X lag during turning so body follows head direction change.

### 4.3 Heading turn controller
- Continuous heading update while turning:
  - `step = clamp(delta, -turnAngularSpeed, turnAngularSpeed)`
- Spawned `turnAngularSpeed` range:
  - `Math.random() * 0.02 + 0.03`
- Wall-triggered turn target with cooldown:
  - center-biased next heading
  - cooldown roughly `34` to `58` frames

---

## 5. Physics / Hit Response State
- Non-lethal hits on fused groups:
  - `applyPerUnitImpactKnockback(...)` applies impulse + torque based on hit unit position.
- Lethal hits:
  - normal knockback + destruction effects.
- Caterpillar split on middle unit destruction:
  - Splits into left/right groups.
  - Uses world-anchor reattachment (`reanchorGroupFromWorldMap`) to avoid visual jump.

---

## 6. Audio State
- `shoot` SFX:
  - triangle oscillator with randomized start frequency.
- `hit` SFX:
  - sawtooth oscillator with randomized pitch envelope.
  - current random scale:
    - `hitPitchScale = 1 + (Math.random() - 0.5) * 0.34` (about `+-17%`)

---

## 7. Notable Tunables (Current Values)
- Multi-unit spin speed at spawn:
  - `rotationSpeed = (Math.random() > 0.5 ? 1 : -1) * (Math.random() * 0.0022 + 0.026)`
- Bridge line thickness:
  - `ctx.lineWidth = 1` (connectors)
- Caterpillar organic feel:
  - `ampCurve` slope `0.48`
  - `muscleContraction` factor `0.3`
  - `turnBend` factor `0.75`
- Heat / cooling system:
  - Overheat capacity: `180` shots (`HEAT_SHOTS_TO_OVERHEAT`)
  - Warning threshold: `80%` (`HEAT_WARNING_RATIO = 0.8`)
  - Hard lock threshold: `100%` (fire blocked while overheated)
  - Recover threshold: `10%` (`HEAT_RECOVER_RATIO = 0.1`)
  - Passive cooldown: full-to-zero in `1.6s` (`HEAT_COOLDOWN_DURATION_MS = 1600`)
  - HUD: minimal left-bottom thin rectangular bar above `TARGETS TERMINATED`
    - `HEAT` label is fixed (no `OVERHEAT` text) and placed outside the fill bar
    - Uses opacity pulse (no additional warning color)
  - Crosshair overheat lock cue:
    - Center dot hides
    - Original arm shape remains unchanged in normal state
    - On lock, arms contract/fade, then full inside-circle `X` appears (`45deg`)

---

## 8. Regression Checklist
- Unit cap still enforced at `12`.
- Spawn timing/chances still follow constants.
- Fusion bonus HP cancellation still works on de-fusion to single.
- Triangle bridge center clutter remains suppressed (outer edge only).
- Per-unit impact torque still active on non-lethal fused hits.
- Hit SFX pitch variation still active.
- Mute toggle still blocks all SFX.
- Heat bar appears above score in left-bottom HUD.
- Heat warning pulse activates at `>= 80%`.
- Fire locks at full heat and re-enables at `<= 10%`.
- Crosshair transforms to locked `X` state on overheat.

---

## 9. Suggested Next Work (If Needed)
1. Extract `MiniGame.tsx` into modular files (`types`, `spawn`, `physics`, `render`, `audio`) with zero behavior change.
2. Add lightweight debug toggles for key motion coefficients (`ampCurve`, `muscleContraction`, `turnBend`) to speed up tuning.
3. If turn-follow still feels stiff, tune `turnStrength`/`bendLag` formulas before increasing raw amplitude further.
