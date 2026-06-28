import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

export async function GET() {
  try {
    if (!db) {
      return NextResponse.json({ error: "No DB" }, { status: 500 });
    }
    
    // Attempt to add the missing columns. We use IF NOT EXISTS to avoid errors if they already exist.
    await db.execute(sql`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "age" integer;`);
    await db.execute(sql`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "gender" varchar(20);`);
    await db.execute(sql`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "face_id" varchar(255);`);
    
    return NextResponse.json({ success: true, message: "Columns added successfully to production DB!" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
