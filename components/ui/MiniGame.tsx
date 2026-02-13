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

export default function MiniGame() {
    // Refs for Game Loop
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const requestRef = useRef<number | null>(null);
    const scoreRef = useRef(0);

    // Game State Refs (Mutable for performance in loop)
    const bullets = useRef<Bullet[]>([]);
    const targets = useRef<Target[]>([]);
    const particles = useRef<Particle[]>([]);
    const mousePos = useRef<Point>({ x: 0, y: 0 });
    const isMouseDown = useRef(false);
    const lastShotTime = useRef(0);
    const frameCount = useRef(0);

    // React State for UI
    const [uiScore, setUiScore] = useState(0);

    // Motion Values for Crosshair (Smooth)
    const rawMouseX = useMotionValue(0);
    const rawMouseY = useMotionValue(0);
    const smoothMouseX = useSpring(rawMouseX, { stiffness: 500, damping: 30 });
    const smoothMouseY = useSpring(rawMouseY, { stiffness: 500, damping: 30 });

    // Constants
    const BULLET_SPEED = 25;
    const FIRE_RATE = 50; // ms
    const TARGET_SPAWN_RATE = 120; // frames
    const GRAVITY = 0.2; // For particles

    useEffect(() => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

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
        };

        const handleMouseDown = () => { isMouseDown.current = true; };
        const handleMouseUp = () => { isMouseDown.current = false; };
        const handleMouseLeave = () => { isMouseDown.current = false; };

        // Attach listeners to container
        container.addEventListener("mousemove", handleMouseMove);
        container.addEventListener("mousedown", handleMouseDown);
        container.addEventListener("mouseup", handleMouseUp);
        container.addEventListener("mouseleave", handleMouseLeave);

        // --- GAME LOGIC ---

        const spawnTarget = () => {
            if (targets.current.length >= 5) return;

            const side = Math.random() > 0.5 ? "left" : "right";
            const startX = side === "left" ? -50 : canvas.width + 50;
            const startY = Math.random() * (canvas.height * 0.6) + (canvas.height * 0.1);

            targets.current.push({
                id: Math.random(),
                x: startX,
                y: startY,
                vx: side === "left" ? Math.random() * 2 + 1 : -(Math.random() * 2 + 1),
                vy: (Math.random() - 0.5) * 2,
                radius: 20 + Math.random() * 15,
                hp: 4,
                maxHp: 4,
                phase: Math.random() * Math.PI * 2
            });
        };

        const createExplosion = (x: number, y: number, count: number, color: string) => {
            for (let i = 0; i < count; i++) {
                const angle = Math.random() * Math.PI * 2;
                const speed = Math.random() * 5 + 2;
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

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // 1. Spawning
            frameCount.current++;
            if (frameCount.current % TARGET_SPAWN_RATE === 0) {
                spawnTarget();
            }

            // 2. Shooting
            if (isMouseDown.current && time - lastShotTime.current > FIRE_RATE) {
                // Determine origin (alternating bottom corners)
                const originSide = Math.random() > 0.5 ? "left" : "right";
                const startX = originSide === "left" ? 0 : canvas.width;
                const startY = canvas.height;

                // Calculate angle to mouse
                const dx = mousePos.current.x - startX;
                const dy = mousePos.current.y - startY;
                const angle = Math.atan2(dy, dx);

                // Spread
                const spread = (Math.random() - 0.5) * 0.1;

                bullets.current.push({
                    id: Math.random(),
                    x: startX,
                    y: startY,
                    vx: Math.cos(angle + spread) * BULLET_SPEED,
                    vy: Math.sin(angle + spread) * BULLET_SPEED,
                    life: 1.0
                });

                lastShotTime.current = time;
            }

            // 3. Update & Draw Bullets
            ctx.fillStyle = "#ef4444"; // Red-500
            for (let i = bullets.current.length - 1; i >= 0; i--) {
                const b = bullets.current[i];
                b.x += b.vx;
                b.y += b.vy;

                // Boundary check
                if (b.x < 0 || b.x > canvas.width || b.y < 0 || b.y > canvas.height) {
                    bullets.current.splice(i, 1);
                    continue;
                }

                // Draw Bullet (Trace)
                ctx.beginPath();
                ctx.arc(b.x, b.y, 2, 0, Math.PI * 2);
                ctx.fill();

                // Collision Check loop
                for (let j = targets.current.length - 1; j >= 0; j--) {
                    const t = targets.current[j];
                    const dist = Math.hypot(b.x - t.x, b.y - t.y);

                    if (dist < t.radius) {
                        // Hit!
                        bullets.current.splice(i, 1); // Remove bullet

                        // Damage Target
                        t.hp--;
                        t.vx *= 0.5; // Slow down impact
                        t.x += b.vx * 0.1; // Knockback
                        t.y += b.vy * 0.1;

                        // Hit specific logic
                        createExplosion(b.x, b.y, 3, "#ef4444"); // Small spark

                        if (t.hp <= 0) {
                            // Destroy Target
                            createExplosion(t.x, t.y, 15, "#ef4444"); // Big explosion
                            targets.current.splice(j, 1);

                            scoreRef.current++;
                            setUiScore(scoreRef.current); // Sync to UI
                        }

                        break; // Bullet hit something, stop checking other targets
                    }
                }
            }

            // 4. Update & Draw Targets
            ctx.strokeStyle = "rgba(0, 0, 0, 0.8)"; // Adjust for dark mode later?
            // Actually let's use theme variables or just generic dark grey for now, user said "color theme compatible"
            // We can read CSS variables or just use a safe dark color. The user uses --foreground usually.
            // Let's use a generic dark color, but we might want to check the theme.
            // For now, let's use a variable-like color.
            const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
            const targetColor = isDark ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.1)";
            const targetBorder = isDark ? "rgba(255, 255, 255, 0.8)" : "rgba(0, 0, 0, 0.8)";

            for (let i = targets.current.length - 1; i >= 0; i--) {
                const t = targets.current[i];

                // Organic Movement
                t.phase += 0.05;
                t.x += t.vx;
                t.y += t.vy + Math.sin(t.phase) * 0.5;

                // Boundary bounce/removal
                if ((t.vx > 0 && t.x > canvas.width + 100) || (t.vx < 0 && t.x < -100)) {
                    targets.current.splice(i, 1);
                    continue;
                }

                // Draw Target
                ctx.beginPath();
                ctx.arc(t.x, t.y, t.radius, 0, Math.PI * 2);
                ctx.fillStyle = targetColor;
                ctx.fill();
                ctx.lineWidth = 1.5;
                ctx.strokeStyle = targetBorder;
                ctx.stroke();

                // Inner circle (pulse)
                ctx.beginPath();
                ctx.arc(t.x, t.y, t.radius * 0.4 + Math.sin(t.phase) * 5, 0, Math.PI * 2);
                ctx.stroke();
            }

            // 5. Update & Draw Particles
            for (let i = particles.current.length - 1; i >= 0; i--) {
                const p = particles.current[i];
                p.x += p.vx;
                p.y += p.vy;
                p.vy += GRAVITY;
                p.life -= 0.02;

                if (p.life <= 0) {
                    particles.current.splice(i, 1);
                    continue;
                }

                ctx.globalAlpha = p.life;
                ctx.fillStyle = p.color;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
                ctx.globalAlpha = 1.0;
            }

            requestRef.current = requestAnimationFrame(animate);
        };

        requestRef.current = requestAnimationFrame(animate);

        return () => {
            window.removeEventListener("resize", handleResize);
            container.removeEventListener("mousemove", handleMouseMove);
            container.removeEventListener("mousedown", handleMouseDown);
            container.removeEventListener("mouseup", handleMouseUp);
            container.removeEventListener("mouseleave", handleMouseLeave);
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, []);

    return (
        <div
            ref={containerRef}
            className="absolute right-0 top-0 w-1/2 h-full hidden md:block cursor-none z-0"
        >
            {/* Canvas Layer for Bullets/Targets */}
            <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full block"
            />

            {/* UI Layer */}
            <div className="absolute top-8 left-8 font-mono text-xs font-bold tracking-widest opacity-50 select-none pointer-events-none">
                TARGET TERMINATED: <span className="text-red-500">{uiScore.toString().padStart(3, '0')}</span>
            </div>

            {/* Crosshair Layer (Framer Motion) */}
            <motion.div
                className="fixed w-8 h-8 pointer-events-none z-50 mix-blend-difference" // Fixed to viewport to ensure smoothness if container is relative?
                // Actually container is absolute, mouse coordinates are relative to container.
                // If we use 'fixed' we need clientX/Y. My logic managed offset logic.
                // Let's stick to absolute within container for correct positioning relative to game
                style={{
                    x: smoothMouseX,
                    y: smoothMouseY,
                    top: 0,
                    left: 0,
                    position: "absolute"
                }}
            >
                {/* Crosshair Graphics */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full border border-current rounded-full opacity-80" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-1 bg-red-500 rounded-full" />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-0.5 h-2 bg-current" />
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-0.5 h-2 bg-current" />
                <div className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-0.5 bg-current" />
                <div className="absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 w-2 h-0.5 bg-current" />
            </motion.div>

            {/* Hint Text */}
            <div className="absolute bottom-8 right-8 text-[10px] font-mono opacity-30 pointer-events-none text-right">
                <div>VECTOR_SYS_V2.0</div>
                <div>CLICK_TO_ENGAGE</div>
            </div>
        </div>
    );
}
