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
            <About />

            <footer className="py-12 border-t border-border/20 text-center font-mono text-xs opacity-40">
                © 2026 YAKSHAWAN. ALL RIGHTS RESERVED.
            </footer>
        </main>
    );
}
