"use client";

import { SERVICES_HEALTH } from "@/lib/mock-data";

const STATUS_CONFIG = {
  healthy: { color: "text-green-400", bg: "bg-green-400", label: "Healthy", border: "border-green-500/20" },
  degraded: { color: "text-orange-400", bg: "bg-orange-400", label: "Degraded", border: "border-orange-500/20" },
  investigating: { color: "text-yellow-400", bg: "bg-yellow-400", label: "Investigating", border: "border-yellow-500/20" },
  down: { color: "text-red-400", bg: "bg-red-400", label: "Down", border: "border-red-500/20" },
};

export function HealthMap() {
  return (
    <div className="space-y-2.5">
      {SERVICES_HEALTH.map((service, i) => {
        const config = STATUS_CONFIG[service.status as keyof typeof STATUS_CONFIG];
        const latencyColor =
          service.latency < 100 ? "text-green-400" :
          service.latency < 500 ? "text-yellow-400" :
          "text-red-400";

        return (
          <div
            key={service.name}
            className={`flex items-center gap-3 p-2.5 rounded-xl border ${config.border} bg-white/2 transition-all duration-200 hover:bg-white/4`}
            style={{ animationDelay: `${i * 60}ms` }}
          >
            {/* Status dot */}
            <div className="relative shrink-0">
              {service.status !== "healthy" && (
                <div className={`absolute inset-0 rounded-full ${config.bg} opacity-40 animate-ping`} />
              )}
              <div className={`w-2.5 h-2.5 rounded-full ${config.bg} relative`} />
            </div>

            {/* Name */}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-slate-200 truncate">{service.name}</p>
              <p className="text-[10px] text-slate-500">{service.uptime}% uptime</p>
            </div>

            {/* Latency */}
            <div className="text-right shrink-0">
              <p className={`text-xs font-mono font-semibold ${latencyColor}`}>
                {service.latency}ms
              </p>
              <p className={`text-[10px] font-semibold ${config.color}`}>{config.label}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
