type AudioContextRefLike = {
    current: AudioContext | null;
};

export const ensureAudioContext = (audioCtxRef: AudioContextRefLike): AudioContext => {
    if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioCtxRef.current.state === "suspended") {
        audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
};

interface PlayGameSoundParams {
    audioCtxRef: AudioContextRefLike;
    isMuted: boolean;
    type: "shoot" | "hit";
    sfxLevelScale: number;
}

export const playGameSound = ({
    audioCtxRef,
    isMuted,
    type,
    sfxLevelScale
}: PlayGameSoundParams) => {
    if (isMuted) return;

    const ctx = ensureAudioContext(audioCtxRef);
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    const now = ctx.currentTime;

    if (type === "shoot") {
        osc.type = "triangle";
        const baseFreq = 800 + (Math.random() - 0.5) * 120;
        osc.frequency.setValueAtTime(baseFreq, now);
        osc.frequency.exponentialRampToValueAtTime(300, now + 0.1);

        gainNode.gain.setValueAtTime(0.05 * sfxLevelScale, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

        osc.start(now);
        osc.stop(now + 0.1);
    } else {
        osc.type = "sawtooth";
        const hitPitchScale = 1 + (Math.random() - 0.5) * 0.34; // ~+-17%
        const hitStartFreq = Math.max(60, 150 * hitPitchScale);
        const hitEndFreq = Math.max(24, 50 * hitPitchScale * (0.92 + Math.random() * 0.16));
        osc.frequency.setValueAtTime(hitStartFreq, now);
        osc.frequency.exponentialRampToValueAtTime(hitEndFreq, now + 0.15);

        gainNode.gain.setValueAtTime(0.08 * sfxLevelScale, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

        osc.start(now);
        osc.stop(now + 0.15);
    }
};

export const closeAudioContext = (audioCtxRef: AudioContextRefLike) => {
    if (!audioCtxRef.current) return;
    audioCtxRef.current.close();
    audioCtxRef.current = null;
};
