export type ThreatSeverity = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";

export type AttackCategory =
  | "DDOS_FLOOD"
  | "SQL_INJECTION"
  | "RANSOMWARE"
  | "BRUTE_FORCE"
  | "ZERO_DAY"
  | "CREDENTIAL_STUFFING"
  | "API_ABUSE"
  | "SSRF_EXPLOIT"
  | "PATH_TRAVERSAL"
  | "COMMAND_INJECTION";

export interface SecurityIncident {
  id: string;
  title: string;
  category: AttackCategory;
  severity: ThreatSeverity;
  sourceIp: string;
  sourceGeo: string;
  targetAsset: string;
  targetPort: number;
  mitreTactic: string;
  cvssScore: number;
  status: "INVESTIGATING" | "CONTAINED" | "RESOLVED";
  payloadSnippet?: string;
  timestamp: string;
}

export interface FirewallRule {
  id: string;
  name: string;
  action: "BLOCK" | "ALLOW" | "RATE_LIMIT" | "CHALLENGE";
  protocol: "TCP" | "UDP" | "HTTP" | "HTTPS";
  sourceCidr: string;
  targetPort: string;
  patternRegex?: string;
  hitsCount: number;
  status: "ACTIVE" | "DISABLED";
  createdAt: string;
  description?: string;
}

export interface MitreTacticItem {
  id: string;
  code: string;
  name: string;
  category: "Reconnaissance" | "Initial Access" | "Execution" | "Persistence" | "Defense Evasion" | "Exfiltration";
  activeThreatCount: number;
  riskScore: number; // 0 - 100
  mitigationGuide: string;
}

export interface CveRecord {
  id: string;
  cveCode: string;
  title: string;
  cvssScore: number;
  affectedPackage: string;
  patchStatus: "PATCH_AVAILABLE" | "MITIGATED" | "ZERO_DAY";
  description: string;
  attackVector: "NETWORK" | "ADJACENT" | "LOCAL" | "PHYSICAL";
  attackComplexity: "LOW" | "HIGH";
  privilegesRequired: "NONE" | "LOW" | "HIGH";
  userInteraction: "NONE" | "REQUIRED";
  mitigationVirtualPatch: string;
}

export interface WafTestResult {
  matchedRule?: FirewallRule;
  action: "BLOCKED" | "ALLOWED";
  matchedPattern?: string;
  executionTimeMs: number;
  payloadTested: string;
}
