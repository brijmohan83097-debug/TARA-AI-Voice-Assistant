import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Bot, 
  User, 
  Mic, 
  MicOff, 
  Sparkles, 
  Terminal, 
  Trash2, 
  Zap, 
  CheckCircle, 
  FileText, 
  Network, 
  Sliders, 
  Volume2,
  VolumeX,
  Languages,
  AudioWaveform,
  Globe,
  PhoneCall,
  PhoneOff,
  MessageSquareShare,
  Download
} from 'lucide-react';
import { ChatMessage, SystemMode } from '../types';
import { audioSynth } from '../utils/audio';
import { speechEngine } from '../utils/speech';
import { downloadImageToDevice } from '../utils/imageService';
import { LogoCard } from './LogoCard';
import { sanitizeChatBubbleText } from '../utils/textSanitizer';

interface ChatSectionProps {
  messages: ChatMessage[];
  isLoading: boolean;
  systemMode: SystemMode;
  onSendMessage: (text: string) => void;
  onClearChat: () => void;
}

export const ChatSection: React.FC<ChatSectionProps> = ({
  messages,
  isLoading,
  systemMode,
  onSendMessage,
  onClearChat,
}) => {
  const [inputText, setInputText] = useState<string>('');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [voiceLang, setVoiceLang] = useState<'hi-IN' | 'en-US'>('hi-IN');
  const [showCommands, setShowCommands] = useState<boolean>(false);
  const [currentlySpeakingMsgId, setCurrentlySpeakingMsgId] = useState<string | null>(null);
  const [isTtsActive, setIsTtsActive] = useState<boolean>(speechEngine.getIsTtsEnabled());
  const [isEngineSpeaking, setIsEngineSpeaking] = useState<boolean>(speechEngine.getIsSpeaking());

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lastSpokenMessageIdRef = useRef<string | null>(null);
  const chatSilenceTimerRef = useRef<any>(null);
  const chatRecogRef = useRef<any>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Subscribe to speech synthesis state
  useEffect(() => {
    const unsub = speechEngine.onSpeakingChange((speaking) => {
      setIsEngineSpeaking(speaking);
      if (!speaking) {
        setCurrentlySpeakingMsgId(null);
      }
    });
    return unsub;
  }, []);

  // Automatically speak out loud any new assistant response instantly
  useEffect(() => {
    if (messages.length === 0) return;
    const latestMsg = messages[messages.length - 1];

    if (
      latestMsg.sender === 'assistant' &&
      latestMsg.id !== lastSpokenMessageIdRef.current &&
      !latestMsg.text.includes('SYNTHESIZING NEURAL')
    ) {
      lastSpokenMessageIdRef.current = latestMsg.id;
      setCurrentlySpeakingMsgId(latestMsg.id);
      // Speak aloud immediately (Hindi or English text)
      speechEngine.speak(latestMsg.text);
    }
  }, [messages]);

  // Manual Replay TTS for any message
  const handlePlayMessageAudio = (msgId: string, text: string) => {
    if (currentlySpeakingMsgId === msgId && isEngineSpeaking) {
      speechEngine.stopSpeaking();
      setCurrentlySpeakingMsgId(null);
    } else {
      setCurrentlySpeakingMsgId(msgId);
      speechEngine.speak(text, true); // force replay even if muted
    }
  };

  const handleToggleTtsMaster = () => {
    const nextState = speechEngine.toggleTts();
    setIsTtsActive(nextState);
  };

  // Voice speech-to-text recognition handler (Supports continuous Hindi hi-IN and English en-US)
  const handleToggleVoice = () => {
    audioSynth.playClick();
    if (!isListening) {
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        try {
          const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
          const recognition = new SpeechRecognitionClass();
          recognition.continuous = true;
          recognition.interimResults = true;
          recognition.lang = voiceLang; // 'hi-IN' or 'en-US'
          chatRecogRef.current = recognition;

          let baseInput = inputText ? inputText.trim() + ' ' : '';

          recognition.onstart = () => {
            setIsListening(true);
          };

          recognition.onresult = (event: any) => {
            let interim = '';
            let final = '';
            for (let i = 0; i < event.results.length; ++i) {
              const transcript = event.results[i][0].transcript;
              if (event.results[i].isFinal) {
                final += transcript + ' ';
              } else {
                interim += transcript;
              }
            }

            const currentTranscript = (baseInput + final + interim).trim();
            setInputText(currentTranscript);

            if (chatSilenceTimerRef.current) {
              clearTimeout(chatSilenceTimerRef.current);
              chatSilenceTimerRef.current = null;
            }

            // Comfortable 2.4-second silence window: listen as long as user speaks!
            if (currentTranscript.length >= 2) {
              chatSilenceTimerRef.current = setTimeout(() => {
                setIsListening(false);
                try { recognition.stop(); } catch {}
                audioSynth.playSend();
                onSendMessage(currentTranscript);
                setInputText('');
              }, 2400);
            }
          };

          recognition.onerror = (err: any) => {
            if (err.error !== 'no-speech' && err.error !== 'aborted') {
              setIsListening(false);
            }
          };

          recognition.onend = () => {
            setIsListening(false);
          };

          recognition.start();
        } catch {
          setIsListening(false);
        }
      } else {
        // Fallback for simulated testing
        setIsListening(true);
        setTimeout(() => {
          if (voiceLang === 'hi-IN') {
            setInputText('नमस्ते तारा, आज के महत्वपूर्ण कार्य बताओ');
          } else {
            setInputText('Run morning briefing pipeline and check critical directives');
          }
          setIsListening(false);
          audioSynth.playReceive();
        }, 1200);
      }
    } else {
      if (chatSilenceTimerRef.current) {
        clearTimeout(chatSilenceTimerRef.current);
        chatSilenceTimerRef.current = null;
      }
      if (chatRecogRef.current) {
        try { chatRecogRef.current.stop(); } catch {}
      }
      setIsListening(false);
      if (inputText.trim()) {
        handleSend();
      }
    }
  };

  const handleSend = () => {
    if (!inputText.trim() || isLoading) return;
    audioSynth.playSend();
    onSendMessage(inputText.trim());
    setInputText('');
    setShowCommands(false);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    } else if (e.key === '/' && inputText === '') {
      setShowCommands(true);
    }
  };

  const slashCommands = [
    { cmd: '/task', desc: 'Create a new directive / task', example: '/task नया कार्य जोड़ो' },
    { cmd: '/note', desc: 'Save quick thought into scratchpad', example: '/note जरूरी नोट्स' },
    { cmd: '/memory', desc: 'Add memory anchor to mind map', example: '/memory Workstation budget $4k' },
    { cmd: '/skill', desc: 'Register a cognitive skill', example: '/skill Quantum Cryptography' },
    { cmd: '/workflow', desc: 'Execute automation pipeline', example: '/workflow 1' },
    { cmd: '/audit', desc: 'Run full zero-trust security scan', example: '/audit' },
  ];

  return (
    <div className="flex flex-col h-full cyber-panel rounded-xl overflow-hidden border border-cyan-500/20 bg-[#090e17]/95 shadow-2xl">
      {/* Chat Section Header */}
      <div className="p-3 border-b border-cyan-500/20 bg-slate-950/80 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-cyan-950/70 border border-cyan-500/40 text-cyan-400">
            {isEngineSpeaking ? (
              <AudioWaveform className="w-4 h-4 text-emerald-400 animate-pulse" />
            ) : (
              <Bot className="w-4 h-4 text-cyan-300 animate-pulse" />
            )}
            <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_#00ff9d]"></span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="font-heading text-sm font-bold text-slate-100 flex items-center gap-1.5">
                TARA VOICE MATRIX
              </h2>
              <span className="text-[10px] font-mono text-cyan-400 px-1.5 py-0.2 rounded bg-cyan-950/60 border border-cyan-500/30">
                GEMINI 2.5 FLASH
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
              <span>Mode:</span> 
              <span className="text-cyan-300 font-semibold">{systemMode}</span>
              <span className="text-slate-600">•</span>
              <span className="text-emerald-400 flex items-center gap-1">
                <Globe className="w-3 h-3 text-emerald-400" />
                हिंदी & EN Audio Active
              </span>
            </p>
          </div>
        </div>

        {/* Right Header Controls */}
        <div className="flex items-center gap-2">
          {/* TTS Audio Global Toggle */}
          <button
            onClick={handleToggleTtsMaster}
            className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-mono border transition-all ${
              isTtsActive 
                ? 'bg-cyan-950/60 border-cyan-500/40 text-cyan-300' 
                : 'bg-slate-900 border-slate-800 text-slate-500'
            }`}
            title={isTtsActive ? 'Tara Voice TTS Active' : 'Tara Voice TTS Muted'}
          >
            {isTtsActive ? <Volume2 className="w-3.5 h-3.5 text-cyan-400" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span className="text-[11px]">{isTtsActive ? 'TTS ON' : 'TTS OFF'}</span>
          </button>

          {/* Voice Mic Language Switcher */}
          <button
            onClick={() => setVoiceLang(prev => prev === 'hi-IN' ? 'en-US' : 'hi-IN')}
            className="flex items-center gap-1 px-2 py-1 rounded text-xs font-mono bg-slate-900 border border-slate-800 text-slate-300 hover:border-cyan-500/40 hover:text-cyan-300 transition-colors"
            title="Switch Voice Input Language (Hindi / English)"
          >
            <Languages className="w-3.5 h-3.5 text-cyan-400" />
            <span>{voiceLang === 'hi-IN' ? 'हिंदी (hi)' : 'EN (us)'}</span>
          </button>

          {/* Clear Chat */}
          <button
            onClick={() => {
              audioSynth.playClick();
              speechEngine.stopSpeaking();
              onClearChat();
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 border border-transparent hover:border-rose-500/30 transition-colors"
            title="Clear Chat History"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Messages Scroll View */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 cyber-grid-dense bg-[#060911]/90">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          const isCurrentlySpeakingThis = currentlySpeakingMsgId === msg.id && isEngineSpeaking;
          const isHindi = speechEngine.isHindiText(msg.text);

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-full`}
            >
              <div className="flex items-start gap-2.5 max-w-[92%] sm:max-w-[85%]">
                {!isUser && (
                  <div className={`w-7 h-7 rounded-lg border flex items-center justify-center shrink-0 mt-1 shadow-[0_0_8px_rgba(0,240,255,0.2)] transition-colors ${
                    isCurrentlySpeakingThis 
                      ? 'bg-emerald-950/80 border-emerald-500/60 text-emerald-300 animate-pulse' 
                      : 'bg-cyan-950/80 border-cyan-500/40 text-cyan-300'
                  }`}>
                    {isCurrentlySpeakingThis ? <AudioWaveform className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                  </div>
                )}

                <div className="flex flex-col gap-1.5 w-full overflow-hidden">
                  <div
                    className={`p-3.5 rounded-2xl text-xs sm:text-[13px] leading-relaxed backdrop-blur-md shadow-md transition-all ${
                      isUser
                        ? 'bg-cyan-950/70 text-cyan-100 border border-cyan-500/40 rounded-tr-sm ml-auto'
                        : isCurrentlySpeakingThis
                        ? 'bg-slate-900/95 text-slate-100 border border-emerald-500/50 shadow-[0_0_15px_rgba(0,255,157,0.15)] rounded-tl-sm'
                        : 'bg-slate-900/90 text-slate-200 border border-slate-800 rounded-tl-sm'
                    }`}
                  >
                    {/* Assistant Message Header with Voice Replay & Hindi Tag */}
                    {!isUser && (
                      <div className="flex items-center justify-between gap-2 pb-2 mb-2 border-b border-cyan-500/15">
                        <div className="flex items-center gap-1.5">
                          <span className="font-heading font-semibold text-[11px] text-cyan-300">
                            TARA VOICE
                          </span>
                          {isHindi && (
                            <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-amber-950/60 border border-amber-500/40 text-amber-300">
                              हिंदी AUDIO
                            </span>
                          )}
                          {isCurrentlySpeakingThis && (
                            <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-300 animate-pulse">
                              <AudioWaveform className="w-3 h-3 text-emerald-400" />
                              Speaking...
                            </span>
                          )}
                        </div>

                        {/* Instant Listen / Replay Audio Button */}
                        <button
                          onClick={() => handlePlayMessageAudio(msg.id, msg.text)}
                          className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono border transition-all ${
                            isCurrentlySpeakingThis
                              ? 'bg-emerald-950 text-emerald-300 border-emerald-500 shadow-[0_0_8px_rgba(0,255,157,0.3)]'
                              : 'bg-slate-800/80 text-cyan-300 border-cyan-500/30 hover:border-cyan-400 hover:bg-cyan-950/50'
                          }`}
                          title="Listen to response aloud"
                        >
                          <Volume2 className="w-3 h-3" />
                          <span>{isCurrentlySpeakingThis ? 'Stop' : 'Listen'}</span>
                        </button>
                      </div>
                    )}

                    {/* Render Image Attachment if present */}
                    {msg.imageUrl && (
                      <div className="mb-2.5 rounded-xl overflow-hidden border border-cyan-500/40 max-w-sm shadow-md bg-black/40">
                        <img
                          src={msg.imageUrl}
                          alt="Attached media"
                          className="w-full h-auto max-h-56 object-contain rounded-lg"
                        />
                      </div>
                    )}

                    {/* Render plain / formatted text */}
                    <div className="whitespace-pre-wrap font-sans break-words space-y-1.5">
                      {sanitizeChatBubbleText(msg.text).split('\n').map((line, idx) => {
                        if (!line.trim()) return null;
                        if (line.startsWith('### ')) {
                          return (
                            <h4 key={idx} className="font-heading font-bold text-sm text-cyan-300 pt-1 pb-0.5 border-b border-cyan-500/20">
                              {line.replace('### ', '')}
                            </h4>
                          );
                        }
                        if (line.startsWith('- ')) {
                          return (
                            <div key={idx} className="flex items-start gap-1.5 pl-1 text-slate-300">
                              <span className="text-cyan-400 mt-1">•</span>
                              <span>{line.replace('- ', '')}</span>
                            </div>
                          );
                        }
                        return <p key={idx}>{line}</p>;
                      })}
                    </div>

                    {/* Render Logo Card or In-Line Result Image & Direct Download Button */}
                    {msg.logoGraphicData ? (
                      <div className="mt-3 max-w-sm">
                        <LogoCard data={msg.logoGraphicData} />
                      </div>
                    ) : msg.resultImageUrl ? (
                      <div className="mt-3 rounded-xl overflow-hidden border border-cyan-500/40 bg-slate-900/60 p-2 shadow-lg max-w-sm space-y-2">
                        <div className="rounded-lg overflow-hidden relative group">
                          <img
                            src={msg.resultImageUrl}
                            alt="Tara Generated Image"
                            referrerPolicy="no-referrer"
                            className="w-full h-auto block rounded-lg transition-transform duration-300 group-hover:scale-[1.01]"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            audioSynth.playClick();
                            downloadImageToDevice(msg.resultImageUrl!, msg.resultImageDownloadName || 'tara-photo.jpg');
                          }}
                          className="w-full py-2.5 px-3 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-medium text-xs shadow-md shadow-cyan-950 flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer"
                        >
                          <Download className="w-4 h-4" />
                          <span>इमेज डाउनलोड करें (Download Image)</span>
                        </button>
                      </div>
                    ) : null}

                    {/* Render Action Badges if assistant executed tools */}
                    {msg.actionsExecuted && msg.actionsExecuted.length > 0 && (
                      <div className="mt-3 pt-2.5 border-t border-cyan-500/20 flex flex-col gap-1.5">
                        <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1">
                          <CheckCircle className="w-3 h-3 text-emerald-400" />
                          Subroutines Executed:
                        </span>
                        {msg.actionsExecuted.map((act, aIdx) => (
                          <div
                            key={aIdx}
                            className="p-1.5 rounded bg-slate-950/80 border border-cyan-500/30 flex items-center gap-2 text-[11px] font-mono text-cyan-200"
                          >
                            {act.type === 'task_created' && <CheckCircle className="w-3 h-3 text-emerald-400" />}
                            {act.type === 'note_created' && <FileText className="w-3 h-3 text-cyan-400" />}
                            {act.type === 'node_added' && <Network className="w-3 h-3 text-purple-400" />}
                            {act.type === 'workflow_triggered' && <Zap className="w-3 h-3 text-amber-400" />}
                            {act.type === 'system_mode_changed' && <Sliders className="w-3 h-3 text-cyan-400" />}
                            {act.type === 'answer_call' && <PhoneCall className="w-3 h-3 text-emerald-400" />}
                            {act.type === 'reject_call' && <PhoneOff className="w-3 h-3 text-rose-400" />}
                            {act.type === 'make_whatsapp_call' && <MessageSquareShare className="w-3 h-3 text-emerald-400" />}
                            {act.type === 'make_phone_call' && <PhoneCall className="w-3 h-3 text-blue-400" />}
                            {act.type === 'announce_caller' && <Volume2 className="w-3 h-3 text-amber-400" />}
                            <span>{act.summary || act.type}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Timestamp */}
                  <span className={`text-[10px] font-mono text-slate-500 ${isUser ? 'text-right' : 'text-left pl-1'}`}>
                    {msg.timestamp}
                  </span>

                  {/* Suggested Follow-up Prompts */}
                  {!isUser && msg.suggestedPrompts && msg.suggestedPrompts.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-1 pt-1">
                      {msg.suggestedPrompts.map((prompt, pIdx) => (
                        <button
                          key={pIdx}
                          onClick={() => {
                            audioSynth.playClick();
                            onSendMessage(prompt);
                          }}
                          className="px-2.5 py-1 rounded-full text-[11px] font-mono text-cyan-300 bg-slate-900/90 border border-cyan-500/25 hover:border-cyan-400 hover:bg-cyan-950/50 hover:shadow-[0_0_8px_rgba(0,240,255,0.2)] transition-all flex items-center gap-1"
                        >
                          <Sparkles className="w-2.5 h-2.5 text-cyan-400" />
                          <span>{prompt}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {isUser && (
                  <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 text-cyan-400 flex items-center justify-center shrink-0 mt-1">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Loading / Typing State */}
        {isLoading && (
          <div className="flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 flex items-center justify-center shrink-0">
              <Bot className="w-3.5 h-3.5 animate-spin" />
            </div>
            <div className="p-3 rounded-2xl bg-slate-900/90 border border-cyan-500/30 text-xs font-mono text-cyan-300 flex items-center gap-2">
              <span className="flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.4s]"></span>
              </span>
              <span>TARA IS SYNTHESIZING VOICE RESPONSE (GEMINI 2.5 FLASH)...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Slash Command Autocomplete Popover */}
      {showCommands && (
        <div className="p-2 border-t border-cyan-500/20 bg-slate-950/95 backdrop-blur-md">
          <div className="flex items-center justify-between pb-1.5 px-2 text-[11px] font-mono text-cyan-400 border-b border-slate-800">
            <span className="flex items-center gap-1">
              <Terminal className="w-3 h-3" /> Quick Command Registry
            </span>
            <button onClick={() => setShowCommands(false)} className="text-slate-500 hover:text-slate-300">
              ✕
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1.5 max-h-36 overflow-y-auto">
            {slashCommands.map((sc) => (
              <button
                key={sc.cmd}
                onClick={() => {
                  setInputText(`${sc.cmd} `);
                  setShowCommands(false);
                  textareaRef.current?.focus();
                }}
                className="p-1.5 rounded text-left hover:bg-slate-900 border border-transparent hover:border-cyan-500/30 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-cyan-300">{sc.cmd}</span>
                  <span className="text-[10px] text-slate-500">{sc.example}</span>
                </div>
                <p className="text-[11px] text-slate-400 font-sans truncate">{sc.desc}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Deck & Voice Controls */}
      <div className="p-3 border-t border-cyan-500/20 bg-slate-950/90">
        {/* Quick Hindi / English Prompt Starters for Empty Input */}
        {inputText === '' && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-1 scrollbar-none text-[11px] font-mono text-slate-400">
            <span className="shrink-0 text-[10px] text-cyan-400 uppercase font-bold">Quick:</span>
            {[
              'नमस्ते तारा, आप क्या कर सकती हैं?',
              'नया कार्य जोड़ो: सैटेलाइट टेस्ट',
              'Run morning brief',
              'सिस्टम स्थिति दिखाओ',
              'Remember user prefers Hindi audio',
              'Run deep security audit',
            ].map((q, qIdx) => (
              <button
                key={qIdx}
                onClick={() => {
                  setInputText(q);
                  textareaRef.current?.focus();
                }}
                className="shrink-0 px-2.5 py-0.5 rounded-full bg-slate-900 hover:bg-cyan-950 hover:text-cyan-300 border border-slate-800 hover:border-cyan-500/40 transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        )}

        <div className="relative flex items-end gap-2 bg-slate-900/90 border border-slate-800 focus-within:border-cyan-500/60 rounded-xl p-1.5 transition-all shadow-inner">
          <textarea
            ref={textareaRef}
            rows={1}
            value={inputText}
            onChange={(e) => {
              setInputText(e.target.value);
              if (e.target.value.startsWith('/')) {
                setShowCommands(true);
              } else {
                setShowCommands(false);
              }
            }}
            onKeyDown={handleKeyDown}
            placeholder={
              isListening
                ? `Listening (${voiceLang === 'hi-IN' ? 'हिंदी में बोलें' : 'Speak in English'})...`
                : "Ask Tara or type '/' for commands (हिंदी या English)..."
            }
            className="w-full pl-3 pr-2 py-1.5 text-xs sm:text-sm bg-transparent text-slate-100 placeholder:text-slate-500 focus:outline-none resize-none max-h-28 min-h-[38px] font-sans"
          />

          {/* Voice Mic Toggle */}
          <button
            onClick={handleToggleVoice}
            className={`p-2 rounded-lg transition-all shrink-0 flex items-center gap-1 ${
              isListening
                ? 'bg-rose-600 text-white animate-pulse shadow-[0_0_15px_rgba(244,63,94,0.6)]'
                : 'bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-cyan-300'
            }`}
            title={isListening ? 'Listening...' : `Voice Input (${voiceLang === 'hi-IN' ? 'Hindi' : 'English'})`}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          {/* Send Action */}
          <button
            onClick={handleSend}
            disabled={!inputText.trim() || isLoading}
            className={`p-2 rounded-lg font-bold transition-all shrink-0 ${
              inputText.trim() && !isLoading
                ? 'bg-cyan-500 text-slate-950 hover:bg-cyan-400 shadow-[0_0_12px_rgba(0,240,255,0.4)]'
                : 'bg-slate-800 text-slate-600 cursor-not-allowed'
            }`}
            title="Transmit Directive (Enter)"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 mt-1.5 px-1">
          <span>Type <kbd className="px-1 py-0.2 bg-slate-900 border border-slate-800 rounded text-cyan-400">/</kbd> for quick commands • Voice: {voiceLang === 'hi-IN' ? 'Hindi (hi-IN)' : 'English (en-US)'}</span>
          <span>Shift + Enter for new line</span>
        </div>
      </div>
    </div>
  );
};

