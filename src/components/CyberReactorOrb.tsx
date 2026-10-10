/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  MicOff, 
  Monitor, 
  MonitorOff, 
  Battery, 
  BatteryCharging, 
  Wifi, 
  Activity, 
  Sparkles, 
  Camera, 
  Volume2, 
  Zap,
  Radio,
  Flame,
  Heart,
  Smile,
  ShieldAlert,
  Upload,
  Image as ImageIcon,
  X,
  Brain
} from 'lucide-react';
import { LaptopTelemetry } from '../utils/laptopTelemetry';
import { audioSynth } from '../utils/audio';
import { TaraEmotion } from '../types';
import { TARA_EMOTION_CONFIGS } from '../utils/emotions';

interface CyberReactorOrbProps {
  isListening: boolean;
  isSpeaking: boolean;
  isHandsFreeMode?: boolean;
  currentEmotion?: TaraEmotion;
  onSelectEmotion?: (emotion: TaraEmotion) => void;
  onToggleVoice: () => void;
  onSendMessage: (text: string, media?: any) => void;
  laptopTelemetry: LaptopTelemetry;
  screenStream: MediaStream | null;
  onToggleScreenShare: () => void;
  onCaptureScreenSnapshot: () => void;
  onOpenCamera?: () => void;
  onOpenUploadPhoto?: () => void;
  onOpenMemoryVault?: () => void;
  attachedPhoto?: { name: string; previewUrl: string } | null;
  onClearAttachedPhoto?: () => void;
  className?: string;
}

