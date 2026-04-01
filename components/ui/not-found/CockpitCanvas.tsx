"use client";

import React, { useRef, useState, useEffect, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import { EffectComposer, Bloom, Noise, Scanline } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import * as THREE from "three";
import { ensureAudioContext, playGameSound, closeAudioContext } from "../minigame/audio";
import { SFX_LEVEL_SCALE } from "../minigame/constants";
import { MotionValue } from "framer-motion";
import { DottedOcean } from "./DottedOcean";

interface CockpitCanvasProps {
    setShake: (val: number) => void;
    mouseX: MotionValue<number>;
    mouseY: MotionValue<number>;
    setFireFlash?: (side: "left" | "right") => void;
}

interface BulletData {
    mesh: THREE.Object3D;
    start: THREE.Vector3;
    target: THREE.Vector3;
    progress: number;
    speed: number;
}

interface HitFlash {
    id: number;
    position: THREE.Vector3;
    time: number;
}

function FastParticles() {
    const count = 300;
    const meshRef = useRef<THREE.InstancedMesh>(null);
    const dummy = useMemo(() => new THREE.Object3D(), []);
    const particles = useMemo(() => {
        return Array.from({ length: count }, () => ({
            x: (Math.random() - 0.5) * 400,
            y: (Math.random() - 0.5) * 400,
            z: Math.random() * -1000 - 100,
            speed: Math.random() * 1.5 + 0.5,
            // Persistent velocity for true wandering
            vx: (Math.random() - 0.5) * 0.4,
            vy: (Math.random() - 0.5) * 0.3,
            // Turbulence parameters
            turbPhase: Math.random() * Math.PI * 2,
            turbFreq: 0.8 + Math.random() * 1.5,
            turbAmp: 2 + Math.random() * 6,
        }));
    }, []);

    useFrame((state) => {
        if (!meshRef.current) return;
        const t = state.clock.elapsedTime;
        particles.forEach((p, i) => {
            p.z += p.speed * 3;
            // Accumulated lateral drift (wind)
            p.x += p.vx;
            p.y += p.vy;
            // Randomly nudge velocity (turbulence)
            p.vx += (Math.random() - 0.5) * 0.06;
            p.vy += (Math.random() - 0.5) * 0.04;
            // Dampen to prevent runaway
            p.vx *= 0.99;
            p.vy *= 0.99;
            if (p.z > 10) {
                p.z = Math.random() * -500 - 500;
                p.x = (Math.random() - 0.5) * 400;
                p.y = (Math.random() - 0.5) * 400;
                p.vx = (Math.random() - 0.5) * 0.4;
                p.vy = (Math.random() - 0.5) * 0.3;
            }
            // Add sine turbulence on top
            const tx = Math.sin(t * p.turbFreq + p.turbPhase) * p.turbAmp;
            const ty = Math.cos(t * p.turbFreq * 0.7 + p.turbPhase) * p.turbAmp * 0.6;
            dummy.position.set(p.x + tx, p.y + ty, p.z);
            dummy.scale.set(0.2, 0.2, 0.2);
            dummy.updateMatrix();
            meshRef.current!.setMatrixAt(i, dummy.matrix);
        });
        meshRef.current!.instanceMatrix.needsUpdate = true;
    });

    return (
        <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
            <sphereGeometry args={[1, 4, 4]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.4} />
        </instancedMesh>
    );
}

function CockpitScene({ setShake, mouseX, mouseY, setFireFlash }: CockpitCanvasProps) {
    const { camera, scene, viewport } = useThree();
    const audioCtxRef = useRef<AudioContext | null>(null);

    const bgColorStr = useMemo(() => {
        if (typeof document === "undefined") return "#1a1a1a";
        const isDark = document.documentElement.getAttribute("data-theme") === "dark";
        let str = getComputedStyle(document.documentElement).getPropertyValue('--background').trim();
        return str || (isDark ? "#1a1a1a" : "#f5f5f0");
    }, []);

    // Shooting state
    const bulletsRef = useRef<BulletData[]>([]);
    const burstCount = useRef(0);
    const lastShotTime = useRef(0);
    const [isMouseDown, setIsMouseDown] = useState(false);

    const touchStartPos = useRef<{ x: number, y: number } | null>(null);

    useEffect(() => {
        const handleDown = (e: MouseEvent | TouchEvent) => {
            if (e instanceof MouseEvent && e.button !== 0) return;
            const target = e.target as HTMLElement;
            if (target.closest('button, a, input, label, [role="button"], [data-hud-interactive="true"]')) return;

            if ('touches' in e && e.touches.length > 0) {
                touchStartPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
                // Start auto-firing immediately on touch
                setIsMouseDown(true);
            } else if (!(e instanceof TouchEvent)) {
                setIsMouseDown(true);
            }
            ensureAudioContext(audioCtxRef);
        };

        const handleMove = (e: TouchEvent) => {
            if (touchStartPos.current && e.touches.length > 0) {
                const touch = e.touches[0];
                const dx = touch.clientX - touchStartPos.current.x;
                const dy = touch.clientY - touchStartPos.current.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                // If they move more than 10px, assume they are scrolling -> Stop shooting
                if (dist > 10) {
                    setIsMouseDown(false);
                }
            }
        };

        const handleUp = () => {
            setIsMouseDown(false);
            touchStartPos.current = null;
        };

        window.addEventListener("mousedown", handleDown);
        window.addEventListener("mouseup", handleUp);
        window.addEventListener("touchstart", handleDown, { passive: true });
        window.addEventListener("touchmove", handleMove, { passive: true });
        window.addEventListener("touchend", handleUp, { passive: true });
        return () => {
            window.removeEventListener("mousedown", handleDown);
            window.removeEventListener("mouseup", handleUp);
            window.removeEventListener("touchstart", handleDown);
            window.removeEventListener("touchmove", handleMove);
            window.removeEventListener("touchend", handleUp);
            closeAudioContext(audioCtxRef);
            // Clean up meshes...
            bulletsRef.current.forEach(b => {
                scene.remove(b.mesh);
                b.mesh.traverse((child) => {
                    if (child instanceof THREE.Mesh) {
                        child.geometry.dispose();
                        (child.material as THREE.Material).dispose();
                    }
                });
            });
        };
    }, [scene]);

    useFrame((state, delta) => {
        const time = state.clock.getElapsedTime() * 1000;

        // 1. Parallax Camera
        // Floating/Breathing effect instead of mouse parallax
        const driftFrequency = 0.5; // slow breathing
        const driftAmplitude = 0.02; // subtle movement

        // 카메라 틸트 제거 (HUD 정렬 복구)
        camera.rotation.x = Math.sin(state.clock.elapsedTime * driftFrequency) * driftAmplitude;
        camera.position.y = Math.sin(state.clock.elapsedTime * (driftFrequency * 0.7)) * 0.1;
        camera.rotation.y = Math.cos(state.clock.elapsedTime * (driftFrequency * 0.5)) * (driftAmplitude * 0.5);

        // 2. Shooting Mechanics
        if (isMouseDown && time - lastShotTime.current > 80) {
            lastShotTime.current = time;
            burstCount.current++;
            setShake(1.5);

            playGameSound({ audioCtxRef, isMuted: false, type: "shoot", sfxLevelScale: SFX_LEVEL_SCALE });

            const isLeft = burstCount.current % 2 === 0;
            setFireFlash?.(isLeft ? "left" : "right");

            // Spawn just outside the camera view at the bottom
            const startX = isLeft ? -viewport.width / 2 - 2 : viewport.width / 2 + 2;
            const startY = -viewport.height / 2 - 2;
            const startZ = camera.position.z - 1;

            let colorStr = getComputedStyle(document.documentElement).getPropertyValue('--foreground').trim();
            if (!colorStr) colorStr = document.documentElement.getAttribute("data-theme") === "dark" ? "#f5f5f0" : "#1a1a1a";

            // Halo cylinder
            const haloGeo = new THREE.CylinderGeometry(0.08, 0.08, 8, 8);
            haloGeo.rotateX(Math.PI / 2);
            const haloMat = new THREE.MeshBasicMaterial({ color: colorStr, transparent: true, opacity: 0.8, name: "halo" });
            const haloMesh = new THREE.Mesh(haloGeo, haloMat);

            // Core cylinder (white)
            const coreGeo = new THREE.CylinderGeometry(0.03, 0.03, 8, 8);
            coreGeo.rotateX(Math.PI / 2);
            const coreMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 1, name: "core" });
            const coreMesh = new THREE.Mesh(coreGeo, coreMat);

            const group = new THREE.Group();
            group.add(haloMesh);
            group.add(coreMesh);

            const start = new THREE.Vector3(startX, startY, startZ);

            // Unproject center coordinates (0,0) to target the fixed screen center
            const vector = new THREE.Vector3(0, 0, 0.5);
            vector.unproject(camera);
            const dir = vector.sub(camera.position).normalize();

            // Target is far away along that direction, offset to prevent crossing
            const distance = 120;
            const target = camera.position.clone().add(dir.multiplyScalar(distance));
            target.x += isLeft ? -0.5 : 0.5; // Spread target slightly so trajectory is parallel


            // Angle the cylinder correctly right away
            group.position.copy(start);
            group.lookAt(target);

            scene.add(group);
            bulletsRef.current.push({ mesh: group, start, target, progress: 0, speed: 0.07 });
        }

        // 3. Update Bullets
        for (let i = bulletsRef.current.length - 1; i >= 0; i--) {
            const b = bulletsRef.current[i];
            b.progress += b.speed;

            if (b.progress >= 1) {
                // Bullet reached distance limit, remove it
                scene.remove(b.mesh);
                b.mesh.traverse((child) => {
                    if (child instanceof THREE.Mesh) {
                        child.geometry.dispose();
                        (child.material as THREE.Material).dispose();
                    }
                });
                bulletsRef.current.splice(i, 1);
                continue;
            }

            // Move bullet along trajectory with easing to simulate perspective punch
            const ease = 1 - Math.pow(1 - b.progress, 2);
            b.mesh.position.lerpVectors(b.start, b.target, ease);

            // Fade out as it gets further away (max 20% opacity at end)
            const fade = Math.max(0.2, 1 - b.progress);
            b.mesh.traverse((child) => {
                if (child instanceof THREE.Mesh) {
                    const originalOpacity = child.material.name === "core" ? 1 : 0.8;
                    child.material.opacity = originalOpacity * fade;
                }
            });
        }
    });

    return (
        <group>
            {/* 3D 공간 상에서 하늘 배경 역할을 해주는 거대한 백드롭 평면입니다. */}
            {/* 이 평면이 WebGL 픽셀을 불투명하게 채워주어, 상단 하늘 영역에도 스캔라인이 정상적으로 덧입혀지게 됩니다. */}
            <mesh position={[0, 0, -15000]}>
                <planeGeometry args={[100000, 100000]} />
                <meshBasicMaterial color={bgColorStr} />
            </mesh>

            {/* Environment */}
            <DottedOcean />

            {/* Stars & Atmosphere - 지평선 마스크(Z=-4200)가 뒤로 물러남에 따라 별자리도 안전하게 뒤(radius 5000)로 밀어내고, 유저가 맞춘 크기를 100% 유지하도록 factor를 수학적으로 비례 확대(106)했습니다. */}
            <Stars radius={5000} depth={500} count={404} factor={200} saturation={0} fade speed={0} />
            <FastParticles />

            {/* Post Processing for Retro/Terminal Look */}
            <EffectComposer>
                <Bloom luminanceThreshold={0.2} luminanceSmoothing={0.9} intensity={1.5} />
                <Noise opacity={0.025} />
                <Scanline blendFunction={BlendFunction.OVERLAY} density={1.25} opacity={0.08} />
            </EffectComposer>
        </group>
    );
}

export default function CockpitCanvas({ mouseX, mouseY, setShake }: CockpitCanvasProps) {
    return (
        <div className="absolute inset-0 z-0 pointer-events-none">
            <Canvas camera={{ position: [0, 0, 5], fov: 60, near: 0.1, far: 20000 }} dpr={[1, 2]}>
                <CockpitScene mouseX={mouseX} mouseY={mouseY} setShake={setShake} />
            </Canvas>
        </div>
    );
}
