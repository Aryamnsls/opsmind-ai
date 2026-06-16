import { Activity, AlertTriangle, Brain, Database, Server, Zap } from "lucide-react";

const metrics = [
  { title: "Active Incidents", value: "12", label: "+3 in last 24h", icon: AlertTriangle },
  { title: "AI RCA Accuracy", value: "92%", label: "Aurora memory match", icon: Brain },
  { title: "MTTR", value: "18m", label: "42% faster recovery", icon: Zap },
  { title: "Stored Incidents", value: "248", label: "Aurora PostgreSQL", icon: Database },
];

const timeline = [
  "10:01 Alert triggered from production API",
  "10:04 CPU spike detected on backend service",
  "10:07 Deployment v2.3.1 correlated",
  "10:10 Error rate increased to 21%",
  "10:15 Similar incident INC-104 matched",
];

export default function DashboardPage() {
  return (
    <main className="min-h-screen p-6 md:p-10">
      <section className="rounded-3xl border bg-card/70 p-8 shadow-2xl backdrop-blur">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="mb-3 inline-flex rounded-full border px-3 py-1 text-sm text-orange-300">
              AWS + Vercel Hackathon 2026
            </p>
            <h1 className="text-4xl font-bold md:text-6xl">
              OpsMind AI
            </h1>
            <p className="mt-3 max-w-2xl text-lg text-muted-foreground">
              The Incident Memory Engine. Your infrastructure forgets nothing.
            </p>
          </div>

          <div className="rounded-2xl border bg-background/60 p-5">
            <p className="text-sm text-muted-foreground">Powered by</p>
            <div className="mt-3 space-y-2 text-sm">
              <p>Amazon Aurora PostgreSQL</p>
              <p>Amazon S3</p>
              <p>Vercel + Next.js</p>
              <p>OpenAI RCA Engine</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-4">
        {metrics.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.title} className="rounded-2xl border bg-card/80 p-5 shadow-xl">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">{item.title}</p>
                <Icon className="h-5 w-5 text-orange-400" />
              </div>
              <h2 className="mt-4 text-4xl font-bold">{item.value}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{item.label}</p>
            </div>
          );
        })}
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border bg-card/80 p-6 lg:col-span-2">
          <div className="mb-5 flex items-center gap-2">
            <Activity className="h-5 w-5 text-sky-400" />
            <h2 className="text-xl font-semibold">Live Incident Timeline</h2>
          </div>

          <div className="space-y-4">
            {timeline.map((event, index) => (
              <div key={event} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="h-3 w-3 rounded-full bg-orange-400" />
                  {index !== timeline.length - 1 && <div className="h-10 w-px bg-border" />}
                </div>
                <p className="text-sm text-muted-foreground">{event}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border bg-card/80 p-6">
          <div className="mb-5 flex items-center gap-2">
            <Server className="h-5 w-5 text-green-400" />
            <h2 className="text-xl font-semibold">Infrastructure Health</h2>
          </div>

          {["Frontend", "Backend API", "Aurora DB", "S3 Logs", "Worker Queue"].map((service, i) => (
            <div key={service} className="mb-4 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{service}</span>
              <span className={i === 4 ? "text-red-400" : "text-green-400"}>
                {i === 4 ? "Degraded" : "Healthy"}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border bg-card/80 p-6">
          <h2 className="text-xl font-semibold">Incident DNA™ Match</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Current incident is 94% similar to INC-104.
          </p>

          <div className="mt-6 rounded-xl border bg-background/50 p-5">
            <p className="text-sm text-muted-foreground">Previous Root Cause</p>
            <h3 className="mt-2 text-2xl font-bold">Redis Memory Exhaustion</h3>
            <p className="mt-3 text-sm text-muted-foreground">
              Resolution used previously: increase cache memory and restart worker pods.
            </p>
          </div>
        </div>

        <div className="rounded-2xl border bg-card/80 p-6">
          <h2 className="text-xl font-semibold">AI Recommendation</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Based on Aurora incident memory and RCA history.
          </p>

          <div className="mt-6 rounded-xl border bg-background/50 p-5">
            <p className="text-sm text-muted-foreground">Suggested Fix</p>
            <h3 className="mt-2 text-2xl font-bold">Scale Worker Pods</h3>
            <p className="mt-3 text-sm text-muted-foreground">
              Confidence: 92% | Historical success rate: 87%
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}