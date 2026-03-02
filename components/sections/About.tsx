"use client";

import TypewriterText from "@/components/ui/TypewriterText";
import DecorativeSymbol from "@/components/ui/DecorativeSymbol";
import { useLanguage } from "@/context/LanguageContext";
import { dictionary } from "@/data/dictionary";

export default function About() {
    const { language, isMounted } = useLanguage();
    const t = dictionary[language].about;

    return (
        <section id="about" className="container mx-auto px-6 py-32 grid grid-cols-1 md:grid-cols-12 gap-12">

            <div className="md:col-span-4">
                <h2 className="text-4xl font-serif font-bold mb-6 flex items-center gap-1">
                    Entity Profile
                    <DecorativeSymbol />
                </h2>
                <div className="w-12 h-1 bg-current mb-6" />
                <p className="font-mono text-sm opacity-60">
                    SYSTEM_ID: YAKSHAWAN<br />
                    ROLE: WRITER / DEVELOPER<br />
                    LOCATION: SEOUL, KR
                </p>
            </div>

            <div className="md:col-span-8 flex flex-col gap-8 text-lg opacity-80 leading-relaxed text-justify break-keep">
                <div className="text-2xl md:text-3xl font-serif font-bold opacity-100 mb-4 flex items-center">
                    <TypewriterText text={isMounted ? t.title : dictionary.ko.about.title} className="block" />
                </div>
                <div>
                    <TypewriterText text={isMounted ? t.description : dictionary.ko.about.description} />
                </div>

                <div className="pt-4 mt-4">
                    <h4 className="font-mono text-sm uppercase mb-4 opacity-50">{isMounted ? t.highlightsTitle : dictionary.ko.about.highlightsTitle}</h4>
                    <ul className="space-y-4 list-disc pl-5 marker:text-current/50">
                        {(isMounted ? t.highlights : dictionary.ko.about.highlights).map((highlight, index) => (
                            <li key={index}>{highlight}</li>
                        ))}
                    </ul>
                </div>
            </div >

        </section >
    );
}
