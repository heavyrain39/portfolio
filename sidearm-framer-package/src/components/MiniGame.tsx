"use client";

import React, { useRef, useEffect, useState } from "react";
import { motion, useSpring, useMotionValue } from "framer-motion";
import OperatorComments from "./OperatorComments";
import { DEFAULT_DIALOGUES, type SidearmProps } from "../types";

// Types
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

interface Target {
    id: number;
    x: number;
    y: number;
    vx: number;
    vy: number;
    dir: 1 | -1;
    radius: number;
    mass: number;
    baseSpeed: number;
    maxSpeed: number;
    driftAmp: number;
    driftFreq: number;
    steer: number;
    damping: number;
    restitution: number;
    hp: number;
    maxHp: number;
    phase: number; // For organic movement
    squareSpinDir: 1 | -1;
}

interface Particle {
    id: number;
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
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

const SHOT_INTERVAL_MS = 40;
const DEFAULT_PROJECTILE_SPEED = 45;
const DEFAULT_SPRAY = 0.12;
const PROJECTILE_SPEED_MIN = 20;
const PROJECTILE_SPEED_MAX = 120;
const SPRAY_MIN = 0;
const SPRAY_MAX = 0.7;
const PARTICLE_MULTIPLIER_MIN = 0.2;
const PARTICLE_MULTIPLIER_MAX = 4;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export default function MiniGame({
    themeColor = "#06b6d4",
    accentColor = "#ffffff",
    showOperator = true,
    dialogueList = DEFAULT_DIALOGUES,
    operatorAssetBasePath = "/images/operator",
    operatorId,
    enableSound = true,
    initialMuted = false,
    volume = 70,
    projectileSpeed = DEFAULT_PROJECTILE_SPEED,
    spray = DEFAULT_SPRAY,
    hitParticleMultiplier = 1,
    killParticleMultiplier = 1,
    showHud = true,
    isEditorMode = false,
    className,
    style
}: SidearmProps) {
    // Refs for Game Loop
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const requestRef = useRef<number | null>(null);
    const scoreRef = useRef(0);
    const audioCtxRef = useRef<AudioContext | null>(null);

    // Game State Refs (Mutable for performance in loop)
    const bullets = useRef<Bullet[]>([]);
    const targets = useRef<Target[]>([]);
    const particles = useRef<Particle[]>([]);
    const floatingTexts = useRef<FloatingText[]>([]);
    const hitFlashes = useRef<HitFlash[]>([]);
    const aimPos = useRef<Point>({ x: 0, y: 0 });
    const isPointerDown = useRef(false);
    const lastShotTime = useRef(0);
    const burstShotCount = useRef(0);
    const frameCount = useRef(0);
    const shakeIntensity = useRef(0);
    const cachedIsDark = useRef(false);
    const isInViewportRef = useRef(true);
    const lastFrameTimestampRef = useRef(0);

    // React State for UI
    const [uiScore, setUiScore] = useState(0);
    const [isShooting, setIsShooting] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [isMuted, setIsMuted] = useState(initialMuted || !enableSound);
    const isMutedRef = useRef(false);
    const volumeRef = useRef(Math.max(0, Math.min(100, volume)) / 100);
    const themeColorRef = useRef(themeColor);
    const accentColorRef = useRef(accentColor);
    const projectileSpeedRef = useRef(clamp(projectileSpeed, PROJECTILE_SPEED_MIN, PROJECTILE_SPEED_MAX));
    const sprayRef = useRef(clamp(spray, SPRAY_MIN, SPRAY_MAX));
    const hitParticleMultiplierRef = useRef(clamp(hitParticleMultiplier, PARTICLE_MULTIPLIER_MIN, PARTICLE_MULTIPLIER_MAX));
    const killParticleMultiplierRef = useRef(clamp(killParticleMultiplier, PARTICLE_MULTIPLIER_MIN, PARTICLE_MULTIPLIER_MAX));

    // Sync Ref with State for Game Loop
    useEffect(() => {
        isMutedRef.current = isMuted || !enableSound;
    }, [isMuted, enableSound]);

    useEffect(() => {
        volumeRef.current = Math.max(0, Math.min(100, volume)) / 100;
    }, [volume]);

    useEffect(() => {
        themeColorRef.current = themeColor;
    }, [themeColor]);

    useEffect(() => {
        accentColorRef.current = accentColor;
    }, [accentColor]);

    useEffect(() => {
        projectileSpeedRef.current = clamp(projectileSpeed, PROJECTILE_SPEED_MIN, PROJECTILE_SPEED_MAX);
    }, [projectileSpeed]);

    useEffect(() => {
        sprayRef.current = clamp(spray, SPRAY_MIN, SPRAY_MAX);
    }, [spray]);

    useEffect(() => {
        hitParticleMultiplierRef.current = clamp(hitParticleMultiplier, PARTICLE_MULTIPLIER_MIN, PARTICLE_MULTIPLIER_MAX);
    }, [hitParticleMultiplier]);

    useEffect(() => {
        killParticleMultiplierRef.current = clamp(killParticleMultiplier, PARTICLE_MULTIPLIER_MIN, PARTICLE_MULTIPLIER_MAX);
    }, [killParticleMultiplier]);

    // Motion Values for Crosshair (Smooth)
    const rawMouseX = useMotionValue(0);
    const rawMouseY = useMotionValue(0);
    const smoothMouseX = useSpring(rawMouseX, { stiffness: 500, damping: 30 });
    const smoothMouseY = useSpring(rawMouseY, { stiffness: 500, damping: 30 });

    type PhysicsPreset = {
        collisionRatio: number;
        restitutionMin: number;
        restitutionMax: number;
        knockbackBase: number;
    };

    // Constants
    const GRAVITY = 0.2; // For particles
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

    // Consolidated AudioContext initializer
    const getAudioContext = (): AudioContext => {
        if (!audioCtxRef.current) {
            audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        if (audioCtxRef.current.state === "suspended") {
            audioCtxRef.current.resume();
        }
        return audioCtxRef.current;
    };

    // Sound Generation (Synth)
    const playSound = (type: "shoot" | "hit") => {
        if (!enableSound) return;
        if (isMutedRef.current) return;

        const ctx = getAudioContext();

        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();

        osc.connect(gainNode);
        gainNode.connect(ctx.destination);

        const now = ctx.currentTime;

        if (type === "shoot") {
            // High-pitch pew — subtle pitch variation per shot
            osc.type = "triangle";
            const baseFreq = 800 + (Math.random() - 0.5) * 120; // 740~860 range
            osc.frequency.setValueAtTime(baseFreq, now);
            osc.frequency.exponentialRampToValueAtTime(300, now + 0.1);

            gainNode.gain.setValueAtTime(0.05 * volumeRef.current, now); // Very low volume
            gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

            osc.start(now);
            osc.stop(now + 0.1);
        } else if (type === "hit") {
            // Crunch/Explosion
            osc.type = "sawtooth";
            osc.frequency.setValueAtTime(150, now);
            osc.frequency.exponentialRampToValueAtTime(50, now + 0.15);

            gainNode.gain.setValueAtTime(0.08 * volumeRef.current, now); // Low volume
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

        // Cache theme state via MutationObserver (instead of per-frame DOM query)
        cachedIsDark.current = document.documentElement.getAttribute('data-theme') === 'dark';
        const themeObserver = new MutationObserver(() => {
            cachedIsDark.current = document.documentElement.getAttribute('data-theme') === 'dark';
        });
        themeObserver.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['data-theme']
        });

        // Resize Handlers
        const editorFrameInterval = isEditorMode ? 1000 / 30 : 0;
        const syncCanvasSize = () => {
            canvas.width = Math.max(container.clientWidth, 1);
            canvas.height = Math.max(container.clientHeight, 1);
        };
        syncCanvasSize();

        let resizeObserver: ResizeObserver | null = null;
        const hasResizeObserver = typeof ResizeObserver !== "undefined";
        if (hasResizeObserver) {
            resizeObserver = new ResizeObserver(() => {
                syncCanvasSize();
            });
            resizeObserver.observe(container);
        } else {
            window.addEventListener("resize", syncCanvasSize);
        }

        // Input Handlers
        const updateAimPosition = (clientX: number, clientY: number) => {
            const rect = container.getBoundingClientRect();
            const x = clientX - rect.left;
            const y = clientY - rect.top;

            aimPos.current = { x, y };
            rawMouseX.set(x);
            rawMouseY.set(y);
        };

        const handlePointerMove = (event: PointerEvent) => {
            updateAimPosition(event.clientX, event.clientY);
            setIsHovered(true);
        };

        const handlePointerDown = (event: PointerEvent) => {
            event.preventDefault();
            updateAimPosition(event.clientX, event.clientY);
            isPointerDown.current = true;
            setIsShooting(true);
            setIsHovered(true);
            lastShotTime.current = 0;
            burstShotCount.current = 0;

            if (container.setPointerCapture) {
                try {
                    container.setPointerCapture(event.pointerId);
                } catch {
                    // Ignore unsupported capture scenarios.
                }
            }

            getAudioContext();
        };

        const handlePointerUp = (event: PointerEvent) => {
            if (container.releasePointerCapture && container.hasPointerCapture?.(event.pointerId)) {
                try {
                    container.releasePointerCapture(event.pointerId);
                } catch {
                    // Ignore unsupported capture scenarios.
                }
            }

            isPointerDown.current = false;
            setIsShooting(false);
            burstShotCount.current = 0;
        };

        const handlePointerCancel = (event: PointerEvent) => {
            handlePointerUp(event);
            setIsHovered(false);
        };

        const handlePointerLeave = () => {
            setIsHovered(false);
        };

        const handlePointerEnter = () => {
            setIsHovered(true);
        };

        const handleContextMenu = (event: Event) => {
            event.preventDefault();
        };

        const handleVisibilityChange = () => {
            if (document.hidden && requestRef.current) {
                cancelAnimationFrame(requestRef.current);
                requestRef.current = null;
                return;
            }
            if (!document.hidden && requestRef.current === null && isInViewportRef.current) {
                lastFrameTimestampRef.current = performance.now();
                requestRef.current = requestAnimationFrame(animate);
            }
        };

        // --- GAME LOGIC ---

        const spawnTarget = () => {
            if (targets.current.length >= 8) return; // Max targets

            const side = Math.random() > 0.5 ? "left" : "right";
            const radius = 25 + Math.random() * 10;
            const startXBase = side === "left" ? -50 : canvas.width + 50;
            const spawnOffset = Math.random() * 30;
            const startX = side === "left" ? startXBase + spawnOffset : startXBase - spawnOffset;
            const dir: 1 | -1 = side === "left" ? 1 : -1;

            let startY = Math.random() * (canvas.height * 0.5) + (canvas.height * 0.1); // Keep high
            let spawnOk = false;
            for (let attempt = 0; attempt < 10; attempt++) {
                startY = Math.random() * (canvas.height * 0.5) + (canvas.height * 0.1);
                const hasOverlap = targets.current.some((t) => {
                    const minDist = (radius + t.radius) * physicsPreset.collisionRatio;
                    return Math.hypot(startX - t.x, startY - t.y) < minDist;
                });
                if (!hasOverlap) {
                    spawnOk = true;
                    break;
                }
            }
            if (!spawnOk && targets.current.length > 4) return;

            const r = Math.random();
            let hp = 4; // Default 80%
            if (r < 0.1) hp = 3; // 10% Weak
            else if (r > 0.9) hp = 5; // 10% Strong

            const isSpeedster = Math.random() < 0.08;
            const speedMultiplier = isSpeedster ? 1.5 : 1;
            const baseSpeed = (Math.random() * 1.8 + 2.1) * 1.1 * speedMultiplier; // +10% global speed
            const mass = Math.max(1, (radius * radius) / 700);

            targets.current.push({
                id: Math.random(),
                x: startX,
                y: startY,
                vx: dir * baseSpeed,
                vy: (Math.random() - 0.5) * 1.2,
                dir,
                radius,
                mass,
                baseSpeed,
                maxSpeed: baseSpeed + Math.random() * 1.2 + 1.2,
                driftAmp: Math.random() * 0.9 + 0.7,
                driftFreq: Math.random() * 0.055 + 0.05,
                steer: Math.random() * 0.028 + 0.03,
                damping: Math.random() * 0.008 + 0.987,
                restitution: Math.random() * (physicsPreset.restitutionMax - physicsPreset.restitutionMin) + physicsPreset.restitutionMin,
                hp: hp,
                maxHp: hp,
                phase: Math.random() * Math.PI * 2,
                squareSpinDir: 1
            });
        };

        const createExplosion = (x: number, y: number, count: number, color: string, intensity: number) => {
            const safeIntensity = clamp(intensity, PARTICLE_MULTIPLIER_MIN, PARTICLE_MULTIPLIER_MAX);
            const particleCount = Math.max(1, Math.round(count * safeIntensity));
            for (let i = 0; i < particleCount; i++) {
                const angle = Math.random() * Math.PI * 2;
                const speed = (Math.random() * 8 + 4) * 1.2; // 20% faster
                particles.current.push({
                    id: Math.random(),
                    x,
                    y,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    life: 1.0,
                    color: color,
                    size: Math.random() * 3 + 1
                });
            }
        };

        const resolveTargetCollisions = () => {
            const ts = targets.current;
            for (let i = 0; i < ts.length; i++) {
                for (let j = i + 1; j < ts.length; j++) {
                    const a = ts[i];
                    const b = ts[j];

                    let dx = b.x - a.x;
                    let dy = b.y - a.y;
                    let dist = Math.hypot(dx, dy);
                    const minDist = (a.radius + b.radius) * physicsPreset.collisionRatio;

                    if (dist >= minDist) continue;

                    // Prevent divide-by-zero when centers are nearly identical.
                    if (dist < 0.0001) {
                        const angle = Math.random() * Math.PI * 2;
                        dx = Math.cos(angle);
                        dy = Math.sin(angle);
                        dist = 1;
                    }

                    const nx = dx / dist;
                    const ny = dy / dist;
                    const overlap = minDist - dist;
                    const totalMass = a.mass + b.mass;

                    // Positional correction: allow slight overlap, but avoid hard center stacking.
                    a.x -= nx * overlap * (b.mass / totalMass);
                    a.y -= ny * overlap * (b.mass / totalMass);
                    b.x += nx * overlap * (a.mass / totalMass);
                    b.y += ny * overlap * (a.mass / totalMass);

                    const rvx = b.vx - a.vx;
                    const rvy = b.vy - a.vy;
                    const velAlongNormal = rvx * nx + rvy * ny;

                    // Only apply impulse if moving toward each other.
                    if (velAlongNormal < 0) {
                        const restitution = (a.restitution + b.restitution) * 0.5;
                        const impulseMag = (-(1 + restitution) * velAlongNormal) / ((1 / a.mass) + (1 / b.mass));
                        const impulseX = impulseMag * nx;
                        const impulseY = impulseMag * ny;

                        a.vx -= impulseX / a.mass;
                        a.vy -= impulseY / a.mass;
                        b.vx += impulseX / b.mass;
                        b.vy += impulseY / b.mass;

                        // Small tangential damping for stable, less jittery post-collision motion.
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
            }
        };

        const animate = (time: number) => {
            if (!canvas || !ctx) return;

            if (editorFrameInterval > 0) {
                const elapsed = time - lastFrameTimestampRef.current;
                if (elapsed < editorFrameInterval) {
                    requestRef.current = requestAnimationFrame(animate);
                    return;
                }
                lastFrameTimestampRef.current = time - (elapsed % editorFrameInterval);
            } else {
                lastFrameTimestampRef.current = time;
            }

            // Screen shake offset
            const shakeX = shakeIntensity.current > 0 ? (Math.random() - 0.5) * shakeIntensity.current * 2 : 0;
            const shakeY = shakeIntensity.current > 0 ? (Math.random() - 0.5) * shakeIntensity.current * 2 : 0;
            shakeIntensity.current *= 0.85; // Rapid decay
            if (shakeIntensity.current < 0.3) shakeIntensity.current = 0;

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.save();
            ctx.translate(shakeX, shakeY);

            // 1. Spawning
            frameCount.current++;
            if (frameCount.current % 40 === 0) {
                spawnTarget();
            }

            // 2. Shooting
            if (isPointerDown.current && time - lastShotTime.current > SHOT_INTERVAL_MS) {
                // Determine origin (20% and 80%)
                const originSide = Math.random() > 0.5 ? "left" : "right";
                const startX = originSide === "left" ? canvas.width * 0.2 : canvas.width * 0.8;
                const startY = canvas.height;

                // Calculate angle to mouse
                const dx = aimPos.current.x - startX;
                const dy = aimPos.current.y - startY;
                const angle = Math.atan2(dy, dx);

                // First shot is perfectly accurate. Follow-up shots get light spread.
                const spread = burstShotCount.current === 0 ? 0 : (Math.random() - 0.5) * sprayRef.current;

                bullets.current.push({
                    id: Math.random(),
                    x: startX,
                    y: startY,
                    vx: Math.cos(angle + spread) * projectileSpeedRef.current,
                    vy: Math.sin(angle + spread) * projectileSpeedRef.current,
                    life: 1.0
                });

                burstShotCount.current++;
                playSound("shoot"); // Audio Feedback
                lastShotTime.current = time;
            }

            // 3. Update & Draw Bullets
            for (let i = bullets.current.length - 1; i >= 0; i--) {
                const b = bullets.current[i];
                b.x += b.vx;
                b.y += b.vy;

                // Boundary check
                if (b.x < 0 || b.x > canvas.width || b.y < 0 || b.y > canvas.height) {
                    bullets.current.splice(i, 1);
                    continue;
                }

                // Draw Bullet
                ctx.beginPath();
                ctx.moveTo(b.x - b.vx * 0.5, b.y - b.vy * 0.5);
                ctx.lineTo(b.x, b.y);
                ctx.strokeStyle = themeColorRef.current;
                ctx.lineWidth = 2;
                ctx.stroke();

                // Collision Check
                for (let j = targets.current.length - 1; j >= 0; j--) {
                    const t = targets.current[j];
                    const dist = Math.hypot(b.x - t.x, b.y - t.y);

                    if (dist < t.radius + 7) { // Hitbox: +7 (was +5)
                        bullets.current.splice(i, 1);

                        // Damage
                        t.hp--;
                        t.squareSpinDir *= -1; // Flip inner square spin direction on every hit
                        const bulletSpeed = Math.hypot(b.vx, b.vy) || 1;
                        const hitNx = b.vx / bulletSpeed;
                        const hitNy = b.vy / bulletSpeed;
                        const knockback = physicsPreset.knockbackBase / t.mass;
                        t.vx += hitNx * knockback;
                        t.vy += hitNy * knockback;
                        t.x += hitNx * 6;
                        t.y += hitNy * 6;

                        createExplosion(b.x, b.y, 4, themeColorRef.current, hitParticleMultiplierRef.current);

                        // Small hit flash on damage
                        hitFlashes.current.push({ x: b.x, y: b.y, life: 1.0, radius: 8 });

                        if (t.hp <= 0) {
                            // Destroy
                            createExplosion(t.x, t.y, 20, themeColorRef.current, killParticleMultiplierRef.current);
                            playSound("hit"); // Audio Feedback
                            targets.current.splice(j, 1);

                            // Screen shake
                            shakeIntensity.current = 3;

                            // Large hit flash on kill
                            hitFlashes.current.push({ x: t.x, y: t.y, life: 1.0, radius: t.radius * 0.8 });

                            // Floating "+1" text
                            const dir = Math.random() > 0.5 ? 1 : -1;
                            floatingTexts.current.push({
                                x: t.x,
                                y: t.y,
                                vx: dir * (Math.random() * 0.5 + 0.5),
                                vy: -1.5,
                                life: 1.0,
                                text: "+1"
                            });

                            scoreRef.current++;
                            setUiScore(scoreRef.current);
                        }

                        break;
                    }
                }
            }

            // 4. Update & Draw Targets
            const isDark = cachedIsDark.current;
            const targetBorder = isDark ? "rgba(255, 255, 255, 0.6)" : "rgba(0, 0, 0, 0.6)";
            const targetCenter = isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)";

            // 4-A. Update target movement with subtle per-target dynamics.
            for (let i = 0; i < targets.current.length; i++) {
                const t = targets.current[i];
                t.phase += t.driftFreq;

                const desiredVx = t.dir * t.baseSpeed + Math.cos(t.phase * 0.7 + t.id * 10) * 0.35;
                const desiredVy = Math.sin(t.phase) * t.driftAmp + Math.cos(t.phase * 0.6 + t.id * 6) * 0.25;

                t.vx += (desiredVx - t.vx) * t.steer;
                t.vy += (desiredVy - t.vy) * t.steer;

                t.vx *= t.damping;
                t.vy *= t.damping;

                const speed = Math.hypot(t.vx, t.vy);
                if (speed > t.maxSpeed) {
                    const scale = t.maxSpeed / speed;
                    t.vx *= scale;
                    t.vy *= scale;
                }

                t.x += t.vx;
                t.y += t.vy;
            }

            // 4-B. Resolve inter-target collisions after movement integration.
            resolveTargetCollisions();

            for (let i = targets.current.length - 1; i >= 0; i--) {
                const t = targets.current[i];

                if ((t.dir > 0 && t.x > canvas.width + 180) || (t.dir < 0 && t.x < -180)) {
                    targets.current.splice(i, 1);
                    continue;
                }

                // Draw Target
                ctx.beginPath();
                ctx.setLineDash([5, 5]);
                ctx.arc(t.x, t.y, t.radius, 0 + t.phase, Math.PI * 2 + t.phase);
                ctx.lineWidth = 1;
                ctx.strokeStyle = targetBorder;
                ctx.stroke();
                ctx.setLineDash([]);

                ctx.save();
                ctx.translate(t.x, t.y);
                ctx.rotate(-t.phase * 1.5 * t.squareSpinDir);
                ctx.strokeStyle = targetBorder;
                ctx.strokeRect(-t.radius * 0.5, -t.radius * 0.5, t.radius, t.radius);

                ctx.fillStyle = targetCenter;
                ctx.fillRect(-t.radius * 0.2, -t.radius * 0.2, t.radius * 0.4, t.radius * 0.4);
                ctx.restore();
            }

            // 5. Update & Draw Particles
            for (let i = particles.current.length - 1; i >= 0; i--) {
                const p = particles.current[i];
                p.x += p.vx;
                p.y += p.vy;
                p.vy += GRAVITY;
                p.life -= 0.03;

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

            // 6. Update & Draw Hit Flashes
            for (let i = hitFlashes.current.length - 1; i >= 0; i--) {
                const f = hitFlashes.current[i];
                f.life -= 0.2; // Very fast decay (~5 frames)

                if (f.life <= 0) {
                    hitFlashes.current.splice(i, 1);
                    continue;
                }

                ctx.globalAlpha = f.life * 0.5;
                ctx.fillStyle = accentColorRef.current;
                ctx.beginPath();
                ctx.arc(f.x, f.y, f.radius * f.life, 0, Math.PI * 2);
                ctx.fill();
                ctx.globalAlpha = 1.0;
            }

            // 7. Update & Draw Floating Texts (+1 popup)
            const textColor = isDark ? "255, 255, 255" : "0, 0, 0";
            for (let i = floatingTexts.current.length - 1; i >= 0; i--) {
                const ft = floatingTexts.current[i];
                ft.x += ft.vx;
                ft.y += ft.vy;
                ft.vx *= 1.06; // Accelerating scatter
                ft.life -= 0.028; // ~35 frames total (~0.58s)

                if (ft.life <= 0) {
                    floatingTexts.current.splice(i, 1);
                    continue;
                }

                // Full opacity for first ~0.3s, then fade out
                const alpha = Math.min(ft.life * 2, 1);
                ctx.globalAlpha = alpha;
                ctx.fillStyle = `rgba(${textColor}, ${alpha})`;
                ctx.font = "bold 12px 'JetBrains Mono', monospace";
                ctx.textAlign = "center";
                ctx.fillText(ft.text, ft.x, ft.y);
                ctx.globalAlpha = 1.0;
            }

            ctx.restore(); // End screen shake transform

            requestRef.current = requestAnimationFrame(animate);
        };

        let intersectionObserver: IntersectionObserver | null = null;

        const startAnimation = () => {
            if (requestRef.current !== null) return;
            if (document.hidden || !isInViewportRef.current) return;

            lastFrameTimestampRef.current = performance.now();
            requestRef.current = requestAnimationFrame(animate);
        };

        const stopAnimation = () => {
            if (requestRef.current === null) return;
            cancelAnimationFrame(requestRef.current);
            requestRef.current = null;
        };

        container.addEventListener("pointermove", handlePointerMove);
        container.addEventListener("pointerdown", handlePointerDown, { passive: false });
        container.addEventListener("pointerleave", handlePointerLeave);
        container.addEventListener("pointerenter", handlePointerEnter);
        container.addEventListener("pointercancel", handlePointerCancel);
        window.addEventListener("pointerup", handlePointerUp);
        window.addEventListener("pointercancel", handlePointerCancel);
        container.addEventListener("contextmenu", handleContextMenu);
        document.addEventListener("visibilitychange", handleVisibilityChange);

        if (typeof IntersectionObserver !== "undefined") {
            intersectionObserver = new IntersectionObserver(
                (entries) => {
                    const entry = entries[0];
                    isInViewportRef.current = Boolean(entry?.isIntersecting);
                    if (isInViewportRef.current) {
                        startAnimation();
                    } else {
                        stopAnimation();
                    }
                },
                { threshold: 0.05 }
            );
            intersectionObserver.observe(container);
        } else {
            isInViewportRef.current = true;
            startAnimation();
        }

        return () => {
            themeObserver.disconnect();
            intersectionObserver?.disconnect();
            resizeObserver?.disconnect();

            if (!hasResizeObserver) {
                window.removeEventListener("resize", syncCanvasSize);
            }

            container.removeEventListener("pointermove", handlePointerMove);
            container.removeEventListener("pointerdown", handlePointerDown);
            container.removeEventListener("pointerleave", handlePointerLeave);
            container.removeEventListener("pointerenter", handlePointerEnter);
            container.removeEventListener("pointercancel", handlePointerCancel);
            window.removeEventListener("pointerup", handlePointerUp);
            window.removeEventListener("pointercancel", handlePointerCancel);
            container.removeEventListener("contextmenu", handleContextMenu);
            document.removeEventListener("visibilitychange", handleVisibilityChange);

            if (requestRef.current) {
                cancelAnimationFrame(requestRef.current);
                requestRef.current = null;
            }
            if (audioCtxRef.current) {
                audioCtxRef.current.close();
                audioCtxRef.current = null;
            }
        };
    }, [isEditorMode, rawMouseX, rawMouseY]);

    return (
        <div
            ref={containerRef}
            className={className ?? "absolute right-0 top-0 w-1/2 h-full hidden md:block cursor-none z-0"}
            style={{ ...(style ?? {}), touchAction: "none" }}
        >
            {showOperator ? (
                <OperatorComments
                    isParentHovered={isHovered}
                    comments={dialogueList}
                    assetBasePath={operatorAssetBasePath}
                    operatorId={operatorId}
                />
            ) : null}

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
            {showHud ? (
            <div className="absolute bottom-8 left-8 right-8 flex items-center justify-between z-10 pointer-events-none">
                <div className="font-mono text-xs font-bold tracking-widest opacity-50 select-none flex items-center gap-2">
                    TARGETS TERMINATED:
                    <motion.span
                        key={uiScore}
                        animate={{ scale: [1.5, 1] }}
                        transition={{ duration: 0.15 }}
                        className="inline-block"
                        style={{ color: themeColor }}
                    >
                        {uiScore.toString().padStart(3, '0')}
                    </motion.span>
                </div>

                <div className="flex items-center gap-4">
                    {/* Hint Text */}
                    <div className="text-[10px] font-mono opacity-30 text-right text-foreground">
                        <div>VECTOR_SYS_V2.0</div>
                        <div>TAP_OR_CLICK</div>
                    </div>

                    {/* Mute Button */}
                    <button
                        onClick={() => setIsMuted(!isMuted)}
                        className="p-3 opacity-50 hover:opacity-100 transition-opacity pointer-events-auto text-foreground"
                        title={isMuted ? "Unmute Sound" : "Mute Sound"}
                        disabled={!enableSound}
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
            ) : null}

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
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-1 rounded-full"
                    style={{ backgroundColor: themeColor }}
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

