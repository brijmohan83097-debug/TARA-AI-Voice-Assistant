/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState, useEffect } from 'react';
import { 
  Mic, 
  MicOff, 
  Zap, 
  Volume2, 
  AudioWaveform, 
  Radio, 
  Sparkles, 
  VolumeX, 
  PhoneIncoming, 
  PhoneCall, 
  PhoneOff, 
  X,
  Camera,
  Image as ImageIcon,
  ChevronUp
} from 'lucide-react';
import { NativeCallState } from '../services/nativeBridge';
import { AttachedMedia } from '../types';
import { audioSynth } from '../utils/audio';

interface TaraVoiceActionCardProps {
  isListening: boolean;
  isSpeaking: boolean;
  isAutoLoop: boolean;
  onToggleAutoLoop: () => void;
  isAlwaysListening: boolean;
  onToggleAlwaysListening: () => void;
  onStartVoice: () => void;
  onStopVoice: () => void;
  voiceLang: 'hi-IN' | 'en-US';
  onToggleLang: () => void;
  isTtsEnabled: boolean;
  onToggleTts: () => void;
  callState?: NativeCallState;
  onAnswerCall?: () => void;
  onRejectCall?: () => void;
  onSimulateIncomingCall?: () => void;
  attachedMedia?: AttachedMedia | null;
  onAttachMedia?: (media: AttachedMedia) => void;
  onClearAttachedMedia?: () => void;
  onQuickAskAboutPhoto?: (promptText: string) => void;
}

