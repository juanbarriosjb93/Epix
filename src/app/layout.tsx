import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Epix - Premium AI Vertical Video Stocks",
  description: "Discover, create, and monetize premium AI-generated vertical videos. The future of short-form content.",
  icons: { icon: "/epix-logo.svg" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#050508] text-zinc-100 selection:bg-violet-500/30 selection:text-violet-200">{children}</body>
    </html>
  );
}
