import { clamp, mergeCircularIntervals } from "./math";
import type {
    EnemyFormation,
    FusionBridgeShape,
    Point,
    WorldUnitPosition
} from "./types";

export const drawDashedRingWithCutouts = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    radius: number,
    phase: number,
    cutouts: Array<[number, number]>,
    strokeStyle: string
) => {
    const TAU = Math.PI * 2;

    ctx.save();
    ctx.setLineDash([5, 5]);
    ctx.lineDashOffset = -phase * radius * 0.45;
    ctx.lineWidth = 1;
    ctx.strokeStyle = strokeStyle;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    const blocked = mergeCircularIntervals(cutouts);
    if (!blocked.length) {
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, TAU);
        ctx.stroke();
        ctx.restore();
        return;
    }

    const minVisibleArc = 0.03;
    let cursor = 0;
    for (const [start, end] of blocked) {
        if (start - cursor > minVisibleArc) {
            ctx.beginPath();
            ctx.arc(x, y, radius, cursor, start);
            ctx.stroke();
        }
        cursor = Math.max(cursor, end);
    }
    if (TAU - cursor > minVisibleArc) {
        ctx.beginPath();
        ctx.arc(x, y, radius, cursor, TAU);
        ctx.stroke();
    }

    ctx.restore();
};

export const getFusionBridgeShape = (
    a: Point,
    b: Point,
    radius: number,
    formation: EnemyFormation
): FusionBridgeShape | null => {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const dist = Math.hypot(dx, dy);
    const diameter = radius * 2;
    if (dist <= 0.0001 || dist >= diameter * 0.99) return null;

    const nx = dx / dist;
    const ny = dy / dist;
    const tx = -ny;
    const ty = nx;
    const baseHalfAngle = Math.acos(clamp(dist / diameter, -1, 1));
    const overlapRatio = clamp((diameter - dist) / diameter, 0, 1);
    const paddingBase = formation === "triangle" ? 0.35 : 0.45;
    const anglePadding = paddingBase + overlapRatio * 0.2;
    const theta = clamp(baseHalfAngle + anglePadding, 0.2, Math.PI * 0.48);

    const radial = radius * Math.cos(theta);
    const lateral = radius * Math.sin(theta);

    const topA = {
        x: a.x + nx * radial + tx * lateral,
        y: a.y + ny * radial + ty * lateral
    };
    const bottomA = {
        x: a.x + nx * radial - tx * lateral,
        y: a.y + ny * radial - ty * lateral
    };
    const topB = {
        x: b.x - nx * radial + tx * lateral,
        y: b.y - ny * radial + ty * lateral
    };
    const bottomB = {
        x: b.x - nx * radial - tx * lateral,
        y: b.y - ny * radial - ty * lateral
    };

    const midTop = { x: (topA.x + topB.x) * 0.5, y: (topA.y + topB.y) * 0.5 };
    const midBottom = { x: (bottomA.x + bottomB.x) * 0.5, y: (bottomA.y + bottomB.y) * 0.5 };
    const pinchScale = formation === "triangle" ? 0.9 : 1;
    const inwardPull = radius * (0.07 + (1 - overlapRatio) * 0.24) * pinchScale;

    const controlTop = {
        x: midTop.x - tx * inwardPull,
        y: midTop.y - ty * inwardPull
    };
    const controlBottom = {
        x: midBottom.x + tx * inwardPull,
        y: midBottom.y + ty * inwardPull
    };

    return {
        topA,
        bottomA,
        topB,
        bottomB,
        controlTop,
        controlBottom,
        centerAngle: Math.atan2(ny, nx),
        cutoutHalfAngle: theta + 0.05
    };
};

export const drawDashedFusionBridge = (
    ctx: CanvasRenderingContext2D,
    a: Point,
    b: Point,
    radius: number,
    phase: number,
    strokeStyle: string,
    formation: EnemyFormation,
    triangleCenter?: Point
) => {
    const bridge = getFusionBridgeShape(a, b, radius, formation);
    if (!bridge) return;

    ctx.save();
    ctx.setLineDash([5, 5]);
    ctx.lineDashOffset = -phase * radius * 0.45;
    ctx.lineWidth = 1;
    ctx.strokeStyle = strokeStyle;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    const drawTopCurve = () => {
        ctx.beginPath();
        ctx.moveTo(bridge.topA.x, bridge.topA.y);
        ctx.quadraticCurveTo(bridge.controlTop.x, bridge.controlTop.y, bridge.topB.x, bridge.topB.y);
        ctx.stroke();
    };

    const drawBottomCurve = () => {
        ctx.beginPath();
        ctx.moveTo(bridge.bottomA.x, bridge.bottomA.y);
        ctx.quadraticCurveTo(
            bridge.controlBottom.x,
            bridge.controlBottom.y,
            bridge.bottomB.x,
            bridge.bottomB.y
        );
        ctx.stroke();
    };

    if (formation === "triangle" && triangleCenter) {
        // For triangle squads, render only the outer bridge edge to avoid center clutter.
        const topMid = {
            x: (bridge.topA.x + bridge.topB.x + bridge.controlTop.x * 2) * 0.25,
            y: (bridge.topA.y + bridge.topB.y + bridge.controlTop.y * 2) * 0.25
        };
        const bottomMid = {
            x: (bridge.bottomA.x + bridge.bottomB.x + bridge.controlBottom.x * 2) * 0.25,
            y: (bridge.bottomA.y + bridge.bottomB.y + bridge.controlBottom.y * 2) * 0.25
        };
        const topDist = Math.hypot(topMid.x - triangleCenter.x, topMid.y - triangleCenter.y);
        const bottomDist = Math.hypot(bottomMid.x - triangleCenter.x, bottomMid.y - triangleCenter.y);

        if (topDist >= bottomDist) {
            drawTopCurve();
        } else {
            drawBottomCurve();
        }
        ctx.restore();
        return;
    }

    drawTopCurve();
    drawBottomCurve();

    ctx.restore();
};

export const getFusionCutoutsForUnit = (
    worldUnits: WorldUnitPosition[],
    unitIndex: number,
    connections: Array<[number, number]>,
    radius: number,
    formation: EnemyFormation
) => {
    const self = worldUnits[unitIndex];
    if (!self) return [];

    const cutouts: Array<[number, number]> = [];

    for (const [aIndex, bIndex] of connections) {
        const otherIndex = aIndex === unitIndex ? bIndex : bIndex === unitIndex ? aIndex : -1;
        if (otherIndex < 0) continue;

        const other = worldUnits[otherIndex];
        if (!other) continue;

        const bridge = getFusionBridgeShape(
            { x: self.x, y: self.y },
            { x: other.x, y: other.y },
            radius,
            formation
        );
        if (!bridge) continue;

        cutouts.push([
            bridge.centerAngle - bridge.cutoutHalfAngle,
            bridge.centerAngle + bridge.cutoutHalfAngle
        ]);
    }

    return cutouts;
};
