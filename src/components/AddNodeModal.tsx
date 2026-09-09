import React, { useState } from 'react';
import { 
  X, 
  Plus, 
  Zap, 
  Sparkles, 
  FolderKanban,
  Check
} from 'lucide-react';
import { MindMapNode, NodeType } from '../types';
import { audioSynth } from '../utils/audio';

interface AddNodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddNode: (node: MindMapNode) => void;
}

export const AddNodeModal: React.FC<AddNodeModalProps> = ({
  isOpen,
  onClose,
  onAddNode,
}) => {
  if (!isOpen) return null;

  const [label, setLabel] = useState<string>('');
  const [type, setType] = useState<NodeType>('memory');
  const [description, setDescription] = useState<string>('');
  const [category, setCategory] = useState<string>('Episodic Memory');
  const [tagsInput, setTagsInput] = useState<string>('Neural, v4.8');
  const [strength, setStrength] = useState<number>(90);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim()) return;

    audioSynth.playSuccess();
    const id = `node-${Date.now()}`;
    const tags = tagsInput
      .split(',')
      .map((t) => t.trim().replace(/^#/, ''))
      .filter(Boolean);

    // Random placement near the core if newly created
    const randomAngle = Math.random() * Math.PI * 2;
    const distance = 160 + Math.random() * 80;
    const x = Math.round(400 + Math.cos(randomAngle) * distance);
    const y = Math.round(280 + Math.sin(randomAngle) * distance);

    const iconName = type === 'skill' ? 'Terminal' : (type === 'workflow' ? 'Zap' : 'FolderKanban');

    onAddNode({
      id,
      label: label.trim(),
      type,
      x: Math.max(80, Math.min(680, x)),
      y: Math.max(60, Math.min(500, y)),
      description: description.trim() || `Active neural node for ${label.trim()}`,
      category: category.trim(),
      iconName,
      strength,
      tags: tags.length > 0 ? tags : ['Synapse'],
      connections: ['core-aetheris'],
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
      <div 
        className="w-full max-w-lg cyber-panel rounded-2xl border border-cyan-500/40 bg-[#0a0f1a]/95 shadow-[0_0_50px_rgba(0,240,255,0.2)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-cyan-500/20 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cyan-950/70 border border-cyan-500/40 text-cyan-400">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-bold block">
                Synapse Forge
              </span>
              <h3 className="font-heading text-base font-bold text-slate-100">
                Register New Cognitive Node
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs font-sans">
          {/* Node Type Selector */}
          <div>
            <label className="block text-[11px] font-mono text-slate-400 mb-1.5">Node Classification</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'memory', label: 'Memory Anchor', icon: FolderKanban, color: 'text-purple-400 border-purple-500/40 bg-purple-950/30' },
                { id: 'skill', label: 'Cognitive Skill', icon: Sparkles, color: 'text-emerald-400 border-emerald-500/40 bg-emerald-950/30' },
                { id: 'workflow', label: 'Automation Flow', icon: Zap, color: 'text-amber-400 border-amber-500/40 bg-amber-950/30' },
              ].map((t) => {
                const isSelected = type === t.id;
                const Icon = t.icon;
                return (
                  <button
                    type="button"
                    key={t.id}
                    onClick={() => {
                      audioSynth.playClick();
                      setType(t.id as NodeType);
                      if (t.id === 'memory') setCategory('Episodic Memory');
                      if (t.id === 'skill') setCategory('Cognitive Skills');
                      if (t.id === 'workflow') setCategory('Automation Pipeline');
                    }}
                    className={`p-2.5 rounded-lg border text-center flex flex-col items-center gap-1.5 transition-all ${
                      isSelected
                        ? `${t.color} font-bold shadow-md`
                        : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-[11px] font-heading">{t.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-mono text-slate-400 mb-1">Node Title / Identifier</label>
            <input
              type="text"
              placeholder="e.g. Quantum Key Ring, User Bio-metrics, Rust AST Compiler"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              required
              autoFocus
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-cyan-500/40 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-cyan-400 text-xs"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono text-slate-400 mb-1">Context / Instruction Details</label>
            <textarea
              rows={2}
              placeholder="Describe memory anchor facts, skill behavior, or workflow rules..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 focus:border-cyan-500/40 text-slate-100 placeholder:text-slate-600 focus:outline-none resize-none text-xs font-sans"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-mono text-slate-400 mb-1">Category</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 text-xs focus:outline-none font-mono"
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono text-slate-400 mb-1">Initial Mastery / Resonance ({strength}%)</label>
              <input
                type="range"
                min="40"
                max="100"
                value={strength}
                onChange={(e) => setStrength(Number(e.target.value))}
                className="w-full accent-cyan-400 mt-2 cursor-pointer"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-mono text-slate-400 mb-1">Tags (comma-separated)</label>
            <input
              type="text"
              placeholder="e.g. AI, Crypto, Security, Target-2026"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 text-xs focus:outline-none font-mono placeholder:text-slate-600"
            />
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-heading font-bold text-xs rounded-lg flex items-center gap-1.5 shadow-[0_0_12px_rgba(0,240,255,0.3)] transition-all"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Forge Node</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
