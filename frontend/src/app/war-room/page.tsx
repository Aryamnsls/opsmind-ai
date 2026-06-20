"use client";

import { useEffect, useRef, useState } from "react";
import {
  Bot,
  CheckCircle,
  Clock,
  Dna,
  MessageSquare,
  Send,
  Shield,
  Swords,
  User,
  Zap,
} from "lucide-react";
import { WAR_ROOM_MESSAGES, MOCK_INCIDENTS } from "@/lib/mock-data";

type Message = {
  id: string;
  author: string;
  avatar: string;
  message: string;
  time: string;
  type: "user" | "ai" | "system";
};

const activeIncident = MOCK_INCIDENTS[0];

// Incident started at the time indicated in mock timeline
const INCIDENT_START = new Date("2026-06-17T10:01:00Z").getTime();

function formatElapsed(ms: number) {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return [
    String(hours).padStart(2, "0"),
    String(minutes).padStart(2, "0"),
    String(seconds).padStart(2, "0"),
  ].join(":");
}

const AI_RESPONSES: Record<string, string> = {
  redis: "Redis memory pattern detected in current incident. Historical match INC-104 at 94% similarity. Recommended: flush stale session keys + increase maxmemory to 8GB. Confidence: 93%.",
  memory: "Memory pressure confirmed across worker pods. OOMKilled pattern matches INC-200. Immediate action: scale pods from 3→8 replicas and increase memory limits. ETA resolution: 12-18 minutes.",
  cpu: "CPU spike pattern correlates with recent deployment v3.4.2. Possible unbounded loop or N+1 query introduced. Recommend thread dump analysis + rollback as contingency.",
  timeout: "Timeout cascade detected. Based on INC-201 pattern: upstream Redis dependency is the likely bottleneck. Enable circuit breaker + retry with exponential backoff.",
  status: "Current status: Error rate dropping 21% → 12%. Redis flush in progress. ETA full recovery: 8-12 minutes based on historical INC-104 resolution trajectory.",
  rollback: "Rollback to v3.4.1 is staged and ready. Based on INC-199 playbook, rollback should complete in ~4 minutes. Recommend keeping monitoring active for 15 minutes post-rollback.",
  default: "Analyzing current incident patterns against Aurora memory. Based on Incident DNA fingerprint DNA-7F2A9B3C, monitoring situation trajectory. Will update with findings.",
};

function getAIResponse(msg: string): string {
  const lower = msg.toLowerCase();
  for (const [key, response] of Object.entries(AI_RESPONSES)) {
    if (key !== "default" && lower.includes(key)) return response;
  }
  return AI_RESPONSES.default;
}

