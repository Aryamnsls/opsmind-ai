"use client";

import Link from "next/link";
import { useState } from "react";
import {
  AlertTriangle,
  ChevronDown,
  Clock,
  Filter,
  Plus,
  Search,
  TrendingUp,
} from "lucide-react";
import { MOCK_INCIDENTS, type Severity, type IncidentStatus } from "@/lib/mock-data";

const SEVERITY_COLORS: Record<Severity, string> = {
  critical: "text-red-400 bg-red-500/10 border-red-500/25",
  high: "text-orange-400 bg-orange-500/10 border-orange-500/25",
  medium: "text-yellow-400 bg-yellow-500/10 border-yellow-500/25",
  low: "text-green-400 bg-green-500/10 border-green-500/25",
};

const STATUS_COLORS: Record<IncidentStatus, string> = {
  active: "text-red-400 bg-red-500/10 border-red-500/25",
  investigating: "text-orange-400 bg-orange-500/10 border-orange-500/25",
  resolved: "text-green-400 bg-green-500/10 border-green-500/25",
  closed: "text-slate-400 bg-slate-500/10 border-slate-500/25",
};

export default function IncidentsPage() {
  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filtered = MOCK_INCIDENTS.filter((inc) => {
    const matchSearch =
      inc.title.toLowerCase().includes(search.toLowerCase()) ||
      inc.id.toLowerCase().includes(search.toLowerCase()) ||
      inc.service.toLowerCase().includes(search.toLowerCase());
    const matchSeverity = severityFilter === "all" || inc.severity === severityFilter;
    const matchStatus = statusFilter === "all" || inc.status === statusFilter;
    return matchSearch && matchSeverity && matchStatus;
  });

  return (
    <main className="min-h-screen p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">Incident Management</p>
          <h1 className="text-2xl font-black text-white">All Incidents</h1>
          <p className="text-sm text-slate-400 mt-0.5">{MOCK_INCIDENTS.length} incidents stored in Aurora memory</p>
        </div>
        <Link
          href="/incidents/new"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white text-sm font-semibold hover:from-orange-400 hover:to-orange-500 transition-all shadow-lg shadow-orange-500/20"
        >
          <Plus className="w-4 h-4" />
          New Incident
        </Link>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Active", count: MOCK_INCIDENTS.filter((i) => i.status === "active").length, color: "text-red-400" },
          { label: "Investigating", count: MOCK_INCIDENTS.filter((i) => i.status === "investigating").length, color: "text-orange-400" },
          { label: "Resolved", count: MOCK_INCIDENTS.filter((i) => i.status === "resolved").length, color: "text-green-400" },
          { label: "Critical", count: MOCK_INCIDENTS.filter((i) => i.severity === "critical").length, color: "text-red-400" },
        ].map((stat) => (
          <div key={stat.label} className="glass-card p-4">
            <p className={`text-2xl font-black ${stat.color}`}>{stat.count}</p>
            <p className="text-xs text-slate-400 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search incidents, services, IDs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-orange-500/50 transition-colors"
          />
        </div>

        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="appearance-none pl-9 pr-8 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-slate-300 focus:outline-none focus:border-orange-500/50 transition-colors cursor-pointer"
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
        </div>

        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="appearance-none pl-4 pr-8 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-slate-300 focus:outline-none focus:border-orange-500/50 transition-colors cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="investigating">Investigating</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
        </div>

        <span className="text-xs text-slate-500">{filtered.length} results</span>
      </div>

      {/* Incidents Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/8">
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wide">Incident</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wide">Severity</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wide">Status</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wide">Service</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wide">Owner</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wide">MTTR</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wide">Created</th>
                <th className="px-5 py-3.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map((incident, i) => (
                <tr
                  key={incident.id}
                  className="hover:bg-white/3 transition-colors group"
                  style={{ animationDelay: `${i * 40}ms` }}
                >
                  <td className="px-5 py-4">
                    <div className="flex items-start gap-3">
                      <div className={`mt-0.5 w-1.5 h-1.5 rounded-full shrink-0 ${
                        incident.status === "active" ? "bg-red-400 animate-pulse" :
                        incident.status === "investigating" ? "bg-orange-400 animate-pulse" :
                        "bg-slate-500"
                      }`} />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs text-orange-400 font-semibold">{incident.id}</span>
                          {incident.rca && (
                            <span className="text-[10px] bg-violet-500/10 border border-violet-500/20 text-violet-400 px-1.5 py-0.5 rounded">RCA</span>
                          )}
                        </div>
                        <p className="font-medium text-slate-200 mt-0.5 group-hover:text-white transition-colors max-w-xs">{incident.title}</p>
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {incident.tags.slice(0, 3).map((tag) => (
                            <span key={tag} className="text-[10px] text-slate-500 bg-white/4 px-1.5 py-0.5 rounded">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs font-semibold uppercase ${SEVERITY_COLORS[incident.severity]}`}>
                      <AlertTriangle className="w-3 h-3" />
                      {incident.severity}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex px-2.5 py-1 rounded-lg border text-xs font-semibold capitalize ${STATUS_COLORS[incident.status]}`}>
                      {incident.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-slate-300 text-xs">{incident.service}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-orange-500/30 to-sky-500/30 border border-white/10 flex items-center justify-center text-[10px] font-bold text-white">
                        {incident.owner.split(" ").map(n => n[0]).join("").slice(0,2)}
                      </div>
                      <span className="text-xs text-slate-400 hidden lg:block">{incident.owner.split(" ")[0]}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    {incident.mttr ? (
                      <div className="flex items-center gap-1 text-green-400">
                        <Clock className="w-3 h-3" />
                        <span className="text-xs font-semibold">{incident.mttr}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-orange-400 animate-pulse">
                        <TrendingUp className="w-3 h-3" />
                        <span className="text-xs">ongoing</span>
                      </div>
                    )}
                  </td>
                  <td className="px-5 py-4 text-xs text-slate-500 font-mono">
                    {new Date(incident.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </td>
                  <td className="px-5 py-4">
                    <Link
                      href={`/incidents/${incident.id}`}
                      className="text-xs text-slate-500 hover:text-orange-400 transition-colors font-medium"
                    >
                      View →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="py-16 text-center">
            <p className="text-slate-400">No incidents match your filters.</p>
            <button
              onClick={() => { setSearch(""); setSeverityFilter("all"); setStatusFilter("all"); }}
              className="mt-3 text-sm text-orange-400 hover:text-orange-300 transition-colors"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
    </main>
  );
}