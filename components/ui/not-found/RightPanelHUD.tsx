"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { AlertTriangle } from "lucide-react";
import { BlobVisualizer, WaveformVisualizer } from "./HUDVisualizers";

const DIGIT_BITMAPS: Record<string, number[][]> = {
    '0': [[0, 1, 1, 1, 0], [1, 0, 0, 0, 1], [1, 0, 0, 0, 1], [1, 0, 0, 0, 1], [1, 0, 0, 0, 1], [1, 0, 0, 0, 1], [0, 1, 1, 1, 0]],
    '1': [[0, 0, 1, 0, 0], [0, 1, 1, 0, 0], [0, 0, 1, 0, 0], [0, 0, 1, 0, 0], [0, 0, 1, 0, 0], [0, 0, 1, 0, 0], [0, 0, 1, 0, 0]],
    '2': [[0, 1, 1, 1, 0], [1, 0, 0, 0, 1], [0, 0, 0, 0, 1], [0, 0, 1, 1, 0], [0, 1, 0, 0, 0], [1, 0, 0, 0, 0], [1, 1, 1, 1, 1]],
    '3': [[1, 1, 1, 1, 0], [0, 0, 0, 0, 1], [0, 0, 0, 0, 1], [0, 1, 1, 1, 0], [0, 0, 0, 0, 1], [0, 0, 0, 0, 1], [1, 1, 1, 1, 0]],
    '4': [[1, 0, 0, 0, 1], [1, 0, 0, 0, 1], [1, 0, 0, 0, 1], [1, 1, 1, 1, 1], [0, 0, 0, 1, 0], [0, 0, 0, 1, 0], [0, 0, 0, 1, 0]],
    '5': [[1, 1, 1, 1, 1], [1, 0, 0, 0, 0], [1, 1, 1, 1, 0], [0, 0, 0, 0, 1], [0, 0, 0, 0, 1], [1, 0, 0, 0, 1], [0, 1, 1, 1, 0]],
    '6': [[0, 1, 1, 1, 0], [1, 0, 0, 0, 0], [1, 1, 1, 1, 0], [1, 0, 0, 0, 1], [1, 0, 0, 0, 1], [1, 0, 0, 0, 1], [0, 1, 1, 1, 0]],
    '7': [[1, 1, 1, 1, 1], [0, 0, 0, 0, 1], [0, 0, 0, 1, 0], [0, 0, 1, 0, 0], [0, 1, 0, 0, 0], [0, 1, 0, 0, 0], [0, 1, 0, 0, 0]],
    '8': [[0, 1, 1, 1, 0], [1, 0, 0, 0, 1], [1, 0, 0, 0, 1], [0, 1, 1, 1, 0], [1, 0, 0, 0, 1], [1, 0, 0, 0, 1], [0, 1, 1, 1, 0]],
    '9': [[0, 1, 1, 1, 0], [1, 0, 0, 0, 1], [1, 0, 0, 0, 1], [0, 1, 1, 1, 1], [0, 0, 0, 0, 1], [1, 0, 0, 0, 1], [0, 1, 1, 1, 0]],
    ':': [[0], [1], [0], [0], [0], [1], [0]],
};

function DotMatrixDigit({ char, opacity }: { char: string; opacity: number }) {
    const bitmap = DIGIT_BITMAPS[char] || DIGIT_BITMAPS['0'];
    return (
        <div className="flex gap-[1px]" style={{ opacity }}>
            {bitmap[0].map((_, colIndex) => (
                <div key={colIndex} className="flex flex-col gap-[1px]">
                    {bitmap.map((row, rowIndex) => (
                        <div
                            key={rowIndex}
                            className={`w-[3px] h-[3px] ${row[colIndex] ? 'dot-on-pixel' : 'bg-transparent'}`}
                        />
                    ))}
                </div>
            ))}
        </div>
    );
}

