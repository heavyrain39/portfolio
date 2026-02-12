"use client";

import { projects } from "@/data/content";
import ProjectCard from "@/components/ui/ProjectCard";
import { motion } from "framer-motion";

export default function Projects() {
    return (
        <section id="projects" className="container mx-auto px-6 py-32 border-t border-border/20">
            <div className="flex flex-col md:flex-row justify-between items-baseline mb-20 gap-4">
                <h2 className="text-4xl font-serif font-bold">Selected Works</h2>
                <div className="flex gap-6 text-sm font-mono opacity-50 uppercase tracking-widest">
                    <span>Total {projects.length}</span>
                    <span>Vibe Coding / Web / Game</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-20">
                {projects.map((project, index) => (
                    <motion.div
                        key={project.id}
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-50px" }}
                        transition={{ duration: 0.6, delay: index * 0.1 }}
                    >
                        <ProjectCard project={project} />
                    </motion.div>
                ))}
            </div>
        </section>
    );
}
