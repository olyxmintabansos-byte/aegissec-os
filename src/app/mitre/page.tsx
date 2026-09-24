"use client";

import React, { useState } from "react";
import {
  Layers,
  ShieldCheck,
  AlertTriangle,
  Terminal,
  Activity,
  Flame,
  CheckCircle2,
} from "lucide-react";
import { useAegis } from "@/context/AegisContext";

export default function MitreMatrixPage() {
  const { mitreTactics, cveRecords } = useAegis();
  const [selectedTacticId, setSelectedTacticId] = useState<string>(mitreTactics[0]?.id || "");

  const selectedTactic = mitreTactics.find((t) => t.id === selectedTacticId) || mitreTactics[0];

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6 font-sans pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4 font-mono text-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-cyan-400" />
            <span>MITRE ATT&CK FRAMEWORK & CVE REPOSITORY</span>
          </h1>
          <p className="text-slate-400 mt-1">Pemetaan ancaman siber enterprise terhadap taktik adversaries dan eksploit CVE aktif</p>
        </div>

        <div className="bg-[#090f1e] border border-slate-800 px-3 py-1.5 rounded-xl text-slate-300">
          <span>Framework Version: <strong>v14.1 Enterprise</strong></span>
        </div>
      </div>

      {/* MITRE Matrix Heatmap Grid */}
      <div className="space-y-3 font-mono text-xs">
        <h3 className="font-bold text-white text-xs border-b border-slate-800 pb-2">
          HEATMAP TAKTIK ANCAMAN AKTIF
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {mitreTactics.map((tactic) => (
            <button
              key={tactic.id}
              onClick={() => setSelectedTacticId(tactic.id)}
              className={`p-4 rounded-2xl border text-left flex flex-col justify-between space-y-3 transition-all cursor-pointer ${
                selectedTactic?.id === tactic.id
                  ? "bg-[#0d162b] border-cyan-500/60 shadow-lg shadow-cyan-950/20"
                  : "bg-[#080d1a] border-slate-800 hover:border-slate-700"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-cyan-400 font-bold text-xs">{tactic.code}</span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                    tactic.riskScore >= 90
                      ? "bg-red-500/10 border-red-500/40 text-red-400 animate-pulse"
                      : "bg-amber-500/10 border-amber-500/40 text-amber-400"
                  }`}
                >
                  RISK: {tactic.riskScore}%
                </span>
              </div>

              <div>
                <h4 className="font-black text-white text-sm">{tactic.name}</h4>
                <span className="text-[10px] text-slate-500">{tactic.category}</span>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
                <span className="text-slate-400">Insiden Aktif:</span>
                <strong className="text-red-400 font-bold">{tactic.activeThreatCount} Insiden</strong>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Selected Tactic Mitigation Guide */}
      {selectedTactic && (
        <div className="bg-[#080d1a] border border-cyan-500/30 rounded-3xl p-6 space-y-3 font-mono text-xs neon-glow-cyan">
          <div className="flex items-center gap-2 text-cyan-400 font-bold">
            <ShieldCheck className="w-5 h-5" />
            <span>PANDUAN MITIGASI REKOMENDASI MITRE: {selectedTactic.name} ({selectedTactic.code})</span>
          </div>
          <p className="text-slate-200 text-xs leading-relaxed font-sans">
            {selectedTactic.mitigationGuide}
          </p>
        </div>
      )}

      {/* CVE Exploits Table */}
      <div className="bg-[#080d1a] border border-slate-800 rounded-3xl p-5 space-y-4 font-mono text-xs">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="font-bold text-white flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-400" />
            <span>CVE VULNERABILITY REPOSITORY (CVSS v3.1)</span>
          </h3>
          <span className="text-[10px] text-slate-400">Automated Dependency Audit</span>
        </div>

        <div className="divide-y divide-slate-800/80">
          {cveRecords.map((cve) => (
            <div key={cve.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-black text-amber-400 text-sm">{cve.cveCode}</span>
                  <span className="font-bold text-white text-xs">{cve.title}</span>
                </div>
                <p className="text-[11px] text-slate-400 font-sans">{cve.description}</p>
                <span className="text-[10px] text-slate-500">Target Package: {cve.affectedPackage}</span>
              </div>

              <div className="flex items-center gap-4 shrink-0">
                <div className="text-right">
                  <span className="text-red-400 font-black text-base">{cve.cvssScore}</span>
                  <span className="text-[9px] text-slate-500 block">CVSS SCORE</span>
                </div>

                <span
                  className={`px-3 py-1 rounded-xl text-[10px] font-bold border ${
                    cve.patchStatus === "PATCH_AVAILABLE"
                      ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400"
                      : "bg-red-500/10 border-red-500/40 text-red-400"
                  }`}
                >
                  {cve.patchStatus}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
