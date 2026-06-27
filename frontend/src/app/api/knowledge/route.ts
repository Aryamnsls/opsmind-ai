/**
 * OpsMind AI — Knowledge Base API
 * GET  /api/knowledge        — List knowledge base articles (Aurora → mock fallback)
 * POST /api/knowledge        — Create new article
 */

import { NextRequest, NextResponse } from "next/server";
import { db, withDb } from "@/lib/db";
import { knowledgeBase } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import { KNOWLEDGE_BASE } from "@/lib/mock-data";

// ── GET — List knowledge articles ─────────────────────────────────────────────

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("q") ?? "";
    const tag = searchParams.get("tag") ?? "";

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = await withDb<any[]>(
      async (activeDb) => {
        const rows = await activeDb
          .select()
          .from(knowledgeBase)
          .orderBy(desc(knowledgeBase.usedCount), desc(knowledgeBase.successRate))
          .limit(50);

        // Filter in-memory for search/tag since Aurora doesn't have full-text yet
        return rows.filter((article) => {
          const matchSearch =
            !search ||
            article.title.toLowerCase().includes(search.toLowerCase()) ||
            article.content.toLowerCase().includes(search.toLowerCase()) ||
            (article.tags ?? []).some((t) => t.toLowerCase().includes(search.toLowerCase()));
          const matchTag = !tag || (article.tags ?? []).includes(tag);
          return matchSearch && matchTag;
        });
      },
      () => {
        return KNOWLEDGE_BASE.filter((article) => {
          const matchSearch =
            !search ||
            article.title.toLowerCase().includes(search.toLowerCase()) ||
            article.content.toLowerCase().includes(search.toLowerCase()) ||
            article.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
          const matchTag = !tag || article.tags.includes(tag);
          return matchSearch && matchTag;
        });
      }
    );

    return NextResponse.json({
      success: true,
      data,
      total: Array.isArray(data) ? data.length : 0,
      meta: { source: db ? "Amazon Aurora PostgreSQL" : "mock-data" },
    });
  } catch (error) {
    console.error("GET /api/knowledge error:", error);
    return NextResponse.json({ success: true, data: KNOWLEDGE_BASE });
  }
}

// ── POST — Create knowledge article ──────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, content, tags, incidentRef, successRate } = body;

    if (!title || !content) {
      return NextResponse.json(
        { success: false, error: "title and content are required" },
        { status: 400 }
      );
    }

    const kbId = `KB-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const article = await withDb<any>(
      async (activeDb) => {
        const [row] = await activeDb
          .insert(knowledgeBase)
          .values({
            id: kbId,
            title,
            content,
            tags: tags ?? [],
            incidentRef: incidentRef ?? null,
            successRate: successRate ?? 80,
            usedCount: 0,
          })
          .returning();
        return row;
      },
      () => ({
        id: kbId,
        title,
        content,
        tags: tags ?? [],
        incidentRef,
        successRate: successRate ?? 80,
        usedCount: 0,
        createdAt: new Date().toISOString(),
      })
    );

    return NextResponse.json({
      success: true,
      data: article,
      message: db ? "Article stored in Aurora Knowledge Base" : "Article created (mock mode)",
    });
  } catch (error) {
    console.error("POST /api/knowledge error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create knowledge article" },
      { status: 500 }
    );
  }
}
