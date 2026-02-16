import type { Particle } from "./types";

export const createExplosion = (
    particles: Particle[],
    x: number,
    y: number,
    count: number,
    color: string,
    options?: {
        speedScale?: number;
        sizeScale?: number;
        lifeDecayScale?: number;
    }
) => {
    const speedScale = options?.speedScale ?? 1;
    const sizeScale = options?.sizeScale ?? 1;
    const lifeDecayScale = options?.lifeDecayScale ?? 1;

    for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = (Math.random() * 8 + 4) * 1.2 * speedScale;
        particles.push({
            id: Math.random(),
            x,
            y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: 1.0,
            lifeDecayScale,
            color,
            size: (Math.random() * 3 + 1) * sizeScale
        });
    }
};
