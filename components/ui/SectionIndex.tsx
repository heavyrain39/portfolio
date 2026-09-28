"use client";

import { motion } from "framer-motion";

// Numbered sections on the home page: Works, Auditory Log, Entity Profile.
const SECTION_COUNT = 3;

interface SectionIndexProps {
    index: number;
    label: string;
    total?: number;
    className?: string;
}

// HUD-style section marker: "01 ──── WORKS /03".
// The rule draws in once when the section enters view.
export default function SectionIndex({ index, label, total = SECTION_COUNT, className = "" }: SectionIndexProps) {
    const pad = (value: number) => String(value).padStart(2, "0");

    return (
        <div
            className={`flex items-center gap-3 font-mono text-xs tracking-[0.3em] select-none ${className}`}
            aria-hidden="true"
        >
            <span className="opacity-70">{pad(index)}</span>
            <motion.span
                className="block h-px w-10 bg-current opacity-30 origin-left"
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true, margin: "-40px 0px" }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            />
            <span className="opacity-40">{label}</span>
            <span className="opacity-20">/{pad(total)}</span>
        </div>
    );
}
