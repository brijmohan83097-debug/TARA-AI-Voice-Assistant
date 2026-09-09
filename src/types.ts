export type SystemMode = 'NEURAL_FOCUS' | 'OVERCLOCK' | 'STEALTH' | 'DIAGNOSTIC';

export interface AttachedMedia {
  data: string; // base64 without data URI prefix
  mimeType: string;
  previewUrl: string; // data URL or object URL
  name?: string;
  source?: 'upload' | 'camera' | 'sample';
}

export type NodeType = 'hub' | 'memory' | 'skill' | 'workflow' | 'context';

export interface MindMapNode {
  id: string;
  label: string;
  type: NodeType;
  x: number;
  y: number;
  description: string;
  iconName?: string;
  status?: 'active' | 'idle' | 'executing' | 'dormant';
  category?: string;
  strength?: number; // 0-100 for memory strength or skill mastery
  lastTriggered?: string;
  tags?: string[];
  connections?: string[]; // IDs of connected nodes
}

export interface MindMapEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  animated?: boolean;
  type?: 'synapse' | 'pipeline' | 'dependency';
}

export interface LogoGraphicData {
  appName: string;
  tagline?: string;
  category?: string;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  iconType?: string;
  dataUrl: string;
  downloadFileName: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: string;
  imageUrl?: string;
  actionsExecuted?: {
    type:
      | 'task_created'
      | 'note_created'
      | 'node_added'
      | 'workflow_triggered'
      | 'system_mode_changed'
      | 'answer_call'
      | 'reject_call'
      | 'make_whatsapp_call'
      | 'make_phone_call'
      | 'announce_caller'
      | 'create_poster'
      | 'poster_created'
      | 'create_logo'
      | 'generate_pdf'
      | 'download_pdf';
    summary: string;
    details?: any;
  }[];
  suggestedPrompts?: string[];
  isStreaming?: boolean;
  status?: 'sent' | 'processing' | 'completed' | 'failed';
  resultImageUrl?: string;
  resultImageDownloadName?: string;
  logoGraphicData?: LogoGraphicData;
}

export interface TaskItem {
  id: string;
  title: string;
  category: 'Critical' | 'Research' | 'Maintenance' | 'Personal' | 'Project';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  completed: boolean;
  dueDate?: string;
  subtasks?: { id: string; title: string; completed: boolean }[];
  createdAt: string;
  estimatedTime?: string;
}

export interface NoteItem {
  id: string;
  title: string;
  content: string;
  category: string;
  pinned: boolean;
  tags: string[];
  updatedAt: string;
  color?: string;
}

export interface SystemLog {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'success' | 'exec';
  module: string;
  message: string;
}

export interface SystemTelemetry {
  neuralLoad: number; // percentage
  quantumMemory: number; // percentage
  activeSubroutines: number;
  latencyMs: number;
  tokenRate: number;
  securityLevel: string;
  uptimeSeconds: number;
}

export interface WorkflowPipeline {
  id: string;
  title: string;
  description: string;
  steps: string[];
  icon: string;
  status: 'idle' | 'running' | 'completed';
  lastRun?: string;
}

export interface PosterCardData {
  id: string;
  title: string;
  quote: string;
  author: string;
  category?: string;
  theme: 'cyber' | 'golden' | 'twilight' | 'emerald' | 'noir';
  imageUrl?: string | null;
  filter?: 'normal' | 'enhance' | 'warm' | 'noir' | 'cyber';
  overlayText?: string;
  overlayPosition?: 'bottom' | 'center' | 'top';
  brightness?: number;
  contrast?: number;
}
