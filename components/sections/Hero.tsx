"use client";

import { motion } from "framer-motion";
import { heroContent } from "@/data/content";
import { Github, Twitter, Mail } from "lucide-react";
import MiniGame from "@/components/ui/MiniGame";
import { useLanguage } from "@/context/LanguageContext";
import { dictionary } from "@/data/dictionary";

export default function Hero() {
    const { language, toggleLanguage, isMounted } = useLanguage();
    const t = dictionary[language].hero;

    return (
        <section className="h-[95vh] min-h-[95vh] flex flex-col justify-center container mx-auto px-6 pt-32 pb-20 relative">

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
                className="w-full max-w-[28rem] z-10 pointer-events-none"
            >
                <div className="flex justify-between items-center w-full font-mono text-sm mb-4 pointer-events-auto select-none">
                    <span className="opacity-60 tracking-widest">PORTFOLIO.2026 ■■■■</span>
                    {/* Language Toggle */}
                    {isMounted && (
                        <div className="flex items-center gap-1 text-sm font-mono tracking-widest select-none" aria-label="Toggle Language">
                            <button
                                onClick={() => language !== "en" && toggleLanguage()}
                                className={`transition-opacity ${language === "en" ? "font-bold opacity-100" : "opacity-30 hover:opacity-100"}`}
                            >
                                ENG
                            </button>
                            <span className="opacity-20 mx-1">/</span>
                            <button
                                onClick={() => language !== "ko" && toggleLanguage()}
                                className={`transition-opacity ${language === "ko" ? "font-bold opacity-100" : "opacity-30 hover:opacity-100"}`}
                            >
                                KOR
                            </button>
                        </div>
                    )}
                </div>
                <h1 className="flex justify-between items-end w-full text-5xl md:text-7xl font-serif font-bold tracking-tight mb-8 leading-[0.9] pointer-events-auto select-none">
                    {heroContent.headline.split("|").map((part, i) => (
                        <span key={i} className={i === 1 ? "opacity-30 font-light inline-block" : ""}>{part.trim()}</span>
                    ))}
                </h1>

                <p className="text-base md:text-lg opacity-80 leading-relaxed text-justify break-keep max-w-[26rem] md:max-w-[28rem] pointer-events-auto select-none">
                    {isMounted ? t.introduction : heroContent.introduction}
                </p>

                <div className="flex gap-6 mt-12 pointer-events-auto">
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
            </motion.div>

            {/* Mini Game (PC Only, Right Side) */}
            <MiniGame />
        </section >
    );
}
