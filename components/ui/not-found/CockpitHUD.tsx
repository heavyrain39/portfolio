"use client";

import React, { useState, useEffect } from "react";
import { motion, Variants } from "framer-motion";
import VerticalHUD from "./VerticalHUD";
import HUDCrosshair from "./HUDCrosshair";

/* ── Cross Marker (1px line-drawn) ── */
function CrossMarker() {
    return (
        <svg 
            width="1em" 
            height="1em" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            className="shrink-0"
            style={{ 
                strokeWidth: '1.2px', // Slightly thicker for better visibility but still feels like 1px
                vectorEffect: 'non-scaling-stroke' 
            }}
        >
            <line x1="12" y1="6" x2="12" y2="18" />
            <line x1="6" y1="12" x2="18" y2="12" />
        </svg>
    );
}

/* ── Curved Spherical Grid Lines ── */
function SphericalGrid() {
    const lines = Array.from({ length: 21 }, (_, i) => i - 10);
    return (
        <g stroke="var(--foreground)" fill="none" strokeWidth="0.3">
            {lines.map(i => {
                const y = 100 + i * 12;
                const curve = i * Math.abs(i) * 1.2;
                return (
                    <path
                        key={`h${i}`}
                        d={`M -30,${y} Q 100,${y + curve} 230,${y}`} // Extended path
                        opacity={Math.max(0, 0.05 + Math.abs(i) * 0.012)}
                    />
                );
            })}
            {lines.map(i => {
                const x = 100 + i * 12;
                const curve = i * Math.abs(i) * 1.2;
                return (
                    <path
                        key={`v${i}`}
                        d={`M ${x},-30 Q ${x + curve},100 ${x},230`} // Extended path
                        opacity={Math.max(0, 0.05 + Math.abs(i) * 0.012)}
                    />
                );
            })}
        </g>
    );
}

/* ── HUD Brackets (Spaced outside the viewport) ── */
function HUDBrackets() {
    return (
        <div
            className="absolute z-10 pointer-events-none"
            style={{
                top: '-5px',
                bottom: '-5px',
                left: '-40px',
                right: '-40px'
            }}
        >
            {/* Expanded width to 200 + 80 = 280 */}
            <svg className="w-full h-full" viewBox="0 0 280 210" preserveAspectRatio="none">
                <g stroke="var(--foreground)" strokeWidth="0.5" fill="none" opacity="0.25">
                    {/* Corners at expanded coordinates */}
                    <polyline points="2,25 2,2 25,2" />
                    <polyline points="255,2 278,2 278,25" />
                    <polyline points="2,185 2,208 25,208" />
                    <polyline points="255,208 278,208 278,185" />
                </g>
            </svg>
        </div>
    );
}

/* ── Viewport Engineering SVG ── */
function ViewportOverlay() {
    return (
        <svg
            className="w-full h-full"
            viewBox="0 0 200 200"
            fill="none"
        >
            <defs>
                <clipPath id="viewport-clip">
                    <circle cx="100" cy="100" r="100" />
                </clipPath>
            </defs>

            <g clipPath="url(#viewport-clip)">
                <SphericalGrid />
            </g>

            <g stroke="var(--foreground)" strokeWidth="0.3">
                <line x1="100" y1="1" x2="100" y2="10" strokeWidth="0.5" opacity="0.15" />
                <line x1="100" y1="190" x2="100" y2="199" strokeWidth="0.5" opacity="0.15" />
                <line x1="1" y1="100" x2="10" y2="100" strokeWidth="0.5" opacity="0.15" />
                <line x1="190" y1="100" x2="199" y2="100" strokeWidth="0.5" opacity="0.15" />

                <circle cx="100" cy="100" r="40" strokeWidth="0.2" opacity="0.06" strokeDasharray="1.5 3" />
            </g>
        </svg>
    );
}

/* ── TV Pixel Grid Overlay ── */
function TVOverlay() {
    return (
        <div
            className="fixed inset-0 z-[999] pointer-events-none opacity-[0.35]" // Slightly lower opacity for denser grid
            style={{
                backgroundImage: `
                    linear-gradient(rgba(0, 0, 0, 0.15) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(0, 0, 0, 0.15) 1px, transparent 1px)
                `,
                backgroundSize: '2px 2px'
            }}
        />
    );
}

