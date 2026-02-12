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

import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import ChatBot from "@/components/ChatBot";
import PushNotificationManager from "@/components/PushNotificationManager";

export const metadata: Metadata = {
  title: "Pawly - 반려동물 응급 분석",
  description: "AI로 우리 아이의 건강 상태를 진단하고 가장 가까운 24시 병원을 찾으세요.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased selection:bg-blue-100 bg-slate-50`}
      >
        <div className="flex flex-col min-h-screen max-w-[600px] mx-auto bg-white shadow-2xl relative">
          <Header />
          <main className="flex-1 w-full relative overflow-x-hidden pb-32">
            {children}
          </main>
          <BottomNav />
          <ChatBot />
          <PushNotificationManager />
        </div>
      </body>
    </html>
  );
}
