/**
 * FloatingCyberneticModules.tsx
 * Central Sci-Fi OS Dashboard Stage:
 * - Central glowing particle AI Core Sphere ("TARA") with Thinking / Speaking / Listening states
 * - Modular floating corner panels: Core Status, Visual Hub, Agent/Room Tracker, Voice & Mode Settings
 * - Glowing SVG vector traces connecting the central core to all modular panels
 */

import React from 'react';
import { AiCoreOrb } from './AiCoreOrb';
import {
  Cpu,
  Radio,
  Music,
  Calculator,
  Brain,
  Sliders,
  Camera,
  LayoutGrid,
  Layers,
} from 'lucide-react';
import { MindMapNode, SystemMode, TaraEmotion } from '../types';
import { audioSynth } from '../utils/audio';

interface FloatingCyberneticModulesProps {
  isSpeaking: boolean;
  isListening: boolean;
  isThinking?: boolean;
  isHandsFreeMode: boolean;
  currentEmotion?: TaraEmotion;
  systemMode: SystemMode;
  onSelectSystemMode: (mode: SystemMode) => void;
  onToggleVoice: () => void;
  onTriggerIndiaNews: () => void;
  onOpenMusicPlayer: () => void;
  onOpenRatesTable: () => void;
  onOpenCalculator: () => void;
  onOpenMemoryVault: () => void;
  onOpenVisualHub?: () => void;
  onUploadPhoto?: () => void;
  nodes?: MindMapNode[];
  onSelectNode?: (node: MindMapNode) => void;
  className?: string;
}

