"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Project } from "@/data/content";
import { ExternalLink } from "lucide-react";

interface ProjectCardProps {
    project: Project;
}

export default function ProjectCard({ project }: ProjectCardProps) {
    return (
        <div className="group relative flex flex-col gap-4">
            {/* Timestamp / Meta */}
            <div className="flex justify-between items-center text-xs font-mono opacity-50 border-b border-border/50 pb-2">
                <span>{project.id.toUpperCase()}</span>
                <span>{project.lastUpdated}</span>
            </div>

            {/* Thumbnail Container (Square) */}
            <div className="relative aspect-square w-full overflow-hidden bg-gray-100 dark:bg-gray-800 border border-border/50 group-hover:border-foreground/50 transition-colors duration-300">
                {/* Image with saturation and brightness effects */}
                <img
                    src={project.thumbnail}
                    alt={project.title}
                    className="h-full w-full object-cover saturate-[0.8] brightness-[0.9] group-hover:saturate-100 group-hover:brightness-100 transition-all duration-300"
                />
            </div>

            {/* Info */}
            <div className="flex flex-col gap-2">
                <h3 className="font-serif text-xl leading-tight">
                    {project.title}
                    <span className="block text-sm font-sans font-normal opacity-60 mt-1">{project.enTitle}</span>
                </h3>

                <div className="flex flex-wrap gap-1 text-[10px] font-mono uppercase tracking-wider opacity-70">
                    {project.techStack.map((tech) => (
                        <span key={tech} className="border border-border px-1 rounded-sm">{tech}</span>
                    ))}
                </div>

                <p className="text-sm opacity-80 line-clamp-3 text-pretty">
                    {project.description}
                </p>

                {project.link && (
                    <a
                        href={project.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="self-start mt-2 text-xs font-bold border-b border-foreground pb-0.5 hover:opacity-50 transition-opacity flex items-center gap-1"
                    >
                        {project.linkText || "VIEW PROJECT"} <ExternalLink size={10} />
                    </a>
                )}
            </div>
        </div>
    );
}
