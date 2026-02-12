/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'export',
    images: {
        unoptimized: true,
    },
    // GitHub Pages 저장소 이름이 'portfolio'이므로 해당 경로를 basePath로 설정합니다.
    basePath: '/portfolio',
    // 에셋 경로(CSS, JS 등)도 basePath를 따르도록 합니다.
    assetPrefix: '/portfolio',
};

export default nextConfig;
