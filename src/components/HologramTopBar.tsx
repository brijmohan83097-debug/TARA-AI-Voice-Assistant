/**
 * HologramTopBar.tsx
 * Top Glass Layout for TARA Hologram Chamber (Matches 1791885788037.png):
 * - "TARA OS • SYSTEM ACTIVE" in glowing cyan font.
 * - Glass segmented view controls: [DIAGNOSTICS] [3D HOLOGRAM] [DIALOGUE (LOG)]
 * - Battery meter, quantum network latency, synchronized clock, and Boss verification.
 */

import React, { useEffect, useState } from 'react';
import {
  Shield,
  Wifi,
  BatteryCharging,
  Battery,
  Volume2,
  UserCheck,
  Clock,
  Activity,
  Orbit,
  MessageSquare,
} from 'lucide-react';
import { TaraEmotion } from '../types';
import { TARA_EMOTION_CONFIGS } from '../utils/emotions';

interface HologramTopBarProps {
  currentEmotion: TaraEmotion;
  isSpeaking: boolean;
  isListening: boolean;
  isStrangerDetected: boolean;
  onVerifyBossAccess?: () => void;
  onReplayLastAudio?: () => void;
  voiceLang: string;
  onToggleVoiceLang?: () => void;
  activeView: 'diagnostics' | 'entity' | 'dialogue';
  onSelectView: (view: 'diagnostics' | 'entity' | 'dialogue') => void;
}

export const HologramTopBar: React.FC<HologramTopBarProps> = ({
  currentEmotion,
  isSpeaking,
  isListening,
  isStrangerDetected,
  onVerifyBossAccess,
  onReplayLastAudio,
  voiceLang,
  onToggleVoiceLang,
  activeView,
  onSelectView,
}) => {
  const [timeStr, setTimeStr] = useState('');
  const [batteryLevel, setBatteryLevel] = useState<number>(98);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString('en-US', {
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="w-full shrink-0 z-30 flex flex-col items-center justify-center pt-2 pb-1.5 px-3 sm:px-6 bg-gradient-to-b from-[#020716]/95 via-[#020716]/80 to-transparent backdrop-blur-md select-none border-b border-cyan-500/20">
      {/* 1. TOP TITLE BAR: "TARA OS • SYSTEM ACTIVE" */}
      <div className="w-full flex items-center justify-between max-w-6xl">
        {/* Left: TARA OS Title & Active Beacon */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isListening
                  ? 'bg-rose-400 animate-ping'
                  : isSpeaking
                  ? 'bg-purple-400 animate-pulse'
                  : 'bg-cyan-400 shadow-[0_0_8px_#00f0ff]'
              }`}
            />
            <h1 className="font-heading font-black text-sm sm:text-base tracking-widest text-cyan-200 uppercase drop-shadow-[0_0_12px_rgba(0,240,255,0.6)]">
              TARA OS <span className="text-cyan-400 font-bold">• SYSTEM ACTIVE</span>
            </h1>
          </div>

          {/* Boss Verified Tag */}
          <div className="hidden md:flex items-center gap-1 px-2 py-0.5 rounded-md bg-cyan-950/70 border border-cyan-500/30 text-[9px] font-mono text-cyan-300">
            <UserCheck className="w-2.5 h-2.5 text-cyan-400" />
            <span>MR. BRIJMOHAN KUMAR</span>
          </div>
        </div>

        {/* Right: Battery Meter, WiFi Latency, Replay Audio, Lang Toggle */}
        <div className="flex items-center gap-2 font-mono text-[10px]">
          {/* Clock */}
          <div className="hidden sm:flex items-center gap-1 text-cyan-300/80 bg-slate-950/70 px-2 py-0.5 rounded border border-cyan-500/25">
            <Clock className="w-3 h-3 text-cyan-400" />
            <span>{timeStr || '00:00:00'}</span>
          </div>

          {/* Battery Meter */}
          <div className="flex items-center gap-1 text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-500/30 text-[9px]">
            <BatteryCharging className="w-3 h-3 animate-pulse" />
            <span>{batteryLevel}%</span>
          </div>

          {/* Network Latency */}
          <div className="hidden sm:flex items-center gap-1 text-cyan-400 bg-slate-950/70 px-2 py-0.5 rounded border border-cyan-500/20 text-[9px]">
            <Wifi className="w-2.5 h-2.5 text-cyan-300" />
            <span>12ms</span>
          </div>

          {/* Replay voice button */}
          {onReplayLastAudio && (
            <button
              type="button"
              onClick={onReplayLastAudio}
              className="p-1 rounded bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/30 text-cyan-300 transition-colors cursor-pointer"
              title="तारा की आवाज़ सुनें"
            >
              <Volume2 className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Language Switch */}
          <button
            type="button"
            onClick={onToggleVoiceLang}
            className="px-2 py-0.5 rounded bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 font-bold text-[9px] cursor-pointer transition-colors"
            title="भाषा बदलें"
          >
            {voiceLang === 'hi-IN' ? '🇮🇳 हिंदी' : '🌐 EN'}
          </button>
        </div>
      </div>

      {/* 2. CENTER GLASS SEGMENTED VIEW SELECTOR (Matches 1791885788037.png Header) */}
      <div className="mt-1.5 flex items-center justify-center z-20">
        <div className="flex items-center gap-1 p-1 rounded-2xl bg-[#031026]/85 border border-cyan-500/40 shadow-[0_0_20px_rgba(0,240,255,0.18)] backdrop-blur-md">
          {/* TAB 1: DIAGNOSTICS */}
          <button
            type="button"
            onClick={() => onSelectView('diagnostics')}
            className={`px-3 sm:px-4 py-1 rounded-xl font-mono text-[10px] sm:text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
              activeView === 'diagnostics'
                ? 'bg-cyan-500/35 text-white border border-cyan-300 shadow-[0_0_12px_rgba(0,240,255,0.5)]'
                : 'text-cyan-300/70 hover:text-cyan-200 hover:bg-cyan-950/50'
            }`}
          >
            <Activity className="w-3 h-3 text-cyan-400" />
            <span>DIAGNOSTICS</span>
          </button>

          {/* TAB 2: TARA AVATAR (Center Entity View) */}
          <button
            type="button"
            onClick={() => onSelectView('entity')}
            className={`px-3 sm:px-4 py-1 rounded-xl font-mono text-[10px] sm:text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
              activeView === 'entity'
                ? 'bg-cyan-500/35 text-white border border-cyan-300 shadow-[0_0_12px_rgba(0,240,255,0.5)]'
                : 'text-cyan-300/70 hover:text-cyan-200 hover:bg-cyan-950/50'
            }`}
          >
            <Orbit className="w-3 h-3 text-cyan-400 animate-spin" />
            <span>TARA AVATAR</span>
          </button>

          {/* TAB 3: DIALOGUE (LOG) */}
          <button
            type="button"
            onClick={() => onSelectView('dialogue')}
            className={`px-3 sm:px-4 py-1 rounded-xl font-mono text-[10px] sm:text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
              activeView === 'dialogue'
                ? 'bg-cyan-500/35 text-white border border-cyan-300 shadow-[0_0_12px_rgba(0,240,255,0.5)]'
                : 'text-cyan-300/70 hover:text-cyan-200 hover:bg-cyan-950/50'
            }`}
          >
            <MessageSquare className="w-3 h-3 text-cyan-400" />
            <span>DIALOGUE (LOG)</span>
          </button>
        </div>
      </div>
    </header>
  );
};
