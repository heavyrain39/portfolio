/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'export',
    // GitHub Pages 저장소 이름이 'portfolio'인 경우 반드시 설정해야 합니다.
    basePath: '/portfolio',
    // GitHub Pages에서 폴더 구조와 URL을 일치시키기 위해 true로 설정하는 것이 권장됩니다.
    trailingSlash: true,
    images: {
        unoptimized: true,
    },
};

export default nextConfig;
