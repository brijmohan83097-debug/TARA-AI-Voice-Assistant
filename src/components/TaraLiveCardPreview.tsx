/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Download, 
  Sparkles, 
  FileDown, 
  Maximize2, 
  Wand2, 
  Image as ImageIcon, 
  Upload, 
  X, 
  Check, 
  RefreshCw,
  Sun,
  Type,
  Palette,
  Sliders
} from 'lucide-react';
import { generatePosterImagePdf } from '../utils/pdfGenerator';
import { audioSynth } from '../utils/audio';
import {
  compositePersonOnBackground,
  isBackgroundChangeRequest,
  PRESET_SCENES,
  PresetSceneType,
} from '../utils/personCutoutService';

export interface PosterCardData {
  id: string;
  title: string;
  quote: string;
  author: string;
  category?: string;
  theme: 'cyber' | 'golden' | 'twilight' | 'emerald' | 'noir';
  imageUrl?: string | null; // optional uploaded photo
  filter?: 'normal' | 'enhance' | 'warm' | 'noir' | 'cyber';
  overlayText?: string;
  overlayPosition?: 'bottom' | 'center' | 'top';
  brightness?: number; // 80 - 150
  contrast?: number; // 80 - 150
}

interface TaraLiveCardPreviewProps {
  cardData: PosterCardData;
  onUpdateCardData: (data: Partial<PosterCardData>) => void;
  onUploadNewPhoto?: (file: File) => void;
  onClose?: () => void;
  onRequestPdfDownload?: () => void;
}

const THEME_STYLES = {
  cyber: {
    name: 'Cyber Cyan',
    bgGradient: ['#040d1a', '#081a33', '#0a2540'],
    primaryText: '#e0f2fe',
    accentText: '#00f0ff',
    border: 'rgba(0, 240, 255, 0.4)',
    glow: 'rgba(0, 240, 255, 0.25)',
    authorColor: '#7dd3fc',
  },
  golden: {
    name: 'Golden Wisdom',
    bgGradient: ['#1c1305', '#2c1e08', '#3d2b0b'],
    primaryText: '#fef3c7',
    accentText: '#fbbf24',
    border: 'rgba(251, 191, 36, 0.45)',
    glow: 'rgba(251, 191, 36, 0.25)',
    authorColor: '#fde68a',
  },
  twilight: {
    name: 'Royal Twilight',
    bgGradient: ['#110b22', '#1a1033', '#251745'],
    primaryText: '#f3e8ff',
    accentText: '#c084fc',
    border: 'rgba(192, 132, 252, 0.45)',
    glow: 'rgba(192, 132, 252, 0.25)',
    authorColor: '#e9d5ff',
  },
  emerald: {
    name: 'Vedic Emerald',
    bgGradient: ['#041a13', '#072b20', '#0b3c2d'],
    primaryText: '#ecfdf5',
    accentText: '#34d399',
    border: 'rgba(52, 211, 153, 0.45)',
    glow: 'rgba(52, 211, 153, 0.25)',
    authorColor: '#a7f3d0',
  },
  noir: {
    name: 'Minimal Noir',
    bgGradient: ['#0a0a0a', '#141414', '#1f1f1f'],
    primaryText: '#f8fafc',
    accentText: '#e2e8f0',
    border: 'rgba(226, 232, 240, 0.35)',
    glow: 'rgba(255, 255, 255, 0.1)',
    authorColor: '#94a3b8',
  },
};

const SAMPLE_HINDI_QUOTES = [
  {
    quote: 'उठो, जागो और तब तक मत रुको जब तक लक्ष्य की प्राप्ति न हो जाए।',
    author: 'स्वामी विवेकानंद',
    category: 'प्रेरणा',
  },
  {
    quote: 'सपने वो नहीं जो हम सोते हुए देखते हैं, सपने वो हैं जो हमें सोने नहीं देते।',
    author: 'डॉ. ए. पी. जे. अब्दुल कलाम',
    category: 'ध्येय',
  },
  {
    quote: 'कर्मण्येवाधिकारस्ते मा फलेषु कदाचन। अपने कर्म पर ध्यान दो, फल की चिंता मत करो।',
    author: 'श्रीमद्भगवद्गीता',
    category: 'ज्ञान',
  },
  {
    quote: 'कठिन परिश्रम और दृढ़ संकल्प से कोई भी असंभव कार्य संभव बन जाता है।',
    author: 'मिस्टर बृजमोहन कुमार',
    category: 'दृढ़ता',
  },
  {
    quote: 'सफलता का रहस्य है निरंतर अभ्यास और कभी हार न मानने का अटूट हौसला।',
    author: 'तारा प्रेरणा सूत्र',
    category: 'सफलता',
  },
];

