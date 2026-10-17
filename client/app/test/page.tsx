'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { allocate, AllocationPayload, AllocationResponse } from '@/lib/api';
import {
  Send,
  ArrowLeft,
  Terminal,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Cpu,
  Layers,
  Sparkles,
} from 'lucide-react';

const DEFAULT_SAMPLE: AllocationPayload = {
  patientName: 'John',
  resource: 'Blood',
  priority: 'Critical',
};

export default function TestPage() {
  const [inputJson, setInputJson] = useState<string>(
    JSON.stringify(DEFAULT_SAMPLE, null, 2)
  );
  const [response, setResponse] = useState<AllocationResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [executionTimeMs, setExecutionTimeMs] = useState<number | null>(null);

  const handleExecute = async () => {
    setIsLoading(true);
    setError(null);
    setResponse(null);
    const startTime = performance.now();

    try {
      let parsedPayload: AllocationPayload;
      try {
        parsedPayload = JSON.parse(inputJson);
      } catch (parseErr: unknown) {
        const msg = parseErr instanceof Error ? parseErr.message : 'Invalid JSON format';
        throw new Error(`JSON Syntax Error: ${msg}`);
      }

      const res = await allocate(parsedPayload);
      setResponse(res);
      setExecutionTimeMs(Math.round(performance.now() - startTime));
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMsg);
      setExecutionTimeMs(Math.round(performance.now() - startTime));
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetSample = () => {
    setInputJson(JSON.stringify(DEFAULT_SAMPLE, null, 2));
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col font-sans">
      {/* Top Bar */}
      <header className="border-b border-zinc-800 bg-zinc-950/70 backdrop-blur px-6 py-4">
        <div className="container mx-auto max-w-6xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-cyan-400 transition"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Dashboard</span>
            </Link>
            <span className="text-zinc-600">/</span>
            <span className="text-xs font-semibold text-zinc-300">IPC Communication Test</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-zinc-400 font-mono">POST /api/allocate</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto max-w-6xl p-6 sm:p-8 space-y-6">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-xs font-medium text-violet-400 mb-2">
            <Cpu className="h-3.5 w-3.5" />
            Express ↔ C Allocation Engine IPC
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            End-to-End Engine Communication Test
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-2xl">
            This page tests the bidirectional IPC pipeline: React frontend sends JSON to Express,
            which pipes it into the compiled C executable (<code className="text-violet-300 font-mono">dsa/build/allocator</code>)
            via <code className="text-zinc-300 font-mono">stdin</code>, and receives the structured JSON response back from <code className="text-zinc-300 font-mono">stdout</code>.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Request Panel */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-5 flex flex-col space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <Terminal className="h-4 w-4 text-cyan-400" />
                <span className="text-sm font-semibold text-zinc-200">Sample JSON Request</span>
              </div>
              <button
                type="button"
                onClick={handleResetSample}
                className="text-xs text-zinc-400 hover:text-zinc-200 transition"
              >
                Reset Default
              </button>
            </div>

            <div className="flex-1 flex flex-col space-y-2">
              <label htmlFor="payload-input" className="text-xs text-zinc-400">
                Payload (<code className="text-zinc-300">stdin</code> to C Engine):
              </label>
              <textarea
                id="payload-input"
                rows={9}
                value={inputJson}
                onChange={(e) => setInputJson(e.target.value)}
                className="w-full font-mono text-xs bg-zinc-900/90 text-cyan-300 p-3.5 rounded-xl border border-zinc-800 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition resize-none leading-relaxed"
                placeholder='{\n  "patientName": "John",\n  "resource": "Blood",\n  "priority": "Critical"\n}'
              />
            </div>

            <button
              type="button"
              id="send-allocation-btn"
              onClick={handleExecute}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-zinc-950 font-bold text-sm py-3 px-4 shadow-lg shadow-cyan-500/20 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Processing through C Engine...</span>
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  <span>Send Request to C Engine</span>
                </>
              )}
            </button>
          </div>

          {/* Response Panel */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-5 flex flex-col space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-emerald-400" />
                <span className="text-sm font-semibold text-zinc-200">Engine JSON Response</span>
              </div>
              {executionTimeMs !== null && (
                <span className="text-[11px] font-mono text-zinc-400">
                  Round-trip: <span className="text-emerald-400 font-bold">{executionTimeMs} ms</span>
                </span>
              )}
            </div>

            <div className="flex-1 flex flex-col justify-start">
              {isLoading ? (
                <div className="flex-1 min-h-[220px] flex flex-col items-center justify-center text-zinc-500 space-y-3">
                  <RefreshCw className="h-8 w-8 animate-spin text-cyan-400" />
                  <p className="text-xs">Executing C executable via child_process.spawn()...</p>
                </div>
              ) : error ? (
                <div className="p-4 rounded-xl border border-rose-900/50 bg-rose-950/20 text-rose-300 space-y-2">
                  <div className="flex items-center gap-2 text-rose-400 font-semibold text-xs">
                    <AlertCircle className="h-4 w-4" />
                    <span>Communication Error</span>
                  </div>
                  <pre className="text-xs font-mono whitespace-pre-wrap">{error}</pre>
                </div>
              ) : response ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    <span>Engine response received successfully</span>
                  </div>
                  <pre
                    id="response-json-display"
                    className="w-full font-mono text-xs bg-zinc-900/90 text-emerald-300 p-4 rounded-xl border border-zinc-800 overflow-x-auto leading-relaxed shadow-inner"
                  >
                    {JSON.stringify(response, null, 2)}
                  </pre>
                </div>
              ) : (
                <div className="flex-1 min-h-[220px] flex flex-col items-center justify-center text-zinc-500 space-y-2 text-center p-6">
                  <Sparkles className="h-8 w-8 text-zinc-700 mb-1" />
                  <p className="text-xs text-zinc-400">No request sent yet</p>
                  <p className="text-[11px] text-zinc-500 max-w-xs">
                    Click &quot;Send Request to C Engine&quot; to test bidirectional stdin/stdout JSON communication.
                  </p>
                </div>
              )}
            </div>

            {/* Subsystem status pills */}
            <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-400">
              <span>Path: <code className="text-zinc-300 font-mono">POST /api/allocate</code></span>
              <span>Engine Status: <strong className="text-cyan-400">Active</strong></span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
