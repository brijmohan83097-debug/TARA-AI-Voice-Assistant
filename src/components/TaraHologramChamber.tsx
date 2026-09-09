/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Sparkles, Cpu, Mic, AudioWaveform, UserCheck } from 'lucide-react';

interface TaraHologramChamberProps {
  isSpeaking: boolean;
  isListening: boolean;
  themeColor: 'cyan' | 'purple' | 'orange' | 'emerald';
  visualizerMode: 'wave' | 'orb' | 'matrix' | 'aurora';
  avatarType: 'tara' | 'user';
  onToggleAvatar: () => void;
  onTapAvatar: () => void;
}

// Permanently fixed creator avatar asset
const PERMANENT_CREATOR_AVATAR = '/creator.jpg';

export const TaraHologramChamber: React.FC<TaraHologramChamberProps> = ({
  isSpeaking,
  isListening,
  themeColor,
  visualizerMode,
  avatarType,
  onToggleAvatar,
  onTapAvatar,
}) => {
  const [imageError, setImageError] = useState(false);

  // Avatar source based on selection: permanently locked to /creator.jpg for creator
  const avatarSrc = avatarType === 'user' 
    ? PERMANENT_CREATOR_AVATAR 
    : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80';

  // Theme color maps
  const colorMap = {
    cyan: {
      border: 'border-cyan-500/40',
      glow: 'shadow-[0_0_35px_rgba(0,240,255,0.25)]',
      horizon: 'from-transparent via-cyan-400 to-transparent',
      ringBorder: 'border-cyan-400/50',
      orbitDash: '#00f0ff',
      badgeBg: 'bg-cyan-950/90 border-cyan-500/60 text-cyan-300',
      textAccent: 'text-cyan-400',
      avatarRing: 'border-cyan-400 shadow-[0_0_30px_rgba(0,240,255,0.4)]',
    },
    purple: {
      border: 'border-purple-500/40',
      glow: 'shadow-[0_0_35px_rgba(168,85,247,0.25)]',
      horizon: 'from-transparent via-purple-400 to-transparent',
      ringBorder: 'border-purple-400/50',
      orbitDash: '#a855f7',
      badgeBg: 'bg-purple-950/90 border-purple-500/60 text-purple-300',
      textAccent: 'text-purple-400',
      avatarRing: 'border-purple-400 shadow-[0_0_30px_rgba(168,85,247,0.4)]',
    },
    orange: {
      border: 'border-orange-500/40',
      glow: 'shadow-[0_0_35px_rgba(249,115,22,0.25)]',
      horizon: 'from-transparent via-orange-400 to-transparent',
      ringBorder: 'border-orange-400/50',
      orbitDash: '#f97316',
      badgeBg: 'bg-orange-950/90 border-orange-500/60 text-orange-300',
      textAccent: 'text-orange-400',
      avatarRing: 'border-orange-400 shadow-[0_0_30px_rgba(249,115,22,0.4)]',
    },
    emerald: {
      border: 'border-emerald-500/40',
      glow: 'shadow-[0_0_35px_rgba(16,185,129,0.25)]',
      horizon: 'from-transparent via-emerald-400 to-transparent',
      ringBorder: 'border-emerald-400/50',
      orbitDash: '#10b981',
      badgeBg: 'bg-emerald-950/90 border-emerald-500/60 text-emerald-300',
      textAccent: 'text-emerald-400',
      avatarRing: 'border-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.4)]',
    },
  };

  const theme = colorMap[themeColor] || colorMap.cyan;

  return (
    <div className={`relative w-full rounded-2xl overflow-hidden bg-gradient-to-b from-[#0c1933] via-[#091326] to-[#060e1d] border ${theme.border} ${theme.glow} transition-all duration-300`}>
      {/* Corner Bracket Accents */}
      <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-cyan-400/60 pointer-events-none z-20" />
      <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-cyan-400/60 pointer-events-none z-20" />
      <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-cyan-400/60 pointer-events-none z-20" />
      <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-cyan-400/60 pointer-events-none z-20" />

      {/* Cyber Grid Background */}
      <div className="absolute inset-0 cyber-grid-dense opacity-20 pointer-events-none" />

      {/* Center Cyan Laser Horizon Line */}
      <div className="absolute top-1/2 left-0 right-0 h-[2px] -translate-y-1/2 pointer-events-none z-0">
        <div className={`w-full h-full bg-gradient-to-r ${theme.horizon} opacity-80 blur-[1px]`} />
        <div className={`w-full h-[6px] -mt-[2px] bg-gradient-to-r ${theme.horizon} opacity-40 blur-[4px]`} />
      </div>

      {/* Visualizer Mode Background Animations */}
      {visualizerMode === 'matrix' && (
        <div className="absolute inset-0 opacity-15 pointer-events-none font-mono text-[9px] text-cyan-400 flex justify-around overflow-hidden">
          <div className="animate-pulse">01011001 11001010 00110101</div>
          <div className="animate-pulse delay-100">TARA_QUANTUM_CORE_ACTIVE</div>
          <div className="animate-pulse delay-200">10100101 01010111 11100010</div>
        </div>
      )}

      {visualizerMode === 'aurora' && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-10 left-1/4 w-1/2 h-32 bg-cyan-500/10 blur-[50px] animate-pulse" />
          <div className="absolute -bottom-10 right-1/4 w-1/2 h-32 bg-purple-500/10 blur-[50px] animate-pulse delay-300" />
        </div>
      )}

      {/* Main Center Hologram Stage */}
      <div className="relative z-10 flex flex-col items-center justify-center pt-8 pb-5 px-4 min-h-[290px] sm:min-h-[320px]">
        {/* Orbital System Container */}
        <div className="relative w-52 h-52 sm:w-60 sm:h-60 flex items-center justify-center">
          {/* Outer Concentric Orbital Ring with Dashes & Ticks */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none animate-[spin_40s_linear_infinite]" viewBox="0 0 240 240">
            {/* Dashed circular orbit */}
            <circle
              cx="120"
              cy="120"
              r="105"
              fill="none"
              stroke={theme.orbitDash}
              strokeWidth="1.2"
              strokeDasharray="4 8"
              opacity="0.5"
            />
            {/* Precision Radar Ticks at 12, 3, 6, 9 o'clock */}
            <line x1="120" y1="5" x2="120" y2="18" stroke={theme.orbitDash} strokeWidth="2.5" opacity="0.8" />
            <line x1="120" y1="222" x2="120" y2="235" stroke={theme.orbitDash} strokeWidth="2.5" opacity="0.8" />
            <line x1="5" y1="120" x2="18" y2="120" stroke={theme.orbitDash} strokeWidth="2.5" opacity="0.8" />
            <line x1="222" y1="120" x2="235" y2="120" stroke={theme.orbitDash} strokeWidth="2.5" opacity="0.8" />
          </svg>

          {/* Inner Counter-Rotating Fine Ring */}
          <div className="absolute inset-4 rounded-full border border-cyan-500/20 border-dashed animate-[spin_60s_linear_infinite_reverse] pointer-events-none" />

          {/* Active Speaking Soundwave Ripples */}
          {isSpeaking && (
            <>
              <div className="absolute inset-0 rounded-full border-2 border-emerald-400/40 animate-ping pointer-events-none" />
              <div className="absolute -inset-4 rounded-full border border-cyan-400/30 animate-pulse pointer-events-none" />
            </>
          )}

          {/* Active Listening Pulse Ring */}
          {isListening && (
            <div className="absolute -inset-2 rounded-full border-2 border-rose-500/60 animate-pulse pointer-events-none shadow-[0_0_25px_rgba(244,63,94,0.4)]" />
          )}

          {/* Orbit Satellite Badge 1: Top-Right Verified Creator Locked Badge */}
          <div
            className="absolute top-2 right-4 z-20 w-8 h-8 rounded-full bg-slate-950/90 border-2 border-cyan-400/90 shadow-[0_0_12px_rgba(0,240,255,0.5)] flex items-center justify-center text-cyan-300"
            title="क्रिएटर प्रोफ़ाइल स्थायी रूप से सुरक्षित (Creator: Mr. Brijmohan Kumar)"
          >
            <UserCheck className="w-4 h-4 text-emerald-400" />
          </div>

          {/* Orbit Satellite Badge 2: Top-Left Switch/Sparkles Badge ✨ */}
          <button
            type="button"
            onClick={onToggleAvatar}
            className="absolute top-2 left-4 z-20 w-8 h-8 rounded-full bg-slate-950/90 border-2 border-amber-400/80 shadow-[0_0_12px_rgba(251,191,36,0.5)] flex items-center justify-center cursor-pointer hover:scale-110 active:scale-95 transition-transform"
            title="Switch Profile (Creator / Tara AI)"
          >
            <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
          </button>

          {/* Orbit Satellite Badge 3: Bottom-Left Cyan Gear Badge ⚙️ */}
          <div 
            onClick={onTapAvatar}
            className="absolute bottom-4 left-6 z-20 w-8 h-8 rounded-full bg-slate-950/90 border-2 border-cyan-400/80 shadow-[0_0_12px_rgba(0,240,255,0.5)] flex items-center justify-center cursor-pointer hover:scale-110 active:scale-95 transition-transform"
            title="Tara Cognitive Synapse Core"
          >
            <Cpu className="w-4 h-4 text-cyan-300" />
          </div>

          {/* Central Circular Avatar Chamber */}
          <div 
            onClick={onTapAvatar}
            className={`relative z-10 w-32 h-32 sm:w-36 sm:h-36 rounded-full p-1 bg-gradient-to-tr from-cyan-500/40 via-purple-500/30 to-blue-500/40 border-2 ${theme.avatarRing} cursor-pointer group transition-all duration-300 hover:scale-105`}
          >
            <div className="w-full h-full rounded-full overflow-hidden bg-slate-950 relative shadow-inner">
              {!imageError ? (
                <img
                  src={avatarSrc}
                  alt={avatarType === 'user' ? 'Mr. Brijmohan Kumar (Creator)' : 'Tara Assistant'}
                  className="w-full h-full object-cover rounded-full filter contrast-105 group-hover:scale-105 transition-transform duration-300"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    const target = e.currentTarget;
                    if (avatarType === 'user') {
                      if (target.src.includes('/creator.jpg')) {
                        target.src = '/user_avatar.jpg';
                      } else if (target.src.includes('/user_avatar.jpg')) {
                        target.src = '/api/avatar';
                      } else {
                        setImageError(true);
                      }
                    } else {
                      setImageError(true);
                    }
                  }}
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-cyan-950 via-slate-900 to-cyan-900 text-cyan-300">
                  <Sparkles className="w-8 h-8 text-cyan-400 animate-pulse" />
                  <span className="text-[10px] font-mono text-cyan-200 mt-1">
                    {avatarType === 'user' ? 'CREATOR' : 'TARA'}
                  </span>
                </div>
              )}

              {/* Active Voice Overlay Indicator */}
              {isSpeaking && (
                <div className="absolute inset-0 bg-emerald-950/40 backdrop-blur-[1px] flex items-center justify-center">
                  <AudioWaveform className="w-10 h-10 text-emerald-400 animate-bounce" />
                </div>
              )}

              {isListening && (
                <div className="absolute inset-0 bg-rose-950/40 backdrop-blur-[1px] flex items-center justify-center">
                  <Mic className="w-10 h-10 text-rose-400 animate-pulse" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Permanent Creator Identity Lock Badge */}
        <div className="mt-2.5 flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-[10.5px] font-mono text-cyan-300 shadow-[0_0_10px_rgba(0,240,255,0.1)]">
          <UserCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>क्रिएटर प्रोफ़ाइल: मिस्टर बृजमोहन कुमार (स्थायी)</span>
        </div>

        {/* Bottom Label Line: Creator Identity & Status */}
        <div className="mt-3 flex items-center justify-between w-full max-w-sm px-2">
          {/* Left Text: BRIJMOHAN / Creator or TARA / Quantum */}
          <div className="flex items-center gap-1.5">
            <span className="font-heading font-black text-sm sm:text-base tracking-wider text-slate-100 uppercase">
              {avatarType === 'user' ? 'BRIJMOHAN' : 'TARA'}
            </span>
            <span className="text-slate-500 font-mono text-sm">/</span>
            <span className="font-mono text-xs text-cyan-400 font-medium">
              {avatarType === 'user' ? 'Creator' : 'Quantum'}
            </span>
          </div>

          {/* Right Status Pill */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#052b36]/90 border border-cyan-500/50 shadow-[0_0_10px_rgba(0,240,255,0.15)]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#00ff9d] animate-pulse" />
            <span className="text-[11px] font-mono font-bold text-cyan-300 tracking-wide">
              {avatarType === 'user' ? 'बृजमोहन • ऑनलाइन' : 'TARA READY • तैयार'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
