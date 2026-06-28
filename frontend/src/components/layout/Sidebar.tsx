"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  AlertTriangle,
  BookOpen,
  Brain,
  BarChart3,
  ChevronRight,
  Database,
  Shield,
  Swords,
  User,
  Zap,
  Menu,
  X,
} from "lucide-react";
import { useState, useEffect } from "react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: Activity, description: "Command Center" },
  { href: "/incidents", label: "Incidents", icon: AlertTriangle, description: "Manage Incidents" },
  { href: "/knowledge", label: "Knowledge Base", icon: BookOpen, description: "Incident Memory" },
  { href: "/war-room", label: "AI War Room", icon: Swords, description: "Live Collaboration" },
  { href: "/analytics", label: "Analytics", icon: BarChart3, description: "Insights & Trends" },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  // Hide sidebar on auth pages and landing page
  const isExcluded =
    pathname === "/" ||
    pathname.startsWith("/sign-in") ||
    pathname.startsWith("/sign-up");

  if (isExcluded) return null;

  return (
    <>
      {/* Global Header (Toggle + Logo) */}
      <div className="fixed top-4 left-4 z-[60] flex items-center gap-3">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 bg-transparent hover:bg-white/5 rounded-md text-slate-300 hover:text-white transition-colors"
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
        
        {/* Logo (Visible when sidebar is closed) */}
        {!isOpen && (
          <Link href="/dashboard" className="flex items-center gap-2 group animate-in fade-in duration-300">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg">
              <Brain className="w-4 h-4 text-white" />
            </div>
            <p className="font-bold text-sm text-white leading-none">OpsMind AI</p>
          </Link>
        )}
      </div>

      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm" 
          onClick={() => setIsOpen(false)} 
        />
      )}

      <aside className={`fixed left-0 top-0 h-full w-64 sidebar-glass flex flex-col z-50 border-r border-white/8 transform transition-transform duration-300 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>
      {/* Logo */}
      <div className="p-5 border-b border-white/8">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/30 group-hover:shadow-orange-500/50 transition-all duration-300">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-green-400 border-2 border-[#020617] animate-pulse" />
          </div>
          <div>
            <p className="font-bold text-sm text-white leading-none">OpsMind AI</p>
            <p className="text-[10px] text-slate-400 mt-0.5 font-mono">Memory Engine v2.0</p>
          </div>
        </Link>
      </div>

      {/* Active Incident Banner */}
      <div className="mx-3 mt-3 rounded-lg bg-red-500/10 border border-red-500/20 p-3 flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse shrink-0" />
        <div className="min-w-0">
          <p className="text-xs font-semibold text-red-400">2 Active Incidents</p>
          <p className="text-[10px] text-slate-400 truncate">INC-201 critical • INC-200 high</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 mt-2">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 relative ${
                isActive
                  ? "bg-orange-500/15 text-orange-400 border border-orange-500/20"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-orange-400 rounded-r-full" />
              )}
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-orange-400" : "group-hover:text-white"}`} />
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${isActive ? "text-orange-300" : ""}`}>{item.label}</p>
              </div>
              {isActive && <ChevronRight className="w-3 h-3 text-orange-400 shrink-0" />}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-white/8 space-y-2">
        {/* Service status */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/3">
          <Database className="w-3.5 h-3.5 text-sky-400 shrink-0" />
          <span className="text-[11px] text-slate-400">Aurora PostgreSQL</span>
          <div className="ml-auto w-2 h-2 rounded-full bg-green-400" />
        </div>
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/3">
          <Zap className="w-3.5 h-3.5 text-orange-400 shrink-0" />
          <span className="text-[11px] text-slate-400">OpenAI RCA Engine</span>
          <div className="ml-auto w-2 h-2 rounded-full bg-green-400" />
        </div>
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/3">
          <Shield className="w-3.5 h-3.5 text-violet-400 shrink-0" />
          <span className="text-[11px] text-slate-400">Vercel Edge</span>
          <div className="ml-auto w-2 h-2 rounded-full bg-green-400" />
        </div>

        {/* User section */}
        <UserSection />

        {/* Hackathon badge */}
        <div className="px-3 py-2 rounded-lg bg-gradient-to-r from-orange-500/10 to-sky-500/10 border border-white/5 text-center">
          <p className="text-[10px] text-slate-400">🏆 AWS + Vercel Hackathon 2026</p>
          <p className="text-[10px] font-semibold text-orange-400">Hack the Zero Stack</p>
        </div>
      </div>
    </aside>
    </>
  );
}

// Dynamic User section that reads from localStorage
function UserSection() {
  const [user, setUser] = useState<{name?: string, avatarUrl?: string} | null>(null);

  useEffect(() => {
    const updateSession = () => {
      try {
        const session = localStorage.getItem("session");
        if (session) {
          setUser(JSON.parse(session));
        }
      } catch(e) {}
    };

    updateSession();
    window.addEventListener("storage", updateSession);
    return () => window.removeEventListener("storage", updateSession);
  }, []);

  return (
    <div className="flex items-center gap-2 px-2 py-2 rounded-lg bg-white/3">
      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500/40 to-sky-500/40 border border-white/15 flex items-center justify-center overflow-hidden shrink-0">
        {user?.avatarUrl ? (
          <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
        ) : (
          <User className="w-4 h-4 text-white" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] text-slate-300 font-medium truncate">{user?.name || "Authenticating..."}</p>
        <p className="text-[10px] text-sky-400 font-bold tracking-widest truncate">{user?.avatarUrl ? "AI AVATAR SYNCED" : "AI SCANNING..."}</p>
      </div>
      <div className="w-2 h-2 rounded-full bg-green-400" />
    </div>
  );
}
