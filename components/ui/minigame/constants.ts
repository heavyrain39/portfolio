import type { PhysicsPreset } from "./types";

export const GRAVITY = 0.2;
export const MAX_MAP_UNITS = 12;
export const SPAWN_INTERVAL_BASE = 35;
export const SPAWN_INTERVAL_MID = 33;
export const SPAWN_INTERVAL_HIGH = 31;
export const SPAWN_SCORE_MID = 50;
export const SPAWN_SCORE_HIGH = 150;
export const FUSION_BONUS_HP = 2;
export const CONNECTED_SPAWN_CHANCE = 0.03;
export const CATERPILLAR_SPAWN_CHANCE = 0.03;
export const SPEEDSTER_CHANCE = 0.08;
export const HALF_OUTSIDE_RATIO = 0.5;

export const PHYSICS_PRESETS: Record<"subtle" | "balanced" | "punchy", PhysicsPreset> = {
    subtle: {
        collisionRatio: 0.78,
        restitutionMin: 0.14,
        restitutionMax: 0.24,
        knockbackBase: 1.9
    },
    balanced: {
        collisionRatio: 0.82,
        restitutionMin: 0.22,
        restitutionMax: 0.37,
        knockbackBase: 2.5
    },
    punchy: {
        collisionRatio: 0.88,
        restitutionMin: 0.34,
        restitutionMax: 0.52,
        knockbackBase: 3.2
    }
};

export const ACTIVE_PHYSICS_PRESET: keyof typeof PHYSICS_PRESETS = "balanced";
export const DEFAULT_PHYSICS_PRESET = PHYSICS_PRESETS[ACTIVE_PHYSICS_PRESET];

export const SFX_MIX_LEVEL = 0.7;
export const SFX_REFERENCE_LEVEL = 0.7;
export const SFX_LEVEL_SCALE = SFX_MIX_LEVEL / SFX_REFERENCE_LEVEL;

export const HEAT_SHOTS_TO_OVERHEAT = 180;
export const HEAT_PER_SHOT = 1 / HEAT_SHOTS_TO_OVERHEAT;
export const HEAT_WARNING_RATIO = 0.8;
export const HEAT_RECOVER_RATIO = 0.1;
export const HEAT_COOLDOWN_DURATION_MS = 1600;
export const HEAT_COOL_PER_MS = 1 / HEAT_COOLDOWN_DURATION_MS;
export const QUAD_MODE_HEAT_MULTIPLIER = 1.5;
export const WHEEL_MODE_SWITCH_COOLDOWN_MS = 140;
