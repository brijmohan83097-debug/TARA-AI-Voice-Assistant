/**
 * MiniArchitecturalMap.tsx
 * Interactive Architectural & System Topology Map for TARA HUD.
 * Renders high-tech node network with glowing vector pathways,
 * packet animations, and live telemetry stats.
 */

import React, { useState } from 'react';
import { Network, Server, Cpu, Radio, ShieldCheck, Database, Zap, Activity } from 'lucide-react';
import { audioSynth } from '../utils/audio';

interface ArchNode {
  id: string;
  label: string;
  sublabel: string;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  type: 'core' | 'ai' | 'client' | 'storage' | 'speech';
  status: 'online' | 'active' | 'syncing';
  latency: string;
}

const ARCH_NODES: ArchNode[] = [
  {
    id: 'core',
    label: 'TARA CORE',
    sublabel: 'Central Neural Gateway',
    x: 50,
    y: 46,
    type: 'core',
    status: 'active',
    latency: '0ms',
  },
  {
    id: 'client',
    label: 'DELHI HQ',
    sublabel: 'Boss Terminal (Brijmohan)',
    x: 18,
    y: 20,
    type: 'client',
    status: 'online',
    latency: '12ms',
  },
  {
    id: 'gemini',
    label: 'GEMINI FLASH',
    sublabel: 'Dual-Speed LLM Engine',
    x: 82,
    y: 20,
    type: 'ai',
    status: 'online',
    latency: '85ms',
  },
  {
    id: 'speech',
    label: 'SPEECH BUS',
    sublabel: 'Hindi/EN Synth Engine',
    x: 18,
    y: 78,
    type: 'speech',
    status: 'online',
    latency: '4ms',
  },
  {
    id: 'vault',
    label: 'MEMORY VAULT',
    sublabel: 'Cognitive Vector Store',
    x: 82,
    y: 78,
    type: 'storage',
    status: 'syncing',
    latency: '18ms',
  },
];

const CONNECTIONS = [
  { from: 'client', to: 'core' },
  { from: 'gemini', to: 'core' },
  { from: 'speech', to: 'core' },
  { from: 'vault', to: 'core' },
  { from: 'client', to: 'speech' },
];

