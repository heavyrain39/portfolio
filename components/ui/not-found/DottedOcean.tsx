"use client";

import { useFrame } from "@react-three/fiber";
import { useTheme } from "next-themes";
import React, { useMemo, useRef, useEffect, useState } from "react";
import * as THREE from "three";

export function DottedOcean() {
    const { theme } = useTheme();
    const pointsRef = useRef<THREE.Points>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => setMounted(true), []);

    const { positions, colors } = useMemo(() => {
        const SEPARATION = 150;
        const AMOUNTX = 40;
        const AMOUNTY = 60;

        const positions = new Float32Array(AMOUNTX * AMOUNTY * 3);
        const colors = new Float32Array(AMOUNTX * AMOUNTY * 3);
        
        // Use document.documentElement as fallback during hydration
        const isDarkTheme = theme === 'dark' || (typeof document !== 'undefined' && document.documentElement.getAttribute("data-theme") === "dark");
        const colorValue = isDarkTheme ? new THREE.Color(0.2, 0.7, 0.8) : new THREE.Color(0.7, 0.5, 0.5);

        let i = 0;
        for (let ix = 0; ix < AMOUNTX; ix++) {
            for (let iy = 0; iy < AMOUNTY; iy++) {
                positions[i * 3] = ix * SEPARATION - (AMOUNTX * SEPARATION) / 2;
                positions[i * 3 + 1] = 0;
                positions[i * 3 + 2] = iy * SEPARATION - (AMOUNTY * SEPARATION) / 2;

                colors[i * 3] = colorValue.r;
                colors[i * 3 + 1] = colorValue.g;
                colors[i * 3 + 2] = colorValue.b;
                i++;
            }
        }
        return { positions, colors };
    }, [theme, mounted]);

    useFrame(({ clock }) => {
        if (!pointsRef.current) return;
        const time = clock.getElapsedTime() * 0.6; // Much slower for elegant navigation
        const positionsAttr = pointsRef.current.geometry.attributes.position;
        const array = positionsAttr.array as Float32Array;
        
        const AMOUNTX = 40;
        const AMOUNTY = 60;
        
        let i = 0;
        for (let ix = 0; ix < AMOUNTX; ix++) {
            for (let iy = 0; iy < AMOUNTY; iy++) {
                // Original simple but bold wave math
                array[i * 3 + 1] =
                    Math.sin((ix + time) * 0.3) * 50 +
                    Math.sin((iy + time) * 0.5) * 50;
                i++;
            }
        }
        positionsAttr.needsUpdate = true;
    });

    if (!mounted) return null;

    return (
        <points ref={pointsRef} position={[0, -150, -2000]}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    args={[positions, 3]}
                />
                <bufferAttribute
                    attach="attributes-color"
                    args={[colors, 3]}
                />
            </bufferGeometry>
            <pointsMaterial
                size={5}
                vertexColors
                transparent
                opacity={0.6}
                sizeAttenuation
            />
        </points>
    );
}
