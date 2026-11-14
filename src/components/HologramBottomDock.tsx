/**
 * HologramBottomDock.tsx
 * Bottom Glass Action Dock for TARA OS:
 * - Primary Controls: Voice Call Toggle, HUD Terminal Logs, Visual Hub
 * - Secondary Quick Actions: News, Music, Rates, Calculator, Memory Vault, Photo Upload
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
  LayoutGrid,
  Camera,
} from 'lucide-react';
import { speechEngine } from '../utils/speech';

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
  onOpenVisualHub?: () => void;
  onUploadPhoto?: () => void;
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
  onOpenVisualHub,
  onUploadPhoto,
  className = '',
}) => {
  return (
    <footer
      className={`w-full z-30 flex flex-col items-center justify-center py-2 px-3 bg-[#030816]/95 border-t border-cyan-500/20 backdrop-blur-md select-none shrink-0 ${className}`}
    >
      <div className="w-full max-w-[1600px] flex flex-wrap items-center justify-between gap-2">
        {/* Primary Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => {
              speechEngine.unlockSpeech();
              onToggleVoice();
            }}
            className={`px-3.5 py-1.5 rounded-xl font-heading font-semibold text-xs cursor-pointer transition-colors flex items-center gap-1.5 border whitespace-nowrap shrink-0 ${
              isHandsFreeMode
                ? isListening
                  ? 'bg-emerald-500 text-slate-950 border-emerald-300 shadow-[0_0_20px_rgba(16,225,178,0.55)]'
                  : isSpeaking
                  ? 'bg-cyan-500 text-slate-950 border-cyan-300'
                  : 'bg-cyan-600 text-white border-cyan-400'
                : 'bg-[#081a33] hover:bg-[#0c2448] text-cyan-200 border-cyan-400/50'
            }`}
            title={isHandsFreeMode ? 'वॉयस कॉल बंद करें' : 'वॉयस कॉल शुरू करें'}
          >
            <Mic className="w-3.5 h-3.5" />
            <span>{isHandsFreeMode ? 'कॉल सक्रिय (STOP)' : 'वॉयस कॉल शुरू'}</span>
          </button>

          <button
            type="button"
            onClick={onToggleTerminalLogs}
            className="px-3 py-1.5 rounded-xl bg-[#081a33] hover:bg-[#0c2448] text-cyan-200 font-mono text-xs cursor-pointer transition-colors flex items-center gap-1.5 border border-cyan-400/40 whitespace-nowrap shrink-0"
            title="HUD कोड टर्मिनल व सिस्टम लॉग्स"
          >
            <Terminal className="w-3.5 h-3.5 text-cyan-400" />
            <span>HUD Logs</span>
          </button>

          {onOpenVisualHub && (
            <button
              type="button"
              onClick={onOpenVisualHub}
              className="px-3 py-1.5 rounded-xl bg-[#081a33] hover:bg-[#0c2448] text-cyan-200 font-mono text-xs cursor-pointer transition-colors flex items-center gap-1.5 border border-cyan-400/40 whitespace-nowrap shrink-0"
              title="Visual Hub एवं ऐप्स खोलें"
            >
              <LayoutGrid className="w-3.5 h-3.5 text-cyan-400" />
              <span>Visual Hub</span>
            </button>
          )}
        </div>

        {/* Secondary Compact Quick Triggers */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {onUploadPhoto && (
            <button
              type="button"
              onClick={onUploadPhoto}
              className="px-2.5 py-1.5 rounded-xl bg-[#041228] hover:bg-[#081e42] border border-cyan-500/30 text-cyan-200 font-mono text-xs flex items-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap shrink-0"
            >
              <Camera className="w-3.5 h-3.5 text-cyan-400" />
              <span>फ़ोटो</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              speechEngine.unlockSpeech();
              onTriggerIndiaNews();
            }}
            className="px-2.5 py-1.5 rounded-xl bg-[#041228] hover:bg-[#081e42] border border-cyan-500/30 text-cyan-200 font-mono text-xs flex items-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap shrink-0"
          >
            <Radio className="w-3.5 h-3.5 text-cyan-400" />
            <span>समाचार</span>
          </button>

          <button
            type="button"
            onClick={onOpenMusicPlayer}
            className="px-2.5 py-1.5 rounded-xl bg-[#041228] hover:bg-[#081e42] border border-cyan-500/30 text-cyan-200 font-mono text-xs flex items-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap shrink-0"
          >
            <Music className="w-3.5 h-3.5 text-cyan-400" />
            <span>म्यूजिक</span>
          </button>

          <button
            type="button"
            onClick={onOpenRatesTable}
            className="px-2.5 py-1.5 rounded-xl bg-[#041228] hover:bg-[#081e42] border border-cyan-500/30 text-cyan-200 font-mono text-xs flex items-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap shrink-0"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-cyan-400" />
            <span>दर तालिका</span>
          </button>

          <button
            type="button"
            onClick={onOpenCalculator}
            className="px-2.5 py-1.5 rounded-xl bg-[#041228] hover:bg-[#081e42] border border-cyan-500/30 text-cyan-200 font-mono text-xs flex items-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap shrink-0"
          >
            <Calculator className="w-3.5 h-3.5 text-cyan-400" />
            <span>कैलकुलेटर</span>
          </button>

          <button
            type="button"
            onClick={onOpenMemoryVault}
            className="px-2.5 py-1.5 rounded-xl bg-[#041228] hover:bg-[#081e42] border border-cyan-500/30 text-cyan-200 font-mono text-xs flex items-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap shrink-0"
          >
            <Brain className="w-3.5 h-3.5 text-cyan-400" />
            <span>मेमोरी</span>
          </button>
        </div>
      </div>
    </footer>
  );
};
