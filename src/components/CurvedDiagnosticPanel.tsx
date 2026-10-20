/**
 * CurvedDiagnosticPanel.tsx
 * Left Cylindrical Curved Holographic HUD Screen (Faithfully matching IMG_20261013_145133.jpg):
 * - Prominent animated vertical bar chart with glowing cyan bars.
 * - Live real-time audio oscilloscope waveform sine graph.
 * - Scrolling telemetry data stream & neural parameters table.
 * - Secondary frequency distribution bar graph.
 * - Authentic cylindrical concave curvature, cyan edge bloom, and subtle glass reflection.
 */

import React, { useEffect, useRef, useState } from 'react';
import { Activity, Cpu, Database, Radio, Sparkles, Orbit } from 'lucide-react';
import { SystemMode } from '../types';

interface CurvedDiagnosticPanelProps {
  isSpeaking: boolean;
  isListening: boolean;
  systemMode: SystemMode;
  onSelectMode: (mode: SystemMode) => void;
  className?: string;
}

export const CurvedDiagnosticPanel: React.FC<CurvedDiagnosticPanelProps> = ({
  isSpeaking,
  isListening,
  systemMode,
  onSelectMode,
  className = '',
}) => {
  const waveCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Animated bar chart data (16 bars with dynamic heights matching photo)
  const [barHeights, setBarHeights] = useState<number[]>([
    25, 45, 30, 60, 40, 75, 55, 90, 70, 85, 45, 65, 35, 50, 80, 60,
  ]);

  // Telemetry metrics
  const [metrics, setMetrics] = useState({
    cpuLoad: 38,
    memoryUsage: 16.8,
    synapseBandwidth: 4.8,
    coherence: 99.8,
    fps: 60,
  });

  // Dynamic bar chart animation loop
  useEffect(() => {
    const interval = setInterval(() => {
      setBarHeights((prev) =>
        prev.map((h, i) => {
          const jitter = (Math.random() - 0.5) * (isSpeaking ? 30 : isListening ? 20 : 10);
          const target = Math.max(15, Math.min(95, h + jitter));
          return Math.round(target);
        })
      );

      setMetrics((prev) => ({
        cpuLoad: isSpeaking ? 62 + Math.floor(Math.random() * 12) : isListening ? 52 + Math.floor(Math.random() * 8) : 34 + Math.floor(Math.random() * 6),
        memoryUsage: Number((16.4 + Math.random() * 0.8).toFixed(1)),
        synapseBandwidth: Number((4.6 + Math.random() * 0.4).toFixed(2)),
        coherence: Number((99.6 + Math.random() * 0.3).toFixed(1)),
        fps: 59 + Math.floor(Math.random() * 2),
      }));
    }, 1200);

    return () => clearInterval(interval);
  }, [isSpeaking, isListening]);

  // Live Oscilloscope Waveform Canvas
  useEffect(() => {
    const canvas = waveCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let waveOffset = 0;

    const renderWave = () => {
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      waveOffset += isSpeaking ? 0.08 : isListening ? 0.05 : 0.025;

      // 3 layered harmonic sine waves (exact oscilloscope look in photo)
      const waves = [
        { freq: 0.04, amp: isSpeaking ? 16 : isListening ? 12 : 6, color: '#00f0ff', lineWidth: 1.8 },
        { freq: 0.07, amp: isSpeaking ? 12 : isListening ? 8 : 4, color: '#38bdf8', lineWidth: 1.2 },
        { freq: 0.11, amp: isSpeaking ? 8 : isListening ? 6 : 3, color: '#c084fc', lineWidth: 1.0 },
      ];

      waves.forEach((w, wIdx) => {
        ctx.beginPath();
        ctx.moveTo(0, height * 0.5);
        for (let x = 0; x < width; x += 2) {
          const sine = Math.sin(x * w.freq + waveOffset * (wIdx + 1));
          const cosine = Math.cos(x * w.freq * 0.6 - waveOffset * 0.8);
          const y = height * 0.5 + (sine + cosine * 0.4) * w.amp;
          ctx.lineTo(x, y);
        }
        ctx.strokeStyle = w.color;
        ctx.lineWidth = w.lineWidth;
        ctx.shadowColor = w.color;
        ctx.shadowBlur = isSpeaking ? 8 : 3;
        ctx.stroke();
      });

      animId = requestAnimationFrame(renderWave);
    };

    renderWave();
    return () => cancelAnimationFrame(animId);
  }, [isSpeaking, isListening]);

  return (
    <aside
      className={`h-full flex flex-col rounded-[22px] bg-[#020b1c]/80 border-[1.5px] border-cyan-400/60 backdrop-blur-md shadow-[0_0_35px_rgba(0,240,255,0.22),inset_0_0_20px_rgba(0,240,255,0.08)] p-3 sm:p-3.5 text-cyan-200 overflow-hidden relative select-none [transform:perspective(1000px)_rotateY(14deg)] transition-all hover:[transform:perspective(1000px)_rotateY(8deg)] duration-300 ${className}`}
      style={{
        boxShadow: '0 0 30px rgba(0, 240, 255, 0.25), inset 0 0 15px rgba(0, 240, 255, 0.06)',
      }}
    >
      {/* Curved Screen Glowing Edge Accents (Matches cylindrical screen edge highlight in photo) */}
      <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-300 to-transparent pointer-events-none z-10" />
      <div className="absolute bottom-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-300 to-transparent pointer-events-none z-10" />
      <div className="absolute inset-y-0 left-0 w-[2px] bg-gradient-to-b from-transparent via-cyan-400 to-transparent pointer-events-none z-10" />
      <div className="absolute inset-y-0 right-0 w-[2px] bg-gradient-to-b from-transparent via-cyan-400/50 to-transparent pointer-events-none z-10" />

      {/* Subtle Holographic Horizontal Scanline Texture */}
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_50%,rgba(0,240,255,0.025)_51%)] bg-[length:100%_4px] pointer-events-none z-0" />

      {/* 1. TOP HEADER & METRIC IDENTIFIER */}
      <div className="relative z-10 flex items-center justify-between pb-2 border-b border-cyan-500/30">
        <div className="flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 text-cyan-300 animate-pulse" />
          <span className="font-heading font-black text-xs tracking-wider text-cyan-100">
            DIAGNOSTIC MATRIX
          </span>
        </div>
        <span className="font-mono text-[9px] text-cyan-400/90 font-bold px-1.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/30">
          SYS-01 • LIVE
        </span>
      </div>

      {/* 2. PRIMARY VERTICAL BAR CHART (Direct match to Image_15 / IMG_20261013_145133.jpg) */}
      <div className="relative z-10 my-2 p-2 rounded-xl bg-[#010918]/85 border border-cyan-500/30 shadow-inner flex flex-col gap-1.5 shrink-0">
        <div className="flex items-center justify-between text-[9px] font-mono text-cyan-400">
          <span>NEURAL HARMONICS SPECTRUM</span>
          <span className="text-cyan-300 font-bold">{isSpeaking ? 'ACTIVE VOCAL' : 'RESONANCE 432Hz'}</span>
        </div>

        {/* 16 Vertical Glowing Bars */}
        <div className="h-20 w-full flex items-end justify-between gap-1 px-1 pt-2 pb-0.5 border-b border-cyan-500/20 bg-slate-950/60 rounded">
          {barHeights.map((h, idx) => (
            <div
              key={idx}
              className="flex-1 flex flex-col justify-end items-center h-full group"
            >
              <div
                className="w-full rounded-t-sm transition-all duration-300 relative shadow-[0_0_8px_rgba(0,240,255,0.6)]"
                style={{
                  height: `${h}%`,
                  background:
                    idx % 3 === 0
                      ? 'linear-gradient(to top, rgba(0,240,255,0.4), #ffffff)'
                      : 'linear-gradient(to top, rgba(0,240,255,0.3), #00f0ff)',
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* 3. OSCILLOSCOPE WAVEFORM SINE GRAPH (Matches middle wave in photo) */}
      <div className="relative z-10 my-1 p-2 rounded-xl bg-[#010918]/85 border border-cyan-500/30 shadow-inner flex flex-col gap-1 shrink-0">
        <div className="flex items-center justify-between text-[9px] font-mono text-cyan-400">
          <div className="flex items-center gap-1">
            <Radio className="w-2.5 h-2.5 text-cyan-300" />
            <span>WAVE OSCILLOSCOPE</span>
          </div>
          <span className="text-slate-400 text-[8px]">12ms QUANTUM BUS</span>
        </div>
        <canvas
          ref={waveCanvasRef}
          width={280}
          height={48}
          className="w-full h-12 rounded block bg-[#010614]/90 border border-cyan-500/20"
        />
      </div>

      {/* 4. SCROLLABLE TELEMETRY PARAMETERS TABLE (Matches data readout in photo) */}
      <div className="relative z-10 flex-1 min-h-0 overflow-y-auto no-scrollbar py-1 flex flex-col gap-1.5 font-mono text-[9px]">
        {/* Metric Row 1: Neural Load */}
        <div className="p-1.5 rounded-lg bg-[#031129]/80 border border-cyan-500/20 flex items-center justify-between">
          <span className="flex items-center gap-1 text-slate-300">
            <Cpu className="w-3 h-3 text-cyan-400" />
            <span>NEURAL LOAD</span>
          </span>
          <div className="flex items-center gap-1.5">
            <div className="w-16 h-1.5 bg-slate-900 rounded-full overflow-hidden border border-cyan-500/30">
              <div
                className="h-full bg-cyan-400 transition-all duration-500 rounded-full"
                style={{ width: `${metrics.cpuLoad}%` }}
              />
            </div>
            <span className="text-cyan-200 font-bold">{metrics.cpuLoad}%</span>
          </div>
        </div>

        {/* Metric Row 2: Quantum Memory */}
        <div className="p-1.5 rounded-lg bg-[#031129]/80 border border-cyan-500/20 flex items-center justify-between">
          <span className="flex items-center gap-1 text-slate-300">
            <Database className="w-3 h-3 text-cyan-400" />
            <span>QUANTUM RAM</span>
          </span>
          <span className="text-cyan-200 font-bold">{metrics.memoryUsage} GB / 32 GB</span>
        </div>

        {/* Metric Row 3: Synapse Coherence */}
        <div className="p-1.5 rounded-lg bg-[#031129]/80 border border-cyan-500/20 flex items-center justify-between">
          <span className="flex items-center gap-1 text-slate-300">
            <Sparkles className="w-3 h-3 text-cyan-400" />
            <span>COHERENCE</span>
          </span>
          <span className="text-emerald-300 font-bold">{metrics.coherence}%</span>
        </div>

        {/* Metric Row 4: VAD Silence Window */}
        <div className="p-1.5 rounded-lg bg-[#031129]/80 border border-cyan-500/20 flex items-center justify-between">
          <span className="text-slate-300">VAD THRESHOLD</span>
          <span className="text-cyan-300 font-bold">2.6 SEC (OPTIMAL)</span>
        </div>

        {/* Metric Row 5: Gemini Stream SSE */}
        <div className="p-1.5 rounded-lg bg-[#031129]/80 border border-cyan-500/20 flex items-center justify-between">
          <span className="text-slate-300">GEMINI ENGINE</span>
          <span className="text-cyan-300 font-bold">FLASH DUAL-SPEED</span>
        </div>
      </div>

      {/* 5. SECONDARY FREQUENCY DISTRIBUTION BAR GRAPH (Matches bottom bar chart in photo) */}
      <div className="relative z-10 pt-2 border-t border-cyan-500/25 shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <Orbit className="w-3 h-3 text-cyan-400 animate-spin" />
          <span className="font-mono text-[9px] text-cyan-300 font-bold">MODE: {systemMode}</span>
        </div>
        <div className="flex items-center gap-1">
          {(['NEURAL_FOCUS', 'OVERCLOCK', 'STEALTH', 'DIAGNOSTIC'] as SystemMode[]).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => onSelectMode(mode)}
              className={`px-1.5 py-0.5 rounded text-[8px] font-mono font-bold cursor-pointer transition-all ${
                systemMode === mode
                  ? 'bg-cyan-500/40 text-cyan-100 border border-cyan-400 shadow-[0_0_8px_rgba(0,240,255,0.4)]'
                  : 'text-slate-400 hover:text-cyan-300 bg-slate-900/60'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
};