/* ── Warning Message with Glitch Effect ── */
function WarningMessage() {
    return (
        <motion.div
            className="px-4 py-1 bg-[var(--foreground)] text-[var(--background)] tracking-[0.3em] font-mono uppercase font-bold whitespace-nowrap"
            style={{ fontSize: 'clamp(0.7rem, 0.9vw, 1.1rem)' }}
            animate={{
                x: [0, -4, 4, -2, 0, 0, 0],
                skewX: [0, -20, 20, -10, 0, 0, 0],
                opacity: [1, 0.8, 1, 0.4, 1, 1, 1],
                filter: ["blur(0px)", "blur(1px)", "blur(0px)", "blur(2px)", "blur(0px)", "blur(0px)", "blur(0px)"]
            }}
            transition={{
                duration: 0.3,
                repeat: Infinity,
                repeatDelay: Math.random() * 5 + 3, // Each instance gets a random delay
                ease: "linear",
                times: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 1]
            }}
        >
            〔 ANOMALY DETECTED 〕
        </motion.div>
    );
}

/* ── HUD Symmetrical Circles ── */
function HUDCircles() {
    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-40">
            {/* Left Circle: 25% visible (75% outside boundary) */}
            <div
                className="absolute top-1/2 left-0 -translate-x-3/4 -translate-y-1/2 w-[300px] h-[300px] md:w-[min(55vh,640px)] md:h-[min(55vh,640px)] rounded-full border border-[var(--foreground)]/25 z-40"
            />
            {/* Right Circle: 25% visible (75% outside boundary) */}
            <div
                className="absolute top-1/2 right-0 translate-x-3/4 -translate-y-1/2 w-[300px] h-[300px] md:w-[min(55vh,640px)] md:h-[min(55vh,640px)] rounded-full border border-[var(--foreground)]/25 z-40"
            />
        </div>
    );
}

/* ── HUD Corner Markers (+ + + +) ── */
function HUDCornerMarkers() {
    const spacing = "gap-3 md:gap-5";
    const size = "clamp(1rem, 1.8vw, 1.5rem)"; // Slightly smaller to match visual weight of lines
    const opacity = "opacity-20";
    const baseClass = `absolute flex ${spacing} ${opacity} z-30`;

    return (
        <>
            <div className={`${baseClass} top-4 left-4 md:top-8 md:left-10`} style={{ fontSize: size }}>
                <CrossMarker /><CrossMarker /><CrossMarker /><CrossMarker />
            </div>
            <div className={`${baseClass} top-4 right-4 md:top-8 md:right-10`} style={{ fontSize: size }}>
                <CrossMarker /><CrossMarker /><CrossMarker /><CrossMarker />
            </div>
            <div className={`${baseClass} bottom-4 left-4 md:bottom-8 md:left-10`} style={{ fontSize: size }}>
                <CrossMarker /><CrossMarker /><CrossMarker /><CrossMarker />
            </div>
            <div className={`${baseClass} bottom-4 right-4 md:bottom-8 md:right-10`} style={{ fontSize: size }}>
                <CrossMarker /><CrossMarker /><CrossMarker /><CrossMarker />
            </div>
        </>
    );
}

