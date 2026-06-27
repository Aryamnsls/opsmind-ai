"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  Brain,
  Database,
  Dna,
  MessageSquare,
  Shield,
  Sparkles,
  TrendingDown,
  Zap,
} from "lucide-react";


const TAGLINES = [
  "Your Infrastructure Forgets Nothing.",
  "Find Root Causes in Seconds.",
  "AI-Powered Incident Memory.",
  "Every Fix Remembered Forever.",
];

const FEATURES = [
  {
    icon: Dna,
    title: "Incident DNA™",
    description:
      "Every incident gets a unique fingerprint — error signatures, resource patterns, and deployment metadata.",
    color: "from-orange-500/20 to-orange-600/5",
    border: "border-orange-500/20",
    iconBg: "bg-orange-500/15",
    iconColor: "text-orange-400",
  },
  {
    icon: Brain,
    title: "AI Root Cause Analysis",
    description:
      "OpenAI-powered RCA analyzes patterns across all historical incidents with up to 96% confidence.",
    color: "from-sky-500/20 to-sky-600/5",
    border: "border-sky-500/20",
    iconBg: "bg-sky-500/15",
    iconColor: "text-sky-400",
  },
  {
    icon: TrendingDown,
    title: "42% Faster MTTR",
    description:
      "Resolution Confidence Score™ surfaces proven fixes from similar past incidents instantly.",
    color: "from-green-500/20 to-green-600/5",
    border: "border-green-500/20",
    iconBg: "bg-green-500/15",
    iconColor: "text-green-400",
  },
  {
    icon: MessageSquare,
    title: "AI War Room",
    description:
      "Real-time collaboration with AI-generated summaries, live timelines, and team coordination.",
    color: "from-violet-500/20 to-violet-600/5",
    border: "border-violet-500/20",
    iconBg: "bg-violet-500/15",
    iconColor: "text-violet-400",
  },
  {
    icon: Database,
    title: "Aurora PostgreSQL",
    description:
      "Enterprise-grade incident storage with Aurora PostgreSQL — scalable, durable, and fast.",
    color: "from-amber-500/20 to-amber-600/5",
    border: "border-amber-500/20",
    iconBg: "bg-amber-500/15",
    iconColor: "text-amber-400",
  },
  {
    icon: Shield,
    title: "Knowledge Base",
    description:
      "Every resolved incident builds organizational memory — searchable, tagged, and AI-indexed.",
    color: "from-pink-500/20 to-pink-600/5",
    border: "border-pink-500/20",
    iconBg: "bg-pink-500/15",
    iconColor: "text-pink-400",
  },
];

const STATS = [
  { label: "Incidents Stored", value: "248+", sub: "Aurora PostgreSQL" },
  { label: "AI RCA Accuracy", value: "92%", sub: "OpenAI Engine" },
  { label: "MTTR Reduction", value: "42%", sub: "vs. manual triage" },
  { label: "Resolution Confidence", value: "94%", sub: "Best match score" },
];

