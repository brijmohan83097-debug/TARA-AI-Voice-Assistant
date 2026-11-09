/**
 * FloatingCyberneticModules.tsx
 * Multi-Module Futuristic Dashboard Center Stage:
 * - Central high-tech concentric particle AI Core Orb ("START AI").
 * - 4 Modular floating glassmorphism control panels (Nodes, Skills, Vision, Settings).
 * - Glowing SVG vector connecting lines with animated data pulses linking the core to the panels.
 */

import React from 'react';
import { 
  AiCoreOrb 
} from './AiCoreOrb';
import { 
  Cpu, 
  Sparkles, 
  Radio, 
  Music, 
  Calculator, 
  Brain, 
  ShieldCheck, 
  Eye, 
  Sliders, 
  Activity, 
  Zap, 
  Database,
  Lock
} from 'lucide-react';
import { SystemMode, TaraEmotion } from '../types';
import { audioSynth } from '../utils/audio';

interface FloatingCyberneticModulesProps {
  isSpeaking: boolean;
  isListening: boolean;
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
  className?: string;
}

export const FloatingCyberneticModules: React.FC<FloatingCyberneticModulesProps> = ({
  isSpeaking,
  isListening,
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
  className = '',
}) => {
  return (
    <div className={`relative w-full h-full flex items-center justify-center overflow-hidden select-none ${className}`}>
      {/* =====================================================================
          1. GLOWING SVG VECTOR CONNECTING LINES
          Traces linking the Central AI Core to the 4 floating modular panels
          ===================================================================== */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-10 hidden md:block">
        <defs>
          <linearGradient id="coreLineGrad" x1="50%" y1="50%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#00f0ff" stopOpacity="0.9" />
            <stop offset="60%" stopColor="#0284c7" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#0369a1" stopOpacity="0.1" />
          </linearGradient>
          <filter id="coreGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Vector Line 1: Center to Top-Left (Nodes Module) */}
        <line
          x1="50%"
          y1="50%"
          x2="22%"
          y2="18%"
          stroke="rgba(0, 240, 255, 0.25)"
          strokeWidth="1.5"
        />
        <line
          x1="50%"
          y1="50%"
          x2="22%"
          y2="18%"
          stroke="url(#coreLineGrad)"
          strokeWidth="2"
          strokeDasharray="8, 12"
          filter="url(#coreGlow)"
          className="animate-[pulse_2s_ease-in-out_infinite]"
        />

        {/* Vector Line 2: Center to Top-Right (Skills Module) */}
        <line
          x1="50%"
          y1="50%"
          x2="78%"
          y2="18%"
          stroke="rgba(0, 240, 255, 0.25)"
          strokeWidth="1.5"
        />
        <line
          x1="50%"
          y1="50%"
          x2="78%"
          y2="18%"
          stroke="url(#coreLineGrad)"
          strokeWidth="2"
          strokeDasharray="8, 12"
          filter="url(#coreGlow)"
          className="animate-[pulse_2s_ease-in-out_infinite]"
        />

        {/* Vector Line 3: Center to Bottom-Left (Vision Module) */}
        <line
          x1="50%"
          y1="50%"
          x2="22%"
          y2="82%"
          stroke="rgba(0, 240, 255, 0.25)"
          strokeWidth="1.5"
        />
        <line
          x1="50%"
          y1="50%"
          x2="22%"
          y2="82%"
          stroke="url(#coreLineGrad)"
          strokeWidth="2"
          strokeDasharray="8, 12"
          filter="url(#coreGlow)"
          className="animate-[pulse_2s_ease-in-out_infinite]"
        />

        {/* Vector Line 4: Center to Bottom-Right (Settings Module) */}
        <line
          x1="50%"
          y1="50%"
          x2="78%"
          y2="82%"
          stroke="rgba(0, 240, 255, 0.25)"
          strokeWidth="1.5"
        />
        <line
          x1="50%"
          y1="50%"
          x2="78%"
          y2="82%"
          stroke="url(#coreLineGrad)"
          strokeWidth="2"
          strokeDasharray="8, 12"
          filter="url(#coreGlow)"
          className="animate-[pulse_2s_ease-in-out_infinite]"
        />
      </svg>

      {/* =====================================================================
          2. CENTRAL AI CORE ORB ("START AI" ENERGY SPHERE)
          ===================================================================== */}
      <div className="absolute inset-0 flex items-center justify-center z-0 pointer-events-auto">
        <AiCoreOrb
          isSpeaking={isSpeaking}
          isListening={isListening}
          isHandsFreeMode={isHandsFreeMode}
          currentEmotion={currentEmotion}
          onTapCore={onToggleVoice}
          className="w-full h-full max-w-[620px] max-h-[620px]"
        />
      </div>

      {/* =====================================================================
          3. FLOATING CYBERNETIC CONTROL PANELS (4 SURROUNDING CORNERS)
          Glassmorphism cards with glowing neon borders
          ===================================================================== */}

      {/* MODULE 01 (TOP-LEFT): NEURAL NODES */}
      <div className="hidden md:flex absolute top-4 left-4 z-20 w-56 flex-col gap-1.5 p-2.5 rounded-2xl bg-[#020919]/80 border border-cyan-500/40 backdrop-blur-md shadow-[0_0_25px_rgba(0,240,255,0.18)] transition-all hover:border-cyan-300 hover:shadow-[0_0_35px_rgba(0,240,255,0.3)]">
        <div className="flex items-center justify-between pb-1 border-b border-cyan-500/25">
          <div className="flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span className="font-heading font-black text-[10px] tracking-wider text-cyan-100 uppercase">
              MODULE 01: NODES
            </span>
          </div>
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
        </div>

        <div className="space-y-1 font-mono text-[9px]">
          <div className="flex items-center justify-between p-1 rounded bg-[#010614]/80 border border-cyan-500/15">
            <span className="text-slate-300">GEMINI REASONING</span>
            <span className="text-cyan-300 font-bold">ONLINE</span>
          </div>
          <div className="flex items-center justify-between p-1 rounded bg-[#010614]/80 border border-cyan-500/15">
            <span className="text-slate-300">AUDIO DSP 48kHz</span>
            <span className="text-emerald-400 font-bold">{isSpeaking ? 'VOCAL' : isListening ? 'INPUT' : 'IDLE'}</span>
          </div>
          <div className="flex items-center justify-between p-1 rounded bg-[#010614]/80 border border-cyan-500/15">
            <span className="text-slate-300">SYNAPSE COHERENCE</span>
            <span className="text-cyan-300 font-bold">99.8%</span>
          </div>
        </div>
      </div>

      {/* MODULE 02 (TOP-RIGHT): SKILLS MATRIX */}
      <div className="hidden md:flex absolute top-4 right-4 z-20 w-56 flex-col gap-1.5 p-2.5 rounded-2xl bg-[#020919]/80 border border-cyan-500/40 backdrop-blur-md shadow-[0_0_25px_rgba(0,240,255,0.18)] transition-all hover:border-cyan-300 hover:shadow-[0_0_35px_rgba(0,240,255,0.3)]">
        <div className="flex items-center justify-between pb-1 border-b border-cyan-500/25">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
            <span className="font-heading font-black text-[10px] tracking-wider text-cyan-100 uppercase">
              MODULE 02: SKILLS
            </span>
          </div>
          <span className="font-mono text-[8px] text-cyan-400 font-bold px-1.5 py-0.5 rounded bg-cyan-950/80">
            READY
          </span>
        </div>

        <div className="grid grid-cols-2 gap-1 font-mono text-[9px]">
          <button
            type="button"
            onClick={() => {
              audioSynth.playSciFiClick();
              onOpenRatesTable();
            }}
            className="p-1 rounded bg-[#010614]/90 hover:bg-cyan-950/60 border border-cyan-500/25 text-cyan-300 hover:text-white flex items-center gap-1 cursor-pointer transition-all"
            title="फैब्रिकेशन रेट्स तालिका"
          >
            <Calculator className="w-3 h-3 text-cyan-400" />
            <span className="truncate">रेट्स गणना</span>
          </button>

          <button
            type="button"
            onClick={() => {
              audioSynth.playSciFiClick();
              onTriggerIndiaNews();
            }}
            className="p-1 rounded bg-[#010614]/90 hover:bg-cyan-950/60 border border-cyan-500/25 text-cyan-300 hover:text-white flex items-center gap-1 cursor-pointer transition-all"
            title="ताज़ा समाचार"
          >
            <Radio className="w-3 h-3 text-red-400" />
            <span className="truncate">समाचार</span>
          </button>

          <button
            type="button"
            onClick={() => {
              audioSynth.playSciFiClick();
              onOpenMusicPlayer();
            }}
            className="p-1 rounded bg-[#010614]/90 hover:bg-cyan-950/60 border border-cyan-500/25 text-cyan-300 hover:text-white flex items-center gap-1 cursor-pointer transition-all"
            title="म्यूजिक प्लेयर"
          >
            <Music className="w-3 h-3 text-amber-400" />
            <span className="truncate">म्यूजिक</span>
          </button>

          <button
            type="button"
            onClick={() => {
              audioSynth.playSciFiClick();
              onOpenMemoryVault();
            }}
            className="p-1 rounded bg-[#010614]/90 hover:bg-cyan-950/60 border border-cyan-500/25 text-cyan-300 hover:text-white flex items-center gap-1 cursor-pointer transition-all"
            title="मेमोरी वॉल्ट"
          >
            <Brain className="w-3 h-3 text-purple-400" />
            <span className="truncate">मेमोरी</span>
          </button>
        </div>
      </div>

      {/* MODULE 03 (BOTTOM-LEFT): SENSOR & VISION HUD */}
      <div className="hidden md:flex absolute bottom-4 left-4 z-20 w-56 flex-col gap-1.5 p-2.5 rounded-2xl bg-[#020919]/80 border border-cyan-500/40 backdrop-blur-md shadow-[0_0_25px_rgba(0,240,255,0.18)] transition-all hover:border-cyan-300 hover:shadow-[0_0_35px_rgba(0,240,255,0.3)]">
        <div className="flex items-center justify-between pb-1 border-b border-cyan-500/25">
          <div className="flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span className="font-heading font-black text-[10px] tracking-wider text-cyan-100 uppercase">
              MODULE 03: VISION
            </span>
          </div>
          <span className="font-mono text-[8px] text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-500/30">
            SECURE
          </span>
        </div>

        <div className="space-y-1 font-mono text-[9px]">
          <div className="flex items-center justify-between p-1 rounded bg-[#010614]/80 border border-cyan-500/15">
            <span className="text-slate-300">SUBJECT ID</span>
            <span className="text-cyan-200 font-bold truncate">MR. BRIJMOHAN</span>
          </div>
          <div className="flex items-center justify-between p-1 rounded bg-[#010614]/80 border border-cyan-500/15">
            <span className="text-slate-300">BIOMETRIC LEVEL</span>
            <span className="text-emerald-300 font-bold">5 (OWNER)</span>
          </div>
          <div className="flex items-center justify-between p-1 rounded bg-[#010614]/80 border border-cyan-500/15">
            <span className="text-slate-300">ENCRYPTION</span>
            <span className="text-cyan-300 font-bold">AES-256 GCM</span>
          </div>
        </div>
      </div>

      {/* MODULE 04 (BOTTOM-RIGHT): QUANTUM SETTINGS & TELEMETRY */}
      <div className="hidden md:flex absolute bottom-4 right-4 z-20 w-56 flex-col gap-1.5 p-2.5 rounded-2xl bg-[#020919]/80 border border-cyan-500/40 backdrop-blur-md shadow-[0_0_25px_rgba(0,240,255,0.18)] transition-all hover:border-cyan-300 hover:shadow-[0_0_35px_rgba(0,240,255,0.3)]">
        <div className="flex items-center justify-between pb-1 border-b border-cyan-500/25">
          <div className="flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-heading font-black text-[10px] tracking-wider text-cyan-100 uppercase">
              MODULE 04: SETTINGS
            </span>
          </div>
          <span className="font-mono text-[8px] text-cyan-300 bg-cyan-950/80 px-1.5 py-0.5 rounded border border-cyan-500/30">
            {systemMode}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-1 font-mono text-[8px]">
          {(['NEURAL_FOCUS', 'OVERCLOCK', 'STEALTH', 'DIAGNOSTIC'] as SystemMode[]).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => {
                audioSynth.playSciFiClick();
                onSelectSystemMode(mode);
              }}
              className={`p-1 rounded font-bold cursor-pointer transition-all text-center ${
                systemMode === mode
                  ? 'bg-cyan-500/40 text-cyan-100 border border-cyan-400 shadow-[0_0_10px_rgba(0,240,255,0.4)]'
                  : 'bg-[#010614]/90 text-slate-400 hover:text-cyan-200 border border-cyan-500/20'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
