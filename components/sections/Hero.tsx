"use client";

import { motion } from "framer-motion";
import { heroContent } from "@/data/content";
import MiniGame from "@/components/ui/MiniGame";
import { useLanguage } from "@/context/LanguageContext";
import { dictionary } from "@/data/dictionary";

const Threads = ({ size = 20 }: { size?: number }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 16 16"
        fill="currentColor"
    >
        <path d="M6.321 6.016c-.27-.18-1.166-.802-1.166-.802.756-1.081 1.753-1.502 3.132-1.502.975 0 1.803.327 2.394.948s.928 1.509 1.005 2.644q.492.207.905.484c1.109.745 1.719 1.86 1.719 3.137 0 2.716-2.226 5.075-6.256 5.075C4.594 16 1 13.987 1 7.994 1 2.034 4.482 0 8.044 0 9.69 0 13.55.243 15 5.036l-1.36.353C12.516 1.974 10.163 1.43 8.006 1.43c-3.565 0-5.582 2.171-5.582 6.79 0 4.143 2.254 6.343 5.63 6.343 2.777 0 4.847-1.443 4.847-3.556 0-1.438-1.208-2.127-1.27-2.127-.236 1.234-.868 3.31-3.644 3.31-1.618 0-3.013-1.118-3.013-2.582 0-2.09 1.984-2.847 3.55-2.847.586 0 1.294.04 1.663.114 0-.637-.54-1.728-1.9-1.728-1.25 0-1.566.405-1.967.868ZM8.716 8.19c-2.04 0-2.304.87-2.304 1.416 0 .878 1.043 1.168 1.6 1.168 1.02 0 2.067-.282 2.232-2.423a6.2 6.2 0 0 0-1.528-.161" />
    </svg>
);

const TwitterX = ({ size = 20 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="currentColor">
        <path d="M12.6.75h2.454l-5.36 6.142L16 15.25h-4.937l-3.867-5.07-4.425 5.07H.316l5.733-6.57L0 .75h5.063l3.495 4.633L12.601.75Zm-.86 13.028h1.36L4.323 2.145H2.865z" />
    </svg>
);

const Github = ({ size = 20 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="currentColor">
        <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8" />
    </svg>
);

const Mail = ({ size = 20 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="currentColor">
        <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2zm2-1a1 1 0 0 0-1 1v.217l7 4.2 7-4.2V4a1 1 0 0 0-1-1zm13 2.383-4.708 2.825L15 11.105zm-.034 6.876-5.64-3.471L8 9.583l-1.326-.795-5.64 3.47A1 1 0 0 0 2 13h12a1 1 0 0 0 .966-.741M1 11.105l4.708-2.897L1 5.383z" />
    </svg>
);



export default function Hero() {
    const { language, toggleLanguage, isMounted } = useLanguage();
    const t = dictionary[language].hero;

    return (
        <section className="h-[95vh] min-h-[95vh] flex flex-col justify-center container mx-auto px-6 pt-32 pb-20 relative">

            {/* Decorative Grid Numbers */}
            <div className="absolute top-32 right-6 text-xs font-mono opacity-15 flex flex-col gap-1 items-end">
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
                <h1 className="flex justify-between items-end w-full text-5xl md:text-7xl font-serif font-bold tracking-tight mb-5 leading-[0.9] pointer-events-auto select-none">
                    {heroContent.headline.split("|").map((part, i) => (
                        <span key={i} className={i === 1 ? "opacity-15 font-light inline-block" : ""}>{part.trim()}</span>
                    ))}
                </h1>

                <p className="text-base md:text-lg opacity-60 leading-relaxed text-justify break-keep max-w-[26rem] md:max-w-[28rem] pointer-events-auto select-none">
                    {isMounted ? t.introduction : heroContent.introduction}
                </p>

                <div className="flex justify-center gap-5 mt-12 pointer-events-auto">
                    <a href={heroContent.socials.threads} target="_blank" rel="noopener noreferrer" className="opacity-60 hover:opacity-100 transition-opacity" aria-label="Threads">
                        <Threads size={20} />
                    </a>
                    <a href={heroContent.socials.twitter} target="_blank" rel="noopener noreferrer" className="opacity-60 hover:opacity-100 transition-opacity" aria-label="Twitter">
                        <TwitterX size={20} />
                    </a>
                    <a href={heroContent.socials.github} target="_blank" rel="noopener noreferrer" className="opacity-60 hover:opacity-100 transition-opacity" aria-label="GitHub">
                        <Github size={20} />
                    </a>
                    <a href={heroContent.socials.email} className="opacity-60 hover:opacity-100 transition-opacity" aria-label="Email">
                        <Mail size={20} />
                    </a>
                </div>
            </motion.div>

            {/* Mini Game (PC Only, Right Side) */}
            <MiniGame />
        </section >
    );
}
