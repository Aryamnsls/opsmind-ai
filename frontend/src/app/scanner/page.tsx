"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Terminal, Shield, Zap, CheckCircle2, Loader2, ArrowRight } from "lucide-react";

const SCAN_STEPS = [
  "Initializing Live Server Auto-Ingest Protocol...",
  "Bypassing Edge WAF and establishing secure tunnel...",
  "Pinging target server and intercepting TCP handshakes...",
  "Analyzing response headers for latency anomalies...",
  "Extracting application logs and error metrics...",
  "Synthesizing Incident DNA fingerprint...",
  "Querying Aurora PostgreSQL Knowledge Base for historical matches...",
  "Running OpenAI RCA Engine on discovered metrics...",
  "Scan complete. Generating final incident report..."
];

export default function ScannerPage() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [scanComplete, setScanComplete] = useState(false);

  const startScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    let targetUrl = url;
    if (!targetUrl.startsWith("http")) {
      targetUrl = "https://" + targetUrl;
    }

    setIsScanning(true);
    setLogs([]);
    setScanComplete(false);

    // Simulate the scanning process in the terminal
    for (let i = 0; i < SCAN_STEPS.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 500));
      setLogs(prev => [...prev, `[${new Date().toISOString().split("T")[1].slice(0, 8)}] ${SCAN_STEPS[i]}`]);
    }

    // Call the API to generate the incident in the DB
    try {
      const sessionStr = localStorage.getItem("session");
      let userId = null;
      if (sessionStr) {
        userId = JSON.parse(sessionStr).id;
      }

      const res = await fetch("/api/scanner/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: targetUrl, userId }),
      });
      const data = await res.json();

      if (data.success) {
        setScanComplete(true);
        setTimeout(() => {
          router.push(`/incidents/${data.incidentId}`);
        }, 1500);
      } else {
        setLogs(prev => [...prev, `[ERROR] Failed to generate report: ${data.error}`]);
        setIsScanning(false);
      }
    } catch (e: any) {
      setLogs(prev => [...prev, `[CRITICAL ERROR] Scanner failed: ${e.message}`]);
      setIsScanning(false);
    }
  };

  return (
    <main className="min-h-screen p-6 md:p-12 space-y-8 max-w-5xl mx-auto">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500/20 to-sky-500/20 border border-green-500/30 text-green-400 mb-4">
          <Terminal className="w-8 h-8" />
        </div>
        <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight">Live Server Scanner</h1>
        <p className="text-slate-400 max-w-2xl mx-auto text-lg">
          Enter any production server URL. OpsMind AI will intercept simulated traffic, generate an incident footprint, and perform an automatic Root Cause Analysis.
        </p>
      </div>

      <form onSubmit={startScan} className="glass-card p-2 rounded-full flex items-center shadow-2xl border border-white/10 max-w-2xl mx-auto focus-within:border-green-500/50 transition-colors">
        <div className="pl-6 pr-2 text-slate-500">
          <Zap className="w-5 h-5" />
        </div>
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="e.g. netflix.com"
          disabled={isScanning}
          className="flex-1 bg-transparent border-none text-white focus:outline-none focus:ring-0 placeholder-slate-600 px-2 py-3 text-lg"
        />
        <button
          type="submit"
          disabled={isScanning || !url}
          className="bg-green-500 hover:bg-green-400 text-slate-950 font-bold px-8 py-3 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isScanning ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" /> Scanning
            </>
          ) : (
            <>
              Initiate <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </form>

      {/* Terminal UI */}
      {(isScanning || logs.length > 0) && (
        <div className="glass-card p-6 rounded-2xl bg-slate-950 border border-white/10 overflow-hidden shadow-2xl mt-12 animate-in slide-in-from-bottom-8 duration-500">
          <div className="flex items-center gap-2 mb-4 border-b border-white/10 pb-4">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="ml-4 text-xs font-mono text-slate-500">root@opsmind-ai:~# scanner</span>
          </div>
          
          <div className="font-mono text-sm space-y-2 h-64 overflow-y-auto custom-scrollbar">
            {logs.map((log, i) => (
              <div key={i} className="flex gap-4 animate-in fade-in duration-300">
                <span className="text-slate-600 select-none">❯</span>
                <span className={
                  log.includes("ERROR") ? "text-red-400 font-bold" : 
                  log.includes("Scan complete") ? "text-green-400 font-bold" : 
                  "text-sky-300"
                }>
                  {log}
                </span>
              </div>
            ))}
            {isScanning && !scanComplete && (
              <div className="flex gap-4">
                <span className="text-slate-600">❯</span>
                <span className="text-slate-400 flex items-center gap-2">
                  <span className="w-2 h-4 bg-green-500 animate-pulse inline-block" />
                </span>
              </div>
            )}
            {scanComplete && (
              <div className="flex flex-col items-center justify-center mt-8 space-y-3 animate-in zoom-in duration-500">
                <CheckCircle2 className="w-12 h-12 text-green-500" />
                <p className="text-green-400 font-bold text-lg">Analysis Complete</p>
                <p className="text-slate-400 text-xs">Redirecting to RCA Report...</p>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
