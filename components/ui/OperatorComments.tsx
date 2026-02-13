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

    const charIndexRef = useRef(0);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const blinkTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const nextMessageTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const isTypingRef = useRef(false);
    const hoverRef = useRef(isParentHovered);
    const currentIndexRef = useRef(currentIndex);
    const isCompleteRef = useRef(isComplete);

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

    const clearAllTimers = () => {
        clearTypingTimer();
        clearTransitionTimers();
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

        const isLastMessage = currentIndex === COMMENTS.length - 1;
        const blinkDuration = isLastMessage ? 2500 : 2000;
        const nextStepDelay = isLastMessage ? 2500 : 500;

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
            }, nextStepDelay + 500);
        }, blinkDuration);
    }, [isParentHovered, isComplete, currentIndex]);

    useEffect(() => {
        return () => clearAllTimers();
    }, []);

    return (
        <div className="absolute top-32 left-8 z-20 pointer-events-none select-none max-w-[42ch]">
            <AnimatePresence>
                {isVisible && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.5 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                        className="font-mono text-xs text-foreground opacity-50 tracking-widest leading-relaxed"
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
    );
}
