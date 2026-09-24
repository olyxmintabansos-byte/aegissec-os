"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import confetti from "canvas-confetti";
import {
  SecurityIncident,
  FirewallRule,
  MitreTacticItem,
  CveRecord,
  ThreatSeverity,
  WafTestResult,
} from "@/types/aegis";

interface AegisContextType {
  incidents: SecurityIncident[];
  firewallRules: FirewallRule[];
  mitreTactics: MitreTacticItem[];
  cveRecords: CveRecord[];
  defconLevel: number;
  containIncident: (incidentId: string) => void;
  resolveIncident: (incidentId: string) => void;
  toggleFirewallRule: (ruleId: string) => void;
  addFirewallRule: (rule: Omit<FirewallRule, "id" | "hitsCount" | "createdAt">) => void;
  deleteFirewallRule: (ruleId: string) => void;
  deployVirtualPatch: (cveId: string) => void;
  testWafPayload: (payload: string) => WafTestResult;
  setDefconLevel: (level: number) => void;
}

const AegisContext = createContext<AegisContextType | undefined>(undefined);

export const MASTER_MITRE: MitreTacticItem[] = [
  { id: "m-1", code: "TA0001", name: "Initial Access", category: "Initial Access", activeThreatCount: 3, riskScore: 88, mitigationGuide: "Perketat MFA pada ingress API Gateway dan batasi akses SSH via Zero-Trust Tunnels." },
  { id: "m-2", code: "TA0002", name: "Execution", category: "Execution", activeThreatCount: 2, riskScore: 74, mitigationGuide: "Terapkan sandboxing strict pada execution runtime dan nonaktifkan arbitrary script execution." },
  { id: "m-3", code: "TA0005", name: "Defense Evasion", category: "Defense Evasion", activeThreatCount: 4, riskScore: 92, mitigationGuide: "Implementasikan audit log tamper-proofing dengan append-only hash chains." },
  { id: "m-4", code: "TA0010", name: "Exfiltration", category: "Exfiltration", activeThreatCount: 1, riskScore: 85, mitigationGuide: "Monitor outbound egress rate limits dan blokir unencrypted DNS tunneling." },
];

export const MASTER_CVE: CveRecord[] = [
  {
    id: "cve-1",
    cveCode: "CVE-2026-4428",
    title: "Remote Code Execution in Next.js Server Components Flight Protocol",
    cvssScore: 9.8,
    affectedPackage: "next@16.0.2",
    patchStatus: "PATCH_AVAILABLE",
    description: "Flaw in boundary serialization allows arbitrary payload execution via corrupted flight protocol stream.",
    attackVector: "NETWORK",
    attackComplexity: "LOW",
    privilegesRequired: "NONE",
    userInteraction: "NONE",
    mitigationVirtualPatch: "SecRule REQUEST_HEADERS:Next-Action '@rx (?:process|child_process|eval)' 'id:1001,phase:2,deny,status:403'",
  },
  {
    id: "cve-2",
    cveCode: "CVE-2026-3199",
    title: "Timing Attack in JWT Signature Verification Middleware",
    cvssScore: 7.5,
    affectedPackage: "crypto-auth@2.1",
    patchStatus: "MITIGATED",
    description: "Non-constant time comparison allows HMAC key recovery under high concurrency conditions.",
    attackVector: "NETWORK",
    attackComplexity: "HIGH",
    privilegesRequired: "NONE",
    userInteraction: "NONE",
    mitigationVirtualPatch: "SecRule ARGS:jwt_token '@rx [^A-Za-z0-9._-]' 'id:1002,phase:2,deny,status:400'",
  },
  {
    id: "cve-3",
    cveCode: "CVE-2026-1052",
    title: "Unauthenticated SSRF in Image Optimization Pipeline",
    cvssScore: 8.6,
    affectedPackage: "sharp-engine@0.33",
    patchStatus: "PATCH_AVAILABLE",
    description: "Internal metadata resolver permits loopback traversal to internal microservices and AWS IMDS.",
    attackVector: "NETWORK",
    attackComplexity: "LOW",
    privilegesRequired: "NONE",
    userInteraction: "NONE",
    mitigationVirtualPatch: "SecRule ARGS:url '@rx ^https?://(?:127\\.0\\.0\\.1|169\\.254\\.169\\.254|localhost)' 'id:1003,phase:2,deny,status:403'",
  },
  {
    id: "cve-4",
    cveCode: "CVE-2026-8812",
    title: "SQL Injection via Unsanitized JSON Post-Processing",
    cvssScore: 9.1,
    affectedPackage: "pg-query-driver@4.2",
    patchStatus: "ZERO_DAY",
    description: "Nested jsonb query extraction fails to bind parameters correctly, enabling SQL statement truncation.",
    attackVector: "NETWORK",
    attackComplexity: "LOW",
    privilegesRequired: "NONE",
    userInteraction: "NONE",
    mitigationVirtualPatch: "SecRule REQUEST_BODY '@rx (?i)(?:union[\\s\\+]+select|information_schema|pg_sleep)' 'id:1004,phase:2,deny,status:403'",
  },
];

