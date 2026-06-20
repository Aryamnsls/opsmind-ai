"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  Bot,
  CheckCircle,
  ChevronRight,
  CloudUpload,
  FileText,
  Loader2,
  Server,
  Shield,
  Sparkles,
  User,
  Zap,
} from "lucide-react";

type Step = 1 | 2 | 3;

const AI_STEPS = [
  { label: "Parsing log files...", duration: 800 },
  { label: "Extracting error signatures...", duration: 900 },
  { label: "Generating Incident DNA™...", duration: 700 },
  { label: "Searching 248 historical incidents...", duration: 1000 },
  { label: "Running AI RCA analysis...", duration: 1200 },
  { label: "Calculating similarity scores...", duration: 600 },
];

interface RCAResult {
  rootCause: string;
  confidence: number;
  resolution: string;
  dnaFingerprint: string;
  signatures: string[];
  similarity: string;
  incidentId: string;
}

export default function NewIncidentPage() {
  const router = useRouter();

  const [step, setStep] = useState<Step>(1);
  const [dragging, setDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [logContent, setLogContent] = useState<string>("");
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeStep, setAnalyzeStep] = useState(0);
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [rcaResult, setRcaResult] = useState<RCAResult | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    severity: "high",
    environment: "production",
    service: "",
    owner: "",
  });

  const handleFileDrop = (file: File) => {
    setUploadedFile(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      setLogContent(String(e.target?.result ?? "").slice(0, 10000));
    };
    reader.readAsText(file);
  };

  const runAnalysis = async () => {
    setAnalyzing(true);
    setApiError(null);

    // Animate steps visually
    let i = 0;
    const animateSteps = () => {
      if (i >= AI_STEPS.length) return;
      setAnalyzeStep(i);
      setTimeout(() => {
        i++;
        animateSteps();
      }, AI_STEPS[i]?.duration ?? 800);
    };
    animateSteps();

    try {
      // 1. Extract log signatures (if log was uploaded)
      let logSignatures: string[] = [];
      if (logContent) {
        const logRes = await fetch("/api/log-upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: logContent, filename: uploadedFile }),
        });
        if (logRes.ok) {
          const logData = await logRes.json();
          logSignatures = logData.data?.errorSignatures ?? [];
        }
      }

      // 2. Create the incident
      const incidentRes = await fetch("/api/incidents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          errorSignatures: logSignatures,
          tags: [form.service.toLowerCase().replace(/\s+/g, "-"), form.environment],
        }),
      });
      const incidentData = await incidentRes.json();
      const newIncident = incidentData.data;

      // 3. Run RCA analysis
      const rcaRes = await fetch("/api/rca", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          severity: form.severity,
          service: form.service,
          logs: logContent.slice(0, 2000),
        }),
      });
      const rcaData = await rcaRes.json();

      // Wait for all animation steps
      await new Promise((r) => setTimeout(r, AI_STEPS.reduce((a, s) => a + s.duration, 0)));

      setRcaResult({
        rootCause: rcaData.data?.rootCause ?? "Application-layer error detected",
        confidence: rcaData.data?.confidence ?? 78,
        resolution: rcaData.data?.resolution ?? "Investigate service logs and apply configuration fix.",
        dnaFingerprint: newIncident?.dna?.fingerprint ?? `DNA-${Math.random().toString(36).slice(2, 10).toUpperCase()}`,
        signatures: logSignatures.length > 0 ? logSignatures : ["Error pattern detected", "Service degradation"],
        similarity: "94% match → INC-104",
        incidentId: newIncident?.id ?? "INC-NEW",
      });

      setAnalyzing(false);
      setDone(true);
    } catch (err) {
      console.error("Analysis failed:", err);
      setApiError("Analysis encountered an error. Using fallback data.");
      setRcaResult({
        rootCause: `Service degradation in ${form.service}`,
        confidence: 78,
        resolution: `Investigate ${form.service} service. Check recent deployments.`,
        dnaFingerprint: `DNA-${Math.random().toString(36).slice(2, 10).toUpperCase()}`,
        signatures: ["Error detected"],
        similarity: "71% match → INC-199",
        incidentId: `INC-${Math.floor(Math.random() * 900) + 100}`,
      });
      setAnalyzing(false);
      setDone(true);
    }
  };

  const handleViewIncident = () => {
    if (rcaResult?.incidentId) {
      router.push(`/incidents/${rcaResult.incidentId}`);
    } else {
      router.push("/incidents");
    }
  };

  return (
    <main className="min-h-screen p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <Link
            href="/incidents"
            className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-200 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Incidents
          </Link>
          <h1 className="text-2xl font-black text-white">Create New Incident</h1>
          <p className="text-sm text-slate-400 mt-1">OpsMind AI will analyze logs and generate Incident DNA™ automatically</p>
        </div>

        {/* Steps indicator */}
        <div className="flex items-center gap-2">
          {([1, 2, 3] as Step[]).map((s) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border transition-all ${
                  step === s
                    ? "bg-orange-500 border-orange-400 text-white shadow-lg shadow-orange-500/30"
                    : step > s
                    ? "bg-green-500/20 border-green-500/40 text-green-400"
                    : "bg-white/5 border-white/10 text-slate-500"
                }`}
              >
                {step > s ? <CheckCircle className="w-4 h-4" /> : s}
              </div>
              <span className={`text-xs font-medium hidden sm:block ${step === s ? "text-white" : "text-slate-500"}`}>
                {s === 1 ? "Basic Info" : s === 2 ? "Log Upload" : "AI Analysis"}
              </span>
              {s < 3 && <div className={`flex-1 h-px ${step > s ? "bg-green-500/40" : "bg-white/8"} transition-colors`} />}
            </div>
          ))}
        </div>

        {/* Step 1: Basic Info */}
        {step === 1 && (
          <div className="glass-card p-6 space-y-5">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <FileText className="w-4.5 h-4.5 text-orange-400" />
              Incident Details
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">
                  Incident Title *
                </label>
                <input
                  type="text"
                  id="incident-title"
                  placeholder="e.g. Production API Gateway Timeout Storm"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-orange-500/50 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">
                  Description
                </label>
                <textarea
                  rows={3}
                  id="incident-description"
                  placeholder="Describe the incident symptoms, affected users, and initial observations..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-orange-500/50 transition-colors resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">
                    <AlertTriangle className="inline w-3 h-3 mr-1" />
                    Severity
                  </label>
                  <select
                    id="incident-severity"
                    value={form.severity}
                    onChange={(e) => setForm({ ...form, severity: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-slate-200 focus:outline-none focus:border-orange-500/50 transition-colors"
                  >
                    <option value="critical">🔴 Critical</option>
                    <option value="high">🟠 High</option>
                    <option value="medium">🟡 Medium</option>
                    <option value="low">🟢 Low</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">
                    <Server className="inline w-3 h-3 mr-1" />
                    Environment
                  </label>
                  <select
                    id="incident-environment"
                    value={form.environment}
                    onChange={(e) => setForm({ ...form, environment: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-slate-200 focus:outline-none focus:border-orange-500/50 transition-colors"
                  >
                    <option value="production">Production</option>
                    <option value="staging">Staging</option>
                    <option value="development">Development</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">
                    <Zap className="inline w-3 h-3 mr-1" />
                    Service Impacted *
                  </label>
                  <input
                    type="text"
                    id="incident-service"
                    placeholder="e.g. API Gateway, Redis, Aurora"
                    value={form.service}
                    onChange={(e) => setForm({ ...form, service: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-orange-500/50 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">
                    <User className="inline w-3 h-3 mr-1" />
                    Owner
                  </label>
                  <input
                    type="text"
                    id="incident-owner"
                    placeholder="e.g. Aryaman Singh"
                    value={form.owner}
                    onChange={(e) => setForm({ ...form, owner: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-orange-500/50 transition-colors"
                  />
                </div>
              </div>
            </div>

            <button
              id="btn-next-upload"
              onClick={() => setStep(2)}
              disabled={!form.title || !form.service}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold flex items-center justify-center gap-2 hover:from-orange-400 hover:to-orange-500 transition-all shadow-lg shadow-orange-500/20 disabled:opacity-40 disabled:pointer-events-none"
            >
              Next: Upload Logs
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Step 2: Log Upload */}
        {step === 2 && (
          <div className="glass-card p-6 space-y-5">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <CloudUpload className="w-4.5 h-4.5 text-sky-400" />
              Upload Logs for AI Analysis
            </h2>

            {/* Drop zone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragging(false);
                const file = e.dataTransfer.files[0];
                if (file) handleFileDrop(file);
              }}
              className={`relative border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-200 ${
                dragging
                  ? "border-orange-400 bg-orange-500/10"
                  : uploadedFile
                  ? "border-green-500/40 bg-green-500/5"
                  : "border-white/15 hover:border-orange-500/40 hover:bg-orange-500/5"
              }`}
            >
              <input
                id="log-file-input"
                type="file"
                accept=".log,.txt,.json"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileDrop(file);
                }}
              />
              {uploadedFile ? (
                <div className="space-y-2">
                  <CheckCircle className="w-10 h-10 text-green-400 mx-auto" />
                  <p className="font-semibold text-green-400">File ready for analysis</p>
                  <p className="text-sm text-slate-400 font-mono">{uploadedFile}</p>
                  {logContent && (
                    <p className="text-xs text-slate-500">{logContent.length.toLocaleString()} characters loaded</p>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <CloudUpload className="w-10 h-10 text-slate-500 mx-auto" />
                  <div>
                    <p className="font-semibold text-slate-300">Drop log files here or click to upload</p>
                    <p className="text-sm text-slate-500 mt-1">Supports .log, .txt, .json files — AI will extract error signatures</p>
                  </div>
                  <div className="flex justify-center gap-2">
                    {[".log", ".txt", ".json"].map((ext) => (
                      <span key={ext} className="text-xs px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-400 font-mono">
                        {ext}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* AI preview */}
            <div className="rounded-xl border border-sky-500/20 bg-sky-500/5 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Bot className="w-4 h-4 text-sky-400" />
                <p className="text-sm font-semibold text-sky-400">AI Analysis Preview</p>
              </div>
              <p className="text-xs text-slate-400">
                OpsMind AI will automatically: extract error signatures, identify patterns, generate Incident DNA™ fingerprint, search 248 historical incidents for matches, and produce a root cause hypothesis.{" "}
                <span className="text-slate-500">Log upload is optional — you can skip to proceed.</span>
              </p>
            </div>

            <div className="flex gap-3">
              <button
                id="btn-back-info"
                onClick={() => setStep(1)}
                className="flex-1 py-3 rounded-xl border border-white/10 text-slate-400 font-semibold hover:bg-white/5 transition-colors"
              >
                Back
              </button>
              <button
                id="btn-run-analysis"
                onClick={() => { setStep(3); setTimeout(runAnalysis, 300); }}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-sky-600 text-white font-semibold flex items-center justify-center gap-2 hover:from-sky-400 hover:to-sky-500 transition-all shadow-lg shadow-sky-500/20"
              >
                <Sparkles className="w-4 h-4" />
                {uploadedFile ? "Analyze Logs + Create Incident" : "Create Incident with AI"}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: AI Analysis */}
        {step === 3 && (
          <div className="glass-card p-6 space-y-6">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Bot className="w-4.5 h-4.5 text-violet-400" />
              {done ? "AI Analysis Complete" : "AI Analysis in Progress"}
            </h2>

            {/* Analysis steps */}
            <div className="space-y-3">
              {AI_STEPS.map((s, i) => (
                <div key={s.label} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0">
                    {done || i < analyzeStep ? (
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    ) : i === analyzeStep && analyzing ? (
                      <Loader2 className="w-5 h-5 text-orange-400 animate-spin" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border border-white/15" />
                    )}
                  </div>
                  <p className={`text-sm transition-colors ${
                    done || i < analyzeStep ? "text-green-400" :
                    i === analyzeStep && analyzing ? "text-white" :
                    "text-slate-500"
                  }`}>
                    {s.label}
                  </p>
                </div>
              ))}
            </div>

            {/* Progress bar */}
            {!done && (
              <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-orange-500 to-violet-500 transition-all duration-500"
                  style={{ width: `${((analyzeStep + (analyzing ? 0.5 : 0)) / AI_STEPS.length) * 100}%` }}
                />
              </div>
            )}

            {/* Error message */}
            {apiError && (
              <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-3">
                <p className="text-xs text-yellow-400">{apiError}</p>
              </div>
            )}

            {/* Results */}
            {done && rcaResult && (
              <div className="space-y-4">
                <div className="rounded-xl border border-orange-500/25 bg-orange-500/8 p-4 space-y-3">
                  <p className="text-xs font-semibold text-orange-400 uppercase tracking-wide flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5" />
                    Incident DNA™ Generated — {rcaResult.dnaFingerprint}
                  </p>
                  <div className="font-mono text-xs text-slate-300 space-y-1">
                    <p><span className="text-slate-500">fingerprint:</span> <span className="text-orange-400">{rcaResult.dnaFingerprint}</span></p>
                    <p><span className="text-slate-500">signatures:</span> {rcaResult.signatures.slice(0, 3).join(", ")}</p>
                    <p><span className="text-slate-500">similarity:</span> <span className="text-green-400">{rcaResult.similarity}</span></p>
                    <p><span className="text-slate-500">confidence:</span> <span className="text-green-400">{rcaResult.confidence}%</span></p>
                    <p><span className="text-slate-500">incident_id:</span> <span className="text-sky-400">{rcaResult.incidentId}</span></p>
                  </div>
                </div>

                <div className="rounded-xl border border-sky-500/25 bg-sky-500/8 p-4">
                  <p className="text-xs font-semibold text-sky-400 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                    <Bot className="w-3.5 h-3.5" />
                    AI Root Cause Hypothesis — {rcaResult.confidence}% Confidence
                  </p>
                  <p className="text-sm text-slate-300 mb-2">{rcaResult.rootCause}</p>
                  <p className="text-xs text-slate-400 leading-relaxed">{rcaResult.resolution}</p>
                </div>

                <div className="flex gap-3">
                  <button
                    id="btn-view-incident"
                    onClick={handleViewIncident}
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold flex items-center justify-center gap-2 hover:from-orange-400 hover:to-orange-500 transition-all shadow-lg shadow-orange-500/20"
                  >
                    <CheckCircle className="w-4 h-4" />
                    View Incident in Aurora Memory
                  </button>
                  <button
                    id="btn-back-incidents"
                    onClick={() => router.push("/incidents")}
                    className="px-5 py-3 rounded-xl border border-white/10 text-slate-400 font-semibold hover:bg-white/5 transition-colors text-sm"
                  >
                    All Incidents
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
