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
