"use client";

import { useEffect, useState } from "react";
import { Bot, CheckCircle, ChevronRight, Clock, History, TrendingUp } from "lucide-react";

interface AIRecommendationProps {
  suggestedFix: string;
  confidence: number;
  basedOn: number;
  successRate: number;
  resolution: string;
  incidentId: string;
}

const TYPING_SPEED = 30;

export function AIRecommendation({
  suggestedFix,
  confidence,
  basedOn,
  successRate,
  resolution,
  incidentId,
}: AIRecommendationProps) {
  const [displayedText, setDisplayedText] = useState("");
  const [barProgress, setBarProgress] = useState(0);
  const [srProgress, setSrProgress] = useState(0);
  const [applied, setApplied] = useState(false);

  // Typewriter effect for the fix text
  useEffect(() => {
    let index = 0;
    const timer = setInterval(() => {
      index++;
      setDisplayedText(resolution.slice(0, index));
      if (index >= resolution.length) clearInterval(timer);
    }, TYPING_SPEED);
    return () => clearInterval(timer);
  }, [resolution]);

  // Animate confidence bar
  useEffect(() => {
    const timer = setTimeout(() => {
      let val = 0;
      const interval = setInterval(() => {
        val += 1.2;
        if (val >= confidence) { setBarProgress(confidence); clearInterval(interval); }
        else setBarProgress(Math.floor(val));
      }, 18);
    }, 500);
    return () => clearTimeout(timer);
  }, [confidence]);

  // Animate success rate
  useEffect(() => {
    const timer = setTimeout(() => {
      let val = 0;
      const interval = setInterval(() => {
        val += 1.2;
        if (val >= successRate) { setSrProgress(successRate); clearInterval(interval); }
        else setSrProgress(Math.floor(val));
      }, 18);
    }, 900);
    return () => clearTimeout(timer);
  }, [successRate]);

  return (
    <div className="space-y-4">
      {/* AI Header */}
      <div className="flex items-center gap-3">
        <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-sky-500/30 to-violet-500/30 border border-sky-500/20 flex items-center justify-center">
          <Bot className="w-4.5 h-4.5 text-sky-400" />
          <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-green-400 border-2 border-[#020617] animate-pulse" />
        </div>
        <div>
          <p className="text-sm font-semibold text-white">OpsMind AI Recommendation</p>
          <p className="text-[11px] text-slate-400">Based on Aurora incident memory + {basedOn} historical matches</p>
        </div>
      </div>

      {/* Typewriter suggestion */}
      <div className="glass rounded-xl p-4 border-l-2 border-sky-500/50">
        <p className="text-xs text-sky-400 font-semibold uppercase tracking-wide mb-2 flex items-center gap-1">
          <CheckCircle className="w-3 h-3" />
          Suggested Fix
        </p>
        <p className="text-sm font-semibold text-white mb-2">{suggestedFix}</p>
        <p className="text-sm text-slate-300 leading-relaxed">
          {displayedText}
          {displayedText.length < resolution.length && (
            <span className="inline-block w-0.5 h-4 bg-sky-400 ml-0.5 cursor-blink" />
          )}
        </p>
      </div>

      {/* Confidence metrics */}
      <div className="space-y-3">
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <div className="flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-orange-400" />
              <span className="text-xs text-slate-400">Resolution Confidence</span>
            </div>
            <span className="text-sm font-bold text-orange-400">{barProgress}%</span>
          </div>
          <div className="h-2 rounded-full bg-white/5 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-400 transition-all duration-100"
              style={{ width: `${barProgress}%` }}
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-1.5">
            <div className="flex items-center gap-1.5">
              <History className="w-3.5 h-3.5 text-green-400" />
              <span className="text-xs text-slate-400">Historical Success Rate</span>
            </div>
            <span className="text-sm font-bold text-green-400">{srProgress}%</span>
          </div>
          <div className="h-2 rounded-full bg-white/5 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-green-500 to-emerald-400 transition-all duration-100"
              style={{ width: `${srProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Source */}
      <div className="flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          <span>Based on {basedOn} similar incidents</span>
        </div>
        <span className="text-sky-500">Ref: {incidentId}</span>
      </div>

      {/* Apply button */}
      <button
        onClick={() => setApplied(true)}
        className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
          applied
            ? "bg-green-500/15 border border-green-500/30 text-green-400"
            : "bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-400 hover:to-orange-500 shadow-lg shadow-orange-500/20 active:scale-95"
        }`}
      >
        {applied ? (
          <>
            <CheckCircle className="w-4 h-4" />
            Applied to Runbook
          </>
        ) : (
          <>
            Apply Resolution
            <ChevronRight className="w-4 h-4" />
          </>
        )}
      </button>
    </div>
  );
}
