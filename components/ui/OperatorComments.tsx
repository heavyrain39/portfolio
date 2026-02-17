"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

interface OperatorCommentsProps {
    isParentHovered: boolean;
    themeColor?: string;
    contrastColor?: string;
    isMuted?: boolean;
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
    "Ever visited the Tannh\u00e4user Gate? My hometown is just a sector away.",
    "Target terminated. Clean. I love how you handle that trigger.",
    "Energy levels at 40%. Don't get reckless on me now.",
    "I'm recording this session... for \"tactical review.\" And my private collection.",
    "You done? I've got the debriefing room ready. Just for two.",
    "System idling. Come back soon, Raven. I'll be waiting right here."
];

const BASE_PATH = "/portfolio";
const HOVER_START_DELAY = 750;
const DEFAULT_TYPING_DELAY = 35;
const SPACE_DELAY = 60;
const PUNCTUATION_DELAY = 300;
const VOICE_VOLUME = 0.15;
const RADIO_SFX_VOLUME = 0.15;
const RADIO_SFX_DURATION_MS = 200;
const RADIO_TO_VOICE_GAP_MS = 50;
const PRELOAD_VOICE_COUNT = 2;

type VoiceAudioState = {
    audio: HTMLAudioElement;
    sourceIndex: number;
    sources: string[];
    onError: () => void;
    onLoadedMetadata: () => void;
};

type SingleAudioState = {
    audio: HTMLAudioElement;
    sourceIndex: number;
    sources: string[];
    onError: () => void;
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const isPausePunctuation = (char: string, nextChar?: string) => /[.!?,"]/.test(char) && !/[.!?,"]/.test(nextChar ?? "");

const parseColorToRgb = (color: string): { r: number; g: number; b: number } | null => {
    const normalized = color.trim();
    const hexMatch = normalized.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
    if (hexMatch) {
        const hex = hexMatch[1];
        const fullHex = hex.length === 3 ? hex.split("").map((char) => char + char).join("") : hex;
        const r = parseInt(fullHex.slice(0, 2), 16);
        const g = parseInt(fullHex.slice(2, 4), 16);
        const b = parseInt(fullHex.slice(4, 6), 16);
        if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) return null;
        return { r, g, b };
    }

    const rgbMatch = normalized.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
    if (rgbMatch) {
        const r = clamp(Number(rgbMatch[1]), 0, 255);
        const g = clamp(Number(rgbMatch[2]), 0, 255);
        const b = clamp(Number(rgbMatch[3]), 0, 255);
        if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) return null;
        return { r, g, b };
    }

    return null;
};

const colorToHsl = (color: string): { h: number; s: number; l: number } | null => {
    const rgb = parseColorToRgb(color);
    if (!rgb) return null;

    const r = rgb.r / 255;
    const g = rgb.g / 255;
    const b = rgb.b / 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const lightness = (max + min) / 2;
    let hue = 0;
    let saturation = 0;

    if (max !== min) {
        const d = max - min;
        saturation = lightness > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r:
                hue = (g - b) / d + (g < b ? 6 : 0);
                break;
            case g:
                hue = (b - r) / d + 2;
                break;
            case b:
                hue = (r - g) / d + 4;
                break;
        }
        hue /= 6;
    }

    return { h: hue * 360, s: saturation * 100, l: lightness * 100 };
};

const hslToHex = (h: number, s: number, l: number): string => {
    l /= 100;
    const a = (s * Math.min(l, 1 - l)) / 100;
    const f = (n: number) => {
        const k = (n + h / 30) % 12;
        const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
        return Math.round(255 * color).toString(16).padStart(2, "0");
    };
    return `#${f(0)}${f(8)}${f(4)}`;
};

const getOperatorTintColor = (themeColor: string): string => {
    const hsl = colorToHsl(themeColor);
    if (!hsl) return themeColor;

    const tonedSaturation = clamp(hsl.s * 0.35 + 8, 8, 48);
    const tonedLightness = clamp(hsl.l * 0.65 + 18, 26, 68);
    return hslToHex(hsl.h, tonedSaturation, tonedLightness);
};

