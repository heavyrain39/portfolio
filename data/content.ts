export interface Project {
    id: string;
    title: string;
    enTitle: string;
    lastUpdated: string;
    concept: string;
    enConcept?: string;
    description: string;
    enDescription?: string;
    techStack: string[];
    link?: string;
    linkText?: string;
    enLinkText?: string;
    secondaryLink?: string;
    secondaryLinkText?: string;
    enSecondaryLinkText?: string;
    thumbnail: string;
    category: "vibe-coding" | "web-app" | "game" | "other";
}

export interface MusicItem {
    id: string;
    title: string;
    youtubeId: string;
}

export const heroContent = {
    headline: "야차완 | 夜叉腕",
    introduction: "안녕하세요. 이곳은 작가, 바이브 코더, 기획자인 야차완의 포트폴리오 웹페이지입니다. 재미있게 둘러보고 가시면 좋겠습니다. 😙",
    socials: {
        github: "https://github.com/heavyrain39",
        twitter: "https://x.com/yakshawan",
        email: "mailto:ggolem@naver.com"
    }
};

export const projects: Project[] = [
    {
        id: "nimblist",
        title: "님블리스트",
        enTitle: "Nimblist: Minimal Todo List",
        lastUpdated: "2026-03-17",
        concept: "내 브라우저에 들어온 깔끔한 투두 리스트",
        enConcept: "A clean todo list right in your browser",
        description: "크롬 사이드 패널에서 빠르고 쾌적하게 접근할 수 있는 미니멀 & 클린 To-do 앱. 3종 테마와 5종 폰트 프리셋 제공. Google Drive를 활용해 기기간 클라우드 동기화 지원.",
        enDescription: "A minimal and clean to-do app for your Chrome side panel. Features 3 themes and 5 font presets. Supports cloud sync across devices via Google Drive.",
        techStack: ["React 18", "Vite 5", "Framer Motion", "Chrome Extension API", "Google Drive API"],
        link: "https://chromewebstore.google.com/detail/nimblist-minimal-todo-lis/pbihcnodidndjaoilckhhpdbcfjoignl",
        linkText: "사용해 보기",
        enLinkText: "Try it out",
        thumbnail: "/portfolio/images/thumbnail_nimblist.png",
        category: "vibe-coding"
    },
    {
        id: "mstrmnd",
        title: "마스터마인드",
        enTitle: "MSTRMND: Your clever audio mastering ally",
        lastUpdated: "2026-02-23",
        concept: "유튜브 음원을 위한 영리한 마스터링 도구.",
        enConcept: "A clever audio mastering tool for Youtube creators.",
        description: "다수의 트랙을 처리하는 작업자를 위해 만들어진 웹 기반 배치 마스터링 솔루션. 최대 50개 트랙 일괄 처리. 유튜브/스트리밍 최적화 볼륨 세팅과 6개 프리셋, 커스텀 설정 가능. 프로페셔널한 사운드를 무료로, 빠르게 완성하자.",
        enDescription: "A web-based batch mastering solution built for creators who handle multiple tracks. Processes up to 50 tracks at once. Features default Youtube/Streaming volume optimization, 6 presets, and custom settings. Achieve professional sound for free, fast.",
        techStack: ["React 18", "TypeScript", "Vite 5", "Web Audio API", "Web Workers"],
        link: "https://mstr-mnd.vercel.app/",
        linkText: "사용해 보기",
        enLinkText: "Try it out",
        secondaryLink: "https://chromewebstore.google.com/detail/mastermind/amifcacblgkkccoejchknikodagjhopk",
        secondaryLinkText: "크롬 익스텐션",
        enSecondaryLinkText: "Chrome Extension",
        thumbnail: "/portfolio/images/thumbnail_mstrmnd.png",
        category: "vibe-coding"
    },
    {
        id: "iching",
        title: "易: 주역으로 보는 오늘의 운세",
        enTitle: "易: Daily I Ching",
        lastUpdated: "2026-02-20",
        concept: "브라우저에서 즐기는 데일리 주역점",
        enConcept: "Daily I Ching divination in your browser",
        description: "크롬 사이드 패널에서 8면체 주사위를 굴려 64괘 중 하나를 뽑아볼 수 있는 무료 주역점 익스텐션. 매일 빠르고 간편하게 그날의 운세를 확인할 수 있다. 차분한 에디토리얼 UI, 5개 국어 지원.",
        enDescription: "A free I Ching divination extension where you roll an 8-sided die from your Chrome side panel to draw one of 64 hexagrams. Quickly and easily check your daily fortune. Features a calm editorial UI, supporting 5 languages.",
        techStack: ["React 18", "TypeScript", "Vite 5", "Three.js", "Chrome Extension MV3"],
        link: "https://chromewebstore.google.com/detail/leanlpamofllkckfmjiannjefkbbjheb",
        linkText: "사용해 보기",
        enLinkText: "Try it out",
        thumbnail: "/portfolio/images/thumbnail_iching.png",
        category: "vibe-coding"
    },
    {
        id: "takt",
        title: "TAKT",
        enTitle: "Engineered Brown Noise",
        lastUpdated: "2026-02-04",
        concept: "브라우저 속의 브라운 노이즈 엔진",
        enConcept: "Engineered brown noise engine in your browser",
        description: "집중과 숙면을 돕는 고품질 브라운 노이즈가 크롬 브라우저 속에 들어왔다. 디터 람스풍 산업 디자인을 레퍼런스 삼아 80년대 하이엔드 오디오의 물성을 디지털로 재현. 두 종류의 브라운 노이즈와 더불어 빗소리, 천둥, 장작불 소리도 지원한다.",
        enDescription: "High-quality brown noise inside your Chrome browser to help you focus or sleep. Inspired by Dieter Rams' industrial design, digitally recreating the physical presence of 80s high-end audio. Features two types of brown noise, rain, thunder, and campfire sounds.",
        techStack: ["React", "Vite", "Chrome Extension API", "Offscreen API", "Node.js Crypto"],
        link: "https://chromewebstore.google.com/detail/takt/kfgbaeikmjkommheilhphiageempppph",
        linkText: "사용해 보기",
        enLinkText: "Try it out",
        thumbnail: "/portfolio/images/thumbnail_takt.png",
        category: "vibe-coding"
    },
    {
        id: "hanjul",
        title: "한줄한줄: 내 생각의 타임라인",
        enTitle: "Hanjul Hanjul",
        lastUpdated: "2026-03-07",
        concept: "새 탭에서 만나는 나만의 한 줄 기록",
        enConcept: "Your one-line journal upon opening a new tab",
        description: "무의식적인 새 탭 열기를 의식적인 성찰의 순간으로. AI가 읽고 답하는 미니멀한 기록 앱. 크롬 익스텐션을 설치하면 새 탭을 열 때 기록 화면이 나타나고, 세 가지 성격의 AI가 당신의 기록을 읽고 유익한 (혹은 흥미로운) 피드백을 제공한다.",
        enDescription: "Turning the unconscious habit of opening new tabs into a moment of conscious reflection. A minimalist journal app where AI reads and replies. Install the extension, and the journal appears on a new tab. Three unique AI personas read your entries and provide helpful (or interesting) feedback.",
        techStack: ["JavaScript", "Chrome Extension API", "Google Drive API", "Gemini API"],
        link: "https://chromewebstore.google.com/detail/%ED%95%9C%EC%A4%84%ED%95%9C%EC%A4%84-%EB%82%B4-%EC%83%9D%EA%B0%81%EC%9D%98-%ED%83%80%EC%9E%84%EB%9D%BC%EC%9D%B8/daifopgmpjihbacogkoabenddmnkfbdl",
        linkText: "사용해 보기",
        enLinkText: "Try it out",
        thumbnail: "/portfolio/images/thumbnail_hanjul.png",
        category: "vibe-coding"
    },
    {
        id: "haruna",
        title: "하루나 온 스크린",
        enTitle: "Haruna on Screen",
        lastUpdated: "2026-03-07",
        concept: "당신의 데스크탑에 머무는 AI 미소녀",
        enConcept: "An AI screen-mate residing on your desktop",
        description: "PC 바탕화면에 상주하며 사용자와 소통하는 AI 스크린메이트. 사용자와의 모든 대화를 기억하며, 페르소나 프롬프트 에디터로 성격과 기억을 편집할 수 있다. 캐릭터 3종, 의상 10종.",
        enDescription: "An AI screen-mate residing on your desktop to keep you company. She remembers all conversations with you, and you can edit her personality and memories via the persona prompt editor. Features 3 characters and 10 outfits.",
        techStack: ["Electron", "Python (Flask)", "Gemini API", "HTML5/CSS3"],
        link: "https://yakshawan.itch.io/haruna-on-screen",
        linkText: "스토어 페이지",
        enLinkText: "Store Page",
        thumbnail: "/portfolio/images/thumbnail_haruna.png",
        category: "vibe-coding"
    },
    {
        id: "tojeong",
        title: "원조맛집 토정비결",
        enTitle: "Original Tojeong Bigyeol",
        lastUpdated: "2026-01-13",
        concept: "매거진 감성으로 즐기는 정통 토정비결",
        enConcept: "Traditional fortune-telling with a magazine aesthetic",
        description: "\"정통성은 살리고, 경험은 매끄럽게.\" 세련된 사용자 경험을 갖춘 무료 토정비결 서비스. 144개 점괘 원문을 뜻을 살려 모두 현대판으로 리라이팅했다. 고해상도 이미지 저장 & 결과 이메일 발송 기능 제공.",
        enDescription: "\"Authenticity maintained, experience smoothed.\" A free Tojeong Bigyeol (Korean traditional fortune-telling) service with a sleek user experience. All 144 divination texts were rewritten into modern language while keeping their original meanings. High-res image saving and result emailing supported.",
        techStack: ["Next.js 14", "TypeScript", "Tailwind CSS", "Framer Motion", "Redis"],
        link: "https://tojeong.vercel.app",
        linkText: "사용해 보기",
        enLinkText: "Try it out",
        thumbnail: "/portfolio/images/thumbnail_tojeong.png",
        category: "vibe-coding"
    },
    {
        id: "frequence",
        title: "프레캉스",
        enTitle: "fréquence",
        lastUpdated: "2026-01-04",
        concept: "브라우저 기반의 미니멀 오디오 비주얼라이저",
        enConcept: "Browser-based minimal audio visualizer",
        description: "눈송이(Snowflakes)와 구체(Orb)를 모티브로 한 몽환적인 시각 효과를 제공하는 웹앱. 별도 프로그램 설치 없이 브라우저만으로 고품질 시각화 영상을 렌더링하고 MP4 파일로 다운받을 수 있다.",
        enDescription: "A web app offering dreamy visual effects inspired by Snowflakes and Orbs. Uses just your browser to render high-quality visualization videos and download them as MP4s, with no extra installation required.",
        techStack: ["React 19", "Web Audio API", "Canvas API", "WebCodecs API"],
        link: "https://frequence-one.vercel.app/",
        linkText: "사용해 보기",
        enLinkText: "Try it out",
        thumbnail: "/portfolio/images/thumbnail_frequence.png",
        category: "vibe-coding"
    },
    {
        id: "prognos",
        title: "프로그노스",
        enTitle: "Prognos",
        lastUpdated: "2025-11-08",
        concept: "AI가 예측하는 한 달 뒤의 주가",
        enConcept: "Stock prices a month ahead predicted by AI",
        description: "700개 이상의 미국 주식/ETF 데이터를 학습한 딥러닝 모델이 다음 한 달(20거래일)간의 일봉 차트를 예측한다. 믿으면 안 되지만 동전 던지기보다는 믿을 만하다. 올라운더 '잭스'와 지능적인 '에마', 두 가지 AI 중 선택 가능.",
        enDescription: "A deep-learning model trained on over 700 US stocks/ETFs predicts the daily chart for the next month (20 trading days). You shouldn't blindly trust it, but it's more reliable than a coin flip! Choose between two AI personas: the versatile 'Jack' and the intelligent 'Emma'.",
        techStack: ["Python (Flask, TensorFlow)", "GCP", "ApexCharts.js"],
        link: "https://prognos-web.vercel.app/",
        linkText: "사용해 보기",
        enLinkText: "Try it out",
        thumbnail: "/portfolio/images/thumbnail_prognos.png",
        category: "vibe-coding"
    },
    {
        id: "webplified",
        title: "웹플리파이드",
        enTitle: "Webplified.",
        lastUpdated: "2025-07-05",
        concept: "초고속 일괄 Webp 변환기",
        enConcept: "Ultra-fast batch Webp converter",
        description: "최대 100개의 JPG/PNG 파일을 브라우저에서 Webp 파일로 변환/역변환하는 고성능 컨버터 웹앱. 이미지를 서버에 올리지 않아 100% 프라이버시 보장. 보안, 속도, 사용자 경험이라는 세 마리 토끼를 잡았다.",
        enDescription: "A high-performance Webp converter web app that converts/reverts up to 100 JPG/PNG files entirely in the browser. 100% privacy guaranteed as images are never uploaded to a server. Catch all three rabbits: security, speed, and user experience.",
        techStack: ["JavaScript", "Web Workers API", "JSZip"],
        link: "https://heavyrain39.github.io/webplified/",
        linkText: "사용해 보기",
        enLinkText: "Try it out",
        thumbnail: "/portfolio/images/thumbnail_webplified.png",
        category: "web-app"
    },
    {
        id: "archive03",
        title: "아카이브 03",
        enTitle: "Archive 03",
        lastUpdated: "2025-07-05",
        concept: "세 인외 미소녀가 전하는 투자 인사이트",
        enConcept: "Investment insights from three demi-girls",
        description: "천사, 악마, 안드로이드라는 세 명의 인외 미소녀가 최신 데이터를 바탕으로 전하는 대화 형식의 투자 정보 연재 블로그. 데이터/성장성/리스크를 대표하는 세 캐릭터의 티키타카를 보다 보면 어느새 당신도 경제 전문가.",
        enDescription: "An episodic investment insight blog delivered via dialogue by three non-human demi-girls. A conversational take on the latest market data presented by an Angel, a Demon, and an Android representing data, growth, and risk. Over time, you'll become an economy expert yourself.",
        techStack: ["Hugo", "GitHub Pages", "SCSS", "Gemini"],
        link: "https://archive03.online/",
        linkText: "보러 가기",
        enLinkText: "Visit Blog",
        thumbnail: "/portfolio/images/thumbnail_archive03.png",
        category: "web-app"
    },
    {
        id: "forge",
        title: "던전 앞 대장간 아저씨는 용사를 서포트한다",
        enTitle: "The Heroes' Forge",
        lastUpdated: "2025-06-10",
        concept: "루프 기반 성장+방치형 RPG",
        enConcept: "Loop-based progression & idle RPG",
        description: "싸움은 용사에게, 무기는 대장장이에게. 전설의 무기를 벼려내기 위한 당신의 전투는 이곳, 던전 앞 대장간에서 시작된다. 신개념 서포트 RPG.",
        enDescription: "Heroes fight, blacksmiths forge. Your battle to forge legendary weapons begins here, at the blacksmith shop in front of the dungeon. A loop-based idle RPG.",
        techStack: ["JavaScript", "Firebase", "Web Workers API"],
        link: "#",
        linkText: "Coming soon...",
        enLinkText: "Coming soon...",
        thumbnail: "/portfolio/images/thumbnail_forge.png",
        category: "game"
    },
    {
        id: "promptviewer",
        title: "프롬프트 뷰어",
        enTitle: "Prompt Viewer",
        lastUpdated: "2025-06-04",
        concept: "간편하게 확인하는 AI 이미지 프롬프트",
        enConcept: "Easily view AI image prompts",
        description: "인터넷에서 본 AI 이미지의 프롬프트, 모델, 세팅이 궁금했다면? 간편하고 강력한 크롬 익스텐션 '프롬프트 뷰어'로 해결. 우클릭 후 '프롬프트 보기'를 선택하면 WebUI, NAI 이미지 생성 정보가 즉시 나타난다.",
        enDescription: "Curious about the prompts, models, and settings of AI images you see online? Solve it instantly with the simple and powerful Chrome extension 'Prompt Viewer'. Just right-click and select 'View Prompt' to instantly reveal WebUI and NAI image generation data.",
        techStack: ["JavaScript", "Chrome Extension API"],
        link: "https://chromewebstore.google.com/detail/pdjhokodhiaaphbgopajhalchjhmflae",
        linkText: "사용해 보기",
        enLinkText: "Try it out",
        thumbnail: "/portfolio/images/thumbnail04.png",
        category: "web-app"
    },
    {
        id: "aethertuner",
        title: "에테르 튜너 v1.0",
        enTitle: "Aether Tuner v1.0",
        lastUpdated: "2025-05-17",
        concept: "웹페이지로 굴리는 라디오닉스 머신",
        enConcept: "A web-based radionics machine",
        description: "나만의 커스텀 소원성취 주파수를 원한다면? 사용자가 입력한 의도를 기반으로 브라운 노이즈를 생성하는 스태틱 웹사이트 형식의 라디오닉스 머신. 매력적인 비주얼라이저와 깔끔한 UI로 언제 어디서나 사용 가능.",
        enDescription: "Want your own custom frequency for wish fulfillment? A static website radionics machine that generates brown noise based on the user's intent. Features an attractive visualizer and clean UI, usable anytime, anywhere.",
        techStack: ["Web Audio API", "Three.js", "GLSL"],
        link: "https://heavyrain39.github.io/aether-tuner/",
        linkText: "사용해 보기",
        enLinkText: "Try it out",
        thumbnail: "/portfolio/images/thumbnail03.png",
        category: "web-app"
    },
    {
        id: "arcanacode1",
        title: "아르카나 코드 v1.0",
        enTitle: "Arcana Code v1.0",
        lastUpdated: "2025-05-03",
        concept: "AI가 해석해 주는 무료 타로카드 프로그램",
        enConcept: "Free AI-interpreted tarot card program",
        description: "진정한 무작위 카드 뽑기가 불가능하다는 LLM의 결점을 보완한 쪽집게 타로카드 소프트웨어. 어떤 질문이든 완벽 해결. 해석은 최신 AI가 알아서 해 준다! 현재 2.0 버전 개발 중.",
        enDescription: "A software-based tarot solution addressing the limitation of true randomness in LLMs. Solves any question flawlessly. The meaning is automatically interpreted by the latest AI! Version 2.0 currently in development.",
        techStack: ["Node.js", "Express.js", "Gemini API", "Stable Diffusion"],
        link: "https://heavyrain39.github.io/arcana-code/",
        linkText: "소개 페이지",
        enLinkText: "Info Page",
        thumbnail: "/portfolio/images/thumbnail02.png",
        category: "web-app"
    },
    {
        id: "liveonwakaba",
        title: "라이브 온! 와카바",
        enTitle: "Live on! Wakaba",
        lastUpdated: "2025-04-27",
        concept: "방치형 스트리머 육성 시뮬레이션 게임",
        enConcept: "Idle streamer raising simulation game",
        description: "PC에서 키우는 나만의 미소녀 다마고치. 나무의 정령 '이부키 와카바'를 SSS급 스트리머로 육성하고, 호감도를 높여 특별 일러스트를 모두 해금하자.",
        enDescription: "An idle streamer raising simulator. Your very own desktop companion. Turn the tree spirit 'Ibuki Wakaba' into an SSS-rank streamer, raise her affection, and unlock special illustrations.",
        techStack: ["Python/Pygame", "Stable Diffusion"],
        link: "https://heavyrain39.github.io/wakaba/",
        linkText: "소개 페이지",
        enLinkText: "Info Page",
        thumbnail: "/portfolio/images/thumbnail01.png",
        category: "game"
    }
];

