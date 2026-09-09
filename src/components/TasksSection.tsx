import React, { useState } from 'react';
import { 
  CheckSquare, 
  Square, 
  Plus, 
  Sparkles, 
  Clock, 
  CheckCircle2, 
  ChevronDown, 
  ChevronRight, 
  Trash2,
  ListTodo
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { TaskItem } from '../types';
import { audioSynth } from '../utils/audio';

interface TasksSectionProps {
  tasks: TaskItem[];
  onToggleTask: (id: string) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onAddTask: (task: Omit<TaskItem, 'id' | 'createdAt'>) => void;
  onDeleteTask: (id: string) => void;
  onGenerateSubtasks: (taskId: string, title: string) => Promise<void>;
}

export const TasksSection: React.FC<TasksSectionProps> = ({
  tasks,
  onToggleTask,
  onToggleSubtask,
  onAddTask,
  onDeleteTask,
  onGenerateSubtasks,
}) => {
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>('');
  const [newPriority, setNewPriority] = useState<TaskItem['priority']>('medium');
  const [newCategory, setNewCategory] = useState<TaskItem['category']>('Project');
  const [newDueDate] = useState<string>('Today');
  const [expandedTasks, setExpandedTasks] = useState<Record<string, boolean>>({});
  const [generatingSubtaskId, setGeneratingSubtaskId] = useState<string | null>(null);

  const completedCount = tasks.filter((t) => t.completed).length;
  const progressPercent = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  const filteredTasks = tasks.filter((t) => {
    if (filter === 'active') return !t.completed;
    if (filter === 'completed') return t.completed;
    return true;
  });

  const toggleExpand = (id: string) => {
    audioSynth.playClick();
    setExpandedTasks((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleToggleComplete = (task: TaskItem) => {
    onToggleTask(task.id);
    if (!task.completed) {
      audioSynth.playSuccess();
      try {
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#00f0ff', '#00ff9d', '#a855f7'],
        });
      } catch {}
    } else {
      audioSynth.playClick();
    }
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    audioSynth.playSend();
    onAddTask({
      title: newTitle.trim(),
      priority: newPriority,
      category: newCategory,
      completed: false,
      dueDate: newDueDate,
      estimatedTime: '30 min',
      subtasks: [],
    });
    setNewTitle('');
    setIsAdding(false);
  };

  const handleAIBreakdown = async (task: TaskItem) => {
    audioSynth.playPulse();
    setGeneratingSubtaskId(task.id);
    setExpandedTasks((prev) => ({ ...prev, [task.id]: true }));
    await onGenerateSubtasks(task.id, task.title);
    setGeneratingSubtaskId(null);
  };

  const getPriorityBadge = (p: TaskItem['priority']) => {
    switch (p) {
      case 'urgent':
        return 'text-rose-400 bg-rose-950/60 border-rose-500/40';
      case 'high':
        return 'text-amber-400 bg-amber-950/60 border-amber-500/40';
      case 'medium':
        return 'text-cyan-400 bg-cyan-950/60 border-cyan-500/40';
      case 'low':
        return 'text-slate-400 bg-slate-800 border-slate-700';
    }
  };

  return (
    <div className="cyber-panel rounded-xl overflow-hidden border border-cyan-500/20 bg-[#090e17]/90 shadow-xl flex flex-col h-full">
      {/* Card Header */}
      <div className="p-3 border-b border-cyan-500/20 bg-slate-950/80 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded bg-cyan-950/70 border border-cyan-500/40 text-cyan-400">
            <ListTodo className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-heading text-xs font-bold text-slate-100 uppercase tracking-wider flex items-center gap-1.5">
              Directives & Tasks <span className="text-[10px] font-mono text-cyan-400 font-normal">({tasks.length})</span>
            </h3>
            <div className="flex items-center gap-2 mt-0.5">
              <div className="w-24 bg-slate-800 h-1.5 rounded-full overflow-hidden border border-slate-700">
                <div 
                  className="bg-emerald-400 h-full rounded-full transition-all duration-300 shadow-[0_0_5px_#00ff9d]"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <span className="text-[10px] font-mono text-slate-400">{progressPercent}% complete</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              audioSynth.playClick();
              setIsAdding(!isAdding);
            }}
            className="flex items-center gap-1 px-2 py-1 rounded bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 text-xs font-mono transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="px-3 py-1.5 bg-slate-950/50 border-b border-slate-800/80 flex items-center justify-between text-[11px] font-mono">
        <div className="flex items-center gap-1">
          {(['all', 'active', 'completed'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => {
                audioSynth.playClick();
                setFilter(tab);
              }}
              className={`px-2 py-0.5 rounded capitalize transition-colors ${
                filter === tab 
                  ? 'bg-slate-800 text-cyan-300 font-bold' 
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <span className="text-slate-500 text-[10px]">
          {filteredTasks.length} shown
        </span>
      </div>

      {/* Inline Task Creator Form */}
      {isAdding && (
        <form onSubmit={handleCreateSubmit} className="p-3 border-b border-cyan-500/20 bg-slate-950/95 space-y-2.5">
          <input
            type="text"
            placeholder="Directive title / prompt..."
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            autoFocus
            className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-cyan-500/40 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
          />
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs font-mono">
              <select
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value as any)}
                className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-300 focus:outline-none"
              >
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>

              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as any)}
                className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-300 focus:outline-none"
              >
                <option value="Critical">Critical</option>
                <option value="Project">Project</option>
                <option value="Research">Research</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Personal">Personal</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-2.5 py-1 text-xs text-slate-400 hover:text-slate-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-heading font-bold text-xs rounded transition-colors"
              >
                Create
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Task List Content */}
      <div className="p-2.5 overflow-y-auto space-y-2 flex-1 max-h-[300px] lg:max-h-[340px]">
        {filteredTasks.length === 0 ? (
          <div className="p-6 text-center text-slate-500 text-xs font-mono">
            No directives in queue. Add one or ask Aetheris via chat!
          </div>
        ) : (
          filteredTasks.map((task) => {
            const isExpanded = expandedTasks[task.id];
            const hasSubtasks = task.subtasks && task.subtasks.length > 0;
            const completedSubCount = task.subtasks?.filter((s) => s.completed).length || 0;
            const isGenerating = generatingSubtaskId === task.id;

            return (
              <div
                key={task.id}
                className={`p-2.5 rounded-lg border transition-all ${
                  task.completed
                    ? 'bg-slate-950/40 border-slate-900 opacity-60'
                    : 'bg-slate-900/80 border-slate-800 hover:border-cyan-500/30'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <button
                    onClick={() => handleToggleComplete(task)}
                    className="mt-0.5 text-slate-400 hover:text-cyan-400 transition-colors shrink-0"
                  >
                    {task.completed ? (
                      <CheckSquare className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-500 hover:text-cyan-400" />
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1.5">
                      <span
                        onClick={() => handleToggleComplete(task)}
                        className={`text-xs font-sans font-medium cursor-pointer break-words ${
                          task.completed ? 'line-through text-slate-500' : 'text-slate-200'
                        }`}
                      >
                        {task.title}
                      </span>
                      <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded border uppercase shrink-0 ${getPriorityBadge(task.priority)}`}>
                        {task.priority}
                      </span>
                    </div>

                    {/* Metadata pills & action buttons */}
                    <div className="flex flex-wrap items-center justify-between gap-2 mt-2 text-[11px] font-mono text-slate-400">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] px-1.5 py-0.2 bg-slate-950 rounded text-slate-400 border border-slate-800">
                          {task.category}
                        </span>
                        {task.dueDate && (
                          <span className="flex items-center gap-1 text-[10px] text-slate-500">
                            <Clock className="w-2.5 h-2.5" />
                            {task.dueDate}
                          </span>
                        )}
                        {hasSubtasks && (
                          <span className="text-[10px] text-cyan-400/90 font-semibold">
                            {completedSubCount}/{task.subtasks?.length} subtasks
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5">
                        {/* AI Breakdown Button */}
                        {!task.completed && (
                          <button
                            onClick={() => handleAIBreakdown(task)}
                            disabled={isGenerating}
                            className="flex items-center gap-1 text-[10px] text-cyan-400 hover:text-cyan-300 bg-cyan-950/60 border border-cyan-500/30 px-1.5 py-0.5 rounded transition-colors"
                            title="Generate AI Subtasks Breakdown"
                          >
                            <Sparkles className={`w-2.5 h-2.5 ${isGenerating ? 'animate-spin' : ''}`} />
                            <span>{isGenerating ? 'Breakdown...' : 'AI Subtasks'}</span>
                          </button>
                        )}

                        {hasSubtasks && (
                          <button
                            onClick={() => toggleExpand(task.id)}
                            className="p-0.5 text-slate-400 hover:text-slate-200"
                          >
                            {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                          </button>
                        )}

                        <button
                          onClick={() => {
                            audioSynth.playClick();
                            onDeleteTask(task.id);
                          }}
                          className="p-0.5 text-slate-500 hover:text-rose-400 transition-colors"
                          title="Delete Directive"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* Subtasks Accordion Deck */}
                    {isExpanded && task.subtasks && task.subtasks.length > 0 && (
                      <div className="mt-2.5 pt-2 border-t border-slate-800/80 space-y-1.5 pl-2">
                        {task.subtasks.map((st) => (
                          <div
                            key={st.id}
                            onClick={() => {
                              audioSynth.playClick();
                              onToggleSubtask(task.id, st.id);
                            }}
                            className="flex items-center gap-2 text-xs font-sans text-slate-300 cursor-pointer hover:text-cyan-300 transition-colors group"
                          >
                            {st.completed ? (
                              <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                            ) : (
                              <div className="w-3 h-3 rounded-full border border-slate-600 group-hover:border-cyan-400 shrink-0" />
                            )}
                            <span className={`text-[11px] truncate ${st.completed ? 'line-through text-slate-500' : ''}`}>
                              {st.title}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
