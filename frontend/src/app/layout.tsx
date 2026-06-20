import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "OpsMind AI — The Incident Memory Engine",
  description:
    "AI-powered Incident Memory Engine for DevOps, SRE, Cloud, and Platform Engineering teams. Your infrastructure forgets nothing.",
  keywords: ["incident management", "SRE", "DevOps", "root cause analysis", "AI operations"],
  authors: [{ name: "OpsMind AI Team" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${geistMono.variable}`}>
      <body className="min-h-screen flex bg-background text-foreground antialiased">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0 ml-64">
          {children}
        </div>
      </body>
    </html>
  );
}
