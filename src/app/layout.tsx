import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/providers";
import CursorGlow from "@/components/effects/CursorGlow";

export const metadata: Metadata = {
  title: "SkillPulse AI — Level Up Your Career",
  description:
    "AI-powered career guidance platform with gamified learning roadmaps. Generate personalized career paths, earn XP, and land your dream tech role.",
  keywords:
    "career guidance, AI roadmap, tech career, skill development, programming learning",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head> 
      <body className="bg-[#050816] text-[#e2e8f0] min-h-screen antialiased">
        <Providers>
          <CursorGlow />

          {children}
        </Providers>
      </body>
    </html>
  );
}
