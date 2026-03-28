"use client";

import React, { useRef, useState, useEffect } from "react";
import { useMotionValue } from "framer-motion";

import CockpitCanvas from "./CockpitCanvas";
import CockpitHUD from "./CockpitHUD";
import RightPanelHUD from "./RightPanelHUD";
import ReturnTicket from "./ReturnTicket";

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
            data-theme="dark" // Force dark theme for the whole layout
            className="fixed inset-0 w-full h-full overflow-hidden select-none bg-[var(--background)] text-[var(--foreground)]"
            style={{
                fontFamily: 'var(--font-mono)',
            }}
        >
            <div
                ref={containerRef}
                onMouseMove={handleMouseMove}
                className="w-full h-full flex flex-col md:flex-row relative"
                style={{
                    transform: `translate(${shakeX}px, ${shakeY}px)`,
                }}
            >
                {/* ═══ LEFT PANEL (6.5 Area) ═══ */}
                <div className="relative w-full md:w-[65%] h-[60vh] md:h-full shrink-0 flex flex-col overflow-hidden">
                    {/* Layer 0: 3D Canvas Background (Restrained to this left panel width/height) */}
                    <CockpitCanvas mouseX={mouseX} mouseY={mouseY} setShake={setShake} setFireFlash={setFireFlash} />

                    {/* Firing Flashes relative to this left panel */}
                    <div className={`absolute bottom-0 left-0 w-1/2 h-1/2 bg-[var(--foreground)] blur-[40px] pointer-events-none transition-opacity duration-75 z-40 ${fireFlash === "left" ? "opacity-10" : "opacity-0"}`} />
                    <div className={`absolute bottom-0 right-0 w-1/2 h-1/2 bg-[var(--foreground)] blur-[40px] pointer-events-none transition-opacity duration-75 z-40 ${fireFlash === "right" ? "opacity-10" : "opacity-0"}`} />

                    {/* Layer 1: The Foreground HUD over the observation window */}
                    <div className="absolute inset-0 z-20 pointer-events-none">
                        <CockpitHUD />
                    </div>
                </div>

                {/* ═══ RIGHT PANEL (3.5 Area) ═══ */}
                {/* A solid border separating the left and right panels */}
                <div 
                    className="w-full md:w-[35%] h-[40vh] md:h-full relative shrink-0 overflow-y-auto z-10"
                    style={{ borderLeft: '1px solid color-mix(in srgb, var(--foreground) 20%, transparent)' }}
                >
                    <RightPanelHUD />
                </div>

                {/* ═══ LAYER 2: GLOBAL FRONT UI (TICKET) ═══ */}
                {/* pointer-events-none to let clicks pass through to background HUD, but auto for the ticket itself */}
                <div className="absolute inset-0 z-[1000] pointer-events-none overflow-hidden">
                    {/* Positioned at the bottom, sliding up via framer-motion inside ReturnTicket */}
                    <div className="absolute bottom-0 left-[50%] md:left-[65%] -translate-x-1/2 pointer-events-auto flex items-end">
                        <ReturnTicket />
                    </div>
                </div>
            </div>
        </div>
    );
}
