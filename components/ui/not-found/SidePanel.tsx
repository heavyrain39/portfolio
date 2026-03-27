"use client";

import React, { useEffect, useState } from "react";

const cellBorder = '1px solid color-mix(in srgb, var(--foreground) 10%, transparent)';

/* ── Bordered Section Wrapper ── */
function Cell({ children, className = "", flex = false }: { children: React.ReactNode; className?: string; flex?: boolean }) {
    return (
        <div
            className={`px-4 py-3 ${flex ? 'flex-1 min-h-0' : ''} ${className}`}
            style={{ borderBottom: cellBorder }}
        >
            {children}
        </div>
    );
}

/* ── Wave Chart ── */
export function WaveChart({ label, height = 40 }: { label: string; height?: number }) {
    const [path, setPath] = useState("");

    useEffect(() => {
        let frame = 0;
        let raf: number;
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
            raf = requestAnimationFrame(update);
        };
        update();
        return () => cancelAnimationFrame(raf);
    }, [height]);

    return (
        <div className="flex flex-col gap-1 w-full">
            <div className="flex justify-between items-center">
                <span className="text-[8px] tracking-widest opacity-40 uppercase">{label}</span>
                <span className="text-[7px] opacity-20">LIVE_FEED</span>
            </div>
            <svg width="100%" height={height} className="overflow-visible stroke-[var(--foreground)] opacity-40">
                <path d={path} fill="none" strokeWidth="0.5" />
            </svg>
        </div>
    );
}

/* ── Data Gauge ── */
export function DataGauge({ label, max, suffix = "" }: { label: string; max: number; suffix?: string }) {
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
        <div className="flex flex-col gap-1 w-full">
            <div className="flex justify-between text-[8px] tracking-[0.15em] opacity-50 uppercase">
                <span>{label}</span>
                <span className="opacity-80 tabular-nums">{Math.round(value)}{suffix}</span>
            </div>
            <div className="w-full h-[5px] flex gap-[1px]">
                {Array.from({ length: 40 }).map((_, i) => (
                    <div
                        key={i}
                        className="h-full flex-1 transition-colors duration-500"
                        style={{
                            backgroundColor: 'var(--foreground)',
                            opacity: (i / 40) * 100 < percentage ? 0.5 : 0.04,
                        }}
                    />
                ))}
            </div>
        </div>
    );
}

/* ── Coordinates Panel ── */
export function CoordinatesPanel() {
    return (
        <div className="flex flex-col gap-1.5 w-full text-[9px] opacity-60 uppercase tracking-widest">
            <div className="flex justify-between">
                <span>SECTOR</span>
                <span className="opacity-100 font-bold">NULL_VOID</span>
            </div>
            <div className="flex justify-between">
                <span>COORD_X</span>
                <span className="tabular-nums">0xAF88_2A</span>
            </div>
            <div className="flex justify-between">
                <span>COORD_Y</span>
                <span className="tabular-nums">0x00E2_FF</span>
            </div>
            <div className="h-[0.5px] w-full bg-[var(--foreground)]/15 my-0.5" />
            <div className="flex justify-between text-[7px] opacity-40">
                <span>SYS_OVERRIDE</span>
                <span>MANUAL_ACT</span>
            </div>
        </div>
    );
}

/* ── Barcode ── */
export function Barcode() {
    return (
        <div className="flex gap-[1px] h-5 opacity-15">
            {[2, 4, 1, 3, 2, 5, 1, 2, 4, 1, 3, 2, 1, 4, 2].map((w, i) => (
                <div key={i} className="bg-[var(--foreground)] h-full" style={{ width: w }} />
            ))}
        </div>
    );
}

/* ══════════════════════════════
   LEFT PANEL — Port Diagnostics
   ══════════════════════════════ */
export function SidePanelLeft() {
    return (
        <div className="flex flex-col h-full font-mono text-[var(--foreground)] overflow-hidden">

            {/* Section header */}
            <Cell>
                <div className="flex items-center justify-between">
                    <span className="text-[9px] tracking-[0.3em] uppercase opacity-60 font-bold">PORT // DIAG</span>
                    <span className="text-[7px] opacity-25 tracking-wider">ACTIVE</span>
                </div>
            </Cell>

            {/* Coordinates */}
            <Cell>
                <CoordinatesPanel />
            </Cell>

            {/* Gauges */}
            <Cell>
                <DataGauge label="HE TANK P" max={3480} />
            </Cell>
            <Cell>
                <DataGauge label="N2 TANK P" max={3540} />
            </Cell>

            {/* Wave Chart (fills remaining) */}
            <Cell flex>
                <WaveChart label="VID_INPUT_STREAM" height={40} />
            </Cell>

            {/* Barcode footer */}
            <div className="px-4 py-2 mt-auto">
                <Barcode />
            </div>
        </div>
    );
}

/* ══════════════════════════════
   RIGHT PANEL — Starboard Systems
   ══════════════════════════════ */
export function SidePanelRight() {
    return (
        <div className="flex flex-col h-full font-mono text-[var(--foreground)] overflow-hidden">

            {/* Section header */}
            <Cell>
                <div className="flex items-center justify-between">
                    <span className="text-[9px] tracking-[0.3em] uppercase opacity-60 font-bold">STBD // SYS</span>
                    <span className="text-[7px] opacity-25 tracking-wider">NOMINAL</span>
                </div>
            </Cell>

            {/* Gauges */}
            <Cell>
                <DataGauge label="FUEL_RESERVE" max={100} suffix="%" />
            </Cell>
            <Cell>
                <DataGauge label="H2O_LIFE_SYS" max={100} suffix="%" />
            </Cell>

            {/* Wave Chart */}
            <Cell flex>
                <WaveChart label="SYS_TELEMETRY" height={50} />
            </Cell>

            {/* Temperature readout */}
            <div
                className="grid grid-cols-2 text-[9px] uppercase tracking-widest"
                style={{ borderBottom: cellBorder }}
            >
                <div className="px-4 py-2.5 flex flex-col gap-0.5" style={{ borderRight: cellBorder }}>
                    <span className="text-[7px] opacity-35">INT</span>
                    <span className="text-[11px] font-bold opacity-70">20.4°C</span>
                </div>
                <div className="px-4 py-2.5 flex flex-col gap-0.5">
                    <span className="text-[7px] opacity-35">EXT</span>
                    <span className="text-[11px] font-bold opacity-40">-272°C</span>
                </div>
            </div>

            {/* Barcode footer */}
            <div className="px-4 py-2 mt-auto">
                <Barcode />
            </div>
        </div>
    );
}
