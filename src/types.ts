export type TaraEmotion = 'calm_caring' | 'happy_excited' | 'empathy_support';

export interface TaraEmotionConfig {
  id: TaraEmotion;
  label: string;
  sublabel: string;
  emoji: string;
  accentColor: string;
  glowColorHex: string;
  gradientBg: string;
  badgeClasses: string;
  ringClasses: string;
  description: string;
  supportiveVoicePrefix: string;
  speakingButtonGradient?: string;
  speakingAudioBars?: string;
  speakingAmbientGlow?: string;
  speakingShockwaveClass?: string;
}

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
      | 'download_pdf'
      | 'set_emotion'
      | 'save_memory'
      | 'delete_memory';
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

export interface FabricationServiceItem {
  id: string;
  name: string;
  nameHi: string;
  category: 'shed' | 'railing' | 'gate' | 'grill' | 'shutter' | 'stairs' | 'custom';
  unit: string; // e.g. 'sq ft', 'running ft', 'kg', 'step'
  rateMin: number;
  rateMax?: number;
  description: string;
  material: string;
  warranty?: string;
  popular?: boolean;
  isActive: boolean;
  lastUpdated?: string;
}

export interface FabricationRatesConfig {
  businessName: string;
  businessNameHi: string;
  ownerName: string;
  tagline: string;
  phone: string;
  whatsapp: string;
  address: string;
  city: string;
  services: FabricationServiceItem[];
  lastModified: string;
}

export interface FabricationEstimate {
  serviceId: string;
  serviceName: string;
  unit: string;
  quantity: number;
  rateMin: number;
  rateMax: number;
  totalCostMin: number;
  totalCostMax: number;
  materialDescription: string;
}

export type LeadStatus = 'hot' | 'site_visit' | 'quote_sent' | 'deal_closed' | 'cold';

export interface HotLead {
  id: string;
  customerName: string;
  phoneNumber: string;
  serviceType: 'shed' | 'railing' | 'gate' | 'grill' | 'shutter' | 'stairs' | 'custom';
  serviceName: string;
  approxSize?: string; // e.g. "1200 sq ft" or "60 running ft"
  priceRangeMin: number;
  priceRangeMax: number;
  customerQuery: string;
  generatedHindiResponse: string;
  siteAddress?: string;
  status: LeadStatus;
  createdAt: string;
  notes?: string;
  source?: 'whatsapp_inquiry' | 'direct_call' | 'website_form';
  followUpDate?: string;
}

export type CallCategory = 'shed' | 'railing' | 'gate' | 'grill' | 'custom' | 'spam' | 'general';

export interface IncomingCallSession {
  id: string;
  callerName: string;
  callerNumber: string;
  timestamp: string;
  status: 'ringing' | 'active' | 'inquiry_in_progress' | 'completed' | 'spam_blocked';
  category?: CallCategory;
  isSpam: boolean;
  spamReason?: string;
  dialogueHistory: {
    sender: 'customer' | 'tara';
    text: string;
    timestamp: string;
  }[];
  customerRequirement?: string;
  estimatedValue?: number;
  urgency: 'urgent' | 'high' | 'normal' | 'low';
  summaryForBoss?: string;
}

export interface BossCallAlert {
  id: string;
  callId: string;
  callerName: string;
  callerNumber: string;
  serviceCategory: string; // 'Gate' | 'Shed' | 'Railing' | 'Grill' etc.
  urgency: 'urgent' | 'high' | 'normal';
  summary: string;
  customerDemand: string;
  siteLocation?: string;
  timestamp: string;
  estimatedBudget?: string;
  status: 'pending' | 'reviewed' | 'called_back' | 'dismissed';
}

export type MemoryCategory = 'personal' | 'preference' | 'plan' | 'fact';

export interface TaraMemoryItem {
  id: string;
  fact: string;
  category: MemoryCategory;
  timestamp: string;
  source?: 'user_said' | 'auto_learned' | 'manual';
  confidence?: number;
}



