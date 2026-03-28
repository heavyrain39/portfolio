"use client";

import React, { useMemo } from "react";
import { motion, useAnimationFrame, useMotionValue, useTransform } from "framer-motion";

interface VerticalHUDProps {
    side: "left" | "right";
}

export default function VerticalHUD({ side }: VerticalHUDProps) {
    const isLeft = side === "left";

    const numbers = useMemo(() => {
        if (isLeft) {
            return Array.from({ length: 41 }, (_, i) => (1131 - 20 + i).toString().padStart(4, '0'));
        } else {
            return Array.from({ length: 41 }, (_, i) => {
                const val = (20 - i) * 10;
                if (val === 0) return "\u00A000";
                if (val > 0) return `\u00A0${val}`;
                return val.toString();
            });
        }
    }, [isLeft]);

    // Smooth continuous drift using framer-motion's useAnimationFrame
    const driftValue = useMotionValue(0);
    const transformY = useTransform(driftValue, v => `${v}em`);

    useAnimationFrame((t) => {
        const time = t / 1000; // seconds
        // Complex natural smooth drift using sine waves combinations
        const drift = Math.sin(time * 0.5) * 1.2 + Math.cos(time * 0.8) * 0.8; 
        driftValue.set(drift * 1.5); // 1 slot ≈ 1.5em
    });

    return (
        <div 
            className={`flex items-center gap-2 h-full z-20 ${isLeft ? 'flex-row' : 'flex-row-reverse'}`}
            style={{ 
                maskImage: 'linear-gradient(to bottom, transparent 10%, black 50%, transparent 90%)',
                WebkitMaskImage: 'linear-gradient(to bottom, transparent 10%, black 50%, transparent 90%)'
            }}
        >
            {/* Nav Triangle Indicator */}
            <div 
                className="text-[var(--foreground)] opacity-80 shrink-0" 
                style={{ fontSize: 'clamp(0.7rem, 0.9vw, 1.1rem)' }}
            >
                {isLeft ? '▷' : '◁'}
            </div>

            {/* Scrolling Numbers */}
            <div className="overflow-hidden h-[60%] flex items-center justify-center w-[4vw] min-w-[50px] shrink-0">
                <motion.div 
                    style={{ y: transformY, fontSize: 'clamp(0.7rem, 0.9vw, 1.1rem)' }}
                    className="flex flex-col font-mono opacity-80"
                >
                    {numbers.map((num, i) => (
                        <div key={i} className="text-center" style={{ lineHeight: '1.5em', height: '1.5em' }}>
                            {num}
                        </div>
                    ))}
                </motion.div>
            </div>
        </div>
    );
}
