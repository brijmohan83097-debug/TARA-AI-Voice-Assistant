/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Calculator,
  X,
  Sparkles,
  Building2,
  Hammer,
  ShieldCheck,
  Check,
  Copy,
  Share2,
  Phone,
  MessageSquare,
  ArrowRight,
  TrendingUp,
  Sliders,
  DollarSign
} from 'lucide-react';
import { audioSynth } from '../utils/audio';

export interface CalculationPreset {
  id: string;
  name: string;
  category: 'budget' | 'savings' | 'event' | 'project' | 'shopping' | 'general';
  unit: string;
  defaultQty: number;
  ratePerUnit: number;
  rateRange: string;
  description: string;
}

export const FABRICATION_PRESETS: CalculationPreset[] = [
  {
    id: 'budget-monthly',
    name: 'दैनिक व मासिक बजट (Daily & Monthly Budget)',
    category: 'budget',
    unit: 'दिन (Days)',
    defaultQty: 30,
    ratePerUnit: 500,
    rateRange: '₹300 - ₹800 / दिन',
    description: 'भोजन, यात्रा, बिजली बिल, रिचार्ज व आवश्यक दैनिक खर्च का सटीक योग',
  },
  {
    id: 'savings-goal',
    name: 'बचत व निवेश लक्ष्य (Savings & Emergency Fund)',
    category: 'savings',
    unit: 'सप्ताह (Weeks)',
    defaultQty: 12,
    ratePerUnit: 1500,
    rateRange: '₹1,000 - ₹2,500 / सप्ताह',
    description: 'आगामी लक्ष्य व आपातकालीन फंड के लिए अनुशंसित साप्ताहिक बचत',
  },
  {
    id: 'event-party',
    name: 'पार्टी, दावत व समारोह (Event / Party Budget)',
    category: 'event',
    unit: 'अतिथि (Guests)',
    defaultQty: 50,
    ratePerUnit: 350,
    rateRange: '₹250 - ₹500 / प्लेट',
    description: 'स्वादिष्ट व्यंजन, सजावट, पेय पदार्थ व उपहारों का संपूर्ण अनुमान',
  },
  {
    id: 'project-freelance',
    name: 'प्रोजेक्ट व कार्य समय (Project & Work Estimation)',
    category: 'project',
    unit: 'घंटे (Hours)',
    defaultQty: 40,
    ratePerUnit: 600,
    rateRange: '₹400 - ₹1,000 / घंटा',
    description: 'डिज़ाइन, विकास, रिसर्च व टेस्टिंग कार्यों की पारदर्शी लागत',
  },
  {
    id: 'shopping-general',
    name: 'शॉपिंग व आवश्यक वस्तुएं (Shopping & Purchases)',
    category: 'shopping',
    unit: 'आइटम (Items)',
    defaultQty: 15,
    ratePerUnit: 250,
    rateRange: '₹100 - ₹500 / आइटम',
    description: 'किराना, स्टेशनरी, गैजेट्स व दैनिक आवश्यक वस्तुओं का कुल बिल',
  },
];

interface SciFiCalculationCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenFullRateList?: () => void;
  initialService?: string;
  initialQuantity?: number;
}

