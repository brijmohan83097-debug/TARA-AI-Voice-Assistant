/**
 * TaraHologramView.tsx
 * Clean Cyberpunk Dark-Grid Holographic Chamber Interface for TARA:
 * 1. Background: Pristine cyberpunk dark-grid chamber with 3D perspective floor grid,
 *    concentric ceiling emitter fixture, subtle volumetric spotlight, and floating cyber dust.
 * 2. Center: 3D neon-cyan anatomical humanoid wireframe silhouette (HologramEntity3D)
 *    with rotating emitter base, scanning laser, and soundwave ripples.
 * 3. Left: Semi-transparent curved HUD glass screen (CurvedDiagnosticPanel)
 *    with vertical glowing bar charts, live oscilloscope waveform, and system diagnostics.
 * 4. Right: Semi-transparent curved HUD glass screen (CurvedVoiceLogsPanel)
 *    with rotating radar gauge, dynamic audio equalizer, and real-time chat dialogue logs.
 * 5. Top: HologramTopBar with TARA OS status, battery meter, and view switcher.
 * 6. Bottom: HologramBottomDock with holographic quick-action controls.
 */

import React, { useState } from 'react';
import { HologramTopBar } from './HologramTopBar';
import { CurvedDiagnosticPanel } from './CurvedDiagnosticPanel';
import { CurvedVoiceLogsPanel } from './CurvedVoiceLogsPanel';
import { TaraInteractiveAvatar } from './TaraInteractiveAvatar';
import { HologramBottomDock } from './HologramBottomDock';
import { ChatMessage, SystemLog, SystemMode, TaraEmotion } from '../types';

interface TaraHologramViewProps {
  chatMessages: ChatMessage[];
  logs: SystemLog[];
  onSendMessage: (text: string, media?: any) => void;
  isLoadingChat: boolean;
  isListening: boolean;
  isSpeaking: boolean;
  isHandsFreeMode: boolean;
  onToggleVoice: () => void;
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
}

