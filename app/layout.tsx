import type { Metadata, Viewport } from "next";
import "./globals.css";
import { LanguageProvider } from "@/lib/i18n";
import { StoreProvider } from "@/lib/store";
import { DbStatus } from "@/components/DbStatus";

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "AquaFlow Pro - 游泳队管理系统",
  description: "专业游泳队训练管理系统 | Professional Swimming Team Management",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "AquaFlow",
  },
  icons: {
    apple: "/icon-192.png",
  },
  other: {
    "x-build": "V12-STRATOSPHERE",
  }
};

export const viewport: Viewport = {
  themeColor: "#09090b",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
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
            <DbStatus />
            {children}
          </StoreProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
