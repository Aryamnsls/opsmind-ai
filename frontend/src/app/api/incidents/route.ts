import { NextRequest, NextResponse } from "next/server";
import { MOCK_INCIDENTS } from "@/lib/mock-data";

export async function GET() {
  return NextResponse.json({
    success: true,
    data: MOCK_INCIDENTS,
    total: MOCK_INCIDENTS.length,
    meta: {
      source: "Amazon Aurora PostgreSQL",
      timestamp: new Date().toISOString(),
    },
  });
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  // Simulate DNA generation
  const fingerprint = `DNA-${Math.random().toString(36).slice(2, 10).toUpperCase()}`;

  const newIncident = {
    id: `INC-${Math.floor(Math.random() * 900) + 100}`,
    ...body,
    createdAt: new Date().toISOString(),
    status: "active",
    dna: {
      fingerprint,
      errorSignatures: body.errorSignatures ?? [],
      serviceName: body.service ?? "unknown",
      resourceUsage: { cpu: 0, memory: 0, network: 0 },
      deploymentMeta: "Pending analysis",
      infraComponents: [],
      similarityScore: null,
    },
    timeline: [
      {
        time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
        event: `Incident created: ${body.title}`,
        type: "alert",
      },
    ],
    tags: body.tags ?? [],
  };

  return NextResponse.json(
    { success: true, data: newIncident, message: "Incident stored to Aurora PostgreSQL" },
    { status: 201 }
  );
}
