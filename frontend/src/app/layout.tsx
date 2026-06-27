import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { MainContent } from "@/components/layout/MainContent";

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

// Clerk is OPTIONAL — only wrap with ClerkProvider when valid keys exist
const CLERK_KEY = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
const CLERK_ENABLED =
  typeof CLERK_KEY === "string" &&
  CLERK_KEY.length > 10 &&
  !CLERK_KEY.includes("your-clerk") &&
  !CLERK_KEY.includes("pk_test_your");

async function ClerkWrapper({ children }: { children: React.ReactNode }) {
  if (CLERK_ENABLED) {
    const { ClerkProvider } = await import("@clerk/nextjs");
    return <ClerkProvider>{children}</ClerkProvider>;
  }
  return <>{children}</>;
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkWrapper>
      <html lang="en" className={`${inter.variable} ${geistMono.variable}`}>
        <body className="min-h-screen flex bg-background text-foreground antialiased">
          <Sidebar />
          <MainContent>{children}</MainContent>
        </body>
      </html>
    </ClerkWrapper>
  );
}
