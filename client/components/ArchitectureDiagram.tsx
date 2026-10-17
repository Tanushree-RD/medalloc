'use client';

import React from 'react';
import { ReactFlow, Background, Controls, Node, Edge, Position } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

const initialNodes: Node[] = [
  {
    id: '1',
    position: { x: 50, y: 100 },
    data: {
      label: (
        <div className="p-3 text-left">
          <div className="flex items-center gap-2 mb-1">
            <span className="h-2.5 w-2.5 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Frontend Layer</span>
          </div>
          <div className="font-semibold text-zinc-100 text-sm">Next.js 15 Client</div>
          <p className="text-[11px] text-zinc-400 mt-1">App Router • React Flow • Recharts • Tailwind</p>
        </div>
      ),
    },
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
    style: {
      background: 'rgba(15, 23, 42, 0.85)',
      color: '#fff',
      border: '1px solid rgba(56, 189, 248, 0.4)',
      borderRadius: '12px',
      boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      width: 240,
    },
  },
  {
    id: '2',
    position: { x: 380, y: 100 },
    data: {
      label: (
        <div className="p-3 text-left">
          <div className="flex items-center gap-2 mb-1">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Backend Service</span>
          </div>
          <div className="font-semibold text-zinc-100 text-sm">Express.js API Server</div>
          <p className="text-[11px] text-zinc-400 mt-1">REST API • CORS • JSON IPC Controller</p>
        </div>
      ),
    },
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
    style: {
      background: 'rgba(15, 23, 42, 0.85)',
      color: '#fff',
      border: '1px solid rgba(52, 211, 153, 0.4)',
      borderRadius: '12px',
      boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      width: 240,
    },
  },
  {
    id: '3',
    position: { x: 710, y: 100 },
    data: {
      label: (
        <div className="p-3 text-left">
          <div className="flex items-center gap-2 mb-1">
            <span className="h-2.5 w-2.5 rounded-full bg-violet-400 animate-pulse" />
            <span className="text-xs font-bold text-violet-400 uppercase tracking-wider">Algorithm Engine</span>
          </div>
          <div className="font-semibold text-zinc-100 text-sm">C Allocator Engine</div>
          <p className="text-[11px] text-zinc-400 mt-1">High-perf C17/GCC • stdin/stdout JSON IPC</p>
        </div>
      ),
    },
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
    style: {
      background: 'rgba(15, 23, 42, 0.85)',
      color: '#fff',
      border: '1px solid rgba(167, 139, 250, 0.4)',
      borderRadius: '12px',
      boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      width: 240,
    },
  },
];

const initialEdges: Edge[] = [
  {
    id: 'e1-2',
    source: '1',
    target: '2',
    animated: true,
    label: 'HTTP / JSON',
    style: { stroke: '#38bdf8', strokeWidth: 2 },
    labelStyle: { fill: '#38bdf8', fontSize: 11, fontWeight: 600 },
  },
  {
    id: 'e2-3',
    source: '2',
    target: '3',
    animated: true,
    label: 'stdin/stdout IPC',
    style: { stroke: '#a78bfa', strokeWidth: 2 },
    labelStyle: { fill: '#a78bfa', fontSize: 11, fontWeight: 600 },
  },
];

export function ArchitectureDiagram() {
  return (
    <div className="h-[280px] w-full rounded-2xl border border-zinc-800 bg-zinc-950/70 p-2 shadow-xl overflow-hidden backdrop-blur">
      <ReactFlow
        nodes={initialNodes}
        edges={initialEdges}
        fitView
        proOptions={{ hideAttribution: true }}
      >
        <Background color="#334155" gap={16} size={1} />
        <Controls className="!bg-zinc-900 !border-zinc-800 !text-white" />
      </ReactFlow>
    </div>
  );
}
