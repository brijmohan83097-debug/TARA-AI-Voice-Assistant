import { MindMapNode, MindMapEdge, TaskItem, NoteItem, WorkflowPipeline, SystemLog } from '../types';

export const INITIAL_NODES: MindMapNode[] = [
  {
    id: 'core-tara',
    label: 'TARA CORE',
    type: 'hub',
    x: 400,
    y: 280,
    description: 'Central cognitive engine and Tara neural voice orchestration nucleus.',
    iconName: 'Cpu',
    status: 'active',
    category: 'Core System',
    strength: 100,
    connections: ['skill-code', 'skill-research', 'skill-vision', 'skill-crypto', 'mem-user', 'mem-project', 'wf-morning', 'wf-audit'],
    tags: ['Nucleus', 'Gemini 2.5 Flash', 'Voice TTS']
  },
  // Skills
  {
    id: 'skill-code',
    label: 'Code Synthesis',
    type: 'skill',
    x: 220,
    y: 130,
    description: 'Autonomous multi-language code generation, refactoring, and AST analysis.',
    iconName: 'Terminal',
    status: 'active',
    category: 'Cognitive Skills',
    strength: 96,
    lastTriggered: '10m ago',
    connections: ['core-tara', 'wf-audit'],
    tags: ['TypeScript', 'Rust', 'Python', 'Refactor']
  },
  {
    id: 'skill-research',
    label: 'Deep Research',
    type: 'skill',
    x: 580,
    y: 120,
    description: 'Multi-source synthesis, arXiv vector indexing, and dynamic hypothesis generation.',
    iconName: 'Search',
    status: 'active',
    category: 'Cognitive Skills',
    strength: 92,
    lastTriggered: '1h ago',
    connections: ['core-tara', 'mem-project'],
    tags: ['Web Index', 'arXiv', 'Synthesis']
  },
  {
    id: 'skill-vision',
    label: 'Neural Vision',
    type: 'skill',
    x: 640,
    y: 290,
    description: 'Real-time spatial perception, UI wireframe extraction, and visual anomaly detection.',
    iconName: 'Eye',
    status: 'idle',
    category: 'Cognitive Skills',
    strength: 88,
    connections: ['core-tara'],
    tags: ['OCR', 'Spatial', 'Visual Anomaly']
  },
  {
    id: 'skill-crypto',
    label: 'Zero-Trust Sec',
    type: 'skill',
    x: 160,
    y: 310,
    description: 'Post-quantum key exchange monitoring, sandboxed execution, and threat detection.',
    iconName: 'ShieldAlert',
    status: 'active',
    category: 'Cognitive Skills',
    strength: 99,
    connections: ['core-tara', 'wf-audit'],
    tags: ['AES-512', 'Zero-Trust', 'Sandboxing']
  },
  // Memory Nodes
  {
    id: 'mem-user',
    label: 'User Profile & Bias',
    type: 'memory',
    x: 230,
    y: 440,
    description: 'Context anchor: Prefers high-density dark UI, bilingual Hindi/English voice interaction.',
    iconName: 'UserCheck',
    status: 'active',
    category: 'Episodic Memory',
    strength: 95,
    connections: ['core-tara'],
    tags: ['Hindi/English', 'Voice Prefs', 'Tone']
  },
  {
    id: 'mem-project',
    label: 'Project Nebula Q3',
    type: 'memory',
    x: 570,
    y: 430,
    description: 'Mission target: Autonomous satellite constellation telemetry dashboard launch.',
    iconName: 'FolderKanban',
    status: 'active',
    category: 'Working Memory',
    strength: 91,
    connections: ['core-tara', 'skill-research', 'wf-morning'],
    tags: ['Target: Oct 2026', 'Satellite', 'Telemetry']
  },
  // Workflows
  {
    id: 'wf-morning',
    label: 'Morning Briefing Pipeline',
    type: 'workflow',
    x: 400,
    y: 80,
    description: 'Automated 4-stage pipeline: Calendar triage -> Priority matrix -> Weather & News -> Action plan.',
    iconName: 'Zap',
    status: 'idle',
    category: 'Automation Pipeline',
    strength: 100,
    connections: ['core-tara', 'mem-project'],
    tags: ['Scheduled: 08:00', 'Automated', '4-Step']
  },
  {
    id: 'wf-audit',
    label: 'System Health Audit',
    type: 'workflow',
    x: 390,
    y: 490,
    description: 'Runs integrity checks across active memory nodes, neural weights, and sandbox processes.',
    iconName: 'Activity',
    status: 'idle',
    category: 'Automation Pipeline',
    strength: 100,
    connections: ['core-tara', 'skill-code', 'skill-crypto'],
    tags: ['Diagnostic', 'Deep Scan']
  }
];

export const INITIAL_EDGES: MindMapEdge[] = [
  { id: 'e-core-code', source: 'core-tara', target: 'skill-code', animated: true, type: 'synapse' },
  { id: 'e-core-research', source: 'core-tara', target: 'skill-research', animated: true, type: 'synapse' },
  { id: 'e-core-vision', source: 'core-tara', target: 'skill-vision', animated: false, type: 'synapse' },
  { id: 'e-core-crypto', source: 'core-tara', target: 'skill-crypto', animated: true, type: 'synapse' },
  { id: 'e-core-user', source: 'core-tara', target: 'mem-user', animated: true, type: 'synapse' },
  { id: 'e-core-project', source: 'core-tara', target: 'mem-project', animated: true, type: 'synapse' },
  { id: 'e-core-morning', source: 'core-tara', target: 'wf-morning', animated: true, type: 'pipeline' },
  { id: 'e-core-audit', source: 'core-tara', target: 'wf-audit', animated: true, type: 'pipeline' },
  { id: 'e-research-project', source: 'skill-research', target: 'mem-project', animated: false, type: 'dependency' },
  { id: 'e-code-audit', source: 'skill-code', target: 'wf-audit', animated: false, type: 'dependency' },
  { id: 'e-crypto-audit', source: 'skill-crypto', target: 'wf-audit', animated: false, type: 'dependency' },
];

