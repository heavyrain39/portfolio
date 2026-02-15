import LegacyMiniGame from "@/components/ui/MiniGame";
import PackageMiniGame from "@/sidearm-framer-package/src/components/MiniGame";
import { DEFAULT_DIALOGUES } from "@/sidearm-framer-package/src/types";

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

export default function SidearmABPage() {
    return (
        <main className="min-h-screen bg-background text-foreground px-4 py-8 md:px-8 md:py-10">
            <div className="mx-auto w-full max-w-[1400px] space-y-8">
                <header className="space-y-3">
                    <p className="font-mono text-xs opacity-60">SIDEARM VISUAL REGRESSION CHECK</p>
                    <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">A/B Test: Legacy vs Framer Package</h1>
                    <p className="text-sm opacity-70">
                        Compare both sections for 20-30 seconds each, then score pass/fail by checklist below.
                    </p>
                </header>

                <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                    <article className="space-y-3">
                        <div className="flex items-center justify-between">
                            <h2 className="font-mono text-xs tracking-widest opacity-70">A. LEGACY (PORTFOLIO HERO)</h2>
                            <span className="font-mono text-[10px] opacity-50">Desktop-biased baseline</span>
                        </div>
                        <div className="relative h-[520px] overflow-hidden rounded-xl border border-foreground/15 bg-black/30">
                            <LegacyMiniGame />
                        </div>
                    </article>

                    <article className="space-y-3">
                        <div className="flex items-center justify-between">
                            <h2 className="font-mono text-xs tracking-widest opacity-70">B. PACKAGE (FRAMER TARGET)</h2>
                            <span className="font-mono text-[10px] opacity-50">Mobile-visible default</span>
                        </div>
                        <div className="relative h-[520px] overflow-hidden rounded-xl border border-foreground/15 bg-black/30">
                            <PackageMiniGame
                                className="absolute inset-0 h-full w-full cursor-none z-0"
                                themeColor="#06b6d4"
                                accentColor="#ffffff"
                                showOperator={true}
                                dialogueList={DEFAULT_DIALOGUES}
                                operatorAssetBasePath="/portfolio/images/operator"
                                enableSound={true}
                                initialMuted={false}
                                volume={70}
                                projectileSpeed={45}
                                spray={0.12}
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
