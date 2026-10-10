/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Terminal, 
  Send, 
  Mic, 
  MicOff, 
  Volume2, 
  Copy, 
  Check, 
  Trash2, 
  ArrowDown, 
  Radio, 
  Sparkles, 
  Activity, 
  ShieldCheck, 
  ShieldAlert,
  Search,
  CornerDownLeft
} from 'lucide-react';
import { ChatMessage, SystemLog } from '../types';
import { speechEngine } from '../utils/speech';
import ReactMarkdown from 'react-markdown';

interface SciFiHudLogConsoleProps {
  chatMessages: ChatMessage[];
  logs: SystemLog[];
  onSendMessage: (text: string, media?: any) => void;
  isLoadingChat?: boolean;
  isListening?: boolean;
  onToggleVoice?: () => void;
  liveSpeechTranscript?: string;
  className?: string;
  onClearLogs?: () => void;
}

export const SciFiHudLogConsole: React.FC<SciFiHudLogConsoleProps> = ({
  chatMessages,
  logs,
  onSendMessage,
  isLoadingChat = false,
  isListening = false,
  onToggleVoice,
  liveSpeechTranscript = '',
  className = '',
  onClearLogs,
}) => {
  const [inputText, setInputText] = useState<string>('');
  const [viewMode, setViewMode] = useState<'all' | 'commands' | 'system'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [autoScroll, setAutoScroll] = useState<boolean>(true);
  const [showScrollBottomBtn, setShowScrollBottomBtn] = useState<boolean>(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const bottomAnchorRef = useRef<HTMLDivElement>(null);

  // Smooth auto-scroll function
  const scrollToBottom = useCallback((smooth = true) => {
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    if (smooth) {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: 'smooth',
      });
    } else {
      container.scrollTop = container.scrollHeight;
    }
    setShowScrollBottomBtn(false);
  }, []);

  // Track manual scrolling to toggle auto-scroll and show jump-to-bottom button
  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 60;
    
    if (isAtBottom) {
      setAutoScroll(true);
      setShowScrollBottomBtn(false);
    } else {
      // User scrolled up to inspect previous logs
      setShowScrollBottomBtn(true);
    }
  };

  // Trigger auto-scroll whenever new messages, logs, or live speech arrive
  useEffect(() => {
    if (autoScroll) {
      scrollToBottom(true);
    }
  }, [chatMessages, logs, liveSpeechTranscript, isLoadingChat, autoScroll, scrollToBottom]);

  // Initial scroll to bottom on mount
  useEffect(() => {
    scrollToBottom(false);
  }, [scrollToBottom]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoadingChat) return;
    const text = inputText.trim();
    setInputText('');
    setAutoScroll(true);
    onSendMessage(text);
  };

  const copyToClipboard = (id: string, text: string) => {
    try {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.warn('Copy failed', err);
    }
  };

  // Build unified chronological log items for 'all' mode
  const unifiedItems = React.useMemo(() => {
    if (viewMode === 'commands') {
      return chatMessages.map((msg) => ({
        type: 'chat' as const,
        id: msg.id,
        timestamp: msg.timestamp || 'NOW',
        data: msg,
      }));
    }

    if (viewMode === 'system') {
      return [...logs].reverse().map((log) => ({
        type: 'log' as const,
        id: log.id,
        timestamp: log.timestamp || 'NOW',
        data: log,
      }));
    }

    // Unified chronological stream: both commands and system logs
    const chronologicalLogs = [...logs].reverse().slice(-40);
    const items: Array<{
      type: 'chat' | 'log';
      id: string;
      timestamp: string;
      data: ChatMessage | SystemLog;
    }> = [];

    // Map logs (chronological: oldest to newest)
    chronologicalLogs.forEach((l) => {
      items.push({
        type: 'log',
        id: l.id,
        timestamp: l.timestamp,
        data: l,
      });
    });

    // Map chat messages
    chatMessages.forEach((m) => {
      items.push({
        type: 'chat',
        id: m.id,
        timestamp: m.timestamp,
        data: m,
      });
    });

    return items;
  }, [viewMode, chatMessages, logs]);

  return (
    <div 
      className={`flex flex-col h-full max-h-[380px] lg:max-h-full min-h-0 bg-[#030713]/95 border border-cyan-500/40 rounded-2xl overflow-hidden shadow-[0_0_30px_rgba(0,240,255,0.18)] relative backdrop-blur-md neon-hud-border select-text ${className}`}
      style={{ boxSizing: 'border-box' }}
    >
      {/* Sci-Fi Neon Corner Brackets */}
      <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-cyan-400 z-20 pointer-events-none shadow-[0_0_8px_#00f0ff]" />
      <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-cyan-400 z-20 pointer-events-none shadow-[0_0_8px_#00f0ff]" />
      <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-cyan-400 z-20 pointer-events-none shadow-[0_0_8px_#00f0ff]" />
      <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-cyan-400 z-20 pointer-events-none shadow-[0_0_8px_#00f0ff]" />

      {/* 1. HUD CONSOLE HEADER BAR (Fixed Height, Never Expands) */}
      <div className="px-3 py-2 bg-[#040c1d] border-b border-cyan-500/25 flex items-center justify-between z-10 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <Terminal className="w-4 h-4 text-cyan-400 shrink-0 animate-pulse" />
          <div className="flex items-center gap-1.5 truncate">
            <span className="font-heading font-black text-xs text-cyan-200 tracking-wider">
              TARA HUD LOG CONSOLE
            </span>
            <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded bg-cyan-950/80 border border-cyan-500/30 text-[9px] font-mono text-cyan-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span>LIVE</span>
            </span>
          </div>
        </div>

        {/* View Mode Tabs & Action Buttons */}
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="flex items-center p-0.5 rounded-lg bg-[#020611] border border-cyan-500/30 text-[10px] font-mono">
            <button
              type="button"
              onClick={() => {
                setViewMode('all');
                setAutoScroll(true);
              }}
              className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                viewMode === 'all'
                  ? 'bg-cyan-950 text-cyan-300 font-bold border border-cyan-400/50 shadow-sm'
                  : 'text-slate-400 hover:text-cyan-200'
              }`}
              title="सभी कमांड्स, सर्च और सिस्टम लॉग्स देखें"
            >
              सब (All)
            </button>
            <button
              type="button"
              onClick={() => {
                setViewMode('commands');
                setAutoScroll(true);
              }}
              className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                viewMode === 'commands'
                  ? 'bg-cyan-950 text-cyan-300 font-bold border border-cyan-400/50 shadow-sm'
                  : 'text-slate-400 hover:text-cyan-200'
              }`}
              title="सिर्फ वॉयस/टेक्स्ट कमांड्स और उत्तर"
            >
              कमांड्स ({chatMessages.length})
            </button>
            <button
              type="button"
              onClick={() => {
                setViewMode('system');
                setAutoScroll(true);
              }}
              className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                viewMode === 'system'
                  ? 'bg-cyan-950 text-cyan-300 font-bold border border-cyan-400/50 shadow-sm'
                  : 'text-slate-400 hover:text-cyan-200'
              }`}
              title="सिर्फ सिस्टम व टेलीमेट्री लॉग्स"
            >
              सिस्टम ({logs.length})
            </button>
          </div>

          {/* Quick Clear Button */}
          {onClearLogs && (
            <button
              type="button"
              onClick={onClearLogs}
              className="p-1 rounded-lg bg-slate-900/60 hover:bg-rose-950/80 border border-slate-700 hover:border-rose-500/40 text-slate-400 hover:text-rose-300 transition-colors cursor-pointer"
              title="लॉग्स खाली करें"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 2. AUTO-SCROLLING LOG VIEWPORT (Fixed Max Height, Inner Scroll Only) */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 min-h-0 overflow-y-auto p-2.5 sm:p-3 flex flex-col gap-2 font-mono text-xs custom-scrollbar relative"
      >
        {unifiedItems.length === 0 ? (
          <div className="m-auto text-center p-6 text-slate-500 font-mono text-xs flex flex-col items-center gap-2">
            <Radio className="w-6 h-6 text-cyan-500/40 animate-pulse" />
            <p className="text-cyan-300/80 font-bold">लॉग कंसोल तैयार है (IDLE // LISTENING)</p>
            <p className="text-[11px] text-slate-400">
              माइक से बोलें या नीचे कमांड टाइप करें। नए सवाल और सर्च हमेशा नीचे दिखाई देंगे।
            </p>
          </div>
        ) : (
          unifiedItems.map((item) => {
            if (item.type === 'chat') {
              const msg = item.data as ChatMessage;
              const isUser = msg.sender === 'user';

              return (
                <div
                  key={`chat-${msg.id}`}
                  className={`flex flex-col animate-in fade-in slide-in-from-bottom-1 duration-150 ${
                    isUser ? 'items-end' : 'items-start'
                  }`}
                >
                  <div
                    className={`max-w-[94%] rounded-xl p-2.5 leading-relaxed text-xs shadow-md transition-all ${
                      isUser
                        ? 'bg-[#06182c]/95 text-cyan-100 border border-cyan-400/50 shadow-[0_0_15px_rgba(0,240,255,0.12)]'
                        : 'bg-[#051122]/95 text-slate-200 border border-cyan-500/30'
                    }`}
                  >
                    {/* Badge & Meta bar */}
                    <div className="flex items-center justify-between gap-2 pb-1.5 mb-1.5 border-b border-cyan-500/20 text-[10px] font-mono">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`px-1.5 py-0.2 rounded font-bold uppercase text-[9px] ${
                            isUser
                              ? 'bg-cyan-900/80 text-cyan-300 border border-cyan-400/50'
                              : 'bg-emerald-950/80 text-emerald-300 border border-emerald-400/50'
                          }`}
                        >
                          {isUser ? '❯ COMMAND / SEARCH' : '🛡️ TARA AI'}
                        </span>
                        <span className="text-slate-400 text-[9px]">[{msg.timestamp || 'LIVE'}]</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {!isUser && (
                          <button
                            type="button"
                            onClick={() => speechEngine.speak(msg.text, true)}
                            className="px-1.5 py-0.2 rounded bg-cyan-950/70 hover:bg-cyan-900 text-cyan-300 hover:text-white border border-cyan-500/30 flex items-center gap-1 text-[9px] cursor-pointer"
                            title="तारा की आवाज़ में दोबारा सुनें"
                          >
                            <Volume2 className="w-2.5 h-2.5 text-cyan-300" />
                            <span>सुनें</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => copyToClipboard(msg.id, msg.text)}
                          className="p-1 rounded text-slate-400 hover:text-cyan-300 cursor-pointer"
                          title="टेक्स्ट कॉपी करें"
                        >
                          {copiedId === msg.id ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Message Body */}
                    <div className="font-sans text-xs whitespace-pre-wrap leading-relaxed">
                      <ReactMarkdown>{msg.text}</ReactMarkdown>
                    </div>
                  </div>
                </div>
              );
            }

            // System Log line
            const log = item.data as SystemLog;
            const isWarn = log.level === 'warn';
            const isExec = log.level === 'exec';
            const isSuccess = log.level === 'success';

            return (
              <div
                key={`log-${log.id}`}
                className={`p-1.5 rounded-lg border flex items-start gap-2 text-[10px] font-mono leading-tight ${
                  isWarn
                    ? 'bg-rose-950/30 border-rose-500/30 text-rose-300'
                    : isExec
                    ? 'bg-amber-950/30 border-amber-500/30 text-amber-200'
                    : isSuccess
                    ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-200'
                    : 'bg-[#030917] border-cyan-500/15 text-slate-300'
                }`}
              >
                <span className="text-slate-500 shrink-0">[{log.timestamp}]</span>
                <span className={`font-bold shrink-0 ${
                  isWarn ? 'text-rose-400' : isExec ? 'text-amber-400' : isSuccess ? 'text-emerald-400' : 'text-cyan-400'
                }`}>
                  [{log.module}]
                </span>
                <span className="flex-1 break-words">{log.message}</span>
              </div>
            );
          })
        )}

        {/* Loading Indicator when AI is Generating */}
        {isLoadingChat && (
          <div className="flex items-center gap-2 p-2 rounded-xl bg-[#061427] border border-cyan-400/40 text-xs font-mono text-cyan-300 animate-pulse self-start">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span>TARA उत्तर व विश्लेषण तैयार कर रही हैं...</span>
          </div>
        )}

        {/* Live Voice Typing Stream (Real-Time Mic Detection) */}
        {isListening && (
          <div className="flex flex-col items-end animate-in fade-in slide-in-from-bottom-2">
            <div className="max-w-[94%] rounded-xl p-2.5 bg-gradient-to-r from-[#0d2642] to-[#07192d] border-2 border-cyan-400 text-cyan-100 shadow-[0_0_20px_rgba(0,240,255,0.4)]">
              <div className="flex items-center gap-2 pb-1 mb-1 border-b border-cyan-500/30 text-[10px] font-mono text-cyan-300 font-bold">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                <span>🎙️ लाइव वॉयस ट्रांसक्रिप्शन (LIVE SPEECH STREAM)...</span>
              </div>
              <p className="text-xs font-sans text-white font-medium flex items-center gap-1.5 flex-wrap">
                <span>{liveSpeechTranscript || 'बोलिए, मैं सुन रही हूँ (हिंदी/English)...'}</span>
                <span className="w-1.5 h-3.5 bg-cyan-400 animate-pulse inline-block shadow-[0_0_8px_#00f0ff]" />
              </p>
            </div>
          </div>
        )}

        {/* Scroll anchor at bottom */}
        <div ref={bottomAnchorRef} className="h-0.5 shrink-0" />
      </div>

      {/* FLOATING "JUMP TO LATEST" BUTTON (Appears when scrolled up) */}
      {showScrollBottomBtn && (
        <button
          type="button"
          onClick={() => {
            setAutoScroll(true);
            scrollToBottom(true);
          }}
          className="absolute bottom-16 right-4 z-30 px-2.5 py-1 rounded-full bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-mono font-bold text-[10px] shadow-[0_0_20px_rgba(0,240,255,0.6)] flex items-center gap-1 cursor-pointer animate-bounce transition-all"
          title="नवीनतम लॉग व कमांड पर जाएं"
        >
          <ArrowDown className="w-3 h-3" />
          <span>नया कमांड (Latest)</span>
        </button>
      )}

      {/* 3. QUICK CHIPS BAR (Common Commands) */}
      <div className="px-2.5 py-1 bg-[#020714] border-t border-cyan-500/15 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0 text-[10px] font-mono">
        <span className="text-slate-500 shrink-0 text-[9px]">क्विक:</span>
        <button
          type="button"
          onClick={() => onSendMessage('इंडिया समाचार बताओ')}
          className="px-2 py-0.5 rounded-md bg-red-950/70 hover:bg-red-900 border border-red-500/40 text-red-200 shrink-0 cursor-pointer transition-colors"
        >
          📻 इंडिया समाचार
        </button>
        <button
          type="button"
          onClick={() => onSendMessage('मुझे देखो')}
          className="px-2 py-0.5 rounded-md bg-emerald-950/70 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-200 shrink-0 cursor-pointer transition-colors"
        >
          👁️ मुझे देखो
        </button>
        <button
          type="button"
          onClick={() => onSendMessage('आज का मौसम कैसा है?')}
          className="px-2 py-0.5 rounded-md bg-cyan-950/70 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-200 shrink-0 cursor-pointer transition-colors"
        >
          🌤️ मौसम
        </button>
        <button
          type="button"
          onClick={() => onSendMessage('सिस्टम की स्थिति बताओ')}
          className="px-2 py-0.5 rounded-md bg-purple-950/70 hover:bg-purple-900 border border-purple-500/40 text-purple-200 shrink-0 cursor-pointer transition-colors"
        >
          🔋 सिस्टम स्थिति
        </button>
      </div>

      {/* 4. COMPACT HUD INPUT BAR (Never Increases Box Height) */}
      <form
        onSubmit={handleSubmit}
        className="p-2 bg-[#040d1e] border-t border-cyan-500/25 flex items-center gap-1.5 shrink-0"
      >
        {/* Voice Toggle Button */}
        {onToggleVoice && (
          <button
            type="button"
            onClick={onToggleVoice}
            className={`p-2 rounded-xl transition-all cursor-pointer shrink-0 ${
              isListening
                ? 'bg-rose-600 text-white animate-pulse shadow-[0_0_15px_rgba(244,63,94,0.6)]'
                : 'bg-[#020612] text-cyan-400 hover:text-white border border-cyan-500/30 hover:border-cyan-400'
            }`}
            title={isListening ? 'माइक बंद करें' : 'माइक से हिंदी में बोलें'}
          >
            {isListening ? <Mic className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5" />}
          </button>
        )}

        {/* Input Prefix */}
        <span className="text-cyan-400 font-mono text-xs font-bold shrink-0 hidden sm:inline">
          TARA&gt;
        </span>

        {/* Text Input Box */}
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="आदेश या सर्च टाइप करें... (उदा. 'इंडिया समाचार बताओ')"
          className="flex-1 min-w-0 bg-[#020612] border border-cyan-500/30 rounded-xl px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
        />

        {/* Send Button */}
        <button
          type="submit"
          disabled={isLoadingChat || !inputText.trim()}
          className="px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-sky-600 hover:from-cyan-500 hover:to-sky-500 disabled:opacity-40 text-slate-950 text-xs font-mono font-bold flex items-center gap-1 shadow-[0_0_12px_rgba(0,240,255,0.3)] transition-all cursor-pointer active:scale-95 shrink-0"
          title="कमांड भेजें (Enter)"
        >
          <span>भेजें</span>
          <CornerDownLeft className="w-3 h-3" />
        </button>
      </form>
    </div>
  );
};
