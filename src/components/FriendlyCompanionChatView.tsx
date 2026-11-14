/**
 * FriendlyCompanionChatView.tsx
 * Clean, minimal, clutter-free conversational companion interface for TARA.
 * - Pure chat experience: direct, warm, friendly conversation.
 * - Reliable voice microphone + hands-free call mode + speaker audio output.
 * - Safe timestamp formatting (handles both "HH:MM" strings and ISO dates).
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  Mic,
  Send,
  Volume2,
  VolumeX,
  Phone,
  PhoneOff,
  Trash2,
  Languages,
  Download,
} from 'lucide-react';
import { ChatMessage, TaraEmotion } from '../types';
import { audioSynth } from '../utils/audio';
import { speechEngine } from '../utils/speech';
import { sanitizeChatBubbleText } from '../utils/textSanitizer';
import { downloadImageToDevice } from '../utils/imageService';

interface FriendlyCompanionChatViewProps {
  chatMessages: ChatMessage[];
  onSendMessage: (text: string, media?: any) => void;
  isLoadingChat: boolean;
  isListening: boolean;
  isSpeaking: boolean;
  isHandsFreeMode: boolean;
  onToggleVoice: () => void;
  onMicPress?: () => void;
  voiceError?: string | null;
  onDismissVoiceError?: () => void;
  currentEmotion?: TaraEmotion;
  liveSpeechTranscript: string;
  voiceLang: string;
  onToggleVoiceLang: () => void;
  onClearChat?: () => void;
}

function formatMessageTime(ts?: string): string {
  if (!ts) return '';
  // Already formatted like "20:34" or "08:34 PM"
  if (/^\d{1,2}:\d{2}(\s?[AP]M)?$/i.test(ts.trim())) {
    return ts.trim();
  }
  const parsed = new Date(ts);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  return ts;
}

export const FriendlyCompanionChatView: React.FC<FriendlyCompanionChatViewProps> = ({
  chatMessages,
  onSendMessage,
  isLoadingChat,
  isListening,
  isSpeaking,
  isHandsFreeMode,
  onToggleVoice,
  onMicPress,
  voiceError,
  onDismissVoiceError,
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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isLoadingChat, liveSpeechTranscript]);

  useEffect(() => {
    const checkTts = () => setIsTtsActive(speechEngine.getIsTtsEnabled());
    const interval = setInterval(checkTts, 800);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const unsub = speechEngine.onSpeakingChange((speaking) => {
      if (!speaking) {
        setPlayingMessageId(null);
      }
    });
    return unsub;
  }, []);

  const handleToggleTts = () => {
    speechEngine.unlockSpeech();
    audioSynth.playClick();
    const updated = speechEngine.toggleTts();
    setIsTtsActive(updated);
  };

  const handleReplayMessage = (msgId: string, text: string) => {
    speechEngine.unlockSpeech();
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
    speechEngine.unlockSpeech();
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

  return (
    <div className="w-full h-screen h-[100dvh] max-h-screen flex flex-col bg-[#080d17] text-slate-100 overflow-hidden font-sans">
      {/* 1. CLEAN MINIMAL HEADER */}
      <header className="w-full px-4 sm:px-6 py-3 bg-[#0c1322]/95 border-b border-slate-800/80 backdrop-blur-md flex items-center justify-between gap-4 shrink-0 z-20">
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative shrink-0">
            <div
              className={`w-10 h-10 rounded-full overflow-hidden border-2 transition-colors duration-200 ${
                isSpeaking
                  ? 'border-cyan-400'
                  : isListening
                  ? 'border-emerald-400'
                  : 'border-slate-700'
              }`}
            >
              {!avatarError ? (
                <img
                  src="/image_28.png"
                  alt="तारा"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-top"
                  onError={() => setAvatarError(true)}
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-cyan-600 to-blue-700 flex items-center justify-center text-white font-semibold text-sm">
                  तारा
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col min-w-0">
            <h1 className="text-base sm:text-lg font-semibold tracking-tight text-white truncate font-sans">
              तारा
            </h1>
            <p className="text-xs truncate text-slate-400">
              {isSpeaking ? (
                <span className="text-cyan-300 font-medium">बोल रही हूँ...</span>
              ) : isListening ? (
                <span className="text-emerald-300 font-medium">सुन रही हूँ, बोलिए...</span>
              ) : isLoadingChat ? (
                <span className="text-cyan-300 font-medium">लिख रही हूँ...</span>
              ) : (
                <span>आपकी दोस्त · ऑनलाइन</span>
              )}
            </p>
          </div>
        </div>

        {/* Essential Conversation Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onToggleVoice}
            className={`px-3.5 py-2 rounded-xl font-medium text-xs flex items-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap shrink-0 ${
              isHandsFreeMode
                ? 'bg-rose-600 hover:bg-rose-500 text-white'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
            }`}
            title={isHandsFreeMode ? 'वॉयस कॉल बंद करें' : 'वॉयस कॉल शुरू करें'}
          >
            {isHandsFreeMode ? (
              <>
                <PhoneOff className="w-3.5 h-3.5" />
                <span>कॉल बंद</span>
              </>
            ) : (
              <>
                <Phone className="w-3.5 h-3.5" />
                <span>कॉल</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleToggleTts}
            className={`p-2 rounded-xl border text-xs flex items-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap shrink-0 ${
              isTtsActive
                ? 'bg-cyan-950/70 hover:bg-cyan-900 border-cyan-500/40 text-cyan-300'
                : 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-400'
            }`}
            title={isTtsActive ? 'स्पीकर चालू है' : 'स्पीकर बंद है'}
          >
            {isTtsActive ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span className="hidden sm:inline">{isTtsActive ? 'स्पीकर ON' : 'स्पीकर OFF'}</span>
          </button>

          <button
            type="button"
            onClick={onToggleVoiceLang}
            className="px-2.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-medium flex items-center gap-1 cursor-pointer transition-colors whitespace-nowrap shrink-0"
            title="भाषा बदलें"
          >
            <Languages className="w-3.5 h-3.5 text-cyan-400" />
            <span>{voiceLang === 'hi-IN' ? 'हिन्दी' : 'EN'}</span>
          </button>

          {onClearChat && chatMessages.length > 0 && (
            <button
              type="button"
              onClick={onClearChat}
              className="p-2 rounded-xl bg-slate-900 hover:bg-rose-950/60 border border-slate-800 hover:border-rose-500/40 text-slate-400 hover:text-rose-300 cursor-pointer transition-colors shrink-0"
              title="चैट साफ़ करें"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </header>

      {/* 2. CLEAN CONVERSATION STREAM */}
      <main className="flex-1 w-full overflow-y-auto px-3 sm:px-6 py-5 flex flex-col items-center">
        <div className="w-full max-w-3xl flex flex-col gap-3.5">
          {chatMessages.length === 0 && (
            <div className="w-full py-12 px-4 text-center flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-full overflow-hidden border border-slate-700">
                {!avatarError ? (
                  <img
                    src="/image_28.png"
                    alt="तारा"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-top"
                    onError={() => setAvatarError(true)}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-cyan-600 to-blue-700 flex items-center justify-center text-white font-semibold">
                    तारा
                  </div>
                )}
              </div>
              <p className="text-base font-medium text-white">अरे Boss! बोलो क्या हाल है?</p>
              <p className="text-sm text-slate-400 max-w-sm">
                माइक दबाकर बोलो या नीचे लिखो, मैं यहीं हूँ।
              </p>
            </div>
          )}

          {chatMessages.map((msg) => {
            const isUser = msg.sender === 'user';
            const cleanText = sanitizeChatBubbleText(msg.text);
            const formattedTime = formatMessageTime(msg.timestamp);

            if (!isUser && !cleanText && !msg.resultImageUrl && !msg.imageUrl) {
              return null;
            }

            return (
              <div
                key={msg.id}
                className={`w-full flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`relative max-w-[88%] sm:max-w-[78%] px-4 py-3 rounded-2xl ${
                    isUser
                      ? 'bg-cyan-600 text-white rounded-tr-sm'
                      : 'bg-[#11192b] border border-slate-800 text-slate-100 rounded-tl-sm'
                  }`}
                >
                  {!isUser && (
                    <div className="flex items-center justify-between gap-4 pb-1 mb-1">
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <span className="font-semibold text-cyan-300">तारा</span>
                        {formattedTime && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="tabular-nums">{formattedTime}</span>
                          </>
                        )}
                      </div>

                      {cleanText && (
                        <button
                          type="button"
                          onClick={() => handleReplayMessage(msg.id, msg.text)}
                          className={`px-2 py-0.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1 text-xs ${
                            playingMessageId === msg.id && isSpeaking
                              ? 'bg-cyan-500 text-slate-950 font-semibold'
                              : 'hover:bg-slate-800 text-cyan-300'
                          }`}
                          title="दोबारा सुनें"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                          <span>सुनें</span>
                        </button>
                      )}
                    </div>
                  )}

                  {msg.imageUrl && (
                    <img
                      src={msg.imageUrl}
                      alt="साझा की गई फ़ोटो"
                      referrerPolicy="no-referrer"
                      className="max-h-64 rounded-xl mb-2 object-contain border border-slate-700/60"
                    />
                  )}

                  {cleanText && (
                    <div className="text-sm sm:text-[15px] leading-relaxed whitespace-pre-wrap break-words">
                      {cleanText}
                    </div>
                  )}

                  {msg.resultImageUrl && (
                    <div className="mt-2.5 flex flex-col gap-2">
                      <img
                        src={msg.resultImageUrl}
                        alt="तैयार फ़ोटो"
                        referrerPolicy="no-referrer"
                        className="max-h-72 rounded-xl object-contain border border-slate-700"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          downloadImageToDevice(
                            msg.resultImageUrl!,
                            msg.resultImageDownloadName || 'tara-image.png'
                          )
                        }
                        className="self-start px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-medium flex items-center gap-1.5 cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>डाउनलोड करें</span>
                      </button>
                    </div>
                  )}

                  {isUser && formattedTime && (
                    <div className="text-[11px] text-cyan-100/80 text-right mt-1 tabular-nums">
                      {formattedTime}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {liveSpeechTranscript && (
            <div className="w-full flex justify-end">
              <div className="max-w-[85%] sm:max-w-[75%] px-4 py-2.5 rounded-2xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-200 text-sm flex items-center gap-2">
                <Mic className="w-4 h-4 text-cyan-400 shrink-0" />
                <span className="italic">{liveSpeechTranscript}</span>
              </div>
            </div>
          )}

          {isLoadingChat && !liveSpeechTranscript && (
            <div className="w-full flex justify-start">
              <div className="px-4 py-2.5 rounded-2xl bg-[#11192b] border border-slate-800 text-slate-300 text-sm">
                तारा टाइप कर रही है...
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* 3. SIMPLE INPUT & VOICE BAR */}
      <footer className="w-full px-3 sm:px-6 pb-4 pt-2 bg-[#080d17] shrink-0 z-20">
        <div className="max-w-3xl mx-auto w-full flex flex-col gap-2">
          {voiceError && (
            <div className="w-full py-2 px-3 rounded-xl bg-rose-950/80 border border-rose-500/50 text-rose-200 text-xs flex items-center justify-between gap-2">
              <span>{voiceError}</span>
              {onDismissVoiceError && (
                <button
                  type="button"
                  onClick={onDismissVoiceError}
                  className="underline hover:text-white cursor-pointer shrink-0 font-medium"
                >
                  ठीक है
                </button>
              )}
            </div>
          )}

          {isHandsFreeMode && (
            <div className="w-full py-1.5 px-3 rounded-xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-200 text-xs flex items-center justify-between">
              <span className="font-medium">
                {isSpeaking
                  ? 'तारा बोल रही है...'
                  : isLoadingChat
                  ? 'जवाब आ रहा है...'
                  : 'माइक चालू है — सीधे बोलिए Boss'}
              </span>
              <button
                type="button"
                onClick={onToggleVoice}
                className="underline hover:text-white cursor-pointer font-medium"
              >
                कॉल बंद करें
              </button>
            </div>
          )}

          <form
            onSubmit={handleSend}
            className="w-full flex items-center gap-2 p-2 rounded-2xl bg-[#11192b] border border-slate-800 focus-within:border-cyan-500/60 transition-colors"
          >
            <button
              type="button"
              onClick={onMicPress || onToggleVoice}
              className={`p-2.5 rounded-xl cursor-pointer transition-colors flex items-center justify-center shrink-0 ${
                isListening
                  ? 'bg-emerald-500 text-slate-950'
                  : isHandsFreeMode
                  ? 'bg-cyan-600 text-white'
                  : 'bg-slate-800 hover:bg-slate-700 text-cyan-300'
              }`}
              title={
                isListening
                  ? 'सुन रही हूँ...'
                  : isHandsFreeMode && isSpeaking
                  ? 'तारा को रोककर बोलें'
                  : 'माइक से बोलें'
              }
            >
              <Mic className="w-5 h-5" />
            </button>

            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isListening ? 'सुन रही हूँ Boss, बोलिए...' : 'तारा से कुछ भी पूछें...'}
              disabled={isLoadingChat}
              className="flex-1 bg-transparent border-0 outline-none text-slate-100 placeholder:text-slate-500 text-sm sm:text-base px-2 py-1"
            />

            <button
              type="submit"
              disabled={!inputText.trim() || isLoadingChat}
              className="p-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-35 text-slate-950 font-semibold cursor-pointer transition-colors shrink-0 flex items-center justify-center"
              title="भेजें"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </footer>
    </div>
  );
};
