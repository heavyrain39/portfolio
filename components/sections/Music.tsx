"use client";

import { useRef } from "react";
import { musicAlbums, electronicMusic } from "@/data/content";
import { ChevronLeft, ChevronRight } from "lucide-react";
import DecorativeSymbol from "@/components/ui/DecorativeSymbol";

export default function Music() {
    const scrollRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: "left" | "right") => {
        if (scrollRef.current) {
            const { current } = scrollRef;
            const scrollAmount = direction === "left" ? -600 : 600;
            current.scrollBy({ left: scrollAmount, behavior: "smooth" });
        }
    };

    const allMusic = [...musicAlbums, ...electronicMusic];

    return (
        <section id="music" className="container mx-auto px-6 py-32 border-t border-border/20">
            <div className="flex justify-between items-end mb-12">
                <div>
                    <h2 className="text-4xl font-serif font-bold flex items-center gap-1">
                        Auditory Log
                        <DecorativeSymbol />
                    </h2>
                    <p className="font-mono text-sm opacity-50 mt-2">SERAPHIM EP & ELECTRONIC WORKS</p>
                </div>

                <div className="flex gap-2">
                    <button onClick={() => scroll("left")} className="p-2 border border-border rounded-full hover:bg-foreground hover:text-background transition-colors" aria-label="Scroll Left">
                        <ChevronLeft size={20} />
                    </button>
                    <button onClick={() => scroll("right")} className="p-2 border border-border rounded-full hover:bg-foreground hover:text-background transition-colors" aria-label="Scroll Right">
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>

            <div
                ref={scrollRef}
                className="flex gap-8 overflow-x-auto pb-12 snap-x snap-mandatory scrollbar-hide"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
                {allMusic.map((item) => (
                    <div key={item.id} className="min-w-[300px] md:min-w-[400px] snap-center flex flex-col gap-4">
                        <div className="aspect-video bg-black/5 rounded-sm overflow-hidden border border-border/20 relative">
                            <iframe
                                width="100%"
                                height="100%"
                                src={`https://www.youtube.com/embed/${item.youtubeId}`}
                                title={item.title}
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                allowFullScreen
                                loading="lazy"
                                className="absolute inset-0"
                            />
                        </div>
                        <h4 className="font-mono text-sm uppercase tracking-wide border-l-2 border-primary pl-3">
                            {item.title}
                        </h4>
                    </div>
                ))}
                {/* Spacer */}
                <div className="min-w-[100px]" />
            </div>

        </section>
    );
}
