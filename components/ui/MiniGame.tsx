"use client";

import React, { useRef, useEffect, useState } from "react";
import { motion, useSpring, useMotionValue } from "framer-motion";
import OperatorComments from "./OperatorComments";
import {
    DEFAULT_PHYSICS_PRESET,
    GRAVITY,
    SFX_LEVEL_SCALE
} from "./minigame/constants";
import { createExplosion } from "./minigame/effects";
import { getConnections, getFormation, getWorldUnitPositions } from "./minigame/formation";
import { clamp, getAngleDelta } from "./minigame/math";
import {
    applyBoundaryConstraints,
    applyPerUnitImpactKnockback,
    handleUnitDestroyed,
    resolveGroupCollisions,
    updateArenaEntryState
} from "./minigame/physics";
import {
    drawDashedFusionBridge,
    drawDashedRingWithCutouts,
    getFusionCutoutsForUnit
} from "./minigame/render";
import { getSpawnIntervalFrames, spawnEnemyGroup } from "./minigame/spawn";
import type { Bullet, EnemyGroup, FloatingText, HitFlash, Particle, Point } from "./minigame/types";
import { closeAudioContext, ensureAudioContext, playGameSound } from "./minigame/audio";

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

    const physicsPreset = DEFAULT_PHYSICS_PRESET;

    const getAudioContext = (): AudioContext => ensureAudioContext(audioCtxRef);

    const playSound = (type: "shoot" | "hit") => {
        playGameSound({
            audioCtxRef,
            isMuted: isMutedRef.current,
            type,
            sfxLevelScale: SFX_LEVEL_SCALE
        });
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
            const spawnInterval = getSpawnIntervalFrames(scoreRef.current);
            if (frameCount.current % spawnInterval === 0) {
                spawnEnemyGroup({
                    enemyGroups: enemyGroups.current,
                    canvasWidth: canvas.width,
                    canvasHeight: canvas.height,
                    physicsPreset
                });
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
                            applyPerUnitImpactKnockback(
                                group,
                                worldUnits,
                                worldUnit.index,
                                hitNx,
                                hitNy,
                                physicsPreset
                            );
                        } else {
                            const knockback = physicsPreset.knockbackBase / Math.max(group.mass, 1);
                            group.vx += hitNx * knockback;
                            group.vy += hitNy * knockback;
                            group.x += hitNx * 6;
                            group.y += hitNy * 6;
                        }

                        createExplosion(particles.current, bullet.x, bullet.y, 4, "#06b6d4", {
                            speedScale: 0.7,
                            sizeScale: 0.55,
                            lifeDecayScale: 2.2
                        });
                        hitFlashes.current.push({ x: bullet.x, y: bullet.y, life: 1.0, radius: 5 });

                        if (unit.hp <= 0) {
                            createExplosion(particles.current, worldUnit.x, worldUnit.y, 20, "#06b6d4", {
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

                            handleUnitDestroyed(enemyGroups.current, groupIndex, worldUnit.index);
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

                updateArenaEntryState(group, canvas.width);
                const wallHit = applyBoundaryConstraints(group, canvas.width, canvas.height);
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

            resolveGroupCollisions(enemyGroups.current, physicsPreset);
            for (const group of enemyGroups.current) {
                updateArenaEntryState(group, canvas.width);
                applyBoundaryConstraints(group, canvas.width, canvas.height);
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
                        ctx,
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
                        ctx,
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
                ctx.font = "12px 'JetBrains Mono', monospace";
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
            closeAudioContext(audioCtxRef);
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
                    {/* Notch occluders: keep notch lips visually above canvas targets. */}
                    <path d="M15.2 100 L16.2 99 L23.8 99 L24.8 100 Z" fill="var(--background)" fillOpacity="1" />
                    <path d="M75.2 100 L76.2 99 L83.8 99 L84.8 100 Z" fill="var(--background)" fillOpacity="1" />
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

