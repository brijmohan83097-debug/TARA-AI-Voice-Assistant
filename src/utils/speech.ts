/**
 * Tara Voice Assistant Speech Synthesis & Recognition Engine
 * Provides real-time Hindi (hi-IN) & English text-to-speech (TTS)
 * with resilient Web Speech API + /api/tts audio fallback.
 */

import { audioSynth } from './audio';

class SpeechEngine {
  private isTtsEnabled: boolean = true;
  private voices: SpeechSynthesisVoice[] = [];
  private selectedHindiVoice: SpeechSynthesisVoice | null = null;
  private selectedEnglishVoice: SpeechSynthesisVoice | null = null;
  private isSpeaking: boolean = false;
  private speakingListeners: Array<(isSpeaking: boolean) => void> = [];

  // Robust Chunking & Streaming Sentence TTS Queue
  private streamingBuffer: string = '';
  private sentenceQueue: string[] = [];
  private isStreamingActive: boolean = false;
  private isCurrentUtterancePlaying: boolean = false;
  private hasSpokenInCurrentSession: boolean = false;
  private activeUtterances: Set<SpeechSynthesisUtterance> = new Set();

  // Timers & Concurrency Guards
  private heartbeatTimer: any = null;
  private chunkWatchdogTimer: any = null;
  private startWatchdogTimer: any = null;
  private pendingPlayTimer: any = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private lastCancelAt: number = 0;
  private sessionToken: number = 0;
  private isSpeechUnlocked: boolean = false;
  private webSpeechUnavailable: boolean = false;