const withAlpha = (color: string, alpha: number): string => {
    const rgb = parseColorToRgb(color);
    if (!rgb) return color;
    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
};

const getVoiceSources = (index: number): string[] => {
    const fileId = String(index + 1).padStart(2, "0");
    return [
        `${BASE_PATH}/audio/operator/${fileId}.webm`,
        `${BASE_PATH}/audio/operator/${fileId}.m4a`
    ];
};

const RADIO_SFX_SOURCES = [
    `${BASE_PATH}/audio/operator/radio-open.webm`,
    `${BASE_PATH}/audio/operator/radio-open.m4a`
];

export default function OperatorComments({
    isParentHovered,
    themeColor = "#f5f5f0",
    contrastColor = "#1a1a1a",
    isMuted = false
}: OperatorCommentsProps) {
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
    const hoverStartDelayTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const isTypingRef = useRef(false);
    const hoverRef = useRef(isParentHovered);
    const wasHoveredRef = useRef(isParentHovered);
    const hasAppliedInitialHoverDelayRef = useRef(false);
    const currentIndexRef = useRef(currentIndex);
    const isCompleteRef = useRef(isComplete);
    const currentTypingDelayRef = useRef(DEFAULT_TYPING_DELAY);
    const playedVoiceIndexesRef = useRef<Set<number>>(new Set());
    const voiceDurationsMsRef = useRef<Map<number, number>>(new Map());
    const voiceAudioStateRef = useRef<Map<number, VoiceAudioState>>(new Map());
    const radioSfxStateRef = useRef<SingleAudioState | null>(null);
    const delayedVoiceStartTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const pendingRetryVoiceIndexRef = useRef<number | null>(null);
    const playVoiceForIndexRef = useRef<(index: number) => void>(() => { });

    // Randomly select operator (operator01 - operator04) on mount
    const [selectedOperatorId] = useState(() => {
        const id = Math.floor(Math.random() * 4) + 1;
        return `operator0${id}`;
    });

    const themeTintColor = themeColor;
    const operatorTintColor = useMemo(() => getOperatorTintColor(themeTintColor), [themeTintColor]);

    const getTypingDelayForIndex = (index: number): number => {
        const durationMs = voiceDurationsMsRef.current.get(index);
        const fullText = COMMENTS[index] ?? "";
        if (!durationMs || !Number.isFinite(durationMs) || durationMs <= 0 || !fullText) {
            return DEFAULT_TYPING_DELAY;
        }

        let fixedPauseBudgetMs = 0;
        let adaptiveChars = 0;
        for (let i = 0; i < fullText.length; i++) {
            const char = fullText[i];
            const nextChar = fullText[i + 1];
            if (isPausePunctuation(char, nextChar)) {
                fixedPauseBudgetMs += PUNCTUATION_DELAY;
                continue;
            }
            if (char === " ") {
                fixedPauseBudgetMs += SPACE_DELAY;
                continue;
            }
            adaptiveChars += 1;
        }

        if (adaptiveChars <= 0) {
            return DEFAULT_TYPING_DELAY;
        }

        const usableBudgetMs = Math.max(durationMs - fixedPauseBudgetMs, adaptiveChars * 18);
        return clamp(Math.round(usableBudgetMs / adaptiveChars), 18, 75);
    };

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

    const clearHoverStartDelayTimer = () => {
        if (hoverStartDelayTimeoutRef.current) {
            clearTimeout(hoverStartDelayTimeoutRef.current);
            hoverStartDelayTimeoutRef.current = null;
        }
    };

    const clearDelayedVoiceStartTimer = () => {
        if (delayedVoiceStartTimeoutRef.current) {
            clearTimeout(delayedVoiceStartTimeoutRef.current);
            delayedVoiceStartTimeoutRef.current = null;
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
        clearHoverStartDelayTimer();
        clearDelayedVoiceStartTimer();
        clearTypingTimer();
        clearTransitionTimers();
        clearBlinkCycleTimer();
    };

    const cleanupVoiceAudio = (state: VoiceAudioState) => {
        state.audio.pause();
        state.audio.removeEventListener("error", state.onError);
        state.audio.removeEventListener("loadedmetadata", state.onLoadedMetadata);
        state.audio.removeAttribute("src");
        state.audio.load();
    };

    const cleanupSingleAudio = (state: SingleAudioState) => {
        state.audio.pause();
        state.audio.removeEventListener("error", state.onError);
        state.audio.removeAttribute("src");
        state.audio.load();
    };

    const getOrCreateRadioSfxAudio = (): HTMLAudioElement => {
        const existing = radioSfxStateRef.current;
        if (existing) {
            return existing.audio;
        }

        const audio = new Audio();
        audio.preload = "auto";
        audio.volume = isMuted ? 0 : RADIO_SFX_VOLUME;

        let state: SingleAudioState;
        const onError = () => {
            const nextSourceIndex = state.sourceIndex + 1;
            if (nextSourceIndex >= state.sources.length) return;
            state.sourceIndex = nextSourceIndex;
            state.audio.src = state.sources[nextSourceIndex];
            state.audio.load();
        };

        state = {
            audio,
            sourceIndex: 0,
            sources: RADIO_SFX_SOURCES,
            onError
        };

        audio.addEventListener("error", onError);
        audio.src = state.sources[0];
        audio.load();

        radioSfxStateRef.current = state;
        return audio;
    };

    const playRadioSfx = () => {
        if (isMuted) return;

        const audio = getOrCreateRadioSfxAudio();
        audio.volume = isMuted ? 0 : RADIO_SFX_VOLUME;
        audio.currentTime = 0;

        const playPromise = audio.play();
        if (playPromise) {
            playPromise.catch(() => { });
        }
    };

    const startVoicePlayback = (index: number) => {
        const audio = getOrCreateVoiceAudio(index);
        audio.volume = isMuted ? 0 : VOICE_VOLUME;
        audio.currentTime = 0;

        const playPromise = audio.play();
        if (playPromise) {
            playPromise.then(() => {
                playedVoiceIndexesRef.current.add(index);
                pendingRetryVoiceIndexRef.current = null;
            }).catch((error) => {
                if (error instanceof DOMException && error.name === "NotAllowedError") {
                    pendingRetryVoiceIndexRef.current = index;
                }
            });
        } else {
            playedVoiceIndexesRef.current.add(index);
        }
    };

    const getOrCreateVoiceAudio = (index: number): HTMLAudioElement => {
        const existing = voiceAudioStateRef.current.get(index);
        if (existing) {
            return existing.audio;
        }

        const audio = new Audio();
        audio.preload = "metadata";
        audio.volume = isMuted ? 0 : VOICE_VOLUME;

        const sources = getVoiceSources(index);
        let state: VoiceAudioState;

        const onError = () => {
            const nextSourceIndex = state.sourceIndex + 1;
            if (nextSourceIndex >= state.sources.length) return;
            state.sourceIndex = nextSourceIndex;
            state.audio.src = state.sources[nextSourceIndex];
            state.audio.load();
        };

        const onLoadedMetadata = () => {
            if (!Number.isFinite(audio.duration) || audio.duration <= 0) return;
            voiceDurationsMsRef.current.set(index, audio.duration * 1000);
            if (currentIndexRef.current === index && !isCompleteRef.current) {
                currentTypingDelayRef.current = getTypingDelayForIndex(index);
            }
        };

        state = {
            audio,
            sourceIndex: 0,
            sources,
            onError,
            onLoadedMetadata
        };

        audio.addEventListener("error", onError);
        audio.addEventListener("loadedmetadata", onLoadedMetadata);
        audio.src = sources[0];
        audio.load();

        voiceAudioStateRef.current.set(index, state);
        return audio;
    };

    const playVoiceForIndex = (index: number) => {
        if (index < 0 || index >= COMMENTS.length) return;
        if (isMuted) return;
        if (playedVoiceIndexesRef.current.has(index)) return;

        playRadioSfx();
        clearDelayedVoiceStartTimer();
        delayedVoiceStartTimeoutRef.current = setTimeout(() => {
            delayedVoiceStartTimeoutRef.current = null;
            startVoicePlayback(index);
        }, RADIO_SFX_DURATION_MS + RADIO_TO_VOICE_GAP_MS);
    };

    playVoiceForIndexRef.current = playVoiceForIndex;

    const typeNextChar = () => {
        if (!hoverRef.current || isCompleteRef.current) {
            isTypingRef.current = false;
            return;
        }

        isTypingRef.current = true;
        const index = currentIndexRef.current;
        const fullText = COMMENTS[index];

        if (charIndexRef.current === 0) {
            currentTypingDelayRef.current = getTypingDelayForIndex(index);
            playVoiceForIndexRef.current(index);
        }

        if (charIndexRef.current >= fullText.length) {
            isTypingRef.current = false;
            setIsComplete(true);
            return;
        }

        const char = fullText[charIndexRef.current];
        const nextChar = fullText[charIndexRef.current + 1];

        setDisplayText(fullText.slice(0, charIndexRef.current + 1));
        charIndexRef.current += 1;

        let delay = currentTypingDelayRef.current;
        if (isPausePunctuation(char, nextChar)) delay = PUNCTUATION_DELAY;
        else if (char === " ") delay = SPACE_DELAY;

        typingTimeoutRef.current = setTimeout(() => {
            typingTimeoutRef.current = null;
            typeNextChar();
        }, delay);
    };

    useEffect(() => {
        hoverRef.current = isParentHovered;
    }, [isParentHovered]);

    useEffect(() => {
        currentIndexRef.current = currentIndex;
        currentTypingDelayRef.current = getTypingDelayForIndex(currentIndex);
    }, [currentIndex]);

    useEffect(() => {
        isCompleteRef.current = isComplete;
    }, [isComplete]);

    useEffect(() => {
        const voiceVolume = isMuted ? 0 : VOICE_VOLUME;
        voiceAudioStateRef.current.forEach(({ audio }) => {
            audio.volume = voiceVolume;
        });

        if (radioSfxStateRef.current) {
            radioSfxStateRef.current.audio.volume = isMuted ? 0 : RADIO_SFX_VOLUME;
        }
    }, [isMuted]);

    useEffect(() => {
        for (let i = 0; i < Math.min(PRELOAD_VOICE_COUNT, COMMENTS.length); i++) {
            getOrCreateVoiceAudio(i);
        }
    }, []);

    useEffect(() => {
        const retryPendingVoice = () => {
            const pendingIndex = pendingRetryVoiceIndexRef.current;
            if (pendingIndex === null) return;
            pendingRetryVoiceIndexRef.current = null;
            playVoiceForIndexRef.current(pendingIndex);
        };

        window.addEventListener("pointerdown", retryPendingVoice);
        window.addEventListener("keydown", retryPendingVoice);
        return () => {
            window.removeEventListener("pointerdown", retryPendingVoice);
            window.removeEventListener("keydown", retryPendingVoice);
        };
    }, []);

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
            wasHoveredRef.current = false;
            clearAllTimers();
            isTypingRef.current = false;
            setIsVisible(false);
            return;
        }

        const startCommentCycle = () => {
            setIsVisible(true);
            if (!isTypingRef.current && !isComplete) {
                typeNextChar();
            }
        };

        const isEnteringHover = !wasHoveredRef.current;
        wasHoveredRef.current = true;

        if (isEnteringHover && !hasAppliedInitialHoverDelayRef.current) {
            hasAppliedInitialHoverDelayRef.current = true;
            clearHoverStartDelayTimer();
            hoverStartDelayTimeoutRef.current = setTimeout(() => {
                hoverStartDelayTimeoutRef.current = null;
                if (!hoverRef.current) return;
                startCommentCycle();
            }, HOVER_START_DELAY);
            return;
        }

        startCommentCycle();
    }, [isParentHovered, isComplete, currentIndex]);

    useEffect(() => {
        if (!isParentHovered || !isComplete) return;

        const isLastMessage = currentIndexRef.current === COMMENTS.length - 1;
        const fadeOutDelay = 2000; // Keep existing spacing
        const nextMessageDelay = isLastMessage ? 6000 : 4000; // Keep existing spacing

        clearTransitionTimers();

        blinkTimeoutRef.current = setTimeout(() => {
            if (!hoverRef.current) return;
            setIsVisible(false);

            nextMessageTimeoutRef.current = setTimeout(() => {
                if (!hoverRef.current) return;

                setDisplayText("");
                charIndexRef.current = 0;
                setIsComplete(false);
                setCurrentIndex((prev) => {
                    const nextIndex = (prev + 1) % COMMENTS.length;
                    if (nextIndex === 0) {
                        // New dialogue cycle starts here: allow all 25 voice clips to play again.
                        playedVoiceIndexesRef.current.clear();
                        pendingRetryVoiceIndexRef.current = null;
                    }
                    return nextIndex;
                });
                setIsVisible(true);
            }, nextMessageDelay);
        }, fadeOutDelay);
    }, [isParentHovered, isComplete]);

    useEffect(() => {
        return () => {
            clearAllTimers();
            clearDelayedVoiceStartTimer();
            voiceAudioStateRef.current.forEach((state) => cleanupVoiceAudio(state));
            voiceAudioStateRef.current.clear();
            if (radioSfxStateRef.current) {
                cleanupSingleAudio(radioSfxStateRef.current);
                radioSfxStateRef.current = null;
            }
        };
    }, []);

    const renderImage = (type: "open" | "close") => {
        // Special case: operator04 only has 'open' state (silhouette)
        if (selectedOperatorId === "operator04" && type === "close") return null;

        const fileName = `${selectedOperatorId}_${type}.webp`;
        const imageUrl = `${BASE_PATH}/images/operator/${fileName}`;

        return (
            <motion.div
                className="absolute top-0 h-full pointer-events-none"
                style={{
                    width: "110%",
                    maxWidth: "none",
                    left: "-5%",
                    opacity: (type === "open" && !isBlinking) || (type === "close" && isBlinking) ? 1 : 0
                }}
                animate={{ y: [-1, 1, -1] }}
                transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
            >
                <motion.img
                    src={imageUrl}
                    alt="Operator"
                    className="absolute inset-0 w-full h-full object-cover"
                    style={{ filter: "grayscale(1) contrast(1.08) brightness(0.9)" }}
                />
                <div
                    className="absolute inset-0"
                    style={{
                        backgroundColor: operatorTintColor,
                        mixBlendMode: "color",
                        opacity: 0.64
                    }}
                />
                <div
                    className="absolute inset-0"
                    style={{
                        backgroundColor: operatorTintColor,
                        mixBlendMode: "multiply",
                        opacity: 0.26
                    }}
                />
            </motion.div>
        );
    };

    return (
        <div
            className="absolute top-32 left-8 z-20 pointer-events-none select-none flex items-start gap-4 text-current opacity-50"
            style={{ color: contrastColor }}
        >
            {/* Operator Profile Image Area */}
            <div
                className="relative w-8 shrink-0"
                style={{
                    aspectRatio: "2/3",
                    height: "2.5rem" // Roughly 2 lines of text (1.25rem * 2)
                }}
            >
                <AnimatePresence>
                    {isVisible && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.72 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.78 }}
                            transition={{ duration: 0.24, ease: "easeOut" }}
                            className="absolute inset-0 overflow-hidden border border-current/20 bg-current/5 isolate"
                            style={{ transformOrigin: "50% 60%" }}
                        >
                            {/* Static images with opacity toggle for jitter-free blinking */}
                            {renderImage("open")}
                            {renderImage("close")}

                            {/* Scanline Pattern (softened to blend with comment text tone) */}
                            <div
                                className="absolute inset-0 z-20 pointer-events-none"
                                style={{
                                    opacity: 0.1,
                                    backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 3px, ${themeTintColor} 4px)`
                                }}
                            />

                            {/* Bright Sweep Line (Every 2.5s) */}
                            <motion.div
                                className="absolute inset-0 pointer-events-none z-30"
                                style={{
                                    background: `linear-gradient(to bottom, transparent, ${withAlpha(themeTintColor, 0.4)} 50%, transparent)`,
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
            </div>

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
