"use client";

import React, { useRef, useEffect, useState } from "react";
import { motion, useSpring, useMotionValue } from "framer-motion";
import OperatorComments from "./OperatorComments";

interface Point {
    x: number;
    y: number;
}

interface Bullet {
    id: number;
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
}

interface EnemyUnit {
    id: number;
    baseHp: number;
    hp: number;
    fusionBonusRemaining: number;
    squareSpinDir: 1 | -1;
    spinPhaseOffset: number;
}

type EnemyFamily = "normal" | "cluster" | "caterpillar";
type EnemyFormation = "single" | "peanut" | "triangle" | "line";

interface EnemyGroup {
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

interface WorldUnitPosition {
    x: number;
    y: number;
    unit: EnemyUnit;
    index: number;
}

interface FusionBridgeShape {
    topA: Point;
    bottomA: Point;
    topB: Point;
    bottomB: Point;
    controlTop: Point;
    controlBottom: Point;
    centerAngle: number;
    cutoutHalfAngle: number;
}

interface Particle {
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

interface FloatingText {
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
    text: string;
}

interface HitFlash {
    x: number;
    y: number;
    life: number;
    radius: number;
}

type PhysicsPreset = {
    collisionRatio: number;
    restitutionMin: number;
    restitutionMax: number;
    knockbackBase: number;
};

export default function MiniGame() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const requestRef = useRef<number | null>(null);
    const scoreRef = useRef(0);
    const audioCtxRef = useRef<AudioContext | null>(null);

    const bullets = useRef<Bullet[]>([]);
    const enemyGroups = useRef<EnemyGroup[]>([]);
    const particles = useRef<Particle[]>([]);
    const floatingTexts = useRef<FloatingText[]>([]);
    const hitFlashes = useRef<HitFlash[]>([]);
    const mousePos = useRef<Point>({ x: 0, y: 0 });
    const isMouseDown = useRef(false);
    const lastShotTime = useRef(0);
    const burstShotCount = useRef(0);
    const frameCount = useRef(0);
    const shakeIntensity = useRef(0);
    const cachedIsDark = useRef(false);

    const [uiScore, setUiScore] = useState(0);
    const [isShooting, setIsShooting] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [operatorThemeColor, setOperatorThemeColor] = useState("#f5f5f0");
    const [operatorContrastColor, setOperatorContrastColor] = useState("#1a1a1a");
    const isMutedRef = useRef(false);

    useEffect(() => {
        isMutedRef.current = isMuted;
    }, [isMuted]);

    const rawMouseX = useMotionValue(0);
    const rawMouseY = useMotionValue(0);
    const smoothMouseX = useSpring(rawMouseX, { stiffness: 500, damping: 30 });
    const smoothMouseY = useSpring(rawMouseY, { stiffness: 500, damping: 30 });

    const GRAVITY = 0.2;
    const MAX_MAP_UNITS = 12;
    const SPAWN_INTERVAL_BASE = 35;
    const SPAWN_INTERVAL_MID = 33;
    const SPAWN_INTERVAL_HIGH = 31;
    const SPAWN_SCORE_MID = 50;
    const SPAWN_SCORE_HIGH = 150;
    const FUSION_BONUS_HP = 2;
    const CONNECTED_SPAWN_CHANCE = 0.03;
    const CATERPILLAR_SPAWN_CHANCE = 0.03;
    const SPEEDSTER_CHANCE = 0.08;
    const HALF_OUTSIDE_RATIO = 0.5;

    const PHYSICS_PRESETS: Record<"subtle" | "balanced" | "punchy", PhysicsPreset> = {
        subtle: {
            collisionRatio: 0.78,
            restitutionMin: 0.14,
            restitutionMax: 0.24,
            knockbackBase: 1.9
        },
        balanced: {
            collisionRatio: 0.82,
            restitutionMin: 0.22,
            restitutionMax: 0.37,
            knockbackBase: 2.5
        },
        punchy: {
            collisionRatio: 0.88,
            restitutionMin: 0.34,
            restitutionMax: 0.52,
            knockbackBase: 3.2
        }
    };
    const ACTIVE_PHYSICS_PRESET: keyof typeof PHYSICS_PRESETS = "balanced";
    const physicsPreset = PHYSICS_PRESETS[ACTIVE_PHYSICS_PRESET];
    const SFX_MIX_LEVEL = 0.7;
    const SFX_REFERENCE_LEVEL = 0.7;
    const sfxLevelScale = SFX_MIX_LEVEL / SFX_REFERENCE_LEVEL;

