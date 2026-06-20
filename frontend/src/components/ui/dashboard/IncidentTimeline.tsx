"use client";

import { useEffect, useState } from "react";
import { Activity, AlertTriangle, CheckCircle, Info } from "lucide-react";

interface TimelineEvent {
  time: string;
  event: string;
  type: "alert" | "action" | "resolve" | "info";
}

interface IncidentTimelineProps {
  events: TimelineEvent[];
  incidentId: string;
  live?: boolean;
}

const TYPE_CONFIG = {
  alert: {
    icon: AlertTriangle,
    color: "text-red-400",
    bg: "bg-red-500/15",
    border: "border-red-500/30",
    dot: "bg-red-400",
  },
  action: {
    icon: Activity,
    color: "text-orange-400",
    bg: "bg-orange-500/15",
    border: "border-orange-500/30",
    dot: "bg-orange-400",
  },
  resolve: {
    icon: CheckCircle,
    color: "text-green-400",
    bg: "bg-green-500/15",
    border: "border-green-500/30",
    dot: "bg-green-400",
  },
  info: {
    icon: Info,
    color: "text-sky-400",
    bg: "bg-sky-500/15",
    border: "border-sky-500/30",
    dot: "bg-sky-400",
  },
};

export function IncidentTimeline({ events, incidentId, live = false }: IncidentTimelineProps) {
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    let count = 0;
    const timer = setInterval(() => {
      count++;
      setVisibleCount(count);
      if (count >= events.length) clearInterval(timer);
    }, 200);
    return () => clearInterval(timer);
  }, [events.length]);

  return (
    <div className="space-y-0">
      {events.map((event, index) => {
        const config = TYPE_CONFIG[event.type];
        const Icon = config.icon;
        const isVisible = index < visibleCount;
        const isLatest = index === events.length - 1 && live;

        return (
          <div
            key={index}
            className={`flex gap-4 transition-all duration-400 ${
              isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
            }`}
            style={{ transitionDelay: `${index * 80}ms` }}
          >
            {/* Timeline line + dot */}
            <div className="flex flex-col items-center">
              <div className="relative flex items-center justify-center w-7 h-7 shrink-0">
                {isLatest && (
                  <div className={`absolute inset-0 rounded-full ${config.dot} opacity-30 animate-ping`} />
                )}
                <div className={`w-5 h-5 rounded-full ${config.bg} border ${config.border} flex items-center justify-center`}>
                  <div className={`w-2 h-2 rounded-full ${config.dot}`} />
                </div>
              </div>
              {index < events.length - 1 && (
                <div className="w-px h-6 bg-gradient-to-b from-slate-600/50 to-transparent mt-1 mb-1" />
              )}
            </div>

            {/* Content */}
            <div className={`pb-4 flex-1 min-w-0 ${index < events.length - 1 ? "" : "pb-0"}`}>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-[11px] text-slate-500">{event.time}</span>
                <div className={`inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide ${config.color} ${config.bg} px-1.5 py-0.5 rounded border ${config.border}`}>
                  <Icon className="w-2.5 h-2.5" />
                  {event.type}
                </div>
                {isLatest && (
                  <span className="text-[10px] text-red-400 font-semibold animate-pulse">● LIVE</span>
                )}
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">{event.event}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