export const TaraVoiceActionCard: React.FC<TaraVoiceActionCardProps> = ({
  isListening,
  isSpeaking,
  isAutoLoop,
  onToggleAutoLoop,
  isAlwaysListening,
  onToggleAlwaysListening,
  onStartVoice,
  onStopVoice,
  voiceLang,
  onToggleLang,
  isTtsEnabled,
  onToggleTts,
  callState,
  onAnswerCall,
  onRejectCall,
  onSimulateIncomingCall,
  attachedMedia,
  onAttachMedia,
  onClearAttachedMedia,
  onQuickAskAboutPhoto,
}) => {
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const [showVoicePhotoMenu, setShowVoicePhotoMenu] = useState(false);
  const photoMenuRef = useRef<HTMLDivElement>(null);

  // Close menu if clicked outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        photoMenuRef.current && 
        !photoMenuRef.current.contains(event.target as Node)
      ) {
        setShowVoicePhotoMenu(false);
      }
    };

    if (showVoicePhotoMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showVoicePhotoMenu]);

  const handleTogglePhotoMenu = () => {
    audioSynth.playClick();
    setShowVoicePhotoMenu((prev) => !prev);
  };

  const handleTriggerCamera = () => {
    audioSynth.playClick();
    setShowVoicePhotoMenu(false);
    cameraInputRef.current?.click();
  };

  const handleTriggerGallery = () => {
    audioSynth.playClick();
    setShowVoicePhotoMenu(false);
    galleryInputRef.current?.click();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    audioSynth.playClick();
    const reader = new FileReader();
    reader.onload = () => {
      const fullDataUrl = reader.result as string;
      const base64Data = fullDataUrl.split(',')[1] || fullDataUrl;
      const mimeType = file.type || 'image/jpeg';
      if (onAttachMedia) {
        onAttachMedia({
          data: base64Data,
          mimeType,
          previewUrl: fullDataUrl,
          name: file.name || 'कैमरा फ़ोटो',
          source: 'upload',
        });
      }
    };
    reader.readAsDataURL(file);
    setShowVoicePhotoMenu(false);
    e.target.value = '';
  };
  return (
    <div className="w-full rounded-2xl bg-[#0a1324]/95 border border-cyan-500/30 p-4 sm:p-5 shadow-[0_4px_25px_rgba(0,0,0,0.5)] backdrop-blur-md">
      {/* Top Status Header */}
      <div className="flex items-center justify-between gap-3 mb-3.5 flex-wrap">
        <div className="flex items-center gap-2">
          {/* Animated Status Dot */}
          <span className="relative flex h-3 w-3 shrink-0">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
              isListening ? 'bg-rose-400' : isSpeaking ? 'bg-emerald-400' : isAlwaysListening ? 'bg-purple-400' : 'bg-cyan-400'
            }`} />
            <span className={`relative inline-flex rounded-full h-3 w-3 ${
              isListening 
                ? 'bg-rose-500 shadow-[0_0_8px_#f43f5e]' 
                : isSpeaking 
                ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' 
                : isAlwaysListening
                ? 'bg-purple-500 shadow-[0_0_8px_#a855f7]'
                : 'bg-cyan-400 shadow-[0_0_8px_#00f0ff]'
            }`} />
          </span>

          {/* Title & Subtitle */}
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-heading font-bold text-xs sm:text-sm text-slate-100 tracking-wide">
                तारा ऑनलाइन • READY TO TALK
              </span>
              {isAlwaysListening && (
                <span className="px-1.5 py-0.5 rounded bg-purple-950/80 border border-purple-500/50 text-[10px] font-mono text-purple-300 font-bold animate-pulse">
                  HOTWORD READY
                </span>
              )}
            </div>
            <div className="flex items-center gap-1 text-[11px] text-cyan-300/80 font-mono mt-0.5">
              <Zap className="w-3 h-3 text-amber-400 shrink-0" />
              <span>
                {isAlwaysListening 
                  ? 'सतत श्रवण (Always Listening) • बोलें "तारा"' 
                  : isAutoLoop 
                  ? 'सतत लूप सक्रिय (Auto-Loop Active)' 
                  : 'हाथ-मुक्त आवाज़ सहायक (Hands-Free Ready)'}
              </span>
            </div>
          </div>
        </div>

        {/* Action Toggles: Always Listening & Auto-Loop */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Always Listening / Hotword Toggle */}
          <button
            onClick={onToggleAlwaysListening}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl font-mono text-xs font-semibold transition-all duration-200 active:scale-95 ${
              isAlwaysListening
                ? 'bg-purple-950/90 border border-purple-500/70 text-purple-300 shadow-[0_0_12px_rgba(168,85,247,0.35)]'
                : 'bg-slate-900 border border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
            title="Toggle Always Listening / Hotword mode (Wake Word: 'तारा' / 'Tara')"
          >
            <Radio className={`w-3.5 h-3.5 ${isAlwaysListening ? 'text-purple-400 animate-pulse' : 'text-slate-500'}`} />
            <span>Always Listening</span>
          </button>

          {/* Auto-Loop Toggle */}
          <button
            onClick={onToggleAutoLoop}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl font-mono text-xs font-semibold transition-all duration-200 active:scale-95 ${
              isAutoLoop
                ? 'bg-emerald-950/80 border border-emerald-500/60 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                : 'bg-slate-900 border border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
            title="Toggle Continuous Conversation Loop"
          >
            <Zap className={`w-3.5 h-3.5 ${isAutoLoop ? 'text-emerald-400 fill-emerald-400 animate-pulse' : 'text-slate-500'}`} />
            <span>Auto-Loop</span>
          </button>
        </div>
      </div>

      {/* ANDROID TELECOM CALL BANNER (If incoming or active call) */}
      {callState?.hasIncomingCall && (
        <div className="mb-3.5 p-3 rounded-xl bg-gradient-to-r from-cyan-950 via-slate-900 to-indigo-950 border border-cyan-400/60 shadow-[0_0_20px_rgba(0,240,255,0.3)] flex items-center justify-between gap-3 animate-pulse">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/60 flex items-center justify-center text-emerald-400">
              <PhoneIncoming className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-cyan-200">
                  आगामी कॉल (Incoming Call)
                </span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-900/60 border border-cyan-500/40 text-cyan-300">
                  {callState.callType === 'whatsapp' ? 'WhatsApp' : 'Cellular'}
                </span>
              </div>
              <p className="text-sm font-heading font-bold text-white">
                {callState.callerName || 'राहुल शर्मा (Rahul Sharma)'}
              </p>
              <p className="text-[11px] font-mono text-slate-300">
                {callState.callerNumber || '+91 98765 43210'} • बोलें: "फोन उठाओ" या "कॉल काटो"
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onAnswerCall}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold flex items-center gap-1 shadow-md active:scale-95 transition-all"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>उठाओ</span>
            </button>
            <button
              onClick={onRejectCall}
              className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-mono text-xs font-bold flex items-center gap-1 shadow-md active:scale-95 transition-all"
            >
              <PhoneOff className="w-3.5 h-3.5" />
              <span>काटो</span>
            </button>
          </div>
        </div>
      )}

      {callState?.isCallActive && (
        <div className="mb-3.5 p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/50 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/30 flex items-center justify-center text-emerald-300">
              <PhoneCall className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <span className="text-xs font-mono font-bold text-emerald-300">
                कॉल जारी है (Call in Progress)
              </span>
              <p className="text-xs font-heading text-slate-200">
                {callState.callerName || 'सक्रिय बातचीत'} • बोलें: "कॉल काट दो"
              </p>
            </div>
          </div>
          <button
            onClick={onRejectCall}
            className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-mono text-xs font-bold flex items-center gap-1 shadow-md active:scale-95 transition-all"
          >
            <PhoneOff className="w-3.5 h-3.5" />
            <span>समाप्त करें</span>
          </button>
        </div>
      )}

      {/* ATTACHED IMAGE INDICATOR BADGE (Directly Above Mic Button) */}
      {attachedMedia && (
        <div className="mb-3.5 p-3 rounded-xl bg-gradient-to-r from-[#061e2d] via-[#092237] to-[#0c1a2e] border border-cyan-400/60 shadow-[0_0_20px_rgba(0,240,255,0.25)] flex flex-col gap-2.5 transition-all">
          <div className="flex items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5 min-w-0">
              {/* Thumbnail Preview with glow */}
              <div className="relative shrink-0">
                <img
                  src={attachedMedia.previewUrl}
                  alt="Attached"
                  className="w-12 h-12 object-cover rounded-lg border-2 border-cyan-400 shadow-[0_0_12px_rgba(0,240,255,0.4)] bg-slate-950"
                />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-slate-950 animate-ping" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-950" />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs font-mono font-bold text-cyan-200 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    फोटो जुड़ी हुई है (Image Attached)
                  </span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-950/90 border border-cyan-500/50 text-cyan-300 font-mono">
                    Vision & OCR
                  </span>
                </div>
                <p className="text-xs font-sans text-slate-300 truncate mt-0.5">
                  {attachedMedia.name || 'कैमरा फ़ोटो'} • <span className="text-emerald-400 font-medium">तारा से बोलकर पूछें</span>
                </p>
              </div>
            </div>

            {/* Action Buttons: Re-snap or Detach */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={handleTogglePhotoMenu}
                className="px-2.5 py-1.5 rounded-lg bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-300 text-xs font-mono flex items-center gap-1 transition-all active:scale-95 cursor-pointer"
                title="फ़ोटो बदलें"
              >
                <Camera className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">फ़ोटो बदलें</span>
              </button>

              {onClearAttachedMedia && (
                <button
                  onClick={onClearAttachedMedia}
                  className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-rose-950/80 border border-slate-700 hover:border-rose-500/50 text-slate-400 hover:text-rose-300 transition-all text-xs font-mono flex items-center gap-1 shrink-0 active:scale-95"
                  title="फोटो हटाएं (Detach Image)"
                >
                  <X className="w-4 h-4" />
                  <span className="hidden sm:inline">हटाएं</span>
                </button>
              )}
            </div>
          </div>

          {/* Quick One-Tap Question Prompts on the Image */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar text-[11px] font-mono">
            <span className="text-slate-400 text-[10px] shrink-0">तुरंत पूछें:</span>
            {[
              'इस फोटो में क्या लिखा है?',
              'यह क्या दिख रहा है?',
              'दस्तावेज़ का हिसाब बताएं',
              'मेरा फोटो बनाओ',
            ].map((promptText, idx) => (
              <button
                key={idx}
                onClick={() => onQuickAskAboutPhoto && onQuickAskAboutPhoto(promptText)}
                className="px-2.5 py-1 rounded-lg bg-cyan-950/70 hover:bg-cyan-900 border border-cyan-500/40 hover:border-cyan-300 text-cyan-200 shrink-0 transition-all active:scale-95 flex items-center gap-1"
              >
                <span>{promptText}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Microphone Button + Clean Camera/Upload Icon */}
      <div className="w-full flex items-stretch gap-2.5 sm:gap-3">
        {/* Main Prominent Cyan Gradient Button */}
        <button
          onClick={isListening ? onStopVoice : onStartVoice}
          className={`flex-1 min-w-0 relative group overflow-hidden rounded-xl sm:rounded-2xl transition-all duration-300 active:scale-[0.98] shadow-lg flex items-center justify-start p-3.5 sm:p-5 ${
            isListening
              ? 'bg-gradient-to-r from-rose-600 via-rose-500 to-red-600 text-white shadow-[0_0_35px_rgba(244,63,94,0.5)] border border-rose-400'
              : isSpeaking
              ? 'bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-600 text-white shadow-[0_0_35px_rgba(16,185,129,0.5)] border border-emerald-400 animate-pulse'
              : attachedMedia
              ? 'bg-gradient-to-r from-[#0096c7] via-[#023e8a] to-[#0077b6] hover:from-[#00b4d8] hover:to-[#0096c7] text-white shadow-[0_0_35px_rgba(0,180,216,0.5)] border-2 border-cyan-300 animate-pulse'
              : isAlwaysListening
              ? 'bg-gradient-to-r from-[#7c3aed] via-[#6366f1] to-[#0ea5e9] hover:from-[#8b5cf6] hover:to-[#38bdf8] text-white shadow-[0_0_30px_rgba(124,58,237,0.45)] border border-purple-300/60'
              : 'bg-gradient-to-r from-[#00b4d8] via-[#0096c7] to-[#0077b6] hover:from-[#00c2e8] hover:to-[#0086c7] text-white shadow-[0_0_30px_rgba(0,180,216,0.4)] border border-cyan-300/60'
          }`}
        >
          {/* Shimmer Light Reflection Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none" />

          <div className="flex items-center gap-3 sm:gap-4 relative z-10 min-w-0">
            {/* Glass Circle Mic Icon */}
            <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center backdrop-blur-md transition-transform duration-300 group-hover:scale-105 shrink-0 ${
              isListening 
                ? 'bg-white/25 text-white animate-bounce' 
                : isSpeaking
                ? 'bg-white/25 text-white'
                : 'bg-white/20 text-white border border-white/30 shadow-inner'
            }`}>
              {isListening ? (
                <MicOff className="w-5 h-5 sm:w-6 sm:h-6" />
              ) : isSpeaking ? (
                <AudioWaveform className="w-5 h-5 sm:w-6 sm:h-6 animate-pulse" />
              ) : attachedMedia ? (
                <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-200 animate-bounce" />
              ) : (
                <Mic className="w-5 h-5 sm:w-6 sm:h-6" />
              )}
            </div>

            {/* Button Text */}
            <div className="text-left min-w-0">
              <h3 className="font-heading font-extrabold text-base sm:text-lg tracking-wide text-white drop-shadow-sm truncate">
                {isListening 
                  ? 'सुन रहे हैं... (Listening)' 
                  : isSpeaking 
                  ? 'तारा बोल रही है... (Speaking)' 
                  : attachedMedia
                  ? 'फ़ोटो के बारे में पूछें'
                  : isAlwaysListening
                  ? 'सतत श्रवण सक्रिय • "तारा" बोलें'
                  : 'तारा से बात करें'}
              </h3>
              <p className="text-[11px] sm:text-xs font-mono font-medium text-cyan-100/90 tracking-wider uppercase mt-0.5 truncate">
                {isListening 
                  ? 'TAP TO STOP RECORDING' 
                  : isSpeaking 
                  ? 'VOICE AUDIO ACTIVE' 
                  : attachedMedia
                  ? 'PHOTO ATTACHED • TAP TO SPEAK'
                  : isAlwaysListening
                  ? 'ALWAYS LISTENING • HOTWORD READY'
                  : voiceLang === 'hi-IN' ? 'TAP TO SPEAK (HINDI)' : 'TAP TO SPEAK (ENGLISH)'}
              </p>
            </div>
          </div>

          {/* Live Audio Visualizer Bars if Listening/Speaking */}
          {(isListening || isSpeaking || isAlwaysListening) && (
            <div className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 hidden xs:flex items-center gap-1">
              {[40, 70, 100, 60, 90, 50, 80].map((h, i) => (
                <div
                  key={i}
                  className="w-1 bg-white rounded-full animate-pulse"
                  style={{
                    height: isAlwaysListening && !isListening && !isSpeaking ? `${h * 0.4}%` : `${h}%`,
                    animationDuration: `${0.4 + i * 0.15}s`,
                  }}
                />
              ))}
            </div>
          )}
        </button>

        {/* Single Clean 'Camera / Upload' Icon Right Next to Mic Button with Dual Options */}
        <div className="relative shrink-0 flex items-stretch gap-1" ref={photoMenuRef}>
          {/* 1. Direct Native Camera Input */}
          <input
            type="file"
            ref={cameraInputRef}
            accept="image/*"
            capture="environment"
            onChange={handleFileSelect}
            className="hidden"
            id="tara-voice-camera-capture-input"
          />

          {/* 2. Standard Native Gallery / Files Input */}
          <input
            type="file"
            ref={galleryInputRef}
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            id="tara-voice-gallery-upload-input"
          />

          {/* Dual Photo Options Popup */}
          {showVoicePhotoMenu && (
            <div 
              className="absolute bottom-full right-0 mb-2 z-50 w-60 rounded-2xl bg-[#091528]/95 border border-cyan-500/40 p-2.5 shadow-[0_12px_36px_rgba(0,0,0,0.85)] backdrop-blur-xl animate-in fade-in slide-in-from-bottom-2 duration-150"
            >
              <div className="text-[10px] font-mono text-cyan-400/90 px-2 py-1 uppercase tracking-wider font-semibold border-b border-cyan-900/60 mb-2 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Camera className="w-3 h-3 text-cyan-400" />
                  <span>फ़ोटो स्रोत (Photo Source)</span>
                </span>
                <button 
                  type="button" 
                  onClick={() => setShowVoicePhotoMenu(false)}
                  className="text-slate-400 hover:text-white p-0.5 rounded cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-1">
                {/* Option 1: Live Camera */}
                <button
                  type="button"
                  onClick={handleTriggerCamera}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-cyan-500/15 active:bg-cyan-500/25 text-slate-100 hover:text-cyan-300 transition-all text-left cursor-pointer group"
                >
                  <div className="w-7 h-7 rounded-lg bg-cyan-500/20 border border-cyan-500/35 flex items-center justify-center text-cyan-400 group-hover:bg-cyan-500 group-hover:text-black transition-colors shrink-0">
                    <Camera className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-white group-hover:text-cyan-200">
                      कैमरा से फ़ोटो खींचें
                    </div>
                    <div className="text-[9px] text-slate-400">Take Live Photo</div>
                  </div>
                </button>

                {/* Option 2: Gallery / File */}
                <button
                  type="button"
                  onClick={handleTriggerGallery}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-purple-500/15 active:bg-purple-500/25 text-slate-100 hover:text-purple-300 transition-all text-left cursor-pointer group"
                >
                  <div className="w-7 h-7 rounded-lg bg-purple-500/20 border border-purple-500/35 flex items-center justify-center text-purple-400 group-hover:bg-purple-500 group-hover:text-black transition-colors shrink-0">
                    <ImageIcon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-white group-hover:text-purple-200">
                      गैलरी / फ़ाइल से चुनें
                    </div>
                    <div className="text-[9px] text-slate-400">Choose from Gallery</div>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Primary Camera / Photo Select Button */}
          <button
            type="button"
            onClick={handleTogglePhotoMenu}
            className={`h-full min-h-[64px] sm:min-h-[72px] px-3.5 sm:px-4 py-2.5 rounded-xl sm:rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-all duration-200 active:scale-95 border group cursor-pointer ${
              showVoicePhotoMenu || attachedMedia
                ? 'bg-gradient-to-b from-[#08243c] via-[#0a2f4c] to-[#071d30] border-cyan-400 text-cyan-300 shadow-[0_0_20px_rgba(0,240,255,0.35)] ring-1 ring-cyan-400/50'
                : 'bg-[#091528] hover:bg-[#0d1e38] border-cyan-500/30 hover:border-cyan-400/70 text-slate-300 hover:text-white shadow-md'
            }`}
            title="कैमरा या गैलरी से फ़ोटो चुनें (Take Photo / Choose Gallery)"
            aria-expanded={showVoicePhotoMenu}
          >
            {attachedMedia ? (
              <div className="relative">
                <img
                  src={attachedMedia.previewUrl}
                  alt="Attached preview"
                  className="w-8 h-8 sm:w-9 sm:h-9 object-cover rounded-lg border-2 border-cyan-400 shadow-[0_0_10px_rgba(0,240,255,0.4)]"
                />
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border border-slate-950 animate-pulse" />
              </div>
            ) : (
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-cyan-500/10 group-hover:bg-cyan-500/20 border border-cyan-400/30 group-hover:border-cyan-400/60 flex items-center justify-center text-cyan-400 group-hover:text-cyan-300 transition-all shadow-inner">
                <Camera className="w-5 h-5" />
              </div>
            )}
            <span className="text-[10px] sm:text-[11px] font-mono font-medium tracking-tight text-cyan-200/90 group-hover:text-cyan-100 whitespace-nowrap flex items-center gap-1">
              {attachedMedia ? 'फ़ोटो एक्टिव' : 'कैमरा / फ़ोटो'}
              <ChevronUp className={`w-3 h-3 transition-transform duration-200 ${showVoicePhotoMenu ? 'rotate-180' : ''}`} />
            </span>
          </button>
        </div>
      </div>

      {/* Sub-controls Strip: Language, Telecom test & Audio toggle */}
      <div className="mt-2.5 flex items-center justify-between text-xs font-mono text-slate-400 px-1 flex-wrap gap-2">
        <button
          onClick={onToggleLang}
          className="hover:text-cyan-300 transition-colors flex items-center gap-1.5"
        >
          <span>भाषा / Lang:</span>
          <span className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-700 text-cyan-300 font-bold">
            {voiceLang === 'hi-IN' ? 'हिंदी' : 'EN'}
          </span>
        </button>

        {/* Simulate Incoming Call button for Android APK Telecom testing */}
        {onSimulateIncomingCall && (
          <button
            onClick={onSimulateIncomingCall}
            className="px-2 py-0.5 rounded-md bg-slate-900 hover:bg-slate-800 border border-slate-700 text-[11px] text-amber-300 hover:text-amber-200 flex items-center gap-1 transition-colors"
            title="Simulate incoming call to test 'phone uthao' and 'call kaat do'"
          >
            <PhoneIncoming className="w-3 h-3 text-amber-400" />
            <span>टेस्ट कॉल (Simulate Call)</span>
          </button>
        )}

        <button
          onClick={onToggleTts}
          className={`flex items-center gap-1 transition-colors ${
            isTtsEnabled ? 'text-cyan-300' : 'text-slate-500 hover:text-slate-400'
          }`}
          title="Toggle TTS voice playback"
        >
          {isTtsEnabled ? <Volume2 className="w-3.5 h-3.5 text-cyan-400" /> : <VolumeX className="w-3.5 h-3.5" />}
          <span>{isTtsEnabled ? 'Voice ON' : 'Muted'}</span>
        </button>
      </div>
    </div>
  );
};