    const getAudioContext = (): AudioContext => {
        if (!audioCtxRef.current) {
            audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        if (audioCtxRef.current.state === "suspended") {
            audioCtxRef.current.resume();
        }
        return audioCtxRef.current;
    };

    const playSound = (type: "shoot" | "hit") => {
        if (isMutedRef.current) return;

        const ctx = getAudioContext();
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();

        osc.connect(gainNode);
        gainNode.connect(ctx.destination);

        const now = ctx.currentTime;

        if (type === "shoot") {
            osc.type = "triangle";
            const baseFreq = 800 + (Math.random() - 0.5) * 120;
            osc.frequency.setValueAtTime(baseFreq, now);
            osc.frequency.exponentialRampToValueAtTime(300, now + 0.1);

            gainNode.gain.setValueAtTime(0.05 * sfxLevelScale, now);
            gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

            osc.start(now);
            osc.stop(now + 0.1);
        } else {
            osc.type = "sawtooth";
            const hitPitchScale = 1 + (Math.random() - 0.5) * 0.34; // ~+-17%
            const hitStartFreq = Math.max(60, 150 * hitPitchScale);
            const hitEndFreq = Math.max(24, 50 * hitPitchScale * (0.92 + Math.random() * 0.16));
            osc.frequency.setValueAtTime(hitStartFreq, now);
            osc.frequency.exponentialRampToValueAtTime(hitEndFreq, now + 0.15);

            gainNode.gain.setValueAtTime(0.08 * sfxLevelScale, now);
            gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

            osc.start(now);
            osc.stop(now + 0.15);
        }
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const syncThemeState = () => {
            const isDarkTheme = document.documentElement.getAttribute("data-theme") === "dark";
            cachedIsDark.current = isDarkTheme;

            const styles = getComputedStyle(document.documentElement);
            const background = styles.getPropertyValue("--background").trim();
            const foreground = styles.getPropertyValue("--foreground").trim();

            setOperatorThemeColor(background || (isDarkTheme ? "#1a1a1a" : "#f5f5f0"));
            setOperatorContrastColor(foreground || (isDarkTheme ? "#f5f5f0" : "#1a1a1a"));
        };

        syncThemeState();

        const themeObserver = new MutationObserver(() => {
            syncThemeState();
        });
        themeObserver.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ["data-theme"]
        });

        const handleResize = () => {
            canvas.width = container.offsetWidth;
            canvas.height = container.offsetHeight;
        };
        handleResize();
        window.addEventListener("resize", handleResize);

        const handleMouseMove = (e: MouseEvent) => {
            const rect = container.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            mousePos.current = { x, y };
            rawMouseX.set(x);
            rawMouseY.set(y);
            setIsHovered(true);
        };

        const handleMouseDown = (e: MouseEvent) => {
            e.preventDefault();
            isMouseDown.current = true;
            setIsShooting(true);
            lastShotTime.current = 0;
            burstShotCount.current = 0;
            getAudioContext();
        };

        const handleMouseUp = () => {
            isMouseDown.current = false;
            setIsShooting(false);
            burstShotCount.current = 0;
        };

        const handleMouseLeave = () => {
            setIsHovered(false);
        };

        const handleMouseEnter = () => {
            setIsHovered(true);
        };

        const handleContextMenu = (e: Event) => {
            e.preventDefault();
        };

        container.addEventListener("mousemove", handleMouseMove);
        container.addEventListener("mousedown", handleMouseDown);
        window.addEventListener("mouseup", handleMouseUp);
        container.addEventListener("mouseleave", handleMouseLeave);
        container.addEventListener("mouseenter", handleMouseEnter);
        container.addEventListener("contextmenu", handleContextMenu);

        const countAliveUnits = () => {
            return enemyGroups.current.reduce((total, group) => total + group.units.length, 0);
        };

