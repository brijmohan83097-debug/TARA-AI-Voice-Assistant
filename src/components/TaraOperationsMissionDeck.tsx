/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Activity,
  Flame,
  Wrench,
  Cog,
  ShieldCheck,
  Zap,
  TrendingUp,
  FileText,
  Calculator,
  MessageSquare,
  PhoneCall,
  Share2,
  CheckCircle2,
  Clock,
  Sparkles,
  Layers,
  Building,
  RefreshCw,
  Music,
  ExternalLink,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import { audioSynth } from '../utils/audio';
import { ChatMessage, TaskItem } from '../types';

export interface TaraOperationsMissionDeckProps {
  tasks?: TaskItem[];
  chatMessages?: ChatMessage[];
  onSendMessage: (msg: string) => void;
  isLoadingChat?: boolean;
  isSpeaking?: boolean;
  isListening?: boolean;
  onToggleVoice?: () => void;
  onOpenRates: () => void;
  onOpenLeads: () => void;
  onOpenCallAgent: () => void;
  onOpenMusic?: () => void;
  minimal?: boolean;
  className?: string;
}

interface WorkshopBay {
  id: string;
  name: string;
  nameHi: string;
  icon: typeof Flame;
  status: 'active' | 'standby' | 'optimal';
  metric1Label: string;
  metric1Value: string;
  metric2Label: string;
  metric2Value: string;
  currentJob: string;
  health: number;
  color: string;
  sparkColor: string;
}

const WORKSHOP_BAYS: WorkshopBay[] = [
  {
    id: 'bay-1',
    name: 'Bay 1: TIG / MIG Arc Welding',
    nameHi: 'आर्क व TIG/MIG वेल्डिंग बे',
    icon: Flame,
    status: 'active',
    metric1Label: 'आर्क तापमान',
    metric1Value: '2,840°C',
    metric2Label: 'आर्गन फ्लो',
    metric2Value: '18 LPM / 220A',
    currentJob: 'शेड रूफ ट्रस व गर्डर वेल्डिंग',
    health: 99,
    color: 'from-amber-500/20 to-orange-500/10 border-amber-500/40 text-amber-300',
    sparkColor: 'bg-amber-400'
  },
  {
    id: 'bay-2',
    name: 'Bay 2: CNC Plasma Cutting',
    nameHi: 'सीएनसी प्लाज्मा कटिंग बेड',
    icon: Cog,
    status: 'active',
    metric1Label: 'कटिंग स्पीड',
    metric1Value: '1,400 mm/m',
    metric2Label: 'टॉलरेंस',
    metric2Value: '±0.15mm एक्यूरेसी',
    currentJob: '16mm एमएस प्लेट्स लेज़र प्रोफाइलिंग',
    health: 98,
    color: 'from-cyan-500/20 to-blue-500/10 border-cyan-500/40 text-cyan-300',
    sparkColor: 'bg-cyan-400'
  },
  {
    id: 'bay-3',
    name: 'Bay 3: 150T Hydraulic Bending',
    nameHi: '150-टन हाइड्रोलिक शीट प्रेस',
    icon: Wrench,
    status: 'active',
    metric1Label: 'हाइड्रोलिक प्रेशर',
    metric1Value: '185 Bar',
    metric2Label: 'बेंडिंग एंगल',
    metric2Value: '90° प्रोफाइल फ्लैंज',
    currentJob: 'गटर व सी-पर्लिन शीट बेंडिंग',
    health: 100,
    color: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/40 text-emerald-300',
    sparkColor: 'bg-emerald-400'
  },
  {
    id: 'bay-4',
    name: 'Bay 4: Powder Coating Chamber',
    nameHi: 'पाउडर कोटिंग व पेंट चैंबर',
    icon: Layers,
    status: 'optimal',
    metric1Label: 'ओवन तापमान',
    metric1Value: '185°C',
    metric2Label: 'कोटिंग लेयर',
    metric2Value: 'जिंक क्रोमेट प्राइमर',
    currentJob: 'सीएनसी मेन गेट व ग्रिल पाउडर कोटिंग',
    health: 97,
    color: 'from-purple-500/20 to-pink-500/10 border-purple-500/40 text-purple-300',
    sparkColor: 'bg-purple-400'
  },
  {
    id: 'bay-5',
    name: 'Bay 5: Structural QA & Laser QA',
    nameHi: 'क्वालिटी व लोड टेस्टिंग लैब',
    icon: ShieldCheck,
    status: 'optimal',
    metric1Label: 'अल्ट्रासोनिक QA',
    metric1Value: '100% पास (Grade A)',
    metric2Label: 'लोड कैपेसिटी',
    metric2Value: '45 टन टेस्टेड',
    currentJob: 'राजेश शर्मा शेड वेल्ड इंस्पेक्शन',
    health: 100,
    color: 'from-sky-500/20 to-indigo-500/10 border-sky-500/40 text-sky-300',
    sparkColor: 'bg-sky-400'
  }
];

