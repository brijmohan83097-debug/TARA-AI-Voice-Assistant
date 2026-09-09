import React, { useState } from 'react';
import { 
  Pin, 
  Plus, 
  Search, 
  Trash2, 
  Copy, 
  Check, 
  BookOpen
} from 'lucide-react';
import { NoteItem } from '../types';
import { audioSynth } from '../utils/audio';

interface NotesSectionProps {
  notes: NoteItem[];
  onAddNote: (note: Omit<NoteItem, 'id' | 'updatedAt'>) => void;
  onTogglePin: (id: string) => void;
  onDeleteNote: (id: string) => void;
}

export const NotesSection: React.FC<NotesSectionProps> = ({
  notes,
  onAddNote,
  onTogglePin,
  onDeleteNote,
}) => {
  const [search, setSearch] = useState<string>('');
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>('');
  const [newContent, setNewContent] = useState<string>('');
  const [newCategory] = useState<string>('Brain Dump');
  const [newTagInput, setNewTagInput] = useState<string>('Aetheris');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCreateNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() && !newContent.trim()) return;
    audioSynth.playSend();

    const tags = newTagInput
      .split(',')
      .map((t) => t.trim().replace(/^#/, ''))
      .filter(Boolean);

    onAddNote({
      title: newTitle.trim() || 'Untitled Quantum Log',
      content: newContent.trim(),
      category: newCategory,
      pinned: false,
      tags: tags.length > 0 ? tags : ['Note'],
      color: 'cyan',
    });

    setNewTitle('');
    setNewContent('');
    setNewTagInput('Aetheris');
    setIsCreating(false);
  };

  const handleCopyNote = (note: NoteItem) => {
    audioSynth.playClick();
    navigator.clipboard.writeText(`${note.title}\n\n${note.content}`);
    setCopiedId(note.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Sort pinned to top, then by updated
  const sortedNotes = [...notes].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return 0;
  });

  const filteredNotes = sortedNotes.filter((n) => {
    const q = search.toLowerCase();
    return (
      n.title.toLowerCase().includes(q) ||
      n.content.toLowerCase().includes(q) ||
      n.tags.some((t) => t.toLowerCase().includes(q))
    );
  });

  const getColorBorder = (color?: string) => {
    switch (color) {
      case 'emerald':
        return 'border-emerald-500/30 hover:border-emerald-400/50';
      case 'amber':
        return 'border-amber-500/30 hover:border-amber-400/50';
      case 'purple':
        return 'border-purple-500/30 hover:border-purple-400/50';
      default:
        return 'border-cyan-500/30 hover:border-cyan-400/50';
    }
  };

  return (
    <div className="cyber-panel rounded-xl overflow-hidden border border-cyan-500/20 bg-[#090e17]/90 shadow-xl flex flex-col h-full">
      {/* Header */}
      <div className="p-3 border-b border-cyan-500/20 bg-slate-950/80 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded bg-cyan-950/70 border border-cyan-500/40 text-cyan-400">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-heading text-xs font-bold text-slate-100 uppercase tracking-wider flex items-center gap-1.5">
              Quantum Scratchpad <span className="text-[10px] font-mono text-cyan-400 font-normal">({notes.length})</span>
            </h3>
            <p className="text-[10px] font-mono text-slate-400">
              Ephemeral thought logs & research notes
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            audioSynth.playClick();
            setIsCreating(!isCreating);
          }}
          className="flex items-center gap-1 px-2 py-1 rounded bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 text-xs font-mono transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Note</span>
        </button>
      </div>

      {/* Search Input Bar */}
      <div className="p-2 border-b border-slate-800/80 bg-slate-950/50">
        <div className="relative flex items-center">
          <Search className="w-3.5 h-3.5 absolute left-2.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search notes or tags..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-2 py-1 text-xs font-mono bg-slate-900/90 border border-slate-800 focus:border-cyan-500/50 rounded-md text-slate-200 placeholder:text-slate-600 focus:outline-none"
          />
        </div>
      </div>

      {/* New Note Inline Form */}
      {isCreating && (
        <form onSubmit={handleCreateNote} className="p-3 border-b border-cyan-500/20 bg-slate-950/95 space-y-2">
          <input
            type="text"
            placeholder="Note title..."
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="w-full px-2.5 py-1 rounded bg-slate-900 border border-cyan-500/40 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none"
          />
          <textarea
            rows={3}
            placeholder="Write notes, snippets, or protocol logs..."
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            className="w-full px-2.5 py-1.5 rounded bg-slate-900 border border-slate-800 focus:border-cyan-500/40 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none resize-none font-sans"
          />
          <div className="flex items-center justify-between gap-2">
            <input
              type="text"
              placeholder="Tags (e.g. AI, Proto, Web)"
              value={newTagInput}
              onChange={(e) => setNewTagInput(e.target.value)}
              className="w-1/2 px-2 py-1 rounded bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-300 placeholder:text-slate-600 focus:outline-none"
            />
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="px-2 py-1 text-xs text-slate-400 hover:text-slate-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-heading font-bold text-xs rounded transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Notes Grid / List */}
      <div className="p-2.5 overflow-y-auto space-y-2 flex-1 max-h-[300px] lg:max-h-[340px]">
        {filteredNotes.length === 0 ? (
          <div className="p-6 text-center text-slate-500 text-xs font-mono">
            No notes found. Create a quick note or use "/note [text]" in chat.
          </div>
        ) : (
          filteredNotes.map((note) => (
            <div
              key={note.id}
              className={`p-3 rounded-lg bg-slate-900/80 border transition-all ${getColorBorder(note.color)} group relative`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-1.5 flex-1 min-w-0">
                  {note.pinned && (
                    <Pin className="w-3 h-3 text-cyan-400 fill-cyan-400 shrink-0" />
                  )}
                  <h4 className="font-heading text-xs font-bold text-slate-200 truncate">
                    {note.title}
                  </h4>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => {
                      audioSynth.playClick();
                      onTogglePin(note.id);
                    }}
                    className={`p-1 rounded hover:bg-slate-800 transition-colors ${
                      note.pinned ? 'text-cyan-400' : 'text-slate-500 hover:text-slate-300'
                    }`}
                    title={note.pinned ? 'Unpin' : 'Pin to top'}
                  >
                    <Pin className="w-3 h-3" />
                  </button>

                  <button
                    onClick={() => handleCopyNote(note)}
                    className="p-1 rounded text-slate-500 hover:text-cyan-400 hover:bg-slate-800 transition-colors"
                    title="Copy note content"
                  >
                    {copiedId === note.id ? (
                      <Check className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </button>

                  <button
                    onClick={() => {
                      audioSynth.playClick();
                      onDeleteNote(note.id);
                    }}
                    className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                    title="Delete Note"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>

              <p className="text-xs text-slate-300 font-sans mt-1.5 whitespace-pre-wrap line-clamp-3 leading-relaxed">
                {note.content}
              </p>

              {/* Tags & Timestamp footer */}
              <div className="flex flex-wrap items-center justify-between gap-1.5 mt-2.5 pt-2 border-t border-slate-800/60 text-[10px] font-mono text-slate-500">
                <div className="flex flex-wrap gap-1">
                  {note.tags.map((tag, tIdx) => (
                    <span
                      key={tIdx}
                      className="px-1.5 py-0.2 rounded bg-slate-950 border border-slate-800 text-cyan-400/80"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
                <span>{note.updatedAt}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
