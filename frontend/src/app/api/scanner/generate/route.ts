import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { incidents, incidentDna, rcaReports, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

function generateRandomId() {
  return `INC-${Math.floor(Math.random() * 900) + 100}`;
}

const SCENARIOS = [
  {
    title: "Database Connection Pool Exhaustion",
    service: "Database Cluster",
    description: "Application servers are failing to connect to the database. Error logs indicate max_connections limit reached.",
    tags: ["database", "postgresql", "outage"],
    errorSignatures: ["FATAL: sorry, too many clients already", "Timeout waiting for a connection from pool"],
    rootCause: "A recent deployment introduced a bug in the payment webhook handler that opens a new database connection but fails to close it if the external payment provider times out.",
    resolution: "Rollback deployment to v3.4.1. Increase max_connections to 500 temporarily. Implement connection pooling at the PgBouncer layer.",
  },
  {
    title: "Redis Cache Eviction Storm",
    service: "Caching Layer",
    description: "High latency across all read endpoints. Redis cluster CPU spiking to 99%.",
    tags: ["redis", "cache", "latency"],
    errorSignatures: ["OOM command not allowed when used memory > 'maxmemory'", "Redis connection timeout"],
    rootCause: "A marketing email blast caused a sudden spike in traffic, filling up the Redis memory. The eviction policy (volatile-lru) caused a massive CPU spike during key eviction.",
    resolution: "Upgrade Redis instance size. Change eviction policy to allkeys-lru. Add jitter to cache TTLs to prevent synchronized expiration.",
  },
  {
    title: "502 Bad Gateway from Upstream Timeout",
    service: "API Gateway",
    description: "Nginx is returning 502 Bad Gateway to clients. Upstream services are taking too long to respond.",
    tags: ["nginx", "gateway", "502"],
    errorSignatures: ["upstream timed out (110: Connection timed out)", "recv() failed (104: Connection reset by peer)"],
    rootCause: "The Node.js backend event loop was blocked by a synchronous JSON.parse() on a massive 50MB payload sent by a rogue internal service.",
    resolution: "Implement strict payload size limits on Nginx. Move heavy JSON processing to a worker thread.",
  }
];

export async function POST(req: NextRequest) {
  try {
    const { url, userId } = await req.json();

    if (!url) {
      return NextResponse.json({ success: false, error: "Missing target URL" }, { status: 400 });
    }

    // Grab user for owner info
    let ownerName = "System Scanner";
    if (userId) {
      const u = await db.select().from(users).where(eq(users.id, userId)).limit(1);
      if (u.length > 0) ownerName = u[0].name;
    }

    // Pick a random scenario
    const scenario = SCENARIOS[Math.floor(Math.random() * SCENARIOS.length)];
    const incidentId = generateRandomId();
    const serviceName = new URL(url).hostname;

    // 1. Insert Incident
    await db.insert(incidents).values({
      id: incidentId,
      title: `[${serviceName}] ${scenario.title}`,
      description: scenario.description,
      severity: "critical",
      status: "investigating",
      environment: "production",
      owner: ownerName,
      service: serviceName,
      tags: scenario.tags,
    });

    // 2. Insert Incident DNA
    await db.insert(incidentDna).values({
      incidentId: incidentId,
      fingerprint: `DNA-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
      errorSignatures: scenario.errorSignatures,
      serviceName: serviceName,
      cpuUsage: Math.floor(Math.random() * 40) + 60, // 60-100%
      memoryUsage: Math.floor(Math.random() * 40) + 60,
      networkUsage: Math.floor(Math.random() * 1000) + 500,
      similarityScore: Math.floor(Math.random() * 15) + 80, // 80-95%
    });

    // 3. Insert RCA Report
    await db.insert(rcaReports).values({
      incidentId: incidentId,
      rootCause: scenario.rootCause,
      confidence: Math.floor(Math.random() * 15) + 85,
      resolution: scenario.resolution,
      prevention: "Implement synthetic monitoring and automated rollback alarms.",
    });

    return NextResponse.json({ success: true, incidentId });
  } catch (error: any) {
    console.error("Scanner API Error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
