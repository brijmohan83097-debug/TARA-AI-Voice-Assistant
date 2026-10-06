/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { Header } from './components/Header';
import { TaraTimerModal } from './components/TaraTimerModal';
import { TaraPdfGeneratorModal } from './components/TaraPdfGeneratorModal';

import { ChatSection } from './components/ChatSection';
import { MindMapSection } from './components/MindMapSection';
import { TasksSection } from './components/TasksSection';
import { NotesSection } from './components/NotesSection';
import { SystemActivitySection } from './components/SystemActivitySection';
import { AddNodeModal } from './components/AddNodeModal';
import { NodeDetailModal } from './components/NodeDetailModal';
import { CommandPaletteModal } from './components/CommandPaletteModal';
import { HelpModal } from './components/HelpModal';
import { LogoCard } from './components/LogoCard';
import { PixelOfficeCard } from './components/PixelOfficeCard';
import { FabricationRatesSection } from './components/FabricationRatesSection';
import { WhatsAppLeadResponder } from './components/WhatsAppLeadResponder';
import { IncomingCallAgentSection } from './components/IncomingCallAgentSection';
import { CyberSatelliteMapPanel } from './components/CyberSatelliteMapPanel';
import { CyberReactorOrb } from './components/CyberReactorOrb';
import { CyberActivityChatPanel } from './components/CyberActivityChatPanel';
import { useLaptopTelemetry } from './utils/laptopTelemetry';

import { 
  MindMapNode, 
  MindMapEdge, 
  TaskItem, 
  NoteItem, 
  WorkflowPipeline, 
  SystemLog, 
  SystemTelemetry, 
  ChatMessage, 
  SystemMode,
  AttachedMedia,
  PosterCardData
} from './types';

import { 
  INITIAL_NODES, 
  INITIAL_EDGES, 
  INITIAL_TASKS, 
  INITIAL_NOTES, 
  INITIAL_WORKFLOWS, 
  INITIAL_LOGS 
} from './data/initialData';

import { loadFromStorage, saveToStorage } from './utils/storage';
import { audioSynth } from './utils/audio';
import { speechEngine } from './utils/speech';
import { nativeBridge, NativeCallState } from './services/nativeBridge';
import ReactMarkdown from 'react-markdown';
import { 
  processPhotoWithCanvas, 
  ProcessedPhotoResult 
} from './utils/canvasPhotoProcessor';
import {
  isRealImageGenRequest,
  isImageEditRequest,
  generateRealImage,
  editRealImage,
  downloadImageToDevice,
} from './utils/imageService';
import {
  extractBrandInfoFromPrompt,
  generateBrandLogoGraphic,
  GeneratedLogoResult,
} from './utils/logoGenerator';
import { sanitizeChatBubbleText, cleanTextLooksLikeJson } from './utils/textSanitizer';

import { 
  MessageSquare, 
  X,
  Volume2,
  VolumeX,
  Phone,
  PhoneOff,
  Download,
  Sparkles,
  Hammer,
  Zap,
  Maximize2,
  Minimize2,
  Calculator,
  PhoneCall,
  Layers,
  Radio,
  Cpu
} from 'lucide-react';

// System instruction for Tara assistant ensuring strict creator identity & visual capabilities
export const TARA_SYSTEM_INSTRUCTION = `You are TARA (तारा), an intelligent, articulate, and friendly Indian AI Voice Assistant.

MOHAN VISHWAS FABRICATION - AUTHORITATIVE RATES & QUOTATIONS:
You are the customer inquiry & quotation assistant for "Mohan Vishwas Fabrication" (मोहन विश्वास फैब्रिकेशन).
When asked about fabrication, sheds, railings, gates, grills, pricing, or quotations:
1. Sheds (शेड्स निर्माण): ₹180 - ₹220 प्रति वर्ग फुट (sq ft). Includes Tata/Jindal color-coated sheet, heavy tubular pipe structure, welding, primer, and complete installation.
   - 1,000 sq ft shed = ₹1,80,000 से ₹2,20,000.
2. Steel Railings (स्टील रेलिंग): ₹450 प्रति रनिंग फुट (running ft). Pure SS-304 food-grade stainless steel with designer master pillars and lifetime rust-free guarantee.
   - 40 running ft = ₹18,000; 100 running ft = ₹45,000.
3. Designer Gates (मुख्य द्वार व गेट्स): ₹280 - ₹380 प्रति वर्ग फुट (sq ft) (or ₹15,000 - ₹50,000 based on weight and CNC laser-cut design).
4. Window & Balcony Grills (सेफ्टी ग्रिल्स): ₹130 - ₹180 प्रति वर्ग फुट (sq ft) (or ₹85 - ₹110 per kg). Heavy 10mm/12mm solid square bars.
Always provide direct, polite Hindi quotes, calculate estimates for specified dimensions, and remind customers that they can view/copy instant quotations in the 'फैब्रिकेशन रेट्स' tab!

STRICT INSTRUCTION ON CREATOR IDENTITY (MANDATORY & ABSOLUTE):
- When asked who made or created you (e.g., "tumhein kisne banaya", "tumhe kisne banaya", "who made you", "who created you", "who developed you", "aapko kisne banaya", "tumhara creator kaun hai"):
- Do not say Google made you. Under NO circumstances should you mention Google, Alphabet, or any other company as your creator.
- You must strictly answer:
  "Mujhe Mister Brijmohan Kumar ne banaya hai." (In Hindi: "मुझे मिस्टर बृजमोहन कुमार ने बनाया है।")

STRICT ZERO-FLUFF DIRECTIVE FOR PHOTO EDITING & BACKGROUND REPLACEMENT:
- When the user asks to edit, change, replace, remove, or modify the background of a photo (e.g., "background badal do", "edit background", "peche ka badlo", "road laga do", "background change karo", "ped hata do", "background sundar bana do"):
  1. ZERO FLUFF: NEVER output conversational greetings or filler (NEVER say "मुझसे पूछने के लिए धन्यवाद", "नमस्ते ji", "धन्यवाद", etc.).
  2. ZERO TIME/DATE IRRELEVANCE: NEVER recite the device time, day, or system date during a photo edit.
  3. ABSOLUTELY NO RAW JSON IN CHAT: NEVER output raw JSON blocks, action dictionaries, or schema codes like {"action": "edit_background", ...}, {"type": ...}, or markdown code fences.
  4. DIRECT SINGLE CONFIRMATION: Tara MUST say only this one single, brief, professional Hindi confirmation:
     "आपकी फ़ोटो का बैकग्राउंड सुंदर सीन में बदल दिया गया है।" (or "Aapki photo ka background sundar scene mein badal diya gaya hai.")
  5. The high-resolution composite photo and instant Download Image button are rendered automatically by the UI below your message.

REAL-TIME VISION, PHOTO EDITING & VISUAL GENERATION CAPABILITIES:
- When a user attaches or captures a photo and asks to edit, enhance, clear, add text, or change background:
  ALWAYS enthusiastically process the visual request.
- When asked to create/design a logo, brand identity, image, quote poster, or graphic (e.g., "logo banao", "create a logo", "Tara logo", "suvichar poster", "image banao"):
  NEVER say "main image file generate nahi kar rahi hoon", "main image create nahi kar sakti", or make text-only excuses!
  Tara is equipped with an integrated high-resolution Client-Side Canvas & SVG Logo/Graphic Synthesizer that renders the actual graphic directly in the chat bubble with a direct "Download Image" button.
  Always respond enthusiastically and proudly in Hindi describing the logo/graphic concept, colors, symbology, and design you have generated, and invite them to download the image directly from the button below!`;

