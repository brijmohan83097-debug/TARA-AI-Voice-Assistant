import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[TARA OS ERROR CAUGHT]:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="w-screen h-screen bg-[#020611] text-cyan-300 flex flex-col items-center justify-center p-6 select-none font-mono">
          <div className="max-w-md w-full bg-[#040e24]/90 border border-cyan-500/50 rounded-2xl p-6 shadow-[0_0_50px_rgba(0,240,255,0.25)] flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-full bg-cyan-950/80 border border-cyan-400 flex items-center justify-center mb-4 shadow-[0_0_20px_#00f0ff]">
              <AlertTriangle className="w-7 h-7 text-cyan-400 animate-pulse" />
            </div>

            <h2 className="text-xl font-bold tracking-wider text-cyan-100 mb-2">
              TARA OS • SYSTEM DIAGNOSTIC
            </h2>
            <p className="text-xs text-cyan-300/80 mb-4">
              सिस्टम में क्षणिक रुकावट आई थी। तारा का न्यूरल कोर सुरक्षित है।
            </p>

            {this.state.error && (
              <div className="w-full bg-black/50 border border-cyan-900/60 rounded p-2 text-[11px] text-cyan-400/70 mb-4 overflow-auto max-h-24 text-left">
                {this.state.error.message || 'Unknown runtime anomaly'}
              </div>
            )}

            <div className="flex gap-3 w-full">
              <button
                type="button"
                onClick={this.handleReset}
                className="flex-1 py-2.5 px-4 rounded-xl bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-400/50 text-cyan-200 text-xs font-semibold transition-all shadow-[0_0_15px_rgba(0,240,255,0.2)]"
              >
                पुनः प्रयास करें (Retry)
              </button>
              <button
                type="button"
                onClick={this.handleReload}
                className="flex-1 py-2.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-all shadow-[0_0_20px_#00f0ff] flex items-center justify-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                रीबूट (Reboot)
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
