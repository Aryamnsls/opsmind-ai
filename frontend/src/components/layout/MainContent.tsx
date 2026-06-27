"use client";

import { usePathname } from "next/navigation";

const SIDEBAR_EXCLUDED = ["/", "/sign-in", "/sign-up"];

export function MainContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isExcluded =
    pathname === "/" ||
    pathname.startsWith("/sign-in") ||
    pathname.startsWith("/sign-up");

  return (
    <div className={`flex-1 flex flex-col min-w-0 ${isExcluded ? "" : "ml-64"}`}>
      {children}
    </div>
  );
}
