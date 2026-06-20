"use client";

import { useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  Brain,
  CheckCircle,
  ExternalLink,
  Search,
  Tag,
  TrendingUp,
} from "lucide-react";
import { KNOWLEDGE_BASE } from "@/lib/mock-data";

const ALL_TAGS = Array.from(
  new Set(KNOWLEDGE_BASE.flatMap((a) => a.tags))
).sort();

export default function KnowledgePage() {
  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const filtered = KNOWLEDGE_BASE.filter((article) => {
    const matchSearch =
      search === "" ||
      article.title.toLowerCase().includes(search.toLowerCase()) ||
      article.content.toLowerCase().includes(search.toLowerCase()) ||
      article.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
    const matchTag = !activeTag || article.tags.includes(activeTag);
    return matchSearch && matchTag;
  });

  return (
    <main className="min-h-screen p-6 space-y-6">
      {/* Header */}
      <div>
        <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">Organizational Memory</p>
        <h1 className="text-2xl font-black text-white">Knowledge Base</h1>
        <p className="text-sm text-slate-400 mt-0.5">
          Every resolved incident builds your team&apos;s collective memory — {KNOWLEDGE_BASE.length} articles from Aurora storage
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Articles", value: KNOWLEDGE_BASE.length, icon: BookOpen, color: "text-sky-400" },
          {
            label: "Avg Success Rate",
            value: `${Math.round(KNOWLEDGE_BASE.reduce((a, b) => a + b.successRate, 0) / KNOWLEDGE_BASE.length)}%`,
            icon: TrendingUp,
            color: "text-green-400",
          },
          {
            label: "Total Uses",
            value: KNOWLEDGE_BASE.reduce((a, b) => a + b.usedCount, 0),
            icon: CheckCircle,
            color: "text-orange-400",
          },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="glass-card p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                <Icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div>
                <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
                <p className="text-xs text-slate-400">{stat.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Search & Tags */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <Brain className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-violet-400" />
          <input
            type="text"
            placeholder="AI-powered semantic search... (e.g. Redis memory, connection pool, OOMKilled)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-12 py-3 rounded-xl bg-white/5 border border-white/10 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-violet-500/50 transition-colors"
          />
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTag(null)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              !activeTag
                ? "bg-orange-500/20 border border-orange-500/30 text-orange-400"
                : "bg-white/5 border border-white/8 text-slate-400 hover:text-white hover:bg-white/8"
            }`}
          >
            All Topics
          </button>
          {ALL_TAGS.map((tag) => (
            <button
              key={tag}
              onClick={() => setActiveTag(tag === activeTag ? null : tag)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeTag === tag
                  ? "bg-orange-500/20 border border-orange-500/30 text-orange-400"
                  : "bg-white/5 border border-white/8 text-slate-400 hover:text-white hover:bg-white/8"
              }`}
            >
              <Tag className="w-2.5 h-2.5" />
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Knowledge Cards */}
      <div className="grid md:grid-cols-2 gap-5">
        {filtered.map((article, i) => (
          <div
            key={article.id}
            className="glass-card p-5 space-y-4 hover:border-orange-500/20 transition-all duration-200"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="font-mono text-[11px] text-orange-400 font-semibold">{article.id}</span>
                  <Link
                    href={`/incidents/${article.incidentRef}`}
                    className="text-[11px] text-slate-500 hover:text-sky-400 transition-colors flex items-center gap-0.5"
                  >
                    {article.incidentRef}
                    <ExternalLink className="w-2.5 h-2.5" />
                  </Link>
                </div>
                <h3 className="text-sm font-bold text-white leading-snug">{article.title}</h3>
              </div>
              <div className="text-right shrink-0">
                <p className="text-lg font-black text-green-400">{article.successRate}%</p>
                <p className="text-[10px] text-slate-500">success rate</p>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">{article.content}</p>

            {/* Tags */}
            <div className="flex flex-wrap gap-1.5">
              {article.tags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setActiveTag(tag)}
                  className={`text-[10px] px-2 py-0.5 rounded-md transition-colors ${
                    activeTag === tag
                      ? "bg-orange-500/20 border border-orange-500/30 text-orange-400"
                      : "bg-white/5 border border-white/8 text-slate-500 hover:text-slate-300"
                  }`}
                >
                  #{tag}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-white/5">
              <div className="flex items-center gap-1 text-[11px] text-slate-500">
                <CheckCircle className="w-3 h-3 text-green-400" />
                <span>Used {article.usedCount} times</span>
                <span className="mx-1">·</span>
                <span>{article.createdAt}</span>
              </div>
              <div className="w-16 h-1 rounded-full bg-white/5 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-green-500 to-emerald-400"
                  style={{ width: `${article.successRate}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <Brain className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400">No articles match your search.</p>
          <p className="text-xs text-slate-500 mt-2">Try different keywords or tags</p>
        </div>
      )}
    </main>
  );
}
