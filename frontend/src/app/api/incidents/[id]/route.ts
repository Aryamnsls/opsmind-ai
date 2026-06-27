/**
 * OpsMind AI — Single Incident API
 * GET    /api/incidents/[id]          — Get one incident
 * PATCH  /api/incidents/[id]          — Update incident
 * DELETE /api/incidents/[id]          — Delete incident
 */

import { NextRequest, NextResponse } from "next/server";
import { db, withDb } from "@/lib/db";
import { incidents, incidentDna, incidentComments, rcaReports } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { MOCK_INCIDENTS } from "@/lib/mock-data";

type RouteParams = { params: Promise<{ id: string }> };

// ── GET — Single incident ─────────────────────────────────────────────────────

export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = await withDb<any | null>(
      async (activeDb) => {
        const [incident] = await activeDb
          .select()
          .from(incidents)
          .where(eq(incidents.id, id))
          .limit(1);

        if (!incident) return null;

        const [dna] = await activeDb
          .select()
          .from(incidentDna)
          .where(eq(incidentDna.incidentId, id))
          .limit(1);

        const comments = await activeDb
          .select()
          .from(incidentComments)
          .where(eq(incidentComments.incidentId, id))
          .orderBy(incidentComments.createdAt);

        const [rca] = await activeDb
          .select()
          .from(rcaReports)
          .where(eq(rcaReports.incidentId, id))
          .limit(1);

        return { ...incident, dna, comments, rca };
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (): any => MOCK_INCIDENTS.find((i) => i.id === id) ?? null
    );

    if (!data) {
      return NextResponse.json(
        { success: false, error: "Incident not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
      meta: { source: db ? "Amazon Aurora PostgreSQL" : "mock-data" },
    });
  } catch (error) {
    console.error("GET /api/incidents/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch incident" },
      { status: 500 }
    );
  }
}

// ── PATCH — Update incident ───────────────────────────────────────────────────

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await req.json();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updated = await withDb<any>(
      async (activeDb) => {
        const [incident] = await activeDb
          .update(incidents)
          .set({
            ...(body.status && { status: body.status }),
            ...(body.severity && { severity: body.severity }),
            ...(body.owner && { owner: body.owner }),
            ...(body.mttr && { mttr: body.mttr }),
            ...(body.resolvedAt && { resolvedAt: new Date(body.resolvedAt) }),
          })
          .where(eq(incidents.id, id))
          .returning();
        return incident;
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (): any => ({ id, ...body, updatedAt: new Date().toISOString() })
    );

    return NextResponse.json({
      success: true,
      data: updated,
      message: db ? "Updated in Aurora PostgreSQL" : "Updated (mock mode)",
    });
  } catch (error) {
    console.error("PATCH /api/incidents/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update incident" },
      { status: 500 }
    );
  }
}

// ── DELETE — Delete incident ──────────────────────────────────────────────────

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    await withDb<void>(
      async (activeDb) => {
        await activeDb.delete(incidents).where(eq(incidents.id, id));
      },
      () => undefined
    );

    return NextResponse.json({
      success: true,
      message: `Incident ${id} deleted from Aurora memory`,
    });
  } catch (error) {
    console.error("DELETE /api/incidents/[id] error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete incident" },
      { status: 500 }
    );
  }
}
