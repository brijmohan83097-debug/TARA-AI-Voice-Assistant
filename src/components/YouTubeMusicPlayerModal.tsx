/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Music,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
  Volume1,
  X,
  Minimize2,
  Maximize2,
  Search,
  Radio,
  Sparkles,
  ExternalLink,
  Disc3,
  Square,
  Plus,
  Minus
} from 'lucide-react';
import { audioSynth } from '../utils/audio';

export interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  videoId: string;
  category: string;
}

export const POPULAR_HINDI_TRACKS: MusicTrack[] = [
  {
    id: 'track-1',
    title: 'Kesariya (केसरिया)',
    artist: 'Arijit Singh • Brahmāstra',
    videoId: 'BddP6PYo2gs',
    category: 'Bollywood Romantic',
  },
  {
    id: 'track-2',
    title: 'Apna Bana Le (अपना बना ले)',
    artist: 'Arijit Singh • Bhediya',
    videoId: 'ElZfdU54Cp8',
    category: 'Romantic Melody',
  },
  {
    id: 'track-3',
    title: 'Tum Hi Ho (तुम ही हो)',
    artist: 'Arijit Singh • Aashiqui 2',
    videoId: 'IJq0yyWug1k',
    category: 'All Time Classic',
  },
  {
    id: 'track-4',
    title: 'Raataan Lambiyan (रातां लम्बियां)',
    artist: 'Jubin Nautiyal, Asees Kaur • Shershaah',
    videoId: 'gvyUuxdRdR4',
    category: 'Love Ballad',
  },
  {
    id: 'track-5',
    title: 'Bollywood Lo-Fi Chill Beats',
    artist: 'Midnight Chill Lounge',
    videoId: '1fuN4-h_Wms',
    category: 'Relax & Work',
  },
  {
    id: 'track-6',
    title: 'Chaleya (चलेया)',
    artist: 'Arijit Singh, Shilpa Rao • Jawan',
    videoId: 'VAdGW7QDJUI',
    category: 'Upbeat Romantic',
  },
  {
    id: 'track-7',
    title: 'Heeriye (हीरीये)',
    artist: 'Jasleen Royal, Arijit Singh',
    videoId: 'RLzC55ai0eo',
    category: 'Acoustic Hit',
  },
  {
    id: 'track-8',
    title: 'Kahani Suno 2.0 (कहानी सुनो)',
    artist: 'Kaifi Khalil',
    videoId: '_XbvHl3oK4o',
    category: 'Soulful Melody',
  },
];

export interface YouTubeMusicPlayerProps {
  isOpen: boolean;
  isPlaying: boolean;
  currentTrack: MusicTrack;
  volume?: number;
  isMuted?: boolean;
  onVolumeChange?: (newVolume: number) => void;
  onToggleMute?: () => void;
  onClose: () => void;
  onTogglePlay: (playing?: boolean) => void;
  onNextTrack: () => void;
  onPrevTrack: () => void;
  onSelectTrack: (track: MusicTrack) => void;
  isMinimized?: boolean;
  onToggleMinimize?: () => void;
}

