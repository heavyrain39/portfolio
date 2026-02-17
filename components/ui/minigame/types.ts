export interface Point {
    x: number;
    y: number;
}

export interface Bullet {
    id: number;
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
}

export interface EnemyUnit {
    id: number;
    baseHp: number;
    hp: number;
    fusionBonusRemaining: number;
    squareSpinDir: 1 | -1;
    spinPhaseOffset: number;
}

export type EnemyFamily = "normal" | "cluster" | "caterpillar";
export type EnemyFormation = "single" | "peanut" | "triangle" | "line";
export type FireMode = "dual" | "quad";

export interface EnemyGroup {
    id: number;
    family: EnemyFamily;
    x: number;
    y: number;
    vx: number;
    vy: number;
    dir: 1 | -1;
    radius: number;
    unitMass: number;
    mass: number;
    baseSpeed: number;
    maxSpeed: number;
    driftAmp: number;
    driftFreq: number;
    steer: number;
    damping: number;
    restitution: number;
    phase: number;
    rotation: number;
    rotationSpeed: number;
    angularVelocity: number;
    angularDamping: number;
    heading: number;
    turnTargetHeading: number | null;
    turnAngularSpeed: number;
    turnCooldown: number;
    spawnProgress: number;
    units: EnemyUnit[];
    isSpeedster: boolean;
    spawnSide: "left" | "right";
    hasEnteredArena: boolean;
    hasFullyEnteredArena: boolean;
}

export interface WorldUnitPosition {
    x: number;
    y: number;
    unit: EnemyUnit;
    index: number;
}

export interface FusionBridgeShape {
    topA: Point;
    bottomA: Point;
    topB: Point;
    bottomB: Point;
    controlTop: Point;
    controlBottom: Point;
    centerAngle: number;
    cutoutHalfAngle: number;
}

export interface Particle {
    id: number;
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
    lifeDecayScale: number;
    color: string;
    size: number;
}

export interface FloatingText {
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
    text: string;
}

export interface HitFlash {
    x: number;
    y: number;
    life: number;
    radius: number;
}

export type PhysicsPreset = {
    collisionRatio: number;
    restitutionMin: number;
    restitutionMax: number;
    knockbackBase: number;
};
