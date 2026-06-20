import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { title, description, severity, service, logs } = body;

  // Simulate OpenAI RCA analysis delay
  await new Promise((r) => setTimeout(r, 50));

  // Build simulated RCA based on inputs
  const causeMap: Record<string, string> = {
    redis: "Redis Memory Exhaustion — connection pool or TTL misconfiguration",
    timeout: "Upstream service latency cascade causing request timeout storm",
    oomkilled: "Memory leak in application layer causing pod memory limit breach",
    database: "Database connection saturation from missing connection cleanup in error paths",
    cpu: "CPU exhaustion from inefficient query or unbounded loop in recent deployment",
    elasticsearch: "Elasticsearch index shard failure due to disk pressure",
    s3: "AWS S3 request rate limit exceeded — prefix strategy required",
    kubernetes: "Kubernetes node eviction from spot instance interruption without PDB",
  };

  const desc = `${title} ${description} ${service} ${logs ?? ""}`.toLowerCase();
  let rootCause = "Application-layer error causing service degradation";
  let confidence = 72;

  for (const [keyword, cause] of Object.entries(causeMap)) {
    if (desc.includes(keyword)) {
      rootCause = cause;
      confidence = Math.floor(Math.random() * 20) + 78;
      break;
    }
  }

  return NextResponse.json({
    success: true,
    data: {
      rootCause,
      confidence,
      resolution: `Immediate action: investigate ${service} service. Apply recommended configuration fix. Monitor error rate post-change.`,
      prevention: "Add monitoring thresholds, automated alerts, and post-deploy validation checks.",
      generatedAt: new Date().toISOString(),
      model: "openai-gpt-4o",
      tokensUsed: Math.floor(Math.random() * 800) + 400,
    },
  });
}