export const YouTubeMusicPlayerModal: React.FC<YouTubeMusicPlayerProps> = ({
  isOpen,
  isPlaying,
  currentTrack,
  volume = 75,
  isMuted = false,
  onVolumeChange,
  onToggleMute,
  onClose,
  onTogglePlay,
  onNextTrack,
  onPrevTrack,
  onSelectTrack,
  isMinimized = false,
  onToggleMinimize,
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Send play/pause commands to YouTube iframe via postMessage
  useEffect(() => {
    if (!isOpen) return;
    const iframe = iframeRef.current;
    if (!iframe || !iframe.contentWindow) return;

    try {
      iframe.contentWindow.postMessage(
        JSON.stringify({
          event: 'command',
          func: isPlaying ? 'playVideo' : 'pauseVideo',
          args: '',
        }),
        '*'
      );
    } catch {}
  }, [isPlaying, isOpen]);

  // Handle volume change via postMessage
  useEffect(() => {
    if (!isOpen) return;
    const iframe = iframeRef.current;
    if (!iframe || !iframe.contentWindow) return;

    try {
      iframe.contentWindow.postMessage(
        JSON.stringify({
          event: 'command',
          func: 'setVolume',
          args: [volume],
        }),
        '*'
      );
    } catch {}
  }, [volume, isOpen]);

  // Handle mute command via postMessage
  useEffect(() => {
    if (!isOpen) return;
    const iframe = iframeRef.current;
    if (!iframe || !iframe.contentWindow) return;

    try {
      iframe.contentWindow.postMessage(
        JSON.stringify({
          event: 'command',
          func: isMuted ? 'mute' : 'unMute',
          args: '',
        }),
        '*'
      );
    } catch {}
  }, [isMuted, isOpen]);

  if (!isOpen) return null;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim().toLowerCase();
    if (!query) return;

    // Check if query matches any known track
    const found = POPULAR_HINDI_TRACKS.find(
      (t) =>
        t.title.toLowerCase().includes(query) ||
        t.artist.toLowerCase().includes(query) ||
        t.category.toLowerCase().includes(query)
    );

    if (found) {
      onSelectTrack(found);
      setSearchQuery('');
    } else {
      // Check if user entered a raw YouTube ID
      if (/^[a-zA-Z0-9_-]{11}$/.test(query)) {
        onSelectTrack({
          id: `custom-${Date.now()}`,
          title: `Custom Video (${query})`,
          artist: 'YouTube Audio',
          videoId: query,
          category: 'Custom Search',
        });
        setSearchQuery('');
      } else {
        // Fallback to top match or first track
        onSelectTrack({
          ...currentTrack,
          title: searchQuery.trim(),
        });
        setSearchQuery('');
      }
    }
  };

  // If minimized, display a sleek sci-fi floating mini-player dock!
  if (isMinimized) {
    return (
      <aside aria-label="Floating Music Widget" className="fixed bottom-4 right-4 z-50 flex items-center gap-3 p-2.5 rounded-2xl bg-[#030914]/95 border border-cyan-400/60 shadow-[0_0_30px_rgba(0,240,255,0.4)] backdrop-blur-md animate-in slide-in-from-bottom-3 duration-200">
        <div className="relative">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-emerald-500 flex items-center justify-center text-white shadow-md">
            <Disc3 className={`w-6 h-6 ${isPlaying ? 'animate-spin' : ''}`} />
          </div>
          {isPlaying && (
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 absolute -top-0.5 -right-0.5 animate-ping" />
          )}
        </div>

        <div className="flex flex-col min-w-32 max-w-48">
          <span className="font-heading font-black text-xs text-white truncate">
            {currentTrack.title}
          </span>
          <span className="text-[10px] font-mono text-cyan-300 truncate">
            {currentTrack.artist}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onTogglePlay()}
            className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-400/50 text-cyan-300 flex items-center justify-center hover:bg-cyan-900 active:scale-95 transition-all"
            title={isPlaying ? 'Pause (रोकें)' : 'Play (बजाएं)'}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
          </button>

          <button
            type="button"
            onClick={onNextTrack}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white transition-colors"
            title="Next Track (अगला गाना)"
          >
            <SkipForward className="w-4 h-4" />
          </button>

          {onToggleMinimize && (
            <button
              type="button"
              onClick={onToggleMinimize}
              className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-300 transition-colors"
              title="Expand Player (बड़ा करें)"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 transition-colors"
            title="Close (बंद करें)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Hidden active iframe so audio persists while minimized */}
        <div className="hidden">
          <iframe
            ref={iframeRef}
            src={`https://www.youtube-nocookie.com/embed/${currentTrack.videoId}?autoplay=1&enablejsapi=1&origin=${typeof window !== 'undefined' ? window.location.origin : ''}`}
            title={currentTrack.title}
            allow="autoplay; encrypted-media"
          />
        </div>
      </aside>
    );
  }

  // Full-size Futuristic Sci-Fi Popup Modal
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl bg-[#040a18] border-2 border-cyan-400/60 rounded-2xl shadow-[0_0_60px_rgba(0,240,255,0.3)] overflow-hidden flex flex-col max-h-[92vh]"
        style={{
          backgroundImage:
            'radial-gradient(ellipse at 50% 0%, rgba(0, 240, 255, 0.15) 0%, transparent 70%)',
        }}
      >
        {/* Sci-Fi Top Header */}
        <div className="px-4 py-3 bg-[#020610]/90 border-b border-cyan-500/30 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-600 via-sky-500 to-emerald-400 flex items-center justify-center text-white shadow-[0_0_15px_rgba(0,240,255,0.5)]">
              <Music className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-heading font-black text-xs sm:text-sm text-cyan-200 tracking-wider">
                  TARA YOUTUBE MUSIC HUB
                </span>
                <span className="px-1.5 py-0.2 rounded bg-cyan-950 border border-cyan-400/40 text-[9px] font-mono text-cyan-300 font-bold uppercase">
                  {isPlaying ? 'PLAYING 🎵' : 'PAUSED ⏸️'}
                </span>
              </div>
              <p className="text-[9px] font-mono text-slate-400">
                Voice Controlled YouTube Audio & Video Engine
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {onToggleMinimize && (
              <button
                type="button"
                onClick={onToggleMinimize}
                className="p-1.5 rounded-lg bg-slate-900 border border-slate-700/80 text-slate-400 hover:text-cyan-300 transition-colors"
                title="फ्लोटिंग मोड में छोटा करें (Minimize)"
              >
                <Minimize2 className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-700/80 text-slate-400 hover:text-rose-400 transition-colors"
              title="बंद करें (Close)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Voice Control Prompt Banner */}
        <div className="px-4 py-1.5 bg-cyan-950/40 border-b border-cyan-500/20 flex flex-wrap items-center justify-between gap-1 text-[11px] font-mono text-cyan-300">
          <span className="flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>आवाज़ से आदेश दें: "आवाज़ कम करो", "आवाज़ बढ़ाओ", "म्यूट करो", "गाना बंद करो", "अगला गाना"</span>
          </span>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-400/40 text-[10px] text-cyan-300 font-bold">
              {isMuted ? '🔇 MUTED' : `🔊 VOL: ${volume}%`}
            </span>
            <span className="text-slate-400 text-[10px] hidden sm:inline">100% Hands-Free</span>
          </div>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-slate-200 flex-1">
          {/* Main YouTube Video / Player Frame */}
          <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black border border-cyan-500/40 shadow-[0_0_25px_rgba(0,240,255,0.2)]">
            <iframe
              ref={iframeRef}
              src={`https://www.youtube-nocookie.com/embed/${currentTrack.videoId}?autoplay=1&enablejsapi=1&origin=${typeof window !== 'undefined' ? window.location.origin : ''}`}
              title={currentTrack.title}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>

          {/* Track Meta & Equalizer Visualizer */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-gradient-to-r from-[#061125] to-[#040a18] border border-cyan-400/30">
            <div className="min-w-0">
              <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider font-bold">
                {currentTrack.category}
              </span>
              <h3 className="text-base sm:text-lg font-heading font-black text-white truncate">
                {currentTrack.title}
              </h3>
              <p className="text-xs font-mono text-slate-300 truncate">
                {currentTrack.artist}
              </p>
            </div>

            {/* Dancing Sci-Fi Audio Wave Bars */}
            <div className="flex items-end gap-1 h-8 shrink-0">
              {[12, 24, 32, 18, 28, 14, 30, 22].map((h, i) => (
                <div
                  key={i}
                  className={`w-1 rounded-full transition-all duration-150 ${
                    isPlaying
                      ? 'bg-gradient-to-t from-cyan-600 via-sky-400 to-emerald-300 animate-audio-bar'
                      : 'bg-cyan-500/20'
                  }`}
                  style={{
                    height: isPlaying ? `${h}px` : '4px',
                    animationDelay: `${i * 0.08}s`,
                    animationDuration: `${0.4 + (i % 3) * 0.15}s`,
                  }}
                />
              ))}
            </div>
          </div>

          {/* Main Controls: Play/Pause, Next, Prev, Stop, Volume Slider & Buttons */}
          <div className="flex flex-col gap-2.5 p-3 bg-[#020713] rounded-xl border border-cyan-500/25">
            {/* Playback Row */}
            <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap">
              <button
                type="button"
                onClick={() => {
                  audioSynth.playSciFiClick();
                  onPrevTrack();
                }}
                className="p-2.5 rounded-xl bg-cyan-950/70 border border-cyan-500/40 text-cyan-300 hover:text-white hover:bg-cyan-900 active:scale-95 transition-all cursor-pointer"
                title="Previous Song (पिछला गाना)"
              >
                <SkipBack className="w-5 h-5" />
              </button>

              <button
                type="button"
                onClick={() => {
                  audioSynth.playSciFiClick();
                  onTogglePlay();
                }}
                className="px-5 sm:px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 via-sky-500 to-emerald-500 hover:from-cyan-500 hover:to-emerald-400 text-white font-mono text-sm font-black flex items-center gap-2 shadow-[0_0_25px_rgba(0,240,255,0.5)] active:scale-95 transition-all cursor-pointer"
                title={isPlaying ? 'Pause Song (गाना रोकें)' : 'Play Song (गाना चलाएं)'}
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-5 h-5 fill-white" />
                    <span>PAUSE (रोकें)</span>
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 fill-white ml-0.5" />
                    <span>PLAY (बजाएं)</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  audioSynth.playSciFiClick();
                  onNextTrack();
                }}
                className="p-2.5 rounded-xl bg-cyan-950/70 border border-cyan-500/40 text-cyan-300 hover:text-white hover:bg-cyan-900 active:scale-95 transition-all cursor-pointer"
                title="Next Song (अगला गाना)"
              >
                <SkipForward className="w-5 h-5" />
              </button>

              {/* STOP & CLOSE BUTTON */}
              <button
                type="button"
                onClick={() => {
                  audioSynth.playPowerDown();
                  onClose();
                }}
                className="p-2.5 rounded-xl bg-rose-950/70 border border-rose-500/50 text-rose-300 hover:text-white hover:bg-rose-900 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
                title="Stop & Close Player (गाना बंद करें)"
              >
                <Square className="w-4 h-4 fill-rose-300" />
                <span className="text-xs font-mono font-bold hidden sm:inline">STOP (बंद करें)</span>
              </button>
            </div>

            {/* Volume Control Row: "Aawaz kam karo", "Aawaz badhao", "Mute karo" */}
            <div className="flex items-center justify-between gap-3 pt-2 border-t border-cyan-500/15">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    audioSynth.playMute();
                    onToggleMute?.();
                  }}
                  className="p-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:text-white hover:border-cyan-400 transition-colors"
                  title={isMuted ? 'Unmute (आवाज़ खोलें)' : 'Mute (म्यूट करें)'}
                >
                  {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-cyan-300" />}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    audioSynth.playVolumeDown();
                    onVolumeChange?.(Math.max(0, volume - 15));
                  }}
                  className="p-1.5 rounded-lg bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-900 transition-colors"
                  title="आवाज़ कम करें (-15%)"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Volume Slider & Percentage */}
              <div className="flex-1 flex items-center gap-2 max-w-xs">
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    if (val > volume) {
                      audioSynth.playVolumeUp();
                    } else {
                      audioSynth.playVolumeDown();
                    }
                    onVolumeChange?.(val);
                  }}
                  className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                  title="वॉल्यूम स्लाइडर"
                />
                <span className="text-[11px] font-mono text-cyan-300 min-w-10 text-right font-bold">
                  {isMuted ? 'MUTE' : `${volume}%`}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    audioSynth.playVolumeUp();
                    onVolumeChange?.(Math.min(100, volume + 15));
                  }}
                  className="p-1.5 rounded-lg bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-900 transition-colors"
                  title="आवाज़ बढ़ाएं (+15%)"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Quick Song Search Bar */}
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-cyan-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="मनपसंद गाना या गायक खोजें (उदा. Arijit Singh, Tum Hi Ho, Lo-Fi)..."
                className="w-full bg-[#030914] border border-cyan-500/30 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-sans"
              />
            </div>
            <button
              type="submit"
              className="px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-bold transition-all shadow-sm cursor-pointer"
            >
              खोजें
            </button>
          </form>

          {/* Popular Playlist Hits */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold text-cyan-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                लोकप्रिय गाने (Popular Hindi Hits)
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                क्लिक करके तुरंत बजाएं
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
              {POPULAR_HINDI_TRACKS.map((track) => (
                <div
                  key={track.id}
                  onClick={() => {
                    audioSynth.playClick();
                    onSelectTrack(track);
                  }}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2 group ${
                    currentTrack.id === track.id
                      ? 'bg-cyan-950/80 border-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.25)]'
                      : 'bg-[#030914] border-cyan-500/20 hover:border-cyan-500/50 hover:bg-[#071328]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-300 shrink-0">
                      {currentTrack.id === track.id && isPlaying ? (
                        <Disc3 className="w-4 h-4 animate-spin text-emerald-400" />
                      ) : (
                        <Music className="w-3.5 h-3.5" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-heading font-bold text-white truncate group-hover:text-cyan-200">
                        {track.title}
                      </p>
                      <p className="text-[10px] font-mono text-slate-400 truncate">
                        {track.artist}
                      </p>
                    </div>
                  </div>

                  <span className="text-[10px] font-mono font-bold text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-500/30 shrink-0">
                    {currentTrack.id === track.id && isPlaying ? 'बज रहा है' : 'बजाएं'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
