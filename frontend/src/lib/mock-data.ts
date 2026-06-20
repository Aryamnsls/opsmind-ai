export type Severity = "critical" | "high" | "medium" | "low";
export type IncidentStatus = "active" | "investigating" | "resolved" | "closed";

export interface IncidentDNA {
  fingerprint: string;
  errorSignatures: string[];
  serviceName: string;
  resourceUsage: { cpu: number; memory: number; network: number };
  deploymentMeta: string;
  infraComponents: string[];
  similarityScore?: number;
}

export interface RCAReport {
  rootCause: string;
  confidence: number;
  resolution: string;
  prevention: string;
  timeToResolve: string;
}

export interface Incident {
  id: string;
  title: string;
  description: string;
  severity: Severity;
  status: IncidentStatus;
  environment: string;
  owner: string;
  service: string;
  createdAt: string;
  resolvedAt?: string;
  mttr?: string;
  dna: IncidentDNA;
  rca?: RCAReport;
  tags: string[];
  timeline: { time: string; event: string; type: "alert" | "action" | "resolve" | "info" }[];
}

export interface KnowledgeArticle {
  id: string;
  title: string;
  content: string;
  tags: string[];
  incidentRef: string;
  successRate: number;
  usedCount: number;
  createdAt: string;
}

export interface WARRoomMessage {
  id: string;
  author: string;
  avatar: string;
  message: string;
  time: string;
  type: "user" | "ai" | "system";
}

