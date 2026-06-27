/**
 * OpsMind AI — Auth Proxy (Next.js 16 / Clerk v7)
 * Protects all dashboard routes when Clerk keys are configured.
 * When Clerk is NOT configured, all routes are accessible (demo mode).
 */

import { NextRequest, NextResponse } from "next/server";

const CLERK_KEY = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
const CLERK_SECRET = process.env.CLERK_SECRET_KEY;
const CLERK_ENABLED =
  typeof CLERK_KEY === "string" &&
  typeof CLERK_SECRET === "string" &&
  CLERK_KEY.length > 10 &&
  !CLERK_KEY.includes("your-clerk") &&
  !CLERK_KEY.includes("pk_test_your") &&
  CLERK_KEY.startsWith("pk_");

// Public routes — always accessible
const PUBLIC_PATHS = ["/", "/sign-in", "/sign-up", "/api/"];

function isPublic(pathname: string): boolean {
  return PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p));
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // If Clerk is not configured, allow all routes (demo mode)
  if (!CLERK_ENABLED) {
    return NextResponse.next();
  }

  // If public route, allow
  if (isPublic(pathname)) {
    return NextResponse.next();
  }

  // Clerk is configured — delegate to Clerk middleware
  try {
    const { clerkMiddleware } = await import("@clerk/nextjs/server");
    const handler = clerkMiddleware(async (auth) => {
      await auth.protect();
    });
    // @ts-expect-error — Clerk handler type
    return handler(req);
  } catch {
    // If Clerk fails for any reason, allow access in dev
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
