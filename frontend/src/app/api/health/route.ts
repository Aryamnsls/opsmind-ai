import { NextResponse } from "next/server";
import { isDbConnected } from "@/lib/db";

export async function GET() {
  const dbConnected = isDbConnected();
  const openaiConfigured = !!process.env.OPENAI_API_KEY;
  const s3Configured =
    !!process.env.AWS_ACCESS_KEY_ID &&
    !!process.env.AWS_SECRET_ACCESS_KEY &&
    !!process.env.S3_BUCKET_NAME;
  const clerkConfigured =
    !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
    !!process.env.CLERK_SECRET_KEY;

  // Try a quick DB ping if connected
  let dbLatencyMs: number | null = null;
  if (dbConnected) {
    const start = Date.now();
    try {
      const { db } = await import("@/lib/db");
      const { sql } = await import("drizzle-orm");
      await db!.execute(sql`SELECT 1`);
      dbLatencyMs = Date.now() - start;
    } catch {
      dbLatencyMs = null;
    }
  }

  const services = [
    {
      name: "Amazon Aurora PostgreSQL",
      status: dbConnected ? "connected" : "mock-mode",
      latencyMs: dbConnected ? dbLatencyMs : null,
      note: dbConnected ? "Live Aurora cluster — Drizzle ORM" : "Using in-memory mock data (set DATABASE_URL)",
    },
    {
      name: "OpenAI GPT-4o",
      status: openaiConfigured ? "connected" : "simulated",
      note: openaiConfigured
        ? "Real GPT-4o RCA analysis active"
        : "Pattern-based simulation active (set OPENAI_API_KEY)",
    },
    {
      name: "Amazon S3",
      status: s3Configured ? "connected" : "not-configured",
      note: s3Configured
        ? `S3 bucket: ${process.env.S3_BUCKET_NAME}`
        : "S3 log storage not configured (set AWS credentials + S3_BUCKET_NAME)",
    },
    {
      name: "Clerk Authentication",
      status: clerkConfigured ? "connected" : "not-configured",
      note: clerkConfigured
        ? "Clerk auth active — route protection enabled"
        : "Auth not configured (set CLERK_SECRET_KEY)",
    },
    {
      name: "Vercel Edge Runtime",
      status: "connected",
      note: "Next.js 16 API routes — serverless edge",
    },
  ];

  const allHealthy = services.every(
    (s) => s.status === "connected" || s.status === "mock-mode" || s.status === "simulated"
  );

  return NextResponse.json({
    success: true,
    status: allHealthy ? "healthy" : "degraded",
    version: "2.0.0",
    environment: process.env.NODE_ENV ?? "development",
    services,
    configuration: {
      aurora: dbConnected,
      openai: openaiConfigured,
      s3: s3Configured,
      clerk: clerkConfigured,
    },
    incidentMemory: {
      source: dbConnected ? "Amazon Aurora PostgreSQL" : "in-memory mock",
    },
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
  });
}