export const INITIAL_TASKS: TaskItem[] = [
  {
    id: 'task-1',
    title: 'Deploy Quantum Synapse Indexer to production cluster',
    category: 'Critical',
    priority: 'urgent',
    completed: false,
    dueDate: 'Today, 18:00',
    estimatedTime: '45 min',
    createdAt: new Date().toISOString(),
    subtasks: [
      { id: 'st-1', title: 'Verify TLS 1.3 certificate pinning', completed: true },
      { id: 'st-2', title: 'Execute staging cluster smoke tests', completed: true },
      { id: 'st-3', title: 'Switch ingress traffic routing to Canary', completed: false }
    ]
  },
  {
    id: 'task-2',
    title: 'Synthesize literature review for Neural State Space Models',
    category: 'Research',
    priority: 'high',
    completed: false,
    dueDate: 'Tomorrow',
    estimatedTime: '1.5 hrs',
    createdAt: new Date().toISOString(),
    subtasks: [
      { id: 'st-4', title: 'Query arXiv database for 2026 preprints', completed: true },
      { id: 'st-5', title: 'Generate comparative benchmark matrix', completed: false }
    ]
  },
  {
    id: 'task-3',
    title: 'Recalibrate local vector embeddings cache',
    category: 'Maintenance',
    priority: 'medium',
    completed: false,
    dueDate: 'In 2 days',
    estimatedTime: '20 min',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'task-4',
    title: 'Review Project Nebula orbital simulation telemetry',
    category: 'Project',
    priority: 'medium',
    completed: true,
    dueDate: 'Yesterday',
    estimatedTime: '30 min',
    createdAt: new Date().toISOString(),
  }
];

export const INITIAL_NOTES: NoteItem[] = [
  {
    id: 'note-1',
    title: 'Neural Architecture Protocol v4.8',
    content: 'All incoming commands undergo multi-pass intention parsing. Memory graph is synced in real-time with episodic vector weightings.',
    category: 'Architecture',
    pinned: true,
    tags: ['System', 'Protocol', 'v4.8'],
    updatedAt: '12m ago',
    color: 'cyan'
  },
  {
    id: 'note-2',
    title: 'Project Nebula Q3 Launch Parameters',
    content: 'Target orbital altitude: 550km LEO. Downlink bandwidth: 10 Gbps laser mesh. Ground stations: Svalbard, Perth, Austin.',
    category: 'Project',
    pinned: true,
    tags: ['Nebula', 'Telemetry', 'Satellite'],
    updatedAt: '2h ago',
    color: 'emerald'
  },
  {
    id: 'note-3',
    title: 'Quantum Key Exchange Notes',
    content: 'Ephemeral BB84 protocol fallback configured. Key rotation interval: 300 seconds. Latency overhead < 4.2ms.',
    category: 'Security',
    pinned: false,
    tags: ['Crypto', 'Quantum', 'Keys'],
    updatedAt: '1d ago',
    color: 'amber'
  }
];

export const INITIAL_WORKFLOWS: WorkflowPipeline[] = [
  {
    id: 'wf-1',
    title: 'Executive Morning Briefing',
    description: 'Synthesizes daily priorities, calendar agenda, critical alerts, and news digest into an actionable intelligence memo.',
    icon: 'SunMedium',
    steps: ['Triage Pending Directives', 'Query Satellite Telemetry', 'Assess Threat Matrix', 'Generate Daily Briefing'],
    status: 'idle',
    lastRun: 'Today, 07:30'
  },
  {
    id: 'wf-2',
    title: 'Deep System Security Audit',
    description: 'Performs vulnerability scanning across node graph synapses, sandboxed memory partitions, and external APIs.',
    icon: 'ShieldCheck',
    steps: ['Scan Memory Partitions', 'Verify Quantum Cryptographic Hashes', 'Audit Active API Tokens', 'Compile Compliance Report'],
    status: 'idle',
    lastRun: 'Yesterday'
  },
  {
    id: 'wf-3',
    title: 'Cognitive Memory Defrag & Consolidation',
    description: 'Compresses short-term episodic logs into long-term knowledge anchors and prunes redundant cognitive nodes.',
    icon: 'Cpu',
    steps: ['Vector Cluster Analysis', 'Prune Weak Synaptic Edges', 'Strengthen Core Context Anchors', 'Reindex Graph Embedding Cache'],
    status: 'idle',
    lastRun: '3 days ago'
  }
];

export const INITIAL_LOGS: SystemLog[] = [
  { id: 'log-1', timestamp: '08:30:12', level: 'info', module: 'NEURAL_KERNEL', message: 'Tara Voice Assistant OS initialized. Gemini 2.5 Flash engine & Hindi TTS ready.' },
  { id: 'log-2', timestamp: '08:31:05', level: 'success', module: 'MEMORY_GRAPH', message: 'Synapse network verified. 9 nodes, 11 active bidirectional edges linked.' },
  { id: 'log-3', timestamp: '08:32:44', level: 'info', module: 'SECURITY_DAEMON', message: 'Zero-trust sandbox active. Quantum encryption handshake acknowledged.' },
  { id: 'log-4', timestamp: '08:33:19', level: 'exec', module: 'AI_DISPATCHER', message: 'Ready for user voice & command stream on port 3000.' },
];
