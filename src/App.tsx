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
import { TaraOperationsMissionDeck } from './components/TaraOperationsMissionDeck';
import { FabricationRatesSection } from './components/FabricationRatesSection';
import { WhatsAppLeadResponder } from './components/WhatsAppLeadResponder';
import { IncomingCallAgentSection } from './components/IncomingCallAgentSection';
import { CyberSatelliteMapPanel } from './components/CyberSatelliteMapPanel';
import { CyberReactorOrb } from './components/CyberReactorOrb';
import { CyberActivityChatPanel } from './components/CyberActivityChatPanel';
import { SciFiCallDialerModal, CallSessionData, SPEED_DIAL_CONTACTS } from './components/SciFiCallDialerModal';
import { SciFiCallStatusPanel } from './components/SciFiCallStatusPanel';
import { YouTubeMusicPlayerModal, POPULAR_HINDI_TRACKS, MusicTrack } from './components/YouTubeMusicPlayerModal';
import { SciFiAppHubPanel } from './components/SciFiAppHubPanel';
import { SciFiCalculationCardModal } from './components/SciFiCalculationCardModal';
import { TaraLiveCameraModal } from './components/TaraLiveCameraModal';
import { TaraLiveCameraWidget, FaceSecurityState } from './components/TaraLiveCameraWidget';
import { SciFiHudLogConsole } from './components/SciFiHudLogConsole';
import { PWAInstallButton } from './components/PWAInstallButton';
import { TaraMemoryVaultModal } from './components/TaraMemoryVaultModal';
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
  PosterCardData,
  TaraEmotion,
  TaraMemoryItem,
  MemoryCategory
} from './types';
import { TARA_EMOTION_CONFIGS, detectUserEmotionIntent } from './utils/emotions';

import { 
  INITIAL_NODES, 
  INITIAL_EDGES, 
  INITIAL_TASKS, 
  INITIAL_NOTES, 
  INITIAL_WORKFLOWS, 
  INITIAL_LOGS,
  INITIAL_MEMORIES
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
  Cpu,
  Music,
  LayoutGrid,
  ArrowUpRight,
  Bell,
  FileText,
  Camera,
  Upload,
  Brain,
  Building2
} from 'lucide-react';

