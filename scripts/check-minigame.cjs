// Targeted regressions for the game loop, boundaries, and reusable audio data.
// Run with: node scripts/check-minigame.cjs
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');
const gameRoot = path.join(root, 'components/ui/minigame');

function createLoader(overrides = {}, globals = {}) {
    const cache = new Map();
    function load(filename) {
        if (cache.has(filename)) return cache.get(filename).exports;
        const module = { exports: {} };
        cache.set(filename, module);
        const source = fs.readFileSync(filename, 'utf8');
        const js = ts.transpileModule(source, {
            compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.React, esModuleInterop: true }
        }).outputText;
        vm.runInNewContext(js, {
            ...globals, module, exports: module.exports,
            require(specifier) {
                if (specifier in overrides) return overrides[specifier];
                if (!specifier.startsWith('.')) return require(specifier);
                const base = path.resolve(path.dirname(filename), specifier);
                return load(fs.existsSync(base + '.ts') ? base + '.ts' : base + '.tsx');
            }
        }, { filename });
        return module.exports;
    }
    return load;
}

const load = createLoader();
const { applyBoundaryConstraints } = load(path.join(gameRoot, 'physics.ts'));
const { getWorldUnitPositions } = load(path.join(gameRoot, 'formation.ts'));
const { spawnEnemyGroup } = load(path.join(gameRoot, 'spawn.ts'));
const { DEFAULT_PHYSICS_PRESET } = load(path.join(gameRoot, 'constants.ts'));
const near = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-7, `${actual} != ${expected}`);

function makeGroup(overrides = {}) {
    return {
        family: 'cluster', x: 300, y: 730, radius: 30, rotation: 0,
        units: [{}, {}, {}], hasFullyEnteredArena: true, spawnSide: 'left',
        vx: 0, vy: 1, impactVx: 0, impactVy: 0, restitution: 0.3, dir: 1,
        ...overrides
    };
}

// Two units cross the bottom wall together: correct by the largest violation,
// not the sum. A second constraint pass must not move the group again.
const bottomGroup = makeGroup();
const required = Math.max(...getWorldUnitPositions(bottomGroup).map(p => p.y)) - 735;
applyBoundaryConstraints(bottomGroup, 600, 720);
near(730 - bottomGroup.y, required);
near(bottomGroup.vy, -0.3);
const settledY = bottomGroup.y;
applyBoundaryConstraints(bottomGroup, 600, 720);
near(bottomGroup.y, settledY);

for (const [x, y, vx, vy] of [[-50, 300, -2, 0], [670, 300, 2, 0], [300, -50, 0, -2], [670, 780, 2, 2]]) {
    const group = makeGroup({ x, y, vx, vy, impactVx: vx, impactVy: vy });
    applyBoundaryConstraints(group, 600, 720);
    for (const p of getWorldUnitPositions(group)) {
        assert.ok(p.x >= -15 - 1e-7 && p.x <= 615 + 1e-7);
        assert.ok(p.y >= -15 - 1e-7 && p.y <= 735 + 1e-7);
    }
}
for (const spawnSide of ['left', 'right']) {
    const x = spawnSide === 'left' ? -100 : 700;
    const group = makeGroup({ x, y: 300, spawnSide, hasFullyEnteredArena: false });
    applyBoundaryConstraints(group, 600, 720);
    near(group.x, x); // Entry from outside the arena remains possible.
}
const oversized = makeGroup({ x: 70, y: 30, radius: 100 });
applyBoundaryConstraints(oversized, 40, 40);
const centered = { x: oversized.x, y: oversized.y };
for (let i = 0; i < 5; i++) applyBoundaryConstraints(oversized, 40, 40);
near(oversized.x, centered.x);
near(oversized.y, centered.y);
console.log('PASS: group bounds, bounce, spawn entry, and oversized formations');

