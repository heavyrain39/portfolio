import React from "react";
import { motion } from "framer-motion";
import type { FireMode } from "./types";

type MiniGameHudProps = {
    heatRatio: number;
    isHeatWarning: boolean;
    isOverheated: boolean;
    heatVisualOpacity: number;
    uiScore: number;
    isMuted: boolean;
    fireMode: FireMode;
    onToggleMute: () => void;
};

export default function MiniGameHud({
    heatRatio,
    isHeatWarning,
    isOverheated,
    heatVisualOpacity,
    uiScore,
    isMuted,
    fireMode,
    onToggleMute
}: MiniGameHudProps) {
    return (
        <div className="absolute bottom-8 left-8 right-8 flex items-end justify-between z-10 pointer-events-none">
            <div className="select-none pb-2">
                <div className="font-mono text-xs font-bold tracking-widest text-foreground space-y-1.5">
                    <div className="w-[calc(18ch+1.7em)] grid grid-cols-[5.2ch_1fr] items-center gap-x-4">
                        <span className="opacity-50 whitespace-nowrap">MODE</span>
                        <div className="ml-[5px] flex items-center gap-5">
                            <span className={fireMode === "dual" ? "opacity-50" : "opacity-[0.15]"}>DUAL</span>
                            <span className={fireMode === "quad" ? "opacity-50" : "opacity-[0.15]"}>QUAD</span>
                        </div>
                    </div>

                    <div className="w-[calc(18ch+1.7em)] grid grid-cols-[5.2ch_1fr] items-center gap-x-4">
                        <motion.span
                            className="whitespace-nowrap"
                            animate={
                                isHeatWarning && !isOverheated
                                    ? { opacity: [0.5, 0.9, 0.5] }
                                    : { opacity: heatVisualOpacity }
                            }
                            transition={
                                isHeatWarning && !isOverheated
                                    ? { duration: 0.8, repeat: Infinity, ease: "easeInOut" }
                                    : { duration: 0.2 }
                            }
                        >
                            HEAT
                        </motion.span>
                        <div className="relative h-[4px] bg-foreground/5 overflow-hidden">
                            <motion.div
                                className="absolute inset-y-0 left-0 bg-foreground"
                                style={{ opacity: heatVisualOpacity }}
                                animate={{
                                    width: `${Math.max(0, Math.min(100, heatRatio * 100))}%`,
                                    opacity: isHeatWarning && !isOverheated ? [0.5, 0.9, 0.5] : heatVisualOpacity
                                }}
                                transition={{
                                    width: { duration: 0.1, ease: "linear" },
                                    opacity: {
                                        duration: 0.8,
                                        repeat: isHeatWarning && !isOverheated ? Infinity : 0,
                                        ease: "easeInOut"
                                    }
                                }}
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="w-[calc(18ch+1.7em)] opacity-50 whitespace-nowrap">TARGETS TERMINATED</span>
                        <span className="inline-block min-w-[4ch] text-right tabular-nums">
                            <motion.span
                                key={uiScore}
                                animate={{ scale: [1.5, 1] }}
                                transition={{ duration: 0.15 }}
                                className="text-cyan-500 inline-block origin-center"
                            >
                                {uiScore.toString().padStart(3, "0")}
                            </motion.span>
                        </span>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <div className="text-[10px] font-mono opacity-30 text-right text-foreground">
                    <div>WHEEL_TO_SWITCH</div>
                    <div>CLICK_TO_ENGAGE</div>
                </div>

                <button
                    onClick={onToggleMute}
                    className="p-3 opacity-50 hover:opacity-100 transition-opacity pointer-events-auto text-foreground"
                    title={isMuted ? "Unmute Sound" : "Mute Sound"}
                >
                    {isMuted ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 5L6 9H2v6h4l5 4V5z" />
                            <line x1="23" y1="9" x2="17" y2="15" />
                            <line x1="17" y1="9" x2="23" y2="15" />
                        </svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                            <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
                        </svg>
                    )}
                </button>
            </div>
        </div>
    );
}
