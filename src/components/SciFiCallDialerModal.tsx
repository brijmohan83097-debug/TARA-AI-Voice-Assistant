/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Phone,
  PhoneCall,
  PhoneOff,
  MessageCircle,
  Copy,
  Check,
  X,
  User,
  Radio,
  Zap,
  RotateCcw,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Delete
} from 'lucide-react';
import { audioSynth } from '../utils/audio';

export interface CallSessionData {
  isOpen: boolean;
  contactName: string;
  phoneNumber: string;
  status: 'dialing' | 'ringing' | 'connected' | 'ended' | 'idle';
  callType: 'phone' | 'whatsapp';
  startTime?: number;
}

export const SPEED_DIAL_CONTACTS = [
  { name: 'राहुल शर्मा (Rahul Sharma)', number: '+91 98765 43210', category: 'General' },
  { name: 'अमित भार्गव (Amit Bhargava)', number: '+91 98222 33445', category: 'Shed Client' },
  { name: 'मोहन विश्वास वर्कशॉप (Mohan Workshop)', number: '+91 98765 43210', category: 'Fabrication' },
  { name: 'सुरेश स्टील ट्रेडर्स (Suresh Steel)', number: '+91 98111 22334', category: 'Supplier' },
  { name: 'आपातकालीन सहायता (Emergency Support)', number: '112', category: 'Emergency' },
];

interface SciFiCallDialerModalProps {
  session: CallSessionData;
  onClose: () => void;
  onEndCall: () => void;
  onUpdateSession: (data: Partial<CallSessionData>) => void;
}

