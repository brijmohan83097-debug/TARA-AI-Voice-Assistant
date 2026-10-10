/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Camera, 
  SwitchCamera, 
  Upload, 
  RotateCcw, 
  Zap, 
  Video, 
  VideoOff, 
  Maximize2, 
  Minimize2,
  Scan,
  Send,
  Eye,
  RefreshCw,
  ShieldCheck,
  ShieldAlert,
  UserCheck,
  UserX,
  Volume2,
  HeartPulse,
  Activity,
  Sparkles,
  Coffee,
  CheckCircle2,
  Lock
} from 'lucide-react';
import { AttachedMedia } from '../types';
import { audioSynth } from '../utils/audio';
import { speechEngine } from '../utils/speech';

export interface FaceSecurityState {
  status: 'idle' | 'scanning' | 'owner_verified' | 'stranger_detected' | 'no_face';
  isOwner: boolean;
  isStranger: boolean;
  mood?: string;
  isTiredOrSad?: boolean;
  wellnessMessage?: string;
  ownerLocation: string;
  confidence: number;
  lastCheckedTime?: string;
  spokenMessage?: string;
}

interface TaraLiveCameraWidgetProps {
  onPhotoCaptured: (media: AttachedMedia, prompt?: string) => void;
  onSecurityStatusChange?: (status: FaceSecurityState) => void;
  onStrangerAlert?: (message: string) => void;
  className?: string;
}

