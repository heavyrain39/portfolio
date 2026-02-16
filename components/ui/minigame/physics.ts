import { HALF_OUTSIDE_RATIO } from "./constants";
import { getFormation, getLocalOffsets, getWorldUnitPositions } from "./formation";
import {
    cancelFusionBonusIfSingle,
    getCentroidFromWorldMap,
    reanchorGroupFromWorldMap,
    recalcGroupMass
} from "./group-state";
import { clamp, getAngleDelta } from "./math";
import type { EnemyGroup, PhysicsPreset, Point, WorldUnitPosition } from "./types";

export const updateArenaEntryState = (group: EnemyGroup, canvasWidth: number) => {
    const halfOutside = group.radius * HALF_OUTSIDE_RATIO;
    const worldUnits = getWorldUnitPositions(group);
    const minWorldX = Math.min(...worldUnits.map((world) => world.x));
    const maxWorldX = Math.max(...worldUnits.map((world) => world.x));
    const spawnSide = group.spawnSide ?? (group.dir >= 0 ? "left" : "right");

    if (!group.hasEnteredArena) {
        const hasEnteredLeadingEdge =
            spawnSide === "left" ? maxWorldX >= -halfOutside : minWorldX <= canvasWidth + halfOutside;
        if (hasEnteredLeadingEdge) {
            group.hasEnteredArena = true;
        }
    }

    if (!group.hasFullyEnteredArena) {
        const hasEnteredTrailingEdge =
            spawnSide === "left" ? minWorldX >= -halfOutside : maxWorldX <= canvasWidth + halfOutside;
        if (hasEnteredTrailingEdge) {
            group.hasFullyEnteredArena = true;
        }
    }
};

export const applyBoundaryConstraints = (
    group: EnemyGroup,
    canvasWidth: number,
    canvasHeight: number
) => {
    const isCaterpillar = group.family === "caterpillar";
    const halfOutside = group.radius * HALF_OUTSIDE_RATIO;
    const minX = -halfOutside;
    const maxX = canvasWidth + halfOutside;
    const minY = -halfOutside;
    const maxY = canvasHeight + halfOutside;
    const spawnSide = group.spawnSide ?? (group.dir >= 0 ? "left" : "right");
    const skipMinXClamp = !group.hasFullyEnteredArena && spawnSide === "left";
    const skipMaxXClamp = !group.hasFullyEnteredArena && spawnSide === "right";
    let hitX = false;
    let hitY = false;

    const worldUnits = getWorldUnitPositions(group);
    for (const world of worldUnits) {
        if (world.x < minX && !skipMinXClamp) {
            group.x += minX - world.x;
            hitX = true;
            if (isCaterpillar) {
                group.vx *= 0.96;
            } else if (group.vx < 0) {
                group.vx = Math.abs(group.vx) * Math.max(group.restitution, 0.2);
                group.dir = 1;
            }
        } else if (world.x > maxX && !skipMaxXClamp) {
            group.x -= world.x - maxX;
            hitX = true;
            if (isCaterpillar) {
                group.vx *= 0.96;
            } else if (group.vx > 0) {
                group.vx = -Math.abs(group.vx) * Math.max(group.restitution, 0.2);
                group.dir = -1;
            }
        }

        if (world.y < minY) {
            group.y += minY - world.y;
            hitY = true;
            if (isCaterpillar) {
                group.vy *= 0.96;
            } else if (group.vy < 0) {
                group.vy = Math.abs(group.vy) * Math.max(group.restitution, 0.2);
            }
        } else if (world.y > maxY) {
            group.y -= world.y - maxY;
            hitY = true;
            if (isCaterpillar) {
                group.vy *= 0.96;
            } else if (group.vy > 0) {
                group.vy = -Math.abs(group.vy) * Math.max(group.restitution, 0.2);
            }
        }
    }

    return { hitX, hitY };
};

