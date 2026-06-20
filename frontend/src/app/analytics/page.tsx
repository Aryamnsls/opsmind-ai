"use client";

import { BarChart3, Brain, Clock, TrendingDown, Zap } from "lucide-react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { ANALYTICS_DATA } from "@/lib/mock-data";

export default function AnalyticsPage() {
  return (
    <main className="min-h-screen p-6 space-y-6">
      {/* Header */}
      <div>
        <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">Insights & Trends</p>
        <h1 className="text-2xl font-black text-white">Analytics</h1>
        <p className="text-sm text-slate-400 mt-0.5">
          Operational intelligence powered by Aurora incident memory — last 6 months
        </p>
      </div>

      {/* Top stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Incidents", value: "248", trend: "-12% vs last month", icon: BarChart3, color: "text-orange-400" },
          { label: "Avg MTTR", value: "18m", trend: "↓42% improvement", icon: Clock, color: "text-green-400" },
          { label: "AI RCA Accuracy", value: "92%", trend: "+4% this month", icon: Brain, color: "text-sky-400" },
          { label: "Repeat Incidents", value: "8%", trend: "↓61% vs last year", icon: TrendingDown, color: "text-violet-400" },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="glass-card p-5">
              <Icon className={`w-5 h-5 ${stat.color} mb-3`} />
              <p className={`text-3xl font-black ${stat.color}`}>{stat.value}</p>
              <p className="text-xs font-semibold text-slate-300 mt-1">{stat.label}</p>
              <p className="text-[11px] text-slate-500 mt-0.5">{stat.trend}</p>
            </div>
          );
        })}
      </div>

      {/* Charts row 1 */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* MTTR Trend */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-6">
            <TrendingDown className="w-4.5 h-4.5 text-green-400" />
            <h2 className="text-base font-bold text-white">MTTR Trend (minutes)</h2>
            <span className="ml-auto text-xs text-green-400 font-semibold">↓ 81% over 6 months</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={ANALYTICS_DATA.mttrTrend}>
              <defs>
                <linearGradient id="mttrGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22c55e" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "#f8fafc" }}
                labelStyle={{ color: "#94a3b8" }}
              />
              <Line
                type="monotone"
                dataKey="mttr"
                stroke="#22c55e"
                strokeWidth={2.5}
                dot={{ fill: "#22c55e", r: 4 }}
                activeDot={{ r: 6, fill: "#22c55e" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Severity Breakdown */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 className="w-4.5 h-4.5 text-orange-400" />
            <h2 className="text-base font-bold text-white">Severity Distribution</h2>
          </div>
          <div className="flex items-center gap-6">
            <ResponsiveContainer width="50%" height={200}>
              <PieChart>
                <Pie
                  data={ANALYTICS_DATA.severityBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {ANALYTICS_DATA.severityBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "#f8fafc" }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-3">
              {ANALYTICS_DATA.severityBreakdown.map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.fill }} />
                    <span className="text-xs text-slate-400">{item.name}</span>
                  </div>
                  <span className="text-sm font-bold text-white">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Charts row 2 */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* AI Confidence Trend */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-6">
            <Brain className="w-4.5 h-4.5 text-sky-400" />
            <h2 className="text-base font-bold text-white">AI Confidence Trend</h2>
            <span className="ml-auto text-xs text-sky-400 font-semibold">+22% improvement</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={ANALYTICS_DATA.confidenceTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="week" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis domain={[60, 100]} tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "#f8fafc" }}
              />
              <Line
                type="monotone"
                dataKey="confidence"
                stroke="#0ea5e9"
                strokeWidth={2.5}
                dot={{ fill: "#0ea5e9", r: 4 }}
                activeDot={{ r: 6, fill: "#0ea5e9" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Incidents by Service */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-6">
            <Zap className="w-4.5 h-4.5 text-violet-400" />
            <h2 className="text-base font-bold text-white">Incidents by Service</h2>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={ANALYTICS_DATA.incidentsByService} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
              <XAxis type="number" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis dataKey="service" type="category" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} width={80} />
              <Tooltip
                contentStyle={{ background: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "#f8fafc" }}
              />
              <Bar dataKey="count" fill="#f97316" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Footer note */}
      <p className="text-xs text-slate-600 text-center">
        Data sourced from Amazon Aurora PostgreSQL · Updated in real-time · OpsMind AI Analytics Engine
      </p>
    </main>
  );
}
