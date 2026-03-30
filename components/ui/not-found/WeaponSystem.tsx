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

/**
 * TelemetryPanel: 시스템 원격측정 데이터를 막대 게이지와 헥스 데이터 테이블로 시각화하는 하단 패널.
 * 텍스트를 최소화하고 시각 요소 중심으로 구성합니다.
 */
function TelemetryPanel() {
  const METER_DEFS = [
    { id: 'PWR',  label: 'POWER',   base: 87, tag: 'ACT' },
    { id: 'SIG',  label: 'SIGNAL',  base: 74, tag: 'OK'  },
    { id: 'THM',  label: 'THERMAL', base: 31, tag: 'LOW' },
    { id: 'TGT',  label: 'TARGET',  base: 92, tag: 'LCK' },
    { id: 'AMO',  label: 'AMMO',    base: 53, tag: 'STB' },
  ];

  // 좌측 헥스+점자 데이터 테이블
  const DATA_TABLE = [
    { idx: '00', addr: '0xFF2A', chk: 'OK ',  payload: '⠿⠟⠯⠷⠾' },
    { idx: '01', addr: '0x3BC1', chk: 'ERR',  payload: '⠾⠽⠝⠷⠶' },
    { idx: '02', addr: '0x91E4', chk: 'OK ',  payload: '⠿⠻⠯⠿⠟' },
    { idx: '03', addr: '0xA042', chk: 'OK ',  payload: '⠷⠿⠻⠯⠶' },
    { idx: '04', addr: '0x7F0E', chk: 'IDL',  payload: '⠶⠵⠿⠾⠽' },
  ] as const;

  // 우측 헥스+점자 데이터 테이블 (동일 포맷, 다른 내용)
  const DATA_TABLE_2 = [
    { idx: '05', addr: '0xC4B3', chk: 'OK ',  payload: '⠿⠯⠷⠾⠟' },
    { idx: '06', addr: '0x8A20', chk: 'OK ',  payload: '⠽⠝⠷⠶⠵' },
    { idx: '07', addr: '0xE19D', chk: 'ERR',  payload: '⠯⠿⠻⠟⠾' },
    { idx: '08', addr: '0x5F42', chk: 'IDL',  payload: '⠶⠿⠯⠷⠽' },
    { idx: '09', addr: '0xB6C8', chk: 'OK ',  payload: '⠟⠯⠾⠿⠵' },
  ] as const;

  // FREQ ANAL: 기본 높이를 useMemo로 고정 후 미세 진동만 허용
  const BAR_COUNT = 22;
  const BASE_BARS = React.useMemo(() =>
    Array.from({ length: BAR_COUNT }, (_, i) => {
      const mid = BAR_COUNT / 2;
      const dist = Math.abs(i - mid) / mid;
      return (1 - dist * 0.5) * 60 + 20; // 중앙 집중형 종 모양 분포
    }), []
  );

  const [meters, setMeters] = useState(
    METER_DEFS.map(m => ({ ...m, value: m.base as number }))
  );
  const [freqBars, setFreqBars] = useState<number[]>(BASE_BARS);

  // 게이지: 800ms마다 ±2 소폭 드리프트 → 숫자 표시값과 바가 같은 state를 공유해 연동
  useEffect(() => {
    const tick = setInterval(() => {
      setMeters(prev =>
        prev.map(m => {
          const drift = (Math.random() - 0.5) * 4;
          const next = Math.max(m.base - 10, Math.min(m.base + 10, m.value + drift));
          return { ...m, value: next };
        })
      );
    }, 800);
    return () => clearInterval(tick);
  }, []);

  // FREQ ANAL: 2.5초마다 기본 높이 기준 ±6 이내 미세 진동
  useEffect(() => {
    const tick = setInterval(() => {
      setFreqBars(
        BASE_BARS.map(base => Math.max(12, Math.min(85, base + (Math.random() - 0.5) * 12)))
      );
    }, 2500);
    return () => clearInterval(tick);
  }, [BASE_BARS]);

  // 막대 위치 기반 3위계 opacity (핸드오버 위계 적용: 80%/50%/25%)
  function barOpacity(i: number): number {
    const mid = BAR_COUNT / 2;
    const dist = Math.abs(i - mid) / mid;
    if (dist < 0.3) return 0.80;  // High: 중앙 핵심 대역
    if (dist < 0.65) return 0.50; // Medium: 중간 대역
    return 0.25;                   // Low: 외곽
  }

  return (
    <div className="w-full flex-1 min-h-0 flex gap-0 mt-[10px]">
      {/* ── 좌측: SYS TELEMETRY 게이지 바 ── */}
      <div className="flex-[6] flex flex-col border border-[var(--foreground)]/25 relative overflow-hidden">
        {/* 배경 그리드 - 플레이어 영역과 동일한 40px 피치 */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(color-mix(in srgb, var(--foreground) 4%, transparent) 1px, transparent 1px), linear-gradient(90deg, color-mix(in srgb, var(--foreground) 4%, transparent) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
        {/* 섹션 헤더 */}
        <div className="flex justify-between items-center px-4 py-1 shrink-0">
          <span className="font-mono text-[6px] md:text-[0.42vw] opacity-50 tracking-[0.3em] uppercase">
            SYS TELEMETRY
          </span>
          <span className="font-mono text-[6px] md:text-[0.42vw] opacity-25 tracking-widest">
            LIVE
          </span>
        </div>
        {/* 게이지 바 목록 - 플레이어 진행바와 동일한 스타일 */}
        <div className="flex flex-col flex-1 px-4 pb-3 gap-0 justify-around">
          {meters.map(m => (
            <div key={m.id} className="flex items-center gap-2">
              {/* 레이블: Medium(50%) */}
              <span className="font-mono text-[7px] md:text-[0.5vw] opacity-50 tracking-[0.08em] w-[34px] shrink-0">
                {m.label}
              </span>
              {/* 트랙: 플레이어 진행바와 동일 — bg-background + border /20 */}
              <div
                className="flex-[0_1_55%] h-[4px] md:h-[5px] bg-[var(--background)] border border-[var(--foreground)]/20 relative overflow-hidden"
              >
                <motion.div
                  className="absolute left-0 top-0 h-full bg-[var(--foreground)] opacity-80"
                  animate={{ width: `${m.value}%` }}
                  transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
                />
              </div>
              {/* 수치: Medium(50%) */}
              <span className="font-mono text-[7px] md:text-[0.5vw] opacity-50 w-[20px] text-right shrink-0">
                {Math.round(m.value)}%
              </span>
              {/* 태그: Low(25%) */}
              <span className="font-mono text-[6px] md:text-[0.42vw] opacity-25 tracking-widest w-[22px] shrink-0">
                [{m.tag}]
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── 우측: 헥스+점자 테이블 두 개 + FREQ ANAL ── */}
      <div className="flex-[4] flex flex-col border border-l-0 border-[var(--foreground)]/25">

        {/* 상단: 두 개의 데이터 테이블 나란히 */}
        <div className="flex-[5] flex border-b border-[var(--foreground)]/25 overflow-hidden">

          {/* 좌측 테이블 */}
          <div className="flex-1 flex flex-col border-r border-[var(--foreground)]/25">
            {/* 컬럼 헤더 */}
            <div className="flex items-center gap-1.5 px-2 py-1 shrink-0 border-b border-[var(--foreground)]/25">
              <span className="font-mono text-[6px] md:text-[0.42vw] opacity-25 w-[12px]">IX</span>
              <span className="font-mono text-[6px] md:text-[0.42vw] opacity-25 w-[32px]">ADDR</span>
              <span className="font-mono text-[6px] md:text-[0.42vw] opacity-25 w-[14px]">CHK</span>
              <span className="font-mono text-[6px] md:text-[0.42vw] opacity-25">PAYLOAD</span>
            </div>
            <div className="flex flex-col flex-1 justify-around px-2 py-1">
              {DATA_TABLE.map(row => (
                <div key={row.idx} className="flex items-center gap-1.5">
                  <span className="font-mono text-[6px] md:text-[0.42vw] opacity-25 w-[12px] shrink-0">{row.idx}</span>
                  <span className="font-mono text-[7px] md:text-[0.5vw] opacity-50 w-[32px] shrink-0">{row.addr}</span>
                  <span
                    className="font-mono text-[6px] md:text-[0.42vw] w-[14px] shrink-0"
                    style={{ opacity: row.chk.trim() === 'ERR' ? 0.8 : 0.25 }}
                  >
                    {row.chk}
                  </span>
                  <span className="font-mono text-[7px] md:text-[0.5vw] opacity-25 tracking-[0.05em]">{row.payload}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 우측 테이블 (동일 포맷, 다른 내용) */}
          <div className="flex-1 flex flex-col">
            {/* 컬럼 헤더 */}
            <div className="flex items-center gap-1.5 px-2 py-1 shrink-0 border-b border-[var(--foreground)]/25">
              <span className="font-mono text-[6px] md:text-[0.42vw] opacity-25 w-[12px]">IX</span>
              <span className="font-mono text-[6px] md:text-[0.42vw] opacity-25 w-[32px]">ADDR</span>
              <span className="font-mono text-[6px] md:text-[0.42vw] opacity-25 w-[14px]">CHK</span>
              <span className="font-mono text-[6px] md:text-[0.42vw] opacity-25">PAYLOAD</span>
            </div>
            <div className="flex flex-col flex-1 justify-around px-2 py-1">
              {DATA_TABLE_2.map(row => (
                <div key={row.idx} className="flex items-center gap-1.5">
                  <span className="font-mono text-[6px] md:text-[0.42vw] opacity-25 w-[12px] shrink-0">{row.idx}</span>
                  <span className="font-mono text-[7px] md:text-[0.5vw] opacity-50 w-[32px] shrink-0">{row.addr}</span>
                  <span
                    className="font-mono text-[6px] md:text-[0.42vw] w-[14px] shrink-0"
                    style={{ opacity: row.chk.trim() === 'ERR' ? 0.8 : 0.25 }}
                  >
                    {row.chk}
                  </span>
                  <span className="font-mono text-[7px] md:text-[0.5vw] opacity-25 tracking-[0.05em]">{row.payload}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 하단: FREQ ANAL — 22개 가는 막대, 3위계 opacity(80/50/25%), 미세 진동 */}
        <div className="flex-[3] flex flex-col overflow-hidden">
          <div className="px-2 pt-1 shrink-0">
            <span className="font-mono text-[6px] md:text-[0.42vw] opacity-25 tracking-[0.25em] uppercase">
              FREQ ANAL
            </span>
          </div>
          <div className="flex-1 px-2 pb-1.5 flex items-end justify-between min-h-0">
            {freqBars.map((h, i) => (
              <motion.div
                key={i}
                className="bg-[var(--foreground)]"
                animate={{ scaleY: h / 100 }}
                style={{
                  originY: 1,
                  opacity: barOpacity(i),
                  height: '100%',
                  width: '2px',
                  flexShrink: 0,
                }}
                transition={{ duration: 1.4, ease: 'easeInOut' }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function WeaponSystem() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-start gap-2 px-4 pt-4 pb-2 pointer-events-none">
      {/* 가로로 나열된 3개의 웨폰 시스템 */}
      <div className="w-full flex flex-row items-start justify-center gap-2 md:gap-[1vw] translate-y-[10px] shrink-0">
        <WeaponSystemBundle id="WPN-01" index={0} />
        <WeaponSystemBundle id="WPN-02" index={1} />
        <WeaponSystemBundle id="WPN-03" index={2} />
      </div>

      {/* 텔레메트리 패널 - 카드와 하단 바 사이 남은 공간 전부 채움 */}
      <TelemetryPanel />

      {/* 하단 통합 정보 바 - 원문 복원 */}
      <div className="w-full flex justify-between items-center font-mono text-[7px] md:text-[0.55vw] opacity-40 uppercase tracking-widest shrink-0">
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