export default function CockpitHUD() {
    const [isTapped, setIsTapped] = useState(false);
    const fullQuote = `「The spirit is so intimately connected with the roots of man's being that it powerfully and seductively leads him to believe he is the creator of the spirit, and that he possesses it. But in reality, it is the primordial phenomenon of the spirit that possesses man.」`;

    const handleMouseDown = () => setIsTapped(true);

    useEffect(() => {
        const handleGlobalUp = () => setIsTapped(false);
        window.addEventListener('mouseup', handleGlobalUp);
        window.addEventListener('touchend', handleGlobalUp);
        return () => {
            window.removeEventListener('mouseup', handleGlobalUp);
            window.removeEventListener('touchend', handleGlobalUp);
        };
    }, []);

    return (
        <div
            className="relative h-full w-full pointer-events-auto overflow-hidden select-none"
            style={{ display: 'grid', gridTemplateRows: 'auto 1fr auto' }}
            onMouseDown={handleMouseDown}
            onDragStart={(e) => e.preventDefault()}
        >
            <HUDCornerMarkers />

            {/* ═══ Row 1: Top Header (404 + Barcode Lines) ═══
                z-30 so it paints ABOVE the viewport mask shadow */}
            <div className="relative z-30 flex justify-center w-full pt-4 md:pt-8 lg:pt-12 px-4 md:px-8">
                <div className="w-full max-w-[min(95vw,1000px)] flex items-end justify-between">
                    <div className="flex-1 flex items-end justify-start opacity-20 gap-2 md:gap-4 translate-y-[10px] md:translate-y-[14px] pl-[60px] md:pl-[84px]">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={`leftline-${i}`} className="w-[1px] h-[20px] md:h-[35px] bg-[var(--foreground)]" />
                        ))}
                    </div>

                    <h1
                        className="shrink-0 font-serif font-[900] tracking-tighter mx-4 md:mx-8 text-center"
                        style={{ fontSize: 'clamp(5rem, 10vw, 10rem)', letterSpacing: '-0.05em', lineHeight: '0.85' }}
                    >
                        404
                    </h1>

                    <div className="flex-1 flex items-end justify-end opacity-20 gap-2 md:gap-4 translate-y-[10px] md:translate-y-[14px] pr-[60px] md:pr-[84px]">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={`rightline-${i}`} className="w-[1px] h-[20px] md:h-[35px] bg-[var(--foreground)]" />
                        ))}
                    </div>
                </div>
            </div>

            {/* ═══ Row 2: Viewport Circle + Vertical HUDs ═══
                1fr takes all remaining vertical space.
                min-h-0 prevents flex overflow.
                z-10 so the box-shadow mask sits behind Row 1 & Row 3. */}
            {/* ═══ Row 2: Viewport Circle + Vertical HUDs ═══
                1fr takes all remaining vertical space.
                min-h-0 prevents flex overflow.
                z-10 so the box-shadow mask sits behind Row 1 & Row 3. */}
            <div className="relative z-10 flex items-center justify-center w-full min-h-0">
                <div className="w-full max-w-[min(95vw,1000px)] flex flex-row items-center justify-between px-4 md:px-8">
                    {/* (HUD contents...) */}
                    <div className="flex-1 flex items-center justify-start z-20 h-[300px] md:h-[min(55vh,640px)]">
                        <VerticalHUD side="left" />
                    </div>

                    {/* Viewport Mask and Overlay */}
                    <div className="relative z-[5] shrink-0 flex items-center justify-center w-[300px] h-[300px] md:w-[min(55vh,640px)] md:h-[min(55vh,640px)]">
                        {/* Mask shadow — 200vmax creates the opaque cockpit wall */}
                        <div className="w-full h-full rounded-full relative" style={{ boxShadow: "0 0 0 200vmax var(--background)" }}>
                            <div className="absolute inset-0 rounded-full border border-[var(--foreground)]/25" />
                        </div>

                        <div className="absolute inset-0 z-10">
                            <ViewportOverlay />
                            <HUDCrosshair isTapped={isTapped} />
                            <HUDBrackets />
                        </div>

                        <div className="absolute top-[25%] left-1/2 -translate-x-1/2 z-10">
                            <WarningMessage />
                        </div>
                    </div>

                    {/* Right HUD — explicit height matching viewport */}
                    <div className="flex-1 flex items-center justify-end z-20 h-[300px] md:h-[min(55vh,640px)]">
                        <VerticalHUD side="right" />
                    </div>
                </div>
            </div>

            {/* ═══ Row 3: Bottom Quote Panel ═══
                z-30 so it paints ABOVE the viewport mask shadow */}
            <div className="relative z-30 flex justify-center w-full pb-4 md:pb-8 lg:pb-12 px-4 md:px-12">
                <div className="w-full max-w-[85vw] md:max-w-[800px] flex flex-col justify-center">
                    <p
                        className="w-full font-mono leading-relaxed text-justify uppercase tracking-[0.05em] opacity-50 relative"
                        style={{ fontSize: 'clamp(0.6rem, 0.8vw, 1rem)' }}
                    >
                        {fullQuote}
                        <span className="inline-block w-[0.6em] h-[1em] bg-[var(--foreground)] ml-1 align-middle animate-blink" />
                    </p>
                    <div className="flex items-center justify-center gap-3 mt-4 md:mt-6">
                        <div className="h-[1px] w-8 md:w-16 bg-[var(--foreground)] opacity-20" />
                        <span
                            className="font-mono opacity-20 tracking-[0.3em] uppercase whitespace-nowrap"
                            style={{ fontSize: 'clamp(0.5rem, 0.65vw, 0.85rem)' }}
                        >
                            C.G. JUNG, 1945
                        </span>
                        <div className="h-[1px] w-8 md:w-16 bg-[var(--foreground)] opacity-20" />
                    </div>
                </div>
            </div>
            {/* Final Overlay Layers */}
            <HUDCircles />
            <TVOverlay />
        </div>
    );
}
