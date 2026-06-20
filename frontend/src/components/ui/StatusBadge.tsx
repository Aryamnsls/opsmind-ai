"use client";

import { type LucideIcon } from "lucide-react";

type Severity = "critical" | "high" | "medium" | "low";
type Status = "active" | "investigating" | "resolved" | "closed";

const SEVERITY_STYLES: Record<Severity, string> = {
  critical: "text-red-400 bg-red-500/10 border-red-500/25",
  high: "text-orange-400 bg-orange-500/10 border-orange-500/25",
  medium: "text-yellow-400 bg-yellow-500/10 border-yellow-500/25",
  low: "text-green-400 bg-green-500/10 border-green-500/25",
};

const STATUS_STYLES: Record<Status, string> = {
  active: "text-red-400 bg-red-500/10 border-red-500/25",
  investigating: "text-orange-400 bg-orange-500/10 border-orange-500/25",
  resolved: "text-green-400 bg-green-500/10 border-green-500/25",
  closed: "text-slate-400 bg-slate-500/10 border-slate-500/25",
};

interface SeverityBadgeProps {
  severity: Severity;
  icon?: LucideIcon;
  pulse?: boolean;
  className?: string;
}

export function SeverityBadge({ severity, icon: Icon, pulse, className = "" }: SeverityBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs font-semibold uppercase ${SEVERITY_STYLES[severity]} ${pulse ? "animate-pulse" : ""} ${className}`}
    >
      {Icon && <Icon className="w-3 h-3" />}
      {severity}
    </span>
  );
}

interface StatusBadgeProps {
  status: Status;
  pulse?: boolean;
  className?: string;
}

export function StatusBadge({ status, pulse, className = "" }: StatusBadgeProps) {
  const shouldPulse = pulse ?? (status === "active" || status === "investigating");
  return (
    <span
      className={`inline-flex px-2.5 py-1 rounded-lg border text-xs font-semibold capitalize ${STATUS_STYLES[status]} ${shouldPulse ? "animate-pulse" : ""} ${className}`}
    >
      {status}
    </span>
  );
}
