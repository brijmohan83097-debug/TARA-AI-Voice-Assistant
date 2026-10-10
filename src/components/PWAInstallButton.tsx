/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Download, Check, Sparkles, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export const PWAInstallButton: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);

  const [showInstructionsModal, setShowInstructionsModal] = useState(false);

  useEffect(() => {
    // Detect standalone mode (already installed)
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsInstalled(isStandalone);

    // Detect iOS devices
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIOSDevice);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
        setDeferredPrompt(null);
      }
    } else if (isIOS) {
      setShowIOSModal(true);
    } else {
      setShowInstructionsModal(true);
    }
  };

  // If already running in standalone mode, show subtle installed badge or hide
  if (isInstalled) {
    return (
      <span
        className="px-2 py-1 rounded-lg bg-cyan-950/40 border border-cyan-500/20 text-[10px] font-mono text-cyan-400/80 flex items-center gap-1"
        title="TARA PWA Installed"
      >
        <Check className="w-3 h-3 text-cyan-400" />
        <span className="hidden sm:inline">PWA ACTIVE</span>
      </span>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={handleInstallClick}
        className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-cyan-600/30 to-blue-600/30 hover:from-cyan-500/50 hover:to-blue-500/50 border border-cyan-400/60 text-[10px] font-mono font-bold text-cyan-200 flex items-center gap-1.5 cursor-pointer transition-all hover:scale-105 active:scale-95 shadow-[0_0_12px_rgba(0,240,255,0.25)] animate-pulse"
        title="TARA AI वॉइस असिस्टेंट को अपने डिवाइस / फ़ोन में इंस्टॉल करें (PWA)"
      >
        <Download className="w-3 h-3 text-cyan-300" />
        <span>इंस्टॉल PWA</span>
      </button>

      {/* iOS Installation Instructions Modal */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-xl bg-[#090f1d] border border-cyan-500/50 p-5 shadow-2xl text-slate-100 font-mono">
            <div className="flex items-center justify-between pb-3 border-b border-cyan-500/30">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-cyan-300">iPhone / iPad में इंस्टॉल करें</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowIOSModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs text-slate-300">
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-cyan-950 border border-cyan-500/50 flex items-center justify-center text-[11px] text-cyan-300 shrink-0">1</span>
                <span>सफ़ारी (Safari) ब्राउज़र के नीचे <strong>Share</strong> बटन दबाएं।</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-cyan-950 border border-cyan-500/50 flex items-center justify-center text-[11px] text-cyan-300 shrink-0">2</span>
                <span>नीचे स्क्रॉल करें और <strong>"Add to Home Screen"</strong> (होम स्क्रीन में जोड़ें) चुनें।</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-cyan-950 border border-cyan-500/50 flex items-center justify-center text-[11px] text-cyan-300 shrink-0">3</span>
                <span>ऊपर <strong>"Add"</strong> पर क्लिक करें। TARA ऐप आपके फ़ोन पर इंस्टॉल हो जाएगी!</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowIOSModal(false)}
              className="mt-5 w-full py-2 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400 text-cyan-200 text-xs font-bold transition-all cursor-pointer"
            >
              समझ गया (Close)
            </button>
          </div>
        </div>
      )}

      {/* General / Android Browser Instructions Modal */}
      {showInstructionsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-xl bg-[#090f1d] border border-cyan-500/50 p-5 shadow-2xl text-slate-100 font-mono">
            <div className="flex items-center justify-between pb-3 border-b border-cyan-500/30">
              <div className="flex items-center gap-2">
                <Download className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-cyan-300">TARA PWA इंस्टॉल निर्देश</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowInstructionsModal(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs text-slate-300">
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-cyan-950 border border-cyan-500/50 flex items-center justify-center text-[11px] text-cyan-300 shrink-0">1</span>
                <span>ब्राउज़र के ऊपर दाईं ओर <strong>तीन बिंदुओं (⋮)</strong> मेनू पर क्लिक करें।</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-cyan-950 border border-cyan-500/50 flex items-center justify-center text-[11px] text-cyan-300 shrink-0">2</span>
                <span><strong>"Install TARA AI"</strong> या <strong>"Add to Home screen"</strong> चुनें।</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-cyan-950 border border-cyan-500/50 flex items-center justify-center text-[11px] text-cyan-300 shrink-0">3</span>
                <span>कन्फर्म करें—TARA एक नेटिव Sci-Fi ऐप की तरह बिना ब्राउज़र बार के खुलेगा!</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowInstructionsModal(false)}
              className="mt-5 w-full py-2 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400 text-cyan-200 text-xs font-bold transition-all cursor-pointer"
            >
              ठीक है (Got It)
            </button>
          </div>
        </div>
      )}
    </>
  );
};
