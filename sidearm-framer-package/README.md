# SIDEARM Framer Packaging Skeleton

This folder is an isolated working area for converting the portfolio hero mini-game into a Framer component product.

## Copied Sources
- `src/components/MiniGame.tsx`
- `src/components/OperatorComments.tsx`
- `assets/operator/*.webp`

## Notes
- Original portfolio code remains unchanged.
- This skeleton is a staging area for Framer migration and packaging.

## Immediate Next Tasks
1. Split engine/render/input/audio logic from `MiniGame.tsx` into modules.
2. Replace mouse-only handlers with Pointer Events.
3. Add viewport auto-pause via Intersection Observer.
4. Add Framer property controls layer (theme, accent, operator, sound, spray, projectile speed).
5. Convert operator image path strategy for Framer Remix distribution.
