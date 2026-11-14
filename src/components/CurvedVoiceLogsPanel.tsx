/**
 * CurvedVoiceLogsPanel.tsx
 * Right Split-Screen Chat & HUD Panel for TARA OS:
 * - Crisp glass panel with rotating Radar Dial + live Audio Frequency Equalizer.
 * - Real-time dialogue stream (Boss & TARA) with Thinking / Listening / Speaking indicators.
 * - Live speech transcript banner, inline TTS replay, image previews & downloads, and voice error alert.
 * - Real-time System & Neural Kernel logs viewer tab.
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Mic,
  MicOff,
  MessageSquare,
  Sparkles,
  Volume2,
  Radio,
  Copy,
  Check,
  Zap,
  Download,
  AlertCircle,
  X,
} from 'lucide-react';
import { ChatMessage, SystemLog } from '../types';
import { speechEngine } from '../utils/speech';
import { sanitizeChatBubbleText } from '../utils/textSanitizer';
import { downloadImageToDevice } from '../utils/imageService';
import ReactMarkdown from 'react-markdown';

interface CurvedVoiceLogsPanelProps {
  chatMessages: ChatMessage[];
  logs: SystemLog[];
  onSendMessage: (text: string) => void;
  isLoadingChat: boolean;
  isListening: boolean;
  isSpeaking?: boolean;
  isHandsFreeMode?: boolean;
  onToggleVoice: () => void;
  onMicPress?: () => void;
  liveSpeechTranscript: string;
  voiceError?: string | null;
  onDismissVoiceError?: () => void;
  className?: string;
}

function formatMessageTime(ts?: string): string {
  if (!ts) return '';
  const trimmed = ts.trim();
  if (/^\d{1,2}:\d{2}(:\d{2})?(\s?[AP]M)?$/i.test(trimmed)) {
    return trimmed;
  }
  const d = new Date(trimmed);
  if (!isNaN(d.getTime())) {
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  return '';
}

export const CurvedVoiceLogsPanel: React.FC<CurvedVoiceLogsPanelProps> = ({
  chatMessages,
  logs,
  onSendMessage,
  isLoadingChat,
  isListening,
  isSpeaking = false,
  isHandsFreeMode = false,
  onToggleVoice,
  onMicPress,
  liveSpeechTranscript,
  voiceError = null,
  onDismissVoiceError,
  className = '',
}) => {
  const [activeTab, setActiveTab] = useState<'dialogue' | 'logs'>('dialogue');
  const [inputText, setInputText] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const chatScrollRef = useRef<HTMLDivElement | null>(null);
  const radarCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const [equalizerBars, setEqualizerBars] = useState<number[]>([
    24, 48, 72, 38, 86, 62, 42, 92, 66, 34, 54, 78,
  ]);

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatMessages, liveSpeechTranscript, isLoadingChat, activeTab]);

  useEffect(() => {
    const interval = setInterval(() => {
      const intensity = isSpeaking ? 44 : isListening ? 36 : isLoadingChat ? 26 : 12;
      setEqualizerBars((prev) =>
        prev.map((val) => {
          const delta = (Math.random() - 0.5) * intensity;
          const floor = isSpeaking || isListening ? 20 : 12;
          return Math.max(floor, Math.min(95, Math.round(val + delta)));
        })
      );
    }, 180);
    return () => clearInterval(interval);
  }, [isListening, isSpeaking, isLoadingChat]);

  useEffect(() => {
    const canvas = radarCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let angle = 0;

    const renderRadar = () => {
      const width = canvas.width;
      const height = canvas.height;
      const cx = width * 0.5;
      const cy = height * 0.5;
      const maxR = Math.min(cx, cy) - 5;

      ctx.clearRect(0, 0, width, height);
      angle += isListening ? 0.055 : isSpeaking ? 0.045 : 0.022;

      [0.95, 0.7, 0.45, 0.2].forEach((rFactor, idx) => {
        ctx.beginPath();
        ctx.arc(cx, cy, maxR * rFactor, 0, Math.PI * 2);
        ctx.strokeStyle = idx === 0 ? '#00f0ff' : 'rgba(0, 240, 255, 0.35)';
        ctx.lineWidth = idx === 0 ? 1.4 : 0.8;
        if (idx === 1) ctx.setLineDash([3, 4]);
        else ctx.setLineDash([]);
        ctx.stroke();
      });

      ctx.beginPath();
      ctx.moveTo(cx - maxR, cy);
      ctx.lineTo(cx + maxR, cy);
      ctx.moveTo(cx, cy - maxR);
      ctx.lineTo(cx, cy + maxR);
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.28)';
      ctx.lineWidth = 0.8;
      ctx.setLineDash([2, 4]);
      ctx.stroke();

      ctx.setLineDash([]);
      const sweepGrad = ctx.createRadialGradient(cx, cy, 2, cx, cy, maxR);
      sweepGrad.addColorStop(0, 'rgba(0, 240, 255, 0.42)');
      sweepGrad.addColorStop(1, 'transparent');

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, maxR * 0.95, angle - 0.6, angle);
      ctx.closePath();
      ctx.fillStyle = sweepGrad;
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(angle) * maxR * 0.95, cy + Math.sin(angle) * maxR * 0.95);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.4;
      ctx.stroke();
      ctx.restore();

      ctx.beginPath();
      ctx.arc(cx, cy, 2.2, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();

      animId = requestAnimationFrame(renderRadar);
    };

    renderRadar();
    return () => cancelAnimationFrame(animId);
  }, [isListening, isSpeaking]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = inputText.trim();
    if (!clean || isLoadingChat) return;
    speechEngine.unlockSpeech();
    onSendMessage(clean);
    setInputText('');
  };

  const suggestedPrompts = [
    'कैसी हो तारा?',
    'ताज़ा समाचार बताओ',
    'गाना बजाओ',
    'अभी क्या समय हुआ है?',
  ];

  const liveBadge = isListening
    ? 'LISTENING'
    : isLoadingChat
    ? 'THINKING'
    : isSpeaking
    ? 'SPEAKING'
    : isHandsFreeMode
    ? 'HANDS-FREE'
    : 'ONLINE';

  const handleMicClick = () => {
    speechEngine.unlockSpeech();
    if (onMicPress) {
      onMicPress();
    } else {
      onToggleVoice();
    }
  };

  return (
    <aside
      className={`h-full flex flex-col rounded-2xl bg-[#040d1e]/90 border border-cyan-400/40 backdrop-blur-md shadow-[0_0_28px_rgba(0,240,255,0.14)] p-4 text-slate-100 overflow-hidden relative ${className}`}
    >
      {/* Top Header & Feed/Logs Switcher */}
      <div className="flex items-center justify-between gap-2 pb-3 border-b border-cyan-500/25 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <MessageSquare className="w-4 h-4 text-cyan-400 shrink-0" />
          <h2 className="font-heading font-bold text-xs tracking-wider text-cyan-100 truncate">
            Chat &amp; Voice HUD
          </h2>
        </div>
        <div className="flex items-center gap-1 p-0.5 rounded-lg bg-[#020814] border border-cyan-500/25 font-mono text-[11px] shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('dialogue')}
            className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'dialogue' ? 'bg-cyan-500/30 text-white' : 'text-slate-400 hover:text-cyan-200'
            }`}
          >
            Chat
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('logs')}
            className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'logs' ? 'bg-cyan-500/30 text-white' : 'text-slate-400 hover:text-cyan-200'
            }`}
          >
            Logs ({logs.length})
          </button>
        </div>
      </div>

      {/* Radar Gauge & Frequency Equalizer */}
      <div className="my-2.5 p-2.5 rounded-xl bg-[#020816]/85 border border-cyan-500/25 flex items-center gap-3 shrink-0">
        <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
          <canvas
            ref={radarCanvasRef}
            width={64}
            height={64}
            className="w-16 h-16 block rounded-full"
          />
        </div>

        <div className="flex-1 flex flex-col gap-1.5 min-w-0">
          <div className="flex items-center justify-between text-[11px] font-mono">
            <span className="text-slate-400 truncate">Voice Link</span>
            <span
              className={`font-semibold shrink-0 ${
                isListening
                  ? 'text-emerald-300'
                  : isLoadingChat
                  ? 'text-sky-300'
                  : isSpeaking
                  ? 'text-cyan-300'
                  : 'text-slate-300'
              }`}
            >
              {liveBadge}
            </span>
          </div>
          <div className="h-10 flex items-end justify-between gap-1 px-1.5 bg-[#010510] rounded-lg border border-cyan-500/20 pt-1 pb-0.5">
            {equalizerBars.map((bH, bIdx) => (
              <div key={bIdx} className="flex-1 flex flex-col justify-end h-full">
                <div
                  className="w-full rounded-t-sm transition-all duration-150"
                  style={{
                    height: `${bH}%`,
                    background:
                      bIdx % 2 === 0
                        ? 'linear-gradient(to top, rgba(0,240,255,0.3), #00f0ff)'
                        : 'linear-gradient(to top, rgba(56,189,248,0.35), #38bdf8)',
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Voice Error Alert (if microphone permission / speech error occurs) */}
      {voiceError && (
        <div className="mb-2 px-3 py-2 rounded-xl bg-rose-950/80 border border-rose-500/50 text-rose-100 text-xs flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <AlertCircle className="w-4 h-4 text-rose-300 shrink-0" />
            <span className="truncate">{voiceError}</span>
          </div>
          {onDismissVoiceError && (
            <button
              type="button"
              onClick={onDismissVoiceError}
              className="p-0.5 text-rose-300 hover:text-white cursor-pointer shrink-0"
              title="बंद करें"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {/* Conversation Feed or Telemetry Logs */}
      <div className="flex-1 min-h-0 flex flex-col overflow-hidden my-1">
        {activeTab === 'dialogue' ? (
          <div
            ref={chatScrollRef}
            className="flex-1 overflow-y-auto no-scrollbar space-y-2.5 pr-1 select-text"
          >
            {liveSpeechTranscript && (
              <div className="px-3 py-2 rounded-xl bg-emerald-950/60 border border-emerald-400/60 text-emerald-100 text-xs animate-pulse">
                <span className="text-emerald-300 font-semibold">आप बोल रहे हैं: </span>
                <span>{liveSpeechTranscript}</span>
              </div>
            )}

            {chatMessages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-4 text-slate-400 text-xs">
                <Radio className="w-6 h-6 mb-2 text-cyan-400/60" />
                <p className="text-cyan-200 font-medium">TARA OS वॉयस और चैट तैयार है।</p>
                <p className="text-[11px] text-slate-400 mt-1">
                  बोलकर या नीचे टाइप करके अपनी दोस्त TARA से बात करें।
                </p>
              </div>
            ) : (
              chatMessages.slice(-25).map((msg) => {
                const cleanText =
                  msg.sender === 'assistant'
                    ? sanitizeChatBubbleText(msg.text)
                    : msg.text;
                const timeLabel = formatMessageTime(msg.timestamp);

                return (
                  <div
                    key={msg.id}
                    className={`p-3 rounded-xl text-xs leading-relaxed transition-colors ${
                      msg.sender === 'user'
                        ? 'bg-[#082144]/90 border border-cyan-500/40 text-slate-100 ml-5'
                        : 'bg-[#020d21]/95 border border-cyan-400/45 text-cyan-50 mr-2'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] font-mono text-cyan-300/80 mb-1.5 pb-1 border-b border-cyan-500/20">
                      <span className="flex items-center gap-1.5 font-semibold">
                        {msg.sender === 'user' ? (
                          <>
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                            <span>BOSS</span>
                          </>
                        ) : (
                          <>
                            <Zap className="w-3 h-3 text-cyan-300" />
                            <span className="text-cyan-200">TARA</span>
                          </>
                        )}
                      </span>
                      <div className="flex items-center gap-2">
                        {timeLabel && <span className="tabular-nums text-slate-400">{timeLabel}</span>}
                        <button
                          type="button"
                          onClick={() => handleCopyText(msg.id, cleanText || msg.text)}
                          className="p-0.5 text-slate-400 hover:text-white transition-colors cursor-pointer"
                          title="कॉपी करें"
                        >
                          {copiedId === msg.id ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                        {msg.sender === 'assistant' && (cleanText || msg.text) && (
                          <button
                            type="button"
                            onClick={() => {
                              speechEngine.unlockSpeech();
                              speechEngine.speak(cleanText || msg.text, true);
                            }}
                            className="p-0.5 text-cyan-400 hover:text-cyan-200 transition-colors cursor-pointer"
                            title="स्पीकर पर सुनें"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {msg.imageUrl && (
                      <div className="mb-2">
                        <img
                          src={msg.imageUrl}
                          alt="Uploaded"
                          className="max-h-40 rounded-lg border border-cyan-500/30 object-cover"
                        />
                      </div>
                    )}

                    {cleanText && (
                      <div className="prose prose-invert prose-sm max-w-none text-xs text-slate-100 leading-relaxed">
                        <ReactMarkdown>{cleanText}</ReactMarkdown>
                      </div>
                    )}

                    {msg.resultImageUrl && (
                      <div className="mt-2 space-y-1.5">
                        <img
                          src={msg.resultImageUrl}
                          alt="Generated visual"
                          className="w-full max-h-48 rounded-lg border border-cyan-400/50 object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => downloadImageToDevice(msg.resultImageUrl!, `tara-${msg.id}.png`)}
                          className="px-2.5 py-1 rounded-lg bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-200 text-[11px] font-mono inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          <Download className="w-3 h-3" />
                          <span>इमेज डाउनलोड करें</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}

            {isLoadingChat && (
              <div className="px-3 py-2.5 rounded-xl bg-[#020d21]/95 border border-sky-400/50 text-sky-200 text-xs flex items-center justify-between mr-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-sky-300 animate-spin" />
                  <span>TARA सोच रही है...</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:0ms]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:150ms]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto no-scrollbar font-mono text-[11px] space-y-1.5 p-2.5 bg-[#020714] rounded-xl border border-cyan-500/20 select-text">
            {logs.length === 0 ? (
              <div className="text-slate-500 text-center py-6">कोई सिस्टम लॉग नहीं है।</div>
            ) : (
              logs.slice(-30).map((l, lIdx) => (
                <div key={l.id || lIdx} className="leading-snug border-b border-cyan-500/10 pb-1 last:border-b-0">
                  <span className="text-slate-500 tabular-nums mr-1.5">[{l.timestamp}]</span>
                  <span
                    className={`font-semibold mr-1.5 ${
                      l.level === 'warn'
                        ? 'text-amber-300'
                        : l.level === 'success'
                        ? 'text-emerald-300'
                        : l.level === 'exec'
                        ? 'text-sky-300'
                        : 'text-cyan-400'
                    }`}
                  >
                    [{l.module}]
                  </span>
                  <span className="text-slate-200">{l.message}</span>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Quick Prompt Chips */}
      <div className="py-1.5 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
        {suggestedPrompts.map((p, pIdx) => (
          <button
            key={pIdx}
            type="button"
            onClick={() => {
              speechEngine.unlockSpeech();
              onSendMessage(p);
            }}
            className="px-2.5 py-1 rounded-lg bg-[#020816] hover:bg-cyan-950/70 border border-cyan-500/30 text-cyan-200 hover:text-white text-[11px] whitespace-nowrap shrink-0 cursor-pointer transition-colors"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Message & Mic Input Bar */}
      <form
        onSubmit={handleSubmit}
        className="pt-2 border-t border-cyan-500/25 shrink-0 flex items-center gap-2"
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="तारा से कुछ भी पूछें..."
          className="flex-1 min-w-0 bg-[#020816] border border-cyan-500/35 focus:border-cyan-400 text-slate-100 placeholder:text-slate-500 text-xs px-3 py-2 rounded-xl outline-none transition-colors"
        />
        <button
          type="button"
          onClick={handleMicClick}
          className={`p-2 rounded-xl cursor-pointer transition-colors shrink-0 ${
            isListening
              ? 'bg-emerald-500 text-slate-950 shadow-[0_0_16px_rgba(16,225,178,0.65)]'
              : isSpeaking && isHandsFreeMode
              ? 'bg-cyan-500 text-slate-950'
              : 'bg-[#020816] hover:bg-cyan-950 text-cyan-300 border border-cyan-500/35'
          }`}
          title={
            isSpeaking && isHandsFreeMode
              ? 'बोलने के लिए टच करें'
              : isHandsFreeMode
              ? 'वॉयस कॉल बंद करें'
              : 'वॉयस कॉल शुरू करें'
          }
        >
          {isListening ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
        </button>
        <button
          type="submit"
          disabled={!inputText.trim() || isLoadingChat}
          className="p-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-slate-950 font-semibold cursor-pointer transition-colors shrink-0"
          title="संदेश भेजें"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </aside>
  );
};
