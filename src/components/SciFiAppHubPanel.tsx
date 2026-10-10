/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  ExternalLink,
  Youtube,
  MessageCircle,
  Search,
  Calculator,
  FolderOpen,
  Compass,
  Sparkles,
  Radio,
  CheckCircle2,
  ArrowUpRight,
  Maximize2,
  Camera,
  Upload,
  Image as ImageIcon,
  Brain
} from 'lucide-react';
import { audioSynth } from '../utils/audio';

export interface HubAppItem {
  id: string;
  name: string;
  nameHi: string;
  category: string;
  icon: 'youtube' | 'whatsapp' | 'google' | 'calculator' | 'files' | 'maps' | 'camera' | 'photos' | 'brain';
  url: string;
  status: 'Ready' | 'Active' | 'Online';
  accentColor: string;
  voiceHint: string;
  isInternal?: boolean;
}

export const HUB_APPS: HubAppItem[] = [
  {
    id: 'memory',
    name: 'Memory Vault',
    nameHi: 'तारा की याददाश्त (मस्तिष्क)',
    category: 'Human Intellect & Memory',
    icon: 'brain',
    url: '#memory',
    status: 'Active',
    accentColor: 'purple',
    voiceHint: '"याददाश्त खोलो" / "क्या याद है"',
    isInternal: true,
  },
  {
    id: 'camera',
    name: 'Live Camera',
    nameHi: 'लाइव कैमरा (फ़ोटो खींचो)',
    category: 'Camera & Vision',
    icon: 'camera',
    url: '#camera',
    status: 'Ready',
    accentColor: 'cyan',
    voiceHint: '"कैमरा खोलो" / "फोटो खींचो"',
    isInternal: true,
  },
  {
    id: 'photos',
    name: 'Photo Upload',
    nameHi: 'फ़ोटो जोड़ें (गैलरी / फ़ाइल)',
    category: 'Gallery & Media',
    icon: 'photos',
    url: '#photos',
    status: 'Ready',
    accentColor: 'emerald',
    voiceHint: '"फोटो जोड़ो" / "फोटो चुनो"',
    isInternal: true,
  },
  {
    id: 'youtube',
    name: 'YouTube',
    nameHi: 'यूट्यूब (वीडियो व संगीत)',
    category: 'Streaming & Media',
    icon: 'youtube',
    url: 'https://www.youtube.com',
    status: 'Active',
    accentColor: 'rose',
    voiceHint: '"YouTube kholo"',
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp Web',
    nameHi: 'व्हाट्सएप वेब (चैट व मैसेज)',
    category: 'Messaging',
    icon: 'whatsapp',
    url: 'https://web.whatsapp.com',
    status: 'Ready',
    accentColor: 'emerald',
    voiceHint: '"WhatsApp kholo"',
  },
  {
    id: 'google',
    name: 'Google Search',
    nameHi: 'गूगल सर्च (त्वरित खोज)',
    category: 'Web Search Engine',
    icon: 'google',
    url: 'https://www.google.com',
    status: 'Online',
    accentColor: 'sky',
    voiceHint: '"Google search karo [सवाल]"',
  },
  {
    id: 'calculator',
    name: 'Smart Calculator',
    nameHi: 'स्मार्ट कैलकुलेटर (हिसाब-किताब)',
    category: 'Math & Daily Budget',
    icon: 'calculator',
    url: '#calculator',
    status: 'Ready',
    accentColor: 'amber',
    voiceHint: '"हिसाब निकालो" / "कैलकुलेटर"',
    isInternal: true,
  },
  {
    id: 'files',
    name: 'Files & Drive',
    nameHi: 'फ़ाइलें व दस्तावेज़',
    category: 'Storage & Uploads',
    icon: 'files',
    url: 'https://drive.google.com',
    status: 'Ready',
    accentColor: 'purple',
    voiceHint: '"Files kholo"',
  },
  {
    id: 'maps',
    name: 'Google Maps',
    nameHi: 'गूगल मैप्स व लोकेशन',
    category: 'Navigation & GPS',
    icon: 'maps',
    url: 'https://maps.google.com',
    status: 'Online',
    accentColor: 'teal',
    voiceHint: '"Maps kholo"',
  },
];

interface SciFiAppHubPanelProps {
  onOpenInternalApp?: (appId: string) => void;
  onLaunchUrl?: (url: string, appName: string) => void;
  onOpenCamera?: () => void;
  onUploadPhoto?: () => void;
  onOpenMemoryVault?: () => void;
  className?: string;
}

