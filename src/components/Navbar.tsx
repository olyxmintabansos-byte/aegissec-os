"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShieldAlert,
  ShieldCheck,
  Flame,
  Radio,
  ExternalLink,
  Layers3,
  Sliders,
  Bug,
} from "lucide-react";
import { useAegis } from "@/context/AegisContext";

export function Navbar() {
  const pathname = usePathname();
  const { defconLevel, setDefconLevel, incidents } = useAegis();

  const criticalCount = incidents.filter(
    (i) => i.severity === "CRITICAL" && i.status !== "RESOLVED"
  ).length;

  const navLinks = [
    { href: "/", label: "SOC Command Center", icon: ShieldAlert },
    { href: "/mitre/", label: "MITRE ATT&CK Matrix", icon: Layers3 },
    { href: "/waf/", label: "WAF Rule Studio", icon: Sliders },
    { href: "/cve/", label: "CVE & Patch Engine", icon: Bug },
  ];

  return (
    <header className="border-b border-slate-800 bg-[#040814]/90 backdrop-blur-md sticky top-0 z-50 font-mono text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-cyan-500/20">
            <ShieldCheck className="w-6 h-6 text-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-white text-base tracking-wider">
                AEGISSEC OS
              </span>
              <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-[10px] font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
                SOC SIEM
              </span>
            </div>
            <p className="text-[10px] text-slate-400">Cyber Defense & Threat Intelligence OS</p>
          </div>
        </div>

        {/* 4-Route Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 bg-[#090f1e] p-1 rounded-2xl border border-slate-800">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive =
              link.href === "/"
                ? pathname === "/" || pathname === ""
                : pathname?.startsWith(link.href.replace(/\/$/, ""));

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all ${
                  isActive
                    ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* DEFCON Status & Critical Counter */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-950/40 border border-red-500/40 text-red-400 font-bold">
            <Flame className="w-4 h-4 animate-bounce text-red-400" />
            <span>{criticalCount} Critical</span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300">
            <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span className="text-[10px] text-slate-400">DEFCON:</span>
            <select
              value={defconLevel}
              onChange={(e) => setDefconLevel(Number(e.target.value))}
              className="bg-transparent text-cyan-300 font-black cursor-pointer focus:outline-none"
            >
              <option value={1} className="bg-slate-900 text-red-400">LEVEL 1 (Maximum)</option>
              <option value={2} className="bg-slate-900 text-orange-400">LEVEL 2 (High)</option>
              <option value={3} className="bg-slate-900 text-yellow-400">LEVEL 3 (Elevated)</option>
              <option value={4} className="bg-slate-900 text-blue-400">LEVEL 4 (Guarded)</option>
              <option value={5} className="bg-slate-900 text-emerald-400">LEVEL 5 (Normal)</option>
            </select>
          </div>

          <a
            href="https://olyxmintabansos-byte.github.io/olyx-portfolio/"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-cyan-400 transition-colors"
            title="Apex Portfolio Hub"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </header>
  );
}
