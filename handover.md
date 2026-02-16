
# Portfolio Redesign Project: Master Planning Document
**Project**: Portfolio 2026 (Refactoring)
**Author**: Antigravity (Collaborating with Yakshawan)
**Version**: 2.2
**Last Updated**: 2026-02-16 (MiniGame Handover Split)

---

## 1. Project Overview (프로젝트 개요)

본 프로젝트는 기존의 정적(HTML/CSS/JS) 포트폴리오를 **Next.js 14**, **Tailwind CSS**, **Framer Motion** 기반의 현대적인 웹 애플리케이션으로 전면 리디자인하는 것을 목표로 합니다. 단순한 정보 전달을 넘어 **"이야기와 기술의 교차점"**이라는 창작자의 정체성을 시각적 경험(Visual Experience)으로 구현하는 데 초점을 맞추고 있습니다.

### Core Goals
1.  **Modernization**: 기존 jQuery/Vanilla JS 기반 코드를 React 생태계로 마이그레이션하여 유지보수성 및 성능 개선.
2.  **Editorial Design**: 스위스 타이포그래피(Swiss Style Typography)와 미니멀리즘을 차용한 '매거진' 혹은 '기술 보고서' 같은 편집 디자인 구현.
3.  **Vibe Coding Identity**: 단순 개발자가 아닌, 서사와 감성을 코드로 구현하는 '바이브 코더(Vibe Coder)'로서의 아이덴티티 강조.

---

## 2. Design Concept & Guidelines

### 2.1. Aesthetic Philosophy
**"Editorial Minimalist x Technical Precision"**
-   **에이전틱(Agentic)**: 시스템, 데이터, 로그를 연상시키는 모노스페이스 폰트와 메타데이터 표기.
-   **에디토리얼(Editorial)**: 과감한 여백, 거대한 세리프(Serif) 타이포그래피, 정교한 그리드 시스템.
-   **물질감(Materiality)**: 디지털 화면 속에서 종이, 파일, 서류철과 같은 물리적인 질감을 추상적으로 구현.

### 2.2. Design System
#### Typography
-   **Headline (Serif)**: 우아하고 권위 있는 인상을 주는 세리프체. (e.g., `Playfair Display`)
-   **Body (Sans)**: 가독성을 최우선으로 투명하게 정보를 전달. (e.g., `Inter`, `Pretendard`)
-   **Data/Meta (Mono)**: 기술적 디테일과 시스템 로그 느낌을 전달. (e.g., `JetBrains Mono`)

