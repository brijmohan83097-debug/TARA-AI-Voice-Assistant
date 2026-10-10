/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Brain,
  X,
  Plus,
  Trash2,
  Sparkles,
  Search,
  CheckCircle2,
  Clock,
  Heart,
  Calendar,
  Bookmark,
  Zap,
  Tag
} from 'lucide-react';
import { TaraMemoryItem, MemoryCategory } from '../types';
import { audioSynth } from '../utils/audio';

interface TaraMemoryVaultModalProps {
  isOpen: boolean;
  onClose: () => void;
  memories: TaraMemoryItem[];
  onAddMemory: (fact: string, category: MemoryCategory) => void;
  onDeleteMemory: (id: string) => void;
  onAskAboutMemory: (fact: string) => void;
}

export const TaraMemoryVaultModal: React.FC<TaraMemoryVaultModalProps> = ({
  isOpen,
  onClose,
  memories,
  onAddMemory,
  onDeleteMemory,
  onAskAboutMemory,
}) => {
  const [newFact, setNewFact] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<MemoryCategory>('personal');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddingNew, setIsAddingNew] = useState(false);

  if (!isOpen) return null;

  const filteredMemories = memories.filter((mem) => {
    const matchesCategory = filterCategory === 'all' || mem.category === filterCategory;
    const matchesSearch =
      !searchQuery.trim() ||
      mem.fact.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mem.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFact.trim()) return;
    audioSynth.playSuccess();
    onAddMemory(newFact.trim(), selectedCategory);
    setNewFact('');
    setIsAddingNew(false);
  };

  const getCategoryDetails = (cat: MemoryCategory) => {
    switch (cat) {
      case 'personal':
        return {
          label: 'व्यक्तिगत',
          color: 'text-cyan-300',
          badgeBg: 'bg-cyan-950/80 border-cyan-500/40 text-cyan-200',
          icon: <Brain className="w-3.5 h-3.5 text-cyan-400" />,
        };
      case 'preference':
        return {
          label: 'पसंद / आदत',
          color: 'text-amber-300',
          badgeBg: 'bg-amber-950/80 border-amber-500/40 text-amber-200',
          icon: <Heart className="w-3.5 h-3.5 text-amber-400" />,
        };
      case 'plan':
        return {
          label: 'योजना / लक्ष्य',
          color: 'text-purple-300',
          badgeBg: 'bg-purple-950/80 border-purple-500/40 text-purple-200',
          icon: <Calendar className="w-3.5 h-3.5 text-purple-400" />,
        };
      default:
        return {
          label: 'तथ्य',
          color: 'text-emerald-300',
          badgeBg: 'bg-emerald-950/80 border-emerald-500/40 text-emerald-200',
          icon: <Bookmark className="w-3.5 h-3.5 text-emerald-400" />,
        };
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl bg-[#040a18] border-2 border-cyan-400/70 rounded-2xl shadow-[0_0_60px_rgba(0,240,255,0.35)] overflow-hidden flex flex-col max-h-[92vh]"
        style={{
          backgroundImage:
            'radial-gradient(ellipse at 50% 0%, rgba(0, 240, 255, 0.18) 0%, transparent 70%)',
        }}
      >
        {/* Sci-Fi Corner Accents */}
        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-cyan-300 z-30 pointer-events-none shadow-[0_0_8px_#00f0ff]" />
        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-cyan-300 z-30 pointer-events-none shadow-[0_0_8px_#00f0ff]" />
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-cyan-300 z-30 pointer-events-none shadow-[0_0_8px_#00f0ff]" />
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-cyan-300 z-30 pointer-events-none shadow-[0_0_8px_#00f0ff]" />

        {/* Modal Header */}
        <div className="px-4 py-3 bg-[#020612]/95 border-b border-cyan-500/30 flex items-center justify-between z-20">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-600 via-sky-500 to-purple-600 flex items-center justify-center text-white shadow-[0_0_15px_rgba(0,240,255,0.5)]">
              <Brain className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-heading font-black text-xs sm:text-sm text-cyan-200 tracking-wider">
                  TARA MEMORY VAULT // याददाश्त बैंक
                </span>
                <span className="px-1.5 py-0.2 rounded bg-cyan-950 border border-cyan-400/40 text-[9px] font-mono text-cyan-300 font-bold uppercase">
                  HUMAN-LIKE COGNITION
                </span>
              </div>
              <p className="text-[9px] font-mono text-slate-400">
                इंसानों की तरह सोचना, समझना और आपकी हर बात याद रखना
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              audioSynth.playSciFiClick();
              onClose();
            }}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
            title="बंद करें (Close)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Top Synaptic Telemetry Ribbon */}
        <div className="px-4 py-2 bg-[#050e22] border-b border-cyan-500/20 flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono">
          <div className="flex items-center gap-3">
            <span className="text-slate-400">
              सक्रिय यादें:{' '}
              <strong className="text-cyan-300 font-bold">{memories.length} संचित</strong>
            </span>
            <span className="text-slate-400 hidden sm:inline">•</span>
            <span className="text-slate-400 hidden sm:inline">
              स्मृति सटीकता:{' '}
              <strong className="text-emerald-300 font-bold">100% सटीक</strong>
            </span>
            <span className="text-slate-400 hidden sm:inline">•</span>
            <span className="text-slate-400 hidden sm:inline">
              सोच स्तर: <strong className="text-purple-300 font-bold">उच्च सुशिक्षित</strong>
            </span>
          </div>

          <button
            type="button"
            onClick={() => {
              audioSynth.playSciFiClick();
              setIsAddingNew(!isAddingNew);
            }}
            className="px-2.5 py-1 rounded bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-200 flex items-center gap-1 font-bold cursor-pointer transition-all hover:scale-105"
          >
            <Plus className="w-3 h-3 text-cyan-400" />
            <span>{isAddingNew ? 'कैंसिल' : 'नई बात याद रखें'}</span>
          </button>
        </div>

        {/* Add New Memory Drawer */}
        {isAddingNew && (
          <form
            onSubmit={handleAddSubmit}
            className="p-3 bg-[#030818] border-b border-cyan-500/30 flex flex-col gap-2.5 animate-in slide-in-from-top-2"
          >
            <span className="text-xs font-mono text-cyan-300 font-bold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              तारा के लिए नई याददाश्त दर्ज करें:
            </span>
            <div className="flex gap-2">
              <input
                type="text"
                value={newFact}
                onChange={(e) => setNewFact(e.target.value)}
                placeholder="उदा. मेरा पसंदीदा रंग नीला है / मेरी परीक्षा 20 तारीख को है..."
                className="flex-1 bg-[#020510] border border-cyan-500/40 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-300 font-mono"
                autoFocus
              />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as MemoryCategory)}
                className="bg-[#020510] border border-cyan-500/40 rounded-xl px-2.5 py-2 text-xs text-cyan-200 font-mono focus:outline-none"
              >
                <option value="personal">व्यक्तिगत</option>
                <option value="preference">पसंद / आदत</option>
                <option value="plan">योजना / लक्ष्य</option>
                <option value="fact">तथ्य</option>
              </select>
              <button
                type="submit"
                className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-bold font-mono text-xs rounded-xl shadow-md cursor-pointer transition-all hover:scale-105"
              >
                सहेजें
              </button>
            </div>
          </form>
        )}

        {/* Search & Filter Toolbar */}
        <div className="p-3 bg-[#020614] border-b border-cyan-500/15 flex flex-wrap items-center justify-between gap-2">
          {/* Search Bar */}
          <div className="relative flex-1 min-w-[180px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="यादों में खोजें..."
              className="w-full bg-[#030919] border border-cyan-500/25 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none font-mono"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1 text-[10px] font-mono overflow-x-auto no-scrollbar">
            {[
              { id: 'all', label: 'सभी' },
              { id: 'personal', label: 'व्यक्तिगत' },
              { id: 'preference', label: 'पसंद' },
              { id: 'plan', label: 'योजनाएं' },
              { id: 'fact', label: 'तथ्य' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  audioSynth.playSciFiClick();
                  setFilterCategory(tab.id);
                }}
                className={`px-2 py-1 rounded transition-colors cursor-pointer whitespace-nowrap ${
                  filterCategory === tab.id
                    ? 'bg-cyan-500/20 border border-cyan-400 text-cyan-200 font-bold'
                    : 'bg-transparent text-slate-400 hover:text-cyan-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Memory Cards Scrollable Body */}
        <div className="p-3 sm:p-4 flex-1 overflow-y-auto space-y-2.5 custom-scrollbar min-h-[220px]">
          {filteredMemories.length === 0 ? (
            <div className="py-12 text-center flex flex-col items-center justify-center gap-2">
              <Brain className="w-10 h-10 text-slate-600 animate-pulse" />
              <p className="text-xs font-mono text-slate-400">कोई याददाश्त नहीं मिली।</p>
              <p className="text-[10px] font-mono text-slate-500">
                तारा से बातचीत में कहें: "याद रखो मुझे..." और तारा इसे हमेशा याद रखेगी।
              </p>
            </div>
          ) : (
            filteredMemories.map((mem) => {
              const catDetails = getCategoryDetails(mem.category);
              return (
                <div
                  key={mem.id}
                  className="p-3 rounded-xl bg-[#030919]/90 border border-cyan-500/25 hover:border-cyan-400/50 transition-all shadow-sm flex flex-col gap-2 group"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`px-2 py-0.5 rounded-full border text-[9px] font-mono font-bold flex items-center gap-1 ${catDetails.badgeBg}`}
                    >
                      {catDetails.icon}
                      <span>{catDetails.label}</span>
                    </span>

                    <div className="flex items-center gap-2 text-[9px] font-mono text-slate-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-500" />
                        <span>{new Date(mem.timestamp).toLocaleDateString('hi-IN')}</span>
                      </span>

                      <button
                        type="button"
                        onClick={() => {
                          audioSynth.playReceive();
                          onDeleteMemory(mem.id);
                        }}
                        className="text-slate-500 hover:text-rose-400 p-1 cursor-pointer transition-colors"
                        title="यह बात भूल जाओ (Delete Memory)"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs font-sans text-slate-100 leading-relaxed font-medium">
                    "{mem.fact}"
                  </p>

                  <div className="flex items-center justify-between pt-1 border-t border-cyan-500/10">
                    <span className="text-[9px] font-mono text-emerald-400/80 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      <span>तारा के न्यूरल दिमाग में सुरक्षित</span>
                    </span>

                    <button
                      type="button"
                      onClick={() => {
                        audioSynth.playSciFiClick();
                        onClose();
                        onAskAboutMemory(`तारा, क्या तुम्हें याद है: "${mem.fact}"?`);
                      }}
                      className="text-[10px] font-mono text-cyan-300 hover:text-white underline cursor-pointer"
                    >
                      तारा से पूछें ↗
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-[#030818] border-t border-cyan-500/20 flex items-center justify-between text-[10px] font-mono text-slate-400">
          <span>🧠 तारा आपकी यादों को हर बातचीत में याद रखती है।</span>
          <button
            type="button"
            onClick={() => {
              audioSynth.playSciFiClick();
              onClose();
              onAskAboutMemory('तारा, तुम्हें मेरे बारे में क्या-क्या याद है? विस्तार से बताओ।');
            }}
            className="px-3 py-1.5 rounded-lg bg-cyan-950 hover:bg-cyan-900 border border-cyan-400/50 text-cyan-200 font-bold cursor-pointer transition-all hover:scale-105"
          >
            <span>"तुम्हें क्या याद है?" पूछें</span>
          </button>
        </div>
      </div>
    </div>
  );
};