export const TaraLiveCameraWidget: React.FC<TaraLiveCameraWidgetProps> = ({
  onPhotoCaptured,
  onSecurityStatusChange,
  onStrangerAlert,
  className = '',
}) => {
  const [isActive, setIsActive] = useState<boolean>(true); // Auto-start background stealth camera
  const [cameraFacing, setCameraFacing] = useState<'environment' | 'user'>('user');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedPhotoUrl, setCapturedPhotoUrl] = useState<string | null>(null);
  const [capturedBase64, setCapturedBase64] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isFlashActive, setIsFlashActive] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [customPrompt, setCustomPrompt] = useState<string>('तारा, बैकग्राउंड कैमरे से ली गई इस फ़ोटो का विश्लेषण करें।');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);

  // --- Secret Face Security & Mood AI State ---
  const [securityState, setSecurityState] = useState<FaceSecurityState>({
    status: 'idle',
    isOwner: true,
    isStranger: false,
    mood: 'focused',
    isTiredOrSad: false,
    wellnessMessage: '',
    ownerLocation: 'बॉस कैमरे के सामने उपस्थित हैं',
    confidence: 0.95,
  });
  const [isSecurityScanning, setIsSecurityScanning] = useState<boolean>(false);
  const [isAutoFaceScanEnabled, setIsAutoFaceScanEnabled] = useState<boolean>(true);
  const [strangerAlertBanner, setStrangerAlertBanner] = useState<string | null>(null);
  const [wellnessCareAlert, setWellnessCareAlert] = useState<string | null>(null);

  // Secret video element: runs quietly in background, never displayed on screen
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const autoScanTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastSpokenStrangerRef = useRef<number>(0);
  const lastSpokenWellnessRef = useRef<number>(0);

  // Stop media stream tracks
  const stopStream = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  }, [stream]);

  // Start media stream in background
  const startCamera = useCallback(async (facing: 'environment' | 'user') => {
    setCameraError(null);
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError('ब्राउज़र में कैमरा सपोर्ट उपलब्ध नहीं है।');
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
      setIsActive(true);
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
        videoRef.current.play().catch(() => {});
      }
    } catch (err: any) {
      console.warn('Background stealth camera stream error:', err);
      setCameraError('कैमरा परमिशन दें ताकि बैकग्राउंड सिक्योरिटी गार्ड काम कर सके।');
      setIsActive(false);
    }
  }, [stream]);

  // Capture current background video frame as base64 jpeg
  const captureCurrentFrameBase64 = useCallback((): string | null => {
    if (!videoRef.current || !videoRef.current.videoWidth) return null;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = Math.min(video.videoWidth || 640, 800);
    canvas.height = Math.min(video.videoHeight || 480, 600);
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    if (cameraFacing === 'user') {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
    return dataUrl.split(',')[1] || null;
  }, [cameraFacing]);

  // Perform AI Face Security & Mood Scan
  const runFaceSecurityCheck = useCallback(async (manualTrigger = false, customQuestion = false) => {
    const frameBase64 = captureCurrentFrameBase64();
    if (!frameBase64) return;

    setIsSecurityScanning(true);
    if (manualTrigger) {
      audioSynth.playSciFiCommand();
    }

    try {
      const res = await fetch('/api/face-security', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: frameBase64,
          isQueryingBoss: customQuestion,
        }),
      });

      if (!res.ok) throw new Error('Security check request failed');
      const json = await res.json();
      const data = json.data;

      if (data) {
        let newStatus: FaceSecurityState['status'] = 'no_face';
        if (data.faceDetected) {
          if (data.isStranger) {
            newStatus = 'stranger_detected';
          } else if (data.isOwner) {
            newStatus = 'owner_verified';
          }
        }

        const isTiredOrSad = Boolean(data.isTiredOrSad);
        const newState: FaceSecurityState = {
          status: newStatus,
          isOwner: Boolean(data.isOwner),
          isStranger: Boolean(data.isStranger),
          mood: data.mood || 'focused',
          isTiredOrSad,
          wellnessMessage: data.wellnessMessage,
          ownerLocation: data.ownerLocation || 'बॉस कैमरे के सामने उपस्थित हैं',
          confidence: data.confidence || 0.9,
          lastCheckedTime: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          spokenMessage: data.spokenMessage,
        };

        setSecurityState(newState);
        onSecurityStatusChange?.(newState);

        // Security rule: Agar koi anjaan vyakti aaye toh TARA bole: "Aap mere boss nahi hain"
        if (data.isStranger) {
          setStrangerAlertBanner('अंजान व्यक्ति डिटेक्ट हुआ! TARA: "आप मेरे बॉस नहीं हैं।"');
          setWellnessCareAlert(null);
          const now = Date.now();
          if (manualTrigger || now - lastSpokenStrangerRef.current > 15000) {
            lastSpokenStrangerRef.current = now;
            audioSynth.playError();
            speechEngine.speak('आप मेरे बॉस नहीं हैं।', true);
            onStrangerAlert?.('आप मेरे बॉस नहीं हैं।');
          }
        } else if (data.isOwner) {
          setStrangerAlertBanner(null);

          // Mood & Health Judgment Rule:
          // Agar chehra thaka ya udaas lage toh bole: "Boss, tabiyat theek nahi hai kya? Aaram kar lijiye."
          if (isTiredOrSad) {
            const careMsg = 'Boss, tabiyat theek nahi hai kya? Aaram kar lijiye.';
            setWellnessCareAlert(careMsg);
            const now = Date.now();
            if (manualTrigger || now - lastSpokenWellnessRef.current > 35000) {
              lastSpokenWellnessRef.current = now;
              audioSynth.playSuccess();
              speechEngine.speak(careMsg, true);
            }
          } else {
            setWellnessCareAlert(null);
            if (manualTrigger) {
              audioSynth.playSuccess();
              speechEngine.speak(data.spokenMessage || 'Hello Boss! Kaise hain aap?', true);
            }
          }
        }
      }
    } catch (err) {
      console.warn('Face security error:', err);
    } finally {
      setIsSecurityScanning(false);
    }
  }, [captureCurrentFrameBase64, onSecurityStatusChange, onStrangerAlert]);

  // Test Tired/Sad Mood trigger explicitly
  const handleTestTiredMood = () => {
    audioSynth.playSciFiClick();
    const careMsg = 'Boss, tabiyat theek nahi hai kya? Aaram kar lijiye.';
    setWellnessCareAlert(careMsg);
    setSecurityState((prev) => ({
      ...prev,
      mood: 'tired',
      isTiredOrSad: true,
      wellnessMessage: careMsg,
      spokenMessage: careMsg,
    }));
    speechEngine.speak(careMsg, true);
  };

  // Stranger Alert Trigger: "Koi anjaan vyakti samne aaye toh TARA bole: 'Aap mere Boss nahi hain' aur command band kare"
  const handleTestStrangerAlert = () => {
    audioSynth.playError();
    const alertMsg = 'आप मेरे बॉस नहीं हैं।';
    setStrangerAlertBanner('अंजान व्यक्ति डिटेक्ट हुआ! TARA: "आप मेरे बॉस नहीं हैं।" (कमांड्स बंद)');
    setWellnessCareAlert(null);
    const newState: FaceSecurityState = {
      status: 'stranger_detected',
      isOwner: false,
      isStranger: true,
      mood: 'unknown',
      isTiredOrSad: false,
      wellnessMessage: '',
      ownerLocation: 'अनजान व्यक्ति कैमरे के सामने मौजूद है - कमांड्स बंद',
      confidence: 0.99,
      lastCheckedTime: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      spokenMessage: alertMsg,
    };
    setSecurityState(newState);
    onSecurityStatusChange?.(newState);
    speechEngine.speak(alertMsg, true);
    onStrangerAlert?.(alertMsg);
  };

  // Verify / Restore Boss Access: Unlocks commands and greets Boss
  const handleVerifyBossAccess = () => {
    audioSynth.playSuccess();
    setStrangerAlertBanner(null);
    setWellnessCareAlert(null);
    const newState: FaceSecurityState = {
      status: 'owner_verified',
      isOwner: true,
      isStranger: false,
      mood: 'focused',
      isTiredOrSad: false,
      wellnessMessage: '',
      ownerLocation: 'बॉस कैमरे के सामने उपस्थित हैं',
      confidence: 0.99,
      lastCheckedTime: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      spokenMessage: 'Hello Boss! Kaise hain aap?',
    };
    setSecurityState(newState);
    onSecurityStatusChange?.(newState);
    speechEngine.speak('Hello Boss! Kaise hain aap?', true);
  };

  // Expose "Mujhe dekho" trigger listener via custom window event
  useEffect(() => {
    const handleVoiceSecurityTrigger = (e: Event) => {
      const customEvent = e as CustomEvent;
      const detail = customEvent.detail;
      if (detail?.command === 'mujhe_dekho') {
        runFaceSecurityCheck(true, true);
      }
    };

    window.addEventListener('tara-face-security-check', handleVoiceSecurityTrigger);
    return () => {
      window.removeEventListener('tara-face-security-check', handleVoiceSecurityTrigger);
    };
  }, [runFaceSecurityCheck]);

  // Continuous background stealth security loop (every 8s)
  useEffect(() => {
    if (!isActive || !isAutoFaceScanEnabled) {
      if (autoScanTimerRef.current) clearInterval(autoScanTimerRef.current);
      return;
    }

    // Initial check after 3 seconds of background camera mount
    const initialTimer = setTimeout(() => {
      runFaceSecurityCheck(false, false);
    }, 3000);

    autoScanTimerRef.current = setInterval(() => {
      if (!isAnalyzing && isActive) {
        runFaceSecurityCheck(false, false);
      }
    }, 8500);

    return () => {
      clearTimeout(initialTimer);
      if (autoScanTimerRef.current) clearInterval(autoScanTimerRef.current);
    };
  }, [isActive, isAutoFaceScanEnabled, isAnalyzing, runFaceSecurityCheck]);

  // Initial auto-mount background camera
  useEffect(() => {
    startCamera(cameraFacing);
    return () => {
      stopStream();
    };
  }, []);

  // Switch facing mode
  const handleToggleFacing = () => {
    audioSynth.playSciFiClick();
    const next = cameraFacing === 'user' ? 'environment' : 'user';
    setCameraFacing(next);
    if (isActive) {
      startCamera(next);
    }
  };

  // Toggle Camera on/off
  const handleToggleCamera = () => {
    audioSynth.playSciFiClick();
    if (isActive) {
      stopStream();
      setIsActive(false);
    } else {
      startCamera(cameraFacing);
    }
  };

  // Snap photo from background camera for query analysis
  const handleSnap = () => {
    if (!videoRef.current) return;
    audioSynth.playCameraShutter();

    setIsFlashActive(true);
    setTimeout(() => setIsFlashActive(false), 200);

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

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

  // File upload fallback
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    audioSynth.playSuccess();
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        const base64Data = dataUrl.split(',')[1] || '';
        setCapturedPhotoUrl(dataUrl);
        setCapturedBase64(base64Data);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Send photo to TARA for AI analysis
  const handleSendToTara = (promptText?: string) => {
    if (!capturedPhotoUrl || !capturedBase64) return;
    audioSynth.playSuccess();
    setIsAnalyzing(true);

    const finalPrompt = promptText || customPrompt || 'तारा, इस फ़ोटो का विश्लेषण करें।';
    const media: AttachedMedia = {
      data: capturedBase64,
      mimeType: 'image/jpeg',
      name: `TARA_STEALTH_SNAP_${Date.now()}.jpg`,
      previewUrl: capturedPhotoUrl,
      source: 'camera',
    };

    onPhotoCaptured(media, finalPrompt);

    setTimeout(() => {
      setIsAnalyzing(false);
      setCapturedPhotoUrl(null);
      setCapturedBase64(null);
    }, 800);
  };

  // Retake
  const handleRetake = () => {
    audioSynth.playSciFiClick();
    setCapturedPhotoUrl(null);
    setCapturedBase64(null);
    if (!stream) {
      startCamera(cameraFacing);
    }
  };

  return (
    <div
      className={`relative flex flex-col bg-[#050c1b]/95 border rounded-xl overflow-hidden backdrop-blur-md shadow-[0_0_30px_rgba(0,240,255,0.15)] transition-all ${
        securityState.isStranger
          ? 'border-rose-500 shadow-[0_0_35px_rgba(244,63,94,0.35)]'
          : securityState.isTiredOrSad
          ? 'border-amber-400 shadow-[0_0_30px_rgba(245,158,11,0.3)]'
          : 'border-cyan-500/40'
      } ${
        isExpanded ? 'fixed inset-4 z-50' : 'h-full'
      } ${className}`}
    >
      {/* 
        CRITICAL REQUIREMENT 1:
        Camera video box is completely hidden from the display! 
        Screen par chehra nahi dikhega. 
        HTML5 video runs offscreen so frames are extracted in memory for AI face/mood scanning without showing any visual video on screen.
      */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="fixed -top-[9999px] -left-[9999px] w-[320px] h-[240px] opacity-0 pointer-events-none"
      />

      {/* Header bar */}
      <div className={`px-3 py-2 border-b flex items-center justify-between gap-2 shrink-0 transition-colors ${
        securityState.isStranger
          ? 'bg-rose-950/80 border-rose-500/50'
          : securityState.isTiredOrSad
          ? 'bg-amber-950/60 border-amber-500/40'
          : 'bg-[#020712] border-cyan-500/30'
      }`}>
        <div className="flex items-center gap-2 min-w-0">
          <div className="relative flex items-center justify-center">
            {securityState.isStranger ? (
              <ShieldAlert className="w-4 h-4 text-rose-400 animate-bounce" />
            ) : securityState.isTiredOrSad ? (
              <HeartPulse className="w-4 h-4 text-amber-400 animate-pulse" />
            ) : (
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            )}
            {isActive && (
              <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />
            )}
          </div>
          <span className="text-xs font-mono font-bold tracking-wider text-cyan-200 uppercase truncate">
            TARA • Secret Vision & Mood
          </span>
          {isActive ? (
            <span className="px-1.5 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-[9px] font-mono font-bold uppercase tracking-wider flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              STEALTH CAM
            </span>
          ) : (
            <span className="px-1.5 py-0.5 rounded bg-slate-800/80 border border-slate-600/50 text-slate-300 text-[9px] font-mono">
              STANDBY
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          {/* Manual "Mujhe Dekho" Face & Mood Scan button */}
          <button
            type="button"
            onClick={() => runFaceSecurityCheck(true, true)}
            disabled={!isActive || isSecurityScanning}
            className={`px-2 py-0.5 rounded border text-[10px] font-mono font-bold flex items-center gap-1 cursor-pointer transition-all ${
              securityState.isStranger
                ? 'bg-rose-900 hover:bg-rose-800 border-rose-400 text-rose-100 animate-pulse'
                : 'bg-emerald-950/80 hover:bg-emerald-900 border-emerald-500/60 text-emerald-300'
            }`}
            title="मुझे देखो - बॉस की पहचान एवं मूड जांच करें"
          >
            {isSecurityScanning ? (
              <RefreshCw className="w-3 h-3 animate-spin" />
            ) : (
              <Eye className="w-3 h-3 text-emerald-400" />
            )}
            <span>मुझे देखो</span>
          </button>

          {/* Test Tired/Sad Mood Quick Button */}
          <button
            type="button"
            onClick={handleTestTiredMood}
            className="px-1.5 py-0.5 rounded bg-amber-950/70 hover:bg-amber-900 border border-amber-500/40 text-amber-300 text-[10px] font-mono flex items-center gap-1 cursor-pointer transition-colors"
            title="थकान/उदासी मूड टेस्ट करें: 'Boss, tabiyat theek nahi hai kya? Aaram kar lijiye.'"
          >
            <Coffee className="w-3 h-3 text-amber-300" />
            <span className="hidden sm:inline">मूड टेस्ट</span>
          </button>

          {/* Stranger Alert & Boss Verify Quick Buttons */}
          {securityState.isStranger ? (
            <button
              type="button"
              onClick={handleVerifyBossAccess}
              className="px-2 py-0.5 rounded bg-emerald-600 hover:bg-emerald-500 border border-emerald-300 text-white text-[10px] font-mono font-bold flex items-center gap-1 cursor-pointer animate-pulse"
              title="बॉस वेरीफाई करें और अनलॉक करें"
            >
              <UserCheck className="w-3 h-3 text-white" />
              <span>बॉस अनलॉक</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleTestStrangerAlert}
              className="px-1.5 py-0.5 rounded bg-rose-950/70 hover:bg-rose-900 border border-rose-500/40 text-rose-300 text-[10px] font-mono flex items-center gap-1 cursor-pointer transition-colors"
              title="अंजान व्यक्ति अलर्ट टेस्ट: TARA बोलेगी 'आप मेरे बॉस नहीं हैं।' और कमांड्स बंद करेगी"
            >
              <UserX className="w-3 h-3 text-rose-400" />
              <span className="hidden sm:inline">अंजान अलर्ट</span>
            </button>
          )}

          {/* Flip camera */}
          <button
            type="button"
            onClick={handleToggleFacing}
            className="p-1 rounded bg-slate-900/80 hover:bg-cyan-950 border border-cyan-500/30 text-cyan-300 text-[10px] cursor-pointer transition-colors"
            title={`कैमरा स्विच (${cameraFacing === 'user' ? 'फ्रंट' : 'बैक'})`}
          >
            <SwitchCamera className="w-3.5 h-3.5" />
          </button>

          {/* Toggle stream */}
          <button
            type="button"
            onClick={handleToggleCamera}
            className={`px-2 py-0.5 rounded border text-[10px] font-mono font-bold flex items-center gap-1 cursor-pointer transition-all ${
              isActive
                ? 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-300'
                : 'bg-cyan-950/80 hover:bg-cyan-900 border-cyan-500/50 text-cyan-200'
            }`}
          >
            {isActive ? <VideoOff className="w-3 h-3 text-slate-400" /> : <Video className="w-3 h-3 text-cyan-400" />}
            <span>{isActive ? 'बंद' : 'चालू'}</span>
          </button>

          {/* Maximize toggle */}
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 rounded bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-300 text-[10px] cursor-pointer"
            title={isExpanded ? 'छोटा करें' : 'बड़ा करें'}
          >
            {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* STRANGER WARNING BANNER (Rule: Agar anjaan vyakti aaye toh TARA: "आप मेरे बॉस नहीं हैं।" aur command band kare) */}
      {strangerAlertBanner && (
        <div className="bg-rose-700 text-white px-3 py-1.5 flex items-center justify-between text-xs font-mono font-bold animate-pulse shadow-lg border-b border-rose-400">
          <div className="flex items-center gap-2">
            <UserX className="w-4 h-4 text-white shrink-0" />
            <div className="flex flex-col">
              <span>⚠️ {strangerAlertBanner}</span>
              <span className="text-[10px] text-rose-100 font-normal">कमांड्स स्वतः बंद कर दिए गए हैं।</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => speechEngine.speak('आप मेरे बॉस नहीं हैं।', true)}
              className="px-2 py-0.5 rounded bg-black/40 hover:bg-black/60 text-white text-[10px] flex items-center gap-1 cursor-pointer"
              title="पुनः बोलें: आप मेरे बॉस नहीं हैं।"
            >
              <Volume2 className="w-3 h-3" />
              <span>बोलें</span>
            </button>
            <button
              type="button"
              onClick={handleVerifyBossAccess}
              className="px-2 py-0.5 rounded bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-[10px] font-black flex items-center gap-1 cursor-pointer shadow-md"
              title="बॉस वेरीफाई करें और अनलॉक करें"
            >
              <UserCheck className="w-3 h-3" />
              <span>बॉस अनलॉक</span>
            </button>
          </div>
        </div>
      )}

      {/* WELLNESS & MOOD CARE BANNER (Rule 3: Chehra thaka/udaas lage toh bole: "Boss, tabiyat theek nahi hai kya? Aaram kar lijiye.") */}
      {wellnessCareAlert && !strangerAlertBanner && (
        <div className="bg-amber-600/90 text-slate-950 px-3 py-1.5 flex items-center justify-between text-xs font-mono font-bold shadow-md animate-pulse">
          <div className="flex items-center gap-2">
            <Coffee className="w-4 h-4 text-slate-950" />
            <span>🩺 TARA केयर: "{wellnessCareAlert}"</span>
          </div>
          <button
            type="button"
            onClick={() => speechEngine.speak('Boss, tabiyat theek nahi hai kya? Aaram kar lijiye.', true)}
            className="px-2 py-0.5 rounded bg-black/20 hover:bg-black/30 text-slate-950 text-[10px] flex items-center gap-1 cursor-pointer font-bold"
          >
            <Volume2 className="w-3 h-3" />
            <span>सुनें</span>
          </button>
        </div>
      )}

      {/* 
        MAIN DISPLAY AREA: 
        SCREEN PAR CHEHRA / VIDEO NAHI DIKHEGA!
        Instead, a futuristic Biometric Mood & Stealth Sentinel HUD Radar is shown.
      */}
      <div className="relative flex-1 min-h-[220px] bg-[#02050e] flex flex-col items-center justify-center p-3 overflow-hidden">
        {/* Flash animation */}
        {isFlashActive && (
          <div className="absolute inset-0 bg-white z-40 animate-out fade-out duration-200 pointer-events-none" />
        )}

        {/* Captured Photo Preview (Only shown if user explicitly took a snap or uploaded an image) */}
        {capturedPhotoUrl ? (
          <div className="relative w-full h-full flex items-center justify-center bg-black rounded-lg overflow-hidden border border-cyan-500/30">
            <img
              src={capturedPhotoUrl}
              alt="TARA Captured Snap"
              className="w-full h-full object-contain"
            />
            <div className="absolute top-2 left-2 px-2 py-1 rounded bg-cyan-950/90 border border-cyan-400 text-cyan-200 text-[10px] font-mono font-bold">
              ✓ SNAP CAPTURED
            </div>
          </div>
        ) : (
          /* HIGH-TECH BIOMETRIC RADAR & MOOD SENTINEL INTERFACE (NO FACE VIDEO DISPLAYED) */
          <div className="w-full h-full flex flex-col justify-between py-1 relative z-10">
            {/* Top Status & Stealth Badge */}
            <div className="flex items-center justify-between gap-2 px-1">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-[10px] font-mono font-bold text-emerald-300">
                  सीक्रेट कैमरा: बैकग्राउंड में सक्रिय
                </span>
              </div>
              <div className="text-[9px] font-mono text-cyan-400/80 bg-cyan-950/50 px-2 py-0.5 rounded border border-cyan-500/30">
                🔒 स्क्रीन पर वीडियो छिपा हुआ है
              </div>
            </div>

            {/* Central Biometric Scanning Radar Visualizer */}
            <div className="relative my-auto flex flex-col items-center justify-center">
              {/* Radar rings */}
              <div className="relative w-28 h-28 flex items-center justify-center">
                <div className={`absolute inset-0 rounded-full border-2 border-dashed ${
                  securityState.isStranger
                    ? 'border-rose-500/60 animate-spin'
                    : securityState.isTiredOrSad
                    ? 'border-amber-400/60 animate-spin'
                    : 'border-cyan-400/40 animate-spin'
                }`} style={{ animationDuration: '14s' }} />

                <div className={`absolute inset-2 rounded-full border ${
                  securityState.isStranger
                    ? 'border-rose-500/40'
                    : securityState.isTiredOrSad
                    ? 'border-amber-400/40'
                    : 'border-cyan-400/20'
                }`} />

                {/* Pulsing center radar glow */}
                <div className={`w-14 h-14 rounded-full flex flex-col items-center justify-center transition-all ${
                  securityState.isStranger
                    ? 'bg-rose-950/80 border border-rose-500 text-rose-300 shadow-[0_0_25px_rgba(244,63,94,0.4)]'
                    : securityState.isTiredOrSad
                    ? 'bg-amber-950/80 border border-amber-400 text-amber-300 shadow-[0_0_25px_rgba(245,158,11,0.4)]'
                    : 'bg-cyan-950/80 border border-cyan-400 text-cyan-300 shadow-[0_0_25px_rgba(0,240,255,0.3)]'
                }`}>
                  {isSecurityScanning ? (
                    <RefreshCw className="w-6 h-6 animate-spin text-cyan-300" />
                  ) : securityState.isStranger ? (
                    <UserX className="w-6 h-6 text-rose-400 animate-pulse" />
                  ) : securityState.isTiredOrSad ? (
                    <Coffee className="w-6 h-6 text-amber-300 animate-bounce" />
                  ) : (
                    <UserCheck className="w-6 h-6 text-emerald-400" />
                  )}
                </div>

                {/* Radar sweep line */}
                <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none">
                  <div className={`w-full h-1/2 origin-bottom ${
                    securityState.isStranger
                      ? 'bg-gradient-to-t from-rose-500/20 to-transparent'
                      : securityState.isTiredOrSad
                      ? 'bg-gradient-to-t from-amber-400/20 to-transparent'
                      : 'bg-gradient-to-t from-cyan-400/20 to-transparent'
                  } animate-spin`} style={{ animationDuration: '4s' }} />
                </div>
              </div>

              {/* Status readout under radar */}
              <div className="mt-2 text-center">
                <div className="text-xs font-mono font-bold tracking-wide">
                  {securityState.isStranger ? (
                    <span className="text-rose-400 font-bold">🚫 अनधिकृत व्यक्ति डिटेक्ट हुआ</span>
                  ) : securityState.isTiredOrSad ? (
                    <span className="text-amber-300 font-bold">😴 थकान / उदासी डिटेक्टेड</span>
                  ) : (
                    <span className="text-emerald-300 font-bold">🛡️ बॉस वेरिफाइड (Boss in Frame)</span>
                  )}
                </div>
                <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                  {securityState.ownerLocation}
                </div>
              </div>
            </div>

            {/* Bottom Biometric Telemetry Grid */}
            <div className="grid grid-cols-2 gap-1.5 w-full mt-1">
              <div className={`p-1.5 rounded-lg border flex flex-col gap-0.5 ${
                securityState.isTiredOrSad
                  ? 'bg-amber-950/40 border-amber-500/40 text-amber-200'
                  : 'bg-cyan-950/30 border-cyan-500/20 text-cyan-200'
              }`}>
                <div className="flex items-center justify-between text-[9px] font-mono text-slate-400">
                  <span>मूड व ऊर्जा (Mood):</span>
                  {securityState.isTiredOrSad ? (
                    <Coffee className="w-3 h-3 text-amber-400" />
                  ) : (
                    <Sparkles className="w-3 h-3 text-emerald-400" />
                  )}
                </div>
                <div className="text-[11px] font-mono font-bold truncate">
                  {securityState.isTiredOrSad
                    ? '😴 थका / उदास (Tired)'
                    : '⚡ स्वस्थ व अलर्ट (Active)'}
                </div>
              </div>

              <div className="p-1.5 rounded-lg bg-slate-900/60 border border-slate-700/60 text-slate-200 flex flex-col gap-0.5">
                <div className="flex items-center justify-between text-[9px] font-mono text-slate-400">
                  <span>सिक्योरिटी स्टेटस:</span>
                  <CheckCircle2 className="w-3 h-3 text-cyan-400" />
                </div>
                <div className="text-[11px] font-mono font-bold text-cyan-300 truncate">
                  {securityState.isStranger ? '🚨 BLOCKED' : '✅ 100% सुरक्षित'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Camera Error Message */}
        {cameraError && (
          <div className="absolute bottom-2 inset-x-2 p-2 rounded bg-rose-950/90 border border-rose-500 text-rose-200 text-[10px] font-mono text-center z-20">
            {cameraError}
          </div>
        )}
      </div>

      {/* Control Footer */}
      <div className="p-2.5 bg-[#030814] border-t border-cyan-500/25 flex flex-col gap-2 shrink-0">
        {capturedPhotoUrl ? (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="तारा से इस फ़ोटो के बारे में क्या पूछना चाहते हैं?"
                className="flex-1 bg-slate-900/90 border border-cyan-500/40 rounded-lg px-2.5 py-1 text-xs text-cyan-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
              />
            </div>
            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={handleRetake}
                className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-mono flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3 text-cyan-400" />
                <span>पुनः खींचें (Retake)</span>
              </button>
              <button
                type="button"
                onClick={() => handleSendToTara()}
                disabled={isAnalyzing}
                className="flex-1 px-3 py-1.5 rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-bold font-mono text-xs flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(16,185,129,0.3)] cursor-pointer disabled:opacity-50"
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>विश्लेषण हो रहा है...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>TARA को भेजें (Analyze)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={() => runFaceSecurityCheck(true, true)}
                className="px-2.5 py-1.5 rounded-lg bg-cyan-950/90 hover:bg-cyan-900 border border-cyan-400/60 text-cyan-200 text-xs font-mono flex items-center gap-1.5 cursor-pointer shadow-sm"
                title="बॉस की लोकेशन, पहचान व मूड जांचें"
              >
                <Eye className="w-3.5 h-3.5 text-cyan-400" />
                <span>मुझे देखो</span>
              </button>

              <button
                type="button"
                onClick={handleTestTiredMood}
                className="px-2 py-1.5 rounded-lg bg-amber-950/80 hover:bg-amber-900 border border-amber-500/50 text-amber-200 text-[10px] font-mono flex items-center gap-1 cursor-pointer transition-colors"
                title="TARA केयर रिस्पॉन्स टेस्ट करें"
              >
                <Coffee className="w-3 h-3 text-amber-300" />
                <span>केयर</span>
              </button>

              {securityState.isStranger ? (
                <button
                  type="button"
                  onClick={handleVerifyBossAccess}
                  className="px-2 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 border border-emerald-400 text-white text-[10px] font-mono font-bold flex items-center gap-1 cursor-pointer animate-pulse"
                  title="बॉस वेरीफाई करें और कमांड्स अनलॉक करें"
                >
                  <UserCheck className="w-3 h-3" />
                  <span>बॉस अनलॉक</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleTestStrangerAlert}
                  className="px-2 py-1.5 rounded-lg bg-rose-950/80 hover:bg-rose-900 border border-rose-500/50 text-rose-200 text-[10px] font-mono flex items-center gap-1 cursor-pointer transition-colors"
                  title="अंजान व्यक्ति अलर्ट टेस्ट: 'आप मेरे बॉस नहीं हैं।' (कमांड्स बंद)"
                >
                  <UserX className="w-3 h-3 text-rose-400" />
                  <span>अंजान अलर्ट</span>
                </button>
              )}
            </div>

            {/* Background Snap / Upload Buttons */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-2 py-1.5 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-300 text-[10px] font-mono flex items-center gap-1 cursor-pointer transition-colors"
                title="फ़ाइल या गैलरी से फ़ोटो अपलोड करें"
              >
                <Upload className="w-3 h-3 text-cyan-400" />
                <span>अपलोड</span>
              </button>

              <button
                type="button"
                onClick={handleSnap}
                className="px-3 py-1.5 rounded-xl font-bold font-mono text-xs flex items-center gap-1.5 bg-gradient-to-r from-cyan-400 to-sky-400 hover:from-cyan-300 hover:to-sky-300 text-slate-950 shadow-[0_0_20px_rgba(0,240,255,0.35)] transition-all transform active:scale-95 cursor-pointer"
                title="बैकग्राउंड कैमरे से गुप्त स्नैप लें"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>गुप्त स्नैप (Snap)</span>
              </button>
            </div>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileUpload}
        />
      </div>
    </div>
  );
};