export const SciFiCallDialerModal: React.FC<SciFiCallDialerModalProps> = ({
  session,
  onClose,
  onEndCall,
  onUpdateSession,
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [dialDuration, setDialDuration] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'dialer' | 'contacts'>('dialer');

  // Elapsed timer when dialing or active
  useEffect(() => {
    if (!session.isOpen || session.status === 'idle' || session.status === 'ended') {
      setDialDuration(0);
      return;
    }
    const timer = setInterval(() => {
      setDialDuration((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [session.isOpen, session.status]);

  if (!session.isOpen) return null;

  const rawNumber = session.phoneNumber || '';
  const cleanNumber = rawNumber.replace(/[^0-9+]/g, '') || '9876543210';
  const telHref = `tel:${cleanNumber}`;
  const whatsappHref = `https://wa.me/${cleanNumber.replace(/^\+/, '')}?text=${encodeURIComponent(
    `नमस्ते ${session.contactName || ''}! तारा वॉइस असिस्टेंट के माध्यम से संपर्क।`
  )}`;

  const handleCopyNumber = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(cleanNumber);
      setCopied(true);
      audioSynth.playSuccess();
      setTimeout(() => setCopied(false), 2200);
    }
  };

  const handleKeypadPress = (digit: string) => {
    audioSynth.playDtmf(digit);
    const newNumber = (session.phoneNumber || '') + digit;
    onUpdateSession({
      phoneNumber: newNumber,
      status: 'dialing',
    });
  };

  const handleBackspace = () => {
    audioSynth.playClick();
    const cur = session.phoneNumber || '';
    if (cur.length > 0) {
      onUpdateSession({
        phoneNumber: cur.slice(0, -1),
      });
    }
  };

  const handleClearNumber = () => {
    audioSynth.playClick();
    onUpdateSession({
      phoneNumber: '',
    });
  };

  const handleSelectContact = (c: { name: string; number: string }) => {
    audioSynth.playClick();
    audioSynth.playDialTone();
    onUpdateSession({
      contactName: c.name,
      phoneNumber: c.number,
      status: 'dialing',
    });
  };

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const keypadButtons = [
    { label: '1', sub: '' },
    { label: '2', sub: 'ABC' },
    { label: '3', sub: 'DEF' },
    { label: '4', sub: 'GHI' },
    { label: '5', sub: 'JKL' },
    { label: '6', sub: 'MNO' },
    { label: '7', sub: 'PQRS' },
    { label: '8', sub: 'TUV' },
    { label: '9', sub: 'WXYZ' },
    { label: '*', sub: '' },
    { label: '0', sub: '+' },
    { label: '#', sub: '' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-md bg-[#050b18] border border-cyan-500/50 rounded-2xl shadow-[0_0_50px_rgba(0,240,255,0.25)] overflow-hidden flex flex-col max-h-[92vh]"
        style={{
          backgroundImage: 'radial-gradient(ellipse at 50% 0%, rgba(0, 240, 255, 0.12) 0%, transparent 70%)',
        }}
      >
        {/* Sci-Fi Top HUD Bar */}
        <div className="px-4 py-3 bg-[#030814]/90 border-b border-cyan-500/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <div className="flex flex-col">
              <span className="text-[10px] font-mono font-black text-cyan-400 tracking-wider uppercase flex items-center gap-1.5">
                <Radio className="w-3 h-3 text-cyan-300 animate-pulse" />
                TARA TELECOM BRIDGE // VOIP & CELLULAR
              </span>
              <span className="text-[9px] font-mono text-slate-400">
                1-Click Direct Phone Calling System
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-700/80 text-slate-400 hover:text-white hover:bg-slate-800 flex items-center justify-center transition-all cursor-pointer"
            title="बंद करें (Close)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-slate-200 flex-1">
          {/* Main Caller Hologram Display */}
          <div className="relative p-4 rounded-xl bg-gradient-to-b from-[#08152c] to-[#040915] border border-cyan-400/40 shadow-[0_0_25px_rgba(0,240,255,0.15)] flex flex-col items-center text-center">
            {/* Glowing Avatar Orbit */}
            <div className="relative mb-2.5">
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-cyan-600 via-sky-500 to-emerald-400 p-0.5 shadow-[0_0_25px_rgba(0,240,255,0.5)] animate-pulse">
                <div className="w-full h-full rounded-full bg-[#050e1f] flex items-center justify-center text-cyan-300">
                  <User className="w-8 h-8" />
                </div>
              </div>
              <div className="absolute -inset-1 rounded-full border border-cyan-400/60 animate-ping pointer-events-none opacity-40" />
            </div>

            {/* Contact Name & Number Readout */}
            <h3 className="text-lg font-heading font-black text-white tracking-wide">
              {session.contactName || 'सम्पर्क (Direct Call)'}
            </h3>
            <div className="mt-1 flex items-center gap-2">
              <span className="font-mono text-base font-bold text-cyan-300 tracking-wider">
                {session.phoneNumber || 'नंबर दर्ज करें'}
              </span>
              {cleanNumber && (
                <button
                  type="button"
                  onClick={handleCopyNumber}
                  className="p-1 rounded bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 hover:text-white transition-colors"
                  title="नंबर कॉपी करें (Copy Number)"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              )}
            </div>

            {/* Sci-Fi Status Ribbon */}
            <div className="mt-3 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-400/50 flex items-center gap-2 text-xs font-mono">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-emerald-300 font-bold uppercase tracking-wider">
                {session.status === 'connected' ? 'CALL ACTIVE' : 'DIALING // CONNECTING'}
              </span>
              <span className="text-cyan-400/60">•</span>
              <span className="text-slate-300">{formatTimer(dialDuration)}</span>
            </div>
          </div>

          {/* TWO PRIMARY 1-CLICK CALL ACTION BUTTONS (MANDATORY REQUIREMENT 2) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* 1. Web 'tel:' Direct Cellular Call Button */}
            <a
              href={telHref}
              onClick={() => {
                audioSynth.playSuccess();
                onUpdateSession({ status: 'connected' });
              }}
              className="relative group p-3.5 rounded-xl bg-gradient-to-r from-emerald-950 via-teal-950 to-emerald-900 border-2 border-emerald-400/80 shadow-[0_0_25px_rgba(16,185,129,0.35)] hover:shadow-[0_0_35px_rgba(16,185,129,0.55)] flex flex-col items-center justify-center text-center transition-all duration-200 active:scale-95 text-white no-underline"
            >
              <div className="w-10 h-10 rounded-full bg-emerald-500/30 border border-emerald-400 flex items-center justify-center text-emerald-300 mb-1.5 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(16,185,129,0.5)]">
                <PhoneCall className="w-5 h-5 text-emerald-300 animate-bounce" />
              </div>
              <span className="font-heading font-black text-sm tracking-wide text-white">
                फ़ोन से कॉल करें
              </span>
              <span className="text-[10px] font-mono text-emerald-300/90 mt-0.5">
                (Direct 'tel:' Dial Link)
              </span>
            </a>

            {/* 2. Direct WhatsApp Voice Call Button */}
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                audioSynth.playSuccess();
                onUpdateSession({ status: 'connected', callType: 'whatsapp' });
              }}
              className="relative group p-3.5 rounded-xl bg-gradient-to-r from-emerald-900/90 via-[#0a3520] to-teal-900 border-2 border-emerald-500/80 shadow-[0_0_25px_rgba(16,185,129,0.35)] hover:shadow-[0_0_35px_rgba(16,185,129,0.55)] flex flex-col items-center justify-center text-center transition-all duration-200 active:scale-95 text-white no-underline"
            >
              <div className="w-10 h-10 rounded-full bg-emerald-600/40 border border-emerald-300 flex items-center justify-center text-emerald-200 mb-1.5 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(16,185,129,0.5)]">
                <MessageCircle className="w-5 h-5 text-emerald-200" />
              </div>
              <span className="font-heading font-black text-sm tracking-wide text-white">
                WhatsApp कॉल
              </span>
              <span className="text-[10px] font-mono text-emerald-300/90 mt-0.5">
                (WhatsApp Direct Connect)
              </span>
            </a>
          </div>

          {/* Sub-Tabs: Keypad vs Speed Dial Contacts */}
          <div className="flex items-center gap-1 p-1 bg-[#030814] rounded-xl border border-cyan-500/30">
            <button
              type="button"
              onClick={() => {
                audioSynth.playClick();
                setActiveTab('dialer');
              }}
              className={`flex-1 py-1.5 text-xs font-mono font-bold rounded-lg transition-all ${
                activeTab === 'dialer'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              डायलर कीपैड (Keypad)
            </button>
            <button
              type="button"
              onClick={() => {
                audioSynth.playClick();
                setActiveTab('contacts');
              }}
              className={`flex-1 py-1.5 text-xs font-mono font-bold rounded-lg transition-all ${
                activeTab === 'contacts'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              त्वरित संपर्क (Contacts)
            </button>
          </div>

          {/* TAB 1: INTERACTIVE SCI-FI DIALPAD */}
          {activeTab === 'dialer' && (
            <div className="space-y-2.5">
              {/* Backspace & Clear Quick Bar */}
              <div className="flex items-center justify-between px-1">
                <span className="text-[11px] font-mono text-slate-400">
                  टच कीपैड से नंबर डायल करें:
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleClearNumber}
                    className="text-[10px] font-mono text-slate-400 hover:text-rose-300 px-2 py-0.5 rounded bg-slate-900 border border-slate-700 transition-colors"
                  >
                    Clear All
                  </button>
                  <button
                    type="button"
                    onClick={handleBackspace}
                    className="p-1 rounded bg-slate-900 border border-slate-700 text-slate-300 hover:text-rose-300 transition-colors"
                    title="Backspace"
                  >
                    <Delete className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* 3x4 Touch Grid */}
              <div className="grid grid-cols-3 gap-2">
                {keypadButtons.map((btn) => (
                  <button
                    key={btn.label}
                    type="button"
                    onClick={() => handleKeypadPress(btn.label)}
                    className="py-2.5 px-3 rounded-xl bg-[#09152a] hover:bg-[#0f244a] border border-cyan-500/30 hover:border-cyan-400/80 text-white flex flex-col items-center justify-center transition-all active:scale-95 cursor-pointer shadow-sm group"
                  >
                    <span className="text-lg font-heading font-bold text-cyan-200 group-hover:text-white leading-none">
                      {btn.label}
                    </span>
                    {btn.sub && (
                      <span className="text-[8px] font-mono text-cyan-400/60 group-hover:text-cyan-300 tracking-widest mt-0.5">
                        {btn.sub}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: SPEED DIAL QUICK CONTACTS */}
          {activeTab === 'contacts' && (
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {SPEED_DIAL_CONTACTS.map((c) => (
                <div
                  key={c.name}
                  onClick={() => handleSelectContact(c)}
                  className="p-2.5 rounded-xl bg-[#08152c] border border-cyan-500/30 hover:border-cyan-400/70 hover:bg-[#0d2146] flex items-center justify-between transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-300">
                      <Phone className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="text-xs font-heading font-bold text-white group-hover:text-cyan-300 transition-colors">
                        {c.name}
                      </p>
                      <p className="text-[10px] font-mono text-cyan-400/80">
                        {c.number} • {c.category}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/40">
                    डायल करें
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Bottom Footer with Hang Up */}
        <div className="px-4 py-3 bg-[#030814] border-t border-cyan-500/30 flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>एन्क्रिप्टेड सुरक्षित संचार चैनल</span>
          </div>

          <button
            type="button"
            onClick={onEndCall}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-950 to-red-900 border border-rose-500/80 text-rose-200 hover:text-white hover:bg-rose-900 text-xs font-mono font-bold flex items-center gap-1.5 shadow-[0_0_15px_rgba(244,63,94,0.3)] active:scale-95 transition-all cursor-pointer"
          >
            <PhoneOff className="w-3.5 h-3.5 text-rose-400" />
            <span>कॉल काटें (End Call)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
