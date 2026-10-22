'use client';

import React from 'react';
import {
  HeartPulse,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Building2,
  Clock,
} from 'lucide-react';

export function AboutView() {
  const workflowSteps = [
    {
      step: '01',
      title: 'Request',
      desc: 'Emergency intake registers patient requirements, required units, and clinical severity tier.',
    },
    {
      step: '02',
      title: 'Prioritize',
      desc: 'Urgency classification triages life-threatening situations ahead of standard requests.',
    },
    {
      step: '03',
      title: 'Locate',
      desc: 'Regional network scan locates facilities holding verified, matching stockpile reserves.',
    },
    {
      step: '04',
      title: 'Match & Allocate',
      desc: 'Optimal facility assignment confirmed, reserving assets and calculating minimum transit time.',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Title & Introduction */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-600">
          <HeartPulse className="h-4 w-4" />
          <span>Platform Overview</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          About MedAlloc
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          MedAlloc is a modern healthcare resource allocation platform designed for regional emergency networks.
          It coordinates critical hospital assets—including rare blood units, ICU beds, mechanical ventilators,
          and emergency pharmaceuticals—to deliver fast, reliable resource matching during crisis events.
        </p>
      </div>

      {/* The Problem & The Solution */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* The Problem */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-3">
          <div className="h-10 w-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-bold text-sm">
            <AlertCircle className="h-5 w-5" />
          </div>
          <h2 className="text-base font-bold text-slate-900">
            The Problem
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            During major emergencies and trauma surges, hospitals operate with isolated inventory systems.
            Emergency dispatchers frequently rely on manual phone calls to locate rare blood groups or available
            ICU capacity. This fragmented communication introduces critical delays when minutes determine patient survival.
          </p>
        </div>

        {/* The Solution */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-3">
          <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <h2 className="text-base font-bold text-slate-900">
            The Solution
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            MedAlloc coordinates regional facility inventories into a unified allocation network.
            When an emergency request arrives, the platform evaluates medical priority, locates nearby matching stockpiles,
            and assigns patients to the optimal hospital with guaranteed reserves, minimizing transit delay.
          </p>
        </div>
      </div>

      {/* The Workflow */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 block mb-1">
            Operational Lifecycle
          </span>
          <h2 className="text-lg font-bold text-slate-900">
            How MedAlloc Works
          </h2>
          <p className="text-xs text-slate-500">
            An end-to-end coordinated flow from intake to confirmed dispatch.
          </p>
        </div>

        {/* Step-by-step horizontal cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {workflowSteps.map((ws, idx) => (
            <div
              key={ws.step}
              className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex flex-col justify-between space-y-2 relative"
            >
              <div>
                <span className="text-[10px] font-mono font-bold text-blue-600 px-1.5 py-0.5 rounded bg-blue-50 border border-blue-200 inline-block mb-2">
                  {ws.step}
                </span>
                <h3 className="font-bold text-sm text-slate-900">
                  {ws.title}
                </h3>
                <p className="text-[11px] text-slate-500 mt-1 leading-normal">
                  {ws.desc}
                </p>
              </div>

              {idx < workflowSteps.length - 1 && (
                <div className="hidden sm:block absolute -right-3 top-1/2 -translate-y-1/2 z-10 text-slate-300">
                  <ArrowRight className="h-4 w-4" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Platform Values */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-center space-y-1">
          <Clock className="h-5 w-5 text-blue-600 mx-auto" />
          <h4 className="font-bold text-xs text-slate-900">Zero-Delay Triage</h4>
          <p className="text-[11px] text-slate-500">Rapid processing of high-severity emergency cases</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-center space-y-1">
          <Building2 className="h-5 w-5 text-blue-600 mx-auto" />
          <h4 className="font-bold text-xs text-slate-900">Multi-Facility Grid</h4>
          <p className="text-[11px] text-slate-500">Coordinated regional hospitals and trauma centers</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-center space-y-1">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 mx-auto" />
          <h4 className="font-bold text-xs text-slate-900">Guaranteed Reserve</h4>
          <p className="text-[11px] text-slate-500">Real-time stock reservation before ambulance dispatch</p>
        </div>
      </div>
    </div>
  );
}