// Execute the real component effect with a minimal DOM/React shell and a
// controlled rAF clock. Rendering and sound output are stubbed, not firing logic.
function mountGame() {
    const effects = [], stateUpdates = [], sounds = [], motions = [];
    const listeners = new Map(), windowListeners = new Map();
    let nextFrame;
    class Element {
        constructor(control = false) { this.control = control; }
        closest() { return this.control ? this : null; }
    }
    const context = new Proxy({}, { get: (target, key) => target[key] ?? (() => {}) });
    const canvas = Object.assign(new Element(), { width: 640, height: 720, getContext: () => context });
    const container = {
        offsetWidth: 640, offsetHeight: 720, style: { transform: 'none' },
        getBoundingClientRect: () => ({ left: 0, top: 0 }),
        addEventListener: (name, fn) => listeners.set(name, fn), removeEventListener() {}
    };
    const react = {
        useRef: current => ({ current }),
        useState: value => [value, next => stateUpdates.push(next)],
        useEffect: fn => effects.push(fn),
        createElement: (type, props, ...children) => ({ type, props: props ?? {}, children })
    };
    const motion = {
        useMotionValue(value) {
            const result = { get: () => value, set: next => { value = next; } };
            motions.push(result);
            return result;
        },
        useSpring: value => value
    };
    const loopLoad = createLoader({
        react,
        'framer-motion': motion,
        './OperatorComments': () => null,
        './minigame/MiniGameCrosshair': () => null,
        './minigame/MiniGameHud': () => null,
        './minigame/spawn': { getSpawnIntervalFrames: () => 33, spawnEnemyGroup: () => {} },
        './minigame/audio': { ensureAudioContext: () => ({}), closeAudioContext() {}, playGameSound: ({ type }) => sounds.push(type) }
    }, {
        Element,
        document: { documentElement: { getAttribute: () => 'dark' } },
        getComputedStyle: () => ({ getPropertyValue: () => '' }),
        MutationObserver: class { observe() {} disconnect() {} },
        ResizeObserver: class { observe() {} disconnect() {} },
        window: { addEventListener: (name, fn) => windowListeners.set(name, fn), removeEventListener() {}, clearTimeout() {}, setTimeout: () => 1 },
        performance: { now: () => 1000 },
        WheelEvent: { DOM_DELTA_LINE: 1, DOM_DELTA_PAGE: 2 },
        requestAnimationFrame: fn => { nextFrame = fn; return 1; },
        cancelAnimationFrame() {}
    });
    const tree = loopLoad(path.join(root, 'components/ui/MiniGame.tsx')).default();
    tree.props.ref.current = container;
    tree.children.find(child => child?.type === 'canvas').props.ref.current = canvas;
    effects.forEach(fn => fn());
    const tick = time => nextFrame(time);
    tick(0);
    return {
        tick, sounds, stateUpdates, heat: motions[0], color: motions[1],
        down: (control = false) => listeners.get('pointerdown')({ target: control ? new Element(true) : canvas, preventDefault() {} }),
        up: () => windowListeners.get('pointerup')(),
        switchMode: () => listeners.get('wheel')({ deltaX: 0, deltaY: 120, deltaMode: 0, preventDefault() {} }),
        hover: () => listeners.get('pointerenter')()
    };
}

