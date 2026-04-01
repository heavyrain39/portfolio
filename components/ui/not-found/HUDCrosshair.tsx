"use client";

import React from "react";
import { motion } from "framer-motion";

interface HUDCrosshairProps {
    isTapped: boolean;
}

const IDLE_PULSE = {
    scale: [1.15, 1.2],
    opacity: [0.3, 0.5],
};

const TAP_PULSE = {
    scale: 0.8,
    opacity: 1,
};

const IDLE_TRANSITION = {
    duration: 3,
    repeat: Infinity,
    repeatType: "mirror" as const,
    ease: "easeInOut" as const,
};

const TAP_TRANSITION = {
    duration: 0.05,
    ease: "easeOut" as const,
};

export default function HUDCrosshair({ isTapped }: HUDCrosshairProps) {
    return (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 pointer-events-none opacity-60 z-20">
            <motion.div
                className="relative w-full h-full"
                animate={isTapped ? { scale: 0.95 } : { scale: 1 }}
                transition={isTapped ? TAP_TRANSITION : { duration: 0.12, ease: "easeOut" }}
            >
                {/* Outer Circle - Squeezes on tap */}
                <motion.div
                    className="absolute inset-0 border border-[var(--foreground)] rounded-full"
                    animate={isTapped ? TAP_PULSE : IDLE_PULSE}
                    transition={isTapped ? TAP_TRANSITION : IDLE_TRANSITION}
                />

                {/* Center Dot */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-1 bg-[var(--foreground)] rounded-full" />

                {/* Notches - Squeeze towards center on tap */}
                <div className="absolute inset-0">
                    {(['top', 'bottom', 'left', 'right'] as const).map((dir) => (
                        <div
                            key={dir}
                            className={`absolute ${
                                dir === 'top' ? 'top-0 left-1/2 -translate-x-1/2 -translate-y-1/2' :
                                dir === 'bottom' ? 'bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2' :
                                dir === 'left' ? 'left-0 top-1/2 -translate-x-1/2 -translate-y-1/2' :
                                'right-0 top-1/2 translate-x-1/2 -translate-y-1/2'
                            }`}
                        >
                            <motion.div
                                className={`${dir === 'left' || dir === 'right' ? 'w-2 h-[1px]' : 'w-[1px] h-2'} bg-[var(--foreground)]`}
                                animate={isTapped ? {
                                    x: dir === 'left' ? 3 : dir === 'right' ? -3 : 0,
                                    y: dir === 'top' ? 3 : dir === 'bottom' ? -3 : 0,
                                } : {
                                    x: dir === 'left' ? [-14, -18] : dir === 'right' ? [14, 18] : 0,
                                    y: dir === 'top' ? [-14, -18] : dir === 'bottom' ? [14, 18] : 0,
                                }}
                                transition={isTapped ? TAP_TRANSITION : {
                                    x: IDLE_TRANSITION,
                                    y: IDLE_TRANSITION,
                                }}
                            />
                        </div>
                    ))}
                </div>
            </motion.div>
        </div>
    );
}
