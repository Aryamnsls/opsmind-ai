import { NextRequest, NextResponse } from "next/server";

interface ExtractedError {
  line: number;
  level: string;
  message: string;
  pattern: string;
}

const ERROR_PATTERNS = [
  { pattern: /ETIMEDOUT|connection timed out/i, signature: "ETIMEDOUT", category: "timeout" },
  { pattern: /ECONNREFUSED|connection refused/i, signature: "ECONNREFUSED", category: "connection" },
  { pattern: /OOMKilled|out of memory|exit code 137/i, signature: "OOMKilled", category: "memory" },
  { pattern: /Redis.*OOM|maxmemory exceeded|OOM command not allowed/i, signature: "Redis OOM", category: "redis" },
  { pattern: /too many connections|connection pool exhausted/i, signature: "Connection Pool Exhausted", category: "database" },
  { pattern: /503|502|504|Bad Gateway|Service Unavailable/i, signature: "HTTP 5xx Error", category: "gateway" },
  { pattern: /Segmentation fault|SIGSEGV/i, signature: "SIGSEGV", category: "crash" },
  { pattern: /NullPointerException|null reference/i, signature: "NullPointerException", category: "runtime" },
  { pattern: /disk.*full|no space left|flood stage watermark/i, signature: "Disk Full", category: "storage" },
  { pattern: /CPU.*\b(9[0-9]|100)%|high cpu/i, signature: "CPU Spike", category: "resource" },
  { pattern: /memory.*\b(9[0-9]|100)%|memory pressure/i, signature: "Memory Pressure", category: "resource" },
  { pattern: /rate limit|429|SlowDown|throttl/i, signature: "Rate Limit Exceeded", category: "throttle" },
  { pattern: /SSL.*error|certificate.*invalid|TLS/i, signature: "SSL/TLS Error", category: "security" },
  { pattern: /timeout.*query|query.*timeout|statement.*timeout/i, signature: "DB Query Timeout", category: "database" },
  { pattern: /FATAL|CRITICAL|EMERGENCY/i, signature: "Fatal Error", category: "critical" },
  { pattern: /pod.*evict|eviction.*threshold|spot.*interrupt/i, signature: "K8s Eviction", category: "kubernetes" },
];

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { content, filename } = body;

  if (!content || typeof content !== "string") {
    return NextResponse.json(
      { success: false, error: "Log content is required" },
      { status: 400 }
    );
  }

  const lines = content.split("\n").slice(0, 2000); // Process first 2000 lines
  const errors: ExtractedError[] = [];
  const signatureSet = new Set<string>();
  const categories = new Set<string>();

  lines.forEach((line, idx) => {
    for (const { pattern, signature, category } of ERROR_PATTERNS) {
      if (pattern.test(line)) {
        errors.push({
          line: idx + 1,
          level: line.match(/ERROR|WARN|FATAL|CRITICAL/i)?.[0] ?? "ERROR",
          message: line.trim().slice(0, 200),
          pattern: signature,
        });
        signatureSet.add(signature);
        categories.add(category);
        break;
      }
    }
  });

  const signatures = Array.from(signatureSet);
  const dominantCategory = Array.from(categories)[0] ?? "unknown";

  // Generate summary based on detected patterns
  let summary = "Log analysis complete.";
  if (signatures.length === 0) {
    summary = "No critical error patterns detected. Log appears clean.";
  } else if (signatures.includes("Redis OOM") || signatures.includes("Connection Pool Exhausted")) {
    summary = `Resource exhaustion detected: ${signatures.join(", ")}. Likely root cause: ${dominantCategory} layer failure.`;
  } else if (signatures.includes("OOMKilled")) {
    summary = "Kubernetes pod memory limit breach detected. Memory leak or undersized resource limits.";
  } else if (signatures.includes("ETIMEDOUT") || signatures.includes("ECONNREFUSED")) {
    summary = "Network connectivity issues detected. Upstream service or connection pool problems.";
  } else {
    summary = `${errors.length} error events detected. Primary pattern: ${signatures[0]}.`;
  }

  return NextResponse.json({
    success: true,
    data: {
      filename: filename ?? "uploaded.log",
      linesAnalyzed: lines.length,
      errorsFound: errors.length,
      errorSignatures: signatures,
      dominantCategory,
      summary,
      topErrors: errors.slice(0, 10), // Return top 10 error samples
      categories: Array.from(categories),
      analyzedAt: new Date().toISOString(),
    },
  });
}
