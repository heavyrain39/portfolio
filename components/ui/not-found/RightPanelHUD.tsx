"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { AlertTriangle } from "lucide-react";

/**
 * ── Blob Visualizer Engine ──
 * Draws a symmetric "blob" waveform that floats when idle
 * and reacts dynamically to audio data.
 */
function BlobVisualizer({
    analyzer,
    isPlaying
}: {
    analyzer: AnalyserNode | null;
    isPlaying: boolean;
}) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const reqRef = useRef<number | null>(null);
    const prevMagsRef = useRef<number[]>(new Array(32).fill(0));

    const draw = useCallback(() => {
        if (!canvasRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        if (canvas.width !== Math.floor(rect.width * dpr)) {
            canvas.width = Math.floor(rect.width * dpr);
            canvas.height = Math.floor(rect.height * dpr);
            ctx.scale(dpr, dpr);
        }

        const width = rect.width;
        const height = rect.height;
        const nBands = 32;
        const fftSize = analyzer?.fftSize || 2048;
        const sampleRate = 44100;
        const maxBin = fftSize / 2;

        const dataArray = (isPlaying && analyzer) ? new Uint8Array(analyzer.frequencyBinCount) : null;
        const mags = new Float32Array(nBands);
        const smoothingTime = 0.40 // 반응 속도 상향 (0.65 -> 0.40)

        if (isPlaying) {
            if (analyzer && dataArray) {
                analyzer.getByteFrequencyData(dataArray);

                for (let i = 0; i < nBands; i++) {
                    // Logarithmic mapping
                    const startBin = Math.floor(Math.pow(10, Math.log10(1) + (i / nBands) * (Math.log10(maxBin) - Math.log10(1))));
                    const endBin = Math.floor(Math.pow(10, Math.log10(1) + ((i + 1) / nBands) * (Math.log10(maxBin) - Math.log10(1))));

                    let energy = 0;
                    let count = 0;
                    for (let j = startBin; j < Math.max(startBin + 1, endBin); j++) {
                        energy += dataArray[j] || 0;
                        count++;
                    }

                    let rawMag = count > 0 ? (energy / count) / 255 : 0;
                    // 1. Contrast Adjustment - 저역 펀치력을 위해 대비 소폭 완화 (1.25 -> 1.15)
                    rawMag = Math.pow(rawMag, 1.15);

                    // 2. Linear High-Frequency Boost (Low=1.0, High=1.35)
                    // 저역을 보호하고 고역으로 갈수록 서서히 보정하는 선형 모델 적용
                    const weight = 1.0 + (i / nBands) * 0.35;

                    mags[i] = rawMag * weight;
                }

                // 3. Frequency Smoothing (Neighbor Blend - 예민하게 0.15)
                const smoothed = new Float32Array(nBands);
                for (let i = 0; i < nBands; i++) {
                    let val = mags[i];
                    let neighbors = 1;
                    if (i > 0) { val += mags[i - 1] * 0.08; neighbors += 0.08; }
                    if (i < nBands - 1) { val += mags[i + 1] * 0.08; neighbors += 0.08; }
                    smoothed[i] = val / neighbors;
                }

                // 4. Time Smoothing & Tanh Clipping
                for (let i = 0; i < nBands; i++) {
                    const targetMag = smoothingTime * (prevMagsRef.current[i] || 0) + (1 - smoothingTime) * smoothed[i];
                    prevMagsRef.current[i] = Math.tanh(targetMag * 1.0); // 포화 방지를 위해 가중치 하향 (1.3 -> 1.0)
                }
            } else {
                // isPlaying is true but data not ready - quick fade to zero
                for (let i = 0; i < nBands; i++) {
                    prevMagsRef.current[i] *= 0.8;
                }
            }
        } else {
            // Idle floating logic - ONLY when NOT isPlaying
            const time = Date.now() * 0.002;
            for (let i = 0; i < nBands; i++) {
                const idleMag = 0.15 + 0.25 * Math.sin(time + i * 0.5) + 0.05 * Math.cos(time * 0.7 - i * 0.3);
                prevMagsRef.current[i] = 0.8 * prevMagsRef.current[i] + 0.2 * idleMag;
            }
        }

        const currentMags = prevMagsRef.current;
        ctx.clearRect(0, 0, width, height);

        const pointsTop: [number, number][] = [];
        const pointsBottom: [number, number][] = [];
        const scale = height * 0.6;
        const usableWidth = width;

        for (let i = 0; i < nBands; i++) {
            const x = (i / (nBands - 1)) * usableWidth;
            const yOffset = (currentMags[i] * scale) / 2;
            pointsTop.push([x, (height / 2) - yOffset - 1]);
            pointsBottom.push([x, (height / 2) + yOffset + 1]);
        }

        ctx.beginPath();
        ctx.moveTo(pointsTop[0][0], pointsTop[0][1]);
        for (let i = 0; i < pointsTop.length - 1; i++) {
            const xc = (pointsTop[i][0] + pointsTop[i + 1][0]) / 2;
            const yc = (pointsTop[i][1] + pointsTop[i + 1][1]) / 2;
            ctx.quadraticCurveTo(pointsTop[i][0], pointsTop[i][1], xc, yc);
        }
        ctx.lineTo(pointsTop[pointsTop.length - 1][0], pointsTop[pointsTop.length - 1][1]);
        ctx.lineTo(pointsBottom[pointsBottom.length - 1][0], pointsBottom[pointsBottom.length - 1][1]);
        for (let i = pointsBottom.length - 1; i > 0; i--) {
            const xc = (pointsBottom[i][0] + pointsBottom[i - 1][0]) / 2;
            const yc = (pointsBottom[i][1] + pointsBottom[i - 1][1]) / 2;
            ctx.quadraticCurveTo(pointsBottom[i][0], pointsBottom[i][1], xc, yc);
        }
        ctx.lineTo(pointsBottom[0][0], pointsBottom[0][1]);
        ctx.closePath();

        ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
        ctx.fill();
    }, [analyzer, isPlaying]);

    useEffect(() => {
        let isCancelled = false;
        const loop = () => {
            if (isCancelled) return;
            draw();
            reqRef.current = requestAnimationFrame(loop);
        };
        reqRef.current = requestAnimationFrame(loop);
        return () => {
            isCancelled = true;
            if (reqRef.current) cancelAnimationFrame(reqRef.current);
        };
    }, [draw]);

    return (
        <div className="w-full h-full relative overflow-hidden">
            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
        </div>
    );
}

