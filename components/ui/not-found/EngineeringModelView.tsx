"use client";

import React, { useRef, Suspense, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, PerspectiveCamera, Center } from "@react-three/drei";
import * as THREE from "three";

// 1. Wireframe Model Component
function WireframeModel({
  url,
  scale = 1,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  autoRotate = false,
  rotationType = 'continuous' // 'continuous' or 'oscillate'
}: any) {
  const { scene } = useGLTF(url) as any;
  const [wireColor, setWireColor] = React.useState("#ffffff");

  // Sync with CSS Theme Color
  React.useEffect(() => {
    const color = getComputedStyle(document.documentElement).getPropertyValue('--foreground').trim();
    if (color) setWireColor(color);
  }, []);

  const clonedScene = useMemo(() => {
    const clone = scene.clone();
    clone.traverse((child: any) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.material = new THREE.MeshBasicMaterial({
          color: wireColor,
          wireframe: true,
          transparent: true,
          opacity: 0.25,
        });
      }
    });
    return clone;
  }, [scene, wireColor]); // Re-generate material when color changes

  const groupRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (autoRotate && groupRef.current) {
      if (rotationType === 'oscillate') {
        // Oscillate between 0 and 180 degrees (Math.PI)
        // Adjust speed by modifying elapsedTime multiplier (0.4)
        groupRef.current.rotation.y = (Math.sin(state.clock.elapsedTime * 0.2) + 1) / 2 * Math.PI;
      } else {
        groupRef.current.rotation.y += delta * 0.2;
      }
    }
  });

  return (
    <primitive
      ref={groupRef}
      object={clonedScene}
      scale={scale}
      position={position}
      rotation={rotation}
    />
  );
}

// 2. Main Viewport Component
export default function EngineeringModelView() {
  return (
    <div className="w-full h-full relative" style={{ background: 'transparent' }}>
      {/* 
          [조정 가이드]
          1. position: [X, Y, Z] -> 카메라 위치 (Z가 커질수록 멀어짐)
          2. fov: 시야각 (작을수록 망원, 클수록 광각)
      */}
      {/* 3D Viewport Layer - Z-Index 0 */}
      <div className="absolute inset-0 z-0">
        <Canvas dpr={[1, 2]} camera={{ position: [0, 0, 16], fov: 40 }}>
          <Suspense fallback={null}>
            <ambientLight intensity={0.5} />

            {/* 
              메인 카시니 모델 배치 
              - position: [좌우, 상하, 앞뒤] 오프셋 (Y값 -0.8을 조정해 높이 변경)
              - scale: 모델 크기
            */}
            <Center position={[13.5, -4.0, 0]}>
              <WireframeModel
                url="/portfolio/models/cassini.glb"
                scale={0.45}
                rotation={[0.5, 0, 0]}
                autoRotate={true}
                rotationType="oscillate"
              />
            </Center>

            {/* 
              상단 생명 표시(슈트) 배치 
              - group position: 전체적인 위치 [-왼쪽, +위쪽, 앞뒤]
              - scale: 슈트 개별 크기
              - 개별 position: 슈트 간의 간격 조정 [X, Y, Z]
          */}
            <group position={[-11.0, 4.3, 0]}>
              <WireframeModel url="/portfolio/models/spacesuit.glb" scale={0.4} position={[0, 0, 0]} rotation={[0, 0.5, 0]} />
              <WireframeModel url="/portfolio/models/spacesuit.glb" scale={0.4} position={[0.7, 0, 0]} rotation={[0, 0.5, 0]} />
              <WireframeModel url="/portfolio/models/spacesuit.glb" scale={0.4} position={[1.4, 0, 0]} rotation={[0, 0.5, 0]} />
            </group>
          </Suspense>
        </Canvas>
      </div>

      {/* Technobabble Overlay (Bottom-Left) - Background removed as requested */}
      <div className="absolute bottom-4 left-4 font-mono text-[9px] md:text-[0.55vw] leading-relaxed select-none pointer-events-none flex flex-col gap-3 z-10">
        <div className="opacity-50 flex flex-col gap-3">
          <div>SESSION RESTORED · GOOD DAY, USER ****</div>

          <div className="flex flex-col gap-0.5">
            <div>ETHER FIELD STATUS: EXTREME GREEN</div>
            <div>GRAVITY FIELD A STATUS: PERFECT</div>
            <div>GRAVITY FIELD B STATUS: OPTIMAL</div>
            <div>EARTH TIME: 2026-03-31 03:55:00 UTC</div>
            <div>YOUR TIME: 4026-03-31 03:55:00 SPC</div>
            <div>SPATIAL DISTORTION: 1.004 % (NO WORRIES!)</div>
          </div>
        </div>

        <div className="opacity-80 text-[var(--foreground)] animate-pulse">
          〔 WARN: TEMPORAL ANOMALY DETECTED 〕
        </div>

        <div className="flex flex-col opacity-15 leading-tight">
          <div>Delta compression using up to 99 threads</div>
          <div>Compressing objects: 100% (6/6), done.</div>
          <div>Writing objects: 100% (6/6), 955.42 PB | 3.14 EB/s, done.</div>
        </div>
      </div>
    </div>
  );
}
