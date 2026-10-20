/**
 * TaraNeonBrain.tsx
 * TARA AI Neon Brain Core Entity (image_24.png):
 * - Canvas particle code removed per user request
 * - Direct clean <img> tag showing TARA Neon Brain photo in large size
 * - Crystal clear ("saaf") presentation with bright glowing electric blue & cyan neon aura
 * - Audio-reactive pulse when speaking/listening
 * - Interactive tap/click to toggle hands-free voice call
 */

import React, { useEffect, useState } from 'react';
import { TaraEmotion } from '../types';
import { Mic, Volume2, Cpu, Zap, Activity } from 'lucide-react';

interface TaraNeonBrainProps {
  isSpeaking: boolean;
  isListening: boolean;
  isHandsFreeMode: boolean;
  currentEmotion?: TaraEmotion;
  onTapEntity?: () => void;
  className?: string;
}

export const TaraNeonBrain: React.FC<TaraNeonBrainProps> = ({
  isSpeaking,
  isListening,
  isHandsFreeMode,
  currentEmotion = 'calm_caring',
  onTapEntity,
  className = '',
}) => {
  const [pulseScale, setPulseScale] = useState(1.0);
  const [synapticCount, setSynapticCount] = useState(128.4);
  const [imgError, setImgError] = useState(false);

  // Audio-reactive pulsing loop
  useEffect(() => {
    let animId: number;
    let t = 0;

    const loop = () => {
      t += 0.05;
      const speed = isSpeaking ? 0.12 : isListening ? 0.08 : 0.04;
      const amp = isSpeaking ? 0.05 : isListening ? 0.03 : 0.015;
      const scale = 1.0 + Math.sin(t * (speed / 0.05)) * amp;
      setPulseScale(scale);
      animId = requestAnimationFrame(loop);
    };

    loop();
    return () => cancelAnimationFrame(animId);
  }, [isSpeaking, isListening]);

  // Jitter synaptic counter slightly for live telemetry feel
  useEffect(() => {
    const timer = setInterval(() => {
      setSynapticCount((prev) => {
        const delta = (Math.random() - 0.5) * 0.2;
        return Number((128.4 + delta).toFixed(1));
      });
    }, 2500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div
      className={`relative w-full h-full flex flex-col items-center justify-center select-none overflow-hidden ${className}`}
    >
      {/* 1. TOP HUD TELEMETRY BADGES ABOVE BRAIN */}
      <div className="absolute top-2 sm:top-4 inset-x-0 z-20 flex items-center justify-between px-4 sm:px-6 pointer-events-none font-mono text-[10px]">
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#020b1c]/85 border border-cyan-400/40 backdrop-blur-md shadow-[0_0_20px_rgba(0,240,255,0.25)] text-cyan-300">
          <Zap className="w-3 h-3 text-cyan-400 animate-pulse" />
          <span className="font-bold tracking-wider">TARA AI NEON BRAIN: ACTIVE</span>
        </div>
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-[#020b1c]/85 border border-cyan-400/40 backdrop-blur-md shadow-[0_0_20px_rgba(0,240,255,0.25)] text-cyan-300">
          <Cpu className="w-3 h-3 text-cyan-400" />
          <span>SYNAPSES: {synapticCount}T FLOPS</span>
        </div>
      </div>

      {/* 2. BRIGHT GLOWING BLUE AMBIENT RADIAL LIGHT & PULSING HALO */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {/* Deep ambient radial bloom */}
        <div
          className={`absolute w-[420px] sm:w-[580px] md:w-[700px] h-[420px] sm:h-[580px] md:h-[700px] rounded-full blur-[110px] transition-all duration-700 ${
            isSpeaking
              ? 'bg-cyan-400/35 scale-110'
              : isListening
              ? 'bg-rose-500/25 scale-105'
              : 'bg-cyan-500/25 scale-100'
          }`}
        />

        {/* Secondary electric neon blue inner pulse */}
        <div
          className={`absolute w-[300px] sm:w-[440px] md:w-[540px] h-[300px] sm:h-[440px] md:h-[540px] rounded-full blur-[70px] transition-all duration-500 ${
            isSpeaking
              ? 'bg-blue-500/40 animate-pulse'
              : isListening
              ? 'bg-rose-400/35 animate-pulse'
              : 'bg-blue-600/30'
          }`}
        />
      </div>

      {/* 3. LIGHTWEIGHT HOLOGRAPHIC ORBITAL RINGS */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
        <div
          className="w-[340px] sm:w-[460px] md:w-[560px] h-[340px] sm:h-[460px] md:h-[560px] rounded-full border border-cyan-400/25 border-dashed animate-[spin_40s_linear_infinite]"
          style={{
            boxShadow: '0 0 35px rgba(0, 240, 255, 0.15), inset 0 0 35px rgba(0, 240, 255, 0.08)',
          }}
        />
        <div
          className="absolute w-[280px] sm:w-[380px] md:w-[460px] h-[280px] sm:h-[380px] md:h-[460px] rounded-full border border-blue-400/30 animate-[spin_25s_linear_infinite_reverse]"
          style={{
            transform: 'rotateX(60deg)',
            boxShadow: '0 0 25px rgba(0, 140, 255, 0.2)',
          }}
        />
      </div>

      {/* 4. CENTERPIECE: SEEDHA <img> TAG WITH TARA NEON BRAIN PHOTO (BADE SIZE ME & BRIGHT GLOWING BLUE) */}
      <div
        onClick={onTapEntity}
        className="relative z-10 flex flex-col items-center justify-center cursor-pointer group transition-transform duration-300 hover:scale-105 active:scale-95"
        style={{
          transform: `scale(${pulseScale})`,
        }}
        title="TARA AI Neon Brain: क्लिक करके वॉयस कॉल शुरू/बंद करें"
      >
        {/* Large Clean Glowing Brain Image Container */}
        <div className="relative w-[300px] sm:w-[420px] md:w-[500px] lg:w-[580px] xl:w-[620px] max-h-[56vh] sm:max-h-[64vh] aspect-square flex items-center justify-center">
          {!imgError ? (
            <img
              src="/image_24.png"
              alt="TARA AI Neon Brain"
              loading="eager"
              decoding="async"
              onError={() => setImgError(true)}
              referrerPolicy="no-referrer"
              className="w-full h-full object-contain filter brightness-125 contrast-125 drop-shadow-[0_0_35px_#00f0ff] drop-shadow-[0_0_75px_rgba(0,119,255,0.85)] drop-shadow-[0_0_120px_rgba(0,240,255,0.45)] group-hover:drop-shadow-[0_0_90px_#00f0ff] transition-all duration-300 select-none pointer-events-none"
            />
          ) : (
            <svg
              viewBox="0 0 500 500"
              className="w-full h-full filter drop-shadow-[0_0_40px_#00f0ff]"
            >
              <defs>
                <linearGradient id="cyberNeonGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#00f0ff" />
                  <stop offset="50%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#00f0ff" />
                </linearGradient>
                <filter id="neonFilter" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="8" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              {/* Outer Brain Lobes */}
              <path
                d="M 250,90 C 180,90 120,130 110,200 C 100,270 140,330 180,360 C 210,380 230,410 250,420 C 270,410 290,380 320,360 C 360,330 400,270 390,200 C 380,130 320,90 250,90 Z"
                fill="none"
                stroke="#00f0ff"
                strokeWidth="4"
                filter="url(#neonFilter)"
              />
              {/* Longitudinal Fissure */}
              <line x1="250" y1="90" x2="250" y2="420" stroke="#00f0ff" strokeWidth="2.5" strokeDasharray="4 4" />
              {/* Sulci & Gyri Curves */}
              <path d="M 180,150 Q 230,170 200,220 T 160,280" fill="none" stroke="#38bdf8" strokeWidth="2.5" />
              <path d="M 320,150 Q 270,170 300,220 T 340,280" fill="none" stroke="#38bdf8" strokeWidth="2.5" />
              <path d="M 140,220 Q 190,240 170,300" fill="none" stroke="#00f0ff" strokeWidth="2" />
              <path d="M 360,220 Q 310,240 330,300" fill="none" stroke="#00f0ff" strokeWidth="2" />
              {/* Synaptic Nodes */}
              <circle cx="200" cy="170" r="5" fill="#ffffff" filter="url(#neonFilter)" />
              <circle cx="300" cy="170" r="5" fill="#ffffff" filter="url(#neonFilter)" />
              <circle cx="160" cy="240" r="4" fill="#00f0ff" filter="url(#neonFilter)" />
              <circle cx="340" cy="240" r="4" fill="#00f0ff" filter="url(#neonFilter)" />
              <circle cx="210" cy="330" r="5" fill="#38bdf8" filter="url(#neonFilter)" />
              <circle cx="290" cy="330" r="5" fill="#38bdf8" filter="url(#neonFilter)" />
            </svg>
          )}

          {/* Dynamic Laser Scanning Line Sweep across the brain */}
          <div className="absolute inset-0 overflow-hidden rounded-full pointer-events-none">
            <div className="w-full h-1 bg-gradient-to-r from-transparent via-cyan-300 to-transparent shadow-[0_0_20px_#00f0ff] animate-[bounce_4s_ease-in-out_infinite] opacity-80" />
          </div>
        </div>

        {/* 5. BOTTOM INTERACTIVE ACTION PILL (Click to Talk) */}
        <div className="mt-2 pointer-events-auto">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (onTapEntity) onTapEntity();
            }}
            className="px-5 py-2 rounded-full bg-[#020b1c]/90 hover:bg-[#031c44] border border-cyan-400/60 hover:border-cyan-300 backdrop-blur-md shadow-[0_0_30px_rgba(0,240,255,0.4)] flex items-center gap-2.5 font-mono text-[11px] sm:text-xs text-cyan-200 transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            <span
              className={`w-2.5 h-2.5 rounded-full transition-colors ${
                isHandsFreeMode
                  ? isListening
                    ? 'bg-rose-400 animate-ping'
                    : isSpeaking
                    ? 'bg-purple-400 animate-pulse'
                    : 'bg-emerald-400 shadow-[0_0_10px_#10b981]'
                  : 'bg-cyan-400 shadow-[0_0_10px_#00f0ff]'
              }`}
            />
            <span className="tracking-wider font-semibold">
              {isHandsFreeMode
                ? isListening
                  ? 'तारा सुन रही है...'
                  : isSpeaking
                  ? 'तारा बोल रही है...'
                  : 'वॉयस कॉल सक्रिय'
                : 'क्लिक करें: वॉयस कॉल शुरू करें'}
            </span>
            {isHandsFreeMode ? (
              <Volume2 className="w-3.5 h-3.5 text-cyan-300 animate-pulse" />
            ) : (
              <Mic className="w-3.5 h-3.5 text-cyan-400" />
            )}
          </button>
        </div>
      </div>

      {/* 6. HOLOGRAPHIC FLOOR EMITTER BASE UNDERNEATH THE BRAIN */}
      <div className="absolute bottom-1 inset-x-0 h-14 pointer-events-none flex items-center justify-center z-0">
        <div
          className="w-[280px] sm:w-[380px] md:w-[480px] h-12 rounded-full border border-cyan-500/40 bg-gradient-to-t from-cyan-950/40 to-transparent flex items-center justify-center shadow-[0_0_35px_rgba(0,240,255,0.25)]"
          style={{
            transform: 'rotateX(72deg)',
          }}
        >
          <div className="w-[180px] sm:w-[260px] md:w-[320px] h-8 rounded-full border border-cyan-400/50 border-dashed" />
          <div className="absolute w-[80px] sm:w-[120px] h-4 rounded-full bg-cyan-400/40 blur-sm" />
        </div>
      </div>
    </div>
  );
};
