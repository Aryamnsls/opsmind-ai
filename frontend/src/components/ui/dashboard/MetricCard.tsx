"use client";

import { useEffect, useRef, useState } from "react";
import type { LucideIcon } from "lucide-react";
import { TrendingDown, TrendingUp } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string;
  numericValue: number;
  label: string;
  icon: LucideIcon;
  trend: "up" | "down";
  trendPositive?: boolean;
  color: "orange" | "sky" | "violet" | "green";
  delay?: number;
}

const COLOR_MAP = {
  orange: {
    icon: "text-orange-400",
    glow: "shadow-orange-500/20",
    bg: "from-orange-500/15 to-orange-600/5",
    border: "border-orange-500/20",
    bar: "bg-orange-400",
    ring: "bg-orange-500/10",
  },
  sky: {
    icon: "text-sky-400",
    glow: "shadow-sky-500/20",
    bg: "from-sky-500/15 to-sky-600/5",
    border: "border-sky-500/20",
    bar: "bg-sky-400",
    ring: "bg-sky-500/10",
  },
  violet: {
    icon: "text-violet-400",
    glow: "shadow-violet-500/20",
    bg: "from-violet-500/15 to-violet-600/5",
    border: "border-violet-500/20",
    bar: "bg-violet-400",
    ring: "bg-violet-500/10",
  },
  green: {
    icon: "text-green-400",
    glow: "shadow-green-500/20",
    bg: "from-green-500/15 to-green-600/5",
    border: "border-green-500/20",
    bar: "bg-green-400",
    ring: "bg-green-500/10",
  },
};

export function MetricCard({
  title,
  value,
  numericValue,
  label,
  icon: Icon,
  trend,
  trendPositive = true,
  color,
  delay = 0,
}: MetricCardProps) {
  const [displayed, setDisplayed] = useState(0);
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const colors = COLOR_MAP[color];

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  useEffect(() => {
    if (!visible) return;
    let start = 0;
    const end = numericValue;
    if (end === 0) return;
    const duration = 1200;
    const step = (end / duration) * 16;
    const timer = setInterval(() => {
      start += step;
      if (start >= end) {
        setDisplayed(end);
        clearInterval(timer);
      } else {
        setDisplayed(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [visible, numericValue]);

  const TrendIcon = trend === "up" ? TrendingUp : TrendingDown;
  const trendColor = trendPositive
    ? trend === "up"
      ? "text-green-400"
      : "text-red-400"
    : trend === "down"
    ? "text-green-400"
    : "text-red-400";

  return (
    <div
      ref={ref}
      className={`glass-card p-5 relative overflow-hidden transition-all duration-500 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {/* Background gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${colors.bg} opacity-60 rounded-2xl`} />

      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{title}</p>
          </div>
          <div className={`w-9 h-9 rounded-xl ${colors.ring} flex items-center justify-center`}>
            <Icon className={`w-4.5 h-4.5 ${colors.icon}`} />
          </div>
        </div>

        <div className="mb-3">
          <div className="text-3xl font-bold text-white tabular-nums">
            {value.replace(/\d+/, displayed.toString())}
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <TrendIcon className={`w-3.5 h-3.5 ${trendColor}`} />
          <span className={`text-xs font-medium ${trendColor}`}>{label}</span>
        </div>

        {/* Bottom bar */}
        <div className="mt-4 h-0.5 rounded-full bg-white/5 overflow-hidden">
          <div
            className={`h-full ${colors.bar} rounded-full transition-all duration-1000 ease-out`}
            style={{ width: visible ? `${Math.min((numericValue / 300) * 100, 100)}%` : "0%" }}
          />
        </div>
      </div>
    </div>
  );
}
