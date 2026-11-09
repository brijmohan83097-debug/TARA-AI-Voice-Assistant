/**
 * FriendlyCompanionChatView.tsx
 * Ultra-clean, clutter-free, friendly conversational companion interface for TARA.
 * 
 * Replaces all complex diagnostic matrices, 3D wireframe chamber, and module boxes
 * with a pristine, warm, modern chat companion:
 * - Pure conversational focus (instant answers, natural friend demeanor)
 * - Large tactile microphone for instant voice input
 * - Instant speaker audio output (TTS) with one-click replay on every message
 * - Hands-free continuous voice call mode
 * - Clean, legible message bubbles with helpful instant reply suggestions
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  Mic,
  MicOff,
  Send,
  Volume2,
  VolumeX,
  Sparkles,
  Phone,
  PhoneOff,
  Trash2,
  Languages,
  RotateCcw,
  Check,
  Smile,
  MessageCircle,
  HelpCircle
} from 'lucide-react';
import { ChatMessage, TaraEmotion } from '../types';
import { audioSynth } from '../utils/audio';
import { speechEngine } from '../utils/speech';
import { sanitizeChatBubbleText } from '../utils/textSanitizer';

interface FriendlyCompanionChatViewProps {
  chatMessages: ChatMessage[];
  onSendMessage: (text: string, media?: any) => void;
  isLoadingChat: boolean;
  isListening: boolean;
  isSpeaking: boolean;
  isHandsFreeMode: boolean;
  onToggleVoice: () => void;
  currentEmotion?: TaraEmotion;
  liveSpeechTranscript: string;
  voiceLang: string;
  onToggleVoiceLang: () => void;
  onClearChat?: () => void;
}

export const FriendlyCompanionChatView: React.FC<FriendlyCompanionChatViewProps> = ({
  chatMessages,
  onSendMessage,
  isLoadingChat,
  isListening,
  isSpeaking,
  isHandsFreeMode,
  onToggleVoice,
  currentEmotion = 'calm_caring',
  liveSpeechTranscript,
  voiceLang,
  onToggleVoiceLang,
  onClearChat,
}) => {
  const [inputText, setInputText] = useState('');
  const [isTtsActive, setIsTtsActive] = useState(speechEngine.getIsTtsEnabled());
  const [playingMessageId, setPlayingMessageId] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isLoadingChat, liveSpeechTranscript]);

  // Keep TTS state in sync
  useEffect(() => {
    const checkTts = () => setIsTtsActive(speechEngine.getIsTtsEnabled());
    const interval = setInterval(checkTts, 800);
    return () => clearInterval(interval);
  }, []);

  // Track speech engine speaking state to reset replay indicators
  useEffect(() => {
    const unsub = speechEngine.onSpeakingChange((speaking) => {
      if (!speaking) {
        setPlayingMessageId(null);
      }
    });
    return unsub;
  }, []);

  const handleToggleTts = () => {
    audioSynth.playClick();
    const updated = speechEngine.toggleTts();
    setIsTtsActive(updated);
  };

  const handleReplayMessage = (msgId: string, text: string) => {
    audioSynth.playClick();
    if (playingMessageId === msgId && isSpeaking) {
      speechEngine.stopSpeaking();
      setPlayingMessageId(null);
      return;
    }
    const clean = sanitizeChatBubbleText(text);
    if (clean) {
      setPlayingMessageId(msgId);
      speechEngine.speak(clean, true);
    }
  };

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const text = inputText.trim();
    if (!text || isLoadingChat) return;
    audioSynth.playClick();
    onSendMessage(text);
    setInputText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Quick friendly conversation starters
  const quickStarterPrompts = [
    'नमस्ते तारा, कैसी हो?',
    'आज का मौसम और समय क्या है?',
    'तुम्हारा दिमाग ठीक है क्या?',
    'कोई मजेदार बात या चुटकुला सुनाओ',
    'मुझे आज का कोई अच्छा विचार दो',
    'तुम मेरे लिए क्या-क्या कर सकती हो?',
  ];

  return (
    <div className="w-full h-screen max-h-screen flex flex-col bg-[#070b14] text-slate-100 overflow-hidden font-sans select-none">
      
      {/* =====================================================================
          1. MINIMAL FRIENDLY HEADER (TARA AVATAR & ESSENTIAL CONTROLS)
          ===================================================================== */}
      <header className="w-full px-4 sm:px-6 py-3 bg-[#0a101d]/90 border-b border-slate-800/80 backdrop-blur-md flex items-center justify-between gap-3 shrink-0 z-20 shadow-sm">
        {/* Brand & Companion Persona */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative shrink-0">
            {/* Friendly Avatar */}
            <div className={`w-11 h-11 rounded-full overflow-hidden border-2 transition-all duration-300 ${
              isSpeaking
                ? 'border-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.7)] scale-105'
                : isListening
                ? 'border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.7)] scale-105'
                : 'border-cyan-500/40'
            }`}>
              {!avatarError ? (
                <img
                  src="/image_28.png"
                  alt="तारा (TARA)"
                  className="w-full h-full object-cover object-top"
                  onError={() => setAvatarError(true)}
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-cyan-600 to-blue-700 flex items-center justify-center text-white font-bold text-base">
                  तारा
                </div>
              )}
            </div>

            {/* Dynamic Status Dot */}
            <span
              className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-[#0a101d] transition-colors ${
                isSpeaking
                  ? 'bg-cyan-400 animate-pulse'
                  : isListening
                  ? 'bg-emerald-400 animate-ping'
                  : 'bg-emerald-500'
              }`}
              title={isSpeaking ? 'बोल रही है' : isListening ? 'सुन रही है' : 'ऑनलाइन'}
            />
          </div>

          {/* Title & Live Status Prose */}
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-1.5 truncate">
                <span>तारा</span>
                <span className="text-xs font-medium text-cyan-400/90 font-mono tracking-wide">(TARA)</span>
              </h1>
              <span className="hidden sm:inline-block text-[11px] text-slate-400 font-normal">
                • आपकी AI दोस्त
              </span>
            </div>

            {/* Live Status text */}
            <p className="text-xs font-medium truncate flex items-center gap-1.5 text-slate-300">
              {isSpeaking ? (
                <span className="text-cyan-300 flex items-center gap-1 font-semibold animate-pulse">
                  <Volume2 className="w-3.5 h-3.5 text-cyan-400 animate-bounce" />
                  आवाज़ में जवाब दे रही हूँ...
                </span>
              ) : isListening ? (
                <span className="text-emerald-300 flex items-center gap-1 font-semibold animate-pulse">
                  <Mic className="w-3.5 h-3.5 text-emerald-400 animate-bounce" />
                  ध्यान से सुन रही हूँ... बोलिए Boss!
                </span>
              ) : isLoadingChat ? (
                <span className="text-cyan-300 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
                  उत्तर तैयार कर रही हूँ...
                </span>
              ) : (
                <span className="text-slate-400">
                  सीधी बातचीत के लिए तैयार
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Action Controls: Voice Call, Speaker TTS, Language, Clear */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* 1. Voice Call Mode Button (Continuous Conversational Hands-Free Loop) */}
          <button
            type="button"
            onClick={onToggleVoice}
            className={`px-3 py-1.5 rounded-xl font-medium text-xs flex items-center gap-1.5 cursor-pointer transition-all ${
              isHandsFreeMode
                ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-[0_0_15px_rgba(244,63,94,0.6)] animate-pulse'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_12px_rgba(16,185,129,0.3)]'
            }`}
            title={isHandsFreeMode ? 'वॉयस कॉल बंद करें' : 'लगातार बातचीत के लिए वॉयस कॉल शुरू करें'}
          >
            {isHandsFreeMode ? (
              <>
                <PhoneOff className="w-3.5 h-3.5" />
                <span className="hidden sm:inline font-bold">कॉल बंद करें</span>
                <span className="sm:hidden font-bold">कॉल बंद</span>
              </>
            ) : (
              <>
                <Phone className="w-3.5 h-3.5 animate-pulse" />
                <span className="hidden sm:inline font-bold">वॉयस कॉल (Call)</span>
                <span className="sm:hidden font-bold">कॉल</span>
              </>
            )}
          </button>

          {/* 2. Speaker Audio TTS Toggle */}
          <button
            type="button"
            onClick={handleToggleTts}
            className={`p-2 rounded-xl border text-xs flex items-center gap-1 cursor-pointer transition-all ${
              isTtsActive
                ? 'bg-cyan-950/80 hover:bg-cyan-900 border-cyan-500/40 text-cyan-300 shadow-[0_0_10px_rgba(0,240,255,0.2)]'
                : 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-400'
            }`}
            title={isTtsActive ? 'स्पीकर आवाज़ चालू है (Click to Mute)' : 'स्पीकर आवाज़ म्यूट है (Click to Unmute)'}
          >
            {isTtsActive ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
            <span className="hidden md:inline font-medium text-[11px]">
              {isTtsActive ? 'स्पीकर ON' : 'स्पीकर OFF'}
            </span>
          </button>

          {/* 3. Language Switcher (Hindi / English) */}
          <button
            type="button"
            onClick={onToggleVoiceLang}
            className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-mono font-medium flex items-center gap-1 cursor-pointer transition-colors"
            title="भाषा बदलें (Switch Voice Language)"
          >
            <Languages className="w-3.5 h-3.5 text-cyan-400" />
            <span>{voiceLang === 'hi-IN' ? 'हिन्दी' : 'EN'}</span>
          </button>

          {/* 4. Clear Chat History */}
          {onClearChat && chatMessages.length > 0 && (
            <button
              type="button"
              onClick={onClearChat}
              className="p-2 rounded-xl bg-slate-900 hover:bg-rose-950/50 border border-slate-800 hover:border-rose-500/40 text-slate-400 hover:text-rose-300 cursor-pointer transition-all"
              title="चैट खाली करें (Clear conversation)"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </header>

      {/* =====================================================================
          2. CLEAN CONVERSATION STREAM (MAX-W-3XL CENTERED)
          ===================================================================== */}
      <main className="flex-1 w-full overflow-y-auto px-3 sm:px-6 py-4 flex flex-col items-center">
        <div className="w-full max-w-3xl flex flex-col gap-4">
          
          {/* Welcome Card & Conversation Starters (Shown when conversation is fresh) */}
          {chatMessages.length <= 1 && (
            <div className="w-full py-8 px-4 sm:px-6 rounded-3xl bg-gradient-to-b from-[#0c1424] to-[#090e1a] border border-cyan-500/20 flex flex-col items-center text-center shadow-lg my-2">
              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-cyan-400/60 shadow-[0_0_20px_rgba(0,240,255,0.4)] mb-3">
                <img
                  src="/image_28.png"
                  alt="तारा (TARA)"
                  className="w-full h-full object-cover object-top"
                  onError={() => setAvatarError(true)}
                />
              </div>

              <h2 className="text-xl sm:text-2xl font-bold text-white mb-1.5">
                नमस्ते! मैं तारा हूँ, आपकी दोस्त
              </h2>
              <p className="text-sm text-slate-300 max-w-md mb-6 leading-relaxed">
                मुझसे कोई भी सवाल पूछिए — चाहे कोई जानकारी हो, हिसाब-किताब हो, या बस दोस्ताना बातचीत। आप सीधे बोलकर या लिखकर बात कर सकते हैं।
              </p>

              {/* Instant suggested topics */}
              <div className="w-full max-w-lg flex flex-wrap items-center justify-center gap-2">
                {quickStarterPrompts.map((prompt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      audioSynth.playClick();
                      onSendMessage(prompt);
                    }}
                    className="px-3 py-1.5 rounded-full bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-500/30 hover:border-cyan-400 text-cyan-200 hover:text-white text-xs font-medium transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-sm text-left"
                  >
                    💬 {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Message History */}
          {chatMessages.map((msg) => {
            const isUser = msg.sender === 'user';
            const cleanText = sanitizeChatBubbleText(msg.text);

            return (
              <div
                key={msg.id}
                className={`w-full flex flex-col ${isUser ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-2 duration-200`}
              >
                {/* Message Bubble Container */}
                <div
                  className={`relative max-w-[88%] sm:max-w-[78%] px-4 py-3 rounded-2xl transition-all shadow-sm ${
                    isUser
                      ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-tr-xs'
                      : 'bg-[#0d1627] border border-cyan-500/25 text-slate-100 rounded-tl-xs shadow-[0_4px_20px_rgba(0,0,0,0.3)]'
                  }`}
                >
                  {/* Sender Header for Assistant */}
                  {!isUser && (
                    <div className="flex items-center justify-between gap-3 pb-1.5 mb-1.5 border-b border-cyan-500/15">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs text-cyan-300">तारा (TARA)</span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      {/* Instant Speaker Audio Replay Button */}
                      <button
                        type="button"
                        onClick={() => handleReplayMessage(msg.id, msg.text)}
                        className={`p-1 rounded-md transition-colors cursor-pointer flex items-center gap-1 text-[11px] ${
                          playingMessageId === msg.id && isSpeaking
                            ? 'bg-cyan-500 text-black font-bold animate-pulse'
                            : 'hover:bg-cyan-950 text-cyan-400 hover:text-white'
                        }`}
                        title="स्पीकर पर दोबारा सुनें (Listen aloud)"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span className="text-[10px]">सुनाओ</span>
                      </button>
                    </div>
                  )}

                  {/* Message Prose */}
                  <div className="text-sm sm:text-[15px] leading-relaxed whitespace-pre-wrap break-words font-normal">
                    {cleanText}
                  </div>

                  {/* Timestamp for User */}
                  {isUser && (
                    <div className="text-[10px] text-cyan-200/80 text-right mt-1 font-mono">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  )}
                </div>

                {/* Follow-up Prompts / Suggestions from Assistant */}
                {!isUser && msg.suggestedPrompts && msg.suggestedPrompts.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 mt-2 pl-2">
                    {msg.suggestedPrompts.map((sug, sIdx) => (
                      <button
                        key={sIdx}
                        type="button"
                        onClick={() => {
                          audioSynth.playClick();
                          onSendMessage(sug);
                        }}
                        className="px-2.5 py-1 rounded-full bg-slate-900/90 hover:bg-cyan-950 border border-slate-700/80 hover:border-cyan-400 text-slate-300 hover:text-cyan-200 text-xs transition-colors cursor-pointer"
                      >
                        {sug}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {/* Live Speech Recognition Transcript Indicator (Active when user is speaking) */}
          {liveSpeechTranscript && (
            <div className="w-full flex justify-end animate-in fade-in slide-in-from-bottom-2">
              <div className="max-w-[85%] sm:max-w-[75%] px-4 py-2.5 rounded-2xl bg-cyan-950/80 border border-cyan-400/50 text-cyan-200 text-sm flex items-center gap-2 shadow-[0_0_15px_rgba(0,240,255,0.25)]">
                <Mic className="w-4 h-4 text-cyan-400 animate-pulse shrink-0" />
                <span className="italic font-medium">{liveSpeechTranscript}</span>
              </div>
            </div>
          )}

          {/* Thinking / Streaming Indicator */}
          {isLoadingChat && !liveSpeechTranscript && (
            <div className="w-full flex justify-start animate-in fade-in">
              <div className="px-4 py-3 rounded-2xl bg-[#0d1627] border border-cyan-500/20 text-cyan-300 text-xs sm:text-sm flex items-center gap-2.5 shadow-sm">
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <span>तारा सोच रही है...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* =====================================================================
          3. CLEAN FLOATING INPUT PILL & PROMINENT VOICE MICROPHONE
          ===================================================================== */}
      <footer className="w-full px-3 sm:px-6 pb-3 pt-1.5 bg-gradient-to-t from-[#050810] via-[#070b14]/95 to-transparent shrink-0 z-20">
        <div className="max-w-3xl mx-auto w-full flex flex-col gap-2">
          
          {/* Hands-Free Active Indicator Banner (When Voice Call is ongoing) */}
          {isHandsFreeMode && (
            <div className="w-full py-1.5 px-3 rounded-xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-200 text-xs flex items-center justify-between shadow-sm animate-in fade-in">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <span className="font-medium">
                  {isSpeaking ? '🔊 तारा बोल रही है...' : '🎙️ तारा सुन रही है — सवाल पूछिए Boss!'}
                </span>
              </div>
              <button
                type="button"
                onClick={onToggleVoice}
                className="text-[11px] underline hover:text-white cursor-pointer font-bold"
              >
                कॉल समाप्त करें
              </button>
            </div>
          )}

          {/* Main Input Bar */}
          <form
            onSubmit={handleSend}
            className="w-full flex items-center gap-2 p-1.5 sm:p-2 rounded-2xl bg-[#0d1627] border border-cyan-500/30 focus-within:border-cyan-400 transition-all shadow-[0_4px_25px_rgba(0,0,0,0.5)]"
          >
            {/* Primary Microphone Voice Button */}
            <button
              type="button"
              onClick={onToggleVoice}
              className={`p-2.5 sm:p-3 rounded-xl cursor-pointer transition-all duration-200 flex items-center justify-center shrink-0 ${
                isListening
                  ? 'bg-emerald-500 text-black shadow-[0_0_20px_rgba(16,185,129,0.8)] scale-105 animate-pulse'
                  : isHandsFreeMode
                  ? 'bg-cyan-600 text-white shadow-[0_0_15px_rgba(0,240,255,0.5)]'
                  : 'bg-slate-800 hover:bg-slate-700 text-cyan-400 hover:text-white border border-slate-700'
              }`}
              title={isListening ? 'तारा सुन रही है (बोलिए)' : 'माइक से पूछें (Tap to Speak)'}
            >
              {isListening ? (
                <Mic className="w-5 h-5 animate-bounce" />
              ) : (
                <Mic className="w-5 h-5" />
              )}
            </button>

            {/* Direct Text Input */}
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isListening ? 'तारा सुन रही है... बोलिए Boss!' : 'तारा से कुछ भी पूछें... (बोलें या लिखें)'}
              disabled={isLoadingChat}
              className="flex-1 bg-transparent border-0 outline-none text-slate-100 placeholder:text-slate-500 text-sm sm:text-base px-2 py-1 font-normal"
            />

            {/* Send Message Button */}
            <button
              type="submit"
              disabled={!inputText.trim() || isLoadingChat}
              className="p-2.5 sm:p-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-30 disabled:hover:bg-cyan-500 text-black font-bold cursor-pointer transition-all shrink-0 flex items-center justify-center shadow-sm"
              title="संदेश भेजें (Send)"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Helper Subtext */}
          <div className="flex items-center justify-between px-2 text-[11px] text-slate-400">
            <span>✨ माइक दबाकर बोलें या लिखकर पूछें</span>
            <span>तारा • 100% डायरेक्ट वॉयस और चैट</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
