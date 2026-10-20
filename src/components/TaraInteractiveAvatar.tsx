/**
 * TaraInteractiveAvatar.tsx
 * Full Interactive Talking Avatar for TARA with Glowing Circular Frame:
 * 
 * 1. Glowing Circular Avatar Frame:
 *    - Replaces rectangular video box with a futuristic, multi-layered glowing circular HUD frame.
 *    - Concentric orbital rings, rotating HUD arcs, cardinal angle ticks, and glowing neon rim.
 *    - Responsive reactive aura (Cyan for Standby, Purple/Neon for Speaking, Rose/Crimson for Listening).
 * 
 * 2. Uploaded Green Saree Photo (image_28.png):
 *    - Directly displays the user's uploaded portrait (/image_28.png) with fallback to /creator.jpg.
 *    - Smooth zoom/framing selector (Normal, Close-up, Full).
 * 
 * 3. Dynamic Facial & Voice Interactivity:
 *    - Natural eye-blink loop (3.5s - 5.5s intervals).
 *    - Dynamic lip-sync & speech-reactive audio pulsation when TARA speaks.
 *    - Attentive posture micro-tilt & breathing idle motion.
 *    - Biometric tracking crosshair & live audio equalizer visualizer.
 *    - One-click Voice Call toggle with tactile interactive status pill.
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  Mic,
  Volume2,
  Sparkles,
  Activity,
  Scan,
  Radio,
  Eye,
  Maximize2,
  RefreshCw,
  Layers,
} from 'lucide-react';
import { TaraEmotion } from '../types';

interface TaraInteractiveAvatarProps {
  isSpeaking: boolean;
  isListening: boolean;
  isHandsFreeMode: boolean;
  currentEmotion: TaraEmotion;
  onTapEntity?: () => void;
  className?: string;
}

export const TaraInteractiveAvatar: React.FC<TaraInteractiveAvatarProps> = ({
  isSpeaking,
  isListening,
  isHandsFreeMode,
  currentEmotion,
  onTapEntity,
  className = '',
}) => {
  const [imgSrc, setImgSrc] = useState<string>('/image_28.png');
  const [imgLoaded, setImgLoaded] = useState(false);
  const [mouthOpen, setMouthOpen] = useState(0); // 0 (closed) to 1 (wide open)
  const [mouthWidth, setMouthWidth] = useState(1);
  const [isBlinking, setIsBlinking] = useState(false);
  const [postureTilt, setPostureTilt] = useState({ x: 0, y: 0, rot: 0 });
  const [zoomMode, setZoomMode] = useState<'fit' | 'normal' | 'close'>('normal');
  const [audioBars, setAudioBars] = useState<number[]>([14, 22, 32, 40, 26, 18, 35, 42, 25, 18, 28, 36]);

  const animFrameRef = useRef<number | null>(null);
  const blinkTimerRef = useRef<NodeJS.Timeout | null>(null);
  const speechPhaseRef = useRef<number>(0);

  // 1. Natural Eye-Blink Loop (Triggers every 3.5 to 5.5 seconds naturally)
  useEffect(() => {
    let active = true;

    const scheduleNextBlink = () => {
      if (!active) return;
      const delay = 3200 + Math.random() * 2400; // 3.2s to 5.6s
      blinkTimerRef.current = setTimeout(() => {
        if (!active) return;
        setIsBlinking(true);
        setTimeout(() => {
          if (active) {
            setIsBlinking(false);
            scheduleNextBlink();
          }
        }, 130); // 130ms natural eye blink
      }, delay);
    };

    scheduleNextBlink();

    return () => {
      active = false;
      if (blinkTimerRef.current) clearTimeout(blinkTimerRef.current);
    };
  }, []);

  // 2. Dynamic Facial & Lip-Sync Animation Loop
  useEffect(() => {
    let startTime = performance.now();

    const loop = (now: number) => {
      const elapsed = (now - startTime) / 1000;

      // Natural breathing & micro posture changes (Gentle organic drift)
      const breath = Math.sin(elapsed * 1.5) * 0.7;
      const sway = Math.cos(elapsed * 0.9) * 0.9;
      const rot = Math.sin(elapsed * 0.7) * 0.35;

      if (isSpeaking) {
        // High-energy dynamic speech lip-sync simulation
        speechPhaseRef.current += 0.22;
        const phase = speechPhaseRef.current;

        // Vowel-like articulation synthesis
        const v1 = Math.abs(Math.sin(phase * 1.8));
        const v2 = Math.abs(Math.cos(phase * 1.1)) * 0.7;
        const rawMouth = Math.min(1, v1 * 0.65 + v2 * 0.35 + 0.08);

        setMouthOpen(rawMouth);
        setMouthWidth(0.85 + Math.sin(phase * 2.3) * 0.2);

        // Speech nods (subtle natural head nodding while talking)
        const speechNod = Math.sin(phase * 0.9) * 1.8;
        setPostureTilt({
          x: sway * 0.6,
          y: breath + speechNod,
          rot: rot + Math.sin(phase * 0.7) * 0.5,
        });

        // Speech-reactive audio wave visualization
        setAudioBars([
          12 + Math.random() * 25,
          18 + Math.random() * 32,
          24 + Math.random() * 45,
          32 + Math.random() * 55,
          26 + Math.random() * 48,
          16 + Math.random() * 30,
          22 + Math.random() * 40,
          30 + Math.random() * 52,
          35 + Math.random() * 58,
          24 + Math.random() * 42,
          18 + Math.random() * 30,
          14 + Math.random() * 22,
        ]);
      } else if (isListening) {
        // Attentive listening posture: slight forward tilt, still and focused
        setMouthOpen(0);
        setMouthWidth(1);
        setPostureTilt({
          x: sway * 0.4,
          y: breath * 0.5 - 2, // Slight attentive tilt forward
          rot: 0.8, // Curious tilted head
        });

        // Listening pulse bars
        const pulse = Math.abs(Math.sin(elapsed * 4));
        setAudioBars([
          8 + pulse * 14,
          12 + pulse * 20,
          18 + pulse * 28,
          24 + pulse * 34,
          20 + pulse * 28,
          14 + pulse * 20,
          18 + pulse * 26,
          26 + pulse * 36,
          22 + pulse * 30,
          15 + pulse * 22,
          10 + pulse * 16,
          6 + pulse * 12,
        ]);
      } else {
        // Idle state: soft closed mouth, natural relaxed posture
        setMouthOpen(0);
        setMouthWidth(1);
        setPostureTilt({
          x: sway,
          y: breath,
          rot: rot,
        });

        // Gentle idle wave
        const idleWave = Math.sin(elapsed * 2);
        setAudioBars([
          8 + Math.abs(idleWave) * 6,
          10 + Math.abs(idleWave) * 8,
          14 + Math.abs(idleWave) * 10,
          18 + Math.abs(idleWave) * 12,
          15 + Math.abs(idleWave) * 10,
          10 + Math.abs(idleWave) * 7,
          12 + Math.abs(idleWave) * 8,
          16 + Math.abs(idleWave) * 11,
          18 + Math.abs(idleWave) * 12,
          14 + Math.abs(idleWave) * 9,
          10 + Math.abs(idleWave) * 7,
          8 + Math.abs(idleWave) * 5,
        ]);
      }

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isSpeaking, isListening]);

  // Handle fallback if /image_28.png fails to load
  const handleImageError = () => {
    if (imgSrc === '/image_28.png') {
      setImgSrc('/creator.jpg');
    }
  };

  // Zoom scale styling
  const zoomStyles = {
    fit: 'scale-[1.0]',
    normal: 'scale-[1.08]',
    close: 'scale-[1.28] translate-y-[-4%]',
  }[zoomMode];

  // Dynamic Theme & Mood Glow styling
  const moodTheme = isListening
    ? {
        ringBorder: 'border-rose-400',
        glow: 'shadow-[0_0_60px_rgba(244,63,94,0.45),inset_0_0_25px_rgba(244,63,94,0.25)]',
        halo: 'from-rose-500/25 via-pink-500/10 to-transparent',
        accentText: 'text-rose-400',
        radarStroke: '#f43f5e',
        pillBorder: 'border-rose-400/80 text-rose-200 shadow-[0_0_20px_rgba(244,63,94,0.4)]',
        indicator: 'bg-rose-400 animate-ping',
        statusText: 'तारा सुन रही है...',
      }
    : isSpeaking
    ? {
        ringBorder: 'border-purple-400',
        glow: 'shadow-[0_0_70px_rgba(168,85,247,0.5),inset_0_0_30px_rgba(168,85,247,0.3)]',
        halo: 'from-purple-500/30 via-cyan-500/15 to-transparent',
        accentText: 'text-purple-300',
        radarStroke: '#c084fc',
        pillBorder: 'border-purple-400/80 text-purple-200 shadow-[0_0_25px_rgba(168,85,247,0.45)]',
        indicator: 'bg-purple-400 animate-pulse',
        statusText: 'तारा बोल रही है...',
      }
    : {
        ringBorder: 'border-cyan-400',
        glow: 'shadow-[0_0_55px_rgba(0,240,255,0.4),inset_0_0_25px_rgba(0,240,255,0.2)]',
        halo: 'from-cyan-500/20 via-blue-500/10 to-transparent',
        accentText: 'text-cyan-400',
        radarStroke: '#00f0ff',
        pillBorder: 'border-cyan-400/70 text-cyan-200 shadow-[0_0_20px_rgba(0,240,255,0.35)]',
        indicator: isHandsFreeMode ? 'bg-emerald-400 shadow-[0_0_10px_#10b981]' : 'bg-cyan-400 shadow-[0_0_10px_#00f0ff]',
        statusText: isHandsFreeMode ? 'वॉयस कॉल सक्रिय' : 'क्लिक करें: वॉयस कॉल शुरू करें',
      };

  return (
    <div
      className={`relative w-full h-full flex flex-col items-center justify-center select-none overflow-hidden ${className}`}
    >
      {/* 1. BACKGROUND HOLOGRAPHIC AMBIENT HALO */}
      <div
        className={`absolute w-[360px] sm:w-[480px] md:w-[560px] lg:w-[620px] aspect-square rounded-full bg-radial ${moodTheme.halo} blur-[75px] pointer-events-none transition-all duration-700`}
      />

      {/* 2. REVOLVING CONCENTRIC CYBERNETIC RINGS */}
      <div className="absolute w-[340px] sm:w-[440px] md:w-[510px] lg:w-[550px] aspect-square rounded-full border border-cyan-500/25 border-dashed animate-[spin_45s_linear_infinite] pointer-events-none" />
      <div className="absolute w-[370px] sm:w-[480px] md:w-[550px] lg:w-[590px] aspect-square rounded-full border border-cyan-400/20 border-dotted animate-[spin_60s_linear_infinite_reverse] pointer-events-none" />

      {/* 3. CENTRAL GLOWING CIRCULAR AVATAR CONTAINER */}
      <div className="relative z-10 flex flex-col items-center justify-center max-w-[94vw] max-h-[76vh]">
        {/* Floating Top Telemetry Pill */}
        <div className="mb-2 z-20 flex items-center gap-2 px-3 py-1 rounded-full bg-[#020a18]/85 border border-cyan-500/40 backdrop-blur-md font-mono text-[9px] sm:text-[10px] text-cyan-300 shadow-[0_0_15px_rgba(0,240,255,0.2)]">
          <span className={`w-2 h-2 rounded-full ${moodTheme.indicator}`} />
          <span className="font-bold tracking-wider">TARA AI • HOLOGRAPHIC AVATAR</span>
          <span className="text-cyan-500/70 hidden sm:inline">// 60 FPS</span>
          <span className="text-cyan-400/50">|</span>
          <span className="text-cyan-300 font-medium">LIP-SYNC: {isSpeaking ? 'ACTIVE' : 'READY'}</span>
        </div>

        {/* Circular Avatar Shell with Multi-layered Glowing Rings */}
        <div className="relative flex items-center justify-center">
          {/* Outer Pulsing Glow Aura */}
          <div
            className={`absolute -inset-4 sm:-inset-5 rounded-full border-2 ${moodTheme.ringBorder} opacity-30 animate-pulse pointer-events-none`}
          />

          {/* Rotating Circular HUD Reticle with Angle Markers (0°, 90°, 180°, 270°) */}
          <div className="absolute -inset-2.5 sm:-inset-3.5 rounded-full pointer-events-none z-20">
            {/* Top Tick */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-1 bg-cyan-400 shadow-[0_0_8px_#00f0ff] rounded-full" />
            {/* Bottom Tick */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-3.5 h-1 bg-cyan-400 shadow-[0_0_8px_#00f0ff] rounded-full" />
            {/* Left Tick */}
            <div className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-3.5 bg-cyan-400 shadow-[0_0_8px_#00f0ff] rounded-full" />
            {/* Right Tick */}
            <div className="absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 w-1 h-3.5 bg-cyan-400 shadow-[0_0_8px_#00f0ff] rounded-full" />

            {/* Orbiting Photon Light Particle */}
            <div className="absolute inset-0 rounded-full animate-[spin_8s_linear_infinite] pointer-events-none">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-cyan-300 shadow-[0_0_12px_#00f0ff,0_0_20px_#00f0ff]" />
            </div>
          </div>

          {/* MAIN GLOWING CIRCULAR FRAME WRAPPER */}
          <div
            onClick={onTapEntity}
            className={`group relative w-[270px] sm:w-[350px] md:w-[400px] lg:w-[430px] aspect-square rounded-full p-2 bg-gradient-to-b from-[#0b2444]/95 via-[#031024]/98 to-[#010610]/100 backdrop-blur-2xl border-2 ${moodTheme.ringBorder} ${moodTheme.glow} transition-all duration-500 cursor-pointer overflow-hidden flex items-center justify-center`}
            title="TARA AI Avatar • Click to toggle Voice Interaction"
          >
            {/* Inner Circular Metallic Bezel */}
            <div className="absolute inset-1 rounded-full border border-cyan-400/30 pointer-events-none z-20" />

            {/* Holographic Scanline Sweep Overlay */}
            <div className="absolute inset-0 rounded-full bg-[linear-gradient(rgba(0,240,255,0.03)_1px,transparent_1px)] bg-[size:100%_4px] pointer-events-none z-20 opacity-60" />
            <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent animate-[scan_4s_ease-in-out_infinite] pointer-events-none z-20" />

            {/* Central Circular Image Container with Natural Breathing and Tilt */}
            <div
              className="relative w-full h-full rounded-full overflow-hidden flex items-center justify-center transition-transform duration-100 ease-out shadow-inner"
              style={{
                transform: `translate3d(${postureTilt.x}px, ${postureTilt.y}px, 0) rotate(${postureTilt.rot}deg)`,
              }}
            >
              {/* Green Saree Avatar Photo (image_28.png) */}
              <img
                src={imgSrc}
                alt="TARA AI Interactive Avatar (Green Saree)"
                loading="eager"
                decoding="async"
                referrerPolicy="no-referrer"
                onLoad={() => setImgLoaded(true)}
                onError={handleImageError}
                className={`w-full h-full object-cover object-center select-none pointer-events-none transition-transform duration-500 ease-out ${zoomStyles}`}
              />

              {/* Holographic Inner Vignette Shadow for Seamless Circular Depth */}
              <div className="absolute inset-0 rounded-full shadow-[inset_0_0_35px_rgba(2,11,24,0.7)] pointer-events-none z-10" />

              {/* 4. DYNAMIC NATURAL EYE BLINK OVERLAY (Positioned over eyes ~35% from top) */}
              {isBlinking && (
                <div
                  className="absolute inset-x-0 z-15 pointer-events-none flex items-center justify-center"
                  style={{
                    top: '34%',
                    height: '9%',
                  }}
                >
                  {/* Left Eye Eyelid */}
                  <div
                    className="absolute rounded-full bg-[#1e131d]/85 backdrop-blur-[1px] shadow-inner transition-all duration-75"
                    style={{
                      left: '33%',
                      width: '13%',
                      height: '75%',
                    }}
                  />
                  {/* Right Eye Eyelid */}
                  <div
                    className="absolute rounded-full bg-[#1e131d]/85 backdrop-blur-[1px] shadow-inner transition-all duration-75"
                    style={{
                      right: '33%',
                      width: '13%',
                      height: '75%',
                    }}
                  />
                </div>
              )}

              {/* 5. DYNAMIC LIP-SYNCHRONIZATION & JAW MOVEMENT LAYER (~56% from top) */}
              <div
                className="absolute z-15 pointer-events-none flex items-center justify-center transition-all duration-75 ease-out"
                style={{
                  top: '56%',
                  left: '50%',
                  transform: `translateX(-50%) translateY(${mouthOpen * 2.2}px) scaleX(${mouthWidth})`,
                  width: '17%',
                  height: '11%',
                }}
              >
                {/* Dynamic Speech Articulation Mask */}
                {isSpeaking && mouthOpen > 0.08 && (
                  <div
                    className="w-full rounded-full bg-[#1b0a15]/90 shadow-[inset_0_2px_6px_rgba(0,0,0,0.85)] flex items-center justify-center border-t border-[#872d42]/40 transition-all duration-75"
                    style={{
                      height: `${Math.min(78, Math.max(14, mouthOpen * 65))}%`,
                      width: `${Math.min(94, Math.max(70, mouthWidth * 82))}%`,
                    }}
                  >
                    {/* Subtle inner teeth/lip highlight */}
                    <div className="w-[50%] h-[2px] bg-white/40 rounded-full mb-auto mt-[1px]" />
                  </div>
                )}

                {/* Cybernetic Lip-Sync Wireframe Ring while speaking */}
                {isSpeaking && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
                    <div className="w-full h-full border border-purple-400/50 rounded-full border-dashed animate-pulse" />
                  </div>
                )}
              </div>

              {/* Biometric Eye & Jaw Alignment Reticle */}
              <div className="absolute inset-0 pointer-events-none z-15 flex flex-col justify-between p-6">
                <div className="w-full flex items-center justify-between opacity-25 mt-9">
                  <div className="w-4 h-px bg-cyan-400" />
                  <div className="text-[7px] font-mono text-cyan-300 tracking-tighter">
                    RET_OPTIC // 0.38
                  </div>
                  <div className="w-4 h-px bg-cyan-400" />
                </div>

                <div className="w-full flex items-center justify-between opacity-25 mb-8">
                  <div className="w-4 h-px bg-cyan-400" />
                  <div className="text-[7px] font-mono text-cyan-300 tracking-tighter">
                    VOCAL_48K
                  </div>
                  <div className="w-4 h-px bg-cyan-400" />
                </div>
              </div>

              {/* Bottom In-Circle Audio Waveform Strip */}
              <div className="absolute bottom-0 inset-x-0 h-12 bg-gradient-to-t from-[#020816]/95 via-[#020816]/60 to-transparent z-20 flex flex-col items-center justify-end pb-2 pointer-events-none">
                <div className="flex items-center gap-1 mb-1">
                  {audioBars.map((h, i) => (
                    <div
                      key={i}
                      className={`w-1 rounded-full transition-all duration-75 ${
                        isSpeaking
                          ? 'bg-gradient-to-t from-purple-500 to-cyan-300'
                          : isListening
                          ? 'bg-gradient-to-t from-rose-500 to-amber-300'
                          : 'bg-cyan-500/40'
                      }`}
                      style={{ height: `${h * 0.38}px` }}
                    />
                  ))}
                </div>
                <div className="font-mono text-[8px] text-cyan-300/80 tracking-wider">
                  {isSpeaking ? 'VOICE: ACTIVE' : isListening ? 'INPUT: LISTENING' : 'TARA AI'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 6. AVATAR CONTROLS & STATUS PILL (Below glowing circle) */}
        <div className="mt-3.5 z-20 flex items-center gap-2">
          {/* Main Action Pill */}
          <button
            type="button"
            onClick={onTapEntity}
            className={`px-4 py-1.5 rounded-full bg-[#020b1c]/90 hover:bg-[#031c44] border backdrop-blur-md transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-2.5 font-mono text-[11px] sm:text-xs ${moodTheme.pillBorder}`}
          >
            <span className={`w-2.5 h-2.5 rounded-full transition-colors ${moodTheme.indicator}`} />
            <span className="tracking-wider font-semibold">
              {moodTheme.statusText}
            </span>
            {isSpeaking ? (
              <Volume2 className="w-3.5 h-3.5 text-purple-300 animate-pulse" />
            ) : isListening ? (
              <Radio className="w-3.5 h-3.5 text-rose-300 animate-pulse" />
            ) : (
              <Mic className="w-3.5 h-3.5 text-cyan-400" />
            )}
          </button>

          {/* Quick Framing / Zoom Switcher */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setZoomMode((prev) => (prev === 'fit' ? 'normal' : prev === 'normal' ? 'close' : 'fit'));
            }}
            className="p-1.5 rounded-full bg-[#020b1c]/80 hover:bg-[#031d47] border border-cyan-500/40 text-cyan-400 hover:text-cyan-200 transition-all text-[10px] font-mono flex items-center gap-1 px-2.5 shadow-[0_0_12px_rgba(0,240,255,0.2)]"
            title="Toggle Avatar Framing (Normal / Close-up / Full)"
          >
            <Maximize2 className="w-3 h-3 text-cyan-400" />
            <span className="text-[9px] uppercase font-bold">{zoomMode}</span>
          </button>
        </div>

        {/* 7. HOLOGRAPHIC EMITTER BASE (Floor pattern matching futuristic chamber) */}
        <div className="w-full flex items-center justify-center mt-2 pointer-events-none">
          <div
            className="w-[260px] sm:w-[340px] md:w-[400px] h-9 rounded-full border border-cyan-500/35 bg-gradient-to-t from-cyan-950/40 to-transparent flex items-center justify-center shadow-[0_0_25px_rgba(0,240,255,0.25)]"
            style={{ transform: 'rotateX(72deg)' }}
          >
            <div className="w-[170px] sm:w-[230px] md:w-[280px] h-6 rounded-full border border-cyan-400/40 border-dashed" />
            <div className="absolute w-[80px] sm:w-[120px] h-3 rounded-full bg-cyan-400/35 blur-sm" />
          </div>
        </div>
      </div>
    </div>
  );
};
