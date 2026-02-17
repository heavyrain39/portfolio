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
    type: "shoot" | "hit" | "modeSwitch";
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
    const now = ctx.currentTime;

    if (type === "modeSwitch") {
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.type = "square";
        osc1.frequency.setValueAtTime(180, now);
        osc1.frequency.exponentialRampToValueAtTime(130, now + 0.035);
        gain1.gain.setValueAtTime(0.065 * sfxLevelScale, now);
        gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.035);
        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        osc1.start(now);
        osc1.stop(now + 0.035);

        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = "triangle";
        osc2.frequency.setValueAtTime(100, now + 0.024);
        osc2.frequency.exponentialRampToValueAtTime(78, now + 0.075);
        gain2.gain.setValueAtTime(0.0001, now);
        gain2.gain.setValueAtTime(0.072 * sfxLevelScale, now + 0.024);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.075);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start(now + 0.024);
        osc2.stop(now + 0.075);
    } else if (type === "shoot") {
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        osc.connect(gainNode);
        gainNode.connect(ctx.destination);

        osc.type = "triangle";
        const baseFreq = 800 + (Math.random() - 0.5) * 120;
        osc.frequency.setValueAtTime(baseFreq, now);
        osc.frequency.exponentialRampToValueAtTime(300, now + 0.1);

        gainNode.gain.setValueAtTime(0.05 * sfxLevelScale, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

        osc.start(now);
        osc.stop(now + 0.1);
    } else {
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        osc.connect(gainNode);
        gainNode.connect(ctx.destination);

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
