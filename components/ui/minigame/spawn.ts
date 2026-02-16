import {
    CATERPILLAR_SPAWN_CHANCE,
    CONNECTED_SPAWN_CHANCE,
    FUSION_BONUS_HP,
    MAX_MAP_UNITS,
    SPAWN_INTERVAL_BASE,
    SPAWN_INTERVAL_HIGH,
    SPAWN_INTERVAL_MID,
    SPAWN_SCORE_HIGH,
    SPAWN_SCORE_MID,
    SPEEDSTER_CHANCE
} from "./constants";
import { getLocalOffsets, getWorldUnitPositions } from "./formation";
import type { EnemyFamily, EnemyGroup, EnemyUnit, PhysicsPreset } from "./types";

export const countAliveUnits = (groups: EnemyGroup[]) => {
    return groups.reduce((total, group) => total + group.units.length, 0);
};

export const rollBaseHp = () => {
    const r = Math.random();
    if (r < 0.1) return 3;
    if (r > 0.9) return 5;
    return 4;
};

export const createUnit = (isFusedSpawn: boolean): EnemyUnit => {
    const baseHp = rollBaseHp();
    const fusionBonus = isFusedSpawn ? FUSION_BONUS_HP : 0;
    return {
        id: Math.random(),
        baseHp,
        hp: baseHp + fusionBonus,
        fusionBonusRemaining: fusionBonus,
        squareSpinDir: 1,
        spinPhaseOffset: Math.random() * Math.PI * 2
    };
};

export const getSpawnIntervalFrames = (score: number) => {
    if (score > SPAWN_SCORE_HIGH) return SPAWN_INTERVAL_HIGH;
    if (score > SPAWN_SCORE_MID) return SPAWN_INTERVAL_MID;
    return SPAWN_INTERVAL_BASE;
};

interface SpawnEnemyGroupParams {
    enemyGroups: EnemyGroup[];
    canvasWidth: number;
    canvasHeight: number;
    physicsPreset: PhysicsPreset;
}

export const spawnEnemyGroup = ({
    enemyGroups,
    canvasWidth,
    canvasHeight,
    physicsPreset
}: SpawnEnemyGroupParams) => {
    const aliveUnits = countAliveUnits(enemyGroups);
    if (aliveUnits >= MAX_MAP_UNITS) return;

    const remainingSlots = MAX_MAP_UNITS - aliveUnits;
    const roll = Math.random();

    let family: EnemyFamily = "normal";
    if (roll < CONNECTED_SPAWN_CHANCE) {
        family = "cluster";
    } else if (roll < CONNECTED_SPAWN_CHANCE + CATERPILLAR_SPAWN_CHANCE) {
        family = "caterpillar";
    }

    let unitCount = 1;
    if (family === "cluster") {
        const choices = [2, 3].filter((n) => n <= remainingSlots);
        if (!choices.length) return;
        unitCount = choices[Math.floor(Math.random() * choices.length)];
    } else if (family === "caterpillar") {
        const choices = [3, 4, 5].filter((n) => n <= remainingSlots);
        if (!choices.length) return;
        unitCount = choices[Math.floor(Math.random() * choices.length)];
    }

    const side = Math.random() > 0.5 ? "left" : "right";
    const dir: 1 | -1 = side === "left" ? 1 : -1;
    const radius = 25 + Math.random() * 10;
    const unitMass = Math.max(1, (radius * radius) / 700);
    const isFusedSpawn = unitCount > 1;
    const isSpeedster = family === "normal" && Math.random() < SPEEDSTER_CHANCE;
    const speedMultiplier = isSpeedster ? 1.5 : 1;
    const sizeSpeedScale = Math.max(0.62, 1 - (unitCount - 1) * 0.09);
    const baseSpeed = (Math.random() * 1.8 + 2.1) * 1.1 * speedMultiplier * sizeSpeedScale;

    const units: EnemyUnit[] = Array.from({ length: unitCount }, () => createUnit(isFusedSpawn));

    const group: EnemyGroup = {
        id: Math.random(),
        family,
        x: 0,
        y: 0,
        vx: dir * baseSpeed,
        vy: (Math.random() - 0.5) * 1.2,
        dir,
        radius,
        unitMass,
        mass: unitMass * unitCount,
        baseSpeed,
        maxSpeed: baseSpeed + Math.random() * 1.2 + 1.2,
        driftAmp: (Math.random() * 0.9 + 0.7) * (family === "caterpillar" ? 1.1 : 1),
        driftFreq: Math.random() * 0.055 + 0.05,
        steer: Math.random() * 0.028 + 0.03,
        damping: Math.random() * 0.008 + 0.987,
        restitution:
            Math.random() * (physicsPreset.restitutionMax - physicsPreset.restitutionMin) +
            physicsPreset.restitutionMin,
        phase: Math.random() * Math.PI * 2,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed:
            unitCount > 1
                ? (Math.random() > 0.5 ? 1 : -1) * (Math.random() * 0.0022 + 0.026)
                : 0,
        angularVelocity: 0,
        angularDamping: 0.945,
        heading: Math.atan2((Math.random() - 0.5) * 0.6, dir),
        turnTargetHeading: null,
        turnAngularSpeed: Math.random() * 0.02 + 0.03,
        turnCooldown: 0,
        spawnProgress: 1,
        units,
        isSpeedster,
        spawnSide: side,
        hasEnteredArena: false,
        hasFullyEnteredArena: false
    };

    const spawnPreviewProgress = group.spawnProgress;
    group.spawnProgress = 1;
    const offsets = getLocalOffsets(group);
    group.spawnProgress = spawnPreviewProgress;
    const minOffsetX = Math.min(...offsets.map((o) => o.x));
    const maxOffsetX = Math.max(...offsets.map((o) => o.x));
    const spawnInset = Math.max(radius * 1.3, 44);
    const startX = side === "left" ? -spawnInset - maxOffsetX : canvasWidth + spawnInset - minOffsetX;

    let startY = Math.random() * (canvasHeight * 0.5) + canvasHeight * 0.1;
    let spawnOk = false;

    for (let attempt = 0; attempt < 14; attempt++) {
        startY = Math.random() * (canvasHeight * 0.55) + canvasHeight * 0.08;
        group.x = startX;
        group.y = startY;

        const progressSnapshot = group.spawnProgress;
        group.spawnProgress = 1;
        const candidateUnits = getWorldUnitPositions(group);
        group.spawnProgress = progressSnapshot;
        const hasOverlap = enemyGroups.some((existing) => {
            const existingUnits = getWorldUnitPositions(existing);
            return candidateUnits.some((candidate) => {
                return existingUnits.some((other) => {
                    const minDist = (group.radius + existing.radius) * physicsPreset.collisionRatio;
                    return Math.hypot(candidate.x - other.x, candidate.y - other.y) < minDist;
                });
            });
        });

        if (!hasOverlap) {
            spawnOk = true;
            break;
        }
    }

    if (!spawnOk && aliveUnits > 6) return;

    group.x = startX;
    group.y = startY;
    enemyGroups.push(group);
};
