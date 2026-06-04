import { ImageViewerModal } from "@/components/common/ImageViewer";
import { ToastProvider } from "@/components/common/Toast";
import type { Metadata, Viewport } from "next";
import "./globals.css";
import { LanguageProvider } from "@/lib/i18n";
import { StoreProvider } from "@/lib/store";
import { DbStatus } from "@/components/DbStatus";


export const metadata: Metadata = {
  title: "AquaFlow Pro - 游泳队管理系统",
  description: "专业游泳队训练管理系统 | Professional Swimming Team Management",
  icons: {
    icon: "/favicon.ico",
  },
  other: {
    "x-build": "V12-STRATOSPHERE",
  }
};

export const viewport: Viewport = {
  themeColor: "#09090b",
  width: "device-width",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500&display=swap" rel="stylesheet" />
        {/* DNS prefetch for China-accessible video embeds */}
        <link rel="dns-prefetch" href="//player.bilibili.com" />
        <link rel="dns-prefetch" href="//v.qq.com" />
        <link rel="dns-prefetch" href="//open.douyin.com" />
        <link rel="dns-prefetch" href="//xhslink.com" />
        <link rel="dns-prefetch" href="//xiaohongshu.com" />
      </head>
      <body className="antialiased" suppressHydrationWarning={true}>
        <LanguageProvider>
          <StoreProvider>
            <ToastProvider>
              <DbStatus />
              {children}
              <ImageViewerModal />
            </ToastProvider>
          </StoreProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
