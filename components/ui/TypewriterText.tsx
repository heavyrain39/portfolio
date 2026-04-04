"use client";

import { useEffect, useState, useRef, useMemo } from "react";

interface Segment {
    type: "text" | "link" | "break";
    content: string;
    href?: string;
}

interface TypewriterTextProps {
    text: string;
    className?: string;
    onComplete?: () => void;
    enabled?: boolean;
    blinkOnComplete?: boolean;
}

export default function TypewriterText({
    text,
    className,
    onComplete,
    enabled = true,
    blinkOnComplete = true
}: TypewriterTextProps) {
    const [visibleCharCount, setVisibleCharCount] = useState(0);
    const [showCursor, setShowCursor] = useState(true);
    const [isComplete, setIsComplete] = useState(false);
    const [isInView, setIsInView] = useState(false);
    const ref = useRef<HTMLSpanElement>(null);

    // Pre-parse the text into segments when text changes
    const { segments, totalVisibleChars } = useMemo(() => {
        const parts = text.split(/(<a\s+href="[^"]+"[^>]*>.*?<\/a>|<br\s*\/?>)/g);
        let visibleLength = 0;

        const parsedSegments = parts.filter(Boolean).map((part: string) => {
            if (part.startsWith("<a")) {
                const hrefMatch = part.match(/href="([^"]+)"/);
                const contentMatch = part.match(/>(.*?)<\/a>/);
                const content = contentMatch ? contentMatch[1] : "";
                visibleLength += content.length;
                return { type: "link", content, href: hrefMatch ? hrefMatch[1] : "" } as Segment;
            } else if (part.startsWith("<br")) {
                return { type: "break", content: "" } as Segment;
            } else {
                visibleLength += part.length;
                return { type: "text", content: part } as Segment;
            }
        });
        return { segments: parsedSegments, totalVisibleChars: visibleLength };
    }, [text]);

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

    const onCompleteRef = useRef(onComplete);
    useEffect(() => {
        onCompleteRef.current = onComplete;
    }, [onComplete]);

    useEffect(() => {
        if (!isInView || !enabled) return;

        let count = 0;
        setVisibleCharCount(0);
        setIsComplete(false);
        setShowCursor(true);

        const interval = setInterval(() => {
            if (count < totalVisibleChars) {
                count++;
                setVisibleCharCount(count);
            } else {
                clearInterval(interval);
                setIsComplete(true);
                if (onCompleteRef.current) onCompleteRef.current();

                // Wait 1.5s then fade out cursor
                setTimeout(() => {
                    setShowCursor(false);
                }, 1500);
            }
        }, 30);

        return () => clearInterval(interval);
    }, [text, isInView, enabled, totalVisibleChars]);

    const renderContent = (count: number, isGhost: boolean = false) => {
        const result: React.ReactNode[] = [];
        let remainingChars = isGhost ? Infinity : count;
        let key = 0;

        for (const segment of segments) {
            // Stop rendering if we've run out of visible characters (unless we're the ghost)
            if (!isGhost && remainingChars <= 0) break;

            if (segment.type === "text") {
                const visibleText = isGhost ? segment.content : segment.content.slice(0, remainingChars);
                result.push(<span key={key++}>{visibleText}</span>);
                remainingChars -= segment.content.length;
            } else if (segment.type === "link") {
                const visibleText = isGhost ? segment.content : segment.content.slice(0, remainingChars);
                if (visibleText || isGhost) {
                    result.push(
                        <a
                            key={key++}
                            href={segment.href}
                            target={segment.href?.startsWith("http") ? "_blank" : undefined}
                            rel={segment.href?.startsWith("http") ? "noopener noreferrer" : undefined}
                            className="underline hover:opacity-50 transition-opacity"
                        >
                            {visibleText}
                        </a>
                    );
                }
                remainingChars -= segment.content.length;
            } else if (segment.type === "break") {
                result.push(<br key={key++} />);
            }
        }

        return result;
    };

    return (
        <span ref={ref} className={`${className} relative inline-grid`}>
            {/* Ghost text for space reservation: Determines the final height and width */}
            <span className="invisible col-start-1 row-start-1 pointer-events-none select-none" aria-hidden="true">
                {renderContent(0, true)}
                {/* Space for the cursor */}
                <span className="inline-block w-[2px] h-[1em] ml-1" />
            </span>

            {/* Actual animated text: Removed from document flow to prevent layout jank */}
            <span className="absolute inset-0 w-full h-full pointer-events-none">
                {renderContent(visibleCharCount)}
                <span
                    className={`inline-block w-[2px] h-[1em] bg-current ml-1 align-middle transition-opacity duration-500 ${showCursor
                        ? isComplete
                            ? blinkOnComplete
                                ? "opacity-100 animate-blink"
                                : "opacity-0" // Hide immediately if blink is disabled
                            : "opacity-100" // Solid while typing
                        : "opacity-0" // Faded out after timeout
                        }`}
                />
            </span>
        </span>
    );
}
