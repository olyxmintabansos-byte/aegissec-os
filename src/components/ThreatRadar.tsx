"use client";

import React, { useEffect, useRef } from "react";

interface ThreatBlip {
  x: number;
  y: number;
  radius: number;
  alpha: number;
  severity: "CRITICAL" | "HIGH" | "MEDIUM";
  ip: string;
}

export function ThreatRadar({
  threatCount = 6,
}: {
  threatCount?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const maxRadius = Math.min(centerX, centerY) - 10;

    let angle = 0;

    // Seed mock threat blips
    const blips: ThreatBlip[] = [
      { x: centerX + 50, y: centerY - 45, radius: 4, alpha: 1, severity: "CRITICAL", ip: "185.220.101.5" },
      { x: centerX - 70, y: centerY - 30, radius: 3, alpha: 1, severity: "HIGH", ip: "103.145.75.12" },
      { x: centerX + 30, y: centerY + 60, radius: 3, alpha: 1, severity: "MEDIUM", ip: "45.154.255.89" },
      { x: centerX - 40, y: centerY + 50, radius: 4, alpha: 1, severity: "CRITICAL", ip: "91.240.118.2" },
    ];

    const render = () => {
      // Semi-transparent background for sweep trail
      ctx.fillStyle = "rgba(3, 7, 18, 0.15)";
      ctx.fillRect(0, 0, width, height);

      // Radar Concentric Circles
      ctx.strokeStyle = "rgba(6, 182, 212, 0.15)";
      ctx.lineWidth = 1;

      for (let r = 25; r <= maxRadius; r += 25) {
        ctx.beginPath();
        ctx.arc(centerX, centerY, r, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Radar Crosshairs
      ctx.beginPath();
      ctx.moveTo(centerX, centerY - maxRadius);
      ctx.lineTo(centerX, centerY + maxRadius);
      ctx.moveTo(centerX - maxRadius, centerY);
      ctx.lineTo(centerX + maxRadius, centerY);
      ctx.stroke();

      // Rotating Scanner Beam
      const beamX = centerX + Math.cos(angle) * maxRadius;
      const beamY = centerY + Math.sin(angle) * maxRadius;

      const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, maxRadius);
      gradient.addColorStop(0, "rgba(6, 182, 212, 0.3)");
      gradient.addColorStop(1, "rgba(6, 182, 212, 0.0)");

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, maxRadius, angle - 0.35, angle);
      ctx.closePath();
      ctx.fillStyle = gradient;
      ctx.fill();

      // Leading Sweep Line
      ctx.strokeStyle = "#06b6d4";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(beamX, beamY);
      ctx.stroke();

      // Draw Threat Blips
      blips.forEach((blip) => {
        ctx.fillStyle = blip.severity === "CRITICAL" ? "#ef4444" : "#f59e0b";
        ctx.shadowColor = blip.severity === "CRITICAL" ? "#ef4444" : "#f59e0b";
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(blip.x, blip.y, blip.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      angle += 0.03;
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="bg-[#050914] border border-cyan-500/30 rounded-2xl p-4 flex flex-col justify-between space-y-3 font-mono neon-glow-cyan">
      <div className="flex items-center justify-between border-b border-cyan-950/60 pb-2">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
          <span className="text-cyan-400 font-black text-xs">GLOBAL PACKET SWEEP RADAR</span>
        </div>
        <span className="text-[10px] text-slate-500">RANGE: 360° • SECTOR 07</span>
      </div>

      <div className="relative w-full h-44 flex items-center justify-center overflow-hidden rounded-xl bg-[#02050d]">
        <canvas
          ref={canvasRef}
          width={320}
          height={176}
          className="block"
        />
      </div>

      {/* Radar Coordinates HUD */}
      <div className="grid grid-cols-3 gap-2 pt-1 text-center text-[10px]">
        <div className="bg-[#081122] border border-cyan-900/50 p-1.5 rounded-xl">
          <span className="text-slate-400 block">THREAT BLIPS</span>
          <strong className="text-red-400 text-sm font-black">{threatCount} Targets</strong>
        </div>
        <div className="bg-[#081122] border border-cyan-900/50 p-1.5 rounded-xl">
          <span className="text-slate-400 block">SWEEP SPEED</span>
          <strong className="text-cyan-400 text-sm font-black">60 RPM</strong>
        </div>
        <div className="bg-[#081122] border border-cyan-900/50 p-1.5 rounded-xl">
          <span className="text-slate-400 block">SENSOR HEALTH</span>
          <strong className="text-emerald-400 text-sm font-black">100%</strong>
        </div>
      </div>
    </div>
  );
}
