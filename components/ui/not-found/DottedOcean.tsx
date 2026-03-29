"use client";

import { useFrame } from "@react-three/fiber";
import { useTheme } from "next-themes";
import React, { useMemo, useRef, useEffect, useState } from "react";
import * as THREE from "three";

export function DottedOcean() {
    const { theme } = useTheme();
    const groupRef = useRef<THREE.Group>(null);
    const pointsRef = useRef<THREE.Points>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => setMounted(true), []);

    const { positions, colors, bgColor } = useMemo(() => {
        const SEPARATION = 100;
        const AMOUNTX = 60; // 가로 범위 고정
        const AMOUNTY = 400; // 깊이감 확장을 위해 대폭 상향 (무한 수평선 구현)
        const TOTAL_Z = 40000; // 훨씬 깊게 뻗어나가도록 설정

        const positions = new Float32Array(AMOUNTX * AMOUNTY * 3);
        const colors = new Float32Array(AMOUNTX * AMOUNTY * 3);

        const isDarkTheme = theme === 'dark' || (typeof document !== 'undefined' && document.documentElement.getAttribute("data-theme") === "dark");

        // 광원 효과를 위해 휘도를 1.2배 상향 (HDR 느낌 유도)
        let fgColorStr = isDarkTheme ? "#f0f0f0" : "#222222";
        let bgColorStr = isDarkTheme ? "#0a0a0a" : "#f5f5f0";

        if (typeof document !== "undefined") {
            const style = getComputedStyle(document.documentElement);
            const bg = style.getPropertyValue('--background').trim();
            if (bg) bgColorStr = bg;
        }

        const dotColor = new THREE.Color(fgColorStr).multiplyScalar(2.3);
        const bgColor = new THREE.Color(bgColorStr);

        let i = 0;
        for (let ix = 0; ix < AMOUNTX; ix++) {
            for (let iy = 0; iy < AMOUNTY; iy++) {
                positions[i * 3] = ix * SEPARATION - (AMOUNTX * SEPARATION) / 2;
                positions[i * 3 + 1] = 0;

                // 비선형 배치를 통해 수평선 부근의 밀도를 높임 (원근감 강화)
                const normalizedIY = iy / (AMOUNTY - 1);
                positions[i * 3 + 2] = -TOTAL_Z / 2 + TOTAL_Z * Math.pow(normalizedIY, 1.2);

                // 색상 보간(Lerp)을 통해 먼 곳의 점들이 배경색으로 서서히 스며들도록 함 (커튼 현상 방지)
                const fadeFactor = Math.pow(normalizedIY, 1.5); // 수평선 부근 대기 원근감 모사

                colors[i * 3] = dotColor.r * fadeFactor + bgColor.r * (1 - fadeFactor);
                colors[i * 3 + 1] = dotColor.g * fadeFactor + bgColor.g * (1 - fadeFactor);
                colors[i * 3 + 2] = dotColor.b * fadeFactor + bgColor.b * (1 - fadeFactor);
                i++;
            }
        }
        return { positions, colors, bgColor };
    }, [theme, mounted]);

    // 부름: 테두리만 흐릿한 현상을 해결하기 위해 더 밝고 강한 코어 텍스처 생성
    const dotTexture = useMemo(() => {
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 64;
        const context = canvas.getContext('2d');
        if (!context) return null;

        const gradient = context.createRadialGradient(32, 32, 0, 32, 32, 32);
        // 광원 질감: 중심은 아주 밝고 선명하게(1.0-0.2 구간), 주변으로 은은하게 퍼짐
        gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
        gradient.addColorStop(0.2, 'rgba(255, 255, 255, 0.9)');
        gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.3)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

        context.fillStyle = gradient;
        context.fillRect(0, 0, 64, 64);

        const texture = new THREE.CanvasTexture(canvas);
        return texture;
    }, []);

    useFrame(({ clock }) => {
        if (!pointsRef.current) return;
        const count = clock.getElapsedTime() * 1.7; // 속도를 크게 줄여 편안한 울렁임 복구
        const positionsAttr = pointsRef.current.geometry.attributes.position;
        const array = positionsAttr.array as Float32Array;

        const AMOUNTX = 60;
        const AMOUNTY = 400;

        let i = 0;
        for (let ix = 0; ix < AMOUNTX; ix++) {
            for (let iy = 0; iy < AMOUNTY; iy++) {
                // 기존의 편안한 대형 곡률로 복구 (0.3, 0.5)
                array[i * 3 + 1] =
                    Math.sin((ix + count) * 0.4) * 50 +
                    Math.sin((iy + count) * 0.5) * 50;
                i++;
            }
        }
        positionsAttr.needsUpdate = true;
    });

    if (!mounted) return null;

    return (
        <group ref={groupRef} position={[0, -500, -3000]}>
            <mesh position={[0, -200, -100]} rotation={[0, 0, 0]}>
                <planeGeometry args={[20000, 10000]} />
                <meshBasicMaterial color={bgColor} />
            </mesh>

            <points ref={pointsRef}>
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
                    size={8}
                    vertexColors
                    transparent
                    opacity={0.8}
                    sizeAttenuation={true}
                    blending={THREE.AdditiveBlending} // 가산 혼합을 통한 발광 유지
                    depthWrite={false} // 빛의 중첩을 위해 비활성화
                />
            </points>
        </group>
    );
}
