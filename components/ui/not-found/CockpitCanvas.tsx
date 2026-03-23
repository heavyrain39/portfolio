"use client";

import React, { useRef, useState, useEffect, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Stars, Sparkles } from "@react-three/drei";
import { EffectComposer, Bloom, Noise, Scanline } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import * as THREE from "three";
import { ensureAudioContext, playGameSound, closeAudioContext } from "../minigame/audio";
import { SFX_LEVEL_SCALE } from "../minigame/constants";
import { MotionValue } from "framer-motion";
import { DottedOcean } from "./DottedOcean";

interface CockpitSceneProps {
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
            z: Math.random() * -1000 - 100, // Very far spawn
            speed: Math.random() * 2 + 1 // speed
        }));
    }, []);

    useFrame(() => {
        if (!meshRef.current) return;
        particles.forEach((p: {x: number, y: number, z: number, speed: number}, i: number) => {
            p.z += p.speed * 4; // Fast forward
            if (p.z > 10) {
                // Reset when passing camera
                p.z = Math.random() * -500 - 500;
                p.x = (Math.random() - 0.5) * 400;
                p.y = (Math.random() - 0.5) * 400;
            }
            dummy.position.set(p.x, p.y, p.z);
            // Elongate based on speed
            dummy.scale.set(0.1, 0.1, p.speed * 10);
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

function CockpitScene({ setShake, mouseX, mouseY, setFireFlash }: CockpitSceneProps) {
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

    useEffect(() => {
        const handleDown = (e: MouseEvent) => { if (e.button === 0) setIsMouseDown(true); ensureAudioContext(audioCtxRef); };
        const handleUp = () => setIsMouseDown(false);
        window.addEventListener("mousedown", handleDown);
        window.addEventListener("mouseup", handleUp);
        return () => {
            window.removeEventListener("mousedown", handleDown);
            window.removeEventListener("mouseup", handleUp);
            closeAudioContext(audioCtxRef);
            // Clean up meshes
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
        const targetX = mouseX.get() * 0.15;
        const targetY = mouseY.get() * 0.15;
        camera.rotation.y += (targetX - camera.rotation.y) * 0.05;
        camera.rotation.x += (-targetY - camera.rotation.x) * 0.05;

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
            const haloMat = new THREE.MeshBasicMaterial({ color: colorStr, transparent: true, opacity: 0.8 });
            const haloMesh = new THREE.Mesh(haloGeo, haloMat);

            // Core cylinder (white)
            const coreGeo = new THREE.CylinderGeometry(0.03, 0.03, 8, 8);
            coreGeo.rotateX(Math.PI / 2);
            const coreMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 1 });
            const coreMesh = new THREE.Mesh(coreGeo, coreMat);

            const group = new THREE.Group();
            group.add(haloMesh);
            group.add(coreMesh);
            
            const start = new THREE.Vector3(startX, startY, startZ);
            
            // Unproject center coordinates (0,0) to target the fixed screen center
            const vector = new THREE.Vector3(0, 0, 0.5);
            vector.unproject(camera);
            const dir = vector.sub(camera.position).normalize();
            
            // Target is far away along that direction
            const distance = 120;
            const target = camera.position.clone().add(dir.multiplyScalar(distance));
            
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
        }
    });

    return (
        <group>
            {/* Environment */}
            <DottedOcean />
            
            {/* Horizon Mask Plane to hide stars under the ocean */}
            <mesh position={[0, -50, -100]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[10000, 10000]} />
                <meshBasicMaterial color={bgColorStr} />
            </mesh>

            <Stars radius={100} depth={50} count={2500} factor={4} saturation={0} fade speed={1.5} />
            <Sparkles count={150} scale={50} size={2} speed={0.4} opacity={0.3} color="#ffffff" position={[0,0,-20]} />
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
            <Canvas camera={{ position: [0, 0, 5], fov: 60 }} dpr={[1, 2]}>
                <CockpitScene mouseX={mouseX} mouseY={mouseY} setShake={setShake} />
            </Canvas>
        </div>
    );
}
