/**
 * OpsMind AI — Sign In Page
 * Clerk-hosted sign in with custom branding
 */

import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6 relative overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(249,115,22,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(249,115,22,0.5) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />
      <div className="absolute top-1/4 left-1/3 w-96 h-96 rounded-full bg-orange-500/10 blur-[120px]" />
      <div className="absolute bottom-1/4 right-1/3 w-80 h-80 rounded-full bg-sky-500/10 blur-[120px]" />

      <div className="relative w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 shadow-2xl shadow-orange-500/40 mb-4">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <h1 className="text-3xl font-black text-white mb-1">
            <span className="gradient-text">OpsMind</span> AI
          </h1>
          <p className="text-slate-400 text-sm">The Incident Memory Engine</p>
        </div>

        {/* Clerk SignIn Component */}
        <div className="flex justify-center">
          <SignIn
            appearance={{
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              variables: {
                colorPrimary: "#f97316",
                colorBackground: "#0f172a",
                colorTextSecondary: "#94a3b8",
                colorInputBackground: "#1e293b",
                colorInputText: "#f1f5f9",
                borderRadius: "0.75rem",
                fontFamily: "Inter, sans-serif",
              } as any,
              elements: {
                card: "bg-[#0f172a] border border-white/10 shadow-2xl",
                headerTitle: "text-white font-bold",
                headerSubtitle: "text-slate-400",
                formButtonPrimary: "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white font-semibold",
                formFieldInput: "bg-white/5 border-white/10 text-slate-200 focus:border-orange-500/50",
                formFieldLabel: "text-slate-400",
                identityPreviewText: "text-slate-300",
                socialButtonsBlockButton: "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10",
                dividerLine: "bg-white/10",
                dividerText: "text-slate-500",
                footerActionLink: "text-orange-400 hover:text-orange-300",
              },
            }}
          />
        </div>
      </div>
    </main>
  );
}
