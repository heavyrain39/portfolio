"use client";

import { motion } from "framer-motion";
import { heroContent } from "@/data/content";
import { Github, Twitter, Mail } from "lucide-react";
import MiniGame from "@/components/ui/MiniGame";

export default function Hero() {
    return (
        <section className="min-h-[80vh] flex flex-col justify-center container mx-auto px-6 pt-32 pb-20 relative">

            {/* Decorative Grid Numbers */}
            <div className="absolute top-32 right-6 text-xs font-mono opacity-30 flex flex-col gap-1 items-end">
                <span>37°33'59.0"N</span>
                <span>126°58'40.6"E</span>
                <span>SEOUL, KR</span>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                className="max-w-4xl z-10"
            >
                <span className="block font-mono text-sm mb-4 opacity-60 tracking-widest">PORTFOLIO.2026 ■■■■</span>
                <h1 className="text-6xl md:text-8xl font-serif font-black tracking-tight mb-8 leading-[0.9] w-fit">
                    {heroContent.headline.split("|").map((part, i) => (
                        <span key={i} className={i === 1 ? "opacity-30 font-light ml-2 inline-block" : ""}>{part}</span>
                    ))}
                </h1>

                <p className="text-lg md:text-xl opacity-80 leading-relaxed text-justify break-keep max-w-[28rem] md:max-w-[36rem]">
                    {heroContent.introduction}
                </p>

                <div className="flex gap-6 mt-12">
                    <a href={heroContent.socials.github} target="_blank" rel="noopener noreferrer" className="hover:opacity-50 transition-opacity" aria-label="GitHub">
                        <Github size={20} />
                    </a>
                    <a href={heroContent.socials.twitter} target="_blank" rel="noopener noreferrer" className="hover:opacity-50 transition-opacity" aria-label="Twitter">
                        <Twitter size={20} />
                    </a>
                    <a href={heroContent.socials.email} className="hover:opacity-50 transition-opacity" aria-label="Email">
                        <Mail size={20} />
                    </a>
                </div>
            </div>
        </motion.div>

            {/* Mini Game (PC Only, Right Side) */ }
    <MiniGame />
        </section >
    );
}
