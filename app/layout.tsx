import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Token Service - AI API用量管理",
  description: "一站式AI API用量监控和账单管理平台",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col bg-slate-50 font-sans">{children}</body>
    </html>
  );
}