export function AegisProvider({ children }: { children: React.ReactNode }) {
  const [incidents, setIncidents] = useState<SecurityIncident[]>([]);
  const [firewallRules, setFirewallRules] = useState<FirewallRule[]>([]);
  const [mitreTactics] = useState<MitreTacticItem[]>(MASTER_MITRE);
  const [cveRecords, setCveRecords] = useState<CveRecord[]>(MASTER_CVE);
  const [defconLevel, setDefconLevel] = useState<number>(2); // DEFCON 2: High Readiness

  useEffect(() => {
    try {
      const savedIncidents = localStorage.getItem("aegis_incidents");
      const savedRules = localStorage.getItem("aegis_rules");
      const savedCves = localStorage.getItem("aegis_cves");

      if (savedIncidents && savedRules) {
        setIncidents(JSON.parse(savedIncidents));
        setFirewallRules(JSON.parse(savedRules));
        if (savedCves) setCveRecords(JSON.parse(savedCves));
      } else {
        // Initial Seed Incidents
        const seedIncidents: SecurityIncident[] = [
          {
            id: "inc-01",
            title: "DDoS UDP Amp Flood against Ingress Gateway",
            category: "DDOS_FLOOD",
            severity: "CRITICAL",
            sourceIp: "185.220.101.44",
            sourceGeo: "Rusia (TOR Exit Node)",
            targetAsset: "api.aegis-defense.internal",
            targetPort: 443,
            mitreTactic: "T1498 - Network Denial of Service",
            cvssScore: 8.9,
            status: "INVESTIGATING",
            payloadSnippet: "UDP payload size: 1480 bytes, packet rate: 450,000 pps, amplified via NTP reflection",
            timestamp: "2 menit lalu",
          },
          {
            id: "inc-02",
            title: "SQL Injection Blind Exfiltration on /api/v1/auth",
            category: "SQL_INJECTION",
            severity: "CRITICAL",
            sourceIp: "45.154.255.89",
            sourceGeo: "Belanda (VPN Gateway)",
            targetAsset: "auth-service.aegis.prod",
            targetPort: 8080,
            mitreTactic: "T1190 - Exploit Public-Facing Application",
            cvssScore: 9.4,
            status: "CONTAINED",
            payloadSnippet: "POST /api/v1/auth HTTP/1.1; username=admin' OR 1=1; SELECT pg_sleep(5);--",
            timestamp: "5 menit lalu",
          },
          {
            id: "inc-03",
            title: "Kerberoasting & Lateral Movement Probe",
            category: "BRUTE_FORCE",
            severity: "HIGH",
            sourceIp: "103.208.220.12",
            sourceGeo: "Singapura (Cloud VPS)",
            targetAsset: "dc01.aegis.corp",
            targetPort: 88,
            mitreTactic: "T1558 - Steal or Forge Kerberos Tickets",
            cvssScore: 7.8,
            status: "INVESTIGATING",
            payloadSnippet: "KRB5_TGS_REQ for SPN HTTP/internal-vault.corp.domain with RC4-HMAC cipher",
            timestamp: "12 menit lalu",
          },
          {
            id: "inc-04",
            title: "DarkSide Ransomware Canary Canary File Tripwire",
            category: "RANSOMWARE",
            severity: "CRITICAL",
            sourceIp: "192.168.10.42",
            sourceGeo: "Internal Subnet (Workstation-Fin-03)",
            targetAsset: "nas-share-01.aegis.corp",
            targetPort: 445,
            mitreTactic: "T1486 - Data Encrypted for Impact",
            cvssScore: 9.8,
            status: "INVESTIGATING",
            payloadSnippet: "High entropy write burst detected on canary directory /finance/shares/sensitive_*.xlsx",
            timestamp: "18 menit lalu",
          },
        ];

        const seedRules: FirewallRule[] = [
          {
            id: "rule-01",
            name: "Default Drop Known TOR Exit Nodes",
            action: "BLOCK",
            protocol: "TCP",
            sourceCidr: "185.220.101.0/24",
            targetPort: "443, 80",
            patternRegex: ".*",
            hitsCount: 14208,
            status: "ACTIVE",
            createdAt: "2026-09-20",
            description: "Memblokir subnet IP exit node TOR dari akses API production",
          },
          {
            id: "rule-02",
            name: "WAF SQLi Union & Time-Based Filter",
            action: "BLOCK",
            protocol: "HTTP",
            sourceCidr: "0.0.0.0/0",
            targetPort: "80, 8080",
            patternRegex: "(?i)(union\\s+select|pg_sleep|benchmark|\\bOR\\b\\s+1=1)",
            hitsCount: 3845,
            status: "ACTIVE",
            createdAt: "2026-09-22",
            description: "Mencegah serangan SQL injection umum pada query param dan request body",
          },
          {
            id: "rule-03",
            name: "Ingress Syn-Flood TCP Rate Limiter",
            action: "RATE_LIMIT",
            protocol: "TCP",
            sourceCidr: "0.0.0.0/0",
            targetPort: "443",
            patternRegex: ".*",
            hitsCount: 29012,
            status: "ACTIVE",
            createdAt: "2026-09-23",
            description: "Membatasi SYN packets maksimal 500 pps per IP",
          },
          {
            id: "rule-04",
            name: "SSRF Internal Metadata Shield",
            action: "BLOCK",
            protocol: "HTTPS",
            sourceCidr: "0.0.0.0/0",
            targetPort: "443",
            patternRegex: "(169\\.254\\.169\\.254|127\\.0\\.0\\.1|localhost)",
            hitsCount: 512,
            status: "ACTIVE",
            createdAt: "2026-09-24",
            description: "Mencegah SSRF terhadap AWS EC2 IMDS dan loopback",
          },
        ];

        setIncidents(seedIncidents);
        setFirewallRules(seedRules);
        localStorage.setItem("aegis_incidents", JSON.stringify(seedIncidents));
        localStorage.setItem("aegis_rules", JSON.stringify(seedRules));
        localStorage.setItem("aegis_cves", JSON.stringify(MASTER_CVE));
      }
    } catch {
      // LocalStorage access fallback
    }
  }, []);

  const saveToStorage = (updatedIncidents: SecurityIncident[], updatedRules: FirewallRule[]) => {
    try {
      localStorage.setItem("aegis_incidents", JSON.stringify(updatedIncidents));
      localStorage.setItem("aegis_rules", JSON.stringify(updatedRules));
    } catch {
      // Ignored
    }
  };

  const containIncident = (incidentId: string) => {
    setIncidents((prev) => {
      const updated = prev.map((inc) =>
        inc.id === incidentId ? { ...inc, status: "CONTAINED" as const } : inc
      );
      saveToStorage(updated, firewallRules);
      return updated;
    });

    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
        colors: ["#06b6d4", "#3b82f6", "#10b981"],
      });
    } catch {}
  };

  const resolveIncident = (incidentId: string) => {
    setIncidents((prev) => {
      const updated = prev.map((inc) =>
        inc.id === incidentId ? { ...inc, status: "RESOLVED" as const } : inc
      );
      saveToStorage(updated, firewallRules);
      return updated;
    });

    try {
      confetti({
        particleCount: 80,
        spread: 80,
        origin: { y: 0.7 },
        colors: ["#10b981", "#059669", "#34d399"],
      });
    } catch {}
  };

  const toggleFirewallRule = (ruleId: string) => {
    setFirewallRules((prev) => {
      const updated = prev.map((r) =>
        r.id === ruleId
          ? { ...r, status: (r.status === "ACTIVE" ? "DISABLED" : "ACTIVE") as "ACTIVE" | "DISABLED" }
          : r
      );
      saveToStorage(incidents, updated);
      return updated;
    });
  };

  const addFirewallRule = (ruleData: Omit<FirewallRule, "id" | "hitsCount" | "createdAt">) => {
    const newRule: FirewallRule = {
      ...ruleData,
      id: `rule-${Date.now()}`,
      hitsCount: 0,
      createdAt: new Date().toISOString().split("T")[0],
    };

    setFirewallRules((prev) => {
      const updated = [newRule, ...prev];
      saveToStorage(incidents, updated);
      return updated;
    });

    try {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {}
  };

  const deleteFirewallRule = (ruleId: string) => {
    setFirewallRules((prev) => {
      const updated = prev.filter((r) => r.id !== ruleId);
      saveToStorage(incidents, updated);
      return updated;
    });
  };

  const deployVirtualPatch = (cveId: string) => {
    const targetCve = cveRecords.find((c) => c.id === cveId);
    if (!targetCve) return;

    // Update CVE status to MITIGATED
    const updatedCves = cveRecords.map((c) =>
      c.id === cveId ? { ...c, patchStatus: "MITIGATED" as const } : c
    );
    setCveRecords(updatedCves);
    try {
      localStorage.setItem("aegis_cves", JSON.stringify(updatedCves));
    } catch {}

    // Auto-generate virtual patch firewall rule
    const newRule: FirewallRule = {
      id: `waf-patch-${cveId}-${Date.now().toString().slice(-4)}`,
      name: `Virtual Patch for ${targetCve.cveCode}`,
      action: "BLOCK",
      protocol: "HTTPS",
      sourceCidr: "0.0.0.0/0",
      targetPort: "443, 80",
      patternRegex: targetCve.mitigationVirtualPatch.includes("@rx")
        ? targetCve.mitigationVirtualPatch.split("@rx ")[1]?.split("'")[0] || ".*"
        : ".*",
      hitsCount: 1,
      status: "ACTIVE",
      createdAt: new Date().toISOString().split("T")[0],
      description: `Auto-generated virtual patch for ${targetCve.cveCode} (${targetCve.title})`,
    };

    setFirewallRules((prev) => {
      const updated = [newRule, ...prev];
      saveToStorage(incidents, updated);
      return updated;
    });

    // Auto-resolve any related incident
    setIncidents((prev) => {
      const updated = prev.map((inc) =>
        inc.title.toLowerCase().includes(targetCve.cveCode.toLowerCase())
          ? { ...inc, status: "RESOLVED" as const }
          : inc
      );
      saveToStorage(updated, [newRule, ...firewallRules]);
      return updated;
    });

    try {
      confetti({
        particleCount: 100,
        spread: 90,
        origin: { y: 0.5 },
        colors: ["#06b6d4", "#10b981", "#8b5cf6"],
      });
    } catch {}
  };

  const testWafPayload = (payload: string): WafTestResult => {
    const startTime = performance.now();
    const activeRules = firewallRules.filter((r) => r.status === "ACTIVE" && r.patternRegex);

    for (const rule of activeRules) {
      try {
        if (!rule.patternRegex) continue;
        const regex = new RegExp(rule.patternRegex, "i");
        if (regex.test(payload)) {
          const executionTimeMs = parseFloat((performance.now() - startTime).toFixed(2));
          // Increment hit count
          setFirewallRules((prev) =>
            prev.map((r) => (r.id === rule.id ? { ...r, hitsCount: r.hitsCount + 1 } : r))
          );
          return {
            matchedRule: rule,
            action: "BLOCKED",
            matchedPattern: rule.patternRegex,
            executionTimeMs,
            payloadTested: payload,
          };
        }
      } catch {
        // regex error fallback
      }
    }

    const executionTimeMs = parseFloat((performance.now() - startTime).toFixed(2));
    return {
      action: "ALLOWED",
      executionTimeMs,
      payloadTested: payload,
    };
  };

  return (
    <AegisContext.Provider
      value={{
        incidents,
        firewallRules,
        mitreTactics,
        cveRecords,
        defconLevel,
        containIncident,
        resolveIncident,
        toggleFirewallRule,
        addFirewallRule,
        deleteFirewallRule,
        deployVirtualPatch,
        testWafPayload,
        setDefconLevel,
      }}
    >
      {children}
    </AegisContext.Provider>
  );
}

export function useAegis() {
  const context = useContext(AegisContext);
  if (!context) {
    throw new Error("useAegis must be used within an AegisProvider");
  }
  return context;
}
