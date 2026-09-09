/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  FileDown, 
  Check, 
  X, 
  Sparkles, 
  BookOpen, 
  CheckSquare, 
  FileText, 
  Download
} from 'lucide-react';
import { 
  generateQuotesPdf, 
  generateNotesPdf, 
  generateSessionReportPdf, 
  generatePosterImagePdf 
} from '../utils/pdfGenerator';
import { TaskItem, NoteItem, ChatMessage } from '../types';
import { audioSynth } from '../utils/audio';

interface TaraPdfGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: TaskItem[];
  notes: NoteItem[];
  messages: ChatMessage[];
  activeCardPosterUrl?: string | null;
  activeCardTitle?: string;
  initialType?: 'quotes' | 'notes' | 'report' | 'poster';
}

export const TaraPdfGeneratorModal: React.FC<TaraPdfGeneratorModalProps> = ({
  isOpen,
  onClose,
  tasks,
  notes,
  messages,
  activeCardPosterUrl,
  activeCardTitle,
  initialType = 'quotes',
}) => {
  const [selectedType, setSelectedType] = useState<'quotes' | 'notes' | 'report' | 'poster'>(initialType);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);
  const [customTitle, setCustomTitle] = useState('');

  if (!isOpen) return null;

  const defaultQuotes = [
    {
      text: 'उठो, जागो और तब तक मत रुको जब तक लक्ष्य की प्राप्ति न हो जाए।',
      author: 'स्वामी विवेकानंद',
      category: 'प्रेरणा (Motivation)',
    },
    {
      text: 'सपने वो नहीं जो हम सोते हुए देखते हैं, सपने वो हैं जो हमें सोने नहीं देते।',
      author: 'डॉ. ए. पी. जे. अब्दुल कलाम',
      category: 'ध्येय (Aspiration)',
    },
    {
      text: 'कर्मण्येवाधिकारस्ते मा फलेषु कदाचन। अपने कर्म पर ध्यान दो, फल की चिंता मत करो।',
      author: 'श्रीमद्भगवद्गीता',
      category: 'ज्ञान (Wisdom)',
    },
    {
      text: 'कठिन परिश्रम और दृढ़ संकल्प से कोई भी असंभव कार्य संभव बन जाता है।',
      author: 'मिस्टर बृजमोहन कुमार',
      category: 'दृढ़ता (Perseverance)',
    },
    {
      text: 'सफलता का रहस्य है निरंतर अभ्यास और कभी हार न मानने का अटूट हौसला।',
      author: 'तारा प्रेरणा सूत्र',
      category: 'सफलता (Success)',
    },
    {
      text: 'समय ही सबसे बड़ा धन है; जो समय का सम्मान करता है, समय उसका सम्मान करता है।',
      author: 'चाणक्य नीति',
      category: 'समय प्रबंधन (Time)',
    },
  ];

  const handleGenerateAndDownload = () => {
    audioSynth.playSuccess();
    let fileName = '';

    if (selectedType === 'quotes') {
      const res = generateQuotesPdf(defaultQuotes, customTitle || undefined);
      fileName = res.fileName;
    } else if (selectedType === 'notes') {
      const res = generateNotesPdf(notes, customTitle || undefined);
      fileName = res.fileName;
    } else if (selectedType === 'report') {
      const res = generateSessionReportPdf(tasks, notes, messages, customTitle || undefined);
      fileName = res.fileName;
    } else if (selectedType === 'poster' && activeCardPosterUrl) {
      const res = generatePosterImagePdf(
        activeCardPosterUrl,
        customTitle || activeCardTitle || 'तारा सुविचार पोस्टर'
      );
      fileName = res.fileName;
    }

    setDownloadSuccess(fileName);
    setTimeout(() => {
      setDownloadSuccess(null);
      onClose();
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-2xl bg-[#091122] border-2 border-cyan-400/50 p-5 sm:p-6 shadow-[0_10px_40px_rgba(0,0,0,0.8)] relative flex flex-col gap-4">
        {/* Top Glow Accent */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-cyan-500/20">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-slate-950 font-bold shadow-md">
              <FileDown className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-sm sm:text-base text-slate-100 flex items-center gap-1.5">
                <span>डायरेक्ट पीडीएफ जनरेटर (Direct PDF Generator)</span>
                <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-cyan-950 border border-cyan-500/40 text-cyan-300">
                  Instant jsPDF
                </span>
              </h3>
              <p className="text-[11px] text-slate-400 font-mono">
                एक क्लिक में उच्च-गुणवत्ता पीडीएफ तैयार करें व डाउनलोड करें
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* PDF Type Select Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {/* Quotes Tab */}
          <button
            type="button"
            onClick={() => setSelectedType('quotes')}
            className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all ${
              selectedType === 'quotes'
                ? 'bg-cyan-950/80 border-cyan-400 text-cyan-200 shadow-[0_0_12px_rgba(0,240,255,0.2)]'
                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <BookOpen className="w-4 h-4 text-cyan-400" />
            <span className="font-bold text-xs">सुविचार (Quotes)</span>
            <span className="text-[9px] font-mono opacity-70">प्रेरणादायक संग्रह</span>
          </button>

          {/* Notes Tab */}
          <button
            type="button"
            onClick={() => setSelectedType('notes')}
            className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all ${
              selectedType === 'notes'
                ? 'bg-cyan-950/80 border-cyan-400 text-cyan-200 shadow-[0_0_12px_rgba(0,240,255,0.2)]'
                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <FileText className="w-4 h-4 text-blue-400" />
            <span className="font-bold text-xs">नोट्स (Notes)</span>
            <span className="text-[9px] font-mono opacity-70">{notes.length} नोट्स सुरक्षित</span>
          </button>

          {/* Report Tab */}
          <button
            type="button"
            onClick={() => setSelectedType('report')}
            className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all ${
              selectedType === 'report'
                ? 'bg-cyan-950/80 border-cyan-400 text-cyan-200 shadow-[0_0_12px_rgba(0,240,255,0.2)]'
                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <CheckSquare className="w-4 h-4 text-emerald-400" />
            <span className="font-bold text-xs">सत्र रिपोर्ट</span>
            <span className="text-[9px] font-mono opacity-70">कार्य & वार्तालाप</span>
          </button>

          {/* Poster Image Tab */}
          <button
            type="button"
            onClick={() => setSelectedType('poster')}
            disabled={!activeCardPosterUrl}
            className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition-all ${
              selectedType === 'poster'
                ? 'bg-cyan-950/80 border-cyan-400 text-cyan-200 shadow-[0_0_12px_rgba(0,240,255,0.2)]'
                : !activeCardPosterUrl
                ? 'opacity-40 cursor-not-allowed bg-slate-950/40 border-slate-900 text-slate-600'
                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="font-bold text-xs">पोस्टर (Card)</span>
            <span className="text-[9px] font-mono opacity-70">सक्रिय डिज़ाइन</span>
          </button>
        </div>

        {/* Selected Document Specs & Info */}
        <div className="p-3.5 rounded-xl bg-slate-950/80 border border-cyan-500/20 flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400">दस्तावेज़ प्रारूप:</span>
            <span className="text-cyan-300 font-bold">A4 Portrait (Print-Ready 300 DPI)</span>
          </div>

          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400">शामिल सामग्री:</span>
            <span className="text-slate-200">
              {selectedType === 'quotes' && `${defaultQuotes.length} चुने हुए प्रेरक विचार एवं लेखक`}
              {selectedType === 'notes' && `${notes.length} मेमोरी क्लस्टर नोट्स व टैग्स`}
              {selectedType === 'report' && `${tasks.length} टास्क, आंकड़े व बातचीत इतिहास`}
              {selectedType === 'poster' && 'सक्रिय 16:9 पोस्टर व सुविचार कार्ड'}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400">निर्माता / स्वामित्व:</span>
            <span className="text-slate-200">Mr. Brijmohan Kumar • Tara AI</span>
          </div>
        </div>

        {/* Optional Title Customization */}
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-mono text-slate-400">दस्तावेज़ का शीर्षक (वैकल्पिक):</label>
          <input
            type="text"
            value={customTitle}
            onChange={(e) => setCustomTitle(e.target.value)}
            placeholder={
              selectedType === 'quotes'
                ? 'उदा. दैनिक प्रेरणादायक विचार'
                : selectedType === 'notes'
                ? 'उदा. मेरे व्यक्तिगत कार्य व नोट्स'
                : 'उदा. तारा सत्र सारांश रिपोर्ट'
            }
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-100 placeholder:text-slate-600 focus:outline-hidden focus:border-cyan-400 font-sans"
          />
        </div>

        {/* PROMINENT DOWNLOAD BUTTON DIRECTLY IN MODAL */}
        <button
          type="button"
          onClick={handleGenerateAndDownload}
          className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 via-cyan-400 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-extrabold text-sm font-mono tracking-wider shadow-[0_0_25px_rgba(0,240,255,0.4)] flex items-center justify-center gap-2 active:scale-98 transition-all cursor-pointer"
        >
          {downloadSuccess ? (
            <>
              <Check className="w-5 h-5 text-emerald-950" />
              <span>पीडीएफ सफलतापूर्वक डाउनलोड हुआ! ({downloadSuccess})</span>
            </>
          ) : (
            <>
              <Download className="w-5 h-5 text-slate-950" />
              <span>Download PDF (पीडीएफ डाउनलोड करें)</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
