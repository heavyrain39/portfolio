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

## 4) Progress Update (2026-02-15, latest)
이번 세션까지 반영된 최신 상태:

1. Core migration requirements implemented
- 입력: `Pointer Events` 전환 완료 (터치/마우스 공통).
- 성능: `IntersectionObserver` 기반 자동 pause/resume 완료.
- 반응형: `ResizeObserver` 기반 캔버스 동기화 완료.
- 에디터: `isEditorMode`에서 30fps 제한 완료.

2. Packaging stability fixes applied
- `enableSound` 토글 시 stale closure 이슈 수정 (`enableSoundRef` 도입).
- HUD 음소거 버튼 클릭이 게임 `pointerdown`에 먹히던 문제 수정.
  - UI 컨트롤에 `data-sidearm-ui-control` 마킹 후 입력 예외 처리.
- `operatorId` prop 변경 시 즉시 반영되도록 수정 (초기 random fallback 유지).
- `dialogueList` 길이 변경 시 인덱스 범위 이슈 방어 로직 추가.
- 오퍼레이터 blink 내부 타이머 정리 누락 보강.

3. Product default behavior aligned for sale use
- 기본 클래스 모바일 표시 가능 상태로 변경 (`hidden md:block` 제거).
- 패키지 기본 에셋 경로를 `./assets/operator`로 통일.

4. Property controls expanded
- 기존: 테마/사운드/오퍼레이터/탄속/스프레이/파티클/HUD/Editor 30fps.
- 추가: `showOperatorImage`, `showOperatorComments` (이미지/코멘트 분리 on/off).

5. A/B comparison page created
- 경로: `app/sidearm-ab/page.tsx`
- 로컬 접속: `http://localhost:3000/portfolio/sidearm-ab/`
  - 주의: 프로젝트 `basePath`가 `/portfolio` 이므로 URL에 반드시 포함.
- A(기존 포폴) vs B(패키지) 동시 비교 + 체크리스트 UI 추가.

6. A/B 테스트 중 발견/해결된 항목
- 오퍼레이터 이미지 미표시: A/B 페이지에서 Next 정적 경로로 지정해 해결
  - `operatorAssetBasePath="/portfolio/images/operator"`
- 사운드 토글 미동작: pointer 이벤트 충돌 수정으로 해결

7. Type check
- `npx tsc --noEmit` 통과 확인.

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
1. Framer runtime 실검증 (Desktop/Mobile breakpoint, asset path 규칙 재확인)
2. 컬러 테마 preset controls 추가 (4~5종)
3. 사운드 프로파일(기본/저음) 선택 control 추가
4. operator 이미지 커스텀 세트/테마 틴트 UI 확장
5. 데모 페이지/스토어용 GIF 제작

## 7) Notes for Next Chat
다음 대화에서 바로 시작할 추천 작업:
- Framer에 컴포넌트 드롭 후 property controls 실동작 검수
  - 색상, 탄속, 스프레이, 파티클, 사운드, 오퍼레이터 이미지/코멘트 on/off
- 모바일 실기기 테스트 (터치 홀드/드래그, 음소거 버튼 클릭 반응)

현재는 “기능 보존 + 패키징 안정화 + A/B 비교 환경”까지 확보된 상태다.
