import { getFormation, getLocalOffsets } from "./formation";
import type { EnemyGroup, EnemyUnit, Point } from "./types";

export const recalcGroupMass = (group: EnemyGroup) => {
    group.mass = Math.max(group.unitMass, group.unitMass * group.units.length);
};

export const cancelFusionBonusIfSingle = (group: EnemyGroup) => {
    if (group.units.length !== 1) return;
    const only = group.units[0];
    if (only.fusionBonusRemaining <= 0) return;

    only.hp = Math.max(1, only.hp - only.fusionBonusRemaining);
    only.fusionBonusRemaining = 0;
};

export const getCentroidFromWorldMap = (
    units: EnemyUnit[],
    worldByUnitId: Map<number, Point>,
    fallback: Point
): Point => {
    if (!units.length) return fallback;
    let sumX = 0;
    let sumY = 0;
    let count = 0;

    for (const unit of units) {
        const world = worldByUnitId.get(unit.id);
        if (!world) continue;
        sumX += world.x;
        sumY += world.y;
        count++;
    }

    if (!count) return fallback;
    return { x: sumX / count, y: sumY / count };
};

export const reanchorGroupFromWorldMap = (
    group: EnemyGroup,
    worldByUnitId: Map<number, Point>,
    fallback: Point
) => {
    group.turnTargetHeading = null;
    if (!group.units.length) {
        group.x = fallback.x;
        group.y = fallback.y;
        return;
    }

    const formation = getFormation(group);

    if (formation === "peanut" && group.units.length >= 2) {
        const firstAnchor = worldByUnitId.get(group.units[0].id);
        const secondAnchor = worldByUnitId.get(group.units[1].id);
        if (firstAnchor && secondAnchor) {
            const dx = secondAnchor.x - firstAnchor.x;
            const dy = secondAnchor.y - firstAnchor.y;
            if (Math.hypot(dx, dy) > 0.001) {
                group.rotation = Math.atan2(dy, dx);
            }
        }
    }

    if (group.family === "caterpillar" && group.units.length >= 2) {
        const firstAnchor = worldByUnitId.get(group.units[0].id);
        const lastAnchor = worldByUnitId.get(group.units[group.units.length - 1].id);
        if (firstAnchor && lastAnchor) {
            const dx = lastAnchor.x - firstAnchor.x;
            const dy = lastAnchor.y - firstAnchor.y;
            if (Math.hypot(dx, dy) > 0.001) {
                const angle = Math.atan2(dy, dx);
                if (formation === "peanut") {
                    group.rotation = angle;
                }
                group.heading = angle;
                group.dir = Math.cos(angle) >= 0 ? 1 : -1;
            }
        }
    }

    const progressSnapshot = group.spawnProgress;
    group.spawnProgress = 1;
    const offsets = getLocalOffsets(group, formation);
    group.spawnProgress = progressSnapshot;

    let sumX = 0;
    let sumY = 0;
    let count = 0;

    for (let i = 0; i < group.units.length; i++) {
        const anchor = worldByUnitId.get(group.units[i].id);
        const offset = offsets[i];
        if (!anchor || !offset) continue;
        sumX += anchor.x - offset.x;
        sumY += anchor.y - offset.y;
        count++;
    }

    if (!count) {
        group.x = fallback.x;
        group.y = fallback.y;
        return;
    }

    group.x = sumX / count;
    group.y = sumY / count;
};
