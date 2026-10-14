import { ImageViewerModal } from "@/components/common/ImageViewer";
import { ToastProvider } from "@/components/common/Toast";
import type { Metadata, Viewport } from "next";
import "./globals.css";
import { LanguageProvider } from "@/lib/i18n";
import { ThemeProvider } from "@/lib/theme-context";
import { StoreProvider } from "@/lib/store";
import { DbStatus } from "@/components/DbStatus";

// Use system fallback fonts to prevent build-time Google Fonts network timeouts in restricted network environments
const inter = { variable: "font-sans" };
const outfit = { variable: "font-sans" };
const jetbrainsMono = { variable: "font-mono" };

export const metadata: Metadata = {
  title: "AquaFlow Pro - 游泳队训练管理系统",
  description: "专业游泳队训练与成长管理平台 · 科学计划 · 状态追踪 · 成长激励",
  icons: {
    icon: "/favicon.ico",
  },
  other: {
    "x-build": "V12-CLEAN",
  }
};

export const viewport: Viewport = {
  themeColor: "#0284c7",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        {/* DNS prefetch for China-accessible video embeds */}
        <link rel="dns-prefetch" href="//player.bilibili.com" />
        <link rel="dns-prefetch" href="//v.qq.com" />
        <link rel="dns-prefetch" href="//open.douyin.com" />
        <link rel="dns-prefetch" href="//xhslink.com" />
        <link rel="dns-prefetch" href="//xiaohongshu.com" />
      </head>
      <body className={`${inter.variable} ${outfit.variable} ${jetbrainsMono.variable} antialiased selection:bg-primary/20 selection:text-primary min-h-screen bg-background text-foreground`} suppressHydrationWarning>
        <ThemeProvider>
          <LanguageProvider>
            <StoreProvider>
              <ToastProvider>
                <DbStatus />
                {children}
                <ImageViewerModal />
              </ToastProvider>
            </StoreProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}


