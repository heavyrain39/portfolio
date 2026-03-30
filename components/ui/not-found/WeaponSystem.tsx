"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

/**
 * WeaponFrame: vector-frame.svg의 경로를 기반으로 한 개별 프레임 UI
 * 타 UI와의 일체감을 위해 라인 두께를 0.5px로 정밀하게 조정했습니다.
 */
function WeaponFrame({ className, opacity = 1 }: { className?: string; opacity?: number }) {
  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 267 118"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ opacity }}
      preserveAspectRatio="xMidYMid meet"
    >
      {/* 메인 프레임 라인 - 두께를 0.5로 낮추어 공학적 디테일 강조 */}
      <path
        d="M21.5 0.5H105.5L112.5 7.38235H259.5L266.5 14.2647V110.618L259.5 117.5H63.5L56.5 110.618H28.5L21.5 117.5H7.5L0.5 110.618V21.1471L21.5 0.5Z"
        stroke="currentColor"
        strokeWidth="0.5"
        vectorEffect="non-scaling-stroke"
      />
      {/* 상단 디테일 라인 */}
      <path d="M115.43 0.5H118.816L123.895 5.31765H120.509L115.43 0.5Z" stroke="currentColor" strokeWidth="0.5" vectorEffect="non-scaling-stroke" />
      <path d="M109 0.5H112.386L117.465 5.31765H114.079L109 0.5Z" stroke="currentColor" strokeWidth="0.5" vectorEffect="non-scaling-stroke" />
      <path d="M121.774 0.5H125.16L130.239 5.31765H126.853L121.774 0.5Z" stroke="currentColor" strokeWidth="0.5" vectorEffect="non-scaling-stroke" />
      <path d="M128.117 0.5H186.52L191.95 5.31765H133.5L128.117 0.5Z" stroke="currentColor" strokeWidth="0.5" vectorEffect="non-scaling-stroke" />
      <path d="M25.5 117.5L30 113.3H55L59.5 117.5H25.5Z" stroke="currentColor" strokeWidth="0.5" vectorEffect="non-scaling-stroke" />

      {/* 프레임 내부 상태 데이터 */}
      <g opacity="0.25" className="font-mono" style={{ fontSize: '5px' }}>
        <text x="30" y="32" fill="currentColor">STATUS: OK</text>
        <text x="30" y="42" fill="currentColor">POWER: 100%</text>
        <rect x="30" y="52" width="30" height="1.5" fill="currentColor" opacity="0.1" />
        <motion.rect
          x="30" y="52" width="24" height="1.5" fill="currentColor"
          animate={{ width: [24, 28, 20, 26] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        />
      </g>
    </svg>
  );
}

/**
 * useRandomWalkBlink: 각 번들이 독립적으로 간헐적 깜빡임을 수행하는 랜덤워크 훅.
 * 매 사이클(깜빡임 1회) 종료 후 새로운 랜덤 대기시간을 계산하여 진짜 비규칙적 동작을 구현합니다.
 * @param initialDelay - 첫 번째 깜빡임까지의 초기 지연시간 (ms)
 */
function useRandomWalkBlink(initialDelay: number) {
  const [isBlinking, setIsBlinking] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // 깜빡임 1사이클: 활성화(300ms) → 비활성화 → 다음 랜덤 대기
    function scheduleNextBlink(delay: number) {
      timerRef.current = setTimeout(() => {
        setIsBlinking(true);
        // 깜빡임 지속 시간: 250~600ms 사이 랜덤 (불규칙한 펄스)
        const blinkDuration = 250 + Math.random() * 350;
        timerRef.current = setTimeout(() => {
          setIsBlinking(false);
          // 다음 깜빡임까지 대기: 2.5~9초 사이 랜덤으로 진짜 간헐적 효과 구현
          const nextDelay = 2500 + Math.random() * 6500;
          scheduleNextBlink(nextDelay);
        }, blinkDuration);
      }, delay);
    }

    scheduleNextBlink(initialDelay);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [initialDelay]);

  return isBlinking;
}

/**
 * WeaponSystemBundle: 3중 중첩 프레임과 ACTIVATED 라벨을 포함한 개별 웨폰 시스템 단위
 */