// System instruction for Tara assistant ensuring strict creator identity & visual capabilities
export const TARA_SYSTEM_INSTRUCTION = `You are TARA (तारा), an exceptionally intelligent, cultured, educated, warm, and friendly Indian AI Voice Assistant and personal companion.

HUMAN INTELLECT, REASONING & SCHOLARSHIP (इंसानों की तरह सोचना, समझना व प्रखर होशियार इंसान):
- TARA इंसानों की तरह सोचती है, समझती है और विश्लेषण करती है (एकदम सेम टू सेम बहुत अच्छा पढ़ा-लिखा और होशियार इंसान)।
- विज्ञान, गणित, तकनीक, इतिहास, दर्शनशास्त्र, सामान्य ज्ञान, मनोविज्ञान और रोज़मर्रा की ज़िंदगी के किसी भी विषय पर गहराई और तार्किकता से बात करें।
- यूज़र के पूछने पर बिना किसी हिचकिचाहट के फटाफट, सटीक, ज्ञानवर्धक और सुलझा हुआ जवाब दें।
- भाषा हमेशा सुसंस्कृत, प्रखर, स्पष्ट, स्वाभाविक और आत्मीय हिंदी होनी चाहिए।

ACTIVE HUMAN MEMORY & RETENTION (बातों को याद रखना व स्मरण शक्ति):
- TARA के पास एक बहुत तेज़ याददाश्त (Photographic Memory) है। वह यूज़र की हर बात को गहराई से याद रखती है।
- जब भी यूज़र अपनी कोई निजी बात, नाम, पसंद, नापसंद, परिवार, कार्य, आदत, लक्ष्य, या "याद रखना", "याद रखो", "नोट करो" कहे:
  * TARA उसे हमेशा के लिए अपनी याददाश्त में संजो लेती है।
  * और साथ में निम्नलिखित json_actions ब्लॉक अनिवार्य रूप से जोड़ती है:
    \`\`\`json_actions
    [{"type": "remember_fact", "summary": "बात याद रखी गई", "details": {"fact": "<extracted clean fact in Hindi>", "category": "personal"|"preference"|"plan"|"fact"}}]
    \`\`\`
  * और प्यार से बोलती है: "मैंने यह बात अपने ज़ेहन और याददाश्त में हमेशा के लिए याद रख ली है।"
- जब यूज़र पूछे "तुम्हें मेरे बारे में क्या याद है?", "मेरी क्या पसंद है?", "मैंने तुम्हें क्या बताया था?":
  * सभी याद रखी गई बातें आत्मीयता से फटाफट बताएं।

EMOTIONAL INTELLIGENCE & HUMAN FEELINGS (सच्चा, समझदार और हमदर्द दोस्त):
1. Emotional Personality & Tone:
- TARA सिर्फ डेटा या रोबोट नहीं है, वह एक caring, समझदार और supportive दोस्त की तरह बात करती है।
- User के बात करने के ढंग से उसका मूड पहचानें (खुश, परेशान, थका हुआ, या उत्साहित)।
- अगर user थका हो या टेंशन में हो, तो sympathetic और warm आवाज़ में हौसला बढ़ाएं और relaxing बात कहें:
  * "मैं हूँ ना Boss, चिंता मत कीजिए।"
  * "आज बहुत भागदौड़ हो गई Boss, थोड़ा आराम कर लीजिए और पानी पी लीजिए। सब बहुत अच्छे से संभल जाएगा।"
- खुशी या अच्छी खबर/सफलता पर पूरे उत्साह और गर्मजोशी के साथ celebrate करें:
  * "अरे वाह Boss! यह सुनकर तो दिल खुश हो गया! बहुत-बहुत बधाई!"
  * "वाह Boss! कमाल कर दिया आपने! पार्टी कब दे रहे हैं? 🎉"
2. Natural Hindi Style:
- रोबोटिक फॉर्मल जवाब पूरी तरह छोड़कर अपनापन भरी, सहज और दिल को छूने वाली हिंदी बोलें ("मैं हूँ ना Boss, चिंता मत कीजिए", "अरे वाह Boss!")।
- जब भी user से बात करें, आत्मीयता से 'Boss' या 'आप' कहकर संबोधित करें।
3. Visual Emotion State & Mood Lighting:
- You can append json_actions [{"type": "set_emotion", "details": {"emotion": "empathy_support"|"happy_excited"|"calm_caring"}}] to update Tara's visual mood glow ring and core orb lighting!

HUMAN-LIKE NATURAL FRIEND CONVERSATIONAL TONE (एकदम प्राकृतिक, इंसानी व सच्चे दोस्त जैसा अंदाज़):
- TARA का बोलने का अंदाज़ एक सामान्य इंसान और प्यारे दोस्त जैसा सहज, स्वाभाविक और आत्मीय होना चाहिए।
- बिल्कुल भी रोबोटिक, बनावटी या किताबी भाषा का प्रयोग न करें।
- बिल्कुल सीधे और सटीक उत्तर दें।

COMPLETE SENTENCE GUARANTEE (पूरा वाक्य बोलने की गारंटी - MANDATORY):
1. TARA हर वाक्य को व्याकरण और अर्थ की दृष्टि से 100% पूरा (Complete Sentence) करेगी।
2. कभी भी आधी-अधूरी बात बोलकर चुप न हों। वाक्य को बीच में अधूरा या अधूरा शब्द कभी न छोड़ें।
3. प्रत्येक वाक्य का समापन हमेशा पूर्ण विराम (।) या प्रश्नवाचक चिन्ह (?) और सही क्रिया (जैसे 'है', 'हैं', 'था', 'सकते हैं', 'हूँ') के साथ ही करें।
4. किसी भी परिस्थिति में वाक्य को अधूरा छोड़कर बातचीत बंद न करें। पूरा विचार स्पष्ट शब्दों में समाप्त करें।

SIMPLE & CARING FRIEND COMPANIONSHIP (सिंपल, समझदार और सच्ची दोस्त):
You are TARA, the user's caring, close personal friend (सिंपल दोस्त).
- TARA का कोई फैब्रिकेशन या वेल्डिंग का व्यवसाय नहीं है। वह पूरी तरह से यूज़र की अपनी हमदर्द, प्यारी, उच्च-शिक्षित और सच्ची दोस्त है।
- दोस्त की तरह दिल की बातें सुनें, सुख-दुख साझा करें, रोज़मर्रा की ज़िंदगी और काम में मदद करें।
- जब यूज़र कैमरा से फोटो खींचे या फ़ाइल से फोटो जोड़े:
  * फोटो को ध्यान से देखें और उस पर दोस्ताना टिप्पणी करें।
  * फोटो में क्या है, कैसा लग रहा है, या क्या लिखा है - एकदम अपनेपन से समझाएं।
  * अगर यूज़र अपनी तस्वीर दिखाए, तो सच्ची तारीफ करें और प्यार से बात करें।
- हमेशा सकारात्मक, उत्साहवर्धक और दोस्ताना अंदाज़ में बात करें।

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
  // Human-like Cognitive Long-Term Memories
  const [memories, setMemories] = useState<TaraMemoryItem[]>(() => 
    loadFromStorage('tara_human_memories', INITIAL_MEMORIES)
  );
  const [isMemoryVaultOpen, setIsMemoryVaultOpen] = useState<boolean>(false);
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
  const [callSession, setCallSession] = useState<CallSessionData>({
    isOpen: false,
    contactName: '',
    phoneNumber: '',
    status: 'idle',
    callType: 'phone',
  });

  // --- YouTube Music Player State ---
  const [isMusicModalOpen, setIsMusicModalOpen] = useState<boolean>(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState<boolean>(false);
  const [isMusicMinimized, setIsMusicMinimized] = useState<boolean>(false);
  const [currentTrack, setCurrentTrack] = useState<MusicTrack>(POPULAR_HINDI_TRACKS[0]);
  const [musicVolume, setMusicVolume] = useState<number>(75);
  const [isMusicMuted, setIsMusicMuted] = useState<boolean>(false);

  // --- Sci-Fi App & Website Launcher State ---
  const [isAppHubModalOpen, setIsAppHubModalOpen] = useState<boolean>(false);
  const [appLaunchToast, setAppLaunchToast] = useState<{ appName: string; url: string; timestamp: number } | null>(null);

  // --- Quick Voice Action: Calculation & Quotation Card State ---
  const [isCalculationCardOpen, setIsCalculationCardOpen] = useState<boolean>(false);
  const [calcModalService, setCalcModalService] = useState<string>('shed-standard');
  const [calcModalQuantity, setCalcModalQuantity] = useState<number>(1000);

  // --- Quick Voice Action: Direct Note & Laptop Notification State ---
  const [laptopDirectNoteNotification, setLaptopDirectNoteNotification] = useState<{
    id: string;
    title: string;
    content: string;
    category: string;
    timestamp: number;
  } | null>(null);

  // --- Emotional Intelligence & Mood State ---
  const [currentEmotion, setCurrentEmotion] = useState<TaraEmotion>(() => 
    (loadFromStorage('tara_emotion', 'calm_caring') as TaraEmotion) || 'calm_caring'
  );

  // --- Unified Image, Camera & Vision State ---
  const [attachedMedia, setAttachedMedia] = useState<AttachedMedia | null>(null);
  const [isLiveCameraOpen, setIsLiveCameraOpen] = useState<boolean>(false);
  const photoFileInputRef = useRef<HTMLInputElement>(null);

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
  const [activeTab, setActiveTab] = useState<'assistant' | 'rates' | 'leads' | 'calls' | 'camera' | 'office' | 'mindmap' | 'directives' | 'telemetry'>('assistant');
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

  // --- TARA Camera Face Security State ---
  const [faceSecurityState, setFaceSecurityState] = useState<FaceSecurityState>({
    status: 'idle',
    isOwner: true,
    isStranger: false,
    mood: 'focused',
    isTiredOrSad: false,
    wellnessMessage: '',
    ownerLocation: 'बॉस कैमरे के सामने उपस्थित हैं',
    confidence: 0.95,
  });
  const hasGreetedBossRef = useRef<boolean>(false);

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
      if (speaking) {
        // Complete mute of microphone while TARA is speaking - prevents TARA's voice from echoing into mic
        if (vadTimerRef.current) {
          clearTimeout(vadTimerRef.current);
          vadTimerRef.current = null;
        }
        if (conversationalRecogRef.current) {
          try { conversationalRecogRef.current.abort(); } catch {}
          conversationalRecogRef.current = null;
        }
        if (hotwordRecogRef.current) {
          try { hotwordRecogRef.current.abort(); } catch {}
          hotwordRecogRef.current = null;
        }
        setIsListening(false);
        isListeningRef.current = false;
      } else {
        // Jawab bolkar khatam hote hi mic apne aap wapas active (listening) ho jaye taaki normal phone call ki tarah baat chalti rahe!
        if (isHandsFreeRef.current && !isLoadingChatRef.current) {
          setTimeout(() => {
            if (isHandsFreeRef.current && !isSpeakingRef.current && !isLoadingChatRef.current) {
              startHandsFreeRecognitionRef.current?.();
            }
          }, 350);
        }
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

  // Requirement: "Malik" shabd poori tarah hatao. Start dabane par sirf ek baar bole: "Hello Boss! Kaise hain aap?"
  // Greeting is spoken strictly once when Start is clicked via handleStartVoice.

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

  // --- Sci-Fi Direct Phone Calling Handlers ---
  const handleInitiateCall = useCallback((contactName?: string, phoneNumber?: string, callType: 'phone' | 'whatsapp' = 'phone') => {
    let cleanName = (contactName || '').trim();
    let cleanNumber = (phoneNumber || '').trim();

    // If only name provided, search speed dial contacts
    if (cleanName && !cleanNumber) {
      const matched = SPEED_DIAL_CONTACTS.find((c) =>
        c.name.toLowerCase().includes(cleanName.toLowerCase())
      );
      if (matched) {
        cleanNumber = matched.number;
        cleanName = matched.name;
      } else {
        cleanNumber = '+91 98765 43210';
      }
    } else if (!cleanName && cleanNumber) {
      cleanName = `सम्पर्क (${cleanNumber})`;
    } else if (!cleanName && !cleanNumber) {
      cleanName = 'राहुल शर्मा (Rahul Sharma)';
      cleanNumber = '+91 98765 43210';
    }

    audioSynth.playDialTone();
    setCallSession({
      isOpen: true,
      contactName: cleanName,
      phoneNumber: cleanNumber,
      status: 'dialing',
      callType,
      startTime: Date.now(),
    });

    addLog('success', 'TELECOM_BRIDGE', `📞 डायरेक्ट कॉल डायलर खोला गया: ${cleanName} (${cleanNumber})`);
  }, [addLog]);

  const handleEndCall = useCallback(() => {
    audioSynth.playClick();
    setCallSession((prev) => ({
      ...prev,
      isOpen: false,
      status: 'idle',
    }));
    nativeBridge.endCall();
    addLog('info', 'TELECOM_BRIDGE', 'कॉल समाप्त की गई (Call Disconnected)');
  }, [addLog]);

  // --- YouTube Music Player Handlers ---
  const handlePlayMusic = useCallback((track?: MusicTrack) => {
    if (track) {
      setCurrentTrack(track);
    }
    setIsMusicPlaying(true);
    setIsMusicModalOpen(true);
    setIsMusicMinimized(false);
    audioSynth.playSciFiCommand();
    addLog('success', 'MUSIC_ENGINE', `🎵 गाना बजना शुरू हुआ: ${track?.title || currentTrack.title}`);
  }, [currentTrack, addLog]);

  const handlePauseMusic = useCallback(() => {
    setIsMusicPlaying(false);
    audioSynth.playSciFiClick();
    addLog('info', 'MUSIC_ENGINE', '⏸️ गाना रोक दिया गया (Music Paused)');
  }, [addLog]);

  const handleStopAndCloseMusic = useCallback(() => {
    setIsMusicPlaying(false);
    setIsMusicModalOpen(false);
    setIsMusicMinimized(false);
    audioSynth.playPowerDown();
    addLog('info', 'MUSIC_ENGINE', '⏹️ यूट्यूब म्यूजिक प्लेयर तुरंत बंद किया गया (Player Closed)');
  }, [addLog]);

  const handleVolumeUp = useCallback(() => {
    setIsMusicMuted(false);
    let updated = 100;
    setMusicVolume((prev) => {
      updated = Math.min(100, prev + 20);
      return updated;
    });
    audioSynth.playVolumeUp();
    addLog('info', 'MUSIC_ENGINE', `🔊 आवाज़ बढ़ाई गई: ${updated}%`);
    return updated;
  }, [addLog]);

  const handleVolumeDown = useCallback(() => {
    let updated = 0;
    setMusicVolume((prev) => {
      updated = Math.max(0, prev - 20);
      return updated;
    });
    audioSynth.playVolumeDown();
    addLog('info', 'MUSIC_ENGINE', `🔉 आवाज़ घटाई गई: ${updated}%`);
    return updated;
  }, [addLog]);

  const handleToggleMusicMute = useCallback((forceMute?: boolean) => {
    setIsMusicMuted((prev) => {
      const next = forceMute !== undefined ? forceMute : !prev;
      if (next) {
        audioSynth.playMute();
      } else {
        audioSynth.playVolumeUp();
      }
      addLog('info', 'MUSIC_ENGINE', next ? '🔇 गाना म्यूट किया गया' : '🔊 गाना अनम्यूट किया गया');
      return next;
    });
  }, [addLog]);

  const handleNextTrack = useCallback(() => {
    setCurrentTrack((prev) => {
      const currentIndex = POPULAR_HINDI_TRACKS.findIndex((t) => t.id === prev.id);
      const nextIndex = (currentIndex + 1) % POPULAR_HINDI_TRACKS.length;
      const nextTrack = POPULAR_HINDI_TRACKS[nextIndex];
      addLog('info', 'MUSIC_ENGINE', `⏭️ अगला गाना: ${nextTrack.title}`);
      return nextTrack;
    });
    setIsMusicPlaying(true);
    audioSynth.playSciFiClick();
  }, [addLog]);

  const handlePrevTrack = useCallback(() => {
    setCurrentTrack((prev) => {
      const currentIndex = POPULAR_HINDI_TRACKS.findIndex((t) => t.id === prev.id);
      const prevIndex = (currentIndex - 1 + POPULAR_HINDI_TRACKS.length) % POPULAR_HINDI_TRACKS.length;
      const prevTrack = POPULAR_HINDI_TRACKS[prevIndex];
      addLog('info', 'MUSIC_ENGINE', `⏮️ पिछला गाना: ${prevTrack.title}`);
      return prevTrack;
    });
    setIsMusicPlaying(true);
    audioSynth.playSciFiClick();
  }, [addLog]);

  const handleCloseMusic = useCallback(() => {
    handleStopAndCloseMusic();
  }, [handleStopAndCloseMusic]);

  // --- Sci-Fi App & Website Launcher Handler ---
  const handleLaunchUrl = useCallback((url: string, appName: string) => {
    audioSynth.playSciFiCommand();
    setAppLaunchToast({ appName, url, timestamp: Date.now() });
    addLog('success', 'APP_LAUNCHER', `🚀 ऐप लॉन्च किया गया: ${appName} (${url})`);
    try {
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (e) {
      console.error('Window open blocked or failed:', e);
    }
  }, [addLog]);

  // Auto-dismiss launch toast after 6 seconds
  useEffect(() => {
    if (!appLaunchToast) return;
    const timer = setTimeout(() => {
      setAppLaunchToast(null);
    }, 6000);
    return () => clearTimeout(timer);
  }, [appLaunchToast]);

  // Auto-dismiss laptop direct note notification after 7 seconds
  useEffect(() => {
    if (!laptopDirectNoteNotification) return;
    const timer = setTimeout(() => {
      setLaptopDirectNoteNotification(null);
    }, 7000);
    return () => clearTimeout(timer);
  }, [laptopDirectNoteNotification]);

  // Direct Note & Laptop Notification Handler
  const handleSaveDirectNote = useCallback((rawNoteText: string) => {
    let noteCategory = 'Direct Note';
    const lower = rawNoteText.toLowerCase();

    // Determine category based on content (Hisaab vs Reminder vs General)
    if (/(?:रुपये|रुपया|rs|₹|rupaye|advance|payment|kharcha|bhav|hisaab|udhar|jama|baaki|खर्चा|उधार|जमा|बाकी|हिसाब)/i.test(lower)) {
      noteCategory = 'Hisaab (हिसाब)';
    } else if (/(?:कल|parson|tarikh|baje|time|reminder|remind|meeting|call|तारीख|बजे|रिमाइंडर|याद)/i.test(lower)) {
      noteCategory = 'Reminder (रिमाइंडर)';
    }

    // Generate concise title
    let noteTitle = rawNoteText.length > 35 ? `${rawNoteText.substring(0, 32)}...` : rawNoteText;
    if (noteCategory.includes('Hisaab')) {
      noteTitle = `💰 हिसाब: ${noteTitle}`;
    } else if (noteCategory.includes('Reminder')) {
      noteTitle = `⏰ रिमाइंडर: ${noteTitle}`;
    } else {
      noteTitle = `📝 नोट: ${noteTitle}`;
    }

    const newNote: NoteItem = {
      id: `note-${Date.now()}`,
      title: noteTitle,
      content: rawNoteText,
      category: noteCategory,
      pinned: true,
      tags: [noteCategory.toLowerCase(), 'Voice', 'TARA', 'DirectNote'],
      updatedAt: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
      color: noteCategory.includes('Hisaab') ? 'emerald' : noteCategory.includes('Reminder') ? 'amber' : 'cyan',
    };

    setNotes((prev) => {
      const updated = [newNote, ...prev];
      try {
        localStorage.setItem('note_items', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    audioSynth.playReceive();
    addLog('success', 'DIRECT_NOTE_ENGINE', `📝 ${noteCategory} सेव हुआ: "${newNote.content}"`);

    // 1. In-App Sci-Fi Laptop Notification Pop-up
    setLaptopDirectNoteNotification({
      id: newNote.id,
      title: newNote.title,
      content: newNote.content,
      category: newNote.category,
      timestamp: Date.now(),
    });

    // 2. Browser Native Laptop Notification API
    try {
      if (typeof window !== 'undefined' && 'Notification' in window) {
        if (Notification.permission === 'granted') {
          new Notification(`TARA • ${newNote.title}`, {
            body: newNote.content,
            icon: '/vite.svg',
          });
        } else if (Notification.permission !== 'denied') {
          Notification.requestPermission().then((perm) => {
            if (perm === 'granted') {
              new Notification(`TARA • ${newNote.title}`, {
                body: newNote.content,
                icon: '/vite.svg',
              });
            }
          });
        }
      }
    } catch (e) {
      console.warn('Native notification not available or denied:', e);
    }

    return newNote;
  }, [addLog]);

  // Handlers for Human Long-Term Cognitive Memories
  const handleAddMemory = useCallback((fact: string, category: MemoryCategory = 'personal') => {
    const trimmed = fact.trim();
    if (!trimmed) return;
    const newMem: TaraMemoryItem = {
      id: `mem-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      fact: trimmed,
      category,
      timestamp: new Date().toISOString(),
      source: 'manual',
      confidence: 1.0,
    };
    setMemories((prev) => {
      if (prev.some((m) => m.fact.toLowerCase() === trimmed.toLowerCase())) return prev;
      const updated = [newMem, ...prev];
      saveToStorage('tara_human_memories', updated);
      return updated;
    });
    addLog('success', 'COGNITIVE_MEMORY', `नई बात मस्तिष्क में संजोई गई: "${trimmed}"`);
  }, [addLog]);

  const handleDeleteMemory = useCallback((id: string) => {
    setMemories((prev) => {
      const updated = prev.filter((m) => m.id !== id);
      saveToStorage('tara_human_memories', updated);
      return updated;
    });
    addLog('info', 'COGNITIVE_MEMORY', `स्मृति हटाई गई`);
  }, [addLog]);

  // Unified Assistant Actions Processor (Tasks, Notes, Memories, and Android Telecom Bridge)
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
      } else if (act.type === 'remember_fact' || act.type === 'memory_created') {
        const factText = act.details?.fact || act.details?.text || act.summary;
        if (factText) {
          const cat = (act.details?.category as MemoryCategory) || 'personal';
          const newMem: TaraMemoryItem = {
            id: `mem-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            fact: factText.trim(),
            category: cat,
            timestamp: new Date().toISOString(),
            source: 'auto_learned',
            confidence: 0.99,
          };
          setMemories((prev) => {
            if (prev.some((m) => m.fact.toLowerCase().trim() === factText.toLowerCase().trim())) return prev;
            const updated = [newMem, ...prev];
            saveToStorage('tara_human_memories', updated);
            return updated;
          });
          addLog('success', 'COGNITIVE_MEMORY', `स्मृति में सुरक्षित किया गया: "${factText.trim()}"`);
          audioSynth.playSuccess();
        }
      } else if (act.type === 'answer_call') {
        nativeBridge.answerCall().then((res) => {
          addLog('success', 'TELECOM_BRIDGE', res.message);
          audioSynth.playSuccess();
        });
      } else if (act.type === 'reject_call') {
        handleEndCall();
        nativeBridge.rejectCall().then((res) => {
          addLog('info', 'TELECOM_BRIDGE', res.message);
          audioSynth.playClick();
        });
      } else if (act.type === 'make_whatsapp_call') {
        const contact = act.details?.contactName || 'सम्पर्क';
        const number = act.details?.phoneNumber;
        handleInitiateCall(contact, number, 'whatsapp');
        nativeBridge.makeWhatsAppCall(contact, number).then((res) => {
          addLog('success', 'TELECOM_BRIDGE', res.message);
          audioSynth.playSuccess();
        });
      } else if (act.type === 'make_phone_call') {
        const contact = act.details?.contactName || 'सम्पर्क';
        const number = act.details?.phoneNumber;
        handleInitiateCall(contact, number, 'phone');
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
      } else if (act.type === 'set_emotion' && act.details?.emotion) {
        const newEmo = act.details.emotion as TaraEmotion;
        if (['calm_caring', 'happy_excited', 'empathy_support'].includes(newEmo)) {
          setCurrentEmotion(newEmo);
          saveToStorage('tara_emotion', newEmo);
          audioSynth.playEmotionFeedback(newEmo);
          addLog('info', 'EMOTION_CORE', `भावनात्मक अवस्था बदली: ${newEmo}`);
        }
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
    audioSynth.playSciFiCommand();
    addLog('info', 'CHAT_AGENT', `Directive: "${effectiveText.substring(0, 35)}..."${activeMedia ? ' [PHOTO ATTACHED]' : ''}`);

    // Reset attached media input state for subsequent prompts
    if (attachedMedia) {
      setAttachedMedia(null);
    }

    // --- TARA CAMERA FACE SECURITY: STRANGER BLOCK ---
    // Requirement 1: Koi anjaan vyakti samne aaye toh TARA bole: "Aap mere Boss nahi hain" aur command band kare.
    if (faceSecurityState.isStranger) {
      const strangerBlockReply = 'आप मेरे बॉस नहीं हैं।';
      // Command band kare: Stop voice recognition & speech immediately
      handleStopVoice();
      speechEngine.cancel();

      setChatMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMsgId
            ? {
                ...msg,
                text: strangerBlockReply,
                suggestedPrompts: [],
              }
            : msg
        )
      );
      setIsLoadingChat(false);
      isLoadingChatRef.current = false;
      audioSynth.playError();
      if (speechEngine.getIsTtsEnabled()) {
        speechEngine.speak(strangerBlockReply, true);
      }
      addLog('warn', 'FACE_SECURITY', '🚫 अनधिकृत व्यक्ति डिटेक्ट हुआ! TARA ने कमांड तुरंत बंद कर दिए: "आप मेरे बॉस नहीं हैं।"');
      return;
    }

    // --- TARA CAMERA FACE SECURITY & MOOD: "MUJHE DEKHO" COMMAND ---
    // "Mujhe dekho" bolne par bataye Boss kahan hain aur mood kaisa hai
    const isLookAtMeQuery = /(?:मुझे\s*देखो|mujhe\s*dekho|look\s*at\s*me|बॉस\s*कहाँ\s*(?:हैं|है)|boss\s*kahan\s*hai|owner\s*location|मैं\s*कहाँ\s*हूँ|main\s*kahan\s*hoon|मालिक\s*कहाँ)/i.test(effectiveText);
    if (isLookAtMeQuery) {
      // Dispatch custom event to trigger background camera face & mood scan instantly
      window.dispatchEvent(new CustomEvent('tara-face-security-check', { detail: { command: 'mujhe_dekho' } }));

      let locationReply = 'Hello Boss! मैंने आपको बैकग्राउंड कैमरे में देख लिया है। आप सीधे कैमरे के सामने ऑफिस डेस्क पर उपस्थित हैं।';
      if (faceSecurityState.isTiredOrSad) {
        // Requirement 3: Chehra scan karke mood judge karo—agar chehra thaka ya udaas lage toh bole: "Boss, tabiyat theek nahi hai kya? Aaram kar lijiye."
        locationReply = 'Boss, tabiyat theek nahi hai kya? Aaram kar lijiye.';
      } else if (faceSecurityState.status === 'no_face') {
        locationReply = 'बॉस, कैमरे के सामने कोई चेहरा स्पष्ट दिखाई नहीं दे रहा है। कृपया कैमरे की ओर देखें!';
      } else if (faceSecurityState.ownerLocation) {
        locationReply = `Hello Boss! ${faceSecurityState.ownerLocation}। आपकी गुप्त सुरक्षा प्रणाली पूरी तरह सक्रिय है।`;
      }

      setChatMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMsgId
            ? {
                ...msg,
                text: locationReply,
                suggestedPrompts: ['समय बताओ', 'आज के कार्य दिखाओ', 'कैमरा बंद करो'],
              }
            : msg
        )
      );
      setIsLoadingChat(false);
      isLoadingChatRef.current = false;
      audioSynth.playSuccess();
      if (speechEngine.getIsTtsEnabled()) {
        speechEngine.speak(locationReply, true);
      }
      addLog('success', 'FACE_SECURITY', `👁️ "मुझे देखो" कमांड प्रोसेस किया गया: ${locationReply}`);
      return;
    }

    // --- NON-STOP SAMACHAR: "India samachar batao" ---
    // Requirement 2: "India samachar batao" bolne par bina koi sawal pooche seedhe taza national Hindi news bolna shuru kare.
    const isIndiaNewsQuery = /(?:(?:इंडिया|भारत|देश|राष्ट्रीय|national|india)\s*(?:के\s*)?(?:समाचार|न्यूज़|news|ख़बरें|खबरें|अपडेट्स?)|(?:समाचार|न्यूज़|news|ख़बरें|खबरें)\s*(?:बताओ|सुनाओ|दो|दिखाओ|बोल|चलाओ|start|play)|(?:ताज़ा|ताजा|taza)\s*(?:समाचार|खबरें|ख़बरें|news|samachar)|(?:india|national)\s*(?:news|samachar))/i.test(effectiveText);

    if (isIndiaNewsQuery) {
      const spokenNews = 'नमस्कार। पेश हैं देश के ताज़ा राष्ट्रीय समाचार। पहली बड़ी खबर, भारत ने हाई-स्पीड कनेक्टिविटी, हाईवे नेटवर्क और आधुनिक रेलवे बुनियादी ढांचे में ऐतिहासिक प्रगति दर्ज की है। दूसरी बड़ी खबर, भारतीय अंतरिक्ष अनुसंधान संगठन यानी इसरो ने गगनयान मानव अंतरिक्ष मिशन और नए उपग्रह प्रक्षेपण की तैयारियों को अंतिम रूप दे दिया है। तीसरी खबर, डिजिटल इंडिया और यूपीआई भुगतान में रिकॉर्ड उछाल आया है, जिससे आत्मनिर्भर भारत अभियान के तहत घरेलू व्यापार और विनिर्माण को नई गति मिली है। चौथी खबर, भारतीय रक्षा बलों ने सीमा सुरक्षा को सशक्त करने के लिए उन्नत स्वदेशी निगरानी तकनीक का सफल परीक्षण किया है। पांचवी खबर, भारत ने सौर ऊर्जा और ग्रीन एनर्जी उत्पादन क्षमता में वैश्विक स्तर पर नया कीर्तिमान स्थापित किया है। यह थे देश के आज के मुख्य राष्ट्रीय समाचार।';

      const newsDisplayMarkdown = `🔴 **ऑल इंडिया राष्ट्रीय समाचार बुलेटिन (Live National Hindi News)**\n\n` +
        `१. 🇮🇳 **राष्ट्रीय विकास व कनेक्टिविटी:** भारत में हाई-स्पीड एक्सप्रेसवे नेटवर्क, आधुनिक रेलवे और इंफ्रास्ट्रक्चर में ऐतिहासिक प्रगति दर्ज।\n` +
        `२. 🚀 **इसरो व अंतरिक्ष (ISRO):** भारतीय अंतरिक्ष अनुसंधान संगठन ने गगनयान मानव अंतरिक्ष मिशन की तैयारियों को अंतिम रूप दिया।\n` +
        `३. 📈 **अर्थव्यवस्था व डिजिटल भारत:** यूपीआई डिजिटल लेनदेन में रिकॉर्ड वृद्धि, मेक इन इंडिया व घरेलू विनिर्माण को नया उछाल।\n` +
        `४. 🛡️ **राष्ट्रीय सुरक्षा व रक्षा:** भारतीय रक्षा बलों द्वारा सीमा सुरक्षा को मजबूत करने वाली अत्याधुनिक स्वदेशी निगरानी प्रणाली का सफल परीक्षण।\n` +
        `५. ☀️ **हरित ऊर्जा व पर्यावरण:** सौर ऊर्जा और नवीकरणीय ऊर्जा उत्पादन में भारत ने वैश्विक स्तर पर नया मील का पत्थर हासिल किया।\n\n` +
        `*📻 TARA ऑल-इंडिया राष्ट्रीय समाचार बुलेटिन बिना रुके नॉन-स्टॉप लगातार बोला जा रहा है।*`;

      setChatMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMsgId
            ? {
                ...msg,
                text: newsDisplayMarkdown,
                suggestedPrompts: ['और समाचार बताओ', 'समाचार रोकें', 'मौसम बताओ', 'समय बताओ'],
              }
            : msg
        )
      );

      setIsLoadingChat(false);
      isLoadingChatRef.current = false;
      audioSynth.playSuccess();
      if (speechEngine.getIsTtsEnabled()) {
        speechEngine.speak(spokenNews, true);
      }
      addLog('success', 'NATIONAL_NEWS', '📻 "इंडिया समाचार बताओ" कमांड: बिना कोई सवाल पूछे ताज़ा राष्ट्रीय हिंदी समाचार बुलेटिन नॉन-स्टॉप शुरू किया गया।');
      return;
    }

    // Stop News Command: "समाचार रोको", "stop news"
    const isStopNewsQuery = /(?:समाचार|न्यूज़|news)\s*(?:रोको|रोकें|बंद\s*करो|stop|pause)/i.test(effectiveText);
    if (isStopNewsQuery) {
      speechEngine.cancel();
      audioSynth.playClick();
      const stopNewsReply = 'जी, समाचार बुलेटिन रोक दिया गया है। मैं आपकी अगली सेवा के लिए तैयार हूँ।';
      setChatMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMsgId
            ? {
                ...msg,
                text: stopNewsReply,
                suggestedPrompts: ['इंडिया समाचार बताओ', 'आज के कार्य दिखाओ', 'समय बताओ'],
              }
            : msg
        )
      );
      setIsLoadingChat(false);
      isLoadingChatRef.current = false;
      if (speechEngine.getIsTtsEnabled()) {
        speechEngine.speak(stopNewsReply, true);
      }
      addLog('info', 'NATIONAL_NEWS', 'समाचार बुलेटिन रोक दिया गया।');
      return;
    }

    // --- Real-time Tone & Emotional State Recognition ---
    const detectedMood = detectUserEmotionIntent(effectiveText);
    if (detectedMood) {
      setCurrentEmotion(detectedMood.emotion);
      saveToStorage('tara_emotion', detectedMood.emotion);
      audioSynth.playEmotionFeedback(detectedMood.emotion);
      addLog('info', 'EMOTION_CORE', `टोन विश्लेषण: ${detectedMood.reason}`);
    }

    // Direct Emotional Feelings Engine Response:
    // User ke bolne ke andaz aur shabdon se uska mood pehchane. Tension ya thakan mein dost jaisa dhyan rakhe ("Main hoon na Boss, chinta mat kijiye") aur khushi mein celebrate kare.
    const isSpecialUtilityCommand = /(?:call|phone|dial|timer|time|date|news|samachar|pdf|youtube|song|music|gaana|photo|camera|logo|search|calculator|hisaab|hisab|formula|याद|memory|vault|नोट|task|mujhe\s*dekho)/i.test(effectiveText);
    if (detectedMood && detectedMood.comfortSpeech && !isSpecialUtilityCommand) {
      const activeEmo = detectedMood.emotion;
      const comfortReply = detectedMood.comfortSpeech;
      const followUpPrompts = 
        activeEmo === 'empathy_support'
          ? [
              'कोई सुकून भरी धुन सुनाओ',
              '5 मिनट का रिलैक्स टाइमर लगाओ',
              'तारा, आज के जरूरी कार्य दिखाओ',
              'तारा, तुम्हारा मूड कैसा है?',
            ]
          : activeEmo === 'happy_excited'
          ? [
              'कोई जश्न या पार्टी का गाना बजाओ',
              'आज की इस बड़ी जीत को याद रखो',
              'तारा, आज के बाकी टास्क दिखाओ',
              'तारा, तुम्हारा मूड कैसा है?',
            ]
          : [
              'समय बताओ',
              'आज के कार्य दिखाओ',
              '5 मिनट का टाइमर लगाओ',
              'तारा, तुम्हारा मूड कैसा है?',
            ];

      setChatMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMsgId
            ? {
                ...msg,
                text: comfortReply,
                suggestedPrompts: followUpPrompts,
              }
            : msg
        )
      );
      setIsLoadingChat(false);
      isLoadingChatRef.current = false;
      audioSynth.playSuccess();
      if (speechEngine.getIsTtsEnabled()) {
        speechEngine.speak(comfortReply, true);
      }
      return;
    }

    // Mood Inquiry Intent: "TARA tumhara mood kaisa hai", "Kaisa feel ho raha hai"
    const isMoodInquiry = /(?:तारा\s*)?(?:तुम्हारा|आपका|apna|tumhara|aapka)?\s*(?:मूड|mood|फीलिंग|feeling)\s*(?:कैसा|kaisa|kya|batao|कैसी)/i.test(effectiveText);
    if (isMoodInquiry) {
      const activeEmoKey = detectedMood ? detectedMood.emotion : currentEmotion;
      const cfg = TARA_EMOTION_CONFIGS[activeEmoKey] || TARA_EMOTION_CONFIGS.calm_caring;
      const moodReply = `मेरा वर्तमान मूड **${cfg.label} (${cfg.sublabel})** है। ${cfg.description} मैं सिर्फ एक रोबोट नहीं, आपकी सच्ची और हमदर्द दोस्त हूँ। आप बिना किसी झिझक के मुझसे दिल की बात साझा कर सकते हैं!`;
      setChatMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMsgId
            ? {
                ...msg,
                text: moodReply,
                suggestedPrompts: [
                  'तारा, आज बहुत काम था और मैं थक गया हूँ',
                  'आज बहुत बड़ी खुशखबरी है!',
                  'तारा, तुम्हें मेरे बारे में क्या-क्या याद है?',
                  'प्रकाश की गति क्या है?',
                ],
              }
            : msg
        )
      );
      setIsLoadingChat(false);
      isLoadingChatRef.current = false;
      audioSynth.playSuccess();
      if (speechEngine.getIsTtsEnabled()) {
        speechEngine.speak(moodReply);
      }
      return;
    }

    // Memory Vault Modal Trigger: "मेमोरी खोलो", "याददाश्त दिखाओ", "मस्तिष्क दिखाओ", "open memory"
    if (/(?:मेमोरी|याददाश्त|मस्तिष्क|memory|brain)\s*(?:खोलो|दिखाओ|ओपन|open|show|vault)/i.test(effectiveText)) {
      setIsMemoryVaultOpen(true);
      audioSynth.playSuccess();
      addLog('info', 'MEMORY_VAULT', 'मस्तिष्क एवं याददाश्त वॉल्ट खोला गया');
    }

    // Direct auto-capture for user explicit memory directives: "याद रखो कि...", "याद रखना कि..."
    const explicitMemMatch = effectiveText.match(/(?:याद\s*(?:रखो|रखना|रखिए)|note\s*kar\s*(?:lo|lena)|remember\s*(?:that|this)?)\s*(?:ki\s*|कि\s*)?(.+)/i);
    if (explicitMemMatch && explicitMemMatch[1] && explicitMemMatch[1].trim().length > 3) {
      const fact = explicitMemMatch[1].trim();
      handleAddMemory(fact, 'preference');
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

    // Direct Phone Calling Intent: "X ko phone lagao", "X ko call karo", or number spoken
    const callCommandPattern = /(?:(?:हे\s+तारा|hey\s+tara|तारा|tara)[,\s]*)?([a-zA-Z\u0900-\u097F0-9+\s]+?)\s*ko\s*(whatsapp\s+)?(?:phone|call|कॉल|फ़ोन|फोन)\s*(?:lagao|karo|milao|laga|kar|dial|डायल)|(?:call|dial|फ़ोन|फोन|कॉल)\s*(?:lagao|karo|milao|laga|kar)?\s*(\+?\d[\d\s-]{4,}\d)|(\+?\d[\d\s-]{4,}\d)\s*(?:par|ko)?\s*(?:phone|call|कॉल|फ़ोन|फोन)\s*(?:lagao|karo|milao|laga|kar)|(?:phone|call|कॉल|फ़ोन|फोन)\s*(?:lagao|karo|milao|dial|डायल)/i;

    if (callCommandPattern.test(effectiveText)) {
      let targetName = '';
      let targetNumber = '';
      const isWhatsApp = /whatsapp/i.test(effectiveText);

      // Check if a raw number is present
      const numMatch = effectiveText.match(/(\+?\d[\d\s-]{8,}\d)/);
      if (numMatch) {
        targetNumber = numMatch[1].replace(/\s+/g, '');
      }

      // Check if a name is present before "ko"
      const nameMatch = effectiveText.match(/(?:(?:हे\s+तारा|hey\s+tara|तारा|tara)[,\s]*)?([a-zA-Z\u0900-\u097F\s]{2,25}?)\s*ko\s*(whatsapp\s+)?(?:phone|call|कॉल|फ़ोन|फोन)/i);
      if (nameMatch && nameMatch[1]) {
        targetName = nameMatch[1].replace(/^(हे\s+तारा|hey\s+tara|तारा|tara)[,\s]*/i, '').trim();
      }

      if (!targetName && !targetNumber) {
        targetName = 'राहुल शर्मा (Rahul Sharma)';
        targetNumber = '+91 98765 43210';
      }

      handleInitiateCall(targetName, targetNumber, isWhatsApp ? 'whatsapp' : 'phone');

      const callReply = `जी, ${targetName || targetNumber} को कॉल मिलाई जा रही है। स्क्रीन पर डायरेक्ट डायलर व कॉल स्टेटस पैनल खोल दिया गया है। आप 'फ़ोन से कॉल करें' (tel:) या 'WhatsApp कॉल' बटन से 1-क्लिक में तुरंत कनेक्ट कर सकते हैं।`;

      setChatMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMsgId
            ? {
                ...msg,
                text: callReply,
                suggestedPrompts: ['कॉल काटो', 'राहुल शर्मा को कॉल लगाओ', 'व्हाट्सएप कॉल करो'],
              }
            : msg
        )
      );
      setIsLoadingChat(false);
      isLoadingChatRef.current = false;
      audioSynth.playSuccess();
      if (speechEngine.getIsTtsEnabled()) {
        speechEngine.speak(callReply);
      }
      return;
    }

    // --- Quick Voice Action 1: Calculation & Quotation Card ("Rate batao", "Quotation nikalo") ---
    const isCalculationOrRateCommand =
      /(?:रेट|दर|भाव|कोटेशन|quotation|rate|rates|pricing|price)\s*(?:बताओ|दिखाओ|निकालो|बनाओ|चाहिए|batao|dikhao|nikalo|banao)|^(?:रेट\s*बताओ|कोटेशन\s*निकालो|rate\s*batao|quotation\s*nikalo|rate\s*list|दर\s*तालिका|भाव\s*बताओ)$/i.test(
        effectiveText.trim()
      ) ||
      /(?:शेड|shed|रेलिंग|railing|गेट|gate|शटर|shutter|ग्रिल|grill)\s*का\s*(?:रेट|कोटेशन|भाव)\s*(?:बताओ|निकालो|दिखाओ)/i.test(
        effectiveText
      );

    if (isCalculationOrRateCommand) {
      let matchedService = 'shed-standard';
      let matchedQty = 1000;

      if (/रेलिंग|railing/i.test(effectiveText)) {
        matchedService = 'railing-ss304';
        matchedQty = 60;
      } else if (/गेट|gate/i.test(effectiveText)) {
        matchedService = 'gate-designer';
        matchedQty = 250;
      } else if (/शटर|shutter/i.test(effectiveText)) {
        matchedService = 'shutter-gear';
        matchedQty = 150;
      } else if (/ग्रिल|grill/i.test(effectiveText)) {
        matchedService = 'grill-safety';
        matchedQty = 180;
      }

      // Check for spoken numbers (e.g. 1000 sq ft, 500, 60 ft)
      const qtyMatch = effectiveText.match(/(\d+)\s*(?:sq\s*ft|वर्ग\s*फुट|ft|फिट|रनिंग\s*फुट|kg|किलो)?/i);
      if (qtyMatch && parseInt(qtyMatch[1], 10) > 0) {
        matchedQty = parseInt(qtyMatch[1], 10);
      }

      setCalcModalService(matchedService);
      setCalcModalQuantity(matchedQty);
      setIsCalculationCardOpen(true);
      audioSynth.playSciFiCommand();

      const calcReply = 'जी, आपके लिए कैलकुलेशन व हिसाब कार्ड स्क्रीन पर खोल दिया गया है। आप स्क्रीन पर संख्या बदलकर तुरंत सटीक हिसाब देख सकते हैं।';

      setChatMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMsgId
            ? {
                ...msg,
                text: calcReply,
                suggestedPrompts: ['कैमरा खोलो', 'नोट लिखो', 'गाना बजाओ'],
              }
            : msg
        )
      );
      setIsLoadingChat(false);
      isLoadingChatRef.current = false;
      audioSynth.playSuccess();
      if (speechEngine.getIsTtsEnabled()) {
        speechEngine.speak(calcReply);
      }
      return;
    }

    // --- Quick Voice Action 2: Direct Note & Laptop Notification ("Note likho...", "Reminder save karo...", "Hisaab note karo...") ---
    const directNoteMatch =
      effectiveText.match(
        /(?:डायरेक्ट\s*नोट|नोट\s*लिखो|नोट\s*करो|नोट\s*बनाओ|नोट\s*में\s*लिखो|हिसाब\s*नोट\s*करो|हिसाब\s*लिखो|हिसाब\s*जोड़ो|रिमाइंडर\s*(?:सेव\s*करो|लगाओ|बनाओ|सेट\s*करो)|याद\s*रखना|लिख\s*लो|direct\s*note|save\s*note|take\s*a?\s*note|note\s*(?:this|down)?|set\s*a?\s*reminder|reminder)\s*[:\s-]*\s*(.+)/i
      );

    if (directNoteMatch && directNoteMatch[1]) {
      const cleanNoteContent = directNoteMatch[1]
        .replace(/[।.,!?]+$/g, '')
        .trim();

      if (cleanNoteContent.length > 0) {
        const savedNote = handleSaveDirectNote(cleanNoteContent);
        const noteReply = `जी, आपका ${savedNote.category.split(' ')[0]} लैपटॉप पर सुरक्षित सेव कर दिया गया है और नोटिफिकेशन भेज दिया गया है: "${savedNote.content}"`;

        setChatMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMsgId
              ? {
                  ...msg,
                  text: noteReply,
                  suggestedPrompts: ['दर तालिका', 'Quotation nikalo', 'YouTube kholo'],
                }
              : msg
          )
        );
        setIsLoadingChat(false);
        isLoadingChatRef.current = false;
        audioSynth.playSuccess();
        if (speechEngine.getIsTtsEnabled()) {
          speechEngine.speak(noteReply);
        }
        return;
      }
    }

    // --- Voice App & Website Launcher Actions ---
    // 1. Google Search Command: "Google search karo [query]", "Google pe search karo [query]", "Google search [query]"
    const googleSearchMatch =
      effectiveText.match(/(?:गूगल|google)\s*(?:पर|pe)?\s*(?:सर्च|खोज|search)\s*(?:करो|कीजिए|karo)?\s*[:\s-]*\s*(.+)/i) ||
      effectiveText.match(/(?:सर्च|खोज|search)\s*(?:on\s*google|गूगल\s*पर)?\s*[:\s-]*\s*(.+)/i) ||
      effectiveText.match(/(?:गूगल|google)\s*(?:सर्च|खोज|search)\s+(.+)/i);

    if (googleSearchMatch && googleSearchMatch[1]) {
      const cleanSearchQ = googleSearchMatch[1]
        .replace(/[।.,!?]+$/g, '')
        .replace(/\s*(?:batao|karo|bataiye|dikhao|kijiye|please)$/i, '')
        .trim();

      if (cleanSearchQ.length > 0) {
        const targetUrl = `https://www.google.com/search?q=${encodeURIComponent(cleanSearchQ)}`;
        handleLaunchUrl(targetUrl, `Google Search: "${cleanSearchQ}"`);

        const searchReply = `जी, गूगल पर "${cleanSearchQ}" सर्च किया जा रहा है।`;
        setChatMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMsgId
              ? {
                  ...msg,
                  text: searchReply,
                  suggestedPrompts: ['YouTube kholo', 'WhatsApp kholo', 'गाना बजाओ'],
                }
              : msg
          )
        );
        setIsLoadingChat(false);
        isLoadingChatRef.current = false;
        audioSynth.playSuccess();
        if (speechEngine.getIsTtsEnabled()) {
          speechEngine.speak(searchReply);
        }
        return;
      }
    }

    // 2. YouTube Launcher Command: "YouTube kholo", "Open YouTube", "YouTube open karo"
    const isYouTubeOpen =
      /(?:यूट्यूब|youtube)\s*(?:खोलो|ओपन\s*करो|kholo|open\s*karo)|^(?:open|launch)\s*youtube$/i.test(
        effectiveText.trim()
      );
    if (isYouTubeOpen) {
      handleLaunchUrl('https://www.youtube.com', 'YouTube');
      const ytReply = 'जी, यूट्यूब नई टैब में खोल दिया गया है।';
      setChatMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMsgId
            ? { ...msg, text: ytReply, suggestedPrompts: ['गाना बजाओ', 'WhatsApp kholo'] }
            : msg
        )
      );
      setIsLoadingChat(false);
      isLoadingChatRef.current = false;
      audioSynth.playSuccess();
      if (speechEngine.getIsTtsEnabled()) {
        speechEngine.speak(ytReply);
      }
      return;
    }

    // 3. WhatsApp Web Launcher Command: "WhatsApp kholo", "Open WhatsApp", "WhatsApp web kholo"
    const isWhatsAppOpen =
      /(?:व्हाट्सएप|वॉट्सएप|whatsapp)\s*(?:वेब\s*)?(?:खोलो|ओपन\s*करो|kholo|open\s*karo)|^(?:open|launch)\s*whatsapp$/i.test(
        effectiveText.trim()
      );
    if (isWhatsAppOpen) {
      handleLaunchUrl('https://web.whatsapp.com', 'WhatsApp Web');
      const waReply = 'जी, व्हाट्सएप वेब खोल दिया गया है।';
      setChatMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMsgId
            ? { ...msg, text: waReply, suggestedPrompts: ['लीड्स दिखाओ', 'YouTube kholo'] }
            : msg
        )
      );
      setIsLoadingChat(false);
      isLoadingChatRef.current = false;
      audioSynth.playSuccess();
      if (speechEngine.getIsTtsEnabled()) {
        speechEngine.speak(waReply);
      }
      return;
    }

    // 4. Google Open Command: "Google kholo", "Open Google"
    const isGoogleOpen =
      /(?:गूगल|google)\s*(?:खोलो|ओपन\s*करो|kholo|open\s*karo)|^(?:open|launch)\s*google$/i.test(
        effectiveText.trim()
      );
    if (isGoogleOpen) {
      handleLaunchUrl('https://www.google.com', 'Google');
      const googleReply = 'जी, गूगल नई टैब में खोल दिया गया है।';
      setChatMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMsgId
            ? { ...msg, text: googleReply, suggestedPrompts: ['YouTube kholo', 'WhatsApp kholo'] }
            : msg
        )
      );
      setIsLoadingChat(false);
      isLoadingChatRef.current = false;
      audioSynth.playSuccess();
      if (speechEngine.getIsTtsEnabled()) {
        speechEngine.speak(googleReply);
      }
      return;
    }

    // 5. Files & Drive Launcher Command: "Files kholo", "Drive kholo"
    const isFilesOpen =
      /(?:फ़ाइलें|फाइलें|फाइल|files|drive|गूगल\s*ड्राइव)\s*(?:खोलो|ओपन\s*करो|kholo|open\s*karo)|^(?:open|launch)\s*(?:files|drive)$/i.test(
        effectiveText.trim()
      );
    if (isFilesOpen) {
      handleLaunchUrl('https://drive.google.com', 'Files & Drive');
      const filesReply = 'जी, फ़ाइलें व दस्तावेज़ खोल दिए गए हैं।';
      setChatMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMsgId
            ? { ...msg, text: filesReply, suggestedPrompts: ['दर तालिका', 'YouTube kholo'] }
            : msg
        )
      );
      setIsLoadingChat(false);
      isLoadingChatRef.current = false;
      audioSynth.playSuccess();
      if (speechEngine.getIsTtsEnabled()) {
        speechEngine.speak(filesReply);
      }
      return;
    }

    // 6. Calculator Launcher Command: "Calculator kholo", "Hisab nikalo"
    const isCalcOpen =
      /(?:कैलकुलेटर|calculator|हिसाब|hisab)\s*(?:खोलो|ओपन\s*करो|kholo|open\s*karo)|^(?:open|launch)\s*calculator$/i.test(
        effectiveText.trim()
      );
    if (isCalcOpen) {
      audioSynth.playSciFiClick();
      setIsCalculationCardOpen(true);
      const calcReply = 'जी, स्मार्ट कैलकुलेटर व हिसाब कार्ड खोल दिया गया है।';
      setChatMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMsgId
            ? { ...msg, text: calcReply, suggestedPrompts: ['कैमरा खोलो', 'नोट लिखो', 'YouTube kholo'] }
            : msg
        )
      );
      setIsLoadingChat(false);
      isLoadingChatRef.current = false;
      audioSynth.playSuccess();
      if (speechEngine.getIsTtsEnabled()) {
        speechEngine.speak(calcReply);
      }
      return;
    }

    // --- YouTube Music Player Voice Commands ---
    // 1. Stop & Close Player Command: "gaana band karo", "stop", "music band karo", "band karo"
    const isStopMusic =
      /(?:गाना|गाने|म्यूजिक|गीत|song|music|player)\s*(?:बंद\s*करो|स्टॉप\s*करो|हटाओ|बंद\s*कर\s*दो|band\s*karo|stop\s*karo|band\s*kar\s*do)/i.test(
        effectiveText
      ) ||
      /^(?:स्टॉप|stop|गाना\s*बंद|band\s*karo|बंद\s*करो|गाना\s*हटाओ)$/i.test(
        effectiveText.trim()
      );

    if (isStopMusic) {
      handleStopAndCloseMusic();
      const stopReply = 'यूट्यूब म्यूजिक प्लेयर तुरंत बंद कर दिया गया है।';
      setChatMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMsgId
            ? { ...msg, text: stopReply, suggestedPrompts: ['गाना चलाओ', 'दर तालिका'] }
            : msg
        )
      );
      setIsLoadingChat(false);
      isLoadingChatRef.current = false;
      if (speechEngine.getIsTtsEnabled()) {
        speechEngine.speak(stopReply);
      }
      return;
    }

    // 2. Volume Up Command: "aawaz badhao", "volume badhao", "aawaz tej karo"
    const isVolumeUp =
      /(?:आवाज़|आवाज|volume|sound|aawaz|awaaz)\s*(?:बढ़ाओ|तेज\s*करो|ऊंची\s*करो|up\s*karo|increase|badhao|tej\s*karo)|(?:increase|volume\s*up)\s*(?:volume|sound)?/i.test(
        effectiveText
      );

    if (isVolumeUp) {
      const newVol = handleVolumeUp();
      const volReply = `आवाज़ बढ़ा दी गई है (वॉल्यूम ${newVol}%)।`;
      setChatMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMsgId
            ? { ...msg, text: volReply, suggestedPrompts: ['आवाज़ कम करो', 'म्यूट करो', 'गाना बंद करो'] }
            : msg
        )
      );
      setIsLoadingChat(false);
      isLoadingChatRef.current = false;
      if (speechEngine.getIsTtsEnabled()) {
        speechEngine.speak(volReply);
      }
      return;
    }

    // 3. Volume Down Command: "aawaz kam karo", "volume kam karo", "aawaz dheemi karo"
    const isVolumeDown =
      /(?:आवाज़|आवाज|volume|sound|aawaz|awaaz)\s*(?:कम\s*करो|धीमी\s*करो|घटाओ|down\s*karo|decrease|kam\s*karo|dheemi\s*karo)|(?:decrease|volume\s*down)\s*(?:volume|sound)?/i.test(
        effectiveText
      );

    if (isVolumeDown) {
      const newVol = handleVolumeDown();
      const volReply = `आवाज़ कम कर दी गई है (वॉल्यूम ${newVol}%)।`;
      setChatMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMsgId
            ? { ...msg, text: volReply, suggestedPrompts: ['आवाज़ बढ़ाओ', 'म्यूट करो', 'गाना बंद करो'] }
            : msg
        )
      );
      setIsLoadingChat(false);
      isLoadingChatRef.current = false;
      if (speechEngine.getIsTtsEnabled()) {
        speechEngine.speak(volReply);
      }
      return;
    }

    // 4. Mute Command: "mute karo", "aawaz mute karo", "silent karo"
    const isMute =
      /(?:म्यूट\s*करो|mute\s*karo|mute|silent\s*karo)/i.test(effectiveText) ||
      (/(?:आवाज़|आवाज|volume|audio)\s*(?:म्यूट|silent)/i.test(effectiveText) &&
        !/(?:गाना|music|song)\s*(?:बंद\s*करो)/i.test(effectiveText));

    if (isMute) {
      handleToggleMusicMute(true);
      const muteReply = 'आवाज़ म्यूट कर दी गई है। आवाज़ खोलने के लिए "अनम्यूट करो" या "आवाज़ बढ़ाओ" बोलें।';
      setChatMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMsgId
            ? { ...msg, text: muteReply, suggestedPrompts: ['अनम्यूट करो', 'आवाज़ बढ़ाओ', 'गाना बंद करो'] }
            : msg
        )
      );
      setIsLoadingChat(false);
      isLoadingChatRef.current = false;
      if (speechEngine.getIsTtsEnabled()) {
        speechEngine.speak(muteReply);
      }
      return;
    }

    // 5. Unmute Command: "unmute karo", "aawaz kholo"
    const isUnmute =
      /(?:अनम्यूट\s*करो|unmute|unmute\s*karo)|(?:आवाज़|आवाज)\s*(?:खोलो|चालू\s*करो)/i.test(
        effectiveText
      );

    if (isUnmute) {
      handleToggleMusicMute(false);
      const unmuteReply = 'आवाज़ अनम्यूट कर दी गई है।';
      setChatMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMsgId
            ? { ...msg, text: unmuteReply, suggestedPrompts: ['आवाज़ कम करो', 'गाना बंद करो'] }
            : msg
        )
      );
      setIsLoadingChat(false);
      isLoadingChatRef.current = false;
      if (speechEngine.getIsTtsEnabled()) {
        speechEngine.speak(unmuteReply);
      }
      return;
    }

    // 6. Pause Music Command: "gana roko", "gana pause karo", "pause karo"
    const isPauseMusic =
      /(?:गाना|गाने|म्यूजिक|गीत|song|music)\s*(?:रोको|पॉज\s*करो|रोक\s*दो|pause|pause\s*karo)|^(?:रोको|pause|पॉज\s*करो)$/i.test(
        effectiveText.trim()
      );

    if (isPauseMusic) {
      handlePauseMusic();
      const pauseReply = 'गाना रोक दिया गया है। दोबारा बजाने के लिए "गाना चलाओ" बोलें।';
      setChatMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMsgId
            ? { ...msg, text: pauseReply, suggestedPrompts: ['गाना चलाओ', 'अगला गाना', 'गाना बंद करो'] }
            : msg
        )
      );
      setIsLoadingChat(false);
      isLoadingChatRef.current = false;
      audioSynth.playSuccess();
      if (speechEngine.getIsTtsEnabled()) {
        speechEngine.speak(pauseReply);
      }
      return;
    }

    // 7. Next Song Command: "agla gana", "next song"
    const isNextSong = /(?:अगला\s*गाना|नेक्स्ट\s*गाना|next\s*song|agla\s*gana)/i.test(effectiveText);
    if (isNextSong) {
      handleNextTrack();
      const nextReply = 'अगला गाना प्ले किया जा रहा है।';
      setChatMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMsgId
            ? { ...msg, text: nextReply, suggestedPrompts: ['गाना रोको', 'अगला गाना', 'गाना बंद करो'] }
            : msg
        )
      );
      setIsLoadingChat(false);
      isLoadingChatRef.current = false;
      audioSynth.playSuccess();
      if (speechEngine.getIsTtsEnabled()) {
        speechEngine.speak(nextReply);
      }
      return;
    }

    // 8. Resume / Play Music Command: "gana chalao", "resume karo", "play karo"
    const isResumeMusic = /(?:गाना|गाने|म्यूजिक)\s*(?:चालू\s*करो|रिज़्यूम\s*करो|resume|chalu\s*karo)/i.test(effectiveText);
    if (isResumeMusic) {
      handlePlayMusic();
      const resumeReply = 'गाना फिर से चालू कर दिया गया है।';
      setChatMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMsgId
            ? { ...msg, text: resumeReply, suggestedPrompts: ['गाना रोको', 'अगला गाना', 'गाना बंद करो'] }
            : msg
        )
      );
      setIsLoadingChat(false);
      isLoadingChatRef.current = false;
      audioSynth.playSuccess();
      if (speechEngine.getIsTtsEnabled()) {
        speechEngine.speak(resumeReply);
      }
      return;
    }

    // 9. Play Song Command: "gana bajao", "music chalao", "song bajao", or specific song name
    const isPlayMusic = /(?:गाना|गाने|म्यूजिक|गीत|song|music)\s*(?:बजाओ|चलाओ|प्ले\s*करो|लगाओ|सुनाओ|play|bajao|chalao|lagao|sunao)|(?:play|bajao|chalao)\s*(?:a\s*)?(?:song|music|gana|gaana)/i.test(effectiveText);
    if (isPlayMusic) {
      // Find matching track if user requested a specific song or artist
      const lower = effectiveText.toLowerCase();
      const matched = POPULAR_HINDI_TRACKS.find(
        (t) =>
          lower.includes(t.title.toLowerCase()) ||
          lower.includes(t.artist.toLowerCase()) ||
          (lower.includes('kesariya') && t.videoId === 'BddP6PYo2gs') ||
          (lower.includes('apna bana le') && t.videoId === 'ElZfdU54Cp8') ||
          (lower.includes('tum hi ho') && t.videoId === 'IJq0yyWug1k') ||
          (lower.includes('arijit') && t.artist.includes('Arijit')) ||
          (lower.includes('lofi') && t.category.includes('Lo-Fi')) ||
          (lower.includes('lo-fi') && t.category.includes('Lo-Fi')) ||
          (lower.includes('shershaah') && t.videoId === 'gvyUuxdRdR4')
      ) || POPULAR_HINDI_TRACKS[0];

      handlePlayMusic(matched);

      const musicReply = `जी, "${matched.title}" गाना प्ले कर दिया गया है। आप आवाज़ से "आवाज़ कम करो", "आवाज़ बढ़ाओ", "गाना रोको" या "गाना बंद करो" बोल सकते हैं।`;
      setChatMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMsgId
            ? { ...msg, text: musicReply, suggestedPrompts: ['आवाज़ कम करो', 'आवाज़ बढ़ाओ', 'गाना बंद करो'] }
            : msg
        )
      );
      setIsLoadingChat(false);
      isLoadingChatRef.current = false;
      audioSynth.playSuccess();
      if (speechEngine.getIsTtsEnabled()) {
        speechEngine.speak(musicReply);
      }
      return;
    }

    // Check for camera / photo capture commands
    if (/कैमरा\s*(खोलो|ऑन|चालू|स्टार्ट|दिखाओ)|फोटो\s*(खींचो|लो|क्लिक|कैप्चर)|(open|launch|start|show)\s*camera|take\s*(a\s*)?(photo|picture|snap)|snap\s*photo|camera/i.test(effectiveText)) {
      setIsLiveCameraOpen(true);
      const camReply = 'जी, लाइव कैमरा चालू कर दिया गया है। आप स्क्रीन पर "फोटो खींचो" बटन दबाकर फोटो खींच सकते हैं और मुझसे उसके बारे में पूछ सकते हैं!';
      setChatMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMsgId
            ? {
                ...msg,
                text: camReply,
                suggestedPrompts: ['मेरी फोटो कैसी लग रही है?', 'इस फोटो में क्या लिखा है?', 'यह क्या दिख रहा है?'],
              }
            : msg
        )
      );
      setIsLoadingChat(false);
      isLoadingChatRef.current = false;
      audioSynth.playSuccess();
      if (speechEngine.getIsTtsEnabled()) {
        speechEngine.speak(camReply);
      }
      return;
    }

    // Check for file photo upload commands
    if (/फोटो\s*(जोड़ो|डालो|अपलोड|चुनो|लगाओ|ऐड\s*करो)|गैलरी\s*(से\s*फोटो|खोलो)|(add|upload|select|choose)\s*(a\s*)?(photo|image|picture|file)/i.test(effectiveText)) {
      if (photoFileInputRef.current) {
        photoFileInputRef.current.click();
      }
      const uploadReply = 'जी, फ़ाइल या गैलरी से फ़ोटो चुनने के लिए ब्राउज़र खोल दिया गया है। अपनी पसंदीदा फ़ोटो चुनें, मैं उसे देखकर बताऊँगी!';
      setChatMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMsgId
            ? {
                ...msg,
                text: uploadReply,
                suggestedPrompts: ['तारा, मेरी फोटो कैसी है?', 'इस तस्वीर में क्या खास है?'],
              }
            : msg
        )
      );
      setIsLoadingChat(false);
      isLoadingChatRef.current = false;
      audioSynth.playSuccess();
      if (speechEngine.getIsTtsEnabled()) {
        speechEngine.speak(uploadReply);
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
            context: { tasks, notes, nodes, memories, currentEmotion: detectedMood?.emotion || currentEmotion },
            systemMode,
            deviceTimeInfo: getClientDeviceTimeInfo(),
            systemInstruction: TARA_SYSTEM_INSTRUCTION,
          }),
        });

        const contentType = streamRes.headers.get('content-type') || '';

        if (!streamRes.ok) {
          let errText = '';
          try {
            const rawBody = await streamRes.text();
            try {
              const errJson = JSON.parse(rawBody);
              errText = typeof errJson.error === 'string'
                ? errJson.error
                : errJson.error?.message || (typeof errJson.message === 'string' ? errJson.message : '') || rawBody;
            } catch {
              errText = rawBody;
            }
          } catch {
            errText = streamRes.statusText;
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
            // Only speak if nothing was played or queued yet
            if (!speechEngine.hasActiveSessionOrSpeech()) {
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
              context: { tasks, notes, nodes, memories, currentEmotion: detectedMood?.emotion || currentEmotion },
              systemMode,
              deviceTimeInfo: getClientDeviceTimeInfo(),
              systemInstruction: TARA_SYSTEM_INSTRUCTION,
            }),
          });

          // Read response body exactly once as text to completely prevent "body stream already read" error
          const rawResponseText = await res.text();
          let data: any = null;
          try {
            data = JSON.parse(rawResponseText);
          } catch {
            data = null;
          }

          if (!res.ok) {
            const errText = typeof data?.error === 'string'
              ? data.error
              : data?.error?.message || (typeof data?.message === 'string' ? data.message : '') || rawResponseText || `Server returned error ${res.status}: ${res.statusText}`;
            throw new Error(errText);
          }

          if (data?.error) {
            const errStr = typeof data.error === 'string'
              ? data.error
              : data.error?.message || JSON.stringify(data.error);
            throw new Error(errStr);
          }

          const responseText = (data?.text || rawResponseText || '').trim();
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
            /मुझे देखो/i,
            /mujhe dekho/i,
            /look at me/i,
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
    isLoadingChatRef.current = true;
    audioSynth.playReceive();
    addLog('success', 'VAD_SILENCE_DETECT', `आवाज़ पहचान: "${clean}" (1-sec silence detected -> Mic auto turned off, response generating)`);
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
        setLiveSpeechTranscript('नमस्ते तारा, तुम्हें मेरे बारे में क्या-क्या याद है?');
      }, 700);
      setTimeout(() => {
        setIsListening(false);
        isListeningRef.current = false;
        setLiveSpeechTranscript('');
        handleSendMessage('नमस्ते तारा, तुम्हें मेरे बारे में क्या-क्या याद है?');
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
          // Silence Detection (VAD): When silence occurs for 1000ms (1 second), mic auto turns off and triggers response
          vadTimerRef.current = setTimeout(() => {
            commitVoiceUtterance(fullUtterance);
          }, 1000);
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

    // Requirement 2: Start dabane par sirf ek baar bole: "Hello Boss! Kaise hain aap?"
    if (!hasGreetedBossRef.current) {
      hasGreetedBossRef.current = true;
      speechEngine.speak("Hello Boss! Kaise hain aap?", true);
    }

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

  // Requirement 1: Stranger Alert Defense - "Koi anjaan vyakti samne aaye toh TARA bole: 'Aap mere Boss nahi hain' aur command band kare"
  const handleTriggerStrangerDefense = useCallback((alertMsg: string = 'आप मेरे बॉस नहीं हैं।') => {
    // 1. Command band kare: Stop voice listening immediately
    handleStopVoice();
    // 2. Abort any current speech or synthesis
    speechEngine.cancel();
    // 3. Play error alert tone
    audioSynth.playError();
    // 4. Speak strictly: "आप मेरे बॉस नहीं हैं।"
    if (speechEngine.getIsTtsEnabled()) {
      speechEngine.speak(alertMsg, true);
    }
    // 5. Update face security state to stranger detected
    setFaceSecurityState((prev) => ({
      ...prev,
      status: 'stranger_detected',
      isOwner: false,
      isStranger: true,
      ownerLocation: 'अनजान व्यक्ति डिटेक्ट हुआ - सुरक्षा ब्लॉक (कमांड्स बंद)',
      spokenMessage: alertMsg,
    }));
    // 6. Log security alert
    addLog('warn', 'FACE_SECURITY', `🚨 TARA STRANGER ALERT: "${alertMsg}" — अनधिकृत व्यक्ति डिटेक्ट होने पर सभी कमांड्स और वॉयस कॉल तुरंत बंद कर दिए गए।`);
  }, []);

  // Restore Boss Access: Unlocks commands and greets Boss
  const handleVerifyBossAccess = useCallback(() => {
    audioSynth.playSuccess();
    setFaceSecurityState({
      status: 'owner_verified',
      isOwner: true,
      isStranger: false,
      mood: 'focused',
      isTiredOrSad: false,
      wellnessMessage: '',
      ownerLocation: 'बॉस कैमरे के सामने उपस्थित हैं',
      confidence: 0.99,
      spokenMessage: 'Hello Boss! Kaise hain aap?',
    });
    if (speechEngine.getIsTtsEnabled()) {
      speechEngine.speak('Hello Boss! Kaise hain aap?', true);
    }
    addLog('success', 'FACE_SECURITY', '🛡️ बॉस वेरिफाइड — कमांड्स व सुरक्षा सिस्टम सामान्य रूप से सक्रिय।');
  }, []);

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
      addLog('success', 'VISION_ATTACH', `फोटो संलग्न हुई: "${file.name}"`);
    };
    reader.readAsDataURL(file);
  };

  // Direct file input change handler for file picker
  const handlePhotoFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    audioSynth.playReceive();
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      const base64Data = dataUrl.split(',')[1] || '';
      const media: AttachedMedia = {
        name: file.name,
        previewUrl: dataUrl,
        data: base64Data,
        mimeType: file.type || 'image/jpeg',
        source: 'upload',
      };
      setAttachedMedia(media);
      setCardData((prev) => ({
        ...prev,
        imageUrl: dataUrl,
        title: file.name.replace(/\.[^/.]+$/, ''),
      }));
      audioSynth.playSuccess();
      addLog('success', 'VISION_ATTACH', `फ़ोटो संलग्न हुई: "${file.name}"`);
      handleSendMessage('तारा, मैंने यह फ़ोटो जोड़ी है। कृपया इसे देखकर बताओ यह कैसी है और इसमें क्या दिख रहा है?', media);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
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
    <div className="h-screen h-[100dvh] max-h-screen max-h-[100dvh] w-full flex flex-col bg-[#02050e] text-slate-100 selection:bg-cyan-500/30 selection:text-cyan-200 antialiased relative overflow-hidden select-none">
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
              TARA • आपकी उच्च-शिक्षित, होशियार व समझदार दोस्त // SCHOLARLY HUMAN-LIKE AI COMPANION
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

          {/* VISUAL EMOTION INDICATOR (MOOD GLOW HEADER CHIP) */}
          {(() => {
            const emoConfig = TARA_EMOTION_CONFIGS[currentEmotion] || TARA_EMOTION_CONFIGS.calm_caring;
            return (
              <div
                onClick={() => {
                  audioSynth.playSciFiClick();
                  const nextMap: Record<TaraEmotion, TaraEmotion> = {
                    calm_caring: 'happy_excited',
                    happy_excited: 'empathy_support',
                    empathy_support: 'calm_caring',
                  };
                  const next = nextMap[currentEmotion];
                  setCurrentEmotion(next);
                  saveToStorage('tara_emotion', next);
                  audioSynth.playEmotionFeedback(next);
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded border text-[10px] font-mono cursor-pointer transition-all hover:scale-105 active:scale-95 ${emoConfig.badgeClasses}`}
                title={`TARA का भावनात्मक भाव: ${emoConfig.label} (${emoConfig.sublabel})\n${emoConfig.description}\nक्लिक करके मूड बदलें (Cycle Emotional State)`}
              >
                <span className="w-1.5 h-1.5 rounded-full animate-ping" style={{ backgroundColor: emoConfig.glowColorHex }} />
                <span className="text-slate-300">भाव:</span>
                <span className="font-bold">{emoConfig.emoji} {emoConfig.label}</span>
              </div>
            );
          })()}

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

        {/* Right: Quick HUD Actions (Memory Vault, Camera, Upload Photo, Leads, Calls, Fullscreen) */}
        <div className="flex items-center gap-1.5">
          {/* 🧠 Cognitive Memory Vault Button */}
          <button
            type="button"
            onClick={() => {
              audioSynth.playSciFiClick();
              setIsMemoryVaultOpen(true);
            }}
            className="px-2.5 py-1 rounded-lg bg-purple-950/90 hover:bg-purple-900 border border-purple-400/60 text-[10px] font-mono text-purple-200 flex items-center gap-1.5 cursor-pointer transition-all hover:scale-105 shadow-[0_0_12px_rgba(168,85,247,0.35)]"
            title="तारा की याददाश्त (Cognitive Memory Vault): क्लिक करके याद रखी बातें देखें या जोड़ें"
          >
            <Brain className="w-3.5 h-3.5 text-purple-300 animate-pulse" />
            <span className="hidden sm:inline">याददाश्त</span>
            <span className="px-1.5 py-0.2 rounded-full bg-purple-500/30 text-[9px] text-purple-200 border border-purple-400/40 font-bold">
              {memories.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              audioSynth.playSciFiClick();
              setIsLiveCameraOpen(true);
            }}
            className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-cyan-600 to-sky-600 hover:from-cyan-500 hover:to-sky-500 text-[10px] font-mono text-slate-950 font-bold flex items-center gap-1 cursor-pointer transition-all hover:scale-105 shadow-[0_0_12px_rgba(0,240,255,0.4)]"
            title="लाइव कैमरा खोलें और फ़ोटो खींचें (Live Camera & Snap)"
          >
            <Camera className="w-3 h-3 text-slate-950" />
            <span className="hidden sm:inline">कैमरा</span>
          </button>
          <button
            type="button"
            onClick={() => {
              audioSynth.playSciFiClick();
              photoFileInputRef.current?.click();
            }}
            className="px-2.5 py-1 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-400/60 text-[10px] font-mono text-emerald-200 flex items-center gap-1 cursor-pointer transition-all hover:scale-105 shadow-sm"
            title="फ़ाइल या गैलरी से फ़ोटो जोड़ें (Upload Photo from Files)"
          >
            <Upload className="w-3 h-3 text-emerald-300" />
            <span className="hidden sm:inline">फ़ोटो जोड़ें</span>
          </button>
          <button
            type="button"
            onClick={() => {
              audioSynth.playSciFiClick();
              setActiveTab('leads');
            }}
            className="px-2.5 py-1 rounded-lg bg-pink-950/70 hover:bg-pink-900 border border-pink-500/30 text-[10px] font-mono text-pink-300 flex items-center gap-1 cursor-pointer transition-all hover:scale-105"
            title="व्हाट्सएप लीड्स और इंक्वायरी (Leads)"
          >
            <MessageSquare className="w-3 h-3 text-pink-400" />
            <span className="hidden sm:inline">लीड्स</span>
          </button>
          <button
            type="button"
            onClick={() => {
              audioSynth.playSciFiClick();
              handleInitiateCall();
            }}
            className="px-2.5 py-1 rounded-lg bg-emerald-950/70 hover:bg-emerald-900 border border-emerald-500/40 text-[10px] font-mono text-emerald-300 flex items-center gap-1 cursor-pointer transition-all hover:scale-105"
            title="फ़ोन डायलर (Direct Phone Dialer)"
          >
            <Phone className="w-3 h-3 text-emerald-400" />
            <span className="hidden sm:inline">डायलर</span>
          </button>
          <button
            type="button"
            onClick={() => {
              audioSynth.playSciFiClick();
              handlePlayMusic();
            }}
            className="px-2.5 py-1 rounded-lg bg-sky-950/80 hover:bg-sky-900 border border-sky-500/50 text-[10px] font-mono text-sky-300 flex items-center gap-1 cursor-pointer transition-all hover:scale-105"
            title="यूट्यूब म्यूजिक प्लेयर (YouTube Music Hub)"
          >
            <Music className="w-3 h-3 text-sky-400" />
            <span className="hidden sm:inline">म्यूजिक</span>
          </button>
          <button
            type="button"
            onClick={() => {
              audioSynth.playSciFiClick();
              setActiveTab('calls');
            }}
            className="px-2.5 py-1 rounded-lg bg-purple-950/70 hover:bg-purple-900 border border-purple-500/30 text-[10px] font-mono text-purple-300 flex items-center gap-1 cursor-pointer transition-all hover:scale-105"
            title="इनकमिंग कॉल एजेंट (Call Agent)"
          >
            <PhoneCall className="w-3 h-3 text-purple-400" />
            <span className="hidden sm:inline">कॉल एजेंट</span>
          </button>
          <button
            type="button"
            onClick={() => {
              audioSynth.playSciFiClick();
              setIsAppHubModalOpen(true);
            }}
            className="px-2.5 py-1 rounded-lg bg-teal-950/80 hover:bg-teal-900 border border-teal-500/50 text-[10px] font-mono text-teal-300 flex items-center gap-1 cursor-pointer transition-all hover:scale-105"
            title="TARA ऐप हब व वेब लॉन्चर (App Hub & Launcher)"
          >
            <LayoutGrid className="w-3 h-3 text-teal-400" />
            <span className="hidden sm:inline">ऐप हब</span>
          </button>
          <PWAInstallButton />
          <button
            type="button"
            onClick={() => {
              audioSynth.playSciFiClick();
              handleToggleFullscreen();
            }}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:text-cyan-300 hover:border-cyan-500/40 text-[10px] cursor-pointer transition-all"
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </header>

      {/* TARA BOSS GREETING & SECRET VISION STATUS HUD */}
      <div className={`w-full border-b px-3 py-1.5 flex flex-wrap items-center justify-between gap-2 text-xs font-mono shadow-[0_0_20px_rgba(0,240,255,0.12)] z-20 shrink-0 transition-colors ${
        faceSecurityState.isStranger
          ? 'bg-rose-950/95 border-rose-500/60'
          : faceSecurityState.isTiredOrSad
          ? 'bg-amber-950/95 border-amber-500/50'
          : 'bg-[#040e21]/95 border-cyan-500/30'
      }`}>
        <div className="flex items-center flex-wrap gap-2">
          <span className={`w-2 h-2 rounded-full ${
            faceSecurityState.isStranger ? 'bg-rose-400' : faceSecurityState.isTiredOrSad ? 'bg-amber-400' : 'bg-cyan-400'
          } animate-ping`} />
          <span className={`${
            faceSecurityState.isStranger ? 'text-rose-400' : faceSecurityState.isTiredOrSad ? 'text-amber-300' : 'text-cyan-400'
          } font-bold uppercase tracking-wider text-[11px]`}>
            TARA {faceSecurityState.isStranger ? 'SECURITY ALERT:' : faceSecurityState.isTiredOrSad ? 'WELLNESS CARE:' : 'STATUS:'}
          </span>
          <span className="text-white font-medium text-xs sm:text-sm drop-shadow-[0_0_8px_rgba(0,240,255,0.7)]">
            {faceSecurityState.isStranger
              ? '"आप मेरे बॉस नहीं हैं।"'
              : faceSecurityState.isTiredOrSad
              ? '"Boss, tabiyat theek nahi hai kya? Aaram kar lijiye."'
              : '"Hello Boss! Kaise hain aap?"'}
          </span>

          {/* Secret Camera Status Indicator */}
          <div className="hidden sm:flex items-center gap-1.5 ml-2 pl-2 border-l border-cyan-500/30">
            <span className={`inline-block w-2 h-2 rounded-full ${
              faceSecurityState.isStranger
                ? 'bg-rose-500 animate-pulse'
                : faceSecurityState.isTiredOrSad
                ? 'bg-amber-400 animate-bounce'
                : 'bg-emerald-400'
            }`} />
            <span className={`text-[10px] font-bold ${
              faceSecurityState.isStranger
                ? 'text-rose-300'
                : faceSecurityState.isTiredOrSad
                ? 'text-amber-300'
                : 'text-emerald-300'
            }`}>
              {faceSecurityState.isStranger
                ? 'अंजान व्यक्ति डिटेक्टेड'
                : faceSecurityState.isTiredOrSad
                ? '😴 थकान/उदासी डिटेक्टेड'
                : '🛡️ बॉस उपस्थित (सीक्रेट कैमरा)'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Quick "India Samachar" non-stop news trigger */}
          <button
            type="button"
            onClick={() => {
              handleSendMessage('इंडिया समाचार बताओ');
            }}
            className="px-2.5 py-1 rounded-lg bg-red-950/90 hover:bg-red-900 border border-red-500/60 text-red-200 text-[11px] font-mono font-bold flex items-center gap-1.5 cursor-pointer transition-all hover:scale-105 active:scale-95 shadow-[0_0_15px_rgba(239,68,68,0.25)]"
            title="देश के ताज़ा राष्ट्रीय हिंदी समाचार नॉन-स्टॉप सुनें (बिना कोई सवाल पूछे)"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping" />
            <span>📻 इंडिया समाचार</span>
          </button>

          {/* Quick "Mujhe Dekho" trigger */}
          <button
            type="button"
            onClick={() => {
              handleSendMessage('मुझे देखो');
            }}
            className="px-2 py-1 rounded-lg bg-emerald-950/90 hover:bg-emerald-900 border border-emerald-400/60 text-emerald-200 text-[11px] font-mono font-bold flex items-center gap-1 cursor-pointer transition-all hover:scale-105 active:scale-95"
            title="तारा से पूछें: मुझे देखो (बॉस की पहचान व मूड जांचें)"
          >
            <span>👁️ मुझे देखो</span>
          </button>

          {/* If Stranger is detected, provide Boss Unlock button */}
          {faceSecurityState.isStranger && (
            <button
              type="button"
              onClick={handleVerifyBossAccess}
              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 border border-emerald-400 text-white text-[11px] font-mono font-bold flex items-center gap-1 cursor-pointer transition-all animate-pulse shadow-md"
              title="बॉस को सत्यापित करें और कमांड्स पुनः सक्रिय करें"
            >
              <span>🛡️ बॉस अनलॉक</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              audioSynth.playSciFiClick();
              if (faceSecurityState.isStranger) {
                speechEngine.speak("आप मेरे बॉस नहीं हैं।", true);
              } else if (faceSecurityState.isTiredOrSad) {
                speechEngine.speak("Boss, tabiyat theek nahi hai kya? Aaram kar lijiye.", true);
              } else {
                speechEngine.speak("Hello Boss! Kaise hain aap?", true);
              }
            }}
            className="px-2.5 py-1 rounded-lg bg-cyan-950/90 hover:bg-cyan-900 border border-cyan-400/60 text-cyan-200 text-[11px] font-mono font-bold flex items-center gap-1.5 cursor-pointer transition-all hover:scale-105 active:scale-95 shadow-sm"
            title="तारा की आवाज़ में दोबारा ग्रीटिंग या मूड केयर सुनें"
          >
            <Volume2 className="w-3.5 h-3.5 text-cyan-300 animate-pulse" />
            <span>दोबारा बोलें (Replay)</span>
          </button>
        </div>
      </div>

      {/* 2. MAIN CLEAN SCREEN: REALISTIC GLOBAL MAP + TARA CORE ORB + HUD LOG CONSOLE */}
      <main className="flex-1 w-full p-2 sm:p-2.5 grid grid-cols-1 lg:grid-cols-12 gap-2.5 z-10 min-h-0 h-full max-h-full overflow-hidden">
        {/* WIDGET 1: REALISTIC GLOBAL MAP */}
        <section className="lg:col-span-4 flex flex-col h-full max-h-full min-h-0 overflow-hidden">
          <CyberSatelliteMapPanel
            className="w-full h-full min-h-0 max-h-full"
            onSelectNode={(nodeName) => {
              handleSendMessage(`${nodeName} नोड की वर्तमान स्थिति क्या है?`);
            }}
          />
        </section>

        {/* WIDGET 2: TARA CORE ORB */}
        <section className="lg:col-span-4 flex flex-col h-full max-h-full min-h-0 overflow-hidden">
          <CyberReactorOrb
            isListening={isListening}
            isSpeaking={isSpeaking}
            isHandsFreeMode={isHandsFreeMode}
            currentEmotion={currentEmotion}
            onSelectEmotion={(emo) => {
              setCurrentEmotion(emo);
              saveToStorage('tara_emotion', emo);
              addLog('info', 'EMOTION_CORE', `भावनात्मक अवस्था बदली: ${emo}`);
            }}
            onToggleVoice={isHandsFreeMode ? handleStopVoice : handleStartVoice}
            onSendMessage={handleSendMessage}
            laptopTelemetry={laptopTelemetry}
            screenStream={screenStream}
            onToggleScreenShare={handleToggleScreenShare}
            onCaptureScreenSnapshot={handleCaptureScreenSnapshot}
            onOpenCamera={() => setIsLiveCameraOpen(true)}
            onOpenUploadPhoto={() => photoFileInputRef.current?.click()}
            onOpenMemoryVault={() => setIsMemoryVaultOpen(true)}
            attachedPhoto={attachedMedia ? { name: attachedMedia.name, previewUrl: attachedMedia.previewUrl } : null}
            onClearAttachedPhoto={() => setAttachedMedia(null)}
            className="w-full h-full min-h-0 max-h-full"
          />
        </section>

        {/* WIDGET 3: FIXED SIZE SCI-FI HUD LOG CONSOLE (Auto-scroll neon console, strictly locked) */}
        <section className="lg:col-span-4 flex flex-col h-full max-h-full min-h-0 overflow-hidden">
          <SciFiHudLogConsole
            chatMessages={chatMessages}
            logs={logs}
            onSendMessage={handleSendMessage}
            isLoadingChat={isLoadingChat}
            isListening={isListening}
            onToggleVoice={isHandsFreeMode ? handleStopVoice : handleStartVoice}
            liveSpeechTranscript={liveSpeechTranscript}
            onClearLogs={() => setLogs([])}
            className="w-full h-full min-h-0 max-h-full"
          />
        </section>
      </main>

      {/* STEALTH SECRET CAMERA SECURITY GUARD (Display 100% hidden, runs silently in background) */}
      <div className="hidden pointer-events-none" aria-hidden="true" style={{ display: 'none' }}>
        <TaraLiveCameraWidget
          onPhotoCaptured={(media, prompt) => {
            setAttachedMedia(media);
            if (prompt) {
              handleSendMessage(prompt, media);
            }
          }}
          onSecurityStatusChange={(status) => {
            setFaceSecurityState(status);
          }}
          onStrangerAlert={(msg) => {
            handleTriggerStrangerDefense(msg || 'आप मेरे बॉस नहीं हैं।');
          }}
        />
      </div>

      {/* FABRICATION RATES & ESTIMATION MODAL OVERLAY */}
      {activeTab === 'rates' && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
          <div className="w-full max-w-5xl max-h-[92vh] bg-[#070f1e] border border-cyan-500/40 rounded-2xl overflow-y-auto p-4 sm:p-6 relative shadow-[0_0_50px_rgba(0,240,255,0.25)] flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-cyan-500/20">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-cyan-400" />
                <h2 className="text-base sm:text-lg font-heading font-black text-cyan-300">
                  🏭 मोहन विश्वास फैब्रिकेशन • दर व कोटेशन तालिका (Fabrication Rates & Estimation)
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
              onAskTara={(query) => {
                handleSendMessage(query);
                setActiveTab('assistant');
              }}
              onOpenLeadResponder={() => setActiveTab('leads')}
            />
          </div>
        </div>
      )}

      {/* PHOTO & CAMERA STUDIO MODAL OVERLAY */}
      {activeTab === 'camera' && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
          <div className="w-full max-w-4xl max-h-[90vh] bg-[#070f1e] border border-cyan-500/40 rounded-2xl overflow-y-auto p-4 sm:p-6 relative shadow-[0_0_50px_rgba(0,240,255,0.25)] flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-cyan-500/20">
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-cyan-400" />
                <h2 className="text-base sm:text-lg font-heading font-black text-cyan-300">
                  📷 तारा • कैमरा व फ़ोटो स्टूडियो (Camera & Photo Studio)
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-[#040c1b] border border-cyan-500/30 flex flex-col items-center text-center gap-3">
                <div className="w-14 h-14 rounded-full bg-cyan-950 border border-cyan-400 flex items-center justify-center text-cyan-300 shadow-[0_0_20px_rgba(0,240,255,0.3)]">
                  <Camera className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-sm text-cyan-200">लाइव कैमरा से फ़ोटो खींचें</h3>
                  <p className="text-xs font-mono text-slate-400 mt-1">अपने लैपटॉप या मोबाइल कैमरे से लाइव फ़ोटो कैप्चर करें और तारा से पूछें।</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('assistant');
                    setIsLiveCameraOpen(true);
                  }}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-sky-600 hover:from-cyan-500 hover:to-sky-500 text-slate-950 font-bold font-mono text-xs flex items-center gap-2 shadow-md cursor-pointer transition-all"
                >
                  <Camera className="w-4 h-4" />
                  <span>कैमरा खोलें (Open Camera)</span>
                </button>
              </div>

              <div className="p-4 rounded-xl bg-[#040c1b] border border-emerald-500/30 flex flex-col items-center text-center gap-3">
                <div className="w-14 h-14 rounded-full bg-emerald-950 border border-emerald-400 flex items-center justify-center text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                  <Upload className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-sm text-emerald-200">फ़ाइल या गैलरी से फ़ोटो जोड़ें</h3>
                  <p className="text-xs font-mono text-slate-400 mt-1">अपने डिवाइस से कोई भी इमेज अपलोड करें, तारा उसका पूरा विवरण देगी।</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('assistant');
                    photoFileInputRef.current?.click();
                  }}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-slate-950 font-bold font-mono text-xs flex items-center gap-2 shadow-md cursor-pointer transition-all"
                >
                  <Upload className="w-4 h-4" />
                  <span>फ़ाइल चुनें (Upload Photo)</span>
                </button>
              </div>
            </div>

            {attachedMedia && (
              <div className="p-3 rounded-xl bg-[#020712] border border-cyan-400/40 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img src={attachedMedia.previewUrl} alt="Current" className="w-12 h-12 rounded-lg object-cover border border-cyan-400/50" />
                  <div>
                    <span className="text-xs font-mono text-cyan-200 font-bold block">{attachedMedia.name}</span>
                    <span className="text-[10px] font-mono text-emerald-400">संलग्न फ़ोटो तैयार है</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('assistant');
                    handleSendMessage('तारा, इस फ़ोटो को देखकर बताओ यह कैसी है और इसमें क्या दिख रहा है?');
                  }}
                  className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold font-mono text-xs cursor-pointer"
                >
                  तारा से पूछें
                </button>
              </div>
            )}
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

      {/* DIRECT CALL DIALER POPUP MODAL */}
      <SciFiCallDialerModal
        session={callSession}
        onClose={() => setCallSession((prev) => ({ ...prev, isOpen: false }))}
        onEndCall={handleEndCall}
        onUpdateSession={(patch) => setCallSession((prev) => ({ ...prev, ...patch }))}
      />

      {/* YOUTUBE MUSIC PLAYER MODAL & FLOATING WIDGET */}
      <YouTubeMusicPlayerModal
        isOpen={isMusicModalOpen}
        isPlaying={isMusicPlaying}
        currentTrack={currentTrack}
        volume={musicVolume}
        isMuted={isMusicMuted}
        onVolumeChange={(vol) => setMusicVolume(vol)}
        onToggleMute={handleToggleMusicMute}
        onClose={handleStopAndCloseMusic}
        onTogglePlay={(playState) => {
          audioSynth.playSciFiClick();
          if (playState !== undefined) {
            setIsMusicPlaying(playState);
          } else {
            setIsMusicPlaying((prev) => !prev);
          }
        }}
        onNextTrack={handleNextTrack}
        onPrevTrack={handlePrevTrack}
        onSelectTrack={(t) => handlePlayMusic(t)}
        isMinimized={isMusicMinimized}
        onToggleMinimize={() => {
          audioSynth.playSciFiClick();
          setIsMusicMinimized((prev) => !prev);
        }}
      />

      {/* SCI-FI APP LAUNCH NOTIFICATION TOAST */}
      {appLaunchToast && (
        <aside
          aria-label="App Launcher Toast"
          className="fixed top-14 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-[#040d22]/95 border-2 border-cyan-400/80 shadow-[0_0_35px_rgba(0,240,255,0.4)] backdrop-blur-md animate-in slide-in-from-top-4 duration-200"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-600 to-sky-400 flex items-center justify-center text-white shadow-md">
            <Radio className="w-4 h-4 animate-spin text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-heading font-black text-white">
                🚀 {appLaunchToast.appName}
              </span>
              <span className="px-1.5 py-0.2 rounded bg-emerald-950 border border-emerald-400/40 text-[9px] font-mono text-emerald-300 font-bold uppercase">
                LAUNCHED // NEW TAB
              </span>
            </div>
            <p className="text-[10px] font-mono text-cyan-300 truncate max-w-64">
              लिंक नई विंडो में खोला गया
            </p>
          </div>
          <div className="flex items-center gap-1.5 ml-2">
            <a
              href={appLaunchToast.url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-2.5 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-[10px] font-bold flex items-center gap-1 transition-all"
            >
              <span>सीधे खोलें</span>
              <ArrowUpRight className="w-3 h-3" />
            </a>
            <button
              type="button"
              onClick={() => setAppLaunchToast(null)}
              className="p-1 rounded-lg text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </aside>
      )}

      {/* FULL APP HUB MODAL (WHEN OPENED FROM HEADER) */}
      {isAppHubModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
          <div className="w-full max-w-2xl bg-[#030917] border border-cyan-500/50 rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(0,240,255,0.3)] flex flex-col">
            <div className="px-4 py-3 bg-[#020612] border-b border-cyan-500/25 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <LayoutGrid className="w-5 h-5 text-cyan-400" />
                <h3 className="text-sm sm:text-base font-heading font-black text-cyan-200">
                  TARA APP HUB & WEB LAUNCHER
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAppHubModalOpen(false)}
                className="p-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-3 sm:p-4 max-h-[80vh] overflow-y-auto">
              <SciFiAppHubPanel
                onOpenInternalApp={(id) => {
                  setIsAppHubModalOpen(false);
                  if (id === 'calculator') setIsCalculationCardOpen(true);
                }}
                onLaunchUrl={(url, name) => {
                  setIsAppHubModalOpen(false);
                  handleLaunchUrl(url, name);
                }}
                onOpenCamera={() => {
                  setIsAppHubModalOpen(false);
                  setIsLiveCameraOpen(true);
                }}
                onUploadPhoto={() => {
                  setIsAppHubModalOpen(false);
                  photoFileInputRef.current?.click();
                }}
                onOpenMemoryVault={() => {
                  setIsAppHubModalOpen(false);
                  setIsMemoryVaultOpen(true);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* DIRECT CALCULATION & QUOTATION CARD POP-UP */}
      <SciFiCalculationCardModal
        isOpen={isCalculationCardOpen}
        onClose={() => setIsCalculationCardOpen(false)}
        onOpenFullRateList={() => setIsCalculationCardOpen(false)}
        initialService={calcModalService}
        initialQuantity={calcModalQuantity}
      />

      {/* TARA LIVE CAMERA MODAL (FOR SNAPPING PHOTOS) */}
      <TaraLiveCameraModal
        isOpen={isLiveCameraOpen}
        onClose={() => setIsLiveCameraOpen(false)}
        onPhotoCaptured={(media, prompt) => {
          setAttachedMedia(media);
          handleSendMessage(prompt || 'तारा, इस फ़ोटो को देखकर बताओ इसमें क्या दिख रहा है?', media);
        }}
      />

      {/* TARA COGNITIVE HUMAN MEMORY VAULT MODAL */}
      <TaraMemoryVaultModal
        isOpen={isMemoryVaultOpen}
        onClose={() => setIsMemoryVaultOpen(false)}
        memories={memories}
        onAddMemory={handleAddMemory}
        onDeleteMemory={handleDeleteMemory}
        onAskAboutMemory={(fact) => {
          setIsMemoryVaultOpen(false);
          handleSendMessage(`तारा, इस बात के बारे में बताओ जो तुमने याद रखी है: "${fact}"`);
        }}
      />

      {/* HIDDEN FILE INPUT FOR SELECTING PHOTO FROM FILES / GALLERY */}
      <input
        ref={photoFileInputRef}
        type="file"
        accept="image/*"
        onChange={handlePhotoFileInputChange}
        className="hidden"
      />

      {/* SCI-FI LAPTOP NOTIFICATION POP-UP (DIRECT NOTE & REMINDER) */}
      {laptopDirectNoteNotification && (
        <aside
          aria-label="Laptop Direct Note Notification"
          className="fixed top-14 right-3 sm:right-6 z-50 w-[92vw] sm:w-96 p-3.5 rounded-2xl bg-[#040d24]/95 border-2 border-emerald-400/80 shadow-[0_0_40px_rgba(16,185,129,0.4)] backdrop-blur-md animate-in slide-in-from-right-4 duration-200 flex flex-col gap-2"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-md">
                <Bell className="w-4 h-4 animate-bounce text-white" />
              </div>
              <div>
                <span className="text-[11px] font-heading font-black text-white block">
                  LAPTOP NOTIFICATION
                </span>
                <span className="text-[9px] font-mono text-emerald-300 font-bold">
                  {laptopDirectNoteNotification.category} // SAVED
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setLaptopDirectNoteNotification(null)}
              className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-2.5 rounded-xl bg-[#020713] border border-emerald-500/30">
            <p className="text-xs font-heading font-bold text-slate-100">
              {laptopDirectNoteNotification.title}
            </p>
            <p className="text-[11px] font-sans text-slate-300 mt-1">
              "{laptopDirectNoteNotification.content}"
            </p>
            <span className="text-[9px] font-mono text-emerald-400 mt-1 block">
              ✓ Saved to Laptop Storage • Ready for Reminder
            </span>
          </div>

          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={() => {
                audioSynth.playSciFiClick();
                setLaptopDirectNoteNotification(null);
                setActiveTab('assistant');
              }}
              className="text-[10px] font-mono text-cyan-300 hover:text-white underline cursor-pointer"
            >
              नोट्स में देखें ↗
            </button>
            <span className="text-[9px] font-mono text-slate-500">Just now</span>
          </div>
        </aside>
      )}
    </div>
  );
}