#### Color Palette & Theme
-   **Automatic Theming**: 시간대(08:00 ~ 17:00)에 따라 라이트/다크 모드 자동 전환.
-   **Reduced Contrast**: 완전한 블랙(#000)이나 화이트(#FFF)를 지양하고, 눈이 편안한 `Off-White`(#f5f5f0)와 `Deep Charcoal`(#1a1a1a) 사용.
-   **Color Inversion (반전)**: 특정 섹션(About, Footer)에서는 배경색과 전경색을 반전시켜 강한 대비와 시각적 집중을 유도.

#### Layout & Grid
-   **Grid Background**: 배경에 옅은 모눈종이(Grid)와 거대한 동심원(Radar/Sonar)을 배치하여 공학적/분석적 분위기 조성.
-   **File Metaphor**: 페이지 하단에 서류철이나 파일 폴더를 연상시키는 둥근 모서리의 영역을 배치하여 정보의 마무리를 짓는 느낌 전달.

---

## 3. Implementation Details (구현 현황)

### 3.1. Tech Stack
-   **Framework**: Next.js 14 (App Router)
-   **Styling**: Tailwind CSS 4.0 (CSS Variables & Config Extension)
-   **Animation**: Framer Motion (Page Transitions, Scroll Animations)
-   **Language**: TypeScript (Strict Type Safety)

### 3.2. Key Features

#### A. Hero Section
-   **Responsive Typography**: 타이틀("야차완 | 夜叉腕")과 소개글의 너비를 시각적으로 일치시켜 정돈된 인상 제공.
-   **Text Justification**: 소개글에 `text-justify`와 `break-keep`을 적용하여 단어 단위 줄바꿈과 양쪽 정렬 구현.
-   **Entrance Animation**: 페이지 로드 시 텍스트가 아래에서 위로 부드럽게 떠오르는 `Fade-in-up` 효과.

#### B. Project Gallery (The Scanning Effect)
-   **Thumbnail Logic**: 2:1 비율(800x400)의 가로로 긴 이미지를 1:1 비율(Square)의 컨테이너에 표시.
-   **Hover Interaction**:
    -   **Idle**: `Grayscale` + `Saturate(0.2)` + `Contrast(1.1)` + 정지 상태.
    -   **Hover**: 컬러 복원 + 밝기 증가 + **Scanning Animation**.
    -   **Animation**: 이미지가 컨테이너 내부에서 좌우로 부드럽게 왕복 이동(Panning)하며 숨겨진 영역을 보여주는 "창을 통한 탐색" 경험 제공.

#### C. Auditory Log (Music Section)
-   **Horizontal Scroll**: 마우스 휠이 아닌, 가로 스크롤/터치 스와이프를 통한 탐색 경험.
-   **YouTube Integration**: `iframe`을 직접 사용하여 실제 조회수 집계 및 플랫폼 아이덴티티 유지.

#### D. Entity Profile (About Section) & Footer
-   **File Background Design (Updated)**:
    -   **Concept**: About 섹션과 Footer를 하나의 컨테이너로 묶어, 페이지 바닥에서 솟아오른 "파일(File)" 형태로 디자인했습니다.
    -   **Curvature Continuity (Squircle)**:
        -   단순 `border-radius` 대신 **SVG 기반의 Squircle Top Cap**(`SquircleTopBorder`)을 적용하여, Apple 스타일의 부드러운 모서리 곡률(G2 Continuity)을 구현했습니다.
        -   `flex` 레이아웃과 SVG Path를 조합하여 반응형 너비에 완벽하게 대응합니다.
    -   **Inverted Color Scheme**: **배경색 반전** 로직을 적용하여 다크 모드에서는 밝은 파일 배경, 라이트 모드에서는 어두운 파일 배경이 나타납니다. (`bg-foreground`, `text-background`)
-   **Typewriter Animation**:
    -   기존의 Scramble 효과를 대체하여, 텍스트가 한 글자씩 타이핑되듯 나타나는 효과를 적용했습니다.
    -   `IntersectionObserver`를 활용하여 뷰포트 진입 시 애니메이션이 시작되며, 완료 후 커서가 깜빡이다 사라집니다.

#### E. File System & Backup
-   **Legacy**: 기존 `index.html` 및 자산은 `_legacy` 폴더에 백업.
-   **Public Assets**: 이미지와 폰트는 `public/` 디렉토리로 이동하여 Next.js 정적 서빙 최적화.

#### F. MiniGame (Vector Defense) [Updated 2026-02-16]
-   **Concept**: 포트폴리오의 정적 요소를 보완하고 체류 시간을 늘리기 위한 이스터 에그(Easter Egg) 성격의 미니게임. Hero 섹션 우측 공간을 활용.
-   **Handover Split**: 미니게임 구현/피드백/후속 과제를 `handover-minigame.md`로 분리 관리.
-   **Tech Specs**:
    -   **Engine**: HTML5 Canvas API + `requestAnimationFrame` (고성능 렌더링).
    -   **State Management**: `useRef`를 사용하여 리렌더링 없이 60fps 게임 루프 유지.
    -   **Interaction**: `MouseEvent`를 직접 바인딩하여 마우스 추적 및 발사 처리. `mouseup`은 `window` 레벨에서 감지하여 클릭 상태 유실 방지.
    -   **Theme Caching**: `MutationObserver`로 `data-theme` 변경 감지 후 캐싱 (매 프레임 DOM 쿼리 제거).
-   **Features**:
    -   **Gameplay**: 화면 양측에서 랜덤하게 생성되어 움직이는 타겟을 클릭하여 요격. 히트박스 관대화(+7) 및 첫 클릭 즉시 발사 보장.
    -   **Visuals**: 점선 링, 회전하는 사각형, 파티클 폭발 등 'Vector Monitor' 스타일의 레트로-퓨처리스틱 디자인.
    -   **Feedback**: 
        -   타겟 피격 시 밀려나는 **Knockback** 물리 효과 적용.
        -   **Interactive Crosshair**: 평상시엔 열려있고, 사격 시 수축하는 애니메이션 (Framer Motion).
        -   **Dynamic UI**: 게임 영역 호버 시 은은하게 나타나는 코너 브래킷 및 테두리.
        -   **Screen Shake**: 타겟 파괴 시 캔버스 미세 흔들림 (3px 강도, 빠른 감쇠).
        -   **Hit Flash**: 피격 시 작은 원형 플래시, 파괴 시 큰 플래시 (흰색, 5프레임 감쇠).
        -   **Kill Popup**: 파괴 시 "+1" 텍스트가 표시 후 좌우로 흩어지며 페이드아웃.
        -   **Pitch Variation**: 사격음의 기본 주파수(800Hz)에 ±60Hz 랜덤 변동 적용.
    -   **Score**: 'TARGET TERMINATED' 카운터가 좌측 하단에 실시간 업데이트.
    -   **Audio**: 사격음(Triangle wave) 및 파괴음(Sawtooth wave) 구현. 뮤트 토글 지원.
    -   **Enemy System (v2)**:
        -   단일 타겟 기반에서 `EnemyGroup + EnemyUnit` 구조로 확장.
        -   연결체(2/3) + 애벌레(3~5) + 분리/질량/방어력(+2) 규칙 1차 반영.
        -   맵 최대 개체수를 "그룹 수"가 아닌 "unit 총합(12)" 기준으로 처리.
        -   동적 스폰 주기(35 -> 33 -> 31), 연결체/애벌레 출현 확률(각 3%) 적용.
        -   화면 경계 이탈 방지(반쯤까지만 진입) 적용.
        -   점선 융합 렌더(개별 원형 링 유지 + 연결부 cutout), 분리 시 앵커 재구성, 애벌레 no-flip 스무스 턴/웨이브 강화 반영.
    -   **Stats**: 게임플레이, 디자인 폴리싱, 사운드, 타격감 개선 완료.
    -   **Pending**:
        -   모바일 환경에서의 터치 최적화 (현재는 PC/마우스 중심).
        -   애벌레 오프스크린 완성형 출현 (in-view stretch 제거).
        -   결합 상태 비파괴 피격 시 개체별 충격량 + 회전 토크 기반 넉백.
        -   `MiniGame.tsx` 모듈화 (상세: `handover-minigame.md`).

#### G. Operator Voice System [Updated 2026-02-16]
-   **Voice Assets**: 오퍼레이터 코멘트 25개에 대응하는 보이스 25개를 `WebM(Opus)` + `M4A(AAC)`로 운영.
-   **Playback Rules**:
    -   최초 hover 진입 1회에 한해 200ms 지연 후 코멘트/보이스 시작.
    -   `radio-open(0.2s) -> 50ms gap -> voice` 순차 재생.
    -   hover 반복 진입 시 각 코멘트 보이스는 세션 내 1회만 재생(중복 방지).
    -   hover out 시 UI는 즉시 숨기되, 이미 시작된 보이스는 끝까지 재생.
-   **Mix Policy**:
    -   Operator Voice: `0.30`
    -   Radio Open SFX: `0.22`
    -   Game SFX: `0.70`
-   **Typing Sync**: 구두점 pause 리듬을 유지하면서 클립 duration 기반으로 타이핑 속도를 자동 보정.
-   **Batch Mastering**: `tools/audio-mastering/master-operator-voices.ps1`를 통해 원본 WAV 폴더에서 일괄 마스터링/인코딩 + manifest 생성.

---

## 4. Directory Structure (폴더 구조)
```
/
├── app/
│   ├── layout.tsx       # 전역 레이아웃 (GridBackground, Provider 포함)
│   ├── page.tsx         # 메인 페이지 (각 섹션 조립)
│   └── globals.css      # 전역 스타일 및 Tailwind @theme 설정
├── components/
│   ├── layout/          # 레이아웃 컴포넌트 (GridBackground)
│   ├── sections/        # 페이지 섹션 (Hero, Projects, Music, About)
│   ├── ui/              # 재사용 가능한 UI (ProjectCard, TypewriterText)
│   └── providers/       # Context API (Theme, Throwable)
├── data/
│   └── content.ts       # 모든 텍스트 및 프로젝트 데이터 (JSON 대체)
├── public/
│   ├── images/          # 프로젝트 섬네일 및 에셋
│   ├── fonts/           # 로컬 폰트 파일
│   └── audio/           # 오퍼레이터 보이스/라디오 SFX/manifest
├── tools/
│   └── audio-mastering/ # 보이스 일괄 마스터링 스크립트
├── handover-minigame.md # MiniGame 전용 handover (전투/스폰/렌더/피드백 추적)
└── _legacy/             # (Backup) 기존 포트폴리오 파일
```

---

## 5. Future Improvements (향후 과제)

### 5.1. Short-term Improvements (단기)
-   [ ] **SEO Meta Tags**: `generateMetadata`를 활용하여 Open Graph 및 Twitter Card 설정 고도화.
-   [ ] **Performance Optimization**: `next/image` 컴포넌트 도입을 통한 이미지 최적화 (현재는 애니메이션 이슈로 `<img>` 태그 사용 중).
-   [ ] **Google Analytics**: 방문자 트래킹을 위한 GA4 연동.

### 5.2. Long-term Roadmap (장기)
-   [ ] **Guestbook**: 백엔드(Firebase/Supabase)를 연동한 방명록 기능.
-   [ ] **Blog Integration**: `archive03` 같은 외부 블로그 글을 RSS로 가져와 보여주는 섹션 추가.
-   [ ] **3D Elements**: Three.js / React Three Fiber를 활용한 미묘한 3D 오브젝트 인터랙션 추가.
-   [ ] **Sound Design**: 버튼 클릭이나 호버 시 아주 작은 기계적 SFX(Sound Effects) 추가 고려.

---

## 6. Deployment & Troubleshooting Log (Updated 2026-02-16)

### 6.1. Deployment Strategy (GitHub Pages)
-   **Static Export**: `output: 'export'` 설정을 통해 정적 HTML 생성.
-   **Manual Build Workflow**: `nextjs.yml` 워크플로우를 사용하여 `npm run build`를 직접 실행, `basePath` 충돌 방지.
-   **Asset Paths**: `basePath`('/portfolio')를 고려하여 모든 이미지 경로 앞에 `/portfolio` 접두사를 하드코딩.

### 6.2. Recent Troubleshooting (File Background & Visibility)
**Issue 1: Visibility on Inverted Backgrounds**
-   **Situation**: About 섹션에 배경색 반전(`bg-foreground`, `text-background`)을 적용하자, 내부의 리스트 마커(Bullet points)와 타이핑 커서(Cursor)가 보이지 않게 되었습니다.
-   **Reason**: 해당 요소들이 고정된 색상(`text-foreground` 등)을 사용하고 있어, 반전된 배경색과 동일한 색상이 되어버렸기 때문입니다.
-   **Solution**:
    -   **List Markers**: `marker:text-foreground` -> `marker:text-current`로 변경하여 부모(Wrapper)의 텍스트 색상을 상속받도록 수정.
    -   **Typewriter Cursor**: `bg-foreground` -> `bg-current`로 변경하여 배경색과 대비되는 텍스트 색상을 따르도록 수정.

**Issue 2: Path Issues**
-   **Situation**: 배포 시 404 에러 및 이미지 깨짐 현상 발생.
-   **Solution**: `trailingSlash: true` 설정 및 `layout.tsx` 내 파비콘 경로 절대 지정(`/portfolio/...`)으로 해결.

### 6.3. MiniGame & Operator Interaction Fixes (2026-02-13)
**Issue 3: Hero 텍스트가 게임 영역과 겹쳐 클릭 이벤트 가로채기**
-   **Situation**: 게임 영역 클릭 시 좌측 타이틀/소개글이 선택되거나 드래그되는 현상.
-   **Reason**: Hero의 텍스트 컨테이너(`motion.div`, `z-10`)가 투명 배경으로 게임 영역(`z-0`) 위를 덮고 있었음.
-   **Solution**: `Hero.tsx`에서 텍스트 래퍼에 `pointer-events-none`, 하위 요소에 `pointer-events-auto` + `select-none` 적용.

**Issue 4: 클릭(발사) 상태가 의도치 않게 해제되는 버그**
-   **Situation**: 마우스를 누른 채 게임 중 클릭이 풀려 발사가 멈추는 현상.
-   **Reason**: `mouseup`이 컨테이너(`container`)에만 바인딩되어 있었고, `mouseleave` 시 `isMouseDown`을 `false`로 강제 리셋했기 때문.
-   **Solution**:
    -   `mouseup` → `window` 레벨로 이동하여 어디서든 정확히 감지.
    -   `mouseleave`에서 `isMouseDown` 리셋 제거 (hover 상태만 갱신).
    -   `contextmenu` 이벤트 억제로 우클릭에 의한 상태 꼬임 방지.
    -   익명 `mouseenter` 핸들러를 명명 함수로 교체하여 cleanup 시 정상 제거 (메모리 누수 수정).

**Issue 5: 타겟 간 겹침/접촉 표현 부자연스러움 (2026-02-13 late update)**
-   **Situation**: 타겟 밀집 구간에서 중심부가 겹쳐 보이며 물리 접촉 없이 클리핑된 것처럼 보이는 현상.
-   **Reason**:
    -   타겟-타겟 충돌 해석 단계가 루프에 없었음.
    -   스폰 시 초기 위치가 가까워 즉시 겹치는 케이스가 있었음.
-   **Solution**:
    -   타겟 간 충돌 해석(질량 기반 위치 보정 + 노멀 임펄스 + 약한 접선 감쇠) 추가.
    -   스폰 시 overlap 재시도 로직 추가.
    -   강한 튕김 대신 약한 겹침 허용 정책으로 유기적 움직임 유지.
-   **Result**:
    -   중심부 하드 스택 현상 감소.
    -   접촉이 "겹침"이 아닌 "충돌"처럼 읽히도록 개선.

**Issue 6: 페이스/피격 가독성 부족 (2026-02-13 late update)**
-   **Situation**: 전반 속도가 약간 느리고, 연타 피격 시 타겟 상태 변화 가시성이 약한 문제.
-   **Reason**:
    -   기본 속도 분포가 보수적으로 설정됨.
    -   피격 피드백이 순간성(파티클/플래시) 위주여서 지속 신호가 약함.
-   **Solution**:
    -   전체 타겟 기본 속도 약 10% 상향.
    -   희귀 스피드스터(8%, 약 1.5x) 추가.
    -   탄 방향 기반/질량 스케일 knockback으로 피격 반응 재구성.
    -   피격 시 내부 스퀘어 회전 방향을 매 타격마다 반전.
-   **Result**:
    -   템포가 더 살아나고, 연속 사격 중 피격 인지가 개선됨.

**Issue 7: Operator 코멘트가 첫 글자 출력 후 멈춤 (2026-02-13)**
-   **Situation**: 코멘트가 첫 글자 출력 후 정지하고, hover out/in 이후에만 재개되는 현상.
-   **Reason**:
    -   렌더 재실행 시 effect cleanup이 타이핑 timeout을 지워 타이핑 체인이 끊김.
    -   `isTypingRef`가 `true`로 남아 재시작 가드에 걸림.
-   **Solution**:
    -   `components/ui/OperatorComments.tsx` 타이머 상태머신 분리/재작성.
    -   타이핑 루프와 완료 전환(깜빡임 -> 페이드 -> 다음 문장)을 분리.
    -   timeout ref를 채널별로 분리하고 통합 cleanup 적용.

**Issue 8: 완료 후 커서 깜빡임만 유지되고 페이드아웃 실패 (2026-02-13)**
-   **Situation**: 문장 완료 후 커서만 깜빡이며 다음 문장으로 넘어가지 않는 케이스 발생.
-   **Reason**:
    -   완료 전환 타이밍이 타이핑 클로저와 결합되어 타이머 체인이 불안정.
    -   hover 조건/가시성 제어와 전환 타이머가 간헐적으로 desync.
-   **Solution**:
    -   완료 전환을 `isComplete` 기반 별도 effect로 분리.
    -   hover를 단일 visibility gate로 고정:
        -   hover on: 코멘트 표시 + 상태머신 진행
        -   hover off: 즉시 숨김 + 모든 타이머 정리
-   **Result**:
    -   정상 시퀀스 보장: 타이핑 -> 커서 깜빡임 -> 페이드아웃 -> 다음 문장.
    -   hover out 시 코멘트 즉시 비표시.

**Issue 9: Operator 보이스 중복/겹침 재생 (2026-02-16)**
-   **Situation**: hover 반복 진입 시 동일 보이스가 다시 재생되거나 radio SFX와 겹쳐 재생되는 현상.
-   **Reason**: 코멘트 시작/오디오 재생의 트리거 경계가 분리되어 동시 실행 가능성이 있었음.
-   **Solution**:
    -   코멘트 인덱스 기반 1회 재생 Set 도입.
    -   재생 순서를 `radio-open -> 50ms gap -> voice`로 고정.
    -   최초 hover 진입 1회 200ms 지연 규칙 추가.

**Issue 10: Tactical 마스터링 후 보이스 무음 수준 출력 (2026-02-16)**
-   **Situation**: 파일 재생 시 거의 소리가 들리지 않는 현상.
-   **Reason**: 과도한 필터 조합으로 출력 레벨이 과감쇠.
-   **Solution**:
    -   Tactical 전용 체인을 분리하고 출력 레벨이 안정적인 조합으로 재설계.
    -   전체 25클립 재인코딩 후 레벨 검증.

**Issue 11: Operator 보이스가 SFX 대비 과도하게 크게 들림 (2026-02-16)**
-   **Situation**: 보이스가 게임 SFX보다 전면으로 튀는 문제.
-   **Solution**:
    -   runtime voice volume `0.30`으로 하향.
    -   game SFX `0.70` 기준 유지.

### 6.4. MiniGame Fused Enemy Expansion (2026-02-16)
**Issue 12: 연결체/애벌레 타입 확장 및 맵 규칙 개편**
-   **Situation**: Hero 미니게임이 단일 원형 타겟 기반이라 개체 연결/분리 규칙을 표현할 수 없었음.
-   **Solution**:
    -   `EnemyGroup + EnemyUnit` 구조로 리팩터링.
    -   연결체(2/3) 및 애벌레(3~5) 스폰/분리/질량/피격 반응/점수 로직 추가.
    -   최대 개체수 12, 스폰율 상향, 연결체/애벌레 저확률(각 3%) 반영.
    -   화면 경계 밖 이탈 방지 정책 적용.
-   **Result**: 플레이 밀도와 타겟 다양성 개선, 전투 템포 강화.

**Issue 13: 유저 검수 기반 정밀 폴리싱 2차 반영 (2026-02-16)**
-   **Situation**:
    -   점선 융합 렌더가 오버레이 느낌으로 보여 의도와 차이.
    -   애벌레 분리 시 2개체 전환에서 순간 좌표 점프.
    -   애벌레 벽 접촉 시 flip처럼 읽히는 부자연스러운 턴.
-   **Solution**:
    -   개별 원형 점선 링을 유지하고 연결부를 기하 cutout으로 처리하는 렌더로 교체.
    -   파괴 직전 월드 앵커 기반 `reanchor` 재구성으로 분리/축소 프레임 안정화.
    -   애벌레 턴을 목표 heading 기반 점진 회전(no-flip)으로 변경하고 턴 각/속도/쿨다운 튜닝.
    -   애벌레 wave 진폭/세로 sway를 증대해 뱀형 크롤링 체감 강화.
-   **Result**:
    -   사용자 검수 기준으로 애벌레 움직임/렌더 방향성은 만족 상태.
    -   세부 남은 과제는 `handover-minigame.md`의 next tasks로 이관.

---

## 7. Maintenance Guide (유지보수)

### How to Update Content
모든 텍스트와 프로젝트 데이터는 [data/content.ts](file:///c:/Users/%EC%95%BC%EC%B0%A8%EC%99%84/Desktop/Portfolio%202/data/content.ts) 파일에 정의되어 있습니다.
-   **새 프로젝트 추가**: `projects` 배열에 객체를 추가합니다. **주의**: 썸네일 경로에 반드시 `/portfolio` 접두사를 포함해야 합니다.
-   **소개글 수정**: `about` 객체의 내용을 수정하면 `TypewriterText`에 자동 반영됩니다.

### How to Modify Theme
[tailwind.config.ts](file:///c:/Users/%EC%95%BC%EC%B0%A8%EC%99%84/Desktop/Portfolio%202/tailwind.config.ts) 및 [app/globals.css](file:///c:/Users/%EC%95%BC%EC%B0%A8%EC%99%84/Desktop/Portfolio%202/app/globals.css)에서 색상 변수(`--background`, `--foreground`)를 수정하여 전체 테마를 변경할 수 있습니다.
