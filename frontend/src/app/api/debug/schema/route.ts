import { NextResponse } from "next/server";
import { Pool } from "pg";

export async function GET() {
  try {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false
    });
    const result = await pool.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'users';`);
    await pool.end();
    return NextResponse.json({ columns: result.rows, envUrl: !!process.env.DATABASE_URL });
  } catch (error: any) {
    return NextResponse.json({ error: error.message, stack: error.stack, envUrl: !!process.env.DATABASE_URL }, { status: 500 });
  }
}
