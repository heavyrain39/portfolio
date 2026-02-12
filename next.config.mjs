/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'export',
    images: {
        unoptimized: true,
    },
    // GitHub Pages에서 프로젝트 이름으로 하위 경로가 생기는 경우 아래 설정을 활성화해야 할 수 있습니다.
    // basePath: '/repository-name',
};

export default nextConfig;
