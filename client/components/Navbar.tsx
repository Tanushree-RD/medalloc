'use client';

import React from 'react';
import Link from 'next/link';
import { Activity, Cpu, Server, Terminal } from 'lucide-react';

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-600 to-emerald-500 text-white shadow-md shadow-emerald-500/20">
            <Activity className="h-6 w-6 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">
                MedAlloc
              </span>
              <span className="rounded-full bg-cyan-950/60 px-2 py-0.5 text-[10px] font-semibold text-cyan-400 border border-cyan-800/60">
                v1.0.0
              </span>
            </div>
            <p className="text-xs text-muted-foreground hidden sm:block">
              Intelligent Medical Resource Allocation Architecture
            </p>
          </div>
        </Link>

        <nav className="flex items-center gap-3 text-sm font-medium">
          <Link
            href="/test"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-700/60 text-cyan-300 text-xs transition"
          >
            <Terminal className="h-3.5 w-3.5" />
            <span>Test IPC (/test)</span>
          </Link>
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs">
            <Server className="h-3.5 w-3.5 text-emerald-400" />
            <span>Express :5000</span>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs">
            <Cpu className="h-3.5 w-3.5 text-cyan-400" />
            <span>C Engine</span>
          </div>
        </nav>
      </div>
    </header>
  );
}
