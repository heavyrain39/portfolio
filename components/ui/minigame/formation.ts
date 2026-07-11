import type { EnemyFormation, EnemyGroup, Point, WorldUnitPosition } from "./types";

const CATERPILLAR_CONTRACTION_RATIO = 0.18;
const CATERPILLAR_LATERAL_BASE_RATIO = 0.06;
const CATERPILLAR_LATERAL_TAIL_RATIO = 0.44;

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

    if (group.family === "caterpillar") {
        const points: Point[] = Array.from({ length: count }, () => ({ x: 0, y: 0 }));
        const ticksPerSegment = (spacing / Math.max(group.baseSpeed, 1)) * 0.55;

        for (let i = count - 2; i >= 0; i--) {
            const distFromHead = count - 1 - i;
            const tailRatio = distFromHead / (count - 1);
            const historyIndex = Math.min(
                group.headingHistory.length - 1,
                Math.max(0, Math.round(distFromHead * ticksPerSegment))
            );
            const historicalHeading = group.headingHistory[historyIndex] ?? group.heading;
            const bend = group.segmentBends[i] ?? 0;
            const segmentHeading = historicalHeading + bend;
            const musclePhase = group.phase * 3.5 - distFromHead * 0.55;
            const contraction =
                Math.cos(musclePhase) * group.radius * CATERPILLAR_CONTRACTION_RATIO * tailRatio;
            const segmentLength = spacing + contraction;
            const ahead = points[i + 1];
            const lateralOffset =
                Math.sin(musclePhase) *
                group.radius *
                (CATERPILLAR_LATERAL_BASE_RATIO + tailRatio * CATERPILLAR_LATERAL_TAIL_RATIO);

            points[i] = {
                x: ahead.x - Math.cos(segmentHeading) * segmentLength - Math.sin(segmentHeading) * lateralOffset,
                y: ahead.y - Math.sin(segmentHeading) * segmentLength + Math.cos(segmentHeading) * lateralOffset
            };
        }

        const head = points[count - 1];
        const expandedPoints = points.map((point) => ({
            x: head.x + (point.x - head.x) * progress,
            y: head.y + (point.y - head.y) * progress
        }));
        const centroid = expandedPoints.reduce(
            (sum, point) => ({ x: sum.x + point.x / count, y: sum.y + point.y / count }),
            { x: 0, y: 0 }
        );
        return expandedPoints.map((point) => ({
            x: point.x - centroid.x,
            y: point.y - centroid.y
        }));
    }

    const offsets: Point[] = [];
    for (let i = 0; i < count; i++) {
        const rawX = (start + i) * spacing;
        const x = headX + (rawX - headX) * progress;
        const wave = Math.sin(group.phase * 1.9 + i * 0.78) * group.radius * 0.3;
        const y = wave * (0.4 + 0.6 * progress);

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
