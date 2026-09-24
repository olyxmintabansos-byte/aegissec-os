"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import confetti from "canvas-confetti";
import {
  SecurityIncident,
  FirewallRule,
  MitreTacticItem,
  CveRecord,
  ThreatSeverity,
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
}

const AegisContext = createContext<AegisContextType | undefined>(undefined);

export const MASTER_MITRE: MitreTacticItem[] = [
  { id: "m-1", code: "TA0001", name: "Initial Access", category: "Initial Access", activeThreatCount: 3, riskScore: 88, mitigationGuide: "Perketat MFA pada ingress API Gateway dan batasi akses SSH via Zero-Trust Tunnels." },
  { id: "m-2", code: "TA0002", name: "Execution", category: "Execution", activeThreatCount: 2, riskScore: 74, mitigationGuide: "Terapkan sandboxing strict pada execution runtime dan nonaktifkan arbitrary script execution." },
  { id: "m-3", code: "TA0005", name: "Defense Evasion", category: "Defense Evasion", activeThreatCount: 4, riskScore: 92, mitigationGuide: "Implementasikan audit log tamper-proofing dengan append-only hash chains." },
  { id: "m-4", code: "TA0010", name: "Exfiltration", category: "Exfiltration", activeThreatCount: 1, riskScore: 85, mitigationGuide: "Monitor outbound egress rate limits dan blokir unencrypted DNS tunneling." },
];

export const MASTER_CVE: CveRecord[] = [
  { id: "cve-1", cveCode: "CVE-2026-4428", title: "Remote Code Execution in Next.js Server Components", cvssScore: 9.8, affectedPackage: "next@16.0.2", patchStatus: "PATCH_AVAILABLE", description: "Flaw in boundary serialization allows arbitrary payload execution via corrupted flight protocol stream." },
  { id: "cve-2", cveCode: "CVE-2026-3199", title: "Timing Attack in JWT Signature Verification", cvssScore: 7.5, affectedPackage: "crypto-auth@2.1", patchStatus: "MITIGATED", description: "Non-constant time comparison allows HMAC key recovery under high concurrency conditions." },
  { id: "cve-3", cveCode: "CVE-2026-1052", title: "Unauthenticated SSRF in Image Optimization Pipeline", cvssScore: 8.6, affectedPackage: "sharp-engine@0.33", patchStatus: "PATCH_AVAILABLE", description: "Internal metadata resolver permits loopback traversal to internal microservices." },
];

