# Portfolio Redesign Project: Master Planning Document 2.1
**Project**: Portfolio 2026 (Refactoring)
**Author**: Antigravity (Collaborating with Yakshawan)
**Last Updated**: 2026-02-16

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

#### B. Project Gallery (The Scanning Effect)
-   **Thumbnail Logic**: 2:1 비율의 이미지를 1:1 비율 컨테이너에 표시.
-   **Hover Interaction**: 배경 이미지의 채도를 낮췄다가 호버 시 컬러가 복원되며 이미지가 좌우로 부드럽게 패닝(Panning)되는 스캐닝 애니메이션 적용.

#### C. MiniGame (Vector Defense)
-   **Concept**: 포트폴리오의 정적 요소를 보완하는 이스터 에그 게임.
-   **Visuals**: 'Vector Monitor' 스타일의 레트로-퓨처 디자인. 입자 폭발, 화면 흔들림(Screen Shake), 피격 플래시 등 시각적 피드백 강화.
-   **Audio**: Triangle/Sawtooth 파형을 사용한 합성 사운드 구현 및 고유한 피치 변동 시스템 적용.

#### D. Operator System (Updated: 2026-02-16)
미니게임 플레이 중 나타나는 오퍼레이터 코멘트/보이스 시스템을 고도화했습니다.
-   **Asset Optimization**: 프로필 이미지는 **WebP** 유지, 보이스는 `WebM(Opus)` + `M4A(AAC)` 듀얼 포맷으로 운영합니다.
-   **Voice Library**: 총 25개 코멘트와 25개 보이스를 1:1 순차 매핑합니다. (`01`~`25`)
-   **Random Selection**: 페이지 진입(새로고침) 시 `operator01` ~ `operator04` 중 한 명이 랜덤 선택되어 세션 중 고정됩니다.
-   **Silhouette Exception**: `operator04`는 실루엣 형태이므로 눈 깜빡임 애니메이션이 자동으로 비활성화됩니다.
-   **Profile Rendering**:
    -   배경/텍스트 컬러 상속을 위한 **Masking 기법** 사용 (WebP 기반).
    -   **Aspect Ratio**: 2:3 비율, 텍스트 2행 높이(2.5rem) 수평 배치 적용.
-   **Dialogue State**: 노출 2초 / 일반 공백 4초 / 사이클 종료 공백 6초 규칙 유지.
-   **Voice Trigger Policy**:
    -   최초 hover 진입 1회에 한해 `200ms` 시작 지연.
    -   재생 순서: `radio-open(200ms) -> 50ms gap -> voice start`.
    -   동일 세션 내 각 보이스는 1회만 재생 (hover 반복 시 중복 재생 금지).
    -   hover out 시 UI는 즉시 숨기되, 이미 시작된 보이스는 끝까지 재생.
-   **Mix Policy**:
    -   Operator Voice: `0.30`
    -   Radio Open SFX: `0.22`
    -   Game SFX (shoot/hit): `0.70`
-   **Typing Sync**:
    -   마침표/물음표/쉼표 기반 pause 리듬 유지.
    -   클립 duration metadata를 기반으로 기본 타이핑 속도 자동 보정.

---

## 4. Directory Structure (상세 폴더 구조)

본 프로젝트는 Next.js의 App Router 구조를 따르며, 컴포넌트의 관심사에 따라 엄격하게 분리되어 있습니다.

