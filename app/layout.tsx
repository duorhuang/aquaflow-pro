import { ImageViewerModal } from "@/components/common/ImageViewer";
import { ToastProvider } from "@/components/common/Toast";
import type { Metadata, Viewport } from "next";
import "./globals.css";
import { LanguageProvider } from "@/lib/i18n";
import { StoreProvider } from "@/lib/store";
import { DbStatus } from "@/components/DbStatus";

export const dynamic = 'force-dynamic';

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