export const TaraHologramView: React.FC<TaraHologramViewProps> = ({
  chatMessages,
  logs,
  onSendMessage,
  isLoadingChat,
  isListening,
  isSpeaking,
  isHandsFreeMode,
  onToggleVoice,
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
}) => {
  // View mode switcher for mobile/small screens: 'entity' | 'diagnostics' | 'dialogue'
  const [activeView, setActiveView] = useState<'entity' | 'diagnostics' | 'dialogue'>('entity');

  return (
    <div className="relative w-full h-screen max-h-screen flex flex-col bg-[#02050e] text-cyan-200 overflow-hidden select-none">
      {/* =====================================================================
          1. CLEAN CYBERPUNK DARK-GRID CHAMBER BACKGROUND
          Pure CSS & SVG environment with perspective grid floor,
          ceiling aperture fixture, and atmospheric cyan volumetric spotlight.
          ===================================================================== */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none">
        {/* Deep ambient radial glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(0,180,255,0.08)_0%,rgba(2,5,14,0.95)_75%,#010308_100%)]" />

        {/* Top Ceiling Fixture Aperture (Concentric high-tech rings) */}
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full border border-cyan-500/15 bg-gradient-to-b from-cyan-950/20 to-transparent flex items-center justify-center">
          <div className="w-[440px] h-[220px] rounded-full border border-cyan-400/20 border-dashed" />
          <div className="absolute w-[300px] h-[150px] rounded-full border border-cyan-300/25 shadow-[0_0_30px_rgba(0,240,255,0.2)]" />
        </div>

        {/* Volumetric Downward Spotlight Cone */}
        <div
          className={`absolute top-0 left-1/2 -translate-x-1/2 w-[720px] h-full pointer-events-none transition-opacity duration-700 ${
            isSpeaking ? 'opacity-85' : isListening ? 'opacity-70' : 'opacity-40'
          }`}
          style={{
            background:
              'polygon(35% 0%, 65% 0%, 90% 100%, 10% 100%)',
            backgroundClip: 'padding-box',
          }}
        >
          <div className="w-full h-full bg-gradient-to-b from-cyan-400/15 via-cyan-500/5 to-transparent blur-2xl" />
        </div>

        {/* 3D Perspective Cyberpunk Grid Floor */}
        <div
          className="absolute bottom-0 inset-x-0 h-[48%] pointer-events-none opacity-45"
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
                linear-gradient(to right, rgba(0, 240, 255, 0.22) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(0, 240, 255, 0.22) 1px, transparent 1px)
              `,
              backgroundSize: '40px 40px',
              maskImage: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.85) 45%, rgba(0,0,0,0.1) 100%)',
              WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.85) 45%, rgba(0,0,0,0.1) 100%)',
            }}
          />
        </div>

        {/* Vertical Architectural Pillar Guidelines (Left & Right chamber borders) */}
        <div className="hidden lg:block absolute inset-y-0 left-6 w-px bg-gradient-to-b from-transparent via-cyan-500/25 to-transparent" />
        <div className="hidden lg:block absolute inset-y-0 right-6 w-px bg-gradient-to-b from-transparent via-cyan-500/25 to-transparent" />
        <div className="hidden xl:block absolute inset-y-0 left-12 w-px bg-gradient-to-b from-transparent via-cyan-500/10 to-transparent" />
        <div className="hidden xl:block absolute inset-y-0 right-12 w-px bg-gradient-to-b from-transparent via-cyan-500/10 to-transparent" />

        {/* Ambient Horizontal Chamber Ribs (Subtle sci-fi wall accents) */}
        <div className="absolute inset-0 flex flex-col justify-between py-24 opacity-15 pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="w-full h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />
          ))}
        </div>

        {/* Dynamic Voice Halo Resonance when speaking or listening */}
        {(isSpeaking || isListening) && (
          <div
            className={`absolute top-[48%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[380px] sm:w-[500px] h-[380px] sm:h-[500px] rounded-full blur-[90px] pointer-events-none transition-all duration-500 ${
              isListening ? 'bg-rose-500/15 animate-pulse' : 'bg-cyan-400/20 animate-pulse'
            }`}
          />
        )}
      </div>

      {/* =====================================================================
          2. TOP GLASS DIAGNOSTIC & STATUS LAYOUT
          "TARA OS • SYSTEM ACTIVE", battery meter, [DIAGNOSTICS] [3D HOLOGRAM] [DIALOGUE (LOG)]
          ===================================================================== */}
      <HologramTopBar
        currentEmotion={currentEmotion}
        isSpeaking={isSpeaking}
        isListening={isListening}
        isStrangerDetected={isStrangerDetected}
        onVerifyBossAccess={onVerifyBossAccess}
        onReplayLastAudio={onReplayVoice}
        voiceLang={voiceLang}
        onToggleVoiceLang={onToggleVoiceLang}
        activeView={activeView}
        onSelectView={setActiveView}
      />

      {/* =====================================================================
          3. MAIN HOLOGRAPHIC STAGE (3-PANEL CYBERPUNK HUD)
          Left: Diagnostics & Wave Charts
          Center: 3D Neon-Cyan Human Wireframe Silhouette & Emitter Base
          Right: Chat Dialogue & Terminal Logs
          ===================================================================== */}
      <main className="flex-1 w-full min-h-0 h-full max-h-full p-2 sm:p-3 flex items-center justify-center z-10 overflow-hidden relative">
        <div className="w-full max-w-[1560px] h-full flex items-center justify-between gap-3 sm:gap-4 relative">
          
          {/* =================================================================
              LEFT AREA: SEMI-TRANSPARENT CURVED HUD GLASS SCREEN
              Vertical bar charts, oscilloscope sine waveform, CPU/RAM telemetry
              ================================================================= */}
          <section
            className={`w-full lg:w-[320px] xl:w-[360px] h-[92%] max-h-full min-h-0 shrink-0 overflow-hidden transition-all duration-300 ${
              activeView === 'diagnostics' ? 'flex flex-col' : 'hidden lg:flex lg:flex-col'
            }`}
          >
            <CurvedDiagnosticPanel
              isSpeaking={isSpeaking}
              isListening={isListening}
              systemMode={systemMode}
              onSelectMode={onSelectSystemMode}
              className="w-full h-full min-h-0 max-h-full"
            />
          </section>

          {/* =================================================================
              CENTER AREA: TARA INTERACTIVE AVATAR (image_28.png)
              Live talking video container with real-time lip-sync, blinking,
              breathing postures, biometric reticles, and holographic glow
              ================================================================= */}
          <section
            className={`flex-1 h-full max-h-full min-h-0 relative flex flex-col items-center justify-center transition-all duration-300 ${
              activeView === 'entity' ? 'flex' : 'hidden lg:flex'
            }`}
          >
            <TaraInteractiveAvatar
              isSpeaking={isSpeaking}
              isListening={isListening}
              isHandsFreeMode={isHandsFreeMode}
              currentEmotion={currentEmotion}
              onTapEntity={onToggleVoice}
              className="w-full h-full"
            />
          </section>

          {/* =================================================================
              RIGHT AREA: SEMI-TRANSPARENT CURVED HUD GLASS SCREEN
              Rotating radar dial gauge, dynamic equalizer, dialogue history & prompt chips
              ================================================================= */}
          <section
            className={`w-full lg:w-[320px] xl:w-[360px] h-[92%] max-h-full min-h-0 shrink-0 overflow-hidden transition-all duration-300 ${
              activeView === 'dialogue' ? 'flex flex-col' : 'hidden lg:flex lg:flex-col'
            }`}
          >
            <CurvedVoiceLogsPanel
              chatMessages={chatMessages}
              logs={logs}
              onSendMessage={onSendMessage}
              isLoadingChat={isLoadingChat}
              isListening={isListening}
              onToggleVoice={onToggleVoice}
              liveSpeechTranscript={liveSpeechTranscript}
              className="w-full h-full min-h-0 max-h-full"
            />
          </section>
        </div>
      </main>

      {/* =====================================================================
          4. BOTTOM HOLOGRAPHIC ACTION CONTROLS DOCK
          [CALL: ACTIVE], [CAMERA SCAN], [HUD LOGS], News, Music, Rates, etc.
          ===================================================================== */}
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
      />
    </div>
  );
};
