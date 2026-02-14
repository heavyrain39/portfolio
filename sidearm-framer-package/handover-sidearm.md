# SIDEARM Framer Package Handover

- Project: SIDEARM (Framer component packaging)
- Base folder: `sidearm-framer-package/`
- Context date: 2026-02-15 (KST)

## 1) Goal
기존 포트폴리오 히어로 미니게임의 동작/연출/감각을 최대한 유지하면서,
Framer에서 판매 가능한 컴포넌트 구조로 분리/패키징한다.

핵심 원칙:
- 기존 포폴 구현은 건드리지 않는다.
- 체감 플레이(사격감, 타격감, HUD, 오퍼레이터 연출)를 먼저 보존한다.
- 상품화 요구사항은 단계적으로 추가한다.

## 2) Current Folder Structure
- `src/components/MiniGame.tsx`
- `src/components/OperatorComments.tsx`
- `src/Sidearm.tsx`
- `src/types.ts`
- `src/index.ts`
- `assets/operator/*.webp`
- `docs/migration-checklist.md`
- `README.md`

## 3) What Has Been Done
1. 패키징 작업 전용 폴더 생성 및 자산 분리
- 원본에서 미니게임/오퍼레이터 코드와 operator 이미지들을 복사해 독립 작업 가능 상태로 구성.

2. Framer 패키지 진입점 추가
- `src/Sidearm.tsx`: 기본 래퍼 컴포넌트 추가.
- `src/index.ts`: export 진입점 추가.
- `src/types.ts`: `SidearmProps`, `OperatorId`, 기본 대사(`DEFAULT_DIALOGUES`) 정의.

3. MiniGame를 props 기반으로 확장 (동작 유지 우선)
- 색상/사운드/오퍼레이터 표시/HUD 표시/클래스/스타일 등 외부 주입 구조 추가.
- 하드코딩된 일부 색상을 props 기반으로 치환.
- 볼륨 값(0~100) 반영 로직 추가.

4. OperatorComments를 패키지 친화적으로 보강
- 외부 대사 배열 주입 가능.
- 에셋 base path 주입 가능.
- operator 고정 선택 가능.

5. 기본 타입 검증
- `npx tsc --noEmit` 통과 확인.

## 4) Progress Update (2026-02-15)
이번 세션에서 다음 항목을 구현 완료:

1. Input modernizing
- `MouseEvent` 기반 입력을 `Pointer Events`로 전환.
- 모바일 터치 입력에서도 즉시 조준/발사 가능.

2. Auto pause/resume
- `IntersectionObserver`로 화면 밖에서 게임 루프 자동 중단.
- 다시 보일 때 루프 자동 재개.

3. Responsive canvas
- `ResizeObserver`로 컨테이너 크기 변화를 감지해 캔버스 자동 동기화.

4. Framer Property Controls
- `src/Sidearm.tsx`에 `addPropertyControls` 연결.
- 테마/사운드/오퍼레이터/탄속/스프레이/파티클/HUD/Editor 30fps 노출.

5. Editor optimization
- `isEditorMode`에서 30fps 제한 로직 적용.

6. 남은 핵심 갭
- 실제 Framer runtime에서 렌더/성능/에셋 경로 검증.
- A/B 비교 페이지 제작 및 체크리스트 기반 검수.

## 5) Verification Plan (Non-developer Friendly)
다음 단계에서 반드시 A/B 비교 방식으로 검증:

1. 기존 버전 vs 패키지 버전을 같은 화면에서 동시에 띄워 시각 비교
2. 체크리스트로 합/불 판정
- 조준선/발사감
- 타겟 스폰 밀도
- 파티클/타격 플래시
- HUD 텍스트/점수 증가
- 오퍼레이터 출력/깜빡임
- 사운드 on/off
3. 20~30초 녹화로 전후 비교

## 6) Next Implementation Order
1. A/B 테스트 페이지 + 체크리스트 기반 검수
2. Framer runtime 실검증 (Desktop/Mobile breakpoint, asset path)
3. operator 이미지 커스텀 세트/테마 틴트 UI 확장
4. 사운드 프로파일(기본/저음) 선택 UI 추가
5. 데모 페이지/스토어용 GIF 제작

## 7) Notes for Next Chat
다음 대화에서 바로 시작할 추천 작업:
- A/B 비교용 테스트 페이지 생성
- Framer에서 실제 드롭 테스트로 property controls 반영 확인

이 순서가 가장 안전하며, “디자인/동작이 망가지지 않는지”를 중간마다 확인하기 쉽다.
