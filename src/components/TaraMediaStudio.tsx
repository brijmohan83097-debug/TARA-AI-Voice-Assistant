/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  Upload, 
  Camera, 
  Wand2, 
  Clock, 
  RefreshCw,
  Eye,
  FileText,
  X,
  SwitchCamera,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { AttachedMedia } from '../types';

interface TaraMediaStudioProps {
  onAnalyzeMedia: (file: File | string, prompt?: string) => void;
  onGenerateImagePrompt: (prompt: string) => void;
  onOpenTimerModal: () => void;
  attachedMedia?: AttachedMedia | null;
  onAttachMedia?: (media: AttachedMedia) => void;
  onClearMedia?: () => void;
}

export const TaraMediaStudio: React.FC<TaraMediaStudioProps> = ({
  onAnalyzeMedia,
  onGenerateImagePrompt,
  onOpenTimerModal,
  attachedMedia,
  onAttachMedia,
  onClearMedia,
}) => {
  const [prompt, setPrompt] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraFacing, setCameraFacing] = useState<'environment' | 'user'>('environment');
  const [cameraError, setCameraError] = useState<string | null>(null);

  const activePreviewUrl = localPreviewUrl || attachedMedia?.previewUrl || null;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Quick Vision & OCR Prompts
  const visionPrompts = [
    'इस फ़ोटो में क्या लिखा है? (OCR - Read Text)',
    'ये क्या दिख रहा है? पूरा विवरण दें',
    'दस्तावेज़ या बिल की मुख्य बातें बताएं',
    'Generate cyberpunk concept visual of Tara in 8k',
  ];

  // Stop camera stream safely
  const stopCameraStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
    setCameraError(null);
  };

  // Start device live camera
  const startCamera = async (facing: 'environment' | 'user' = cameraFacing) => {
    setCameraError(null);
    stopCameraStream();

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      // Fallback to file input with capture
      cameraInputRef.current?.click();
      return;
    }

    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: facing },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      setIsCameraActive(true);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }
    } catch (err: any) {
      console.warn('Camera access error:', err);
      setCameraError('कैमरा खोलने में असमर्थ। कृपया अनुमति दें या फ़ाइल अपलोड करें।');
      // Fallback to native input capture
      cameraInputRef.current?.click();
    }
  };

  useEffect(() => {
    return () => {
      stopCameraStream();
    };
  }, []);

  // Handle live photo snap from video feed
  const handleSnapPhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const fullDataUrl = canvas.toDataURL('image/jpeg', 0.9);
    const base64 = fullDataUrl.split(',')[1];

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `tara-snap-${Date.now()}.jpg`, { type: 'image/jpeg' });
        setSelectedFile(file);
      }
    }, 'image/jpeg', 0.9);

    setLocalPreviewUrl(fullDataUrl);
    onAttachMedia?.({
      data: base64,
      mimeType: 'image/jpeg',
      previewUrl: fullDataUrl,
      name: 'कैमरा फ़ोटो (Camera Snap)',
      source: 'camera',
    });

    if (!prompt.trim()) {
      setPrompt('इस फ़ोटो में क्या लिखा है और क्या दिख रहा है? विस्तार से बताएं।');
    }
    stopCameraStream();
  };

  // Handle live photo snap AND immediate visual analysis in one tap!
  const handleSnapAndAnalyzeNow = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const fullDataUrl = canvas.toDataURL('image/jpeg', 0.9);
    const base64 = fullDataUrl.split(',')[1];

    setLocalPreviewUrl(fullDataUrl);
    const media: AttachedMedia = {
      data: base64,
      mimeType: 'image/jpeg',
      previewUrl: fullDataUrl,
      name: `कैमरा फ़ोटो (${new Date().toLocaleTimeString('hi-IN')})`,
      source: 'camera',
    };
    onAttachMedia?.(media);

    const queryPrompt = prompt.trim() || 'इस फ़ोटो में क्या लिखा है और क्या दिख रहा है? कृपया OCR टेक्स्ट पढ़कर हिंदी में विस्तार से समझाएं।';
    
    stopCameraStream();
    setIsProcessing(true);
    onAnalyzeMedia(fullDataUrl, queryPrompt);

    setTimeout(() => {
      setIsProcessing(false);
      setSelectedFile(null);
      setLocalPreviewUrl(null);
      setPrompt('');
    }, 1500);
  };

  // Handle file input changes
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);

      const reader = new FileReader();
      reader.onload = () => {
        const fullDataUrl = reader.result as string;
        const base64 = fullDataUrl.split(',')[1];
        setLocalPreviewUrl(fullDataUrl);
        onAttachMedia?.({
          data: base64,
          mimeType: file.type || 'image/jpeg',
          previewUrl: fullDataUrl,
          name: file.name,
          source: 'upload',
        });
      };
      reader.readAsDataURL(file);

      if (!prompt.trim()) {
        setPrompt('इस फ़ोटो में क्या लिखा है और क्या दिख रहा है? विस्तार से बताएं।');
      }
    }
  };

  // Trigger Gemini Vision & OCR Analysis
  const handleTriggerAnalysis = () => {
    if (!selectedFile && !attachedMedia && !prompt.trim()) return;
    setIsProcessing(true);

    if (selectedFile) {
      onAnalyzeMedia(
        selectedFile,
        prompt.trim() || 'इस फ़ोटो में क्या लिखा है और क्या दिख रहा है? कृपया OCR टेक्स्ट पढ़कर हिंदी में समझाएं।'
      );
    } else if (attachedMedia) {
      onAnalyzeMedia(
        attachedMedia.previewUrl,
        prompt.trim() || 'इस फ़ोटो में क्या लिखा है और क्या दिख रहा है? कृपया OCR टेक्स्ट पढ़कर हिंदी में समझाएं।'
      );
    } else {
      onGenerateImagePrompt(prompt.trim());
    }

    setTimeout(() => {
      setIsProcessing(false);
      setSelectedFile(null);
      setLocalPreviewUrl(null);
      setPrompt('');
    }, 1500);
  };

  return (
    <div className="w-full rounded-2xl bg-[#091122]/95 border border-cyan-500/30 p-4 sm:p-5 shadow-[0_4px_25px_rgba(0,0,0,0.5)] backdrop-blur-md">
      {/* Studio Header */}
      <div className="flex items-center justify-between gap-3 mb-3.5 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-slate-950 font-bold shadow-[0_0_15px_rgba(0,240,255,0.4)]">
            <Sparkles className="w-5 h-5 text-slate-950" />
          </div>
          <div>
            <h3 className="font-heading font-bold text-sm sm:text-base text-slate-100 tracking-wide flex items-center gap-2">
              तारा विज़न एवं मीडिया स्टूडियो (Vision & OCR)
            </h3>
            <p className="text-[11px] text-slate-400 font-sans">
              Real-Time Camera OCR, document reading, photo analysis & spoken Hindi explanations
            </p>
          </div>
        </div>

        {/* Vision Engine Badge */}
        <div className="flex items-center gap-2">
          <div className="px-2.5 py-1 rounded-full bg-cyan-950/90 border border-cyan-500/50 text-[11px] font-mono text-cyan-300 font-bold shadow-[0_0_10px_rgba(0,240,255,0.2)] flex items-center gap-1.5">
            <Eye className="w-3 h-3 text-cyan-400" />
            <span>Gemini Vision & OCR</span>
          </div>
        </div>
      </div>

      {/* Live Camera Viewfinder Overlay (if camera active) */}
      {isCameraActive && (
        <div className="mb-3.5 p-3 rounded-xl bg-black/90 border border-cyan-500/40 relative flex flex-col items-center">
          <div className="relative w-full max-w-md h-56 sm:h-64 rounded-lg overflow-hidden bg-slate-950 flex items-center justify-center border border-cyan-500/30">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            {/* Viewfinder Target Frame */}
            <div className="absolute inset-4 border border-dashed border-cyan-400/60 rounded-lg pointer-events-none flex items-center justify-center">
              <span className="bg-slate-950/70 text-cyan-300 font-mono text-[10px] px-2 py-0.5 rounded">
                कैमरा दृश्य (Align Text / Document)
              </span>
            </div>
          </div>

          {/* Camera Controls */}
          <div className="mt-3 flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => {
                const next = cameraFacing === 'environment' ? 'user' : 'environment';
                setCameraFacing(next);
                startCamera(next);
              }}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono flex items-center gap-1.5 transition-all"
              title="Switch Front/Back Camera"
            >
              <SwitchCamera className="w-4 h-4 text-cyan-400" />
              <span>कैमरा बदलें</span>
            </button>

            {/* Primary 1-Tap Snap & Analyze */}
            <button
              onClick={handleSnapAndAnalyzeNow}
              disabled={isProcessing}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-400 via-cyan-500 to-blue-600 hover:from-cyan-300 hover:to-blue-500 text-slate-950 font-extrabold font-mono text-xs flex items-center gap-2 shadow-[0_0_20px_rgba(0,240,255,0.4)] active:scale-95 transition-all"
            >
              <Camera className="w-4 h-4 text-slate-950" />
              <span>फ़ोटो खींचें और तुरंत पूछें (Snap & Analyze)</span>
            </button>

            <button
              onClick={handleSnapPhoto}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 font-mono text-xs flex items-center gap-1.5 transition-all"
              title="केवल फ़ोटो जोड़ें (Attach Only)"
            >
              <span>सिर्फ जोड़ें</span>
            </button>

            <button
              onClick={stopCameraStream}
              className="p-2 rounded-xl bg-rose-950/80 hover:bg-rose-900 border border-rose-500/40 text-rose-300 text-xs font-mono flex items-center gap-1 transition-all"
            >
              <X className="w-4 h-4" />
              <span>बंद करें</span>
            </button>
          </div>
        </div>
      )}

      {cameraError && (
        <div className="mb-3 p-2.5 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{cameraError}</span>
        </div>
      )}

      {/* Media Input & Actions Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Left 2 Cols: Question Prompt & Preview */}
        <div className="lg:col-span-2 flex flex-col gap-2.5">
          <div className="relative">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="फोटो के बारे में पूछें (उदा. 'इस फोटो में क्या लिखा है?', 'दस्तावेज़ का हिसाब बताएं')..."
              rows={2}
              className="w-full rounded-xl bg-[#060c18] border border-cyan-500/20 p-3 text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-hidden focus:border-cyan-400 transition-colors font-sans resize-none"
            />
            {activePreviewUrl && (
              <div className="absolute right-3 bottom-3 flex items-center gap-2 bg-slate-900/95 border border-cyan-500/40 px-2.5 py-1 rounded-lg shadow-lg">
                <img src={activePreviewUrl} alt="Preview" className="w-7 h-7 object-cover rounded border border-cyan-400/40" />
                <span className="text-[10px] text-cyan-300 font-mono flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  फोटो जुड़ी हुई है
                </span>
                <button
                  onClick={() => {
                    setSelectedFile(null);
                    setLocalPreviewUrl(null);
                    onClearMedia?.();
                  }}
                  className="text-slate-400 hover:text-rose-400 text-xs ml-1 font-bold"
                  title="Remove image"
                >
                  ✕
                </button>
              </div>
            )}
          </div>

          {/* Quick Vision & OCR Prompt Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {visionPrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => setPrompt(p)}
                className="text-[10px] font-mono px-2.5 py-1 rounded-lg bg-slate-900/80 hover:bg-cyan-950/60 border border-slate-800 hover:border-cyan-500/40 text-slate-400 hover:text-cyan-200 shrink-0 transition-colors"
              >
                + {p}
              </button>
            ))}
          </div>
        </div>

        {/* Right Col: Upload, Camera & Analyze Actions */}
        <div className="flex flex-col gap-2 justify-between">
          {/* Hidden file & mobile camera capture inputs */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
          <input
            type="file"
            ref={cameraInputRef}
            onChange={handleFileChange}
            accept="image/*"
            capture="environment"
            className="hidden"
          />

          <div className="grid grid-cols-2 gap-2">
            {/* Live Camera Button */}
            <button
              onClick={() => startCamera('environment')}
              className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-slate-900 hover:bg-cyan-950/70 border border-slate-800 hover:border-cyan-500/40 text-xs font-mono text-slate-300 hover:text-cyan-300 transition-all active:scale-95"
            >
              <Camera className="w-4 h-4 text-cyan-400" />
              <span>कैमरा (Live)</span>
            </button>

            {/* Photo Upload Button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-slate-900 hover:bg-cyan-950/70 border border-slate-800 hover:border-cyan-500/40 text-xs font-mono text-slate-300 hover:text-cyan-300 transition-all active:scale-95"
            >
              <Upload className="w-4 h-4 text-blue-400" />
              <span>अपलोड (Photo)</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {/* Quick Timer Button */}
            <button
              onClick={onOpenTimerModal}
              className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-slate-900/80 hover:bg-cyan-950/70 border border-slate-800 hover:border-cyan-500/40 text-[11px] font-mono text-slate-300 hover:text-cyan-300 transition-all"
            >
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>टाइमर</span>
            </button>

            {/* OCR Mode Indicator */}
            <button
              onClick={() => setPrompt('इस फ़ोटो में लिखे सभी टेक्स्ट को OCR द्वारा स्पष्ट रूप से पढ़कर हिंदी में अर्थ बताएं।')}
              className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-cyan-950/40 hover:bg-cyan-950/70 border border-cyan-500/30 text-[11px] font-mono text-cyan-300 transition-all"
            >
              <FileText className="w-3.5 h-3.5 text-cyan-400" />
              <span>OCR पढ़ें</span>
            </button>
          </div>

          {/* Submit Vision / OCR Button */}
          <button
            onClick={handleTriggerAnalysis}
            disabled={isProcessing || (!selectedFile && !prompt.trim())}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 text-slate-950 font-bold text-xs font-mono tracking-wider uppercase transition-all shadow-[0_0_15px_rgba(0,240,255,0.3)] flex items-center justify-center gap-2 active:scale-98"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                <span>तारा OCR व विश्लेषण कर रही है...</span>
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4 text-slate-950" />
                <span>Analyze / OCR Read Text</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
