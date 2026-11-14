/**
 * TaraHologramView.tsx
 * TARA OS — Futuristic Sci-Fi Operating System & Personal AI Companion Dashboard:
 * 1. TopBar: Brand & live state (Listening / Thinking / Speaking), section switcher, speaker/call controls
 * 2. Left Panel: Diagnostic Matrix + System Architecture Map + Agent & Room Tracking Nodes
 * 3. Center Chamber: Glowing AI Core Orb ("TARA") with floating modular Visual Hub, Core Telemetry & Agent Nodes
 * 4. Right Panel: Split-Screen Chat & Voice HUD with live radar, audio equalizer, dialogue feed & kernel logs
 * 5. Bottom Dock: Hands-free voice toggle, HUD Logs, Visual Hub, and quick workspace tools
 */

import React, { useState } from 'react';
import { HologramTopBar } from './HologramTopBar';
import { CurvedDiagnosticPanel } from './CurvedDiagnosticPanel';
import { CurvedVoiceLogsPanel } from './CurvedVoiceLogsPanel';
import { HologramEntity3D } from './HologramEntity3D';
import { TaraInteractiveAvatar } from './TaraInteractiveAvatar';
import { FloatingCyberneticModules } from './FloatingCyberneticModules';
import { HologramBottomDock } from './HologramBottomDock';
import { ChatMessage, MindMapNode, SystemLog, SystemMode, TaraEmotion } from '../types';

interface TaraHologramViewProps {
  chatMessages: ChatMessage[];
  logs: SystemLog[];
  onSendMessage: (text: string, media?: any) => void;
  isLoadingChat: boolean;
  isThinking?: boolean;
  isListening: boolean;
  isSpeaking: boolean;
  isHandsFreeMode: boolean;
  onToggleVoice: () => void;
  onMicPress?: () => void;
  voiceError?: string | null;
  onDismissVoiceError?: () => void;
  currentEmotion: TaraEmotion;
  systemMode: SystemMode;
  onSelectSystemMode: (mode: SystemMode) => void;
  liveSpeechTranscript: string;
  isStrangerDetected: boolean;
  onVerifyBossAccess: () => void;
  voiceLang: string;
  onToggleVoiceLang: () => void;
  onTriggerIndiaNews: () => void;
  onOpenMusicPlayer: () => void;
  onOpenRatesTable: () => void;
  onOpenCalculator: () => void;
  onOpenMemoryVault: () => void;
  onToggleTerminalLogs: () => void;
  onReplayVoice: () => void;
  onOpenVisualHub?: () => void;
  onUploadPhoto?: () => void;
  nodes?: MindMapNode[];
  onSelectNode?: (node: MindMapNode) => void;
  memoriesCount?: number;
}

