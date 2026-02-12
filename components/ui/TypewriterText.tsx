"use client";

import { useEffect, useState, useRef } from "react";

interface TypewriterTextProps {
    text: string;
    className?: string;
}

export default function TypewriterText({ text, className }: TypewriterTextProps) {
    const [displayText, setDisplayText] = useState("");
    const [showCursor, setShowCursor] = useState(true);
    const [isComplete, setIsComplete] = useState(false);
    const [isInView, setIsInView] = useState(false);
    const ref = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsInView(true);
                }
            },
            { threshold: 0.1 }
        );

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => {
            observer.disconnect();
        };
    }, []);

    useEffect(() => {
        if (!isInView) return;

        let index = 0;
        setDisplayText("");
        setIsComplete(false);
        setShowCursor(true);

        const interval = setInterval(() => {
            if (index < text.length) {
                setDisplayText(text.slice(0, index + 1));
                index++;
            } else {
                clearInterval(interval);
                setIsComplete(true);

                // Wait 1.5s then fade out cursor
                setTimeout(() => {
                    setShowCursor(false);
                }, 1500);
            }
        }, 15); // 15ms per character for faster, snappy typing

        return () => clearInterval(interval);
    }, [text, isInView]);

    // Parse text for <br> and <a> tags and convert to JSX
    const renderText = () => {
        const parts: React.JSX.Element[] = [];
        let currentText = displayText;
        let key = 0;

        // Split by <br> first
        const lines = currentText.split("<br>");

        lines.forEach((line, lineIndex) => {
            // Parse links in each line
            const linkRegex = /<a href="([^"]+)">([^<]+)<\/a>/g;
            let lastIndex = 0;
            let match;

            while ((match = linkRegex.exec(line)) !== null) {
                // Add text before the link
                if (match.index > lastIndex) {
                    parts.push(<span key={key++}>{line.slice(lastIndex, match.index)}</span>);
                }

                // Add the link
                const href = match[1];
                const linkText = match[2];
                parts.push(
                    <a
                        key={key++}
                        href={href}
                        target={href.startsWith('http') ? '_blank' : undefined}
                        rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
                        className="underline hover:opacity-50 transition-opacity"
                    >
                        {linkText}
                    </a>
                );

                lastIndex = linkRegex.lastIndex;
            }

            // Add remaining text in the line
            if (lastIndex < line.length) {
                parts.push(<span key={key++}>{line.slice(lastIndex)}</span>);
            }

            // Add line break if not the last line
            if (lineIndex < lines.length - 1) {
                parts.push(<br key={key++} />);
            }
        });

        return parts;
    };

    return (
        <span ref={ref} className={className}>
            {renderText()}
            <span
                className={`inline-block w-[2px] h-[1em] bg-current ml-1 align-middle transition-opacity duration-500 ${showCursor ? 'opacity-100 animate-pulse' : 'opacity-0'
                    }`}
            />
        </span>
    );
}