export const resolveGroupCollisions = (groups: EnemyGroup[], physicsPreset: PhysicsPreset) => {
    for (let i = 0; i < groups.length; i++) {
        const a = groups[i];
        if (!a.hasEnteredArena) continue;
        for (let j = i + 1; j < groups.length; j++) {
            const b = groups[j];
            if (!b.hasEnteredArena) continue;
            const aOffsets = getLocalOffsets(a);
            const bOffsets = getLocalOffsets(b);

            let normalX = 0;
            let normalY = 0;
            let contactCount = 0;

            for (let ai = 0; ai < aOffsets.length; ai++) {
                for (let bi = 0; bi < bOffsets.length; bi++) {
                    const ax = a.x + aOffsets[ai].x;
                    const ay = a.y + aOffsets[ai].y;
                    const bx = b.x + bOffsets[bi].x;
                    const by = b.y + bOffsets[bi].y;

                    let dx = bx - ax;
                    let dy = by - ay;
                    let dist = Math.hypot(dx, dy);
                    const minDist = (a.radius + b.radius) * physicsPreset.collisionRatio;
                    if (dist >= minDist) continue;

                    if (dist < 0.0001) {
                        const angle = Math.random() * Math.PI * 2;
                        dx = Math.cos(angle);
                        dy = Math.sin(angle);
                        dist = 1;
                    }

                    const nx = dx / dist;
                    const ny = dy / dist;
                    const overlap = minDist - dist;
                    const totalMass = Math.max(a.mass + b.mass, 0.0001);

                    a.x -= nx * overlap * (b.mass / totalMass);
                    a.y -= ny * overlap * (b.mass / totalMass);
                    b.x += nx * overlap * (a.mass / totalMass);
                    b.y += ny * overlap * (a.mass / totalMass);

                    normalX += nx * overlap;
                    normalY += ny * overlap;
                    contactCount++;
                }
            }

            if (!contactCount) continue;

            const normalLength = Math.hypot(normalX, normalY) || 1;
            const nx = normalX / normalLength;
            const ny = normalY / normalLength;

            const rvx = b.vx - a.vx;
            const rvy = b.vy - a.vy;
            const velAlongNormal = rvx * nx + rvy * ny;

            if (velAlongNormal < 0) {
                const restitution = (a.restitution + b.restitution) * 0.5;
                const impulseMag =
                    (-(1 + restitution) * velAlongNormal) / ((1 / a.mass) + (1 / b.mass));
                const impulseX = impulseMag * nx;
                const impulseY = impulseMag * ny;

                a.vx -= impulseX / a.mass;
                a.vy -= impulseY / a.mass;
                b.vx += impulseX / b.mass;
                b.vy += impulseY / b.mass;
            }

            const tx = -ny;
            const ty = nx;
            const velAlongTangent = rvx * tx + rvy * ty;
            const frictionMag = (-velAlongTangent * 0.06) / ((1 / a.mass) + (1 / b.mass));
            const frictionX = frictionMag * tx;
            const frictionY = frictionMag * ty;

            a.vx -= frictionX / a.mass;
            a.vy -= frictionY / a.mass;
            b.vx += frictionX / b.mass;
            b.vy += frictionY / b.mass;
        }
    }
};

