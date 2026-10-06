/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  Sparkles,
  PhoneCall,
  Share2,
  Coffee,
  Volume2,
  VolumeX,
  Play,
  RotateCcw,
  Footprints,
  Compass,
  CheckCircle2,
  ArrowRight,
  Calculator,
  MapPin,
  MessageSquare,
  UserCheck,
  Send,
  Mic,
  MicOff,
  Copy,
  Check,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Building2,
  Hammer
} from 'lucide-react';
import { TaskItem, ChatMessage } from '../types';
import { loadFabricationConfig, formatRateDisplay } from '../data/fabricationData';
import { generateInstantHindiQuotation } from '../data/leadsData';
import { speechEngine } from '../utils/speech';
import ReactMarkdown from 'react-markdown';

export type DeskId = 'calc' | 'leads' | 'orders' | 'manager' | 'cooler' | 'apps' | 'social' | 'calls';

export interface DeskInfo {
  id: DeskId;
  name: string;
  nameHi: string;
  workerName: string;
  role: string;
  x: number; // canvas percent 0-100
  y: number; // canvas percent 0-100
  facing: 'left' | 'right' | 'up' | 'down';
  color: string;
  accentColor: string;
  currentTask: string;
  completedCount: number;
  isWorking: boolean;
  recentLog: string;
}

interface PixelOfficeCardProps {
  tasks?: TaskItem[];
  chatMessages?: ChatMessage[];
  onSendMessage?: (text: string) => void;
  isLoadingChat?: boolean;
  isSpeaking?: boolean;
  isListening?: boolean;
  onToggleVoice?: () => void;
  onTriggerTaskAction?: (department: string, taskTitle: string) => void;
  onOpenCallAgent?: () => void;
  onOpenRates?: () => void;
  onOpenLeads?: () => void;
  className?: string;
  defaultExpanded?: boolean;
  minimal?: boolean;
  defaultShowConversationDock?: boolean;
  liveSpeechTranscript?: string;
}

// Retro Web Audio 8-bit Sound Synthesizer for Pixel Office
class PixelSoundFX {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  private getContext(): AudioContext | null {
    if (!this.enabled || typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  // 8-bit footstep blip
  public step() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(140 + Math.random() * 40, ctx.currentTime);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.045);
    } catch {}
  }

  // 8-bit Alert chime when TARA receives a directive
  public alert() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.08); // A5
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } catch {}
  }

  // Task Completed retro fanfare
  public complete() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        if (!ctx) return;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.07);
        gain.gain.setValueAtTime(0.05, ctx.currentTime + idx * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.07 + 0.12);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.07);
        osc.stop(ctx.currentTime + idx * 0.07 + 0.12);
      });
    } catch {}
  }
}

const sfx = new PixelSoundFX();

