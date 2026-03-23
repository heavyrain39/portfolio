"use client";

import React, { useEffect, useState } from "react";
import { motion, MotionValue, useTransform } from "framer-motion";
import { SidePanel, WaveChart, DataGauge, CoordinatesPanel } from "./SidePanel";

interface CockpitHUDProps {
    mouseX: MotionValue<number>;
    mouseY: MotionValue<number>;
}

export default function CockpitHUD({ mouseX, mouseY }: CockpitHUDProps) {
    const [quoteText, setQuoteText] = useState("");
    const fullQuote = `"The spirit is so intimately connected with the roots of man's being that it powerfully and seductively leads him to believe he is the creator of the spirit, and that he possesses it. But in reality, it is the primordial phenomenon of the spirit that possesses man."`;

    useEffect(() => {
        let i = 0;
        const interval = setInterval(() => {
            setQuoteText(fullQuote.slice(0, i));
            i++;
            if (i > fullQuote.length) clearInterval(interval);
        }, 40);
        return () => clearInterval(interval);
    }, []);

    return (
        <motion.div
            className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-8"
        >
            {/* Top 404 Header inside the HUD */}
            <div className="absolute top-12 flex flex-col items-center opacity-90 mix-blend-screen overflow-visible">
                <div className="flex gap-4 items-center mb-1">
                    <span className="text-[9px] tracking-[0.5em] text-[var(--foreground)] opacity-40 font-mono uppercase">
                        System.Diagnostic.v9.4
                    </span>
                    <div className="h-[1px] w-12 bg-[var(--foreground)] opacity-20" />
                    <span className="text-[9px] tracking-[0.5em] text-[var(--foreground)] opacity-40 font-mono uppercase">
                        ID: TRACE_0x88FE2A
                    </span>
                </div>
                <h1 className="text-9xl md:text-[11rem] font-serif font-bold tracking-tighter leading-none text-[var(--foreground)] drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                    404
                </h1>
                <div className="mt-2 px-3 py-1 border border-[var(--foreground)]/20 bg-[var(--foreground)]/5 text-[10px] font-mono tracking-[0.3em] uppercase opacity-60">
                    Sequence Anomaly Detected
                </div>
            </div>

            {/* Central Round Wireframe Window */}
            <div className="relative w-[320px] h-[320px] md:w-[600px] md:h-[600px] flex items-center justify-center pointer-events-none">
                {/* Outer concentric hairline rings */}
                <div className="absolute inset-[-20px] rounded-full border-[0.5px] border-[var(--foreground)] opacity-[0.05]" />
                <div className="absolute inset-[-60px] rounded-full border-[0.5px] border-[var(--foreground)] opacity-[0.03]" />
                <div className="absolute inset-0 rounded-full border-[1px] border-[var(--foreground)] opacity-30" />
                
                {/* Complex SVG HUD - Ultra Thin */}
                <svg className="absolute inset-0 w-full h-full opacity-60 mix-blend-screen overflow-visible" viewBox="0 0 200 200">
                    <defs>
                        <filter id="glow">
                            <feGaussianBlur stdDeviation="0.5" result="coloredBlur"/>
                            <feMerge>
                                <feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/>
                            </feMerge>
                        </filter>
                    </defs>
                    <g stroke="var(--foreground)" fill="none" strokeWidth="0.3" filter="url(#glow)">
                        {/* Center Firing Reference Area */}
                        <circle cx="100" cy="100" r="2" strokeWidth="0.5" opacity="0.8" />
                        <line x1="100" y1="85" x2="100" y2="92" />
                        <line x1="100" y1="108" x2="100" y2="115" />
                        <line x1="85" y1="100" x2="92" y2="100" />
                        <line x1="108" y1="100" x2="115" y2="100" />
                        
                        {/* Pitch Ladder - More technical */}
                        {[-20, -10, 10, 20].map(val => (
                            <g key={val} opacity={0.5}>
                                <line x1="88" y1={100 - val} x2="112" y2={100 - val} strokeDasharray="1 2" />
                                <path d={`M 88 ${100-val} L 88 ${100-val+2}`} />
                                <path d={`M 112 ${100-val} L 112 ${100-val+2}`} />
                                <text x="115" y={100 - val + 1.5} fontSize="3" fill="var(--foreground)" className="font-mono opacity-60 italic">{val}</text>
                            </g>
                        ))}
                        
                        {/* Tracking Brackets with micro-ticks */}
                        <g opacity="0.8">
                            <path d="M 65 85 L 60 85 L 60 115 L 65 115" />
                            <path d="M 135 85 L 140 85 L 140 115 L 135 115" />
                            <line x1="58" y1="100" x2="62" y2="100" />
                            <line x1="138" y1="100" x2="142" y2="100" />
                        </g>

                        {/* Compass Ticks with varied length */}
                        {Array.from({ length: 72 }).map((_, i) => {
                            const angle = (i * 5 * Math.PI) / 180;
                            const r1 = 100;
                            const isMajor = i % 18 === 0;
                            const isMedium = i % 2 === 0;
                            const r2 = isMajor ? 88 : isMedium ? 95 : 97;
                            return (
                                <line 
                                    key={i}
                                    x1={100 + Math.cos(angle) * r1} y1={100 + Math.sin(angle) * r1}
                                    x2={100 + Math.cos(angle) * r2} y2={100 + Math.sin(angle) * r2}
                                    opacity={isMajor ? 0.6 : 0.2}
                                />
                            );
                        })}
                    </g>
                </svg>

                {/* Aesthetic Hairline Grids clipping into the circular view */}
                <div className="absolute inset-0 opacity-10 pointer-events-none">
                    <div className="absolute top-1/2 left-0 w-full h-[0.5px] bg-[var(--foreground)]" />
                    <div className="absolute left-1/2 top-0 h-full w-[0.5px] bg-[var(--foreground)]" />
                </div>
            </div>

            {/* Bottom Status Bar for detail */}
            <div className="absolute bottom-4 left-0 w-full px-12 flex justify-between font-mono text-[9px] opacity-30 tracking-[0.2em] uppercase">
                <span>Caladan.Bio-Systems.v9.2.4</span>
                <div className="flex gap-8">
                    <span>LAT: 35.6895° N</span>
                    <span>LONG: 139.6917° E</span>
                    <span>Status: [ Orphaned ]</span>
                </div>
            </div>

            {/* Jung Quote Monitor */}
            <div className="absolute bottom-16 max-w-2xl bg-[var(--background)]/10 backdrop-blur-sm border border-[var(--foreground)]/20 p-4 rounded-sm">
                <p className="font-mono text-xs md:text-sm leading-relaxed text-justify break-words uppercase tracking-wide opacity-80 min-h-[80px]">
                    {quoteText}
                    <span className="animate-pulse">_</span>
                </p>
                <p className="mt-4 font-mono text-[10px] opacity-50 tracking-widest uppercase text-right w-full">
                    — C.G. Jung, The Phenomenology of the Spirit in Fairy Tales (1945)
                </p>
            </div>

            {/* Left Side Panel */}
            <SidePanel side="left" mouseX={mouseX} mouseY={mouseY}>
                <CoordinatesPanel />
                <DataGauge label="HE TANK P" max={3480} suffix="" />
                <DataGauge label="N2 TANK P" max={3540} suffix="" />
                <WaveChart label="VID INPUT" height={50} />
            </SidePanel>

            {/* Right Side Panel */}
            <SidePanel side="right" mouseX={mouseX} mouseY={mouseY}>
                <DataGauge label="FUEL %" max={100} suffix="%" />
                <DataGauge label="H2O %" max={100} suffix="%" />
                <WaveChart label="SYS_TELEMETRY" height={60} />
                <div className="flex flex-col gap-1 w-full font-mono text-xs opacity-80 uppercase tracking-widest mt-8">
                    <div className="flex justify-between"><span>INT</span> <span>68°F 20°C</span></div>
                    <div className="flex justify-between"><span>EXT</span> <span>-458°F -272°C</span></div>
                </div>
            </SidePanel>
        </motion.div>
    );
}
