"use client";

import React, { useRef, useEffect, useState } from "react";
import { useSpring, useMotionValue } from "framer-motion";
import OperatorComments from "./OperatorComments";
import MiniGameCrosshair from "./minigame/MiniGameCrosshair";
import MiniGameHud from "./minigame/MiniGameHud";
import {
    DEFAULT_PHYSICS_PRESET,
    GRAVITY,
    HEAT_COOL_PER_MS,
    HEAT_PER_SHOT,
    HEAT_RECOVER_RATIO,
    HEAT_WARNING_RATIO,
    QUAD_MODE_HEAT_MULTIPLIER,
    SFX_LEVEL_SCALE,
    WHEEL_MODE_SWITCH_COOLDOWN_MS
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
import type { Bullet, EnemyGroup, FireMode, FloatingText, HitFlash, Particle, Point } from "./minigame/types";
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
    const lastFrameTime = useRef<number | null>(null);
    const shakeIntensity = useRef(0);
    const cachedIsDark = useRef(false);
    const heatRatioRef = useRef(0);
    const isOverheatedRef = useRef(false);
    const isHoveredRef = useRef(false);
    const fireModeRef = useRef<FireMode>("dual");
    const lastWheelModeSwitchAt = useRef(0);

    const [uiScore, setUiScore] = useState(0);
    const [isShooting, setIsShooting] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [fireMode, setFireMode] = useState<FireMode>("dual");
    const [heatRatio, setHeatRatio] = useState(0);
    const [isOverheated, setIsOverheated] = useState(false);
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
    const isHeatWarning = heatRatio >= HEAT_WARNING_RATIO;
    const heatVisualOpacity = isOverheated ? 0.9 : (isHeatWarning ? 0.7 : 0.5);

    const getAudioContext = (): AudioContext => ensureAudioContext(audioCtxRef);

    const playSound = (type: "shoot" | "hit" | "modeSwitch") => {
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
            isHoveredRef.current = true;
            setIsHovered(true);
        };

        const handleMouseDown = (e: MouseEvent) => {
            e.preventDefault();
            isMouseDown.current = true;
            setIsShooting(!isOverheatedRef.current);
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
            isHoveredRef.current = false;
            setIsHovered(false);
        };

        const handleMouseEnter = () => {
            isHoveredRef.current = true;
            setIsHovered(true);
        };

        const handleContextMenu = (e: Event) => {
            e.preventDefault();
        };

        const handleWheel = (e: WheelEvent) => {
            if (!isHoveredRef.current) return;
            e.preventDefault();

            const nowMs = performance.now();
            if (nowMs - lastWheelModeSwitchAt.current < WHEEL_MODE_SWITCH_COOLDOWN_MS) return;
            lastWheelModeSwitchAt.current = nowMs;

            const nextMode: FireMode = fireModeRef.current === "dual" ? "quad" : "dual";
            if (nextMode === fireModeRef.current) return;
            fireModeRef.current = nextMode;
            setFireMode(nextMode);
            playSound("modeSwitch");
        };

        container.addEventListener("mousemove", handleMouseMove);
        container.addEventListener("mousedown", handleMouseDown);
        window.addEventListener("mouseup", handleMouseUp);
        container.addEventListener("mouseleave", handleMouseLeave);
        container.addEventListener("mouseenter", handleMouseEnter);
        container.addEventListener("contextmenu", handleContextMenu);
        container.addEventListener("wheel", handleWheel, { passive: false });

        const animate = (time: number) => {
            if (lastFrameTime.current === null) {
                lastFrameTime.current = time;
            }
            const deltaMs = Math.min(50, time - lastFrameTime.current);
            lastFrameTime.current = time;

            const shouldCoolDown = !isMouseDown.current || isOverheatedRef.current;
            if (shouldCoolDown && heatRatioRef.current > 0) {
                const cooled = Math.max(0, heatRatioRef.current - deltaMs * HEAT_COOL_PER_MS);
                if (cooled !== heatRatioRef.current) {
                    heatRatioRef.current = cooled;
                    setHeatRatio(cooled);
                }
            }

            if (isOverheatedRef.current && heatRatioRef.current <= HEAT_RECOVER_RATIO) {
                isOverheatedRef.current = false;
                setIsOverheated(false);
                if (isMouseDown.current) {
                    setIsShooting(true);
                }
            }

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

            if (isMouseDown.current && !isOverheatedRef.current && time - lastShotTime.current > 40) {
                const startY = canvas.height;
                const leftX = canvas.width * 0.2;
                const rightX = canvas.width * 0.8;
                const burstSpread = burstShotCount.current === 0 ? 0 : (Math.random() - 0.5) * 0.12;

                const spawnBullet = (startX: number, spread: number) => {
                    const dx = mousePos.current.x - startX;
                    const dy = mousePos.current.y - startY;
                    const angle = Math.atan2(dy, dx);
                    bullets.current.push({
                        id: Math.random(),
                        x: startX,
                        y: startY,
                        vx: Math.cos(angle + spread) * 60,
                        vy: Math.sin(angle + spread) * 60,
                        life: 1.0
                    });
                };

                if (fireModeRef.current === "dual") {
                    const originSide = Math.random() > 0.5 ? "left" : "right";
                    const startX = originSide === "left" ? leftX : rightX;
                    spawnBullet(startX, burstSpread);
                } else {
                    const laneOffsetX = 4;
                    const sidePickA = Math.random() > 0.5 ? "left" : "right";
                    const sidePickB = Math.random() > 0.5 ? "left" : "right";
                    const shotSides: Array<"left" | "right"> = [sidePickA, sidePickB];
                    const sideTotals = {
                        left: shotSides.filter((side) => side === "left").length,
                        right: shotSides.filter((side) => side === "right").length
                    };
                    let leftAssigned = 0;
                    let rightAssigned = 0;

                    for (const side of shotSides) {
                        const isLeft = side === "left";
                        const centerX = isLeft ? leftX : rightX;
                        if (isLeft) {
                            leftAssigned++;
                        } else {
                            rightAssigned++;
                        }

                        const sideCount = isLeft ? sideTotals.left : sideTotals.right;
                        const sideIndex = isLeft ? leftAssigned : rightAssigned;
                        const laneSign =
                            sideCount > 1
                                ? (sideIndex === 1 ? -1 : 1)
                                : (Math.random() > 0.5 ? 1 : -1);
                        const horizontalJitter = (Math.random() - 0.5) * 1.6;
                        const startX = centerX + laneSign * laneOffsetX + horizontalJitter;
                        const randomSpray = (Math.random() - 0.5) * 0.1;
                        const spread = burstSpread * 0.45 + randomSpray;
                        spawnBullet(startX, spread);
                    }
                }

                burstShotCount.current++;
                playSound("shoot");
                lastShotTime.current = time;

                const heatMultiplier = fireModeRef.current === "quad" ? QUAD_MODE_HEAT_MULTIPLIER : 1;
                const nextHeat = Math.min(1, heatRatioRef.current + HEAT_PER_SHOT * heatMultiplier);
                heatRatioRef.current = nextHeat;
                setHeatRatio(nextHeat);
                if (nextHeat >= 1 && !isOverheatedRef.current) {
                    isOverheatedRef.current = true;
                    setIsOverheated(true);
                    setIsShooting(false);
                }
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
            container.removeEventListener("wheel", handleWheel);
            themeObserver.disconnect();

            if (requestRef.current) {
                cancelAnimationFrame(requestRef.current);
            }
            lastFrameTime.current = null;
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

            <MiniGameHud
                heatRatio={heatRatio}
                isHeatWarning={isHeatWarning}
                isOverheated={isOverheated}
                heatVisualOpacity={heatVisualOpacity}
                uiScore={uiScore}
                isMuted={isMuted}
                fireMode={fireMode}
                onToggleMute={() => setIsMuted(!isMuted)}
            />

            <MiniGameCrosshair
                x={smoothMouseX}
                y={smoothMouseY}
                isOverheated={isOverheated}
                isShooting={isShooting}
            />
        </div >
    );
}