export const PixelOfficeCard: React.FC<PixelOfficeCardProps> = ({
  tasks = [],
  chatMessages = [],
  onSendMessage,
  isLoadingChat = false,
  isSpeaking = false,
  isListening = false,
  onToggleVoice,
  onTriggerTaskAction,
  onOpenCallAgent,
  onOpenRates,
  onOpenLeads,
  className = '',
  defaultExpanded = true,
  minimal = true,
  defaultShowConversationDock = false,
  liveSpeechTranscript = '',
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [walkSpeed, setWalkSpeed] = useState<1 | 2>(1);
  const [selectedDeskId, setSelectedDeskId] = useState<DeskId | null>(null);
  const [showConversationDock, setShowConversationDock] = useState(defaultShowConversationDock);
  const [inOfficeInput, setInOfficeInput] = useState('');
  const [copiedQuote, setCopiedQuote] = useState(false);

  // Office Desks Data tailored for Mohan Vishwas Fabrication
  const [desks, setDesks] = useState<Record<DeskId, DeskInfo>>({
    calc: {
      id: 'calc',
      name: 'Calculation Desk',
      nameHi: 'कैलकुलेशन व रेट्स डेस्क',
      workerName: 'Rohan Calc (गणक)',
      role: 'Quotation & Rates Specialist',
      x: 20, // 20%
      y: 62, // 62%
      facing: 'down',
      color: '#06b6d4', // cyan
      accentColor: '#0891b2',
      currentTask: 'शेड्स (₹180-₹220) व रेलिंग (₹450) दर गणना',
      completedCount: 42,
      isWorking: false,
      recentLog: '1,000 sq ft शेड का त्वरित कोटेशन तैयार किया।',
    },
    leads: {
      id: 'leads',
      name: 'Lead Desk',
      nameHi: 'लीड्स व साइट विज़िट डेस्क',
      workerName: 'Maya Leads',
      role: 'Client Coordinator & Site Visits',
      x: 50, // 50%
      y: 62, // 62%
      facing: 'down',
      color: '#ec4899', // pink
      accentColor: '#db2777',
      currentTask: 'ग्राहक विवरण व साइट विज़िट पता प्रबंधन',
      completedCount: 29,
      isWorking: false,
      recentLog: 'राजेश शर्मा का साइट लोकेशन व हॉट लीड सेव किया।',
    },
    orders: {
      id: 'orders',
      name: 'Order & WhatsApp Desk',
      nameHi: 'व्हाट्सएप व ऑर्डर्स डेस्क',
      workerName: 'Alex Orders',
      role: 'WhatsApp Quotes & Order Dispatch',
      x: 80, // 80%
      y: 62, // 62%
      facing: 'down',
      color: '#10b981', // emerald
      accentColor: '#059669',
      currentTask: 'अधिकृत हिंदी कोटेशन व WhatsApp डिस्पैच',
      completedCount: 38,
      isWorking: false,
      recentLog: 'अधिकृत WhatsApp कोटेशन संदेश ड्राफ्ट किया।',
    },
    manager: {
      id: 'manager',
      name: 'TARA Executive Office',
      nameHi: 'तारा बॉस/मैनेजर स्टेशन',
      workerName: 'TARA (Office Manager & Boss)',
      role: 'Operations Director (Supervises the 3 Desks)',
      x: 50, // 50%
      y: 22, // 22%
      facing: 'down',
      color: '#38bdf8',
      accentColor: '#0284c7',
      currentTask: 'तीनों वर्कर डेस्क का सुपरविज़न व क्लाइंट रिपोर्टिंग',
      completedCount: 109,
      isWorking: true,
      recentLog: 'कैलकुलेशन, लीड्स व ऑर्डर्स टीम को डायरेक्टिव दिए।',
    },
    cooler: {
      id: 'cooler',
      name: 'Water Cooler & Cafe',
      nameHi: 'वाटर कूलर और ब्रेक कॉर्नर',
      workerName: 'Break Area',
      role: 'Refreshment Hub',
      x: 86,
      y: 20,
      facing: 'left',
      color: '#38bdf8',
      accentColor: '#0284c7',
      currentTask: 'चाय व कॉफ़ी ब्रेक',
      completedCount: 12,
      isWorking: false,
      recentLog: 'कर्मचारियों ने ताज़ा चाय ली।',
    },
    // Aliases for compatibility
    apps: {
      id: 'calc',
      name: 'Calculation Desk',
      nameHi: 'कैलकुलेशन व रेट्स डेस्क',
      workerName: 'Rohan Calc',
      role: 'Quotation Specialist',
      x: 20,
      y: 62,
      facing: 'down',
      color: '#06b6d4',
      accentColor: '#0891b2',
      currentTask: 'दर गणना',
      completedCount: 42,
      isWorking: false,
      recentLog: '',
    },
    social: {
      id: 'leads',
      name: 'Lead Desk',
      nameHi: 'लीड्स डेस्क',
      workerName: 'Maya Leads',
      role: 'Client Coordinator',
      x: 50,
      y: 62,
      facing: 'down',
      color: '#ec4899',
      accentColor: '#db2777',
      currentTask: 'लीड्स रिकॉर्ड',
      completedCount: 29,
      isWorking: false,
      recentLog: '',
    },
    calls: {
      id: 'orders',
      name: 'Order Desk',
      nameHi: 'ऑर्डर डेस्क',
      workerName: 'Alex Orders',
      role: 'Order Dispatch',
      x: 80,
      y: 62,
      facing: 'down',
      color: '#10b981',
      accentColor: '#059669',
      currentTask: 'WhatsApp डिस्पैच',
      completedCount: 38,
      isWorking: false,
      recentLog: '',
    },
  });

  // TARA Character Animation State (Starts at Manager Desk: x=50, y=22)
  const [taraPos, setTaraPos] = useState<{ x: number; y: number }>({ x: 50, y: 22 });
  const [targetPos, setTargetPos] = useState<{ x: number; y: number; deskId?: DeskId; label?: string } | null>(null);
  const [taraFacing, setTaraFacing] = useState<'left' | 'right' | 'up' | 'down'>('down');
  const [isWalking, setIsWalking] = useState<boolean>(false);
  const [taraWalkFrame, setTaraWalkFrame] = useState<number>(0);
  const [activeDeskEffect, setActiveDeskEffect] = useState<DeskId | null>(null);

  // INTERACTIVE WORKER-MANAGER TALK BUBBLE STATE
  const [dialogueInteraction, setDialogueInteraction] = useState<{
    active: boolean;
    step: 'walking' | 'commanding' | 'executing' | 'reported' | 'idle';
    targetDesk: DeskId;
    workerName: string;
    managerSpeech: string;
    workerSpeech: string;
    finalReportText: string;
    commandDescription: string;
  } | null>(null);

  // Floating Manager Status Bubble
  const [taraBubble, setTaraBubble] = useState<{ text: string; type: 'alert' | 'happy' | 'inspect' | 'command' } | null>({
    text: 'तारा: "सभी 3 वर्कर डेस्क तैयार हैं! आदेश दीजिए बॉस!"',
    type: 'happy',
  });

  const [clickMarker, setClickMarker] = useState<{ x: number; y: number } | null>(null);
  const [isPatrolling, setIsPatrolling] = useState<boolean>(false);

  const animFrameRef = useRef<number | null>(null);
  const lastStepSoundRef = useRef<number>(0);
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const lastHandledMsgIdRef = useRef<string | null>(null);

  // Auto-scroll in-office chat dock
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatMessages, dialogueInteraction]);

  // Sync sound toggle
  useEffect(() => {
    sfx.enabled = soundEnabled;
  }, [soundEnabled]);

  const patrolQueueRef = useRef<DeskId[]>([]);

  // Function to dispatch TARA to a desk or coordinates
  const sendTaraTo = useCallback((x: number, y: number, deskId?: DeskId, label?: string) => {
    setTargetPos({ x, y, deskId, label });
    sfx.alert();
  }, []);

  // DISPATCH TARA TO A WORKER DESK WITH FULL INTERACTIVE COMMAND BUBBLES
  const dispatchCommandToWorker = useCallback(
    (
      targetDesk: 'calc' | 'leads' | 'orders',
      commandDescription: string,
      customManagerSpeech?: string,
      customWorkerReply?: string,
      customFinalReport?: string
    ) => {
      const desk = desks[targetDesk];
      if (!desk) return;

      // Stand directly in front of the respective worker's desk on the hallway runner
      // calc: x: 21, y: 46; leads: x: 50, y: 46; orders: x: 80, y: 46
      const targetX = targetDesk === 'calc' ? 21 : targetDesk === 'leads' ? 50 : 80;
      const targetY = 46;

      const defaultDirectives: Record<'calc' | 'leads' | 'orders', { mgr: string; wkr: string; rep: string }> = {
        calc: {
          mgr: `रोहन! "${commandDescription}" का अधिकृत रेट व कोटेशन तुरंत निकालो!`,
          wkr: `जी मैम! शेड्स (₹180-₹220) व रेलिंग्स (₹450) की दर से हिसाब कर रहा हूँ... ⚡`,
          rep: `बॉस! गणक रोहन ने दर गणना पूर्ण कर ली है। अधिकृत दर ₹180-₹220/sq ft (शेड्स) और ₹450/running ft (SS रेलिंग) के अनुसार कोटेशन रिपोर्ट तैयार है।`,
        },
        leads: {
          mgr: `माया! ग्राहक विवरण दर्ज करो और साइट विज़िट हेतु पूरा पता नोट करो!`,
          wkr: `जी मैम! ग्राहक संपर्क व साइट नाप का रिकॉर्ड हॉट लीड्स में दर्ज कर रही हूँ... 📝`,
          rep: `बॉस! लीड कोऑर्डिनेटर माया ने ग्राहक विवरण व साइट विज़िट का विवरण हॉट लीड्स में सुरक्षित कर लिया है।`,
        },
        orders: {
          mgr: `एलेक्स! ग्राहक को तत्काल अधिकृत हिंदी कोटेशन WhatsApp संदेश ड्राफ्ट करो!`,
          wkr: `जी मैम! अधिकृत हिंदी कोटेशन व WhatsApp wa.me लिंक बना रहा हूँ... 💬`,
          rep: `बॉस! ऑर्डर डेस्क से एलेक्स ने WhatsApp कोटेशन तैयार कर दिया है। आप एक क्लिक में ग्राहक को डिस्पैच कर सकते हैं।`,
        },
      };

      const defaults = defaultDirectives[targetDesk];
      const managerSpeech = customManagerSpeech || defaults.mgr;
      const workerSpeech = customWorkerReply || defaults.wkr;
      const finalReportText = customFinalReport || defaults.rep;

      // Start interaction in 'walking' phase
      setDialogueInteraction({
        active: true,
        step: 'walking',
        targetDesk,
        workerName: desk.workerName,
        managerSpeech,
        workerSpeech,
        finalReportText,
        commandDescription,
      });

      setTaraBubble({ text: `तारा: "${desk.workerName} के डेस्क पर जा रही हूँ..."`, type: 'command' });
      sendTaraTo(targetX, targetY, targetDesk, commandDescription);

      // Set worker to preparing
      setDesks((prev) => ({
        ...prev,
        [targetDesk]: {
          ...prev[targetDesk],
          currentTask: commandDescription,
          isWorking: true,
        },
      }));
    },
    [desks, sendTaraTo]
  );

  // Click on floor to walk
  const handleFloorClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = ((e.clientX - rect.left) / rect.width) * 100;
    const clickY = ((e.clientY - rect.top) / rect.height) * 100;

    const clampedX = Math.max(8, Math.min(92, clickX));
    const clampedY = Math.max(14, Math.min(88, clickY));

    setClickMarker({ x: clampedX, y: clampedY });
    sendTaraTo(clampedX, clampedY, undefined, 'चल रही हूँ...');

    setTimeout(() => {
      setClickMarker(null);
    }, 1500);
  };

  // Automated Patrol mode
  const handleTogglePatrol = () => {
    if (isPatrolling) {
      setIsPatrolling(false);
      patrolQueueRef.current = [];
      setTaraBubble({ text: 'तारा: "सुपरविज़न राउंड समाप्त!"', type: 'happy' });
    } else {
      setIsPatrolling(true);
      patrolQueueRef.current = ['calc', 'leads', 'orders', 'manager'];
      const first = patrolQueueRef.current.shift();
      if (first && first !== 'manager' && first !== 'cooler') {
        dispatchCommandToWorker(first as any, 'सुपरविज़न राउंड');
      }
    }
  };

  // Watch external tasks array
  const prevTasksCount = useRef<number>(tasks.length);
  useEffect(() => {
    if (tasks.length > prevTasksCount.current) {
      const newestTask = tasks[0];
      if (newestTask) {
        const text = (newestTask.title + ' ' + (newestTask.category || '')).toLowerCase();
        if (/rate|price|shed|railing|gate|grill|calc|cost|quote|खर्च|रेट|हिसाब/i.test(text)) {
          dispatchCommandToWorker('calc', newestTask.title);
        } else if (/lead|client|customer|phone|address|site|पता|ग्राहक/i.test(text)) {
          dispatchCommandToWorker('leads', newestTask.title);
        } else if (/whatsapp|order|message|dispatch|call|alert|संदेश/i.test(text)) {
          dispatchCommandToWorker('orders', newestTask.title);
        } else {
          dispatchCommandToWorker('calc', newestTask.title);
        }
      }
    }
    prevTasksCount.current = tasks.length;
  }, [tasks, dispatchCommandToWorker]);

  // Watch incoming chat messages to ensure TARA walks whenever user speaks/sends
  useEffect(() => {
    if (chatMessages.length === 0) return;
    const latestUserMsg = chatMessages.slice().reverse().find((m) => m.sender === 'user');
    if (latestUserMsg && latestUserMsg.id !== lastHandledMsgIdRef.current) {
      lastHandledMsgIdRef.current = latestUserMsg.id;
      // Trigger manager dispatch if not already active
      const lower = latestUserMsg.text.toLowerCase();
      let target: 'calc' | 'leads' | 'orders' = 'calc';
      if (/lead|client|customer|phone|address|site|पता|ग्राहक|फोन|लोकेशन/i.test(lower)) {
        target = 'leads';
      } else if (/whatsapp|order|message|dispatch|send|alert|भेजो|व्हाट्सएप|ऑर्डर|संदेश/i.test(lower)) {
        target = 'orders';
      }
      dispatchCommandToWorker(target, latestUserMsg.text);
    }
  }, [chatMessages, dispatchCommandToWorker]);

  // Watch live speech transcript to animate manager & workers in real-time as words are spoken
  useEffect(() => {
    if (!liveSpeechTranscript || !liveSpeechTranscript.trim()) return;
    const clean = liveSpeechTranscript.trim();
    if (clean.length < 2) return;

    // Show live listening thought bubble on manager TARA
    setTaraBubble({
      text: `तारा: "${clean.length > 35 ? clean.slice(0, 35) + '...' : clean}" 🎙️`,
      type: 'command',
    });

    // Animate target desk worker immediately while user is speaking
    const lower = clean.toLowerCase();
    if (/rate|price|shed|railing|gate|grill|calc|cost|quote|खर्च|रेट|हिसाब/i.test(lower)) {
      setDesks((prev) => ({
        ...prev,
        calc: { ...prev.calc, isWorking: true, currentTask: `लाइव वॉइस: ${clean.slice(0, 25)}...` },
      }));
    } else if (/lead|client|customer|phone|address|site|पता|ग्राहक|फोन|लोकेशन/i.test(lower)) {
      setDesks((prev) => ({
        ...prev,
        leads: { ...prev.leads, isWorking: true, currentTask: `लाइव वॉइस: ${clean.slice(0, 25)}...` },
      }));
    } else if (/whatsapp|order|message|dispatch|send|alert|भेजो|व्हाट्सएप|ऑर्डर|संदेश/i.test(lower)) {
      setDesks((prev) => ({
        ...prev,
        orders: { ...prev.orders, isWorking: true, currentTask: `लाइव वॉइस: ${clean.slice(0, 25)}...` },
      }));
    }
  }, [liveSpeechTranscript]);

  // Smooth Movement Game Loop (60 FPS) with 4-Phase Manager-Worker Dialogue
  useEffect(() => {
    let lastTimestamp = performance.now();

    const updateMovement = (now: number) => {
      const dt = Math.min((now - lastTimestamp) / 1000, 0.1);
      lastTimestamp = now;

      if (targetPos) {
        const dx = targetPos.x - taraPos.x;
        const dy = targetPos.y - taraPos.y;
        const distance = Math.hypot(dx, dy);

        if (distance > 0.8) {
          const baseSpeed = walkSpeed === 2 ? 38 : 22;
          const stepDist = baseSpeed * dt;
          const ratio = Math.min(stepDist / distance, 1);

          const nextX = taraPos.x + dx * ratio;
          const nextY = taraPos.y + dy * ratio;

          if (Math.abs(dx) > Math.abs(dy)) {
            setTaraFacing(dx > 0 ? 'right' : 'left');
          } else {
            setTaraFacing(dy > 0 ? 'down' : 'up');
          }

          setTaraPos({ x: nextX, y: nextY });
          setIsWalking(true);
          setTaraWalkFrame((f) => (f + 1) % 4);

          if (now - lastStepSoundRef.current > (walkSpeed === 2 ? 140 : 250)) {
            sfx.step();
            lastStepSoundRef.current = now;
          }
        } else {
          // Reached destination!
          setTaraPos({ x: targetPos.x, y: targetPos.y });
          setIsWalking(false);

          const reachedDesk = targetPos.deskId;
          const arrivalLabel = targetPos.label || '';
          setTargetPos(null);

          if (reachedDesk && reachedDesk !== 'cooler' && reachedDesk !== 'manager') {
            const canonicalDesk = (reachedDesk === 'apps' ? 'calc' : reachedDesk === 'social' ? 'leads' : reachedDesk === 'calls' ? 'orders' : reachedDesk) as 'calc' | 'leads' | 'orders';
            setActiveDeskEffect(canonicalDesk);
            setTaraFacing('down'); // Face the worker sitting at desk
            sfx.alert();

            // PHASE 1: COMMANDING (TARA gives direct command to worker)
            setDialogueInteraction((prev) => {
              if (prev && prev.active) {
                return { ...prev, step: 'commanding' };
              }
              return prev;
            });

            const currentDeskInfo = desks[canonicalDesk];
            setTaraBubble({
              text: `तारा: "${currentDeskInfo.workerName}! तुरंत यह कार्य पूरा करो!"`,
              type: 'command',
            });

            // PHASE 2: EXECUTING (Worker executes task: typing, calculation, rate lookup)
            setTimeout(() => {
              setDialogueInteraction((prev) => {
                if (prev && prev.active) {
                  return { ...prev, step: 'executing' };
                }
                return prev;
              });

              // Set worker active state
              setDesks((prev) => ({
                ...prev,
                [canonicalDesk]: {
                  ...prev[canonicalDesk],
                  isWorking: true,
                },
              }));
            }, 1200);

            // PHASE 3: REPORTED (Worker finishes, reports back to TARA, TARA reports to Boss)
            setTimeout(() => {
              // Update desk completed count
              setDesks((prev) => ({
                ...prev,
                [canonicalDesk]: {
                  ...prev[canonicalDesk],
                  completedCount: prev[canonicalDesk].completedCount + 1,
                  isWorking: false,
                  recentLog: `टास्क संपन्न: "${arrivalLabel || 'कार्य पूर्ण'}".`,
                },
              }));

              sfx.complete();

              // Worker reports to TARA
              setDialogueInteraction((prev) => {
                if (prev && prev.active) {
                  return { ...prev, step: 'reported' };
                }
                return prev;
              });

              // TARA acknowledges and reports to Boss (faces downward towards the user)
              setTaraFacing('down');
              const deskWorkerName = desks[canonicalDesk]?.workerName || 'वर्कर';
              setTaraBubble({
                text: `तारा (मैनेजर): "बॉस! ${deskWorkerName} ने काम पूरा कर लिया है। रिपोर्ट तैयार है!"`,
                type: 'inspect',
              });

              if (onTriggerTaskAction) {
                onTriggerTaskAction(desks[canonicalDesk].name, arrivalLabel);
              }
            }, 3000);

            // Clear visual effect after 4s
            setTimeout(() => {
              setActiveDeskEffect(null);
            }, 4500);

            // Return TARA smoothly to manager station after task completes
            setTimeout(() => {
              if (!isPatrolling) {
                sendTaraTo(50, 22, 'manager', 'मैनेजर स्टेशन पर वापसी');
              }
            }, 5500);

            // If patrolling, continue
            if (isPatrolling) {
              setTimeout(() => {
                if (patrolQueueRef.current.length > 0) {
                  const nextDesk = patrolQueueRef.current.shift()!;
                  if (nextDesk !== 'manager' && nextDesk !== 'cooler') {
                    dispatchCommandToWorker(nextDesk as any, 'सुपरविज़न राउंड');
                  }
                } else {
                  setIsPatrolling(false);
                  setTaraBubble({ text: 'तारा: "सभी वर्कर डेस्क का निरीक्षण पूरा!"', type: 'happy' });
                  sendTaraTo(50, 22, 'manager', 'मैनेजर स्टेशन पर वापसी');
                }
              }, 4000);
            }
          } else if (reachedDesk === 'manager') {
            setTaraFacing('down');
            setTaraBubble({ text: 'तारा (मैनेजर): "मैं अपनी डेस्क पर हूँ। आदेश दीजिए बॉस!"', type: 'happy' });
          } else if (reachedDesk === 'cooler') {
            setTaraBubble({ text: 'तारा: "एक छोटा कॉफ़ी ब्रेक ☕"', type: 'inspect' });
          }
        }
      }

      animFrameRef.current = requestAnimationFrame(updateMovement);
    };

    animFrameRef.current = requestAnimationFrame(updateMovement);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [targetPos, taraPos, walkSpeed, isPatrolling, dispatchCommandToWorker, desks, onTriggerTaskAction, sendTaraTo]);

  // EXECUTE USER COMMAND VIA MANAGER TARA
  const handleExecuteCommand = (text: string) => {
    if (!text.trim()) return;
    const clean = text.trim();
    setInOfficeInput('');
    lastHandledMsgIdRef.current = `manual-${Date.now()}`;

    // Determine target worker desk based on natural language intent
    const lower = clean.toLowerCase();
    let targetDesk: 'calc' | 'leads' | 'orders' = 'calc';
    let mgrDirective = '';
    let wkrReply = '';
    let finalSummary = '';

    if (/lead|client|customer|phone|address|site|पता|ग्राहक|फोन|लोकेशन/i.test(lower)) {
      targetDesk = 'leads';
      mgrDirective = `माया! "${clean}" - ग्राहक संपर्क दर्ज करो और साइट विज़िट हेतु पूरा पता नोट करो!`;
      wkrReply = `जी मैम! ग्राहक विवरण और साइट लोकेशन का रिकॉर्ड हॉट लीड्स में दर्ज कर रही हूँ... 📝`;
      finalSummary = `बॉस, लीड डेस्क से माया ने ग्राहक विवरण व साइट नाप का रिकॉर्ड दर्ज कर लिया है। साइट विज़िट शेड्यूल करने के लिए तैयार है।`;
    } else if (/whatsapp|order|message|dispatch|send|alert|भेजो|व्हाट्सएप|ऑर्डर|संदेश/i.test(lower)) {
      targetDesk = 'orders';
      mgrDirective = `एलेक्स! "${clean}" - अधिकृत WhatsApp कोटेशन संदेश तैयार करो और wa.me लिंक जनरेट करो!`;
      wkrReply = `जी मैम! मोहन विश्वास फैब्रिकेशन का अधिकृत WhatsApp कोटेशन व wa.me लिंक तैयार कर रहा हूँ... 💬`;
      finalSummary = `बॉस, ऑर्डर डेस्क से एलेक्स ने WhatsApp कोटेशन तैयार कर दिया है। आप एक क्लिक में ग्राहक को भेज सकते हैं।`;
    } else {
      // Default to Calculation Desk (Quotes & Rates)
      targetDesk = 'calc';
      mgrDirective = `रोहन! "${clean}" - शेड्स (₹180-₹220), रेलिंग (₹450), गेट्स व ग्रिल्स का अधिकृत कोटेशन निकालो!`;
      wkrReply = `जी मैम! मोहन विश्वास फैब्रिकेशन की अधिकृत दरों के अनुसार सटीक हिसाब तैयार कर रहा हूँ... ⚡`;
      finalSummary = `बॉस, गणक रोहन ने दर गणना पूर्ण कर ली है। अधिकृत रेट्स (शेड ₹180-₹220/sq ft, रेलिंग ₹450/ft) के अनुसार कोटेशन रिपोर्ट तैयार है।`;
    }

    // Trigger TARA animation to that desk
    dispatchCommandToWorker(targetDesk, clean, mgrDirective, wkrReply, finalSummary);

    // Call parent handler to query Gemini / system stream
    if (onSendMessage) {
      onSendMessage(clean);
    }
  };

  const selectedDesk = selectedDeskId ? desks[selectedDeskId] : null;

  return (
    <div className={`w-full ${minimal ? 'max-w-[860px] mx-auto flex flex-col items-center gap-6 sm:gap-8' : 'rounded-xl bg-[#040814]/95 border border-cyan-500/40 overflow-hidden shadow-[0_0_25px_rgba(0,240,255,0.18)] backdrop-blur-md flex flex-col neon-hud-border relative'} ${className}`}>
      {/* Sci-Fi HUD Corner Brackets */}
      {!minimal && (
        <>
          <div className="absolute top-0 left-0 w-3.5 h-3.5 border-t-2 border-l-2 border-cyan-400 z-20 pointer-events-none shadow-[0_0_8px_#00f0ff]" />
          <div className="absolute top-0 right-0 w-3.5 h-3.5 border-t-2 border-r-2 border-cyan-400 z-20 pointer-events-none shadow-[0_0_8px_#00f0ff]" />
          <div className="absolute bottom-0 left-0 w-3.5 h-3.5 border-b-2 border-l-2 border-cyan-400 z-20 pointer-events-none shadow-[0_0_8px_#00f0ff]" />
          <div className="absolute bottom-0 right-0 w-3.5 h-3.5 border-b-2 border-r-2 border-cyan-400 z-20 pointer-events-none shadow-[0_0_8px_#00f0ff]" />
        </>
      )}
      {/* 1. TOP STATUS BAR: MANAGER TARA COMMAND CENTER (Hidden in minimal mode) */}
      {!minimal && (
        <div className="px-4 py-3 bg-[#060c18] border-b border-cyan-500/20 flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5">
            {/* Animated Manager Avatar Badge */}
            <div className="relative">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-[0_0_12px_rgba(0,240,255,0.4)] border border-cyan-300/40">
                👩‍💼
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-400 absolute -top-0.5 -right-0.5 animate-pulse" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-heading font-black text-xs sm:text-sm text-white tracking-wider">
                  2D पिक्सेल ऑफिस • TARA मैनेजर कमांड सेंटर
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-500/40 text-[9px] font-mono text-cyan-300 font-bold">
                  HQ SUPERVISOR
                </span>
              </div>
              <p className="text-[10px] text-slate-300 font-sans">
                तारा (बॉस/मैनेजर) स्वयं मेहनत नहीं करती — 3 वर्कर डेस्क को आदेश देती हैं
              </p>
            </div>
          </div>

          {/* CONTROLS & TOGGLES */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleTogglePatrol}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-mono flex items-center gap-1 transition-all ${
                isPatrolling
                  ? 'bg-amber-950/80 border border-amber-400 text-amber-200 animate-pulse'
                  : 'bg-slate-900 border border-slate-700 text-slate-300 hover:text-white'
              }`}
              title="TARA inspects all 3 desks"
            >
              <Compass className="w-3 h-3 text-amber-400" />
              <span>{isPatrolling ? 'पेट्रोलिंग चालू' : 'राउंड लगाएं'}</span>
            </button>

            <button
              type="button"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-1.5 rounded-lg border text-[10px] transition-all ${
                soundEnabled
                  ? 'bg-cyan-950 border-cyan-500/40 text-cyan-300'
                  : 'bg-slate-900 border-slate-800 text-slate-500'
              }`}
              title={soundEnabled ? '8-bit Retro Sounds ON' : 'Sound Muted'}
            >
              {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            </button>

            <button
              type="button"
              onClick={() => setShowConversationDock(!showConversationDock)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 text-[10px] font-mono font-bold"
            >
              <MessageSquare className="w-3 h-3" />
              <span>संवाद ({chatMessages.length})</span>
              {showConversationDock ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          </div>
        </div>
      )}

      {/* 2. THE 2D TOP-DOWN PIXEL ART OFFICE CANVAS */}
      <div className={minimal ? 'w-full' : 'p-3 sm:p-4 flex flex-col gap-3'}>
        <div className={`relative w-full aspect-[16/9] sm:aspect-[16/8.8] rounded-2xl overflow-hidden border border-cyan-500/35 bg-[#121927] select-none ${minimal ? 'shadow-[0_0_40px_rgba(0,240,255,0.18)]' : 'shadow-inner'}`}>
          {/* SVG Canvas with shapeRendering crispEdges */}
          <svg
            className="w-full h-full cursor-crosshair"
            viewBox="0 0 640 350"
            preserveAspectRatio="xMidYMid meet"
            onClick={handleFloorClick}
            style={{ shapeRendering: 'crispEdges' }}
          >
            <defs>
              {/* Checkered Floor Pattern */}
              <pattern id="officeTiles" width="20" height="20" patternUnits="userSpaceOnUse">
                <rect width="20" height="20" fill="#151e2e" />
                <rect width="10" height="10" fill="#121a28" />
                <rect x="10" y="10" width="10" height="10" fill="#121a28" />
                <line x1="0" y1="0" x2="20" y2="0" stroke="#1c273c" strokeWidth="1" />
                <line x1="0" y1="0" x2="0" y2="20" stroke="#1c273c" strokeWidth="1" />
              </pattern>

              {/* Central Hallway Carpet Pattern */}
              <pattern id="carpetPattern" width="16" height="16" patternUnits="userSpaceOnUse">
                <rect width="16" height="16" fill="#0c2d42" />
                <rect x="2" y="2" width="12" height="12" fill="#092435" />
                <line x1="0" y1="8" x2="16" y2="8" stroke="#133d59" strokeWidth="1" />
              </pattern>
            </defs>

            {/* A. WALL AT TOP */}
            <rect x="0" y="0" width="640" height="54" fill="#090d16" />
            <line x1="0" y1="54" x2="640" y2="54" stroke="#223046" strokeWidth="3" />
            <line x1="0" y1="51" x2="640" y2="51" stroke="#00f0ff" strokeWidth="1" strokeOpacity="0.3" />

            {/* Wall Clock */}
            <g transform="translate(320, 24)">
              <circle cx="0" cy="0" r="13" fill="#0e1726" stroke="#00f0ff" strokeWidth="1.5" />
              <circle cx="0" cy="0" r="1.5" fill="#ffffff" />
              <line x1="0" y1="0" x2="0" y2="-7" stroke="#ffffff" strokeWidth="1.5" />
              <line x1="0" y1="0" x2="5" y2="2" stroke="#00f0ff" strokeWidth="1.5" />
            </g>

            {/* Office Signage: Mohan Vishwas Fabrication */}
            <g transform="translate(180, 8)">
              <rect width="125" height="34" rx="2" fill="#0c1829" stroke="#38bdf8" strokeWidth="1.2" />
              <text x="8" y="14" fill="#38bdf8" fontSize="8" fontFamily="monospace" fontWeight="bold">
                🏭 मोहन विश्वास फैब्रिकेशन
              </text>
              <text x="8" y="24" fill="#94a3b8" fontSize="7" fontFamily="monospace">
                • 1. CALC (QUOTES)
              </text>
              <text x="8" y="31" fill="#ec4899" fontSize="7" fontFamily="monospace">
                • 2. LEADS
              </text>
              <text x="65" y="31" fill="#10b981" fontSize="7" fontFamily="monospace">
                • 3. ORDERS
              </text>
            </g>

            {/* Motivational Sign */}
            <g transform="translate(355, 8)">
              <rect width="130" height="34" rx="2" fill="#0c1829" stroke="#00f0ff" strokeWidth="1" strokeDasharray="3 2" />
              <text x="8" y="15" fill="#00f0ff" fontSize="8" fontFamily="monospace" fontWeight="bold">
                TARA MANAGER DIRECTIVE
              </text>
              <text x="8" y="27" fill="#38bdf8" fontSize="7" fontFamily="monospace">
                "मैनेजमेंट • ऑटोमेशन • विश्वास"
              </text>
            </g>

            {/* B. FLOOR & HALLWAY RUNNERS */}
            <rect x="0" y="54" width="640" height="296" fill="url(#officeTiles)" />

            {/* Vertical Hallway Runner Carpet */}
            <rect x="290" y="54" width="60" height="296" fill="url(#carpetPattern)" opacity="0.85" />
            <line x1="290" y1="54" x2="290" y2="350" stroke="#00f0ff" strokeWidth="1" strokeOpacity="0.2" />
            <line x1="350" y1="54" x2="350" y2="350" stroke="#00f0ff" strokeWidth="1" strokeOpacity="0.2" />

            {/* Horizontal Connecting Carpet */}
            <rect x="40" y="160" width="560" height="34" fill="url(#carpetPattern)" opacity="0.75" />
            <line x1="40" y1="160" x2="600" y2="160" stroke="#00f0ff" strokeWidth="1" strokeOpacity="0.15" />
            <line x1="40" y1="194" x2="600" y2="194" stroke="#00f0ff" strokeWidth="1" strokeOpacity="0.15" />

            {/* Office Plants & Server Props */}
            <g transform="translate(30, 20)">
              <rect x="6" y="22" width="16" height="12" fill="#854d0e" stroke="#543306" strokeWidth="1" />
              <circle cx="14" cy="14" r="11" fill="#15803d" />
              <circle cx="10" cy="8" r="7" fill="#22c55e" />
              <circle cx="18" cy="10" r="7" fill="#16a34a" />
            </g>

            {/* Water Cooler in Top Right Wall */}
            <g 
              transform="translate(540, 12)" 
              className="cursor-pointer hover:opacity-90"
              onClick={(e) => {
                e.stopPropagation();
                sendTaraTo(540, 60, 'cooler', 'कॉफ़ी ब्रेक');
              }}
            >
              <rect x="6" y="2" width="14" height="18" rx="3" fill="#38bdf8" fillOpacity="0.7" stroke="#0284c7" strokeWidth="1" />
              <circle cx="13" cy="10" r="2" fill="#e0f2fe" className="animate-bounce" />
              <rect x="3" y="20" width="20" height="26" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="1" />
              <rect x="7" y="26" width="4" height="4" fill="#ef4444" />
              <rect x="15" y="26" width="4" height="4" fill="#3b82f6" />
              <text x="3" y="54" fill="#38bdf8" fontSize="7" fontFamily="monospace">
                ☕ Break
              </text>
            </g>

            {/* C. TARA's MANAGER DESK (Top Center: x=280, y=72) */}
            <g 
              transform="translate(280, 72)"
              className="cursor-pointer group"
              onClick={(e) => {
                e.stopPropagation();
                sendTaraTo(320, 95, 'manager', 'मैनेजर स्टेशन पर वापसी');
                setSelectedDeskId('manager');
              }}
            >
              <ellipse cx="40" cy="36" rx="46" ry="12" fill="#000000" fillOpacity="0.4" />
              <rect x="0" y="4" width="80" height="28" rx="2" fill="#451a03" stroke="#78350f" strokeWidth="1.5" />
              <rect x="4" y="6" width="72" height="24" fill="#78350f" />
              
              {/* Gold Nameplate */}
              <rect x="16" y="20" width="48" height="7" fill="#fbbf24" stroke="#d97706" strokeWidth="1" />
              <text x="20" y="25" fill="#78350f" fontSize="5" fontFamily="monospace" fontWeight="bold">
                ★ TARA (MANAGER/BOSS) ★
              </text>

              {/* Executive Laptop & Coffee */}
              <rect x="12" y="10" width="16" height="9" fill="#0f172a" stroke="#38bdf8" strokeWidth="1" />
              <circle cx="66" cy="15" r="3" fill="#ffffff" />
              <circle cx="66" cy="15" r="1.8" fill="#78350f" />
              <text x="14" y="42" fill="#38bdf8" fontSize="8" fontFamily="monospace" fontWeight="bold">
                TARA HQ DESK
              </text>
            </g>

            {/* D. WORKER DESK 1: CALCULATION DESK (Rohan Calc) */}
            <g
              transform="translate(85, 195)"
              className="cursor-pointer group"
              onClick={(e) => {
                e.stopPropagation();
                dispatchCommandToWorker('calc', '1,000 sq ft शेड का कोटेशन');
                setSelectedDeskId('calc');
              }}
            >
              {selectedDeskId === 'calc' && (
                <rect x="-8" y="-12" width="120" height="110" rx="6" fill="none" stroke="#00f0ff" strokeWidth="2" strokeDasharray="4 2" />
              )}
              <ellipse cx="50" cy="56" rx="55" ry="16" fill="#000000" fillOpacity="0.45" />
              <rect x="-2" y="8" width="108" height="74" rx="4" fill="#082f49" fillOpacity="0.4" stroke="#0284c7" strokeWidth="1" strokeDasharray="2 2" />

              {/* Desk Surface */}
              <rect x="4" y="24" width="96" height="34" rx="2" fill="#3b2210" stroke="#713f12" strokeWidth="1.5" />
              <rect x="8" y="27" width="88" height="28" fill="#713f12" />

              {/* Monitor 1: Rates & Math Formula */}
              <rect x="14" y="28" width="28" height="17" fill="#090d16" stroke="#06b6d4" strokeWidth="1.2" />
              <text x="17" y="36" fill="#22c55e" fontSize="5" fontFamily="monospace">
                ₹180-₹220
              </text>
              <text x="17" y="42" fill="#38bdf8" fontSize="5" fontFamily="monospace">
                SS: ₹450
              </text>

              {/* Monitor 2: Blueprint Shed Truss */}
              <rect x="46" y="28" width="26" height="17" fill="#090d16" stroke="#06b6d4" strokeWidth="1.2" />
              <polygon points="50,42 59,32 68,42" fill="none" stroke="#38bdf8" strokeWidth="1" />
              <line x1="59" y1="32" x2="59" y2="42" stroke="#00f0ff" strokeWidth="0.8" />

              {/* Calculator on desk */}
              <rect x="76" y="32" width="10" height="15" rx="1.5" fill="#020617" stroke="#06b6d4" strokeWidth="1" />
              <circle cx="81" cy="43" r="1.2" fill="#22c55e" />

              {/* Worker ROHAN CALC (Sitting) */}
              <ellipse cx="52" cy="74" rx="12" ry="8" fill="#1e293b" stroke="#475569" strokeWidth="1" />
              <g transform="translate(42, 54)">
                <rect x="4" y="6" width="14" height="15" rx="3" fill="#0284c7" />
                <circle cx="11" cy="4" r="6" fill="#fbcfe8" />
                <path d="M 6 3 Q 11 -3 16 3" stroke="#78350f" strokeWidth="3" fill="none" />
                <rect x="7" y="3" width="8" height="2" fill="#0f172a" />
                <circle cx="5" cy="18" r="2" fill="#fbcfe8" className={desks.calc.isWorking ? 'animate-bounce' : ''} />
                <circle cx="17" cy="18" r="2" fill="#fbcfe8" className={desks.calc.isWorking ? 'animate-bounce' : ''} />
              </g>

              {/* Status Badge */}
              <g transform="translate(8, 2)">
                <rect width="88" height="16" rx="3" fill="#082f49" stroke="#00f0ff" strokeWidth="1" />
                <circle cx="10" cy="8" r="3" fill="#00f0ff" className="animate-pulse" />
                <text x="18" y="11" fill="#e0f2fe" fontSize="7.5" fontFamily="monospace" fontWeight="bold">
                  QUOTES: {desks.calc.completedCount} DONE
                </text>
              </g>

              {/* Sparkle effect */}
              {activeDeskEffect === 'calc' && (
                <g transform="translate(48, -4)">
                  <text x="0" y="0" fill="#facc15" fontSize="14" className="animate-bounce">
                    ✨
                  </text>
                </g>
              )}
            </g>

            {/* E. WORKER DESK 2: LEAD & SITE MEASUREMENT DESK (Maya Leads) */}
            <g
              transform="translate(270, 195)"
              className="cursor-pointer group"
              onClick={(e) => {
                e.stopPropagation();
                dispatchCommandToWorker('leads', 'ग्राहक संपर्क व साइट नाप');
                setSelectedDeskId('leads');
              }}
            >
              {selectedDeskId === 'leads' && (
                <rect x="-8" y="-12" width="120" height="110" rx="6" fill="none" stroke="#ec4899" strokeWidth="2" strokeDasharray="4 2" />
              )}
              <ellipse cx="50" cy="56" rx="55" ry="16" fill="#000000" fillOpacity="0.45" />
              <rect x="-2" y="8" width="108" height="74" rx="4" fill="#500724" fillOpacity="0.4" stroke="#db2777" strokeWidth="1" strokeDasharray="2 2" />

              {/* Desk Furniture */}
              <rect x="4" y="24" width="96" height="34" rx="2" fill="#3b2210" stroke="#713f12" strokeWidth="1.5" />
              <rect x="8" y="27" width="88" height="28" fill="#713f12" />

              {/* Screen: Map & Leads Pipeline */}
              <rect x="24" y="28" width="46" height="18" fill="#090d16" stroke="#ec4899" strokeWidth="1.2" />
              <circle cx="34" cy="37" r="3" fill="#f43f5e" />
              <text x="40" y="37" fill="#fbcfe8" fontSize="6" fontFamily="monospace">
                📍 SITE VISIT
              </text>
              <line x1="28" y1="42" x2="65" y2="42" stroke="#db2777" strokeWidth="1" strokeDasharray="2 1" />

              {/* Measuring tape / clipboard */}
              <rect x="76" y="32" width="12" height="15" rx="1.5" fill="#fef08a" stroke="#ca8a04" strokeWidth="1" />
              <line x1="78" y1="36" x2="86" y2="36" stroke="#000000" strokeWidth="0.8" />
              <line x1="78" y1="40" x2="84" y2="40" stroke="#000000" strokeWidth="0.8" />

              {/* Worker MAYA LEADS */}
              <ellipse cx="52" cy="74" rx="12" ry="8" fill="#1e293b" stroke="#db2777" strokeWidth="1" />
              <g transform="translate(42, 54)">
                <rect x="4" y="6" width="14" height="15" rx="3" fill="#be185d" />
                <circle cx="11" cy="4" r="6" fill="#fed7aa" />
                <path d="M 5 3 Q 11 -4 17 3" stroke="#1c1917" strokeWidth="3.5" fill="none" />
                <circle cx="8" cy="18" r="2" fill="#fed7aa" className={desks.leads.isWorking ? 'animate-bounce' : ''} />
                <circle cx="14" cy="18" r="2" fill="#fed7aa" className={desks.leads.isWorking ? 'animate-bounce' : ''} />
              </g>

              {/* Status Badge */}
              <g transform="translate(8, 2)">
                <rect width="88" height="16" rx="3" fill="#500724" stroke="#ec4899" strokeWidth="1" />
                <circle cx="10" cy="8" r="3" fill="#ec4899" className="animate-pulse" />
                <text x="18" y="11" fill="#fce7f3" fontSize="7.5" fontFamily="monospace" fontWeight="bold">
                  LEADS: {desks.leads.completedCount} SAVED
                </text>
              </g>

              {activeDeskEffect === 'leads' && (
                <g transform="translate(48, -4)">
                  <text x="0" y="0" fill="#ec4899" fontSize="14" className="animate-bounce">
                    📍
                  </text>
                </g>
              )}
            </g>

            {/* F. WORKER DESK 3: ORDER & WHATSAPP DESK (Alex Orders) */}
            <g
              transform="translate(460, 195)"
              className="cursor-pointer group"
              onClick={(e) => {
                e.stopPropagation();
                dispatchCommandToWorker('orders', 'WhatsApp कोटेशन प्रेषित');
                setSelectedDeskId('orders');
              }}
            >
              {selectedDeskId === 'orders' && (
                <rect x="-8" y="-12" width="120" height="110" rx="6" fill="none" stroke="#10b981" strokeWidth="2" strokeDasharray="4 2" />
              )}
              <ellipse cx="50" cy="56" rx="55" ry="16" fill="#000000" fillOpacity="0.45" />
              <rect x="-2" y="8" width="108" height="74" rx="4" fill="#064e3b" fillOpacity="0.4" stroke="#059669" strokeWidth="1" strokeDasharray="2 2" />

              {/* Desk Surface */}
              <rect x="4" y="24" width="96" height="34" rx="2" fill="#3b2210" stroke="#713f12" strokeWidth="1.5" />
              <rect x="8" y="27" width="88" height="28" fill="#713f12" />

              {/* Screen: WhatsApp UI */}
              <rect x="18" y="28" width="48" height="18" fill="#0b141a" stroke="#10b981" strokeWidth="1.2" />
              <rect x="22" y="31" width="22" height="6" rx="1" fill="#005c4b" />
              <rect x="36" y="38" width="26" height="6" rx="1" fill="#202c33" />
              <text x="24" y="35" fill="#25d366" fontSize="5" fontFamily="monospace">
                WA: QUOTE
              </text>

              {/* Phone Headset on Stand */}
              <g transform="translate(74, 22)">
                <path d="M 4 8 A 6 6 0 0 1 16 8" stroke="#10b981" strokeWidth="2" fill="none" />
                <rect x="2" y="7" width="4" height="6" rx="1" fill="#10b981" />
                <rect x="14" y="7" width="4" height="6" rx="1" fill="#10b981" />
              </g>

              {/* Worker ALEX ORDERS (Headset) */}
              <ellipse cx="52" cy="74" rx="12" ry="8" fill="#1e293b" stroke="#059669" strokeWidth="1" />
              <g transform="translate(42, 54)">
                <rect x="4" y="6" width="14" height="15" rx="3" fill="#047857" />
                <circle cx="11" cy="4" r="6" fill="#fed7aa" />
                <path d="M 5 3 Q 11 -4 17 3" stroke="#451a03" strokeWidth="3.5" fill="none" />
                <path d="M 4 4 A 7 7 0 0 1 18 4" stroke="#10b981" strokeWidth="1.8" fill="none" />
                <circle cx="7" cy="18" r="2" fill="#fed7aa" className={desks.orders.isWorking ? 'animate-bounce' : ''} />
                <circle cx="15" cy="18" r="2" fill="#fed7aa" className={desks.orders.isWorking ? 'animate-bounce' : ''} />
              </g>

              {/* Status Badge */}
              <g transform="translate(8, 2)">
                <rect width="88" height="16" rx="3" fill="#064e3b" stroke="#10b981" strokeWidth="1" />
                <circle cx="10" cy="8" r="3" fill="#10b981" className="animate-pulse" />
                <text x="18" y="11" fill="#d1fae5" fontSize="7.5" fontFamily="monospace" fontWeight="bold">
                  ORDERS: {desks.orders.completedCount} SENT
                </text>
              </g>

              {activeDeskEffect === 'orders' && (
                <g transform="translate(48, -4)">
                  <text x="0" y="0" fill="#10b981" fontSize="14" className="animate-bounce">
                    📱
                  </text>
                </g>
              )}
            </g>

            {/* G. INTERACTIVE TALK & COMMAND BUBBLES IN ROOM */}
            {dialogueInteraction && dialogueInteraction.active && (
              <g>
                {/* 1. Manager Command Speech Bubble (Above TARA) */}
                <g transform={`translate(${Math.max(15, Math.min(450, (taraPos.x / 100) * 640 - 85))}, ${Math.max(10, (taraPos.y / 100) * 350 - 46)})`}>
                  <rect width="175" height="32" rx="4" fill="#041527" stroke="#00f0ff" strokeWidth="1.5" />
                  <polygon points="82,32 87,38 92,32" fill="#041527" />
                  <text x="6" y="11" fill="#00f0ff" fontSize="7" fontFamily="monospace" fontWeight="bold">
                    👩‍💼 TARA (Manager/Boss):
                  </text>
                  <text x="6" y="23" fill="#e0f2fe" fontSize="7" fontFamily="sans-serif">
                    {dialogueInteraction.step === 'walking'
                      ? `"${dialogueInteraction.workerName} के डेस्क पर जा रही हूँ..."`
                      : dialogueInteraction.step === 'commanding'
                      ? `${dialogueInteraction.managerSpeech.slice(0, 36)}...`
                      : dialogueInteraction.step === 'executing'
                      ? 'निरीक्षण: काम जारी है... ⚡'
                      : `बॉस! ${dialogueInteraction.workerName} ने कार्य पूर्ण किया!`}
                  </text>
                </g>

                {/* 2. Worker Response Bubble (Above Target Desk) */}
                {dialogueInteraction.step !== 'walking' && (
                  <g
                    transform={`translate(${
                      dialogueInteraction.targetDesk === 'calc'
                        ? 70
                        : dialogueInteraction.targetDesk === 'leads'
                        ? 255
                        : 445
                    }, 145)`}
                  >
                    <rect
                      width="165"
                      height="32"
                      rx="4"
                      fill={
                        dialogueInteraction.targetDesk === 'calc'
                          ? '#042233'
                          : dialogueInteraction.targetDesk === 'leads'
                          ? '#350819'
                          : '#052b1b'
                      }
                      stroke={
                        dialogueInteraction.targetDesk === 'calc'
                          ? '#06b6d4'
                          : dialogueInteraction.targetDesk === 'leads'
                          ? '#ec4899'
                          : '#10b981'
                      }
                      strokeWidth="1.5"
                    />
                    <polygon
                      points="80,32 85,38 90,32"
                      fill={
                        dialogueInteraction.targetDesk === 'calc'
                          ? '#042233'
                          : dialogueInteraction.targetDesk === 'leads'
                          ? '#350819'
                          : '#052b1b'
                      }
                    />
                    <text
                      x="6"
                      y="11"
                      fill={
                        dialogueInteraction.targetDesk === 'calc'
                          ? '#38bdf8'
                          : dialogueInteraction.targetDesk === 'leads'
                          ? '#f472b6'
                          : '#34d399'
                      }
                      fontSize="7"
                      fontFamily="monospace"
                      fontWeight="bold"
                    >
                      👤 {dialogueInteraction.workerName}:
                    </text>
                    <text x="6" y="23" fill="#ffffff" fontSize="7" fontFamily="sans-serif">
                      {dialogueInteraction.step === 'commanding'
                        ? 'जी मैम! गणना शुरू कर रहा हूँ... ⚡'
                        : dialogueInteraction.step === 'executing'
                        ? '⏳ गणना / ड्राफ्ट जारी है... (Executing)'
                        : '✓ मैम, कार्य संपन्न! रिपोर्ट तैयार है।'}
                    </text>
                  </g>
                )}
              </g>
            )}

            {/* Click Destination Marker */}
            {clickMarker && (
              <g transform={`translate(${(clickMarker.x / 100) * 640}, ${(clickMarker.y / 100) * 350})`}>
                <circle cx="0" cy="0" r="8" fill="none" stroke="#00f0ff" strokeWidth="1.5" className="animate-ping" />
                <circle cx="0" cy="0" r="3" fill="#00f0ff" />
              </g>
            )}

            {/* H. ANIMATED MANAGER CHARACTER: TARA (Walking / Directing) */}
            <g transform={`translate(${(taraPos.x / 100) * 640}, ${(taraPos.y / 100) * 350})`}>
              {/* TARA Drop Shadow */}
              <ellipse cx="0" cy="14" rx="9" ry="4" fill="#000000" fillOpacity="0.5" />

              {/* TARA Body */}
              <g transform="translate(-10, -18)">
                {/* Legs with walking animation frame */}
                <rect
                  x={isWalking && taraWalkFrame % 2 === 0 ? "4" : "5"}
                  y="20"
                  width="3"
                  height="8"
                  fill="#0f172a"
                />
                <rect
                  x={isWalking && taraWalkFrame % 2 === 1 ? "13" : "12"}
                  y="20"
                  width="3"
                  height="8"
                  fill="#0f172a"
                />
                {/* Black Boots */}
                <rect x={isWalking && taraWalkFrame % 2 === 0 ? "3" : "4"} y="27" width="4" height="3" fill="#020617" />
                <rect x={isWalking && taraWalkFrame % 2 === 1 ? "12" : "11"} y="27" width="4" height="3" fill="#020617" />

                {/* Manager Suit Jacket (Cyan & Dark Blue) */}
                <rect x="3" y="10" width="14" height="12" rx="2" fill="#0284c7" stroke="#0369a1" strokeWidth="0.8" />
                <polygon points="10,10 7,16 13,16" fill="#f8fafc" />

                {/* Manager Clipboard */}
                <rect x={taraFacing === 'left' ? "0" : "14"} y="12" width="6" height="8" rx="1" fill="#78350f" stroke="#fbbf24" strokeWidth="0.8" />
                <rect x={taraFacing === 'left' ? "1" : "15"} y="13" width="4" height="6" fill="#f8fafc" />

                {/* Arms */}
                <rect x="1" y="11" width="3" height="8" fill="#0284c7" />
                <rect x="16" y="11" width="3" height="8" fill="#0284c7" />
                <circle cx="2" cy="19" r="1.5" fill="#fbcfe8" />
                <circle cx="17" cy="19" r="1.5" fill="#fbcfe8" />

                {/* Head */}
                <circle cx="10" cy="5" r="5.5" fill="#fbcfe8" />

                {/* Hair (Professional Pixie with Cyan Ribbon) */}
                <path d="M 4 4 Q 10 -4 16 4" stroke="#1e1b4b" strokeWidth="3.5" fill="none" />
                <rect x="5" y="0" width="10" height="2" fill="#06b6d4" />

                {/* Eyes based on facing */}
                {taraFacing === 'down' && (
                  <>
                    <circle cx="8" cy="5" r="1" fill="#0f172a" />
                    <circle cx="12" cy="5" r="1" fill="#0f172a" />
                  </>
                )}
                {taraFacing === 'left' && <circle cx="7" cy="5" r="1" fill="#0f172a" />}
                {taraFacing === 'right' && <circle cx="13" cy="5" r="1" fill="#0f172a" />}
              </g>

              {/* Speech / Alert Bubble above TARA */}
              {taraBubble && !dialogueInteraction?.active && (
                <g transform="translate(-50, -32)">
                  <rect width="100" height="15" rx="3" fill="#0c1829" stroke="#00f0ff" strokeWidth="1" />
                  <polygon points="46,15 50,18 54,15" fill="#0c1829" />
                  <text x="5" y="10" fill="#e0f2fe" fontSize="6.5" fontFamily="sans-serif">
                    {taraBubble.text.slice(0, 24)}...
                  </text>
                </g>
              )}
            </g>
          </svg>
        </div>

        {/* IN MINIMAL MODE: SINGLE CIRCULAR (GOL) MIC / TALK ON-OFF BUTTON */}
        {minimal && (
          <div className="flex flex-col items-center justify-center pt-3 pb-2 select-none">
            <button
              type="button"
              onClick={onToggleVoice}
              className={`relative w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer shadow-2xl active:scale-95 ${
                isListening
                  ? 'bg-gradient-to-tr from-rose-600 to-red-500 shadow-[0_0_40px_rgba(244,63,94,0.7)] scale-105 border-4 border-rose-300'
                  : 'bg-gradient-to-tr from-cyan-600 via-sky-600 to-blue-700 hover:scale-105 border-4 border-cyan-400 shadow-[0_0_35px_rgba(0,240,255,0.5)]'
              }`}
              title={isListening ? 'माइक चालू है (Listening...) - बंद करने के लिए क्लिक करें' : 'बातचीत शुरू करने के लिए क्लिक करें (Click to Talk)'}
            >
              {isListening && (
                <>
                  <div className="absolute inset-0 rounded-full border-2 border-rose-400 animate-ping opacity-60 pointer-events-none" />
                  <div className="absolute -inset-3 rounded-full border border-rose-400/40 animate-pulse pointer-events-none" />
                </>
              )}
              {isListening ? (
                <Mic className="w-10 h-10 sm:w-12 sm:h-12 text-white animate-pulse" />
              ) : (
                <Mic className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
              )}
            </button>
          </div>
        )}

        {/* 2B. INTERACTIVE MANAGER-WORKER LIVE ACTION BANNER (non-minimal only) */}
        {!minimal && dialogueInteraction && dialogueInteraction.active && (
          <div className="p-3 rounded-xl bg-gradient-to-r from-[#06182c] via-[#08223d] to-[#041a2e] border border-cyan-400/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shadow-[0_0_15px_rgba(0,240,255,0.15)] animate-in fade-in slide-in-from-top-2">
            <div className="flex items-start sm:items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-400 flex items-center justify-center text-base shrink-0 shadow-sm">
                {dialogueInteraction.step === 'walking' && '🚶‍♀️'}
                {dialogueInteraction.step === 'commanding' && '🗣️'}
                {dialogueInteraction.step === 'executing' && '⚡'}
                {dialogueInteraction.step === 'reported' && '📋'}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-300">
                    {dialogueInteraction.step === 'walking' && 'चरण 1: तारा वर्कर डेस्क पर जा रही हैं'}
                    {dialogueInteraction.step === 'commanding' && `चरण 2: तारा दे रही हैं आदेश -> ${dialogueInteraction.workerName}`}
                    {dialogueInteraction.step === 'executing' && `चरण 3: ${dialogueInteraction.workerName} हिसाब / कार्य कर रहे हैं`}
                    {dialogueInteraction.step === 'reported' && 'चरण 4: तारा द्वारा बॉस को अंतिम रिपोर्ट प्रस्तुत'}
                  </span>
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                </div>
                <p className="text-xs text-white font-sans mt-0.5 leading-snug">
                  {dialogueInteraction.step === 'walking' && (
                    <span>
                      <strong className="text-cyan-300">तारा (मैनेजर):</strong> "{dialogueInteraction.workerName} के डेस्क पर कार्य लेकर जा रही हूँ..."
                    </span>
                  )}
                  {dialogueInteraction.step === 'commanding' && (
                    <span>
                      <strong className="text-cyan-300">तारा:</strong> "{dialogueInteraction.managerSpeech}"
                    </span>
                  )}
                  {dialogueInteraction.step === 'executing' && (
                    <span>
                      <strong className="text-emerald-300">{dialogueInteraction.workerName}:</strong> "{dialogueInteraction.workerSpeech}"
                    </span>
                  )}
                  {dialogueInteraction.step === 'reported' && (
                    <span>
                      <strong className="text-emerald-300">तारा रिपोर्ट:</strong> {dialogueInteraction.finalReportText}
                    </span>
                  )}
                </p>
              </div>
            </div>

            {dialogueInteraction.step === 'reported' && (
              <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                {dialogueInteraction.targetDesk === 'calc' && onOpenRates && (
                  <button
                    type="button"
                    onClick={onOpenRates}
                    className="px-3 py-1 rounded-lg bg-cyan-900/90 hover:bg-cyan-800 border border-cyan-400 text-cyan-200 text-xs font-mono font-bold cursor-pointer transition-colors"
                  >
                    दर तालिका देखें →
                  </button>
                )}
                {dialogueInteraction.targetDesk === 'leads' && onOpenLeads && (
                  <button
                    type="button"
                    onClick={onOpenLeads}
                    className="px-3 py-1 rounded-lg bg-pink-900/90 hover:bg-pink-800 border border-pink-400 text-pink-200 text-xs font-mono font-bold cursor-pointer transition-colors"
                  >
                    हॉट लीड्स देखें →
                  </button>
                )}
                {dialogueInteraction.targetDesk === 'orders' && (
                  <button
                    type="button"
                    onClick={() => {
                      const text = encodeURIComponent(`नमस्ते! मोहन विश्वास फैब्रिकेशन से आपका कोटेशन तैयार है।`);
                      window.open(`https://wa.me/?text=${text}`, '_blank');
                    }}
                    className="px-3 py-1 rounded-lg bg-emerald-900/90 hover:bg-emerald-800 border border-emerald-400 text-emerald-200 text-xs font-mono font-bold cursor-pointer transition-colors"
                  >
                    WhatsApp खोलें →
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* 3. 1-CLICK QUICK COMMAND BUTTONS FOR THE BOSS (non-minimal only) */}
        {!minimal && (
          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
          <span className="text-[11px] font-mono text-cyan-400 font-bold uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>बॉस के तुरंत आदेश (1-Click Directives):</span>
          </span>
          <button
            type="button"
            onClick={() => handleExecuteCommand('1,000 sq ft शेड का कोटेशन निकालो')}
            className="px-2.5 py-1 rounded-lg bg-cyan-950/70 hover:bg-cyan-900 border border-cyan-500/30 text-[11px] font-mono text-cyan-300 transition-all cursor-pointer flex items-center gap-1"
          >
            🏭 1,000 sq ft शेड (Calculation)
          </button>
          <button
            type="button"
            onClick={() => handleExecuteCommand('60 running ft SS रेलिंग का रेट बताओ')}
            className="px-2.5 py-1 rounded-lg bg-cyan-950/70 hover:bg-cyan-900 border border-cyan-500/30 text-[11px] font-mono text-cyan-300 transition-all cursor-pointer flex items-center gap-1"
          >
            ✨ 60 ft SS रेलिंग (₹450)
          </button>
          <button
            type="button"
            onClick={() => handleExecuteCommand('नया ग्राहक राजेश शर्मा व साइट लोकेशन दर्ज करो')}
            className="px-2.5 py-1 rounded-lg bg-pink-950/70 hover:bg-pink-900 border border-pink-500/30 text-[11px] font-mono text-pink-300 transition-all cursor-pointer flex items-center gap-1"
          >
            📍 ग्राहक व साइट लोकेशन (Leads)
          </button>
          <button
            type="button"
            onClick={() => handleExecuteCommand('ग्राहक को WhatsApp कोटेशन ड्राफ्ट करो')}
            className="px-2.5 py-1 rounded-lg bg-emerald-950/70 hover:bg-emerald-900 border border-emerald-500/30 text-[11px] font-mono text-emerald-300 transition-all cursor-pointer flex items-center gap-1"
          >
            📱 WhatsApp कोटेशन (Orders)
          </button>
        </div>
        )}

        {/* 4. INTEGRATED IN-OFFICE CONVERSATION DOCK (non-minimal only) */}
        {!minimal && showConversationDock && (
          <div className="rounded-xl bg-[#070e1b] border border-cyan-500/25 p-3 flex flex-col gap-2.5 shadow-xl animate-in fade-in">
            {/* Dock Header */}
            <div className="flex items-center justify-between border-b border-cyan-500/15 pb-1.5 px-0.5">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-heading font-bold text-xs text-white">
                  ऑफिस लाइव संवाद (TARA Directives & Live Chat)
                </span>
              </div>
              <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
                <span>एक्टिव इंजन: Gemini Flash</span>
              </div>
            </div>

            {/* Messages Scroll Area */}
            <div
              ref={chatScrollRef}
              className="min-h-[160px] max-h-[240px] overflow-y-auto flex flex-col gap-2.5 pr-1 custom-scrollbar text-xs"
            >
              {chatMessages.length === 0 ? (
                <div className="m-auto text-center p-4 text-slate-400 font-sans text-xs">
                  कोई संदेश नहीं है। नीचे इनपुट बार में आदेश टाइप करें (उदा. "1,000 sq ft शेड का कोटेशन निकालो")।
                </div>
              ) : (
                chatMessages.slice(-6).map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[90%] sm:max-w-[85%] rounded-xl p-2.5 leading-relaxed text-xs ${
                        msg.sender === 'user'
                          ? 'bg-cyan-950/90 text-cyan-100 border border-cyan-500/40 rounded-tr-xs'
                          : 'bg-[#0b1626] text-slate-200 border border-cyan-500/20 rounded-tl-xs'
                      }`}
                    >
                      {msg.sender === 'assistant' && (
                        <div className="flex items-center justify-between gap-1 pb-1 mb-1 border-b border-cyan-500/10 text-[10px] font-mono text-cyan-300 font-bold">
                          <span>👩‍💼 TARA (मैनेजर रिपोर्ट):</span>
                          <button
                            onClick={() => speechEngine.speak(msg.text)}
                            className="text-cyan-400 hover:text-white flex items-center gap-0.5"
                          >
                            <Volume2 className="w-2.5 h-2.5" />
                            <span>सुनें</span>
                          </button>
                        </div>
                      )}
                      <div className="whitespace-pre-wrap font-sans">
                        <ReactMarkdown>{msg.text}</ReactMarkdown>
                      </div>
                    </div>
                  </div>
                ))
              )}

              {/* Real-time TARA Interaction Report Notice */}
              {dialogueInteraction && dialogueInteraction.step === 'reported' && (
                <div className="p-3 rounded-xl bg-gradient-to-r from-emerald-950/90 via-[#07241c] to-cyan-950/80 border border-emerald-400/60 flex flex-col gap-2 text-xs text-emerald-100 shadow-[0_0_15px_rgba(16,185,129,0.15)] animate-in fade-in">
                  <div className="flex items-center justify-between border-b border-emerald-500/20 pb-1.5">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span className="font-heading font-bold text-xs text-white">
                        👩‍💼 तारा (मैनेजर रिपोर्ट) • {dialogueInteraction.workerName} द्वारा संपन्न
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => speechEngine.speak(dialogueInteraction.finalReportText)}
                        className="px-2 py-0.5 rounded bg-emerald-900/60 hover:bg-emerald-800 text-[10px] font-mono text-emerald-300 flex items-center gap-1 cursor-pointer"
                        title="रिपोर्ट सुनें"
                      >
                        <Volume2 className="w-2.5 h-2.5" />
                        <span>सुनें</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(dialogueInteraction.finalReportText);
                          setCopiedQuote(true);
                          setTimeout(() => setCopiedQuote(false), 2000);
                        }}
                        className="px-2 py-0.5 rounded bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/30 text-[10px] font-mono text-cyan-300 flex items-center gap-1 cursor-pointer"
                        title="रिपोर्ट कॉपी करें"
                      >
                        {copiedQuote ? <Check className="w-2.5 h-2.5 text-emerald-400" /> : <Copy className="w-2.5 h-2.5" />}
                        <span>{copiedQuote ? 'कॉपी हुआ' : 'कॉपी'}</span>
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-emerald-100/90 font-sans leading-relaxed">
                    {dialogueInteraction.finalReportText}
                  </p>
                  <div className="flex items-center justify-between pt-1 border-t border-emerald-500/15 text-[10px] font-mono text-slate-400">
                    <span>कार्य: "{dialogueInteraction.commandDescription}"</span>
                    <span className="text-emerald-400 font-bold">स्थिति: प्रमाणित ✓</span>
                  </div>
                </div>
              )}
            </div>

            {/* In-Office Command Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleExecuteCommand(inOfficeInput);
              }}
              className="flex items-center gap-2 pt-1 border-t border-cyan-500/15"
            >
              <div className="relative flex-1">
                <input
                  type="text"
                  value={inOfficeInput}
                  onChange={(e) => setInOfficeInput(e.target.value)}
                  placeholder="तारा को आदेश दें (उदा. 1500 sq ft शेड का कोटेशन, नया लीड, या WhatsApp मैसेज)..."
                  className="w-full bg-[#050b14] border border-cyan-500/30 rounded-xl pl-3.5 pr-10 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-sans"
                />
                {onToggleVoice && (
                  <button
                    type="button"
                    onClick={onToggleVoice}
                    className={`absolute right-2 top-2 p-1 rounded-lg transition-all ${
                      isListening ? 'bg-rose-600 text-white animate-pulse' : 'text-slate-400 hover:text-cyan-300'
                    }`}
                    title="Voice command (Hindi speech)"
                  >
                    {isListening ? <Mic className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5" />}
                  </button>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoadingChat || !inOfficeInput.trim()}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-40 text-white text-xs font-mono font-bold transition-all shadow-[0_0_12px_rgba(0,240,255,0.25)] flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <span>भेजें</span>
                <Send className="w-3 h-3" />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
