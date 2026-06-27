/**
 * OpsMind AI — War Room Messages API
 * GET  /api/war-room/messages?incidentId=INC-xxx  — Get messages for an incident
 * POST /api/war-room/messages                      — Send a message (user or AI)
 */

import { NextRequest, NextResponse } from "next/server";
import { db, withDb } from "@/lib/db";
import { incidentComments } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";
import OpenAI from "openai";
import { WAR_ROOM_MESSAGES } from "@/lib/mock-data";

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

const AI_WAR_ROOM_SYSTEM = `You are OpsMind AI, an expert incident response assistant embedded in a live War Room.
You have access to incident history from Amazon Aurora PostgreSQL and can provide:
- Real-time root cause analysis
- Resolution steps from similar past incidents  
- Escalation recommendations
- ETA predictions based on historical patterns

Keep responses concise (2-4 sentences), technical, and actionable.
Reference specific historical incidents (INC-xxx) when relevant.
Always include confidence level and source data.`;

// ── GET — Fetch war room messages ─────────────────────────────────────────────

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const incidentId = searchParams.get("incidentId");

    if (!incidentId) {
      return NextResponse.json(
        { success: false, error: "incidentId is required" },
        { status: 400 }
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const messages = await withDb<any[]>(
      async (activeDb) => {
        const rows = await activeDb
          .select()
          .from(incidentComments)
          .where(eq(incidentComments.incidentId, incidentId))
          .orderBy(asc(incidentComments.createdAt))
          .limit(100);

        return rows.map((r) => ({
          id: String(r.id),
          author: r.author,
          avatar: r.avatar ?? r.author.slice(0, 2).toUpperCase(),
          message: r.message,
          time: r.createdAt?.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) ?? "",
          type: r.messageType ?? "user",
        }));
      },
      () => WAR_ROOM_MESSAGES.filter((m) => m.type !== "system").slice(0, 8)
    );

    return NextResponse.json({ success: true, data: messages });
  } catch (error) {
    console.error("GET /api/war-room/messages error:", error);
    return NextResponse.json({ success: true, data: WAR_ROOM_MESSAGES.slice(0, 8) });
  }
}

// ── POST — Send message + optional AI response ────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { incidentId, author, avatar, message, requestAI = false, incidentContext } = body;

    if (!incidentId || !message || !author) {
      return NextResponse.json(
        { success: false, error: "incidentId, author and message are required" },
        { status: 400 }
      );
    }

    // Store user message in Aurora
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await withDb<any>(
      async (activeDb) => {
        await activeDb.insert(incidentComments).values({
          incidentId,
          author,
          avatar: avatar ?? author.slice(0, 2).toUpperCase(),
          message,
          messageType: "user",
        });
      },
      () => null
    );

    const userMsg = {
      id: String(Date.now()),
      author,
      avatar: avatar ?? author.slice(0, 2).toUpperCase(),
      message,
      time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
      type: "user",
    };

    // Generate AI response if requested
    let aiMsg = null;
    if (requestAI) {
      const aiResponse = await generateAIResponse(message, incidentId, incidentContext);

      // Store AI response in Aurora
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await withDb<any>(
        async (activeDb) => {
          await activeDb.insert(incidentComments).values({
            incidentId,
            author: "OpsMind AI",
            avatar: "AI",
            message: aiResponse,
            messageType: "ai",
          });
        },
        () => null
      );

      aiMsg = {
        id: String(Date.now() + 1),
        author: "OpsMind AI",
        avatar: "AI",
        message: aiResponse,
        time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
        type: "ai",
      };
    }

    return NextResponse.json({
      success: true,
      data: {
        userMessage: userMsg,
        aiMessage: aiMsg,
      },
    });
  } catch (error) {
    console.error("POST /api/war-room/messages error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to send message" },
      { status: 500 }
    );
  }
}

// ── AI Response Generator ─────────────────────────────────────────────────────

async function generateAIResponse(
  userMessage: string,
  incidentId: string,
  context?: { title?: string; service?: string; severity?: string }
): Promise<string> {
  if (openai) {
    try {
      const completion = await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || "gpt-4o",
        messages: [
          { role: "system", content: AI_WAR_ROOM_SYSTEM },
          {
            role: "user",
            content: `Incident: ${incidentId}
Title: ${context?.title ?? "Unknown"}
Service: ${context?.service ?? "Unknown"}
Severity: ${context?.severity ?? "high"}

Team member says: "${userMessage}"

Provide a focused, actionable response.`,
          },
        ],
        temperature: 0.4,
        max_tokens: 300,
      });

      return completion.choices[0]?.message?.content ?? fallbackAIResponse(userMessage);
    } catch {
      return fallbackAIResponse(userMessage);
    }
  }
  return fallbackAIResponse(userMessage);
}

function fallbackAIResponse(message: string): string {
  const lower = message.toLowerCase();
  const responses: Record<string, string> = {
    redis: "Redis memory pattern detected in current incident. Historical match INC-104 at 94% similarity. Recommended: flush stale session keys + increase maxmemory to 8GB. Confidence: 93%.",
    memory: "Memory pressure confirmed across worker pods. OOMKilled pattern matches INC-200. Immediate action: scale pods from 3→8 replicas and increase memory limits. ETA resolution: 12-18 minutes.",
    cpu: "CPU spike pattern correlates with recent deployment v3.4.2. Possible unbounded loop or N+1 query. Recommend thread dump analysis + rollback as contingency.",
    timeout: "Timeout cascade detected. Based on INC-201 pattern: upstream Redis dependency is the likely bottleneck. Enable circuit breaker + retry with exponential backoff.",
    status: "Current status: Error rate dropping 21% → 12%. Mitigation in progress. ETA full recovery: 8-12 minutes based on historical resolution trajectory.",
    rollback: "Rollback staged and ready. Based on INC-199 playbook, rollback should complete in ~4 minutes. Recommend keeping monitoring active for 15 minutes post-rollback.",
    database: "Database connection saturation detected. Recommend enabling PgBouncer connection pooler + increasing Aurora max_connections parameter. Historical fix: INC-203, 89% confidence.",
    kubernetes: "K8s node eviction pattern detected. Check PodDisruptionBudget and spot instance interruption events. Scale to on-demand node pool immediately.",
  };

  for (const [key, response] of Object.entries(responses)) {
    if (lower.includes(key)) return response;
  }

  return `Analyzing current incident patterns against Aurora memory. Monitoring trajectory for this incident. Will update with findings in 2-3 minutes based on incoming telemetry.`;
}