export const TaraHologramView: React.FC<TaraHologramViewProps> = ({
  chatMessages,
  logs,
  onSendMessage,
  isLoadingChat,
  isThinking,
  isListening,
  isSpeaking,
  isHandsFreeMode,
  onToggleVoice,
  onMicPress,
  voiceError = null,
  onDismissVoiceError,
  currentEmotion,
  systemMode,
  onSelectSystemMode,
  liveSpeechTranscript,
  isStrangerDetected,
  onVerifyBossAccess,
  voiceLang,
  onToggleVoiceLang,
  onTriggerIndiaNews,
  onOpenMusicPlayer,
  onOpenRatesTable,
  onOpenCalculator,
  onOpenMemoryVault,
  onToggleTerminalLogs,
  onReplayVoice,
  onOpenVisualHub,
  onUploadPhoto,
  nodes = [],
  onSelectNode,
  memoriesCount = 0,
}) => {
  const [activeView, setActiveView] = useState<'entity' | 'diagnostics' | 'dialogue'>('entity');
  const [entityVisualMode, setEntityVisualMode] = useState<'orb' | 'wireframe' | 'avatar'>('orb');

  const effectiveThinking = isThinking ?? isLoadingChat;

  return (
    <div className="relative w-full h-screen h-[100dvh] max-h-screen max-h-[100dvh] flex flex-col bg-[#02050e] text-cyan-100 overflow-hidden select-none">
      {/* Cyberpunk Dark-Grid Chamber Background */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_38%,rgba(0,180,255,0.09)_0%,rgba(2,5,14,0.95)_75%,#010308_100%)]" />

        {/* Ceiling Emitter Rings */}
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full border border-cyan-500/15 bg-gradient-to-b from-cyan-950/20 to-transparent flex items-center justify-center">
          <div className="w-[440px] h-[220px] rounded-full border border-cyan-400/20 border-dashed" />
          <div className="absolute w-[300px] h-[150px] rounded-full border border-cyan-300/20" />
        </div>

        {/* 3D Perspective Cyberpunk Grid Floor */}
        <div
          className="absolute bottom-0 inset-x-0 h-[44%] pointer-events-none opacity-40"
          style={{
            perspective: '550px',
            perspectiveOrigin: '50% 0%',
          }}
        >
          <div
            className="w-full h-full"
            style={{
              transform: 'rotateX(68deg)',
              transformOrigin: '50% 0%',
              backgroundImage: `
                linear-gradient(to right, rgba(0, 240, 255, 0.2) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(0, 240, 255, 0.2) 1px, transparent 1px)
              `,
              backgroundSize: '40px 40px',
              maskImage: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.85) 45%, rgba(0,0,0,0.1) 100%)',
              WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.85) 45%, rgba(0,0,0,0.1) 100%)',
            }}
          />
        </div>

        {(isSpeaking || isListening || effectiveThinking) && (
          <div
            className={`absolute top-[48%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[380px] sm:w-[480px] h-[380px] sm:h-[480px] rounded-full blur-[90px] pointer-events-none transition-all duration-500 ${
              isListening
                ? 'bg-emerald-400/15'
                : effectiveThinking
                ? 'bg-sky-400/15'
                : 'bg-cyan-400/18'
            }`}
          />
        )}
      </div>

      {/* Top Glass Header */}
      <HologramTopBar
        currentEmotion={currentEmotion}
        isSpeaking={isSpeaking}
        isListening={isListening}
        isThinking={effectiveThinking}
        isHandsFreeMode={isHandsFreeMode}
        onToggleVoice={onToggleVoice}
        isStrangerDetected={isStrangerDetected}
        onVerifyBossAccess={onVerifyBossAccess}
        onReplayLastAudio={onReplayVoice}
        voiceLang={voiceLang}
        onToggleVoiceLang={onToggleVoiceLang}
        activeView={activeView}
        onSelectView={setActiveView}
      />

      {/* Main 3-Panel Holographic Dashboard Stage */}
      <main className="flex-1 w-full min-h-0 h-full max-h-full p-2 sm:p-3 flex items-center justify-center z-10 overflow-hidden relative">
        <div className="w-full max-w-[1600px] h-full flex items-stretch justify-between gap-3 sm:gap-4 relative">
          {/* Left Panel: Diagnostic Matrix + System Architecture Map + Agent/Room Nodes */}
          <section
            className={`w-full lg:w-[320px] xl:w-[350px] h-full min-h-0 shrink-0 overflow-hidden transition-all duration-300 ${
              activeView === 'diagnostics' ? 'flex flex-col' : 'hidden lg:flex lg:flex-col'
            }`}
          >
            <CurvedDiagnosticPanel
              isSpeaking={isSpeaking}
              isListening={isListening}
              isThinking={effectiveThinking}
              systemMode={systemMode}
              onSelectMode={onSelectSystemMode}
              nodes={nodes}
              onSelectNode={onSelectNode}
              memoriesCount={memoriesCount}
              className="w-full h-full min-h-0 max-h-full"
            />
          </section>

          {/* Center Stage: Glowing TARA AI Core Orb & Floating Cybernetic Modules */}
          <section
            className={`flex-1 min-w-0 h-full max-h-full min-h-0 relative flex flex-col items-center justify-center transition-all duration-300 ${
              activeView === 'entity' ? 'flex' : 'hidden lg:flex'
            }`}
          >
            {/* Visual Mode Selector */}
            <div className="absolute top-2 z-30 flex items-center gap-1 p-1 rounded-full bg-[#030d1d]/90 border border-cyan-500/35 backdrop-blur-md">
              <button
                type="button"
                onClick={() => setEntityVisualMode('orb')}
                className={`px-3 py-1 rounded-full text-[11px] font-mono font-semibold cursor-pointer transition-colors whitespace-nowrap shrink-0 ${
                  entityVisualMode === 'orb'
                    ? 'bg-cyan-500/35 text-white border border-cyan-300/60'
                    : 'text-slate-400 hover:text-cyan-200'
                }`}
              >
                AI Core
              </button>
              <button
                type="button"
                onClick={() => setEntityVisualMode('wireframe')}
                className={`px-2.5 py-1 rounded-full text-[11px] font-mono font-semibold cursor-pointer transition-colors whitespace-nowrap shrink-0 ${
                  entityVisualMode === 'wireframe'
                    ? 'bg-cyan-500/35 text-white border border-cyan-300/60'
                    : 'text-slate-400 hover:text-cyan-200'
                }`}
              >
                3D वायरफ़्रेम
              </button>
              <button
                type="button"
                onClick={() => setEntityVisualMode('avatar')}
                className={`px-2.5 py-1 rounded-full text-[11px] font-mono font-semibold cursor-pointer transition-colors whitespace-nowrap shrink-0 ${
                  entityVisualMode === 'avatar'
                    ? 'bg-cyan-500/35 text-white border border-cyan-300/60'
                    : 'text-slate-400 hover:text-cyan-200'
                }`}
              >
                अवतार फ़ोटो
              </button>
            </div>

            {entityVisualMode === 'orb' ? (
              <FloatingCyberneticModules
                isSpeaking={isSpeaking}
                isListening={isListening}
                isThinking={effectiveThinking}
                isHandsFreeMode={isHandsFreeMode}
                currentEmotion={currentEmotion}
                systemMode={systemMode}
                onSelectSystemMode={onSelectSystemMode}
                onToggleVoice={onMicPress || onToggleVoice}
                onTriggerIndiaNews={onTriggerIndiaNews}
                onOpenMusicPlayer={onOpenMusicPlayer}
                onOpenRatesTable={onOpenRatesTable}
                onOpenCalculator={onOpenCalculator}
                onOpenMemoryVault={onOpenMemoryVault}
                onOpenVisualHub={onOpenVisualHub}
                onUploadPhoto={onUploadPhoto}
                nodes={nodes}
                onSelectNode={onSelectNode}
                className="w-full h-full"
              />
            ) : entityVisualMode === 'wireframe' ? (
              <HologramEntity3D
                isSpeaking={isSpeaking}
                isListening={isListening}
                isHandsFreeMode={isHandsFreeMode}
                currentEmotion={currentEmotion}
                onTapEntity={onMicPress || onToggleVoice}
                className="w-full h-full"
              />
            ) : (
              <TaraInteractiveAvatar
                isSpeaking={isSpeaking}
                isListening={isListening}
                isHandsFreeMode={isHandsFreeMode}
                currentEmotion={currentEmotion}
                onTapEntity={onMicPress || onToggleVoice}
                className="w-full h-full"
              />
            )}
          </section>

          {/* Right Panel: Split-Screen Chat & Voice HUD */}
          <section
            className={`w-full lg:w-[330px] xl:w-[380px] h-full min-h-0 shrink-0 overflow-hidden transition-all duration-300 ${
              activeView === 'dialogue' ? 'flex flex-col' : 'hidden lg:flex lg:flex-col'
            }`}
          >
            <CurvedVoiceLogsPanel
              chatMessages={chatMessages}
              logs={logs}
              onSendMessage={onSendMessage}
              isLoadingChat={isLoadingChat}
              isListening={isListening}
              isSpeaking={isSpeaking}
              isHandsFreeMode={isHandsFreeMode}
              onToggleVoice={onToggleVoice}
              onMicPress={onMicPress}
              liveSpeechTranscript={liveSpeechTranscript}
              voiceError={voiceError}
              onDismissVoiceError={onDismissVoiceError}
              className="w-full h-full min-h-0 max-h-full"
            />
          </section>
        </div>
      </main>

      {/* Bottom Dock */}
      <HologramBottomDock
        isListening={isListening}
        isSpeaking={isSpeaking}
        isHandsFreeMode={isHandsFreeMode}
        onToggleVoice={onToggleVoice}
        onTriggerIndiaNews={onTriggerIndiaNews}
        onOpenMusicPlayer={onOpenMusicPlayer}
        onOpenRatesTable={onOpenRatesTable}
        onOpenCalculator={onOpenCalculator}
        onOpenMemoryVault={onOpenMemoryVault}
        onToggleTerminalLogs={onToggleTerminalLogs}
        onReplayVoice={onReplayVoice}
        onOpenVisualHub={onOpenVisualHub}
        onUploadPhoto={onUploadPhoto}
      />
    </div>
  );
};
