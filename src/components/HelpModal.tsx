import React from 'react';
import { 
  X, 
  Terminal, 
  Network, 
  Sliders, 
  Command, 
  Cpu
} from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
      <div 
        className="w-full max-w-xl cyber-panel rounded-2xl border border-cyan-500/40 bg-[#0a0f1a]/95 shadow-[0_0_50px_rgba(0,240,255,0.2)] overflow-hidden max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-cyan-500/20 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cyan-950/70 border border-cyan-500/40 text-cyan-400">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-bold block">
                System Guide & Diagnostics
              </span>
              <h3 className="font-heading text-base font-bold text-slate-100">
                TARA Voice Assistant Capabilities
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 space-y-4 overflow-y-auto text-xs text-slate-300 font-sans leading-relaxed">
          {/* Section 1: Command Bar & Hindi Voice */}
          <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 space-y-2">
            <h4 className="font-heading font-bold text-xs text-cyan-300 flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5" /> 1. Conversational Engine & Hindi/English Speech (Gemini 2.5 Flash)
            </h4>
            <p className="text-slate-400">
              Converse with Tara in natural Hindi or English. Tara automatically speaks every response aloud using high-fidelity browser Speech Synthesis. Use the mic button to speak directives or type slash commands to trigger real-time actions.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 font-mono text-[11px] pt-1">
              <span className="text-cyan-400 bg-slate-900 px-2 py-0.5 rounded">/task [directive]</span>
              <span className="text-purple-400 bg-slate-900 px-2 py-0.5 rounded">/memory [fact]</span>
              <span className="text-amber-400 bg-slate-900 px-2 py-0.5 rounded">/note [scratchpad]</span>
              <span className="text-emerald-400 bg-slate-900 px-2 py-0.5 rounded">/workflow [1/2/3]</span>
            </div>
          </div>

          {/* Section 2: Visual Mind Map */}
          <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 space-y-2">
            <h4 className="font-heading font-bold text-xs text-purple-300 flex items-center gap-1.5">
              <Network className="w-3.5 h-3.5" /> 2. Visual Neural Mind-Map
            </h4>
            <p className="text-slate-400">
              Interactive node graph linking your episodic memory anchors, cognitive skills, and automation pipelines. Drag nodes to reposition, click to inspect or trigger in chat, and use the zoom/pan controls to navigate.
            </p>
          </div>

          {/* Section 3: Status Cards */}
          <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 space-y-2">
            <h4 className="font-heading font-bold text-xs text-emerald-300 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5" /> 3. Modular Telemetry & Directives
            </h4>
            <p className="text-slate-400">
              Real-time monitoring of neural load, quantum memory allocation, active daemon subroutines, and task priorities with AI subtask breakdown generator.
            </p>
          </div>

          {/* Section 4: Hotkeys */}
          <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800 space-y-1.5">
            <h4 className="font-heading font-bold text-xs text-amber-300 flex items-center gap-1.5">
              <Command className="w-3.5 h-3.5" /> System Hotkeys
            </h4>
            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono pt-1">
              <div className="flex items-center justify-between">
                <span>Command Palette</span>
                <kbd className="px-1.5 py-0.2 bg-slate-800 border border-slate-700 rounded text-cyan-300">⌘K / Ctrl+K</kbd>
              </div>
              <div className="flex items-center justify-between">
                <span>Slash Shortcuts</span>
                <kbd className="px-1.5 py-0.2 bg-slate-800 border border-slate-700 rounded text-cyan-300">/</kbd>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/80 text-right">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-heading font-bold text-xs rounded-lg transition-colors"
          >
            Acknowledge
          </button>
        </div>
      </div>
    </div>
  );
};
