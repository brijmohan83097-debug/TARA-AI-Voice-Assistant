/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  Camera, 
  X, 
  SwitchCamera, 
  Sparkles, 
  Upload, 
  Check, 
  RotateCcw,
  Zap,
  Image as ImageIcon,
  AlertCircle
} from 'lucide-react';
import { AttachedMedia } from '../types';
import { audioSynth } from '../utils/audio';

interface TaraLiveCameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPhotoCaptured: (media: AttachedMedia, prompt?: string) => void;
}

export const TaraLiveCameraModal: React.FC<TaraLiveCameraModalProps> = ({
  isOpen,
  onClose,
  onPhotoCaptured,
}) => {
  const [cameraFacing, setCameraFacing] = useState<'environment' | 'user'>('environment');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedPhotoUrl, setCapturedPhotoUrl] = useState<string | null>(null);
  const [capturedBase64, setCapturedBase64] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isFlashActive, setIsFlashActive] = useState<boolean>(false);
  const [customQuestion, setCustomQuestion] = useState<string>('तारा, इस फ़ोटो को देखकर बताओ इसमें क्या दिख रहा है?');

  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Start camera when modal opens
  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      setCapturedPhotoUrl(null);
      setCapturedBase64(null);
      return;
    }

    startCamera(cameraFacing);

    return () => {
      stopCamera();
    };
  }, [isOpen, cameraFacing]);

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  const startCamera = async (facing: 'environment' | 'user') => {
    setCameraError(null);
    stopCamera();

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError('आपके ब्राउज़र में वेबकैम उपलब्ध नहीं है। आप नीचे दिए गए बटन से फ़ाइल अपलोड कर सकते हैं।');
      return;
    }

    try {
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facing },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      setStream(newStream);
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
        videoRef.current.play().catch(() => {});
      }
    } catch (err: any) {
      console.warn('Camera stream error:', err);
      setCameraError('कैमरा शुरू नहीं हो पाया। कृपया कैमरा परमिशन (अनुमति) दें या फ़ाइल से फ़ोटो चुनें।');
    }
  };

  // Switch between front and back camera
  const handleToggleCameraFacing = () => {
    audioSynth.playSciFiClick();
    const nextFacing = cameraFacing === 'environment' ? 'user' : 'environment';
    setCameraFacing(nextFacing);
  };

  // Snap photo from live video feed
  const handleSnapPhoto = () => {
    if (!videoRef.current) return;
    audioSynth.playCameraShutter();

    // Trigger visual camera flash
    setIsFlashActive(true);
    setTimeout(() => setIsFlashActive(false), 200);

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Flip horizontal if selfie/user camera
    if (cameraFacing === 'user') {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
    const base64Data = dataUrl.split(',')[1] || '';

    setCapturedPhotoUrl(dataUrl);
    setCapturedBase64(base64Data);
  };

  // Retake photo
  const handleRetake = () => {
    audioSynth.playSciFiClick();
    setCapturedPhotoUrl(null);
    setCapturedBase64(null);
    if (!stream) {
      startCamera(cameraFacing);
    }
  };

  // Send captured photo to TARA
  const handleConfirmPhoto = (promptText?: string) => {
    if (!capturedPhotoUrl || !capturedBase64) return;
    audioSynth.playSuccess();

    const media: AttachedMedia = {
      name: `tara-snap-${Date.now()}.jpg`,
      previewUrl: capturedPhotoUrl,
      data: capturedBase64,
      mimeType: 'image/jpeg',
      source: 'camera',
    };

    onPhotoCaptured(media, promptText || customQuestion);
    onClose();
  };

  // Fallback / alternate direct file picker
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    audioSynth.playReceive();
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1] || '';
      setCapturedPhotoUrl(result);
      setCapturedBase64(base64);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#030917] border-2 border-cyan-400/60 rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(0,240,255,0.35)] flex flex-col max-h-[92vh]">
        {/* Sci-Fi Corner Accents */}
        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-cyan-300 z-30 pointer-events-none shadow-[0_0_8px_#00f0ff]" />
        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-cyan-300 z-30 pointer-events-none shadow-[0_0_8px_#00f0ff]" />
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-cyan-300 z-30 pointer-events-none shadow-[0_0_8px_#00f0ff]" />
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-cyan-300 z-30 pointer-events-none shadow-[0_0_8px_#00f0ff]" />

        {/* Modal Header */}
        <div className="px-4 py-3 bg-[#061228] border-b border-cyan-500/30 flex items-center justify-between z-20">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-400/60 flex items-center justify-center text-cyan-300 shadow-[0_0_12px_rgba(0,240,255,0.4)]">
              <Camera className="w-4 h-4 text-cyan-300" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold font-mono text-cyan-200">
                📷 तारा लाइव कैमरा (Live Camera & Snap)
              </h2>
              <p className="text-[10px] text-cyan-400/70 font-mono">
                फोटो खींचें और तारा से तुरंत दोस्ताना बातचीत व विश्लेषण पूछें
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              audioSynth.playSciFiClick();
              onClose();
            }}
            className="p-1.5 rounded-lg bg-slate-900/80 hover:bg-rose-950 border border-slate-700 hover:border-rose-500/50 text-slate-300 hover:text-rose-200 cursor-pointer transition-colors"
            title="बंद करें (Close)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Camera Viewfinder / Photo Preview Body */}
        <div className="relative flex-1 min-h-[300px] sm:min-h-[380px] bg-black flex items-center justify-center overflow-hidden">
          {/* Visual Camera Flash Animation */}
          {isFlashActive && (
            <div className="absolute inset-0 bg-white z-40 animate-out fade-out duration-200 pointer-events-none" />
          )}

          {capturedPhotoUrl ? (
            /* Captured Photo Preview Mode */
            <div className="relative w-full h-full flex flex-col items-center justify-center p-2 bg-[#020612]">
              <img
                src={capturedPhotoUrl}
                alt="Captured Snapshot"
                className="max-h-[50vh] sm:max-h-[55vh] w-auto max-w-full rounded-xl object-contain border border-cyan-400/40 shadow-2xl"
              />
              <div className="absolute top-4 left-4 px-2.5 py-1 rounded bg-black/70 border border-cyan-400/50 text-[10px] font-mono text-cyan-300 flex items-center gap-1.5">
                <Check className="w-3 h-3 text-emerald-400" />
                <span>फ़ोटो कैप्चर हो गई</span>
              </div>
            </div>
          ) : cameraError ? (
            /* Error & File Upload Fallback */
            <div className="p-6 text-center max-w-md flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-rose-950/80 border border-rose-500/60 flex items-center justify-center text-rose-300">
                <AlertCircle className="w-6 h-6" />
              </div>
              <p className="text-xs sm:text-sm text-slate-300 font-mono">
                {cameraError}
              </p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold font-mono text-xs flex items-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(0,240,255,0.4)]"
              >
                <Upload className="w-4 h-4" />
                <span>फ़ाइल से फ़ोटो चुनें (Upload from File)</span>
              </button>
            </div>
          ) : (
            /* Live Camera Stream Viewfinder */
            <div className="relative w-full h-full flex items-center justify-center">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full max-h-[55vh] object-cover sm:object-contain ${
                  cameraFacing === 'user' ? 'scale-x-[-1]' : ''
                }`}
              />

              {/* Sci-Fi Viewfinder Targeting Reticle */}
              <div className="absolute inset-8 sm:inset-12 border border-cyan-400/30 rounded-xl pointer-events-none flex items-center justify-center">
                <div className="w-8 h-8 border-t-2 border-l-2 border-cyan-400 absolute top-0 left-0" />
                <div className="w-8 h-8 border-t-2 border-r-2 border-cyan-400 absolute top-0 right-0" />
                <div className="w-8 h-8 border-b-2 border-l-2 border-cyan-400 absolute bottom-0 left-0" />
                <div className="w-8 h-8 border-b-2 border-r-2 border-cyan-400 absolute bottom-0 right-0" />
                <div className="w-12 h-0.5 bg-cyan-400/40 absolute" />
                <div className="h-12 w-0.5 bg-cyan-400/40 absolute" />
                <span className="text-[10px] font-mono text-cyan-400/60 absolute bottom-2 tracking-widest">
                  [LIVE CAMERA • 1080P VIEW]
                </span>
              </div>
            </div>
          )}

          {/* Hidden File Input for Direct Gallery Alternative */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {/* Modal Footer Controls */}
        <div className="p-3 sm:p-4 bg-[#050f24] border-t border-cyan-500/25 flex flex-col gap-2.5 z-20">
          {capturedPhotoUrl ? (
            /* Controls after photo is clicked */
            <div className="flex flex-col gap-2.5">
              {/* Question / Prompt Input */}
              <div className="flex items-center gap-2 bg-[#020612] border border-cyan-500/30 rounded-xl px-3 py-1.5 text-xs font-mono">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <input
                  type="text"
                  value={customQuestion}
                  onChange={(e) => setCustomQuestion(e.target.value)}
                  placeholder="तारा से क्या पूछना चाहते हैं? (उदा. मेरी फोटो कैसी लग रही है?)"
                  className="w-full bg-transparent text-slate-100 placeholder:text-slate-500 focus:outline-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={handleRetake}
                  className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-mono text-xs flex items-center gap-1.5 cursor-pointer transition-all"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
                  <span>दोबारा खींचो (Retake)</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleConfirmPhoto('तारा, इस फ़ोटो को देखकर बताओ इसमें क्या लिखा है? पूरा पढ़कर सुनाओ।')}
                    className="px-3 py-2 rounded-xl bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-200 font-mono text-xs flex items-center gap-1 cursor-pointer transition-all hidden sm:flex"
                  >
                    <span>📖 टेक्स्ट पढ़ो</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleConfirmPhoto(customQuestion)}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-bold font-mono text-xs flex items-center gap-1.5 cursor-pointer shadow-[0_0_20px_rgba(0,240,255,0.4)] transition-all hover:scale-105 active:scale-95"
                  >
                    <Sparkles className="w-4 h-4 text-slate-950" />
                    <span>तारा से इस फोटो के बारे में पूछें</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Live Camera Capture Controls */
            <div className="flex items-center justify-between gap-2">
              {/* Option to switch camera facing */}
              <button
                type="button"
                onClick={handleToggleCameraFacing}
                className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 font-mono text-xs flex items-center gap-1.5 cursor-pointer transition-all"
                title="कैमरा बदलो (Front / Back Camera)"
              >
                <SwitchCamera className="w-4 h-4 text-cyan-400" />
                <span className="hidden sm:inline">
                  {cameraFacing === 'environment' ? 'बैक कैमरा' : 'फ्रंट कैमरा'}
                </span>
              </button>

              {/* Big Prominent Shutter Snap Button */}
              <button
                type="button"
                onClick={handleSnapPhoto}
                className="px-6 py-2.5 rounded-full bg-gradient-to-r from-cyan-500 via-sky-400 to-emerald-400 hover:from-cyan-400 hover:to-emerald-300 text-slate-950 font-black font-mono text-sm flex items-center gap-2 cursor-pointer shadow-[0_0_25px_rgba(0,240,255,0.6)] transition-all hover:scale-105 active:scale-95"
              >
                <Camera className="w-5 h-5 text-slate-950" />
                <span>📸 फ़ोटो खींचो (Snap Photo)</span>
              </button>

              {/* Quick file upload button from within camera modal */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 font-mono text-xs flex items-center gap-1.5 cursor-pointer transition-all"
                title="गैलरी या फ़ाइल से चुनें (Upload File)"
              >
                <Upload className="w-4 h-4 text-cyan-400" />
                <span className="hidden sm:inline">फ़ाइल से चुनें</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
