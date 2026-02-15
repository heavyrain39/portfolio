"use client";

import { useMemo, useState } from "react";
import LegacyMiniGame from "@/components/ui/MiniGame";
import PackageMiniGame from "@/sidearm-framer-package/src/components/MiniGame";
import { DEFAULT_DIALOGUES, type SfxProfile } from "@/sidearm-framer-package/src/types";

const CHECK_ITEMS = [
    "Crosshair responsiveness",
    "Shot cadence and spread feel",
    "Target spawn density and pacing",
    "Hit flash and particle readability",
    "HUD score increment behavior",
    "Operator portrait + typing timing",
    "Sound toggle and volume response",
    "Touch hold + drag on mobile"
];

const THEME_PRESETS = {
    custom: { title: "Custom", themeColor: "#06b6d4", accentColor: "#ffffff" },
    monoNeonCyan: { title: "Mono + Cyan", themeColor: "#d1d5db", accentColor: "#22d3ee" },
    modernGrayPink: { title: "Gray + Pink", themeColor: "#374151", accentColor: "#f472b6" },
    beigeRed: { title: "Beige + Red", themeColor: "#d6b48b", accentColor: "#dc2626" },
    cosmicPurpleYellow: { title: "Purple + Yellow", themeColor: "#6d28d9", accentColor: "#fde047" }
} as const;

type ThemePresetKey = keyof typeof THEME_PRESETS;

