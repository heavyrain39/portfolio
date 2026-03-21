"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Project } from "@/data/content";
import { ExternalLink } from "lucide-react";
import { useRef } from "react";
import { useLanguage } from "@/context/LanguageContext";

interface ProjectCardProps {
    project: Project;
}

export default function ProjectCard({ project }: ProjectCardProps) {
    const cardRef = useRef<HTMLDivElement>(null);
    const { language, isMounted } = useLanguage();

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
        <div className="group relative flex flex-col md:flex-row gap-6 md:gap-8 items-start">
            {/* Image */}
            <div className="w-full md:w-2/5 lg:w-1/3 shrink-0">
                <div
                    ref={cardRef}
                    className="relative aspect-square w-full overflow-hidden bg-gray-100 dark:bg-gray-800 border border-foreground/20 project-image-container"
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
            </div>

            {/* Info */}
            <div className="flex flex-col gap-3 w-full md:w-3/5 lg:w-2/3 py-1">
                <h3 className="font-serif font-bold text-2xl leading-tight">
                    {isMounted && language === "en" ? project.enTitle : project.title}
                    <span className="block text-sm font-sans font-medium opacity-60 mt-1">
                        {isMounted && language === "en" ? (project.enConcept || project.concept) : project.concept}
                    </span>
                </h3>

                <div className="flex flex-wrap gap-1.5 text-[10px] font-mono uppercase tracking-wider opacity-40 mt-1">
                    {project.techStack.map((tech) => (
                        <span key={tech} className="border border-border/15 px-1.5 py-0.5 rounded-sm">{tech}</span>
                    ))}
                </div>

                <p className="text-sm opacity-60 break-keep w-full mt-1 leading-relaxed">
                    {isMounted && language === "en" ? (project.enDescription || project.description) : project.description}
                    <span className="inline-block ml-2 px-2 py-0.5 rounded-full border border-border/15 text-[10px] font-mono opacity-40 whitespace-nowrap transform -translate-y-[2px]">
                        {project.lastUpdated}
                    </span>
                </p>

                <div className="flex gap-4 mt-2">
                    {project.link && (
                        <a
                            href={project.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="self-start text-xs font-bold border-b border-current/30 pb-0.5 opacity-60 hover:opacity-100 transition-opacity flex items-center gap-1"
                        >
                            {isMounted && language === "en" ? (project.enLinkText || project.linkText || "VIEW PROJECT") : (project.linkText || "VIEW PROJECT")} <ExternalLink size={10} />
                        </a>
                    )}
                    {project.secondaryLink && (
                        <a
                            href={project.secondaryLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="self-start text-xs font-bold border-b border-current/30 pb-0.5 opacity-60 hover:opacity-100 transition-opacity flex items-center gap-1"
                        >
                            {isMounted && language === "en" ? (project.enSecondaryLinkText || project.secondaryLinkText || "VIEW PROJECT") : (project.secondaryLinkText || "VIEW PROJECT")} <ExternalLink size={10} />
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
}