export default function WarRoomPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [msgIndex, setMsgIndex] = useState(0);
  const [resolved, setResolved] = useState(false);
  const [elapsed, setElapsed] = useState(Date.now() - INCIDENT_START);
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Live running elapsed timer
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsed(Date.now() - INCIDENT_START);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Simulate messages appearing one by one
  useEffect(() => {
    if (msgIndex >= WAR_ROOM_MESSAGES.length) return;
    const timer = setTimeout(() => {
      setMessages((prev) => [...prev, WAR_ROOM_MESSAGES[msgIndex]]);
      setMsgIndex((i) => i + 1);
    }, msgIndex === 0 ? 500 : 1800);
    return () => clearTimeout(timer);
  }, [msgIndex]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim()) return;

    const userMsg: Message = {
      id: String(Date.now()),
      author: "You",
      avatar: "YU",
      message: input,
      time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
      type: "user",
    };
    const capturedInput = input;
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // Simulate AI typing delay then respond
    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: String(Date.now() + 1),
          author: "OpsMind AI",
          avatar: "AI",
          message: getAIResponse(capturedInput),
          time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
          type: "ai",
        },
      ]);
    }, 1400);
  };

  return (
    <main className="min-h-screen p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">Live Collaboration</p>
          <h1 className="text-2xl font-black text-white flex items-center gap-3">
            <Swords className="w-6 h-6 text-red-400" />
            AI War Room
            <span className="text-[11px] font-semibold text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-1 rounded-full animate-pulse">
              ● LIVE
            </span>
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">Active incident: {activeIncident.id} — {activeIncident.title}</p>
        </div>

        {!resolved && (
          <button
            id="btn-mark-resolved"
            onClick={() => setResolved(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-green-500/15 border border-green-500/30 text-green-400 font-semibold text-sm hover:bg-green-500/25 transition-colors"
          >
            <CheckCircle className="w-4 h-4" />
            Mark Resolved
          </button>
        )}
      </div>

      {resolved && (
        <div className="glass-card p-4 border-l-4 border-green-500 bg-green-500/5 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-400" />
          <div>
            <p className="text-sm font-bold text-green-400">Incident Resolved ✓</p>
            <p className="text-xs text-slate-400">RCA report generated and stored to Knowledge Base. Aurora memory updated.</p>
          </div>
          <div className="ml-auto flex items-center gap-1.5 text-xs text-green-400 font-semibold">
            <Zap className="w-3.5 h-3.5" />
            MTTR: {formatElapsed(elapsed)}
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6 h-[600px]">
        {/* Chat Panel — col-2 */}
        <div className="glass-card flex flex-col lg:col-span-2 overflow-hidden">
          <div className="p-4 border-b border-white/8 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-sky-400" />
            <h2 className="text-sm font-bold text-white">War Room Chat</h2>
            <div className="ml-auto flex items-center gap-1.5">
              {["AS", "PS", "RM"].map((initials) => (
                <div
                  key={initials}
                  className="w-6 h-6 rounded-full bg-gradient-to-br from-orange-500/40 to-sky-500/40 border border-white/15 flex items-center justify-center text-[9px] font-bold text-white"
                >
                  {initials}
                </div>
              ))}
              <span className="text-xs text-slate-500 ml-1">3 active responders</span>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.type === "system" ? "justify-center" : ""}`}
              >
                {msg.type === "system" ? (
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 bg-white/3 border border-white/8 px-3 py-1.5 rounded-full">
                    <Shield className="w-3 h-3" />
                    <span>{msg.message}</span>
                    <span className="text-slate-600">{msg.time}</span>
                  </div>
                ) : (
                  <>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 border ${
                      msg.type === "ai"
                        ? "bg-gradient-to-br from-sky-500/30 to-violet-500/30 border-sky-500/30 text-sky-300"
                        : "bg-gradient-to-br from-orange-500/20 to-amber-500/20 border-orange-500/20 text-orange-300"
                    }`}>
                      {msg.type === "ai" ? <Bot className="w-4 h-4" /> : msg.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs font-semibold ${msg.type === "ai" ? "text-sky-400" : "text-slate-300"}`}>
                          {msg.author}
                        </span>
                        <span className="text-[10px] text-slate-600 font-mono">{msg.time}</span>
                        {msg.type === "ai" && (
                          <span className="text-[10px] bg-sky-500/10 border border-sky-500/20 text-sky-400 px-1.5 py-0.5 rounded font-semibold">
                            AI
                          </span>
                        )}
                      </div>
                      <div className={`rounded-xl p-3 text-sm leading-relaxed ${
                        msg.type === "ai"
                          ? "bg-sky-500/8 border border-sky-500/15 text-slate-200"
                          : "bg-white/4 border border-white/8 text-slate-300"
                      }`}>
                        {msg.message}
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}

            {/* AI Typing indicator */}
            {isTyping && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 border bg-gradient-to-br from-sky-500/30 to-violet-500/30 border-sky-500/30 text-sky-300">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <div className="text-xs font-semibold text-sky-400 mb-1">OpsMind AI</div>
                  <div className="bg-sky-500/8 border border-sky-500/15 rounded-xl p-3 flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-white/8 flex gap-2">
            <input
              id="war-room-input"
              type="text"
              placeholder="Type a message or ask @AI for help (try: redis, status, rollback)..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-sky-500/50 transition-colors"
            />
            <button
              id="btn-send-message"
              onClick={sendMessage}
              className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-sky-600 flex items-center justify-center text-white hover:from-sky-400 hover:to-sky-500 transition-all shadow-lg shadow-sky-500/20 active:scale-95"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right Panel */}
        <div className="space-y-4 flex flex-col overflow-hidden">
          {/* AI Summary */}
          <div className="glass-card p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Bot className="w-4 h-4 text-sky-400" />
              <p className="text-sm font-bold text-white">AI Summary</p>
            </div>
            <div className="space-y-2 text-xs text-slate-400 leading-relaxed">
              <p>
                <strong className="text-white">Root Cause:</strong> Redis connection pool exhaustion matching INC-104 pattern at 94% similarity.
              </p>
              <p>
                <strong className="text-white">Status:</strong> {resolved ? "✓ Incident resolved" : "Mitigation in progress. Error rate dropping from 21% → 7%."}
              </p>
              <p>
                <strong className="text-white">ETA:</strong> {resolved ? "Complete" : "Full recovery projected in ~8 minutes."}
              </p>
            </div>
          </div>

          {/* Incident DNA */}
          <div className="glass-card p-5 space-y-3">
            <div className="flex items-center gap-2">
              <Dna className="w-4 h-4 text-orange-400" />
              <p className="text-sm font-bold text-white">Incident DNA™</p>
            </div>
            <div className="font-mono text-[11px] space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">fingerprint</span>
                <span className="text-orange-400">{activeIncident.dna.fingerprint}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">similarity</span>
                <span className="text-green-400">94% → INC-104</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">confidence</span>
                <span className="text-green-400">92%</span>
              </div>
            </div>
          </div>

          {/* Responders */}
          <div className="glass-card p-5 space-y-3 flex-1">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-violet-400" />
              <p className="text-sm font-bold text-white">Active Responders</p>
            </div>
            <div className="space-y-2">
              {[
                { name: "Aryaman Singh", role: "Lead SRE", initials: "AS", status: resolved ? "Monitoring" : "Applying fix" },
                { name: "Priya Sharma", role: "Backend Eng", initials: "PS", status: "Monitoring" },
                { name: "Rahul Mehta", role: "Platform Eng", initials: "RM", status: resolved ? "On standby" : "Traffic routing" },
              ].map((r) => (
                <div key={r.name} className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-500/30 to-sky-500/30 border border-white/10 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                    {r.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-200 truncate">{r.name}</p>
                    <p className="text-[10px] text-slate-500">{r.status}</p>
                  </div>
                  <div className={`w-2 h-2 rounded-full ${resolved ? "bg-slate-500" : "bg-green-400 animate-pulse"}`} />
                </div>
              ))}
            </div>
          </div>

          {/* Live Elapsed Timer */}
          <div className="glass-card p-4">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                {resolved ? "Total Duration" : "Elapsed"}
              </p>
            </div>
            <p className="text-3xl font-black text-white tabular-nums font-mono">
              {formatElapsed(elapsed)}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {resolved ? "Incident resolved" : "Since first alert · " + new Date(INCIDENT_START).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
