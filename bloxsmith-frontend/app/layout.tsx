import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import { Navigation7 } from "@/components/navigation-7";
import "./globals.css";

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Bloxsmith",
  description: "Generate production-ready Roblox UI with curated style presets",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${jetbrainsMono.variable} font-mono antialiased flex flex-col min-h-screen`}>
        <Navigation7 />
        {children}
      </body>
    </html>
  );
}
