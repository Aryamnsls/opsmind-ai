"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";
import {
  Activity,
  ArrowLeft,
  Brain,
  CheckCircle,
  Clock,
  Dna,
  ExternalLink,
  Loader2,
  Server,
  Shield,
  User,
  Zap,
} from "lucide-react";
import { MOCK_INCIDENTS } from "@/lib/mock-data";
import { IncidentTimeline } from "@/components/ui/dashboard/IncidentTimeline";
import { IncidentDNA } from "@/components/ui/dashboard/IncidentDNA";
import { AIRecommendation } from "@/components/ui/dashboard/AIRecommendation";

const SEVERITY_COLORS: Record<string, string> = {
  critical: "text-red-400 bg-red-500/10 border-red-500/25",
  high: "text-orange-400 bg-orange-500/10 border-orange-500/25",
  medium: "text-yellow-400 bg-yellow-500/10 border-yellow-500/25",
  low: "text-green-400 bg-green-500/10 border-green-500/25",
};

interface SimilarMatch {
  incidentId: string;
  title: string;
  similarity: number;
  resolution: string;
  confidence: number;
  resolvedAt?: string;
}

export default function IncidentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  
  const [incident, setIncident] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [similarMatches, setSimilarMatches] = useState<SimilarMatch[]>([]);
  const [loadingSimilar, setLoadingSimilar] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [resolved, setResolved] = useState(incident?.status === "resolved" || incident?.status === "closed");

  // Fetch incident details from API (which queries DB or mock)
  useEffect(() => {
    fetch(`/api/incidents/${id}`)
      .then(res => {
        if (!res.ok) throw new Error("Not found");
        return res.json();
      })
      .then(data => {
        if (data.success && data.data) {
          setIncident(data.data);
          setResolved(data.data.status === "resolved" || data.data.status === "closed");
        } else {
          setError(true);
        }
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [id]);

  // Fetch similar incidents from the API
  useEffect(() => {
    if (!incident) return;
    setLoadingSimilar(true);

    fetch("/api/similar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fingerprint: incident.dna?.fingerprint || "UNKNOWN",
        errorSignatures: incident.dna?.errorSignatures || [],
        serviceName: incident.service,
      }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.data?.matches) {
          setSimilarMatches(data.data.matches.slice(0, 3));
        }
      })
      .catch(console.error)
      .finally(() => setLoadingSimilar(false));
  }, [incident]);

  const handleResolve = async () => {
    if (!incident) return;
    setResolving(true);
    try {
      const res = await fetch(`/api/incidents/${id}/resolve`, { method: "POST" });
      if (res.ok) setResolved(true);
    } catch (e) {
      console.error(e);
    } finally {
      setResolving(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen p-6 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-sky-500" />
      </main>
    );
  }

  if (error || !incident) {
    return (
      <main className="min-h-screen p-6 flex items-center justify-center">
        <div className="text-center">
          <p className="text-4xl font-black text-slate-600 mb-4">404</p>
          <p className="text-slate-400 mb-6">Incident not found in Aurora memory</p>
          <Link href="/incidents" className="text-orange-400 hover:text-orange-300 transition-colors">
            ← Back to Incidents
          </Link>
        </div>
      </main>
    );
  }

  const currentStatus = resolved ? "resolved" : incident.status;

  return (
    <main className="min-h-screen p-6 space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/incidents"
          className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-200 transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          All Incidents
        </Link>

        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <span className="font-mono text-sm text-orange-400 font-bold">{incident.id}</span>
              <span className={`text-xs px-2.5 py-1 rounded-lg border font-semibold uppercase ${SEVERITY_COLORS[incident.severity]}`}>
                {incident.severity}
              </span>
              <span className={`text-xs px-2.5 py-1 rounded-lg border font-semibold capitalize ${
                currentStatus === "active" ? "text-red-400 bg-red-500/10 border-red-500/25 animate-pulse" :
                currentStatus === "resolved" || currentStatus === "closed" ? "text-green-400 bg-green-500/10 border-green-500/25" :
                "text-orange-400 bg-orange-500/10 border-orange-500/25"
              }`}>
                {currentStatus}
              </span>
              {incident.rca && (
                <span className="text-xs px-2.5 py-1 rounded-lg border border-violet-500/25 bg-violet-500/10 text-violet-400 font-semibold">
                  RCA Available
                </span>
              )}
            </div>
            <h1 className="text-2xl font-black text-white">{incident.title}</h1>
            <p className="text-slate-400 mt-2 max-w-2xl text-sm leading-relaxed">{incident.description}</p>
          </div>

          {/* Resolve button for active/investigating incidents */}
          {(incident.status === "active" || incident.status === "investigating") && !resolved && (
            <button
              id="btn-resolve-incident"
              onClick={handleResolve}
              disabled={resolving}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-green-500/15 border border-green-500/30 text-green-400 font-semibold text-sm hover:bg-green-500/25 transition-colors disabled:opacity-50 shrink-0"
            >
              {resolving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
              Mark Resolved
            </button>
          )}
          {resolved && incident.status !== "resolved" && incident.status !== "closed" && (
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm font-semibold shrink-0">
              <CheckCircle className="w-4 h-4" />
              Resolved
            </div>
          )}
        </div>
      </div>

      {/* Metadata row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: Server, label: "Service", value: incident.service, color: "text-sky-400" },
          { icon: User, label: "Owner", value: incident.owner, color: "text-violet-400" },
          { icon: Activity, label: "Environment", value: incident.environment, color: "text-orange-400" },
          { icon: Clock, label: "MTTR", value: incident.mttr || "Ongoing", color: incident.mttr ? "text-green-400" : "text-red-400" },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="glass-card p-4">
              <div className="flex items-center gap-1.5 mb-2">
                <Icon className={`w-3.5 h-3.5 ${item.color}`} />
                <p className="text-xs text-slate-400 uppercase tracking-wide font-semibold">{item.label}</p>
              </div>
              <p className="text-sm font-semibold text-white">{item.value}</p>
            </div>
          );
        })}
      </div>

      {/* Main grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Timeline col-2 */}
        <div className="glass-card p-6 lg:col-span-2">
          <div className="flex items-center gap-2 mb-5">
            <Activity className="w-4.5 h-4.5 text-sky-400" />
            <h2 className="text-base font-bold text-white">Incident Timeline</h2>
            {currentStatus === "active" && (
              <span className="text-[10px] font-semibold text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-full animate-pulse">
                ● LIVE
              </span>
            )}
          </div>
          <IncidentTimeline
            events={incident.timeline || []}
            incidentId={incident.id}
            live={currentStatus === "active"}
          />
        </div>

        {/* Tags & DNA fingerprint */}
        <div className="space-y-4">
          <div className="glass-card p-5">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3 flex items-center gap-1.5">
              <Dna className="w-3.5 h-3.5 text-orange-400" />
              Incident DNA™
            </p>
            <div className="space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">fingerprint</span>
                <span className="text-orange-400">{incident.dna?.fingerprint}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">cpu</span>
                <span className={(incident.dna?.cpuUsage ?? incident.dna?.resourceUsage?.cpu ?? 0) > 80 ? "text-red-400" : "text-green-400"}>
                  {incident.dna?.cpuUsage ?? incident.dna?.resourceUsage?.cpu ?? "N/A"}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">memory</span>
                <span className={(incident.dna?.memoryUsage ?? incident.dna?.resourceUsage?.memory ?? 0) > 80 ? "text-red-400" : "text-green-400"}>
                  {incident.dna?.memoryUsage ?? incident.dna?.resourceUsage?.memory ?? "N/A"}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">deploy</span>
                <span className="text-slate-300 text-[10px] max-w-[120px] text-right">{incident.dna?.deploymentMeta || "N/A"}</span>
              </div>
              {incident.dna?.similarityScore && (
                <div className="flex items-center justify-between pt-1 border-t border-white/5">
                  <span className="text-slate-500">similarity</span>
                  <span className="text-green-400 font-semibold">{incident.dna?.similarityScore}%</span>
                </div>
              )}
            </div>
          </div>

          {/* Tags */}
          <div className="glass-card p-5">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Tags</p>
            <div className="flex flex-wrap gap-1.5">
              {(incident.tags || []).map((tag: string) => (
                <span key={tag} className="text-xs px-2.5 py-1 rounded-lg bg-white/5 border border-white/8 text-slate-400">
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          {/* Components */}
          <div className="glass-card p-5">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3 flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5" />
              Infra Components
            </p>
            <div className="space-y-1.5">
              {(incident.dna?.infraComponents || []).map((comp: string) => (
                <div key={comp} className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                  <span className="text-xs text-slate-300">{comp}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* RCA Report (if available) */}
      {incident.rca && (
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-5">
            <Brain className="w-4.5 h-4.5 text-violet-400" />
            <h2 className="text-base font-bold text-white">Root Cause Analysis Report</h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-violet-500/10 border border-violet-500/25 text-violet-400 font-semibold">
              {incident.rca.confidence}% confidence
            </span>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { label: "Root Cause", content: incident.rca.rootCause, icon: Dna, color: "border-red-500/20 bg-red-500/5", iconColor: "text-red-400" },
              { label: "Resolution", content: incident.rca.resolution, icon: CheckCircle, color: "border-green-500/20 bg-green-500/5", iconColor: "text-green-400" },
              { label: "Prevention", content: incident.rca.prevention, icon: Shield, color: "border-sky-500/20 bg-sky-500/5", iconColor: "text-sky-400" },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className={`rounded-xl border p-4 ${item.color}`}>
                  <div className="flex items-center gap-1.5 mb-2">
                    <Icon className={`w-3.5 h-3.5 ${item.iconColor}`} />
                    <p className={`text-xs font-semibold uppercase tracking-wide ${item.iconColor}`}>{item.label}</p>
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed">{item.content}</p>
                </div>
              );
            })}
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
            <Clock className="w-3 h-3" />
            <span>Time to resolve: {incident.rca.timeToResolve}</span>
            <span className="ml-2 text-green-400 font-semibold flex items-center gap-1">
              <Zap className="w-3 h-3" />
              Stored to Knowledge Base
            </span>
          </div>
        </div>
      )}

      {/* If active — show DNA + AI Recommendation */}
      {(currentStatus === "active" || currentStatus === "investigating") && (
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="glass-card p-6">
            <h2 className="text-base font-bold text-white mb-5">Live DNA™ Match</h2>
            <IncidentDNA
              fingerprint={incident.dna?.fingerprint || "UNKNOWN"}
              errorSignatures={incident.dna?.errorSignatures || []}
              similarityScore={incident.dna?.similarityScore ?? 94}
              matchedIncident="INC-104"
              rootCause="Redis Memory Exhaustion — TTL misconfiguration"
              confidence={92}
            />
          </div>
          <div className="glass-card p-6">
            <h2 className="text-base font-bold text-white mb-5">AI Recommendation</h2>
            <AIRecommendation
              suggestedFix="Scale Worker Pods + Flush Redis Cache"
              confidence={93}
              basedOn={8}
              successRate={87}
              resolution="Flush Redis stale session keys, increase maxmemory to 8GB, enable allkeys-lru eviction policy, restart connection pool, scale workers from 3→8 pods."
              incidentId="INC-104"
            />
          </div>
        </div>
      )}

      {/* Similar Incidents — from live API */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-2 mb-5">
          <ExternalLink className="w-4.5 h-4.5 text-orange-400" />
          <h2 className="text-base font-bold text-white">Similar Incidents from Memory</h2>
          {loadingSimilar && <Loader2 className="w-3.5 h-3.5 text-slate-500 animate-spin ml-1" />}
          <span className="ml-auto text-xs text-slate-500">Aurora DNA index</span>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {loadingSimilar ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="p-4 rounded-xl border border-white/8 bg-white/2 animate-pulse space-y-2">
                <div className="h-3 bg-white/8 rounded w-1/3" />
                <div className="h-4 bg-white/8 rounded w-3/4" />
                <div className="h-3 bg-white/8 rounded w-full" />
              </div>
            ))
          ) : similarMatches.length > 0 ? (
            similarMatches.map((sim) => (
              <Link
                key={sim.incidentId}
                href={`/incidents/${sim.incidentId}`}
                className="group p-4 rounded-xl border border-white/8 bg-white/2 hover:border-orange-500/25 hover:bg-orange-500/4 transition-all duration-200"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs font-bold text-orange-400">{sim.incidentId}</span>
                  <span className="text-lg font-black text-orange-400">{sim.similarity}%</span>
                </div>
                <p className="text-sm font-semibold text-white mb-2 group-hover:text-orange-300 transition-colors">{sim.title}</p>
                <p className="text-xs text-slate-400 mb-3 line-clamp-2">{sim.resolution}</p>
                <p className="text-[11px] text-green-400 font-semibold">✓ {sim.confidence}% confidence</p>
              </Link>
            ))
          ) : (
            <p className="text-sm text-slate-500 col-span-3 text-center py-4">No similar incidents found in memory.</p>
          )}
        </div>
      </div>
    </main>
  );
}