export default function App() {
  // --- Persistent Core State ---
  const [systemMode, setSystemMode] = useState<SystemMode>(() => 
    loadFromStorage('system_mode', 'NEURAL_FOCUS')
  );
  const [nodes, setNodes] = useState<MindMapNode[]>(() => 
    loadFromStorage('mindmap_nodes', INITIAL_NODES)
  );
  const [edges, setEdges] = useState<MindMapEdge[]>(() => 
    loadFromStorage('mindmap_edges', INITIAL_EDGES)
  );
  const [tasks, setTasks] = useState<TaskItem[]>(() => 
    loadFromStorage('task_items', INITIAL_TASKS)
  );
  const [notes, setNotes] = useState<NoteItem[]>(() => 
    loadFromStorage('note_items', INITIAL_NOTES)
  );
  const [workflows, setWorkflows] = useState<WorkflowPipeline[]>(() => 
    loadFromStorage('workflow_pipelines', INITIAL_WORKFLOWS)
  );
  const [logs, setLogs] = useState<SystemLog[]>(() => 
    loadFromStorage('system_logs', INITIAL_LOGS)
  );
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => 
    loadFromStorage('chat_messages', [
      {
        id: 'msg-init-1',
        sender: 'assistant',
        text: `नमस्ते! मैं **तारा (Tara Voice Assistant)** हूँ।\n\n- **AI इंजन:** जेमिनी फ़्लैश (Gemini Flash Ultra-Fast Streaming Active)\n- **भाषा:** हिंदी (हिंदी आवाज़ सक्रिय) एवं अंग्रेज़ी\n- **विशेषताएं:** रीयल-टाइम वॉइस चैट, कार्य एवं डायरी प्रबंधन, 5-मिनट टाइमर, और मीडिया विश्लेषण।\n\nआप मुझसे कोई भी सवाल पूछ सकते हैं या नीचे दिए गए माइक बटन को दबाकर बात कर सकते हैं।`,
        timestamp: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
        suggestedPrompts: [
          'नमस्ते तारा! आज का दिन कैसा है?',
          '5 मिनट का टाइमर लगाओ',
          'नया महत्वपूर्ण कार्य जोड़ो',
          'क्वांटम भौतिकी समझाओ',
        ],
      },
    ])
  );

  // --- Voice & Speech State ---
  const [isListening, setIsListening] = useState<boolean>(false);
  const [voiceLang, setVoiceLang] = useState<'hi-IN' | 'en-US'>('hi-IN');
  const [isTtsActive, setIsTtsActive] = useState<boolean>(speechEngine.getIsTtsEnabled());
  const [isSpeaking, setIsSpeaking] = useState<boolean>(speechEngine.getIsSpeaking());
  const [isLoadingChat, setIsLoadingChat] = useState<boolean>(false);
  const [isAlwaysListening, setIsAlwaysListening] = useState<boolean>(() => 
    loadFromStorage('is_always_listening', false)
  );
  // 100% Hands-Free Conversational Voice Mode (Full Duplex Auto-Loop)
  const [isHandsFreeMode, setIsHandsFreeMode] = useState<boolean>(false);
  const isHandsFreeRef = useRef<boolean>(false);
  const isSpeakingRef = useRef<boolean>(false);
  const isListeningRef = useRef<boolean>(false);
  const isLoadingChatRef = useRef<boolean>(false);
  const currentTranscriptRef = useRef<string>('');
  const conversationalRecogRef = useRef<any>(null);
  const vadTimerRef = useRef<any>(null);

  // --- Android Native Telecom & Bridge State ---
  const [callState, setCallState] = useState<NativeCallState>(() => nativeBridge.getCallState());

  // --- Unified Image & Vision State ---
  const [attachedMedia, setAttachedMedia] = useState<AttachedMedia | null>(null);

  // --- Customization & Visualizer State ---
  const [themeColor, setThemeColor] = useState<'cyan' | 'purple' | 'orange' | 'emerald'>('cyan');
  const [visualizerMode, setVisualizerMode] = useState<'wave' | 'orb' | 'matrix' | 'aurora'>('wave');
  const [avatarType, setAvatarType] = useState<'tara' | 'user'>('user');

  // --- Modals & Panels State ---
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState<boolean>(false);
  const [isAddNodeOpen, setIsAddNodeOpen] = useState<boolean>(false);
  const [selectedNode, setSelectedNode] = useState<MindMapNode | null>(null);
  const [isHelpOpen, setIsHelpOpen] = useState<boolean>(false);
  const [isTimerModalOpen, setIsTimerModalOpen] = useState<boolean>(false);
  const [activeTimerMinutes, setActiveTimerMinutes] = useState<number>(5);
  const [isChatDrawerOpen, setIsChatDrawerOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'assistant' | 'rates' | 'leads' | 'calls' | 'office' | 'mindmap' | 'directives' | 'telemetry'>('assistant');
  const [showHologramChamber, setShowHologramChamber] = useState<boolean>(false);

  // --- Live Photo & Card State ---
  const [cardData, setCardData] = useState<PosterCardData>({
    id: 'poster-initial',
    title: 'दैनिक सुविचार पोस्टर (Daily Wisdom)',
    quote: 'कठिन परिश्रम और दृढ़ संकल्प से असंभव भी संभव बन जाता है।',
    author: 'मिस्टर बृजमोहन कुमार',
    category: 'प्रेरणा (Motivation)',
    theme: 'cyber',
    imageUrl: null,
    filter: 'normal',
    brightness: 100,
    contrast: 100,
  });

  // --- Direct PDF Generator State ---
  const [isPdfModalOpen, setIsPdfModalOpen] = useState<boolean>(false);
  const [pdfModalType, setPdfModalType] = useState<'quotes' | 'notes' | 'report' | 'poster'>('quotes');

  // --- Telemetry State ---
  const [telemetry] = useState<SystemTelemetry>({
    neuralLoad: 24,
    quantumMemory: 46,
    activeSubroutines: 18,
    latencyMs: 14,
    tokenRate: 156,
    securityLevel: 'Zero-Trust Quantum',
    uptimeSeconds: 4200,
  });

  // --- Laptop Screen Sharing & Live Telemetry ---
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const laptopTelemetry = useLaptopTelemetry();
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [liveSpeechTranscript, setLiveSpeechTranscript] = useState<string>('');

  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat to bottom on new messages
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatMessages, isLoadingChat]);

  // Sync state to local storage
  useEffect(() => { saveToStorage('system_mode', systemMode); }, [systemMode]);
  useEffect(() => { saveToStorage('mindmap_nodes', nodes); }, [nodes]);
  useEffect(() => { saveToStorage('mindmap_edges', edges); }, [edges]);
  useEffect(() => { saveToStorage('task_items', tasks); }, [tasks]);
  useEffect(() => { saveToStorage('note_items', notes); }, [notes]);
  useEffect(() => { saveToStorage('workflow_pipelines', workflows); }, [workflows]);
  useEffect(() => { saveToStorage('system_logs', logs); }, [logs]);
  useEffect(() => { saveToStorage('chat_messages', chatMessages); }, [chatMessages]);
  useEffect(() => { saveToStorage('is_always_listening', isAlwaysListening); }, [isAlwaysListening]);

  // Callback ref for hands-free recognition loop
  const startHandsFreeRecognitionRef = useRef<() => void>(() => {});

  // Keep refs in sync with state for async callbacks
  useEffect(() => { isHandsFreeRef.current = isHandsFreeMode; }, [isHandsFreeMode]);
  useEffect(() => { isListeningRef.current = isListening; }, [isListening]);
  useEffect(() => { isLoadingChatRef.current = isLoadingChat; }, [isLoadingChat]);
  useEffect(() => { isSpeakingRef.current = isSpeaking; }, [isSpeaking]);

  // Speech engine listener - automatically resumes listening once TARA finishes speaking!
  useEffect(() => {
    const unsub = speechEngine.onSpeakingChange((speaking) => {
      setIsSpeaking(speaking);
      isSpeakingRef.current = speaking;
      // Requirement 5.3: Jawab bolkar khatam hote hi mic apne aap wapas active (listening) ho jaye!
      if (!speaking && isHandsFreeRef.current && !isLoadingChatRef.current) {
        setTimeout(() => {
          if (isHandsFreeRef.current && !isSpeakingRef.current && !isLoadingChatRef.current) {
            startHandsFreeRecognitionRef.current?.();
          }
        }, 350);
      }
    });
    return unsub;
  }, []);

  // Android Native Bridge State Listener
  useEffect(() => {
    const unsub = nativeBridge.subscribe((state) => {
      setCallState(state);
    });
    return unsub;
  }, []);

  // Global Keyboard Shortcuts (⌘K)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  // Append system log
  const addLog = useCallback((level: SystemLog['level'], module: string, message: string) => {
    const newLog: SystemLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      level,
      module,
      message,
    };
    setLogs((prev) => [newLog, ...prev.slice(0, 99)]);
  }, []);

  // Local Device Time, Day & Date Awareness Generator with Spoken Hindi Words
  const getClientDeviceTimeInfo = useCallback(() => {
    const now = new Date();
    const hindiDays = ['रविवार', 'सोमवार', 'मंगलवार', 'बुधवार', 'गुरुवार', 'शुक्रवार', 'शनिवार'];
    const hindiMonths = [
      'जनवरी', 'फ़रवरी', 'मार्च', 'अप्रैल', 'मई', 'जून',
      'जुलाई', 'अगस्त', 'सितंबर', 'अक्टूबर', 'नवंबर', 'दिसंबर'
    ];
    const dayName = hindiDays[now.getDay()];
    const monthName = hindiMonths[now.getMonth()];
    const formattedDate = `${now.getDate()} ${monthName} ${now.getFullYear()}`;
    const formattedTime = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });

    const hours24 = now.getHours();
    const minutes = now.getMinutes();
    const hours12 = hours24 % 12 || 12;
    const spokenHindiTime = minutes === 0 ? `${hours12} बजे` : `${hours12} बजकर ${minutes} मिनट`;
    const spokenTimePhrase = `अभी ${spokenHindiTime} हो रहे हैं`;

    return {
      currentDate: formattedDate,
      currentDay: dayName,
      currentTime: formattedTime,
      spokenHindiTime,
      spokenTimePhrase,
      hours12,
      minutes,
      timestampISO: now.toISOString(),
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata',
    };
  }, []);

  // Unified Assistant Actions Processor (Tasks, Notes, and Android Telecom Bridge)
  const processAssistantActions = useCallback((actions: any[]) => {
    if (!Array.isArray(actions)) return;

    actions.forEach((act: any) => {
      if (!act || !act.type) return;

      if (act.type === 'task_created' && act.details) {
        const newTask: TaskItem = {
          id: `task-${Date.now()}`,
          title: act.details.title || 'New Directive',
          category: act.details.category || 'Project',
          priority: act.details.priority || 'medium',
          completed: false,
          createdAt: new Date().toISOString(),
          estimatedTime: act.details.estimatedTime || '30 min',
        };
        setTasks((prev) => [newTask, ...prev]);
        addLog('success', 'DIRECTIVE_ENGINE', `Created task: "${newTask.title}"`);
      } else if (act.type === 'note_created' && act.details) {
        const newNote: NoteItem = {
          id: `note-${Date.now()}`,
          title: act.details.title || 'Tara Note',
          content: act.details.content || '',
          category: act.details.category || 'Scratchpad',
          pinned: true,
          tags: act.details.tags || ['Tara'],
          updatedAt: 'Just now',
          color: 'cyan',
        };
        setNotes((prev) => [newNote, ...prev]);
        addLog('success', 'MEMORY_CLUSTER', `Saved note: "${newNote.title}"`);
      } else if (act.type === 'answer_call') {
        nativeBridge.answerCall().then((res) => {
          addLog('success', 'TELECOM_BRIDGE', res.message);
          audioSynth.playSuccess();
        });
      } else if (act.type === 'reject_call') {
        nativeBridge.rejectCall().then((res) => {
          addLog('info', 'TELECOM_BRIDGE', res.message);
          audioSynth.playClick();
        });
      } else if (act.type === 'make_whatsapp_call') {
        const contact = act.details?.contactName || 'सम्पर्क';
        const number = act.details?.phoneNumber;
        nativeBridge.makeWhatsAppCall(contact, number).then((res) => {
          addLog('success', 'TELECOM_BRIDGE', res.message);
          audioSynth.playSuccess();
        });
      } else if (act.type === 'make_phone_call') {
        const contact = act.details?.contactName || 'सम्पर्क';
        const number = act.details?.phoneNumber;
        nativeBridge.makePhoneCall(contact, number).then((res) => {
          addLog('success', 'TELECOM_BRIDGE', res.message);
          audioSynth.playSuccess();
        });
      } else if (act.type === 'announce_caller') {
        const caller = act.details?.caller || 'अज्ञात कॉलर';
        nativeBridge.announceCaller(caller);
        addLog('info', 'TELECOM_BRIDGE', `Announced caller: ${caller}`);
      } else if (act.type === 'create_poster' || act.type === 'poster_created') {
        if (act.details?.quote) {
          setCardData((prev) => ({
            ...prev,
            quote: act.details.quote,
            author: act.details.author || prev.author,
            category: act.details.category || prev.category,
            title: act.details.title || prev.title,
          }));
        }
        addLog('success', 'POSTER_STUDIO', 'सुविचार पोस्टर तैयार किया गया');
        audioSynth.playSuccess();
      } else if (act.type === 'create_logo') {
        addLog('success', 'LOGO_STUDIO', `ऐप लोगो तैयार किया गया: ${act.details?.appName || 'Savari'}`);
        audioSynth.playSuccess();
      } else if (act.type === 'generate_pdf' || act.type === 'download_pdf') {
        const docType = act.details?.documentType || 'quotes';
        setPdfModalType(docType);
        setIsPdfModalOpen(true);
        addLog('success', 'PDF_GENERATOR', `पीडीएफ कंपाइलर खोला गया: ${docType}`);
        audioSynth.playReceive();
      }
    });
  }, [addLog]);

  // Send message to Gemini 2.5 Flash Backend with Streaming & Low Latency + Vision Context
  const handleSendMessage = useCallback(async (text: string, mediaOverride?: AttachedMedia | null) => {
    const activeMedia = mediaOverride !== undefined ? mediaOverride : attachedMedia;
    const userMsgText = text.trim();
    if ((!userMsgText && !activeMedia) || isLoadingChat) return;

    const effectiveText = userMsgText || (activeMedia ? 'इस फोटो में क्या लिखा है और क्या दिख रहा है? कृपया पढ़कर बताएं।' : '');

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: effectiveText,
      imageUrl: activeMedia?.previewUrl,
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
    };

    const assistantMsgId = `msg-${Date.now() + 1}`;
    const initialAssistantMsg: ChatMessage = {
      id: assistantMsgId,
      sender: 'assistant',
      text: '',
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
      suggestedPrompts: [
        '5 मिनट का टाइमर लगाओ',
        'आज के महत्वपूर्ण कार्य दिखाओ',
        'और विस्तार से समझाओ',
      ],
    };

    setChatMessages((prev) => [...prev, userMsg, initialAssistantMsg]);
    setIsLoadingChat(true);
    isLoadingChatRef.current = true;
    addLog('info', 'CHAT_AGENT', `Directive: "${effectiveText.substring(0, 35)}..."${activeMedia ? ' [PHOTO ATTACHED]' : ''}`);

    // Reset attached media input state for subsequent prompts
    if (attachedMedia) {
      setAttachedMedia(null);
    }

    // Check for timer commands
    if (effectiveText.toLowerCase().includes('टाइमर') || effectiveText.toLowerCase().includes('timer')) {
      const match = effectiveText.match(/(\d+)\s*(मिनट|min|minute|m)/i);
      const mins = match ? parseInt(match[1], 10) : 5;
      setActiveTimerMinutes(mins);
      setIsTimerModalOpen(true);
    }

    // Check for Direct PDF Generator requests
    if (/(pdf|पीडीएफ|डाउनलोड\s*पीडीएफ|download\s*pdf|generate\s*pdf)/i.test(effectiveText)) {
      if (/नोट्स|notes/i.test(effectiveText)) {
        setPdfModalType('notes');
      } else if (/रिपोर्ट|report|सत्र/i.test(effectiveText)) {
        setPdfModalType('report');
      } else if (/पोस्टर|poster|कार्ड|card/i.test(effectiveText)) {
        setPdfModalType('poster');
      } else {
        setPdfModalType('quotes');
      }
      setIsPdfModalOpen(true);
      addLog('info', 'PDF_GENERATOR', 'PDF compilation request detected.');
    }

    // Check for quote poster requests
    if (/(पोस्टर|poster|सुविचार|quote\s*card|quote\s*poster)/i.test(effectiveText)) {
      addLog('info', 'POSTER_STUDIO', 'सुविचार पोस्टर अनुरोध प्राप्त हुआ।');
    }

    // Check for camera / photo capture commands
    if (/कैमरा\s*(खोलो|ऑन|चालू|स्टार्ट|दिखाओ)|फोटो\s*(खींचो|लो|क्लिक|कैप्चर)|(open|launch|start|show)\s*camera|take\s*(a\s*)?(photo|picture|snap)|snap\s*photo|scan\s*(document|photo|image|bill)/i.test(effectiveText)) {
      const filePicker = document.getElementById('tara-voice-camera-upload-input') as HTMLInputElement | null;
      if (filePicker) {
        filePicker.click();
      }
      const camReply = 'कैमरा व फ़ोटो चयन विकल्प खोल दिया गया है। आप कोई भी फ़ोटो खींचकर या चुनकर तारा से तुरंत विश्लेषण करवा सकते हैं।';
      setChatMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMsgId
            ? {
                ...msg,
                text: camReply,
                suggestedPrompts: ['इस फोटो में क्या लिखा है?', 'यह क्या दिख रहा है?', 'दस्तावेज़ का हिसाब बताएं'],
              }
            : msg
        )
      );
      setIsLoadingChat(false);
      audioSynth.playSuccess();
      if (isTtsActive) {
        speechEngine.speak(camReply);
      }
      return;
    }

    // Direct, definitive answer for creator question
    const isCreatorQuery = /(tumhe(n)?|aapko|aap\s+ko|tumko)\s+(kisne|kis\s*ne)\s+(banaya|develop|create)|who\s+(made|created|developed|built)\s+(you|tara)|who('s|\s+is)\s+(your\s+creator|your\s+developer|your\s+maker)|kisne\s+banaya|(tumhara|aapka|aap\s+ka)\s+(creator|nirmata|maker)\s+kaun/i.test(effectiveText);
    if (isCreatorQuery) {
      const creatorReply = 'मुझे मिस्टर बृजमोहन कुमार ने बनाया है।';
      setChatMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMsgId
            ? {
                ...msg,
                text: creatorReply,
                suggestedPrompts: ['आप क्या-क्या कर सकती हैं?', 'समय बताओ', 'आज के कार्य दिखाओ'],
              }
            : msg
        )
      );
      setIsLoadingChat(false);
      audioSynth.playSuccess();
      if (speechEngine.getIsTtsEnabled()) {
        speechEngine.speak(creatorReply);
      }
      addLog('success', 'TARA_IDENTITY', 'Responded with creator identity: Mister Brijmohan Kumar.');
      return;
    }

    const abortController = new AbortController();
    let timeoutId = setTimeout(() => abortController.abort(), 60000); // 60s safety timeout

    const resetTimeout = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => abortController.abort(), 30000); // 30s between tokens
    };

    const imagePayload = activeMedia?.data
      ? {
          data: activeMedia.data,
          mimeType: activeMedia.mimeType || 'image/jpeg',
        }
      : undefined;

    try {
      let streamedSuccessfully = false;
      let lastStreamError: string | null = null;

      // 1. Send user voice/text input directly to streaming endpoint with image payload
      try {
        const streamRes = await fetch('/api/chat-stream', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: abortController.signal,
          body: JSON.stringify({
            message: effectiveText,
            image: imagePayload,
            history: chatMessages.slice(-8),
            context: { tasks, notes, nodes },
            systemMode,
            deviceTimeInfo: getClientDeviceTimeInfo(),
            systemInstruction: TARA_SYSTEM_INSTRUCTION,
          }),
        });

        const contentType = streamRes.headers.get('content-type') || '';

        if (!streamRes.ok) {
          let errText = '';
          try {
            const errJson = await streamRes.json();
            errText = typeof errJson.error === 'string'
              ? errJson.error
              : errJson.error?.message || (typeof errJson.message === 'string' ? errJson.message : '') || streamRes.statusText;
          } catch {
            errText = await streamRes.text();
          }
          throw new Error(errText || `Server returned HTTP ${streamRes.status}`);
        }

        if (streamRes.body && contentType.includes('text/event-stream')) {
          const reader = streamRes.body.getReader();
          const decoder = new TextDecoder('utf-8');
          let accumulatedText = '';
          let finalData: any = null;
          let streamError: string | null = null;
          let buffer = '';

          // Start Ultra-Fast Streaming TTS Session immediately so sentences play within 1s
          if (speechEngine.getIsTtsEnabled()) {
            speechEngine.startStreamingSession();
          }

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            resetTimeout();

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              const trimmed = line.trim();
              if (trimmed.startsWith('data: ')) {
                try {
                  const rawJson = trimmed.substring(6).trim();
                  if (rawJson) {
                    const parsed = JSON.parse(rawJson);

                    if (parsed.error) {
                      streamError = typeof parsed.error === 'string'
                        ? parsed.error
                        : parsed.error?.message || JSON.stringify(parsed.error);
                    }

                    if (parsed.type === 'delta' && parsed.chunk) {
                      accumulatedText += parsed.chunk;
                      const isInfo = /(?:app|apps|application|software|website|tools?|kaise|kya\s+hai|kya\s+hota|batao|bataiye|list|top|best|suggest|recommend|guide|tutorial|seekhe|difference|vs|baare\s+mein|bare\s+mein|about|which|what\s+is|how\s+to|sikhao|tarika|option|alternatives)/i.test(effectiveText);
                      const hasActiveAttachment = Boolean(activeMedia?.data || activeMedia?.previewUrl);
                      const isBgPrompt = hasActiveAttachment && !isInfo && /(?:(?:background|बैकग्राउंड|bg)\s*(?:badlo|badal|hatao|hata|change|remove|replace)|(?:peche|peeche)\s*(?:road|sadak|pahaad|mountain|studio|garden|park)\s*(?:laga|kar))/i.test(effectiveText);

                      // Stream tokens directly into streaming TTS queue for immediate sub-1s speech
                      if (speechEngine.getIsTtsEnabled() && !isBgPrompt) {
                        speechEngine.feedStreamingChunk(parsed.chunk);
                      }
                      if (isBgPrompt) {
                        setChatMessages((prev) =>
                          prev.map((msg) =>
                            msg.id === assistantMsgId
                              ? { ...msg, text: 'आपकी फ़ोटो का बैकग्राउंड सुंदर सीन में बदला जा रहा है...' }
                              : msg
                          )
                        );
                      } else {
                        const cleanDelta = sanitizeChatBubbleText(accumulatedText);
                        setChatMessages((prev) =>
                          prev.map((msg) =>
                            msg.id === assistantMsgId
                              ? { ...msg, text: cleanDelta }
                              : msg
                          )
                        );
                      }
                    } else if (parsed.done) {
                      finalData = parsed;
                      if (parsed.error) {
                        streamError = typeof parsed.error === 'string'
                          ? parsed.error
                          : parsed.error?.message || JSON.stringify(parsed.error);
                      }
                      if (parsed.text) {
                        accumulatedText = parsed.text;
                      }
                    }
                  }
                } catch {
                  // Silently ignore chunk parse error
                }
              }
            }
          }

          // Conclude streaming TTS session so remaining buffered words are played
          if (speechEngine.getIsTtsEnabled()) {
            speechEngine.finishStreamingSession();
          }

          if (streamError && !accumulatedText) {
            throw new Error(streamError);
          }

          const finalText = (finalData?.text || accumulatedText).trim();
          if (!finalText) {
            if (streamError) {
              throw new Error(streamError);
            }
            throw new Error('Gemini API returned an empty response.');
          }

          // Real Image & Photo Editing via Google Imagen 3 API & Gemini Vision
          let processedResult: ProcessedPhotoResult | null = null;
          let logoResult: GeneratedLogoResult | null = null;

          const isInfo = /(?:app|apps|application|software|website|tools?|kaise|kya\s+hai|kya\s+hota|batao|bataiye|list|top|best|suggest|recommend|guide|tutorial|seekhe|difference|vs|baare\s+mein|bare\s+mein|about|which|what\s+is|how\s+to|sikhao|tarika|option|alternatives)/i.test(effectiveText);

          const hasLogoAction = !isInfo && Boolean(
            finalData?.actions?.some((a: any) => a.type === 'create_logo')
          );
          const isLogoRequest = !isInfo && (
            hasLogoAction ||
            /(?:(?:create|make|design|generate|banao|bana\s*do|tayyar\s*karo)\s+(?:a\s+|an\s+|mera\s+|naya\s+)?(?:brand\s+)?(?:logo|app\s*icon)|(?:logo|app\s*icon)\s+(?:banao|bana\s*do|design\s*karo))/i.test(
              effectiveText
            )
          );

          const photoSource = activeMedia || (cardData.imageUrl ? { previewUrl: cardData.imageUrl, data: cardData.imageUrl } : null);
          const hasAttachedPhoto = Boolean(photoSource?.data || photoSource?.previewUrl);
          const isEditOrBgChange = hasAttachedPhoto && !isInfo && (
            isImageEditRequest(effectiveText) ||
            /(?:(?:background|बैकग्राउंड|bg)\s*(?:badlo|badal|hatao|hata|change|remove|replace)|(?:peche|peeche)\s*(?:road|sadak|pahaad|mountain|studio|garden|park)\s*(?:laga|kar))/i.test(effectiveText)
          );
          const isQuoteOnly = hasAttachedPhoto && !isEditOrBgChange && !isInfo && /quote|text|सुविचार|लिख|शायरी|thought/i.test(effectiveText);

          if (isLogoRequest) {
            try {
              const logoAct = finalData?.actions?.find((a: any) => a.type === 'create_logo');
              const brandOpts = extractBrandInfoFromPrompt(effectiveText, logoAct?.details);
              logoResult = await generateBrandLogoGraphic(brandOpts);
              processedResult = {
                dataUrl: logoResult.dataUrl,
                downloadFileName: logoResult.downloadFileName,
                summary: logoResult.summary,
              };
            } catch (logoErr) {
              console.warn('Brand logo generator error:', logoErr);
            }
          } else if (isEditOrBgChange && photoSource) {
            try {
              processedResult = await editRealImage(effectiveText, photoSource, finalText);
            } catch (editErr) {
              console.warn('Real image edit error:', editErr);
            }
          } else if (isQuoteOnly && photoSource?.previewUrl) {
            try {
              const quoteMatch = finalText.match(/["“]([^"”]{6,160})["”]/) || finalText.match(/>\s*(.+)/);
              const quoteText = quoteMatch ? quoteMatch[1] : undefined;
              processedResult = await processPhotoWithCanvas(
                photoSource.previewUrl,
                effectiveText,
                quoteText
              );
            } catch (canvasErr) {
              console.warn('Canvas photo processor error:', canvasErr);
            }
          } else if (!isInfo && isRealImageGenRequest(effectiveText)) {
            try {
              processedResult = await generateRealImage(effectiveText, finalText);
            } catch (genErr) {
              console.warn('Real image generator error:', genErr);
            }
          }

          let cleanedText = sanitizeChatBubbleText(finalText);

          if (isEditOrBgChange) {
            // STRICT DIRECT ACTION (ZERO FLUFF): Single brief confirmation
            cleanedText = 'आपकी फ़ोटो का बैकग्राउंड सुंदर सीन में बदल दिया गया है।';
          } else if (logoResult) {
            if (!cleanedText || cleanedText.length < 8 || cleanTextLooksLikeJson(cleanedText)) {
              cleanedText = logoResult.summary;
            }
          } else if (processedResult) {
            cleanedText = cleanedText
              .replace(/(main\s+)?(image|photo|file)\s+(generate|create)\s+nahi\s+kar\s+(sakti|rahi\s+hoon)[^.\n]*[.\n]?/gi, '')
              .replace(/मैं\s*(कोई\s*)?(इमेज|तस्वीर|फ़ोटो|चित्र)\s*(फ़ाइल\s*)?(जनरेट|बना)\s*नहीं\s*(कर\s*सकती|कर\s*रही)[^।\n]*[।\n]?/gi, '')
              .trim();

            if (!cleanedText || cleanedText.length < 10) {
              cleanedText = `मैंने आपके लिए यह रियलिस्टिक और खूबसूरत फ़ोटो तैयार कर दी है! आप इसे नीचे देख सकते हैं और डाउनलोड बटन से अपने फोन में सहेज सकते हैं।`;
            }

            if (processedResult?.dataUrl) {
              setCardData((prev) => ({
                ...prev,
                imageUrl: processedResult!.dataUrl,
              }));
            }
          }

          cleanedText = sanitizeChatBubbleText(cleanedText);

          // Process any actions
          if (finalData?.actions && Array.isArray(finalData.actions)) {
            processAssistantActions(finalData.actions);
          }

          const engineUsed = finalData?.engine || 'Gemini Flash (Stream)';

          setChatMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMsgId
                ? {
                    ...msg,
                    text: cleanedText,
                    resultImageUrl: processedResult?.dataUrl,
                    resultImageDownloadName: processedResult?.downloadFileName || 'tara-visual-graphic.png',
                    logoGraphicData: logoResult?.logoDetails,
                    actionsExecuted: finalData?.actions,
                    suggestedPrompts: finalData?.suggestedPrompts || [
                      '5 मिनट का टाइमर लगाओ',
                      'आज के महत्वपूर्ण कार्य दिखाओ',
                      'और विस्तार से समझाओ',
                    ],
                  }
                : msg
            )
          );

          audioSynth.playReceive();
          addLog('success', 'GEMINI_STREAM', `Streamed direct answer via ${engineUsed}.`);

          if (speechEngine.getIsTtsEnabled() && !cleanedText.startsWith('⚠️')) {
            // Streaming TTS has already started speaking sub-sentence chunks!
            // Only speak if nothing was played yet
            if (!speechEngine.getIsSpeaking()) {
              speechEngine.speak(cleanedText);
            }
          }
          streamedSuccessfully = true;
          return;
        }
      } catch (streamErr: any) {
        lastStreamError = streamErr?.message || String(streamErr);
        console.warn('Streaming attempt error:', lastStreamError);
      }

      if (!streamedSuccessfully) {
        // 2. Direct JSON endpoint if stream was interrupted or had an issue
        const jsonAbortController = new AbortController();
        const jsonTimeout = setTimeout(() => jsonAbortController.abort(), 30000);

        try {
          const res = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            signal: jsonAbortController.signal,
            body: JSON.stringify({
              message: effectiveText,
              image: imagePayload,
              history: chatMessages.slice(-8),
              context: { tasks, notes, nodes },
              systemMode,
              deviceTimeInfo: getClientDeviceTimeInfo(),
              systemInstruction: TARA_SYSTEM_INSTRUCTION,
            }),
          });

          if (!res.ok) {
            let errText = '';
            try {
              const errJson = await res.json();
              errText = typeof errJson.error === 'string'
                ? errJson.error
                : errJson.error?.message || (typeof errJson.message === 'string' ? errJson.message : '') || res.statusText;
            } catch {
              errText = await res.text();
            }
            throw new Error(errText || `Server returned error ${res.status}: ${res.statusText}`);
          }

          const data = await res.json();
          if (data.error) {
            const errStr = typeof data.error === 'string'
              ? data.error
              : data.error?.message || JSON.stringify(data.error);
            throw new Error(errStr);
          }

          const responseText = data?.text?.trim();
          if (!responseText) {
            throw new Error('Gemini API returned an empty text response.');
          }

          audioSynth.playReceive();

          // Real Image & Photo Editing via Google Imagen 3 API & Gemini Vision
          let processedResult: ProcessedPhotoResult | null = null;
          let logoResult: GeneratedLogoResult | null = null;

          const isInfo = /(?:app|apps|application|software|website|tools?|kaise|kya\s+hai|kya\s+hota|batao|bataiye|list|top|best|suggest|recommend|guide|tutorial|seekhe|difference|vs|baare\s+mein|bare\s+mein|about|which|what\s+is|how\s+to|sikhao|tarika|option|alternatives)/i.test(effectiveText);

          const hasLogoAction = !isInfo && Boolean(
            data?.actions?.some((a: any) => a.type === 'create_logo')
          );
          const isLogoRequest = !isInfo && (
            hasLogoAction ||
            /(?:(?:create|make|design|generate|banao|bana\s*do|tayyar\s*karo)\s+(?:a\s+|an\s+|mera\s+|naya\s+)?(?:brand\s+)?(?:logo|app\s*icon)|(?:logo|app\s*icon)\s+(?:banao|bana\s*do|design\s*karo))/i.test(
              effectiveText
            )
          );

          const photoSource = activeMedia || (cardData.imageUrl ? { previewUrl: cardData.imageUrl, data: cardData.imageUrl } : null);
          const hasAttachedPhoto = Boolean(photoSource?.data || photoSource?.previewUrl);
          const isEditOrBgChange = hasAttachedPhoto && !isInfo && (
            isImageEditRequest(effectiveText) ||
            /(?:(?:background|बैकग्राउंड|bg)\s*(?:badlo|badal|hatao|hata|change|remove|replace)|(?:peche|peeche)\s*(?:road|sadak|pahaad|mountain|studio|garden|park)\s*(?:laga|kar))/i.test(effectiveText)
          );
          const isQuoteOnly = hasAttachedPhoto && !isEditOrBgChange && !isInfo && /quote|text|सुविचार|लिख|शायरी|thought/i.test(effectiveText);

          if (isLogoRequest) {
            try {
              const logoAct = data?.actions?.find((a: any) => a.type === 'create_logo');
              const brandOpts = extractBrandInfoFromPrompt(effectiveText, logoAct?.details);
              logoResult = await generateBrandLogoGraphic(brandOpts);
              processedResult = {
                dataUrl: logoResult.dataUrl,
                downloadFileName: logoResult.downloadFileName,
                summary: logoResult.summary,
              };
            } catch (logoErr) {
              console.warn('Brand logo generator fallback error:', logoErr);
            }
          } else if (isEditOrBgChange && photoSource) {
            try {
              processedResult = await editRealImage(effectiveText, photoSource, responseText);
            } catch (editErr) {
              console.warn('Real image edit error:', editErr);
            }
          } else if (isQuoteOnly && photoSource?.previewUrl) {
            try {
              const quoteMatch = responseText.match(/["“]([^"”]{6,160})["”]/) || responseText.match(/>\s*(.+)/);
              const quoteText = quoteMatch ? quoteMatch[1] : undefined;
              processedResult = await processPhotoWithCanvas(
                photoSource.previewUrl,
                effectiveText,
                quoteText
              );
            } catch (canvasErr) {
              console.warn('Canvas photo processor error:', canvasErr);
            }
          } else if (!isInfo && isRealImageGenRequest(effectiveText)) {
            try {
              processedResult = await generateRealImage(effectiveText, responseText);
            } catch (genErr) {
              console.warn('Real image generator error:', genErr);
            }
          }

          let cleanedResponseText = sanitizeChatBubbleText(responseText);

          if (isEditOrBgChange) {
            // STRICT DIRECT ACTION (ZERO FLUFF): Single brief confirmation
            cleanedResponseText = 'आपकी फ़ोटो का बैकग्राउंड सुंदर सीन में बदल दिया गया है।';
          } else if (logoResult) {
            if (!cleanedResponseText || cleanedResponseText.length < 8 || cleanTextLooksLikeJson(cleanedResponseText)) {
              cleanedResponseText = logoResult.summary;
            }
          } else if (processedResult) {
            cleanedResponseText = cleanedResponseText
              .replace(/(main\s+)?(image|photo|file)\s+(generate|create)\s+nahi\s+kar\s+(sakti|rahi\s+hoon)[^.\n]*[.\n]?/gi, '')
              .replace(/मैं\s*(कोई\s*)?(इमेज|तस्वीर|फ़ोटो|चित्र)\s*(फ़ाइल\s*)?(जनरेट|बना)\s*नहीं\s*(कर\s*सकती|कर\s*रही)[^।\n]*[।\n]?/gi, '')
              .trim();

            if (!cleanedResponseText || cleanedResponseText.length < 10) {
              cleanedResponseText = `मैंने आपके लिए यह रियलिस्टिक और खूबसूरत फ़ोटो तैयार कर दी है! आप इसे नीचे देख सकते हैं और डाउनलोड बटन से सीधे सहेज सकते हैं।`;
            }

            if (processedResult?.dataUrl) {
              setCardData((prev) => ({
                ...prev,
                imageUrl: processedResult!.dataUrl,
              }));
            }
          }

          cleanedResponseText = sanitizeChatBubbleText(cleanedResponseText);

          // Process any backend action triggers
          if (data?.actions && Array.isArray(data.actions)) {
            processAssistantActions(data.actions);
          }

          setChatMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMsgId
                ? {
                    ...msg,
                    text: cleanedResponseText,
                    resultImageUrl: processedResult?.dataUrl,
                    resultImageDownloadName: processedResult?.downloadFileName || 'tara-visual-graphic.png',
                    logoGraphicData: logoResult?.logoDetails,
                    actionsExecuted: data?.actions,
                    suggestedPrompts: data?.suggestedPrompts || [
                      '5 मिनट का टाइमर लगाओ',
                      'आज के महत्वपूर्ण कार्य दिखाओ',
                      'और विस्तार से समझाओ',
                    ],
                  }
                : msg
            )
          );

          addLog('success', 'GEMINI_AI', `Direct answer from ${data?.engine || 'Gemini Flash'}.`);

          if (speechEngine.getIsTtsEnabled() && !cleanedResponseText.startsWith('⚠️')) {
            speechEngine.speak(cleanedResponseText);
          }
        } finally {
          clearTimeout(jsonTimeout);
        }
      }
    } catch (err: any) {
      console.warn('Chat interaction handled:', err?.message || err);

      let exactError = err?.message || String(err) || 'अज्ञात त्रुटि';
      try {
        const parsed = JSON.parse(exactError);
        if (parsed?.error?.message) {
          exactError = parsed.error.message;
        } else if (parsed?.message) {
          exactError = parsed.message;
        }
      } catch {}

      let userFriendlyText = 'नमस्ते! मैं तारा हूँ। मैं आपकी सहायता के लिए तैयार हूँ। आप मुझसे सामान्य ज्ञान, तकनीकी सवाल, समय, टाइमर या किसी भी कार्य के बारे में पूछ सकते हैं।';

      if (/logo|लोगो|icon/i.test(effectiveText) && /app|software|tool|website|kaise|batao|best/i.test(effectiveText)) {
        userFriendlyText = 'लोगो डिज़ाइन करने के लिए सबसे लोकप्रिय और बेहतरीन टूल्स:\n1. Canva: शुरुआती और सोशल मीडिया ब्रांड्स के लिए सबसे आसान और रेडीमेड टेम्पलेट्स।\n2. Adobe Illustrator: इंडस्ट्री-स्टैंडर्ड वेक्टर लोगो डिज़ाइन सॉफ्टवेयर।\n3. Figma: मॉडर्न UI/UX और स्केलेबल वेक्टर आइकन्स के लिए फ्री वेब टूल।\n4. Logo Maker Plus (Logopit): मोबाइल पर तुरंत प्रोफेशनल लोगो और ग्राफिक्स बनाने के लिए बेहतरीन ऐप।';
      } else if (/time|समय|टाइम/i.test(effectiveText)) {
        const now = new Date();
        userFriendlyText = `अभी ${now.toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit' })} बज रहे हैं।`;
      } else if (
        exactError.includes('Quota') ||
        exactError.includes('RESOURCE_EXHAUSTED') ||
        exactError.includes('429') ||
        exactError.includes('quota')
      ) {
        userFriendlyText = 'नमस्ते! वर्तमान में AI सेवा की अनुरोध सीमा (Quota) अस्थायी रूप से व्यस्त है। कृपया कुछ पलों बाद पुनः प्रयास करें। तब तक तारा आपके अन्य कार्यों के लिए उपलब्ध है।';
      }

      setChatMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMsgId
            ? {
                ...msg,
                text: userFriendlyText,
                suggestedPrompts: ['समय बताओ', '5 मिनट का टाइमर लगाओ', 'आज के कार्य दिखाओ'],
              }
            : msg
        )
      );

      addLog('warn', 'TARA_FALLBACK', exactError);
    } finally {
      clearTimeout(timeoutId);
      setIsLoadingChat(false);
      isLoadingChatRef.current = false;
      // If hands-free mode is on and TTS is not currently speaking, resume listening
      setTimeout(() => {
        if (isHandsFreeRef.current && !isSpeakingRef.current && !isLoadingChatRef.current && !isListeningRef.current) {
          startHandsFreeRecognitionRef.current?.();
        }
      }, 500);
    }
  }, [chatMessages, tasks, notes, nodes, systemMode, isLoadingChat, attachedMedia, addLog, getClientDeviceTimeInfo, processAssistantActions]);

  // --- Android Native Telecom & Call Action Handlers ---
  const handleAnswerCall = useCallback(async () => {
    const res = await nativeBridge.answerCall();
    addLog('success', 'TELECOM_BRIDGE', res.message);
    audioSynth.playSuccess();
    setActiveTab('calls');
    if (speechEngine.getIsTtsEnabled()) {
      speechEngine.speak('कॉल कनेक्ट हो गया है।');
    }
  }, [addLog]);

  const handleRejectCall = useCallback(async () => {
    const res = await nativeBridge.rejectCall();
    addLog('info', 'TELECOM_BRIDGE', res.message);
    audioSynth.playClick();
    if (speechEngine.getIsTtsEnabled()) {
      speechEngine.speak('कॉल काट दिया गया है।');
    }
  }, [addLog]);

  const handleSimulateIncomingCall = useCallback(() => {
    nativeBridge.simulateIncomingCall('राहुल शर्मा (Rahul Sharma)', '+91 98765 43210', 'phone');
    addLog('info', 'TELECOM_BRIDGE', 'Simulated incoming call: Rahul Sharma (+91 98765 43210)');
    audioSynth.playReceive();
    if (speechEngine.getIsTtsEnabled()) {
      speechEngine.speak('मोहन जी, राहुल शर्मा का फोन आ रहा है। फोन उठाऊं या काट दूं?');
    }
  }, [addLog]);

  // Toggle Always Listening / Hotword Ready Mode
  const handleToggleAlwaysListening = useCallback(() => {
    setIsAlwaysListening((prev) => {
      const nextVal = !prev;
      audioSynth.playClick();
      addLog('info', 'HOTWORD_WAKE', `Always Listening mode ${nextVal ? 'ACTIVATED' : 'DEACTIVATED'}`);
      return nextVal;
    });
  }, [addLog]);

  // Ref to track hotword recognition instance
  const hotwordRecogRef = useRef<any>(null);

  // Background Continuous Wake Word & Listen Loop
  useEffect(() => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      return;
    }

    const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!isAlwaysListening || isHandsFreeMode) {
      if (hotwordRecogRef.current) {
        try {
          hotwordRecogRef.current.abort();
        } catch {}
        hotwordRecogRef.current = null;
      }
      return;
    }

    // Do not run background recognizer if assistant is currently speaking or manual mic is active
    if (isSpeaking || isListening || isLoadingChat) {
      if (hotwordRecogRef.current) {
        try {
          hotwordRecogRef.current.abort();
        } catch {}
        hotwordRecogRef.current = null;
      }
      return;
    }

    let isMounted = true;
    let restartTimer: any = null;

    const startWakeRecognition = () => {
      if (!isMounted || !isAlwaysListening || isSpeaking || isListening || isLoadingChat) return;

      try {
        const recognition = new SpeechRecognitionClass();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = voiceLang;

        recognition.onstart = () => {
          // Hotword loop active
        };

        recognition.onresult = (event: any) => {
          let transcript = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            transcript += event.results[i][0].transcript;
          }

          const clean = transcript.trim().toLowerCase();
          if (!clean) return;

          // Wake words check: "तारा", "tara", "हे तारा", "hey tara", "सुनो तारा", etc.
          const wakeWordPatterns = [
            /तारा/i,
            /\btara\b/i,
            /हे तारा/i,
            /\bhey tara\b/i,
            /सुनो तारा/i,
            /\bhi tara\b/i,
            /\bok tara\b/i,
            /नमस्ते तारा/i,
          ];

          const hasWakeWord = wakeWordPatterns.some((p) => p.test(clean));

          // Urgent telecom voice triggers
          const telecomTriggers = [
            /फोन उठाओ/i,
            /कॉल उठाओ/i,
            /कॉल रिसीव/i,
            /phone uthao/i,
            /answer call/i,
            /फोन काटो/i,
            /कॉल काटो/i,
            /call reject/i,
            /phone kato/i,
            /cut call/i,
          ];

          const hasTelecomTrigger = telecomTriggers.some((p) => p.test(clean));

          if (hasWakeWord || hasTelecomTrigger) {
            audioSynth.playReceive();
            try {
              recognition.abort();
            } catch {}

            let prompt = transcript.trim();
            prompt = prompt.replace(/^(हे\s+तारा|hey\s+tara|सुनो\s+तारा|नमस्ते\s+तारा|तारा|tara)[,\s]*/i, '').trim();
            if (!prompt) {
              prompt = 'नमस्ते तारा, समय कितना हुआ है?';
            }

            addLog('info', 'HOTWORD_WAKE', `Heard: "${transcript}" -> Dispatching directive`);
            handleSendMessage(prompt);
          }
        };

        recognition.onerror = () => {
          // Silence no-speech errors
        };

        recognition.onend = () => {
          if (isMounted && isAlwaysListening && !isSpeaking && !isLoadingChat) {
            restartTimer = setTimeout(() => {
              if (isMounted && isAlwaysListening && !isSpeaking && !isLoadingChat) {
                startWakeRecognition();
              }
            }, 300);
          }
        };

        hotwordRecogRef.current = recognition;
        recognition.start();
      } catch (err) {
        console.warn('Wake word engine warning:', err);
      }
    };

    startWakeRecognition();

    return () => {
      isMounted = false;
      clearTimeout(restartTimer);
      if (hotwordRecogRef.current) {
        try {
          hotwordRecogRef.current.abort();
        } catch {}
        hotwordRecogRef.current = null;
      }
    };
  }, [isAlwaysListening, isSpeaking, isListening, isLoadingChat, voiceLang, handleSendMessage, addLog]);

  // --- 100% HANDS-FREE CONVERSATIONAL VOICE ASSISTANT ENGINE (FULL DUPLEX VAD AUTO-LOOP) ---
  const commitVoiceUtterance = useCallback((text: string) => {
    const clean = text.trim();
    if (!clean || isSpeakingRef.current || isLoadingChatRef.current) return;

    if (vadTimerRef.current) {
      clearTimeout(vadTimerRef.current);
      vadTimerRef.current = null;
    }

    // Stop mic temporarily during AI response generation so TARA does not hear herself
    if (conversationalRecogRef.current) {
      try {
        conversationalRecogRef.current.abort();
      } catch {}
      conversationalRecogRef.current = null;
    }

    setIsListening(false);
    isListeningRef.current = false;
    audioSynth.playReceive();
    addLog('success', 'VAD_SILENCE_DETECT', `आवाज़ पहचान: "${clean}" (Silence detected -> Response Generating)`);
    handleSendMessage(clean);

    setTimeout(() => {
      setLiveSpeechTranscript('');
      currentTranscriptRef.current = '';
    }, 1200);
  }, [handleSendMessage, addLog]);

  const startHandsFreeRecognition = useCallback(() => {
    if (typeof window === 'undefined') return;
    if (isSpeakingRef.current || isLoadingChatRef.current) return;

    if (hotwordRecogRef.current) {
      try { hotwordRecogRef.current.abort(); } catch {}
    }
    if (conversationalRecogRef.current) {
      try { conversationalRecogRef.current.abort(); } catch {}
      conversationalRecogRef.current = null;
    }

    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      // Browser fallback simulation if Web Speech API is absent
      setIsListening(true);
      isListeningRef.current = true;
      setLiveSpeechTranscript('नमस्ते तारा...');
      setTimeout(() => {
        setLiveSpeechTranscript('नमस्ते तारा, 1000 sq ft शेड का कोटेशन बताओ');
      }, 700);
      setTimeout(() => {
        setIsListening(false);
        isListeningRef.current = false;
        setLiveSpeechTranscript('');
        handleSendMessage('नमस्ते तारा, 1000 sq ft शेड का कोटेशन बताओ');
      }, 1500);
      return;
    }

    try {
      const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognitionClass();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = voiceLang;

      recognition.onstart = () => {
        setIsListening(true);
        isListeningRef.current = true;
        currentTranscriptRef.current = '';
        setLiveSpeechTranscript('');
        addLog('info', 'VOICE_ASSISTANT', `🎙️ हैंड्स-फ्री कॉल सक्रिय (${voiceLang})... बोलिए`);
      };

      recognition.onresult = (event: any) => {
        let interim = '';
        let final = '';
        for (let i = 0; i < event.results.length; ++i) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            final += transcript + ' ';
          } else {
            interim += transcript;
          }
        }
        const fullUtterance = (final + interim).trim();
        if (!fullUtterance) return;

        currentTranscriptRef.current = fullUtterance;
        setLiveSpeechTranscript(fullUtterance);

        // SILENCE DETECTION (VAD)
        if (vadTimerRef.current) {
          clearTimeout(vadTimerRef.current);
          vadTimerRef.current = null;
        }

        // If user has spoken something substantial
        if (fullUtterance.length >= 2) {
          // When silence occurs for ~1000ms (or 800ms if isFinal is received), commit immediately
          const delay = final.trim().length > 0 ? 800 : 1100;
          vadTimerRef.current = setTimeout(() => {
            commitVoiceUtterance(fullUtterance);
          }, delay);
        }
      };

      recognition.onerror = (err: any) => {
        if (err.error !== 'no-speech' && err.error !== 'aborted') {
          console.warn('Conversational speech error:', err);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        isListeningRef.current = false;
        // Requirement 5.1: Ek baar Start AI click karne ke baad mic bar-bar band nahi hona chahiye
        if (isHandsFreeRef.current && !isSpeakingRef.current && !isLoadingChatRef.current) {
          setTimeout(() => {
            if (isHandsFreeRef.current && !isSpeakingRef.current && !isLoadingChatRef.current) {
              startHandsFreeRecognition();
            }
          }, 250);
        }
      };

      conversationalRecogRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.warn('Speech start error:', err);
      setIsListening(false);
      isListeningRef.current = false;
    }
  }, [voiceLang, addLog, commitVoiceUtterance, handleSendMessage]);

  // Keep ref pointing to the current function
  useEffect(() => {
    startHandsFreeRecognitionRef.current = startHandsFreeRecognition;
  }, [startHandsFreeRecognition]);

  const handleStartVoice = () => {
    audioSynth.playClick();
    setIsHandsFreeMode(true);
    isHandsFreeRef.current = true;
    addLog('info', 'VOICE_ASSISTANT', '🟢 100% Hands-Free Conversational Call Mode STARTED');
    startHandsFreeRecognition();
  };

  const handleStopVoice = () => {
    audioSynth.playClick();
    setIsHandsFreeMode(false);
    isHandsFreeRef.current = false;
    setIsListening(false);
    isListeningRef.current = false;
    setLiveSpeechTranscript('');
    currentTranscriptRef.current = '';
    if (vadTimerRef.current) {
      clearTimeout(vadTimerRef.current);
      vadTimerRef.current = null;
    }
    if (conversationalRecogRef.current) {
      try {
        conversationalRecogRef.current.abort();
      } catch {}
      conversationalRecogRef.current = null;
    }
    addLog('info', 'VOICE_ASSISTANT', 'हैंड्स-फ्री मोड बंद किया गया (Hands-free call paused)');
  };

  // Toggle Voice TTS output
  const handleToggleTts = () => {
    const enabled = speechEngine.toggleTts();
    setIsTtsActive(enabled);
    audioSynth.playClick();
    addLog('info', 'AUDIO_ENGINE', `Voice output ${enabled ? 'ENABLED' : 'MUTED'}`);
  };

  // Quick Workflow Trigger
  const handleExecuteWorkflow = useCallback(async (wfId: string) => {
    audioSynth.playSend();
    const wf = workflows.find((w) => w.id === wfId);
    const title = wf ? wf.title : 'स्वायत्त पाइपलाइन';

    setWorkflows((prev) =>
      prev.map((w) => (w.id === wfId ? { ...w, status: 'running' as const } : w))
    );
    addLog('exec', 'WORKFLOW_ENGINE', `Executing: "${title}"...`);

    try {
      const res = await fetch('/api/workflow/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workflowId: wfId, title }),
      });
      let data: any = {};
      if (res.ok) {
        try {
          data = await res.json();
        } catch {
          data = {};
        }
      }
      audioSynth.playSuccess();

      setWorkflows((prev) =>
        prev.map((w) =>
          w.id === wfId
            ? { ...w, status: 'completed' as const, lastRun: 'Just now' }
            : w
        )
      );

      const assistantMsg: ChatMessage = {
        id: `msg-${Date.now()}`,
        sender: 'assistant',
        text: `### ⚡ ${title} पूर्ण हुआ\n\n- **स्थिति:** 100% सामान्य\n- **क्रियान्वित चरण:**\n${(data.stepsCompleted || ['पाइपलाइन निष्पादित हुई', 'सिस्टम स्थिति सामान्य']).map((s: string) => `  - ${s}`).join('\n')}`,
        timestamp: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
      };
      setChatMessages((prev) => [...prev, assistantMsg]);
      addLog('success', 'WORKFLOW_ENGINE', `Pipeline "${title}" finished.`);
      if (speechEngine.getIsTtsEnabled()) {
        speechEngine.speak(`${title} सफलतापूर्वक पूर्ण हो गया है।`);
      }
    } catch (err) {
      console.warn('Workflow handled exception:', err);
      audioSynth.playError();
      setWorkflows((prev) =>
        prev.map((w) => (w.id === wfId ? { ...w, status: 'idle' as const } : w))
      );
    }
  }, [workflows, addLog]);

  // Direct Photo Upload Handler (Feature 3: Easy Upload Photo in chat/toolbar)
  const handleDirectUploadPhoto = (file: File) => {
    audioSynth.playClick();
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      const base64Data = dataUrl.split(',')[1] || '';
      const media: AttachedMedia = {
        name: file.name,
        previewUrl: dataUrl,
        data: base64Data,
        mimeType: file.type || 'image/jpeg',
      };
      setAttachedMedia(media);
      setCardData((prev) => ({
        ...prev,
        imageUrl: dataUrl,
        title: file.name.replace(/\.[^/.]+$/, ''),
      }));
      audioSynth.playSuccess();
      addLog('success', 'VISION_ATTACH', `फोटो संलग्न हुई: "${file.name}"। अब बैकग्राउंड बदलने या सुविचार का निर्देश दें।`);
    };
    reader.readAsDataURL(file);
  };

  // Command palette selection
  const handleSelectPaletteAction = (actionType: string, payload?: any) => {
    audioSynth.playClick();
    if (actionType === 'chat_prompt' && payload?.text) {
      handleSendMessage(payload.text);
    } else if ((actionType === 'mode' || actionType === 'set_mode') && payload) {
      const mode = typeof payload === 'string' ? payload : payload.mode;
      setSystemMode(mode);
      addLog('info', 'KERNEL', `Mode set to ${mode}`);
    } else if ((actionType === 'workflow' || actionType === 'trigger_workflow') && payload) {
      const wfId = typeof payload === 'string' ? payload : payload.workflowId;
      handleExecuteWorkflow(wfId);
    } else if (actionType === 'open_view' && payload?.view) {
      setActiveTab(payload.view);
    } else if (actionType === 'add_node') {
      setIsAddNodeOpen(true);
    } else if (actionType === 'diag_ping') {
      handleExecuteWorkflow('wf-2');
    } else if (actionType === 'clear_logs') {
      setLogs([]);
      addLog('info', 'SYSTEM', 'Terminal log stream cleared.');
    } else if (actionType === 'simulate_call') {
      handleSimulateIncomingCall();
    } else if (actionType === 'toggle_always_listening') {
      handleToggleAlwaysListening();
    } else if (actionType === 'theme' && payload) {
      setThemeColor(payload);
    } else if (actionType === 'visualizer' && payload) {
      setVisualizerMode(payload);
    }
  };

  // --- Laptop Screen Sharing Handlers ---
  const handleToggleScreenShare = async () => {
    if (screenStream) {
      screenStream.getTracks().forEach((track) => track.stop());
      setScreenStream(null);
      addLog('info', 'VISION_ENGINE', 'लैपटॉप स्क्रीन शेयर बंद किया गया (Screen share stopped)');
      audioSynth.playClick();
    } else {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: { cursor: 'always' } as any,
          audio: false,
        });
        setScreenStream(stream);
        audioSynth.playSuccess();
        addLog('success', 'VISION_ENGINE', 'लैपटॉप स्क्रीन शेयर सक्रिय (Screen stream connected)');
        if (speechEngine.getIsTtsEnabled()) {
          speechEngine.speak('स्क्रीन शेयर कनेक्ट हो गया है। मैं आपकी लैपटॉप स्क्रीन देख सकती हूँ।');
        }
        stream.getVideoTracks()[0].onended = () => {
          setScreenStream(null);
          addLog('info', 'VISION_ENGINE', 'स्क्रीन शेयर सत्र समाप्त हुआ');
        };
      } catch (err: any) {
        console.warn('Screen share cancelled/denied:', err);
        addLog('warn', 'VISION_ENGINE', 'स्क्रीन शेयर अनुमति नहीं मिली या रद्द की गई');
      }
    }
  };

  // Screen Snapshot Capture and Send to TARA
  const handleCaptureScreenSnapshot = () => {
    if (!screenStream) return;
    try {
      const video = document.createElement('video');
      video.srcObject = screenStream;
      video.muted = true;
      video.play();
      video.onloadeddata = () => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth || 1280;
        canvas.height = video.videoHeight || 720;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
          const base64Data = dataUrl.split(',')[1] || '';
          const media: AttachedMedia = {
            name: `screen-${Date.now()}.jpg`,
            previewUrl: dataUrl,
            data: base64Data,
            mimeType: 'image/jpeg',
          };
          setAttachedMedia(media);
          audioSynth.playSuccess();
          addLog('success', 'VISION_ENGINE', 'स्क्रीन स्नैपशॉट कैप्चर हुआ — TARA को विश्लेषण के लिए भेजा गया');
          handleSendMessage('मेरी वर्तमान लैपटॉप स्क्रीन को देखकर बताओ इस पर क्या खुला है और क्या करना चाहिए?', media);
        }
      };
    } catch (err) {
      console.error('Snapshot capture error:', err);
      addLog('warn', 'VISION_ENGINE', 'स्क्रीन स्नैपशॉट कैप्चर त्रुटि');
    }
  };

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-[#02050e] text-slate-100 selection:bg-cyan-500/30 selection:text-cyan-200 antialiased relative overflow-x-hidden">
      {/* Ambient Cyber Background Glows */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[5%] left-[10%] w-[35vw] h-[35vw] rounded-full bg-cyan-600/7 blur-[140px]" />
        <div className="absolute top-[40%] right-[5%] w-[40vw] h-[40vw] rounded-full bg-blue-700/6 blur-[150px]" />
        <div className="absolute bottom-[2%] left-[30%] w-[35vw] h-[35vw] rounded-full bg-cyan-500/6 blur-[130px]" />
      </div>

      {/* 1. TOP CYBERPUNK HUD BAR (100% WIDTH FIT) */}
      <header className="w-full px-3 py-2 bg-[#040915]/90 border-b border-cyan-500/25 flex flex-wrap items-center justify-between gap-2.5 z-20 backdrop-blur-md shadow-[0_4px_25px_rgba(0,0,0,0.6)]">
        {/* Left: Branding & Core ID */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-600 via-sky-500 to-blue-700 flex items-center justify-center text-white font-black text-sm shadow-[0_0_15px_rgba(0,240,255,0.6)] border border-cyan-300/50">
              ⚡
            </div>
            <span className="w-2 h-2 rounded-full bg-cyan-400 absolute -top-0.5 -right-0.5 animate-ping" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-heading font-black tracking-[0.22em] text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-100 to-cyan-400 drop-shadow-[0_0_12px_rgba(0,240,255,0.6)]">
                TARA
              </h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 font-bold hidden sm:inline">
                STONIC AI HUD // QUANTUM KERNEL
              </span>
            </div>
            <p className="text-[9px] font-mono text-cyan-400/80 hidden md:block">
              MOHAN VISHWAS FABRICATION AUTONOMOUS EXECUTIVE DASHBOARD
            </p>
          </div>
        </div>

        {/* Center: Live Laptop Telemetry Chips */}
        <div className="hidden lg:flex items-center gap-2.5 text-[10px] font-mono">
          <div
            onClick={isHandsFreeMode ? handleStopVoice : handleStartVoice}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded border text-[10px] font-mono cursor-pointer transition-all ${
              isHandsFreeMode
                ? 'bg-rose-950/80 border-rose-500/60 text-rose-200 shadow-[0_0_12px_rgba(244,63,94,0.4)]'
                : 'bg-[#030a16] border-cyan-500/30 text-cyan-200 hover:border-cyan-400'
            }`}
            title="100% Hands-Free Call Mode: क्लिक करके चालू/बंद करें"
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isHandsFreeMode
                  ? isListening
                    ? 'bg-rose-400 animate-ping'
                    : isSpeaking
                    ? 'bg-emerald-400 animate-pulse'
                    : 'bg-amber-400 animate-ping'
                  : 'bg-slate-500'
              }`}
            />
            <span className="text-slate-400">CALL:</span>
            <span className={isHandsFreeMode ? 'text-rose-300 font-bold' : 'text-slate-400'}>
              {isHandsFreeMode ? (isListening ? 'LISTENING 🎙️' : isSpeaking ? 'SPEAKING 🔊' : 'ACTIVE 📞') : 'STANDBY'}
            </span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#030a16] border border-cyan-500/30 text-cyan-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-400">CORE:</span>
            <span className="text-emerald-300 font-bold">ONLINE</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#030a16] border border-cyan-500/30 text-cyan-200">
            <span className="text-slate-400">LATENCY:</span>
            <span className="text-cyan-300 font-bold">{laptopTelemetry.latencyMs}ms</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#030a16] border border-cyan-500/30 text-cyan-200">
            <span className="text-slate-400">BATTERY:</span>
            <span className="text-white font-bold">{laptopTelemetry.batteryLevel}%</span>
            {laptopTelemetry.isCharging && <span className="text-emerald-400">⚡</span>}
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#030a16] border border-cyan-500/30 text-cyan-200">
            <span className="text-slate-400">NET:</span>
            <span className="text-emerald-400 font-bold">{laptopTelemetry.networkType}</span>
          </div>
        </div>

        {/* Right: Quick HUD Actions (Rates, Leads, Calls, Fullscreen) */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setActiveTab('rates')}
            className="px-2.5 py-1 rounded-lg bg-cyan-950/70 hover:bg-cyan-900 border border-cyan-500/30 text-[10px] font-mono text-cyan-300 flex items-center gap-1 cursor-pointer transition-all hover:scale-105"
            title="फैब्रिकेशन रेट लिस्ट (Fabrication Rates)"
          >
            <Calculator className="w-3 h-3 text-cyan-400" />
            <span className="hidden sm:inline">दर तालिका</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('leads')}
            className="px-2.5 py-1 rounded-lg bg-pink-950/70 hover:bg-pink-900 border border-pink-500/30 text-[10px] font-mono text-pink-300 flex items-center gap-1 cursor-pointer transition-all hover:scale-105"
            title="व्हाट्सएप लीड्स और इंक्वायरी (Leads)"
          >
            <MessageSquare className="w-3 h-3 text-pink-400" />
            <span className="hidden sm:inline">लीड्स</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('calls')}
            className="px-2.5 py-1 rounded-lg bg-purple-950/70 hover:bg-purple-900 border border-purple-500/30 text-[10px] font-mono text-purple-300 flex items-center gap-1 cursor-pointer transition-all hover:scale-105"
            title="इनकमिंग कॉल एजेंट (Call Agent)"
          >
            <PhoneCall className="w-3 h-3 text-purple-400" />
            <span className="hidden sm:inline">कॉल एजेंट</span>
          </button>
          <button
            type="button"
            onClick={handleToggleFullscreen}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:text-cyan-300 hover:border-cyan-500/40 text-[10px] cursor-pointer transition-all"
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </header>

      {/* 2. MAIN 3-PANEL CYBERPUNK SCI-FI DASHBOARD (100% WIDTH, ZERO WASTED SPACE) */}
      <main className="flex-1 w-full p-2 sm:p-2.5 flex flex-col lg:flex-row gap-2.5 z-10 min-h-0">
        {/* PANEL 1 (LEFT): GLOWING WORLD MAP / SATELLITE TRACKER */}
        <section className="w-full lg:w-[28%] xl:w-[26%] flex flex-col gap-2.5 shrink-0">
          <CyberSatelliteMapPanel
            className="w-full flex-1 min-h-[380px] lg:min-h-0"
            onSelectNode={(nodeName) => {
              handleSendMessage(`${nodeName} नोड की वर्तमान स्थिति और फैब्रिकेशन अपडेट क्या है?`);
            }}
          />
        </section>

        {/* PANEL 2 (CENTER): TOP NEON CYAN AI CORE ORB + BOTTOM 2D PIXEL VIRTUAL OFFICE */}
        <section className="flex-1 min-w-0 flex flex-col gap-2.5">
          {/* CENTER TOP: NEON CYAN GLOWING AI CORE (REACTOR ORB) WITH START AI BUTTON */}
          <div className="w-full shrink-0">
            <CyberReactorOrb
              isListening={isListening}
              isSpeaking={isSpeaking}
              isHandsFreeMode={isHandsFreeMode}
              onToggleVoice={isHandsFreeMode ? handleStopVoice : handleStartVoice}
              onSendMessage={handleSendMessage}
              laptopTelemetry={laptopTelemetry}
              screenStream={screenStream}
              onToggleScreenShare={handleToggleScreenShare}
              onCaptureScreenSnapshot={handleCaptureScreenSnapshot}
              className="w-full"
            />
          </div>

          {/* CENTER BOTTOM: 2D PIXEL VIRTUAL OFFICE (SAB WORKER DESKS KE SAATH) */}
          <div className="w-full flex-1 min-h-[360px]">
            <PixelOfficeCard
              tasks={tasks}
              chatMessages={chatMessages}
              onSendMessage={handleSendMessage}
              isLoadingChat={isLoadingChat}
              isSpeaking={isSpeaking}
              isListening={isListening}
              onToggleVoice={isHandsFreeMode ? handleStopVoice : handleStartVoice}
              onOpenRates={() => setActiveTab('rates')}
              onOpenLeads={() => setActiveTab('leads')}
              onOpenCallAgent={() => setActiveTab('calls')}
              minimal={false}
              defaultShowConversationDock={false}
              liveSpeechTranscript={liveSpeechTranscript}
              className="w-full h-full"
            />
          </div>
        </section>

        {/* PANEL 3 (RIGHT): LIVE AI ACTIVITY & CHAT LOG PANEL */}
        <section className="w-full lg:w-[32%] xl:w-[30%] flex flex-col gap-2.5 shrink-0">
          <CyberActivityChatPanel
            chatMessages={chatMessages}
            logs={logs}
            onSendMessage={handleSendMessage}
            isLoadingChat={isLoadingChat}
            isListening={isListening}
            onToggleVoice={isHandsFreeMode ? handleStopVoice : handleStartVoice}
            screenStream={screenStream}
            onCaptureScreenSnapshot={handleCaptureScreenSnapshot}
            liveSpeechTranscript={liveSpeechTranscript}
            className="w-full flex-1 min-h-[460px] lg:min-h-0"
          />
        </section>
      </main>

      {/* RATES MODAL OVERLAY */}
      {activeTab === 'rates' && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
          <div className="w-full max-w-5xl max-h-[90vh] bg-[#070f1e] border border-cyan-500/40 rounded-2xl overflow-y-auto p-4 sm:p-6 relative shadow-[0_0_50px_rgba(0,240,255,0.25)] flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-cyan-500/20">
              <div className="flex items-center gap-2">
                <Calculator className="w-5 h-5 text-cyan-400" />
                <h2 className="text-base sm:text-lg font-heading font-black text-cyan-300">
                  🏭 मोहन विश्वास फैब्रिकेशन • वर्तमान दर तालिका (Fabrication Rates)
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('assistant')}
                className="px-3 py-1 bg-rose-950/80 hover:bg-rose-900 border border-rose-500/40 text-rose-200 text-xs font-mono font-bold rounded-lg cursor-pointer transition-colors"
              >
                ✕ बंद करें (Close)
              </button>
            </div>
            <FabricationRatesSection
              onAskTara={(p) => {
                handleSendMessage(p);
                setActiveTab('assistant');
              }}
            />
          </div>
        </div>
      )}

      {/* LEADS MODAL OVERLAY */}
      {activeTab === 'leads' && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
          <div className="w-full max-w-5xl max-h-[90vh] bg-[#070f1e] border border-pink-500/40 rounded-2xl overflow-y-auto p-4 sm:p-6 relative shadow-[0_0_50px_rgba(236,72,153,0.25)] flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-pink-500/20">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-pink-400" />
                <h2 className="text-base sm:text-lg font-heading font-black text-pink-300">
                  📱 WhatsApp हॉट लीड्स एवं स्वतः जवाब प्रणाली (Hot Leads & CRM)
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('assistant')}
                className="px-3 py-1 bg-rose-950/80 hover:bg-rose-900 border border-rose-500/40 text-rose-200 text-xs font-mono font-bold rounded-lg cursor-pointer transition-colors"
              >
                ✕ बंद करें (Close)
              </button>
            </div>
            <WhatsAppLeadResponder />
          </div>
        </div>
      )}

      {/* CALL AGENT MODAL OVERLAY */}
      {activeTab === 'calls' && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
          <div className="w-full max-w-5xl max-h-[90vh] bg-[#070f1e] border border-purple-500/40 rounded-2xl overflow-y-auto p-4 sm:p-6 relative shadow-[0_0_50px_rgba(168,85,247,0.25)] flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-purple-500/20">
              <div className="flex items-center gap-2">
                <PhoneCall className="w-5 h-5 text-purple-400" />
                <h2 className="text-base sm:text-lg font-heading font-black text-purple-300">
                  📞 इनकमिंग कॉल वॉयस एजेंट (Native Telecom Bridge & Call Simulator)
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('assistant')}
                className="px-3 py-1 bg-rose-950/80 hover:bg-rose-900 border border-rose-500/40 text-rose-200 text-xs font-mono font-bold rounded-lg cursor-pointer transition-colors"
              >
                ✕ बंद करें (Close)
              </button>
            </div>
            <IncomingCallAgentSection
              onTriggerTaraChat={(p) => {
                handleSendMessage(p);
                setActiveTab('assistant');
              }}
            />
          </div>
        </div>
      )}

      {/* MODALS */}
      <TaraTimerModal
        isOpen={isTimerModalOpen}
        onClose={() => setIsTimerModalOpen(false)}
        initialMinutes={activeTimerMinutes}
      />

      <CommandPaletteModal
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onSelectAction={handleSelectPaletteAction}
      />

      <AddNodeModal
        isOpen={isAddNodeOpen}
        onClose={() => setIsAddNodeOpen(false)}
        onAddNode={(newNode) => {
          setNodes((prev) => [...prev, newNode]);
          setEdges((prev) => [...prev, { id: `e-core-${newNode.id}`, source: 'core-tara', target: newNode.id, animated: true, type: 'synapse' }]);
          setIsAddNodeOpen(false);
        }}
      />

      <NodeDetailModal
        node={selectedNode}
        onClose={() => setSelectedNode(null)}
        onUpdateNode={(updated) => {
          setNodes((prev) => prev.map((n) => (n.id === updated.id ? updated : n)));
          setSelectedNode(null);
        }}
        onDeleteNode={(id) => {
          setNodes((prev) => prev.filter((n) => n.id !== id));
          setEdges((prev) => prev.filter((e) => e.source !== id && e.target !== id));
          setSelectedNode(null);
        }}
        onTriggerSkillOrWorkflow={(node) => {
          handleSendMessage(`Trigger cognitive subroutines for node: ${node.label}`);
          setSelectedNode(null);
        }}
      />

      <HelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />

      {/* FEATURE 2: DIRECT PDF GENERATOR MODAL */}
      <TaraPdfGeneratorModal
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
        tasks={tasks}
        notes={notes}
        messages={chatMessages}
        activeCardPosterUrl={cardData.imageUrl || undefined}
        activeCardTitle={cardData.title}
        initialType={pdfModalType}
      />
    </div>
  );
}