export const TaraLiveCardPreview: React.FC<TaraLiveCardPreviewProps> = ({
  cardData,
  onUpdateCardData,
  onUploadNewPhoto,
  onClose,
  onRequestPdfDownload,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [renderedImageUrl, setRenderedImageUrl] = useState<string | null>(null);
  const [isRendering, setIsRendering] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState<'png' | 'jpg' | 'pdf' | null>(null);
  const [customInstruction, setCustomInstruction] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isBgReplacing, setIsBgReplacing] = useState(false);
  const [activeCutoutScene, setActiveCutoutScene] = useState<string | null>(null);

  // Background Cutout & Scene Replacement Handler (100% Exact Person & Face Preservation)
  const handleBackgroundReplace = async (sceneIdOrPrompt: string) => {
    if (!cardData.imageUrl) return;
    setIsBgReplacing(true);
    setActiveCutoutScene(sceneIdOrPrompt);
    audioSynth.playClick();

    try {
      const result = await compositePersonOnBackground(cardData.imageUrl, sceneIdOrPrompt);
      if (result.dataUrl) {
        onUpdateCardData({
          imageUrl: result.dataUrl,
        });
        audioSynth.playSuccess();
      }
    } catch (err) {
      console.error('Failed to composite background:', err);
      audioSynth.playError();
    } finally {
      setIsBgReplacing(false);
      setActiveCutoutScene(null);
    }
  };

  const currentTheme = THEME_STYLES[cardData.theme] || THEME_STYLES.cyber;

  // High-DPI Canvas Rendering Engine
  const renderCardToCanvas = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsRendering(true);
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // High resolution 16:9 canvas (1280x720)
    const width = 1280;
    const height = 720;
    canvas.width = width;
    canvas.height = height;

    // Check if there is an uploaded image background
    if (cardData.imageUrl) {
      try {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = cardData.imageUrl!;
        });

        // Apply filters: brightness, contrast, grayscale
        ctx.save();
        let filterStr = '';
        const b = cardData.brightness || 100;
        const c = cardData.contrast || 100;
        filterStr += `brightness(${b}%) contrast(${c}%) `;

        if (cardData.filter === 'enhance') {
          filterStr += 'saturate(130%) contrast(115%) ';
        } else if (cardData.filter === 'noir') {
          filterStr += 'grayscale(100%) contrast(125%) ';
        } else if (cardData.filter === 'warm') {
          filterStr += 'sepia(30%) saturate(125%) ';
        } else if (cardData.filter === 'cyber') {
          filterStr += 'hue-rotate(180deg) saturate(140%) ';
        }
        ctx.filter = filterStr.trim();

        // Draw image keeping aspect ratio (cover)
        const imgRatio = img.width / img.height;
        const targetRatio = width / height;
        let renderW = width;
        let renderH = height;
        let renderX = 0;
        let renderY = 0;

        if (imgRatio > targetRatio) {
          renderW = height * imgRatio;
          renderX = (width - renderW) / 2;
        } else {
          renderH = width / imgRatio;
          renderY = (height - renderH) / 2;
        }

        ctx.drawImage(img, renderX, renderY, renderW, renderH);
        ctx.restore();

        // Dark gradient scrim overlay for crystal-clear text readability
        const scrim = ctx.createLinearGradient(0, 0, 0, height);
        scrim.addColorStop(0, 'rgba(3, 7, 18, 0.45)');
        scrim.addColorStop(0.5, 'rgba(3, 7, 18, 0.6)');
        scrim.addColorStop(1, 'rgba(3, 7, 18, 0.88)');
        ctx.fillStyle = scrim;
        ctx.fillRect(0, 0, width, height);

      } catch (err) {
        console.warn('Canvas image render fallback to gradient:', err);
        drawGradientBackground(ctx, width, height, currentTheme.bgGradient);
      }
    } else {
      // Procedural artistic gradient background
      drawGradientBackground(ctx, width, height, currentTheme.bgGradient);
    }

    // Decorative cyber grid & frame border
    drawDecorativeFrame(ctx, width, height, currentTheme.accentText);

    // Render Text (Quote, Author, Badge, Tara signature)
    const quoteText = cardData.overlayText || cardData.quote || 'कर्म ही पूजा है, निरंतर आगे बढ़ते रहो।';
    const authorText = cardData.author ? `— ${cardData.author}` : '— Tara AI & Mr. Brijmohan Kumar';
    const categoryText = (cardData.category || 'TARA INSPIRATION & WISDOM').toUpperCase();

    // Top Category / Badge
    ctx.font = 'bold 22px monospace';
    ctx.fillStyle = currentTheme.accentText;
    ctx.textAlign = 'center';
    ctx.fillText(`✦  ${categoryText}  ✦`, width / 2, 110);

    // Decorative separator line
    ctx.strokeStyle = currentTheme.accentText;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(width / 2 - 120, 130);
    ctx.lineTo(width / 2 + 120, 130);
    ctx.stroke();

    // Main Quote Text (Wrap neatly with high typography)
    ctx.font = 'bold 44px "Noto Sans Devanagari", "Segoe UI", sans-serif';
    ctx.fillStyle = currentTheme.primaryText;
    ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.85)';
    ctx.shadowBlur = 12;

    const maxLineWidth = width - 240;
    const lines = wrapTextLines(ctx, `“${quoteText}”`, maxLineWidth);
    const lineHeight = 62;
    
    // Position text based on preference
    let startY = 320 - ((lines.length - 1) * lineHeight) / 2;
    if (cardData.overlayPosition === 'bottom') {
      startY = height - 220 - ((lines.length - 1) * lineHeight);
    } else if (cardData.overlayPosition === 'top') {
      startY = 200;
    }

    lines.forEach((line, idx) => {
      ctx.fillText(line, width / 2, startY + idx * lineHeight);
    });

    // Author
    ctx.shadowBlur = 0;
    ctx.font = '600 28px "Noto Sans Devanagari", "Segoe UI", sans-serif';
    ctx.fillStyle = currentTheme.authorColor;
    ctx.fillText(authorText, width / 2, startY + lines.length * lineHeight + 28);

    // Bottom Branding Footer
    ctx.font = '18px monospace';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.fillText('TARA AI VOICE ASSISTANT • CREATIVE POSTER STUDIO', width / 2, height - 50);

    // Export to data URL
    const exportUrl = canvas.toDataURL('image/png', 0.95);
    setRenderedImageUrl(exportUrl);
    setIsRendering(false);
  }, [cardData, currentTheme]);

  useEffect(() => {
    renderCardToCanvas();
  }, [renderCardToCanvas]);

  // Download Handler (PNG or JPG)
  const handleDownloadImage = (format: 'png' | 'jpg') => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    audioSynth.playSuccess();
    const mimeType = format === 'png' ? 'image/png' : 'image/jpeg';
    const dataUrl = canvas.toDataURL(mimeType, 0.95);
    
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `Tara_${cardData.title.replace(/\s+/g, '_')}_${Date.now()}.${format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloadSuccess(format);
    setTimeout(() => setDownloadSuccess(null), 3000);
  };

  // Direct PDF Download of the Active Card/Poster
  const handleDownloadPdf = () => {
    if (onRequestPdfDownload) {
      onRequestPdfDownload();
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    audioSynth.playSuccess();
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    generatePosterImagePdf(
      dataUrl,
      cardData.title || 'तारा सुविचार पोस्टर (Tara Quote Poster)',
      cardData.quote,
      cardData.author
    );

    setDownloadSuccess('pdf');
    setTimeout(() => setDownloadSuccess(null), 3000);
  };

  // Handle Photo File Upload
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    audioSynth.playClick();
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      onUpdateCardData({
        imageUrl: dataUrl,
        title: file.name.replace(/\.[^/.]+$/, ''),
      });
      if (onUploadNewPhoto) {
        onUploadNewPhoto(file);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Apply quick instruction
  const handleApplyInstruction = (instruction: string) => {
    audioSynth.playClick();
    const lower = instruction.toLowerCase();

    if (isBackgroundChangeRequest(instruction) && cardData.imageUrl) {
      handleBackgroundReplace(instruction);
      return;
    }

    if (lower.includes('saaf') || lower.includes('clear') || lower.includes('enhance') || lower.includes('निखार')) {
      onUpdateCardData({
        filter: 'enhance',
        brightness: 112,
        contrast: 120,
      });
    } else if (lower.includes('bright') || lower.includes('चमक')) {
      onUpdateCardData({
        brightness: Math.min((cardData.brightness || 100) + 15, 150),
      });
    } else if (lower.includes('vintage') || lower.includes('warm') || lower.includes('गोल्डन')) {
      onUpdateCardData({
        filter: 'warm',
        theme: 'golden',
      });
    } else if (lower.includes('noir') || lower.includes('black') || lower.includes('काला')) {
      onUpdateCardData({
        filter: 'noir',
        theme: 'noir',
      });
    } else if (lower.includes('quote') || lower.includes('विचार') || lower.includes('शायरी') || lower.includes('text')) {
      // Pick a random inspirational quote if text isn't explicitly extracted
      const rand = SAMPLE_HINDI_QUOTES[Math.floor(Math.random() * SAMPLE_HINDI_QUOTES.length)];
      onUpdateCardData({
        quote: rand.quote,
        author: rand.author,
        category: rand.category,
      });
    } else {
      // Treat the instruction itself as quote/overlay text
      onUpdateCardData({
        quote: instruction,
        overlayText: instruction,
      });
    }
  };

  return (
    <div className="w-full rounded-2xl bg-[#070e1c]/95 border-2 border-cyan-400/40 p-3.5 sm:p-5 shadow-[0_8px_35px_rgba(0,0,0,0.7)] backdrop-blur-md relative overflow-hidden flex flex-col gap-3.5">
      {/* Top Cyber Glow Stripe */}
      <div 
        className="absolute top-0 left-0 right-0 h-[3px] transition-all"
        style={{ background: `linear-gradient(90deg, transparent, ${currentTheme.accentText}, transparent)` }}
      />

      {/* 1. Header Bar with Actions */}
      <div className="flex items-center justify-between gap-2 flex-wrap pb-2.5 border-b border-cyan-500/20">
        <div className="flex items-center gap-2">
          <div 
            className="w-8 h-8 rounded-xl flex items-center justify-center font-bold shadow-md"
            style={{ 
              background: `linear-gradient(135deg, ${currentTheme.accentText}, #0284c7)`,
              color: '#020617'
            }}
          >
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-heading font-bold text-xs sm:text-sm text-slate-100 flex items-center gap-2">
              <span>लाइव फ़ोटो व पोस्टर प्रिव्यू (Live Card Preview)</span>
              {isRendering && (
                <span className="text-[10px] font-mono text-cyan-400 animate-pulse flex items-center gap-1">
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  <span>रेनडरिंग...</span>
                </span>
              )}
            </h3>
            <p className="text-[11px] text-slate-400 font-mono">
              High-DPI 1080p Canvas Engine • 1-Click PNG/JPG & Instant PDF
            </p>
          </div>
        </div>

        {/* Top Tools: Fullscreen, Controls Toggle, Close */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setShowControls((prev) => !prev)}
            className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-[11px] font-mono flex items-center gap-1 transition-all"
            title="Toggle Controls Panel"
          >
            <Sliders className="w-3 h-3 text-cyan-400" />
            <span className="hidden sm:inline">{showControls ? 'टूल्स छिपाएं' : 'टूल्स दिखाएं'}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsFullscreen(true)}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-cyan-300 transition-colors"
            title="Fullscreen HD Preview"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-900 hover:bg-rose-950/80 border border-slate-700 hover:border-rose-500/50 text-slate-400 hover:text-rose-300 transition-colors"
              title="Close Preview"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 2. PROMINENT MAIN PREVIEW WINDOW (The Core User Deliverable) */}
      <div className="relative w-full rounded-xl overflow-hidden bg-slate-950 border border-cyan-500/30 shadow-2xl flex items-center justify-center min-h-[220px] sm:min-h-[300px] group">
        {/* Hidden Canvas used for high-DPI rendering */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Live Displayed Rendered Image */}
        {renderedImageUrl ? (
          <img
            src={renderedImageUrl}
            alt={cardData.title}
            className="w-full h-auto object-contain max-h-[380px] sm:max-h-[440px] rounded-lg shadow-inner transition-transform duration-300 group-hover:scale-[1.005]"
          />
        ) : (
          <div className="flex flex-col items-center justify-center p-8 text-slate-400 gap-2">
            <RefreshCw className="w-8 h-8 animate-spin text-cyan-400" />
            <span className="text-xs font-mono">पोस्टर तैयार किया जा रहा है...</span>
          </div>
        )}

        {/* Top-Right Resolution & Theme Badge */}
        <div className="absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-full bg-slate-950/80 backdrop-blur-md border border-cyan-400/40 text-[10px] font-mono text-cyan-300 shadow-sm flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>1280 × 720 HD</span>
          <span>•</span>
          <span className="capitalize">{cardData.theme}</span>
        </div>

        {/* Bottom Hover Overlay for Quick Actions */}
        <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="bg-slate-950/90 text-slate-200 text-[10px] font-mono px-2.5 py-1 rounded-md border border-slate-700">
            तारा द्वारा निर्मित • {cardData.author || 'Mr. Brijmohan Kumar'}
          </span>
        </div>
      </div>

      {/* 3. PROMINENT DOWNLOAD BAR DIRECTLY BELOW PREVIEW (Exact User Mandate) */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Download PNG Button */}
        <button
          type="button"
          onClick={() => handleDownloadImage('png')}
          className="flex-1 min-w-[140px] py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 via-cyan-400 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-extrabold text-xs font-mono tracking-wider shadow-[0_0_20px_rgba(0,240,255,0.4)] flex items-center justify-center gap-2 active:scale-98 transition-all"
        >
          {downloadSuccess === 'png' ? (
            <>
              <Check className="w-4 h-4 text-emerald-950" />
              <span>PNG सेव हुआ!</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4 text-slate-950" />
              <span>Download Image (PNG)</span>
            </>
          )}
        </button>

        {/* Download JPG Button */}
        <button
          type="button"
          onClick={() => handleDownloadImage('jpg')}
          className="flex-1 min-w-[140px] py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 border-2 border-cyan-500/50 hover:border-cyan-400 text-cyan-200 hover:text-white font-extrabold text-xs font-mono tracking-wider shadow-sm flex items-center justify-center gap-2 active:scale-98 transition-all"
        >
          {downloadSuccess === 'jpg' ? (
            <>
              <Check className="w-4 h-4 text-emerald-400" />
              <span>JPG सेव हुआ!</span>
            </>
          ) : (
            <>
              <ImageIcon className="w-4 h-4 text-cyan-400" />
              <span>Download Image (JPG)</span>
            </>
          )}
        </button>

        {/* Download PDF Button */}
        <button
          type="button"
          onClick={handleDownloadPdf}
          className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-900/90 to-purple-900/90 hover:from-indigo-800 hover:to-purple-800 border border-purple-400/50 text-purple-200 hover:text-white font-bold text-xs font-mono tracking-wider shadow-sm flex items-center justify-center gap-2 active:scale-98 transition-all"
          title="Save this poster as an instant PDF document"
        >
          {downloadSuccess === 'pdf' ? (
            <>
              <Check className="w-4 h-4 text-emerald-400" />
              <span>PDF तैयार!</span>
            </>
          ) : (
            <>
              <FileDown className="w-4 h-4 text-purple-300" />
              <span>Download PDF</span>
            </>
          )}
        </button>
      </div>

      {/* 4. INTERACTIVE IMAGE ACTION BAR (Feature 3: Upload Photo & Give Instructions) */}
      {showControls && (
        <div className="mt-1 p-3 sm:p-4 rounded-xl bg-[#050b16] border border-cyan-500/25 flex flex-col gap-3">
          {/* Action Bar Header */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 text-xs font-mono text-cyan-300">
              <Wand2 className="w-3.5 h-3.5 text-cyan-400" />
              <span className="font-bold">फोटो एक्शन व संपादन बार (Action Bar):</span>
            </div>

            {/* Upload Photo Button */}
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileSelect}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 rounded-lg bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-400/60 text-cyan-300 hover:text-white text-xs font-mono font-bold flex items-center gap-1.5 transition-all active:scale-95 shadow-xs"
              >
                <Upload className="w-3.5 h-3.5 text-cyan-400" />
                <span>Upload Photo (फोटो अपलोड)</span>
              </button>
            </div>
          </div>

          {/* Quick 1-Click Action Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            <button
              type="button"
              onClick={() => handleApplyInstruction('enhance')}
              className="px-2.5 py-1 rounded-lg bg-slate-900/90 hover:bg-cyan-950 border border-cyan-500/30 text-cyan-200 text-[11px] font-mono shrink-0 transition-all flex items-center gap-1"
            >
              <Sun className="w-3 h-3 text-amber-400" />
              <span>साफ़ व बेहतर करें (Clear & Enhance)</span>
            </button>

            <button
              type="button"
              onClick={() => handleApplyInstruction('quote')}
              className="px-2.5 py-1 rounded-lg bg-slate-900/90 hover:bg-cyan-950 border border-cyan-500/30 text-cyan-200 text-[11px] font-mono shrink-0 transition-all flex items-center gap-1"
            >
              <Type className="w-3 h-3 text-cyan-400" />
              <span>सुविचार बदलें (New Quote)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                const themes: Array<'cyber' | 'golden' | 'twilight' | 'emerald' | 'noir'> = ['cyber', 'golden', 'twilight', 'emerald', 'noir'];
                const next = themes[(themes.indexOf(cardData.theme) + 1) % themes.length];
                onUpdateCardData({ theme: next });
              }}
              className="px-2.5 py-1 rounded-lg bg-slate-900/90 hover:bg-cyan-950 border border-cyan-500/30 text-cyan-200 text-[11px] font-mono shrink-0 transition-all flex items-center gap-1"
            >
              <Palette className="w-3 h-3 text-purple-400" />
              <span>थीम बदलें ({currentTheme.name})</span>
            </button>

            <button
              type="button"
              onClick={() => handleApplyInstruction('warm')}
              className="px-2.5 py-1 rounded-lg bg-slate-900/90 hover:bg-cyan-950 border border-cyan-500/30 text-cyan-200 text-[11px] font-mono shrink-0 transition-all flex items-center gap-1"
            >
              <span>🌅 गोल्डन ऑवर</span>
            </button>

            <button
              type="button"
              onClick={() => handleApplyInstruction('noir')}
              className="px-2.5 py-1 rounded-lg bg-slate-900/90 hover:bg-cyan-950 border border-cyan-500/30 text-cyan-200 text-[11px] font-mono shrink-0 transition-all flex items-center gap-1"
            >
              <span>🖤 ब्लैक & व्हाइट</span>
            </button>

            {cardData.imageUrl && (
              <button
                type="button"
                onClick={() => onUpdateCardData({ imageUrl: null })}
                className="px-2.5 py-1 rounded-lg bg-rose-950/60 hover:bg-rose-900 border border-rose-500/40 text-rose-300 text-[11px] font-mono shrink-0 transition-all flex items-center gap-1"
              >
                <X className="w-3 h-3" />
                <span>फ़ोटो हटाएं</span>
              </button>
            )}
          </div>

          {/* Background Replacement Bar (100% Identity Preservation) */}
          {cardData.imageUrl && (
            <div className="p-2.5 rounded-xl bg-slate-950/90 border border-cyan-500/30 flex flex-col gap-2">
              <div className="flex items-center justify-between gap-2 flex-wrap text-[11px] font-mono">
                <span className="text-cyan-300 font-bold flex items-center gap-1.5">
                  <span>🛣️ बैकग्राउंड सीन बदलें:</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/40">
                    100% असली चेहरा व पहचान सुरक्षित
                  </span>
                </span>
                {isBgReplacing && (
                  <span className="text-amber-300 animate-pulse text-[10px] flex items-center gap-1">
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    <span>कटआउट प्रोसेस हो रहा है...</span>
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                {PRESET_SCENES.map((scene) => (
                  <button
                    key={scene.id}
                    type="button"
                    disabled={isBgReplacing}
                    onClick={() => handleBackgroundReplace(scene.id)}
                    className={`px-2.5 py-1.5 rounded-lg border text-[11px] font-mono shrink-0 transition-all flex items-center gap-1.5 disabled:opacity-50 ${
                      activeCutoutScene === scene.id
                        ? 'bg-cyan-500 text-slate-950 border-cyan-300 font-bold shadow-md'
                        : 'bg-slate-900/90 hover:bg-cyan-950/80 border-cyan-500/30 text-slate-200'
                    }`}
                    title={`${scene.title} — ${scene.description}`}
                  >
                    <span>{scene.icon}</span>
                    <span className="whitespace-nowrap font-medium">{scene.hindiTitle.replace(/\s*\(.*\)/, '')}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Custom Instruction Box (e.g. "clear it, enhance it, add text/quotes") */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!customInstruction.trim()) return;
              handleApplyInstruction(customInstruction.trim());
              setCustomInstruction('');
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={customInstruction}
              onChange={(e) => setCustomInstruction(e.target.value)}
              placeholder="निर्देश दें (उदा. 'फ़ोटो साफ़ करो', 'नीचे स्वामी विवेकानंद का विचार लिखो', 'ब्राइटनेस बढ़ाओ')..."
              className="flex-1 bg-slate-950 border border-cyan-500/30 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-hidden focus:border-cyan-400 font-sans"
            />
            <button
              type="submit"
              disabled={!customInstruction.trim()}
              className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-bold text-xs font-mono transition-all shrink-0 active:scale-95"
            >
              लागू करें (Apply)
            </button>
          </form>
        </div>
      )}

      {/* 5. Fullscreen Zoom Modal */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col items-center justify-center p-4">
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleDownloadImage('png')}
              className="px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs font-mono flex items-center gap-1.5 shadow-lg"
            >
              <Download className="w-4 h-4" />
              <span>Download PNG</span>
            </button>
            <button
              type="button"
              onClick={handleDownloadPdf}
              className="px-4 py-2 rounded-xl bg-purple-600 text-white font-bold text-xs font-mono flex items-center gap-1.5 shadow-lg"
            >
              <FileDown className="w-4 h-4" />
              <span>Download PDF</span>
            </button>
            <button
              type="button"
              onClick={() => setIsFullscreen(false)}
              className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="max-w-5xl max-h-[85vh] w-full flex items-center justify-center">
            {renderedImageUrl && (
              <img
                src={renderedImageUrl}
                alt="Full Preview"
                className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl border border-cyan-500/40"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Helper to draw rich gradient background on canvas
function drawGradientBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  colors: string[]
) {
  const grad = ctx.createLinearGradient(0, 0, width, height);
  colors.forEach((c, idx) => {
    grad.addColorStop(idx / (colors.length - 1), c);
  });
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  // Subtle ambient circular glow in center
  const radial = ctx.createRadialGradient(width / 2, height / 2, 50, width / 2, height / 2, width / 2);
  radial.addColorStop(0, 'rgba(0, 240, 255, 0.12)');
  radial.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = radial;
  ctx.fillRect(0, 0, width, height);
}

// Helper to draw decorative cybernetic framing borders
function drawDecorativeFrame(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  accentColor: string
) {
  const inset = 30;
  ctx.save();
  ctx.strokeStyle = accentColor;
  ctx.lineWidth = 1.5;
  ctx.strokeRect(inset, inset, width - inset * 2, height - inset * 2);

  // Corner Accents (L-brackets)
  const cornerSize = 25;
  ctx.lineWidth = 3.5;

  // Top Left
  ctx.beginPath();
  ctx.moveTo(inset, inset + cornerSize);
  ctx.lineTo(inset, inset);
  ctx.lineTo(inset + cornerSize, inset);
  ctx.stroke();

  // Top Right
  ctx.beginPath();
  ctx.moveTo(width - inset - cornerSize, inset);
  ctx.lineTo(width - inset, inset);
  ctx.lineTo(width - inset, inset + cornerSize);
  ctx.stroke();

  // Bottom Left
  ctx.beginPath();
  ctx.moveTo(inset, height - inset - cornerSize);
  ctx.lineTo(inset, height - inset);
  ctx.lineTo(inset + cornerSize, height - inset);
  ctx.stroke();

  // Bottom Right
  ctx.beginPath();
  ctx.moveTo(width - inset - cornerSize, height - inset);
  ctx.lineTo(width - inset, height - inset);
  ctx.lineTo(width - inset, height - inset - cornerSize);
  ctx.stroke();

  ctx.restore();
}

// Helper to break text into multiple lines for canvas
function wrapTextLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const testWidth = ctx.measureText(testLine).width;

    if (testWidth > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines.length > 0 ? lines : [text];
}
