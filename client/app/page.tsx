'use client';

import React from 'react';
import { Navbar } from '@/components/Navbar';
import { ArchitectureDiagram } from '@/components/ArchitectureDiagram';
import { MetricsOverview } from '@/components/MetricsOverview';
import { useHealthCheck } from '@/hooks/useHealthCheck';
import {
  Activity,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Cpu,
  Server,
  Layers,
  Terminal,
} from 'lucide-react';

export default function Home() {
  const { health, isLoading, error, refetch } = useHealthCheck();

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col font-sans selection:bg-cyan-500/30">
      <Navbar />

      <main className="flex-1 container mx-auto max-w-7xl px-4 sm:px-6 py-8 space-y-8">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-3xl border border-zinc-800 bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 p-8 sm:p-10 shadow-2xl">
          <div className="absolute top-0 right-0 -mt-12 -mr-12 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 -mb-12 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-medium text-cyan-400">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
              </span>
              System Architecture Scaffolded Successfully
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
              MedAlloc Full-Stack Platform
            </h1>

            <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
              Real-time emergency hospital resource optimizer integrating a high-performance C
              algorithm engine with an Express API backend and Next.js reactive frontend.
            </p>

            {/* Quick Status Bar */}
            <div className="pt-2 flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2 rounded-xl bg-zinc-900/90 border border-zinc-800 px-4 py-2.5 text-xs">
                <span className="text-zinc-400">Express API:</span>
                {isLoading ? (
                  <span className="flex items-center gap-1.5 text-amber-400">
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    Checking...
                  </span>
                ) : health?.status === 'ok' ? (
                  <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    GET /health: {JSON.stringify(health)}
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-rose-400">
                    <XCircle className="h-3.5 w-3.5" />
                    {error || 'Offline'}
                  </span>
                )}
                <button
                  onClick={() => refetch()}
                  title="Refresh Health Check"
                  className="ml-2 rounded p-1 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition"
                >
                  <RefreshCw className="h-3 w-3" />
                </button>
              </div>

              <div className="flex items-center gap-2 rounded-xl bg-zinc-900/90 border border-zinc-800 px-4 py-2.5 text-xs">
                <span className="text-zinc-400">C Allocator Engine:</span>
                <span className="flex items-center gap-1.5 text-cyan-400 font-semibold">
                  <Cpu className="h-3.5 w-3.5" />
                  MedAlloc Engine Ready
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Architecture Flow (React Flow) */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Layers className="h-5 w-5 text-cyan-400" />
                Live Architecture Diagram (React Flow)
              </h2>
              <p className="text-xs text-zinc-400">
                Interactive nodes displaying communication pipeline between subsystems
              </p>
            </div>
          </div>
          <ArchitectureDiagram />
        </section>

        {/* 3-Pillar Component Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Frontend Card */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-6 flex flex-col justify-between space-y-4 hover:border-zinc-700 transition">
            <div className="space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-950 border border-cyan-800/50 text-cyan-400">
                <Activity className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-white text-base">Client (Next.js 15)</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                App Router, TypeScript, Tailwind CSS, shadcn/ui components, React Flow interactive
                graphs, and Recharts analytics.
              </p>
            </div>
            <div className="pt-2 text-[11px] font-mono text-zinc-400 border-t border-zinc-800/80">
              Directory: <span className="text-cyan-300">client/</span>
            </div>
          </div>

          {/* Backend Card */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-6 flex flex-col justify-between space-y-4 hover:border-zinc-700 transition">
            <div className="space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-950 border border-emerald-800/50 text-emerald-400">
                <Server className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-white text-base">Backend (Express.js)</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Node.js runtime with CORS enabled, dotenv configuration, nodemon hot reloading, and
                clean controller/service routing.
              </p>
            </div>
            <div className="pt-2 text-[11px] font-mono text-zinc-400 border-t border-zinc-800/80">
              Endpoint: <span className="text-emerald-300">GET /health</span>
            </div>
          </div>

          {/* Algorithm Engine Card */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-6 flex flex-col justify-between space-y-4 hover:border-zinc-700 transition">
            <div className="space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-950 border border-violet-800/50 text-violet-400">
                <Terminal className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-white text-base">Engine (C17 / GCC)</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Independent compiled executable communicating with the Node.js backend via
                stdin/stdout JSON streams.
              </p>
            </div>
            <div className="pt-2 text-[11px] font-mono text-zinc-400 border-t border-zinc-800/80">
              Binary: <span className="text-violet-300">dsa/build/allocator</span>
            </div>
          </div>
        </div>

        {/* Data Visualization Preview */}
        <section className="space-y-3">
          <MetricsOverview />
        </section>
      </main>

      <footer className="mt-auto border-t border-zinc-800/80 bg-zinc-950/80 py-6 text-center text-xs text-zinc-500">
        MedAlloc • Clean Architecture Medical Resource Allocator • Next.js + Express + C Engine
      </footer>
    </div>
  );
}
