"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShieldAlert,
  ShieldCheck,
  Radio,
  Flame,
  Terminal,
  Activity,
  Layers,
  ExternalLink,
  Cpu,
} from "lucide-react";
import { useAegis } from "@/context/AegisContext";

export function Navbar() {
  const pathname = usePathname();
  const { incidents, defconLevel } = useAegis();

  const criticalCount = incidents.filter((i) => i.severity === "CRITICAL" && i.status !== "RESOLVED").length;

  const navLinks = [
    { href: "/", label: "SOC Command Center", icon: ShieldAlert },
    { href: "/mitre", label: "MITRE ATT&CK Matrix", icon: Layers },
  ];

  return (
    <header className="border-b border-slate-800 bg-[#040814]/90 backdrop-blur-md sticky top-0 z-50 font-mono text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-cyan-500/20">
            <ShieldCheck className="w-6 h-6 text-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-white text-base tracking-wider">AEGISSEC OS</span>
              <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-[10px] font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                SOC SIEM
              </span>
            </div>
            <p className="text-[10px] text-slate-400">Cyber Defense & Threat Intelligence OS</p>
          </div>
        </div>

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center gap-1 bg-[#090f1e] p-1 rounded-2xl border border-slate-800">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3.5 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all ${
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

        {/* Right Status Badges */}
        <div className="flex items-center gap-3">
          {/* DEFCON Badge */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-950/40 border border-red-500/40 text-red-400 font-bold">
            <Flame className="w-3.5 h-3.5 animate-pulse" />
            <span>DEFCON {defconLevel} READY</span>
          </div>

          {criticalCount > 0 && (
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 font-bold">
              <span>{criticalCount} Critical Alerts</span>
            </div>
          )}

          <a
            href="https://olyxmintabansos-byte.github.io/olyx-portfolio/"
            target="_blank"
            rel="noreferrer"
            className="px-3 py-1.5 rounded-xl bg-[#11192e] border border-slate-700 hover:border-cyan-500 text-slate-300 hover:text-white font-bold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <span>Hub Utama</span>
            <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
          </a>
        </div>

      </div>
    </header>
  );
}
