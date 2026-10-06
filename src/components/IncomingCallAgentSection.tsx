/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Phone,
  PhoneIncoming,
  PhoneCall,
  PhoneOff,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  User,
  Sparkles,
  CheckCircle2,
  Volume2,
  VolumeX,
  Send,
  MessageSquare,
  Clock,
  MapPin,
  Flame,
  ArrowRight,
  RotateCcw,
  Check,
  Copy,
  ExternalLink,
  ChevronDown,
  Building2,
  Bell,
  Trash2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { 
  BossCallAlert, 
  CallCategory, 
  IncomingCallSession, 
  FabricationRatesConfig 
} from '../types';
import { 
  CALL_PRESETS, 
  CallSimulationPreset, 
  checkIsSpam, 
  loadBossAlerts, 
  saveBossAlerts 
} from '../data/callAgentData';
import { loadFabricationConfig } from '../data/fabricationData';
import { speechEngine } from '../utils/speech';
import { audioSynth } from '../utils/audio';

interface IncomingCallAgentSectionProps {
  onTriggerTaraChat?: (message: string) => void;
  onOpenLeadsTab?: () => void;
  className?: string;
}

export const IncomingCallAgentSection: React.FC<IncomingCallAgentSectionProps> = ({
  onTriggerTaraChat,
  onOpenLeadsTab,
  className = '',
}) => {
  const [config] = useState<FabricationRatesConfig>(loadFabricationConfig);
  const [bossAlerts, setBossAlerts] = useState<BossCallAlert[]>(loadBossAlerts);
  const [activeSubTab, setActiveSubTab] = useState<'simulator' | 'boss_inbox' | 'spam_log'>('simulator');
  
  // Call Simulation State
  const [currentPreset, setCurrentPreset] = useState<CallSimulationPreset>(CALL_PRESETS[0]);
  const [callStatus, setCallStatus] = useState<'idle' | 'ringing' | 'connected' | 'spam_blocked' | 'alert_sent'>('idle');
  const [callDuration, setCallDuration] = useState<number>(0);
  const [isAudioSpeechActive, setIsAudioSpeechActive] = useState<boolean>(true);
  
  // Interactive Dialogue Conversation
  const [dialogue, setDialogue] = useState<{ sender: 'tara' | 'customer' | 'system'; text: string; time: string }[]>([]);
  const [customerCustomInput, setCustomerCustomInput] = useState<string>('');
  const [activeStep, setActiveStep] = useState<number>(0); // 0: greeting, 1: ask service, 2: details, 3: finalize
  const [selectedService, setSelectedService] = useState<CallCategory>('shed');
  const [spamNotice, setSpamNotice] = useState<string | null>(null);
  const [latestAlertDispatched, setLatestAlertDispatched] = useState<BossCallAlert | null>(null);
  const [copiedText, setCopiedText] = useState<boolean>(false);
  
  // Spam Filtered Calls Log
  const [spamHistory, setSpamHistory] = useState<{ id: string; name: string; number: string; reason: string; time: string }[]>([
    {
      id: 'spam-1',
      name: 'फाइनेंस लोन टेलीमार्केटर',
      number: '+91 80012 34567',
      reason: 'पहचाना गया: पर्सनल लोन टेलीमार्केटिंग स्पैम कॉल',
      time: '25 मिनट पहले',
    },
    {
      id: 'spam-2',
      name: 'क्रेडिट कार्ड सेल्स कॉल',
      number: '+91 79900 11223',
      reason: 'पहचाना गया: फर्जी क्रेडिट कार्ड / अनचाहा प्रचार',
      time: '1 घंटे पहले',
    },
  ]);

  const dialogueEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll conversation
  useEffect(() => {
    if (dialogueEndRef.current) {
      dialogueEndRef.current.scrollTop = dialogueEndRef.current.scrollHeight;
    }
  }, [dialogue]);

  // Call duration counter
  useEffect(() => {
    let interval: any = null;
    if (callStatus === 'connected') {
      interval = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      setCallDuration(0);
    }
    return () => clearInterval(interval);
  }, [callStatus]);

  // Helper to speak Hindi speech if enabled
  const speakTaraPhrase = (text: string) => {
    if (isAudioSpeechActive) {
      speechEngine.speakHindi(text);
    }
  };

  // 1. START SIMULATED INCOMING CALL
  const handleStartIncomingCall = (preset?: CallSimulationPreset) => {
    const selected = preset || currentPreset;
    setCurrentPreset(selected);
    setSelectedService(selected.category);
    setCallStatus('ringing');
    setActiveStep(0);
    setSpamNotice(null);
    setLatestAlertDispatched(null);
    setDialogue([]);

    audioSynth.playIncomingRingtone?.();
  };

  // 2. ANSWER CALL (TARA GREETS IN HINDI)
  const handleAnswerCall = () => {
    setCallStatus('connected');
    audioSynth.playClick();

    const greetingText = `नमस्ते! मोहन विश्वास फैब्रिकेशन में आपका हार्दिक स्वागत है। मैं आपकी वर्चुअल रिसेप्शनिस्ट तारा बोल रही हूँ। क्या आप शेड्स (Sheds), स्टील रेलिंग (SS Railing), मेन गेट्स (Designer Gates) या विंडो सेफ्टी ग्रिल के संबंध में जानकारी या कोटेशन चाहते हैं?`;

    setDialogue([
      {
        sender: 'system',
        text: `📞 कॉल कनेक्टेड: ${currentPreset.name} (${currentPreset.number}) • तारा कॉल एजेंट सक्रिय`,
        time: 'अभी',
      },
      {
        sender: 'tara',
        text: greetingText,
        time: 'अभी',
      },
    ]);

    setActiveStep(1);
    speakTaraPhrase(greetingText);
  };

  // 3. REJECT CALL
  const handleRejectCall = () => {
    setCallStatus('idle');
    audioSynth.playClick();
    speechEngine.stopSpeaking();
  };

  // 4. CUSTOMER CHOOSES CATEGORY / RESPONDS
  const handleCustomerResponse = (category: CallCategory, text: string, isSpam: boolean = false, spamReason?: string) => {
    setSelectedService(category);

    const newDialogue = [
      ...dialogue,
      {
        sender: 'customer' as const,
        text,
        time: 'अभी',
      },
    ];

    // CHECK SPAM
    const spamCheck = checkIsSpam(text) || { isSpam, reason: spamReason };
    if (isSpam || spamCheck.isSpam) {
      const reason = spamCheck.reason || spamReason || 'अवांछित टेलीमार्केटिंग या लोन ऑफर';
      setCallStatus('spam_blocked');
      setSpamNotice(reason);

      const refusalText = `माफ कीजिए, यह मोहन विश्वास फैब्रिकेशन की अधिकृत कस्टमर हेल्पलाइन है। हमें इस सेवा या लोन की आवश्यकता नहीं है। धन्यवाद।`;
      
      setDialogue([
        ...newDialogue,
        {
          sender: 'tara',
          text: refusalText,
          time: 'अभी',
        },
        {
          sender: 'system',
          text: `🚫 स्पैम कॉल ब्लॉक कर दी गई: ${reason} (बॉस को परेशान नहीं किया गया)`,
          time: 'अभी',
        },
      ]);

      setSpamHistory((prev) => [
        {
          id: `spam-${Date.now()}`,
          name: currentPreset.name,
          number: currentPreset.number,
          reason,
          time: 'अभी-अभी',
        },
        ...prev,
      ]);

      speakTaraPhrase(refusalText);
      return;
    }

    // AUTHENTIC INQUIRY: TARA RESPONDS WITH AUTHORITATIVE RATES & ASKS DETAILS
    let taraReply = '';
    if (category === 'shed') {
      taraReply = `जी बिल्कुल, मोहन विश्वास फैब्रिकेशन में उच्च गुणवत्ता वाले शेड्स निर्माण का अधिकृत रेट ₹180 से ₹220 प्रति वर्ग फुट (sq ft) है, जिसमें टाटा/जिंदल कलर कोटेड शीट और हेवी ट्रस स्ट्रक्चर शामिल है। क्या आप बता सकते हैं कि आपको लगभग कितना एरिया (sq ft) बनवाना है और काम कब तक शुरू कराना है?`;
    } else if (category === 'railing') {
      taraReply = `जी हाँ, हमारी एसएस-304 फूड-ग्रेड स्टेनलेस स्टील रेलिंग का अधिकृत रेट ₹450 प्रति रनिंग फुट (running ft) है, जिसमें लाइफटाइम रस्ट-फ्री गारंटी और डिज़ाइनर मास्टर पिलर शामिल हैं। कृपया बताएं आपको कितने रनिंग फुट रेलिंग की आवश्यकता है?`;
    } else if (category === 'gate') {
      taraReply = `ज़रूर! हमारे आधुनिक सीएनसी लेजर कट और हैवी एमएस स्लाइडिंग गेट्स का रेट ₹280 से ₹380 प्रति वर्ग फुट है। क्या आपके पास गेट का सटीक साइज (जैसे 10x8 ft) और साइट का पता उपलब्ध है?`;
    } else if (category === 'grill') {
      taraReply = `जी हाँ, विंडो व बालकनी सेफ्टी ग्रिल्स का रेट ₹130 से ₹180 प्रति वर्ग फुट है। मजबूत 10mm/12mm सॉलिड स्क्वायर बार और प्राइमर कोटिंग शामिल है। आपकी साइट कहाँ पर है?`;
    } else {
      taraReply = `जी धन्यवाद! कृपया अपने कार्य की मात्रा और साइट का पता बताइए, ताकि हम तुरंत सटीक कोटेशन तैयार कर सकें।`;
    }

    setDialogue([
      ...newDialogue,
      {
        sender: 'tara',
        text: taraReply,
        time: 'अभी',
      },
    ]);

    setActiveStep(2);
    speakTaraPhrase(taraReply);
  };

  // 5. FINALIZE & DISPATCH URGENT ALERT TO THE BOSS
  const handleFinalizeAndSendBossAlert = (urgencyLevel: 'urgent' | 'high' | 'normal' = 'urgent') => {
    audioSynth.playSuccess?.();

    const serviceNameMap: Record<CallCategory, string> = {
      shed: 'Shed (शेड्स निर्माण)',
      railing: 'Railing (SS-304 स्टील रेलिंग)',
      gate: 'Gate (मुख्य द्वार व गेट)',
      grill: 'Grill (सेफ्टी ग्रिल्स)',
      custom: 'Custom Fabrication',
      spam: 'Spam',
      general: 'General Fabrication',
    };

    const serviceName = serviceNameMap[selectedService] || 'Fabrication Work';
    const location = currentPreset.location || 'मेन इंडस्ट्रियल एरिया';
    const estimated = currentPreset.estimatedBudget || '₹1,50,000+';

    const bossSummary = `ग्राहक ${currentPreset.name} (${currentPreset.number}) ने ${serviceName} के लिए सीधे कॉल किया है।\n• काम: ${currentPreset.requirementDetails}\n• अनुमानित बजट: ${estimated}\n• लोकेशन: ${location}\n• तात्कालिकता: ${urgencyLevel === 'urgent' ? 'अत्यंत आवश्यक (अगले 1-3 दिन में काम शुरू)' : 'उच्च प्राथमिकता'}`;

    const newAlert: BossCallAlert = {
      id: `alert-${Date.now()}`,
      callId: `call-${Date.now()}`,
      callerName: currentPreset.name,
      callerNumber: currentPreset.number,
      serviceCategory: serviceName,
      urgency: urgencyLevel,
      summary: bossSummary,
      customerDemand: currentPreset.requirementDetails,
      siteLocation: location,
      timestamp: new Date().toISOString(),
      estimatedBudget: estimated,
      status: 'pending',
    };

    const updatedAlerts = [newAlert, ...bossAlerts];
    setBossAlerts(updatedAlerts);
    saveBossAlerts(updatedAlerts);
    setLatestAlertDispatched(newAlert);
    setCallStatus('alert_sent');

    const taraFinalStatement = `धन्यवाद श्री ${currentPreset.name} जी! मैंने आपके कार्य की सम्पूर्ण जानकारी नोट कर ली है। आपकी तात्कालिक आवश्यकता को देखते हुए मैंने सीधे हमारे मुख्य ओनर (बॉस) श्री बृजमोहन कुमार जी को अर्जेंट कॉल समरी अलर्ट प्रेषित कर दिया है। वे शीघ्र ही आपसे सीधे संपर्क करेंगे।`;

    setDialogue((prev) => [
      ...prev,
      {
        sender: 'tara',
        text: taraFinalStatement,
        time: 'अभी',
      },
      {
        sender: 'system',
        text: `🚨 अर्जेंट कॉल समरी अलर्ट सफलतापूर्वक बॉस (मिस्टर बृजमोहन कुमार) को भेज दिया गया!`,
        time: 'अभी',
      },
    ]);

    speakTaraPhrase(taraFinalStatement);

    try {
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.7 },
        colors: ['#00f0ff', '#f59e0b', '#10b981'],
      });
    } catch {}
  };

  // Copy Alert Summary
  const handleCopyAlert = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2500);
  };

  // Status changer for Boss Alerts
  const handleUpdateAlertStatus = (alertId: string, status: 'pending' | 'reviewed' | 'called_back' | 'dismissed') => {
    const updated = bossAlerts.map((a) => (a.id === alertId ? { ...a, status } : a));
    setBossAlerts(updated);
    saveBossAlerts(updated);
  };

  // Delete Alert
  const handleDeleteAlert = (alertId: string) => {
    const updated = bossAlerts.filter((a) => a.id !== alertId);
    setBossAlerts(updated);
    saveBossAlerts(updated);
  };

  // Pending count for badge
  const pendingAlertsCount = useMemo(() => {
    return bossAlerts.filter((a) => a.status === 'pending').length;
  }, [bossAlerts]);

  return (
    <div className={`w-full flex flex-col gap-4 ${className}`}>
      {/* HEADER BANNER */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#08182b] via-[#0d2238] to-[#071320] border border-cyan-500/30 p-4 sm:p-5 shadow-[0_0_25px_rgba(0,240,255,0.08)]">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-[0_0_20px_rgba(0,240,255,0.35)] border border-cyan-300/40">
              <PhoneIncoming className="w-6 h-6 text-white animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-heading font-black text-lg sm:text-xl text-white tracking-wide">
                  तारा इनकमिंग कॉल एजेंट (Voice Receptionist)
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-500/50 text-[10px] font-mono text-cyan-300 font-bold flex items-center gap-1 shadow-[0_0_8px_rgba(0,240,255,0.2)]">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                  AI TELECOM
                </span>
              </div>
              <p className="text-xs text-slate-300 font-sans mt-0.5">
                हिंदी में कस्टमर ग्रीटिंग • गेट/शेड/रेलिंग वर्गीकरण • स्पैम फिल्टरिंग • <span className="text-amber-400 font-bold">बॉस को डायरेक्ट अर्जेंट अलर्ट</span>
              </p>
            </div>
          </div>

          {/* Quick Boss Alerts Badge Button */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={() => setActiveSubTab('boss_inbox')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border text-xs font-mono font-bold transition-all ${
                pendingAlertsCount > 0
                  ? 'bg-amber-950/80 hover:bg-amber-900 border-amber-500/60 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.25)] animate-pulse'
                  : 'bg-slate-900/80 border-slate-700 text-slate-300'
              }`}
            >
              <Bell className="w-3.5 h-3.5 text-amber-400" />
              <span>बॉस अलर्ट्स ({pendingAlertsCount})</span>
            </button>

            <button
              onClick={() => setIsAudioSpeechActive(!isAudioSpeechActive)}
              className={`p-2 rounded-xl border transition-all ${
                isAudioSpeechActive
                  ? 'bg-cyan-950/80 border-cyan-500/50 text-cyan-300 shadow-[0_0_8px_rgba(0,240,255,0.2)]'
                  : 'bg-slate-900 border-slate-800 text-slate-500'
              }`}
              title={isAudioSpeechActive ? 'हिंदी वॉइस एक्टिव (TARA Speaking)' : 'वॉइस म्यूटेड'}
            >
              {isAudioSpeechActive ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* SUB-TABS NAVIGATION */}
      <div className="flex items-center justify-between gap-2 border-b border-cyan-500/20 pb-2">
        <div className="flex items-center gap-1 p-1 rounded-xl bg-[#081220]/90 border border-cyan-500/20">
          {[
            { id: 'simulator', label: '📞 कॉल एजेंट सिमुलेटर', icon: PhoneCall },
            { id: 'boss_inbox', label: `🚨 बॉस अर्जेंट इनबॉक्स (${bossAlerts.length})`, icon: Flame },
            { id: 'spam_log', label: `🚫 स्पैम फिल्टर लॉग्स (${spamHistory.length})`, icon: ShieldAlert },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                  activeSubTab === tab.id
                    ? 'bg-cyan-950/90 border border-cyan-500/50 text-cyan-300 font-bold shadow-[0_0_10px_rgba(0,240,255,0.2)]'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <button
          onClick={() => handleStartIncomingCall()}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-mono font-bold shadow-[0_0_12px_rgba(16,185,129,0.3)] transition-all active:scale-95"
        >
          <PhoneIncoming className="w-3.5 h-3.5" />
          <span>नई कॉल सिमुलेट करें</span>
        </button>
      </div>

      {/* TAB 1: CALL AGENT SIMULATOR & WORKFLOW */}
      {activeSubTab === 'simulator' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          {/* LEFT: CALL HUD & PRESET CONTROLS (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col gap-3.5">
            {/* INCOMING CALL ACTIVE HUD */}
            <div className="rounded-2xl bg-gradient-to-b from-[#091728] to-[#060e18] border border-cyan-500/30 p-4 sm:p-5 flex flex-col items-center text-center relative overflow-hidden shadow-xl">
              {/* Background Glow */}
              <div className="absolute top-0 w-40 h-40 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

              {/* Status Header */}
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-700 text-[10px] font-mono text-cyan-300 mb-3">
                {callStatus === 'ringing' && (
                  <>
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                    <span>कॉल आ रही है (Incoming Call...)</span>
                  </>
                )}
                {callStatus === 'connected' && (
                  <>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>कॉल जारी है: {Math.floor(callDuration / 60)}:{String(callDuration % 60).padStart(2, '0')}</span>
                  </>
                )}
                {callStatus === 'spam_blocked' && (
                  <>
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    <span>स्पैम कॉल ब्लॉक कर दी गई</span>
                  </>
                )}
                {callStatus === 'alert_sent' && (
                  <>
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    <span>बॉस को अर्जेंट अलर्ट भेजा गया</span>
                  </>
                )}
                {callStatus === 'idle' && (
                  <span>कॉल एजेंट तैयार (Standby)</span>
                )}
              </div>

              {/* Caller Avatar & Ringing Circle */}
              <div className="relative my-2">
                {callStatus === 'ringing' && (
                  <div className="absolute inset-0 rounded-full border-2 border-emerald-400 animate-ping opacity-75" />
                )}
                <div className={`w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold text-white shadow-2xl border-2 transition-all ${
                  callStatus === 'ringing'
                    ? 'bg-gradient-to-tr from-emerald-600 to-teal-500 border-emerald-300'
                    : callStatus === 'connected'
                    ? 'bg-gradient-to-tr from-cyan-600 to-blue-600 border-cyan-300'
                    : callStatus === 'spam_blocked'
                    ? 'bg-gradient-to-tr from-rose-800 to-red-600 border-rose-400'
                    : 'bg-slate-800 border-slate-700'
                }`}>
                  {currentPreset.isSpam ? '⚠️' : currentPreset.name.charAt(0) || 'C'}
                </div>
              </div>

              {/* Caller Details */}
              <h3 className="font-heading font-black text-base sm:text-lg text-white mt-1">
                {currentPreset.name}
              </h3>
              <p className="text-xs text-emerald-400 font-mono font-semibold">
                {currentPreset.number}
              </p>
              <p className="text-[11px] text-slate-400 font-sans mt-0.5">
                {currentPreset.location} • {currentPreset.categoryLabel}
              </p>

              {/* CALL ACTION BUTTONS */}
              <div className="flex items-center gap-4 mt-5">
                {callStatus === 'ringing' ? (
                  <>
                    <button
                      onClick={handleRejectCall}
                      className="w-12 h-12 rounded-full bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center shadow-[0_0_15px_rgba(244,63,94,0.4)] transition-all active:scale-90"
                      title="Reject Call"
                    >
                      <PhoneOff className="w-5 h-5" />
                    </button>
                    <button
                      onClick={handleAnswerCall}
                      className="w-14 h-14 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.5)] transition-all active:scale-95 animate-pulse"
                      title="Answer Call (TARA speaks Hindi greeting)"
                    >
                      <PhoneCall className="w-6 h-6" />
                    </button>
                  </>
                ) : callStatus === 'connected' ? (
                  <button
                    onClick={handleRejectCall}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-rose-600 hover:bg-rose-500 text-white font-mono text-xs font-bold shadow-[0_0_15px_rgba(244,63,94,0.4)] transition-all active:scale-95"
                  >
                    <PhoneOff className="w-4 h-4" />
                    <span>कॉल समाप्त करें (End Call)</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleStartIncomingCall()}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-mono text-xs font-bold shadow-[0_0_15px_rgba(16,185,129,0.35)] transition-all active:scale-95"
                  >
                    <PhoneIncoming className="w-4 h-4" />
                    <span>सिमुलेटेड कॉल शुरू करें</span>
                  </button>
                )}
              </div>
            </div>

            {/* PRESET CALLERS SELECTOR */}
            <div className="rounded-2xl bg-[#081220]/90 border border-cyan-500/20 p-3.5 flex flex-col gap-2 backdrop-blur-md">
              <span className="text-[11px] font-mono text-cyan-400 uppercase tracking-wider block">
                ⚡ टेस्ट कॉलर चुनें (1-Click Presets):
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {CALL_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => handleStartIncomingCall(preset)}
                    className={`p-2.5 rounded-xl border text-left transition-all flex flex-col gap-1 ${
                      currentPreset.id === preset.id && callStatus !== 'idle'
                        ? 'bg-cyan-950 border-cyan-400 text-white shadow-[0_0_10px_rgba(0,240,255,0.2)]'
                        : preset.isSpam
                        ? 'bg-rose-950/30 hover:bg-rose-950/60 border-rose-500/30 text-rose-200'
                        : 'bg-[#050b14] hover:bg-[#0a1628] border-cyan-500/20 text-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold">{preset.name}</span>
                      {preset.isSpam ? (
                        <span className="text-[9px] font-mono bg-rose-900/80 text-rose-300 px-1.5 py-0.5 rounded">
                          स्पैम
                        </span>
                      ) : (
                        <span className="text-[9px] font-mono bg-amber-900/60 text-amber-300 px-1.5 py-0.5 rounded">
                          {preset.urgency === 'urgent' ? '🔥 अर्जेंट' : 'हाई'}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">{preset.categoryLabel}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT: INTERACTIVE TARA CONVERSATION AGENT (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col gap-3 rounded-2xl bg-[#081220]/90 border border-cyan-500/20 p-4 sm:p-5 backdrop-blur-md shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2.5">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <h4 className="font-heading font-bold text-sm text-white">
                  लाइव कॉल कन्वर्सेशन व तारा इंटेलिजेंस
                </h4>
              </div>
              <span className="text-[10px] font-mono text-slate-400">
                {callStatus === 'connected' ? '🟢 एक्टिव सेशन' : 'स्टैंडबाय'}
              </span>
            </div>

            {/* Conversation Transcript Canvas */}
            <div
              ref={dialogueEndRef}
              className="p-3.5 rounded-xl bg-[#050b14] border border-cyan-500/20 min-h-[300px] max-h-[360px] overflow-y-auto flex flex-col gap-2.5 text-xs font-sans"
            >
              {dialogue.length === 0 ? (
                <div className="m-auto text-center p-6 text-slate-400 flex flex-col items-center gap-2">
                  <Phone className="w-8 h-8 text-cyan-500/40" />
                  <p className="text-xs">
                    कॉल एजेंट शुरू करने के लिए बाएँ तरफ से <strong>"कॉल सिमुलेट करें"</strong> पर क्लिक करें।
                  </p>
                </div>
              ) : (
                dialogue.map((item, idx) => (
                  <div
                    key={idx}
                    className={`flex flex-col gap-1 max-w-[90%] ${
                      item.sender === 'customer'
                        ? 'self-end items-end'
                        : item.sender === 'system'
                        ? 'self-center items-center w-full'
                        : 'self-start items-start'
                    }`}
                  >
                    {item.sender === 'system' ? (
                      <div className="p-2 rounded-lg bg-cyan-950/50 border border-cyan-500/30 text-[11px] text-cyan-300 font-mono text-center w-full">
                        {item.text}
                      </div>
                    ) : (
                      <>
                        <span className="text-[10px] font-mono text-slate-400">
                          {item.sender === 'tara' ? '✨ तारा (AI Receptionist)' : `👤 ${currentPreset.name}`}
                        </span>
                        <div
                          className={`p-3 rounded-2xl leading-relaxed ${
                            item.sender === 'tara'
                              ? 'bg-[#003b46] text-cyan-50 rounded-tl-xs border border-cyan-400/30 shadow-md'
                              : 'bg-[#1e293b] text-slate-100 rounded-tr-xs border border-slate-700'
                          }`}
                        >
                          {item.text}
                        </div>
                      </>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* INTERACTIVE WORKFLOW CONTROLS BASED ON CURRENT STEP */}
            {callStatus === 'connected' && (
              <div className="flex flex-col gap-2.5 pt-1">
                {/* STEP 1: ASK WHETHER THEY NEED GATE / SHED / RAILING */}
                {activeStep === 1 && (
                  <div className="flex flex-col gap-2 p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/30 animate-in fade-in">
                    <span className="text-[11px] font-mono text-cyan-300 font-bold">
                      ग्राहक का उत्तर चुनें (Customer states requirement):
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                      <button
                        onClick={() =>
                          handleCustomerResponse(
                            'shed',
                            'नमस्ते तारा, मुझे 1,500 sq ft छत के लिए शेड बनवाना है। क्या तुरंत बात हो सकती है?'
                          )
                        }
                        className="p-2 rounded-lg bg-slate-900 hover:bg-cyan-950 border border-cyan-500/30 text-[11px] text-cyan-200 text-left transition-all"
                      >
                        🏭 1,500 sq ft शेड
                      </button>

                      <button
                        onClick={() =>
                          handleCustomerResponse(
                            'railing',
                            'नमस्ते, मुझे सीढ़ियों और बालकनी के लिए 80 रनिंग फुट SS-304 रेलिंग का कोटेशन चाहिए।'
                          )
                        }
                        className="p-2 rounded-lg bg-slate-900 hover:bg-cyan-950 border border-cyan-500/30 text-[11px] text-cyan-200 text-left transition-all"
                      >
                        ✨ 80 ft SS रेलिंग
                      </button>

                      <button
                        onClick={() =>
                          handleCustomerResponse(
                            'gate',
                            'नमस्ते, घर के लिए 12x8 फुट का आधुनिक सीएनसी लेजर कट गेट बनवाना है।'
                          )
                        }
                        className="p-2 rounded-lg bg-slate-900 hover:bg-cyan-950 border border-cyan-500/30 text-[11px] text-cyan-200 text-left transition-all"
                      >
                        🚪 12x8 ft मेन गेट
                      </button>

                      <button
                        onClick={() =>
                          handleCustomerResponse(
                            'spam',
                            'हेलो सर, आपको 10 लाख का पर्सनल लोन व लाइफटाइम फ्री क्रेडिट कार्ड मिल रहा है...',
                            true,
                            'पहचाना गया: अनचाहा लोन व क्रेडिट कार्ड प्रचार'
                          )
                        }
                        className="p-2 rounded-lg bg-rose-950/60 hover:bg-rose-900 border border-rose-500/40 text-[11px] text-rose-200 text-left transition-all"
                      >
                        🚫 लोन ऑफर (स्पैम)
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 2: DETAILS CONFIRMED -> SEND ALERT TO BOSS */}
                {activeStep === 2 && (
                  <div className="flex flex-col gap-2.5 p-3 rounded-xl bg-amber-950/40 border border-amber-500/40 animate-in fade-in">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono text-amber-300 font-bold flex items-center gap-1">
                        <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                        कार्य का विवरण प्राप्त हुआ: {currentPreset.categoryLabel}
                      </span>
                      <span className="text-[10px] font-mono text-amber-300/80">
                        अनुमानित: {currentPreset.estimatedBudget}
                      </span>
                    </div>

                    <p className="text-xs text-slate-200">
                      ग्राहक ने साइट नाप और कोटेशन की मांग की है। तारा तुरंत बॉस (मिस्टर बृजमोहन कुमार) को समरी व अर्जेंट कॉल अलर्ट भेज सकती है।
                    </p>

                    <div className="flex flex-wrap gap-2 pt-1">
                      <button
                        onClick={() => handleFinalizeAndSendBossAlert('urgent')}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 hover:from-amber-500 hover:to-red-500 text-white font-mono text-xs font-bold shadow-[0_0_15px_rgba(245,158,11,0.35)] active:scale-95 transition-all"
                      >
                        <Flame className="w-4 h-4 text-white fill-white" />
                        <span>🚨 बॉस को अर्जेंट कॉल अलर्ट भेजें (Send to Boss)</span>
                      </button>

                      <button
                        onClick={() => handleFinalizeAndSendBossAlert('high')}
                        className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-mono transition-all"
                      >
                        सामान्य प्राथमिकता से भेजें
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* DISPATCHED ALERT PREVIEW CARD */}
            {latestAlertDispatched && (
              <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 flex flex-col gap-2 text-xs animate-in zoom-in-95">
                <div className="flex items-center justify-between border-b border-emerald-500/30 pb-1.5">
                  <span className="font-heading font-bold text-emerald-300 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    बॉस हेतु अर्जेंट कॉल अलर्ट सफलतापूर्वक प्रेषित
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-900/60 px-2 py-0.5 rounded">
                    सक्रिय
                  </span>
                </div>

                <div className="font-sans text-slate-200 whitespace-pre-wrap text-[11px] leading-relaxed bg-[#050b14]/70 p-2.5 rounded-lg border border-emerald-500/20">
                  {latestAlertDispatched.summary}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <div className="flex items-center gap-2">
                    <a
                      href={`tel:${latestAlertDispatched.callerNumber.replace(/\s+/g, '')}`}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold transition-all shadow-xs"
                    >
                      <PhoneCall className="w-3 h-3" />
                      <span>बॉस द्वारा कॉल करें</span>
                    </a>

                    <a
                      href={`https://api.whatsapp.com/send?phone=${latestAlertDispatched.callerNumber.replace(/\D/g, '')}&text=${encodeURIComponent(`नमस्ते श्री ${latestAlertDispatched.callerName} जी, मुझे तारा असिस्टेंट से आपका कॉल अलर्ट प्राप्त हुआ है। मैं मोहन विश्वास फैब्रिकेशन से बृजमोहन बोल रहा हूँ।`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-950 hover:bg-emerald-900 border border-emerald-500/50 text-emerald-300 font-mono text-xs font-bold transition-all"
                    >
                      <MessageSquare className="w-3 h-3 text-emerald-400" />
                      <span>व्हाट्सएप खोलें</span>
                    </a>
                  </div>

                  <button
                    onClick={() => setActiveSubTab('boss_inbox')}
                    className="text-xs text-cyan-300 hover:text-white font-mono underline"
                  >
                    बॉस इनबॉक्स में देखें →
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: BOSS URGENT INBOX & NOTIFICATION CENTER */}
      {activeSubTab === 'boss_inbox' && (
        <div className="flex flex-col gap-4">
          {/* Header Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-500/40 flex flex-col gap-1">
              <span className="text-[11px] font-mono text-amber-300 flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                लंबित अर्जेंट अलर्ट्स (Pending)
              </span>
              <span className="font-heading font-black text-2xl text-amber-400">
                {pendingAlertsCount}
              </span>
              <span className="text-[10px] text-amber-200/70 font-mono">बॉस द्वारा कॉल प्रतीक्षित</span>
            </div>

            <div className="p-3.5 rounded-xl bg-cyan-950/40 border border-cyan-500/30 flex flex-col gap-1">
              <span className="text-[11px] font-mono text-cyan-300">कुल प्राप्त कॉल्स समरी</span>
              <span className="font-heading font-black text-2xl text-white">{bossAlerts.length}</span>
              <span className="text-[10px] text-cyan-400 font-mono">तारा द्वारा फ़िल्टर व सारांशित</span>
            </div>

            <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 flex flex-col gap-1">
              <span className="text-[11px] font-mono text-emerald-300">साइट विज़िट हेतु संभावित</span>
              <span className="font-heading font-black text-2xl text-emerald-400">
                {bossAlerts.filter((a) => a.urgency === 'urgent').length}
              </span>
              <span className="text-[10px] text-emerald-300/80 font-mono">हाई कन्वर्जन लीड्स</span>
            </div>
          </div>

          {/* Alerts List */}
          <div className="flex flex-col gap-3">
            {bossAlerts.length === 0 ? (
              <div className="p-8 rounded-2xl bg-[#081220]/60 border border-cyan-500/20 text-center text-xs text-slate-400 font-mono">
                कोई अलर्ट नहीं है। कॉल सिमुलेटर से नई कॉल चलाएं।
              </div>
            ) : (
              bossAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-4 rounded-2xl bg-[#081220]/90 border transition-all flex flex-col gap-3 ${
                    alert.status === 'pending'
                      ? 'border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.1)]'
                      : 'border-cyan-500/20 opacity-80'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-cyan-500/10 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
                      <h4 className="font-heading font-bold text-sm text-white">
                        {alert.callerName}
                      </h4>
                      <span className="text-[10px] font-mono text-emerald-400 font-semibold">
                        {alert.callerNumber}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-cyan-950 border border-cyan-500/30 text-[10px] font-mono text-cyan-300">
                        {alert.serviceCategory}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <span className="text-[10px] font-mono text-slate-400">
                        {new Date(alert.timestamp).toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <select
                        value={alert.status}
                        onChange={(e) => handleUpdateAlertStatus(alert.id, e.target.value as any)}
                        className="bg-[#050b14] border border-cyan-500/30 rounded-lg px-2 py-1 text-[11px] font-mono text-cyan-300 focus:outline-none"
                      >
                        <option value="pending">🔥 लंबित (Pending)</option>
                        <option value="called_back">📞 कॉल कर लिया</option>
                        <option value="reviewed">✓ देखा गया</option>
                        <option value="dismissed">हटाएं</option>
                      </select>
                    </div>
                  </div>

                  {/* Summary Text */}
                  <div className="p-3 rounded-xl bg-[#050b14] border border-cyan-500/20 text-xs text-slate-200 leading-relaxed font-sans whitespace-pre-wrap">
                    {alert.summary}
                  </div>

                  {/* Action Buttons for Boss */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                    <div className="flex items-center gap-2">
                      <a
                        href={`tel:${alert.callerNumber.replace(/\s+/g, '')}`}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold shadow-[0_0_10px_rgba(16,185,129,0.3)] transition-all active:scale-95"
                      >
                        <PhoneCall className="w-3.5 h-3.5" />
                        <span>बॉस डायरेक्ट कॉल करें</span>
                      </a>

                      <a
                        href={`https://api.whatsapp.com/send?phone=${alert.callerNumber.replace(/\D/g, '')}&text=${encodeURIComponent(`नमस्ते श्री ${alert.callerName} जी, मुझे तारा असिस्टेंट से आपका कॉल विवरण प्राप्त हुआ है। मैं मोहन विश्वास फैब्रिकेशन से बृजमोहन कुमार बोल रहा हूँ।`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300 font-mono text-xs font-bold transition-all"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                        <span>व्हाट्सएप संदेश</span>
                      </a>

                      <button
                        onClick={() => handleCopyAlert(alert.summary)}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-mono"
                      >
                        {copiedText ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>समरी कॉपी</span>
                      </button>
                    </div>

                    <button
                      onClick={() => handleDeleteAlert(alert.id)}
                      className="text-slate-500 hover:text-rose-400 transition-colors"
                      title="Delete Alert"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 3: SPAM FILTER LOGS */}
      {activeSubTab === 'spam_log' && (
        <div className="flex flex-col gap-3 rounded-2xl bg-[#081220]/90 border border-cyan-500/20 p-4 sm:p-5 backdrop-blur-md">
          <div className="flex items-center justify-between border-b border-cyan-500/20 pb-3">
            <div>
              <h3 className="font-heading font-bold text-sm text-white flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                तारा ऑटोमेटेड स्पैम व अनचाही कॉल्स शील्ड
              </h3>
              <p className="text-xs text-slate-400 font-sans mt-0.5">
                लोन, क्रेडिट कार्ड, इंश्योरेंस और प्रचार कॉल्स को स्वचालित रूप से ब्लॉक किया जाता है ताकि बॉस का समय व्यर्थ न हो।
              </p>
            </div>
            <span className="text-[10px] font-mono text-rose-400 bg-rose-950 px-2 py-1 rounded border border-rose-500/40">
              शील्ड सक्रिय
            </span>
          </div>

          <div className="flex flex-col gap-2.5">
            {spamHistory.map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-xl bg-rose-950/20 border border-rose-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-heading font-bold text-xs text-white">{item.name}</span>
                    <span className="text-[11px] font-mono text-rose-300">{item.number}</span>
                    <span className="text-[9px] font-mono bg-rose-900/60 text-rose-200 px-1.5 py-0.5 rounded">
                      🚫 BLOCKED
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 mt-0.5 font-sans">
                    {item.reason}
                  </p>
                </div>
                <span className="text-[10px] font-mono text-slate-500 self-end sm:self-auto">
                  {item.time}
                </span>
              </div>
            ))}
          </div>

          <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30 flex items-center justify-between gap-2 text-xs text-emerald-200">
            <span>
              ✓ 100% सुरक्षा: केवल वास्तविक ग्राहक (शेड्स, रेलिंग, गेट्स) ही बॉस तक पहुंचते हैं।
            </span>
            <button
              onClick={() => setActiveSubTab('simulator')}
              className="text-emerald-400 hover:text-white font-mono underline font-bold"
            >
              सिमुलेटर खोलें →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
