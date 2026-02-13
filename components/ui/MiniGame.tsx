"use client";

import React, { useRef, useEffect, useState } from "react";
import { motion, useSpring, useMotionValue } from "framer-motion";

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
    radius: number;
    hp: number;
    maxHp: number;
    phase: number; // For organic movement
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

export default function MiniGame() {
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
    const mousePos = useRef<Point>({ x: 0, y: 0 });
    const isMouseDown = useRef(false);
    const lastShotTime = useRef(0);
    const frameCount = useRef(0);
    const shakeIntensity = useRef(0);
    const cachedIsDark = useRef(false);

    // React State for UI
    const [uiScore, setUiScore] = useState(0);
    const [isShooting, setIsShooting] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const isMutedRef = useRef(false);

    // Sync Ref with State for Game Loop
    useEffect(() => {
        isMutedRef.current = isMuted;
    }, [isMuted]);

    // Motion Values for Crosshair (Smooth)
    const rawMouseX = useMotionValue(0);
    const rawMouseY = useMotionValue(0);
    const smoothMouseX = useSpring(rawMouseX, { stiffness: 500, damping: 30 });
    const smoothMouseY = useSpring(rawMouseY, { stiffness: 500, damping: 30 });

    // Constants
    const GRAVITY = 0.2; // For particles

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

            gainNode.gain.setValueAtTime(0.05, now); // Very low volume
            gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

            osc.start(now);
            osc.stop(now + 0.1);
        } else if (type === "hit") {
            // Crunch/Explosion
            osc.type = "sawtooth";
            osc.frequency.setValueAtTime(150, now);
            osc.frequency.exponentialRampToValueAtTime(50, now + 0.15);

            gainNode.gain.setValueAtTime(0.08, now); // Low volume
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
        const handleResize = () => {
            if (canvas && container) {
                canvas.width = container.offsetWidth;
                canvas.height = container.offsetHeight;
            }
        };
        handleResize();
        window.addEventListener("resize", handleResize);

        // Input Handlers
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
            e.preventDefault(); // Prevent text selection/dragging
            isMouseDown.current = true;
            setIsShooting(true);
            lastShotTime.current = 0; // Guarantee instant first shot

            // Initialize/Resume Audio Context
            getAudioContext();
        };
        const handleMouseUp = () => {
            isMouseDown.current = false;
            setIsShooting(false);
        };
        const handleMouseLeave = () => {
            // Don't reset isMouseDown here — window-level mouseup handles that.
            // This prevents the "click release" bug when cursor briefly exits container.
            setIsHovered(false);
        };
        const handleMouseEnter = () => {
            setIsHovered(true);
        };
        const handleContextMenu = (e: Event) => {
            e.preventDefault(); // Suppress right-click menu in game area
        };

        // Attach listeners
        container.addEventListener("mousemove", handleMouseMove);
        container.addEventListener("mousedown", handleMouseDown);
        window.addEventListener("mouseup", handleMouseUp); // Window-level: prevents stuck clicks
        container.addEventListener("mouseleave", handleMouseLeave);
        container.addEventListener("mouseenter", handleMouseEnter);
        container.addEventListener("contextmenu", handleContextMenu);

        // --- GAME LOGIC ---

        const spawnTarget = () => {
            if (targets.current.length >= 8) return; // Max targets

            const side = Math.random() > 0.5 ? "left" : "right";
            const startX = side === "left" ? -50 : canvas.width + 50;
            const startY = Math.random() * (canvas.height * 0.5) + (canvas.height * 0.1); // Keep high

            const r = Math.random();
            let hp = 4; // Default 80%
            if (r < 0.1) hp = 3; // 10% Weak
            else if (r > 0.9) hp = 5; // 10% Strong

            targets.current.push({
                id: Math.random(),
                x: startX,
                y: startY,
                vx: side === "left" ? Math.random() * 3 + 2 : -(Math.random() * 3 + 2),
                vy: (Math.random() - 0.5) * 3,
                radius: 25 + Math.random() * 10,
                hp: hp,
                maxHp: hp,
                phase: Math.random() * Math.PI * 2
            });
        };

        const createExplosion = (x: number, y: number, count: number, color: string) => {
            for (let i = 0; i < count; i++) {
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

        const animate = (time: number) => {
            if (!canvas || !ctx) return;

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
            if (isMouseDown.current && time - lastShotTime.current > 40) {
                // Determine origin (20% and 80%)
                const originSide = Math.random() > 0.5 ? "left" : "right";
                const startX = originSide === "left" ? canvas.width * 0.2 : canvas.width * 0.8;
                const startY = canvas.height;

                // Calculate angle to mouse
                const dx = mousePos.current.x - startX;
                const dy = mousePos.current.y - startY;
                const angle = Math.atan2(dy, dx);

                // Spread
                const spread = (Math.random() - 0.5) * 0.15;

                bullets.current.push({
                    id: Math.random(),
                    x: startX,
                    y: startY,
                    vx: Math.cos(angle + spread) * 45,
                    vy: Math.sin(angle + spread) * 45,
                    life: 1.0
                });

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
                ctx.strokeStyle = "#06b6d4";
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
                        t.vx *= 0.8;
                        t.x += b.vx * 0.3;
                        t.y += b.vy * 0.3;

                        createExplosion(b.x, b.y, 4, "#06b6d4");

                        // Small hit flash on damage
                        hitFlashes.current.push({ x: b.x, y: b.y, life: 1.0, radius: 8 });

                        if (t.hp <= 0) {
                            // Destroy
                            createExplosion(t.x, t.y, 20, "#06b6d4");
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

            for (let i = targets.current.length - 1; i >= 0; i--) {
                const t = targets.current[i];

                t.phase += 0.08;
                t.x += t.vx;
                t.y += t.vy + Math.sin(t.phase) * 1.5;

                if ((t.vx > 0 && t.x > canvas.width + 150) || (t.vx < 0 && t.x < -150)) {
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
                ctx.rotate(-t.phase * 1.5);
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
                ctx.fillStyle = "#ffffff";
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
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
            if (audioCtxRef.current) audioCtxRef.current.close();
        };
    }, []);

    return (
        <div
            ref={containerRef}
            className="absolute right-0 top-0 w-1/2 h-full hidden md:block cursor-none z-0"
        >
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
                <div className="absolute inset-0 border border-foreground/5 bg-foreground/[0.02]" />
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
                        {uiScore.toString().padStart(3, '0')}
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
