/**
 * HologramTopBar.tsx
 * Clean 3-Zone Sci-Fi Operating System Top Bar for TARA:
 * - Left: TARA OS brand + live state indicator (Thinking / Speaking / Listening)
 * - Center: Responsive View Switcher (Diagnostic Matrix / Core Hub / Chat & HUD)
 * - Right: Single-line functional controls (Voice Loop, Speaker TTS, Replay, Language, Clock)
 */

import React, { useEffect, useState } from 'react';
import {
  Volume2,
  VolumeX,
  Phone,
  PhoneOff,
  Clock,
  Activity,
  Orbit,
  MessageSquare,
  RotateCcw,
} from 'lucide-react';
import { TaraEmotion } from '../types';
import { speechEngine } from '../utils/speech';

interface HologramTopBarProps {
  currentEmotion: TaraEmotion;
  isSpeaking: boolean;
  isListening: boolean;
  isThinking?: boolean;
  isHandsFreeMode?: boolean;
  onToggleVoice?: () => void;
  isStrangerDetected: boolean;
  onVerifyBossAccess?: () => void;
  onReplayLastAudio?: () => void;
  voiceLang: string;
  onToggleVoiceLang?: () => void;
  activeView: 'diagnostics' | 'entity' | 'dialogue';
  onSelectView: (view: 'diagnostics' | 'entity' | 'dialogue') => void;
}

export const HologramTopBar: React.FC<HologramTopBarProps> = ({
  isSpeaking,
  isListening,
  isThinking = false,
  isHandsFreeMode = false,
  onToggleVoice,
  onReplayLastAudio,
  voiceLang,
  onToggleVoiceLang,
  activeView,
  onSelectView,
}) => {
  const [timeStr, setTimeStr] = useState('');
  const [isTtsActive, setIsTtsActive] = useState<boolean>(() => speechEngine.getIsTtsEnabled());

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString('en-US', {
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
        })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 15000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const syncTts = setInterval(() => {
      setIsTtsActive(speechEngine.getIsTtsEnabled());
    }, 800);
    return () => clearInterval(syncTts);
  }, []);

  const liveStateText = isListening
    ? 'सुन रही हूँ'
    : isThinking
    ? 'सोच रही हूँ'
    : isSpeaking
    ? 'बोल रही हूँ'
    : isHandsFreeMode
    ? 'कॉल सक्रिय'
    : 'तैयार';

  return (
    <header className="w-full shrink-0 z-30 px-3 sm:px-6 py-2.5 bg-[#030816]/95 border-b border-cyan-500/25 backdrop-blur-md select-none">
      <div className="w-full max-w-[1600px] mx-auto flex items-center justify-between gap-4">
        {/* Zone 1: Brand & Live Core State */}
        <div className="flex items-center gap-3 min-w-0 shrink-0">
          <h1 className="font-heading font-bold text-base sm:text-lg tracking-wider text-cyan-200 whitespace-nowrap shrink-0">
            TARA OS
          </h1>
          <span className="hidden sm:inline text-cyan-500/40" aria-hidden="true">/</span>
          <span
            className={`hidden sm:inline text-xs font-mono whitespace-nowrap shrink-0 ${
              isListening
                ? 'text-emerald-300'
                : isThinking
                ? 'text-sky-300'
                : isSpeaking
                ? 'text-cyan-300'
                : 'text-slate-400'
            }`}
          >
            {liveStateText}
          </span>
        </div>

        {/* Zone 2: Section Switcher (Essential on Mobile/Tablet, quick focus on Desktop) */}
        <nav
          aria-label="Dashboard sections"
          className="flex items-center gap-1 p-1 rounded-xl bg-[#041024] border border-cyan-500/30 shrink-0"
        >
          <button
            type="button"
            onClick={() => onSelectView('diagnostics')}
            className={`px-2.5 sm:px-3 py-1.5 rounded-lg font-mono text-xs font-medium flex items-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap shrink-0 ${
              activeView === 'diagnostics'
                ? 'bg-cyan-500/30 text-white border border-cyan-400/60'
                : 'text-slate-400 hover:text-cyan-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden md:inline">Diagnostics</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectView('entity')}
            className={`px-2.5 sm:px-3 py-1.5 rounded-lg font-mono text-xs font-medium flex items-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap shrink-0 ${
              activeView === 'entity'
                ? 'bg-cyan-500/30 text-white border border-cyan-400/60'
                : 'text-slate-400 hover:text-cyan-200'
            }`}
          >
            <Orbit className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden md:inline">Core Hub</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectView('dialogue')}
            className={`px-2.5 sm:px-3 py-1.5 rounded-lg font-mono text-xs font-medium flex items-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap shrink-0 ${
              activeView === 'dialogue'
                ? 'bg-cyan-500/30 text-white border border-cyan-400/60'
                : 'text-slate-400 hover:text-cyan-200'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden md:inline">Chat & HUD</span>
          </button>
        </nav>

        {/* Zone 3: Primary Controls */}
        <div className="flex items-center gap-2 shrink-0">
          {timeStr && (
            <div className="hidden xl:flex items-center gap-1.5 text-xs font-mono tabular-nums text-slate-400 px-2">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>{timeStr}</span>
            </div>
          )}

          <button
            type="button"
            onClick={() => {
              speechEngine.unlockSpeech();
              const enabled = speechEngine.toggleTts();
              setIsTtsActive(enabled);
            }}
            className={`px-2.5 py-1.5 rounded-lg border text-xs font-mono flex items-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap shrink-0 ${
              isTtsActive
                ? 'bg-cyan-950/80 hover:bg-cyan-900 border-cyan-400/60 text-cyan-200'
                : 'bg-rose-950/70 hover:bg-rose-900 border-rose-500/50 text-rose-200'
            }`}
            title={isTtsActive ? 'स्पीकर चालू है' : 'स्पीकर बंद है'}
          >
            {isTtsActive ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{isTtsActive ? 'स्पीकर ON' : 'स्पीकर OFF'}</span>
          </button>

          {onReplayLastAudio && (
            <button
              type="button"
              onClick={() => {
                speechEngine.unlockSpeech();
                onReplayLastAudio();
              }}
              className="p-1.5 rounded-lg bg-[#041024] hover:bg-cyan-950 border border-cyan-500/35 text-cyan-300 cursor-pointer transition-colors shrink-0"
              title="आखिरी जवाब दोबारा सुनें"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            type="button"
            onClick={onToggleVoiceLang}
            className="px-2.5 py-1.5 rounded-lg bg-[#041024] hover:bg-cyan-950 border border-cyan-500/35 text-cyan-200 font-mono text-xs cursor-pointer transition-colors whitespace-nowrap shrink-0"
            title="भाषा बदलें"
          >
            {voiceLang === 'hi-IN' ? 'हिन्दी' : 'EN'}
          </button>

          {onToggleVoice && (
            <button
              type="button"
              onClick={() => {
                speechEngine.unlockSpeech();
                onToggleVoice();
              }}
              className={`px-3 py-1.5 rounded-lg font-medium text-xs flex items-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap shrink-0 ${
                isHandsFreeMode
                  ? 'bg-rose-600 hover:bg-rose-500 text-white'
                  : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold'
              }`}
            >
              {isHandsFreeMode ? (
                <>
                  <PhoneOff className="w-3.5 h-3.5" />
                  <span>कॉल बंद</span>
                </>
              ) : (
                <>
                  <Phone className="w-3.5 h-3.5" />
                  <span>कॉल शुरू</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