export const MOCK_INCIDENTS: Incident[] = [
  {
    id: "INC-201",
    title: "Production API Gateway Timeout Storm",
    description: "Critical timeout cascade originating from upstream Redis connection pool exhaustion affecting 80% of API endpoints.",
    severity: "critical",
    status: "active",
    environment: "production",
    owner: "Aryaman Singh",
    service: "API Gateway",
    createdAt: "2026-06-17T10:01:00Z",
    tags: ["redis", "timeout", "api-gateway", "connection-pool"],
    dna: {
      fingerprint: "DNA-7f2a9b3c",
      errorSignatures: ["ETIMEDOUT", "ECONNREFUSED", "Redis connection pool exhausted"],
      serviceName: "api-gateway-prod",
      resourceUsage: { cpu: 94, memory: 87, network: 72 },
      deploymentMeta: "v3.4.2 deployed 2h ago",
      infraComponents: ["Redis Cluster", "API Gateway", "Load Balancer", "Worker Pods"],
      similarityScore: 94,
    },
    timeline: [
      { time: "10:01", event: "Alert triggered: API Gateway latency > 2000ms", type: "alert" },
      { time: "10:04", event: "CPU spike detected on backend service (94%)", type: "alert" },
      { time: "10:07", event: "Deployment v3.4.2 correlated with timeline", type: "info" },
      { time: "10:10", event: "Error rate increased to 21% — Redis timeouts", type: "alert" },
      { time: "10:15", event: "Similar incident INC-104 matched at 94% similarity", type: "info" },
      { time: "10:18", event: "AI RCA generated — Redis Memory Exhaustion confirmed", type: "action" },
    ],
  },
  {
    id: "INC-200",
    title: "Worker Pod OOMKilled Loop",
    description: "Multiple worker pods entering OOMKilled restart loop after memory leak introduced in payment service v2.1.",
    severity: "high",
    status: "investigating",
    environment: "production",
    owner: "Priya Sharma",
    service: "Payment Service",
    createdAt: "2026-06-17T08:30:00Z",
    tags: ["oomkilled", "memory-leak", "kubernetes", "payment"],
    dna: {
      fingerprint: "DNA-3e8b12f4",
      errorSignatures: ["OOMKilled", "exit code 137", "memory limit exceeded"],
      serviceName: "payment-worker-prod",
      resourceUsage: { cpu: 45, memory: 98, network: 30 },
      deploymentMeta: "v2.1 deployed 5h ago",
      infraComponents: ["Kubernetes Cluster", "Payment Workers", "Aurora DB"],
      similarityScore: 88,
    },
    timeline: [
      { time: "08:30", event: "Alert: pod restart count > 5 in 10 minutes", type: "alert" },
      { time: "08:35", event: "Memory usage at 98% — OOMKilled events detected", type: "alert" },
      { time: "08:40", event: "Root deployment v2.1 identified as culprit", type: "info" },
      { time: "08:45", event: "AI suggests memory profiling + pod scale-up", type: "action" },
    ],
  },
  {
    id: "INC-199",
    title: "Aurora DB Connection Saturation",
    description: "Aurora PostgreSQL connection pool saturated due to connection leak in user-service after code deploy.",
    severity: "critical",
    status: "resolved",
    environment: "production",
    owner: "Rahul Mehta",
    service: "User Service",
    createdAt: "2026-06-16T14:20:00Z",
    resolvedAt: "2026-06-16T15:05:00Z",
    mttr: "45m",
    tags: ["aurora", "postgresql", "connection-pool", "database"],
    dna: {
      fingerprint: "DNA-9c4f7a1b",
      errorSignatures: ["too many connections", "FATAL: connection pool exhausted", "PG::TooManyConnections"],
      serviceName: "user-service-prod",
      resourceUsage: { cpu: 60, memory: 72, network: 88 },
      deploymentMeta: "v1.8.3 deployed same day",
      infraComponents: ["Aurora PostgreSQL", "User Service", "PgBouncer"],
    },
    rca: {
      rootCause: "Missing connection.close() in async error handler path introduced in v1.8.3",
      confidence: 96,
      resolution: "Rolled back to v1.8.2, applied connection cleanup patch, restarted PgBouncer",
      prevention: "Add connection leak detection in CI/CD pipeline, add integration tests for error paths",
      timeToResolve: "45 minutes",
    },
    timeline: [
      { time: "14:20", event: "Alert: DB connection count > 450/500", type: "alert" },
      { time: "14:28", event: "User authentication failing — cascading errors", type: "alert" },
      { time: "14:35", event: "AI identified connection leak in v1.8.3 error handler", type: "action" },
      { time: "14:42", event: "Rollback to v1.8.2 initiated", type: "action" },
      { time: "15:05", event: "Service fully recovered — connections normalized", type: "resolve" },
    ],
  },
  {
    id: "INC-198",
    title: "CDN Cache Invalidation Failure",
    description: "Global CDN cache invalidation failed post-deploy causing stale content served to 40% of users.",
    severity: "medium",
    status: "resolved",
    environment: "production",
    owner: "Ananya Reddy",
    service: "CDN / Frontend",
    createdAt: "2026-06-15T09:00:00Z",
    resolvedAt: "2026-06-15T09:35:00Z",
    mttr: "35m",
    tags: ["cdn", "cache", "frontend", "deployment"],
    dna: {
      fingerprint: "DNA-2d5e8c9a",
      errorSignatures: ["MISS cache-control", "stale content detected", "304 unexpected"],
      serviceName: "cdn-cloudfront",
      resourceUsage: { cpu: 15, memory: 20, network: 95 },
      deploymentMeta: "Frontend v4.2.0",
      infraComponents: ["CloudFront CDN", "S3 Origin", "Route 53"],
    },
    rca: {
      rootCause: "Terraform CDN invalidation script had incorrect wildcard path — only root was invalidated, not sub-paths",
      confidence: 92,
      resolution: "Manual cache purge via AWS Console, fixed Terraform invalidation paths",
      prevention: "Add post-deploy CDN validation check in CI pipeline",
      timeToResolve: "35 minutes",
    },
    timeline: [
      { time: "09:00", event: "Deploy completed — monitoring started", type: "info" },
      { time: "09:05", event: "User reports: stale JS/CSS files being served", type: "alert" },
      { time: "09:15", event: "CDN cache miss ratio abnormal — 40% stale hit", type: "alert" },
      { time: "09:25", event: "Manual cache purge initiated via AWS Console", type: "action" },
      { time: "09:35", event: "All users serving fresh content — incident closed", type: "resolve" },
    ],
  },
  {
    id: "INC-197",
    title: "Elasticsearch Index Corruption",
    description: "Search service returning 500 errors after Elasticsearch index shard corruption due to disk pressure.",
    severity: "high",
    status: "resolved",
    environment: "production",
    owner: "Vikram Nair",
    service: "Search Service",
    createdAt: "2026-06-14T11:30:00Z",
    resolvedAt: "2026-06-14T13:00:00Z",
    mttr: "90m",
    tags: ["elasticsearch", "index", "disk", "search"],
    dna: {
      fingerprint: "DNA-6a1b4e2f",
      errorSignatures: ["index_shard_not_started_exception", "DiskThresholdMonitor", "flood stage watermark exceeded"],
      serviceName: "search-service-prod",
      resourceUsage: { cpu: 78, memory: 65, network: 40 },
      deploymentMeta: "No recent deploy — disk growth",
      infraComponents: ["Elasticsearch Cluster", "Search API", "EBS Volumes"],
    },
    rca: {
      rootCause: "Log rotation misconfiguration caused uncontrolled log growth filling ES data volume (97% full)",
      confidence: 91,
      resolution: "Cleaned old indices, expanded EBS volume from 500GB to 1TB, fixed log rotation",
      prevention: "Add disk usage alerts at 70/80/90% thresholds, automate index lifecycle management",
      timeToResolve: "90 minutes",
    },
    timeline: [
      { time: "11:30", event: "Search 500 errors reported by users", type: "alert" },
      { time: "11:40", event: "Elasticsearch shard corruption detected", type: "alert" },
      { time: "11:55", event: "Disk at 97% — flood stage watermark exceeded", type: "alert" },
      { time: "12:10", event: "EBS expansion initiated + old index cleanup", type: "action" },
      { time: "13:00", event: "Shards recovered — search service restored", type: "resolve" },
    ],
  },
  {
    id: "INC-196",
    title: "Kubernetes Node Group Eviction Storm",
    description: "Spot instance termination caused 30% node loss, triggering mass pod eviction and service degradation.",
    severity: "critical",
    status: "resolved",
    environment: "production",
    owner: "Siddharth Rao",
    service: "Kubernetes Platform",
    createdAt: "2026-06-12T03:15:00Z",
    resolvedAt: "2026-06-12T04:30:00Z",
    mttr: "75m",
    tags: ["kubernetes", "spot-instances", "eviction", "eks"],
    dna: {
      fingerprint: "DNA-8e3c5b7d",
      errorSignatures: ["spot interruption notice", "node not ready", "eviction threshold exceeded"],
      serviceName: "eks-prod-cluster",
      resourceUsage: { cpu: 88, memory: 76, network: 60 },
      deploymentMeta: "Infra change: spot instance ratio increased to 80%",
      infraComponents: ["EKS Cluster", "EC2 Spot Fleet", "Node Groups", "HPA"],
    },
    rca: {
      rootCause: "Spot instance ratio increased to 80% without corresponding disruption budget configuration",
      confidence: 94,
      resolution: "Provisioned on-demand fallback nodes, redistributed workloads, set spot ratio back to 50%",
      prevention: "Implement Pod Disruption Budgets, use mixed instance types, maintain >30% on-demand baseline",
      timeToResolve: "75 minutes",
    },
    timeline: [
      { time: "03:15", event: "AWS spot interruption notices — 12 nodes terminating", type: "alert" },
      { time: "03:20", event: "Mass pod eviction started — 180 pods affected", type: "alert" },
      { time: "03:30", event: "Critical services down — payment, auth, API", type: "alert" },
      { time: "03:45", event: "On-demand node provisioning initiated", type: "action" },
      { time: "04:30", event: "All pods rescheduled — services restored", type: "resolve" },
    ],
  },
  {
    id: "INC-104",
    title: "Redis Memory Exhaustion — Payment Cache",
    description: "Redis cluster memory exhausted after payment session cache TTL misconfiguration caused unbounded growth.",
    severity: "critical",
    status: "closed",
    environment: "production",
    owner: "Aryaman Singh",
    service: "Payment Cache",
    createdAt: "2026-05-20T14:00:00Z",
    resolvedAt: "2026-05-20T15:30:00Z",
    mttr: "90m",
    tags: ["redis", "memory", "cache", "payment"],
    dna: {
      fingerprint: "DNA-1a2b3c4d",
      errorSignatures: ["OOM command not allowed", "MISCONF Redis is configured to save RDB snapshots", "maxmemory exceeded"],
      serviceName: "redis-payment-cache",
      resourceUsage: { cpu: 30, memory: 100, network: 55 },
      deploymentMeta: "Config change: TTL removed from payment sessions",
      infraComponents: ["Redis Cluster", "ElastiCache", "Payment Service"],
    },
    rca: {
      rootCause: "TTL configuration removed from payment session keys during a 'performance optimization' — sessions accumulated indefinitely",
      confidence: 98,
      resolution: "Flushed old sessions, restored TTL=3600s, increased maxmemory from 4GB to 8GB, enabled allkeys-lru eviction",
      prevention: "Mandatory TTL on all cache keys, Redis memory usage alerts at 70%, maxmemory-policy in config management",
      timeToResolve: "90 minutes",
    },
    timeline: [
      { time: "14:00", event: "Redis memory at 95% — alert triggered", type: "alert" },
      { time: "14:10", event: "Payment transactions failing — Redis OOM", type: "alert" },
      { time: "14:20", event: "TTL misconfiguration identified via key analysis", type: "info" },
      { time: "14:35", event: "Session flush + TTL restoration initiated", type: "action" },
      { time: "15:30", event: "Redis stable at 45% memory — payments restored", type: "resolve" },
    ],
  },
  {
    id: "INC-195",
    title: "S3 Rate Limiting on Log Ingestion",
    description: "Log ingestion pipeline hitting S3 PUT request rate limits during peak traffic, causing log loss.",
    severity: "medium",
    status: "resolved",
    environment: "production",
    owner: "Meera Krishnan",
    service: "Log Pipeline",
    createdAt: "2026-06-10T16:00:00Z",
    resolvedAt: "2026-06-10T16:45:00Z",
    mttr: "45m",
    tags: ["s3", "rate-limiting", "logging", "pipeline"],
    dna: {
      fingerprint: "DNA-5f6a7b8c",
      errorSignatures: ["SlowDown: reduce request rate", "503 Slow Down", "S3 rate limit exceeded"],
      serviceName: "log-ingestion-pipeline",
      resourceUsage: { cpu: 55, memory: 40, network: 92 },
      deploymentMeta: "Traffic 3x normal — product launch",
      infraComponents: ["S3", "Kinesis Firehose", "Lambda", "CloudWatch"],
    },
    rca: {
      rootCause: "Single S3 prefix used for all logs causing request concentration, exceeded 3500 PUT/s per prefix limit",
      confidence: 89,
      resolution: "Implemented date-partitioned S3 prefix strategy, added Kinesis buffer, increased batch size",
      prevention: "S3 prefix partitioning from day 1, monitor S3 request metrics proactively",
      timeToResolve: "45 minutes",
    },
    timeline: [
      { time: "16:00", event: "Log ingestion failures detected — S3 503s", type: "alert" },
      { time: "16:10", event: "Traffic 3x normal due to product launch", type: "info" },
      { time: "16:20", event: "S3 rate limit root cause identified", type: "info" },
      { time: "16:30", event: "Prefix partitioning deployed + Kinesis buffer enabled", type: "action" },
      { time: "16:45", event: "Log ingestion stable — 0 losses", type: "resolve" },
    ],
  },
];

