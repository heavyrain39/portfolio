"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { AlertTriangle } from "lucide-react";

// Streaming Unicode Braille component
function BrailleStream() {
    const [stream, setStream] = useState<string>("⠷⠻⠂⠃⠄⠅⠆⠇⠈⠉");

    useEffect(() => {
        const genBraille = () => {
            let str = "";
            for (let i = 0; i < 12; i++) {
                str += String.fromCharCode(0x2800 + Math.floor(Math.random() * 256));
            }
            return str;
        };

        const interval = setInterval(() => {
            setStream(genBraille());
        }, 100);
        return () => clearInterval(interval);
    }, []);

    return (
        <div 
            className="font-mono tracking-widest opacity-50 text-right truncate"
            style={{ fontSize: 'clamp(0.6rem, 0.8vw, 1rem)', width: 'clamp(100px, 12vw, 150px)' }}
        >
            {stream}
        </div>
    );
}

export default function RightPanelHUD() {
    const borderColor = 'color-mix(in srgb, var(--foreground) 20%, transparent)';
    
    // Core Audio State
    const [isLoading, setIsLoading] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(60); // 0-100 (Default 60)
    const [audioError, setAudioError] = useState<string | null>(null);
    const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
    
    // Web Audio Canvas & Nodes
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const audioCtxRef = useRef<AudioContext | null>(null);
    const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
    const gainNodeRef = useRef<GainNode | null>(null);
    const analyzerRef = useRef<AnalyserNode | null>(null);
    const dataArrayRef = useRef<Uint8Array | null>(null);
    const reqRef = useRef<number | null>(null);

    // Playback state trackers
    const startTimeRef = useRef<number>(0);
    const pauseTimeRef = useRef<number>(0);

    // Volume Wheel Handler
    const handleVolumeWheel = (e: React.WheelEvent<HTMLDivElement>) => {
        const delta = Math.sign(e.deltaY);
        const newVol = Math.max(0, Math.min(100, volume - (delta * 5)));
        setVolume(newVol);
        
        if (gainNodeRef.current && audioCtxRef.current) {
            gainNodeRef.current.gain.setValueAtTime(newVol / 100, audioCtxRef.current.currentTime);
        }
    };

    // Canvas visualization loop
    const drawWaveform = useCallback(() => {
        if (!canvasRef.current || !analyzerRef.current || !dataArrayRef.current) return;
        
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d", { alpha: true });
        if (!ctx) return;
        
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        
        if (canvas.width !== Math.floor(rect.width * dpr) || canvas.height !== Math.floor(rect.height * dpr)) {
            canvas.width = Math.floor(rect.width * dpr);
            canvas.height = Math.floor(rect.height * dpr);
            ctx.scale(dpr, dpr);
        }
        
        const width = rect.width;
        const height = rect.height;
        
        reqRef.current = requestAnimationFrame(drawWaveform);
        
        analyzerRef.current.getByteFrequencyData(dataArrayRef.current as any);
        
        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
        
        const barWidth = 2; // Slightly thicker for better visibility
        const gap = 2;
        const numBars = Math.floor(width / (barWidth + gap));
        
        // 음악의 실질적 에너지가 집중된 주파수 대역(약 5kHz 이하)만을 추출
        // fftSize=256일 때 총 128개의 빈(Bin)으로 나뉘며, 각 빈은 약 172Hz 담당
        // 172Hz * 30 빈 = 약 5160Hz. 드럼, 베이스, 보컬 등 음악의 핵심 대역
        const maxBinsToRead = 30; 
        
        for (let i = 0; i < numBars; i++) {
            // 전체 캔버스 픽셀 너비를 오직 음악의 하이라이트 30개의 빈에만 매핑
            const dataIndex = Math.floor((i / numBars) * maxBinsToRead);
            const value = dataArrayRef.current[dataIndex] || 0;
            
            // Baseline 10% height when silent to look like active wireframe
            const percent = Math.max(0.1, value / 255);
            // 시각적 쾌감을 위해 진폭 스케일을 약간 증폭시킴
            const visualHeight = height * Math.pow(percent, 1.1);
            
            ctx.fillRect(i * (barWidth + gap), height - visualHeight, barWidth, visualHeight);
        }
    }, []);

    useEffect(() => {
        return () => {
            if (reqRef.current) {
                cancelAnimationFrame(reqRef.current);
                reqRef.current = null;
            }
            if (sourceNodeRef.current) {
                try { sourceNodeRef.current.stop(); } catch(e) {}
            }
        };
    }, []);

    const fetchAndDecodeAudio = async () => {
        setIsLoading(true);
        setAudioError(null);
        try {
            const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
            const ctx = new AudioContext();
            audioCtxRef.current = ctx;
            
            const analyzer = ctx.createAnalyser();
            analyzer.fftSize = 256; // gives 128 frequency bins for better fullscreen resolution
            analyzerRef.current = analyzer;
            dataArrayRef.current = new Uint8Array(analyzer.frequencyBinCount);
            
            const gain = ctx.createGain();
            gain.gain.value = volume / 100;
            gainNodeRef.current = gain;
            
            // Connect processing chain
            analyzer.connect(gain);
            gain.connect(ctx.destination);
            
            const res = await fetch("/portfolio/audio/track01.m4a");
            if (!res.ok) throw new Error("404 HTTP Fetch Failed");
            
            const arrayBuffer = await res.arrayBuffer();
            const decodedBuffer = await ctx.decodeAudioData(arrayBuffer);
            
            setAudioBuffer(decodedBuffer);
            setIsLoading(false);
            return decodedBuffer;
        } catch (error: any) {
            console.error("Audio Load/Decode Error:", error);
            setAudioError("DECODE_FAIL");
            setIsLoading(false);
            return null;
        }
    };

    const playBuffer = (offset: number, buffer: AudioBuffer) => {
        if (!audioCtxRef.current || !analyzerRef.current) return;
        
        try {
            const source = audioCtxRef.current.createBufferSource();
            source.buffer = buffer;
            source.connect(analyzerRef.current);
            
            source.onended = () => {
                // If the track finishes naturally
                // Checking state to prevent false triggering from STOP() calls
                setIsPlaying(prev => {
                    if (prev && audioCtxRef.current && (audioCtxRef.current.currentTime - startTimeRef.current) >= buffer.duration * 0.95) {
                        pauseTimeRef.current = 0;
                        return false;
                    }
                    return prev;
                });
            };
            
            source.start(0, offset);
            sourceNodeRef.current = source;
            startTimeRef.current = audioCtxRef.current.currentTime - offset;
            
            setIsPlaying(true);
            
            // HMR 환경에서 죽은 ID가 남는 것을 방지하기 위해 강제로 초기화 후 재실행
            if (reqRef.current) cancelAnimationFrame(reqRef.current);
            reqRef.current = requestAnimationFrame(drawWaveform);
        } catch(e) {
            console.error("PlayBuffer Error", e);
        }
    };

    const togglePlay = async () => {
        if (isLoading) return;
        setAudioError(null);
        
        let targetBuffer = audioBuffer;
        if (!targetBuffer) {
            // First time play
            const buf = await fetchAndDecodeAudio();
            if (!buf) return;
            targetBuffer = buf;
        }

        if (audioCtxRef.current?.state === 'suspended') {
            audioCtxRef.current.resume();
        }

        if (isPlaying) {
            // Pause logic
            if (audioCtxRef.current) {
                pauseTimeRef.current = audioCtxRef.current.currentTime - startTimeRef.current;
            }
            if (sourceNodeRef.current) {
                try { sourceNodeRef.current.stop(); } catch(e){}
            }
            setIsPlaying(false);
        } else {
            // Resume logic
            // Make sure we loop around if it hit the end previously
            if (pauseTimeRef.current >= targetBuffer.duration) {
                pauseTimeRef.current = 0;
            }
            playBuffer(pauseTimeRef.current, targetBuffer);
        }
    };

    const stopAudio = () => {
        if (!audioBuffer) return;
        if (sourceNodeRef.current) {
            try { sourceNodeRef.current.stop(); } catch(e){}
        }
        pauseTimeRef.current = 0;
        setIsPlaying(false);
        if (reqRef.current) {
            cancelAnimationFrame(reqRef.current);
            reqRef.current = null;
        }
        
        // Clear canvas
        if (canvasRef.current) {
            const ctx = canvasRef.current.getContext("2d");
            if (ctx) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        }
    };

    return (
        <div className="flex flex-col h-[100%] w-full bg-[var(--background)] pointer-events-none relative">
            <style>{`
                @keyframes gridSlideHUD {
                    from { background-position: 0 0px, 0 0px; }
                    to { background-position: -30px 0px, -30px 0px; }
                }
                .player-grid-bg {
                    background-image:
                        linear-gradient(color-mix(in srgb, var(--foreground) 7%, transparent) 1px, transparent 1px),
                        linear-gradient(90deg, color-mix(in srgb, var(--foreground) 7%, transparent) 1px, transparent 1px);
                    background-size: 30px 30px;
                    background-position: 0 0, 0 0;
                    animation: gridSlideHUD 3.75s linear infinite;
                }
            `}</style>
            
            {/* Top Bar with player */}
            <div className="player-grid-bg flex flex-col p-4 md:p-[2vw] gap-2 md:gap-[1.5vw] relative" style={{ borderBottom: `1px solid ${borderColor}` }}>
                
                <div className="flex flex-col w-full relative z-10 pointer-events-auto">
                    
                    {/* Now Playing Header & Braille */}
                    <div className="flex items-start justify-between w-full h-[1.5rem] overflow-hidden">
                        <div className="flex items-center font-mono uppercase tracking-widest gap-3">
                            <span 
                                className="opacity-50" 
                                style={{ fontSize: 'clamp(0.5rem, 0.65vw, 0.85rem)' }}
                            >
                                NOW PLAYING:
                            </span>
                            {isLoading ? (
                                <span className="opacity-90 animate-pulse font-bold text-[#ffd700]" style={{ fontSize: 'clamp(0.5rem, 0.65vw, 0.85rem)' }}>
                                    FETCHING SRC...
                                </span>
                            ) : audioError ? (
                                <span className="text-red-500 opacity-90 flex items-center gap-1" style={{ fontSize: 'clamp(0.5rem, 0.65vw, 0.85rem)' }}>
                                    <AlertTriangle className="w-3 h-3" /> [ ERR: {audioError} ]
                                </span>
                            ) : (
                                <span 
                                    className="opacity-50 font-bold" 
                                    style={{ fontSize: 'clamp(0.5rem, 0.65vw, 0.85rem)' }}
                                >
                                    TRACK 01
                                </span>
                            )}
                        </div>
                        <BrailleStream />
                    </div>

                    {/* Audio Controls & Waveform Area */}
                    <div className="flex items-center gap-4 md:gap-[1.5vw] mt-2 h-[3.5rem] md:h-[4.5vw]">
                        
                        {/* Hardware Buttons Container - Perfect square blocks */}
                        <div className="flex items-center gap-2 h-full shrink-0 pointer-events-auto">
                            {/* Play/Pause Button */}
                            <button 
                                onClick={togglePlay}
                                disabled={isLoading}
                                className="h-full aspect-square border border-[var(--foreground)] opacity-80 flex items-center justify-center cursor-pointer hover:bg-[var(--foreground)] hover:text-[var(--background)] transition-colors relative disabled:opacity-20 disabled:cursor-not-allowed"
                            >
                                {/* Decorative Top-Left screw marker target */}
                                <div className="absolute top-[2px] left-[2px] w-[2px] h-[2px] bg-[var(--foreground)] opacity-40"></div>
                                {isPlaying ? (
                                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-[45%] h-[45%]">
                                        <rect x="6" y="4" width="4" height="16" />
                                        <rect x="14" y="4" width="4" height="16" />
                                    </svg>
                                ) : (
                                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-[45%] h-[45%]">
                                        <polygon points="6,4 20,12 6,20" />
                                    </svg>
                                )}
                            </button>
                            
                            {/* Stop Button */}
                            <button 
                                onClick={stopAudio}
                                disabled={isLoading}
                                className="h-full aspect-square border border-[var(--foreground)] opacity-80 flex items-center justify-center cursor-pointer hover:bg-[var(--foreground)] hover:text-[var(--background)] transition-colors relative disabled:opacity-20 disabled:cursor-not-allowed"
                            >
                                <div className="absolute top-[2px] left-[2px] w-[2px] h-[2px] bg-[var(--foreground)] opacity-40"></div>
                                <svg viewBox="0 0 24 24" fill="currentColor" className="w-[35%] h-[35%]">
                                    <rect x="5" y="5" width="14" height="14" />
                                </svg>
                            </button>
                        </div>

                        {/* Real Waveform Canvas Wrapper */}
                        <div className="flex-1 relative overflow-hidden h-[80%] border-l border-r border-[#2b2d35]">
                            <canvas 
                                ref={canvasRef} 
                                className="absolute inset-x-0 bottom-0 w-full h-full pointer-events-none"
                            />
                        </div>

                        {/* Flat Wireframe Volume Knob */}
                        <div 
                            className="relative flex items-center justify-center h-[80%] aspect-square shrink-0 cursor-ns-resize"
                            onWheel={handleVolumeWheel}
                        >
                            <svg viewBox="-50 -50 100 100" className="w-[85%] h-[85%] text-[var(--foreground)] opacity-80" stroke="currentColor" strokeWidth="2" fill="none">
                                {/* Outer Ring */}
                                <circle cx="0" cy="0" r="46" />
                                
                                {/* Single Indicator Line (Mapped to 0~100 -> -135deg~135deg) */}
                                <g transform={`rotate(${-135 + (volume / 100) * 270})`}>
                                    <line x1="0" y1="-30" x2="0" y2="-46" strokeWidth="3" />
                                </g>
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Middle technobabble panel */}
            <div className="flex-1 p-4 md:p-[2vw] relative flex flex-col gap-4 md:gap-[2vw] overflow-hidden">
                <div className="flex justify-between font-mono tracking-widest">
                    <div className="flex flex-col gap-1">
                        <span 
                            className="opacity-50" 
                            style={{ fontSize: 'clamp(0.5rem, 0.65vw, 0.85rem)' }}
                        >
                            EARTH TIME:
                        </span>
                        <span 
                            className="opacity-80 font-bold" 
                            style={{ fontSize: 'clamp(0.7rem, 0.9vw, 1.1rem)' }}
                        >
                            17:37:51:71
                        </span>
                    </div>
                </div>

                <div 
                    className="flex gap-4 md:gap-[2vw] font-mono tracking-widest mt-2 md:mt-[1vw]"
                    style={{ fontSize: 'clamp(0.5rem, 0.65vw, 0.85rem)' }}
                >
                    <div className="flex flex-col text-right w-[4vw] min-w-[30px] opacity-20">
                        <span>INT</span>
                        <span>EXT</span>
                    </div>
                    <div className="flex flex-col text-right w-[4vw] min-w-[30px] opacity-50">
                        <span>68°F</span>
                        <span>-458°F</span>
                    </div>
                    <div className="flex flex-col text-right w-[4vw] min-w-[30px] opacity-50">
                        <span>20°C</span>
                        <span>-272°C</span>
                    </div>
                </div>
                
                {/* Visual Placeholder for ASCII / Modules */}
                <div 
                    className="absolute right-[2vw] top-1/2 -translate-y-1/2 opacity-20 border border-dashed border-[var(--foreground)] p-4 font-mono text-center leading-tight w-[10vw] min-w-[120px] h-[15vw] min-h-[160px] flex items-center justify-center pointer-events-auto" 
                    style={{ clipPath: 'polygon(0 0, 100% 0, 100% 90%, 90% 100%, 0 100%)', fontSize: 'clamp(0.6rem, 0.8vw, 1rem)' }}
                >
                    [ SYSTEM TBD ]<br/>
                    WAITING FOR INPUT
                </div>
            </div>

        </div>
    );
}
