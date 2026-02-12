"use client";

import { useEffect, useState, useRef } from "react";

interface ScrambleTextProps {
    text: string;
    className?: string;
}

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+";

export default function ScrambleText({ text, className }: ScrambleTextProps) {
    const [displayText, setDisplayText] = useState("");
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

        let interval: NodeJS.Timeout;
        let counter = 0;

        setDisplayText("");
        counter = 0;

        const startScramble = () => {
            interval = setInterval(() => {
                const scrambled = text
                    .split("")
                    .map((char, index) => {
                        if (index < counter) {
                            return text[index];
                        }
                        return CHARS[Math.floor(Math.random() * CHARS.length)];
                    })
                    .join("");

                setDisplayText(scrambled);
                counter += 1 / 2;

                if (counter >= text.length) {
                    clearInterval(interval);
                    setDisplayText(text);
                }
            }, 40);
        };

        startScramble();

        return () => clearInterval(interval);
    }, [text, isInView]);

    return (
        <span ref={ref} className={className}>{displayText || "\u00A0"}</span>
    );
}
