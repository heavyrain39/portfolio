"use client";
import { motion, useMotionValue, useMotionTemplate } from "framer-motion";
import { useEffect, useState } from "react";

export default function GridBackground() {
    const [mounted, setMounted] = useState(false);

    // Mouse tracking for glow effect
    const mouseX = useMotionValue(-100);
    const mouseY = useMotionValue(-100);

    useEffect(() => {
        setMounted(true);
        const handleMouseMove = (e: MouseEvent) => {
            mouseX.set(e.clientX);
            mouseY.set(e.clientY);
        };
        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, [mouseX, mouseY]);

    const maskImage = useMotionTemplate`radial-gradient(300px circle at ${mouseX}px ${mouseY}px, black, transparent)`;

    if (!mounted) return null;

    return (
        <div className="fixed inset-0 z-[-1] pointer-events-none overflow-hidden select-none">
            {/* Base Grid Layer (Darker) */}
            <div
                className="absolute inset-0 z-0 bg-repeat"
                style={{
                    backgroundImage: `linear-gradient(var(--grid-line) 1px, transparent 1px), linear-gradient(90deg, var(--grid-line) 1px, transparent 1px)`,
                    backgroundSize: `8rem 8rem`,
                    backgroundPosition: "center",
                    opacity: 0.3
                }}
            />

            {/* Glow Layer (Brighter) - Masked */}
            <motion.div
                className="absolute inset-0 z-0"
                style={{
                    maskImage,
                    WebkitMaskImage: maskImage,
                }}
            >
                {/* Bright Grid */}
                <div
                    className="absolute inset-0 bg-repeat"
                    style={{
                        backgroundImage: `linear-gradient(var(--grid-line) 1px, transparent 1px), linear-gradient(90deg, var(--grid-line) 1px, transparent 1px)`,
                        backgroundSize: `8rem 8rem`,
                        backgroundPosition: "center",
                        opacity: 0.6
                    }}
                />
            </motion.div>
        </div>
    );
}