export const musicAlbums: MusicItem[] = [
    { id: "seraphim", title: "1. Seraphim", youtubeId: "1rQIBfAq6KE" },
    { id: "dream-boy", title: "2. Dream Boy", youtubeId: "xgzEbzEfmr8" },
    { id: "whisper", title: "3. Whisper", youtubeId: "1yNEZR_We-4" },
    { id: "listen", title: "4. Listen", youtubeId: "_WmByI8j93o" },
    { id: "sango", title: "5. 珊瑚色の記憶", youtubeId: "r1z_xLy0kMM" },
    { id: "midnight", title: "6. Seraphim (Midnight Mix)", youtubeId: "enuDklZNrwQ" },
];

export const electronicMusic: MusicItem[] = [
    { id: "pattern", title: "Pattern Completion (2022)", youtubeId: "NEQKjyKhVUI" },
    { id: "northward", title: "북상 (2022)", youtubeId: "javL1uBsCF0" },
    { id: "ascent", title: "Ascent (2021)", youtubeId: "zML3G3r8rLk" },
    { id: "voice", title: "\"Voice of No Return\" (2021)", youtubeId: "j5U2r_SG19k" },
    { id: "wretched", title: "깨어나세요 보살님 (2021)", youtubeId: "3hUnxjecycQ" },
];
