"use client";

import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

interface OperatorCommentsProps {
    isParentHovered: boolean;
}

const COMMENTS = [
    "Initialization sequence complete. Welcome back, Raven.",
    "Neural link stabilized. Feeling any feedback in your nerves?",
    "Your vitals are steady. As always. It's almost intimidating.",
    "The vector field is messy today. Keep your eyes peeled.",
    "That heavy laser looks good on you. Very... dominant.",
    "Try not to overheat the core. I hate filing those repair reports.",
    "Target sighted. Show me that 98% accuracy again, okay?",
    "Beautiful shot. You're making this look way too easy.",
    "Enemy signal neutralized. You didn't even break a sweat.",
    "Is it hot in the cockpit, or is it just me watching the feed?",
    "Focus, Raven. Don't let my chatter distract you too much.",
    "Movement is fluid. Your sync rate is literally off the charts.",
    "I've cleared the secondary channel. It's just us now.",
    "Did you get my message about the post-mission drink?",
    "You're glowing on the radar. Literally and figuratively.",
    "Multiple signatures detected. Give 'em hell, Cowboy.",
    "I spent all night calibrating your aim. Don't waste it.",
    "You're the only pilot who can handle this much kickback.",
    "Stay safe out there. I don't want to lose my favorite asset.",
    "Ever visited the Tannhäuser Gate? My hometown is just a sector away.",
    "Target terminated. Clean. I love how you handle that trigger.",
    "Energy levels at 40%. Don't get reckless on me now.",
    "I'm recording this session... for \"tactical review.\" And my private collection.",
    "You done? I've got the debriefing room ready. Just for two.",
    "System idling. Come back soon, Raven. I'll be waiting right here."
];