export const KNOWLEDGE_BASE: KnowledgeArticle[] = [
  {
    id: "KB-001",
    title: "Redis Memory Exhaustion: Detection & Resolution",
    content: "Redis memory exhaustion is a common pattern in high-traffic services. Key indicators include OOM errors, increasing latency, and sudden cache miss rate spikes. Resolution: (1) Check maxmemory-policy, (2) Identify keys without TTL, (3) Flush stale data, (4) Scale memory allocation.",
    tags: ["redis", "memory", "cache", "performance"],
    incidentRef: "INC-104",
    successRate: 94,
    usedCount: 12,
    createdAt: "2026-05-21",
  },
  {
    id: "KB-002",
    title: "Kubernetes OOMKilled: Memory Leak Investigation",
    content: "OOMKilled pods indicate a container exceeding its memory limit. Steps: (1) Check resource limits in deployment spec, (2) Heap dump analysis, (3) Profile allocations, (4) Check for unbounded caches or buffers, (5) Review recent code changes for leak patterns.",
    tags: ["kubernetes", "oomkilled", "memory-leak", "debugging"],
    incidentRef: "INC-200",
    successRate: 88,
    usedCount: 8,
    createdAt: "2026-06-01",
  },
  {
    id: "KB-003",
    title: "Aurora PostgreSQL: Connection Pool Exhaustion",
    content: "Connection exhaustion in Aurora occurs when application connections are not properly released. Root causes: missing connection.close() in error paths, unbounded connection growth, PgBouncer misconfiguration. Fix: Audit connection lifecycle, enable connection pooling properly.",
    tags: ["aurora", "postgresql", "connections", "database"],
    incidentRef: "INC-199",
    successRate: 96,
    usedCount: 7,
    createdAt: "2026-06-17",
  },
  {
    id: "KB-004",
    title: "AWS Spot Instance Interruption: Resilience Patterns",
    content: "Spot instances can be interrupted with 2-minute notice. Best practices: Use Pod Disruption Budgets, maintain 30% on-demand baseline, implement graceful shutdown handlers, use mixed instance types, enable Karpenter or Cluster Autoscaler.",
    tags: ["aws", "spot", "kubernetes", "eks", "resilience"],
    incidentRef: "INC-196",
    successRate: 91,
    usedCount: 5,
    createdAt: "2026-06-13",
  },
  {
    id: "KB-005",
    title: "S3 Request Rate Limiting: Prefix Strategy",
    content: "S3 supports 3,500 PUT and 5,500 GET requests per second per prefix. To avoid rate limits: use date-based prefix partitioning, implement exponential backoff, use Kinesis Firehose for buffering, distribute writes across multiple prefixes.",
    tags: ["s3", "aws", "rate-limiting", "storage"],
    incidentRef: "INC-195",
    successRate: 89,
    usedCount: 4,
    createdAt: "2026-06-11",
  },
  {
    id: "KB-006",
    title: "Elasticsearch Index Recovery After Disk Pressure",
    content: "ES enters flood stage when disk >95% full, making indices read-only. Recovery: (1) Free disk space immediately, (2) Reset read-only blocks, (3) Implement ILM policies for automatic cleanup, (4) Add disk usage CloudWatch alarms at 70/80/90%.",
    tags: ["elasticsearch", "disk", "index", "storage"],
    incidentRef: "INC-197",
    successRate: 91,
    usedCount: 3,
    createdAt: "2026-06-15",
  },
  {
    id: "KB-007",
    title: "CDN Cache Invalidation Best Practices",
    content: "Stale CDN content after deployments is a common issue. Best practices: Use versioned asset filenames for JS/CSS, implement proper cache-control headers, automate invalidation in CI/CD with path wildcards, verify invalidation completion before announcing deploy success.",
    tags: ["cdn", "cloudfront", "cache", "deployment"],
    incidentRef: "INC-198",
    successRate: 92,
    usedCount: 6,
    createdAt: "2026-06-16",
  },
];

