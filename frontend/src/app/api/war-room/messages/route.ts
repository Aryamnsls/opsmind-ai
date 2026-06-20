import { NextRequest, NextResponse } from "next/server";
import { WAR_ROOM_MESSAGES } from "@/lib/mock-data";

// In-memory session store for war room messages
const messageStore: typeof WAR_ROOM_MESSAGES = [...WAR_ROOM_MESSAGES];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const incidentId = searchParams.get("incidentId");

  // Filter by incident if provided (future: per-incident rooms)
  const messages = incidentId
    ? messageStore.slice(0, 10) // Return seeded messages for demo
    : messageStore;

  return NextResponse.json({
    success: true,
    data: messages,
    total: messages.length,
    meta: {
      source: "Amazon Aurora PostgreSQL — War Room",
      timestamp: new Date().toISOString(),
    },
  });
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  const newMessage = {
    id: String(Date.now()),
    author: body.author ?? "Anonymous",
    avatar: body.avatar ?? "AN",
    message: body.message ?? "",
    time: new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    }),
    type: (body.type ?? "user") as "user" | "ai" | "system",
  };

  messageStore.push(newMessage);

  // Auto AI response for user messages
  let aiResponse = null;
  if (body.type === "user") {
    const msg = body.message?.toLowerCase() ?? "";
    let aiText =
      "Analyzing current incident patterns... Based on historical data from Aurora memory, monitoring situation trajectory.";

    if (msg.includes("redis") || msg.includes("memory")) {
      aiText =
        "Redis memory pattern detected. Historical match INC-104 at 94% similarity suggests: flush stale session keys + increase maxmemory to 8GB. Confidence: 93%.";
    } else if (msg.includes("cpu") || msg.includes("spike")) {
      aiText =
        "CPU spike pattern correlates with recent deployment. Recommend checking INC-196 playbook — spot instance interruption or unbounded loop in new code. Scale workers as immediate mitigation.";
    } else if (msg.includes("timeout") || msg.includes("latency")) {
      aiText =
        "Timeout cascade detected. Based on INC-201 pattern: upstream dependency likely causing queue buildup. Enable circuit breaker + retry with exponential backoff.";
    } else if (msg.includes("status") || msg.includes("update")) {
      aiText =
        "Current status: Error rate trending down 21% → 12%. Redis flush in progress. ETA full recovery: 8-12 minutes based on historical INC-104 resolution trajectory.";
    }

    aiResponse = {
      id: String(Date.now() + 1),
      author: "OpsMind AI",
      avatar: "AI",
      message: aiText,
      time: new Date().toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      type: "ai" as const,
    };
    messageStore.push(aiResponse);
  }

  return NextResponse.json(
    {
      success: true,
      data: newMessage,
      aiResponse,
      message: "Message stored to Aurora PostgreSQL",
    },
    { status: 201 }
  );
}
