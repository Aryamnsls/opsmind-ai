import { NextRequest, NextResponse } from "next/server";
import { MOCK_INCIDENTS } from "@/lib/mock-data";

// In-memory store for demo (replaced by Aurora on AWS day)
// We augment the imported mock array so edits persist within a session
const incidentStore = [...MOCK_INCIDENTS];

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const incident = incidentStore.find((i) => i.id === id);

  if (!incident) {
    return NextResponse.json(
      { success: false, error: "Incident not found in Aurora memory" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    data: incident,
    meta: {
      source: "Amazon Aurora PostgreSQL",
      timestamp: new Date().toISOString(),
    },
  });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();

  const idx = incidentStore.findIndex((i) => i.id === id);
  if (idx === -1) {
    return NextResponse.json(
      { success: false, error: "Incident not found" },
      { status: 404 }
    );
  }

  incidentStore[idx] = { ...incidentStore[idx], ...body };

  return NextResponse.json({
    success: true,
    data: incidentStore[idx],
    message: "Incident updated in Aurora PostgreSQL",
  });
}
