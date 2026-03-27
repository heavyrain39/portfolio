"use client";

import React from "react";
import { MotionValue } from "framer-motion";

interface CockpitHUDProps {
    mouseX: MotionValue<number>;
    mouseY: MotionValue<number>;
}

/* ── Curved Spherical Grid Lines ── */
function SphericalGrid() {
    const lines = [-4, -3, -2, -1, 1, 2, 3, 4];
    return (
        <g stroke="var(--foreground)" fill="none" strokeWidth="0.3">
            {/* Horizontal curved lines (latitude) */}
            {lines.map(i => {
                const y = 100 + i * 15;
                const curve = i * Math.abs(i) * 0.9;
                return (
                    <path
                        key={`h${i}`}
                        d={`M 8,${y} Q 100,${y + curve} 192,${y}`}
                        opacity={0.04 + Math.abs(i) * 0.005}
                    />
                );
            })}
            {/* Vertical curved lines (longitude) */}
            {lines.map(i => {
                const x = 100 + i * 15;
                const curve = i * Math.abs(i) * 0.9;
                return (
                    <path
                        key={`v${i}`}
                        d={`M ${x},8 Q ${x + curve},100 ${x},192`}
                        opacity={0.04 + Math.abs(i) * 0.005}
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
            {/* Clip mask for circular viewport */}
            <defs>
                <clipPath id="viewport-clip">
                    <circle cx="100" cy="100" r="98" />
                </clipPath>
            </defs>

            {/* Curved grid clipped to circle */}
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

                {/* Cardinal radial ticks */}
                <line x1="100" y1="1" x2="100" y2="10" strokeWidth="0.5" opacity="0.15" />
                <line x1="100" y1="190" x2="100" y2="199" strokeWidth="0.5" opacity="0.15" />
                <line x1="1" y1="100" x2="10" y2="100" strokeWidth="0.5" opacity="0.15" />
                <line x1="190" y1="100" x2="199" y2="100" strokeWidth="0.5" opacity="0.15" />

                {/* Diagonal ticks */}
                <line x1="16" y1="16" x2="22" y2="22" strokeWidth="0.4" opacity="0.1" />
                <line x1="178" y1="22" x2="184" y2="16" strokeWidth="0.4" opacity="0.1" />
                <line x1="16" y1="184" x2="22" y2="178" strokeWidth="0.4" opacity="0.1" />
                <line x1="178" y1="178" x2="184" y2="184" strokeWidth="0.4" opacity="0.1" />

                {/* Inner reference ring */}
                <circle cx="100" cy="100" r="35" strokeWidth="0.2" opacity="0.06" strokeDasharray="1.5 3" />
            </g>
        </svg>
    );
}

export default function CockpitHUD({ mouseX, mouseY }: CockpitHUDProps) {
    const fullQuote = `"The spirit is so intimately connected with the roots of man's being that it powerfully and seductively leads him to believe he is the creator of the spirit, and that he possesses it. But in reality, it is the primordial phenomenon of the spirit that possesses man."`;

    const cellBorder = '1px solid color-mix(in srgb, var(--foreground) 20%, transparent)';

    return (
        <div className="relative h-full pointer-events-none">
            {/* ── Engineering Overlay (centered in FULL cell for correct alignment) ── */}
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative w-[280px] h-[280px] md:w-[min(65vh,640px)] md:h-[min(65vh,640px)]">
                    <ViewportOverlay />

                    {/* "Sequence Anomaly Detected" — warning at top of viewport */}
                    <div className="absolute -top-7 left-1/2 -translate-x-1/2">
                        <div className="px-4 py-1.5 border border-[var(--foreground)]/25 bg-[var(--foreground)]/8 text-[10px] tracking-[0.3em] uppercase opacity-80 whitespace-nowrap">
                            Sequence Anomaly Detected
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Content Layers (z-10, opaque) ── */}
            <div className="relative z-10 flex flex-col h-full">
                {/* Header — clean 404 only */}
                <div
                    className="bg-[var(--background)] flex flex-col items-center justify-center py-5 shrink-0"
                    style={{ borderBottom: cellBorder }}
                >
                    <h1 className="text-7xl md:text-9xl font-serif font-bold tracking-tighter leading-none">
                        404
                    </h1>
                </div>

                {/* Spacer — transparent, lets the engineering overlay show through */}
                <div className="flex-1 min-h-0" />

                {/* Quote Panel */}
                <div
                    className="bg-[var(--background)] py-5 px-8 shrink-0"
                    style={{ borderTop: cellBorder }}
                >
                    <div className="max-w-3xl mx-auto space-y-2">
                        <p className="text-[10px] md:text-[11px] leading-relaxed text-justify uppercase tracking-[0.04em] opacity-60">
                            {fullQuote}
                        </p>
                        <div className="flex items-center justify-center gap-3">
                            <div className="h-[1px] w-12 bg-[var(--foreground)] opacity-10" />
                            <span className="text-[7px] opacity-25 tracking-[0.3em] uppercase whitespace-nowrap">
                                C.G. JUNG, 1945
                            </span>
                            <div className="h-[1px] w-12 bg-[var(--foreground)] opacity-10" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
