import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Terminal, 
  Zap, 
  Cpu, 
  Sliders, 
  Activity, 
  CornerDownLeft,
  Sparkles,
  ShieldCheck,
  HardDrive
} from 'lucide-react';
import { audioSynth } from '../utils/audio';
import { SystemMode } from '../types';

interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAction: (actionType: string, payload?: any) => void;
}

export const CommandPaletteModal: React.FC<CommandPaletteModalProps> = ({
  isOpen,
  onClose,
  onSelectAction,
}) => {
  const [query, setQuery] = useState<string>('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        onClose(); // toggle
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!isOpen) return null;

  const commands = [
    { id: 'wf-morning', title: 'Execute Executive Morning Briefing Pipeline (मॉर्निंग ब्रीफिंग)', category: 'Workflows', icon: Zap, color: 'text-amber-400', action: () => onSelectAction('workflow', 'wf-1') },
    { id: 'wf-audit', title: 'Run Deep System Security Audit (सुरक्षा जांच)', category: 'Workflows', icon: ShieldCheck, color: 'text-emerald-400', action: () => onSelectAction('workflow', 'wf-2') },
    { id: 'wf-defrag', title: 'Run Cognitive Memory Defrag & Consolidation (मेमोरी ऑप्टिमाइज़)', category: 'Workflows', icon: HardDrive, color: 'text-purple-400', action: () => onSelectAction('workflow', 'wf-3') },
    { id: 'mode-focus', title: 'Set System Mode to NEURAL FOCUS (न्यूरल फोकस मोड)', category: 'System Mode', icon: Sliders, color: 'text-cyan-400', action: () => onSelectAction('mode', 'NEURAL_FOCUS' as SystemMode) },
    { id: 'mode-overclock', title: 'Engage System OVERCLOCK Mode (+35% Boost)', category: 'System Mode', icon: Sparkles, color: 'text-amber-400', action: () => onSelectAction('mode', 'OVERCLOCK' as SystemMode) },
    { id: 'mode-stealth', title: 'Activate STEALTH Mode (Quiet Telemetry)', category: 'System Mode', icon: ShieldCheck, color: 'text-purple-400', action: () => onSelectAction('mode', 'STEALTH' as SystemMode) },
    { id: 'mode-diag', title: 'Switch to DIAGNOSTIC Mode', category: 'System Mode', icon: Activity, color: 'text-emerald-400', action: () => onSelectAction('mode', 'DIAGNOSTIC' as SystemMode) },
    { id: 'action-add-node', title: 'Add New Memory Anchor or Skill Node to Mind-Map (नया नोड जोड़ें)', category: 'Mind-Map', icon: Cpu, color: 'text-cyan-400', action: () => onSelectAction('add_node') },
    { id: 'action-diag-ping', title: 'Run Instant Neural Telemetry Diagnostic Ping', category: 'System', icon: Activity, color: 'text-emerald-400', action: () => onSelectAction('diag_ping') },
    { id: 'action-clear-logs', title: 'Flush and Clear Terminal Log Stream (लॉग्स साफ़ करें)', category: 'System', icon: Terminal, color: 'text-slate-400', action: () => onSelectAction('clear_logs') },
  ];

  const filtered = commands.filter((c) => 
    c.title.toLowerCase().includes(query.toLowerCase()) || 
    c.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/75 backdrop-blur-md">
      <div 
        className="w-full max-w-xl cyber-panel rounded-2xl border border-cyan-500/40 bg-[#090e18]/95 shadow-[0_0_50px_rgba(0,240,255,0.2)] overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header */}
        <div className="p-3.5 border-b border-cyan-500/20 flex items-center gap-3 bg-slate-950/80">
          <Search className="w-5 h-5 text-cyan-400" />
          <input
            type="text"
            placeholder="Type a command, workflow, or shortcut..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full bg-transparent text-sm font-sans text-slate-100 placeholder:text-slate-500 focus:outline-none"
          />
          <kbd className="px-2 py-0.5 text-[11px] font-mono bg-slate-900 border border-slate-800 rounded text-slate-400">
            ESC
          </kbd>
        </div>

        {/* Command list */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="p-6 text-center text-xs font-mono text-slate-500">
              No matching directives found.
            </div>
          ) : (
            filtered.map((cmd) => {
              const Icon = cmd.icon;
              return (
                <button
                  key={cmd.id}
                  onClick={() => {
                    audioSynth.playSend();
                    cmd.action();
                    onClose();
                  }}
                  className="w-full p-2.5 rounded-lg flex items-center justify-between hover:bg-slate-900/90 border border-transparent hover:border-cyan-500/30 transition-all text-left group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 rounded-md bg-slate-950 border border-slate-800 group-hover:border-cyan-500/40 transition-colors">
                      <Icon className={`w-4 h-4 ${cmd.color}`} />
                    </div>
                    <div>
                      <h4 className="text-xs font-sans font-medium text-slate-200 group-hover:text-cyan-300">
                        {cmd.title}
                      </h4>
                      <span className="text-[10px] font-mono text-slate-500">
                        {cmd.category}
                      </span>
                    </div>
                  </div>
                  <CornerDownLeft className="w-3.5 h-3.5 text-slate-600 group-hover:text-cyan-400 transition-colors" />
                </button>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="p-2.5 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-[11px] font-mono text-slate-500">
          <span>AETHERIS Rapid Execution Engine</span>
          <span>Press Enter to select</span>
        </div>
      </div>
    </div>
  );
};
