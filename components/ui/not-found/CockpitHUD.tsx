"use client";

import React from "react";
import VerticalHUD from "./VerticalHUD";

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
                        d={`M -20,${y} Q 100,${y + curve} 220,${y}`}
                        opacity={Math.max(0, 0.05 + Math.abs(i) * 0.015)}
                    />
                );
            })}
            {lines.map(i => {
                const x = 100 + i * 12;
                const curve = i * Math.abs(i) * 1.2;
                return (
                    <path
                        key={`v${i}`}
                        d={`M ${x},-20 Q ${x + curve},100 ${x},220`}
                        opacity={Math.max(0, 0.05 + Math.abs(i) * 0.015)}
                    />
                );
            })}
        </g>
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
                    <circle cx="100" cy="100" r="98" />
                </clipPath>
            </defs>

            <g clipPath="url(#viewport-clip)">
                <SphericalGrid />
            </g>

            <g stroke="var(--foreground)" strokeWidth="0.3">
                {/* Crosshair center dot */}
                <circle cx="100" cy="100" r="1.5" strokeWidth="0.5" opacity="0.7" />
                {/* Crosshair arms */}
                <line x1="100" y1="88" x2="100" y2="96" opacity="0.5" />
                <line x1="100" y1="104" x2="100" y2="112" opacity="0.5" />
                <line x1="88" y1="100" x2="96" y2="100" opacity="0.5" />
                <line x1="104" y1="100" x2="112" y2="100" opacity="0.5" />

                {/* Corner brackets */}
                <polyline points="8,22 8,8 22,8" strokeWidth="0.5" opacity="0.2" fill="none" />
                <polyline points="178,8 192,8 192,22" strokeWidth="0.5" opacity="0.2" fill="none" />
                <polyline points="8,178 8,192 22,192" strokeWidth="0.5" opacity="0.2" fill="none" />
                <polyline points="178,192 192,192 192,178" strokeWidth="0.5" opacity="0.2" fill="none" />

                <line x1="100" y1="1" x2="100" y2="10" strokeWidth="0.5" opacity="0.15" />
                <line x1="100" y1="190" x2="100" y2="199" strokeWidth="0.5" opacity="0.15" />
                <line x1="1" y1="100" x2="10" y2="100" strokeWidth="0.5" opacity="0.15" />
                <line x1="190" y1="100" x2="199" y2="100" strokeWidth="0.5" opacity="0.15" />

                <line x1="16" y1="16" x2="22" y2="22" strokeWidth="0.4" opacity="0.1" />
                <line x1="178" y1="22" x2="184" y2="16" strokeWidth="0.4" opacity="0.1" />
                <line x1="16" y1="184" x2="22" y2="178" strokeWidth="0.4" opacity="0.1" />
                <line x1="178" y1="178" x2="184" y2="184" strokeWidth="0.4" opacity="0.1" />

                <circle cx="100" cy="100" r="35" strokeWidth="0.2" opacity="0.06" strokeDasharray="1.5 3" />
            </g>
        </svg>
    );
}

export default function CockpitHUD() {
    const fullQuote = `"The spirit is so intimately connected with the roots of man's being that it powerfully and seductively leads him to believe he is the creator of the spirit, and that he possesses it. But in reality, it is the primordial phenomenon of the spirit that possesses man."`;

    return (
        <div
            className="h-full w-full pointer-events-none overflow-hidden"
            style={{ display: 'grid', gridTemplateRows: 'auto 1fr auto' }}
        >
            {/* ═══ Row 1: Top Header (404 + Barcode Lines) ═══
                z-30 so it paints ABOVE the viewport mask shadow */}
            <div className="relative z-30 flex justify-center w-full pt-4 md:pt-8 lg:pt-12 px-4 md:px-8">
                <div className="w-full max-w-[min(95vw,1000px)] flex items-end justify-between">
                    <div className="flex-1 flex items-end justify-start opacity-20 gap-2 md:gap-4 pb-[10px] md:pb-[15px]">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div key={`leftline-${i}`} className="w-[1px] h-[20px] md:h-[35px] bg-[var(--foreground)]" />
                        ))}
                    </div>

                    <h1
                        className="shrink-0 font-serif font-[900] tracking-tighter mx-4 md:mx-8 text-center"
                        style={{ fontSize: 'clamp(5rem, 10vw, 10rem)', letterSpacing: '-0.05em', lineHeight: '0.85' }}
                    >
                        404
                    </h1>

                    <div className="flex-1 flex items-end justify-end opacity-20 gap-2 md:gap-4 pb-[10px] md:pb-[15px]">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div key={`rightline-${i}`} className="w-[1px] h-[20px] md:h-[35px] bg-[var(--foreground)]" />
                        ))}
                    </div>
                </div>
            </div>

            {/* ═══ Row 2: Viewport Circle + Vertical HUDs ═══
                1fr takes all remaining vertical space.
                min-h-0 prevents flex overflow.
                z-10 so the box-shadow mask sits behind Row 1 & Row 3. */}
            <div className="relative z-10 flex items-center justify-center w-full min-h-0">
                <div className="w-full max-w-[min(95vw,1000px)] flex flex-row items-center justify-between px-4 md:px-8">

                    {/* Left HUD — explicit height matching viewport */}
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
                        </div>

                        <div className="absolute top-[25%] left-1/2 -translate-x-1/2 z-10">
                            <div
                                className="px-4 py-1 bg-[var(--foreground)] text-[var(--background)] tracking-[0.3em] font-mono uppercase font-bold whitespace-nowrap"
                                style={{ fontSize: 'clamp(0.7rem, 0.9vw, 1.1rem)' }}
                            >
                                〔 ANOMALY DETECTED 〕
                            </div>
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
                        className="w-full font-mono leading-relaxed text-justify uppercase tracking-[0.05em] opacity-50"
                        style={{ fontSize: 'clamp(0.6rem, 0.8vw, 1rem)', textAlignLast: 'justify' }}
                    >
                        {fullQuote}
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
        </div>
    );
}
