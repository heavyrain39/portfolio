"use client";

import React, { useEffect, useState } from "react";
import { motion, MotionValue } from "framer-motion";

export function SidePanel({ side, children }: { side: "left" | "right", children: React.ReactNode, mouseX: MotionValue<number>, mouseY: MotionValue<number> }) {
    return (
        <div 
            className={`absolute top-0 bottom-0 ${side === "left" ? "left-4 md:left-12" : "right-4 md:right-12"} w-48 md:w-64 flex flex-col justify-center gap-6 py-24 pointer-events-none mix-blend-screen opacity-90`}
        >
            {children}
        </div>
    );
}

export function PanelHeader({ title, sub }: { title: string, sub?: string }) {
    return (
        <div className="flex flex-col gap-1 mb-2 border-l-2 border-[var(--foreground)] pl-3 py-1 opacity-70">
            <span className="text-[11px] font-mono font-bold tracking-[0.2em] uppercase text-[var(--foreground)]">{title}</span>
            {sub && <span className="text-[8px] font-mono opacity-50 tracking-widest">{sub}</span>}
        </div>
    );
}

export function Barcode({ className }: { className?: string }) {
    return (
        <div className={`flex gap-[1px] h-6 opacity-20 ${className}`}>
            {[2, 4, 1, 3, 2, 5, 1, 2, 4, 1, 3].map((w, i) => (
                <div key={i} className="bg-[var(--foreground)] h-full" style={{ width: w }} />
            ))}
        </div>
    );
}

export function WaveChart({ label, height = 40 }: { label: string, height?: number }) {
    const [path, setPath] = useState("");

    useEffect(() => {
        let frame = 0;
        const width = 200;
        const update = () => {
            frame += 1;
            let d = `M 0 ${height / 2}`;
            for (let i = 0; i <= width; i += 5) {
                const y = Math.sin((i + frame * 1.5) * 0.08) * (height / 4) + 
                          Math.sin((i - frame * 0.5) * 0.2) * (height / 8) + 
                          (height / 2);
                d += ` L ${i} ${y}`;
            }
            setPath(d);
            requestAnimationFrame(update);
        };
        update();
    }, [height]);

    return (
        <div className="flex flex-col gap-1 w-full bg-[var(--foreground)]/5 p-2 rounded-sm border border-[var(--foreground)]/10">
            <div className="flex justify-between items-center mb-1">
                <span className="text-[8px] font-mono tracking-widest opacity-40 uppercase">{label}</span>
                <span className="text-[8px] font-mono opacity-20">LIVE_FEED</span>
            </div>
            <svg width="100%" height={height} className="overflow-visible stroke-[var(--foreground)] opacity-40">
                <path d={path} fill="none" strokeWidth="0.5" />
            </svg>
        </div>
    );
}

export function DataGauge({ label, max, suffix = "" }: { label: string, max: number, suffix?: string }) {
    const [value, setValue] = useState(max * 0.8);

    useEffect(() => {
        const interval = setInterval(() => {
            const delta = (Math.random() - 0.5) * (max * 0.05);
            setValue(v => Math.max(0, Math.min(max, v + delta)));
        }, 1200);
        return () => clearInterval(interval);
    }, [max]);

    const percentage = (value / max) * 100;

    return (
        <div className="flex flex-col gap-1 w-full font-mono">
            <div className="flex justify-between text-[9px] tracking-[0.2em] opacity-50 uppercase mb-1">
                <span>{label}</span>
                <span className="opacity-80">{Math.round(value)}{suffix}</span>
            </div>
            <div className="w-full h-[6px] flex gap-[1px]">
                {Array.from({ length: 40 }).map((_, i) => (
                    <div 
                        key={i} 
                        className="h-full flex-1 transition-colors duration-500"
                        style={{ 
                            backgroundColor: (i / 40) * 100 < percentage ? 'var(--foreground)' : 'var(--foreground)',
                            opacity: (i / 40) * 100 < percentage ? 0.6 : 0.05 
                        }}
                    />
                ))}
            </div>
        </div>
    );
}

export function CoordinatesPanel() {
    return (
        <div className="flex flex-col gap-2 w-full font-mono text-[10px] opacity-60 uppercase tracking-widest mt-auto">
            <div className="flex justify-between">
                <span>SECTOR</span>
                <span className="opacity-100 font-bold text-[var(--foreground)]">NULL_VOID</span>
            </div>
            <div className="flex justify-between">
                <span>COORD_X</span>
                <span>0xAF88_2A</span>
            </div>
            <div className="flex justify-between">
                <span>COORD_Y</span>
                <span>0x00E2_FF</span>
            </div>
            <div className="h-[0.5px] w-full bg-[var(--foreground)]/20 my-1" />
            <div className="flex justify-between text-[8px] opacity-40">
                <span>SYS_OVERRIDE</span>
                <span>MANUAL_ACT</span>
            </div>
            <Barcode className="mt-2" />
        </div>
    );
}
