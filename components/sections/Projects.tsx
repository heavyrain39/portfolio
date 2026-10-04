"use client";

import { useState } from "react";
import { projects } from "@/data/content";
import { dictionary } from "@/data/dictionary";
import ProjectCard from "@/components/ui/ProjectCard";
import { motion } from "framer-motion";
import DecorativeSymbol from "@/components/ui/DecorativeSymbol";
import SectionIndex from "@/components/ui/SectionIndex";
import { useLanguage } from "@/context/LanguageContext";
import { Minus, Plus } from "lucide-react";

const FEATURED_PROJECT_IDS = [
    "kalavinka",
    "sidearm",
    "fruit-fly-girl",
    "haruna",
    "mstrmnd",
    "aftertrace",
    "nimblist",
    "hanjul",
    "takt",
    "promptviewer",
] as const;

const featuredProjectIdSet = new Set<string>(FEATURED_PROJECT_IDS);

const projectsByLastUpdated = [...projects].sort((a, b) =>
    b.lastUpdated.localeCompare(a.lastUpdated)
);

const featuredProjects = FEATURED_PROJECT_IDS.map((id) =>
    projects.find((project) => project.id === id)
).filter((project): project is NonNullable<typeof project> => Boolean(project));

const remainingProjects = projectsByLastUpdated.filter((project) =>
    !featuredProjectIdSet.has(project.id)
);

export default function Projects() {
    const [showAllProjects, setShowAllProjects] = useState(false);
    const { language, isMounted } = useLanguage();
    const t = dictionary[isMounted ? language : "ko"].projects;
    const visibleProjects = showAllProjects
        ? [...featuredProjects, ...remainingProjects]
        : featuredProjects;
    const hiddenProjectCount = remainingProjects.length;

    return (
        <section id="projects" className="container mx-auto px-6 py-32 border-t border-border/15">
            <div className="flex flex-col md:flex-row justify-between md:items-end mb-20 gap-4">
                <div>
                    <SectionIndex index={1} label="WORKS" className="mb-5" />
                    <h2 className="text-4xl font-serif font-bold flex items-center gap-1">
                        Selected Works
                        <DecorativeSymbol />
                    </h2>
                </div>
                <div className="flex gap-6 text-sm font-mono opacity-40 uppercase tracking-widest">
                    <span>Total {projects.length}</span>
                    <span>Indie Dev / Web / Game</span>
                </div>
            </div>

            <div
                id="project-grid"
                className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-16 md:gap-y-20"
            >
                {visibleProjects.map((project, index) => (
                    // The outer wrapper is what gets observed. Chromium intersects the
                    // clip-path'd box, and the fully clipped reveal state is a zero-width
                    // line at the card's left edge — on narrow screens that line sat
                    // inside the -50px margin and the cards never appeared.
                    <motion.div
                        key={project.id}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-50px 0px" }}
                    >
                        <motion.div
                            variants={{
                                hidden: { clipPath: "inset(0 100% 0 0)", opacity: 0 },
                                visible: { clipPath: "inset(0 0% 0 0)", opacity: 1 }
                            }}
                            transition={{
                                clipPath: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
                                opacity: { duration: 0.2 },
                                delay: (index % 2) * 0.1
                            }}
                        >
                            <ProjectCard project={project} />
                        </motion.div>
                    </motion.div>
                ))}
            </div>

            {hiddenProjectCount > 0 && (
                <div className="mt-20 flex justify-center">
                    <button
                        type="button"
                        aria-expanded={showAllProjects}
                        aria-controls="project-grid"
                        onClick={() => setShowAllProjects((current) => !current)}
                        className="group/more relative flex items-center gap-4 border border-foreground/20 px-6 py-3 text-sm font-semibold tracking-wide transition-colors hover:border-foreground hover:bg-foreground hover:text-background"
                    >
                        {/* HUD corner ticks */}
                        <span className="pointer-events-none absolute -left-px -top-px h-2 w-2 border-l border-t border-foreground transition-opacity group-hover/more:opacity-0" aria-hidden="true" />
                        <span className="pointer-events-none absolute -bottom-px -right-px h-2 w-2 border-b border-r border-foreground transition-opacity group-hover/more:opacity-0" aria-hidden="true" />

                        {showAllProjects ? (
                            <Minus size={14} strokeWidth={1.5} aria-hidden="true" />
                        ) : (
                            <Plus size={14} strokeWidth={1.5} aria-hidden="true" className="transition-transform duration-300 group-hover/more:rotate-90" />
                        )}
                        <span>{showAllProjects ? t.showFeatured : t.showAll}</span>
                        {!showAllProjects && (
                            <span className="font-mono text-xs tracking-[0.2em] opacity-50">
                                +{String(hiddenProjectCount).padStart(2, "0")}
                            </span>
                        )}
                    </button>
                </div>
            )}
        </section>
    );
}
