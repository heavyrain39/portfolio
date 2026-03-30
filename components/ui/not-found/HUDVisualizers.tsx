"use client";

import React, { useEffect, useRef, useCallback } from "react";

/**
 * ── Blob Visualizer Engine ──
 * Draws a symmetric "blob" waveform that floats when idle
 * and reacts dynamically to audio data.
 */
export function BlobVisualizer({
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
        const maxBin = fftSize / 2;

        const dataArray = (isPlaying && analyzer) ? new Uint8Array(analyzer.frequencyBinCount) : null;
        const mags = new Float32Array(nBands);
        const smoothingTime = 0.40 // 반응 속도 상향 (0.65 -> 0.40)

        if (isPlaying) {
            if (analyzer && dataArray) {
                analyzer.getByteFrequencyData(dataArray);

                for (let i = 0; i < nBands; i++) {
                    const startBin = Math.floor(Math.pow(10, Math.log10(1) + (i / nBands) * (Math.log10(maxBin) - Math.log10(1))));
                    const endBin = Math.floor(Math.pow(10, Math.log10(1) + ((i + 1) / nBands) * (Math.log10(maxBin) - Math.log10(1))));

                    let energy = 0;
                    let count = 0;
                    for (let j = startBin; j < Math.max(startBin + 1, endBin); j++) {
                        energy += dataArray[j] || 0;
                        count++;
                    }

                    let rawMag = count > 0 ? (energy / count) / 255 : 0;
                    rawMag = Math.pow(rawMag, 1.15);
                    const weight = 1.0 + (i / nBands) * 0.35;
                    mags[i] = rawMag * weight;
                }

                // Frequency Smoothing
                const smoothed = new Float32Array(nBands);
                for (let i = 0; i < nBands; i++) {
                    let val = mags[i];
                    let neighbors = 1;
                    if (i > 0) { val += mags[i - 1] * 0.08; neighbors += 0.08; }
                    if (i < nBands - 1) { val += mags[i + 1] * 0.08; neighbors += 0.08; }
                    smoothed[i] = val / neighbors;
                }

                for (let i = 0; i < nBands; i++) {
                    const targetMag = smoothingTime * (prevMagsRef.current[i] || 0) + (1 - smoothingTime) * smoothed[i];
                    prevMagsRef.current[i] = Math.tanh(targetMag * 1.0);
                }
            } else {
                for (let i = 0; i < nBands; i++) {
                    prevMagsRef.current[i] *= 0.8;
                }
            }
        } else {
            // Idle floating logic - Languid Fluid
            const time = Date.now() * 0.001;
            const baseBreathing = 0.15 + 0.05 * Math.sin(time * 0.8);
            for (let i = 0; i < nBands; i++) {
                const swell = 0.1 * Math.sin(time * 1.5 + i * 0.12);
                const idleMag = baseBreathing + swell;
                prevMagsRef.current[i] = 0.95 * prevMagsRef.current[i] + 0.05 * idleMag;
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
export function WaveformVisualizer({
    analyzer,
    isPlaying
}: {
    analyzer: AnalyserNode | null;
    isPlaying: boolean;
}) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const reqRef = useRef<number | null>(null);
    const prevPointsRef = useRef<number[]>(new Array(300).fill(0));
    const pulsesRef = useRef<{ x: number; amp: number; width: number; type: 'spike' | 'burst'; speed: number }[]>([]);
    const lastSpawnRef = useRef<number>(0);

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
        const sampleCount = 300;
        
        const data = new Array(sampleCount).fill(0);
        if (isPlaying) {
            if (analyzer) {
                const dataArray = new Uint8Array(analyzer.fftSize);
                analyzer.getByteTimeDomainData(dataArray);

                for (let i = 0; i < sampleCount; i++) {
                    const index = Math.floor((i / sampleCount) * dataArray.length);
                    data[i] = (dataArray[index] - 128) / 128;
                }
            }
        } else {
            // Idle floating logic - Intermittent Trace (간헐적 추적)
            const now = Date.now();
            
            // 1. Base Noise
            for (let i = 0; i < sampleCount; i++) {
                data[i] = (Math.random() - 0.5) * 0.015;
            }

            // 2. Pulse Spawning
            if (now - lastSpawnRef.current > 1500 + Math.random() * 2500) {
                const type = Math.random() > 0.4 ? 'spike' : 'burst';
                pulsesRef.current.push({
                    x: sampleCount,
                    amp: 0.15 + Math.random() * 0.25,
                    width: type === 'spike' ? 2 + Math.floor(Math.random() * 3) : 15 + Math.floor(Math.random() * 15),
                    type,
                    speed: 1.5 + Math.random() * 2.5
                });
                lastSpawnRef.current = now;
            }

            // 3. Update & Render Pulses
            pulsesRef.current = pulsesRef.current.filter(p => {
                p.x -= p.speed;
                if (p.x < -p.width) return false;

                for (let i = 0; i < sampleCount; i++) {
                    const dx = Math.abs(i - p.x);
                    if (dx < p.width) {
                        if (p.type === 'spike') {
                            const val = p.amp * Math.exp(-Math.pow(dx / (p.width * 0.4), 2));
                            data[i] += val;
                        } else {
                            const val = p.amp * Math.sin(i * 0.8) * Math.exp(-Math.pow(dx / (p.width * 0.5), 2));
                            data[i] += val;
                        }
                    }
                }
                return true;
            });
        }

        // Temporal smoothing
        const currentSmoothing = isPlaying ? 0.3 : 0.8;
        for (let i = 0; i < sampleCount; i++) {
            data[i] = currentSmoothing * (prevPointsRef.current[i] || 0) + (1 - currentSmoothing) * data[i];
            prevPointsRef.current[i] = data[i];
        }

        ctx.clearRect(0, 0, width, height);
        ctx.beginPath();
        ctx.lineWidth = 1;
        ctx.strokeStyle = "rgba(255, 255, 255, 0.95)";

        const scaleY = height * 0.45;
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
