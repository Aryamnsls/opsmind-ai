/**
 * OpsMind AI — Log Upload & Analysis API
 * POST /api/log-upload
 *
 * 1. Analyzes log content with regex pattern matching
 * 2. Uses OpenAI to generate an intelligent summary (if available)
 * 3. Uploads the log file to Amazon S3 (if configured)
 * 4. Returns error signatures, categories, and AI summary
 */

import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

// S3 client — loaded lazily only if env vars are set
let s3Client: import("@aws-sdk/client-s3").S3Client | null = null;

async function getS3Client() {
  if (s3Client) return s3Client;
  if (
    !process.env.AWS_ACCESS_KEY_ID ||
    !process.env.AWS_SECRET_ACCESS_KEY ||
    !process.env.S3_BUCKET_NAME
  ) {
    return null;
  }
  try {
    const { S3Client } = await import("@aws-sdk/client-s3");
    s3Client = new S3Client({
      region: process.env.AWS_REGION || "us-east-1",
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });
    return s3Client;
  } catch {
    return null;
  }
}

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
  { pattern: /heap.*space|java\.lang\.OutOfMemory/i, signature: "JVM Heap OOM", category: "memory" },
  { pattern: /circuit.*breaker|fallback.*triggered/i, signature: "Circuit Breaker Triggered", category: "resilience" },
  { pattern: /deadlock|lock.*timeout/i, signature: "Database Deadlock", category: "database" },
  { pattern: /connection reset|broken pipe/i, signature: "Connection Reset", category: "network" },
];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { content, filename, incidentId } = body;

    if (!content || typeof content !== "string") {
      return NextResponse.json(
        { success: false, error: "Log content is required" },
        { status: 400 }
      );
    }

    // ── 1. Pattern-based error extraction ──────────────────────────────────────
    const lines = content.split("\n").slice(0, 3000);
    const errors: ExtractedError[] = [];
    const signatureSet = new Set<string>();
    const categories = new Set<string>();

    lines.forEach((line, idx) => {
      for (const { pattern, signature, category } of ERROR_PATTERNS) {
        if (pattern.test(line)) {
          errors.push({
            line: idx + 1,
            level: line.match(/ERROR|WARN|FATAL|CRITICAL|INFO/i)?.[0] ?? "ERROR",
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

    // ── 2. OpenAI-powered log summary ─────────────────────────────────────────
    let summary = generateBaseSummary(signatures, errors, dominantCategory);
    let aiSummary: string | null = null;

    if (openai && content.length > 100) {
      try {
        const logSample = content.slice(0, 4000);
        const completion = await openai.chat.completions.create({
          model: process.env.OPENAI_MODEL || "gpt-4o",
          messages: [
            {
              role: "system",
              content: `You are an expert SRE log analysis engine. Analyze the provided log snippet and:
1. Identify the primary error pattern and root cause in 1-2 sentences
2. List the top 3 contributing factors  
3. Estimate severity (critical/high/medium/low)
4. Suggest immediate next steps

Respond in JSON: { "summary": "...", "factors": ["...", "..."], "severity": "...", "nextSteps": ["..."] }`,
            },
            {
              role: "user",
              content: `Analyze this production log:\n\nDetected signatures: ${signatures.join(", ") || "none"}\n\nLog content:\n\`\`\`\n${logSample}\n\`\`\``,
            },
          ],
          response_format: { type: "json_object" },
          temperature: 0.2,
          max_tokens: 500,
        });

        const raw = completion.choices[0]?.message?.content;
        if (raw) {
          const parsed = JSON.parse(raw);
          aiSummary = parsed.summary ?? null;
          if (parsed.summary) summary = parsed.summary;
        }
      } catch (aiError) {
        console.error("OpenAI log analysis failed:", aiError);
      }
    }

    // ── 3. Upload to S3 ───────────────────────────────────────────────────────
    let s3Url: string | null = null;
    const s3 = await getS3Client();

    if (s3 && process.env.S3_BUCKET_NAME) {
      try {
        const { PutObjectCommand } = await import("@aws-sdk/client-s3");
        const key = `logs/${incidentId ?? "unassigned"}/${Date.now()}-${filename ?? "upload.log"}`;
        await s3.send(
          new PutObjectCommand({
            Bucket: process.env.S3_BUCKET_NAME,
            Key: key,
            Body: content,
            ContentType: "text/plain",
            Metadata: {
              incidentId: incidentId ?? "",
              signatures: signatures.join(","),
              uploadedAt: new Date().toISOString(),
            },
          })
        );
        s3Url = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION ?? "us-east-1"}.amazonaws.com/${key}`;
        console.log("✅ Log uploaded to S3:", s3Url);
      } catch (s3Error) {
        console.error("S3 upload failed (continuing without S3):", s3Error);
      }
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
        aiSummary,
        topErrors: errors.slice(0, 10),
        categories: Array.from(categories),
        s3Url,
        storage: s3Url ? "Amazon S3" : "in-memory",
        analyzedAt: new Date().toISOString(),
        aiPowered: !!openai,
      },
    });
  } catch (error) {
    console.error("POST /api/log-upload error:", error);
    return NextResponse.json(
      { success: false, error: "Log analysis failed" },
      { status: 500 }
    );
  }
}

function generateBaseSummary(
  signatures: string[],
  errors: ExtractedError[],
  dominantCategory: string
): string {
  if (signatures.length === 0) return "No critical error patterns detected. Log appears clean.";
  if (signatures.includes("Redis OOM") || signatures.includes("Connection Pool Exhausted")) {
    return `Resource exhaustion detected: ${signatures.join(", ")}. Likely root cause: ${dominantCategory} layer failure.`;
  }
  if (signatures.includes("OOMKilled")) {
    return "Kubernetes pod memory limit breach detected. Memory leak or undersized resource limits.";
  }
  if (signatures.includes("ETIMEDOUT") || signatures.includes("ECONNREFUSED")) {
    return "Network connectivity issues detected. Upstream service or connection pool problems.";
  }
  if (signatures.includes("K8s Eviction")) {
    return "Kubernetes node eviction detected. Spot instance interruption or resource pressure.";
  }
  return `${errors.length} error events detected. Primary pattern: ${signatures[0]}. Category: ${dominantCategory}.`;
}