export const MiniArchitecturalMap: React.FC<{ isSpeaking: boolean; isListening: boolean; className?: string }> = ({
  isSpeaking,
  isListening,
  className = '',
}) => {
  const [selectedNode, setSelectedNode] = useState<ArchNode>(ARCH_NODES[0]);

  return (
    <div className={`flex flex-col h-full bg-[#010918]/90 rounded-xl border border-cyan-500/30 p-2.5 relative select-none overflow-hidden ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between pb-1.5 border-b border-cyan-500/25 mb-1.5">
        <div className="flex items-center gap-1.5">
          <Network className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <span className="font-heading font-black text-[11px] tracking-wider text-cyan-100">
            SYSTEM ARCHITECTURE MAP
          </span>
        </div>
        <div className="flex items-center gap-1 text-[8px] font-mono text-cyan-400 bg-cyan-950/70 px-2 py-0.5 rounded border border-cyan-500/30">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          <span>TOPOLOGY SYNCED</span>
        </div>
      </div>

      {/* SVG Interactive Topology Canvas */}
      <div className="relative flex-1 min-h-[160px] w-full rounded-lg bg-[#020612]/95 border border-cyan-500/20 overflow-hidden flex items-center justify-center">
        {/* Subtle background tech grid */}
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(0, 240, 255, 0.25) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(0, 240, 255, 0.25) 1px, transparent 1px)
            `,
            backgroundSize: '20px 20px',
          }}
        />

        {/* SVG Vector Connection Lines with Animated Pulses */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <defs>
            <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00f0ff" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#c084fc" stopOpacity="0.8" />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {CONNECTIONS.map((c, i) => {
            const fromNode = ARCH_NODES.find((n) => n.id === c.from)!;
            const toNode = ARCH_NODES.find((n) => n.id === c.to)!;
            return (
              <g key={i}>
                {/* Background base wire */}
                <line
                  x1={`${fromNode.x}%`}
                  y1={`${fromNode.y}%`}
                  x2={`${toNode.x}%`}
                  y2={`${toNode.y}%`}
                  stroke="rgba(0, 240, 255, 0.2)"
                  strokeWidth="1.5"
                />
                {/* Animated data packet line */}
                <line
                  x1={`${fromNode.x}%`}
                  y1={`${fromNode.y}%`}
                  x2={`${toNode.x}%`}
                  y2={`${toNode.y}%`}
                  stroke="url(#lineGrad)"
                  strokeWidth="2"
                  strokeDasharray="6, 8"
                  filter="url(#glow)"
                  className="animate-[pulse_1.5s_ease-in-out_infinite]"
                  style={{
                    strokeDashoffset: isSpeaking ? 16 : isListening ? 8 : 4,
                  }}
                />
              </g>
            );
          })}
        </svg>

        {/* Interactive System Nodes */}
        {ARCH_NODES.map((node) => {
          const isSelected = selectedNode.id === node.id;
          const isCore = node.id === 'core';

          return (
            <div
              key={node.id}
              onClick={() => {
                audioSynth.playSciFiClick();
                setSelectedNode(node);
              }}
              style={{
                left: `${node.x}%`,
                top: `${node.y}%`,
                transform: 'translate(-50%, -50%)',
              }}
              className={`absolute cursor-pointer transition-all duration-300 group z-10 flex flex-col items-center ${
                isSelected ? 'scale-110' : 'hover:scale-105'
              }`}
            >
              {/* Node Icon Circle */}
              <div
                className={`relative flex items-center justify-center rounded-full transition-all ${
                  isCore
                    ? isSpeaking
                      ? 'w-11 h-11 bg-cyan-950/90 border-2 border-cyan-300 shadow-[0_0_20px_rgba(0,240,255,0.9)] animate-pulse'
                      : isListening
                      ? 'w-11 h-11 bg-rose-950/90 border-2 border-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.9)] animate-pulse'
                      : 'w-10 h-10 bg-[#03152e]/90 border-2 border-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.6)]'
                    : isSelected
                    ? 'w-8 h-8 bg-cyan-900/90 border-2 border-cyan-300 shadow-[0_0_12px_rgba(0,240,255,0.7)]'
                    : 'w-7 h-7 bg-slate-950/80 border border-cyan-500/40 hover:border-cyan-300 shadow-md'
                }`}
              >
                {node.type === 'core' && <Zap className="w-4 h-4 text-cyan-300 animate-pulse" />}
                {node.type === 'client' && <Server className="w-3.5 h-3.5 text-cyan-400" />}
                {node.type === 'ai' && <Cpu className="w-3.5 h-3.5 text-cyan-300" />}
                {node.type === 'speech' && <Radio className="w-3.5 h-3.5 text-cyan-400" />}
                {node.type === 'storage' && <Database className="w-3.5 h-3.5 text-purple-400" />}

                {/* Status Dot */}
                <span
                  className={`absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full border border-slate-950 ${
                    node.status === 'active'
                      ? 'bg-cyan-400 animate-ping'
                      : node.status === 'online'
                      ? 'bg-emerald-400'
                      : 'bg-amber-400'
                  }`}
                />
              </div>

              {/* Node Label */}
              <span
                className={`mt-1 font-mono text-[8px] font-bold tracking-wider px-1.5 py-0.5 rounded backdrop-blur-md transition-colors ${
                  isSelected
                    ? 'bg-cyan-500/30 text-white border border-cyan-400 shadow-sm'
                    : 'bg-slate-950/70 text-cyan-300 border border-cyan-500/20 group-hover:text-white'
                }`}
              >
                {node.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Selected Node Details Bar */}
      <div className="mt-1.5 p-1.5 rounded-lg bg-[#020a1a] border border-cyan-500/25 flex items-center justify-between text-[9px] font-mono">
        <div className="flex items-center gap-1.5">
          <Activity className="w-3 h-3 text-cyan-400 animate-pulse" />
          <span className="text-cyan-200 font-bold">{selectedNode.label}:</span>
          <span className="text-slate-300">{selectedNode.sublabel}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-emerald-300 font-bold">{selectedNode.latency}</span>
          <span className="text-[8px] text-cyan-400/80 uppercase px-1 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/30">
            {selectedNode.status}
          </span>
        </div>
      </div>
    </div>
  );
};
