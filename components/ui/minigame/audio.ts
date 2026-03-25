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
    type: "shoot" | "hit" | "modeSwitch" | "impact";
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
    } else if (type === "impact") {
        // 짧고 건조한 타격음 (탁, 타타탁)

        // 1. 고주파 탭 (Metallic Tap)
        const tapOsc = ctx.createOscillator();
        const tapGain = ctx.createGain();
        tapOsc.type = "triangle";

        // 2500Hz ~ 4000Hz 사이의 랜덤 주파수로 금속성 충돌 느낌 부여
        const tapFreq = 2500 + Math.random() * 1500;
        tapOsc.frequency.setValueAtTime(tapFreq, now);
        tapOsc.frequency.exponentialRampToValueAtTime(800, now + 0.025);

        tapGain.gain.setValueAtTime(0.03 * sfxLevelScale, now);
        tapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);

        tapOsc.connect(tapGain);
        tapGain.connect(ctx.destination);
        tapOsc.start(now);
        tapOsc.stop(now + 0.025);

        // 2. 백색 소음 버스트 (Noise Burst)
        const bufferSize = ctx.sampleRate * 0.03;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noiseSrc = ctx.createBufferSource();
        noiseSrc.buffer = buffer;
        const noiseGain = ctx.createGain();

        const noiseFilter = ctx.createBiquadFilter();
        noiseFilter.type = "bandpass";
        noiseFilter.frequency.value = 2500 + Math.random() * 1000;

        noiseGain.gain.setValueAtTime(0.035 * sfxLevelScale, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

        noiseSrc.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(ctx.destination);

        noiseSrc.start(now);
        noiseSrc.stop(now + 0.03);
    } else if (type === "shoot") {
        // 1. 금속성 기계 격발음 (Mechanical Metallic Click)
        // Square 파형을 고주파수(1800Hz)에서 매우 짧은 시간(0.025초) 내에 급격히 떨어뜨려 
        // 쇳덩이가 부딪히는 듯한 날카롭고 딱딱한 타격음을 냅니다.
        const tickOsc = ctx.createOscillator();
        const tickGain = ctx.createGain();
        tickOsc.type = "square";

        // 기계적 격발음이 반복될 때 귀가 피로하지 않도록 1800Hz 기준 ±150Hz의 미세한 랜덤 피치를 줍니다.
        const clickFreq = 1800 + (Math.random() - 0.5) * 300;
        tickOsc.frequency.setValueAtTime(clickFreq, now);
        tickOsc.frequency.exponentialRampToValueAtTime(150, now + 0.025);

        tickGain.gain.setValueAtTime(0.02 * sfxLevelScale, now);
        tickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);

        tickOsc.connect(tickGain);
        tickGain.connect(ctx.destination);
        tickOsc.start(now);
        tickOsc.stop(now + 0.025);

        // 2. 레이저 본체음
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        osc.connect(gainNode);
        gainNode.connect(ctx.destination);

        osc.type = "triangle";
        const baseFreq = 800 + (Math.random() - 0.5) * 80;
        osc.frequency.setValueAtTime(baseFreq, now);
        osc.frequency.exponentialRampToValueAtTime(300, now + 0.12);

        gainNode.gain.setValueAtTime(0.05 * sfxLevelScale, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

        osc.start(now);
        osc.stop(now + 0.12);
    } else {
        // 3. Heavy Mechanical Snap - V3 (Sawtooth Hybrid)
        // 오리지널 sawtooth의 꽉 찬 바디감은 유지하되, 꼬리를 짧게 잘라 투박함을 제거하고
        // 노이즈 버스트로 파열 트랜지언트를 더했습니다.

        // Layer 1: Sawtooth 바디 (묵직한 본체)
        // 오리지널(150->50Hz, 0.15s)에서 시작 주파수를 살짝 올리고, 지속 시간을 0.09s로 줄여
        // "퉁~" 잔향을 깔끔하게 끊으면서도 무게감은 살립니다.
        const bodyOsc = ctx.createOscillator();
        const bodyGain = ctx.createGain();
        bodyOsc.type = "sawtooth";

        const hitPitchScale = 1 + (Math.random() - 0.5) * 0.34;
        const bodyStartFreq = Math.max(80, 200 * hitPitchScale);
        const bodyEndFreq = Math.max(30, 45 * hitPitchScale);
        bodyOsc.frequency.setValueAtTime(bodyStartFreq, now);
        bodyOsc.frequency.exponentialRampToValueAtTime(bodyEndFreq, now + 0.09);

        bodyGain.gain.setValueAtTime(0.09 * sfxLevelScale, now);
        bodyGain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

        bodyOsc.connect(bodyGain);
        bodyGain.connect(ctx.destination);
        bodyOsc.start(now);
        bodyOsc.stop(now + 0.09);

        // Layer 2: 노이즈 스냅 (파열 트랜지언트)
        // 극도로 짧은(0.02s) 백색 소음을 bandpass 필터에 통과시켜
        // "뭔가 끊어졌다/부서졌다"는 순간적 파열감을 부여합니다.
        const snapBufSize = Math.ceil(ctx.sampleRate * 0.02);
        const snapBuf = ctx.createBuffer(1, snapBufSize, ctx.sampleRate);
        const snapData = snapBuf.getChannelData(0);
        for (let i = 0; i < snapBufSize; i++) {
            snapData[i] = Math.random() * 2 - 1;
        }

        const snapSrc = ctx.createBufferSource();
        snapSrc.buffer = snapBuf;
        const snapFilter = ctx.createBiquadFilter();
        snapFilter.type = "bandpass";
        snapFilter.frequency.value = 1500 + Math.random() * 1000; // 1500~2500Hz
        snapFilter.Q.value = 1.2;

        const snapGain = ctx.createGain();
        snapGain.gain.setValueAtTime(0.06 * sfxLevelScale, now);
        snapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);

        snapSrc.connect(snapFilter);
        snapFilter.connect(snapGain);
        snapGain.connect(ctx.destination);
        snapSrc.start(now);
        snapSrc.stop(now + 0.02);
    }
};

export const closeAudioContext = (audioCtxRef: AudioContextRefLike) => {
    if (!audioCtxRef.current) return;
    audioCtxRef.current.close();
    audioCtxRef.current = null;
};

export const createRadioFilter = (ctx: AudioContext): { input: AudioNode; output: AudioNode } => {
    const highpass = ctx.createBiquadFilter();
    highpass.type = "highpass";
    highpass.frequency.value = 600; // Increased from 400 for more "thin" sound
    highpass.Q.value = 1.0; // Slightly sharper resonance at the cutoff

    const lowpass = ctx.createBiquadFilter();
    lowpass.type = "lowpass";
    lowpass.frequency.value = 3000; // Decreased from 3500 for more "muffled" high-end
    lowpass.Q.value = 0.7;

    highpass.connect(lowpass);

    return { input: highpass, output: lowpass };
};
