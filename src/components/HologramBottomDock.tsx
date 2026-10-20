/**
 * HologramBottomDock.tsx
 * Bottom Glass Translucent Action Overlay (Faithfully matching 1791885788037.png):
 * - Primary Glass Pill Buttons overlapping right above visual base emitter pattern:
 *   [CALL (ACTIVE)] / [CALL (CONNECT)], [CAMERA SCAN], [HUD LOGS]
 * - Plus secondary compact glass quick triggers for Music, Rates, Calculator, and Brain Vault.
 */

import React from 'react';
import {
  Mic,
  Terminal,
  Radio,
  Music,
  FileSpreadsheet,
  Calculator,
  Brain,
  Volume2,
} from 'lucide-react';

interface HologramBottomDockProps {
  isListening: boolean;
  isSpeaking: boolean;
  isHandsFreeMode: boolean;
  onToggleVoice: () => void;
  onTriggerIndiaNews: () => void;
  onOpenMusicPlayer: () => void;
  onOpenRatesTable: () => void;
  onOpenCalculator: () => void;
  onOpenMemoryVault: () => void;
  onToggleTerminalLogs: () => void;
  onReplayVoice: () => void;
  className?: string;
}

export const HologramBottomDock: React.FC<HologramBottomDockProps> = ({
  isListening,
  isSpeaking,
  isHandsFreeMode,
  onToggleVoice,
  onTriggerIndiaNews,
  onOpenMusicPlayer,
  onOpenRatesTable,
  onOpenCalculator,
  onOpenMemoryVault,
  onToggleTerminalLogs,
  onReplayVoice,
  className = '',
}) => {
  return (
    <footer
      className={`w-full z-30 flex flex-col items-center justify-center pb-3 pt-1.5 px-3 bg-gradient-to-t from-[#020716]/95 via-[#020716]/80 to-transparent backdrop-blur-md select-none shrink-0 ${className}`}
    >
      {/* 1. PRIMARY GLASS PILL BUTTONS (Clean 2-button layout: CALL and HUD LOGS) */}
      <div className="flex items-center justify-center gap-3 sm:gap-6 max-w-lg w-full">
        {/* BUTTON 1: CALL (ACTIVE) */}
        <button
          type="button"
          onClick={onToggleVoice}
          className={`flex-1 max-w-[220px] py-2 sm:py-2.5 px-4 rounded-2xl font-heading font-black text-xs sm:text-sm tracking-wider cursor-pointer transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center gap-2 border shadow-lg ${
            isHandsFreeMode
              ? isListening
                ? 'bg-rose-600/90 hover:bg-rose-500 text-white border-rose-300 shadow-[0_0_25px_rgba(244,63,94,0.7)] animate-pulse'
                : isSpeaking
                ? 'bg-purple-600/90 hover:bg-purple-500 text-white border-purple-300 shadow-[0_0_25px_rgba(168,85,247,0.7)]'
                : 'bg-emerald-600/90 hover:bg-emerald-500 text-white border-emerald-300 shadow-[0_0_25px_rgba(16,185,129,0.7)]'
              : 'bg-[#081a33]/90 hover:bg-[#0c2448] text-cyan-200 hover:text-white border-cyan-400/60 shadow-[0_0_20px_rgba(0,240,255,0.35)]'
          }`}
          title={isHandsFreeMode ? 'कॉल बंद करें' : 'वॉयस कॉल शुरू करें'}
        >
          <Mic className={`w-4 h-4 ${isHandsFreeMode ? 'animate-bounce' : 'text-cyan-400'}`} />
          <span>{isHandsFreeMode ? 'CALL (ACTIVE)' : 'CALL (START)'}</span>
        </button>

        {/* BUTTON 2: HUD LOGS */}
        <button
          type="button"
          onClick={onToggleTerminalLogs}
          className="flex-1 max-w-[220px] py-2 sm:py-2.5 px-4 rounded-2xl bg-[#081a33]/90 hover:bg-[#0c2448] text-cyan-200 hover:text-white font-heading font-black text-xs sm:text-sm tracking-wider cursor-pointer transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center gap-2 border border-cyan-400/60 shadow-[0_0_20px_rgba(0,240,255,0.35)]"
          title="HUD कोड टर्मिनल व सिस्टम लॉग्स"
        >
          <Terminal className="w-4 h-4 text-cyan-400" />
          <span>HUD LOGS</span>
        </button>
      </div>

      {/* 2. SECONDARY COMPACT SCI-FI QUICK ACTIONS (Sleek Glass Bar) */}
      <div className="flex items-center justify-center gap-1.5 sm:gap-2 mt-1.5 overflow-x-auto no-scrollbar py-0.5">
        {/* Radio News */}
        <button
          type="button"
          onClick={onTriggerIndiaNews}
          className="px-2 py-1 rounded-xl bg-[#041228]/80 hover:bg-[#081e42] border border-red-500/30 text-red-200 font-mono text-[9px] sm:text-[10px] flex items-center gap-1 cursor-pointer transition-colors"
        >
          <Radio className="w-2.5 h-2.5 text-red-400" />
          <span>समाचार</span>
        </button>

        {/* Music */}
        <button
          type="button"
          onClick={onOpenMusicPlayer}
          className="px-2 py-1 rounded-xl bg-[#041228]/80 hover:bg-[#081e42] border border-indigo-500/30 text-indigo-200 font-mono text-[9px] sm:text-[10px] flex items-center gap-1 cursor-pointer transition-colors"
        >
          <Music className="w-2.5 h-2.5 text-indigo-400" />
          <span>म्यूजिक</span>
        </button>

        {/* Rates Table */}
        <button
          type="button"
          onClick={onOpenRatesTable}
          className="px-2 py-1 rounded-xl bg-[#041228]/80 hover:bg-[#081e42] border border-cyan-500/30 text-cyan-200 font-mono text-[9px] sm:text-[10px] flex items-center gap-1 cursor-pointer transition-colors"
        >
          <FileSpreadsheet className="w-2.5 h-2.5 text-cyan-400" />
          <span>दर तालिका</span>
        </button>

        {/* Calculator */}
        <button
          type="button"
          onClick={onOpenCalculator}
          className="px-2 py-1 rounded-xl bg-[#041228]/80 hover:bg-[#081e42] border border-cyan-500/30 text-cyan-200 font-mono text-[9px] sm:text-[10px] flex items-center gap-1 cursor-pointer transition-colors"
        >
          <Calculator className="w-2.5 h-2.5 text-cyan-400" />
          <span>कैलकुलेटर</span>
        </button>

        {/* Memory Vault */}
        <button
          type="button"
          onClick={onOpenMemoryVault}
          className="px-2 py-1 rounded-xl bg-[#041228]/80 hover:bg-[#081e42] border border-purple-500/30 text-purple-200 font-mono text-[9px] sm:text-[10px] flex items-center gap-1 cursor-pointer transition-colors"
        >
          <Brain className="w-2.5 h-2.5 text-purple-400" />
          <span>मेमोरी</span>
        </button>
      </div>
    </footer>
  );
};
