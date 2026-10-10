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
  Radio,
  ExternalLink,
  Zap,
  Activity,
  X,
  Maximize2
} from 'lucide-react';
import { CallSessionData } from './SciFiCallDialerModal';
import { audioSynth } from '../utils/audio';

interface SciFiCallStatusPanelProps {
  session: CallSessionData;
  onOpenDialerModal: () => void;
  onEndCall: () => void;
}

export const SciFiCallStatusPanel: React.FC<SciFiCallStatusPanelProps> = ({
  session,
  onOpenDialerModal,
  onEndCall,
}) => {
  const [elapsed, setElapsed] = useState<number>(0);

  useEffect(() => {
    if (session.status === 'idle' || session.status === 'ended') {
      setElapsed(0);
      return;
    }
    const timer = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [session.status]);

  // Only show when dialing or active call
  if (session.status === 'idle' || session.status === 'ended') {
    return null;
  }

  const cleanNumber = (session.phoneNumber || '').replace(/[^0-9+]/g, '') || '9876543210';
  const telHref = `tel:${cleanNumber}`;
  const whatsappHref = `https://wa.me/${cleanNumber.replace(/^\+/, '')}?text=${encodeURIComponent(
    `नमस्ते ${session.contactName || ''}! तारा वॉइस असिस्टेंट के माध्यम से संपर्क।`
  )}`;

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full mb-3 animate-in slide-in-from-top-3 duration-300">
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-[#030d22] via-[#051532] to-[#040c1e] border-2 border-cyan-400/70 shadow-[0_0_35px_rgba(0,240,255,0.35)] p-3 sm:p-3.5">
        {/* Futuristic Grid Accent Line */}
        <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Left: Status Indicator & Target Info */}
          <div className="flex items-center gap-3">
            {/* Holographic Radar / Audio Wave Icon */}
            <div className="relative w-11 h-11 rounded-xl bg-cyan-950/90 border border-cyan-400/80 flex items-center justify-center text-cyan-300 shadow-[0_0_15px_rgba(0,240,255,0.4)] shrink-0">
              <PhoneCall className="w-5 h-5 text-emerald-400 animate-bounce" />
              <div className="absolute -inset-1 rounded-xl border border-emerald-400/40 animate-ping pointer-events-none" />
            </div>

            {/* Readout Texts */}
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-mono font-black text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/50 flex items-center gap-1 uppercase tracking-wider animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  {session.status === 'connected' ? 'CALL CONNECTED' : 'DIALING // CELLULAR LINK'}
                </span>
                <span className="text-[10px] font-mono text-cyan-300 font-bold bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-500/30">
                  ⏱️ {formatTimer(elapsed)}
                </span>
              </div>

              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="font-heading font-black text-sm text-white truncate">
                  {session.contactName || 'सम्पर्क'}
                </span>
                <span className="font-mono text-xs text-cyan-300 font-bold">
                  {session.phoneNumber || '+91 98765 43210'}
                </span>
              </div>
            </div>
          </div>

          {/* Right: Instant 1-Click Action Connect Buttons (tel: & WhatsApp) */}
          <div className="flex items-center gap-2 flex-wrap self-end sm:self-auto shrink-0">
            {/* 1. Direct Web 'tel:' Call Button */}
            <a
              href={telHref}
              onClick={() => audioSynth.playSuccess()}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-mono font-bold flex items-center gap-1.5 shadow-[0_0_15px_rgba(16,185,129,0.4)] transition-all active:scale-95 no-underline cursor-pointer"
              title="फोन से डायरेक्ट कॉल लगाएं (Open Phone Dialer)"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>tel: Call</span>
            </a>

            {/* 2. Direct WhatsApp Call Button */}
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => audioSynth.playSuccess()}
              className="px-3 py-1.5 rounded-lg bg-[#0b4824] hover:bg-[#0e5c2e] border border-emerald-400/70 text-emerald-100 text-xs font-mono font-bold flex items-center gap-1.5 shadow-[0_0_12px_rgba(16,185,129,0.3)] transition-all active:scale-95 no-underline cursor-pointer"
              title="व्हाट्सएप पर संपर्क / कॉल (WhatsApp Call)"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-300" />
              <span>WhatsApp</span>
            </a>

            {/* 3. Open Full Sci-Fi Keypad Modal */}
            <button
              type="button"
              onClick={onOpenDialerModal}
              className="px-2.5 py-1.5 rounded-lg bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-400/60 text-cyan-200 text-xs font-mono font-bold flex items-center gap-1 transition-all active:scale-95 cursor-pointer shadow-sm"
              title="पूरा डायलर कीपैड खोलें (Open Full Dialer Keypad)"
            >
              <Maximize2 className="w-3.5 h-3.5 text-cyan-300" />
              <span className="hidden sm:inline">डायलर</span>
            </button>

            {/* 4. Disconnect / End Call */}
            <button
              type="button"
              onClick={onEndCall}
              className="px-2.5 py-1.5 rounded-lg bg-rose-950/90 hover:bg-rose-900 border border-rose-500/80 text-rose-200 text-xs font-mono font-bold flex items-center gap-1 transition-all active:scale-95 cursor-pointer shadow-sm"
              title="कॉल समाप्त करें (End Call)"
            >
              <PhoneOff className="w-3.5 h-3.5 text-rose-400" />
              <span>काटें</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
