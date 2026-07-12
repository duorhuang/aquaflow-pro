import { ImageViewerModal } from "@/components/common/ImageViewer";
import { ToastProvider } from "@/components/common/Toast";
import type { Metadata, Viewport } from "next";
import "./globals.css";
import { LanguageProvider } from "@/lib/i18n";
import { StoreProvider } from "@/lib/store";
import { DbStatus } from "@/components/DbStatus";

// Use system fallback fonts to prevent build-time Google Fonts network timeouts in restricted network environments
const inter = { variable: "font-sans" };
const outfit = { variable: "font-sans" };
const jetbrainsMono = { variable: "font-mono" };

export const metadata: Metadata = {
  title: "AquaFlow Pro - 游泳队 management system",
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
        {/* DNS prefetch for China-accessible video embeds */}
        <link rel="dns-prefetch" href="//player.bilibili.com" />
        <link rel="dns-prefetch" href="//v.qq.com" />
        <link rel="dns-prefetch" href="//open.douyin.com" />
        <link rel="dns-prefetch" href="//xhslink.com" />
        <link rel="dns-prefetch" href="//xiaohongshu.com" />
      </head>
      <body className={`${inter.variable} ${outfit.variable} ${jetbrainsMono.variable} antialiased`} suppressHydrationWarning={true}>
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

