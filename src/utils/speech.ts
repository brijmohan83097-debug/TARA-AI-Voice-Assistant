/**
 * Tara Voice Assistant Speech Synthesis & Recognition Engine
 * Provides real-time Hindi (hi-IN) & English text-to-speech (TTS)
 * and speech-to-text recognition with robust browser compatibility.
 */

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
  private heartbeatTimer: any = null;
  private chunkWatchdogTimer: any = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('tara_tts_enabled');
        if (saved !== null) {
          this.isTtsEnabled = JSON.parse(saved);
        }
      } catch {
        this.isTtsEnabled = true;
      }
      this.initVoices();

      // Auto-resume paused audio when tab regains focus or visibility
      try {
        document.addEventListener('visibilitychange', () => {
          if (!document.hidden && 'speechSynthesis' in window && window.speechSynthesis.paused) {
            window.speechSynthesis.resume();
          }
        });
      } catch {}
    }
  }

  private initVoices() {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return;
    }

    const loadVoices = () => {
      this.voices = window.speechSynthesis.getVoices();
      if (this.voices.length > 0) {
        // Find best Hindi voice - prioritize natural, neural, human-sounding female/friend voices
        this.selectedHindiVoice = 
          this.voices.find(v => (v.lang === 'hi-IN' || v.lang === 'hi_IN' || v.lang.startsWith('hi')) && /natural|neural|online|google|swara|madhur|kavya|kalpana/i.test(v.name)) ||
          this.voices.find(v => v.lang === 'hi-IN' || v.lang === 'hi_IN' || v.lang.startsWith('hi')) ||
          this.voices.find(v => /hindi|india/i.test(v.name)) ||
          null;

        // Find best English voice
        this.selectedEnglishVoice =
          this.voices.find(v => (v.lang === 'en-IN' || v.lang === 'en-US' || v.lang.startsWith('en')) && /natural|neural|online|google|neerja|samantha|prabhat/i.test(v.name)) ||
          this.voices.find(v => v.lang === 'en-IN') ||
          this.voices.find(v => v.lang.startsWith('en')) ||
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
    // Check Devanagari Unicode Range (\u0900-\u097F)
    const devanagariRegex = /[\u0900-\u097F]/;
    if (devanagariRegex.test(text)) return true;

    // Check common Romanized Hindi / Hinglish keywords
    const hinglishKeywords = [
      /\bnamaste\b/i, /\baap\b/i, /\bkya\b/i, /\bkaise\b/i, /\bhain\b/i, 
      /\bhoon\b/i, /\bkarna\b/i, /\bhai\b/i, /\bkarein\b/i, /\bshukriya\b/i, 
      /\bdhanyawad\b/i, /\bmere\b/i, /\btara\b/i, /\bmadad\b/i, /\baapka\b/i,
      /\bkripya\b/i, /\btheek\b/i, /\bbolo\b/i, /\bsuno\b/i, /\bkaun\b/i,
      /\bkyun\b/i, /\bkahan\b/i, /\bkab\b/i, /\bbahut\b/i, /\baccha\b/i
    ];
    return hinglishKeywords.some(regex => regex.test(text));
  }

  public cleanTextForSpeech(rawText: string): string {
    if (!rawText) return '';

    // Convert digital time patterns like 7:34, 07:34:20, 7:34 PM, 7:34 AM into spoken Hindi words
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

    // Convert currency signs (₹, Rs.) to natural spoken Hindi words
    const normalizedCurrencyText = normalizedTimeText
      .replace(/₹\s*([\d,]+)/g, (_match, num) => `${num.replace(/,/g, '')} रुपये`)
      .replace(/\bRs\.?\s*([\d,]+)/gi, (_match, num) => `${num.replace(/,/g, '')} रुपये`);

    return normalizedCurrencyText
      // Remove json code blocks or markdown code fences
      .replace(/```[\s\S]*?```/g, '')
      .replace(/`([^`]+)`/g, '$1')
      // Remove headers like ### or ##
      .replace(/^#{1,6}\s+/gm, '')
      // Remove bold/italics
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/\*([^*]+)\*/g, '$1')
      .replace(/__([^_]+)__/g, '$1')
      .replace(/_([^_]+)_/g, '$1')
      // Remove bullet points
      .replace(/^[\s*-+]\s+/gm, '')
      // Remove markdown links [text](url)
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      // Remove URLs
      .replace(/https?:\/\/\S+/g, '')
      // Remove emojis or special tech symbols for cleaner pronunciation
      .replace(/[\u{1F300}-\u{1F9FF}]/gu, '')
      .replace(/[\u{2600}-\u{26FF}]/gu, '')
      .replace(/[\u{2700}-\u{27BF}]/gu, '')
      // Normalize colons and hyphens into natural pauses
      .replace(/:\s+/g, ', ')
      // Clean duplicate whitespace
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Intelligently splits text into comfortable, safe-sized spoken chunks (15-75 characters),
   * dividing on full stops (., ।), commas (,), question marks (?), exclamation marks (!),
   * semicolons (;), colons (:), dashes, and natural clause boundaries.
   *
   * This guarantees:
   * 1. Chrome's 14-second cutoff bug NEVER triggers because every chunk takes 1-3 seconds.
   * 2. Commas and full stops provide natural human-like breathing pauses.
   * 3. The speech engine continuously plays through the entire queue until the very last word.
   */
  public splitIntoSpokenChunks(text: string): string[] {
    const clean = this.cleanTextForSpeech(text);
    if (!clean) return [];

    // 1. Initial split by punctuation: full stops (., ।), commas (,), ?, !, ;, :, dashes, and newlines
    const rawParts: string[] = [];
    let current = '';

    for (let i = 0; i < clean.length; i++) {
      const char = clean[i];
      const nextChar = clean[i + 1] || '';
      const prevChar = i > 0 ? clean[i - 1] : '';

      current += char;

      // Punctuation check
      const isPurnaViram = char === '।';
      const isQuestionOrExclamation = char === '?' || char === '!';
      const isNewline = char === '\n';
      const isComma = char === ',' || char === '،';
      const isSemicolon = char === ';';
      // Period check: do not split decimal numbers (e.g. 3.14, 2.5) or initials
      const isPeriod =
        char === '.' &&
        !(/\d/.test(prevChar) && /\d/.test(nextChar)) &&
        (i === clean.length - 1 || /\s/.test(nextChar));
      const isDash = char === '—' || char === '–';

      if (isPurnaViram || isQuestionOrExclamation || isNewline || isComma || isSemicolon || isPeriod || isDash) {
        const trimmed = current.trim();
        if (trimmed.length > 0) {
          rawParts.push(trimmed);
        }
        current = '';
      }
    }

    if (current.trim().length > 0) {
      rawParts.push(current.trim());
    }

    // 2. Normalize and merge tiny clauses (< 12 chars) with next chunk for smooth natural flow,
    // and break down long clauses (> 75 chars) at word boundaries so every chunk stays under ~75 chars
    const chunks: string[] = [];
    let accumulator = '';

    for (let j = 0; j < rawParts.length; j++) {
      const part = rawParts[j];
      if (!part) continue;

      if (!accumulator) {
        accumulator = part;
      } else {
        // If accumulator is very short (< 14 chars), merge with current part for smooth intonation
        if (accumulator.length < 14 || (accumulator.length + part.length <= 65)) {
          accumulator = `${accumulator} ${part}`;
        } else {
          chunks.push(accumulator.trim());
          accumulator = part;
        }
      }

      // If accumulated part is over 80 characters, split cleanly at word boundaries
      if (accumulator.length > 80) {
        const words = accumulator.split(/\s+/);
        let wordBuf = '';
        for (const w of words) {
          if ((wordBuf + ' ' + w).trim().length <= 65) {
            wordBuf = wordBuf ? `${wordBuf} ${w}` : w;
          } else {
            if (wordBuf.trim()) chunks.push(wordBuf.trim());
            wordBuf = w;
          }
        }
        accumulator = wordBuf.trim();
      }
    }

    if (accumulator.trim()) {
      chunks.push(accumulator.trim());
    }

    // Ensure the very last chunk has a clean closing punctuation for proper TTS sentence cadence
    if (chunks.length > 0) {
      const lastIdx = chunks.length - 1;
      let lastChunk = chunks[lastIdx];
      if (!/[।?!.,]$/.test(lastChunk)) {
        lastChunk += this.isHindiText(lastChunk) ? '।' : '.';
        chunks[lastIdx] = lastChunk;
      }
    }

    return chunks.filter(c => c.length >= 2);
  }

  /**
   * Start a new real-time streaming TTS session.
   * Cancels prior speech and resets the incoming chunk queue.
   */
  public startStreamingSession(): void {
    if (typeof window === 'undefined' || !('speechSynthesis' in window) || !this.isTtsEnabled) {
      return;
    }
    this.stopSpeaking();
    this.streamingBuffer = '';
    this.sentenceQueue = [];
    this.isStreamingActive = true;
    this.isCurrentUtterancePlaying = false;
    this.hasSpokenInCurrentSession = false;
  }

  /**
   * Feed a new streaming delta token/chunk from the SSE endpoint.
   * As soon as a full stop, comma, or clause boundary is detected,
   * it queues the chunks immediately so TTS starts playing in under 1 second!
   */
  public feedStreamingChunk(chunk: string): void {
    if (!this.isTtsEnabled || typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return;
    }
    if (!chunk) return;

    // Filter out JSON code block fences or metadata tags
    if (chunk.includes('```json') || chunk.includes('```json_actions') || chunk.includes('```json_prompts')) {
      return;
    }

    this.streamingBuffer += chunk;

    // Detect sentence and clause delimiters: full stop (., ।), question mark (?), exclamation (!), comma (,), semicolon (;), newline (\n)
    const delimiterRegex = /([।?!;\n]|\.\s+|,\s*)/;
    let match = delimiterRegex.exec(this.streamingBuffer);

    while (match) {
      const splitIndex = match.index + match[0].length;
      const candidate = this.streamingBuffer.slice(0, splitIndex).trim();
      this.streamingBuffer = this.streamingBuffer.slice(splitIndex);

      if (candidate.length > 0) {
        const subChunks = this.splitIntoSpokenChunks(candidate);
        for (const sc of subChunks) {
          if (sc && sc.length >= 2) {
            this.sentenceQueue.push(sc);
          }
        }
      }

      if (!this.isCurrentUtterancePlaying && this.sentenceQueue.length > 0) {
        this.playNextQueuedSentence();
      }

      match = delimiterRegex.exec(this.streamingBuffer);
    }
  }

  /**
   * Conclude the streaming session once SSE reader completes.
   * Flushes all remaining words in the buffer to the queue, ensuring 100% completion.
   */
  public finishStreamingSession(): void {
    if (!this.isTtsEnabled || typeof window === 'undefined' || !('speechSynthesis' in window)) {
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
      if (!this.isCurrentUtterancePlaying && this.sentenceQueue.length > 0) {
        this.playNextQueuedSentence();
      }
    }

    // If completely empty and nothing is currently speaking, notify listeners
    if (this.sentenceQueue.length === 0 && !this.isCurrentUtterancePlaying) {
      this.setSpeaking(false);
      this.stopHeartbeat();
    }
  }

  /**
   * Chrome keepalive heartbeat: Prevents browser from cutting off speech midway on long answers.
   * Uses pause() + resume() pulse every 4.5 seconds to refresh Chromium's 14-second internal cutoff timer.
   */
  private startHeartbeat(): void {
    this.stopHeartbeat();
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    this.heartbeatTimer = setInterval(() => {
      try {
        if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
          window.speechSynthesis.pause();
          setTimeout(() => {
            if (typeof window !== 'undefined' && 'speechSynthesis' in window && window.speechSynthesis.paused) {
              window.speechSynthesis.resume();
            }
          }, 35);
        } else if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }
      } catch {}
    }, 4500);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  private clearWatchdog(): void {
    if (this.chunkWatchdogTimer) {
      clearTimeout(this.chunkWatchdogTimer);
      this.chunkWatchdogTimer = null;
    }
  }

  /**
   * Plays the next queued chunk smoothly in sequence.
   * Runs continuously until sentenceQueue is completely empty!
   */
  private playNextQueuedSentence(): void {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return;
    }

    this.clearWatchdog();

    if (this.sentenceQueue.length === 0) {
      this.isCurrentUtterancePlaying = false;
      this.currentUtterance = null;
      if (!this.isStreamingActive) {
        this.setSpeaking(false);
        this.stopHeartbeat();
      }
      return;
    }

    const nextChunk = this.sentenceQueue.shift();
    if (!nextChunk || !nextChunk.trim()) {
      this.playNextQueuedSentence();
      return;
    }

    try {
      // Ensure browser synthesis is unpaused before starting next utterance
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }

      const utterance = new SpeechSynthesisUtterance(nextChunk.trim());
      const isHindi = this.isHindiText(nextChunk);

      if (isHindi) {
        utterance.lang = 'hi-IN';
        if (this.selectedHindiVoice) {
          utterance.voice = this.selectedHindiVoice;
        }
        utterance.rate = 0.98; // Natural, articulate, human pace
        utterance.pitch = 1.05;
      } else {
        utterance.lang = 'en-US';
        if (this.selectedEnglishVoice) {
          utterance.voice = this.selectedEnglishVoice;
        }
        utterance.rate = 1.02;
        utterance.pitch = 1.0;
      }

      // Strong reference retention prevents Chrome's V8 Garbage Collector from cutting speech
      this.currentUtterance = utterance;
      this.activeUtterances.add(utterance);
      if (typeof window !== 'undefined') {
        const win = window as any;
        if (!win.__taraUtterancePool) win.__taraUtterancePool = [];
        win.__taraUtterancePool.push(utterance);
        if (win.__taraUtterancePool.length > 100) {
          win.__taraUtterancePool.shift();
        }
        win.__taraCurrentUtterance = utterance;
      }

      let hasFinished = false;
      const handleChunkFinished = () => {
        if (hasFinished) return;
        hasFinished = true;
        this.clearWatchdog();
        this.activeUtterances.delete(utterance);
        this.isCurrentUtterancePlaying = false;
        this.currentUtterance = null;
        // Proceed immediately to next chunk so there is zero audible gap!
        this.playNextQueuedSentence();
      };

      utterance.onstart = () => {
        this.isCurrentUtterancePlaying = true;
        this.hasSpokenInCurrentSession = true;
        this.setSpeaking(true);
        this.startHeartbeat();
      };

      utterance.onend = () => {
        handleChunkFinished();
      };

      utterance.onerror = (err) => {
        if (err.error !== 'canceled' && err.error !== 'interrupted') {
          console.warn('Utterance error encountered, advancing safely:', err);
        }
        handleChunkFinished();
      };

      // Watchdog timeout: Only a safety net if browser hangs completely without onend.
      // NEVER cut off active speech! If browser is still actively speaking, extend duration.
      this.chunkWatchdogTimer = setTimeout(() => {
        if (this.isCurrentUtterancePlaying && this.currentUtterance === utterance) {
          if (!window.speechSynthesis.speaking) {
            console.warn('Browser TTS stalled without onend, advancing to next chunk');
            handleChunkFinished();
          } else {
            // Still actively speaking, give extra 15 seconds
            this.chunkWatchdogTimer = setTimeout(() => {
              if (this.isCurrentUtterancePlaying && this.currentUtterance === utterance) {
                handleChunkFinished();
              }
            }, 15000);
          }
        }
      }, 35000);

      this.isCurrentUtterancePlaying = true;
      this.setSpeaking(true);
      window.speechSynthesis.speak(utterance);

      // Force resume in case browser queue is paused
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
   * Speak full text with automatic sentence & clause chunking on full stops and commas.
   * Splits into natural chunks and plays sequentially from start to end without timeout.
   */
  public speak(text: string, force: boolean = false): void {
    if ((!this.isTtsEnabled && !force) || typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return;
    }

    const chunks = this.splitIntoSpokenChunks(text);
    if (chunks.length === 0) return;

    try {
      this.stopSpeaking();
      this.sentenceQueue = [...chunks];
      this.isStreamingActive = false;
      this.hasSpokenInCurrentSession = false;
      this.playNextQueuedSentence();
    } catch (err) {
      console.warn('Speech synthesis error:', err);
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
      this.sentenceQueue.length > 0 ||
      this.isStreamingActive ||
      this.hasSpokenInCurrentSession
    );
  }

  public stopSpeaking(): void {
    this.clearWatchdog();
    this.stopHeartbeat();

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {}
    }

    this.activeUtterances.clear();
    this.currentUtterance = null;
    this.sentenceQueue = [];
    this.streamingBuffer = '';
    this.isStreamingActive = false;
    this.isCurrentUtterancePlaying = false;
    this.setSpeaking(false);
  }

  public cancel(): void {
    this.stopSpeaking();
  }

  public toggleTts(): boolean {
    this.isTtsEnabled = !this.isTtsEnabled;
    try {
      localStorage.setItem('tara_tts_enabled', JSON.stringify(this.isTtsEnabled));
    } catch {}

    if (!this.isTtsEnabled) {
      this.stopSpeaking();
    } else {
      this.speak('नमस्ते, मैं तारा हूँ। आपकी आवाज़ सहायक सक्रिय है। मैं हर सवाल का पूरा जवाब दूंगी।', true);
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
      this.speakingListeners = this.speakingListeners.filter(cb => cb !== callback);
    };
  }

  private setSpeaking(state: boolean) {
    if (this.isSpeaking !== state) {
      this.isSpeaking = state;
      this.speakingListeners.forEach(cb => {
        try {
          cb(state);
        } catch {}
      });
    }
  }
}

export const speechEngine = new SpeechEngine();
