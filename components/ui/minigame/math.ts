export const clamp = (value: number, min: number, max: number) => {
    return Math.min(max, Math.max(min, value));
};

export const normalizeAngle = (angle: number) => {
    const TAU = Math.PI * 2;
    let value = angle % TAU;
    if (value < 0) value += TAU;
    return value;
};

export const getAngleDelta = (from: number, to: number) => {
    return Math.atan2(Math.sin(to - from), Math.cos(to - from));
};

export const getSegmentCircleHitTime = (
    startX: number,
    startY: number,
    endX: number,
    endY: number,
    centerX: number,
    centerY: number,
    radius: number
) => {
    const dx = endX - startX;
    const dy = endY - startY;
    const fx = startX - centerX;
    const fy = startY - centerY;
    const a = dx * dx + dy * dy;

    if (a <= 0.000001) {
        return fx * fx + fy * fy <= radius * radius ? 0 : null;
    }

    const b = 2 * (fx * dx + fy * dy);
    const c = fx * fx + fy * fy - radius * radius;
    if (c <= 0) return 0;
    const discriminant = b * b - 4 * a * c;
    if (discriminant < 0) return null;

    const sqrtDiscriminant = Math.sqrt(discriminant);
    const first = (-b - sqrtDiscriminant) / (2 * a);
    const second = (-b + sqrtDiscriminant) / (2 * a);
    if (first >= 0 && first <= 1) return first;
    if (second >= 0 && second <= 1) return second;
    return null;
};

export const mergeCircularIntervals = (intervals: Array<[number, number]>) => {
    const TAU = Math.PI * 2;
    if (!intervals.length) return [];

    const expanded: Array<[number, number]> = [];
    for (const [rawStart, rawEnd] of intervals) {
        const start = normalizeAngle(rawStart);
        const end = normalizeAngle(rawEnd);
        if (start <= end) {
            expanded.push([start, end]);
        } else {
            expanded.push([0, end]);
            expanded.push([start, TAU]);
        }
    }

    expanded.sort((a, b) => a[0] - b[0]);

    const merged: Array<[number, number]> = [];
    for (const [start, end] of expanded) {
        if (!merged.length || start > merged[merged.length - 1][1]) {
            merged.push([start, end]);
            continue;
        }
        merged[merged.length - 1][1] = Math.max(merged[merged.length - 1][1], end);
    }

    return merged;
};
