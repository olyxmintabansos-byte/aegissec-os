"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShieldAlert,
  ShieldCheck,
  Radio,
  Flame,
  Terminal,
  Activity,
  Zap,
  Lock,
  Search,
  ExternalLink,
  ChevronRight,
  AlertTriangle,
  Play,
  Check,
} from "lucide-react";
import { useAegis } from "@/context/AegisContext";
import { ThreatRadar } from "@/components/ThreatRadar";
import { ThreatSeverity } from "@/types/aegis";
import { formatNumber } from "@/lib/utils";

export default function SocCommandCenter() {
  const { incidents, firewallRules, containIncident, resolveIncident, toggleFirewallRule } = useAegis();
  const [selectedIncidentId, setSelectedIncidentId] = useState<string>("inc-01");

  const activeIncidents = incidents.filter((i) => i.status !== "RESOLVED");
  const selectedIncident = incidents.find((i) => i.id === selectedIncidentId) || activeIncidents[0];

  const getSeverityBadge = (sev: ThreatSeverity) => {
    switch (sev) {
      case "CRITICAL":
        return "bg-red-500/10 border-red-500/50 text-red-400 font-black animate-pulse";
      case "HIGH":
        return "bg-orange-500/10 border-orange-500/50 text-orange-400 font-bold";
      case "MEDIUM":
        return "bg-amber-500/10 border-amber-500/50 text-amber-400 font-bold";
      case "LOW":
        return "bg-cyan-500/10 border-cyan-500/50 text-cyan-400 font-bold";
    }
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6 font-sans pb-24">
      {/* 4 KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono text-xs">
        <div className="bg-[#080d1a] border border-red-500/40 p-4 rounded-2xl neon-glow-red">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span>Critical Incidents</span>
            <ShieldAlert className="w-4 h-4 text-red-400 animate-pulse" />
          </div>
          <div className="text-2xl font-black text-red-400">
            {incidents.filter((i) => i.severity === "CRITICAL" && i.status !== "RESOLVED").length} Alerts
          </div>
          <div className="text-[10px] text-slate-500 mt-1">Immediate Containment Required</div>
        </div>

        <div className="bg-[#080d1a] border border-cyan-500/40 p-4 rounded-2xl neon-glow-cyan">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span>Blocked Threats / Min</span>
            <Zap className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-cyan-400">14.250 pps</div>
          <div className="text-[10px] text-slate-500 mt-1">WAF Ingress Rate Limiting</div>
        </div>

        <div className="bg-[#080d1a] border border-emerald-500/40 p-4 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span>Mean Time To Detect</span>
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400">420 ms</div>
          <div className="text-[10px] text-slate-500 mt-1">Sub-second SIEM Correlation</div>
        </div>

        <div className="bg-[#080d1a] border border-purple-500/40 p-4 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span>Active Firewall Rules</span>
            <Lock className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-black text-purple-400">
            {firewallRules.filter((r) => r.status === "ACTIVE").length} Rules
          </div>
          <div className="text-[10px] text-slate-500 mt-1">Ingress Policy Enforcement</div>
        </div>
      </div>

      {/* Main Grid: Left Threat Radar & Live Incident Detail, Right Attack Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Live Radar & Incident Investigation Card (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Canvas Radar Sweep */}
          <ThreatRadar threatCount={activeIncidents.length} />

          {/* Selected Incident Detail & Remediation Actions */}
          {selectedIncident && (
            <div className="bg-[#080d1a] border border-slate-800 rounded-3xl p-6 space-y-4 font-mono text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-white text-base">{selectedIncident.title}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border ${getSeverityBadge(selectedIncident.severity)}`}>
                      {selectedIncident.severity}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    ID: {selectedIncident.id} • Tactic: {selectedIncident.mitreTactic}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {selectedIncident.status !== "CONTAINED" && selectedIncident.status !== "RESOLVED" && (
                    <button
                      onClick={() => containIncident(selectedIncident.id)}
                      className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black cursor-pointer transition-all"
                    >
                      Contain Threat
                    </button>
                  )}

                  {selectedIncident.status !== "RESOLVED" && (
                    <button
                      onClick={() => resolveIncident(selectedIncident.id)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black flex items-center gap-1 cursor-pointer transition-all shadow-md"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Mitigate & Resolve</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Threat Origin & Target Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#050914] p-3.5 rounded-2xl border border-slate-800/80">
                <div>
                  <span className="text-[10px] text-slate-500 block">SOURCE IP</span>
                  <strong className="text-red-400 text-xs">{selectedIncident.sourceIp}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">GEOLOCATION</span>
                  <strong className="text-slate-300 text-xs">{selectedIncident.sourceGeo}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">TARGET ASSET</span>
                  <strong className="text-cyan-400 text-xs truncate block">{selectedIncident.targetAsset}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">CVSS v3.1</span>
                  <strong className="text-amber-400 text-xs">{selectedIncident.cvssScore} / 10.0</strong>
                </div>
              </div>

              {/* Payload Inspection Block */}
              {selectedIncident.payloadSnippet && (
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-bold flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Captured Attack Vector Payload Snippet:</span>
                  </span>
                  <pre className="p-3 bg-[#03060f] border border-slate-800 rounded-xl text-red-300 font-mono text-[11px] overflow-x-auto whitespace-pre-wrap">
                    <code>{selectedIncident.payloadSnippet}</code>
                  </pre>
                </div>
              )}
            </div>
          )}

          {/* Firewall Enforcement Table */}
          <div className="bg-[#080d1a] border border-slate-800 rounded-3xl p-5 space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white flex items-center gap-2">
                <Lock className="w-4 h-4 text-cyan-400" />
                <span>ACTIVE WAF & ZERO-TRUST INGRESS POLICIES</span>
              </h3>
              <span className="text-[10px] text-slate-400">Policy Mode: Strict</span>
            </div>

            <div className="divide-y divide-slate-800/80">
              {firewallRules.map((rule) => (
                <div key={rule.id} className="py-2.5 flex items-center justify-between gap-4">
                  <div>
                    <span className="font-bold text-white text-xs block">{rule.name}</span>
                    <span className="text-[10px] text-slate-500">
                      CIDR: {rule.sourceCidr} • Port: {rule.targetPort} • Protocol: {rule.protocol}
                    </span>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-cyan-400 font-bold text-[11px]">
                      {formatNumber(rule.hitsCount)} hits
                    </span>

                    <button
                      onClick={() => toggleFirewallRule(rule.id)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                        rule.status === "ACTIVE"
                          ? "bg-emerald-500/10 border border-emerald-500/40 text-emerald-400"
                          : "bg-slate-800 text-slate-500"
                      }`}
                    >
                      {rule.status}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Live Incident Stream Feed (1 Col) */}
        <div className="space-y-4 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-black text-white text-sm flex items-center gap-2">
              <Radio className="w-4 h-4 text-red-400 animate-pulse" />
              <span>LIVE INCIDENT STREAM</span>
            </h3>
            <Link
              href="/mitre"
              className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1 font-bold"
            >
              <span>MITRE Matrix</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-2.5 max-h-[640px] overflow-y-auto pr-1">
            {incidents.map((inc) => (
              <button
                key={inc.id}
                onClick={() => setSelectedIncidentId(inc.id)}
                className={`w-full text-left p-3.5 rounded-2xl border transition-all cursor-pointer ${
                  selectedIncident?.id === inc.id
                    ? "bg-[#0e162b] border-cyan-500/60 shadow-md shadow-cyan-950/20"
                    : "bg-[#080d1a] border-slate-800 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-black text-white text-xs truncate max-w-[180px]">{inc.title}</span>
                  <span className={`text-[9px] px-2 py-0.5 rounded-full border ${getSeverityBadge(inc.severity)}`}>
                    {inc.severity}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span className="text-red-400">{inc.sourceIp}</span>
                  <span>{inc.sourceGeo}</span>
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-500 mt-2 pt-2 border-t border-slate-800/80">
                  <span>{inc.category}</span>
                  <span className="text-cyan-400 font-bold">{inc.timestamp}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

      </div>
    </main>
  );
}
