import React from "react";

interface SquircleTopBorderProps {
    className?: string;
}

export default function SquircleTopBorder({ className }: SquircleTopBorderProps) {
    return (
        <div className={`flex h-[40px] w-full ${className} select-none pointer-events-none`}>
            {/* Top Left Corner */}
            <svg
                width="40"
                height="40"
                viewBox="0 0 40 40"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="shrink-0"
            >
                {/* 
                   Path for Top-Left Squircle Corner
                   M 0 40 : Start at Bottom-Left
                   C 0 12 12 0 40 0 : Curve to Top-Right (Smooth transition)
                   V 40 : Line down to Bottom-Right
                   H 0 : Line left to start
                */}
                <path d="M0 40C0 12 12 0 40 0V40H0Z" fill="currentColor" />
            </svg>

            {/* Middle Straight Section */}
            <div className="flex-1 bg-current h-full" />

            {/* Top Right Corner */}
            <svg
                width="40"
                height="40"
                viewBox="0 0 40 40"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="shrink-0"
            >
                {/* 
                   Path for Top-Right Squircle Corner
                   M 0 0 : Start at Top-Left
                   C 28 0 40 12 40 40 : Curve to Bottom-Right
                   H 0 : Line left to Bottom-Left
                   V 0 : Line up to start
                */}
                <path d="M0 0C28 0 40 12 40 40H0V0Z" fill="currentColor" />
            </svg>
        </div>
    );
}
