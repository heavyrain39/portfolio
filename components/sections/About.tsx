"use client";

import TypewriterText from "@/components/ui/TypewriterText";

export default function About() {
    return (
        <section id="about" className="container mx-auto px-6 py-32 grid grid-cols-1 md:grid-cols-12 gap-12">

            <div className="md:col-span-4">
                <h2 className="text-4xl font-serif font-bold mb-6">Entity Profile</h2>
                <div className="w-12 h-1 bg-current mb-6" />
                <p className="font-mono text-sm opacity-60">
                    SYSTEM_ID: YAKSHAWAN<br />
                    ROLE: WRITER / VIBE CODER / PLANNER<br />
                    LOCATION: SEOUL, KR
                </p>
            </div>

            <div className="md:col-span-8 flex flex-col gap-8 text-lg opacity-80 leading-relaxed text-justify break-keep">
                <div className="text-2xl md:text-3xl font-serif font-bold opacity-100 mb-4 min-h-12 flex items-center">
                    <TypewriterText text="이야기와 기술의 교차점." className="block" />
                </div>
                <p>
                    <TypewriterText text={'야차완은 콘텐츠 창작자이자 바이브 코더입니다. LLM을 활용해 다양한 콘텐츠 경험을 설계·개발하고 있습니다.<br>문의는 <a href="https://www.threads.com/@yakshawan">스레드</a> 혹은 <a href="mailto:ggolem@naver.com">이메일</a>로 부탁드립니다. 감사합니다.'} />
                </p>

                <div className="pt-8 mt-8">
                    <h4 className="font-mono text-sm uppercase mb-4 opacity-50">Career Highlights</h4>
                    <ul className="space-y-4 list-disc pl-5 marker:text-current/50">
                        <li>現 웹소설 작가</li>
                        <li>前 카카오 콘텐츠 기획자</li>
                        <li>1인 인디게임 / 웹앱 개발</li>
                        <li>LLM 기반 서비스 기획 및 개발</li>
                    </ul>
                </div>
            </div >

        </section >
    );
}
