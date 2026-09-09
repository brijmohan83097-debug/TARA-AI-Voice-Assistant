/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { X, Clock, Play, Pause, RotateCcw } from 'lucide-react';
import { audioSynth } from '../utils/audio';

interface TaraTimerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMinutes?: number;
}

export const TaraTimerModal: React.FC<TaraTimerModalProps> = ({
  isOpen,
  onClose,
  initialMinutes = 5,
}) => {
  const [secondsLeft, setSecondsLeft] = useState(initialMinutes * 60);
  const [isActive, setIsActive] = useState(false);
  const [customMins, setCustomMins] = useState(initialMinutes);

  useEffect(() => {
    setSecondsLeft(customMins * 60);
    setIsActive(false);
  }, [customMins, isOpen]);

  useEffect(() => {
    let interval: any = null;
    if (isActive && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((sec) => sec - 1);
      }, 1000);
    } else if (secondsLeft === 0 && isActive) {
      setIsActive(false);
      audioSynth.playSuccess();
    }
    return () => clearInterval(interval);
  }, [isActive, secondsLeft]);

  if (!isOpen) return null;

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const progressPercent = ((customMins * 60 - secondsLeft) / (customMins * 60)) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm rounded-2xl bg-[#0b1324] border border-cyan-500/40 p-5 shadow-[0_0_40px_rgba(0,240,255,0.25)] flex flex-col items-center">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-100 p-1.5 rounded-lg bg-slate-900/80"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-cyan-400" />
          <h3 className="font-heading font-bold text-base text-slate-100">
            तारा टाइमर (Tara Timer)
          </h3>
        </div>

        {/* Circular Progress Display */}
        <div className="relative w-40 h-40 flex items-center justify-center my-3">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="44"
              className="text-slate-800"
              strokeWidth="6"
              stroke="currentColor"
              fill="transparent"
            />
            <circle
              cx="50"
              cy="50"
              r="44"
              className="text-cyan-400 transition-all duration-1000"
              strokeWidth="6"
              strokeDasharray="276"
              strokeDashoffset={276 - (276 * progressPercent) / 100}
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
            />
          </svg>

          <div className="absolute flex flex-col items-center">
            <span className="font-mono text-3xl font-bold text-slate-100 tracking-wider text-glow-cyan">
              {formattedTime}
            </span>
            <span className="text-[10px] font-mono text-cyan-400 mt-0.5">
              {secondsLeft === 0 ? 'समय समाप्त (Complete)' : isActive ? 'काउंटडाउन चालू' : 'विराम (Paused)'}
            </span>
          </div>
        </div>

        {/* Preset Minutes Buttons */}
        <div className="flex items-center gap-2 mb-5">
          {[1, 5, 10, 15, 25].map((m) => (
            <button
              key={m}
              onClick={() => {
                setCustomMins(m);
                setSecondsLeft(m * 60);
                setIsActive(false);
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all ${
                customMins === m
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-[0_0_10px_rgba(0,240,255,0.4)]'
                  : 'bg-slate-900 border border-slate-800 text-slate-300 hover:text-cyan-300'
              }`}
            >
              {m}m
            </button>
          ))}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3 w-full">
          <button
            onClick={() => setIsActive(!isActive)}
            className={`flex-1 py-2.5 rounded-xl font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 ${
              isActive
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-[0_0_15px_rgba(0,240,255,0.3)]'
            }`}
          >
            {isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span>{isActive ? 'विराम (Pause)' : 'शुरू करें (Start)'}</span>
          </button>

          <button
            onClick={() => {
              setIsActive(false);
              setSecondsLeft(customMins * 60);
            }}
            className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 transition-colors"
            title="Reset"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
