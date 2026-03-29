"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function ReturnTicket() {
    const [timeStr, setTimeStr] = useState("YY-MM-DD HH:MM:SS");
    const [yTarget, setYTarget] = useState(700);

    useEffect(() => {
        const nudgeTimer = setTimeout(() => setYTarget(440), 2000);
        return () => clearTimeout(nudgeTimer);
    }, []);

    useEffect(() => {
        const updateTime = () => {
            const d = new Date();
            const yy = String(d.getFullYear()).slice(2);
            const mm = String(d.getMonth() + 1).padStart(2, '0');
            const dd = String(d.getDate()).padStart(2, '0');
            const hh = String(d.getHours()).padStart(2, '0');
            const min = String(d.getMinutes()).padStart(2, '0');
            const ss = String(d.getSeconds()).padStart(2, '0');
            setTimeStr(`${yy}-${mm}-${dd} ${hh}:${min}:${ss}`);
        };
        updateTime();
        const interval = setInterval(updateTime, 1000);
        return () => clearInterval(interval);
    }, []);

    // Ticket is 650px tall to ensure it never reveals its bottom edge when rotated.
    // Animate Y pushes it downwards by pixel offsets.
    return (
        <motion.div
            initial={{ y: 700, rotate: 0 }}          // initially hidden completely
            animate={{ y: yTarget, rotate: 0 }}      // rises up slightly after 2 seconds controlled by state
            whileHover={{ y: 80, rotate: -15 }}      // hovers up more fully (y:80) and tilts -15deg immediately
            transition={{ type: 'spring', stiffness: 1100, damping: 65, mass: 1 }}
            className="w-[280px] sm:w-[320px] h-[650px] bg-[var(--foreground)] text-[var(--background)] font-mono flex flex-col items-center select-none relative"
            style={{
                transformOrigin: "center 80%", // rotate around its lower point so it stays horizontally anchored
                /* Perforated holes mask using multiple gradients combined natively */
                maskImage: `
                    linear-gradient(to right, transparent 7px, black 7px, black calc(100% - 7px), transparent calc(100% - 7px)),
                    linear-gradient(to bottom, black 16px, transparent 16px),
                    radial-gradient(circle at 0 50%, transparent 5px, black 6px),
                    radial-gradient(circle at 100% 50%, transparent 5px, black 6px)
                `,
                maskSize: '100% 100%, 100% 100%, 8px 32px, 8px 32px',
                maskPosition: 'center, center, left 8px, right 8px',
                maskRepeat: 'no-repeat, no-repeat, repeat-y, repeat-y',
                WebkitMaskImage: `
                    linear-gradient(to right, transparent 7px, black 7px, black calc(100% - 7px), transparent calc(100% - 7px)),
                    linear-gradient(to bottom, black 16px, transparent 16px),
                    radial-gradient(circle at 0 50%, transparent 5px, black 6px),
                    radial-gradient(circle at 100% 50%, transparent 5px, black 6px)
                `,
                WebkitMaskSize: '100% 100%, 100% 100%, 8px 32px, 8px 32px',
                WebkitMaskPosition: 'center, center, left 8px, right 8px',
                WebkitMaskRepeat: 'no-repeat, no-repeat, repeat-y, repeat-y',
                boxShadow: "0 -4px 30px rgba(0,0,0,0.5)"
            }}
        >
            {/* Dashed lines inside the perforations on both sides */}
            <div className="absolute inset-0 pointer-events-none px-[12px]">
                <div className="w-full h-full border-x-[1.5px] border-dashed border-[var(--background)] opacity-40" />
            </div>

            <div className="w-full px-6 pt-10 pb-4 flex flex-col gap-3 text-sm relative z-10">

                {/* Header Row */}
                <div className="flex justify-between items-center whitespace-pre relative mb-3">
                    <span className="text-xl leading-none">⠾⠆⠍⠻⠟⠆</span>
                    <span className="tracking-tighter text-3xl scale-y-125 inline-block origin-top">𝄃𝄃𝄂𝄂𝄃𝄀𝄁𝄃𝄃</span>
                </div>

                <div className="text-center font-bold tracking-widest text-lg my-1">
                    RECOVERY AUTHORIZATION
                </div>

                <div className="flex flex-col gap-2 my-4 tracking-widest text-sm font-bold xl-px-2">
                    <div className="flex justify-between"><span>STATUS:</span><span>LOST SIGNAL</span></div>
                    <div className="flex justify-between"><span>LOCATION:</span><span>****404</span></div>
                    <div className="flex justify-between"><span>TIME:</span><span>{timeStr}</span></div>
                </div>

                <div className="text-center flex flex-col gap-1 my-5 leading-tight tracking-wider">
                    <div className="font-bold">* IMPORTANT NOTICE !! *</div>
                    <div className="font-normal text-xs mt-1 opacity-80 leading-relaxed uppercase tracking-wider">
                        Do not discard. This authorizes<br />
                        immediate return to navigation.
                    </div>
                </div>

                <div className="text-center mt-6 mb-2 tracking-[0.1em] font-bold">
                    {'〔 RETURN TO SURFACE ? 〕'}
                </div>

                <Link
                    href="/"
                    draggable={false}
                    className="group mx-auto focus:outline-none block w-full text-center my-3 relative z-20"
                    aria-label="Return to Surface"
                >
                    <motion.div
                        initial="initial"
                        whileHover="hover"
                        className="font-bold tracking-[0.2em] relative inline-block"
                    >
                        <span className="inline-block group-hover:bg-[var(--background)] group-hover:text-[var(--foreground)] px-4 py-2 transition-colors">
                            <motion.span
                                variants={{
                                    hover: {
                                        x: [0, 8, 0],
                                        transition: { duration: 0.6, repeat: Infinity, times: [0, 0.7, 1], ease: "easeInOut" }
                                    }
                                }}
                                className="inline-block"
                            >
                                〉〉〉
                            </motion.span>
                            {' EXECUTE '}
                            <motion.span
                                variants={{
                                    hover: {
                                        x: [0, -8, 0],
                                        transition: { duration: 0.6, repeat: Infinity, times: [0, 0.7, 1], ease: "easeInOut" }
                                    }
                                }}
                                className="inline-block"
                            >
                                〈〈〈
                            </motion.span>
                        </span>
                    </motion.div>
                </Link>

            </div>

        </motion.div>
    );
}
