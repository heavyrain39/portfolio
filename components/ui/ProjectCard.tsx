"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Project } from "@/data/content";
import { ExternalLink } from "lucide-react";
import { useRef } from "react";

interface ProjectCardProps {
    project: Project;
}

export default function ProjectCard({ project }: ProjectCardProps) {
    const cardRef = useRef<HTMLDivElement>(null);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        cardRef.current.style.setProperty("--mouse-x", `${x}%`);
        cardRef.current.style.setProperty("--mouse-y", `${y}%`);
    };

    const handleMouseLeave = () => {
        if (!cardRef.current) return;
        cardRef.current.style.setProperty("--mouse-x", `50%`);
        cardRef.current.style.setProperty("--mouse-y", `50%`);
    };

    return (
        <div className="group relative flex flex-col gap-3">
            {/* Timestamp / Meta */}
            <div className="flex justify-between items-center text-xs font-mono opacity-50 border-b border-border/50 pb-1">
                <span>{project.id.toUpperCase()}</span>
                <span>{project.lastUpdated}</span>
            </div>

            <div
                ref={cardRef}
                className="relative aspect-square w-full overflow-hidden bg-gray-100 dark:bg-gray-800 border border-border/50 group-hover:border-foreground/50 transition-colors duration-300"
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
            >
                {/* Next.js Image component handles basePath automatically when src starts with / */}
                <Image
                    src={project.thumbnail}
                    alt={project.title}
                    fill
                    className="project-card-image object-cover"
                    unoptimized
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

                <p className="text-sm opacity-80 text-justify break-keep w-full">
                    {project.description}
                </p>

                <div className="flex gap-3">
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
                    {project.secondaryLink && (
                        <a
                            href={project.secondaryLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="self-start mt-2 text-xs font-bold border-b border-foreground pb-0.5 hover:opacity-50 transition-opacity flex items-center gap-1"
                        >
                            {project.secondaryLinkText || "VIEW PROJECT"} <ExternalLink size={10} />
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
}
