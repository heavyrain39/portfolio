"use client";

import React, { useRef, useState, useEffect } from "react";
import { useMotionValue } from "framer-motion";

import CockpitCanvas from "./CockpitCanvas";
import CockpitHUD from "./CockpitHUD";
import { SidePanelLeft, SidePanelRight } from "./SidePanel";

export default function NotFoundCockpit() {
    const containerRef = useRef<HTMLDivElement>(null);
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const [shake, setShake] = useState(0);
    const [fireFlash, setFireFlash] = useState<"left" | "right" | null>(null);

    useEffect(() => {
        if (fireFlash) {
            const timer = setTimeout(() => setFireFlash(null), 50);
            return () => clearTimeout(timer);
        }
    }, [fireFlash]);

    // Hide global GridBackground on 404 page
    useEffect(() => {
        const gridBg = document.querySelector('[data-grid-bg]') as HTMLElement;
        if (gridBg) gridBg.style.display = 'none';
        return () => { if (gridBg) gridBg.style.display = ''; };
    }, []);

    useEffect(() => {
        if (shake > 0) {
            const timer = requestAnimationFrame(() => {
                setShake(s => Math.max(0, s - 0.5));
            });
            return () => cancelAnimationFrame(timer);
        }
    }, [shake]);

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        const y = ((e.clientY - rect.top) / rect.height) * 2 - 1;
        mouseX.set(x);
        mouseY.set(y);
    };

    const shakeX = shake > 0 ? (Math.random() - 0.5) * shake * 2 : 0;
    const shakeY = shake > 0 ? (Math.random() - 0.5) * shake * 2 : 0;

    return (
        <div
            ref={containerRef}
            onMouseMove={handleMouseMove}
            className="fixed inset-0 w-full h-full overflow-hidden select-none text-[var(--foreground)]"
            style={{
                fontFamily: 'var(--font-mono)',
                transform: `translate(${shakeX}px, ${shakeY}px)`,
            }}
        >
            {/* Layer 0: 3D Canvas Background */}
            <CockpitCanvas mouseX={mouseX} mouseY={mouseY} setShake={setShake} setFireFlash={setFireFlash} />

            {/* Layer 1: Viewport Mask — circle with box-shadow blocks 3D outside */}
            <div className="absolute inset-0 z-[5] pointer-events-none flex items-center justify-center">
                <div
                    className="w-[280px] h-[280px] md:w-[min(65vh,640px)] md:h-[min(65vh,640px)] rounded-full relative"
                    style={{ boxShadow: "0 0 0 200vmax var(--background)" }}
                >
                    <div className="absolute inset-0 rounded-full border border-[var(--foreground)]/25" />
                </div>
            </div>

            {/* Layer 2: Firing Flashes */}
            <div className={`fixed bottom-0 left-0 w-1/2 h-1/2 bg-[var(--foreground)] blur-[40px] pointer-events-none transition-opacity duration-75 z-40 ${fireFlash === "left" ? "opacity-10" : "opacity-0"}`} />
            <div className={`fixed bottom-0 right-0 w-1/2 h-1/2 bg-[var(--foreground)] blur-[40px] pointer-events-none transition-opacity duration-75 z-40 ${fireFlash === "right" ? "opacity-10" : "opacity-0"}`} />

            {/* Layer 3: Strict Grid Layout */}
            <div
                className="absolute inset-0 z-10 pointer-events-none"
                style={{
                    display: 'grid',
                    gridTemplateRows: '44px 1fr 44px',
                    gridTemplateColumns: '1fr',
                    border: '1px solid var(--foreground)',
                    borderColor: 'color-mix(in srgb, var(--foreground) 20%, transparent)',
                }}
            >
                {/* ═══ TOP BAR ═══ */}
                <div
                    className="flex items-center justify-between px-5 bg-[var(--background)] pointer-events-auto"
                    style={{
                        gridColumn: '1 / -1',
                        borderBottom: '1px solid color-mix(in srgb, var(--foreground) 20%, transparent)',
                    }}
                >
                    <div className="flex items-center gap-3">
                        <span className="text-[13px] font-bold tracking-wider opacity-90">V.1</span>
                        <span className="text-[10px] tracking-[0.3em] opacity-50 uppercase">SYS.TERMINAL // CORE DIAGNOSTIC</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="px-3 py-1 text-[9px] tracking-[0.2em] uppercase opacity-50 hover:opacity-100 transition-opacity">REBOOT</button>
                        <a
                            href="/"
                            className="px-3 py-1 text-[9px] tracking-[0.2em] uppercase border border-[var(--foreground)]/30 rounded-full hover:bg-[var(--foreground)] hover:text-[var(--background)] transition-all"
                        >RETURN</a>
                    </div>
                </div>

                {/* ═══ MIDDLE ROW (center only on mobile, 3-col on desktop) ═══ */}
                <div
                    className="relative min-h-0"
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'clamp(280px, 22vw, 400px) 1fr clamp(280px, 22vw, 400px)',
                        gridColumn: '1 / -1',
                    }}
                >
                    {/* LEFT PANEL */}
                    <div
                        className="hidden md:flex flex-col bg-[var(--background)] overflow-hidden"
                        style={{ borderRight: '1px solid color-mix(in srgb, var(--foreground) 20%, transparent)' }}
                    >
                        <SidePanelLeft />
                    </div>

                    {/* CENTER (Viewport + HUD) */}
                    <div className="relative flex flex-col min-h-0 col-span-3 md:col-span-1">
                        <CockpitHUD mouseX={mouseX} mouseY={mouseY} />
                    </div>

                    {/* RIGHT PANEL */}
                    <div
                        className="hidden md:flex flex-col bg-[var(--background)] overflow-hidden"
                        style={{ borderLeft: '1px solid color-mix(in srgb, var(--foreground) 20%, transparent)' }}
                    >
                        <SidePanelRight />
                    </div>
                </div>

                {/* ═══ BOTTOM BAR ═══ */}
                <div
                    className="flex items-center justify-between px-5 bg-[var(--background)] text-[8px] tracking-[0.3em] uppercase opacity-40"
                    style={{
                        gridColumn: '1 / -1',
                        borderTop: '1px solid color-mix(in srgb, var(--foreground) 20%, transparent)',
                    }}
                >
                    <span>Caladan.v9.2.4</span>
                    <span className="hidden md:inline">SYS.KERN // 0x88F-K</span>
                    <span>STATUS: ORPHAN_MODE</span>
                </div>
            </div>
        </div>
    );
}
