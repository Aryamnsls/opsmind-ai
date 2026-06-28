"use client";

import React, { useState, useRef, useCallback } from "react";
import Webcam from "react-webcam";
import { useRouter } from "next/navigation";
import { Brain, ScanFace, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const webcamRef = useRef<Webcam>(null);
  
  const [status, setStatus] = useState<"scanning" | "authenticating" | "registering" | "success" | "error">("scanning");
  const [errorMessage, setErrorMessage] = useState("");
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<{ name: string; age: string; gender: string }>({ name: "", age: "", gender: "" });

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setCapturedImage(imageSrc);
      authenticateFace(imageSrc);
    }
  }, [webcamRef]);

  const authenticateFace = async (imageSrc: string) => {
    setStatus("authenticating");
    try {
      const res = await fetch("/api/auth/face", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: imageSrc }),
      });
      const data = await res.json();

      if (data.success && data.recognized) {
        setStatus("success");
        setTimeout(() => router.push("/dashboard"), 1500);
      } else {
        // Face not found, prompt for registration
        setStatus("registering");
      }
    } catch (e: any) {
      setStatus("error");
      setErrorMessage(e.message || "Authentication failed");
    }
  };

  const registerFace = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("authenticating");
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: capturedImage,
          name: userProfile.name,
          age: userProfile.age,
          gender: userProfile.gender,
        }),
      });
      const data = await res.json();

      if (data.success) {
        setStatus("success");
        setTimeout(() => router.push("/dashboard"), 1500);
      } else {
        setStatus("error");
        setErrorMessage(data.error || "Registration failed");
      }
    } catch (e: any) {
      setStatus("error");
      setErrorMessage(e.message || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="glass-card w-full max-w-md p-8 relative z-10 border border-white/10 shadow-2xl flex flex-col items-center">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/30">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">OpsMind AI</h1>
            <p className="text-xs text-orange-400 font-mono tracking-wider uppercase">Biometric Access</p>
          </div>
        </div>

        {status === "scanning" || status === "authenticating" ? (
          <div className="w-full flex flex-col items-center">
            <div className="relative w-64 h-64 rounded-full overflow-hidden border-4 border-white/10 mb-6 bg-slate-900">
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                videoConstraints={{ facingMode: "user" }}
                className="w-full h-full object-cover"
              />
              {/* Scanning Overlay */}
              <div className="absolute inset-0 border-4 border-orange-500/50 rounded-full animate-pulse pointer-events-none" />
              <div className="absolute top-0 left-0 w-full h-1 bg-sky-400/50 blur-[2px] animate-scan pointer-events-none" />
            </div>

            {status === "authenticating" ? (
              <div className="flex items-center gap-2 text-sky-400 font-mono text-sm animate-pulse">
                <Loader2 className="w-4 h-4 animate-spin" /> Analyzing Biometrics...
              </div>
            ) : (
              <button
                onClick={capture}
                className="flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold hover:from-orange-400 hover:to-orange-500 transition-all shadow-lg shadow-orange-500/25"
              >
                <ScanFace className="w-5 h-5" /> Initiate Scan
              </button>
            )}
          </div>
        ) : null}

        {status === "registering" && (
          <form onSubmit={registerFace} className="w-full space-y-4 animate-in fade-in zoom-in duration-300">
            <div className="text-center mb-6">
              <p className="text-sm font-semibold text-orange-400">New Identity Detected</p>
              <p className="text-xs text-slate-400">Please register your profile.</p>
            </div>
            
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Full Name</label>
              <input
                required
                type="text"
                value={userProfile.name}
                onChange={e => setUserProfile({...userProfile, name: e.target.value})}
                className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-orange-500/50 transition-colors"
                placeholder="John Doe"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Age</label>
                <input
                  required
                  type="number"
                  min="1"
                  max="120"
                  value={userProfile.age}
                  onChange={e => setUserProfile({...userProfile, age: e.target.value})}
                  className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-orange-500/50 transition-colors"
                  placeholder="28"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Gender</label>
                <select
                  required
                  value={userProfile.gender}
                  onChange={e => setUserProfile({...userProfile, gender: e.target.value})}
                  className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-orange-500/50 transition-colors appearance-none"
                >
                  <option value="" disabled>Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-4 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-sky-600 text-white font-bold hover:from-sky-400 hover:to-sky-500 transition-all shadow-lg shadow-sky-500/25"
            >
              Complete Registration
            </button>
            <button
              type="button"
              onClick={() => setStatus("scanning")}
              className="w-full py-2 text-xs text-slate-400 hover:text-white transition-colors"
            >
              Cancel & Rescan
            </button>
          </form>
        )}

        {status === "success" && (
          <div className="flex flex-col items-center gap-4 py-8 animate-in zoom-in duration-300">
            <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center border border-green-500/30">
              <CheckCircle2 className="w-8 h-8 text-green-400" />
            </div>
            <p className="text-lg font-bold text-white">Access Granted</p>
            <p className="text-xs text-slate-400 font-mono">Redirecting to Dashboard...</p>
          </div>
        )}

        {status === "error" && (
          <div className="flex flex-col items-center gap-4 py-8 animate-in zoom-in duration-300">
            <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center border border-red-500/30">
              <AlertCircle className="w-8 h-8 text-red-400" />
            </div>
            <p className="text-lg font-bold text-white">Access Denied</p>
            <p className="text-xs text-red-400 text-center">{errorMessage}</p>
            <button
              onClick={() => setStatus("scanning")}
              className="mt-4 px-6 py-2 rounded-full border border-white/10 text-white hover:bg-white/5 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
