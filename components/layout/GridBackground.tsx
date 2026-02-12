"use client";

import { motion, useScroll, useTransform, useMotionValue, useMotionTemplate } from "framer-motion";
import { useEffect, useState } from "react";

export default function GridBackground() {
    const { scrollY } = useScroll();
    const rotate = useTransform(scrollY, [0, 1000], [0, 45]);
    const scale = useTransform(scrollY, [0, 1000], [1, 1.2]);
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

            {/* Base Grid */}
            <div
                className="absolute inset-0 z-0 bg-repeat opacity-[0.3]"
                style={{
                    backgroundImage: `linear-gradient(var(--grid-line) 1px, transparent 1px), linear-gradient(90deg, var(--grid-line) 1px, transparent 1px)`,
                    backgroundSize: `8rem 8rem`,
                    backgroundPosition: "center"
                }}
            />

            {/* Glow Grid Layer */}
            <motion.div
                className="absolute inset-0 z-0 bg-repeat opacity-[0.5]"
                style={{
                    backgroundImage: `linear-gradient(var(--grid-line) 1px, transparent 1px), linear-gradient(90deg, var(--grid-line) 1px, transparent 1px)`,
                    backgroundSize: `8rem 8rem`,
                    backgroundPosition: "center",
                    maskImage,
                    WebkitMaskImage: maskImage,
                }}
            />

            {/* Concentric Circles & Crosshairs */}
            <div className="absolute inset-0 flex items-center justify-center">
                {/* Main Crosshair */}
                <div className="absolute w-[1px] h-full bg-border/20" />
                <div className="absolute w-full h-[1px] bg-border/20" />

                {/* Circles */}
                <motion.div
                    style={{ rotate, scale }}
                    className="w-[40vw] h-[40vw] max-w-[600px] max-h-[600px] border border-border/10 rounded-full flex items-center justify-center"
                >
                    <div className="w-[70%] h-[70%] border border-border/10 rounded-full flex items-center justify-center">
                        <div className="w-[50%] h-[50%] border border-border/10 rounded-full" />
                    </div>
                </motion.div>

                {/* Diagonal guides (Optional based on ref) */}
                <div className="absolute w-[120%] h-[1px] bg-border/10 rotate-45" />
                <div className="absolute w-[120%] h-[1px] bg-border/10 -rotate-45" />
            </div>

        </div>
    );
}