```text
/
├── app/                        # Next.js App Router Core
│   ├── globals.css             # 전역 스타일 및 Tailwind 디렉티브
│   ├── layout.tsx              # 최상위 레이아웃 (Font 설정, Context Provider 포함)
│   └── page.tsx                # 메인 한 페이지 (Single Page Interface)
│
├── components/                 # React 컴포넌트 계층
│   ├── layout/                 # 전역 레이아웃 요소
│   │   └── GridBackground.tsx  # 배경 그리드 망 및 마우스 추적 글로우 효과
│   ├── providers/              # Context Providers (ThemeProvider 등)
│   ├── sections/               # 페이지를 구성하는 대단위 섹션
│   │   ├── Hero.tsx            # 헤더 및 메인 인트로 섹션
│   │   ├── About.tsx           # 자기소개 및 역량 설명 섹션
│   │   ├── Projects.tsx        # 프로젝트 갤러리 리스트 섹션
│   │   └── Music.tsx           # 음악/오디오 관련 섹션
│   └── ui/                     # 재사용 가능한 마이크로 컴포넌트
│       ├── MiniGame.tsx        # 벡터 디펜스 미니게임 코어 로직
│       ├── OperatorComments.tsx # [오늘의 작업] 오퍼레이터 코멘트 & 눈 깜빡임 로직
│       ├── ProjectCard.tsx     # 프로젝트 개별 카드 UI (스캐닝 효과 포함)
│       ├── ScrambleText.tsx    # 텍스트 스크램블 효과 컴포넌트
│       ├── TypewriterText.tsx  # 타이핑 애니메이션 텍스트 컴포넌트
│       ├── DecorativeSymbol.tsx # 배경/장식용 기호 요소
│       └── SquircleTopBorder.tsx # About 섹션 등의 곡면 상단 보더 UI
│
├── data/                       # 정적 데이터 소스
│   └── content.ts              # 프로젝트 정보, 대사 목록 등 통합 관리
│
├── public/                     # 정적 자산 (Assets)
│   ├── fonts/                  # 웹 폰트 파일 (Playfair Display, JetBrains Mono 등)
│   ├── images/
│   │   └── operator/           # 오퍼레이터 WebP 자산 (01~04번)
│   └── audio/
│       └── operator/           # 오퍼레이터 보이스(WebM/M4A), radio-open SFX, manifest.json
│
├── tools/
│   └── audio-mastering/
│       └── master-operator-voices.ps1 # Supertonic 원본 일괄 마스터링/인코딩 배치
│
├── handover 2.0.md             # [최신] 프로젝트 마스터 핸드오버 문서(문서 버전 2.1)
└── next.config.mjs             # Next.js 설정 (Images, Path Aliases 등)
```

---

## 5. Troubleshooting Log (최근 해결한 문제)

### [Operator UI & Animation]
-   **눈 깜빡임 시 흔들림(Jitter) 문제**: 초기 버전에서 `key` 값을 랜덤하게 바꿔 리마운트하던 방식을 폐기. `open`/`close` 두 레이어를 모두 렌더링하고 `opacity`를 토글하여 위치 오차를 0픽셀로 조정함.
-   **배치 및 가독성 불균형**: 수직 배치가 짧은 대사 출력 시 공백을 과하게 만든다는 피드백 반영. 다시 수평(좌우) 배치로 복구하되, 이미지 높이를 3행에서 2행 크기로 줄여 텍스트와의 시각적 위계(Visual Hierarchy)를 맞춤.
-   **컬러 매칭**: 이미지가 배경과 따로 노는 현상을 해결하기 위해 `grayscale` 필터 대신 `WebkitMaskImage`를 사용. 텍스트의 `color`와 `opacity`를 100% 동일하게 공유하도록 설계.

### [Operator Voice & Audio Pipeline] (2026-02-16)
-   **Issue: hover 반복 시 보이스 중복/겹침 재생**
    -   **Reason**: 코멘트 표시와 음성 재생이 분리되어 있어 hover 재진입 시 재트리거가 발생.
    -   **Fix**: 인덱스 기반 1회 재생 Set + 시작 지연 시퀀스(200ms/50ms)로 상태머신 통합.
-   **Issue: radio SFX와 보이스가 동시 재생되어 겹침**
    -   **Fix**: 동시 재생 제거 후 `radio-open -> gap -> voice` 순차 타이머로 강제.
-   **Issue: Tactical 체인 과적용으로 출력이 무음에 가까워짐**
    -   **Reason**: 대역/필터 조합 충돌로 신호 레벨이 과도 감쇠됨.
    -   **Fix**: Tactical 전용 체인을 분리하고 출력 레벨 안정화(정상 peak 레벨 복구) 후 재인코딩.
-   **Issue: 보이스가 SFX 대비 너무 선명하고 크게 들림**
    -   **Fix**: bitcrush 강화(`bits=8`, `mix=0.45`) + runtime voice volume `0.30`으로 조정.

---

## 6. Future Roadmap

-   **Operator Expansion**: 현재 04번까지의 프로필이 적용 완료되었습니다. 실루엣 형태인 04번을 제외한 01~03번은 정교한 눈 깜빡임 로직이 활성화되어 있습니다.
-   **Mobile Optimization**: 현재 PC/마우스 중심인 미니게임 및 인터랙션을 터치 환경에 최적화.
-   **Sound Design**: 오퍼레이터 메시지 출력 시 미묘한 기계적 SFX 추가 고려.
