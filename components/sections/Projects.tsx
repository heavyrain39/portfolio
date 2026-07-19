"use client";

import { useState } from "react";
import { projects } from "@/data/content";
import { dictionary } from "@/data/dictionary";
import ProjectCard from "@/components/ui/ProjectCard";
import { motion } from "framer-motion";
import DecorativeSymbol from "@/components/ui/DecorativeSymbol";
import { useLanguage } from "@/context/LanguageContext";

const FEATURED_PROJECT_IDS = new Set([
    "aftertrace",
    "haruna",
    "mstrmnd",
    "nimblist",
    "hanjul",
    "takt",
]);

const projectsByLastUpdated = [...projects].sort((a, b) =>
    b.lastUpdated.localeCompare(a.lastUpdated)
);

const featuredProjects = projectsByLastUpdated.filter((project) =>
    FEATURED_PROJECT_IDS.has(project.id)
);

const remainingProjects = projectsByLastUpdated.filter((project) =>
    !FEATURED_PROJECT_IDS.has(project.id)
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
            <div className="flex flex-col md:flex-row justify-between items-baseline mb-20 gap-4">
                <h2 className="text-4xl font-serif font-bold flex items-center gap-1">
                    Selected Works
                    <DecorativeSymbol />
                </h2>
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
                    <motion.div
                        key={project.id}
                        initial={{ clipPath: "inset(0 100% 0 0)", opacity: 0 }}
                        whileInView={{ clipPath: "inset(0 0% 0 0)", opacity: 1 }}
                        viewport={{ once: true, margin: "-50px" }}
                        transition={{ 
                            clipPath: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }, 
                            opacity: { duration: 0.2 }, 
                            delay: (index % 2) * 0.1 
                        }}
                    >
                        <ProjectCard project={project} />
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
                        className="px-6 py-3 font-sans text-sm font-semibold tracking-wide transition-colors hover:bg-foreground hover:text-background"
                    >
                        {showAllProjects ? t.showFeatured : `${t.showAll} (+${hiddenProjectCount})`}
                    </button>
                </div>
            )}
        </section>
    );
}
