"use client";

import React, { useRef, Suspense, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
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
          opacity: 0.15,
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

// 2. 동적 뷰포트 씬 컴포넌트 (화면 크기에 따라 모델 위치/크기 자동 조절)
function DynamicViewportScene() {
  const { viewport } = useThree();

  // [스케일 기준값] FOV 40, Z 16일 때의 기본 뷰포트 높이(~11.6)를 기준으로 비율 계산
  const scaleFactor = viewport.height / 11.6;

  // 메인 카시니 모델 위치 설정 (우하단 배치)
  // x: viewport.width / 2 (우측 끝)에서 일정 거리 안쪽으로
  // y: -viewport.height / 2 (하단 끝)에서 일정 거리 위쪽으로
  const cassiniPos: [number, number, number] = [
    viewport.width / 2 - -5.2 * scaleFactor,
    -viewport.height / 2 + 1.2 * scaleFactor,
    0
  ];

  // 생명 표시(슈트) 그룹 위치 설정 (좌상단 배치)
  // x: -viewport.width / 2 (좌측 끝)에서 일정 거리 안쪽으로
  // y: viewport.height / 2 (상단 끝)에서 일정 거리 아래쪽으로
  const suitGroupPos: [number, number, number] = [
    -viewport.width / 2 + -0.8 * scaleFactor,
    viewport.height / 2 - 1.5 * scaleFactor,
    0
  ];

  return (
    <>
      <ambientLight intensity={0.5} />

      {/* 
        메인 카시니(Cassini) 모델 
        - position: 위에서 계산한 우하단 좌표 적용
        - scale: 화면 높이에 비례하여 크기 조절 (기본 0.45)
      */}
      <Center position={cassiniPos}>
        <WireframeModel
          url="/portfolio/models/cassini.glb"
          scale={0.45 * scaleFactor}
          rotation={[0.5, 0, 0]}
          autoRotate={true}
          rotationType="oscillate"
        />
      </Center>

      {/* 
        상단 생명 표시(슈트) 모델 그룹
        - position: 위에서 계산한 좌상단 좌표 적용
        - scale: 개별 모델 크기 (기본 0.4)
        - 개별 position: 모델 간의 간격도 화면 크기에 비례하도록 설정
      */}
      <group position={suitGroupPos}>
        <WireframeModel url="/portfolio/models/spacesuit.glb" scale={0.4 * scaleFactor} position={[0, 0, 0]} rotation={[0, 0.5, 0]} />
        <WireframeModel url="/portfolio/models/spacesuit.glb" scale={0.4 * scaleFactor} position={[0.7 * scaleFactor, 0, 0]} rotation={[0, 0.5, 0]} />
        <WireframeModel url="/portfolio/models/spacesuit.glb" scale={0.4 * scaleFactor} position={[1.4 * scaleFactor, 0, 0]} rotation={[0, 0.5, 0]} />
      </group>
    </>
  );
}

// 3. Main Viewport Component
export default function EngineeringModelView() {
  const [currentTime, setCurrentTime] = React.useState(new Date());

  // 1초마다 시간 업데이트
  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 시간 포맷팅 함수 (YYYY-MM-DD HH:mm:ss)
  const formatDateTime = (date: Date, yearOffset = 0) => {
    const y = date.getUTCFullYear() + yearOffset;
    const m = String(date.getUTCMonth() + 1).padStart(2, '0');
    const d = String(date.getUTCDate()).padStart(2, '0');
    const hh = String(date.getUTCHours()).padStart(2, '0');
    const mm = String(date.getUTCMinutes()).padStart(2, '0');
    const ss = String(date.getUTCSeconds()).padStart(2, '0');
    return `${y}-${m}-${d} ${hh}:${mm}:${ss}`;
  };

  return (
    <div className="w-full h-full relative overflow-hidden" style={{ background: 'transparent' }}>
      {/* 3D Viewport Layer - Z-Index 0 */}
      <div className="absolute inset-0 z-0">
        <Canvas dpr={[1, 2]} camera={{ position: [0, 0, 16], fov: 40 }}>
          <Suspense fallback={null}>
            <DynamicViewportScene />
          </Suspense>
        </Canvas>
      </div>

      {/* Technobabble Overlay (Bottom-Left) */}
      <div className="absolute bottom-4 left-4 font-mono text-[9px] md:text-[0.55vw] leading-relaxed select-none pointer-events-none flex flex-col gap-3 z-10">
        {/* 1. Git-style System Logs (Darkest) */}
        <div className="flex flex-col opacity-15 leading-tight">
          <div>Delta compression using up to 99 threads</div>
          <div>Compressing objects: 100% (6/6), done.</div>
          <div>Writing objects: 100% (6/6), 955.42 PB | 3.14 EB/s, done.</div>
        </div>

        {/* 2. Session & Environment Status (Medium) */}
        <div className="opacity-50 flex flex-col gap-3">
          <div>SESSION RESTORED · GOOD DAY, USER ****</div>

          <div className="flex flex-col gap-0.5">
            <div>ETHER FIELD STATUS: EXTREME GREEN</div>
            <div>GRAVITY FIELD A STATUS: PERFECT</div>
            <div>GRAVITY FIELD B STATUS: OPTIMAL</div>
            <div>EARTH TIME: {formatDateTime(currentTime)} UTC</div>
            <div>YOUR TIME: {formatDateTime(currentTime, 2000)} SPC</div>
            <div>SPATIAL DISTORTION: 1.004 % (NO WORRIES!)</div>
          </div>
        </div>

        {/* 3. Warnings (Brightest) */}
        <div className="opacity-80 text-[var(--foreground)] animate-pulse">
          〔 WARN: TEMPORAL ANOMALY DETECTED 〕
        </div>
      </div>
    </div>
  );
}
