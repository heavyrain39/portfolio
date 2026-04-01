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
    const [isAtBottom, setIsAtBottom] = useState(false);

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

    useEffect(() => {
        const checkScroll = () => {
            if (!containerRef.current) return;
            const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
            // 허용 오차 50px 이내면 바닥 도달로 간주 (데스크탑처럼 스크롤바가 없는 꽉 찬 화면이면 무조건 0이 되므로 즉시 true)
            if (scrollHeight - scrollTop - clientHeight < 50) {
                setIsAtBottom(true);
            }
        };

        checkScroll();
        const el = containerRef.current;
        if (el) {
            el.addEventListener('scroll', checkScroll);
        }

        const observer = new ResizeObserver(checkScroll);
        if (el) observer.observe(el);

        return () => {
            if (el) el.removeEventListener('scroll', checkScroll);
            observer.disconnect();
        };
    }, []);

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
                className="w-full h-full overflow-y-auto overflow-x-hidden md:overflow-hidden flex flex-col md:flex-row relative"
                style={{
                    transform: `translate(${shakeX}px, ${shakeY}px)`,
                }}
            >
                {/* ═══ LEFT PANEL (6.5 Area) ═══ */}
                <div className="relative w-full md:w-[65%] h-[85svh] md:h-full shrink-0 flex flex-col overflow-hidden">
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
                    className="w-full md:w-[35%] h-auto md:h-full relative shrink-0 md:overflow-y-auto z-10 border-t md:border-t-0 md:border-l border-[var(--foreground)]/20"
                >
                    <RightPanelHUD />
                </div>
            </div>

            {/* ═══ LAYER 2: GLOBAL FRONT UI (TICKET) ═══ */}
            {/* pointer-events-none to let clicks pass through to background HUD, but auto for the ticket itself */}
            <div className="absolute inset-0 z-[1000] pointer-events-none overflow-hidden">
                {/* Positioned at the bottom, sliding up via framer-motion inside ReturnTicket */}
                <div className="absolute bottom-0 left-[50%] md:left-[65%] -translate-x-1/2 flex items-end">
                    <ReturnTicket isReady={isAtBottom} />
                </div>
            </div>
        </div>
    );
}