export const SciFiAppHubPanel: React.FC<SciFiAppHubPanelProps> = ({
  onOpenInternalApp,
  onLaunchUrl,
  onOpenCamera,
  onUploadPhoto,
  onOpenMemoryVault,
  className = '',
}) => {
  const [quickSearchQuery, setQuickSearchQuery] = useState('');
  const [lastLaunchedApp, setLastLaunchedApp] = useState<string | null>(null);

  const handleLaunch = (app: HubAppItem) => {
    audioSynth.playSciFiClick();
    setLastLaunchedApp(app.name);

    if (app.id === 'memory' && onOpenMemoryVault) {
      onOpenMemoryVault();
      return;
    }

    if (app.id === 'camera' && onOpenCamera) {
      onOpenCamera();
      return;
    }

    if (app.id === 'photos' && onUploadPhoto) {
      onUploadPhoto();
      return;
    }

    if (app.isInternal && onOpenInternalApp) {
      onOpenInternalApp(app.id);
      return;
    }

    if (onLaunchUrl) {
      onLaunchUrl(app.url, app.name);
    } else {
      try {
        window.open(app.url, '_blank', 'noopener,noreferrer');
      } catch {
        // Fallback
      }
    }
  };

  const handleQuickSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = quickSearchQuery.trim();
    if (!q) return;
    audioSynth.playSciFiCommand();
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(q)}`;
    if (onLaunchUrl) {
      onLaunchUrl(searchUrl, `Google Search: "${q}"`);
    } else {
      window.open(searchUrl, '_blank', 'noopener,noreferrer');
    }
    setQuickSearchQuery('');
  };

  const renderIcon = (type: HubAppItem['icon'], color: string) => {
    switch (type) {
      case 'brain':
        return <Brain className="w-5 h-5 text-purple-400" />;
      case 'camera':
        return <Camera className="w-5 h-5 text-cyan-400" />;
      case 'photos':
        return <Upload className="w-5 h-5 text-emerald-400" />;
      case 'youtube':
        return <Youtube className="w-5 h-5 text-rose-400" />;
      case 'whatsapp':
        return <MessageCircle className="w-5 h-5 text-emerald-400" />;
      case 'google':
        return <Search className="w-5 h-5 text-sky-400" />;
      case 'calculator':
        return <Calculator className="w-5 h-5 text-amber-400" />;
      case 'files':
        return <FolderOpen className="w-5 h-5 text-purple-400" />;
      case 'maps':
        return <Compass className="w-5 h-5 text-teal-400" />;
      default:
        return <ArrowUpRight className="w-5 h-5 text-cyan-400" />;
    }
  };

  return (
    <aside
      aria-label="TARA App Hub"
      className={`rounded-2xl bg-[#030917]/90 border border-cyan-500/35 backdrop-blur-md shadow-[0_0_30px_rgba(0,240,255,0.15)] flex flex-col overflow-hidden ${className}`}
      style={{
        backgroundImage:
          'radial-gradient(circle at 10% 20%, rgba(0, 240, 255, 0.05) 0%, transparent 40%)',
      }}
    >
      {/* Header Bar */}
      <div className="px-3.5 py-2.5 bg-[#020612]/95 border-b border-cyan-500/25 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-cyan-600 to-sky-500 flex items-center justify-center text-white shadow-[0_0_10px_rgba(0,240,255,0.4)]">
            <Radio className="w-3.5 h-3.5 animate-pulse text-cyan-100" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-heading font-black text-xs text-cyan-200 tracking-wider">
                TARA APP HUB
              </span>
              <span className="px-1.5 py-0.2 rounded bg-cyan-950/80 border border-cyan-400/40 text-[9px] font-mono text-cyan-300 font-bold">
                LAUNCHER // 6 APPS
              </span>
            </div>
            <p className="text-[9px] font-mono text-slate-400 hidden sm:block">
              Voice & 1-Click Cyber Portal
            </p>
          </div>
        </div>

        {lastLaunchedApp && (
          <span className="text-[9px] font-mono text-emerald-400 flex items-center gap-1 animate-in fade-in">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            <span>{lastLaunchedApp} Launched</span>
          </span>
        )}
      </div>

      {/* Embedded Google Quick Search Input Bar */}
      <form
        onSubmit={handleQuickSearchSubmit}
        className="px-3 py-2 bg-cyan-950/20 border-b border-cyan-500/20 flex items-center gap-1.5"
      >
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-cyan-400 absolute left-2.5 top-2" />
          <input
            type="text"
            value={quickSearchQuery}
            onChange={(e) => setQuickSearchQuery(e.target.value)}
            placeholder='गूगल पर तुरंत खोजें (उदा: "स्टील पाइप रेट्स", "वेल्डिंग रॉड")...'
            className="w-full bg-[#020713] border border-cyan-500/30 rounded-lg pl-8 pr-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-sans"
          />
        </div>
        <button
          type="submit"
          className="px-2.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-[10px] font-bold transition-all shadow-sm cursor-pointer whitespace-nowrap"
          title="Google पर खोजें"
        >
          सर्च
        </button>
      </form>

      {/* Apps Grid */}
      <div className="p-2.5 sm:p-3 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-2 overflow-y-auto max-h-[360px] custom-scrollbar">
        {HUB_APPS.map((app) => {
          return (
            <div
              key={app.id}
              onClick={() => handleLaunch(app)}
              className="p-2.5 rounded-xl bg-[#040c1e] hover:bg-[#071530] border border-cyan-500/25 hover:border-cyan-400/70 transition-all duration-200 cursor-pointer flex flex-col justify-between group shadow-sm hover:shadow-[0_0_18px_rgba(0,240,255,0.25)] hover:scale-[1.02] relative overflow-hidden"
            >
              {/* Top Accent Line */}
              <div
                className={`absolute top-0 left-0 right-0 h-0.5 ${
                  app.accentColor === 'rose'
                    ? 'bg-rose-500'
                    : app.accentColor === 'emerald'
                    ? 'bg-emerald-500'
                    : app.accentColor === 'sky'
                    ? 'bg-sky-500'
                    : app.accentColor === 'amber'
                    ? 'bg-amber-500'
                    : app.accentColor === 'purple'
                    ? 'bg-purple-500'
                    : 'bg-teal-500'
                }`}
              />

              {/* Icon & Live Badge */}
              <div className="flex items-center justify-between gap-1 mb-2">
                <div className="w-8 h-8 rounded-lg bg-[#020614] border border-cyan-500/30 flex items-center justify-center group-hover:border-cyan-400 group-hover:scale-105 transition-all">
                  {renderIcon(app.icon, app.accentColor)}
                </div>

                <div className="flex items-center gap-1">
                  <span
                    className={`px-1.5 py-0.5 rounded text-[8px] font-mono font-bold uppercase tracking-wider flex items-center gap-1 ${
                      app.status === 'Active'
                        ? 'bg-emerald-950/90 text-emerald-300 border border-emerald-500/40'
                        : app.status === 'Online'
                        ? 'bg-sky-950/90 text-sky-300 border border-sky-500/40'
                        : 'bg-cyan-950/90 text-cyan-300 border border-cyan-500/40'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    {app.status}
                  </span>
                  <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-cyan-300 transition-colors" />
                </div>
              </div>

              {/* App Names */}
              <div>
                <h4 className="text-xs font-heading font-black text-white group-hover:text-cyan-200 transition-colors truncate">
                  {app.name}
                </h4>
                <p className="text-[10px] font-sans text-slate-400 truncate">
                  {app.nameHi}
                </p>
              </div>

              {/* Voice Command Hint Badge */}
              <div className="mt-2 pt-1.5 border-t border-cyan-500/15 flex items-center justify-between">
                <span className="text-[8px] font-mono text-cyan-400 truncate">
                  🗣️ {app.voiceHint}
                </span>
                <span className="text-[8px] font-mono font-bold text-slate-500 group-hover:text-cyan-300">
                  OPEN ↗
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Voice Launcher Help Footer Banner */}
      <div className="px-3 py-1.5 bg-[#02050f] border-t border-cyan-500/20 flex items-center justify-between text-[9px] font-mono text-slate-400">
        <span className="flex items-center gap-1 text-cyan-300 truncate">
          <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
          <span>बोलें: "YouTube kholo", "WhatsApp kholo", "Google search karo ..."</span>
        </span>
        <span className="text-slate-500 shrink-0 hidden sm:inline">1-Click Fast Launch</span>
      </div>
    </aside>
  );
};
