# Portfolio Redesign Project: Master Planning Document
**Project**: Portfolio 2026 (Refactoring)
**Author**: Antigravity (Collaborating with Yakshawan)
**Last Updated**: 2026-02-13

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
-   **정적(Static)과 동적(Dynamic)의 조화**: 평소에는 차분하고 정적인 문서처럼 보이지만, 인터랙션 시 생동감 있는 피드백 제공.

### 2.2. Design System
#### Typography
-   **Headline (Serif)**: 우아하고 권위 있는 인상을 주는 세리프체. (e.g., `Playfair Display`)
-   **Body (Sans)**: 가독성을 최우선으로 투명하게 정보를 전달. (e.g., `Inter`, `Pretendard`)
-   **Data/Meta (Mono)**: 기술적 디테일과 시스템 로그 느낌을 전달. (e.g., `JetBrains Mono`)
    -   *활용 예시*: 좌표값(`37°33'59.0"N`), 시스템 ID, 날짜, 태그 등.

#### Color Palette & Theme
-   **Automatic Theming**: 시간대(08:00 ~ 17:00)에 따라 라이트/다크 모드 자동 전환.
-   **Reduced Contrast**: 완전한 블랙(#000)이나 화이트(#FFF)를 지양하고, 눈이 편안한 `Off-White`(#f5f5f0)와 `Deep Charcoal`(#1a1a1a) 사용.
-   **Opacity Layering**: 투명도(Opacity)를 적극 활용하여 깊이감(Depth)과 계층 구조 표현.

#### Layout & Grid
-   **Grid Background**: 배경에 옅은 모눈종이(Grid)와 거대한 동심원(Radar/Sonar)을 배치하여 공학적/분석적 분위기 조성.
-   **Crosshair**: 화면 중앙을 가로지르는 십자선(Crosshair)으로 시선의 중심을 잡음.

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
-   **Thumbnail Logic**:
    -   **원본**: 2:1 비율(800x400)의 가로로 긴 이미지.
    -   **표시**: 1:1 비율(Square)의 컨테이너.
-   **Interaction**:
    -   **Idle (기본 상태)**: `Grayscale` + `Saturate(0.2)` + `Contrast(1.1)` + 정지 상태. 차분하고 통일된 톤 유지.
    -   **Hover (활성 상태)**: 컬러 복원 + 밝기 증가 + **Scanning Animation**.
    -   **Animation**: 이미지가 컨테이너 내부에서 좌우로 부드럽게 왕복 이동(Panning)하며 숨겨진 영역을 보여줌. 이는 "창을 통해 프로젝트를 탐색하는" 경험을 제공.

#### C. Auditory Log (Music Section)
-   **Horizontal Scroll**: 마우스 휠이 아닌, 가로 스크롤/터치 스와이프를 통한 탐색 경험.
-   **YouTube Integration**: 커스텀 플레이어 대신 `iframe`을 직접 사용하여 실제 조회수 집계 및 플랫폼 아이덴티티 유지.

#### D. Entity Profile (About Section)
-   **Scramble Text Effect**: "이야기와 기술의 교차점." 문구가 뷰포트에 진입할 때 무작위 문자열에서 의미 있는 문장으로 변환되는 사이버네틱 연출 (`IntersectionObserver` 활용).
-   **Semantic Markup**: 경력 사항과 소개글을 시맨틱 태그로 구조화.

#### E. File System & Backup
-   **Legacy**: 기존 [index.html](file:///c:/Users/%EC%95%BC%EC%B0%A8%EC%99%84/Desktop/Portfolio%202/index.html) 및 자산은 `_legacy` 폴더에 백업.
-   **Public Assets**: 이미지와 폰트는 `public/` 디렉토리로 이동하여 Next.js 정적 서빙 최적화.

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
│   ├── ui/              # 재사용 가능한 UI (ProjectCard, ScrambleText)
│   └── providers/       # Context API (ThrowableProvider)
├── data/
│   └── content.ts       # 모든 텍스트 및 프로젝트 데이터 (JSON 대체)
├── public/
│   ├── images/          # 프로젝트 섬네일 및 에셋
│   └── fonts/           # 로컬 폰트 파일
└── _legacy/             # (Backup) 기존 포트폴리오 파일
```

---

## 5. Future Improvements (향후 과제)

### 5.1. Short-term Improvements (단기)
-   [ ] **SEO Meta Tags**: `generateMetadata`를 활용하여 Open Graph 및 Twitter Card 설정 고도화.
-   [ ] **Performance Optimization**: `next/image` 컴포넌트 도입을 통한 이미지 최적화 (현재는 애니메이션 이슈로 `<img>` 태그 사용 중, 최적화 방안 모색 필요).
-   [ ] **Google Analytics**: 방문자 트래킹을 위한 GA4 연동.

### 5.2. Long-term Roadmap (장기)
-   [ ] **Guestbook**: 백엔드(Firebase/Supabase)를 연동한 방명록 기능.
-   [ ] **Blog Integration**: `archive03` 같은 외부 블로그 글을 RSS로 가져와 보여주는 섹션 추가.
-   [ ] **3D Elements**: Three.js / React Three Fiber를 활용한 미묘한 3D 오브젝트 인터랙션 추가 (성능 저하 주의).
-   [ ] **Sound Design**: 버튼 클릭이나 호버 시 아주 작은 기계적 SFX(Sound Effects) 추가 고려 (음소거 옵션 필수).
- [x] **Deploy to GitHub Pages**: GitHub Actions를 통한 자동 배포 및 정적 호스팅 환경 구축 완료 (2026-02-13).

---

## 6. Deployment & Troubleshooting Log (2026-02-13 Update)

### 6.1. GitHub Pages Configuration
GitHub Pages 배포 성공을 위해 다음과 같은 설정을 적용했습니다.
1.  **Static Export**: `next.config.mjs`에 `output: 'export'` 설정 추가.
2.  **Manual Build Workflow**: GitHub Actions의 자동 설정(`configure-pages`) 대신 `npm run build`를 직접 실행하는 수동 워크플로우(`nextjs.yml`) 채택. 이는 자동 설정이 커스텀 `basePath`와 충돌하는 문제를 방지합니다.
3.  **Branch Configuration**: 리포지토리의 기본 브랜치가 `master`인 경우, 워크플로우의 트리거 브랜치도 `master`로 일치시켜야 합니다.

### 6.2. Path Issues & Solutions (Lessons Learned)
배포 과정에서 발생한 경로 문제와 해결책입니다.
-   **404 Error**: `next.config.mjs`에 `trailingSlash: true`를 추가하여 경로 끝에 `/`를 붙이지 않으면 페이지를 찾지 못하는 문제를 해결했습니다.
-   **Favicon**: `app/layout.tsx`의 메타데이터에 `/portfolio/images/favicon.png`와 같이 리포지토리 이름이 포함된 절대 경로를 명시해야 합니다.
-   **Image Assets**:
    -   Next.js의 하위 경로(`basePath: '/portfolio'`) 설정이 정적 HTML의 `<img>` 태그나 CSS 배경 이미지에는 자동으로 적용되지 않습니다.
    -   **Solution**: `content.ts` 내의 모든 이미지 경로 앞에 `/portfolio` 접두사를 하드코딩(Hard-coding)하여 해결했습니다. (`next/image` 컴포넌트 사용 시에도 외부 데이터 소스의 경로는 명시적이어야 안전합니다.)

### 6.3. UX Optimization (Apparent Speed)
초기 디자인의 "답답함"을 해소하기 위해 애니메이션 속도를 전반적으로 상향 조정했습니다.
-   **Snappy Feel**: `framer-motion`의 `duration`을 절반 수준(0.8s -> 0.4s)으로 단축하고, `easeOut` 또는 `spring` 효과를 강화하여 민첩한 반응성을 구현했습니다.
-   **Typewriter**: 타이핑 효과 속도를 30ms에서 15ms로 단축하여 지루함을 제거했습니다.

---

## 7. Maintenance Guide (유지보수)

### How to Update Content
모든 텍스트와 프로젝트 데이터는 [data/content.ts](file:///c:/Users/%EC%95%BC%EC%B0%A8%EC%99%84/Desktop/Portfolio%202/data/content.ts) 파일에 정의되어 있습니다.
-   **새 프로젝트 추가**: `projects` 배열에 객체를 추가합니다. **주의**: 썸네일 이미지 경로에 반드시 `/portfolio` 접두사를 포함해야 합니다. (e.g., `/portfolio/images/new_project.png`)
-   **음악 추가**: `musicAlbums` 또는 `electronicMusic` 배열에 YouTube ID를 추가하세요.

### How to Modify Theme
[tailwind.config.ts](file:///c:/Users/%EC%95%BC%EC%B0%A8%EC%99%84/Desktop/Portfolio%202/tailwind.config.ts) 및 [app/globals.css](file:///c:/Users/%EC%95%BC%EC%B0%A8%EC%99%84/Desktop/Portfolio%202/app/globals.css)에서 색상 변수(`--background`, `--foreground` 등)를 수정하여 전체 테마를 변경할 수 있습니다.
