/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { 
  Mic, 
  Send, 
  X,
  Image as ImageIcon
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
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim()) {
      audioSynth.playSend();
      onSendMessage(inputText.trim());
      setInputText('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onUploadPhoto) {
      onUploadPhoto(file);
    }
    // Reset file input so user can pick same file again if desired
    e.target.value = '';
  };

  const handleTriggerGallery = () => {
    audioSynth.playClick();
    galleryInputRef.current?.click();
  };

  return (
    <div className="w-full flex flex-col gap-2 relative">
      {/* Standard Native Gallery / File Chooser Input (No Live Camera) */}
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Sleek Main Input Bar: Photo + Mic + Input + Send */}
      <form 
        onSubmit={handleSubmit}
        className="w-full relative rounded-2xl bg-[#081122]/95 border border-cyan-500/35 p-1.5 sm:p-2 shadow-[0_4px_24px_rgba(0,0,0,0.5)] backdrop-blur-xl flex items-center gap-1.5 sm:gap-2 focus-within:border-cyan-400 focus-within:shadow-[0_0_20px_rgba(0,240,255,0.25)] transition-all"
      >
        {/* Gallery / File Image Attachment Button */}
        <button
          type="button"
          onClick={handleTriggerGallery}
          className={`p-2.5 rounded-xl transition-all active:scale-95 shrink-0 flex items-center gap-1.5 border cursor-pointer ${
            attachedMedia
              ? 'bg-cyan-500 text-slate-950 border-cyan-300 shadow-[0_0_14px_rgba(0,240,255,0.45)]'
              : 'bg-cyan-950/80 hover:bg-cyan-900 border-cyan-500/40 text-cyan-300 hover:text-white'
          }`}
          title="गैलरी या फ़ाइल से फ़ोटो जोड़ें (Attach Image)"
        >
          <ImageIcon className="w-4 h-4" />
          <span className="text-[11px] font-mono hidden sm:inline font-semibold">
            {attachedMedia ? 'Photo Attached' : 'Photo'}
          </span>
        </button>

        {/* Voice Input Mic Button */}
        <button
          type="button"
          onClick={onVoiceClick}
          className={`p-2.5 rounded-xl transition-all duration-300 cursor-pointer relative shrink-0 ${
            isListening
              ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-[0_0_20px_rgba(244,63,94,0.6)] animate-pulse scale-105'
              : 'bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 hover:text-white border border-cyan-500/40'
          }`}
          title={isListening ? 'माइक सक्रिय है (सुन रही हूँ)' : 'बोलकर पूछें (Voice Input)'}
          aria-label={isListening ? 'Stop listening' : 'Start voice input'}
        >
          <Mic className={`w-4 h-4 sm:w-4.5 sm:h-4.5 ${isListening ? 'animate-bounce' : ''}`} />
        </button>

        {/* Text Input */}
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="तारा से कुछ भी पूछें... (Ask TARA anything)"
          className="flex-1 bg-transparent px-2 sm:px-3 py-1.5 text-xs sm:text-sm text-cyan-100 placeholder:text-cyan-500/60 focus:outline-none font-mono"
        />

        {/* Attached Photo Chip Preview */}
        {attachedMedia && (
          <div className="flex items-center gap-1.5 bg-[#031526] border border-cyan-500/50 rounded-lg p-1 pr-2 shrink-0 animate-in fade-in">
            <img 
              src={attachedMedia.previewUrl} 
              alt="Thumbnail" 
              className="w-6 h-6 rounded object-cover border border-cyan-400/40"
            />
            <span className="text-[10px] font-mono text-cyan-300 max-w-[60px] truncate hidden sm:inline">
              {attachedMedia.name || 'Photo'}
            </span>
            <button
              type="button"
              onClick={onClearAttachedMedia}
              className="text-cyan-400 hover:text-rose-400 p-0.5 rounded cursor-pointer"
              title="फ़ोटो हटाएं (Remove Photo)"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Send Button */}
        <button
          type="submit"
          disabled={!inputText.trim() && !attachedMedia}
          className={`p-2.5 rounded-xl transition-all duration-200 shrink-0 ${
            inputText.trim() || attachedMedia
              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold hover:brightness-110 shadow-[0_0_15px_rgba(0,240,255,0.4)] cursor-pointer active:scale-95'
              : 'bg-cyan-950/40 text-cyan-700 cursor-not-allowed border border-cyan-900/30'
          }`}
          title="संदेश भेजें (Send Message)"
          aria-label="Send message"
        >
          <Send className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
        </button>
      </form>
    </div>
  );
};