  // Fallback HTMLAudioElement playback
  private activeAudioElement: HTMLAudioElement | null = null;
  private isFallbackAudioPlaying: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('tara_tts_enabled');
        if (saved !== null) {
          this.isTtsEnabled = Boolean(JSON.parse(saved));
        } else {
          this.isTtsEnabled = true;
          localStorage.setItem('tara_tts_enabled', 'true');
        }
      } catch {
        this.isTtsEnabled = true;
      }
      this.initVoices();

      try {
        document.addEventListener('visibilitychange', () => {
          if (!document.hidden && 'speechSynthesis' in window && window.speechSynthesis.paused) {
            window.speechSynthesis.resume();
          }
        });
      } catch {}
    }
  }

  /**
   * Unlocks Web Audio & SpeechSynthesis synchronously inside a user gesture
   * (click, tap, mic start, form submit) so async TTS after API calls plays reliably.
   */
  public unlockSpeech(): void {
    if (typeof window === 'undefined') return;
    try {
      audioSynth.resumeAudio();
    } catch {}

    if ('speechSynthesis' in window) {
      this.ensureVoicesLoaded();
      try {
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }
      } catch {}

      if (
        !this.isSpeechUnlocked &&
        !window.speechSynthesis.speaking &&
        !window.speechSynthesis.pending &&
        !this.isCurrentUtterancePlaying
      ) {
        this.isSpeechUnlocked = true;
        try {
          const primer = new SpeechSynthesisUtterance(' ');
          primer.volume = 0;
          primer.rate = 2;
          primer.lang = 'hi-IN';
          window.speechSynthesis.speak(primer);
        } catch {}
      }
    }
  }

  public ensureVoicesLoaded() {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    if (this.voices.length === 0) {
      this.initVoices();
    }
  }

  private initVoices() {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return;
    }

    const loadVoices = () => {
      try {
        this.voices = window.speechSynthesis.getVoices() || [];
      } catch {
        this.voices = [];
      }

      if (this.voices.length > 0) {
        const isOffline = typeof navigator !== 'undefined' && navigator.onLine === false;

        // Prefer local Hindi voice when offline, or best natural/Hindi voice when online
        const hindiVoices = this.voices.filter(
          (v) =>
            v.lang === 'hi-IN' ||
            v.lang === 'hi_IN' ||
            v.lang.toLowerCase().startsWith('hi') ||
            (/hindi|india/i.test(v.name) && !/english/i.test(v.name))
        );

        this.selectedHindiVoice =
          (isOffline ? hindiVoices.find((v) => v.localService) : null) ||
          hindiVoices.find((v) => /natural|neural|swara|kavya|kalpana|google|lekha/i.test(v.name)) ||
          hindiVoices.find((v) => v.localService) ||
          hindiVoices[0] ||
          null;

        const englishVoices = this.voices.filter(
          (v) => v.lang === 'en-IN' || v.lang === 'en-US' || v.lang.toLowerCase().startsWith('en')
        );

        this.selectedEnglishVoice =
          (isOffline ? englishVoices.find((v) => v.localService) : null) ||
          englishVoices.find((v) => /natural|neural|neerja|samantha|google|prabhat/i.test(v.name)) ||
          englishVoices.find((v) => v.lang === 'en-IN') ||
          englishVoices[0] ||
          null;
      }
    };

    loadVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }

  public isHindiText(text: string): boolean {
    if (!text) return false;
    const devanagariRegex = /[\u0900-\u097F]/;
    if (devanagariRegex.test(text)) return true;

    const hinglishKeywords = [
      /\bnamaste\b/i, /\baap\b/i, /\bkya\b/i, /\bkaise\b/i, /\bhain\b/i,
      /\bhoon\b/i, /\bkarna\b/i, /\bhai\b/i, /\bkarein\b/i, /\bshukriya\b/i,
      /\bdhanyawad\b/i, /\bmere\b/i, /\btara\b/i, /\bmadad\b/i, /\baapka\b/i,
      /\bkripya\b/i, /\btheek\b/i, /\bbolo\b/i, /\bsuno\b/i, /\bkaun\b/i,
      /\bkyun\b/i, /\bkahan\b/i, /\bkab\b/i, /\bbahut\b/i, /\baccha\b/i,
      /\byaar\b/i, /\bbhai\b/i, /\bhaan\b/i, /\bnahi\b/i, /\bchal\b/i,
    ];
    return hinglishKeywords.some((regex) => regex.test(text));
  }

  public cleanTextForSpeech(rawText: string): string {
    if (!rawText) return '';

    const normalizedTimeText = rawText.replace(
      /\b(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM|am|pm)?\b/g,
      (_match, hStr, mStr) => {
        const h = parseInt(hStr, 10);
        const m = parseInt(mStr, 10);
        const h12 = h % 12 || 12;
        if (m === 0) {
          return `${h12} बजे`;
        }
        return `${h12} बजकर ${m} मिनट`;
      }
    );

    const normalizedCurrencyText = normalizedTimeText
      .replace(/₹\s*([\d,]+)/g, (_match, num) => `${num.replace(/,/g, '')} रुपये`)
      .replace(/\bRs\.?\s*([\d,]+)/gi, (_match, num) => `${num.replace(/,/g, '')} रुपये`);

    return normalizedCurrencyText
      .replace(/```[\s\S]*?```/g, '')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/^#{1,6}\s+/gm, '')
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/\*([^*]+)\*/g, '$1')
      .replace(/__([^_]+)__/g, '$1')
      .replace(/_([^_]+)_/g, '$1')
      .replace(/^[\s*-+]\s+/gm, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/https?:\/\/\S+/g, '')
      .replace(/[\u{1F300}-\u{1F9FF}]/gu, '')
      .replace(/[\u{2600}-\u{26FF}]/gu, '')
      .replace(/[\u{2700}-\u{27BF}]/gu, '')
      .replace(/:\s+/g, ', ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  public splitIntoSpokenChunks(text: string): string[] {
    const clean = this.cleanTextForSpeech(text);
    if (!clean) return [];

    const rawClauses: string[] = [];
    let current = '';

    for (let i = 0; i < clean.length; i++) {
      const char = clean[i];
      const nextChar = clean[i + 1] || '';
      const prevChar = i > 0 ? clean[i - 1] : '';

      current += char;

      const isPurnaViram = char === '।';
      const isQuestionOrExclamation = char === '?' || char === '!';
      const isNewline = char === '\n';
      const isComma = char === ',' || char === '،';
      const isSemicolon = char === ';';
      const isPeriod =
        char === '.' &&
        !(/\d/.test(prevChar) && /\d/.test(nextChar)) &&
        (i === clean.length - 1 || /\s/.test(nextChar));
      const isDash = char === '—' || char === '–';

      if (isPurnaViram || isQuestionOrExclamation || isNewline || isComma || isSemicolon || isPeriod || isDash) {
        const trimmed = current.trim();
        if (trimmed.length > 0) {
          rawClauses.push(trimmed);
        }
        current = '';
      }
    }

    if (current.trim().length > 0) {
      rawClauses.push(current.trim());
    }

    const TARGET_MAX_WORDS = 20;
    const chunks: string[] = [];
    let currentWords: string[] = [];

    const flushCurrent = () => {
      if (currentWords.length > 0) {
        chunks.push(currentWords.join(' ').trim());
        currentWords = [];
      }
    };

    for (const clause of rawClauses) {
      const wordsInClause = clause.split(/\s+/).filter(Boolean);
      if (wordsInClause.length === 0) continue;

      if (wordsInClause.length > TARGET_MAX_WORDS) {
        flushCurrent();
        for (let k = 0; k < wordsInClause.length; k += 16) {
          const slice = wordsInClause.slice(k, k + 16);
          if (slice.length > 0) {
            chunks.push(slice.join(' ').trim());
          }
        }
        continue;
      }

      if (currentWords.length + wordsInClause.length > TARGET_MAX_WORDS) {
        flushCurrent();
        currentWords.push(...wordsInClause);
      } else {
        currentWords.push(...wordsInClause);
      }
    }

    flushCurrent();

    if (chunks.length > 0) {
      const lastIdx = chunks.length - 1;
      let lastChunk = chunks[lastIdx];
      if (!/[।?!.,]$/.test(lastChunk)) {
        lastChunk += this.isHindiText(lastChunk) ? '।' : '.';
        chunks[lastIdx] = lastChunk;
      }
    }

    return chunks.filter((c) => c.length >= 2);
  }

  /**
   * Start a new real-time streaming TTS session.
   */
  public startStreamingSession(): void {
    if (typeof window === 'undefined' || !this.isTtsEnabled) {
      return;
    }
    this.stopSpeaking();
    this.streamingBuffer = '';
    this.sentenceQueue = [];
    this.isStreamingActive = true;
    this.isCurrentUtterancePlaying = false;
    this.hasSpokenInCurrentSession = false;
    this.setSpeaking(true);
  }

  /**
   * Feed a new streaming delta token/chunk from the SSE endpoint.
   */
  public feedStreamingChunk(chunk: string): void {
    if (!this.isTtsEnabled || typeof window === 'undefined') {
      return;
    }
    if (!chunk) return;

    if (
      chunk.includes('```') ||
      chunk.includes('json_actions') ||
      chunk.includes('json_prompts') ||
      chunk.includes('"type"') ||
      chunk.includes('"action"') ||
      chunk.includes('"emotion"')
    ) {
      return;
    }

    this.streamingBuffer += chunk;

    if (this.streamingBuffer.includes('```')) {
      const parts = this.streamingBuffer.split('```');
      this.streamingBuffer = parts[0] || '';
    }

    const delimiterRegex = /([।?!;\n]|\.\s+|,\s*|:\s*)/;
    let match = delimiterRegex.exec(this.streamingBuffer);

    const isFirstChunk = !this.hasSpokenInCurrentSession && this.sentenceQueue.length === 0;
    const thresholdWords = isFirstChunk ? 5 : 14;
    let wordCount = this.streamingBuffer.trim().split(/\s+/).filter(Boolean).length;

    while (match || wordCount >= thresholdWords) {
      let candidate = '';
      if (match) {
        const splitIndex = match.index + match[0].length;
        candidate = this.streamingBuffer.slice(0, splitIndex).trim();
        this.streamingBuffer = this.streamingBuffer.slice(splitIndex);
      } else {
        const words = this.streamingBuffer.trim().split(/\s+/);
        const take = Math.min(words.length, isFirstChunk ? 5 : 12);
        candidate = words.slice(0, take).join(' ');
        this.streamingBuffer = words.slice(take).join(' ');
      }

      if (candidate.length > 0 && !candidate.startsWith('{') && !candidate.startsWith('[') && !candidate.includes('"type"')) {
        const subChunks = this.splitIntoSpokenChunks(candidate);
        for (const sc of subChunks) {
          if (sc && sc.length >= 2 && !sc.startsWith('{') && !sc.startsWith('[')) {
            this.sentenceQueue.push(sc);
          }
        }
      }

      if (!this.isCurrentUtterancePlaying && !this.isFallbackAudioPlaying && this.sentenceQueue.length > 0) {
        this.playNextQueuedSentence();
      }

      match = delimiterRegex.exec(this.streamingBuffer);
      wordCount = this.streamingBuffer.trim().split(/\s+/).filter(Boolean).length;
      const nextThreshold = (!this.hasSpokenInCurrentSession && this.sentenceQueue.length === 0) ? 5 : 14;
      if (!match && wordCount < nextThreshold) break;
    }
  }

  /**
   * Conclude the streaming session once SSE reader completes.
   */
  public finishStreamingSession(): void {
    if (!this.isTtsEnabled || typeof window === 'undefined') {
      return;
    }
    this.isStreamingActive = false;

    if (this.streamingBuffer.trim()) {
      const remainingChunks = this.splitIntoSpokenChunks(this.streamingBuffer);
      this.streamingBuffer = '';
      for (const rc of remainingChunks) {
        if (rc && rc.length >= 2) {
          this.sentenceQueue.push(rc);
        }
      }
      if (!this.isCurrentUtterancePlaying && !this.isFallbackAudioPlaying && this.sentenceQueue.length > 0) {
        this.playNextQueuedSentence();
      }
    }

    if (
      this.sentenceQueue.length === 0 &&
      !this.isCurrentUtterancePlaying &&
      !this.isFallbackAudioPlaying &&
      !this.pendingPlayTimer
    ) {
      this.hasSpokenInCurrentSession = false;
      this.setSpeaking(false);
      this.stopHeartbeat();
    }
  }

  private startLongUtteranceKeepAlive(): void {
    this.stopHeartbeat();
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    // Only needed for Chrome's ~15s single-utterance stall; don't disturb short phrases
    this.heartbeatTimer = setTimeout(() => {
      try {
        if (typeof window !== 'undefined' && 'speechSynthesis' in window && window.speechSynthesis.speaking) {
          if (window.speechSynthesis.paused) {
            window.speechSynthesis.resume();
          } else {
            window.speechSynthesis.pause();
            setTimeout(() => {
              if (typeof window !== 'undefined' && 'speechSynthesis' in window && window.speechSynthesis.paused) {
                window.speechSynthesis.resume();
              }
            }, 30);
          }
          this.startLongUtteranceKeepAlive();
        }
      } catch {}
    }, 11500);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearTimeout(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  private clearWatchdogs(): void {
    if (this.chunkWatchdogTimer) {
      clearTimeout(this.chunkWatchdogTimer);
      this.chunkWatchdogTimer = null;
    }
    if (this.startWatchdogTimer) {
      clearTimeout(this.startWatchdogTimer);
      this.startWatchdogTimer = null;
    }
  }

  private clearPendingPlayTimer(): void {
    if (this.pendingPlayTimer) {
      clearTimeout(this.pendingPlayTimer);
      this.pendingPlayTimer = null;
    }
  }

  private stopFallbackAudio(): void {
    if (this.activeAudioElement) {
      try {
        this.activeAudioElement.pause();
        this.activeAudioElement.src = '';
      } catch {}
      this.activeAudioElement = null;
    }
    this.isFallbackAudioPlaying = false;
  }

  /**
   * Plays a chunk via server-side /api/tts (Gemini audio WAV) when Web Speech API
   * is unavailable, muted by browser, or stalls without voices.
   */
  private async playViaServerTts(chunkText: string, token: number): Promise<boolean> {
    if (typeof window === 'undefined' || token !== this.sessionToken) return false;
    try {
      this.isFallbackAudioPlaying = true;
      this.setSpeaking(true);

      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: chunkText }),
      });

      if (token !== this.sessionToken || !res.ok) {
        this.isFallbackAudioPlaying = false;
        return false;
      }

      const data = await res.json();
      if (token !== this.sessionToken || !data?.audioBase64) {
        this.isFallbackAudioPlaying = false;
        return false;
      }

      const mimeType = data.mimeType || 'audio/wav';
      const audio = new Audio(`data:${mimeType};base64,${data.audioBase64}`);
      audio.volume = 1.0;
      this.activeAudioElement = audio;

      await new Promise<void>((resolve) => {
        let settled = false;
        const finish = () => {
          if (settled) return;
          settled = true;
          this.activeAudioElement = null;
          this.isFallbackAudioPlaying = false;
          resolve();
        };

        audio.onended = finish;
        audio.onerror = finish;
        audio.onplay = () => {
          this.hasSpokenInCurrentSession = true;
          this.setSpeaking(true);
        };

        audio.play().catch((err) => {
          console.warn('Fallback audio play blocked:', err);
          finish();
        });

        setTimeout(finish, 25000);
      });

      return true;
    } catch (err) {
      console.warn('Server TTS fallback error:', err);
      this.isFallbackAudioPlaying = false;
      return false;
    }
  }

  /**
   * Plays the next queued chunk smoothly in sequence.
   */
  private playNextQueuedSentence(forceDefaultVoice: boolean = false, retryChunk?: string): void {
    if (typeof window === 'undefined') {
      return;
    }

    const token = this.sessionToken;
    this.clearWatchdogs();
    this.clearPendingPlayTimer();

    // Chrome/Android fix: never invoke speechSynthesis.speak() in the same tick as cancel()
    const msSinceCancel = Date.now() - this.lastCancelAt;
    if (this.lastCancelAt > 0 && msSinceCancel < 90) {
      const delay = 95 - msSinceCancel;
      this.pendingPlayTimer = setTimeout(() => {
        this.pendingPlayTimer = null;
        if (token === this.sessionToken) {
          this.playNextQueuedSentence(forceDefaultVoice, retryChunk);
        }
      }, delay);
      return;
    }

    const nextChunk = retryChunk ?? this.sentenceQueue.shift();
    if (!nextChunk || !nextChunk.trim()) {
      if (this.sentenceQueue.length > 0) {
        this.playNextQueuedSentence();
        return;
      }
      this.isCurrentUtterancePlaying = false;
      this.currentUtterance = null;
      if (!this.isStreamingActive) {
        this.hasSpokenInCurrentSession = false;
        this.setSpeaking(false);
        this.stopHeartbeat();
      }
      return;
    }

    const hasWebSpeech = 'speechSynthesis' in window && !this.webSpeechUnavailable;
    if (!hasWebSpeech) {
      this.isCurrentUtterancePlaying = true;
      this.setSpeaking(true);
      this.playViaServerTts(nextChunk.trim(), token).then(() => {
        if (token !== this.sessionToken) return;
        this.isCurrentUtterancePlaying = false;
        this.playNextQueuedSentence();
      });
      return;
    }

    try {
      audioSynth.resumeAudio();
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }

      this.ensureVoicesLoaded();
      const utterance = new SpeechSynthesisUtterance(nextChunk.trim());
      const isHindi = this.isHindiText(nextChunk);

      if (forceDefaultVoice) {
        utterance.voice = null;
        utterance.lang = isHindi ? 'hi-IN' : 'en-US';
      } else {
        const systemDefaultVoice =
          this.voices.find((v) => v.default) ||
          (this.voices.length > 0 ? this.voices[0] : null);

        if (isHindi) {
          if (this.selectedHindiVoice) {
            utterance.voice = this.selectedHindiVoice;
            utterance.lang = this.selectedHindiVoice.lang || 'hi-IN';
          } else if (systemDefaultVoice && (systemDefaultVoice.lang?.startsWith('hi') || /hindi/i.test(systemDefaultVoice.name))) {
            utterance.voice = systemDefaultVoice;
            utterance.lang = systemDefaultVoice.lang || 'hi-IN';
          } else {
            utterance.lang = 'hi-IN';
          }
        } else {
          if (this.selectedEnglishVoice) {
            utterance.voice = this.selectedEnglishVoice;
            utterance.lang = this.selectedEnglishVoice.lang || 'en-US';
          } else if (systemDefaultVoice) {
            utterance.voice = systemDefaultVoice;
            utterance.lang = systemDefaultVoice.lang || 'en-US';
          } else {
            utterance.lang = 'en-US';
          }
        }
      }

      utterance.volume = 1.0;
      utterance.rate = 1.05;
      utterance.pitch = 1.0;

      // Retain strong reference so V8 GC cannot prematurely drop callbacks
      this.currentUtterance = utterance;
      this.activeUtterances.add(utterance);
      const win = window as any;
      if (!win.__taraUtterancePool) win.__taraUtterancePool = [];
      win.__taraUtterancePool.push(utterance);
      if (win.__taraUtterancePool.length > 100) {
        win.__taraUtterancePool.shift();
      }
      win.__taraCurrentUtterance = utterance;

      let hasStarted = false;
      let hasFinished = false;

      const handleChunkFinished = () => {
        if (hasFinished || token !== this.sessionToken) return;
        hasFinished = true;
        this.clearWatchdogs();
        this.stopHeartbeat();
        this.activeUtterances.delete(utterance);
        this.isCurrentUtterancePlaying = false;
        this.currentUtterance = null;
        this.playNextQueuedSentence();
      };

      const triggerServerFallbackOrAdvance = () => {
        if (hasFinished || token !== this.sessionToken) return;
        hasFinished = true;
        this.clearWatchdogs();
        this.stopHeartbeat();
        this.activeUtterances.delete(utterance);
        this.currentUtterance = null;
        this.webSpeechUnavailable = true;
        try {
          if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
            window.speechSynthesis.cancel();
            this.lastCancelAt = Date.now();
          }
        } catch {}
        this.playViaServerTts(nextChunk.trim(), token).then(() => {
          if (token !== this.sessionToken) return;
          this.isCurrentUtterancePlaying = false;
          this.playNextQueuedSentence();
        });
      };

      utterance.onstart = () => {
        if (token !== this.sessionToken) return;
        hasStarted = true;
        if (this.startWatchdogTimer) {
          clearTimeout(this.startWatchdogTimer);
          this.startWatchdogTimer = null;
        }
        this.isCurrentUtterancePlaying = true;
        this.hasSpokenInCurrentSession = true;
        this.setSpeaking(true);
        this.startLongUtteranceKeepAlive();
      };

      utterance.onend = () => {
        handleChunkFinished();
      };

      utterance.onerror = (err) => {
        if (hasFinished || token !== this.sessionToken) return;
        if (err.error === 'canceled' || err.error === 'interrupted') {
          handleChunkFinished();
          return;
        }
        console.warn('Utterance error encountered:', err.error);
        // If named voice failed, retry once with native default synthesizer (voice = null)
        if (!forceDefaultVoice && utterance.voice !== null) {
          hasFinished = true;
          this.clearWatchdogs();
          this.stopHeartbeat();
          this.activeUtterances.delete(utterance);
          this.isCurrentUtterancePlaying = false;
          this.currentUtterance = null;
          this.playNextQueuedSentence(true, nextChunk);
          return;
        }
        triggerServerFallbackOrAdvance();
      };

      // Startup stall guard: if onstart never fires within 2.2s, recover instead of staying silent
      this.startWatchdogTimer = setTimeout(() => {
        if (hasStarted || hasFinished || token !== this.sessionToken) return;
        try {
          if (window.speechSynthesis.paused) {
            window.speechSynthesis.resume();
          }
        } catch {}

        setTimeout(() => {
          if (hasStarted || hasFinished || token !== this.sessionToken) return;
          if (!window.speechSynthesis.speaking) {
            if (!forceDefaultVoice && utterance.voice !== null) {
              hasFinished = true;
              this.clearWatchdogs();
              this.activeUtterances.delete(utterance);
              this.isCurrentUtterancePlaying = false;
              this.currentUtterance = null;
              try {
                window.speechSynthesis.cancel();
                this.lastCancelAt = Date.now();
              } catch {}
              this.playNextQueuedSentence(true, nextChunk);
            } else {
              triggerServerFallbackOrAdvance();
            }
          }
        }, 450);
      }, 2000);

      // End safety watchdog (prevents stuck isSpeaking if browser drops onend)
      this.chunkWatchdogTimer = setTimeout(() => {
        if (!hasFinished && token === this.sessionToken && this.currentUtterance === utterance) {
          if (!window.speechSynthesis.speaking) {
            handleChunkFinished();
          } else {
            this.chunkWatchdogTimer = setTimeout(() => {
              if (!hasFinished && token === this.sessionToken && this.currentUtterance === utterance) {
                handleChunkFinished();
              }
            }, 12000);
          }
        }
      }, 25000);

      this.isCurrentUtterancePlaying = true;
      this.setSpeaking(true);
      window.speechSynthesis.speak(utterance);

      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
    } catch (err) {
      console.warn('Queue speak error:', err);
      this.isCurrentUtterancePlaying = false;
      this.playNextQueuedSentence();
    }
  }

  /**
   * Speak full text with automatic sentence & clause chunking.
   */
  public speak(text: string, force: boolean = false): void {
    if ((!this.isTtsEnabled && !force) || typeof window === 'undefined') {
      return;
    }

    const chunks = this.splitIntoSpokenChunks(text);
    if (chunks.length === 0) return;

    try {
      this.stopSpeaking();
      this.sentenceQueue = [...chunks];
      this.isStreamingActive = false;
      this.hasSpokenInCurrentSession = false;
      this.setSpeaking(true);
      this.playNextQueuedSentence();
    } catch (err) {
      console.warn('Speech synthesis error:', err);
      this.hasSpokenInCurrentSession = false;
      this.setSpeaking(false);
    }
  }

  public speakHindi(text: string, force: boolean = false): void {
    this.speak(text, force);
  }

  public hasActiveSessionOrSpeech(): boolean {
    return (
      this.isSpeaking ||
      this.isCurrentUtterancePlaying ||
      this.isFallbackAudioPlaying ||
      this.sentenceQueue.length > 0 ||
      this.isStreamingActive ||
      Boolean(this.pendingPlayTimer) ||
      (typeof window !== 'undefined' &&
        'speechSynthesis' in window &&
        (window.speechSynthesis.speaking || window.speechSynthesis.pending))
    );
  }

  public stopSpeaking(): void {
    this.sessionToken++;
    this.clearWatchdogs();
    this.clearPendingPlayTimer();
    this.stopHeartbeat();
    this.stopFallbackAudio();

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        if (
          window.speechSynthesis.speaking ||
          window.speechSynthesis.pending ||
          this.isCurrentUtterancePlaying ||
          this.activeUtterances.size > 0
        ) {
          window.speechSynthesis.cancel();
          this.lastCancelAt = Date.now();
        }
      } catch {}
    }

    this.activeUtterances.clear();
    this.currentUtterance = null;
    this.sentenceQueue = [];
    this.streamingBuffer = '';
    this.isStreamingActive = false;
    this.isCurrentUtterancePlaying = false;
    this.hasSpokenInCurrentSession = false;
    this.setSpeaking(false);
  }

  public cancel(): void {
    this.stopSpeaking();
  }

  public toggleTts(): boolean {
    this.unlockSpeech();
    this.isTtsEnabled = !this.isTtsEnabled;
    try {
      localStorage.setItem('tara_tts_enabled', JSON.stringify(this.isTtsEnabled));
    } catch {}

    if (!this.isTtsEnabled) {
      this.stopSpeaking();
    } else {
      this.speak('स्पीकर चालू है Boss, बोलो क्या बात करनी है?', true);
    }
    return this.isTtsEnabled;
  }

  public getIsTtsEnabled(): boolean {
    return this.isTtsEnabled;
  }

  public getIsSpeaking(): boolean {
    return this.isSpeaking;
  }

  public onSpeakingChange(callback: (isSpeaking: boolean) => void): () => void {
    this.speakingListeners.push(callback);
    return () => {
      this.speakingListeners = this.speakingListeners.filter((cb) => cb !== callback);
    };
  }

  private setSpeaking(state: boolean) {
    if (this.isSpeaking !== state) {
      this.isSpeaking = state;
      this.speakingListeners.forEach((cb) => {
        try {
          cb(state);
        } catch {}
      });
    }
  }
}

export const speechEngine = new SpeechEngine();
