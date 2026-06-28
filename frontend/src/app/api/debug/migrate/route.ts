import { NextResponse } from "next/server";
import { Client } from "pg";

export async function GET() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  
  try {
    await client.connect();
    const result = await client.query('SELECT 1 as connected');
    await client.end();
    return NextResponse.json({ success: true, result: result.rows });
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      errorName: error.name,
      errorMessage: error.message,
      errorCode: error.code,
      errorStack: error.stack
    }, { status: 500 });
  }
}