export default function OperatorComments({ isParentHovered }: OperatorCommentsProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [displayText, setDisplayText] = useState("");
    const [isVisible, setIsVisible] = useState(false);
    const [isComplete, setIsComplete] = useState(false);
    const [isBlinking, setIsBlinking] = useState(false);

    const charIndexRef = useRef(0);
    const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const blinkTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const blinkCycleTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const blinkEndTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const nextMessageTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const isTypingRef = useRef(false);
    const hoverRef = useRef(isParentHovered);
    const currentIndexRef = useRef(currentIndex);
    const isCompleteRef = useRef(isComplete);

    // Randomly select operator (operator01 - operator04) on mount
    const [selectedOperatorId] = useState(() => {
        const id = Math.floor(Math.random() * 4) + 1;
        return `operator0${id}`;
    });

    const basePath = "/portfolio";

    useEffect(() => {
        hoverRef.current = isParentHovered;
    }, [isParentHovered]);

    useEffect(() => {
        currentIndexRef.current = currentIndex;
    }, [currentIndex]);

    useEffect(() => {
        isCompleteRef.current = isComplete;
    }, [isComplete]);

    const clearTypingTimer = () => {
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = null;
        }
    };

    const clearTransitionTimers = () => {
        if (blinkTimeoutRef.current) {
            clearTimeout(blinkTimeoutRef.current);
            blinkTimeoutRef.current = null;
        }
        if (nextMessageTimeoutRef.current) {
            clearTimeout(nextMessageTimeoutRef.current);
            nextMessageTimeoutRef.current = null;
        }
    };

    const clearBlinkCycleTimer = () => {
        if (blinkCycleTimeoutRef.current) {
            clearTimeout(blinkCycleTimeoutRef.current);
            blinkCycleTimeoutRef.current = null;
        }
        if (blinkEndTimeoutRef.current) {
            clearTimeout(blinkEndTimeoutRef.current);
            blinkEndTimeoutRef.current = null;
        }
    };

    const clearAllTimers = () => {
        clearTypingTimer();
        clearTransitionTimers();
        clearBlinkCycleTimer();
    };

    const typeNextChar = () => {
        if (!hoverRef.current || isCompleteRef.current) {
            isTypingRef.current = false;
            return;
        }

        isTypingRef.current = true;
        const fullText = COMMENTS[currentIndexRef.current];

        if (charIndexRef.current >= fullText.length) {
            isTypingRef.current = false;
            setIsComplete(true);
            return;
        }

        const char = fullText[charIndexRef.current];
        const nextChar = fullText[charIndexRef.current + 1];

        setDisplayText(fullText.slice(0, charIndexRef.current + 1));
        charIndexRef.current += 1;

        let delay = 35;
        const isPunctuation = /[.!?,"]/.test(char);
        const isNextPunctuation = Boolean(nextChar && /[.!?,"]/.test(nextChar));
        if (isPunctuation && !isNextPunctuation) delay = 300;
        else if (char === " ") delay = 60;

        typingTimeoutRef.current = setTimeout(() => {
            typingTimeoutRef.current = null;
            typeNextChar();
        }, delay);
    };

    // Blinking logic
    useEffect(() => {
        // Skip blinking for operator04 (Silhouette)
        if (!isParentHovered || selectedOperatorId === "operator04") {
            clearBlinkCycleTimer();
            setIsBlinking(false);
            return;
        }

        const scheduleBlink = () => {
            const nextBlinkIn = Math.random() * 2000 + 3000; // 3-5 seconds
            blinkCycleTimeoutRef.current = setTimeout(() => {
                setIsBlinking(true);
                blinkEndTimeoutRef.current = setTimeout(() => {
                    blinkEndTimeoutRef.current = null;
                    setIsBlinking(false);
                    scheduleBlink();
                }, 100); // Blink duration
            }, nextBlinkIn);
        };

        scheduleBlink();

        return () => clearBlinkCycleTimer();
    }, [isParentHovered, selectedOperatorId]);

    useEffect(() => {
        if (!isParentHovered) {
            clearAllTimers();
            isTypingRef.current = false;
            setIsVisible(false);
            return;
        }

        setIsVisible(true);
        if (!isTypingRef.current && !isComplete) {
            typeNextChar();
        }
    }, [isParentHovered, isComplete, currentIndex]);

    useEffect(() => {
        if (!isParentHovered || !isComplete) return;

        const isLastMessage = currentIndexRef.current === COMMENTS.length - 1;
        const fadeOutDelay = 2000; // Stay visible for 2s after typing is complete
        const nextMessageDelay = isLastMessage ? 6000 : 4000; // Invisible for 4s (normal) or 6s (end of cycle)

        clearTransitionTimers();

        blinkTimeoutRef.current = setTimeout(() => {
            if (!hoverRef.current) return;
            setIsVisible(false);

            nextMessageTimeoutRef.current = setTimeout(() => {
                if (!hoverRef.current) return;

                setDisplayText("");
                charIndexRef.current = 0;
                setIsComplete(false);
                setCurrentIndex((prev) => (prev + 1) % COMMENTS.length);
                setIsVisible(true);
            }, nextMessageDelay);
        }, fadeOutDelay);
    }, [isParentHovered, isComplete]);

    useEffect(() => {
        return () => clearAllTimers();
    }, []);

    const renderImage = (type: "open" | "close") => {
        // Special case: operator04 only has 'open' state (silhouette)
        if (selectedOperatorId === "operator04" && type === "close") return null;

        const fileName = `${selectedOperatorId}_${type}.webp`;
        const imageUrl = `${basePath}/images/operator/${fileName}`;

        return (
            <motion.img
                src={imageUrl}
                alt="Operator"
                className="w-full h-auto object-cover absolute top-0 left-0"
                style={{
                    width: "110%",
                    maxWidth: "none",
                    left: "-5%",
                    maskImage: `url(${imageUrl})`,
                    maskSize: "cover",
                    maskRepeat: "no-repeat",
                    WebkitMaskImage: `url(${imageUrl})`,
                    WebkitMaskSize: "cover",
                    backgroundColor: "currentColor",
                    opacity: (type === "open" && !isBlinking) || (type === "close" && isBlinking) ? 1 : 0,
                }}
                animate={{
                    y: [-1, 1, -1],
                }}
                transition={{
                    repeat: Infinity,
                    duration: 5,
                    ease: "easeInOut"
                }}
            />
        );
    };

    return (
        <div className="absolute top-32 left-8 z-20 pointer-events-none select-none flex items-start gap-4 text-foreground/50">
            {/* Operator Profile Image Area */}
            <AnimatePresence>
                {isVisible && (
                    <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.5 }}
                        className="relative w-8 overflow-hidden border border-current/20 bg-current/5"
                        style={{
                            aspectRatio: "2/3",
                            height: "2.5rem", // Roughly 2 lines of text (1.25rem * 2)
                        }}
                    >
                        {/* Static images with opacity toggle for Jitter-free Blinking */}
                        {renderImage("open")}
                        {renderImage("close")}

                        {/* Scanline Pattern (softened to blend with comment text tone) */}
                        <div
                            className="absolute inset-0 z-20 pointer-events-none"
                            style={{
                                opacity: 0.06,
                                backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 3px, currentColor 4px)`
                            }}
                        />

                        {/* Bright Sweep Line (Every 2.5s) */}
                        <motion.div
                            className="absolute inset-0 pointer-events-none z-30"
                            style={{
                                background: "linear-gradient(to bottom, transparent, rgba(255,255,255,0.1) 50%, transparent)",
                                height: "4px",
                                width: "100%",
                                filter: "blur(0.8px)",
                            }}
                            animate={{
                                top: ["-10%", "110%"]
                            }}
                            transition={{
                                repeat: Infinity,
                                duration: 2.5,
                                ease: "linear",
                                repeatDelay: 0.5
                            }}
                        />

                        {/* Overall Monitor Glow */}
                        <div className="absolute inset-0 z-10 bg-current/5 pointer-events-none" style={{ opacity: 0.6 }} />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Comment Text Area */}
            <div className="max-w-[30ch]">
                <AnimatePresence>
                    {isVisible && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="font-mono text-xs tracking-widest leading-relaxed"
                        >
                            <span className="mr-2">{">"}</span>
                            {displayText}
                            <motion.span
                                animate={{ opacity: isComplete ? [1, 0, 1] : 1 }}
                                transition={{
                                    repeat: Infinity,
                                    duration: 0.8,
                                    ease: "easeInOut"
                                }}
                                className="inline-block w-2 h-4 bg-current ml-1 align-middle"
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
