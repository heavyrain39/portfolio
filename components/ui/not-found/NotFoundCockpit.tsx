"use client";

import React, { useRef, useState, useEffect } from "react";
import { useSpring, useMotionValue, motion, useTransform } from "framer-motion";

import CockpitCanvas from "./CockpitCanvas";
import CockpitHUD from "./CockpitHUD";

export default function NotFoundCockpit() {
    const containerRef = useRef<HTMLDivElement>(null);
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const smoothMouseX = useSpring(mouseX, { stiffness: 100, damping: 30 });
    const smoothMouseY = useSpring(mouseY, { stiffness: 100, damping: 30 });
    const [shake, setShake] = useState(0);
    const [fireFlash, setFireFlash] = useState<"left" | "right" | null>(null);

    useEffect(() => {
        if (fireFlash) {
            const timer = setTimeout(() => setFireFlash(null), 50);
            return () => clearTimeout(timer);
        }
    }, [fireFlash]);

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
            className="fixed inset-0 w-full h-full bg-black overflow-hidden select-none cursor-none text-white"
            style={{ 
                fontFamily: 'var(--font-mono)',
                transform: `translate(${shakeX}px, ${shakeY}px)`
            }}
        >
            {/* Screen Firing Flashes (Bottom Corners) */}
            <div className={`absolute bottom-0 left-0 w-1/2 h-1/2 bg-[var(--foreground)] blur-[100px] pointer-events-none transition-opacity duration-75 z-40 ${fireFlash === "left" ? "opacity-30" : "opacity-0"}`} />
            <div className={`absolute bottom-0 right-0 w-1/2 h-1/2 bg-[var(--foreground)] blur-[100px] pointer-events-none transition-opacity duration-75 z-40 ${fireFlash === "right" ? "opacity-30" : "opacity-0"}`} />

            {/* Canvas Layers (Z-0) */}
            <CockpitCanvas mouseX={smoothMouseX} mouseY={smoothMouseY} setShake={setShake} setFireFlash={setFireFlash} />
            
            {/* Cockpit Mask (Z-10): Hides the canvas outside the center window */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-10 overflow-hidden">
                <div 
                    className="w-[320px] h-[320px] md:w-[600px] md:h-[600px] rounded-full relative"
                    style={{
                        boxShadow: "0 0 0 200vw var(--background)", 
                    }}
                />
            </div>

            {/* DOM HUD Layers (Z-20) */}
            <div className="absolute inset-0 pointer-events-none z-20">
                <CockpitHUD mouseX={smoothMouseX} mouseY={smoothMouseY} />
            </div>

            {/* Fixed Central Crosshair (Z-50) */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-50 mix-blend-difference">
                <div className="relative w-12 h-12 opacity-80 flex items-center justify-center">
                    <div className="absolute w-[1px] h-full bg-white opacity-60" />
                    <div className="absolute h-[1px] w-full bg-white opacity-60" />
                    <div className="absolute w-4 h-4 border border-white opacity-80" />
                    <div className="absolute w-1 h-1 bg-red-500 rounded-full opacity-80" />
                </div>
            </div>
        </div>
    );
}