function DotMatrixTimer({ seconds, opacity }: { seconds: number; opacity: number }) {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    const mStr = m.toString().padStart(2, '0');
    const sStr = s.toString().padStart(2, '0');

    return (
        <div className="flex items-center gap-[6px]">
            <DotMatrixDigit char={mStr[0]} opacity={opacity} />
            <DotMatrixDigit char={mStr[1]} opacity={opacity} />
            <DotMatrixDigit char=":" opacity={opacity} />
            <DotMatrixDigit char={sStr[0]} opacity={opacity} />
            <DotMatrixDigit char={sStr[1]} opacity={opacity} />
        </div>
    );
}


export default function RightPanelHUD() {
    const borderColor = 'color-mix(in srgb, var(--foreground) 20%, transparent)';

    // Core Audio State
    const [isLoading, setIsLoading] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(60);
    const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
    const [audioError, setAudioError] = useState<string | null>(null);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    const tracks = [
        { title: "TRACK01.FLAC", url: "/portfolio/audio/track01.m4a" },
        { title: "TRACK02.FLAC", url: "/portfolio/audio/track02.m4a" }
    ];

    // Web Audio Refs
    const audioCtxRef = useRef<AudioContext | null>(null);
    const analyzerRef = useRef<AnalyserNode | null>(null);
    const [analyzer, setAnalyzer] = useState<AnalyserNode | null>(null);
    const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
    const gainNodeRef = useRef<GainNode | null>(null);
    const audioBuffersRef = useRef<(AudioBuffer | null)[]>([]);

    const startTimeRef = useRef<number>(0);
    const pauseTimeRef = useRef<number>(0);
    const progressIntervalRef = useRef<number | null>(null);

    // Initial AudioContext Setup
    const ensureContext = useCallback(() => {
        if (!audioCtxRef.current) {
            const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
            const ctx = new AudioContext();
            const analyzerNode = ctx.createAnalyser();
            analyzerNode.fftSize = 2048;
            const gain = ctx.createGain();
            gain.gain.value = volume / 100;

            analyzerNode.connect(gain);
            gain.connect(ctx.destination);

            audioCtxRef.current = ctx;
            analyzerRef.current = analyzerNode;
            setAnalyzer(analyzerNode);
            gainNodeRef.current = gain;
        }
        return audioCtxRef.current;
    }, [volume]);

    // Fetch and Decode
    const loadTrack = async (index: number) => {
        if (audioBuffersRef.current[index]) return audioBuffersRef.current[index];

        setIsLoading(true);
        setAudioError(null);
        try {
            const ctx = ensureContext()!;
            const res = await fetch(tracks[index].url);
            if (!res.ok) throw new Error("FETCH_FAIL");
            const arrayBuffer = await res.arrayBuffer();
            const decodedBuffer = await ctx.decodeAudioData(arrayBuffer);
            audioBuffersRef.current[index] = decodedBuffer;
            setIsLoading(false);
            return decodedBuffer;
        } catch (e) {
            console.error(e);
            setAudioError("DECODE_ERR");
            setIsLoading(false);
            return null;
        }
    };

    // Playback control
    const stopAudio = useCallback(() => {
        if (sourceNodeRef.current) {
            try { sourceNodeRef.current.stop(); } catch (e) { }
        }
        sourceNodeRef.current = null;
        setIsPlaying(false);
        pauseTimeRef.current = 0;
        setCurrentTime(0);
        if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    }, []);

    const playAudio = useCallback((offset: number, buffer: AudioBuffer) => {
        const ctx = ensureContext()!;
        if (ctx.state === 'suspended') ctx.resume();

        stopAudio();

        const source = ctx.createBufferSource();
        source.buffer = buffer;

        // Use Ref for immediate connection to avoid State async lag
        if (analyzerRef.current) {
            source.connect(analyzerRef.current);
        }

        source.onended = () => {
            if ((ctx.currentTime - startTimeRef.current) >= buffer.duration * 0.98) {
                nextTrack();
            }
        };

        source.start(0, offset);
        sourceNodeRef.current = source;
        startTimeRef.current = ctx.currentTime - offset;
        setDuration(buffer.duration);
        setIsPlaying(true);

        progressIntervalRef.current = window.setInterval(() => {
            const current = ctx.currentTime - startTimeRef.current;
            setCurrentTime(Math.min(buffer.duration, current));
        }, 100);
    }, [ensureContext, stopAudio]);

    const togglePlay = async () => {
        if (isLoading) return;
        const buffer = await loadTrack(currentTrackIndex);
        if (!buffer) return;

        if (isPlaying) {
            pauseTimeRef.current = audioCtxRef.current!.currentTime - startTimeRef.current;
            stopAudio();
            setIsPlaying(false);
        } else {
            if (pauseTimeRef.current >= buffer.duration) pauseTimeRef.current = 0;
            playAudio(pauseTimeRef.current, buffer);
        }
    };

    const nextTrack = async () => {
        const nextIndex = (currentTrackIndex + 1) % tracks.length;
        setCurrentTrackIndex(nextIndex);
        stopAudio();
        const buffer = await loadTrack(nextIndex);
        if (buffer) playAudio(0, buffer);
    };

    // Interactive seeks
    const handleProgressScrub = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!duration || isLoading) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const pct = (e.clientX - rect.left) / rect.width;
        const newTime = pct * duration;

        pauseTimeRef.current = newTime;
        const buffer = audioBuffersRef.current[currentTrackIndex];
        if (buffer && isPlaying) {
            playAudio(newTime, buffer);
        } else {
            setCurrentTime(newTime);
        }
    };

    // Volume Knob Logic
    const handleVolumeWheel = (e: React.WheelEvent) => {
        const delta = -Math.sign(e.deltaY) * 5;
        const next = Math.max(0, Math.min(100, volume + delta));
        setVolume(next);
        if (gainNodeRef.current) gainNodeRef.current.gain.value = next / 100;
    };

    useEffect(() => {
        if (gainNodeRef.current) gainNodeRef.current.gain.value = volume / 100;
    }, [volume]);

    // Format time
    const formatTime = (s: number) => {
        const m = Math.floor(s / 60);
        const sc = Math.floor(s % 60);
        return `${m.toString().padStart(2, '0')}:${sc.toString().padStart(2, '0')}`;
    };

    return (
        <div className="flex flex-col h-[100%] w-full bg-[var(--background)] pointer-events-none relative overflow-hidden">
            <style>{`
                @keyframes gridSlideHUD {
                    from { background-position: 0 0px, 0 0px; }
                    to { background-position: -40px 0px, -40px 0px; }
                }
                .player-grid-bg {
                    background-image:
                        linear-gradient(color-mix(in srgb, var(--foreground) 4%, transparent) 1px, transparent 1px),
                        linear-gradient(90deg, color-mix(in srgb, var(--foreground) 4%, transparent) 1px, transparent 1px);
                    background-size: 40px 40px;
                    background-position: 0 0, 0 0;
                    animation: gridSlideHUD 3.75s linear infinite;
                }
                .controls-pixel-bg {
                    background-image: 
                        linear-gradient(color-mix(in srgb, var(--foreground) 2%, transparent) 3px, transparent 3px),
                        linear-gradient(90deg, color-mix(in srgb, var(--foreground) 2%, transparent) 3px, transparent 3px);
                    background-size: 4px 4px;
                    background-position: 0px 0px;
                }
                .dot-on-pixel {
                    background-color: var(--foreground);
                    box-shadow: 0 0 6px color-mix(in srgb, var(--foreground) 50%, transparent);
                }
                .bg-block {
                    background-color: var(--background);
                }
                :root {
                    --knob-h: 2.8rem;
                    --knob-w: calc(2.8rem * 80 / 65);
                }
                @media (min-width: 768px) {
                    :root {
                        --knob-h: 3.8vw;
                        --knob-w: calc(3.8vw * 80 / 65);
                    }
                }
            `}</style>


            {/* Music Player Control Box (Compartmentalized Wireframe) */}
            <div className="player-grid-bg flex flex-col p-4 md:p-[2vw] relative">
                <div className="border border-[var(--foreground)]/25 flex flex-col w-full bg-[var(--background)]">

                    {/* TIER 1: Header (Now Playing & Bitrate) */}
                    <div className="flex justify-between items-center px-3 py-1 md:py-[0.3vw] border-b border-[var(--foreground)]/25 text-[9px] md:text-[0.65vw] font-mono tracking-widest uppercase">
                        <div className="flex gap-4">
                            <span className="opacity-50">□□□ NOW PLAYING:</span>
                            {isLoading ? (
                                <span className="opacity-50 animate-pulse">FETCHING...</span>
                            ) : (
                                <span className="opacity-80">{tracks[currentTrackIndex].title}</span>
                            )}
                        </div>
                        <div className="opacity-50 hidden sm:block">BITRATE: 1411 KBPS</div>
                    </div>

                    {/* TIER 2: Main Body (Knob, Controls, Visualizers) */}
                    <div className="flex h-[4.2rem] md:h-[6vw] items-stretch">

                        {/* 1. Volume Section (Adjust 'gap' here for distance between knob and text) */}
                        <div className="w-[var(--knob-w)] md:w-[6vw] flex flex-col items-center justify-center border-r border-[var(--foreground)]/25 px-1 pt-1 gap-1">
                            <div
                                id="vol-knob"
                                data-hud-interactive="true"
                                className="h-[2rem] md:h-[3vw] w-full flex items-center justify-center cursor-ns-resize relative overflow-visible pointer-events-auto"
                                onWheel={handleVolumeWheel}
                                onMouseDown={(e) => e.stopPropagation()}
                                title="Scroll to adjust volume"
                            >
                                <svg viewBox="-42 -47 84 69" className="w-full h-full text-[var(--foreground)] opacity-50 overflow-visible">
                                    <path d="M -40 20 A 45 45 0 1 1 40 20" fill="none" stroke="currentColor" strokeWidth="1" />
                                    <g transform={`rotate(${-90 + (volume / 100) * 180})`}>
                                        <line x1="0" y1="-33" x2="0" y2="-43" stroke="currentColor" strokeWidth="2.5" opacity="1" strokeLinecap="butt" />
                                    </g>
                                </svg>
                            </div>
                            <div className="font-mono text-[8px] md:text-[0.55vw] opacity-50 uppercase tracking-tighter mb-1">
                                VOL.{volume}%
                            </div>
                        </div>

                        {/* 2. Controls Section (Square Pixel Grid) */}
                        <div className="flex-1 flex flex-col border-r border-[var(--foreground)]/25 p-4 md:p-[1vw] min-w-0 justify-center gap-2 md:gap-[0.6vw] controls-pixel-bg">

                            {/* Upper Row: Buttons + Timer */}
                            <div className="flex items-center gap-2 h-[1.6rem] md:h-[2.2vw] pointer-events-auto">
                                <button
                                    onClick={stopAudio}
                                    className="h-full aspect-square border border-[var(--foreground)]/50 flex items-center justify-center bg-block rounded-none transition-all active:scale-[0.98] active:invert"
                                >
                                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-[35%] h-[35%] opacity-80"><rect x="6" y="6" width="12" height="12" /></svg>
                                </button>
                                <button
                                    onClick={togglePlay}
                                    className="h-full aspect-square border border-[var(--foreground)]/50 flex items-center justify-center bg-block rounded-none transition-all active:scale-[0.98] active:invert"
                                >
                                    {isPlaying ? (
                                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-[40%] h-[40%] opacity-80">
                                            <rect x="6" y="5" width="4" height="14" />
                                            <rect x="14" y="5" width="4" height="14" />
                                        </svg>
                                    ) : (
                                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-[40%] h-[40%] opacity-80 pl-0.5"><polygon points="7,5 19,12 7,19" /></svg>
                                    )}
                                </button>
                                <button
                                    onClick={nextTrack}
                                    className="h-full aspect-square border border-[var(--foreground)]/50 flex items-center justify-center bg-block rounded-none transition-all active:scale-[0.98] active:invert"
                                >
                                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-[40%] h-[40%] opacity-80"><polygon points="5,5 15,12 5,19" /><rect x="17" y="5" width="2" height="14" /></svg>
                                </button>

                                {/* Timer (Dot Matrix) - Padded to snap to 4px grid */}
                                <div className="ml-auto flex items-center pr-1">
                                    <DotMatrixTimer seconds={currentTime} opacity={0.8} />
                                </div>
                            </div>

                            {/* Lower Row: Progress Bar */}
                            <div className="w-full flex items-center h-[8px] md:h-[0.6vw] pointer-events-auto">
                                <div
                                    data-hud-interactive="true"
                                    className="w-full h-[6px] md:h-[8px] bg-block border border-[var(--foreground)]/25 relative cursor-pointer"
                                    onClick={handleProgressScrub}
                                    onMouseDown={(e) => e.stopPropagation()}
                                >
                                    <div
                                        className="h-full bg-[var(--foreground)] opacity-80 pointer-events-none"
                                        style={{ width: `${duration ? Math.min(100, (currentTime / duration) * 100) : 0}%` }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* 3. Visualizers Section */}
                        <div className="w-[28%] md:w-[32%] flex flex-col overflow-hidden">
                            <div className="flex-1 border-b border-[var(--foreground)]/25 relative">
                                <div className="absolute inset-0 opacity-25">
                                    <BlobVisualizer analyzer={analyzer} isPlaying={isPlaying} />
                                </div>
                            </div>
                            <div className="flex-1 relative">
                                <div className="absolute inset-0 opacity-25">
                                    <WaveformVisualizer analyzer={analyzer} isPlaying={isPlaying} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Technobabble Panel (Maintained with proper spacing) */}
            <div className="flex-1 p-4 md:p-[2vw] relative flex flex-col gap-4 overflow-hidden select-none border-t border-[var(--foreground)]/5">
                <div className="flex justify-between font-mono tracking-widest uppercase text-[9px] md:text-[0.6vw]">
                    <div className="flex flex-col gap-1">
                        <span className="opacity-30">EARTH TIME:</span>
                        <span className="opacity-40">17:37:51:71</span>
                    </div>
                </div>

                <div className="flex gap-4 font-mono tracking-widest uppercase text-[9px] md:text-[0.6vw] mt-2">
                    <div className="flex flex-col text-right w-[4vw] min-w-[30px] opacity-10">
                        <span>INT</span>
                        <span>EXT</span>
                    </div>
                    <div className="flex flex-col text-right w-[4vw] min-w-[30px] opacity-25">
                        <span>68°F</span>
                        <span>-458°F</span>
                    </div>
                    <div className="flex flex-col text-right w-[4vw] min-w-[30px] opacity-25">
                        <span>20°C</span>
                        <span>-272°C</span>
                    </div>
                </div>

                <div
                    className="absolute right-[2vw] top-1/2 -translate-y-1/2 opacity-25 border border-dashed border-[var(--foreground)] p-4 font-mono text-center leading-tight w-[10vw] min-w-[120px] h-[15vw] min-h-[160px] flex items-center justify-center"
                    style={{ clipPath: 'polygon(0 0, 100% 0, 100% 90%, 90% 100%, 0 100%)', fontSize: '9px' }}
                >
                    [ SYSTEM TBD ]<br />
                    WAITING FOR INPUT
                </div>
            </div>
        </div>
    );
}
