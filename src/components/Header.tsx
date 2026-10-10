/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Sparkles, 
  Activity, 
  Sliders,
  Brain
} from 'lucide-react';
import { SystemMode } from '../types';

interface HeaderProps {
  systemMode: SystemMode;
  onModeChange?: (mode: SystemMode) => void;
  onOpenCommandPalette: () => void;
  onTriggerQuickWorkflow: (wfId: string) => void;
  onOpenHelp: () => void;
  onOpenStudio?: () => void;
  onOpenMemoryVault?: () => void;
  memoriesCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  systemMode,
  onOpenCommandPalette,
  onTriggerQuickWorkflow,
  onOpenHelp,
  onOpenStudio,
  onOpenMemoryVault,
  memoriesCount = 0,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-[#070b14]/90 backdrop-blur-md border-b border-cyan-500/20 px-4 py-2.5">
      <div className="max-w-[1700px] mx-auto flex items-center justify-between gap-3">
        {/* Left Brand Area matching screenshot: [✨ Icon] TARA [v2.5 AI CHAT & SKILLS] */}
        <div className="flex items-center gap-3">
          {/* Glowing Blue Circle with 4-point Sparkles Icon */}
          <button
            onClick={onOpenHelp}
            className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#00b4d8] to-[#0077b6] flex items-center justify-center text-white shadow-[0_0_15px_rgba(0,180,216,0.5)] border border-cyan-300/40 hover:scale-105 active:scale-95 transition-transform"
            title="Tara AI Assistant Info"
          >
            <Sparkles className="w-5 h-5 text-white" />
          </button>

          {/* Bold Name */}
          <span className="font-heading font-black text-xl sm:text-2xl tracking-wider text-white">
            TARA
          </span>

          {/* Version Pill: v2.5 AI CHAT & SKILLS */}
          <div className="hidden sm:flex items-center px-2.5 py-1 rounded-full bg-[#052233]/90 border border-cyan-500/50 text-[11px] font-mono text-cyan-300 font-bold tracking-wide shadow-[0_0_8px_rgba(0,240,255,0.15)]">
            v2.5 AI CHAT & SKILLS
          </div>

          {/* Active System Mode */}
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/80 border border-cyan-500/30 text-[10px] font-mono text-cyan-400">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span>{systemMode}</span>
          </div>
        </div>

        {/* Right Actions matching screenshot: [🧠 याददाश्त] [✨ Studio] [~] [...] */}
        <div className="flex items-center gap-2">
          {/* 🧠 Cognitive Memory Vault Button */}
          {onOpenMemoryVault && (
            <button
              onClick={onOpenMemoryVault}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-950/70 hover:bg-purple-900/90 border border-purple-400/50 hover:border-purple-300 text-purple-200 hover:text-white font-mono text-xs font-bold transition-all shadow-[0_0_12px_rgba(168,85,247,0.25)] active:scale-95 cursor-pointer"
              title="तारा की याददाश्त व मस्तिष्क (Cognitive Human Memory Vault)"
            >
              <Brain className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
              <span className="hidden sm:inline">याददाश्त</span>
              <span className="px-1.5 py-0.2 rounded-full bg-purple-500/30 text-[10px] text-purple-200 border border-purple-400/40">
                {memoriesCount}
              </span>
            </button>
          )}

          {/* ✨ Studio Button */}
          <button
            onClick={onOpenStudio}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#082a3a]/80 hover:bg-[#0c3a50] border border-cyan-400/60 text-cyan-300 hover:text-cyan-100 font-mono text-xs font-bold transition-all shadow-[0_0_12px_rgba(0,240,255,0.25)] active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
            <span>Studio</span>
          </button>

          {/* Activity / Pulse Icon Button */}
          <button
            onClick={() => onTriggerQuickWorkflow('wf-2')}
            className="p-2 rounded-xl bg-slate-900/80 hover:bg-cyan-950/70 border border-slate-800 hover:border-cyan-500/40 text-slate-300 hover:text-cyan-300 transition-all active:scale-95"
            title="System Diagnostics & Activity"
          >
            <Activity className="w-4 h-4 text-cyan-400" />
          </button>

          {/* Command Palette / More Button */}
          <button
            onClick={onOpenCommandPalette}
            className="p-2 rounded-xl bg-slate-900/80 hover:bg-cyan-950/70 border border-slate-800 hover:border-cyan-500/40 text-slate-300 hover:text-cyan-300 transition-all active:scale-95"
            title="Open Command Palette & Settings (⌘K)"
          >
            <Sliders className="w-4 h-4 text-slate-300" />
          </button>
        </div>
      </div>
    </header>
  );
};
