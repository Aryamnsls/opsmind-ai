/**
 * OpsMind AI — Database Seed Script
 * Run with: npx tsx src/lib/db/seed.ts
 * 
 * Seeds Amazon Aurora PostgreSQL with initial incidents, knowledge base articles,
 * and incident DNA records for the hackathon demo.
 * 
 * Requires DATABASE_URL in .env.local
 */

import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";
import {
  incidents,
  incidentDna,
  rcaReports,
  knowledgeBase,
  deploymentHistory,
} from "./schema";

async function seed() {
  const DATABASE_URL = process.env.DATABASE_URL;
  if (!DATABASE_URL) {
    console.error("❌ DATABASE_URL not set. Exiting.");
    process.exit(1);
  }

  const pool = new Pool({ connectionString: DATABASE_URL });
  const db = drizzle(pool, { schema });

  console.log("🌱 Seeding OpsMind AI database...\n");

  // ── Seed Incidents ────────────────────────────────────────────────────────

  const seedIncidents = [
    {
      id: "INC-201",
      title: "Production API Gateway Timeout Storm",
      description: "API Gateway experiencing cascading timeouts across all endpoints. Error rate spiked to 67%. Redis connection pool exhausted.",
      severity: "critical" as const,
      status: "active" as const,
      environment: "production",
      owner: "Aryaman Singh",
      service: "API Gateway",
      tags: ["api-gateway", "redis", "timeout", "production"],
    },
    {
      id: "INC-200",
      title: "Kubernetes Worker Pod OOMKilled",
      description: "Worker pods being OOMKilled due to memory leak in payment processing service. 3 pods evicted.",
      severity: "high" as const,
      status: "investigating" as const,
      environment: "production",
      owner: "Priya Sharma",
      service: "Payment Service",
      tags: ["kubernetes", "oomkilled", "memory", "production"],
    },
    {
      id: "INC-199",
      title: "ElasticSearch Cluster Shard Failure",
      description: "Elasticsearch cluster experiencing shard allocation failures due to disk pressure on 2 of 6 nodes.",
      severity: "high" as const,
      status: "resolved" as const,
      environment: "production",
      owner: "Rahul Mehta",
      service: "ElasticSearch",
      tags: ["elasticsearch", "disk", "shards", "production"],
      resolvedAt: new Date("2026-06-16T14:30:00Z"),
      mttr: "45m",
    },
    {
      id: "INC-104",
      title: "Redis Memory Exhaustion — Payment Sessions",
      description: "Redis OOM error caused by unbounded payment session key accumulation. maxmemory threshold exceeded.",
      severity: "critical" as const,
      status: "resolved" as const,
      environment: "production",
      owner: "Aryaman Singh",
      service: "Redis Cache",
      tags: ["redis", "memory", "oom", "sessions"],
      resolvedAt: new Date("2026-06-10T11:15:00Z"),
      mttr: "32m",
    },
    {
      id: "INC-103",
      title: "Aurora PostgreSQL Connection Pool Saturation",
      description: "Database connections exhausted — 500/500 connections used. Application unable to acquire new connections.",
      severity: "critical" as const,
      status: "resolved" as const,
      environment: "production",
      owner: "Rahul Mehta",
      service: "Aurora PostgreSQL",
      tags: ["aurora", "postgresql", "connections", "database"],
      resolvedAt: new Date("2026-06-08T16:45:00Z"),
      mttr: "28m",
    },
  ];

  console.log("📋 Inserting incidents...");
  for (const inc of seedIncidents) {
    await db.insert(incidents).values(inc).onConflictDoNothing();
    console.log(`  ✓ ${inc.id}: ${inc.title}`);
  }

  // ── Seed Incident DNA ─────────────────────────────────────────────────────

  const seedDNA = [
    {
      incidentId: "INC-201",
      fingerprint: "DNA-7F2A9B3C",
      errorSignatures: ["ETIMEDOUT", "Redis OOM", "Connection Pool Exhausted", "HTTP 5xx Error"],
      serviceName: "API Gateway",
      cpuUsage: 45,
      memoryUsage: 72,
      networkUsage: 88,
      deploymentMeta: "v3.4.2 deployed 2h before incident",
      infraComponents: ["API Gateway", "Redis Cluster", "Payment Service", "Aurora DB"],
      similarityScore: 94,
    },
    {
      incidentId: "INC-200",
      fingerprint: "DNA-8C3D2F1A",
      errorSignatures: ["OOMKilled", "Memory Pressure", "K8s Eviction"],
      serviceName: "Payment Service",
      cpuUsage: 61,
      memoryUsage: 98,
      networkUsage: 34,
      deploymentMeta: "v2.1.1 deployed 4h before incident",
      infraComponents: ["Kubernetes", "Worker Pods", "Payment Service"],
      similarityScore: 87,
    },
    {
      incidentId: "INC-104",
      fingerprint: "DNA-4A1B8C9D",
      errorSignatures: ["Redis OOM", "Connection Pool Exhausted"],
      serviceName: "Redis Cache",
      cpuUsage: 30,
      memoryUsage: 100,
      networkUsage: 45,
      deploymentMeta: "Session TTL config removed in v3.2.0",
      infraComponents: ["Redis Cluster", "API Gateway", "Payment Service"],
      similarityScore: 97,
    },
  ];

  console.log("\n🧬 Inserting Incident DNA...");
  for (const dna of seedDNA) {
    await db.insert(incidentDna).values(dna).onConflictDoNothing();
    console.log(`  ✓ DNA for ${dna.incidentId}: ${dna.fingerprint}`);
  }

  // ── Seed RCA Reports ──────────────────────────────────────────────────────

  const seedRCA = [
    {
      incidentId: "INC-104",
      rootCause: "Redis maxmemory policy set to noeviction with session keys having no TTL, causing memory exhaustion over 8 hours of production traffic.",
      confidence: 96,
      resolution: "1. Flushed stale session keys using SCAN + DEL\n2. Increased maxmemory from 4GB to 8GB\n3. Set eviction policy to allkeys-lru\n4. Added TTL=3600 to all session keys\n5. Restarted connection pool",
      prevention: "Enforce TTL on all Redis session keys via code review gate. Add Redis memory alert at 80% threshold. Weekly maxmemory audit.",
      timeToResolve: "32m",
      aiModel: "gpt-4o",
      tokensUsed: 847,
    },
    {
      incidentId: "INC-103",
      rootCause: "Application connection leak in error handling paths — connections not returned to pool on exception, causing gradual pool exhaustion over 6 hours.",
      confidence: 93,
      resolution: "1. Restarted app servers to free stale connections\n2. Deployed hotfix with connection.close() in finally blocks\n3. Increased max_connections to 1000 in Aurora parameter group\n4. Enabled PgBouncer connection pooler",
      prevention: "Mandatory connection cleanup in all error paths. Connection pool monitoring alert at 80%. Integrate connection leak detection in CI.",
      timeToResolve: "28m",
      aiModel: "gpt-4o",
      tokensUsed: 923,
    },
    {
      incidentId: "INC-199",
      rootCause: "Elasticsearch disk usage exceeded 85% watermark on 2 nodes, triggering automatic shard reallocation which failed due to insufficient disk on remaining nodes.",
      confidence: 91,
      resolution: "1. Deleted 30-day old indices using ILM policy\n2. Added 500GB to affected nodes\n3. Manually triggered shard reallocation\n4. Set flood stage watermark to 90%",
      prevention: "Implement ILM (Index Lifecycle Management) with 30-day retention. Disk usage alert at 70%. Monthly ES storage audit.",
      timeToResolve: "45m",
      aiModel: "gpt-4o",
      tokensUsed: 761,
    },
  ];

  console.log("\n📊 Inserting RCA Reports...");
  for (const rca of seedRCA) {
    await db.insert(rcaReports).values(rca).onConflictDoNothing();
    console.log(`  ✓ RCA for ${rca.incidentId}: ${rca.confidence}% confidence`);
  }

  // ── Seed Knowledge Base ───────────────────────────────────────────────────

  const seedKB = [
    {
      id: "KB-001",
      title: "Redis Memory Exhaustion — Root Cause & Resolution Playbook",
      content: "Redis OOM errors are commonly caused by: 1) Missing TTL on session/cache keys, 2) noeviction policy with unbounded key growth, 3) Undersized maxmemory limit. Resolution: flush stale keys, set allkeys-lru eviction, increase maxmemory, add key TTLs. Prevention: enforce TTL in code review, monitor memory at 80%.",
      tags: ["redis", "memory", "oom", "cache", "session"],
      incidentRef: "INC-104",
      successRate: 97,
      usedCount: 12,
    },
    {
      id: "KB-002",
      title: "Kubernetes OOMKilled Pod Recovery Guide",
      content: "OOMKilled occurs when a pod exceeds its memory limit. Root causes: 1) Memory leak in application code, 2) Undersized memory limits, 3) Sudden traffic spike. Resolution: scale pods horizontally, increase memory limits, analyze heap dump for leaks, consider rollback. Prevention: load test memory usage, set HPA, add memory profiling to CI.",
      tags: ["kubernetes", "oomkilled", "memory", "pods", "k8s"],
      incidentRef: "INC-200",
      successRate: 91,
      usedCount: 8,
    },
    {
      id: "KB-003",
      title: "PostgreSQL Connection Pool Exhaustion Fix",
      content: "Connection pool exhaustion occurs when application doesn't release DB connections. Root causes: 1) Missing connection.close() in error paths, 2) Long-running transactions, 3) Insufficient pool size. Resolution: restart app, deploy connection leak fix, enable PgBouncer, increase max_connections. Prevention: connection cleanup in finally blocks, pool monitoring alert.",
      tags: ["postgresql", "aurora", "connections", "pool", "database"],
      incidentRef: "INC-103",
      successRate: 94,
      usedCount: 6,
    },
    {
      id: "KB-004",
      title: "API Gateway Timeout Storm Response Playbook",
      content: "Timeout storms are cascading failures where upstream latency causes downstream timeouts. Root causes: 1) Redis dependency slowdown, 2) N+1 database queries, 3) Missing circuit breakers. Resolution: enable circuit breaker, scale upstream service, implement retry with backoff, temporarily increase timeout thresholds. Prevention: bulkhead pattern, SLA-based timeouts.",
      tags: ["api-gateway", "timeout", "cascade", "circuit-breaker"],
      incidentRef: "INC-201",
      successRate: 88,
      usedCount: 5,
    },
    {
      id: "KB-005",
      title: "Elasticsearch Disk Pressure Recovery Guide",
      content: "Elasticsearch disk pressure triggers automatic shard moves which can fail if all nodes are full. Root causes: 1) Missing ILM policy, 2) Index retention not configured, 3) Sudden data spike. Resolution: delete old indices, expand disk, manually trigger reallocation, set watermarks. Prevention: ILM with data retention policy, disk monitoring at 70%.",
      tags: ["elasticsearch", "disk", "shards", "indices", "ilm"],
      incidentRef: "INC-199",
      successRate: 92,
      usedCount: 4,
    },
  ];

  console.log("\n📚 Inserting Knowledge Base articles...");
  for (const kb of seedKB) {
    await db.insert(knowledgeBase).values(kb).onConflictDoNothing();
    console.log(`  ✓ ${kb.id}: ${kb.title.slice(0, 50)}...`);
  }

  // ── Seed Deployment History ───────────────────────────────────────────────

  const seedDeployments = [
    { service: "API Gateway", version: "v3.4.2", environment: "production", deployedBy: "Aryaman Singh", status: "success", incidentCorrelated: "INC-201" },
    { service: "Payment Service", version: "v2.1.1", environment: "production", deployedBy: "Priya Sharma", status: "failed", incidentCorrelated: "INC-200" },
    { service: "Redis Cache", version: "config-update-3.2.0", environment: "production", deployedBy: "Rahul Mehta", status: "success", incidentCorrelated: "INC-104" },
    { service: "Aurora PostgreSQL", version: "param-group-v2", environment: "production", deployedBy: "Aryaman Singh", status: "success", incidentCorrelated: "INC-103" },
  ];

  console.log("\n🚀 Inserting Deployment History...");
  for (const dep of seedDeployments) {
    await db.insert(deploymentHistory).values(dep).onConflictDoNothing();
    console.log(`  ✓ ${dep.service} ${dep.version} → ${dep.status}`);
  }

  console.log("\n✅ Database seeding complete!");
  console.log(`   ${seedIncidents.length} incidents`);
  console.log(`   ${seedDNA.length} DNA records`);
  console.log(`   ${seedRCA.length} RCA reports`);
  console.log(`   ${seedKB.length} knowledge base articles`);
  console.log(`   ${seedDeployments.length} deployment records`);

  await pool.end();
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
