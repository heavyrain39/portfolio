"use client";

import { motion } from "framer-motion";

export default function DecorativeSymbol() {
    return (
        <motion.span
            className="inline-block"
            style={{
                width: "0.5em",
                height: "0.5em",
                position: "relative",
                top: "-0.3em", // Adjust to sit at the top half relative to font center
                marginLeft: "0.2em"
            }}
        >
            <motion.svg
                viewBox="0 0 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full"
                animate={{
                    rotate: [0, 0, 45, 1125, 1080, 1080]
                }}
                transition={{
                    duration: 4.5, // 10% faster (from 5s)
                    times: [0, 0.1, 0.2, 0.7, 0.9, 1], // Shorter rest (0.1 instead of 0.2)
                    ease: "easeInOut",
                    repeat: Infinity,
                    repeatDelay: 0.5 // Shorter delay between loops
                }}
            >
                {/* Vertical Line */}
                <line x1="50" y1="0" x2="50" y2="100" stroke="currentColor" strokeWidth="6" />
                {/* Horizontal Line */}
                <line x1="0" y1="50" x2="100" y2="50" stroke="currentColor" strokeWidth="6" />
                {/* Diagonal Line (Made longer: 20/80 -> 10/90) */}
                <line x1="10" y1="90" x2="90" y2="10" stroke="currentColor" strokeWidth="6" />
            </motion.svg>
        </motion.span>
    );
}
