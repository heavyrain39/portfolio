"use client";

import React, { useMemo, useRef } from "react";
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

    const driftValue = useMotionValue(0);
    const transformY = useTransform(driftValue, v => `${v}em`);

    // Jittery Random Walk state
    const posRef = useRef(0);
    const velRef = useRef(0);

    useAnimationFrame(() => {
        // Subtle random drift impulse
        const drift = (Math.random() - 0.5) * 0.01;
        // Very weak spring force for slow center-return
        const spring = -posRef.current * 0.01;
        // High floatiness (low energy loss)
        const damping = 0.98;

        velRef.current = (velRef.current + drift + spring) * damping;
        posRef.current += velRef.current;

        // Hard clamp to 1.5 slots for calmness
        if (Math.abs(posRef.current) > 1.5) {
            posRef.current = Math.sign(posRef.current) * 1.5;
            velRef.current *= -0.1;
        }

        driftValue.set(posRef.current * 1.5);
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
