"use client";

import { useEffect, useState } from "react";
import { Dna, GitBranch, Layers, Zap } from "lucide-react";

interface IncidentDNAProps {
  fingerprint: string;
  errorSignatures: string[];
  similarityScore: number;
  matchedIncident: string;
  rootCause: string;
  confidence: number;
}

export function IncidentDNA({
  fingerprint,
  errorSignatures,
  similarityScore,
  matchedIncident,
  rootCause,
  confidence,
}: IncidentDNAProps) {
  const [progress, setProgress] = useState(0);
  const [confProgress, setConfProgress] = useState(0);
  const [scanning, setScanning] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      let val = 0;
      const interval = setInterval(() => {
        val += 1.5;
        if (val >= similarityScore) {
          setProgress(similarityScore);
          clearInterval(interval);
          setScanning(false);
        } else {
          setProgress(Math.floor(val));
        }
      }, 20);
    }, 300);
    return () => clearTimeout(timer);
  }, [similarityScore]);

  useEffect(() => {
    const timer = setTimeout(() => {
      let val = 0;
      const interval = setInterval(() => {
        val += 1.5;
        if (val >= confidence) {
          setConfProgress(confidence);
          clearInterval(interval);
        } else {
          setConfProgress(Math.floor(val));
        }
      }, 20);
    }, 800);
    return () => clearTimeout(timer);
  }, [confidence]);

  // Build the circular arc for confidence
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (confProgress / 100) * circumference;

  return (
    <div className="space-y-4">
      {/* Fingerprint header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-orange-500/15 border border-orange-500/20 flex items-center justify-center">
            <Dna className="w-4 h-4 text-orange-400" />
          </div>
          <div>
            <p className="text-xs text-slate-400">Incident DNA™</p>
            <p className="font-mono text-xs text-orange-400">{fingerprint}</p>
          </div>
        </div>
        <div className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded-full ${scanning ? "bg-orange-500/10 text-orange-400 border border-orange-500/20" : "bg-green-500/10 text-green-400 border border-green-500/20"}`}>
          <div className={`w-1.5 h-1.5 rounded-full ${scanning ? "bg-orange-400 animate-pulse" : "bg-green-400"}`} />
          {scanning ? "Scanning..." : "Match Found"}
        </div>
      </div>

      {/* Similarity bar */}
      <div className="glass rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-slate-400">Similarity to {matchedIncident}</span>
          <span className="text-lg font-bold text-orange-400">{progress}%</span>
        </div>
        <div className="h-2 rounded-full bg-white/5 overflow-hidden relative">
          <div
            className="h-full rounded-full bg-gradient-to-r from-orange-500 to-orange-400 transition-all duration-100 relative overflow-hidden"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_1.5s_ease-in-out_infinite] bg-[length:200%_100%]" />
          </div>
        </div>
        <div className="flex justify-between mt-1.5">
          <span className="text-[10px] text-slate-500">0%</span>
          <span className="text-[10px] text-slate-500">100%</span>
        </div>
      </div>

      {/* Root cause + confidence ring */}
      <div className="flex items-start gap-4 glass rounded-xl p-4">
        {/* Confidence Ring */}
        <div className="relative w-[90px] h-[90px] shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50" cy="50" r={radius}
              fill="none"
              stroke="rgba(255,255,255,0.05)"
              strokeWidth="8"
            />
            <circle
              cx="50" cy="50" r={radius}
              fill="none"
              stroke="url(#confGrad)"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-100"
            />
            <defs>
              <linearGradient id="confGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#f97316" />
                <stop offset="100%" stopColor="#fb923c" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-base font-bold text-white">{confProgress}%</span>
            <span className="text-[9px] text-slate-400">conf.</span>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            <GitBranch className="w-3.5 h-3.5 text-orange-400" />
            <p className="text-[11px] text-slate-400 uppercase tracking-wide font-semibold">Root Cause</p>
          </div>
          <p className="text-sm font-semibold text-white leading-snug">{rootCause}</p>
          <p className="text-[11px] text-slate-400 mt-1.5">Matched: {matchedIncident}</p>
        </div>
      </div>

      {/* Error signatures */}
      <div>
        <div className="flex items-center gap-1.5 mb-2">
          <Layers className="w-3.5 h-3.5 text-slate-400" />
          <p className="text-xs text-slate-400 uppercase tracking-wide">Error Signatures</p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {errorSignatures.slice(0, 4).map((sig) => (
            <span
              key={sig}
              className="font-mono text-[10px] px-2 py-0.5 rounded-md bg-red-500/10 border border-red-500/20 text-red-300"
            >
              {sig}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