/**
 * ── Waveform Visualizer Engine ──
 * Draws a 1px smoothed sound wave using Time Domain Data.
 */
function WaveformVisualizer({
    analyzer,
    isPlaying
}: {
    analyzer: AnalyserNode | null;
    isPlaying: boolean;
}) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const reqRef = useRef<number | null>(null);
    const prevPointsRef = useRef<number[]>(new Array(128).fill(0));

    const draw = useCallback(() => {
        if (!canvasRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        if (canvas.width !== Math.floor(rect.width * dpr)) {
            canvas.width = Math.floor(rect.width * dpr);
            canvas.height = Math.floor(rect.height * dpr);
            ctx.scale(dpr, dpr);
        }

        const width = rect.width;
        const height = rect.height;
        const sampleCount = 300; // 더 촘촘한 밀도를 위해 대폭 상향
        const smoothing = 0.3;

        const data = new Array(sampleCount).fill(0);
        if (isPlaying) {
            if (analyzer) {
                const dataArray = new Uint8Array(analyzer.fftSize);
                analyzer.getByteTimeDomainData(dataArray);

                // 전체 버퍼를 압축해서 보여줌으로써 파울링(촘촘함) 극대화
                for (let i = 0; i < sampleCount; i++) {
                    const index = Math.floor((i / sampleCount) * dataArray.length);
                    data[i] = (dataArray[index] - 128) / 128;
                }
            } else {
                // isPlaying is true but analyzer not ready
                // do nothing, data stays zero
            }
        } else {
            // Idle floating logic - ONLY when NOT isPlaying
            const time = Date.now() * 0.003;
            for (let i = 0; i < sampleCount; i++) {
                data[i] = 0.1 * Math.sin(time + i * 0.15) + 0.05 * Math.cos(time * 2.2 + i * 0.4);
            }
        }

        // Temporal smoothing
        for (let i = 0; i < sampleCount; i++) {
            data[i] = smoothing * (prevPointsRef.current[i] || 0) + (1 - smoothing) * data[i];
            prevPointsRef.current[i] = data[i];
        }

        ctx.clearRect(0, 0, width, height);
        ctx.beginPath();
        ctx.lineWidth = 1;
        ctx.strokeStyle = "rgba(255, 255, 255, 0.95)";

        const scaleY = height * 0.45; // 음파 형태가 더 강조되도록 상향
        const centerY = height / 2;
        const step = width / (sampleCount - 1);

        ctx.moveTo(0, centerY + data[0] * scaleY);
        for (let i = 0; i < sampleCount - 1; i++) {
            const x1 = i * step;
            const y1 = centerY + data[i] * scaleY;
            const x2 = (i + 1) * step;
            const y2 = centerY + data[i + 1] * scaleY;

            const xc = (x1 + x2) / 2;
            const yc = (y1 + y2) / 2;
            ctx.quadraticCurveTo(x1, y1, xc, yc);
        }

        ctx.stroke();
    }, [analyzer, isPlaying]);

    useEffect(() => {
        let isCancelled = false;
        const loop = () => {
            if (isCancelled) return;
            draw();
            reqRef.current = requestAnimationFrame(loop);
        };
        reqRef.current = requestAnimationFrame(loop);
        return () => {
            isCancelled = true;
            if (reqRef.current) cancelAnimationFrame(reqRef.current);
        };
    }, [draw]);

    return (
        <div className="w-full h-full relative overflow-hidden">
            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
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
    const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
    const gainNodeRef = useRef<GainNode | null>(null);
    const analyzerRef = useRef<AnalyserNode | null>(null);
    const audioBuffersRef = useRef<(AudioBuffer | null)[]>([]);

    const startTimeRef = useRef<number>(0);
    const pauseTimeRef = useRef<number>(0);
    const progressIntervalRef = useRef<number | null>(null);

    // Initial AudioContext Setup
    const ensureContext = useCallback(() => {
        if (!audioCtxRef.current) {
            const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
            const ctx = new AudioContext();
            const analyzer = ctx.createAnalyser();
            analyzer.fftSize = 2048; // 데이터 해상도 대폭 상향
            const gain = ctx.createGain();
            gain.gain.value = volume / 100;

            analyzer.connect(gain);
            gain.connect(ctx.destination);

            audioCtxRef.current = ctx;
            analyzerRef.current = analyzer;
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
        source.connect(analyzerRef.current!);

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

            <div className="player-grid-bg flex flex-col p-4 md:p-[2vw] gap-3 relative" style={{ borderBottom: `1px solid ${borderColor}` }}>

                {/* TIER 1: Fixed Header Layer */}
                <div className="h-[1.2rem] md:h-[1.5vw] flex items-center justify-between w-full pointer-events-auto font-mono text-[9px] md:text-[0.6vw] pb-1">
                    <div className="flex items-center uppercase tracking-widest gap-4">
                        <span className="opacity-50">NOW PLAYING:</span>
                        {isLoading ? (
                            <span className="opacity-50 animate-pulse">FETCHING...</span>
                        ) : (
                            <span className="opacity-50">{tracks[currentTrackIndex].title}</span>
                        )}
                    </div>
                    <div className="hidden md:block opacity-50 uppercase tracking-widest">
                        BITRATE: 1411 KBPS
                    </div>
                </div>

                {/* TIER 2 & 3: Unified Grid Structure for Precise Alignment */}
                <div className="grid grid-cols-[var(--knob-w)_1fr] gap-8 md:gap-[3vw]">

                    {/* Column 1: Knob & Volume Labels */}
                    <div className="flex flex-col items-center gap-3.5">
                        {/* Knob Row */}
                        <div
                            id="vol-knob"
                            data-hud-interactive="true"
                            className="h-[var(--knob-h)] w-[var(--knob-w)] flex items-center justify-center cursor-ns-resize rounded-none relative overflow-visible pointer-events-auto"
                            onWheel={handleVolumeWheel}
                            onMouseDown={(e) => e.stopPropagation()}
                        >
                            <svg viewBox="-42 -47 84 69" className="w-full h-full text-[var(--foreground)] opacity-50 overflow-visible">
                                <path d="M -40 20 A 45 45 0 1 1 40 20" fill="none" stroke="currentColor" strokeWidth="1" />
                                <g transform={`rotate(${-90 + (volume / 100) * 180})`}>
                                    <line x1="0" y1="-33" x2="0" y2="-43" stroke="currentColor" strokeWidth="1" opacity="0.8" strokeLinecap="butt" />
                                </g>
                            </svg>
                        </div>
                        {/* VOL Label (Centered under Knob) */}
                        <div className="w-full text-center font-mono text-[9px] md:text-[0.6vw] opacity-50 uppercase tracking-widest leading-none">
                            VOL. {volume}%
                        </div>
                    </div>

                    {/* Column 2: Controls, Visualizer, Progress, and Timer */}
                    <div className="grid grid-cols-[0.6fr_0.40fr] gap-4 md:gap-[2.5vw] items-stretch">

                        {/* Column 2-A: Controls (Buttons, Progress, Timer) */}
                        <div className="flex flex-col gap-2">
                            {/* Upper Row: Buttons */}
                            <div className="flex items-center gap-2 h-[var(--knob-h)] pointer-events-auto">
                                <button onClick={stopAudio} className="h-full aspect-square border border-[var(--foreground)] opacity-50 flex items-center justify-center bg-transparent rounded-none">
                                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-[40%] h-[40%]"><rect x="6" y="6" width="12" height="12" /></svg>
                                </button>
                                <button onClick={togglePlay} className="h-full aspect-square border border-[var(--foreground)] opacity-50 flex items-center justify-center bg-transparent rounded-none">
                                    {isPlaying ? (
                                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-[45%] h-[45%]">
                                            <rect x="6" y="5" width="4" height="14" />
                                            <rect x="14" y="5" width="4" height="14" />
                                        </svg>
                                    ) : (
                                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-[45%] h-[45%]"><polygon points="7,5 19,12 7,19" /></svg>
                                    )}
                                </button>
                                <button onClick={nextTrack} className="h-full aspect-square border border-[var(--foreground)] opacity-50 flex items-center justify-center bg-transparent rounded-none">
                                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-[45%] h-[45%]">
                                        <polygon points="5,5 15,12 5,19" />
                                        <rect x="17" y="5" width="2" height="14" />
                                    </svg>
                                </button>
                            </div>

                            {/* Lower Row: Progress Bar + Timer (Strictly 60% with buttons) */}
                            <div className="flex items-center h-[1rem] md:h-[0.8vw] pointer-events-auto mt-auto">
                                <div className="flex-1 flex items-center pr-4">
                                    <div
                                        data-hud-interactive="true"
                                        className="flex-1 h-[6px] md:h-[8px] bg-[var(--background)] border border-[var(--foreground)]/50 relative cursor-pointer"
                                        onClick={handleProgressScrub}
                                        onMouseDown={(e) => e.stopPropagation()}
                                    >
                                        <div
                                            className="h-full bg-[var(--foreground)] opacity-50 pointer-events-none"
                                            style={{ width: `${duration ? Math.min(100, (currentTime / duration) * 100) : 0}%` }}
                                        />
                                    </div>
                                </div>
                                <div className="shrink-0 flex items-center justify-end">
                                    <div className="font-mono text-[9px] md:text-[0.6vw] opacity-50 tracking-widest leading-none w-10 text-right">
                                        {formatTime(currentTime)}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Column 2-B: Dual Visualizers (Vertical Stack for Strict Alignment) */}
                        <div className="flex flex-col gap-2 h-full">
                            {/* Upper Visualizer (Aligned with Buttons) */}
                            <div className="h-[var(--knob-h)] overflow-hidden opacity-50">
                                <BlobVisualizer analyzer={analyzerRef.current} isPlaying={isPlaying} />
                            </div>
                            {/* Lower Visualizer (Aligned with Progress/Timer) */}
                            <div className="h-[1rem] md:h-[0.8vw] mt-auto overflow-hidden opacity-50">
                                <WaveformVisualizer analyzer={analyzerRef.current} isPlaying={isPlaying} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Technobabble Panel (Maintained with proper spacing) */}
            <div className="flex-1 p-4 md:p-[2vw] relative flex flex-col gap-4 overflow-hidden select-none border-t border-[var(--foreground)]/5">
                <div className="flex justify-between font-mono tracking-widest uppercase text-[9px] md:text-[0.6vw]">
                    <div className="flex flex-col gap-1">
                        <span className="opacity-50">EARTH TIME:</span>
                        <span className="opacity-50">17:37:51:71</span>
                    </div>
                </div>

                <div className="flex gap-4 font-mono tracking-widest uppercase text-[9px] md:text-[0.6vw] mt-2">
                    <div className="flex flex-col text-right w-[4vw] min-w-[30px] opacity-20">
                        <span>INT</span>
                        <span>EXT</span>
                    </div>
                    <div className="flex flex-col text-right w-[4vw] min-w-[30px] opacity-40">
                        <span>68°F</span>
                        <span>-458°F</span>
                    </div>
                    <div className="flex flex-col text-right w-[4vw] min-w-[30px] opacity-40">
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
