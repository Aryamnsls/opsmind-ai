"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  Activity,
  AlertTriangle,
  Brain,
  Clock,
  Database,
  Plus,
  RefreshCw,
  Zap,
} from "lucide-react";
import { MetricCard } from "@/components/ui/dashboard/MetricCard";
import { IncidentTimeline } from "@/components/ui/dashboard/IncidentTimeline";
import { IncidentDNA } from "@/components/ui/dashboard/IncidentDNA";
import { AIRecommendation } from "@/components/ui/dashboard/AIRecommendation";
import { HealthMap } from "@/components/ui/dashboard/HealthMap";
import { MOCK_INCIDENTS, SIMILAR_INCIDENTS, type Incident } from "@/lib/mock-data";

const SIMILAR_INC = SIMILAR_INCIDENTS[0];

export default function DashboardPage() {
  const [incidents, setIncidents] = useState<Incident[]>(MOCK_INCIDENTS);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());

  const fetchIncidents = useCallback(async () => {
    setRefreshing(true);
    try {
      const res = await fetch("/api/incidents");
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          setIncidents(data.data);
        }
      }
    } catch (e) {
      console.error("Refresh failed:", e);
    } finally {
      setRefreshing(false);
      setLastRefreshed(new Date());
    }
  }, []);

  // Auto-refresh every 60 seconds
  useEffect(() => {
    const interval = setInterval(fetchIncidents, 60_000);
    return () => clearInterval(interval);
  }, [fetchIncidents]);

  const activeIncidents = incidents.filter((i) => i.status === "active" || i.status === "investigating");
  const activeIncident = incidents[0];

  return (
    <main className="min-h-screen p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">Incident Memory Engine</p>
          <h1 className="text-2xl font-black text-white">Operations Dashboard</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Real-time infrastructure intelligence — Aurora PostgreSQL backend
            <span className="text-slate-600 ml-2 text-xs font-mono">
              · refreshed {lastRefreshed.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
            </span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            id="btn-refresh-dashboard"
            onClick={fetchIncidents}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 text-slate-400 text-sm hover:bg-white/5 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
          <Link
            href="/incidents/new"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white text-sm font-semibold hover:from-orange-400 hover:to-orange-500 transition-all shadow-lg shadow-orange-500/20"
          >
            <Plus className="w-4 h-4" />
            New Incident
          </Link>
        </div>
      </div>

      {/* Active incident banner */}
      {activeIncident && (
        <div className="glass-card p-4 border-l-4 border-red-500 bg-red-500/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-8 h-8 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-red-500/30 animate-ping" />
              <AlertTriangle className="w-5 h-5 text-red-400 relative" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-red-400">
                  {activeIncidents.length} ACTIVE
                </span>
                <span className="font-mono text-xs text-slate-400">{activeIncident.id}</span>
              </div>
              <p className="text-sm text-slate-300">{activeIncident.title}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-xs text-slate-500">Service</p>
              <p className="text-sm font-semibold text-slate-200">{activeIncident.service}</p>
            </div>
            <Link
              href={`/incidents/${activeIncident.id}`}
              className="px-4 py-2 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 text-sm font-semibold hover:bg-red-500/25 transition-colors"
            >
              View Incident →
            </Link>
          </div>
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Active Incidents"
          value={String(activeIncidents.length)}
          numericValue={activeIncidents.length}
          label={`${activeIncidents.filter((i) => i.severity === "critical").length} critical active`}
          icon={AlertTriangle}
          trend="up"
          trendPositive={false}
          color="orange"
          delay={0}
        />
        <MetricCard
          title="AI RCA Accuracy"
          value="92%"
          numericValue={92}
          label="94% on last match"
          icon={Brain}
          trend="up"
          trendPositive={true}
          color="sky"
          delay={100}
        />
        <MetricCard
          title="MTTR (avg)"
          value="18m"
          numericValue={18}
          label="42% faster recovery"
          icon={Zap}
          trend="down"
          trendPositive={true}
          color="green"
          delay={200}
        />
        <MetricCard
          title="Stored Incidents"
          value={String(incidents.length)}
          numericValue={incidents.length}
          label="Aurora PostgreSQL"
          icon={Database}
          trend="up"
          trendPositive={true}
          color="violet"
          delay={300}
        />
      </div>

      {/* Main 3-column grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Live Timeline — col-span-2 */}
        <div className="glass-card p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Activity className="w-4.5 h-4.5 text-sky-400" />
              <h2 className="text-base font-bold text-white">Live Incident Timeline</h2>
              <span className="text-[10px] font-semibold text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-full animate-pulse">
                ● LIVE
              </span>
            </div>
            <Link
              href={`/incidents/${activeIncident?.id}`}
              className="text-xs text-sky-400 hover:text-sky-300 transition-colors"
            >
              Full details →
            </Link>
          </div>
          {activeIncident && (
            <IncidentTimeline
              events={activeIncident.timeline}
              incidentId={activeIncident.id}
              live={true}
            />
          )}
        </div>

        {/* Infrastructure Health */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <h2 className="text-base font-bold text-white">Infrastructure Health</h2>
          </div>
          <HealthMap />
        </div>
      </div>

      {/* Bottom 2-column: DNA + AI Recommendation */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Incident DNA */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-bold text-white">Incident DNA™ Match</h2>
            <Link href="/incidents" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">
              View all →
            </Link>
          </div>
          {activeIncident && (
            <IncidentDNA
              fingerprint={activeIncident.dna.fingerprint}
              errorSignatures={activeIncident.dna.errorSignatures}
              similarityScore={activeIncident.dna.similarityScore ?? 94}
              matchedIncident={SIMILAR_INC.id}
              rootCause={SIMILAR_INC.resolution}
              confidence={SIMILAR_INC.confidence}
            />
          )}
        </div>

        {/* AI Recommendation */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-bold text-white">AI Recommendation</h2>
            <span className="text-[10px] text-slate-500 font-mono">OpenAI RCA Engine</span>
          </div>
          <AIRecommendation
            suggestedFix="Scale Worker Pods + Flush Redis Cache"
            confidence={93}
            basedOn={8}
            successRate={87}
            resolution="Increase Redis maxmemory from 4GB to 8GB, flush stale payment session keys (TTL=0), restart connection pool, scale worker pods from 3 to 8 replicas. Monitor error rate for 10 minutes post-fix."
            incidentId={SIMILAR_INC.id}
          />
        </div>
      </div>

      {/* Similar Incidents */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Clock className="w-4.5 h-4.5 text-violet-400" />
            <h2 className="text-base font-bold text-white">Similar Historical Incidents</h2>
          </div>
          <Link href="/knowledge" className="text-xs text-violet-400 hover:text-violet-300 transition-colors">
            Knowledge Base →
          </Link>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {SIMILAR_INCIDENTS.map((inc) => (
            <Link
              key={inc.id}
              href={`/incidents/${inc.id}`}
              className="group p-4 rounded-xl border border-white/8 bg-white/2 hover:bg-white/4 hover:border-orange-500/25 transition-all duration-200"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xs text-orange-400 font-semibold">{inc.id}</span>
                <span className="text-lg font-black text-orange-400">{inc.similarity}%</span>
              </div>
              <p className="text-sm font-semibold text-white mb-2 group-hover:text-orange-300 transition-colors">
                {inc.title}
              </p>
              <p className="text-xs text-slate-400 mb-3 line-clamp-2">{inc.resolution}</p>
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-500">{inc.usedAt}</span>
                <span className="text-[11px] font-semibold text-green-400">✓ {inc.confidence}% conf.</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}