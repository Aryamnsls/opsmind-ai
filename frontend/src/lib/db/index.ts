/**
 * OpsMind AI — Database Connection
 * Target: Amazon Aurora PostgreSQL (via Drizzle ORM + pg)
 *
 * Usage:
 * - Set DATABASE_URL env var to activate real Aurora connection
 * - Without DATABASE_URL, all API routes fall back to mock data gracefully
 *
 * Aurora Connection String format:
 * postgresql://username:password@your-aurora-cluster-endpoint:5432/opsmind
 */

import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

const DATABASE_URL = process.env.DATABASE_URL;

// Explicit type alias to avoid circular reference in withDb
type DrizzleDB = ReturnType<typeof drizzle<typeof schema>>;

// Graceful fallback — if no DB URL, db will be null and routes use mock data
let db: DrizzleDB | null = null;

if (DATABASE_URL) {
  const pool = new Pool({
    connectionString: DATABASE_URL,
    // Aurora-optimized pool settings
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
    ssl:
      process.env.NODE_ENV === "production"
        ? { rejectUnauthorized: false }
        : false,
  });

  db = drizzle(pool, { schema });

  console.log("✅ OpsMind AI: Connected to Amazon Aurora PostgreSQL");
} else {
  console.log(
    "⚠️  OpsMind AI: DATABASE_URL not set — using mock data (set env var for Aurora)"
  );
}

export { db };
export type { DrizzleDB };
export { schema };

/**
 * Check if Aurora DB is available
 */
export function isDbConnected(): boolean {
  return db !== null;
}

/**
 * Aurora-ready query helper — falls back to mock data when DB not connected
 * @param auroraQuery Function that runs the real DB query
 * @param mockFallback Function that returns mock data
 */
export async function withDb<T>(
  auroraQuery: (activeDb: DrizzleDB) => Promise<T>,
  mockFallback: () => T
): Promise<T> {
  if (db) {
    try {
      return await auroraQuery(db);
    } catch (error) {
      console.error("Aurora query failed, falling back to mock:", error);
      return mockFallback();
    }
  }
  return mockFallback();
}