        const rollBaseHp = () => {
            const r = Math.random();
            if (r < 0.1) return 3;
            if (r > 0.9) return 5;
            return 4;
        };

        const createUnit = (isFusedSpawn: boolean): EnemyUnit => {
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

        const getSpawnIntervalFrames = () => {
            if (scoreRef.current > SPAWN_SCORE_HIGH) return SPAWN_INTERVAL_HIGH;
            if (scoreRef.current > SPAWN_SCORE_MID) return SPAWN_INTERVAL_MID;
            return SPAWN_INTERVAL_BASE;
        };

        const rotatePoint = (p: Point, angle: number): Point => {
            const c = Math.cos(angle);
            const s = Math.sin(angle);
            return {
                x: p.x * c - p.y * s,
                y: p.x * s + p.y * c
            };
        };

        const getFormation = (group: EnemyGroup): EnemyFormation => {
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

        const getConnections = (group: EnemyGroup, formation: EnemyFormation): Array<[number, number]> => {
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

        const getLocalOffsets = (
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
                    const turnSign =
                        pendingTurnDelta !== 0 ? Math.sign(pendingTurnDelta) : Math.sign(group.angularVelocity);
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

        const getWorldUnitPositions = (group: EnemyGroup): WorldUnitPosition[] => {
            const formation = getFormation(group);
            const offsets = getLocalOffsets(group, formation);
            return group.units.map((unit, index) => ({
                x: group.x + offsets[index].x,
                y: group.y + offsets[index].y,
                unit,
                index
            }));
        };

        const recalcGroupMass = (group: EnemyGroup) => {
            group.mass = Math.max(group.unitMass, group.unitMass * group.units.length);
        };

        const cancelFusionBonusIfSingle = (group: EnemyGroup) => {
            if (group.units.length !== 1) return;
            const only = group.units[0];
            if (only.fusionBonusRemaining <= 0) return;

            only.hp = Math.max(1, only.hp - only.fusionBonusRemaining);
            only.fusionBonusRemaining = 0;
        };

        const getCentroidFromWorldMap = (
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

        const reanchorGroupFromWorldMap = (
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

        const createExplosion = (
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
                particles.current.push({
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

        const spawnEnemyGroup = () => {
            const aliveUnits = countAliveUnits();
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
            const startX =
                side === "left"
                    ? -spawnInset - maxOffsetX
                    : canvas.width + spawnInset - minOffsetX;

            let startY = Math.random() * (canvas.height * 0.5) + canvas.height * 0.1;
            let spawnOk = false;

            for (let attempt = 0; attempt < 14; attempt++) {
                startY = Math.random() * (canvas.height * 0.55) + canvas.height * 0.08;
                group.x = startX;
                group.y = startY;

                const progressSnapshot = group.spawnProgress;
                group.spawnProgress = 1;
                const candidateUnits = getWorldUnitPositions(group);
                group.spawnProgress = progressSnapshot;
                const hasOverlap = enemyGroups.current.some((existing) => {
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
            enemyGroups.current.push(group);
        };

        const updateArenaEntryState = (group: EnemyGroup) => {
            const halfOutside = group.radius * HALF_OUTSIDE_RATIO;
            const worldUnits = getWorldUnitPositions(group);
            const minWorldX = Math.min(...worldUnits.map((world) => world.x));
            const maxWorldX = Math.max(...worldUnits.map((world) => world.x));
            const spawnSide = group.spawnSide ?? (group.dir >= 0 ? "left" : "right");

            if (!group.hasEnteredArena) {
                const hasEnteredLeadingEdge =
                    spawnSide === "left"
                        ? maxWorldX >= -halfOutside
                        : minWorldX <= canvas.width + halfOutside;
                if (hasEnteredLeadingEdge) {
                    group.hasEnteredArena = true;
                }
            }

            if (!group.hasFullyEnteredArena) {
                const hasEnteredTrailingEdge =
                    spawnSide === "left"
                        ? minWorldX >= -halfOutside
                        : maxWorldX <= canvas.width + halfOutside;
                if (hasEnteredTrailingEdge) {
                    group.hasFullyEnteredArena = true;
                }
            }
        };

        const applyBoundaryConstraints = (group: EnemyGroup) => {
            const isCaterpillar = group.family === "caterpillar";
            const halfOutside = group.radius * HALF_OUTSIDE_RATIO;
            const minX = -halfOutside;
            const maxX = canvas.width + halfOutside;
            const minY = -halfOutside;
            const maxY = canvas.height + halfOutside;
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

        const resolveGroupCollisions = () => {
            const groups = enemyGroups.current;

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

        const handleUnitDestroyed = (groupIndex: number, unitIndex: number) => {
            const group = enemyGroups.current[groupIndex];
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
                enemyGroups.current.push(rightGroup);
                return;
            }

            const survivors = [...leftUnits, ...rightUnits];
            if (!survivors.length) {
                enemyGroups.current.splice(groupIndex, 1);
                return;
            }

            const centroid = getCentroidFromWorldMap(survivors, worldByUnitId, { x: group.x, y: group.y });
            group.units = survivors;
            group.spawnProgress = 1;
            reanchorGroupFromWorldMap(group, worldByUnitId, centroid);
            recalcGroupMass(group);
            cancelFusionBonusIfSingle(group);
        };

        const clamp = (value: number, min: number, max: number) => {
            return Math.min(max, Math.max(min, value));
        };

        const normalizeAngle = (angle: number) => {
            const TAU = Math.PI * 2;
            let value = angle % TAU;
            if (value < 0) value += TAU;
            return value;
        };

        const getAngleDelta = (from: number, to: number) => {
            return Math.atan2(Math.sin(to - from), Math.cos(to - from));
        };

        const mergeCircularIntervals = (intervals: Array<[number, number]>) => {
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

        const drawDashedRingWithCutouts = (
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

        const getFusionBridgeShape = (
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

        const drawDashedFusionBridge = (
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
                ctx.quadraticCurveTo(
                    bridge.controlTop.x,
                    bridge.controlTop.y,
                    bridge.topB.x,
                    bridge.topB.y
                );
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

        const getFusionCutoutsForUnit = (
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

        const applyPerUnitImpactKnockback = (
            group: EnemyGroup,
            worldUnits: WorldUnitPosition[],
            hitUnitIndex: number,
            hitNx: number,
            hitNy: number
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
            group.angularVelocity = clamp(
                group.angularVelocity + angularImpulse,
                -maxAngular,
                maxAngular
            );

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

        const animate = (time: number) => {
            const shakeX =
                shakeIntensity.current > 0 ? (Math.random() - 0.5) * shakeIntensity.current * 2 : 0;
            const shakeY =
                shakeIntensity.current > 0 ? (Math.random() - 0.5) * shakeIntensity.current * 2 : 0;
            shakeIntensity.current *= 0.85;
            if (shakeIntensity.current < 0.3) shakeIntensity.current = 0;

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.save();
            ctx.translate(shakeX, shakeY);

            frameCount.current++;
            const spawnInterval = getSpawnIntervalFrames();
            if (frameCount.current % spawnInterval === 0) {
                spawnEnemyGroup();
            }

            if (isMouseDown.current && time - lastShotTime.current > 40) {
                const originSide = Math.random() > 0.5 ? "left" : "right";
                const startX = originSide === "left" ? canvas.width * 0.2 : canvas.width * 0.8;
                const startY = canvas.height;
                const dx = mousePos.current.x - startX;
                const dy = mousePos.current.y - startY;
                const angle = Math.atan2(dy, dx);
                const spread = burstShotCount.current === 0 ? 0 : (Math.random() - 0.5) * 0.12;

                bullets.current.push({
                    id: Math.random(),
                    x: startX,
                    y: startY,
                    vx: Math.cos(angle + spread) * 45,
                    vy: Math.sin(angle + spread) * 45,
                    life: 1.0
                });

                burstShotCount.current++;
                playSound("shoot");
                lastShotTime.current = time;
            }

            for (let i = bullets.current.length - 1; i >= 0; i--) {
                const bullet = bullets.current[i];
                bullet.x += bullet.vx;
                bullet.y += bullet.vy;

                if (bullet.x < 0 || bullet.x > canvas.width || bullet.y < 0 || bullet.y > canvas.height) {
                    bullets.current.splice(i, 1);
                    continue;
                }

                ctx.beginPath();
                ctx.moveTo(bullet.x - bullet.vx * 0.5, bullet.y - bullet.vy * 0.5);
                ctx.lineTo(bullet.x, bullet.y);
                ctx.strokeStyle = "#06b6d4";
                ctx.lineWidth = 2;
                ctx.stroke();

                let didHit = false;

                for (let groupIndex = enemyGroups.current.length - 1; groupIndex >= 0; groupIndex--) {
                    const group = enemyGroups.current[groupIndex];
                    const worldUnits = getWorldUnitPositions(group);

                    for (let unitCursor = worldUnits.length - 1; unitCursor >= 0; unitCursor--) {
                        const worldUnit = worldUnits[unitCursor];
                        const dist = Math.hypot(bullet.x - worldUnit.x, bullet.y - worldUnit.y);
                        if (dist >= group.radius + 7) continue;

                        bullets.current.splice(i, 1);
                        didHit = true;

                        const unit = worldUnit.unit;
                        unit.hp--;
                        if (unit.fusionBonusRemaining > 0) {
                            unit.fusionBonusRemaining--;
                        }
                        unit.squareSpinDir *= -1;

                        const bulletSpeed = Math.hypot(bullet.vx, bullet.vy) || 1;
                        const hitNx = bullet.vx / bulletSpeed;
                        const hitNy = bullet.vy / bulletSpeed;
                        const isNonLethalFusionHit = group.units.length > 1 && unit.hp > 0;
                        if (isNonLethalFusionHit) {
                            applyPerUnitImpactKnockback(group, worldUnits, worldUnit.index, hitNx, hitNy);
                        } else {
                            const knockback = physicsPreset.knockbackBase / Math.max(group.mass, 1);
                            group.vx += hitNx * knockback;
                            group.vy += hitNy * knockback;
                            group.x += hitNx * 6;
                            group.y += hitNy * 6;
                        }

                        createExplosion(bullet.x, bullet.y, 4, "#06b6d4", {
                            speedScale: 0.7,
                            sizeScale: 0.55,
                            lifeDecayScale: 2.2
                        });
                        hitFlashes.current.push({ x: bullet.x, y: bullet.y, life: 1.0, radius: 5 });

                        if (unit.hp <= 0) {
                            createExplosion(worldUnit.x, worldUnit.y, 20, "#06b6d4", {
                                speedScale: 0.8,
                                lifeDecayScale: 1.1
                            });
                            playSound("hit");
                            shakeIntensity.current = 3;
                            hitFlashes.current.push({
                                x: worldUnit.x,
                                y: worldUnit.y,
                                life: 1.0,
                                radius: group.radius * 0.8
                            });

                            const dir = Math.random() > 0.5 ? 1 : -1;
                            floatingTexts.current.push({
                                x: worldUnit.x,
                                y: worldUnit.y,
                                vx: dir * (Math.random() * 0.5 + 0.5),
                                vy: -1.5,
                                life: 1.0,
                                text: "+1"
                            });

                            scoreRef.current++;
                            setUiScore(scoreRef.current);

                            handleUnitDestroyed(groupIndex, worldUnit.index);
                        }

                        break;
                    }

                    if (didHit) break;
                }
            }

            const isDark = cachedIsDark.current;
            const targetBorder = isDark ? "rgba(255, 255, 255, 0.6)" : "rgba(0, 0, 0, 0.6)";
            const targetCenter = isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)";

            for (let i = 0; i < enemyGroups.current.length; i++) {
                const group = enemyGroups.current[i];
                const formation = getFormation(group);
                group.phase += group.driftFreq;
                group.turnCooldown = Math.max(0, group.turnCooldown - 1);
                group.angularVelocity *= group.angularDamping;
                if (Math.abs(group.angularVelocity) < 0.00002) {
                    group.angularVelocity = 0;
                }
                if (group.units.length > 1 && formation !== "line") {
                    // Keep idle spin active, but let hit impulse torque dominate short-term motion.
                    group.angularVelocity += (group.rotationSpeed - group.angularVelocity) * 0.045;
                    group.rotation += group.angularVelocity;
                    if (group.family === "caterpillar" && formation === "peanut") {
                        const alignDelta = getAngleDelta(group.heading, group.rotation);
                        group.heading += clamp(alignDelta, -0.02, 0.02);
                    }
                } else if (group.family === "caterpillar" && formation === "line" && group.angularVelocity !== 0) {
                    group.heading += group.angularVelocity;
                }

                if (group.family === "caterpillar") {
                    const weaveNudge = Math.sin(group.phase * 0.9 + group.id * 5.2) * 0.01;
                    if (group.turnTargetHeading !== null) {
                        const delta = getAngleDelta(group.heading, group.turnTargetHeading);
                        const step = clamp(delta, -group.turnAngularSpeed, group.turnAngularSpeed);
                        group.heading += step + weaveNudge * 0.25;
                        if (Math.abs(delta) < 0.05) {
                            group.heading = group.turnTargetHeading;
                            group.turnTargetHeading = null;
                        }
                    } else {
                        group.heading += weaveNudge;
                    }

                    const desiredVx = Math.cos(group.heading) * group.baseSpeed;
                    const desiredVy =
                        Math.sin(group.heading) * group.baseSpeed * 0.9 +
                        Math.sin(group.phase * 1.25 + group.id * 3.1) * 0.16;

                    group.vx += (desiredVx - group.vx) * 0.09;
                    group.vy += (desiredVy - group.vy) * 0.09;
                    group.vx *= 0.992;
                    group.vy *= 0.992;
                } else {
                    const desiredVx = group.dir * group.baseSpeed + Math.cos(group.phase * 0.7 + group.id * 10) * 0.35;
                    const desiredVy =
                        Math.sin(group.phase) * group.driftAmp +
                        Math.cos(group.phase * 0.6 + group.id * 6) * 0.25;

                    group.vx += (desiredVx - group.vx) * group.steer;
                    group.vy += (desiredVy - group.vy) * group.steer;
                    group.vx *= group.damping;
                    group.vy *= group.damping;
                }

                const speed = Math.hypot(group.vx, group.vy);
                if (speed > group.maxSpeed) {
                    const scale = group.maxSpeed / speed;
                    group.vx *= scale;
                    group.vy *= scale;
                }

                group.x += group.vx;
                group.y += group.vy;
                if (group.family !== "caterpillar") {
                    group.dir = group.vx >= 0 ? 1 : -1;
                }

                updateArenaEntryState(group);
                const wallHit = applyBoundaryConstraints(group);
                if (
                    group.family === "caterpillar" &&
                    (wallHit.hitX || wallHit.hitY) &&
                    group.turnCooldown <= 0 &&
                    group.turnTargetHeading === null
                ) {
                    const turnSide = Math.random() > 0.5 ? 1 : -1;
                    const turnAmount = (Math.PI * (0.42 + Math.random() * 0.2)) * turnSide;
                    let nextHeading = group.heading + turnAmount;

                    const toCenter = Math.atan2(canvas.height * 0.5 - group.y, canvas.width * 0.5 - group.x);
                    const centerDelta = getAngleDelta(nextHeading, toCenter);
                    nextHeading += centerDelta * 0.22;

                    const limitedDelta = clamp(getAngleDelta(group.heading, nextHeading), -Math.PI * 0.62, Math.PI * 0.62);
                    nextHeading = group.heading + limitedDelta;

                    group.turnTargetHeading = nextHeading;
                    group.turnCooldown = 34 + Math.random() * 24;
                }
            }

            resolveGroupCollisions();
            for (const group of enemyGroups.current) {
                updateArenaEntryState(group);
                applyBoundaryConstraints(group);
            }

            for (const group of enemyGroups.current) {
                const formation = getFormation(group);
                const worldUnits = getWorldUnitPositions(group);
                const connections = getConnections(group, formation);
                const triangleCenter =
                    formation === "triangle"
                        ? {
                            x: (worldUnits[0].x + worldUnits[1].x + worldUnits[2].x) / 3,
                            y: (worldUnits[0].y + worldUnits[1].y + worldUnits[2].y) / 3
                        }
                        : undefined;

                for (const worldUnit of worldUnits) {
                    const cutouts = getFusionCutoutsForUnit(
                        worldUnits,
                        worldUnit.index,
                        connections,
                        group.radius,
                        formation
                    );
                    drawDashedRingWithCutouts(
                        worldUnit.x,
                        worldUnit.y,
                        group.radius,
                        group.phase,
                        cutouts,
                        targetBorder
                    );
                }

                for (const [aIndex, bIndex] of connections) {
                    const aUnit = worldUnits[aIndex];
                    const bUnit = worldUnits[bIndex];
                    if (!aUnit || !bUnit) continue;
                    drawDashedFusionBridge(
                        { x: aUnit.x, y: aUnit.y },
                        { x: bUnit.x, y: bUnit.y },
                        group.radius,
                        group.phase,
                        targetBorder,
                        formation,
                        triangleCenter
                    );
                }

                for (const worldUnit of worldUnits) {
                    ctx.save();
                    ctx.translate(worldUnit.x, worldUnit.y);
                    ctx.rotate(
                        -(group.phase * 1.5 + worldUnit.unit.spinPhaseOffset) * worldUnit.unit.squareSpinDir
                    );
                    ctx.strokeStyle = targetBorder;
                    ctx.lineWidth = 1;
                    const squareSize = group.radius * 0.5;
                    ctx.strokeRect(-squareSize, -squareSize, squareSize * 2, squareSize * 2);

                    const coreSize = group.radius * 0.2;
                    ctx.fillStyle = targetCenter;
                    ctx.fillRect(-coreSize, -coreSize, coreSize * 2, coreSize * 2);
                    ctx.restore();
                }
            }

            for (let i = particles.current.length - 1; i >= 0; i--) {
                const p = particles.current[i];
                p.x += p.vx;
                p.y += p.vy;
                p.vy += GRAVITY;
                p.life -= 0.03 * p.lifeDecayScale;

                if (p.life <= 0) {
                    particles.current.splice(i, 1);
                    continue;
                }

                ctx.globalAlpha = p.life;
                ctx.fillStyle = p.color;
                ctx.beginPath();
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(p.x - p.vx * 2, p.y - p.vy * 2);
                ctx.lineWidth = p.size;
                ctx.strokeStyle = p.color;
                ctx.stroke();
                ctx.globalAlpha = 1.0;
            }

            for (let i = hitFlashes.current.length - 1; i >= 0; i--) {
                const flash = hitFlashes.current[i];
                flash.life -= 0.2;

                if (flash.life <= 0) {
                    hitFlashes.current.splice(i, 1);
                    continue;
                }

                ctx.globalAlpha = flash.life * 0.5;
                ctx.fillStyle = "#ffffff";
                ctx.beginPath();
                ctx.arc(flash.x, flash.y, flash.radius * flash.life, 0, Math.PI * 2);
                ctx.fill();
                ctx.globalAlpha = 1.0;
            }

            const textColor = isDark ? "255, 255, 255" : "0, 0, 0";
            for (let i = floatingTexts.current.length - 1; i >= 0; i--) {
                const ft = floatingTexts.current[i];
                ft.x += ft.vx;
                ft.y += ft.vy;
                ft.vx *= 1.06;
                ft.life -= 0.028;

                if (ft.life <= 0) {
                    floatingTexts.current.splice(i, 1);
                    continue;
                }

                const alpha = Math.min(ft.life * 2, 1);
                ctx.globalAlpha = alpha;
                ctx.fillStyle = `rgba(${textColor}, ${alpha})`;
                ctx.font = "bold 12px 'JetBrains Mono', monospace";
                ctx.textAlign = "center";
                ctx.fillText(ft.text, ft.x, ft.y);
                ctx.globalAlpha = 1.0;
            }

            ctx.restore();
            requestRef.current = requestAnimationFrame(animate);
        };

        requestRef.current = requestAnimationFrame(animate);

        return () => {
            window.removeEventListener("resize", handleResize);
            container.removeEventListener("mousemove", handleMouseMove);
            container.removeEventListener("mousedown", handleMouseDown);
            window.removeEventListener("mouseup", handleMouseUp);
            container.removeEventListener("mouseleave", handleMouseLeave);
            container.removeEventListener("mouseenter", handleMouseEnter);
            container.removeEventListener("contextmenu", handleContextMenu);
            themeObserver.disconnect();

            if (requestRef.current) {
                cancelAnimationFrame(requestRef.current);
            }
            if (audioCtxRef.current) {
                audioCtxRef.current.close();
            }
        };
    }, []);

    return (
        <div
            ref={containerRef}
            className="absolute right-0 top-0 w-1/2 h-full hidden md:block cursor-none z-0"
        >
            <OperatorComments
                isParentHovered={isHovered}
                themeColor={operatorThemeColor}
                contrastColor={operatorContrastColor}
                isMuted={isMuted}
            />

            {/* Canvas Layer */}
            <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full block"
            />

            {/* Boundary Hint Layer */}
            <div className={`absolute inset-0 pointer-events-none transition-opacity duration-500 ${isHovered ? "opacity-100" : "opacity-0"}`}>
                <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-foreground/20" />
                <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-foreground/20" />
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-foreground/20" />
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-foreground/20" />
                <svg
                    className="absolute inset-0 w-full h-full text-foreground"
                    viewBox="0 0 100 100"
                    preserveAspectRatio="none"
                    shapeRendering="geometricPrecision"
                    aria-hidden="true"
                >
                    <path
                        d="M0 0 H100 V100 H84.8 L83.8 99 H76.2 L75.2 100 H24.8 L23.8 99 H16.2 L15.2 100 H0 Z"
                        fill="currentColor"
                        fillOpacity="0.02"
                        stroke="currentColor"
                        strokeOpacity="0.05"
                        strokeWidth="1"
                        vectorEffect="non-scaling-stroke"
                    />
                </svg>
            </div>

            {/* Bottom HUD (Aligned Left/Right) */}
            <div className="absolute bottom-8 left-8 right-8 flex items-center justify-between z-10 pointer-events-none">
                <div className="font-mono text-xs font-bold tracking-widest opacity-50 select-none flex items-center gap-2">
                    TARGETS TERMINATED:
                    <motion.span
                        key={uiScore}
                        animate={{ scale: [1.5, 1] }}
                        transition={{ duration: 0.15 }}
                        className="text-cyan-500 inline-block"
                    >
                        {uiScore.toString().padStart(3, "0")}
                    </motion.span>
                </div>

                <div className="flex items-center gap-4">
                    {/* Hint Text */}
                    <div className="text-[10px] font-mono opacity-30 text-right text-foreground">
                        <div>VECTOR_SYS_V2.0</div>
                        <div>CLICK_TO_ENGAGE</div>
                    </div>

                    {/* Mute Button */}
                    <button
                        onClick={() => setIsMuted(!isMuted)}
                        className="p-3 opacity-50 hover:opacity-100 transition-opacity pointer-events-auto text-foreground"
                        title={isMuted ? "Unmute Sound" : "Mute Sound"}
                    >
                        {isMuted ? (
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M11 5L6 9H2v6h4l5 4V5z" />
                                <line x1="23" y1="9" x2="17" y2="15" />
                                <line x1="17" y1="9" x2="23" y2="15" />
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                                <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
                            </svg>
                        )}
                    </button>
                </div>
            </div>

            {/* Crosshair */}
            <motion.div
                className="fixed w-8 h-8 pointer-events-none z-50 mix-blend-difference"
                style={{
                    x: smoothMouseX,
                    y: smoothMouseY,
                    top: 0,
                    left: 0,
                    position: "absolute"
                }}
            >
                <motion.div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full border border-current rounded-full opacity-80"
                    animate={{ scale: isShooting ? 0.8 : 1.2, opacity: isShooting ? 1 : 0.5 }}
                />
                <motion.div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-1 bg-cyan-500 rounded-full"
                />

                {/* Pipes - Adjusted to minimal contraction */}
                <motion.div
                    className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1px] h-2 bg-current"
                    animate={{ y: isShooting ? 3 : -16 }}
                />
                <motion.div
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-[1px] h-2 bg-current"
                    animate={{ y: isShooting ? -3 : 16 }}
                />
                <motion.div
                    className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-[1px] bg-current"
                    animate={{ x: isShooting ? 3 : -16 }}
                />
                <motion.div
                    className="absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 w-2 h-[1px] bg-current"
                    animate={{ x: isShooting ? -3 : 16 }}
                />
            </motion.div>
        </div>
    );
}
