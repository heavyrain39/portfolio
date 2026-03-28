"use client";

import React, { useEffect, useState } from "react";
import { Play } from "lucide-react";

// Fake Waveform component
function Waveform() {
    const [bars, setBars] = useState<number[]>(Array(32).fill(10));

    useEffect(() => {
        const interval = setInterval(() => {
            setBars(prev => prev.map(() => Math.random() * 100)); // Percentages 0-100
        }, 150);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex items-end h-[2rem] md:h-[3vw] gap-[2px] md:gap-[0.2vw] overflow-hidden w-full">
            {bars.map((height, i) => (
                <div 
                    key={i} 
                    className="w-[2px] md:w-[0.2vw] bg-[var(--foreground)] transition-all duration-150 ease-linear opacity-80"
                    style={{ height: `${height}%` }} 
                />
            ))}
        </div>
    );
}

// Streaming Unicode Braille component
function BrailleStream() {
    const [stream, setStream] = useState<string>("⠷⠻⠂⠃⠄⠅⠆⠇⠈⠉");

    useEffect(() => {
        // Braille mapping from 0x2800 to 0x28FF
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

    return (
        <div className="flex flex-col h-full w-full bg-[var(--background)] pointer-events-none">
            
            {/* Top Bar with player */}
            <div className="flex items-start justify-between p-4 md:p-[2vw]" style={{ borderBottom: `1px solid ${borderColor}` }}>
                <div className="flex flex-col gap-2 md:gap-[1.5vw] w-full">
                    {/* Now Playing Header & Braille */}
                    <div className="flex items-start justify-between w-full">
                        <div className="flex flex-col font-mono uppercase tracking-widest">
                            <span 
                                className="opacity-50" 
                                style={{ fontSize: 'clamp(0.5rem, 0.65vw, 0.85rem)' }}
                            >
                                NOW PLAYING:
                            </span>
                            <span 
                                className="opacity-80 font-bold" 
                                style={{ fontSize: 'clamp(0.7rem, 0.9vw, 1.1rem)' }}
                            >
                                TRACK 01
                            </span>
                        </div>
                        <BrailleStream />
                    </div>

                    {/* Play Button & Waveform Area */}
                    <div className="flex items-stretch gap-4 md:gap-[2vw] mt-2">
                        {/* Play Button Container (slight cassette tape angular shape hint) */}
                        <div 
                            className="w-[3rem] h-[3rem] md:w-[4vw] md:h-[4vw] border border-[var(--foreground)] opacity-80 flex items-center justify-center shrink-0"
                            style={{ 
                                clipPath: 'polygon(0 0, 100% 0, 100% 80%, 80% 100%, 0 100%)'
                            }}
                        >
                            <Play className="w-[40%] h-[40%]" fill="currentColor" strokeWidth={0} />
                        </div>

                        {/* Waveform Wrapper */}
                        <div className="flex-1 flex items-center">
                            <Waveform />
                        </div>
                    </div>
                </div>
            </div>

            {/* Middle technobabble panel (will be filled later) */}
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