export default function SidearmABPage() {
    const [themePreset, setThemePreset] = useState<ThemePresetKey>("custom");
    const [customThemeColor, setCustomThemeColor] = useState("#06b6d4");
    const [customAccentColor, setCustomAccentColor] = useState("#ffffff");
    const [enableSound, setEnableSound] = useState(true);
    const [sfxProfile, setSfxProfile] = useState<SfxProfile>("classic");
    const [volume, setVolume] = useState(70);
    const [projectileSpeed, setProjectileSpeed] = useState(45);
    const [spray, setSpray] = useState(0.12);

    const activeColors = useMemo(() => {
        if (themePreset === "custom") {
            return {
                themeColor: customThemeColor,
                accentColor: customAccentColor
            };
        }

        return {
            themeColor: THEME_PRESETS[themePreset].themeColor,
            accentColor: THEME_PRESETS[themePreset].accentColor
        };
    }, [themePreset, customThemeColor, customAccentColor]);

    return (
        <main className="min-h-screen bg-background text-foreground px-4 py-8 md:px-8 md:py-10">
            <div className="mx-auto w-full max-w-[1400px] space-y-8">
                <header className="space-y-3">
                    <p className="font-mono text-xs opacity-60">SIDEARM VISUAL REGRESSION CHECK</p>
                    <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">A/B Test: Legacy vs Package</h1>
                    <p className="text-sm opacity-70">
                        Compare both sections for 20-30 seconds each, then score pass/fail by checklist below.
                    </p>
                </header>

                <section className="rounded-xl border border-foreground/15 p-5 md:p-6 space-y-4">
                    <h3 className="font-mono text-xs tracking-widest opacity-70">PACKAGE QUICK CONTROLS (B ONLY)</h3>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                        <label className="space-y-1 text-xs">
                            <span className="font-mono opacity-60">Theme Preset</span>
                            <select
                                value={themePreset}
                                onChange={(e) => setThemePreset(e.target.value as ThemePresetKey)}
                                className="w-full rounded-md border border-foreground/20 bg-background px-2 py-2 text-sm"
                            >
                                {Object.entries(THEME_PRESETS).map(([key, preset]) => (
                                    <option key={key} value={key}>
                                        {preset.title}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <label className="space-y-1 text-xs">
                            <span className="font-mono opacity-60">SFX Profile</span>
                            <select
                                value={sfxProfile}
                                onChange={(e) => setSfxProfile(e.target.value as SfxProfile)}
                                className="w-full rounded-md border border-foreground/20 bg-background px-2 py-2 text-sm"
                            >
                                <option value="classic">Classic</option>
                                <option value="deep">Deep Alt</option>
                            </select>
                        </label>

                        <label className="space-y-1 text-xs">
                            <span className="font-mono opacity-60">Sound</span>
                            <div className="flex h-[42px] items-center rounded-md border border-foreground/20 px-3">
                                <input
                                    type="checkbox"
                                    checked={enableSound}
                                    onChange={(e) => setEnableSound(e.target.checked)}
                                    className="h-4 w-4 accent-cyan-500"
                                />
                                <span className="ml-2 text-sm">{enableSound ? "Enabled" : "Disabled"}</span>
                            </div>
                        </label>

                        <label className="space-y-1 text-xs">
                            <span className="font-mono opacity-60">Volume ({volume}%)</span>
                            <input
                                type="range"
                                min={0}
                                max={100}
                                step={1}
                                value={volume}
                                disabled={!enableSound}
                                onChange={(e) => setVolume(Number(e.target.value))}
                                className="w-full"
                            />
                        </label>

                        <label className="space-y-1 text-xs">
                            <span className="font-mono opacity-60">Bullet Speed ({projectileSpeed})</span>
                            <input
                                type="range"
                                min={20}
                                max={120}
                                step={1}
                                value={projectileSpeed}
                                onChange={(e) => setProjectileSpeed(Number(e.target.value))}
                                className="w-full"
                            />
                        </label>

                        <label className="space-y-1 text-xs">
                            <span className="font-mono opacity-60">Spray ({spray.toFixed(2)})</span>
                            <input
                                type="range"
                                min={0}
                                max={0.7}
                                step={0.01}
                                value={spray}
                                onChange={(e) => setSpray(Number(e.target.value))}
                                className="w-full"
                            />
                        </label>

                        <label className="space-y-1 text-xs">
                            <span className="font-mono opacity-60">Theme Color</span>
                            <input
                                type="color"
                                value={activeColors.themeColor}
                                disabled={themePreset !== "custom"}
                                onChange={(e) => setCustomThemeColor(e.target.value)}
                                className="h-[42px] w-full rounded-md border border-foreground/20 bg-background p-1 disabled:opacity-50"
                            />
                        </label>

                        <label className="space-y-1 text-xs">
                            <span className="font-mono opacity-60">Accent Color</span>
                            <input
                                type="color"
                                value={activeColors.accentColor}
                                disabled={themePreset !== "custom"}
                                onChange={(e) => setCustomAccentColor(e.target.value)}
                                className="h-[42px] w-full rounded-md border border-foreground/20 bg-background p-1 disabled:opacity-50"
                            />
                        </label>
                    </div>
                </section>

                <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                    <article className="space-y-3">
                        <div className="flex items-center justify-between">
                            <h2 className="font-mono text-xs tracking-widest opacity-70">A. LEGACY (PORTFOLIO HERO)</h2>
                            <span className="font-mono text-[10px] opacity-50">Desktop-biased baseline</span>
                        </div>
                        <div className="relative h-[520px] overflow-hidden rounded-xl border border-foreground/15 bg-foreground/[0.04]">
                            <LegacyMiniGame />
                        </div>
                    </article>

                    <article className="space-y-3">
                        <div className="flex items-center justify-between">
                            <h2 className="font-mono text-xs tracking-widest opacity-70">B. PACKAGE</h2>
                            <span className="font-mono text-[10px] opacity-50">Mobile-visible default</span>
                        </div>
                        <div className="relative h-[520px] overflow-hidden rounded-xl border border-foreground/15 bg-foreground/[0.04]">
                            <PackageMiniGame
                                className="absolute inset-0 h-full w-full cursor-none z-0"
                                themeColor={activeColors.themeColor}
                                accentColor={activeColors.accentColor}
                                showOperator={true}
                                dialogueList={DEFAULT_DIALOGUES}
                                operatorAssetBasePath="/portfolio/images/operator"
                                enableSound={enableSound}
                                sfxProfile={sfxProfile}
                                initialMuted={false}
                                volume={volume}
                                projectileSpeed={projectileSpeed}
                                spray={spray}
                                hitParticleMultiplier={1}
                                killParticleMultiplier={1}
                                showHud={true}
                                isEditorMode={false}
                            />
                        </div>
                    </article>
                </section>

                <section className="rounded-xl border border-foreground/15 p-5 md:p-6">
                    <h3 className="font-mono text-xs tracking-widest opacity-70">CHECKLIST</h3>
                    <ul className="mt-4 grid grid-cols-1 gap-2 md:grid-cols-2">
                        {CHECK_ITEMS.map((item) => (
                            <li key={item} className="flex items-center gap-2 text-sm opacity-80">
                                <input type="checkbox" className="h-4 w-4 accent-cyan-500" />
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>
                </section>
            </div>
        </main>
    );
}
