"use client";

import { projects } from "@/data/content";
import ProjectCard from "@/components/ui/ProjectCard";
import { motion } from "framer-motion";
import DecorativeSymbol from "@/components/ui/DecorativeSymbol";

export default function Projects() {
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-16 md:gap-y-20">
                {projects.map((project, index) => (
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
        </section>
    );
}
