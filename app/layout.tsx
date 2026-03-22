import type { Metadata } from "next";

import "./globals.css";
import { clsx } from "clsx";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { LanguageProvider } from "@/context/LanguageContext";
import GridBackground from "@/components/layout/GridBackground";



export const metadata: Metadata = {
    title: "야차완 | 夜叉腕 Portfolio",
    description: "Writer, Indie Developer. Portfolio of Yakshawan.",
    icons: {
        icon: "/portfolio/images/favicon.png",
    },
    openGraph: {
        title: "야차완 | 夜叉腕 Portfolio",
        description: "Writer, Indie Developer. Portfolio of Yakshawan.",
        url: "https://heavyrain39.github.io/portfolio/",
        siteName: "야차완 Portfolio",
        images: [
            {
                url: "https://heavyrain39.github.io/portfolio/images/og-image.jpg",
                width: 1200,
                height: 630,
                alt: "야차완 | 夜叉腕 Portfolio",
            }
        ],
        locale: "ko_KR",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "야차완 | 夜叉腕 Portfolio",
        description: "Writer, Indie Developer. Portfolio of Yakshawan.",
        images: ["https://heavyrain39.github.io/portfolio/images/og-image.jpg"],
    },
    alternates: {
        canonical: "https://heavyrain39.github.io/portfolio/",
    },
};

const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "야차완",
    alternateName: "Yakshawan",
    url: "https://heavyrain39.github.io/portfolio/",
    jobTitle: "Writer, Indie Developer",
    image: "https://heavyrain39.github.io/portfolio/images/favicon.png",
    sameAs: [
        "https://github.com/heavyrain39"
    ]
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="ko" suppressHydrationWarning>
            <body suppressHydrationWarning className="antialiased font-sans bg-background text-foreground transition-colors duration-300">
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
                />
                <LanguageProvider>
                    <ThemeProvider>
                        <GridBackground />
                        <div className="relative z-10 flex flex-col min-h-screen">
                            {children}
                        </div>
                    </ThemeProvider>
                </LanguageProvider>
            </body>
        </html>
    );
}