export const FloatingCyberneticModules: React.FC<FloatingCyberneticModulesProps> = ({
  isSpeaking,
  isListening,
  isThinking = false,
  isHandsFreeMode,
  currentEmotion = 'calm_caring',
  systemMode,
  onSelectSystemMode,
  onToggleVoice,
  onTriggerIndiaNews,
  onOpenMusicPlayer,
  onOpenRatesTable,
  onOpenCalculator,
  onOpenMemoryVault,
  onOpenVisualHub,
  onUploadPhoto,
  nodes = [],
  onSelectNode,
  className = '',
}) => {
  return (
    <div className={`relative w-full h-full flex items-center justify-center overflow-hidden select-none ${className}`}>
      {/* SVG Vector Connecting Traces */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-10 hidden xl:block">
        <defs>
          <linearGradient id="coreLineGrad" x1="50%" y1="50%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#00f0ff" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#0284c7" stopOpacity="0.15" />
          </linearGradient>
        </defs>

        <line x1="50%" y1="48%" x2="19%" y2="16%" stroke="rgba(0, 240, 255, 0.25)" strokeWidth="1.2" strokeDasharray="6, 8" />
        <line x1="50%" y1="48%" x2="81%" y2="16%" stroke="rgba(0, 240, 255, 0.25)" strokeWidth="1.2" strokeDasharray="6, 8" />
        <line x1="50%" y1="48%" x2="19%" y2="84%" stroke="rgba(0, 240, 255, 0.25)" strokeWidth="1.2" strokeDasharray="6, 8" />
        <line x1="50%" y1="48%" x2="81%" y2="84%" stroke="rgba(0, 240, 255, 0.25)" strokeWidth="1.2" strokeDasharray="6, 8" />
      </svg>

      {/* Central Glowing Energy Sphere */}
      <div className="absolute inset-0 flex items-center justify-center z-0 pointer-events-auto">
        <AiCoreOrb
          isSpeaking={isSpeaking}
          isListening={isListening}
          isThinking={isThinking}
          isHandsFreeMode={isHandsFreeMode}
          currentEmotion={currentEmotion}
          onTapCore={onToggleVoice}
          className="w-full h-full max-w-[580px] max-h-[580px]"
        />
      </div>

      {/* Module 1 (Top-Left): Core Neural Telemetry */}
      <div className="hidden xl:flex absolute top-12 left-3 z-20 w-56 flex-col gap-2 p-3 rounded-xl bg-[#040d1e]/85 border border-cyan-500/35 backdrop-blur-md">
        <div className="flex items-center justify-between pb-1.5 border-b border-cyan-500/20">
          <span className="flex items-center gap-1.5 font-heading font-bold text-xs text-cyan-100">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span>Core State</span>
          </span>
          <span className="text-[11px] font-mono text-cyan-300">
            {isListening ? 'Mic On' : isThinking ? 'Thinking' : isSpeaking ? 'Speaking' : 'Standby'}
          </span>
        </div>

        <div className="space-y-1.5 font-mono text-[11px]">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Voice Loop</span>
            <span className={isHandsFreeMode ? 'text-emerald-300' : 'text-slate-300'}>
              {isHandsFreeMode ? 'Hands-Free' : 'Tap Core'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Audio Engine</span>
            <span className="text-cyan-300">Hindi / EN TTS</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Creator</span>
            <span className="text-slate-200 truncate">Brijmohan Kumar</span>
          </div>
        </div>
      </div>

      {/* Module 2 (Top-Right): Visual Hub & Quick Apps */}
      <div className="hidden xl:flex absolute top-12 right-3 z-20 w-60 flex-col gap-2 p-3 rounded-xl bg-[#040d1e]/85 border border-cyan-500/35 backdrop-blur-md">
        <div className="flex items-center justify-between pb-1.5 border-b border-cyan-500/20">
          <span className="flex items-center gap-1.5 font-heading font-bold text-xs text-cyan-100">
            <LayoutGrid className="w-3.5 h-3.5 text-cyan-400" />
            <span>Visual Hub</span>
          </span>
          {onOpenVisualHub && (
            <button
              type="button"
              onClick={() => {
                audioSynth.playClick();
                onOpenVisualHub();
              }}
              className="text-[11px] font-mono text-cyan-300 hover:text-white cursor-pointer"
            >
              All Apps
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-1.5 font-mono text-[11px]">
          {onUploadPhoto && (
            <button
              type="button"
              onClick={() => {
                audioSynth.playClick();
                onUploadPhoto();
              }}
              className="px-2 py-1.5 rounded-lg bg-[#020816] hover:bg-cyan-950/70 border border-cyan-500/25 text-cyan-200 flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Camera className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span className="truncate">फ़ोटो</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              audioSynth.playClick();
              onOpenMemoryVault();
            }}
            className="px-2 py-1.5 rounded-lg bg-[#020816] hover:bg-cyan-950/70 border border-cyan-500/25 text-cyan-200 flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Brain className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span className="truncate">मेमोरी</span>
          </button>

          <button
            type="button"
            onClick={() => {
              audioSynth.playClick();
              onOpenMusicPlayer();
            }}
            className="px-2 py-1.5 rounded-lg bg-[#020816] hover:bg-cyan-950/70 border border-cyan-500/25 text-cyan-200 flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Music className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span className="truncate">म्यूजिक</span>
          </button>

          <button
            type="button"
            onClick={() => {
              audioSynth.playClick();
              onOpenCalculator();
            }}
            className="px-2 py-1.5 rounded-lg bg-[#020816] hover:bg-cyan-950/70 border border-cyan-500/25 text-cyan-200 flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Calculator className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span className="truncate">हिसाब</span>
          </button>

          <button
            type="button"
            onClick={() => {
              audioSynth.playClick();
              onTriggerIndiaNews();
            }}
            className="px-2 py-1.5 rounded-lg bg-[#020816] hover:bg-cyan-950/70 border border-cyan-500/25 text-cyan-200 flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Radio className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span className="truncate">समाचार</span>
          </button>

          <button
            type="button"
            onClick={() => {
              audioSynth.playClick();
              onOpenRatesTable();
            }}
            className="px-2 py-1.5 rounded-lg bg-[#020816] hover:bg-cyan-950/70 border border-cyan-500/25 text-cyan-200 flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <LayoutGrid className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span className="truncate">दर तालिका</span>
          </button>
        </div>
      </div>

      {/* Module 3 (Bottom-Left): Agent & Room Tracking Nodes */}
      <div className="hidden xl:flex absolute bottom-3 left-3 z-20 w-56 flex-col gap-2 p-3 rounded-xl bg-[#040d1e]/85 border border-cyan-500/35 backdrop-blur-md">
        <div className="flex items-center justify-between pb-1.5 border-b border-cyan-500/20">
          <span className="flex items-center gap-1.5 font-heading font-bold text-xs text-cyan-100">
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span>Agent Nodes</span>
          </span>
          <span className="text-[11px] font-mono text-emerald-300 tabular-nums">{nodes.length || 3} Linked</span>
        </div>

        <div className="space-y-1 font-mono text-[11px]">
          {(nodes.length > 0 ? nodes.slice(0, 3) : [
            { id: 'n1', label: 'Voice Companion', status: 'active' },
            { id: 'n2', label: 'Vision Analyzer', status: 'idle' },
            { id: 'n3', label: 'Memory Tracker', status: 'active' },
          ]).map((n: any) => (
            <button
              key={n.id}
              type="button"
              onClick={() => {
                if (nodes.length > 0 && onSelectNode) {
                  audioSynth.playClick();
                  onSelectNode(n);
                }
              }}
              className="w-full text-left flex items-center justify-between py-0.5 hover:text-white transition-colors cursor-pointer"
            >
              <span className="text-slate-300 truncate">{n.label}</span>
              <span className={n.status === 'active' || n.status === 'running' ? 'text-cyan-300' : 'text-slate-400'}>
                {n.status}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Module 4 (Bottom-Right): OS System Modes */}
      <div className="hidden xl:flex absolute bottom-3 right-3 z-20 w-60 flex-col gap-2 p-3 rounded-xl bg-[#040d1e]/85 border border-cyan-500/35 backdrop-blur-md">
        <div className="flex items-center justify-between pb-1.5 border-b border-cyan-500/20">
          <span className="flex items-center gap-1.5 font-heading font-bold text-xs text-cyan-100">
            <Sliders className="w-3.5 h-3.5 text-cyan-400" />
            <span>OS Matrix Mode</span>
          </span>
        </div>

        <div className="grid grid-cols-2 gap-1.5 font-mono text-[11px]">
          {(['NEURAL_FOCUS', 'OVERCLOCK', 'STEALTH', 'DIAGNOSTIC'] as SystemMode[]).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => {
                audioSynth.playClick();
                onSelectSystemMode(mode);
              }}
              className={`px-2 py-1.5 rounded-lg cursor-pointer transition-colors text-center truncate ${
                systemMode === mode
                  ? 'bg-cyan-500/35 text-white border border-cyan-400/60'
                  : 'bg-[#020816] text-slate-400 hover:text-cyan-200 border border-cyan-500/20'
              }`}
            >
              {mode.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
