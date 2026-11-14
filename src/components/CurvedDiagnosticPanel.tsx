/**
 * CurvedDiagnosticPanel.tsx
 * Left Sci-Fi OS Telemetry Panel:
 * - Tabbed modular views: Architecture Map | Diagnostic Matrix | Agent & Room Nodes
 * - Real-time Audio Oscilloscope Wave & Harmonic Bar Graph
 * - Crisp tabular-nums telemetry and OS cognitive mode selector
 */

import React, { useEffect, useRef, useState } from 'react';
import { Activity, Cpu, Database, Network, Radio, Layers } from 'lucide-react';
import { MindMapNode, SystemMode } from '../types';
import { MiniArchitecturalMap } from './MiniArchitecturalMap';
import { audioSynth } from '../utils/audio';

interface CurvedDiagnosticPanelProps {
  isSpeaking: boolean;
  isListening: boolean;
  isThinking?: boolean;
  systemMode: SystemMode;
  onSelectMode: (mode: SystemMode) => void;
  nodes?: MindMapNode[];
  onSelectNode?: (node: MindMapNode) => void;
  memoriesCount?: number;
  className?: string;
}

const ROOM_TRACKING_NODES = [
  { id: 'room-voice', name: 'Voice & Audio Bus', zone: 'Room 01 · Duplex Mic', load: 'Active' },
  { id: 'room-neural', name: 'Neural Dialogue Core', zone: 'Room 02 · Gemini Stream', load: 'Synced' },
  { id: 'room-vision', name: 'Visual Hub Studio', zone: 'Room 03 · Media & Imagen', load: 'Ready' },
  { id: 'room-memory', name: 'Cognitive Vault', zone: 'Room 04 · Long-Term Memory', load: 'Indexed' },
];

