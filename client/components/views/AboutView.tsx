'use client';

import React from 'react';
import {
  Cpu,
  GitBranch,
  Network,
  Activity,
} from 'lucide-react';

export function AboutView() {
  const lifecycleSteps = [
    {
      num: '01',
      title: 'Clinical Triage Intake',
      desc: 'Patient acuity, physiological telemetry, and vital resource requirements are ingested into a unified priority queue.',
    },
    {
      num: '02',
      title: 'Acuity Ranking',
      desc: 'Min-Heap evaluates patient urgency in O(log N) time, ensuring life-threatening triage cases supersede routine cases.',
    },
    {
      num: '03',
      title: 'Spatial Grid Verification',
      desc: 'A spatial hash index queries regional facilities to verify live stock, blood banks, and ICU bed availability.',
    },
    {
      num: '04',
      title: 'Guaranteed Reservation',
      desc: 'Shortest transit path is locked via Dijkstra routing, inventory is decremented with zero race conditions, and ETA is broadcast.',
    },
  ];

  const algorithmicPillars = [
    {
      title: 'Priority Queue (Min-Heap)',
      complexity: 'O(log N)',
      desc: 'Enforces strict medical triage ordering where critical emergencies are dispatched before routine replenishment.',
      icon: Activity,
    },
    {
      title: 'Spatial Hash Index',
      complexity: 'O(1)',
      desc: 'Partitions geographical facility coordinates into constant-time spatial buckets for near-instant regional proximity lookups.',
      icon: Network,
    },
    {
      title: 'Dijkstra Routing',
      complexity: 'O((V + E) log V)',
      desc: 'Computes optimal road-network transit paths accounting for variable distance, traffic latency, and ambulance capability.',
      icon: GitBranch,
    },
    {
      title: 'Bipartite Matching',
      complexity: 'O(V · E)',
      desc: 'Solves multi-facility supply constraints to guarantee that scarce resources are allocated to maximize aggregate survival.',
      icon: Cpu,
    },
  ];

  const engineeringTeam = [
    {
      name: 'Dr. Aris Thorne',
      role: 'Clinical Operations Lead',
      bio: 'Trauma specialist and emergency medical dispatcher with 14 years of regional triage management experience.',
    },
    {
      name: 'Elena Rostova',
      role: 'Lead Systems Architect',
      bio: 'Distributed systems engineer focusing on fault-tolerant healthcare communications and real-time state synchronization.',
    },
    {
      name: 'Marcus Sterling',
      role: 'Algorithms & Optimization',
      bio: 'Specialist in discrete mathematics, Dijkstra graph shortest-path routing, and bipartite matching network flows.',
    },
    {
      name: 'Sophia Lin',
      role: 'Healthcare UX & Product Designer',
      bio: 'Human-computer interaction researcher dedicated to calm, stress-resilient interfaces for rapid clinical dispatch.',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-16 pb-20">
      {/* 1. HERO MANIFESTO */}
      <section className="space-y-4 pt-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-100 text-xs font-medium text-neutral-600">
          <span>MedAlloc / Platform Architecture</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-semibold tracking-[-0.03em] text-neutral-950 leading-[1.15]">
          The real-time coordination layer for emergency healthcare.
        </h1>

        <p className="text-base sm:text-lg text-neutral-500 font-normal leading-relaxed max-w-3xl pt-1">
          When life-threatening trauma strikes, every second spent calling hospitals or querying siloed inventories costs lives. MedAlloc models regional healthcare resources as a dynamic, continuous network — algorithmically pairing patients with verified hospital stockpiles in sub-second time.
        </p>
      </section>

      {/* 2. THE PROBLEM & SOLUTION (Two-column editorial comparison) */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded-3xl p-7 border border-black/[0.04] shadow-editorial space-y-3">
          <span className="text-xs font-medium text-neutral-400">
            Current Industry Paradigm
          </span>
          <h2 className="text-lg font-semibold tracking-tight text-neutral-950">
            Siloed Systems & Verbal Dispatch
          </h2>
          <p className="text-xs text-neutral-500 leading-relaxed">
            Emergency medical services rely on telephone calls, manual whiteboard tracking, and disconnected hospital software. This causes critical ambulance diversions, stockouts during mass casualties, and preventable delays.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-7 border border-black/[0.04] shadow-editorial space-y-3">
          <span className="text-xs font-medium text-neutral-400">
            The MedAlloc Model
          </span>
          <h2 className="text-lg font-semibold tracking-tight text-neutral-950">
            Algorithmic Resource Routing
          </h2>
          <p className="text-xs text-neutral-500 leading-relaxed">
            A unified network where blood supplies, ICU beds, and emergency pharmaceuticals are cataloged in real time. Patients are dispatched according to clinical acuity, shortest road transit, and inventory availability.
          </p>
        </div>
      </section>

      {/* 3. FOUR-PHASE OPERATIONAL LIFECYCLE */}
      <section className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-neutral-950">
            Dispatch Lifecycle
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 font-normal mt-1">
            How MedAlloc executes an emergency resource reservation in milliseconds.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {lifecycleSteps.map((step) => (
            <div
              key={step.num}
              className="bg-white rounded-3xl p-6 border border-black/[0.04] shadow-editorial space-y-3"
            >
              <span className="text-xs font-mono font-semibold text-neutral-400">
                {step.num}
              </span>
              <h3 className="text-base font-semibold tracking-tight text-neutral-950">
                {step.title}
              </h3>
              <p className="text-xs text-neutral-500 leading-relaxed">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 4. ALGORITHMIC ARCHITECTURE */}
      <section className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-neutral-950">
            Algorithmic Architecture
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 font-normal mt-1">
            Core computer science structures governing the MedAlloc allocation engine.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {algorithmicPillars.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.title}
                className="bg-white rounded-3xl p-6 border border-black/[0.04] shadow-editorial space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="h-8 w-8 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-800">
                    <Icon className="h-4 w-4 stroke-[1.75]" />
                  </div>
                  <span className="text-[11px] font-mono text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-full">
                    {pillar.complexity}
                  </span>
                </div>

                <h3 className="text-sm font-semibold tracking-tight text-neutral-950">
                  {pillar.title}
                </h3>
                <p className="text-xs text-neutral-500 leading-relaxed">
                  {pillar.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. TEAM & LEADERSHIP */}
      <section className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-neutral-950">
            Team & Advisors
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 font-normal mt-1">
            Engineered by clinical dispatchers and distributed systems researchers.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {engineeringTeam.map((member) => (
            <div
              key={member.name}
              className="bg-white rounded-3xl p-6 border border-black/[0.04] shadow-editorial space-y-2.5"
            >
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-neutral-900 text-white flex items-center justify-center text-xs font-semibold">
                  {member.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')}
                </div>
                <div>
                  <h3 className="text-sm font-semibold tracking-tight text-neutral-950">
                    {member.name}
                  </h3>
                  <span className="text-xs text-neutral-400 font-normal">
                    {member.role}
                  </span>
                </div>
              </div>
              <p className="text-xs text-neutral-500 leading-relaxed">
                {member.bio}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