export const CyberReactorOrb: React.FC<CyberReactorOrbProps> = ({
  isListening,
  isSpeaking,
  isHandsFreeMode = false,
  currentEmotion = 'calm_caring',
  onSelectEmotion,
  onToggleVoice,
  onSendMessage,
  laptopTelemetry,
  screenStream,
  onToggleScreenShare,
  onCaptureScreenSnapshot,
  onOpenCamera,
  onOpenUploadPhoto,
  onOpenMemoryVault,
  attachedPhoto,
  onClearAttachedPhoto,
  className = '',
}) => {
  const [rotation, setRotation] = useState<number>(0);
  const [pulseScale, setPulseScale] = useState<number>(1);
  const isScreenSharing = screenStream !== null;
  const emotionConfig = TARA_EMOTION_CONFIGS[currentEmotion] || TARA_EMOTION_CONFIGS.calm_caring;

  // Gyroscope rotation animation loop
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();

    const loop = (now: number) => {
      const dt = (now - lastTime) / 1000;
      lastTime = now;

      // Rotate speed: Fast energetic spin when speaking, smooth acoustic tracking when listening, calm idle
      const speed = isSpeaking ? 115 : isListening ? 60 : 25;
      setRotation((prev) => (prev + speed * dt) % 360);

      // Distinguish animations: Rhythmic heartbeat pulse when TARA speaks, gentle acoustic breath when listening
      if (isSpeaking) {
        // High-energy heartbeat expansion pulse for TARA speaking
        setPulseScale(1 + Math.sin(now / 110) * 0.14);
      } else if (isListening) {
        // Smooth receptive acoustic breath for user listening
        setPulseScale(1 + Math.sin(now / 320) * 0.05);
      } else {
        setPulseScale(1 + Math.sin(now / 800) * 0.02);
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isListening, isSpeaking]);

  return (
    <div className={`flex flex-col h-full bg-[#040814]/95 border border-cyan-500/40 rounded-xl overflow-hidden shadow-[0_0_30px_rgba(0,240,255,0.18)] relative backdrop-blur-md neon-hud-border ${className}`}>
      {/* Sci-Fi HUD Corner Brackets */}
      <div className="absolute top-0 left-0 w-3.5 h-3.5 border-t-2 border-l-2 border-cyan-400 z-20 pointer-events-none shadow-[0_0_8px_#00f0ff]" />
      <div className="absolute top-0 right-0 w-3.5 h-3.5 border-t-2 border-r-2 border-cyan-400 z-20 pointer-events-none shadow-[0_0_8px_#00f0ff]" />
      <div className="absolute bottom-0 left-0 w-3.5 h-3.5 border-b-2 border-l-2 border-cyan-400 z-20 pointer-events-none shadow-[0_0_8px_#00f0ff]" />
      <div className="absolute bottom-0 right-0 w-3.5 h-3.5 border-b-2 border-r-2 border-cyan-400 z-20 pointer-events-none shadow-[0_0_8px_#00f0ff]" />

      {/* 1. TOP TELEMETRY HUD BAR (Live Battery & Net Status + Emotional State Badge) */}
      <div className="px-3 py-1.5 bg-[#060e1d] border-b border-cyan-500/25 flex flex-wrap items-center justify-between gap-2 z-10 shrink-0 text-[10px] font-mono">
        {/* Core System Label & Emotional State Status Badge */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span className="font-bold text-cyan-300 tracking-wider">
              [TARA AI CORE]
            </span>
          </div>

          {/* VISUAL EMOTION INDICATOR (MOOD GLOW STATUS BADGE) */}
          <button
            type="button"
            onClick={() => {
              audioSynth.playSciFiClick();
              const nextEmotionMap: Record<TaraEmotion, TaraEmotion> = {
                calm_caring: 'happy_excited',
                happy_excited: 'empathy_support',
                empathy_support: 'calm_caring',
              };
              const next = nextEmotionMap[currentEmotion];
              onSelectEmotion?.(next);
              audioSynth.playEmotionFeedback(next);
            }}
            className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[10px] font-mono font-bold cursor-pointer transition-all hover:scale-105 active:scale-95 shadow-md ${emotionConfig.badgeClasses}`}
            title={`TARA का भावनात्मक भाव: ${emotionConfig.label} (${emotionConfig.sublabel})\n${emotionConfig.description}\nक्लिक करके मूड बदलें (Cycle Emotional State)`}
          >
            <Heart className="w-3 h-3 animate-pulse" />
            <span className="text-slate-300">भाव:</span>
            <span>{emotionConfig.emoji} {emotionConfig.label}</span>
            <span 
              className="w-1.5 h-1.5 rounded-full animate-ping ml-0.5" 
              style={{ backgroundColor: emotionConfig.glowColorHex }} 
            />
          </button>
        </div>

        {/* Live Laptop Battery & Network Telemetry */}
        <div className="flex items-center gap-2.5">
          {/* Laptop Battery Live */}
          <div 
            className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#030914] border border-cyan-500/30 text-cyan-200"
            title={`Laptop Battery: ${laptopTelemetry.batteryLevel}% (${laptopTelemetry.batteryStatusText})`}
          >
            {laptopTelemetry.isCharging ? (
              <BatteryCharging className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            ) : (
              <Battery className="w-3.5 h-3.5 text-cyan-400" />
            )}
            <span className="font-bold text-white">{laptopTelemetry.batteryLevel}%</span>
            <span className="text-[9px] text-slate-400 hidden sm:inline">
              {laptopTelemetry.isCharging ? '⚡ CHG' : 'BAT'}
            </span>
          </div>

          {/* Laptop Net Live */}
          <div 
            className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#030914] border border-cyan-500/30 text-emerald-300"
            title={`Network: ${laptopTelemetry.networkType} • Latency: ${laptopTelemetry.latencyMs}ms`}
          >
            <Wifi className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-bold">{laptopTelemetry.latencyMs}ms</span>
            <span className="text-[9px] text-slate-400 hidden sm:inline">{laptopTelemetry.networkType}</span>
          </div>
        </div>
      </div>

      {/* 2. CENTER NEON GLOWING AI CORE (ARC REACTOR ORB WITH EMOTION GLOW RING) */}
      <div className="relative flex-1 min-h-[170px] flex items-center justify-center overflow-hidden p-2">
        {/* Ambient Plasma Glow behind Core (Dynamically shaded by Emotion State) */}
        <div 
          className="absolute w-52 h-52 rounded-full blur-[48px] pointer-events-none transition-all duration-700"
          style={{
            background: isListening 
              ? 'radial-gradient(circle, rgba(244, 63, 94, 0.55) 0%, rgba(225, 29, 72, 0.25) 50%, transparent 70%)'
              : isSpeaking 
              ? 'radial-gradient(circle, rgba(16, 185, 129, 0.55) 0%, rgba(5, 150, 105, 0.25) 50%, transparent 70%)'
              : currentEmotion === 'happy_excited'
              ? 'radial-gradient(circle, rgba(251, 191, 36, 0.55) 0%, rgba(245, 158, 11, 0.25) 50%, transparent 70%)'
              : currentEmotion === 'empathy_support'
              ? 'radial-gradient(circle, rgba(192, 132, 252, 0.55) 0%, rgba(236, 72, 153, 0.25) 50%, transparent 70%)'
              : 'radial-gradient(circle, rgba(0, 240, 255, 0.45) 0%, rgba(16, 185, 129, 0.2) 50%, transparent 70%)',
          }}
        />

        {/* VISUAL EMOTION GLOWING RING (Changes color with mood: Green/Blue, Gold/Yellow, Purple/Soft Pink) */}
        <div 
          className="absolute w-48 h-48 sm:w-52 sm:h-52 rounded-full pointer-events-none transition-all duration-700 animate-pulse"
          style={{
            border: `2px solid ${emotionConfig.glowColorHex}`,
            boxShadow: `0 0 35px ${emotionConfig.glowColorHex}88, inset 0 0 20px ${emotionConfig.glowColorHex}44`,
          }}
        />

        {/* 1. CONCENTRIC INCOMING LISTENING WAVES (Active when user speaks) */}
        {isListening && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
            <div className="w-36 h-36 rounded-full border-2 border-rose-400/90 shadow-[0_0_30px_rgba(244,63,94,0.7)] animate-listen-wave" />
            <div className="w-36 h-36 rounded-full border-2 border-cyan-400/80 shadow-[0_0_30px_rgba(0,240,255,0.6)] animate-wave-ripple-2" />
            <div className="w-36 h-36 rounded-full border border-rose-500/50 shadow-[0_0_40px_rgba(244,63,94,0.4)] animate-wave-ripple-3" />
          </div>
        )}

        {/* 2. HIGH-ENERGY PULSE SHOCKWAVES & GLOWING AURA (Active when TARA speaks) */}
        {isSpeaking && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
            <div className="w-44 h-44 rounded-full border-2 border-emerald-400/90 shadow-[0_0_45px_rgba(16,185,129,0.85)] animate-speaking-pulse" />
            <div className="w-52 h-52 rounded-full border border-cyan-400/70 shadow-[0_0_50px_rgba(0,240,255,0.6)] animate-ping opacity-40" />
            <div className="w-36 h-36 rounded-full bg-emerald-500/10 blur-xl animate-pulse" />
          </div>
        )}

        {/* DANCING AUDIO EQUALIZER BARS (Left Side) */}
        <div className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 flex items-end gap-1 h-14 pointer-events-none z-10">
          {[14, 28, 42, 22, 36, 18, 48, 26].map((h, i) => (
            <div
              key={i}
              className={`w-1 rounded-full transition-all duration-150 ${
                isListening
                  ? 'bg-gradient-to-t from-rose-600 via-rose-400 to-rose-200'
                  : isSpeaking
                  ? 'bg-gradient-to-t from-emerald-600 via-emerald-400 to-emerald-200'
                  : 'bg-cyan-500/25'
              } ${isListening || isSpeaking ? 'animate-audio-bar' : ''}`}
              style={{
                height: isListening || isSpeaking ? `${h}px` : '6px',
                animationDelay: `${i * 0.09}s`,
                animationDuration: `${0.45 + (i % 3) * 0.15}s`,
              }}
            />
          ))}
        </div>

        {/* DANCING AUDIO EQUALIZER BARS (Right Side) */}
        <div className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 flex items-end gap-1 h-14 pointer-events-none z-10">
          {[26, 48, 18, 36, 22, 42, 28, 14].map((h, i) => (
            <div
              key={i}
              className={`w-1 rounded-full transition-all duration-150 ${
                isListening
                  ? 'bg-gradient-to-t from-rose-600 via-rose-400 to-rose-200'
                  : isSpeaking
                  ? 'bg-gradient-to-t from-emerald-600 via-emerald-400 to-emerald-200'
                  : 'bg-cyan-500/25'
              } ${isListening || isSpeaking ? 'animate-audio-bar' : ''}`}
              style={{
                height: isListening || isSpeaking ? `${h}px` : '6px',
                animationDelay: `${i * 0.1}s`,
                animationDuration: `${0.45 + ((7 - i) % 3) * 0.15}s`,
              }}
            />
          ))}
        </div>

        {/* Multi-Ring Arc Reactor SVG */}
        <div 
          className="relative w-44 h-44 sm:w-48 sm:h-48 flex items-center justify-center transition-transform duration-300"
          style={{ transform: `scale(${pulseScale})` }}
        >
          {/* Outer Gyro Ring (Rotating Clockwise) */}
          <svg 
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{ transform: `rotate(${rotation}deg)` }}
            viewBox="0 0 200 200"
          >
            <circle cx="100" cy="100" r="92" fill="none" stroke="#00f0ff" strokeWidth="1" strokeOpacity="0.4" strokeDasharray="4 6" />
            <circle cx="100" cy="100" r="86" fill="none" stroke="#0284c7" strokeWidth="1.5" strokeOpacity="0.6" strokeDasharray="14 12" />
            {/* Degree Markings */}
            {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
              <line 
                key={deg} 
                x1="100" 
                y1="5" 
                x2="100" 
                y2="12" 
                stroke="#00f0ff" 
                strokeWidth="1.5" 
                transform={`rotate(${deg} 100 100)`} 
              />
            ))}
          </svg>

          {/* Middle Counter-Rotating Gyro Ring (Counter-Clockwise) */}
          <svg 
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{ transform: `rotate(${-rotation * 1.4}deg)` }}
            viewBox="0 0 200 200"
          >
            <circle cx="100" cy="100" r="74" fill="none" stroke="#38bdf8" strokeWidth="2" strokeDasharray="24 16" strokeOpacity="0.75" />
            <circle cx="100" cy="100" r="64" fill="none" stroke="#00f0ff" strokeWidth="1" strokeDasharray="6 8" strokeOpacity="0.5" />
            {/* Plasma Node Emitters */}
            {[30, 90, 150, 210, 270, 330].map((deg) => (
              <circle 
                key={deg} 
                cx="100" 
                cy="26" 
                r="3" 
                fill="#ffffff" 
                stroke="#00f0ff" 
                strokeWidth="1" 
                transform={`rotate(${deg} 100 100)`} 
              />
            ))}
          </svg>

          {/* Inner Audio Visualizer Plasma Waveform Ring */}
          <svg 
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox="0 0 200 200"
          >
            <circle 
              cx="100" 
              cy="100" 
              r="52" 
              fill="none" 
              stroke={isSpeaking ? "#10b981" : isListening ? "#f43f5e" : "#00f0ff"} 
              strokeWidth="2.5" 
              strokeOpacity="0.85" 
              className={isSpeaking ? "animate-speaking-pulse" : isListening ? "animate-pulse" : ""}
            />
          </svg>

          {/* Central Interactive "START AI" Reactor Core Button */}
          <button
            type="button"
            onClick={() => {
              audioSynth.playSciFiClick();
              onToggleVoice();
            }}
            className={`relative z-10 w-24 h-24 rounded-full flex flex-col items-center justify-center transition-all duration-300 cursor-pointer shadow-2xl active:scale-95 group ${
              isSpeaking
                ? 'bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-400 border-2 border-emerald-300 shadow-[0_0_50px_rgba(16,185,129,0.95)] animate-speaking-pulse'
                : isListening
                ? 'bg-gradient-to-tr from-rose-700 via-red-600 to-rose-500 border-2 border-rose-300 shadow-[0_0_40px_rgba(244,63,94,0.9)] animate-pulse'
                : isHandsFreeMode
                ? 'bg-gradient-to-tr from-amber-700 via-amber-600 to-orange-500 border-2 border-amber-300 shadow-[0_0_35px_rgba(245,158,11,0.8)]'
                : 'bg-gradient-to-tr from-cyan-900 via-sky-600 to-blue-700 border-2 border-cyan-300 shadow-[0_0_30px_rgba(0,240,255,0.6)] hover:scale-105'
            }`}
            title={
              isSpeaking
                ? 'TARA बोल रही हैं (Audio Response Speaking)'
                : isListening
                ? 'माइक सुन रहा है — आप बोलिए'
                : isHandsFreeMode
                ? '100% हैंड्स-फ्री कॉल चालू है — बंद करने के लिए क्लिक करें'
                : 'AI प्रारंभ करें (Click to Start Hands-Free Voice)'
            }
          >
            {/* Center Icon */}
            {isSpeaking ? (
              <Volume2 className="w-8 h-8 text-white animate-bounce" />
            ) : isListening ? (
              <Mic className="w-8 h-8 text-white animate-pulse" />
            ) : isHandsFreeMode ? (
              <Radio className="w-8 h-8 text-white animate-spin" />
            ) : (
              <Zap className="w-8 h-8 text-white group-hover:scale-110 transition-transform" />
            )}

            {/* Core Label */}
            <span className="text-[9px] font-mono font-black text-white tracking-widest uppercase mt-0.5 drop-shadow">
              {isSpeaking
                ? 'SPEAKING'
                : isListening
                ? 'LISTENING'
                : isHandsFreeMode
                ? 'CALL ACTIVE'
                : 'START AI'}
            </span>
          </button>
        </div>

        {/* Live Core Status Readout (Overlay at Bottom Center of Orb Area) */}
        <div className="absolute bottom-1 inset-x-0 flex items-center justify-center pointer-events-none px-2">
          <div className="px-3 py-0.5 rounded-full bg-[#030914]/95 border border-cyan-500/40 text-[9px] font-mono flex items-center gap-1.5 shadow-[0_0_15px_rgba(0,240,255,0.2)] max-w-full truncate">
            <span
              className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                isListening
                  ? 'bg-rose-400 animate-ping'
                  : isSpeaking
                  ? 'bg-emerald-400 animate-pulse'
                  : isHandsFreeMode
                  ? 'bg-amber-400 animate-ping'
                  : 'animate-pulse'
              }`}
              style={{
                backgroundColor: !isListening && !isSpeaking && !isHandsFreeMode ? emotionConfig.glowColorHex : undefined,
              }}
            />
            <span className="text-cyan-200 font-medium truncate">
              {isHandsFreeMode && isListening
                ? '📞 हैंड्स-फ्री कॉल: आप बोलिए (Silence VAD On)...'
                : isSpeaking
                ? `🔊 TARA बोल रही हैं (${emotionConfig.emoji} ${emotionConfig.label})...`
                : isHandsFreeMode
                ? '⚡ TARA सोच रही हैं • बोलते ही माइक चालू रहेगा'
                : `TARA • भाव: ${emotionConfig.emoji} ${emotionConfig.label} — "START AI" दबाएं`}
            </span>
          </div>
        </div>
      </div>

      {/* 3. CAMERA, PHOTO ATTACHMENT & HUD CONTROLS */}
      <div className="p-2.5 bg-[#050c1b] border-t border-cyan-500/20 flex flex-wrap items-center justify-between gap-2 shrink-0">
        {/* Camera, File Photo & Screen Share Action Buttons */}
        <div className="flex flex-wrap items-center gap-1.5">
          {/* Direct Live Camera Snapshot Button */}
          {onOpenCamera && (
            <button
              type="button"
              onClick={() => {
                audioSynth.playSciFiClick();
                onOpenCamera();
              }}
              className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-600 to-sky-600 hover:from-cyan-500 hover:to-sky-500 text-slate-950 font-bold font-mono text-[11px] flex items-center gap-1.5 cursor-pointer shadow-[0_0_15px_rgba(0,240,255,0.35)] transition-all hover:scale-105 active:scale-95"
              title="कैमरा खोलकर लाइव फ़ोटो खींचें (Snap Photo with Live Camera)"
            >
              <Camera className="w-3.5 h-3.5 text-slate-950" />
              <span>📸 कैमरा (फ़ोटो खींचो)</span>
            </button>
          )}

          {/* Direct File Photo Upload Button */}
          {onOpenUploadPhoto && (
            <button
              type="button"
              onClick={() => {
                audioSynth.playSciFiClick();
                onOpenUploadPhoto();
              }}
              className="px-3 py-1.5 rounded-lg bg-cyan-950/90 hover:bg-cyan-900 border border-cyan-400/60 text-cyan-200 font-mono font-bold text-[11px] flex items-center gap-1.5 cursor-pointer transition-all hover:scale-105 active:scale-95 shadow-sm"
              title="फ़ाइल या गैलरी से फ़ोटो जोड़ें (Upload Photo from Files)"
            >
              <Upload className="w-3.5 h-3.5 text-cyan-400" />
              <span>📁 फ़ोटो जोड़ें (फ़ाइल)</span>
            </button>
          )}

          {/* Cognitive Human Memory Vault Button */}
          {onOpenMemoryVault && (
            <button
              type="button"
              onClick={() => {
                audioSynth.playSciFiClick();
                onOpenMemoryVault();
              }}
              className="px-3 py-1.5 rounded-lg bg-purple-950/90 hover:bg-purple-900 border border-purple-400/60 text-purple-200 font-mono font-bold text-[11px] flex items-center gap-1.5 cursor-pointer transition-all hover:scale-105 active:scale-95 shadow-sm"
              title="तारा की याददाश्त (Memory & Human Intellect Vault)"
            >
              <Brain className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
              <span>🧠 याददाश्त (Memory)</span>
            </button>
          )}

          {/* Attached Photo Preview Badge */}
          {attachedPhoto && (
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-emerald-950/90 border border-emerald-400/60 text-emerald-200 text-[10px] font-mono shadow-[0_0_10px_rgba(16,185,129,0.3)] animate-pulse">
              <img
                src={attachedPhoto.previewUrl}
                alt="Attached Preview"
                className="w-5 h-5 rounded object-cover border border-emerald-400/50"
              />
              <span className="max-w-[70px] truncate">{attachedPhoto.name}</span>
              {onClearAttachedPhoto && (
                <button
                  type="button"
                  onClick={() => {
                    audioSynth.playSciFiClick();
                    onClearAttachedPhoto();
                  }}
                  className="hover:text-rose-400 cursor-pointer ml-0.5"
                  title="फ़ोटो हटाएं"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          )}

          {/* Screen Share Action Button */}
          <button
            type="button"
            onClick={() => {
              audioSynth.playSciFiClick();
              onToggleScreenShare();
            }}
            className={`px-2.5 py-1.5 rounded-lg text-[11px] font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm ${
              isScreenSharing
                ? 'bg-rose-950/90 border border-rose-500/60 text-rose-200 hover:bg-rose-900 shadow-[0_0_12px_rgba(244,63,94,0.3)]'
                : 'bg-slate-900/90 border border-slate-700 hover:border-cyan-500/50 text-slate-300 hover:text-cyan-200'
            }`}
          >
            {isScreenSharing ? (
              <>
                <MonitorOff className="w-3.5 h-3.5 text-rose-400" />
                <span>🛑 स्क्रीन शेयर बंद</span>
              </>
            ) : (
              <>
                <Monitor className="w-3.5 h-3.5 text-slate-400" />
                <span>🖥️ स्क्रीन शेयर</span>
              </>
            )}
          </button>

          {/* Snapshot Vision Button if screen is shared */}
          {isScreenSharing && (
            <button
              type="button"
              onClick={() => {
                audioSynth.playSciFiClick();
                onCaptureScreenSnapshot();
              }}
              className="px-2.5 py-1.5 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-400/60 text-emerald-200 text-[11px] font-mono font-bold flex items-center gap-1 transition-all cursor-pointer shadow-sm"
              title="Capture active screen frame and ask TARA to inspect it"
            >
              <Camera className="w-3.5 h-3.5 text-emerald-400" />
              <span>स्क्रीन का विश्लेषण</span>
            </button>
          )}
        </div>

        {/* Quick Voice Prompt Shortcuts (Human Intellect, Memory & Friend Conversation) */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => {
              audioSynth.playSciFiClick();
              onSendMessage('तारा, तुम्हें मेरे बारे में क्या-क्या याद है? बताओ');
            }}
            className="px-2 py-1 rounded bg-[#030914] hover:bg-purple-950 border border-purple-500/40 text-[10px] font-mono text-purple-300 transition-colors whitespace-nowrap cursor-pointer shadow-sm"
            title="Active Photographic Memory: Ask Tara what she remembers about you"
          >
            🧠 तुम्हें क्या याद है?
          </button>
          <button
            type="button"
            onClick={() => {
              audioSynth.playSciFiClick();
              onSendMessage('तारा, प्रकाश की गति क्या है और गुरुत्वाकर्षण कैसे काम करता है? फटाफट समझाओ');
            }}
            className="px-2 py-1 rounded bg-[#030914] hover:bg-cyan-950 border border-cyan-500/40 text-[10px] font-mono text-cyan-300 transition-colors whitespace-nowrap cursor-pointer shadow-sm"
            title="High Intellect: Ask deep scientific and scholarly questions"
          >
            ⚡ होशियार जवाब (विज्ञान व ज्ञान)
          </button>
          <button
            type="button"
            onClick={() => {
              audioSynth.playSciFiClick();
              onSendMessage('तारा, आज बहुत काम था और मैं बहुत थक गया हूँ');
            }}
            className="px-2 py-1 rounded bg-[#030914] hover:bg-purple-950 border border-purple-500/30 text-[10px] font-mono text-purple-300 transition-colors whitespace-nowrap cursor-pointer"
            title="Emotional Intelligence: Test sympathy & comforting friend response"
          >
            💜 थकान व टेंशन (हमदर्द दोस्त)
          </button>
          <button
            type="button"
            onClick={() => {
              audioSynth.playSciFiClick();
              onSendMessage('तारा, आज बहुत बड़ी खुशखबरी है, बहुत खुश हूँ!');
            }}
            className="px-2 py-1 rounded bg-[#030914] hover:bg-amber-950 border border-amber-500/30 text-[10px] font-mono text-amber-300 transition-colors whitespace-nowrap cursor-pointer"
            title="Emotional Intelligence: Test celebratory happy response"
          >
            💛 खुशखबरी (जश्न व बधाई)
          </button>
          <button
            type="button"
            onClick={() => {
              audioSynth.playSciFiClick();
              onSendMessage('तारा, मेरी फोटो देखकर बताओ कैसी लग रही है?');
            }}
            className="px-2 py-1 rounded bg-[#030914] hover:bg-cyan-950 border border-cyan-500/25 text-[10px] font-mono text-cyan-300 transition-colors whitespace-nowrap cursor-pointer"
          >
            📸 फोटो कैसी है?
          </button>
          <button
            type="button"
            onClick={() => {
              audioSynth.playSciFiClick();
              onSendMessage('तारा, एक बहुत सुंदर और प्रेरणादायक सुविचार सुनाओ');
            }}
            className="px-2 py-1 rounded bg-[#030914] hover:bg-emerald-950 border border-emerald-500/25 text-[10px] font-mono text-emerald-300 transition-colors whitespace-nowrap cursor-pointer"
          >
            🌸 प्यारा सुविचार
          </button>
        </div>
      </div>
    </div>
  );
};
