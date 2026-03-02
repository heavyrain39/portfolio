export const dictionary = {
    ko: {
        hero: {
            introduction: "안녕하세요. 이곳은 작가, 인디 개발자, 기획자인 야차완의 포트폴리오 웹페이지입니다. 재미있게 둘러보고 가시면 좋겠습니다. 😙",
        },
        about: {
            title: "이야기와 기술의 교차점.",
            description: "야차완은 콘텐츠 창작자이자 인디 개발자입니다. LLM을 활용해 다양한 콘텐츠 경험을 설계·개발하고 있습니다.<br>문의는 <a href=\"https://www.threads.com/@yakshawan\" target=\"_blank\" rel=\"noopener noreferrer\">스레드</a> 혹은 <a href=\"mailto:ggolem@naver.com\">이메일</a>로 부탁드립니다. 감사합니다.",
            highlightsTitle: "Career Highlights",
            highlights: [
                "現 웹소설 작가",
                "前 카카오 콘텐츠 기획자",
                "1인 인디게임 / 웹앱 개발",
                "LLM 기반 서비스 기획 및 개발"
            ]
        },
        minigame: {
            targetsTerminated: "TARGETS TERMINATED",
            wheelToSwitch: "WHEEL_TO_SWITCH",
            clickToEngage: "CLICK_TO_ENGAGE",
        }
    },
    en: {
        hero: {
            introduction: "Hello. This is the portfolio web page of Yakshawan: writer and indie developer. Please enjoy your stay. 😙",
        },
        about: {
            title: "The intersection of story and technology.",
            description: "Yakshawan is a content creator and indie developer. I design and develop various content experiences using LLMs.<br>For inquiries, please contact me via <a href=\"https://www.threads.com/@yakshawan\" target=\"_blank\" rel=\"noopener noreferrer\">Threads</a> or <a href=\"mailto:ggolem@naver.com\">Email</a>. Thank you.",
            highlightsTitle: "Career Highlights",
            highlights: [
                "Currently a Web Novel Author",
                "Formerly a Content Planner at Kakao",
                "Solo Indie Game / Web App Developer",
                "LLM-based Service Planning & Development"
            ]
        },
        minigame: {
            targetsTerminated: "TARGETS TERMINATED",
            wheelToSwitch: "WHEEL_TO_SWITCH",
            clickToEngage: "CLICK_TO_ENGAGE",
        }
    }
};

export type DictionaryKey = keyof typeof dictionary.ko;
