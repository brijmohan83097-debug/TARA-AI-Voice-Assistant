/**
 * CurvedVoiceLogsPanel.tsx
 * Right Cylindrical Curved Holographic HUD Screen (Faithfully matching IMG_20261013_145133.jpg):
 * - Circular Rotating Radar / Compass Target Dial Gauge with concentric rings and reticle.
 * - Live dynamic Audio Frequency Equalizer Bar Graph.
 * - Real-time conversational Dialogue Stream & live speech transcript (Boss & TARA).
 * - Instant voice prompt chips and quick query input bar.
 * - Authentic cylindrical concave curvature, cyan edge bloom, and glass reflection.
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Mic,
  MicOff,
  MessageSquare,
  Terminal,
  Shield,
  Sparkles,
  Volume2,
  Radio,
  Compass,
} from 'lucide-react';
import { ChatMessage, SystemLog } from '../types';

interface CurvedVoiceLogsPanelProps {
  chatMessages: ChatMessage[];
  logs: SystemLog[];
  onSendMessage: (text: string) => void;
  isLoadingChat: boolean;
  isListening: boolean;
  onToggleVoice: () => void;
  liveSpeechTranscript: string;
  className?: string;
}

export const CurvedVoiceLogsPanel: React.FC<CurvedVoiceLogsPanelProps> = ({
  chatMessages,
  logs,
  onSendMessage,
  isLoadingChat,
  isListening,
  onToggleVoice,
  liveSpeechTranscript,
  className = '',
}) => {
  const [activeTab, setActiveTab] = useState<'dialogue' | 'logs' | 'network'>('dialogue');
  const [inputText, setInputText] = useState('');
  const chatScrollRef = useRef<HTMLDivElement | null>(null);
  const radarCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Equalizer bar heights (12 bars dancing in real time)
  const [equalizerBars, setEqualizerBars] = useState<number[]>([
    20, 45, 70, 35, 85, 60, 40, 95, 65, 30, 50, 75,
  ]);

  // Auto-scroll chat to latest message
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatMessages, liveSpeechTranscript, isLoadingChat]);

  // Equalizer animation
  useEffect(() => {
    const interval = setInterval(() => {
      setEqualizerBars((prev) =>
        prev.map((val) => {
          const delta = (Math.random() - 0.5) * (isListening ? 40 : 20);
          return Math.max(15, Math.min(95, Math.round(val + delta)));
        })
      );
    }, 180);
    return () => clearInterval(interval);
  }, [isListening]);

  // Rotating Circular Radar / Dial Gauge Canvas (Direct match to Image_15 / IMG_20261013_145133.jpg)
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
      const maxR = Math.min(cx, cy) - 6;

      ctx.clearRect(0, 0, width, height);
      angle += isListening ? 0.05 : 0.025;

      // 1. Concentric circular rings
      [0.95, 0.70, 0.45, 0.20].forEach((rFactor, idx) => {
        ctx.beginPath();
        ctx.arc(cx, cy, maxR * rFactor, 0, Math.PI * 2);
        ctx.strokeStyle = idx === 0 ? '#00f0ff' : 'rgba(0, 240, 255, 0.4)';
        ctx.lineWidth = idx === 0 ? 1.5 : 0.8;
        if (idx === 1) ctx.setLineDash([3, 4]);
        else ctx.setLineDash([]);
        ctx.shadowColor = '#00f0ff';
        ctx.shadowBlur = idx === 0 ? 8 : 2;
        ctx.stroke();
      });

      // 2. Crosshair grid lines
      ctx.beginPath();
      ctx.moveTo(cx - maxR, cy);
      ctx.lineTo(cx + maxR, cy);
      ctx.moveTo(cx, cy - maxR);
      ctx.lineTo(cx, cy + maxR);
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.35)';
      ctx.lineWidth = 0.8;
      ctx.setLineDash([2, 4]);
      ctx.stroke();

      // 3. Degree tick marks around outer circle
      ctx.setLineDash([]);
      for (let i = 0; i < 24; i++) {
        const tickAng = (i / 24) * Math.PI * 2;
        const r1 = maxR * 0.88;
        const r2 = maxR * 0.95;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(tickAng) * r1, cy + Math.sin(tickAng) * r1);
        ctx.lineTo(cx + Math.cos(tickAng) * r2, cy + Math.sin(tickAng) * r2);
        ctx.strokeStyle = i % 6 === 0 ? '#ffffff' : 'rgba(0, 240, 255, 0.6)';
        ctx.lineWidth = i % 6 === 0 ? 1.6 : 0.8;
        ctx.stroke();
      }

      // 4. Rotating sweep scanner cone
      const sweepGrad = ctx.createRadialGradient(cx, cy, 2, cx, cy, maxR);
      sweepGrad.addColorStop(0, 'rgba(0, 240, 255, 0.45)');
      sweepGrad.addColorStop(1, 'transparent');

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, maxR * 0.95, angle - 0.6, angle);
      ctx.closePath();
      ctx.fillStyle = sweepGrad;
      ctx.fill();

      // Sweep leading laser line
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(angle) * maxR * 0.95, cy + Math.sin(angle) * maxR * 0.95);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.6;
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 10;
      ctx.stroke();
      ctx.restore();

      // Center blip
      ctx.beginPath();
      ctx.arc(cx, cy, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();

      animId = requestAnimationFrame(renderRadar);
    };

    renderRadar();
    return () => cancelAnimationFrame(animId);
  }, [isListening]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = inputText.trim();
    if (!clean || isLoadingChat) return;
    onSendMessage(clean);
    setInputText('');
  };

  const suggestedPrompts = [
    'और बताओ, कैसी हो?',
    'आज का दिन कैसा बीत रहा है?',
    'कोई अच्छी शायरी सुनाओ',
    'गाना बजाओ',
  ];

  return (
    <aside
      className={`h-full flex flex-col rounded-[22px] bg-[#020b1c]/80 border-[1.5px] border-cyan-400/60 backdrop-blur-md shadow-[0_0_35px_rgba(0,240,255,0.22),inset_0_0_20px_rgba(0,240,255,0.08)] p-3 sm:p-3.5 text-cyan-200 overflow-hidden relative select-none [transform:perspective(1000px)_rotateY(-14deg)] transition-all hover:[transform:perspective(1000px)_rotateY(-8deg)] duration-300 ${className}`}
      style={{
        boxShadow: '0 0 30px rgba(0, 240, 255, 0.25), inset 0 0 15px rgba(0, 240, 255, 0.06)',
      }}
    >
      {/* Cylindrical Curved Screen Glowing Edge Accents */}
      <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-300 to-transparent pointer-events-none z-10" />
      <div className="absolute bottom-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-300 to-transparent pointer-events-none z-10" />
      <div className="absolute inset-y-0 left-0 w-[2px] bg-gradient-to-b from-transparent via-cyan-400/50 to-transparent pointer-events-none z-10" />
      <div className="absolute inset-y-0 right-0 w-[2px] bg-gradient-to-b from-transparent via-cyan-400 to-transparent pointer-events-none z-10" />

      {/* Holographic Scanline Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_50%,rgba(0,240,255,0.025)_51%)] bg-[length:100%_4px] pointer-events-none z-0" />

      {/* 1. TOP HEADER & TAB BAR */}
      <div className="relative z-10 flex items-center justify-between pb-2 border-b border-cyan-500/30">
        <div className="flex items-center gap-1.5">
          <MessageSquare className="w-3.5 h-3.5 text-cyan-300" />
          <span className="font-heading font-black text-xs tracking-wider text-cyan-100">
            NEURAL INTERFACE
          </span>
        </div>
        <div className="flex items-center gap-1 p-0.5 rounded bg-slate-950/80 border border-cyan-500/30 font-mono text-[9px]">
          <button
            type="button"
            onClick={() => setActiveTab('dialogue')}
            className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
              activeTab === 'dialogue' ? 'bg-cyan-500/40 text-cyan-100 font-bold' : 'text-slate-400 hover:text-cyan-300'
            }`}
          >
            FEED
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('logs')}
            className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
              activeTab === 'logs' ? 'bg-cyan-500/40 text-cyan-100 font-bold' : 'text-slate-400 hover:text-cyan-300'
            }`}
          >
            LOGS
          </button>
        </div>
      </div>

      {/* 2. CIRCULAR RADAR GAUGE & AUDIO EQUALIZER (Exact Match to Photo Upper-Right) */}
      <div className="relative z-10 my-2 p-2 rounded-xl bg-[#010918]/85 border border-cyan-500/30 shadow-inner flex items-center gap-2.5 shrink-0">
        {/* Rotating Circular Target Radar Dial */}
        <div className="relative w-20 h-20 shrink-0 flex items-center justify-center">
          <canvas
            ref={radarCanvasRef}
            width={80}
            height={80}
            className="w-20 h-20 block rounded-full"
          />
        </div>

        {/* Dynamic Equalizer Bar Graph */}
        <div className="flex-1 flex flex-col gap-1">
          <div className="flex items-center justify-between text-[9px] font-mono text-cyan-400">
            <span>FREQUENCY EQUALIZER</span>
            <span className="text-cyan-300 font-bold">{isListening ? 'LISTENING' : 'ONLINE'}</span>
          </div>
          <div className="h-12 flex items-end justify-between gap-1 px-1 bg-slate-950/60 rounded border border-cyan-500/20 pt-1 pb-0.5">
            {equalizerBars.map((bH, bIdx) => (
              <div key={bIdx} className="flex-1 flex flex-col justify-end h-full">
                <div
                  className="w-full rounded-t-sm transition-all duration-150 shadow-[0_0_6px_rgba(0,240,255,0.5)]"
                  style={{
                    height: `${bH}%`,
                    background:
                      bIdx % 2 === 0
                        ? 'linear-gradient(to top, rgba(0,240,255,0.3), #00f0ff)'
                        : 'linear-gradient(to top, rgba(0,240,255,0.4), #38bdf8)',
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. CONVERSATION DIALOGUE STREAM & LIVE TRANSCRIPT (Scrollable Center Area) */}
      <div className="relative z-10 flex-1 min-h-0 flex flex-col overflow-hidden my-1">
        {activeTab === 'dialogue' ? (
          <div
            ref={chatScrollRef}
            className="flex-1 overflow-y-auto no-scrollbar space-y-2 pr-1"
          >
            {/* Live speech transcript alert banner */}
            {liveSpeechTranscript && (
              <div className="p-2 rounded-xl bg-cyan-950/80 border border-cyan-400/80 text-cyan-100 text-[10px] font-mono animate-pulse shadow-[0_0_15px_rgba(0,240,255,0.3)]">
                <span className="text-cyan-400 font-bold">🎤 आप बोल रहे हैं: </span>
                <span>{liveSpeechTranscript}</span>
              </div>
            )}

            {/* Conversation Messages */}
            {chatMessages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-3 text-cyan-300/60 font-mono text-[10px]">
                <Radio className="w-6 h-6 mb-1 text-cyan-400/50 animate-pulse" />
                <p>TARA न्यूरल वॉइस फीड सक्रिय है।</p>
                <p className="text-[9px] text-slate-400 mt-0.5">बोलकर या टाइप करके सवाल पूछें।</p>
              </div>
            ) : (
              chatMessages.slice(-8).map((msg) => (
                <div
                  key={msg.id}
                  className={`p-2 rounded-xl text-[10px] font-mono leading-relaxed transition-all ${
                    msg.sender === 'user'
                      ? 'bg-[#041a3a]/80 border border-cyan-500/40 text-cyan-100 ml-4'
                      : 'bg-[#021128]/85 border border-cyan-400/50 text-cyan-200 mr-2 shadow-[0_0_12px_rgba(0,240,255,0.1)]'
                  }`}
                >
                  <div className="flex items-center justify-between text-[8px] text-cyan-400/80 mb-0.5 font-bold">
                    <span>{msg.sender === 'user' ? '👤 BOSS' : '⚡ TARA AI'}</span>
                    <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                </div>
              ))
            )}

            {isLoadingChat && (
              <div className="p-2 rounded-xl bg-[#021128]/80 border border-cyan-400/40 text-cyan-300 text-[10px] font-mono flex items-center gap-1.5 animate-pulse">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
                <span>तारा सोच रही है...</span>
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto no-scrollbar font-mono text-[9px] space-y-1.5 p-1 bg-slate-950/70 rounded-xl border border-cyan-500/20">
            {logs.slice(-12).map((l, lIdx) => (
              <div key={lIdx} className="text-slate-300">
                <span className="text-cyan-400 font-bold">[{l.module}] </span>
                <span>{l.message}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 4. QUICK PROMPT CHIPS */}
      <div className="relative z-10 py-1.5 flex items-center gap-1 overflow-x-auto no-scrollbar shrink-0">
        {suggestedPrompts.map((p, pIdx) => (
          <button
            key={pIdx}
            type="button"
            onClick={() => onSendMessage(p)}
            className="px-2 py-0.5 rounded-lg bg-cyan-950/70 hover:bg-cyan-900 border border-cyan-500/30 text-cyan-300 hover:text-white font-mono text-[8px] whitespace-nowrap cursor-pointer transition-colors shadow-sm"
          >
            {p}
          </button>
        ))}
      </div>

      {/* 5. QUICK INPUT BAR */}
      <form onSubmit={handleSubmit} className="relative z-10 pt-1.5 border-t border-cyan-500/25 shrink-0 flex items-center gap-1.5">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="तारा से कुछ भी पूछें..."
          className="flex-1 bg-[#010816]/90 border border-cyan-500/40 focus:border-cyan-400 text-cyan-100 placeholder:text-cyan-500/50 text-[10px] font-mono px-2.5 py-1.5 rounded-xl outline-none transition-all shadow-inner"
        />
        <button
          type="button"
          onClick={onToggleVoice}
          className={`p-1.5 rounded-xl cursor-pointer transition-all ${
            isListening
              ? 'bg-rose-600 text-white animate-pulse shadow-[0_0_12px_rgba(244,63,94,0.7)]'
              : 'bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-500/30'
          }`}
          title="माइक टॉगल करें"
        >
          {isListening ? <Mic className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5" />}
        </button>
        <button
          type="submit"
          disabled={!inputText.trim() || isLoadingChat}
          className="p-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white cursor-pointer transition-all shadow-[0_0_10px_rgba(0,240,255,0.4)]"
          title="संदेश भेजें"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </aside>
  );
};
