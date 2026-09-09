/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Sparkles, 
  Volume2, 
  VolumeX, 
  Copy, 
  Check, 
  Cpu, 
  MessageSquare, 
  ArrowRight,
  FileDown,
  Image as ImageIcon,
  Download
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { ChatMessage } from '../types';
import { downloadImageToDevice } from '../utils/imageService';

interface TaraLiveResponseCardProps {
  latestAssistantMessage?: ChatMessage | null;
  lastUserQuery?: string;
  isLoading: boolean;
  isSpeaking: boolean;
  onSpeakText: (text: string) => void;
  onStopSpeaking: () => void;
  onSelectPrompt: (promptText: string) => void;
  onOpenFullChat: () => void;
  onOpenPosterPreview?: () => void;
  onOpenPdfDownload?: (type?: 'quotes' | 'notes' | 'report') => void;
}

export const TaraLiveResponseCard: React.FC<TaraLiveResponseCardProps> = ({
  latestAssistantMessage,
  lastUserQuery,
  isLoading,
  isSpeaking,
  onSpeakText,
  onStopSpeaking,
  onSelectPrompt,
  onOpenFullChat,
  onOpenPosterPreview,
  onOpenPdfDownload,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!latestAssistantMessage?.text) return;
    navigator.clipboard.writeText(latestAssistantMessage.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full rounded-2xl bg-[#081020]/95 border border-cyan-500/35 p-4 sm:p-5 shadow-[0_4px_30px_rgba(0,0,0,0.6)] backdrop-blur-md transition-all duration-300 relative overflow-hidden">
      {/* Top Cyber Accent Bar */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />

      {/* Header with Tara Identity & Model Badge */}
      <div className="flex items-center justify-between gap-3 mb-3 pb-2.5 border-b border-cyan-500/20 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-slate-950 font-bold shadow-[0_0_10px_rgba(0,240,255,0.4)]">
            <Sparkles className="w-4 h-4 text-slate-950" />
          </div>
          <div>
            <h4 className="font-heading font-bold text-xs sm:text-sm text-slate-100 flex items-center gap-2">
              <span>तारा का उत्तर (Tara's Live Response)</span>
              {isSpeaking && (
                <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-400 animate-pulse">
                  <Volume2 className="w-3 h-3" />
                  <span>बोल रही हैं...</span>
                </span>
              )}
            </h4>
            {lastUserQuery && (
              <p className="text-[11px] text-cyan-300/80 font-mono truncate max-w-[280px] sm:max-w-md">
                प्रश्न: "{lastUserQuery}"
              </p>
            )}
          </div>
        </div>

        {/* Gemini AI Model Badge */}
        <div className="flex items-center gap-2">
          <div className="px-2.5 py-0.5 rounded-full bg-cyan-950/90 border border-cyan-500/50 text-[10px] font-mono text-cyan-300 font-bold flex items-center gap-1 shadow-[0_0_8px_rgba(0,240,255,0.2)]">
            <Cpu className="w-3 h-3 text-cyan-400" />
            <span>Gemini AI (Active)</span>
          </div>

          <button
            onClick={onOpenFullChat}
            className="text-[11px] font-mono text-slate-400 hover:text-cyan-300 flex items-center gap-1 transition-colors p-1 rounded-md hover:bg-slate-900"
            title="Open Full Transcript"
          >
            <MessageSquare className="w-3 h-3" />
            <span className="hidden sm:inline">इतिहास</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <div className="py-6 flex flex-col items-center justify-center gap-3">
          <div className="relative w-10 h-10 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border-2 border-cyan-400/30 border-t-cyan-400 animate-spin" />
            <Sparkles className="w-5 h-5 text-cyan-400 animate-pulse" />
          </div>
          <div className="text-center">
            <p className="font-sans text-xs sm:text-sm text-cyan-200 font-medium">
              तारा जेमिनी 3.8 फ़्लैश से त्वरित उत्तर तैयार कर रही हैं...
            </p>
            <p className="text-[10px] font-mono text-slate-500 mt-0.5">
              STREAMING LOW LATENCY NEURAL CORE
              Processing in Hindi • Low-Latency Direct Synthesis
            </p>
          </div>
        </div>
      ) : latestAssistantMessage ? (
        <div className="flex flex-col gap-3">
          {/* Formatted Markdown Content */}
          <div className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans max-h-[260px] overflow-y-auto pr-1">
            <ReactMarkdown
              components={{
                h1: ({ children }) => <h1 className="text-base font-bold text-cyan-300 mb-1.5">{children}</h1>,
                h2: ({ children }) => <h2 className="text-sm font-bold text-cyan-200 mb-1">{children}</h2>,
                h3: ({ children }) => <h3 className="text-xs font-bold text-cyan-100 mb-1">{children}</h3>,
                p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                ul: ({ children }) => <ul className="list-disc pl-4 mb-2 space-y-1">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal pl-4 mb-2 space-y-1">{children}</ol>,
                li: ({ children }) => <li className="text-slate-300">{children}</li>,
                strong: ({ children }) => <strong className="font-semibold text-cyan-300">{children}</strong>,
                blockquote: ({ children }) => (
                  <blockquote className="border-l-2 border-cyan-500 pl-3 my-2 text-cyan-100/90 italic bg-cyan-950/20 py-1 rounded-r">
                    {children}
                  </blockquote>
                ),
                code: ({ children }) => (
                  <code className="bg-slate-900 px-1.5 py-0.5 rounded text-cyan-300 font-mono text-[11px] border border-cyan-500/20">
                    {children}
                  </code>
                ),
              }}
            >
              {latestAssistantMessage.text}
            </ReactMarkdown>
          </div>

          {/* In-Line Processed Photo Result & Download Button */}
          {latestAssistantMessage.resultImageUrl && (
            <div className="rounded-xl overflow-hidden border-2 border-cyan-400/60 bg-black/80 p-2.5 shadow-lg space-y-2.5 max-w-sm">
              <div className="rounded-lg overflow-hidden bg-black/90 relative group">
                <img
                  src={latestAssistantMessage.resultImageUrl}
                  alt="Tara Generated Image"
                  referrerPolicy="no-referrer"
                  className="w-full h-auto max-h-64 object-contain rounded-lg transition-transform duration-300 group-hover:scale-[1.01]"
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  downloadImageToDevice(
                    latestAssistantMessage.resultImageUrl!,
                    latestAssistantMessage.resultImageDownloadName || 'tara-photo.jpg'
                  );
                }}
                className="w-full py-2.5 px-3 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-medium text-xs shadow-md shadow-cyan-950 flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>इमेज डाउनलोड करें (Download Image)</span>
              </button>
            </div>
          )}

          {/* Action Tools: Voice Replay, Copy, Poster Preview & PDF Download */}
          <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800/80 flex-wrap text-xs">
            <div className="flex items-center gap-2 flex-wrap">
              {isSpeaking ? (
                <button
                  onClick={onStopSpeaking}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-950/80 hover:bg-rose-900 border border-rose-500/50 text-rose-300 font-mono text-[11px] transition-all"
                >
                  <VolumeX className="w-3.5 h-3.5" />
                  <span>आवाज़ रोकें (Stop)</span>
                </button>
              ) : (
                <button
                  onClick={() => onSpeakText(latestAssistantMessage.text)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 font-mono text-[11px] transition-all"
                >
                  <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
                  <span>दोबारा सुनें (Play Voice)</span>
                </button>
              )}

              {/* View Poster / Card Preview button */}
              {onOpenPosterPreview && (
                <button
                  onClick={onOpenPosterPreview}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-400/50 text-cyan-200 hover:text-white text-[11px] font-mono transition-all shadow-xs"
                  title="पोस्टर व फोटो प्रिव्यू देखें"
                >
                  <ImageIcon className="w-3.5 h-3.5 text-cyan-400" />
                  <span>पोस्टर प्रिव्यू</span>
                </button>
              )}

              {/* Direct PDF Download button */}
              {onOpenPdfDownload && (
                <button
                  onClick={() => onOpenPdfDownload('quotes')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-950/80 hover:bg-purple-900 border border-purple-400/50 text-purple-200 hover:text-white text-[11px] font-mono transition-all shadow-xs"
                  title="डायरेक्ट पीडीएफ डाउनलोड करें"
                >
                  <FileDown className="w-3.5 h-3.5 text-purple-300" />
                  <span>Download PDF</span>
                </button>
              )}

              <button
                onClick={handleCopy}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-[11px] font-mono transition-colors"
                title="Copy response text"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'कॉपी हुआ!' : 'कॉपी'}</span>
              </button>
            </div>

            <span className="text-[10px] font-mono text-slate-500">
              {latestAssistantMessage.timestamp}
            </span>
          </div>

          {/* Follow-up Suggested Prompts Chips */}
          {latestAssistantMessage.suggestedPrompts && latestAssistantMessage.suggestedPrompts.length > 0 && (
            <div className="pt-2">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1.5">
                💡 सुझाव / Quick Follow-ups:
              </span>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                {latestAssistantMessage.suggestedPrompts.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => onSelectPrompt(p)}
                    className="flex items-center gap-1 text-[11px] font-mono px-2.5 py-1 rounded-lg bg-slate-900/90 hover:bg-cyan-950/80 border border-cyan-500/25 hover:border-cyan-400 text-cyan-300/90 hover:text-cyan-200 shrink-0 transition-all active:scale-95"
                  >
                    <span>{p}</span>
                    <ArrowRight className="w-2.5 h-2.5 text-cyan-400" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="py-4 text-center text-xs text-slate-400 font-sans">
          तारा से कोई भी प्रश्न पूछें या ऊपर माइक दबाकर बोलें — तुरंत हिंदी में उत्तर मिलेगा।
        </div>
      )}
    </div>
  );
};
