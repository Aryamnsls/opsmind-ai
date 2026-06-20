import { NextRequest, NextResponse } from "next/server";
import { MOCK_INCIDENTS } from "@/lib/mock-data";

const incidentStore = [...MOCK_INCIDENTS];

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const idx = incidentStore.findIndex((i) => i.id === id);
  if (idx === -1) {
    return NextResponse.json(
      { success: false, error: "Incident not found" },
      { status: 404 }
    );
  }

  const resolvedAt = new Date().toISOString();
  const createdAt = new Date(incidentStore[idx].createdAt).getTime();
  const diffMs = Date.now() - createdAt;
  const diffMin = Math.round(diffMs / 60000);
  const mttr = diffMin < 60 ? `${diffMin}m` : `${Math.floor(diffMin / 60)}h ${diffMin % 60}m`;

  incidentStore[idx] = {
    ...incidentStore[idx],
    status: "resolved",
    resolvedAt,
    mttr,
  };

  // Auto-generate a knowledge base entry stub
  const kbEntry = {
    id: `KB-AUTO-${id}`,
    title: `Resolved: ${incidentStore[idx].title}`,
    content: `Auto-generated from incident resolution. MTTR: ${mttr}.`,
    incidentRef: id,
    resolvedAt,
    storedToAurora: true,
  };

  return NextResponse.json({
    success: true,
    data: incidentStore[idx],
    knowledgeBaseEntry: kbEntry,
    message: `Incident ${id} resolved. MTTR: ${mttr}. RCA stored to Knowledge Base.`,
  });
}
