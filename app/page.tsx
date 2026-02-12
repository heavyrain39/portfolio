import Hero from "@/components/sections/Hero";
import Projects from "@/components/sections/Projects";
import Music from "@/components/sections/Music";
import About from "@/components/sections/About";
import SquircleTopBorder from "@/components/ui/SquircleTopBorder";

export default function Home() {
    return (
        <main className="min-h-screen">
            <Hero />
            <Projects />
            <Music />

            <div className="relative mx-2 md:mx-4 mt-24">
                {/* Decorative Dots */}
                <div className="absolute top-8 left-8 w-3 h-3 rounded-full bg-background z-10" />
                <div className="absolute top-8 right-8 w-3 h-3 rounded-full bg-background z-10" />

                {/* Top Cap (Squircle) */}
                <SquircleTopBorder className="text-foreground" />

                {/* Main Body (Inverted Colors) */}
                <div className="bg-foreground text-background pb-8">
                    <About />

                    <footer className="py-12 text-center font-mono text-xs opacity-40 text-inherit">
                        © 2026 YAKSHAWAN. ALL RIGHTS RESERVED.
                    </footer>
                </div>
            </div>
        </main>
    );
}