export function AegisProvider({ children }: { children: React.ReactNode }) {
  const [incidents, setIncidents] = useState<SecurityIncident[]>([]);
  const [firewallRules, setFirewallRules] = useState<FirewallRule[]>([]);
  const [mitreTactics] = useState<MitreTacticItem[]>(MASTER_MITRE);
  const [cveRecords] = useState<CveRecord[]>(MASTER_CVE);
  const [defconLevel, setDefconLevel] = useState<number>(2); // DEFCON 2: High Readiness

  useEffect(() => {
    try {
      const savedIncidents = localStorage.getItem("aegis_incidents");
      const savedRules = localStorage.getItem("aegis_rules");

      if (savedIncidents && savedRules) {
        setIncidents(JSON.parse(savedIncidents));
        setFirewallRules(JSON.parse(savedRules));
      } else {
        // Initial Seed Incidents
        const seedIncidents: SecurityIncident[] = [
          {
            id: "inc-01",
            title: "Volumetric SYN Flood Attack targeting Public Gateway",
            category: "DDOS_FLOOD",
            severity: "CRITICAL",
            sourceIp: "185.220.101.5",
            sourceGeo: "Tor Exit Node (NL)",
            targetAsset: "api.aegissec.corp / Port 443",
            targetPort: 443,
            mitreTactic: "TA0040 Impact (Network Denial)",
            cvssScore: 9.1,
            status: "INVESTIGATING",
            payloadSnippet: "TCP SYN flood rate: 450,000 pps, bypass attempt on rate-limiter bucket.",
            timestamp: "19:04:12",
          },
          {
            id: "inc-02",
            title: "Boolean-Based SQL Injection on User Auth Endpoint",
            category: "SQL_INJECTION",
            severity: "HIGH",
            sourceIp: "103.145.75.12",
            sourceGeo: "Jakarta, ID",
            targetAsset: "/v1/auth/login",
            targetPort: 443,
            mitreTactic: "TA0001 Initial Access",
            cvssScore: 8.4,
            status: "CONTAINED",
            payloadSnippet: "' OR 1=1 UNION SELECT id, password_hash, role FROM sys_users--",
            timestamp: "18:52:45",
          },
          {
            id: "inc-03",
            title: "Distributed Credential Stuffing Campaign",
            category: "CREDENTIAL_STUFFING",
            severity: "HIGH",
            sourceIp: "45.154.255.89",
            sourceGeo: "Frankfurt, DE",
            targetAsset: "/v1/membership/verify",
            targetPort: 443,
            mitreTactic: "TA0006 Credential Access",
            cvssScore: 7.8,
            status: "INVESTIGATING",
            payloadSnippet: "Rotated proxy pool: 1,420 unique IPs, hit rate: 80 req/sec.",
            timestamp: "18:40:10",
          },
          {
            id: "inc-04",
            title: "Lateral Movement Probe via SMB Port 445",
            category: "ZERO_DAY",
            severity: "CRITICAL",
            sourceIp: "91.240.118.2",
            sourceGeo: "Bucharest, RO",
            targetAsset: "internal-db-node-01.corp",
            targetPort: 445,
            mitreTactic: "TA0008 Lateral Movement",
            cvssScore: 9.6,
            status: "CONTAINED",
            payloadSnippet: "SMB Tree Connect request using compromised Kerberos silver ticket.",
            timestamp: "18:15:30",
          },
          {
            id: "inc-05",
            title: "API Rate Limit Violation & Scraper Bot",
            category: "API_ABUSE",
            severity: "MEDIUM",
            sourceIp: "20.124.88.19",
            sourceGeo: "Virginia, US",
            targetAsset: "/v1/market/tickers",
            targetPort: 443,
            mitreTactic: "TA0009 Collection",
            cvssScore: 5.3,
            status: "RESOLVED",
            payloadSnippet: "Headless Chromium user agent detected, requesting tickers at 200 req/sec.",
            timestamp: "17:30:00",
          },
        ];

        const seedRules: FirewallRule[] = [
          { id: "fw-1", name: "Block Tor Exit Nodes Ingress", action: "BLOCK", protocol: "TCP", sourceCidr: "185.220.101.0/24", targetPort: "443", hitsCount: 14250, status: "ACTIVE", createdAt: "2026-09-24" },
          { id: "fw-2", name: "Rate Limit /v1/auth Endpoints", action: "RATE_LIMIT", protocol: "HTTPS", sourceCidr: "0.0.0.0/0", targetPort: "443", hitsCount: 38900, status: "ACTIVE", createdAt: "2026-09-24" },
          { id: "fw-3", name: "Drop Internal SMB Exposure", action: "BLOCK", protocol: "TCP", sourceCidr: "0.0.0.0/0", targetPort: "445", hitsCount: 840, status: "ACTIVE", createdAt: "2026-09-24" },
          { id: "fw-4", name: "Allow Internal VPC Mesh", action: "ALLOW", protocol: "TCP", sourceCidr: "10.0.0.0/8", targetPort: "ANY", hitsCount: 520000, status: "ACTIVE", createdAt: "2026-09-24" },
        ];

        setIncidents(seedIncidents);
        setFirewallRules(seedRules);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    if (incidents.length > 0) {
      localStorage.setItem("aegis_incidents", JSON.stringify(incidents));
      localStorage.setItem("aegis_rules", JSON.stringify(firewallRules));
    }
  }, [incidents, firewallRules]);

  const containIncident = (incidentId: string) => {
    setIncidents((prev) =>
      prev.map((inc) => (inc.id === incidentId ? { ...inc, status: "CONTAINED" } : inc))
    );
  };

  const resolveIncident = (incidentId: string) => {
    setIncidents((prev) =>
      prev.map((inc) => (inc.id === incidentId ? { ...inc, status: "RESOLVED" } : inc))
    );

    try {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ["#06b6d4", "#10b981", "#3b82f6"],
      });
    } catch (e) {
      console.error(e);
    }
  };

  const toggleFirewallRule = (ruleId: string) => {
    setFirewallRules((prev) =>
      prev.map((r) =>
        r.id === ruleId
          ? { ...r, status: r.status === "ACTIVE" ? "DISABLED" : "ACTIVE" }
          : r
      )
    );
  };

  const addFirewallRule = (data: Omit<FirewallRule, "id" | "hitsCount" | "createdAt">) => {
    const newRule: FirewallRule = {
      ...data,
      id: `fw-${Date.now()}`,
      hitsCount: 0,
      createdAt: new Date().toISOString().split("T")[0],
    };
    setFirewallRules((prev) => [newRule, ...prev]);
  };

  const deleteFirewallRule = (ruleId: string) => {
    setFirewallRules((prev) => prev.filter((r) => r.id !== ruleId));
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
