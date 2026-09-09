import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Cpu, 
  HardDrive, 
  Trash2, 
  RefreshCw
} from 'lucide-react';
import { SystemLog, SystemTelemetry, SystemMode } from '../types';
import { audioSynth } from '../utils/audio';

interface SystemActivitySectionProps {
  logs: SystemLog[];
  telemetry: SystemTelemetry;
  systemMode: SystemMode;
  onClearLogs: () => void;
  onRunDiagnostics: () => void;
  onFlushCache: () => void;
}

export const SystemActivitySection: React.FC<SystemActivitySectionProps> = ({
  logs,
  telemetry,
  systemMode,
  onClearLogs,
  onRunDiagnostics,
  onFlushCache,
}) => {
  const [activeTab, setActiveTab] = useState<'telemetry' | 'terminal'>('telemetry');
  const [liveLoad, setLiveLoad] = useState<number>(telemetry.neuralLoad);
  const [liveLatency, setLiveLatency] = useState<number>(telemetry.latencyMs);

  // Micro jitter for live telemetry realism
  useEffect(() => {
    const timer = setInterval(() => {
      setLiveLoad((prevLoad) => {
        const delta = (Math.random() - 0.5) * 4;
        const target = systemMode === 'OVERCLOCK' ? 45 : (systemMode === 'STEALTH' ? 18 : 28);
        return Math.min(95, Math.max(10, Math.round(prevLoad * 0.7 + target * 0.3 + delta)));
      });
      setLiveLatency((prevLat) => {
        const delta = (Math.random() - 0.5) * 4;
        const target = systemMode === 'OVERCLOCK' ? 12 : 24;
        return Math.min(80, Math.max(8, Math.round(prevLat * 0.7 + target * 0.3 + delta)));
      });
    }, 2500);

    return () => clearInterval(timer);
  }, [systemMode]);

  const getLogLevelStyle = (lvl: SystemLog['level']) => {
    switch (lvl) {
      case 'success':
        return 'text-emerald-400 bg-emerald-950/40 border-emerald-500/30';
      case 'warn':
        return 'text-amber-400 bg-amber-950/40 border-amber-500/30';
      case 'exec':
        return 'text-cyan-400 bg-cyan-950/40 border-cyan-500/30';
      default:
        return 'text-slate-400 bg-slate-900 border-slate-800';
    }
  };

  return (
    <div className="cyber-panel rounded-xl overflow-hidden border border-cyan-500/20 bg-[#090e17]/90 shadow-xl flex flex-col h-full">
      {/* Header */}
      <div className="p-3 border-b border-cyan-500/20 bg-slate-950/80 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded bg-cyan-950/70 border border-cyan-500/40 text-cyan-400">
            <Activity className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h3 className="font-heading text-xs font-bold text-slate-100 uppercase tracking-wider flex items-center gap-1.5">
              System Activity & Telemetry
            </h3>
            <p className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              Subroutines: {telemetry.activeSubroutines} Active • Latency: {liveLatency}ms
            </p>
          </div>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-1 p-0.5 rounded-lg bg-slate-900 border border-slate-800">
          <button
            onClick={() => {
              audioSynth.playClick();
              setActiveTab('telemetry');
            }}
            className={`px-2 py-0.5 text-[11px] font-mono rounded transition-colors ${
              activeTab === 'telemetry' 
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/40 font-bold' 
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            Gauges
          </button>
          <button
            onClick={() => {
              audioSynth.playClick();
              setActiveTab('terminal');
            }}
            className={`px-2 py-0.5 text-[11px] font-mono rounded transition-colors ${
              activeTab === 'terminal' 
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/40 font-bold' 
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            Logs ({logs.length})
          </button>
        </div>
      </div>

      {activeTab === 'telemetry' ? (
        <div className="p-3.5 space-y-3.5 overflow-y-auto flex-1 max-h-[300px] lg:max-h-[340px]">
          {/* Top Gauges Grid */}
          <div className="grid grid-cols-2 gap-2.5">
            {/* Neural Load Gauge */}
            <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-slate-400 flex items-center gap-1">
                  <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                  Neural Load
                </span>
                <span className="text-cyan-300 font-bold">{liveLoad}%</span>
              </div>
              <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="bg-cyan-400 h-full rounded-full transition-all duration-500 shadow-[0_0_8px_#00f0ff]"
                  style={{ width: `${liveLoad}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] font-mono text-slate-500">
                <span>Core Clock: 4.8 GHz</span>
                <span>8 Threads</span>
              </div>
            </div>

            {/* Quantum Memory Allocation */}
            <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-slate-400 flex items-center gap-1">
                  <HardDrive className="w-3.5 h-3.5 text-purple-400" />
                  Quantum Memory
                </span>
                <span className="text-purple-300 font-bold">{telemetry.quantumMemory}%</span>
              </div>
              <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="bg-purple-400 h-full rounded-full transition-all duration-500 shadow-[0_0_8px_#a855f7]"
                  style={{ width: `${telemetry.quantumMemory}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] font-mono text-slate-500">
                <span>4.2 / 16.0 GB</span>
                <span>HNSW Cache</span>
              </div>
            </div>
          </div>

          {/* Secondary Telemetry Strip */}
          <div className="grid grid-cols-3 gap-2">
            <div className="p-2 rounded bg-slate-950/70 border border-slate-800/80 text-center">
              <span className="text-[10px] font-mono text-slate-500 block">Token Velocity</span>
              <span className="text-xs font-mono font-bold text-emerald-400">{telemetry.tokenRate} t/s</span>
            </div>
            <div className="p-2 rounded bg-slate-950/70 border border-slate-800/80 text-center">
              <span className="text-[10px] font-mono text-slate-500 block">Zero-Trust Sec</span>
              <span className="text-xs font-mono font-bold text-cyan-300">BB84 Active</span>
            </div>
            <div className="p-2 rounded bg-slate-950/70 border border-slate-800/80 text-center">
              <span className="text-[10px] font-mono text-slate-500 block">Kernel Mode</span>
              <span className="text-xs font-mono font-bold text-amber-300">{systemMode}</span>
            </div>
          </div>

          {/* Action Quick Buttons */}
          <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-800/80">
            <button
              onClick={() => {
                audioSynth.playSend();
                onRunDiagnostics();
              }}
              className="flex-1 py-1.5 px-2 rounded bg-cyan-950/70 hover:bg-cyan-900 border border-cyan-500/30 text-cyan-300 text-xs font-mono flex items-center justify-center gap-1.5 transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Diagnostic Ping</span>
            </button>

            <button
              onClick={() => {
                audioSynth.playClick();
                onFlushCache();
              }}
              className="flex-1 py-1.5 px-2 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-mono flex items-center justify-center gap-1.5 transition-colors"
            >
              <HardDrive className="w-3 h-3 text-purple-400" />
              <span>Defrag Memory</span>
            </button>
          </div>
        </div>
      ) : (
        /* Terminal Logs View */
        <div className="p-2.5 flex flex-col flex-1 max-h-[300px] lg:max-h-[340px] bg-[#05080e] font-mono text-xs">
          <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-800/80 text-[10px] text-slate-500">
            <span>TERMINAL LOG STREAM // ISO-8601</span>
            <button
              onClick={() => {
                audioSynth.playClick();
                onClearLogs();
              }}
              className="flex items-center gap-1 text-slate-500 hover:text-rose-400 transition-colors"
            >
              <Trash2 className="w-3 h-3" />
              <span>Clear</span>
            </button>
          </div>

          <div className="overflow-y-auto space-y-1.5 flex-1 pr-1">
            {logs.map((log) => (
              <div
                key={log.id}
                className="p-1.5 rounded bg-slate-950/70 border border-slate-900 flex items-start gap-2 text-[11px] leading-tight"
              >
                <span className="text-slate-500 text-[10px] shrink-0">{log.timestamp}</span>
                <span className={`px-1 py-0.2 rounded text-[9px] font-bold border uppercase shrink-0 ${getLogLevelStyle(log.level)}`}>
                  {log.module}
                </span>
                <span className="text-slate-300 break-words flex-1">{log.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