export const WAR_ROOM_MESSAGES: WARRoomMessage[] = [
  { id: "1", author: "System", avatar: "🤖", message: "Incident INC-201 created — AI War Room activated", time: "10:01", type: "system" },
  { id: "2", author: "Aryaman Singh", avatar: "AS", message: "I'm on it — pulling logs from production API gateway now", time: "10:03", type: "user" },
  { id: "3", author: "OpsMind AI", avatar: "AI", message: "Analysis complete. Pattern matches INC-104 at 94% similarity. Root cause: Redis connection pool exhaustion. Recommended action: Increase Redis maxmemory + restart connection pool.", time: "10:05", type: "ai" },
  { id: "4", author: "Priya Sharma", avatar: "PS", message: "Confirmed — Redis memory at 97%. Starting flush of stale sessions.", time: "10:07", type: "user" },
  { id: "5", author: "System", avatar: "🤖", message: "Deployment v3.4.2 tagged as incident-correlated — rollback available", time: "10:09", type: "system" },
  { id: "6", author: "Rahul Mehta", avatar: "RM", message: "Load balancer showing 21% error rate. Rerouting 30% traffic to us-west-2 as mitigation.", time: "10:11", type: "user" },
  { id: "7", author: "OpsMind AI", avatar: "AI", message: "Traffic rerouting detected. Based on INC-196 historical playbook: Estimated full recovery in 18-25 minutes if Redis flush + pool restart proceed as planned.", time: "10:12", type: "ai" },
  { id: "8", author: "Aryaman Singh", avatar: "AS", message: "Redis flush done. Maxmemory increased to 8GB. Restarting connection pool now.", time: "10:15", type: "user" },
  { id: "9", author: "System", avatar: "🤖", message: "Error rate dropping — 21% → 14% → 7%", time: "10:18", type: "system" },
  { id: "10", author: "OpsMind AI", avatar: "AI", message: "Recovery trajectory confirmed. Projecting full resolution at 10:22. RCA report being generated.", time: "10:19", type: "ai" },
];

