import type { EnemyFormation, EnemyGroup, Point, WorldUnitPosition } from "./types";

export const rotatePoint = (p: Point, angle: number): Point => {
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    return {
        x: p.x * c - p.y * s,
        y: p.x * s + p.y * c
    };
};

export const getFormation = (group: EnemyGroup): EnemyFormation => {
    const count = group.units.length;
    if (count <= 1) return "single";

    if (group.family === "cluster") {
        if (count === 2) return "peanut";
        return "triangle";
    }

    if (group.family === "caterpillar") {
        if (count === 2) return "peanut";
        return "line";
    }

    if (count === 2) return "peanut";
    return "line";
};

export const getConnections = (group: EnemyGroup, formation: EnemyFormation): Array<[number, number]> => {
    const count = group.units.length;
    if (count <= 1) return [];

    if (formation === "peanut" && count >= 2) return [[0, 1]];
    if (formation === "triangle" && count >= 3) return [[0, 1], [1, 2], [2, 0]];

    if (formation === "line") {
        const edges: Array<[number, number]> = [];
        for (let i = 0; i < count - 1; i++) {
            edges.push([i, i + 1]);
        }
        return edges;
    }

    return [];
};

export const getLocalOffsets = (
    group: EnemyGroup,
    formation: EnemyFormation = getFormation(group)
): Point[] => {
    const count = group.units.length;
    if (count <= 1 || formation === "single") {
        return [{ x: 0, y: 0 }];
    }

    if (formation === "peanut") {
        const spacing = group.radius * 1.7;
        const base = [
            { x: -spacing * 0.5, y: 0 },
            { x: spacing * 0.5, y: 0 }
        ];
        return base.map((p) => rotatePoint(p, group.rotation));
    }

    if (formation === "triangle") {
        const side = group.radius * 1.74;
        const height = side * 0.8660254;
        const base = [
            { x: -side * 0.5, y: height / 3 },
            { x: side * 0.5, y: height / 3 },
            { x: 0, y: -2 * height / 3 }
        ];
        return base.map((p) => rotatePoint(p, group.rotation));
    }

    const spacing = group.radius * 1.66;
    const start = -(count - 1) * 0.5;
    const progress = group.family === "caterpillar" ? group.spawnProgress : 1;
    const headIndex = group.family === "caterpillar" ? count - 1 : group.dir > 0 ? count - 1 : 0;
    const headX = (start + headIndex) * spacing;
    const offsets: Point[] = [];
    for (let i = 0; i < count; i++) {
        const rawX = (start + i) * spacing;
        let x: number;
        let y: number;

        if (group.family === "caterpillar") {
            const distFromHead = count - 1 - i;
            const tailRatio = count > 1 ? distFromHead / (count - 1) : 0;
            const spinePhase = group.phase * 3.5 - distFromHead * 0.45;
            const spineSignal = Math.sin(spinePhase);
            const pendingTurnDelta =
                group.turnTargetHeading !== null
                    ? Math.atan2(
                          Math.sin(group.turnTargetHeading - group.heading),
                          Math.cos(group.turnTargetHeading - group.heading)
                      )
                    : 0;
            const turnSign = pendingTurnDelta !== 0 ? Math.sign(pendingTurnDelta) : Math.sign(group.angularVelocity);
            const turnStrength = Math.min(
                1,
                Math.abs(pendingTurnDelta) / (Math.PI * 0.65) + Math.abs(group.angularVelocity) * 6
            );
            const bendLag = Math.pow(tailRatio, 1.2);

            // Keep head stable and progressively increase sway toward the tail.
            const ampCurve = 0.12 + tailRatio * 0.48;
            const lateralOffset = spineSignal * group.radius * ampCurve;
            const muscleContraction = Math.cos(spinePhase) * group.radius * 0.3 * tailRatio;
            const turnBend = -turnSign * group.radius * 0.75 * turnStrength * bendLag;
            const turnLagX = group.radius * 0.07 * turnStrength * bendLag;

            x =
                headX +
                (rawX - headX) * progress +
                muscleContraction * (0.45 + 0.55 * progress) -
                turnLagX * (0.4 + 0.6 * progress);
            y = (lateralOffset + turnBend) * (0.5 + 0.5 * progress);
        } else {
            const baseX = headX + (rawX - headX) * progress;
            const wave = Math.sin(group.phase * 1.9 + i * 0.78) * group.radius * 0.3;
            x = baseX;
            y = wave * (0.4 + 0.6 * progress);
        }

        offsets.push(rotatePoint({ x, y }, group.heading));
    }
    return offsets;
};

export const getWorldUnitPositions = (group: EnemyGroup): WorldUnitPosition[] => {
    const formation = getFormation(group);
    const offsets = getLocalOffsets(group, formation);
    return group.units.map((unit, index) => ({
        x: group.x + offsets[index].x,
        y: group.y + offsets[index].y,
        unit,
        index
    }));
};