export const SciFiCalculationCardModal: React.FC<SciFiCalculationCardModalProps> = ({
  isOpen,
  onClose,
  onOpenFullRateList,
  initialService = 'budget-monthly',
  initialQuantity,
}) => {
  const [selectedServiceId, setSelectedServiceId] = useState<string>(initialService);
  const [quantity, setQuantity] = useState<number>(initialQuantity || 30);
  const [copied, setCopied] = useState<boolean>(false);
  const [length, setLength] = useState<number>(10);
  const [width, setWidth] = useState<number>(10);
  const [useDimensionInputs, setUseDimensionInputs] = useState<boolean>(false);

  // Sync initial parameters when opened
  useEffect(() => {
    if (initialService) {
      setSelectedServiceId(initialService);
    }
    if (initialQuantity && initialQuantity > 0) {
      setQuantity(initialQuantity);
      setUseDimensionInputs(false);
    }
  }, [initialService, initialQuantity, isOpen]);

  if (!isOpen) return null;

  const currentPreset =
    FABRICATION_PRESETS.find((p) => p.id === selectedServiceId) || FABRICATION_PRESETS[0];

  const effectiveQuantity = quantity;

  const estimatedTotal = effectiveQuantity * currentPreset.ratePerUnit;
  const materialCost = Math.round(estimatedTotal * 0.60);
  const laborWeldingCost = Math.round(estimatedTotal * 0.25);
  const transportFinishCost = estimatedTotal - materialCost - laborWeldingCost;

  const handleCopyQuote = () => {
    audioSynth.playSciFiClick();
    const text = `📊 *तारा • स्मार्ट कैलकुलेटर व हिसाब*\nमद: ${currentPreset.name}\nमात्रा: ${effectiveQuantity} ${currentPreset.unit}\nदर: ₹${currentPreset.ratePerUnit}/${currentPreset.unit} (${currentPreset.rateRange})\nअनुमानित कुल हिसाब: ₹${estimatedTotal.toLocaleString('en-IN')}\n\nविवरण: ${currentPreset.description}`;
    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleWhatsAppShare = () => {
    audioSynth.playSciFiClick();
    const text = encodeURIComponent(
      `नमस्ते! तारा स्मार्ट हिसाब से विवरण:\n• मद: ${currentPreset.name}\n• मात्रा: ${effectiveQuantity} ${currentPreset.unit}\n• कुल हिसाब: ₹${estimatedTotal.toLocaleString('en-IN')}\n• दर: ₹${currentPreset.ratePerUnit}/${currentPreset.unit}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl bg-[#040a18] border-2 border-cyan-400/70 rounded-2xl shadow-[0_0_60px_rgba(0,240,255,0.35)] overflow-hidden flex flex-col max-h-[92vh]"
        style={{
          backgroundImage:
            'radial-gradient(ellipse at 50% 0%, rgba(0, 240, 255, 0.18) 0%, transparent 70%)',
        }}
      >
        {/* Sci-Fi Header */}
        <div className="px-4 py-3 bg-[#020612]/95 border-b border-cyan-500/30 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-600 via-sky-500 to-emerald-400 flex items-center justify-center text-white shadow-[0_0_15px_rgba(0,240,255,0.5)]">
              <Calculator className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-heading font-black text-xs sm:text-sm text-cyan-200 tracking-wider">
                  TARA SMART CALCULATION & BUDGET CARD
                </span>
                <span className="px-1.5 py-0.2 rounded bg-cyan-950 border border-cyan-400/40 text-[9px] font-mono text-cyan-300 font-bold uppercase">
                  LIVE ESTIMATOR
                </span>
              </div>
              <p className="text-[9px] font-mono text-slate-400">
                तारा • दैनिक बजट, हिसाब-किताब व त्वरित गणितीय गणना
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              audioSynth.playSciFiClick();
              onClose();
            }}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-700/80 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
            title="बंद करें (Close)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Card Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-slate-200 flex-1 custom-scrollbar">
          {/* Service Selector Chips */}
          <div>
            <label className="text-[10px] font-mono uppercase text-cyan-400 font-bold tracking-wider mb-2 block">
              1. कार्य / सेवा का चयन करें (Select Fabrication Item):
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {FABRICATION_PRESETS.map((preset) => {
                const isSelected = preset.id === selectedServiceId;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => {
                      audioSynth.playSciFiClick();
                      setSelectedServiceId(preset.id);
                      setQuantity(preset.defaultQty);
                    }}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-cyan-950/80 border-cyan-400 text-white shadow-[0_0_15px_rgba(0,240,255,0.25)]'
                        : 'bg-[#030914] border-cyan-500/20 text-slate-300 hover:border-cyan-500/40 hover:bg-[#071328]'
                    }`}
                  >
                    <span className="text-xs font-heading font-black truncate">{preset.name}</span>
                    <span className="text-[10px] font-mono text-cyan-300 mt-1 font-bold">
                      {preset.rateRange}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quantity / Budget Units Input Section */}
          <div className="p-3.5 rounded-xl bg-gradient-to-r from-[#061125] to-[#040a18] border border-cyan-400/30">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono text-cyan-300 font-bold flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                2. मात्रा या अवधि दर्ज करें ({currentPreset.unit}):
              </span>
            </div>

            <div>
              <label className="text-[10px] font-mono text-slate-400 block mb-1">
                कुल संख्या / अवधि ({currentPreset.unit}):
              </label>
              <div className="flex flex-wrap items-center gap-3">
                <input
                  type="number"
                  min="1"
                  max="10000"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                  className="w-36 bg-[#030914] border border-cyan-500/40 rounded-lg px-3 py-1.5 text-sm text-white font-mono focus:outline-none focus:border-cyan-300"
                />
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                  {[7, 15, 30, 60, 100].map((presetVal) => (
                    <button
                      key={presetVal}
                      type="button"
                      onClick={() => {
                        audioSynth.playSciFiClick();
                        setQuantity(presetVal);
                      }}
                      className="px-2 py-1 rounded bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/30 text-[10px] font-mono text-cyan-300 cursor-pointer"
                    >
                      {presetVal} {currentPreset.unit}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Live Calculated Quotation Hero Display */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-cyan-950/80 via-[#030c1f] to-emerald-950/80 border-2 border-cyan-400/60 shadow-[0_0_30px_rgba(0,240,255,0.25)] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wider block">
                ✓ TOTAL ESTIMATED QUOTATION (कुल अनुमानित लागत)
              </span>
              <div className="text-2xl sm:text-3xl font-heading font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-200 to-emerald-300 mt-1">
                ₹{estimatedTotal.toLocaleString('en-IN')}
              </div>
              <p className="text-[11px] font-mono text-slate-300 mt-0.5">
                {effectiveQuantity} {currentPreset.unit} × ₹{currentPreset.ratePerUnit}/{currentPreset.unit}
              </p>
            </div>

            {/* Cost Breakdown Chips */}
            <div className="grid grid-cols-3 gap-2 w-full sm:w-auto">
              <div className="p-2 rounded-lg bg-black/50 border border-cyan-500/30 text-center">
                <span className="text-[9px] font-mono text-slate-400 block">प्राथमिक मद (60%)</span>
                <span className="text-xs font-mono font-bold text-cyan-200">
                  ₹{materialCost.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="p-2 rounded-lg bg-black/50 border border-emerald-500/30 text-center">
                <span className="text-[9px] font-mono text-slate-400 block">सेवा व श्रम (25%)</span>
                <span className="text-xs font-mono font-bold text-emerald-300">
                  ₹{laborWeldingCost.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="p-2 rounded-lg bg-black/50 border border-amber-500/30 text-center">
                <span className="text-[9px] font-mono text-slate-400 block">अन्य आकस्मिक (15%)</span>
                <span className="text-xs font-mono font-bold text-amber-300">
                  ₹{transportFinishCost.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>

          {/* Specification Note */}
          <div className="p-2.5 rounded-lg bg-[#020713] border border-cyan-500/20 text-[11px] font-mono text-slate-400 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>
              <strong className="text-cyan-300">विवरण:</strong> {currentPreset.description}
            </span>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-cyan-500/20">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleWhatsAppShare}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold flex items-center gap-1.5 transition-all shadow-[0_0_15px_rgba(16,185,129,0.4)] cursor-pointer"
              >
                <MessageSquare className="w-4 h-4" />
                <span>WhatsApp पर शेयर करें</span>
              </button>

              <button
                type="button"
                onClick={handleCopyQuote}
                className="px-3.5 py-2 rounded-xl bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-200 font-mono text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'कॉपी हो गया ✓' : 'हिसाब कॉपी करें'}</span>
              </button>
            </div>

            {onOpenFullRateList && (
              <button
                type="button"
                onClick={() => {
                  audioSynth.playSciFiClick();
                  onClose();
                  onOpenFullRateList();
                }}
                className="text-xs font-mono text-cyan-300 hover:text-white underline flex items-center gap-1 cursor-pointer"
              >
                <span>विस्तृत दर तालिका देखें</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
