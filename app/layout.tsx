import type { Metadata } from "next";
import { Playfair_Display, Inter, JetBrains_Mono } from "next/font/google"; // Keep these
// import localFont if needed, but Google Fonts are fine for now.
import "./globals.css";
import { clsx } from "clsx";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import GridBackground from "@/components/layout/GridBackground";

// Fonts
const playfair = Playfair_Display({
    subsets: ["latin"],
    variable: "--font-playfair",
    display: "swap",
});

const inter = Inter({
    subsets: ["latin"],
    variable: "--font-inter",
    display: "swap",
});

const jetbrains = JetBrains_Mono({
    subsets: ["latin"],
    variable: "--font-jetbrains",
    display: "swap",
});

export const metadata: Metadata = {
    title: "야차완 | 夜叉腕 Portfolio",
    description: "Writer, Vibe Coder, Planner. Portfolio of Yakshawan.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="ko" suppressHydrationWarning className={clsx(playfair.variable, inter.variable, jetbrains.variable)}>
            <body className="antialiased font-sans bg-background text-foreground transition-colors duration-300">
                <ThemeProvider>
                    <GridBackground />
                    <div className="relative z-10 flex flex-col min-h-screen">
                        {children}
                    </div>
                </ThemeProvider>
            </body>
        </html>
    );
}
