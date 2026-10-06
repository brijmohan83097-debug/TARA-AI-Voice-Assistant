/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  MessageSquare,
  Flame,
  Phone,
  Send,
  Copy,
  Check,
  CheckCircle2,
  MapPin,
  Calendar,
  Sparkles,
  ArrowRight,
  ExternalLink,
  Search,
  Filter,
  Plus,
  Trash2,
  Edit2,
  RefreshCw,
  Building2,
  FileText,
  Clock,
  User,
  Shield,
  PhoneCall,
  Download,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { HotLead, LeadStatus, FabricationRatesConfig } from '../types';
import { 
  loadHotLeads, 
  saveHotLeads, 
  generateInstantHindiQuotation,
  INITIAL_HOT_LEADS
} from '../data/leadsData';
import { loadFabricationConfig } from '../data/fabricationData';

interface WhatsAppLeadResponderProps {
  onTriggerTaraChat?: (message: string) => void;
  className?: string;
}

export const WhatsAppLeadResponder: React.FC<WhatsAppLeadResponderProps> = ({
  onTriggerTaraChat,
  className = '',
}) => {
  const [config, setConfig] = useState<FabricationRatesConfig>(loadFabricationConfig);
  const [leads, setLeads] = useState<HotLead[]>(loadHotLeads);
  const [activeSubTab, setActiveSubTab] = useState<'simulator' | 'pipeline' | 'rates'>('simulator');
  
  // Simulator State
  const [customerName, setCustomerName] = useState<string>('अमित कुमार (Amit Kumar)');
  const [customerPhone, setCustomerPhone] = useState<string>('+91 98712 34567');
  const [selectedService, setSelectedService] = useState<'shed' | 'railing' | 'gate' | 'grill' | 'shutter' | 'stairs' | 'custom'>('shed');
  const [quantity, setQuantity] = useState<number>(1000);
  const [customerMessage, setCustomerMessage] = useState<string>(
    'नमस्ते, मुझे 1,000 sq ft छत के लिए शेड का काम करवाना है। क्या रेट पड़ेगा और कितना समय लगेगा?'
  );

  // Generated Response State
  const [generatedText, setGeneratedText] = useState<string>('');
  const [generatedPriceMin, setGeneratedPriceMin] = useState<number>(180000);
  const [generatedPriceMax, setGeneratedPriceMax] = useState<number>(220000);
  const [whatsappUrl, setWhatsappUrl] = useState<string>('');
  const [hasGenerated, setHasGenerated] = useState<boolean>(false);
  const [copiedResponse, setCopiedResponse] = useState<boolean>(false);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  // Pipeline Filter State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedLeadForDetail, setSelectedLeadForDetail] = useState<HotLead | null>(null);
  const [editingAddressLeadId, setEditingAddressLeadId] = useState<string | null>(null);
  const [addressInput, setAddressInput] = useState<string>('');

  // Manual Add Lead Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [newLeadName, setNewLeadName] = useState<string>('');
  const [newLeadPhone, setNewLeadPhone] = useState<string>('+91 ');
  const [newLeadService, setNewLeadService] = useState<'shed' | 'railing' | 'gate' | 'grill' | 'shutter' | 'stairs' | 'custom'>('shed');
  const [newLeadSize, setNewLeadSize] = useState<string>('1000 sq ft');
  const [newLeadAddress, setNewLeadAddress] = useState<string>('');
  const [newLeadNotes, setNewLeadNotes] = useState<string>('');

  // Sync with storage and rates
  useEffect(() => {
    const handleRatesUpdate = (e: any) => {
      if (e.detail) setConfig(e.detail);
    };
    window.addEventListener('fabrication-rates-updated', handleRatesUpdate);
    return () => window.removeEventListener('fabrication-rates-updated', handleRatesUpdate);
  }, []);

  // Update leads when saved
  const updateLeadsList = (newLeads: HotLead[]) => {
    setLeads(newLeads);
    saveHotLeads(newLeads);
  };

  // Generate initial simulation on first load
  useEffect(() => {
    handleGenerateQuotation(false);
  }, []);

  // Quick preset loader
  const handleApplyPreset = (
    name: string,
    phone: string,
    service: 'shed' | 'railing' | 'gate' | 'grill' | 'shutter',
    qty: number,
    query: string
  ) => {
    setCustomerName(name);
    setCustomerPhone(phone);
    setSelectedService(service);
    setQuantity(qty);
    setCustomerMessage(query);
  };

  // Handler to generate quote & save lead
  const handleGenerateQuotation = (saveAsLead: boolean = true) => {
    const result = generateInstantHindiQuotation({
      customerName,
      phoneNumber: customerPhone,
      serviceType: selectedService,
      approxQuantity: quantity,
      config,
    });

    setGeneratedText(result.hindiResponse);
    setGeneratedPriceMin(result.priceMin);
    setGeneratedPriceMax(result.priceMax);
    setWhatsappUrl(result.whatsappUrl);
    setHasGenerated(true);

    if (saveAsLead) {
      const newLead: HotLead = {
        id: `lead-${Date.now()}`,
        customerName: customerName.trim() || 'नया ग्राहक',
        phoneNumber: customerPhone.trim() || '+91 98000 00000',
        serviceType: selectedService,
        serviceName: result.serviceItem.nameHi || result.serviceItem.name,
        approxSize: `${quantity} ${result.unit}`,
        priceRangeMin: result.priceMin,
        priceRangeMax: result.priceMax,
        customerQuery: customerMessage,
        generatedHindiResponse: result.hindiResponse,
        siteAddress: '',
        status: 'hot',
        createdAt: new Date().toISOString(),
        notes: 'व्हाट्सएप ऑटो-रिस्पॉन्डर द्वारा तात्कालिक कोटेशन भेजा गया। पते की पुष्टि प्रतीक्षित।',
        source: 'whatsapp_inquiry',
      };

      const updated = [newLead, ...leads.filter((l) => l.phoneNumber !== newLead.phoneNumber)];
      updateLeadsList(updated);

      // Trigger celebratory confetti
      try {
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#00f0ff', '#10b981', '#f59e0b'],
        });
      } catch (e) {
        // non-blocking
      }

      setSuccessBanner(`🔥 नया हॉट लीड "${customerName}" सुरक्षित कर लिया गया है और त्वरित हिंदी कोटेशन तैयार है!`);
      setTimeout(() => setSuccessBanner(null), 6000);
    }
  };

  // Copy text handler
  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedResponse(true);
    setTimeout(() => setCopiedResponse(false), 2500);
  };

  // Status changer
  const handleStatusChange = (leadId: string, newStatus: LeadStatus) => {
    const updated = leads.map((lead) =>
      lead.id === leadId ? { ...lead, status: newStatus } : lead
    );
    updateLeadsList(updated);
  };

  // Save address update
  const handleSaveAddress = (leadId: string) => {
    const updated = leads.map((lead) =>
      lead.id === leadId ? { ...lead, siteAddress: addressInput.trim() } : lead
    );
    updateLeadsList(updated);
    setEditingAddressLeadId(null);
    setAddressInput('');
  };

  // Delete lead
  const handleDeleteLead = (leadId: string) => {
    if (confirm('क्या आप इस लीड को हटाना चाहते हैं?')) {
      const updated = leads.filter((l) => l.id !== leadId);
      updateLeadsList(updated);
      if (selectedLeadForDetail?.id === leadId) {
        setSelectedLeadForDetail(null);
      }
    }
  };

  // Filtered leads
  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const matchesSearch =
        lead.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.phoneNumber.includes(searchQuery) ||
        lead.serviceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (lead.siteAddress && lead.siteAddress.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus =
        statusFilter === 'all' || lead.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [leads, searchQuery, statusFilter]);

  // Summary Metrics
  const metrics = useMemo(() => {
    const total = leads.length;
    const hotCount = leads.filter((l) => l.status === 'hot').length;
    const siteVisits = leads.filter((l) => l.status === 'site_visit').length;
    const totalValueMin = leads.reduce((acc, l) => acc + (l.priceRangeMin || 0), 0);
    const totalValueMax = leads.reduce((acc, l) => acc + (l.priceRangeMax || 0), 0);
    return { total, hotCount, siteVisits, totalValueMin, totalValueMax };
  }, [leads]);

  // Export to CSV
  const handleExportCsv = () => {
    const headers = ['Lead ID', 'Customer Name', 'Phone', 'Service', 'Size', 'Price Min (INR)', 'Price Max (INR)', 'Status', 'Site Address', 'Date'];
    const rows = leads.map((l) => [
      `"${l.id}"`,
      `"${l.customerName}"`,
      `"${l.phoneNumber}"`,
      `"${l.serviceName}"`,
      `"${l.approxSize || ''}"`,
      l.priceRangeMin,
      l.priceRangeMax,
      `"${l.status}"`,
      `"${l.siteAddress || 'Pending'}"`,
      `"${new Date(l.createdAt).toLocaleDateString()}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Mohan_Vishwas_Hot_Leads_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Reset to initial sample leads
  const handleResetLeads = () => {
    if (confirm('क्या आप डिफ़ॉल्ट हॉट लीड्स डेटा पुनः लोड करना चाहते हैं?')) {
      updateLeadsList(INITIAL_HOT_LEADS);
    }
  };

  // Add manual lead
  const handleAddManualLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLeadName.trim()) return;

    const dummyResult = generateInstantHindiQuotation({
      customerName: newLeadName,
      phoneNumber: newLeadPhone,
      serviceType: newLeadService,
      approxQuantity: 500,
      config,
    });

    const newLead: HotLead = {
      id: `lead-manual-${Date.now()}`,
      customerName: newLeadName.trim(),
      phoneNumber: newLeadPhone.trim(),
      serviceType: newLeadService,
      serviceName: dummyResult.serviceItem.nameHi,
      approxSize: newLeadSize.trim() || '500 sq ft',
      priceRangeMin: dummyResult.priceMin,
      priceRangeMax: dummyResult.priceMax,
      customerQuery: 'डायरेक्ट फोन कॉल / ऑफिस विजिट द्वारा इनक्वायरी',
      generatedHindiResponse: dummyResult.hindiResponse,
      siteAddress: newLeadAddress.trim(),
      status: 'hot',
      createdAt: new Date().toISOString(),
      notes: newLeadNotes.trim() || 'क्लाइंट ने सीधे संपर्क किया।',
      source: 'direct_call',
    };

    updateLeadsList([newLead, ...leads]);
    setIsAddModalOpen(false);
    setNewLeadName('');
    setNewLeadPhone('+91 ');
    setNewLeadAddress('');
    setNewLeadNotes('');
  };

  return (
    <div className={`w-full flex flex-col gap-4 ${className}`}>
      {/* HEADER BANNER */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#061826] via-[#092236] to-[#0a1824] border border-cyan-500/30 p-4 sm:p-5 shadow-[0_0_25px_rgba(0,240,255,0.08)]">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-500 to-green-600 flex items-center justify-center text-white shadow-[0_0_18px_rgba(16,185,129,0.4)] border border-emerald-300/40">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-heading font-black text-lg sm:text-xl text-white tracking-wide">
                  ऑटोमेटेड व्हाट्सएप लीड रिस्पॉन्डर
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/50 text-[10px] font-mono text-emerald-300 font-bold flex items-center gap-1 shadow-[0_0_8px_rgba(16,185,129,0.2)]">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  LIVE
                </span>
              </div>
              <p className="text-xs text-slate-300 font-sans mt-0.5">
                <span className="text-cyan-400 font-semibold">{config.businessNameHi}</span> • तत्काल हिंदी कोटेशन, मूल्य सीमा एवं फ़्री साइट विज़िट हेतु पता अनुरोध
              </p>
            </div>
          </div>

          {/* Quick Metrics Pills */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-950/60 border border-amber-500/30 text-amber-300 text-xs font-mono font-bold shadow-xs">
              <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span>{metrics.hotCount} हॉट लीड्स</span>
            </div>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-mono font-bold shadow-[0_0_12px_rgba(16,185,129,0.3)] transition-all active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>नया लीड</span>
            </button>
          </div>
        </div>

        {/* Success Banner */}
        {successBanner && (
          <div className="mt-3 p-3 rounded-xl bg-emerald-950/90 border border-emerald-400/50 flex items-center justify-between gap-2 text-xs text-emerald-200 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successBanner}</span>
            </div>
            <button
              onClick={() => setSuccessBanner(null)}
              className="text-emerald-400 hover:text-white text-xs underline font-mono"
            >
              बंद करें
            </button>
          </div>
        )}
      </div>

      {/* SUB-TABS */}
      <div className="flex items-center justify-between gap-2 border-b border-cyan-500/20 pb-2">
        <div className="flex items-center gap-1 p-1 rounded-xl bg-[#081220]/90 border border-cyan-500/20">
          {[
            { id: 'simulator', label: '🚀 रिस्पॉन्डर सिमुलेटर', icon: Sparkles },
            { id: 'pipeline', label: `🔥 हॉट लीड्स सूची (${leads.length})`, icon: Flame },
            { id: 'rates', label: '📋 सक्रिय दरें व टेम्पलेट', icon: Building2 },
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

        <div className="hidden sm:flex items-center gap-2">
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-[11px] font-mono text-slate-300 hover:text-white transition-all"
            title="Export Leads to CSV"
          >
            <Download className="w-3 h-3 text-cyan-400" />
            <span>CSV एक्सपोर्ट</span>
          </button>
          <button
            onClick={handleResetLeads}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-[11px] font-mono text-slate-400 hover:text-slate-200 transition-all"
            title="Reset to Sample Leads"
          >
            <RefreshCw className="w-3 h-3" />
            <span>रीसेट</span>
          </button>
        </div>
      </div>

      {/* TAB 1: SIMULATOR & INSTANT AUTO-RESPONDER */}
      {activeSubTab === 'simulator' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          {/* LEFT: INBOUND CUSTOMER INQUIRY SIMULATOR (5 Cols) */}
          <div className="lg:col-span-6 flex flex-col gap-3.5 rounded-2xl bg-[#081220]/90 border border-cyan-500/20 p-4 sm:p-5 backdrop-blur-md shadow-lg">
            <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <h3 className="font-heading font-bold text-sm text-white">
                  आगंतुक ग्राहक इनक्वायरी (Inbound WhatsApp Query)
                </h3>
              </div>
              <span className="text-[10px] font-mono text-slate-400">सिमुलेशन</span>
            </div>

            {/* Quick 1-Click Preset Buttons */}
            <div>
              <label className="text-[11px] font-mono text-cyan-400 uppercase tracking-wider block mb-1.5">
                ⚡ 1-क्लिक टेस्ट इनक्वायरी चुनें:
              </label>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() =>
                    handleApplyPreset(
                      'राजेश शर्मा (Rajesh Sharma)',
                      '+91 98234 56789',
                      'shed',
                      1200,
                      'नमस्ते, मुझे 1,200 sq ft छत के लिए शेड का काम करवाना है। टाटा शीट और मजबूत पाइप स्ट्रक्चर चाहिए। क्या रेट पड़ेगा?'
                    )
                  }
                  className="px-2.5 py-1 rounded-lg bg-cyan-950/60 hover:bg-cyan-900/80 border border-cyan-500/30 text-[11px] font-mono text-cyan-300 transition-all"
                >
                  🏭 1,200 sq ft शेड
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleApplyPreset(
                      'अमित पटेल (Amit Patel)',
                      '+91 98111 22334',
                      'railing',
                      65,
                      'बालकनी और सीढ़ियों के लिए 65 रनिंग फुट स्टील रेलिंग लगवानी है। एसएस 304 का रेट क्या है?'
                    )
                  }
                  className="px-2.5 py-1 rounded-lg bg-cyan-950/60 hover:bg-cyan-900/80 border border-cyan-500/30 text-[11px] font-mono text-cyan-300 transition-all"
                >
                  ✨ 65 ft SS रेलिंग
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleApplyPreset(
                      'विकास यादव (Vikas Yadav)',
                      '+91 97555 44332',
                      'gate',
                      80,
                      'घर के मेन एंट्रेंस के लिए 10x8 फुट का स्लाइडिंग गेट बनवाना है। लेजर कटिंग डिज़ाइन के साथ।'
                    )
                  }
                  className="px-2.5 py-1 rounded-lg bg-cyan-950/60 hover:bg-cyan-900/80 border border-cyan-500/30 text-[11px] font-mono text-cyan-300 transition-all"
                >
                  🚪 10x8 ft मेन गेट
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleApplyPreset(
                      'सुनील वर्मा (Sunil Verma)',
                      '+91 98760 12345',
                      'grill',
                      150,
                      'नई बिल्डिंग में 5 खिड़कियों के लिए सेफ्टी ग्रिल चाहिए, लगभग 150 वर्ग फुट। रेट बताएं।'
                    )
                  }
                  className="px-2.5 py-1 rounded-lg bg-cyan-950/60 hover:bg-cyan-900/80 border border-cyan-500/30 text-[11px] font-mono text-cyan-300 transition-all"
                >
                  🔒 150 sq ft सेफ्टी ग्रिल
                </button>
              </div>
            </div>

            {/* Input Form */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-mono text-slate-300 block mb-1">
                  ग्राहक का नाम (Customer Name)
                </label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full bg-[#050b14] border border-cyan-500/30 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                    placeholder="उदा. राहुल शर्मा"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-mono text-slate-300 block mb-1">
                  व्हाट्सएप नंबर (Phone / WhatsApp)
                </label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-emerald-400 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full bg-[#050b14] border border-cyan-500/30 rounded-xl pl-8 pr-3 py-1.5 text-xs text-emerald-300 font-mono placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-mono text-slate-300 block mb-1">
                  फैब्रिकेशन सेवा (Service Item)
                </label>
                <select
                  value={selectedService}
                  onChange={(e) => setSelectedService(e.target.value as any)}
                  className="w-full bg-[#050b14] border border-cyan-500/30 rounded-xl px-3 py-1.5 text-xs text-cyan-200 focus:outline-none focus:border-cyan-400"
                >
                  <option value="shed">इंडस्ट्रियल व डोमेस्टिक शेड्स (₹180-₹220/sq ft)</option>
                  <option value="railing">SS-304 स्टील रेलिंग (₹450/running ft)</option>
                  <option value="gate">मॉडर्न सीएनसी लेजर कट गेट्स (₹280-₹380/sq ft)</option>
                  <option value="grill">विंडो व बालकनी सेफ्टी ग्रिल्स (₹130-₹180/sq ft)</option>
                  <option value="shutter">हेवी ड्यूटी रोलिंग शटर (₹160-₹210/sq ft)</option>
                  <option value="stairs">स्पाइरल / मेटल सीढ़ियां (₹1200-₹1800/step)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-mono text-slate-300 block mb-1">
                  अनुमानित मात्रा / एरिया (Quantity / Size)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value || '1', 10)))}
                    className="w-full bg-[#050b14] border border-cyan-500/30 rounded-xl px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-cyan-400"
                  />
                  <span className="absolute right-3 top-2 text-[10px] font-mono text-cyan-400">
                    {selectedService === 'railing' ? 'running ft' : selectedService === 'stairs' ? 'steps' : 'sq ft'}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-mono text-slate-300 block mb-1">
                ग्राहक का मूल संदेश (Inbound WhatsApp Message)
              </label>
              <textarea
                rows={3}
                value={customerMessage}
                onChange={(e) => setCustomerMessage(e.target.value)}
                className="w-full bg-[#050b14] border border-cyan-500/30 rounded-xl p-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400 resize-none font-sans"
                placeholder="ग्राहक द्वारा भेजा गया प्रश्न या व्हाट्सएप संदेश..."
              />
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex flex-col sm:flex-row gap-2 pt-1">
              <button
                type="button"
                onClick={() => handleGenerateQuotation(true)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-heading font-bold text-xs shadow-[0_0_15px_rgba(16,185,129,0.3)] active:scale-95 transition-all"
              >
                <Sparkles className="w-4 h-4 text-emerald-200" />
                <span>तत्काल हिंदी कोटेशन बनाएं और 'Hot Leads' में सेव करें</span>
              </button>

              <button
                type="button"
                onClick={() => handleGenerateQuotation(false)}
                className="px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-mono transition-all"
                title="Only preview quote without saving"
              >
                <span>सिर्फ प्रिव्यू</span>
              </button>
            </div>
          </div>

          {/* RIGHT: LIVE WHATSAPP MESSAGE PREVIEW (6 Cols) */}
          <div className="lg:col-span-6 flex flex-col gap-3">
            {/* WHATSAPP CONTAINER FRAME */}
            <div className="rounded-2xl bg-[#0b141a] border border-emerald-500/30 overflow-hidden shadow-2xl flex flex-col">
              {/* WhatsApp App Bar */}
              <div className="bg-[#1f2c34] px-4 py-3 flex items-center justify-between border-b border-[#2a3942]">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-xs border border-cyan-400/40">
                      MV
                    </div>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#1f2c34] absolute bottom-0 right-0" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white leading-tight">
                      {config.businessNameHi}
                    </h4>
                    <p className="text-[10px] text-emerald-400 font-mono">
                      ऑनलाइन • तारा ऑटो-रिस्पॉन्डर सक्रिय
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/40 text-[10px] font-mono text-emerald-300">
                    कोटेशन रिस्पॉन्स
                  </span>
                </div>
              </div>

              {/* Chat Canvas with Wallpaper Background */}
              <div className="p-4 bg-[#0c1317] min-h-[300px] flex flex-col justify-between gap-3 relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#25d366_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

                {/* Customer Inbound Bubble */}
                <div className="self-start max-w-[85%] rounded-2xl rounded-tl-xs p-3 bg-[#202c33] text-white text-xs leading-relaxed shadow-md border border-[#2a3942]/60">
                  <p className="text-[10px] font-bold text-emerald-400 mb-0.5">
                    {customerName} • {customerPhone}
                  </p>
                  <p className="text-slate-200">{customerMessage}</p>
                  <div className="text-[9px] text-slate-400 text-right mt-1 font-mono">
                    10:42 AM
                  </div>
                </div>

                {/* Generated Outbound Bubble (Green WhatsApp bubble) */}
                {hasGenerated ? (
                  <div className="self-end max-w-[92%] rounded-2xl rounded-tr-xs p-3.5 bg-[#005c4b] text-white text-xs leading-relaxed shadow-lg border border-emerald-500/40 animate-in fade-in zoom-in-95">
                    <div className="flex items-center justify-between border-b border-emerald-400/30 pb-1.5 mb-2">
                      <span className="text-[10px] font-mono text-emerald-200 font-bold flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-emerald-300" />
                        ऑटो-जनरेटेड कोटेशन व पता अनुरोध
                      </span>
                      <span className="text-[10px] font-mono text-emerald-200 bg-emerald-900/60 px-1.5 py-0.5 rounded">
                        ₹{generatedPriceMin.toLocaleString('en-IN')} - ₹{generatedPriceMax.toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div className="whitespace-pre-wrap font-sans text-xs text-emerald-50 leading-relaxed">
                      {generatedText}
                    </div>

                    <div className="flex items-center justify-end gap-1.5 text-[9px] text-emerald-200/80 text-right mt-2 font-mono">
                      <span>{new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })}</span>
                      <span className="text-cyan-300 font-bold">✓✓</span>
                    </div>
                  </div>
                ) : (
                  <div className="self-center p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-center text-xs text-slate-400 font-mono">
                    कोटेशन बनाने के लिए बाएँ तरफ दिए गए बटन पर क्लिक करें।
                  </div>
                )}
              </div>

              {/* ACTION FOOTER */}
              <div className="bg-[#1f2c34] p-3 border-t border-[#2a3942] flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopyText(generatedText)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#2a3942] hover:bg-[#324550] text-emerald-300 text-xs font-mono font-bold transition-all active:scale-95 border border-emerald-500/30"
                  >
                    {copiedResponse ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>कॉपी हो गया!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>मैसेज कॉपी करें</span>
                      </>
                    )}
                  </button>

                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-mono font-bold transition-all shadow-[0_0_10px_rgba(16,185,129,0.3)] active:scale-95"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>WhatsApp पर भेजें</span>
                    <ExternalLink className="w-3 h-3 text-emerald-200" />
                  </a>
                </div>

                <a
                  href={`tel:${customerPhone.replace(/\s+/g, '')}`}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-mono transition-all"
                >
                  <PhoneCall className="w-3.5 h-3.5 text-cyan-400" />
                  <span>कॉल करें</span>
                </a>
              </div>
            </div>

            {/* Address Request Guarantee Callout */}
            <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/30 flex items-start gap-2.5 text-xs text-amber-200 font-sans">
              <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-amber-300">साइट विज़िट हेतु पता अनुरोध:</span>{' '}
                संदेश में कार्यस्थल का पूरा पता व पिनकोड माँगने का स्पष्ट अनुरोध शामिल है, ताकि मोहन विश्वास फैब्रिकेशन के इंजीनियर साइट पर जाकर सटीक नाप (Measurement) ले सकें।
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: HOT LEADS PIPELINE & MANAGEMENT */}
      {activeSubTab === 'pipeline' && (
        <div className="flex flex-col gap-4">
          {/* STATS METRIC CARDS */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-[#081220]/90 border border-cyan-500/20 flex flex-col gap-1">
              <span className="text-[11px] font-mono text-slate-400">कुल इनक्वायरी लीड्स</span>
              <span className="font-heading font-black text-2xl text-white">{metrics.total}</span>
              <span className="text-[10px] text-cyan-400 font-mono">100% रिकॉर्डेड</span>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-500/30 flex flex-col gap-1 shadow-[0_0_12px_rgba(245,158,11,0.1)]">
              <span className="text-[11px] font-mono text-amber-300 flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                हॉट लीड्स (High Intent)
              </span>
              <span className="font-heading font-black text-2xl text-amber-400">{metrics.hotCount}</span>
              <span className="text-[10px] text-amber-200/80 font-mono">तुरंत फॉलो-अप योग्य</span>
            </div>

            <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 flex flex-col gap-1">
              <span className="text-[11px] font-mono text-emerald-300 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                साइट विज़िट तय (Visits)
              </span>
              <span className="font-heading font-black text-2xl text-emerald-400">{metrics.siteVisits}</span>
              <span className="text-[10px] text-emerald-300/80 font-mono">नाप प्रक्रिया में</span>
            </div>

            <div className="p-3.5 rounded-xl bg-purple-950/40 border border-purple-500/30 flex flex-col gap-1">
              <span className="text-[11px] font-mono text-purple-300">पाइपलाइन वैल्यू (अनुमानित)</span>
              <span className="font-heading font-black text-lg sm:text-xl text-purple-300 font-mono">
                ₹{(metrics.totalValueMin / 100000).toFixed(1)}L - ₹{(metrics.totalValueMax / 100000).toFixed(1)}L
              </span>
              <span className="text-[10px] text-purple-200/80 font-mono">संभावित रेवेन्यू</span>
            </div>
          </div>

          {/* SEARCH & FILTER BAR */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 bg-[#081220]/90 border border-cyan-500/20 p-2.5 rounded-xl">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ग्राहक नाम, फोन, पता या काम खोजें..."
                className="w-full bg-[#050b14] border border-cyan-500/30 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-sans"
              />
            </div>

            {/* Filter Status Pills */}
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
              {[
                { id: 'all', label: 'सभी' },
                { id: 'hot', label: '🔥 हॉट' },
                { id: 'site_visit', label: '📍 साइट विज़िट' },
                { id: 'quote_sent', label: '📄 कोटेशन' },
                { id: 'deal_closed', label: '✅ फाइनल' },
              ].map((pill) => (
                <button
                  key={pill.id}
                  onClick={() => setStatusFilter(pill.id)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-mono whitespace-nowrap transition-all ${
                    statusFilter === pill.id
                      ? 'bg-cyan-950 border border-cyan-500/50 text-cyan-300 font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>
          </div>

          {/* LEADS LIST CARDS */}
          <div className="flex flex-col gap-3">
            {filteredLeads.length === 0 ? (
              <div className="p-8 rounded-2xl bg-[#081220]/60 border border-cyan-500/20 text-center flex flex-col items-center gap-2">
                <AlertCircle className="w-8 h-8 text-slate-500" />
                <p className="text-xs text-slate-400 font-sans">
                  कोई मेल खाती लीड नहीं मिली। कृपया नया लीड जोड़ें या फ़िल्टर बदलें।
                </p>
              </div>
            ) : (
              filteredLeads.map((lead) => {
                const isSelected = selectedLeadForDetail?.id === lead.id;
                const isEditingAddress = editingAddressLeadId === lead.id;

                const statusBadgeMap: Record<LeadStatus, { label: string; bg: string; border: string; text: string }> = {
                  hot: { label: '🔥 हॉट लीड', bg: 'bg-amber-950/80', border: 'border-amber-500/50', text: 'text-amber-300' },
                  site_visit: { label: '📍 साइट विज़िट तय', bg: 'bg-emerald-950/80', border: 'border-emerald-500/50', text: 'text-emerald-300' },
                  quote_sent: { label: '📄 कोटेशन भेजा', bg: 'bg-blue-950/80', border: 'border-blue-500/50', text: 'text-blue-300' },
                  deal_closed: { label: '✅ कार्य शुरू / फाइनल', bg: 'bg-green-950/80', border: 'border-green-500/50', text: 'text-green-300' },
                  cold: { label: '❄️ कोल्ड', bg: 'bg-slate-900', border: 'border-slate-700', text: 'text-slate-400' },
                };

                const currentBadge = statusBadgeMap[lead.status] || statusBadgeMap.hot;

                return (
                  <div
                    key={lead.id}
                    className={`rounded-2xl bg-[#081220]/90 border transition-all overflow-hidden ${
                      lead.status === 'hot'
                        ? 'border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.08)]'
                        : 'border-cyan-500/20'
                    }`}
                  >
                    {/* CARD HEADER */}
                    <div className="p-3.5 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-700 flex items-center justify-center text-white font-bold text-sm shrink-0 border border-cyan-400/30">
                          {lead.customerName.charAt(0) || 'C'}
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="font-heading font-bold text-sm text-white">
                              {lead.customerName}
                            </h4>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${currentBadge.bg} ${currentBadge.border} ${currentBadge.text}`}
                            >
                              {currentBadge.label}
                            </span>
                            <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/20">
                              {lead.serviceName}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-300 mt-1">
                            <span className="font-mono text-emerald-400 font-semibold flex items-center gap-1">
                              <Phone className="w-3 h-3 text-emerald-400" />
                              {lead.phoneNumber}
                            </span>
                            {lead.approxSize && (
                              <span className="text-slate-400 font-mono">
                                साइज: <span className="text-white font-semibold">{lead.approxSize}</span>
                              </span>
                            )}
                            <span className="text-slate-400 font-mono">
                              अनुमानित: <span className="text-amber-300 font-bold">₹{lead.priceRangeMin.toLocaleString('en-IN')}{lead.priceRangeMax !== lead.priceRangeMin ? ` - ₹${lead.priceRangeMax.toLocaleString('en-IN')}` : ''}</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* QUICK ACTIONS */}
                      <div className="flex items-center gap-1.5 self-end sm:self-auto">
                        <select
                          value={lead.status}
                          onChange={(e) => handleStatusChange(lead.id, e.target.value as any)}
                          className="bg-[#050b14] border border-cyan-500/30 rounded-lg px-2 py-1 text-[11px] font-mono text-cyan-300 focus:outline-none"
                          title="Change Lead Status"
                        >
                          <option value="hot">🔥 हॉट लीड</option>
                          <option value="site_visit">📍 साइट विज़िट तय</option>
                          <option value="quote_sent">📄 कोटेशन भेजा</option>
                          <option value="deal_closed">✅ डील फाइनल</option>
                          <option value="cold">❄️ कोल्ड</option>
                        </select>

                        <a
                          href={`https://api.whatsapp.com/send?phone=${lead.phoneNumber.replace(/\D/g, '')}&text=${encodeURIComponent(lead.generatedHindiResponse || '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg bg-emerald-950/70 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300 transition-all"
                          title="Open WhatsApp Chat"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                        </a>

                        <a
                          href={`tel:${lead.phoneNumber.replace(/\s+/g, '')}`}
                          className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-all"
                          title="Call Customer"
                        >
                          <Phone className="w-3.5 h-3.5 text-cyan-400" />
                        </a>

                        <button
                          onClick={() => setSelectedLeadForDetail(isSelected ? null : lead)}
                          className="px-2.5 py-1 rounded-lg bg-cyan-950/60 hover:bg-cyan-900 border border-cyan-500/30 text-cyan-300 text-[11px] font-mono transition-all"
                        >
                          {isSelected ? 'कम देखें' : 'विस्तार'}
                        </button>
                      </div>
                    </div>

                    {/* SITE ADDRESS BAR */}
                    <div className="px-3.5 sm:px-4 py-2 bg-[#050b14]/80 border-t border-cyan-500/10 flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2 flex-1">
                        <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        {isEditingAddress ? (
                          <div className="flex items-center gap-1.5 flex-1">
                            <input
                              type="text"
                              value={addressInput}
                              onChange={(e) => setAddressInput(e.target.value)}
                              placeholder="साइट का पूरा पता (उदा. प्लॉट 12, इंडस्ट्रियल एरिया)"
                              className="flex-1 bg-slate-900 border border-cyan-500/40 rounded px-2 py-0.5 text-xs text-white focus:outline-none"
                            />
                            <button
                              onClick={() => handleSaveAddress(lead.id)}
                              className="px-2 py-0.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[10px] font-mono"
                            >
                              सेव
                            </button>
                            <button
                              onClick={() => setEditingAddressLeadId(null)}
                              className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded text-[10px] font-mono"
                            >
                              रद्द
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="text-slate-400 font-mono text-[11px]">साइट का पता:</span>
                            {lead.siteAddress ? (
                              <span className="text-amber-200 font-sans font-semibold">
                                {lead.siteAddress}
                              </span>
                            ) : (
                              <span className="text-slate-500 italic text-[11px]">
                                पता प्रतीक्षित (ग्राहक से मांगा गया है)
                              </span>
                            )}
                            <button
                              onClick={() => {
                                setEditingAddressLeadId(lead.id);
                                setAddressInput(lead.siteAddress || '');
                              }}
                              className="text-[10px] text-cyan-400 hover:underline font-mono flex items-center gap-0.5"
                            >
                              <Edit2 className="w-2.5 h-2.5" />
                              <span>{lead.siteAddress ? 'बदलें' : 'पता जोड़ें'}</span>
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="text-[10px] text-slate-500 font-mono">
                        {new Date(lead.createdAt).toLocaleDateString('hi-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </div>
                    </div>

                    {/* EXPANDED DETAILS ACCORDION */}
                    {isSelected && (
                      <div className="p-4 bg-[#050b14] border-t border-cyan-500/20 flex flex-col gap-3 text-xs animate-in fade-in">
                        {lead.customerQuery && (
                          <div>
                            <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider block mb-1">
                              ग्राहक का मूल प्रश्न:
                            </span>
                            <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-300 font-sans leading-relaxed">
                              {lead.customerQuery}
                            </div>
                          </div>
                        )}

                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider">
                              भेजा गया हिंदी कोटेशन:
                            </span>
                            <button
                              onClick={() => handleCopyText(lead.generatedHindiResponse)}
                              className="text-[10px] text-emerald-400 hover:text-white font-mono flex items-center gap-1"
                            >
                              <Copy className="w-2.5 h-2.5" />
                              <span>कॉपी करें</span>
                            </button>
                          </div>
                          <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-500/30 text-emerald-100 font-sans whitespace-pre-wrap leading-relaxed text-[11px]">
                            {lead.generatedHindiResponse}
                          </div>
                        </div>

                        {lead.notes && (
                          <div>
                            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-0.5">
                              आंतरिक नोट्स:
                            </span>
                            <p className="text-slate-300 font-sans">{lead.notes}</p>
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                          <button
                            onClick={() => handleDeleteLead(lead.id)}
                            className="text-[11px] text-rose-400 hover:text-rose-300 font-mono flex items-center gap-1"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>लीड हटाएं</span>
                          </button>

                          <button
                            onClick={() => {
                              if (onTriggerTaraChat) {
                                onTriggerTaraChat(`कृपया ग्राहक ${lead.customerName} के लिए फॉलो-अप प्लान और कोटेशन तैयार करो।`);
                              }
                            }}
                            className="text-[11px] text-cyan-400 hover:text-cyan-300 font-mono flex items-center gap-1"
                          >
                            <Sparkles className="w-3 h-3" />
                            <span>तारा से फॉलो-अप प्लान पूछें</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB 3: RATES & TEMPLATE PREVIEW */}
      {activeSubTab === 'rates' && (
        <div className="flex flex-col gap-4 rounded-2xl bg-[#081220]/90 border border-cyan-500/20 p-4 sm:p-5 backdrop-blur-md">
          <div className="flex items-center justify-between border-b border-cyan-500/20 pb-3">
            <div>
              <h3 className="font-heading font-bold text-sm text-white">
                {config.businessNameHi} - अधिकृत फैब्रिकेशन दरें
              </h3>
              <p className="text-xs text-slate-400 font-sans mt-0.5">
                ऑटो-रिस्पॉन्डर इन्हीं दरों के आधार पर कोटेशन और मूल्य सीमा (Price Range) की गणना करता है।
              </p>
            </div>
            <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950 px-2 py-1 rounded border border-cyan-500/30">
              लाइव सिंक
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {config.services.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-xl bg-[#050b14] border border-cyan-500/20 flex flex-col justify-between gap-2"
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <h4 className="font-heading font-bold text-xs text-white">{item.nameHi}</h4>
                    <span className="px-2 py-0.5 rounded bg-emerald-950 border border-emerald-500/40 text-[10px] font-mono text-emerald-300 font-bold">
                      {item.rateMax && item.rateMax !== item.rateMin
                        ? `₹${item.rateMin} - ₹${item.rateMax}`
                        : `₹${item.rateMin}`} / {item.unit}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed line-clamp-2">
                    {item.description}
                  </p>
                </div>

                <div className="text-[10px] font-mono text-slate-400 pt-1 border-t border-slate-800">
                  मटीरियल: <span className="text-slate-200">{item.material}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/30 flex items-center justify-between gap-2 text-xs">
            <span className="text-cyan-200">
              दरों को संपादित करने या नई सेवा जोड़ने के लिए 'फैब्रिकेशन रेट्स (Rates)' टैब पर जाएं।
            </span>
            <button
              onClick={() => {
                const ratesTabBtn = document.querySelector('button[data-tab="rates"]') as HTMLElement;
                if (ratesTabBtn) ratesTabBtn.click();
              }}
              className="text-cyan-300 hover:text-white font-mono underline font-bold"
            >
              रेट्स टैब खोलें →
            </button>
          </div>
        </div>
      )}

      {/* MODAL: ADD MANUAL LEAD */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-[#081220] border border-cyan-500/40 rounded-2xl p-5 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-cyan-500/20 pb-3">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-400 fill-amber-400" />
                <h3 className="font-heading font-bold text-sm text-white">
                  नया हॉट लीड जोड़ें (Add Hot Lead)
                </h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white text-xs font-mono"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddManualLead} className="flex flex-col gap-3">
              <div>
                <label className="text-[11px] font-mono text-slate-300 block mb-1">
                  ग्राहक का नाम *
                </label>
                <input
                  type="text"
                  required
                  value={newLeadName}
                  onChange={(e) => setNewLeadName(e.target.value)}
                  placeholder="उदा. कुलदीप सिंह"
                  className="w-full bg-[#050b14] border border-cyan-500/30 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="text-[11px] font-mono text-slate-300 block mb-1">
                  फोन / व्हाट्सएप नंबर *
                </label>
                <input
                  type="text"
                  required
                  value={newLeadPhone}
                  onChange={(e) => setNewLeadPhone(e.target.value)}
                  className="w-full bg-[#050b14] border border-cyan-500/30 rounded-xl px-3 py-1.5 text-xs text-emerald-300 font-mono focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-mono text-slate-300 block mb-1">
                    सेवा
                  </label>
                  <select
                    value={newLeadService}
                    onChange={(e) => setNewLeadService(e.target.value as any)}
                    className="w-full bg-[#050b14] border border-cyan-500/30 rounded-xl px-2 py-1.5 text-xs text-cyan-200 focus:outline-none"
                  >
                    <option value="shed">शेड्स निर्माण</option>
                    <option value="railing">स्टील रेलिंग</option>
                    <option value="gate">मेन गेट्स</option>
                    <option value="grill">सेफ्टी ग्रिल्स</option>
                    <option value="shutter">रोलिंग शटर</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-mono text-slate-300 block mb-1">
                    मात्रा / एरिया
                  </label>
                  <input
                    type="text"
                    value={newLeadSize}
                    onChange={(e) => setNewLeadSize(e.target.value)}
                    placeholder="उदा. 800 sq ft"
                    className="w-full bg-[#050b14] border border-cyan-500/30 rounded-xl px-3 py-1.5 text-xs text-white font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-mono text-slate-300 block mb-1">
                  साइट का पता (Site Address)
                </label>
                <input
                  type="text"
                  value={newLeadAddress}
                  onChange={(e) => setNewLeadAddress(e.target.value)}
                  placeholder="उदा. प्लॉट 40, विकास नगर"
                  className="w-full bg-[#050b14] border border-cyan-500/30 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-mono text-slate-300 block mb-1">
                  नोट्स
                </label>
                <textarea
                  rows={2}
                  value={newLeadNotes}
                  onChange={(e) => setNewLeadNotes(e.target.value)}
                  placeholder="क्लाइंट की विशेष मांग..."
                  className="w-full bg-[#050b14] border border-cyan-500/30 rounded-xl p-2 text-xs text-white focus:outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-mono font-bold shadow-md"
                >
                  सेव करें
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
