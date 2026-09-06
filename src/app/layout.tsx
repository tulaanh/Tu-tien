import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Providers from "@/components/Providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Vấn Đạo Các - Hệ Thống Tu Tiên Đời Thực",
  description: "Biến việc hoàn thành thói quen và công việc hàng ngày thành hành trình tu tiên đắc đạo!",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Vấn Đạo Các",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#eef4fb",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="vi"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-screen flex flex-col bg-[#eef4fb] text-slate-800 selection:bg-blue-600/20 selection:text-blue-900 overscroll-none">
        <Providers>
          <Navbar />
          <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 pb-24 md:pb-8">
            {children}
          </main>
        </Providers>
        <footer className="hidden md:block border-t border-blue-200/60 py-6 text-center text-xs text-slate-500">
          <p>Thiên Đạo Thù Cần — Đạo Tâm Bất Hoảng, Đại Đạo Tự Thành.</p>
          <p className="mt-1 text-slate-400">Vấn Đạo Các © 2026</p>
        </footer>
      </body>
    </html>
  );
}