export default function HomePage() {
  const [taglineIndex, setTaglineIndex] = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const current = TAGLINES[taglineIndex];
    let timeout: NodeJS.Timeout;

    if (!isDeleting && displayed.length < current.length) {
      timeout = setTimeout(() => setDisplayed(current.slice(0, displayed.length + 1)), 60);
    } else if (!isDeleting && displayed.length === current.length) {
      timeout = setTimeout(() => setIsDeleting(true), 2000);
    } else if (isDeleting && displayed.length > 0) {
      timeout = setTimeout(() => setDisplayed(displayed.slice(0, -1)), 30);
    } else if (isDeleting && displayed.length === 0) {
      setIsDeleting(false);
      setTaglineIndex((i) => (i + 1) % TAGLINES.length);
    }

    return () => clearTimeout(timeout);
  }, [displayed, isDeleting, taglineIndex]);

  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-6">
        {/* Animated grid background */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(249,115,22,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(249,115,22,0.5) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        {/* Glow orbs */}
        <div className="absolute top-1/4 left-1/3 w-96 h-96 rounded-full bg-orange-500/10 blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/3 w-80 h-80 rounded-full bg-sky-500/10 blur-[120px] animate-pulse [animation-delay:1s]" />

        <div className="relative text-center max-w-5xl mx-auto">
          {/* Hackathon badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-orange-500/30 bg-orange-500/10 text-orange-300 text-sm font-medium mb-8">
            <Sparkles className="w-3.5 h-3.5" />
            AWS + Vercel Hackathon 2026 · Hack the Zero Stack · Track 4
          </div>

          {/* Main title */}
          <h1 className="text-6xl md:text-8xl font-black tracking-tight mb-6 leading-[0.9]">
            <span className="gradient-text">OpsMind</span>
            <span className="text-white"> AI</span>
          </h1>

          <p className="text-2xl md:text-3xl font-bold text-slate-200 mb-4">
            The Incident Memory Engine
          </p>

          {/* Typewriter tagline */}
          <div className="h-10 flex items-center justify-center mb-10">
            <p className="text-xl text-slate-400 font-mono">
              {displayed}
              <span className="inline-block w-0.5 h-5 bg-orange-400 ml-0.5 cursor-blink" />
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Link
              href="/dashboard"
              className="group flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold text-lg shadow-xl shadow-orange-500/25 hover:shadow-orange-500/40 hover:from-orange-400 hover:to-orange-500 transition-all duration-300 active:scale-95"
            >
              Launch Command Center
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/incidents/new"
              className="flex items-center gap-2 px-8 py-4 rounded-2xl border border-white/15 text-slate-300 font-semibold text-lg hover:bg-white/5 hover:border-white/25 transition-all duration-300"
            >
              <Zap className="w-5 h-5 text-orange-400" />
              Create Incident
            </Link>
          </div>


          {/* Stats bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {STATS.map((stat) => (
              <div key={stat.label} className="glass-card p-4 text-center">
                <p className="text-2xl font-black gradient-text">{stat.value}</p>
                <p className="text-xs font-semibold text-slate-300 mt-1">{stat.label}</p>
                <p className="text-[10px] text-slate-500 mt-0.5">{stat.sub}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
          <p className="text-xs text-slate-500">Scroll to explore</p>
          <div className="w-px h-8 bg-gradient-to-b from-slate-500 to-transparent" />
        </div>
      </section>

      {/* Features Grid */}
      <section className="px-6 py-24 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-orange-400 text-sm font-semibold uppercase tracking-widest mb-3">Core Capabilities</p>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
            Built for Modern{" "}
            <span className="gradient-text">SRE Teams</span>
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Stop solving the same problems twice. OpsMind AI builds your organization&apos;s collective operational memory.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className={`glass-card p-6 relative overflow-hidden bg-gradient-to-br ${feature.color} group`}
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className={`w-12 h-12 rounded-2xl ${feature.iconBg} border ${feature.border} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className={`w-6 h-6 ${feature.iconColor}`} />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Tech stack */}
      <section className="px-6 pb-24 max-w-4xl mx-auto text-center">
        <p className="text-slate-500 text-sm uppercase tracking-widest mb-8">Powered By</p>
        <div className="flex flex-wrap justify-center gap-4">
          {[
            { label: "Amazon Aurora PostgreSQL", color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/20" },
            { label: "Amazon S3", color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
            { label: "Vercel + Next.js 16", color: "text-white", bg: "bg-white/5 border-white/10" },
            { label: "OpenAI RCA Engine", color: "text-green-400", bg: "bg-green-500/10 border-green-500/20" },
            { label: "Drizzle ORM", color: "text-sky-400", bg: "bg-sky-500/10 border-sky-500/20" },
            { label: "TypeScript", color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
          ].map((tech) => (
            <span
              key={tech.label}
              className={`px-4 py-2 rounded-full border text-sm font-medium ${tech.color} ${tech.bg}`}
            >
              {tech.label}
            </span>
          ))}
        </div>
      </section>
    </main>
  );
}
