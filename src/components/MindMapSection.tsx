import React, { useState, useRef } from 'react';
import { 
  Network, 
  Plus, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Search, 
  Cpu, 
  Terminal, 
  Search as SearchIcon, 
  Eye, 
  ShieldAlert, 
  UserCheck, 
  FolderKanban, 
  Zap, 
  Activity, 
  Play, 
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { MindMapNode, MindMapEdge, WorkflowPipeline } from '../types';
import { audioSynth } from '../utils/audio';

interface MindMapSectionProps {
  nodes: MindMapNode[];
  edges: MindMapEdge[];
  workflows: WorkflowPipeline[];
  onNodeClick: (node: MindMapNode) => void;
  onAddNodeClick: () => void;
  onExecuteWorkflow: (wfId: string) => void;
  onUpdateNodePosition: (id: string, x: number, y: number) => void;
}

export const MindMapSection: React.FC<MindMapSectionProps> = ({
  nodes,
  edges,
  workflows,
  onNodeClick,
  onAddNodeClick,
  onExecuteWorkflow,
  onUpdateNodePosition,
}) => {
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [startPan, setStartPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'mindmap' | 'workflows'>('mindmap');

  const containerRef = useRef<HTMLDivElement>(null);

  // Filtered nodes
  const filteredNodes = nodes.filter((n) => {
    const matchesFilter = filterType === 'all' || n.type === filterType;
    const matchesSearch = n.label.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          n.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          n.tags?.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  // Handle Dragging / Panning on SVG container
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === containerRef.current || (e.target as HTMLElement).tagName === 'svg') {
      setIsPanning(true);
      setStartPan({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setPan({
        x: e.clientX - startPan.x,
        y: e.clientY - startPan.y,
      });
    } else if (draggingNodeId && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const rawX = (e.clientX - rect.left - pan.x) / zoom;
      const rawY = (e.clientY - rect.top - pan.y) / zoom;
      onUpdateNodePosition(draggingNodeId, Math.round(rawX), Math.round(rawY));
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
    setDraggingNodeId(null);
  };

  const resetView = () => {
    audioSynth.playClick();
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const getNodeIcon = (iconName?: string, type?: string) => {
    switch (iconName) {
      case 'Cpu': return <Cpu className="w-4 h-4" />;
      case 'Terminal': return <Terminal className="w-4 h-4" />;
      case 'Search': return <SearchIcon className="w-4 h-4" />;
      case 'Eye': return <Eye className="w-4 h-4" />;
      case 'ShieldAlert': return <ShieldAlert className="w-4 h-4" />;
      case 'UserCheck': return <UserCheck className="w-4 h-4" />;
      case 'FolderKanban': return <FolderKanban className="w-4 h-4" />;
      case 'Zap': return <Zap className="w-4 h-4" />;
      case 'Activity': return <Activity className="w-4 h-4" />;
      default:
        if (type === 'hub') return <Cpu className="w-4 h-4 text-cyan-300" />;
        if (type === 'skill') return <Sparkles className="w-4 h-4 text-emerald-300" />;
        if (type === 'memory') return <FolderKanban className="w-4 h-4 text-purple-300" />;
        return <Zap className="w-4 h-4 text-amber-300" />;
    }
  };

  const getNodeTheme = (type: string) => {
    switch (type) {
      case 'hub':
        return {
          bg: 'bg-cyan-950/80',
          border: 'border-cyan-400 shadow-[0_0_25px_rgba(0,240,255,0.4)]',
          badge: 'bg-cyan-900/60 text-cyan-300',
          text: 'text-cyan-200 font-bold',
          line: '#00f0ff',
        };
      case 'skill':
        return {
          bg: 'bg-slate-900/90',
          border: 'border-emerald-500/60 hover:border-emerald-400 shadow-[0_0_15px_rgba(0,255,157,0.2)]',
          badge: 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/30',
          text: 'text-emerald-300',
          line: '#00ff9d',
        };
      case 'memory':
        return {
          bg: 'bg-slate-900/90',
          border: 'border-purple-500/60 hover:border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.2)]',
          badge: 'bg-purple-950/60 text-purple-300 border border-purple-500/30',
          text: 'text-purple-300',
          line: '#a855f7',
        };
      case 'workflow':
        return {
          bg: 'bg-slate-900/90',
          border: 'border-amber-500/60 hover:border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)]',
          badge: 'bg-amber-950/60 text-amber-300 border border-amber-500/30',
          text: 'text-amber-300',
          line: '#f59e0b',
        };
      default:
        return {
          bg: 'bg-slate-900',
          border: 'border-slate-700',
          badge: 'bg-slate-800 text-slate-300',
          text: 'text-slate-200',
          line: '#64748b',
        };
    }
  };

  return (
    <div className="flex flex-col h-full cyber-panel rounded-xl overflow-hidden border border-cyan-500/20 bg-[#090e17]/90 shadow-2xl">
      {/* Top Header & Navigation Deck */}
      <div className="p-3 border-b border-cyan-500/20 bg-slate-950/70 flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-cyan-950/60 border border-cyan-500/30 text-cyan-400">
            <Network className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h2 className="font-heading text-sm font-bold text-slate-100 flex items-center gap-2">
              NEURAL MIND-MAP <span className="text-[10px] font-mono text-cyan-400 font-normal px-1.5 py-0.2 bg-cyan-950/80 rounded border border-cyan-500/30">MEMORY & SKILLS</span>
            </h2>
            <p className="text-[11px] text-slate-400 font-mono">
              {nodes.length} Synaptic Nodes Connected // {edges.length} Neural Pathways
            </p>
          </div>
        </div>

        {/* Tab Switcher: Graph vs Pipeline Deck */}
        <div className="flex items-center gap-1 p-0.5 rounded-lg bg-slate-900 border border-slate-800">
          <button
            onClick={() => {
              audioSynth.playClick();
              setActiveTab('mindmap');
            }}
            className={`px-2.5 py-1 text-xs font-mono rounded flex items-center gap-1.5 transition-colors ${
              activeTab === 'mindmap' 
                ? 'bg-cyan-950/90 text-cyan-300 border border-cyan-500/40 font-semibold' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Network className="w-3 h-3" />
            <span>Neural Graph</span>
          </button>
          <button
            onClick={() => {
              audioSynth.playClick();
              setActiveTab('workflows');
            }}
            className={`px-2.5 py-1 text-xs font-mono rounded flex items-center gap-1.5 transition-colors ${
              activeTab === 'workflows' 
                ? 'bg-amber-950/90 text-amber-300 border border-amber-500/40 font-semibold' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="w-3 h-3 text-amber-400" />
            <span>Workflows ({workflows.length})</span>
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={onAddNodeClick}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-cyan-950/70 hover:bg-cyan-900/80 border border-cyan-500/40 text-cyan-300 font-mono text-xs hover:shadow-[0_0_10px_rgba(0,240,255,0.2)] transition-all"
            title="Add Memory Anchor or Skill Node"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Add Node</span>
          </button>
        </div>
      </div>

      {activeTab === 'mindmap' ? (
        <div className="relative flex-1 min-h-[380px] lg:min-h-[440px] flex flex-col bg-[#060a11] cyber-grid overflow-hidden select-none">
          {/* Subheader: Filter & Search Bar */}
          <div className="absolute top-3 left-3 right-3 z-10 flex flex-wrap items-center justify-between gap-2 pointer-events-auto">
            {/* Search filter */}
            <div className="relative flex items-center max-w-[200px] sm:max-w-[240px]">
              <Search className="w-3.5 h-3.5 absolute left-2.5 text-slate-500" />
              <input
                type="text"
                placeholder="Search synapses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-2.5 py-1 text-xs font-mono bg-slate-950/85 backdrop-blur-md border border-slate-800 focus:border-cyan-500/60 rounded-md text-slate-200 placeholder:text-slate-600 focus:outline-none"
              />
            </div>

            {/* Filter pills */}
            <div className="flex items-center gap-1 bg-slate-950/85 backdrop-blur-md p-0.5 rounded-md border border-slate-800">
              {[
                { id: 'all', label: 'All' },
                { id: 'skill', label: 'Skills' },
                { id: 'memory', label: 'Memories' },
                { id: 'workflow', label: 'Workflows' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => {
                    audioSynth.playClick();
                    setFilterType(f.id);
                  }}
                  className={`px-2 py-0.5 text-[11px] font-mono rounded transition-colors ${
                    filterType === f.id
                      ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/40 font-semibold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Canvas Zoom & Reset Controls */}
            <div className="flex items-center gap-1 bg-slate-950/85 backdrop-blur-md p-0.5 rounded-md border border-slate-800">
              <button
                onClick={() => setZoom(Math.min(zoom + 0.15, 2.0))}
                className="p-1 text-slate-400 hover:text-cyan-300 rounded hover:bg-slate-800"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setZoom(Math.max(zoom - 0.15, 0.5))}
                className="p-1 text-slate-400 hover:text-cyan-300 rounded hover:bg-slate-800"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={resetView}
                className="p-1 text-slate-400 hover:text-cyan-300 rounded hover:bg-slate-800"
                title="Reset View"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Interactive Mind Map Visual Stage */}
          <div
            ref={containerRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            className="relative w-full h-full cursor-grab active:cursor-grabbing overflow-hidden flex-1"
          >
            <div
              style={{
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                transformOrigin: 'center center',
                transition: isPanning || draggingNodeId ? 'none' : 'transform 0.15s ease-out',
                width: '100%',
                height: '100%',
                position: 'relative',
              }}
            >
              {/* SVG Synapse Lines with Flow Animations */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ minWidth: '800px', minHeight: '600px' }}>
                <defs>
                  <linearGradient id="grad-synapse" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#00f0ff" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#a855f7" stopOpacity="0.4" />
                  </linearGradient>
                  <linearGradient id="grad-pipeline" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#00f0ff" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.7" />
                  </linearGradient>
                  <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>

                {edges.map((edge) => {
                  const sourceNode = nodes.find((n) => n.id === edge.source);
                  const targetNode = nodes.find((n) => n.id === edge.target);
                  if (!sourceNode || !targetNode) return null;

                  const isPipeline = edge.type === 'pipeline';
                  const strokeColor = isPipeline ? 'url(#grad-pipeline)' : 'url(#grad-synapse)';
                  const strokeWidth = edge.animated ? 2 : 1.2;

                  return (
                    <g key={edge.id}>
                      <line
                        x1={sourceNode.x + 60}
                        y1={sourceNode.y + 25}
                        x2={targetNode.x + 60}
                        y2={targetNode.y + 25}
                        stroke={strokeColor}
                        strokeWidth={strokeWidth}
                        strokeDasharray={edge.animated ? '4,4' : 'none'}
                        className={edge.animated ? 'synapse-path-active' : ''}
                        opacity={0.65}
                      />
                      {/* Synapse pulse particle */}
                      {edge.animated && (
                        <circle
                          r="2.5"
                          fill={isPipeline ? '#f59e0b' : '#00f0ff'}
                          filter="url(#glow)"
                        >
                          <animateMotion
                            path={`M ${sourceNode.x + 60} ${sourceNode.y + 25} L ${targetNode.x + 60} ${targetNode.y + 25}`}
                            dur="3s"
                            repeatCount="indefinite"
                          />
                        </circle>
                      )}
                    </g>
                  );
                })}
              </svg>

              {/* Render Mind Map Nodes */}
              {filteredNodes.map((node) => {
                const theme = getNodeTheme(node.type);
                const isHub = node.type === 'hub';

                return (
                  <div
                    key={node.id}
                    style={{
                      left: `${node.x}px`,
                      top: `${node.y}px`,
                      transform: 'translate(0, 0)',
                    }}
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      setDraggingNodeId(node.id);
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      audioSynth.playClick();
                      onNodeClick(node);
                    }}
                    className={`absolute cursor-pointer transition-shadow rounded-xl border p-2.5 backdrop-blur-md ${theme.bg} ${theme.border} group`}
                  >
                    {/* Pulsing ring for Central Hub */}
                    {isHub && (
                      <div className="absolute -inset-1.5 rounded-xl border border-cyan-400/40 animate-pulse pointer-events-none"></div>
                    )}

                    <div className="flex items-start gap-2 min-w-[130px] max-w-[190px]">
                      <div className={`p-1.5 rounded-lg ${theme.badge} shrink-0 mt-0.5`}>
                        {getNodeIcon(node.iconName, node.type)}
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <div className="flex items-center justify-between gap-1">
                          <h4 className={`font-heading text-xs font-semibold truncate ${theme.text}`}>
                            {node.label}
                          </h4>
                          {node.strength !== undefined && (
                            <span className="text-[10px] font-mono text-cyan-400/90 font-bold shrink-0">
                              {node.strength}%
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400 truncate mt-0.5 font-sans">
                          {node.description}
                        </p>

                        {/* Node mini tags or strength bar */}
                        {node.strength !== undefined && (
                          <div className="w-full bg-slate-800/80 h-1 rounded-full overflow-hidden mt-1.5 border border-slate-700/50">
                            <div
                              className={`h-full rounded-full ${
                                node.type === 'skill' ? 'bg-emerald-400 shadow-[0_0_5px_#00ff9d]' : 
                                node.type === 'memory' ? 'bg-purple-400 shadow-[0_0_5px_#a855f7]' : 
                                'bg-cyan-400 shadow-[0_0_5px_#00f0ff]'
                              }`}
                              style={{ width: `${node.strength}%` }}
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Quick run button for workflow nodes */}
                    {node.type === 'workflow' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          audioSynth.playSend();
                          onExecuteWorkflow(node.id);
                        }}
                        className="mt-2 w-full py-1 px-2 rounded bg-amber-950/80 border border-amber-500/40 hover:bg-amber-900/90 text-amber-300 text-[10px] font-heading font-semibold flex items-center justify-center gap-1 transition-all"
                      >
                        <Play className="w-2.5 h-2.5 fill-amber-400" />
                        <span>TRIGGER PIPELINE</span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Bottom Floating Legend / Hint */}
            <div className="absolute bottom-2 left-3 right-3 z-10 flex flex-wrap items-center justify-between text-[11px] font-mono text-slate-400 pointer-events-none bg-slate-950/75 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-slate-800/60">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-cyan-400"></span> Central Hub
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span> Skills
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-purple-400"></span> Memories
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-400"></span> Workflows
                </span>
              </div>
              <span className="text-[10px] text-slate-500 hidden sm:inline">
                Drag nodes to reposition • Click to inspect
              </span>
            </div>
          </div>
        </div>
      ) : (
          /* Workflows Pipeline Deck Tab */
          <div className="p-4 overflow-y-auto flex-1 space-y-3 bg-[#070b12]">
            <div className="flex items-center justify-between">
              <h3 className="font-heading text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                Active Automation Pipelines
              </h3>
              <span className="text-xs font-mono text-slate-400">
                Autonomous background routines
              </span>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {workflows.map((wf) => {
                const isRunning = wf.status === 'running';
                return (
                  <div
                    key={wf.id}
                    className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/40 transition-all shadow-md group"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                      <div className="flex items-start gap-2.5">
                        <div className="p-2 rounded-lg bg-amber-950/60 border border-amber-500/30 text-amber-400 shrink-0 mt-0.5">
                          <Zap className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="font-heading text-sm font-bold text-slate-100 group-hover:text-amber-300 transition-colors">
                            {wf.title}
                          </h4>
                          <p className="text-xs text-slate-400 font-sans mt-0.5">
                            {wf.description}
                          </p>
                          {wf.lastRun && (
                            <p className="text-[11px] font-mono text-slate-500 mt-1">
                              Last run: {wf.lastRun}
                            </p>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          audioSynth.playSend();
                          onExecuteWorkflow(wf.id);
                        }}
                        disabled={isRunning}
                        className={`px-3 py-1.5 rounded-lg text-xs font-heading font-semibold flex items-center justify-center gap-1.5 transition-all shrink-0 ${
                          isRunning
                            ? 'bg-amber-900/40 text-amber-400 border border-amber-500/30 animate-pulse'
                            : 'bg-amber-950/70 hover:bg-amber-900/80 text-amber-300 border border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.15)]'
                        }`}
                      >
                        {isRunning ? (
                          <>
                            <RefreshCw className="w-3 h-3 animate-spin" />
                            <span>PROCESSING...</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-3 h-3 fill-amber-400" />
                            <span>EXECUTE STAGES</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Pipeline step indicators */}
                    <div className="mt-3 pt-3 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {wf.steps.map((step, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-1.5 p-1.5 rounded bg-slate-950/60 border border-slate-800/60 text-[11px] font-mono text-slate-300"
                        >
                          <span className="w-4 h-4 rounded-full bg-slate-800 text-[10px] flex items-center justify-center text-amber-400 font-bold shrink-0">
                            {idx + 1}
                          </span>
                          <span className="truncate">{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
  );
};