interface ProjectPipelineItem {
  id: string;
  title: string;
  client: string;
  location: string;
  progress: number;
  stage: string;
  eta: string;
  value: string;
  priority: 'high' | 'medium' | 'complete';
}

const ACTIVE_PROJECTS: ProjectPipelineItem[] = [
  {
    id: 'proj-1',
    title: 'इंडस्ट्रियल वेयरहाउस शेड (15,000 sq ft)',
    client: 'राजेश शर्मा (Rajesh Sharma)',
    location: 'पटना बाईपास, ट्रांसपोर्ट नगर',
    progress: 84,
    stage: 'रूफ ट्रस व पर्लिन असेंबली प्रगति पर',
    eta: '14 अक्टूबर',
    value: '₹18,50,000',
    priority: 'high'
  },
  {
    id: 'proj-2',
    title: 'हैवी मोटराइज्ड रोलिंग शटर (4 यूनिट्स)',
    client: 'गुप्ता कमर्शियल कॉम्प्लेक्स',
    location: 'कंकड़बाग मेन रोड',
    progress: 92,
    stage: 'मोटर गियरबॉक्स व रिमोट ऑटोमेशन टेस्टेड',
    eta: '10 अक्टूबर',
    value: '₹3,40,000',
    priority: 'high'
  },
  {
    id: 'proj-3',
    title: 'रॉयल सीएनसी लेज़र कट डिज़ाइनर गेट (18 x 7.5 ft)',
    client: 'डॉ. ए.के. वर्मा रेजीडेंस',
    location: 'राजीव नगर, पटना',
    progress: 68,
    stage: 'पाउडर कोटिंग व एंटी-रस्ट कोटिंग जारी',
    eta: '16 अक्टूबर',
    value: '₹1,85,000',
    priority: 'medium'
  },
  {
    id: 'proj-4',
    title: 'SS-304 स्टेनलेस स्टील सीढ़ी रेलिंग (320 Rft)',
    client: 'स्काईलाइन हाइट्स अपार्टमेंट',
    location: 'बेली रोड, पटना',
    progress: 100,
    stage: 'तैयार व साइट पर इंस्टॉलेशन जारी',
    eta: 'आज डिस्पैच',
    value: '₹4,16,000',
    priority: 'complete'
  }
];

interface SteelMarketItem {
  name: string;
  grade: string;
  price: string;
  trend: string;
  isUp: boolean;
  stock: string;
}

const STEEL_MARKET_RATES: SteelMarketItem[] = [
  { name: 'टाटा टिस्कॉन एमएस सरिया / बार', grade: 'Tata Tiscon 550D', price: '₹68.50 / kg', trend: '+0.6%', isUp: true, stock: '14.2 टन' },
  { name: 'जिंदल जीआई स्ट्रक्चरल पाइप्स', grade: 'Jindal Heavy GI', price: '₹72.80 / kg', trend: '+0.2%', isUp: true, stock: '480 पीस' },
  { name: 'सेल (SAIL) हैवी आई-बीम्स / चैनल्स', grade: 'SAIL ISMB 200', price: '₹66.40 / kg', trend: 'स्थिर', isUp: false, stock: '18.5 टन' },
  { name: 'स्टेनलेस स्टील SS-304 शीट्स', grade: 'Jindal SS-304 2B', price: '₹248.00 / kg', trend: '+1.1%', isUp: true, stock: '2.8 टन' },
  { name: 'आर्गन शील्डिंग गैस सिलेंडर (47L)', grade: 'Industrial 99.99%', price: '₹850 / रिफिल', trend: 'स्थिर', isUp: false, stock: '6 भरे हुए' }
];