for (const fps of [20, 30, 60, 120, 144]) {
    const game = mountGame();
    game.hover();
    game.down();
    const stateCount = game.stateUpdates.length;
    for (let i = 1; i <= fps * 5; i++) game.tick(i * 1000 / fps);
    assert.equal(game.sounds.filter(s => s === 'shoot').length, 75, `${fps} fps cadence`);
    near(game.heat.get(), 75 / 180);
    assert.equal(game.stateUpdates.length, stateCount, 'heat/color ticks should not set React state');
    assert.notEqual(game.color.get(), '#06b6d4');
    game.up();
    for (let i = 1; i <= fps * 2; i++) game.tick(5000 + i * 1000 / fps);
    near(game.heat.get(), 0);
}
const controlGame = mountGame();
controlGame.down(true);
for (let i = 1; i <= 30; i++) controlGame.tick(i * 1000 / 30);
assert.equal(controlGame.sounds.length, 0);
near(controlGame.heat.get(), 0);
const hotGame = mountGame();
hotGame.down();
for (let i = 1; i <= 360; i++) hotGame.tick(i * 1000 / 30);
assert.equal(hotGame.sounds.filter(s => s === 'shoot').length, 180);
const hotShots = hotGame.sounds.length;
for (let i = 361; i <= 385; i++) hotGame.tick(i * 1000 / 30);
assert.equal(hotGame.sounds.length, hotShots, 'overheated gun must stop firing');
for (let i = 386; i <= 420; i++) hotGame.tick(i * 1000 / 30);
assert.ok(hotGame.sounds.length > hotShots, 'held trigger resumes after cooldown');
const quadGame = mountGame();
quadGame.hover();
quadGame.switchMode();
quadGame.down();
for (let i = 1; i <= 205; i++) quadGame.tick(i * 1000 / 30);
assert.equal(quadGame.sounds.filter(s => s === 'shoot').length, 90, 'QUAD overheats after 90 volleys');
console.log('PASS: real loop at 20/30/60/120/144 fps, UI updates, HUD input, overheat/recovery');

const { playGameSound, closeAudioContext } = load(path.join(gameRoot, 'audio.ts'));
function fakeAudioContext() {
    const parameter = () => ({ setValueAtTime() {}, exponentialRampToValueAtTime() {} });
    const node = () => ({ frequency: parameter(), gain: parameter(), Q: {}, connect() {}, start() {}, stop() {} });
    return {
        state: 'running', sampleRate: 44100, currentTime: 0, destination: {}, buffers: [], sources: [],
        createBuffer(channels, length, rate) {
            assert.ok(Number.isInteger(length));
            const data = new Float32Array(length);
            const buffer = { length, sampleRate: rate, getChannelData: () => data };
            this.buffers.push(buffer);
            return buffer;
        },
        createBufferSource() { const source = node(); this.sources.push(source); return source; },
        createOscillator: node, createGain: node, createBiquadFilter: node, close() {}
    };
}
const ctx = fakeAudioContext();
const ref = { current: ctx };
for (let i = 0; i < 100; i++) {
    for (const type of ['impact', 'hit']) playGameSound({ audioCtxRef: ref, isMuted: false, type, sfxLevelScale: 1 });
}
assert.equal(ctx.buffers.length, 8);
assert.equal(ctx.sources.length, 200, 'each play still needs a fresh one-shot source');
assert.ok(ctx.sources.every(source => ctx.buffers.includes(source.buffer)));
playGameSound({ audioCtxRef: ref, isMuted: true, type: 'hit', sfxLevelScale: 1 });
assert.equal(ctx.sources.length, 200);
closeAudioContext(ref);
assert.equal(ref.current, null);
const nextCtx = fakeAudioContext();
playGameSound({ audioCtxRef: { current: nextCtx }, isMuted: false, type: 'impact', sfxLevelScale: 1 });
assert.equal(nextCtx.buffers.length, 4);
assert.ok(!ctx.buffers.includes(nextCtx.sources[0].buffer));
console.log('PASS: 200 impacts reuse 8 noise buffers; mute and context isolation');

const groups = [];
for (let i = 0; i < 100; i++) spawnEnemyGroup({ enemyGroups: groups, canvasWidth: 640, canvasHeight: 720, physicsPreset: DEFAULT_PHYSICS_PRESET, arenaScale: 1 });
assert.ok(groups.length > 0);
assert.ok(groups.flatMap(g => g.units).every(unit => unit.hitFlashUntil === 0));
assert.ok(groups.reduce((sum, g) => sum + g.units.length, 0) <= 14);
console.log('PASS: spawning, population cap, and hit-flash initialization');
