/**
 * OpsMind AI — Incidents API
 * GET  /api/incidents        — List all incidents (Aurora → mock fallback)
 * POST /api/incidents        — Create new incident
 */

import { NextRequest, NextResponse } from "next/server";
import { db, withDb } from "@/lib/db";
import { incidents, incidentDna } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import { MOCK_INCIDENTS } from "@/lib/mock-data";

// ── GET — List all incidents ──────────────────────────────────────────────────

export async function GET() {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = await withDb<any[]>(
      async (activeDb) => {
        const rows = await activeDb
          .select()
          .from(incidents)
          .orderBy(desc(incidents.createdAt))
          .limit(100);
        return rows;
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      () => MOCK_INCIDENTS as any[]
    );

    return NextResponse.json({
      success: true,
      data,
      total: Array.isArray(data) ? data.length : 0,
      meta: {
        source: db ? "Amazon Aurora PostgreSQL" : "mock-data",
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("GET /api/incidents error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch incidents", data: MOCK_INCIDENTS },
      { status: 200 } // Return 200 with mock so UI doesn't break
    );
  }
}

// ── POST — Create new incident ────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, description, severity, environment, owner, service, tags, errorSignatures } = body;

    if (!title || !service) {
      return NextResponse.json(
        { success: false, error: "title and service are required" },
        { status: 400 }
      );
    }

    // Generate Incident DNA fingerprint
    const fingerprint = `DNA-${Math.random().toString(36).slice(2, 10).toUpperCase()}`;
    const incidentId = `INC-${Math.floor(Math.random() * 900) + 100}`;

    // Try to write to Aurora
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const newIncident = await withDb<any>(
      async (activeDb) => {
        // Insert incident
        const [incident] = await activeDb
          .insert(incidents)
          .values({
            id: incidentId,
            title,
            description,
            severity: severity || "high",
            status: "active",
            environment: environment || "production",
            owner,
            service,
            tags: tags ?? [],
          })
          .returning();

        // Insert Incident DNA
        await activeDb.insert(incidentDna).values({
          incidentId: incident.id,
          fingerprint,
          errorSignatures: errorSignatures ?? [],
          serviceName: service,
          cpuUsage: 0,
          memoryUsage: 0,
          networkUsage: 0,
          deploymentMeta: "Pending analysis",
          infraComponents: [],
        });

        return incident;
      },
      // Fallback mock creation
      () => ({
        id: incidentId,
        title,
        description,
        severity: severity || "high",
        status: "active",
        environment: environment || "production",
        owner,
        service,
        tags: tags ?? [],
        createdAt: new Date(),
        resolvedAt: null,
        mttr: null,
      })
    );

    // Build response shape consistent with mock data structure
    const responseData = {
      ...newIncident,
      createdAt: newIncident.createdAt?.toISOString?.() ?? new Date().toISOString(),
      dna: {
        fingerprint,
        errorSignatures: errorSignatures ?? [],
        serviceName: service,
        resourceUsage: { cpu: 0, memory: 0, network: 0 },
        deploymentMeta: "Pending analysis",
        infraComponents: [],
        similarityScore: null,
      },
      timeline: [
        {
          time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
          event: `Incident created: ${title}`,
          type: "alert",
        },
      ],
      tags: tags ?? [],
    };

    return NextResponse.json(
      {
        success: true,
        data: responseData,
        message: db ? "Incident stored to Amazon Aurora PostgreSQL" : "Incident created (mock mode — set DATABASE_URL for Aurora)",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/incidents error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create incident" },
      { status: 500 }
    );
  }
}
