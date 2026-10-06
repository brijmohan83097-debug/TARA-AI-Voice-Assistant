/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Activity, 
  Send, 
  Mic, 
  MicOff, 
  Volume2, 
  Monitor, 
  Camera, 
  Terminal, 
  CheckCircle2, 
  Sparkles,
  Copy,
  Check
} from 'lucide-react';
import { ChatMessage, SystemLog } from '../types';
import { speechEngine } from '../utils/speech';
import ReactMarkdown from 'react-markdown';

interface CyberActivityChatPanelProps {
  chatMessages: ChatMessage[];
  logs: SystemLog[];
  onSendMessage: (text: string, media?: any) => void;
  isLoadingChat: boolean;
  isListening: boolean;
  onToggleVoice: () => void;
  screenStream: MediaStream | null;
  onCaptureScreenSnapshot: () => void;
  className?: string;
  liveSpeechTranscript?: string;
}

export const CyberActivityChatPanel: React.FC<CyberActivityChatPanelProps> = ({
  chatMessages,
  logs,
  onSendMessage,
  isLoadingChat,
  isListening,
  onToggleVoice,
  screenStream,
  onCaptureScreenSnapshot,
  className = '',
  liveSpeechTranscript = '',
}) => {
  const [inputText, setInputText] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'chat' | 'terminal'>('chat');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Auto-scroll on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatMessages, logs, isLoadingChat]);

  // Attach live screen stream to video element when active
  useEffect(() => {
    if (videoRef.current && screenStream) {
      videoRef.current.srcObject = screenStream;
    }
  }, [screenStream]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoadingChat) return;
    const text = inputText.trim();
    setInputText('');
    onSendMessage(text);
  };

  const copyToClipboard = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className={`flex flex-col h-full bg-[#040814]/95 border border-cyan-500/40 rounded-xl overflow-hidden shadow-[0_0_25px_rgba(0,240,255,0.18)] relative backdrop-blur-md neon-hud-border ${className}`}>
      {/* Sci-Fi HUD Corner Brackets */}
      <div className="absolute top-0 left-0 w-3.5 h-3.5 border-t-2 border-l-2 border-cyan-400 z-20 pointer-events-none shadow-[0_0_8px_#00f0ff]" />
      <div className="absolute top-0 right-0 w-3.5 h-3.5 border-t-2 border-r-2 border-cyan-400 z-20 pointer-events-none shadow-[0_0_8px_#00f0ff]" />
      <div className="absolute bottom-0 left-0 w-3.5 h-3.5 border-b-2 border-l-2 border-cyan-400 z-20 pointer-events-none shadow-[0_0_8px_#00f0ff]" />
      <div className="absolute bottom-0 right-0 w-3.5 h-3.5 border-b-2 border-r-2 border-cyan-400 z-20 pointer-events-none shadow-[0_0_8px_#00f0ff]" />

      {/* 1. PANEL HEADER & TAB SWITCHER */}
      <div className="px-3 py-2 bg-[#060e1d] border-b border-cyan-500/25 flex items-center justify-between z-10 shrink-0">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-cyan-400" />
          <span className="font-mono text-xs font-bold text-cyan-300 tracking-wider">
            [03 // AI ACTIVITY & CHAT STREAM]
          </span>
        </div>

        {/* Segmented Switcher */}
        <div className="flex items-center p-0.5 rounded bg-[#030914] border border-cyan-500/25 text-[10px] font-mono">
          <button
            type="button"
            onClick={() => setActiveTab('chat')}
            className={`px-2 py-0.5 rounded transition-colors ${
              activeTab === 'chat'
                ? 'bg-cyan-950 text-cyan-300 font-bold border border-cyan-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            संवाद ({chatMessages.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('terminal')}
            className={`px-2 py-0.5 rounded transition-colors ${
              activeTab === 'terminal'
                ? 'bg-cyan-950 text-cyan-300 font-bold border border-cyan-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            लॉग्स ({logs.length})
          </button>
        </div>
      </div>

      {/* 2. LIVE SCREEN SHARE HUD MONITOR (Rendered when Screen Share is active) */}
      {screenStream && (
        <div className="p-2.5 bg-[#030a17] border-b border-cyan-500/25 flex flex-col gap-1.5 shrink-0 animate-in fade-in">
          <div className="flex items-center justify-between text-[10px] font-mono">
            <div className="flex items-center gap-1.5 text-cyan-300 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>🖥️ लैपटॉप स्क्रीन लाइव स्ट्रीम (TARA OBSERVING)</span>
            </div>
            <button
              type="button"
              onClick={onCaptureScreenSnapshot}
              className="px-2 py-0.5 rounded bg-emerald-950 border border-emerald-400/50 text-[9px] font-mono text-emerald-300 hover:text-white flex items-center gap-1 cursor-pointer"
            >
              <Camera className="w-2.5 h-2.5" />
              <span>स्क्रीन का विश्लेषण पूछें</span>
            </button>
          </div>

          {/* Video Screen Feed Container */}
          <div className="relative w-full aspect-[16/9] rounded-lg overflow-hidden border border-cyan-500/40 bg-black shadow-inner">
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted 
              className="w-full h-full object-cover"
            />
            {/* Holographic HUD Targeting Reticle */}
            <div className="absolute inset-0 pointer-events-none border border-cyan-400/30 flex items-center justify-center">
              <div className="w-12 h-12 border border-cyan-400/50 rounded-full animate-ping opacity-30" />
              <div className="absolute bottom-1 left-2 text-[8px] font-mono text-cyan-400/80 bg-black/60 px-1 rounded">
                LIVE 1080P // AI VISION ACTIVE
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. CHAT OR TERMINAL MESSAGES STREAM */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-3 flex flex-col gap-2.5 text-xs font-sans custom-scrollbar"
      >
        {activeTab === 'chat' ? (
          chatMessages.length === 0 ? (
            <div className="m-auto text-center p-4 text-slate-500 font-mono text-xs">
              कोई संदेश नहीं है। ऊपर दिए गए "START AI" बटन को दबाएं या नीचे टाइप करें।
            </div>
          ) : (
            chatMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[92%] rounded-xl p-2.5 leading-relaxed text-xs shadow-md ${
                    msg.sender === 'user'
                      ? 'bg-[#091a2e] text-cyan-100 border border-cyan-500/40 rounded-tr-xs'
                      : 'bg-[#06101f] text-slate-200 border border-cyan-500/25 rounded-tl-xs'
                  }`}
                >
                  {/* Sender Header Bar */}
                  <div className="flex items-center justify-between gap-2 pb-1 mb-1 border-b border-cyan-500/15 text-[10px] font-mono font-bold">
                    <span className={msg.sender === 'user' ? 'text-cyan-300' : 'text-emerald-300'}>
                      {msg.sender === 'user' ? '👤 आप (Voice/Text):' : '👩‍💼 TARA (AI Assistant):'}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {msg.sender === 'assistant' && (
                        <button
                          type="button"
                          onClick={() => speechEngine.speak(msg.text)}
                          className="text-cyan-400 hover:text-white flex items-center gap-0.5 cursor-pointer"
                          title="बोलकर सुनें (TTS)"
                        >
                          <Volume2 className="w-3 h-3" />
                          <span>सुनें</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => copyToClipboard(msg.id, msg.text)}
                        className="text-slate-400 hover:text-cyan-300 cursor-pointer"
                        title="कॉपी करें"
                      >
                        {copiedId === msg.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>

                  {/* Message Body */}
                  <div className="whitespace-pre-wrap font-sans text-xs">
                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                  </div>
                </div>
              </div>
            ))
          )
        ) : (
          /* Terminal Logs View */
          <div className="flex flex-col gap-1 font-mono text-[10px]">
            {logs.slice(-25).map((log) => (
              <div key={log.id} className="p-1 rounded bg-[#030814] border border-cyan-500/10 flex items-start gap-1.5">
                <span className="text-slate-500">[{log.timestamp}]</span>
                <span className="text-cyan-400 font-bold">[{log.module}]</span>
                <span className="text-slate-300 flex-1">{log.message}</span>
              </div>
            ))}
          </div>
        )}

        {/* Loading Spinner Indicator */}
        {isLoadingChat && (
          <div className="flex items-center gap-2 p-2 rounded-lg bg-[#06101f] border border-cyan-500/30 text-xs font-mono text-cyan-300 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span>TARA उत्तर तैयार कर रही हैं...</span>
          </div>
        )}

        {/* Live Voice Typing Stream Bubble (Real-time Speech Detection) */}
        {isListening && (
          <div className="flex flex-col items-end animate-in fade-in slide-in-from-bottom-2">
            <div className="max-w-[92%] rounded-xl p-3 bg-gradient-to-r from-[#0d223a] to-[#071728] border-2 border-cyan-400 text-cyan-100 shadow-[0_0_20px_rgba(0,240,255,0.4)]">
              <div className="flex items-center gap-2 pb-1.5 mb-1.5 border-b border-cyan-500/30 text-[10px] font-mono text-cyan-300 font-bold">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                <span>🎙️ लाइव वॉयस ट्रांसक्रिप्शन (LIVE SPEECH STREAM)...</span>
              </div>
              <p className="text-xs font-sans text-white font-medium flex items-center gap-1.5 flex-wrap">
                <span>{liveSpeechTranscript || 'बोलिए, मैं सुन रही हूँ (Listening in Hindi/English)...'}</span>
                <span className="w-2 h-4 bg-cyan-400 animate-pulse inline-block shadow-[0_0_8px_#00f0ff]" />
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 4. HUD CYBER INPUT BAR AT BOTTOM */}
      <form
        onSubmit={handleSubmit}
        className="p-2 bg-[#050c1b] border-t border-cyan-500/20 flex items-center gap-2 shrink-0"
      >
        {/* Voice Mic Button */}
        <button
          type="button"
          onClick={onToggleVoice}
          className={`p-2 rounded-xl transition-all cursor-pointer ${
            isListening
              ? 'bg-rose-600 text-white animate-pulse shadow-[0_0_15px_rgba(244,63,94,0.6)]'
              : 'bg-[#030914] text-cyan-400 hover:text-white border border-cyan-500/30'
          }`}
          title="हिंदी में बोलें (Voice Input)"
        >
          {isListening ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
        </button>

        {/* Text Input Box */}
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="TARA को हिंदी में आदेश दें या पूछें..."
          className="flex-1 bg-[#030814] border border-cyan-500/30 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-sans"
        />

        {/* Send Button */}
        <button
          type="submit"
          disabled={isLoadingChat || !inputText.trim()}
          className="px-3 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-40 text-white text-xs font-mono font-bold flex items-center gap-1 shadow-[0_0_12px_rgba(0,240,255,0.25)] transition-all cursor-pointer active:scale-95"
        >
          <span>भेजें</span>
          <Send className="w-3 h-3" />
        </button>
      </form>
    </div>
  );
};