export const TaraOperationsMissionDeck: React.FC<TaraOperationsMissionDeckProps> = ({
  onSendMessage,
  onOpenRates,
  onOpenLeads,
  onOpenCallAgent,
  onOpenMusic,
  className = ''
}) => {
  const [activeTab, setActiveTab] = useState<'telemetry' | 'projects' | 'calculator' | 'rates' | 'directives'>('telemetry');
  
  // Instant Quote Mini-Calculator State
  const [calcService, setCalcService] = useState<'shed' | 'shutter' | 'gate' | 'railing'>('shed');
  const [calcUnits, setCalcUnits] = useState<number>(1000);
  const [calcSteelGrade, setCalcSteelGrade] = useState<'tata' | 'jindal' | 'standard'>('tata');
  const [calcFinish, setCalcFinish] = useState<'primer' | 'powder' | 'pu'>('powder');
  const [copiedQuote, setCopiedQuote] = useState<boolean>(false);

  // Compute estimate
  const ratesMap = {
    shed: { base: 220, label: 'वर्ग फुट (Sq. Ft)', title: 'इंडस्ट्रियल शेड फैब्रिकेशन' },
    shutter: { base: 260, label: 'वर्ग फुट (Sq. Ft)', title: 'ऑटोमैटिक रोलिंग शटर' },
    gate: { base: 120, label: 'किलोग्राम (Kg)', title: 'सीएनसी डिज़ाइनर मेन गेट' },
    railing: { base: 1150, label: 'रनिंग फुट (Rft)', title: 'SS-304 स्टेनलेस स्टील रेलिंग' }
  };

  const steelMultiplier = calcSteelGrade === 'tata' ? 1.12 : calcSteelGrade === 'jindal' ? 1.08 : 1.0;
  const finishCost = calcFinish === 'powder' ? 25 : calcFinish === 'pu' ? 35 : 12;
  const unitRate = Math.round((ratesMap[calcService].base * steelMultiplier) + finishCost);
  const rawTotal = Math.round(unitRate * calcUnits);
  const gstAmount = Math.round(rawTotal * 0.18);
  const grandTotal = rawTotal + gstAmount;

  const handleTabChange = (tab: typeof activeTab) => {
    audioSynth.playSciFiClick();
    setActiveTab(tab);
  };

  const handleTriggerDirective = (prompt: string) => {
    audioSynth.playSciFiClick();
    onSendMessage(prompt);
  };

  const handleCopyQuoteToWhatsApp = () => {
    audioSynth.playSciFiClick();
    const quoteText = `*मोहन विश्वास फैब्रिकेशन • औपचारिक एस्टीमेट कोटेशन*\n` +
      `कार्य: ${ratesMap[calcService].title}\n` +
      `मात्रा: ${calcUnits} ${ratesMap[calcService].label}\n` +
      `स्टील ग्रेड: ${calcSteelGrade.toUpperCase()} | फिनिशिंग: ${calcFinish.toUpperCase()}\n` +
      `दर: ₹${unitRate.toLocaleString('en-IN')} प्रति यूनिट\n` +
      `कुल राशि (GST सहित): ₹${grandTotal.toLocaleString('en-IN')}\n\n` +
      `अधिक जानकारी व साइट विजिट हेतु संपर्क करें: मोहन विश्वास फैब्रिकेशन, पटना।`;

    navigator.clipboard?.writeText(quoteText);
    setCopiedQuote(true);
    setTimeout(() => setCopiedQuote(false), 2500);

    // Open leads modal or trigger chat
    onSendMessage(`तारा, मैंने ${ratesMap[calcService].title} के लिए ₹${grandTotal.toLocaleString('en-IN')} का कोटेशन तैयार किया है। कृपया इसे रिकॉर्ड करें।`);
  };

  return (
    <div className={`relative w-full h-full flex flex-col bg-[#040914]/90 backdrop-blur-md rounded-2xl border border-cyan-500/30 shadow-[0_0_35px_rgba(0,240,255,0.12)] overflow-hidden ${className}`}>
      {/* TOP GLOWING HUD HEADER */}
      <div className="shrink-0 px-3.5 py-2.5 sm:px-5 sm:py-3 bg-gradient-to-r from-[#061226] via-[#081832] to-[#061226] border-b border-cyan-500/25 flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-cyan-950/80 border border-cyan-400/50 flex items-center justify-center text-cyan-300 shadow-[0_0_12px_rgba(0,240,255,0.3)]">
            <Building className="w-4 h-4 text-cyan-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xs sm:text-sm font-heading font-black tracking-wide text-cyan-200">
                मोहन विश्वास फैब्रिकेशन • ऑपरेशंस एवं मिशन कंट्रोल डेक
              </h2>
              <span className="hidden md:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                DIRECTOR BRIJMOHAN KUMAR
              </span>
            </div>
            <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400 mt-0.5">
              <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                5/5 बे ऑनलाइन
              </span>
              <span className="text-slate-500">•</span>
              <span>दैनिक उत्पादन: <strong className="text-cyan-300">4.82 टन</strong></span>
              <span className="hidden sm:inline text-slate-500">•</span>
              <span className="hidden sm:inline">पावर लोड: <strong className="text-amber-300">41.8 kW</strong></span>
            </div>
          </div>
        </div>

        {/* QUICK ACTION BUTTONS */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onOpenRates}
            className="px-2.5 py-1 rounded-lg bg-cyan-950/60 hover:bg-cyan-900/80 border border-cyan-400/40 text-cyan-200 text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-[0_0_8px_rgba(0,240,255,0.15)] cursor-pointer"
            title="दर तालिका खोलें"
          >
            <Calculator className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">दर तालिका</span>
          </button>
          <button
            type="button"
            onClick={onOpenLeads}
            className="px-2.5 py-1 rounded-lg bg-pink-950/60 hover:bg-pink-900/80 border border-pink-400/40 text-pink-200 text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            title="WhatsApp लीड्स"
          >
            <MessageSquare className="w-3.5 h-3.5 text-pink-400" />
            <span className="hidden sm:inline">लीड्स</span>
          </button>
          <button
            type="button"
            onClick={onOpenCallAgent}
            className="px-2.5 py-1 rounded-lg bg-purple-950/60 hover:bg-purple-900/80 border border-purple-400/40 text-purple-200 text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            title="कॉल एजेंट"
          >
            <PhoneCall className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden sm:inline">कॉल</span>
          </button>
          {onOpenMusic && (
            <button
              type="button"
              onClick={onOpenMusic}
              className="px-2 py-1 rounded-lg bg-indigo-950/60 hover:bg-indigo-900/80 border border-indigo-400/40 text-indigo-200 text-xs font-mono font-bold flex items-center gap-1 transition-all cursor-pointer"
              title="साइबर म्यूजिक"
            >
              <Music className="w-3.5 h-3.5 text-indigo-400" />
            </button>
          )}
        </div>
      </div>

      {/* SEGMENTED TAB SWITCHER */}
      <div className="shrink-0 px-3.5 py-1.5 bg-[#030712] border-b border-cyan-500/20 flex items-center gap-1 overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => handleTabChange('telemetry')}
          className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
            activeTab === 'telemetry'
              ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-400/50 shadow-[0_0_12px_rgba(0,240,255,0.2)]'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
          }`}
        >
          <Flame className="w-3.5 h-3.5 text-amber-400" />
          <span>कार्यशाला टेलीमेट्री (5 बे)</span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('projects')}
          className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
            activeTab === 'projects'
              ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-400/50 shadow-[0_0_12px_rgba(0,240,255,0.2)]'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
          }`}
        >
          <Activity className="w-3.5 h-3.5 text-cyan-400" />
          <span>प्रोजेक्ट्स व डिलीवरी ट्रैकर</span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('calculator')}
          className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
            activeTab === 'calculator'
              ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-400/50 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
          }`}
        >
          <Calculator className="w-3.5 h-3.5 text-emerald-400" />
          <span>फास्ट कोटेशन कैलकुलेटर</span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('rates')}
          className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
            activeTab === 'rates'
              ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-400/50 shadow-[0_0_12px_rgba(0,240,255,0.2)]'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5 text-sky-400" />
          <span>स्टील मार्केट इंडेक्स</span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('directives')}
          className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
            activeTab === 'directives'
              ? 'bg-purple-500/20 text-purple-200 border border-purple-400/50 shadow-[0_0_12px_rgba(168,85,247,0.2)]'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          <span>तारा क्विक डायरेक्टिव्स</span>
        </button>
      </div>

      {/* CONTENT BODY AREA (SCROLLABLE) */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4">
        {/* ============================================================== */}
        {/* TAB 1: WORKSHOP TELEMETRY (5 HIGH-TECH BAYS) */}
        {/* ============================================================== */}
        {activeTab === 'telemetry' && (
          <div className="space-y-3.5 animate-in fade-in duration-200">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                सभी 5 फैब्रिकेशन बे सुरक्षित मानकों के अनुरूप सक्रिय हैं
              </span>
              <button
                type="button"
                onClick={() => handleTriggerDirective('तारा, कार्यशाला के सभी 5 बे की पूरी लाइव रिपोर्ट बोलकर सुनाओ।')}
                className="text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1 hover:underline cursor-pointer"
              >
                <Sparkles className="w-3 h-3" />
                तारा से लाइव ऑडियो रिपोर्ट लें ↗
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {WORKSHOP_BAYS.map((bay) => {
                const IconComponent = bay.icon;
                return (
                  <div
                    key={bay.id}
                    className={`relative p-3.5 rounded-xl bg-gradient-to-br ${bay.color} border shadow-lg flex flex-col justify-between transition-all hover:scale-[1.01]`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-black/40 border border-white/10">
                          <IconComponent className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-xs font-heading font-black text-white">{bay.nameHi}</h4>
                          <span className="text-[10px] font-mono text-slate-300 block">{bay.name}</span>
                        </div>
                      </div>
                      <span className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                        ऑनलाइन
                      </span>
                    </div>

                    <div className="my-2.5 p-2 rounded-lg bg-black/30 border border-white/5 space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] font-mono">
                        <span className="text-slate-400">{bay.metric1Label}:</span>
                        <strong className="text-white font-bold">{bay.metric1Value}</strong>
                      </div>
                      <div className="flex items-center justify-between text-[11px] font-mono">
                        <span className="text-slate-400">{bay.metric2Label}:</span>
                        <strong className="text-cyan-300 font-bold">{bay.metric2Value}</strong>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-2 text-[10px] font-mono">
                      <span className="text-slate-300 truncate">
                        कार्य: <strong className="text-white">{bay.currentJob}</strong>
                      </span>
                      <button
                        type="button"
                        onClick={() => handleTriggerDirective(`तारा, ${bay.nameHi} की वर्तमान स्थिति और वेल्डिंग गुणवत्ता का विवरण दो।`)}
                        className="px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-white font-bold transition-colors cursor-pointer shrink-0"
                      >
                        विवरण ↗
                      </button>
                    </div>
                  </div>
                );
              })}

              {/* LIVE WORKSHOP SUMMARY METRIC CARD */}
              <div className="p-3.5 rounded-xl bg-gradient-to-br from-[#06182e] to-[#040e1d] border border-cyan-500/30 shadow-lg flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-cyan-950 border border-cyan-400/40 text-cyan-300">
                      <Zap className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-heading font-black text-cyan-200">कार्यशाला समग्र स्थिति</h4>
                      <span className="text-[10px] font-mono text-slate-400">दैनिक दक्षता: 98.6%</span>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-400">उत्कृष्ट</span>
                </div>

                <div className="space-y-1.5 my-2.5 text-xs font-mono">
                  <div className="flex justify-between text-slate-300">
                    <span>दैनिक उत्पादन:</span>
                    <strong className="text-cyan-300">4.82 टन स्ट्रक्चरल स्टील</strong>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>विद्युत लोड:</span>
                    <strong className="text-amber-300">41.8 kW (स्थिर)</strong>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>सुरक्षा इंसिडेंट:</span>
                    <strong className="text-emerald-400">शून्य (Zero Alerts)</strong>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleTriggerDirective('तारा, आज की कार्यशाला की पूरी समरी और कल के उत्पादन का लक्ष्य बताओ।')}
                  className="w-full py-1.5 rounded-lg bg-cyan-600/80 hover:bg-cyan-500 text-slate-950 font-bold font-mono text-xs flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>दैनिक सारांश ऑडियो सुनें</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 2: ACTIVE PROJECTS & PRODUCTION PIPELINE */}
        {/* ============================================================== */}
        {activeTab === 'projects' && (
          <div className="space-y-3 animate-in fade-in duration-200">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">
                कुल 4 सक्रिय प्रोजेक्ट्स निष्पादन में हैं • समय पर डिलीवरी दर: <strong className="text-emerald-400">99.2%</strong>
              </span>
              <button
                type="button"
                onClick={() => handleTriggerDirective('तारा, वर्तमान प्रोजेक्ट्स की डिलीवरी स्थिति और राजेश शर्मा जी के शेड का अपडेट बताओ।')}
                className="text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1 hover:underline cursor-pointer"
              >
                <Sparkles className="w-3 h-3" />
                प्रोजेक्ट्स समीक्षा ↗
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {ACTIVE_PROJECTS.map((proj) => (
                <div
                  key={proj.id}
                  className="p-3.5 rounded-xl bg-[#061224] border border-cyan-500/25 hover:border-cyan-400/50 transition-all shadow-lg flex flex-col justify-between gap-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-xs sm:text-sm font-heading font-black text-cyan-200">{proj.title}</h4>
                      <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                        ग्राहक: <strong className="text-white">{proj.client}</strong> • {proj.location}
                      </p>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950 border border-cyan-400/40 text-cyan-300 shrink-0">
                      {proj.value}
                    </span>
                  </div>

                  {/* PROGRESS BAR */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-mono text-slate-300">
                      <span>{proj.stage}</span>
                      <strong className="text-cyan-300">{proj.progress}%</strong>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden border border-cyan-500/20">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          proj.progress === 100
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                            : 'bg-gradient-to-r from-cyan-500 to-sky-400'
                        }`}
                        style={{ width: `${proj.progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="pt-2 border-t border-cyan-500/15 flex items-center justify-between gap-2 text-[10px] font-mono">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-cyan-400" />
                      डिलीवरी: <strong className="text-white">{proj.eta}</strong>
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleTriggerDirective(`तारा, ${proj.client} के लिए ${proj.title} का प्रगति संदेश तैयार करो।`)}
                        className="px-2 py-1 rounded bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-400/30 text-cyan-200 font-bold transition-all cursor-pointer flex items-center gap-1"
                      >
                        <MessageSquare className="w-3 h-3 text-cyan-400" />
                        <span>अपडेट ड्राफ्ट</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 3: INSTANT QUICK QUOTATION CALCULATOR */}
        {/* ============================================================== */}
        {activeTab === 'calculator' && (
          <div className="p-4 rounded-xl bg-[#061224] border border-emerald-500/30 shadow-xl space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-emerald-500/20">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-emerald-950 border border-emerald-400/40 text-emerald-300">
                  <Calculator className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-heading font-black text-emerald-200">
                    त्वरित कोटेशन कैलकुलेटर (Instant Fabrication Estimator)
                  </h3>
                  <span className="text-[11px] font-mono text-slate-400">
                    ग्राहक को 1-क्लिक में सटीक कोटेशन व दर प्रदान करें
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={onOpenRates}
                className="text-xs font-mono text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1 hover:underline cursor-pointer"
              >
                विस्तृत दर तालिका ↗
              </button>
            </div>

            {/* SERVICE SELECTOR */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(['shed', 'shutter', 'gate', 'railing'] as const).map((svc) => (
                <button
                  key={svc}
                  type="button"
                  onClick={() => {
                    audioSynth.playSciFiClick();
                    setCalcService(svc);
                    if (svc === 'gate') setCalcUnits(350);
                    else if (svc === 'railing') setCalcUnits(120);
                    else setCalcUnits(1000);
                  }}
                  className={`p-2.5 rounded-lg border text-xs font-mono font-bold text-left transition-all cursor-pointer ${
                    calcService === svc
                      ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200 shadow-[0_0_12px_rgba(16,185,129,0.25)]'
                      : 'bg-black/40 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  <span className="block">{ratesMap[svc].title}</span>
                  <span className="text-[10px] text-slate-500 font-normal">₹{ratesMap[svc].base} / {ratesMap[svc].label}</span>
                </button>
              ))}
            </div>

            {/* INPUTS ROW */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-mono text-slate-300">
                  मात्रा ({ratesMap[calcService].label}):
                </label>
                <input
                  type="number"
                  min="1"
                  value={calcUnits}
                  onChange={(e) => setCalcUnits(Math.max(1, Number(e.target.value) || 1))}
                  className="w-full px-3 py-1.5 rounded-lg bg-black/60 border border-emerald-500/30 text-white font-mono text-sm focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono text-slate-300">स्टील ग्रेड:</label>
                <select
                  value={calcSteelGrade}
                  onChange={(e) => setCalcSteelGrade(e.target.value as any)}
                  className="w-full px-3 py-1.5 rounded-lg bg-black/60 border border-emerald-500/30 text-white font-mono text-xs focus:outline-none focus:border-emerald-400"
                >
                  <option value="tata">टाटा टिस्कॉन 550D (+12% प्रीमियम)</option>
                  <option value="jindal">जिंदल स्ट्रक्चरल (+8%)</option>
                  <option value="standard">मानक आईएसआई (ISI Standard)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono text-slate-300">फिनिशिंग / पेंटिंग:</label>
                <select
                  value={calcFinish}
                  onChange={(e) => setCalcFinish(e.target.value as any)}
                  className="w-full px-3 py-1.5 rounded-lg bg-black/60 border border-emerald-500/30 text-white font-mono text-xs focus:outline-none focus:border-emerald-400"
                >
                  <option value="powder">पाउडर कोटिंग (जिंक प्राइमर सहित)</option>
                  <option value="pu">पॉलीयुरेथेन PU पेंट (उच्च चमक)</option>
                  <option value="primer">रेड ऑक्साइड एंटी-रस्ट प्राइमर</option>
                </select>
              </div>
            </div>

            {/* COMPUTED SUMMARY BOX */}
            <div className="p-3.5 rounded-xl bg-gradient-to-r from-emerald-950/60 to-[#041a18] border border-emerald-400/40 flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-[11px] font-mono text-slate-400 block">
                  यूनिट दर: <strong>₹{unitRate.toLocaleString('en-IN')}</strong> / {ratesMap[calcService].label} • मूल लागत: ₹{rawTotal.toLocaleString('en-IN')} + GST 18% (₹{gstAmount.toLocaleString('en-IN')})
                </span>
                <span className="text-base sm:text-xl font-heading font-black text-emerald-300">
                  कुल राशि: ₹{grandTotal.toLocaleString('en-IN')} <span className="text-xs font-normal text-emerald-400">(सभी टैक्स सहित)</span>
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyQuoteToWhatsApp}
                  className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-slate-950 font-bold font-mono text-xs flex items-center gap-2 shadow-lg transition-all cursor-pointer active:scale-95"
                >
                  <Share2 className="w-4 h-4" />
                  <span>{copiedQuote ? '✓ कॉपी हुआ!' : 'WhatsApp कोटेशन भेजें'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleTriggerDirective(`तारा, ${ratesMap[calcService].title} के ${calcUnits} ${ratesMap[calcService].label} के लिए ₹${grandTotal.toLocaleString('en-IN')} का कोटेशन मौखिक रूप से समझाइए।`)}
                  className="px-3 py-2 rounded-xl bg-cyan-950 hover:bg-cyan-900 border border-cyan-400/40 text-cyan-200 font-bold font-mono text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                  title="तारा से बुलवाएं"
                >
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  <span>तारा से बोलें</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 4: RAW MATERIAL & STEEL MARKET INDEX */}
        {/* ============================================================== */}
        {activeTab === 'rates' && (
          <div className="space-y-3 animate-in fade-in duration-200">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">
                वर्तमान बाजार स्टील दरें (Live Patna Mandi Index) • अपडेटेड: <strong className="text-cyan-300">आज 10:00 AM</strong>
              </span>
              <button
                type="button"
                onClick={() => handleTriggerDirective('तारा, आज के स्टील, टाटा सरिया और आर्गन गैस की दरों का विश्लेषण बताओ।')}
                className="text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1 hover:underline cursor-pointer"
              >
                <Sparkles className="w-3 h-3" />
                स्टील एनालिसिस ↗
              </button>
            </div>

            <div className="overflow-x-auto rounded-xl border border-cyan-500/25 bg-[#061224]">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="bg-black/50 text-cyan-400 border-b border-cyan-500/20">
                    <th className="p-3">सामग्री (Material)</th>
                    <th className="p-3">ग्रेड / स्पेसिफिकेशन</th>
                    <th className="p-3">वर्तमान दर (Rate)</th>
                    <th className="p-3">ट्रेंड</th>
                    <th className="p-3">उपलब्ध स्टॉक</th>
                    <th className="p-3 text-right">कार्रवाई</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cyan-500/10 text-slate-300">
                  {STEEL_MARKET_RATES.map((item, idx) => (
                    <tr key={idx} className="hover:bg-cyan-500/5 transition-colors">
                      <td className="p-3 font-bold text-white">{item.name}</td>
                      <td className="p-3 text-slate-400">{item.grade}</td>
                      <td className="p-3 font-bold text-cyan-300">{item.price}</td>
                      <td className="p-3">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${item.isUp ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'}`}>
                          {item.trend}
                        </span>
                      </td>
                      <td className="p-3 font-semibold text-emerald-400">{item.stock}</td>
                      <td className="p-3 text-right">
                        <button
                          type="button"
                          onClick={() => handleTriggerDirective(`तारा, ${item.name} का स्टॉक और री-ऑर्डर स्थिति क्या है?`)}
                          className="px-2 py-1 rounded bg-cyan-950 hover:bg-cyan-900 border border-cyan-400/30 text-cyan-200 text-[10px] font-bold cursor-pointer"
                        >
                          स्टॉक जांच ↗
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 5: TARA EXECUTIVE QUICK DIRECTIVES */}
        {/* ============================================================== */}
        {activeTab === 'directives' && (
          <div className="space-y-3 animate-in fade-in duration-200">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">
                1-क्लिक एग्जीक्यूटिव कमांड्स • तारा तुरंत मौखिक एवं लिखित जवाब देगी
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {[
                { title: 'दैनिक कार्यशाला ब्रीफिंग', prompt: 'तारा, आज की कार्यशाला की पूरी स्थिति, उत्पादन और श्रमिकों की उपस्थिति का विवरण दो।', icon: Zap, color: 'text-amber-400' },
                { title: 'राजेश शर्मा प्रोजेक्ट अपडेट', prompt: 'तारा, राजेश शर्मा जी के इंडस्ट्रियल शेड का करंट स्टेटस और डिलीवरी टाइमलाइन बताओ।', icon: Building, color: 'text-cyan-400' },
                { title: 'स्टील इन्वेंट्री व स्टॉक ऑडिट', prompt: 'तारा, कार्यशाला में वर्तमान स्टील स्टॉक, प्लेट्स और आर्गन गैस का ऑडिट रिपोर्ट दो।', icon: Layers, color: 'text-emerald-400' },
                { title: 'नवीनतम हॉट लीड्स व कोटेशन', prompt: 'तारा, आज की सभी नई WhatsApp लीड्स और लंबित कोटेशनों की सूची दो।', icon: MessageSquare, color: 'text-pink-400' },
                { title: 'गुणवत्ता व वेल्डिंग सुरक्षा चेक', prompt: 'तारा, सभी वेल्डिंग जोड़ों और सुरक्षा मानकों का कम्प्लायंस स्टेटस रिपोर्ट करो।', icon: ShieldCheck, color: 'text-purple-400' },
                { title: 'ग्राहक फोन कॉल शेड्यूल', prompt: 'तारा, आज जिन ग्राहकों से बात करनी है या साइट विजिट है, उनका शेड्यूल बताओ।', icon: PhoneCall, color: 'text-sky-400' }
              ].map((cmd, idx) => {
                const CmdIcon = cmd.icon;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleTriggerDirective(cmd.prompt)}
                    className="p-3 rounded-xl bg-[#061224] hover:bg-[#0a1e3b] border border-cyan-500/25 hover:border-cyan-400/50 text-left transition-all shadow-md group cursor-pointer flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-lg bg-black/40 border border-white/5">
                        <CmdIcon className={`w-4 h-4 ${cmd.color}`} />
                      </div>
                      <span className="text-xs font-heading font-bold text-white group-hover:text-cyan-300 transition-colors">
                        {cmd.title}
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition-transform group-hover:translate-x-1" />
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