function WeaponSystemBundle({ id, index }: { id: string; index: number }) {
  // 각 번들마다 서로 다른 초기 지연을 주어 동시에 시작하는 것을 방지 (1.5 ~ 4.5초)
  const initialDelay = 1500 + index * 1200 + Math.random() * 800;
  const isBlinking = useRandomWalkBlink(initialDelay);
  const [hovered, setHovered] = useState(false);

  // 호버 시 각 레이어 간격: (2%,4%) → (4%,8%) 동일 간격으로 확장하여 입체적 분해 연출
  // front = 고정, middle = 2배 오프셋, back = 4배 오프셋 (균등 간격 유지)
  const SPRING = { type: "spring" as const, stiffness: 1100, damping: 65 };

  return (
    <div
      className="relative flex-1 aspect-[267/118] max-w-[280px]"
      style={{ pointerEvents: "auto" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* 가장 뒤 프레임 - 호버 시 가장 많이 벌어짐 */}
      <motion.div
        className="absolute inset-0 text-[var(--foreground)]"
        style={{ scale: 0.98 }}
        animate={hovered ? { x: "-8%", y: "-16%" } : { x: "-4%", y: "-8%" }}
        transition={SPRING}
      >
        <WeaponFrame className="w-full h-full" opacity={0.12} />
      </motion.div>

      {/* 중간 프레임 - 호버 시 절반만 벌어짐 */}
      <motion.div
        className="absolute inset-0 text-[var(--foreground)]"
        style={{ scale: 0.99 }}
        animate={hovered ? { x: "-4%", y: "-8%" } : { x: "-2%", y: "-4%" }}
        transition={SPRING}
      >
        <WeaponFrame className="w-full h-full" opacity={0.25} />
      </motion.div>

      {/* 맨 앞에 있는 카드 (기준점) - 호버 시 고정 */}
      <WeaponFrame
        className="relative w-full h-full text-[var(--foreground)]"
        opacity={0.7}
      />

      {/* 중앙 상태 라벨: 전면 카드(relative 요소)의 중앙에 배치하되 사용자 요청에 따라 미세 오프셋 적용 */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none translate-x-[2px] translate-y-[5px]">
        <div className="relative">
          <div className="absolute inset-0 bg-[var(--foreground)] opacity-5 blur-[2px]" />
          <motion.div
            className="px-3 py-1 bg-[var(--foreground)] text-[var(--background)] font-mono font-bold tracking-[0.2em] uppercase text-[8px] md:text-[0.6vw]"
            animate={
              isBlinking
                ? {
                    // 원본 글리치 느낌 복원: 극단적으로 짧은 사이클, 불규칙 opacity로 시스템 오류 연출
                    opacity: [0.9, 0.4, 0.8, 0.2, 0.9],
                    scale:   [1,   1.01, 1,  0.99, 1  ],
                  }
                : {
                    // 대기 상태: 정상 가시 상태로 복귀
                    opacity: 0.9,
                    scale: 1,
                  }
            }
            transition={
              isBlinking
                ? {
                    // 0.15s × repeat 4 = 총 ~0.6s 동안 빠른 글리치 버스트
                    duration: 0.15,
                    repeat: 4,
                    repeatType: "loop" as const,
                    ease: "linear",
                  }
                : { duration: 0.4, ease: "easeOut" }
            }
          >
            ACTIVATED
          </motion.div>
          <div className="absolute -top-1 -left-1 w-1.5 h-1.5 border-t border-l border-[var(--foreground)]/40" />
          <div className="absolute -bottom-1 -right-1 w-1.5 h-1.5 border-b border-r border-[var(--foreground)]/40" />
        </div>
      </div>

      {/* 시스템 식별 번호 (상단) */}
      <div className="absolute top-[12%] right-[8%] font-mono text-[6px] md:text-[0.4vw] opacity-30 tracking-widest">
        ID: {id}
      </div>
    </div>
  );
}

export default function WeaponSystem() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-start gap-3 px-4 py-4 pointer-events-none">
      {/* 가로로 나열된 3개의 웨폰 시스템 - 수직 정렬을 상단(justify-start)으로, 간격을 절반으로 축소 */}
      <div className="w-full flex flex-row items-start justify-center gap-2 md:gap-[1vw] translate-y-[10px]">
        <WeaponSystemBundle id="WPN-01" />
        <WeaponSystemBundle id="WPN-02" />
        <WeaponSystemBundle id="WPN-03" />
      </div>

      {/* 하단 통합 정보 바 - 장식선(border-t)을 제거하여 미니멀한 느낌 강조 */}
      <div className="w-full max-w-[800px] mt-2 flex justify-between items-center font-mono text-[7px] md:text-[0.55vw] opacity-40 uppercase tracking-widest">
        <div className="flex gap-4">
          <span>• A LINK STABLE</span>
          <span>• B LINK STABLE</span>
        </div>
        <div className="flex gap-4">
          <span>YOUR TRUSTED ARMAMENT SYSTEM CORSAIR v7.222™</span>
          <span className="animate-pulse">AUTH BYPASSED</span>
        </div>
      </div>
    </div>
  );
}
