'use client';

import React from 'react';
import {
  HeartPulse,
  AlertCircle,
  ShieldCheck,
  ArrowRight,
  Code2,
  Layers,
  Database,
  Cpu,
  Users,
} from 'lucide-react';

export function AboutView() {
  const workflowSteps = [
    {
      step: '01',
      title: 'Emergency Intake',
      desc: 'Patient acuity, blood group, vital equipment, and clinical coordinates are registered into the unified regional queue.',
    },
    {
      step: '02',
      title: 'Triage Prioritize',
      desc: 'Acuity assessment places life-threatening critical cases at the head of the dispatch queue before routine requests.',
    },
    {
      step: '03',
      title: 'Locate & Verify',
      desc: 'Spatial network query scans regional medical hubs to locate verified matching stockpiles with available capacity.',
    },
    {
      step: '04',
      title: 'Match & Allocate',
      desc: 'Optimal facility matched, inventory deducted with guaranteed reserve, and minimum-transit ambulance routing confirmed.',
    },
  ];

  const techStack = [
    {
      category: 'Framework & Engine',
      tech: 'Next.js 15 & React 19',
      desc: 'Modern App Router, Turbopack bundling, server components, and responsive healthcare UI components.',
      icon: Layers,
    },
    {
      category: 'Language & Typing',
      tech: 'TypeScript 5',
      desc: 'Strict end-to-end type safety across requests, hospital models, inventory items, and allocation telemetry.',
      icon: Code2,
    },
    {
      category: 'Styling & Design',
      tech: 'Tailwind CSS v4 & Lucide',
      desc: 'Clean healthcare SaaS aesthetic with crisp typography, responsive card layouts, and accessible icons.',
      icon: Cpu,
    },
    {
      category: 'Data Persistence',
      tech: 'Synchronous LocalStorage Layer',
      desc: 'Persistent client-side storage maintaining requests, inventory levels, history, and notifications across page refreshes.',
      icon: Database,
    },
  ];

  const teamMembers = [
    {
      name: 'Dr. Aris Thorne',
      role: 'Clinical Operations Lead',
      bio: 'Trauma surgery specialist and emergency medical dispatcher with 14 years of regional triage management experience.',
    },
    {
      name: 'Elena Rostova',
      role: 'Lead Systems Architect',
      bio: 'Distributed systems engineer focusing on fault-tolerant healthcare communications and real-time synchronization.',
    },
    {
      name: 'Marcus Sterling',
      role: 'Algorithms & Optimization Lead',
      bio: 'Specialist in discrete mathematics, Dijkstra graph shortest-path routing, and bipartite matching network flows.',
    },
    {
      name: 'Sophia Lin',
      role: 'Healthcare UX & Product Designer',
      bio: 'Human-computer interaction designer dedicated to stress-resilient interfaces for rapid clinical dispatch environments.',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-10">
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
          MedAlloc is an intelligent healthcare resource allocation and emergency dispatch coordination platform.
          Designed for regional medical grids, it eliminates hospital inventory silos and optimizes the distribution
          of rare blood products, critical ICU beds, mechanical ventilators, and acute pharmaceuticals during medical crises.
        </p>
      </div>

      {/* 1. The Problem & The Solution */}
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
            During mass casualty incidents, natural disasters, or severe trauma surges, hospitals operate with isolated
            legacy databases. Dispatchers frequently rely on manual phone calls to locate rare blood units or open
            ICU capacity. This fragmented communication causes fatal delays when every minute determines patient survival.
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
            MedAlloc links distributed hospital stockpiles into an integrated allocation network. When an emergency
            request arrives, the system triages urgency, identifies nearby matching facilities, and locks inventory
            with guaranteed reserves before ambulance dispatch—minimizing transit times and preventing capacity exhaustion.
          </p>
        </div>
      </div>

      {/* 2. The Workflow */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 block mb-1">
            Operational Lifecycle
          </span>
          <h2 className="text-lg font-bold text-slate-900">
            How MedAlloc Works
          </h2>
          <p className="text-xs text-slate-500">
            An automated four-stage operational pipeline from patient triage intake to verified dispatch.
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

      {/* 3. Technology Stack */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 block mb-1">
            Engineering & Infrastructure
          </span>
          <h2 className="text-lg font-bold text-slate-900">
            Technology Stack
          </h2>
          <p className="text-xs text-slate-500">
            Built with modern web standards, predictable state persistence, and responsive UI components.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {techStack.map((tech) => {
            const Icon = tech.icon;
            return (
              <div
                key={tech.tech}
                className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-3.5"
              >
                <div className="h-9 w-9 rounded-xl bg-blue-100/70 text-blue-700 flex items-center justify-center shrink-0">
                  <Icon className="h-4.5 w-4.5" />
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">
                    {tech.category}
                  </span>
                  <h4 className="font-bold text-sm text-slate-900">
                    {tech.tech}
                  </h4>
                  <p className="text-[11px] text-slate-500 leading-normal">
                    {tech.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Team Members */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 block mb-1">
              Leadership & Engineering
            </span>
            <h2 className="text-lg font-bold text-slate-900">
              Project Team Members
            </h2>
            <p className="text-xs text-slate-500">
              Multidisciplinary group spanning emergency clinical practice and systems design.
            </p>
          </div>
          <div className="h-8 w-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500">
            <Users className="h-4 w-4" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {teamMembers.map((member) => (
            <div
              key={member.name}
              className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-slate-900">
                  {member.name}
                </h4>
                <span className="text-[10px] font-semibold text-blue-700 px-2 py-0.5 rounded-full bg-blue-50 border border-blue-200">
                  {member.role}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                {member.bio}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