export const CurvedDiagnosticPanel: React.FC<CurvedDiagnosticPanelProps> = ({
  isSpeaking,
  isListening,
  isThinking = false,
  systemMode,
  onSelectMode,
  nodes = [],
  onSelectNode,
  memoriesCount = 0,
  className = '',
}) => {
  const waveCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [panelTab, setPanelTab] = useState<'diagnostics' | 'map' | 'rooms'>('diagnostics');

  const [barHeights, setBarHeights] = useState<number[]>([
    28, 46, 34, 62, 42, 76, 54, 88, 68, 82, 48, 66, 38, 52, 78, 58,
  ]);

  const [metrics, setMetrics] = useState({
    cpuLoad: 36,
    memoryUsage: 16.6,
    coherence: 99.8,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setBarHeights((prev) =>
        prev.map((h) => {
          const jitter = (Math.random() - 0.5) * (isSpeaking ? 34 : isThinking ? 26 : isListening ? 22 : 10);
          return Math.round(Math.max(16, Math.min(95, h + jitter)));
        })
      );

      setMetrics({
        cpuLoad: isSpeaking
          ? 64 + Math.floor(Math.random() * 12)
          : isThinking
          ? 72 + Math.floor(Math.random() * 10)
          : isListening
          ? 50 + Math.floor(Math.random() * 10)
          : 32 + Math.floor(Math.random() * 6),
        memoryUsage: Number((16.4 + Math.random() * 0.6).toFixed(1)),
        coherence: Number((99.6 + Math.random() * 0.3).toFixed(1)),
      });
    }, 900);

    return () => clearInterval(interval);
  }, [isSpeaking, isListening, isThinking]);

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

      waveOffset += isSpeaking ? 0.09 : isThinking ? 0.07 : isListening ? 0.05 : 0.025;

      const waves = [
        { freq: 0.04, amp: isSpeaking ? 15 : isThinking ? 12 : isListening ? 11 : 5, color: '#00f0ff', lineWidth: 1.8 },
        { freq: 0.07, amp: isSpeaking ? 11 : isThinking ? 9 : isListening ? 7 : 3, color: '#38bdf8', lineWidth: 1.2 },
        { freq: 0.11, amp: isSpeaking ? 7 : isListening ? 5 : 2.5, color: '#10b981', lineWidth: 1.0 },
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
        ctx.stroke();
      });

      animId = requestAnimationFrame(renderWave);
    };

    renderWave();
    return () => cancelAnimationFrame(animId);
  }, [isSpeaking, isListening, isThinking]);

  const activeStateBadge = isListening
    ? 'LISTENING'
    : isThinking
    ? 'THINKING'
    : isSpeaking
    ? 'SPEAKING'
    : 'STANDBY';

  return (
    <aside
      className={`h-full flex flex-col rounded-2xl bg-[#040d1e]/90 border border-cyan-400/40 backdrop-blur-md shadow-[0_0_28px_rgba(0,240,255,0.14)] p-4 text-slate-100 overflow-hidden relative select-none ${className}`}
    >
      {/* Header & Module Switcher */}
      <div className="flex items-center justify-between gap-2 pb-3 border-b border-cyan-500/25 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <Activity className="w-4 h-4 text-cyan-400 shrink-0" />
          <h2 className="font-heading font-bold text-xs tracking-wider text-cyan-100 truncate">
            Diagnostic Matrix
          </h2>
        </div>

        <div className="flex items-center gap-1 p-0.5 rounded-lg bg-[#020814] border border-cyan-500/25 font-mono text-[11px] shrink-0">
          <button
            type="button"
            onClick={() => setPanelTab('diagnostics')}
            className={`px-2 py-1 rounded-md transition-colors cursor-pointer whitespace-nowrap ${
              panelTab === 'diagnostics' ? 'bg-cyan-500/30 text-white' : 'text-slate-400 hover:text-cyan-200'
            }`}
          >
            Matrix
          </button>
          <button
            type="button"
            onClick={() => setPanelTab('map')}
            className={`px-2 py-1 rounded-md transition-colors cursor-pointer whitespace-nowrap ${
              panelTab === 'map' ? 'bg-cyan-500/30 text-white' : 'text-slate-400 hover:text-cyan-200'
            }`}
          >
            Arch Map
          </button>
          <button
            type="button"
            onClick={() => setPanelTab('rooms')}
            className={`px-2 py-1 rounded-md transition-colors cursor-pointer whitespace-nowrap ${
              panelTab === 'rooms' ? 'bg-cyan-500/30 text-white' : 'text-slate-400 hover:text-cyan-200'
            }`}
          >
            Nodes
          </button>
        </div>
      </div>

      {/* Main Tabbed Content */}
      <div className="flex-1 min-h-0 flex flex-col gap-3 pt-3 overflow-y-auto no-scrollbar">
        {panelTab === 'map' && (
          <div className="flex-1 min-h-[260px]">
            <MiniArchitecturalMap isSpeaking={isSpeaking} isListening={isListening} className="w-full h-full" />
          </div>
        )}

        {panelTab === 'rooms' && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between text-xs font-mono text-cyan-300">
              <span className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" />
                <span>Agent & Room Tracking</span>
              </span>
              <span className="tabular-nums text-slate-400">{ROOM_TRACKING_NODES.length + nodes.length} Active</span>
            </div>

            <div className="divide-y divide-cyan-500/15 border border-cyan-500/25 rounded-xl bg-[#020816]/80">
              {ROOM_TRACKING_NODES.map((room) => (
                <div key={room.id} className="px-3 py-2.5 flex items-center justify-between gap-2 text-xs">
                  <div className="min-w-0">
                    <div className="font-medium text-cyan-100 truncate">{room.name}</div>
                    <div className="text-[11px] font-mono text-slate-400 truncate">{room.zone}</div>
                  </div>
                  <span className="text-[11px] font-mono text-emerald-300 shrink-0">{room.load}</span>
                </div>
              ))}
            </div>

            {nodes.length > 0 && (
              <div className="flex flex-col gap-1.5">
                <div className="text-[11px] font-mono text-slate-400">Workspace Nodes</div>
                <div className="divide-y divide-cyan-500/15 border border-cyan-500/20 rounded-xl bg-[#020816]/70">
                  {nodes.slice(0, 5).map((node) => (
                    <button
                      key={node.id}
                      type="button"
                      onClick={() => {
                        audioSynth.playClick();
                        onSelectNode?.(node);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-cyan-950/50 transition-colors flex items-center justify-between gap-2 cursor-pointer text-xs"
                    >
                      <span className="text-cyan-100 truncate">{node.label}</span>
                      <span className="text-[11px] font-mono text-cyan-400 shrink-0">{node.status}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {panelTab === 'diagnostics' && (
          <>
            {/* Harmonic Spectrum */}
            <div className="p-3 rounded-xl bg-[#020816]/85 border border-cyan-500/25 flex flex-col gap-2 shrink-0">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">Harmonic Spectrum</span>
                <span className="text-cyan-300 font-semibold">{activeStateBadge}</span>
              </div>

              <div className="h-20 w-full flex items-end justify-between gap-1 px-1 pt-2 border-b border-cyan-500/20">
                {barHeights.map((h, idx) => (
                  <div key={idx} className="flex-1 flex flex-col justify-end h-full">
                    <div
                      className="w-full rounded-t-sm transition-all duration-300"
                      style={{
                        height: `${h}%`,
                        background:
                          idx % 3 === 0
                            ? 'linear-gradient(to top, rgba(0,240,255,0.35), #e0f2fe)'
                            : 'linear-gradient(to top, rgba(0,240,255,0.25), #00f0ff)',
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Oscilloscope Waveform */}
            <div className="p-3 rounded-xl bg-[#020816]/85 border border-cyan-500/25 flex flex-col gap-1.5 shrink-0">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="flex items-center gap-1.5 text-slate-400">
                  <Radio className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Audio Oscilloscope</span>
                </span>
                <span className="text-cyan-300 tabular-nums">48 kHz</span>
              </div>
              <canvas
                ref={waveCanvasRef}
                width={280}
                height={52}
                className="w-full h-13 rounded-lg block bg-[#010510] border border-cyan-500/20"
              />
            </div>

            {/* Mini Architecture Preview */}
            <div className="h-48 shrink-0">
              <MiniArchitecturalMap isSpeaking={isSpeaking} isListening={isListening} className="w-full h-full" />
            </div>

            {/* Tabular Telemetry Readout */}
            <div className="divide-y divide-cyan-500/15 border border-cyan-500/20 rounded-xl bg-[#020816]/80 font-mono text-xs shrink-0">
              <div className="px-3 py-2 flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-slate-400">
                  <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Neural Load</span>
                </span>
                <span className="text-cyan-200 font-semibold tabular-nums">{metrics.cpuLoad}%</span>
              </div>
              <div className="px-3 py-2 flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-slate-400">
                  <Database className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Memory Pool</span>
                </span>
                <span className="text-cyan-200 font-semibold tabular-nums">
                  {metrics.memoryUsage} GB · {memoriesCount} Saved
                </span>
              </div>
              <div className="px-3 py-2 flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-slate-400">
                  <Network className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Sync Stability</span>
                </span>
                <span className="text-emerald-300 font-semibold tabular-nums">{metrics.coherence}%</span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Footer OS Mode Selector */}
      <div className="pt-3 mt-2 border-t border-cyan-500/25 shrink-0 flex items-center justify-between gap-2">
        <span className="font-mono text-[11px] text-slate-400 shrink-0">OS Mode</span>
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
          {(['NEURAL_FOCUS', 'OVERCLOCK', 'STEALTH', 'DIAGNOSTIC'] as SystemMode[]).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => {
                audioSynth.playClick();
                onSelectMode(mode);
              }}
              className={`px-2 py-1 rounded-md text-[10px] font-mono cursor-pointer transition-colors whitespace-nowrap shrink-0 ${
                systemMode === mode
                  ? 'bg-cyan-500/35 text-white border border-cyan-400/60'
                  : 'text-slate-400 hover:text-cyan-200 bg-[#020816]'
              }`}
            >
              {mode.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
};
