/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  Mic, 
  Send, 
  X,
  Camera,
  Image as ImageIcon,
  ChevronUp
} from 'lucide-react';
import { AttachedMedia } from '../types';
import { audioSynth } from '../utils/audio';

interface TaraInputBarProps {
  onSendMessage: (text: string) => void;
  onVoiceClick: () => void;
  isListening: boolean;
  attachedMedia?: AttachedMedia | null;
  onClearAttachedMedia?: () => void;
  onUploadPhoto?: (file: File) => void;
}

export const TaraInputBar: React.FC<TaraInputBarProps> = ({
  onSendMessage,
  onVoiceClick,
  isListening,
  attachedMedia,
  onClearAttachedMedia,
  onUploadPhoto,
}) => {
  const [inputText, setInputText] = useState('');
  const [showPhotoMenu, setShowPhotoMenu] = useState(false);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const menuContainerRef = useRef<HTMLDivElement>(null);

  // Close menu if clicked outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuContainerRef.current && 
        !menuContainerRef.current.contains(event.target as Node)
      ) {
        setShowPhotoMenu(false);
      }
    };

    if (showPhotoMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showPhotoMenu]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() && !attachedMedia) return;
    onSendMessage(inputText.trim() || 'इस फ़ोटो का विश्लेषण करें एवं सुंदर सुविचार या सुधार प्रस्तुत करें');
    setInputText('');
    setShowPhotoMenu(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onUploadPhoto) {
      onUploadPhoto(file);
    }
    setShowPhotoMenu(false);
    e.target.value = '';
  };

  const handleTogglePhotoMenu = () => {
    audioSynth.playClick();
    setShowPhotoMenu((prev) => !prev);
  };

  const handleTriggerCamera = () => {
    audioSynth.playClick();
    setShowPhotoMenu(false);
    cameraInputRef.current?.click();
  };

  const handleTriggerGallery = () => {
    audioSynth.playClick();
    setShowPhotoMenu(false);
    galleryInputRef.current?.click();
  };

  return (
    <div className="w-full flex flex-col gap-2 relative" ref={menuContainerRef}>
      {/* 1. Direct Native Camera Input (capture="environment" directly triggers device camera to snap photo) */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* 2. Standard Native Gallery / File Chooser Input */}
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Dual Photo Options Mini Popup / Action Sheet */}
      {showPhotoMenu && (
        <div 
          className="absolute bottom-full left-0 mb-2 z-50 w-64 rounded-2xl bg-[#091528]/95 border border-cyan-500/40 p-2.5 shadow-[0_12px_36px_rgba(0,0,0,0.85)] backdrop-blur-xl animate-in fade-in slide-in-from-bottom-2 duration-150"
        >
          <div className="text-[10px] font-mono text-cyan-400/90 px-2 py-1 uppercase tracking-wider font-semibold border-b border-cyan-900/60 mb-2 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Camera className="w-3 h-3 text-cyan-400" />
              <span>फ़ोटो विकल्प (Attach Photo)</span>
            </span>
            <button 
              type="button" 
              onClick={() => setShowPhotoMenu(false)}
              className="text-slate-400 hover:text-white p-0.5 rounded cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-1">
            {/* Option 1: Take Photo with Camera */}
            <button
              type="button"
              onClick={handleTriggerCamera}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-cyan-500/15 active:bg-cyan-500/25 text-slate-100 hover:text-cyan-300 transition-all text-left cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/35 flex items-center justify-center text-cyan-400 group-hover:bg-cyan-500 group-hover:text-black transition-colors shrink-0">
                <Camera className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold text-white group-hover:text-cyan-200 flex items-center gap-1">
                  <span>कैमरा से फ़ोटो खींचें</span>
                </div>
                <div className="text-[10px] text-slate-400">Take Live Photo</div>
              </div>
            </button>

            {/* Option 2: Choose from Gallery / Files */}
            <button
              type="button"
              onClick={handleTriggerGallery}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-purple-500/15 active:bg-purple-500/25 text-slate-100 hover:text-purple-300 transition-all text-left cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-lg bg-purple-500/20 border border-purple-500/35 flex items-center justify-center text-purple-400 group-hover:bg-purple-500 group-hover:text-black transition-colors shrink-0">
                <ImageIcon className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold text-white group-hover:text-purple-200 flex items-center gap-1">
                  <span>गैलरी / फ़ाइल से चुनें</span>
                </div>
                <div className="text-[10px] text-slate-400">Choose from Gallery</div>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Attached Media Pill above input bar if photo is loaded */}
      {attachedMedia && (
        <div className="flex items-center justify-between gap-2 px-3.5 py-2 rounded-xl bg-[#091b2c]/95 border border-cyan-400/60 shadow-lg text-xs font-sans text-cyan-200 backdrop-blur-md animate-in fade-in slide-in-from-bottom-1 duration-200">
          <div className="flex items-center gap-2.5 min-w-0">
            <img
              src={attachedMedia.previewUrl}
              alt="Attached"
              className="w-8 h-8 object-cover rounded-lg border border-cyan-400 shrink-0 shadow-xs"
            />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-white truncate max-w-[200px] sm:max-w-sm">
                  {attachedMedia.name || 'कैमरा फ़ोटो'}
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/40">
                  Attached
                </span>
              </div>
              <p className="text-[10px] text-cyan-300/80 font-mono truncate">
                माइक दबाकर बोलें या लिखें: "edit this photo", "enhance it", "सुविचार लिखो"...
              </p>
            </div>
          </div>
          {onClearAttachedMedia && (
            <button
              type="button"
              onClick={onClearAttachedMedia}
              className="p-1.5 rounded-lg hover:bg-rose-950/80 text-slate-400 hover:text-rose-300 transition-colors cursor-pointer"
              title="फ़ोटो हटाएं (Remove Photo)"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* Sleek Main Input Bar: Camera + Mic + Input + Send */}
      <form 
        onSubmit={handleSubmit}
        className="w-full relative rounded-2xl bg-[#081122]/95 border border-cyan-500/35 p-1.5 sm:p-2 shadow-[0_4px_24px_rgba(0,0,0,0.5)] backdrop-blur-xl flex items-center gap-1.5 sm:gap-2 focus-within:border-cyan-400 focus-within:shadow-[0_0_20px_rgba(0,240,255,0.25)] transition-all"
      >
        {/* Camera / Image Dual Options Toggle Button */}
        <button
          type="button"
          onClick={handleTogglePhotoMenu}
          className={`p-2.5 rounded-xl transition-all active:scale-95 shrink-0 flex items-center gap-1.5 border cursor-pointer ${
            showPhotoMenu || attachedMedia
              ? 'bg-cyan-500 text-slate-950 border-cyan-300 shadow-[0_0_14px_rgba(0,240,255,0.45)]'
              : 'bg-cyan-950/80 hover:bg-cyan-900 border-cyan-500/40 text-cyan-300 hover:text-white'
          }`}
          title="कैमरा या गैलरी से फ़ोटो चुनें (Take Photo / Choose Gallery)"
          aria-expanded={showPhotoMenu}
        >
          <Camera className="w-4 h-4" />
          <span className="text-[11px] font-mono hidden sm:inline font-semibold">
            {attachedMedia ? 'Photo Attached' : 'Photo'}
          </span>
          <ChevronUp className={`w-3 h-3 transition-transform duration-200 ${showPhotoMenu ? 'rotate-180' : ''}`} />
        </button>

        {/* Voice Input Mic Button */}
        <button
          type="button"
          onClick={onVoiceClick}
          className={`p-2.5 rounded-xl transition-all active:scale-95 shrink-0 border cursor-pointer ${
            isListening
              ? 'bg-rose-500 text-white animate-pulse border-rose-300 shadow-[0_0_18px_rgba(244,63,94,0.7)]'
              : 'bg-cyan-950/80 hover:bg-cyan-900 border-cyan-500/40 text-cyan-300 hover:text-white'
          }`}
          title={isListening ? 'सुन रही हूँ... बोलें (Listening...)' : 'माइक दबाकर बोलें (Voice Input)'}
        >
          <Mic className="w-4 h-4" />
        </button>

        {/* Text Input Field */}
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={
            attachedMedia 
              ? "फ़ोटो के बारे में बोलें या लिखें: 'edit photo', 'enhance it', 'सुविचार लिखो'..."
              : "तारा से कुछ भी पूछें, 'logo banao', 'quote card banao', या बोलें..."
          }
          className="flex-1 bg-transparent px-2.5 py-2 text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-hidden font-sans"
        />

        {/* Send Button */}
        <button
          type="submit"
          disabled={!inputText.trim() && !attachedMedia}
          className={`p-2.5 rounded-xl transition-all active:scale-95 shrink-0 shadow-md ${
            inputText.trim() || attachedMedia
              ? 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 font-bold shadow-[0_0_12px_rgba(0,240,255,0.4)] cursor-pointer'
              : 'bg-slate-900/60 text-slate-600 border border-slate-800 cursor-not-allowed opacity-50'
          }`}
          title="भेजें (Send)"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
