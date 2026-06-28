import { NextResponse } from "next/server";
import { Pool } from "pg";

export async function GET() {
  const url = process.env.DATABASE_URL || "";
  return NextResponse.json({ 
    hasUrl: !!process.env.DATABASE_URL,
    length: url.length,
    includesOpsMind: url.includes("opsmind-db"),
    includesPostgres: url.includes("postgresql://"),
    startsWith: url.substring(0, 20)
  });
}
