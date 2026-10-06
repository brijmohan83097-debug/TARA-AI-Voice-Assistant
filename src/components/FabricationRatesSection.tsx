/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Building2, 
  ShieldCheck, 
  DoorClosed, 
  Grid, 
  Layers, 
  Hammer, 
  Calculator, 
  Edit3, 
  Plus, 
  RotateCcw, 
  Check, 
  Copy, 
  Share2, 
  Sparkles, 
  Phone, 
  MessageSquare, 
  Search, 
  ChevronRight, 
  Info, 
  CheckCircle2, 
  X,
  ArrowRight
} from 'lucide-react';
import { FabricationRatesConfig, FabricationServiceItem } from '../types';
import { 
  INITIAL_FABRICATION_CONFIG, 
  loadFabricationConfig, 
  saveFabricationConfig, 
  formatRateDisplay 
} from '../data/fabricationData';

interface FabricationRatesSectionProps {
  onAskTara?: (query: string) => void;
  onOpenLeadResponder?: () => void;
  className?: string;
}

export const FabricationRatesSection: React.FC<FabricationRatesSectionProps> = ({
  onAskTara,
  onOpenLeadResponder,
  className = '',
}) => {
  const [config, setConfig] = useState<FabricationRatesConfig>(loadFabricationConfig);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedQuote, setCopiedQuote] = useState<boolean>(false);

  // Calculator State
  const [calcServiceId, setCalcServiceId] = useState<string>('shed-standard');
  const [calcLength, setCalcLength] = useState<number>(40);
  const [calcWidth, setCalcWidth] = useState<number>(25);
  const [calcDirectQty, setCalcDirectQty] = useState<number>(1000);
  const [useDimensions, setUseDimensions] = useState<boolean>(true);

  // Edit Service Modal State
  const [editingItem, setEditingItem] = useState<FabricationServiceItem | null>(null);
  const [isAddMode, setIsAddMode] = useState<boolean>(false);

  // Notification Banner
  const [notification, setNotification] = useState<string | null>(null);

  // Save config wrapper
  const updateConfig = (newConfig: FabricationRatesConfig) => {
    setConfig(newConfig);
    saveFabricationConfig(newConfig);
    // Sync with backend API
    fetch('/api/fabrication/rates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newConfig),
    }).catch((err) => console.warn('Backend rates sync error:', err));
  };

  // Reset to default presets
  const handleResetToPresets = () => {
    if (window.confirm('क्या आप सभी रेट्स को मोहन विश्वास फैब्रिकेशन के डिफ़ॉल्ट प्रीसेट पर रीसेट करना चाहते हैं?')) {
      const resetConf = {
        ...INITIAL_FABRICATION_CONFIG,
        lastModified: new Date().toISOString(),
      };
      updateConfig(resetConf);
      showNotification('रेट्स डिफ़ॉल्ट प्रीसेट पर रीसेट हो गए हैं।');
    }
  };

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  // Selected Service for Calculator
  const calcService = useMemo(() => {
    return config.services.find((s) => s.id === calcServiceId) || config.services[0];
  }, [config.services, calcServiceId]);

  // Compute calculated quantity & total cost
  const { totalQuantity, totalCostMin, totalCostMax } = useMemo(() => {
    if (!calcService) {
      return { totalQuantity: 0, totalCostMin: 0, totalCostMax: 0 };
    }

    let qty = calcDirectQty;
    if (calcService.unit === 'sq ft' && useDimensions) {
      qty = (calcLength || 0) * (calcWidth || 0);
    }

    const minCost = qty * calcService.rateMin;
    const maxCost = qty * (calcService.rateMax || calcService.rateMin);

    return {
      totalQuantity: qty,
      totalCostMin: minCost,
      totalCostMax: maxCost,
    };
  }, [calcService, calcDirectQty, calcLength, calcWidth, useDimensions]);

  // Filtered Services List
  const filteredServices = useMemo(() => {
    return config.services.filter((item) => {
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      const text = (item.name + ' ' + item.nameHi + ' ' + item.description + ' ' + item.material).toLowerCase();
      const matchesSearch = !searchQuery || text.includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [config.services, selectedCategory, searchQuery]);

  // Copy Quotation Summary
  const handleCopyEstimate = () => {
    if (!calcService) return;

    const rateStr = formatRateDisplay(calcService);
    const costRange = totalCostMin === totalCostMax
      ? `₹${totalCostMin.toLocaleString('en-IN')}`
      : `₹${totalCostMin.toLocaleString('en-IN')} से ₹${totalCostMax.toLocaleString('en-IN')}`;

    const text = `*${config.businessName}* (मोहन विश्वास फैब्रिकेशन)
----------------------------------------
📋 *कार्य का विवरण:* ${calcService.nameHi} (${calcService.name})
📐 *कुल मात्रा / माप:* ${totalQuantity.toLocaleString('en-IN')} ${calcService.unit}
💰 *लागू दर (Rate):* ${rateStr}
🏷️ *अनुमानित कुल लागत:* ${costRange}
🛠️ *प्रयुक्त सामग्री:* ${calcService.material}
🛡️ *वारंटी:* ${calcService.warranty || 'गुणवत्ता एवं मजबूती की गारंटी'}
----------------------------------------
📞 संपर्क व बुकिंग: ${config.phone}
📍 पता: ${config.address}, ${config.city}
"उच्च गुणवत्ता, प्रमाणित स्टील व समय पर डिलीवरी"`;

    navigator.clipboard.writeText(text);
    setCopiedQuote(true);
    showNotification('कोटेशन क्लिपबोर्ड पर कॉपी हो गया!');
    setTimeout(() => setCopiedQuote(false), 2500);
  };

  // Open in WhatsApp
  const handleShareWhatsApp = () => {
    if (!calcService) return;

    const rateStr = formatRateDisplay(calcService);
    const costRange = totalCostMin === totalCostMax
      ? `₹${totalCostMin.toLocaleString('en-IN')}`
      : `₹${totalCostMin.toLocaleString('en-IN')} से ₹${totalCostMax.toLocaleString('en-IN')}`;

    const message = encodeURIComponent(`नमस्ते Mohan Vishwas Fabrication! मुझे निम्नलिखित कार्य का कोटेशन चाहिए:
- कार्य: ${calcService.nameHi}
- साइज/मात्रा: ${totalQuantity.toLocaleString('en-IN')} ${calcService.unit}
- अनुमानित दर: ${rateStr}
- संभावित बजट: ${costRange}
कृपया साइट विजिट और फाइनल कोटेशन की जानकारी दें।`);

    window.open(`https://wa.me/?text=${message}`, '_blank');
  };

  // Ask TARA about current estimate
  const handleAskTaraAboutEstimate = () => {
    if (!calcService || !onAskTara) return;
    const prompt = `${calcService.nameHi} का रेट क्या है? मुझे ${totalQuantity} ${calcService.unit} का अनुमानित खर्च और कोटेशन बताओ।`;
    onAskTara(prompt);
  };

  // Save edited or newly added service
  const handleSaveEditItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    let updatedList = [...config.services];
    if (isAddMode) {
      const newItem: FabricationServiceItem = {
        ...editingItem,
        id: `custom-${Date.now()}`,
        lastUpdated: new Date().toISOString().split('T')[0],
      };
      updatedList.push(newItem);
    } else {
      updatedList = updatedList.map((s) => (s.id === editingItem.id ? { ...editingItem, lastUpdated: new Date().toISOString().split('T')[0] } : s));
    }

    const updatedConfig = {
      ...config,
      services: updatedList,
      lastModified: new Date().toISOString(),
    };

    updateConfig(updatedConfig);
    setEditingItem(null);
    setIsAddMode(false);
    showNotification(isAddMode ? 'नया फैब्रिकेशन कार्य सफलतापूर्वक जोड़ा गया!' : 'रेट व सेवा सफलतापूर्वक अपडेट हो गई!');
  };

  // Delete service
  const handleDeleteService = (id: string) => {
    if (window.confirm('क्या आप इस सेवा को सूची से हटाना चाहते हैं?')) {
      const updatedList = config.services.filter((s) => s.id !== id);
      const updatedConfig = {
        ...config,
        services: updatedList,
        lastModified: new Date().toISOString(),
      };
      updateConfig(updatedConfig);
      showNotification('सेवा हटा दी गई है।');
    }
  };

  // Category Icon Resolver
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'shed':
        return <Building2 className="w-5 h-5 text-cyan-400" />;
      case 'railing':
        return <ShieldCheck className="w-5 h-5 text-amber-400" />;
      case 'gate':
        return <DoorClosed className="w-5 h-5 text-emerald-400" />;
      case 'grill':
        return <Grid className="w-5 h-5 text-indigo-400" />;
      case 'shutter':
        return <Layers className="w-5 h-5 text-purple-400" />;
      default:
        return <Hammer className="w-5 h-5 text-sky-400" />;
    }
  };

  return (
    <div className={`w-full flex flex-col gap-4 font-sans ${className}`}>
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-xl bg-cyan-950 border border-cyan-400 text-cyan-200 text-xs font-mono shadow-[0_0_20px_rgba(0,240,255,0.4)] flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-cyan-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* 1. Header Banner & Business Identity Card */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-[#0c182c] via-[#091424] to-[#0d1f36] border border-cyan-500/30 shadow-[0_8px_30px_rgba(0,0,0,0.5)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-cyan-950/80 border border-cyan-400/50 flex items-center justify-center text-cyan-300 shadow-[0_0_15px_rgba(0,240,255,0.3)] shrink-0">
            <Hammer className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base sm:text-lg font-heading font-bold text-white tracking-wide">
                {config.businessName}
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-400/40 text-cyan-300">
                {config.businessNameHi}
              </span>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/40 text-emerald-400">
                ACTIVE PRESETS
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              {config.tagline} • प्रोपराइटर: <span className="text-cyan-300 font-semibold">{config.ownerName}</span>
            </p>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end flex-wrap">
          <button
            type="button"
            onClick={() => {
              setIsAddMode(true);
              setEditingItem({
                id: '',
                name: '',
                nameHi: '',
                category: 'shed',
                unit: 'sq ft',
                rateMin: 200,
                rateMax: 250,
                description: '',
                material: 'टाटा / जिंदल स्टील',
                warranty: '5 वर्ष वारंटी',
                isActive: true,
                popular: false,
              });
            }}
            className="px-3 py-1.5 rounded-xl bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>नया काम जोड़ें</span>
          </button>

          {onOpenLeadResponder && (
            <button
              type="button"
              onClick={onOpenLeadResponder}
              className="px-3 py-1.5 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/50 text-emerald-300 text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-[0_0_10px_rgba(16,185,129,0.2)] cursor-pointer"
              title="Open Automated WhatsApp Lead Responder"
            >
              <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
              <span>व्हाट्सएप लीड्स</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleResetToPresets}
            className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-400 hover:text-slate-200 text-xs font-mono flex items-center gap-1 transition-colors cursor-pointer"
            title="Reset rates to initial Mohan Vishwas Fabrication presets"
          >
            <RotateCcw className="w-3 h-3" />
            <span className="hidden sm:inline">रीसेट</span>
          </button>
        </div>
      </div>

      {/* 2. TARA Quick Voice Inquiries Bar */}
      <div className="p-3 rounded-xl bg-[#091222]/90 border border-cyan-500/25 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2 text-xs text-cyan-300 font-mono">
          <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse shrink-0" />
          <span>TARA से तुरंत रेट्स पूछें (Instant Voice Inquiry):</span>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          {[
            { label: 'शेड्स का रेट?', q: 'शेड्स निर्माण का क्या रेट है?' },
            { label: 'स्टील रेलिंग ₹450', q: 'स्टील रेलिंग का रेट और कोटेशन बताओ' },
            { label: '1000 sq ft शेड?', q: 'मोहन विश्वास फैब्रिकेशन में 1000 sq ft शेड का खर्च कितना होगा?' },
            { label: 'गेट्स व ग्रिल्स', q: 'मेन गेट और विंडो ग्रिल के रेट्स क्या हैं?' },
          ].map((chip, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onAskTara && onAskTara(chip.q)}
              className="px-2.5 py-1 rounded-lg bg-cyan-950/60 hover:bg-cyan-900 border border-cyan-500/30 text-cyan-300 text-[11px] font-mono transition-all hover:scale-105 cursor-pointer"
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          {[
            { id: 'all', label: 'सभी रेट्स (All)' },
            { id: 'shed', label: 'शेड्स (₹180-₹220/sq ft)' },
            { id: 'railing', label: 'स्टील रेलिंग (₹450/ft)' },
            { id: 'gate', label: 'गेट्स (Gates)' },
            { id: 'grill', label: 'ग्रिल्स (Grills)' },
            { id: 'shutter', label: 'शटर (Shutters)' },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-cyan-950 border border-cyan-400 text-cyan-300 font-bold shadow-[0_0_10px_rgba(0,240,255,0.25)]'
                  : 'bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[200px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="खोजें (शेड, रेलिंग, गेट...)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-700 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-hidden focus:border-cyan-400"
          />
        </div>
      </div>

      {/* 4. Rates Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {filteredServices.map((item) => (
          <div
            key={item.id}
            className={`p-4 rounded-2xl bg-[#0b1322] border transition-all duration-300 flex flex-col justify-between hover:border-cyan-400/60 hover:shadow-[0_4px_25px_rgba(0,240,255,0.15)] ${
              calcServiceId === item.id ? 'border-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.2)]' : 'border-cyan-500/20'
            }`}
          >
            <div>
              {/* Top Row: Icon + Category Badge + Rate Tag */}
              <div className="flex items-start justify-between gap-2 mb-2.5">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-slate-900 border border-slate-700 shrink-0">
                    {getCategoryIcon(item.category)}
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-sm text-white leading-snug">
                      {item.nameHi}
                    </h3>
                    <p className="text-[11px] text-slate-400 font-mono">
                      {item.name}
                    </p>
                  </div>
                </div>

                {/* Edit Button */}
                <button
                  type="button"
                  onClick={() => {
                    setIsAddMode(false);
                    setEditingItem(item);
                  }}
                  className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-400 hover:text-cyan-300 transition-colors cursor-pointer"
                  title="Edit Rate & Details"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Rate Highlight Banner */}
              <div className="my-2 p-2.5 rounded-xl bg-gradient-to-r from-cyan-950/70 to-slate-900 border border-cyan-500/30 flex items-center justify-between">
                <span className="text-[10px] font-mono text-cyan-300 uppercase tracking-wider">
                  लागू दर (PRESET RATE)
                </span>
                <span className="text-sm font-mono font-bold text-amber-300">
                  {formatRateDisplay(item)}
                </span>
              </div>

              {/* Description & Materials */}
              <p className="text-xs text-slate-300 leading-relaxed mb-2 line-clamp-2">
                {item.description}
              </p>

              <div className="space-y-1 text-[11px] font-sans border-t border-slate-800/80 pt-2 mb-3">
                <div className="flex items-start gap-1.5 text-slate-300">
                  <span className="font-semibold text-cyan-400 shrink-0">सामग्री:</span>
                  <span className="text-slate-300 line-clamp-1">{item.material}</span>
                </div>
                {item.warranty && (
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <span className="font-semibold text-emerald-400 shrink-0">वारंटी:</span>
                    <span>{item.warranty}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Actions: Calculate + Ask TARA */}
            <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setCalcServiceId(item.id);
                  // Scroll to calculator
                  const el = document.getElementById('fabrication-calculator');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className={`flex-1 py-1.5 rounded-xl text-xs font-mono font-semibold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                  calcServiceId === item.id
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'bg-slate-900 hover:bg-cyan-950 border border-cyan-500/30 text-cyan-300'
                }`}
              >
                <Calculator className="w-3.5 h-3.5" />
                <span>लागत निकालें</span>
              </button>

              <button
                type="button"
                onClick={() => onAskTara && onAskTara(`${item.nameHi} का क्या रेट है और इसमें क्या-क्या शामिल है?`)}
                className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white text-xs font-mono flex items-center gap-1 cursor-pointer transition-colors"
                title="TARA से इस काम की जानकारी पूछें"
              >
                <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
                <span>पूछें</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 5. Live Instant Estimation Calculator (लागत व कोटेशन कैलकुलेटर) */}
      <div 
        id="fabrication-calculator"
        className="p-4 sm:p-5 rounded-2xl bg-[#091222] border border-cyan-500/30 shadow-[0_8px_32px_rgba(0,0,0,0.6)] flex flex-col gap-4 mt-2"
      >
        <div className="flex items-center justify-between pb-3 border-b border-cyan-500/20 flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-950 border border-cyan-400/50 text-cyan-300">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-sm sm:text-base text-white">
                त्वरित फैब्रिकेशन लागत कैलकुलेटर (Instant Cost Estimator)
              </h3>
              <p className="text-xs text-slate-400">
                माप दर्ज करें और तुरंत मोहन विश्वास फैब्रिकेशन का अनुमानित कोटेशन प्राप्त करें
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-cyan-300">
              चयनित सेवा: <strong className="text-white">{calcService?.nameHi}</strong>
            </span>
          </div>
        </div>

        {/* Calculator Form Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Service Selector Dropdown */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-mono text-slate-300">कार्य का प्रकार चुनें (Service):</label>
            <select
              value={calcServiceId}
              onChange={(e) => setCalcServiceId(e.target.value)}
              className="w-full p-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-hidden focus:border-cyan-400 cursor-pointer"
            >
              {config.services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nameHi} — {formatRateDisplay(s)}
                </option>
              ))}
            </select>
            <p className="text-[10px] text-slate-400 font-mono">
              इकाई (Unit): {calcService?.unit} • बेस रेट: ₹{calcService?.rateMin}
            </p>
          </div>

          {/* Dimension / Quantity Inputs */}
          {calcService?.unit === 'sq ft' ? (
            <div className="flex flex-col gap-1.5 md:col-span-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-mono text-slate-300">माप दर्ज करें (Dimensions):</label>
                <div className="flex items-center gap-2 text-[11px] font-mono">
                  <button
                    type="button"
                    onClick={() => setUseDimensions(true)}
                    className={`px-2 py-0.5 rounded cursor-pointer ${useDimensions ? 'bg-cyan-950 text-cyan-300 font-bold border border-cyan-500/40' : 'text-slate-400'}`}
                  >
                    लंबाई × चौड़ाई
                  </button>
                  <button
                    type="button"
                    onClick={() => setUseDimensions(false)}
                    className={`px-2 py-0.5 rounded cursor-pointer ${!useDimensions ? 'bg-cyan-950 text-cyan-300 font-bold border border-cyan-500/40' : 'text-slate-400'}`}
                  >
                    सीधा Sq Ft
                  </button>
                </div>
              </div>

              {useDimensions ? (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[11px] text-slate-400 font-mono">लंबाई (Length in Feet):</span>
                    <input
                      type="number"
                      min="1"
                      value={calcLength}
                      onChange={(e) => setCalcLength(Number(e.target.value) || 0)}
                      className="w-full mt-1 p-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 font-mono focus:outline-hidden focus:border-cyan-400"
                    />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 font-mono">चौड़ाई (Width in Feet):</span>
                    <input
                      type="number"
                      min="1"
                      value={calcWidth}
                      onChange={(e) => setCalcWidth(Number(e.target.value) || 0)}
                      className="w-full mt-1 p-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 font-mono focus:outline-hidden focus:border-cyan-400"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <span className="text-[11px] text-slate-400 font-mono">कुल क्षेत्रफल (Total Sq Ft):</span>
                  <input
                    type="number"
                    min="1"
                    value={calcDirectQty}
                    onChange={(e) => setCalcDirectQty(Number(e.target.value) || 0)}
                    className="w-full mt-1 p-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 font-mono focus:outline-hidden focus:border-cyan-400"
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label className="text-xs font-mono text-slate-300">
                कुल मात्रा दर्ज करें ({calcService?.unit}):
              </label>
              <input
                type="number"
                min="1"
                value={calcDirectQty}
                onChange={(e) => setCalcDirectQty(Number(e.target.value) || 0)}
                className="w-full p-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 font-mono focus:outline-hidden focus:border-cyan-400"
              />
              <p className="text-[10px] text-slate-400 font-mono">
                जैसे स्टील रेलिंग के लिए कुल रनिंग फुट या सीढ़ियों के लिए स्टेप्स संख्या
              </p>
            </div>
          )}
        </div>

        {/* Calculation Result Showcase Box */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-cyan-950/40 via-[#0d1c31] to-slate-900 border border-cyan-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-cyan-300 uppercase">
                अनुमानित लागत रेंज (Estimated Cost):
              </span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-cyan-950 border border-cyan-400/40 text-cyan-300">
                {totalQuantity.toLocaleString('en-IN')} {calcService?.unit}
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-heading font-extrabold text-amber-300 mt-1">
              {totalCostMin === totalCostMax
                ? `₹${totalCostMin.toLocaleString('en-IN')}`
                : `₹${totalCostMin.toLocaleString('en-IN')} — ₹${totalCostMax.toLocaleString('en-IN')}`}
            </div>
            <p className="text-xs text-slate-300 mt-1">
              सामग्री: <span className="text-slate-200 font-medium">{calcService?.material}</span> (इंस्टॉलेशन एवं लेबर सहित)
            </p>
          </div>

          {/* Action Buttons for Result */}
          <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end flex-wrap">
            <button
              type="button"
              onClick={handleCopyEstimate}
              className="px-3.5 py-2 rounded-xl bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer"
            >
              {copiedQuote ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copiedQuote ? 'कॉपी हो गया' : 'कोटेशन कॉपी'}</span>
            </button>

            <button
              type="button"
              onClick={handleShareWhatsApp}
              className="px-3.5 py-2 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300 text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              <span>WhatsApp शेयर</span>
            </button>

            <button
              type="button"
              onClick={handleAskTaraAboutEstimate}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
            >
              <Sparkles className="w-4 h-4" />
              <span>TARA से पूछें</span>
            </button>
          </div>
        </div>
      </div>

      {/* 6. Edit / Add Service Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl bg-[#091222] border border-cyan-400 p-5 shadow-[0_0_40px_rgba(0,240,255,0.3)] flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-cyan-500/20">
              <h3 className="font-heading font-bold text-base text-white flex items-center gap-2">
                <Hammer className="w-4 h-4 text-cyan-400" />
                <span>{isAddMode ? 'नया फैब्रिकेशन कार्य जोड़ें' : 'रेट व विवरण एडिट करें'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditItem} className="flex flex-col gap-3 text-xs font-sans">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-mono text-slate-300">नाम (हिंदी में):</label>
                  <input
                    type="text"
                    required
                    value={editingItem.nameHi}
                    onChange={(e) => setEditingItem({ ...editingItem, nameHi: e.target.value })}
                    className="w-full mt-1 p-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-hidden focus:border-cyan-400"
                    placeholder="उदा. शेड्स निर्माण"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-mono text-slate-300">Name (English):</label>
                  <input
                    type="text"
                    required
                    value={editingItem.name}
                    onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                    className="w-full mt-1 p-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-hidden focus:border-cyan-400"
                    placeholder="e.g. Industrial Sheds"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-mono text-slate-300">कैटेगरी (Category):</label>
                  <select
                    value={editingItem.category}
                    onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value as any })}
                    className="w-full mt-1 p-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-hidden focus:border-cyan-400 cursor-pointer"
                  >
                    <option value="shed">Shed (शेड)</option>
                    <option value="railing">Railing (रेलिंग)</option>
                    <option value="gate">Gate (गेट)</option>
                    <option value="grill">Grill (ग्रिल)</option>
                    <option value="shutter">Shutter (शटर)</option>
                    <option value="stairs">Stairs (सीढ़ियां)</option>
                    <option value="custom">Custom (अन्य)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-mono text-slate-300">न्यूनतम दर (Min Rate ₹):</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={editingItem.rateMin}
                    onChange={(e) => setEditingItem({ ...editingItem, rateMin: Number(e.target.value) || 0 })}
                    className="w-full mt-1 p-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white font-mono focus:outline-hidden focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-mono text-slate-300">अधिकतम दर (Max Rate ₹):</label>
                  <input
                    type="number"
                    min="1"
                    value={editingItem.rateMax || editingItem.rateMin}
                    onChange={(e) => setEditingItem({ ...editingItem, rateMax: Number(e.target.value) || 0 })}
                    className="w-full mt-1 p-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white font-mono focus:outline-hidden focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-mono text-slate-300">माप इकाई (Unit):</label>
                  <input
                    type="text"
                    required
                    value={editingItem.unit}
                    onChange={(e) => setEditingItem({ ...editingItem, unit: e.target.value })}
                    className="w-full mt-1 p-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white font-mono focus:outline-hidden focus:border-cyan-400"
                    placeholder="sq ft, running ft, kg, piece"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-mono text-slate-300">वारंटी (Warranty):</label>
                  <input
                    type="text"
                    value={editingItem.warranty || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, warranty: e.target.value })}
                    className="w-full mt-1 p-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-hidden focus:border-cyan-400"
                    placeholder="उदा. 10 वर्ष वारंटी"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-mono text-slate-300">सामग्री विवरण (Material):</label>
                <input
                  type="text"
                  required
                  value={editingItem.material}
                  onChange={(e) => setEditingItem({ ...editingItem, material: e.target.value })}
                  className="w-full mt-1 p-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-hidden focus:border-cyan-400"
                  placeholder="टाटा / जिंदल शीट, SS-304 स्टेनलेस स्टील"
                />
              </div>

              <div>
                <label className="text-[11px] font-mono text-slate-300">पूर्ण विवरण (Description):</label>
                <textarea
                  rows={2}
                  required
                  value={editingItem.description}
                  onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                  className="w-full mt-1 p-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-hidden focus:border-cyan-400"
                  placeholder="कार्य की विशेषताएं, वेल्डिंग क्वालिटी और इंस्टॉलेशन की शर्तें..."
                />
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                {!isAddMode ? (
                  <button
                    type="button"
                    onClick={() => handleDeleteService(editingItem.id)}
                    className="px-3 py-1.5 rounded-xl bg-rose-950/80 hover:bg-rose-900 border border-rose-500/40 text-rose-300 text-xs font-mono cursor-pointer"
                  >
                    डिलीट करें
                  </button>
                ) : <div />}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingItem(null)}
                    className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-400 text-xs font-mono cursor-pointer"
                  >
                    रद्द करें
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-mono font-bold cursor-pointer"
                  >
                    सेव करें (Save)
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
