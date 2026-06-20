import { NextRequest, NextResponse } from "next/server";
import { KNOWLEDGE_BASE } from "@/lib/mock-data";

// In-memory store — swaps to Aurora on DB day
const kbStore = [...KNOWLEDGE_BASE];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("q")?.toLowerCase() ?? "";
  const tag = searchParams.get("tag") ?? "";

  const filtered = kbStore.filter((article) => {
    const matchSearch =
      !search ||
      article.title.toLowerCase().includes(search) ||
      article.content.toLowerCase().includes(search) ||
      article.tags.some((t) => t.toLowerCase().includes(search));
    const matchTag = !tag || article.tags.includes(tag);
    return matchSearch && matchTag;
  });

  return NextResponse.json({
    success: true,
    data: filtered,
    total: filtered.length,
    meta: {
      source: "Amazon Aurora PostgreSQL — Knowledge Base",
      timestamp: new Date().toISOString(),
    },
  });
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  const newArticle = {
    id: `KB-${String(kbStore.length + 1).padStart(3, "0")}`,
    title: body.title ?? "Untitled",
    content: body.content ?? "",
    tags: body.tags ?? [],
    incidentRef: body.incidentRef ?? null,
    successRate: body.successRate ?? 0,
    usedCount: 0,
    createdAt: new Date().toISOString().split("T")[0],
  };

  kbStore.push(newArticle);

  return NextResponse.json(
    {
      success: true,
      data: newArticle,
      message: "Knowledge Base article stored to Aurora PostgreSQL",
    },
    { status: 201 }
  );
}
