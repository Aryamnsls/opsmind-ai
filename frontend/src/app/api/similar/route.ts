import { NextRequest, NextResponse } from "next/server";
import { MOCK_INCIDENTS } from "@/lib/mock-data";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { fingerprint, errorSignatures, serviceName } = body;

  // Simulate DNA comparison across historical incidents
  const scored = MOCK_INCIDENTS.filter((inc) => inc.status !== "active").map((inc) => {
    let score = 0;

    // Service name match
    if (inc.service.toLowerCase().includes(serviceName?.toLowerCase() ?? "")) {
      score += 25;
    }

    // Error signature overlap
    const incomingSigs = errorSignatures ?? [];
    const matchedSigs = inc.dna.errorSignatures.filter((sig: string) =>
      incomingSigs.some((s: string) => s.toLowerCase().includes(sig.toLowerCase().slice(0, 5)))
    );
    score += matchedSigs.length * 15;

    // Random noise to simulate embedding similarity
    score += Math.floor(Math.random() * 25);
    score = Math.min(score, 97);

    return {
      incidentId: inc.id,
      title: inc.title,
      similarity: score,
      resolution: inc.rca?.resolution ?? "Resolution not documented",
      confidence: Math.min(score + Math.floor(Math.random() * 10), 99),
      resolvedAt: inc.resolvedAt,
    };
  });

  const sorted = scored.sort((a, b) => b.similarity - a.similarity).slice(0, 5);

  return NextResponse.json({
    success: true,
    data: {
      fingerprint,
      matches: sorted,
      searchedAcross: MOCK_INCIDENTS.length,
      source: "Amazon Aurora PostgreSQL — Incident DNA index",
    },
  });
}
