import React, { useState } from 'react';
import { 
  X, 
  Trash2, 
  Play, 
  Network, 
  Edit3, 
  Save
} from 'lucide-react';
import { MindMapNode } from '../types';
import { audioSynth } from '../utils/audio';

interface NodeDetailModalProps {
  node: MindMapNode | null;
  onClose: () => void;
  onUpdateNode: (updated: MindMapNode) => void;
  onDeleteNode: (id: string) => void;
  onTriggerSkillOrWorkflow: (node: MindMapNode) => void;
}

export const NodeDetailModal: React.FC<NodeDetailModalProps> = ({
  node,
  onClose,
  onUpdateNode,
  onDeleteNode,
  onTriggerSkillOrWorkflow,
}) => {
  if (!node) return null;

  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [label, setLabel] = useState<string>(node.label);
  const [description, setDescription] = useState<string>(node.description);
  const [strength, setStrength] = useState<number>(node.strength ?? 90);

  const handleSave = () => {
    audioSynth.playSuccess();
    onUpdateNode({
      ...node,
      label,
      description,
      strength,
    });
    setIsEditing(false);
  };

  const isHub = node.type === 'hub';

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
              <Network className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-bold block">
                Synapse Inspector // {node.type}
              </span>
              <h3 className="font-heading text-base font-bold text-slate-100">
                {node.label}
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

        {/* Content Body */}
        <div className="p-5 space-y-4 text-xs font-sans">
          {isEditing ? (
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">Node Title</label>
                <input
                  type="text"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-cyan-500/40 text-slate-100 text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">Context Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 focus:border-cyan-500/40 text-slate-100 text-xs focus:outline-none resize-none font-sans"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-400 mb-1">
                  Resonance / Mastery Strength: {strength}%
                </label>
                <input
                  type="range"
                  min="20"
                  max="100"
                  value={strength}
                  onChange={(e) => setStrength(Number(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  className="px-3 py-1.5 rounded bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-heading font-bold text-xs flex items-center gap-1"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Changes</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-mono text-slate-500 uppercase block mb-1">Description & Purpose</span>
                <p className="text-slate-200 leading-relaxed text-sm bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
                  {node.description}
                </p>
              </div>

              {/* Node Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 font-mono">
                <div className="p-2 rounded bg-slate-900/80 border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">Category</span>
                  <span className="text-xs text-cyan-300 font-bold">{node.category || 'General'}</span>
                </div>
                <div className="p-2 rounded bg-slate-900/80 border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">Resonance Strength</span>
                  <span className="text-xs text-emerald-400 font-bold">{node.strength ?? 90}%</span>
                </div>
                <div className="p-2 rounded bg-slate-900/80 border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">Linked Synapses</span>
                  <span className="text-xs text-purple-300 font-bold">{node.connections?.length || 1} links</span>
                </div>
              </div>

              {/* Tags */}
              {node.tags && node.tags.length > 0 && (
                <div>
                  <span className="text-[10px] font-mono text-slate-500 uppercase block mb-1.5">Context Tags</span>
                  <div className="flex flex-wrap gap-1.5">
                    {node.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-cyan-300 text-[11px] font-mono"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-cyan-500/20 bg-slate-950/80 flex flex-wrap items-center justify-between gap-2">
          {!isEditing && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  audioSynth.playClick();
                  setIsEditing(true);
                }}
                className="px-3 py-1.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-mono flex items-center gap-1.5"
              >
                <Edit3 className="w-3.5 h-3.5 text-cyan-400" />
                <span>Edit Parameters</span>
              </button>

              {!isHub && (
                <button
                  onClick={() => {
                    audioSynth.playClick();
                    onDeleteNode(node.id);
                    onClose();
                  }}
                  className="p-1.5 rounded hover:bg-rose-950/40 text-slate-500 hover:text-rose-400 border border-transparent hover:border-rose-500/30 transition-colors"
                  title="Remove Synapse Node"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          )}

          {/* Test invocation trigger */}
          {!isEditing && (
            <button
              onClick={() => {
                audioSynth.playSend();
                onTriggerSkillOrWorkflow(node);
                onClose();
              }}
              className="px-3.5 py-1.5 rounded bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-heading font-bold text-xs flex items-center gap-1.5 ml-auto shadow-[0_0_12px_rgba(0,240,255,0.3)] transition-all"
            >
              <Play className="w-3 h-3 fill-slate-950" />
              <span>INVOKE IN CHAT</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
