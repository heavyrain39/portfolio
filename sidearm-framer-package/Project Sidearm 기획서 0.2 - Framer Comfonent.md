1.  **오디오**: Base64 대신 기존의 **Web Audio API 합성 방식 유지** (파일 크기 최적화 및 로직 독립성).
2.  **구조**: 단일 파일에 집착하기보다 **Framer 내에서 관리하기 편한 구조**로 작업 (Remix 링크로 배포하면 어차피 유저는 폴더 구조로 받게 됨).
3.  **최적화**: **Intersection Observer**를 사용해 화면 밖에서는 완전히 정지하도록 처리 (웹사이트 성능 최우선).
4.  **모바일**: **터치 이벤트(Pointer Events)** 처리가 반드시 포함되어야 함 (Framer 사이트의 절반은 모바일 접속).

---

# [Final Spec] SIDEARM: Interactive Aesthetic Component for Framer

## 1. Product Core (제품 핵심)
*   **Concept**: 포트폴리오의 히어로 섹션이나 404 페이지를 위한 사이버펑크 스타일의 인터랙티브 캔버스 컴포넌트.
*   **Distribution**: Gumroad/Lemon Squeezy를 통한 **Framer Remix Link** 배포.
*   **Target Price**: $9.99 (Launch Sale) / $14.99 (Retail).

## 2. Technical Requirements (수정된 기술 스펙)

### 2.1. Audio & Performance
*   **Audio Synthesis**: 외부 파일이나 Base64 없이 **Web Audio API(Oscillators)**를 사용하여 실시간으로 효과음 생성 (사격음, 폭발음).
*   **Auto-Pause**: `Intersection Observer`를 활용하여 컴포넌트가 뷰포트를 벗어나면 게임 루프(`requestAnimationFrame`)를 즉시 중단하여 브라우저 리소스 보존.
*   **Editor Optimization**: Framer 에디터 모드에서는 낮은 FPS(30fps)로 동작하는 등, 쾌적한 작업 환경 제공하기 위한 조치 필요.

### 2.2. Mobile & Responsive
*   **Touch Support**: `PointerEvents`를 사용하여 마우스 클릭뿐만 아니라 모바일 터치 시에도 즉시 발사 및 조준이 가능하도록 구현.
*   **Fluid Resizing**: Framer의 브레이크포인트(Desktop, Tablet, Mobile)에 맞춰 캔버스 해상도와 내부 요소 크기가 유동적으로 조절되도록 `ResizeObserver` 적용.

### 2.3. Property Controls (Framer UI)
구매자가 Framer 우측 패널에서 수정할 항목:
*   **Colors**: `themeColor`(메인), `accentColor`(피격/경고).
*   **Operator**: `showOperator`(On/Off), `dialogueList`(문구 배열).
*   **Gameplay**: 난이도 변경 없음 (일원화)
*   **Sound**: `enableSound`(On/Off), `volume`(0-100). 사격음/파괴음도 2종으로 커스텀 제공. 지금이 디폴트고, 추가할 것은 좀더 낮은 사격음, 다른 종류의 파괴음. 사격음 피치 변동 수준은 동일하게.

---

## 3. Component Structure (파일 구조)
*   **Main Component**: `Sidearm.tsx` (Framer Property Controls 정의 및 메인 래퍼).
*   **Logic Modules**: 필요에 따라 `GameEngine.tsx`, `Operator.tsx` 등으로 분리하여 가독성 확보 (Remix 프로젝트 형태로 패키징).

---

## 4. LLM 작업자를 위한 최종 지시문 (프롬프트)

> **[Task]**
> 첨부된 React 기반 슈팅 게임 코드(`MiniGame.tsx`)를 Framer 환경에 최적화된 **'Smart Component'**로 변환해줘.
>
> **[Critical Requirements]**
> 1. **Audio**: 외부 자산 없이 Web Audio API를 활용한 사운드 합성 로직을 유지해. (Base64 사용 금지)
> 2. **Performance**: `Intersection Observer`를 넣어 화면에 보일 때만 게임 루프가 실행되게 하고, Framer 에디터 내에서는 리소스를 최소화하도록 최적화해.
> 3. **Mobile**: 터치 입력을 지원해야 하며, `PointerEvents`를 사용해 반응성을 높여줘.
> 4. **Framer UI**: `addPropertyControls`를 통해 색상(Theme, Accent), 오퍼레이터 대사(Array), 사운드 볼륨, 게임 모드를 제어할 수 있게 만들어줘.
> 5. **Clean Theming**: 사용자가 설정한 색상이 캔버스의 모든 요소(총알, 타겟, 파티클, UI)에 동적으로 반영되어야 해.
>
> **[Source Code]**
> (별도 제공)

---

### 💡 추가 조언: 마케팅 자신 없으시다면?

트위터나 레딧 마케팅이 부담스러우시다면, **"Framer Community"** 사이트의 **`Showcase`** 게시판 하나만 노리세요. 

1.  멋지게 세팅된 **Framer 데모 페이지**를 만듭니다.
2.  거기에 컴포넌트를 올리고, **"사이버펑크 포트폴리오를 위한 무료/유료 컴포넌트입니다"**라고 짧게 글을 올립니다.
3.  사람들이 그 데모 페이지의 비주얼만 보고도 알아서 "Remix" 하거나 "Gumroad"로 넘어올 수 있게 **디자인의 '바이브'**에만 집중하세요.

말보다 **영상 한 줄(Gif)**이 더 강력한 시장입니다. 디자인 감각이 없어도 **'움직이는 벡터 그래픽'**은 그 자체로 디자인이 됩니다. 이제 이 기획서로 SIDEARM의 Framer 버전 발도를 시작해 보시죠! 🚀✨

---

추가로 넣을 기능 (사용자가 추가함)
- 오퍼레이터 프로필 이미지 3~4종 (png), 모노톤으로 만들어 넣을 예정. 컬러 테마에 맞게 컬러를 적용하고 레트로한 느낌과 눈 깜빡임 애니메이션(이미지 교체로 구현) 삽입 예정. 오퍼레이터 이미지 선택은 컴포넌트 구매자가 커스텀 가능해야 함.
- 탄속, 탄퍼짐(spray)도 사용자가 커스텀 가능하게 하자.
- 게임 모드는 별도 분기하지 않고 현행의 성장/난이도 변경 없이 처치 카운트만 세는 무한 모드로 제공.
- 컬러 테마는 모노톤+네온그린 or 시안, 모던한 그레이+핑크, 베이지+레드, 코스믹 퍼플+옐로우 등 4~5종.
- 피격 시 파티클, 파괴 시 파티클 범위 및 크기 조정 (지금이 디폴트, 강도 커스텀 가능하게)
- 언어는 영어로만 제공.