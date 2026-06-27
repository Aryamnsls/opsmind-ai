/**
 * OpsMind AI — Resolve Incident API
 * POST /api/incidents/[id]/resolve
 *
 * Marks an incident as resolved, sets resolvedAt timestamp,
 * calculates MTTR, and stores the resolution to the Knowledge Base.
 */

import { NextRequest, NextResponse } from "next/server";
import { db, withDb } from "@/lib/db";
import { incidents, knowledgeBase } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { MOCK_INCIDENTS } from "@/lib/mock-data";

type RouteParams = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));

    const resolvedAt = new Date();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await withDb<any | null>(
      async (activeDb) => {
        // Get the original incident to calculate MTTR
        const [original] = await activeDb
          .select()
          .from(incidents)
          .where(eq(incidents.id, id))
          .limit(1);

        if (!original) {
          return null;
        }

        // Calculate MTTR
        const createdAt = original.createdAt ?? resolvedAt;
        const elapsedMs = resolvedAt.getTime() - new Date(createdAt).getTime();
        const minutes = Math.round(elapsedMs / 60_000);
        const mttr = minutes >= 60
          ? `${Math.floor(minutes / 60)}h ${minutes % 60}m`
          : `${minutes}m`;

        // Update incident to resolved
        const [updated] = await activeDb
          .update(incidents)
          .set({
            status: "resolved",
            resolvedAt,
            mttr,
          })
          .where(eq(incidents.id, id))
          .returning();

        // Store to Knowledge Base for future reference
        const kbId = `KB-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
        await activeDb.insert(knowledgeBase).values({
          id: kbId,
          title: `Resolution: ${original.title}`,
          content: body.resolution ?? `Incident ${id} resolved. Service: ${original.service}. Environment: ${original.environment}. Total MTTR: ${mttr}.`,
          tags: [original.service.toLowerCase(), original.severity, "resolved", original.environment ?? "production"],
          incidentRef: id,
          successRate: 85,
          usedCount: 1,
        }).onConflictDoNothing();

        return updated;
      },
      // Mock fallback
      () => {
        const mock = MOCK_INCIDENTS.find((i) => i.id === id);
        return mock ? { ...mock, status: "resolved", resolvedAt, mttr: "18m" } : null;
      }
    );

    if (!result) {
      return NextResponse.json(
        { success: false, error: "Incident not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result,
      message: db
        ? `Incident ${id} resolved. MTTR stored in Aurora. Knowledge Base updated.`
        : `Incident ${id} resolved (mock mode).`,
    });
  } catch (error) {
    console.error("POST /api/incidents/[id]/resolve error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to resolve incident" },
      { status: 500 }
    );
  }
}
