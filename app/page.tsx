import Hero from "@/components/sections/Hero";
import Projects from "@/components/sections/Projects";
import Music from "@/components/sections/Music";
import About from "@/components/sections/About";

export default function Home() {
    return (
        <main className="min-h-screen">
            <Hero />
            <Projects />
            <Music />

            <div className="relative bg-foreground text-background rounded-t-[2.5rem] mx-2 md:mx-4 pb-8 mt-24">
                {/* Decorative Dots */}
                <div className="absolute top-8 left-8 w-3 h-3 rounded-full bg-background" />
                <div className="absolute top-8 right-8 w-3 h-3 rounded-full bg-background" />

                <About />

                <footer className="py-12 text-center font-mono text-xs opacity-40">
                    © 2026 YAKSHAWAN. ALL RIGHTS RESERVED.
                </footer>
            </div>
        </main>
    );
}
