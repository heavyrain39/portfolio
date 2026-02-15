"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { OperatorId } from "../types";

interface OperatorCommentsProps {
    isParentHovered: boolean;
    comments?: string[];
    assetBasePath?: string;
    operatorId?: OperatorId;
    showImage?: boolean;
    showText?: boolean;
    themeColor?: string;
}

const FALLBACK_COMMENTS = ["Initialization sequence complete."];
const withAlpha = (color: string, alpha: number): string => {
    const normalized = color.trim();
    const hexMatch = normalized.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
    if (hexMatch) {
        const hex = hexMatch[1];
        const fullHex = hex.length === 3 ? hex.split("").map((char) => char + char).join("") : hex;
        const r = parseInt(fullHex.slice(0, 2), 16);
        const g = parseInt(fullHex.slice(2, 4), 16);
        const b = parseInt(fullHex.slice(4, 6), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

    const rgbMatch = normalized.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
    if (rgbMatch) {
        const r = Number(rgbMatch[1]);
        const g = Number(rgbMatch[2]);
        const b = Number(rgbMatch[3]);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

    return normalized;
};

export default function OperatorComments({
    isParentHovered,
    comments,
    assetBasePath,
    operatorId,
    showImage = true,
    showText = true,
    themeColor = "#ffffff"
}: OperatorCommentsProps) {
    const safeComments = useMemo(() => {
        return comments && comments.length > 0 ? comments : FALLBACK_COMMENTS;
    }, [comments]);

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

    const [randomOperatorId] = useState<OperatorId>(() => {
        const options: OperatorId[] = ["operator01", "operator02", "operator03", "operator04"];
        return options[Math.floor(Math.random() * options.length)];
    });
    const selectedOperatorId = operatorId ?? randomOperatorId;

    useEffect(() => {
        hoverRef.current = isParentHovered;
    }, [isParentHovered]);

    useEffect(() => {
        currentIndexRef.current = currentIndex;
    }, [currentIndex]);

    useEffect(() => {
        isCompleteRef.current = isComplete;
    }, [isComplete]);

    useEffect(() => {
        if (currentIndexRef.current < safeComments.length) return;
        currentIndexRef.current = 0;
        setCurrentIndex(0);
    }, [safeComments.length]);

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
        const fullText = safeComments[currentIndexRef.current] ?? safeComments[0] ?? "";

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

    useEffect(() => {
        if (!isParentHovered || selectedOperatorId === "operator04") {
            clearBlinkCycleTimer();
            setIsBlinking(false);
            return;
        }

        const scheduleBlink = () => {
            const nextBlinkIn = Math.random() * 2000 + 3000;
            blinkCycleTimeoutRef.current = setTimeout(() => {
                setIsBlinking(true);
                blinkEndTimeoutRef.current = setTimeout(() => {
                    blinkEndTimeoutRef.current = null;
                    setIsBlinking(false);
                    scheduleBlink();
                }, 150);
            }, nextBlinkIn);
        };

        scheduleBlink();

        return () => clearBlinkCycleTimer();
    }, [isParentHovered, selectedOperatorId]);

    useEffect(() => {
        if (!showText) {
            clearAllTimers();
            isTypingRef.current = false;
            setIsVisible(isParentHovered);
            return;
        }

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
    }, [isParentHovered, isComplete, currentIndex, showText]);

    useEffect(() => {
        if (!showText) return;
        if (!isParentHovered || !isComplete) return;

        const isLastMessage = currentIndexRef.current === safeComments.length - 1;
        const fadeOutDelay = 2000;
        const nextMessageDelay = isLastMessage ? 6000 : 4000;

        clearTransitionTimers();

        blinkTimeoutRef.current = setTimeout(() => {
            if (!hoverRef.current) return;
            setIsVisible(false);

            nextMessageTimeoutRef.current = setTimeout(() => {
                if (!hoverRef.current) return;

                setDisplayText("");
                charIndexRef.current = 0;
                setIsComplete(false);
                setCurrentIndex((prev) => (prev + 1) % safeComments.length);
                setIsVisible(true);
            }, nextMessageDelay);
        }, fadeOutDelay);
    }, [isParentHovered, isComplete, safeComments.length, showText]);

    useEffect(() => {
        return () => clearAllTimers();
    }, []);

    const renderImage = (type: "open" | "close") => {
        if (selectedOperatorId === "operator04" && type === "close") return null;

        const fileName = `${selectedOperatorId}_${type}.webp`;
        const imageUrl = `${assetBasePath ?? "./assets/operator"}/${fileName}`;

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
                    opacity: (type === "open" && !isBlinking) || (type === "close" && isBlinking) ? 1 : 0
                }}
                animate={{ y: [-1, 1, -1] }}
                transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
            />
        );
    };

    if (!showImage && !showText) return null;

    return (
        <div
            className={`absolute top-8 left-8 z-20 pointer-events-none select-none flex items-start text-current ${showImage && showText ? "gap-4" : "gap-0"}`}
            style={{ color: withAlpha(themeColor, 0.5) }}
        >
            {showImage ? (
                <AnimatePresence>
                    {isVisible && (
                        <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{ duration: 0.5 }}
                            className="relative w-8 overflow-hidden border border-current/20 bg-current/5"
                            style={{ aspectRatio: "2/3", height: "2.5rem" }}
                        >
                            {renderImage("open")}
                            {renderImage("close")}

                            <div
                                className="absolute inset-0 z-20 pointer-events-none opacity-10"
                                style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 3px, currentColor 4px)" }}
                            />

                            <motion.div
                                className="absolute inset-0 pointer-events-none z-30"
                                style={{
                                    background: "linear-gradient(to bottom, transparent, rgba(255,255,255,0.15) 50%, transparent)",
                                    height: "4px",
                                    width: "100%",
                                    filter: "blur(1px)"
                                }}
                                animate={{ top: ["-10%", "110%"] }}
                                transition={{ repeat: Infinity, duration: 2.5, ease: "linear", repeatDelay: 0.5 }}
                            />

                            <div className="absolute inset-0 z-10 bg-current/5 pointer-events-none" />
                        </motion.div>
                    )}
                </AnimatePresence>
            ) : null}

            {showText ? (
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
                                    transition={{ repeat: Infinity, duration: 0.8, ease: "easeInOut" }}
                                    className="inline-block w-2 h-4 bg-current ml-1 align-middle"
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            ) : null}
        </div>
    );
}
