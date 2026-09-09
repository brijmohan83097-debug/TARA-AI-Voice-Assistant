/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Download, Sparkles, CheckCircle, Eye } from 'lucide-react';
import { LogoGraphicData } from '../types';
import { downloadImageToDevice } from '../utils/imageService';
import { audioSynth } from '../utils/audio';

interface LogoCardProps {
  data: LogoGraphicData;
}

export const LogoCard: React.FC<LogoCardProps> = ({ data }) => {
  const [downloaded, setDownloaded] = useState(false);
  const [isPreviewExpanded, setIsPreviewExpanded] = useState(false);

  const handleDownload = () => {
    audioSynth.playClick();
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(30);
    }
    downloadImageToDevice(data.dataUrl, data.downloadFileName || `${data.appName.toLowerCase()}-logo.png`);
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 3500);
  };

  return (
    <div className="mt-3 rounded-2xl overflow-hidden border border-cyan-500/40 bg-gradient-to-b from-slate-900/95 via-slate-950/95 to-cyan-950/40 p-3 sm:p-4 shadow-2xl max-w-sm sm:max-w-md space-y-3 backdrop-blur-lg">
      {/* Header bar */}
      <div className="flex items-center justify-between gap-2 border-b border-cyan-500/20 pb-2">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-cyan-500 to-emerald-400 flex items-center justify-center shadow-sm shadow-cyan-500/50">
            <Sparkles className="w-3.5 h-3.5 text-slate-950" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-cyan-200 font-heading tracking-wide">
              {data.appName} App Logo
            </h4>
            <span className="text-[10px] text-cyan-400/80 font-mono">
              {data.category || 'Official App Icon Mockup'}
            </span>
          </div>
        </div>

        <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-medium bg-cyan-950/80 border border-cyan-500/40 text-cyan-300">
          1024 × 1024 HD
        </span>
      </div>

      {/* Main Image Graphic Preview */}
      <div className="relative rounded-xl overflow-hidden border border-cyan-500/30 bg-black/60 group shadow-inner">
        <img
          src={data.dataUrl}
          alt={`${data.appName} App Logo Graphic`}
          className={`w-full h-auto block rounded-xl transition-all duration-300 cursor-pointer ${
            isPreviewExpanded ? 'scale-100' : 'group-hover:scale-[1.015]'
          }`}
          onClick={() => setIsPreviewExpanded(!isPreviewExpanded)}
          referrerPolicy="no-referrer"
        />

        {/* Quick View Expand Overlay Badge */}
        <button
          type="button"
          onClick={() => setIsPreviewExpanded(!isPreviewExpanded)}
          className="absolute top-2 right-2 px-2 py-1 rounded-md bg-slate-900/80 hover:bg-slate-900 border border-cyan-500/30 text-cyan-300 text-[10px] font-mono flex items-center gap-1 opacity-80 hover:opacity-100 transition-all cursor-pointer backdrop-blur-md"
        >
          <Eye className="w-3 h-3" />
          <span>{isPreviewExpanded ? 'छोटा करें' : 'बड़ा देखें'}</span>
        </button>

        {/* Floating Brand Badge */}
        <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-lg bg-slate-950/80 border border-cyan-500/30 text-[10px] font-medium text-slate-200 flex items-center gap-1.5 backdrop-blur-md">
          <span
            className="w-2.5 h-2.5 rounded-full inline-block border border-white/40 shadow-xs"
            style={{ backgroundColor: data.primaryColor || '#10b981' }}
          />
          <span className="font-mono text-cyan-300">{data.appName}</span>
        </div>
      </div>

      {/* Tagline / Subtitle description */}
      {data.tagline && (
        <p className="text-[11px] text-slate-300 text-center font-sans italic px-1">
          &ldquo;{data.tagline}&rdquo;
        </p>
      )}

      {/* Prominent High-Contrast Download Button */}
      <button
        type="button"
        onClick={handleDownload}
        className={`w-full py-2.5 sm:py-3 px-4 rounded-xl font-semibold text-xs sm:text-[13px] shadow-lg flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer ${
          downloaded
            ? 'bg-emerald-600 text-white shadow-emerald-950/60'
            : 'bg-gradient-to-r from-emerald-500 via-cyan-500 to-blue-600 hover:from-emerald-400 hover:via-cyan-400 hover:to-blue-500 text-slate-950 font-bold shadow-cyan-950/80 hover:shadow-cyan-500/30'
        }`}
      >
        {downloaded ? (
          <>
            <CheckCircle className="w-4 h-4 text-white" />
            <span>इमेज सफलतापूर्वक डाउनलोड हुई! (Downloaded)</span>
          </>
        ) : (
          <>
            <Download className="w-4 h-4" />
            <span>इमेज डाउनलोड करें (Download Image PNG)</span>
          </>
        )}
      </button>

      {/* Footer subtle tip */}
      <div className="flex items-center justify-between text-[9px] text-slate-400/80 font-mono pt-1 px-1">
        <span>PNG • Transparent Background Ready</span>
        <span>Tara Studio</span>
      </div>
    </div>
  );
};