export const handleUnitDestroyed = (
    enemyGroups: EnemyGroup[],
    groupIndex: number,
    unitIndex: number
) => {
    const group = enemyGroups[groupIndex];
    if (!group) return;

    const originalUnits = group.units.slice();
    const worldUnits = getWorldUnitPositions(group);
    const worldByUnitId = new Map<number, Point>();
    for (const world of worldUnits) {
        worldByUnitId.set(world.unit.id, { x: world.x, y: world.y });
    }

    const leftUnits = originalUnits.slice(0, unitIndex);
    const rightUnits = originalUnits.slice(unitIndex + 1);

    if (group.family === "caterpillar" && leftUnits.length > 0 && rightUnits.length > 0) {
        const leftCentroid = getCentroidFromWorldMap(leftUnits, worldByUnitId, {
            x: group.x - group.radius * 0.65,
            y: group.y
        });
        const rightCentroid = getCentroidFromWorldMap(rightUnits, worldByUnitId, {
            x: group.x + group.radius * 0.65,
            y: group.y
        });

        const baseVx = group.vx;
        const baseVy = group.vy;
        const basePhase = group.phase;

        group.units = leftUnits.slice();
        group.vx = baseVx - 0.35;
        group.vy = baseVy + (Math.random() - 0.5) * 0.2;
        group.phase = basePhase;
        group.spawnProgress = 1;
        reanchorGroupFromWorldMap(group, worldByUnitId, leftCentroid);
        recalcGroupMass(group);
        cancelFusionBonusIfSingle(group);

        const rightGroup: EnemyGroup = {
            ...group,
            id: Math.random(),
            vx: baseVx + 0.35,
            vy: baseVy + (Math.random() - 0.5) * 0.2,
            phase: basePhase,
            spawnProgress: 1,
            units: rightUnits.slice()
        };
        reanchorGroupFromWorldMap(rightGroup, worldByUnitId, rightCentroid);
        recalcGroupMass(rightGroup);
        cancelFusionBonusIfSingle(rightGroup);
        enemyGroups.push(rightGroup);
        return;
    }

    const survivors = [...leftUnits, ...rightUnits];
    if (!survivors.length) {
        enemyGroups.splice(groupIndex, 1);
        return;
    }

    const centroid = getCentroidFromWorldMap(survivors, worldByUnitId, { x: group.x, y: group.y });
    group.units = survivors;
    group.spawnProgress = 1;
    reanchorGroupFromWorldMap(group, worldByUnitId, centroid);
    recalcGroupMass(group);
    cancelFusionBonusIfSingle(group);
};

export const applyPerUnitImpactKnockback = (
    group: EnemyGroup,
    worldUnits: WorldUnitPosition[],
    hitUnitIndex: number,
    hitNx: number,
    hitNy: number,
    physicsPreset: PhysicsPreset
) => {
    const hitUnit = worldUnits[hitUnitIndex];
    if (!hitUnit) return;

    let centerX = 0;
    let centerY = 0;
    for (const world of worldUnits) {
        centerX += world.x;
        centerY += world.y;
    }
    centerX /= worldUnits.length;
    centerY /= worldUnits.length;

    const impulseMagnitude = physicsPreset.knockbackBase * 1.06;
    const impulseX = hitNx * impulseMagnitude;
    const impulseY = hitNy * impulseMagnitude;
    const invMass = 1 / Math.max(group.mass, group.unitMass, 0.0001);
    const deltaVx = impulseX * invMass;
    const deltaVy = impulseY * invMass;

    group.vx += deltaVx;
    group.vy += deltaVy;

    const unitMass = Math.max(group.unitMass, 0.0001);
    const unitDiskInertia = unitMass * group.radius * group.radius * 0.5;
    let inertia = 0;
    for (const world of worldUnits) {
        const dx = world.x - centerX;
        const dy = world.y - centerY;
        inertia += unitDiskInertia + unitMass * (dx * dx + dy * dy);
    }
    inertia = Math.max(inertia, unitDiskInertia);

    const rx = hitUnit.x - centerX;
    const ry = hitUnit.y - centerY;
    const torque = rx * impulseY - ry * impulseX;
    const angularImpulse = (torque / inertia) * 1.2;
    const maxAngular = group.family === "caterpillar" ? 0.095 : 0.11;
    group.angularVelocity = clamp(group.angularVelocity + angularImpulse, -maxAngular, maxAngular);

    const formation = getFormation(group);
    if (group.family === "caterpillar" && formation === "line") {
        group.heading += group.angularVelocity * 0.8;
    } else if (group.units.length > 1) {
        group.rotation += group.angularVelocity * 0.8;
        if (group.family === "caterpillar" && formation === "peanut") {
            const alignDelta = getAngleDelta(group.heading, group.rotation);
            group.heading += clamp(alignDelta, -0.08, 0.08);
        }
    }

    group.x += deltaVx * 2.4;
    group.y += deltaVy * 2.4;
};
