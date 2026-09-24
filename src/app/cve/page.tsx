"use client";

import React, { useState } from "react";
import {
  Bug,
  ShieldCheck,
  Zap,
  CheckCircle2,
  AlertOctagon,
  ExternalLink,
  Printer,
  ShieldAlert,
  Terminal,
  Activity,
  ChevronRight,
} from "lucide-react";
import { useAegis } from "@/context/AegisContext";
import { CveRecord } from "@/types/aegis";

export default function CveRepositoryPage() {
  const { cveRecords, deployVirtualPatch } = useAegis();
  const [selectedCve, setSelectedCve] = useState<CveRecord>(cveRecords[0]);
  const [activeTab, setActiveTab] = useState<"CATALOG" | "PLAYBOOK">("CATALOG");

  const mitigatedCount = cveRecords.filter((c) => c.patchStatus === "MITIGATED").length;
  const criticalCount = cveRecords.filter((c) => c.cvssScore >= 9.0).length;

  const handlePrintPlaybook = () => {
    window.print();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 font-mono">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Bug className="w-5 h-5 text-cyan-400" />
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-wider">
              CVE REPOSITORY & VIRTUAL PATCHING
            </h1>
          </div>
          <p className="text-xs text-slate-400">
            NIST NVD Vulnerability Database, CVSS 3.1 Scoring & 1-Click WAF Mitigation Engine
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-[#090f1e] p-1 rounded-2xl border border-slate-800 text-xs">
            <button
              onClick={() => setActiveTab("CATALOG")}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                activeTab === "CATALOG"
                  ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              CVE Catalog
            </button>
            <button
              onClick={() => setActiveTab("PLAYBOOK")}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                activeTab === "PLAYBOOK"
                  ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              NIST Playbook
            </button>
          </div>

          {activeTab === "PLAYBOOK" && (
            <button
              onClick={handlePrintPlaybook}
              className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print A4</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="p-4 rounded-2xl bg-[#090f24] border border-slate-800">
          <div className="text-[10px] text-slate-400 font-bold uppercase mb-1">Tracked CVEs</div>
          <div className="text-2xl font-black text-white">{cveRecords.length} Records</div>
          <div className="text-[10px] text-cyan-400 mt-1">NIST NVD Synced</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#090f24] border border-slate-800">
          <div className="text-[10px] text-slate-400 font-bold uppercase mb-1">Mitigated CVEs</div>
          <div className="text-2xl font-black text-emerald-400">
            {mitigatedCount} / {cveRecords.length}
          </div>
          <div className="text-[10px] text-emerald-400 mt-1">Virtual Patches Active</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#090f24] border border-slate-800">
          <div className="text-[10px] text-slate-400 font-bold uppercase mb-1">Critical (CVSS &gt;= 9.0)</div>
          <div className="text-2xl font-black text-red-400">{criticalCount} Vulnerabilities</div>
          <div className="text-[10px] text-red-400 mt-1">Immediate Remediation Required</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#090f24] border border-slate-800">
          <div className="text-[10px] text-slate-400 font-bold uppercase mb-1">Zero-Day Exposure</div>
          <div className="text-2xl font-black text-purple-400">
            {cveRecords.filter((c) => c.patchStatus === "ZERO_DAY").length}
          </div>
          <div className="text-[10px] text-purple-400 mt-1">Virtual Shielding Mandatory</div>
        </div>
      </div>

      {activeTab === "CATALOG" ? (
        /* CVE Catalog View */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* List of CVEs */}
          <div className="lg:col-span-7 space-y-4">
            {cveRecords.map((cve) => {
              const isSelected = selectedCve?.id === cve.id;
              return (
                <div
                  key={cve.id}
                  onClick={() => setSelectedCve(cve)}
                  className={`p-5 rounded-3xl border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-[#0c1430] border-cyan-500/80 shadow-lg shadow-cyan-500/10"
                      : "bg-[#080d20] border-slate-800 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono font-black text-cyan-300 text-sm">
                          {cve.cveCode}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            cve.patchStatus === "MITIGATED"
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                              : cve.patchStatus === "ZERO_DAY"
                              ? "bg-purple-500/10 text-purple-400 border-purple-500/30"
                              : "bg-red-500/10 text-red-400 border-red-500/30"
                          }`}
                        >
                          {cve.patchStatus}
                        </span>
                      </div>
                      <h3 className="text-xs font-bold text-white font-sans">{cve.title}</h3>
                    </div>

                    <div className="text-right">
                      <div className="text-lg font-black text-red-400">{cve.cvssScore}</div>
                      <div className="text-[9px] text-slate-400 uppercase">CVSS 3.1</div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 font-sans mb-3 line-clamp-2">
                    {cve.description}
                  </p>

                  <div className="flex items-center justify-between text-[11px] pt-3 border-t border-slate-800/80">
                    <span className="text-slate-400">
                      Package: <strong className="text-slate-200">{cve.affectedPackage}</strong>
                    </span>
                    <span className="text-cyan-400 font-bold flex items-center gap-1">
                      <span>Audit & Patch</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Selected CVE Deep-Dive & 1-Click Mitigation */}
          <div className="lg:col-span-5">
            {selectedCve && (
              <div className="p-6 rounded-3xl border border-slate-800 bg-[#080d20] sticky top-24 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold text-slate-400">VULNERABILITY INSPECTOR</span>
                  <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-[10px] font-bold">
                    CVSS v3.1 BASE
                  </span>
                </div>

                <h2 className="text-lg font-black text-white mb-2">{selectedCve.cveCode}</h2>
                <p className="text-xs text-slate-300 font-sans mb-6 leading-relaxed">
                  {selectedCve.title}
                </p>

                {/* CVSS Metric Cards */}
                <div className="grid grid-cols-2 gap-3 mb-6 text-xs">
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block mb-0.5">Attack Vector</span>
                    <strong className="text-white">{selectedCve.attackVector}</strong>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block mb-0.5">Complexity</span>
                    <strong className="text-white">{selectedCve.attackComplexity}</strong>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block mb-0.5">Privileges Req.</span>
                    <strong className="text-white">{selectedCve.privilegesRequired}</strong>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block mb-0.5">Affected Component</span>
                    <strong className="text-cyan-300 font-mono text-[11px] truncate block">
                      {selectedCve.affectedPackage}
                    </strong>
                  </div>
                </div>

                {/* Description */}
                <div className="mb-6">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                    Technical Impact Summary:
                  </span>
                  <div className="p-3 rounded-xl bg-[#040814] border border-slate-800 text-xs text-slate-300 font-sans leading-relaxed">
                    {selectedCve.description}
                  </div>
                </div>

                {/* Virtual Patch Directive */}
                <div className="mb-6">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                    ModSecurity Virtual Patch Directive:
                  </span>
                  <div className="p-3 rounded-xl bg-[#040814] border border-slate-800 text-[11px] text-cyan-300 font-mono break-all">
                    {selectedCve.mitigationVirtualPatch}
                  </div>
                </div>

                {/* 1-Click Action */}
                {selectedCve.patchStatus === "MITIGATED" ? (
                  <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/40 text-emerald-400 text-xs font-bold flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Virtual Patch Enforced in WAF Table</span>
                  </div>
                ) : (
                  <button
                    onClick={() => deployVirtualPatch(selectedCve.id)}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-cyan-500/25 active:scale-95"
                  >
                    <Zap className="w-4 h-4 fill-current" />
                    <span>Deploy Virtual Patch (1-Click WAF Shield)</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* NIST Incident Remediation Playbook (Print-Friendly A4) */
        <div className="bg-[#090f24] border border-slate-800 rounded-3xl p-8 max-w-4xl mx-auto shadow-2xl print:border-none print:bg-white print:text-black">
          {/* Document Header */}
          <div className="border-b border-slate-800 print:border-black pb-6 mb-6 flex justify-between items-start">
            <div>
              <div className="text-[10px] font-bold text-cyan-400 print:text-black tracking-widest uppercase mb-1">
                AEGIS DEFENSE SYSTEMS • NIST SP 800-61 REV. 2 COMPLIANT
              </div>
              <h2 className="text-xl font-black text-white print:text-black">
                INCIDENT RESPONSE &amp; CVE REMEDIATION PLAYBOOK
              </h2>
              <p className="text-xs text-slate-400 print:text-slate-600 font-sans mt-1">
                Ref Code: PLYBK-AEGIS-2026-NIST • Classification: SOC TLP:AMBER
              </p>
            </div>
            <div className="text-right font-mono text-xs text-slate-400 print:text-black">
              <div>Date: {new Date().toISOString().split("T")[0]}</div>
              <div className="font-bold text-emerald-400 print:text-black">STATUS: OPERATIONAL</div>
            </div>
          </div>

          {/* Section 1: Identification */}
          <div className="mb-6 font-sans">
            <h3 className="text-sm font-black text-cyan-400 print:text-black uppercase tracking-wider mb-2">
              Phase 1: Vulnerability Identification &amp; Triaging
            </h3>
            <div className="p-4 rounded-xl bg-slate-950 print:bg-slate-100 border border-slate-800 print:border-slate-300 text-xs space-y-2">
              <p><strong>Primary Vulnerability:</strong> {selectedCve.cveCode} — {selectedCve.title}</p>
              <p><strong>Affected Component:</strong> {selectedCve.affectedPackage}</p>
              <p><strong>Severity:</strong> CVSS {selectedCve.cvssScore} ({selectedCve.attackVector} Vector / {selectedCve.attackComplexity} Complexity)</p>
            </div>
          </div>

          {/* Section 2: Containment */}
          <div className="mb-6 font-sans">
            <h3 className="text-sm font-black text-cyan-400 print:text-black uppercase tracking-wider mb-2">
              Phase 2: Immediate Containment (Virtual Patching)
            </h3>
            <p className="text-xs text-slate-300 print:text-black mb-3">
              Sebelum patch upstream dirilis oleh vendor, terapkan aturan filter virtual patch pada Edge Ingress WAF berikut:
            </p>
            <div className="p-3 rounded-xl bg-[#040814] print:bg-slate-100 border border-slate-800 print:border-slate-300 font-mono text-[11px] text-cyan-300 print:text-black">
              {selectedCve.mitigationVirtualPatch}
            </div>
          </div>

          {/* Section 3: Eradication & Recovery */}
          <div className="mb-6 font-sans">
            <h3 className="text-sm font-black text-cyan-400 print:text-black uppercase tracking-wider mb-2">
              Phase 3: Eradication, Patching &amp; Post-Incident Audit
            </h3>
            <ol className="list-decimal list-inside text-xs text-slate-300 print:text-black space-y-1.5 leading-relaxed">
              <li>Deploy patch versi terbaru pada dependency tree: <code>npm audit fix</code> atau pin versi aman.</li>
              <li>Jalankan regression automated test suite untuk memverifikasi fungsionalitas aplikasi.</li>
              <li>Periksa access log dan audit SIEM untuk memastikan tidak ada payload yang berhasil dieksekusi sebelum mitigasi.</li>
              <li>Cabut credential atau token sesi yang terpapar selama periode kerentanan aktif.</li>
            </ol>
          </div>

          {/* Signatures */}
          <div className="pt-6 border-t border-slate-800 print:border-black grid grid-cols-2 gap-8 text-center text-xs">
            <div>
              <div className="h-12 border-b border-dashed border-slate-700 print:border-black mb-2" />
              <div className="font-bold text-white print:text-black">SOC Lead Responder</div>
              <div className="text-[10px] text-slate-400 print:text-slate-600">Aegis SecOps Command</div>
            </div>
            <div>
              <div className="h-12 border-b border-dashed border-slate-700 print:border-black mb-2" />
              <div className="font-bold text-white print:text-black">Chief Information Security Officer</div>
              <div className="text-[10px] text-slate-400 print:text-slate-600">Enterprise Cyber Security</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