export const ANALYTICS_DATA = {
  mttrTrend: [
    { month: "Jan", mttr: 95 },
    { month: "Feb", mttr: 82 },
    { month: "Mar", mttr: 74 },
    { month: "Apr", mttr: 61 },
    { month: "May", mttr: 48 },
    { month: "Jun", mttr: 18 },
  ],
  severityBreakdown: [
    { name: "Critical", value: 8, fill: "#ef4444" },
    { name: "High", value: 14, fill: "#f97316" },
    { name: "Medium", value: 22, fill: "#eab308" },
    { name: "Low", value: 18, fill: "#22c55e" },
  ],
  confidenceTrend: [
    { week: "W1", confidence: 72 },
    { week: "W2", confidence: 78 },
    { week: "W3", confidence: 84 },
    { week: "W4", confidence: 89 },
    { week: "W5", confidence: 92 },
    { week: "W6", confidence: 94 },
  ],
  incidentsByService: [
    { service: "API Gateway", count: 12 },
    { service: "Payment", count: 9 },
    { service: "Auth", count: 7 },
    { service: "Search", count: 5 },
    { service: "CDN", count: 4 },
    { service: "Database", count: 11 },
  ],
};

export const SERVICES_HEALTH = [
  { name: "Frontend CDN", status: "healthy", uptime: 99.98, latency: 45 },
  { name: "API Gateway", status: "degraded", uptime: 98.2, latency: 2100 },
  { name: "Auth Service", status: "healthy", uptime: 99.95, latency: 82 },
  { name: "Payment Service", status: "investigating", uptime: 97.1, latency: 450 },
  { name: "Aurora DB (Primary)", status: "healthy", uptime: 99.99, latency: 12 },
  { name: "Aurora DB (Replica)", status: "healthy", uptime: 99.97, latency: 18 },
  { name: "Redis Cache", status: "degraded", uptime: 97.5, latency: 890 },
  { name: "S3 / Log Store", status: "healthy", uptime: 99.99, latency: 23 },
  { name: "Worker Queue", status: "healthy", uptime: 99.8, latency: 95 },
  { name: "Search Service", status: "healthy", uptime: 99.4, latency: 130 },
];

export const SIMILAR_INCIDENTS = [
  { id: "INC-104", title: "Redis Memory Exhaustion", similarity: 94, resolution: "Increase maxmemory + flush stale keys", confidence: 96, usedAt: "2026-05-20" },
  { id: "INC-087", title: "Connection Pool Timeout Storm", similarity: 78, resolution: "Restart connection pool + scale Redis", confidence: 82, usedAt: "2026-04-12" },
  { id: "INC-063", title: "API Gateway Cascade Failure", similarity: 71, resolution: "Circuit breaker + traffic reroute", confidence: 74, usedAt: "2026-02-28" },
];
