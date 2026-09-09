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
    }
  }

  private initVoices() {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return;
    }

    const loadVoices = () => {
      this.voices = window.speechSynthesis.getVoices();
      if (this.voices.length > 0) {
        // Find best Hindi voice
        this.selectedHindiVoice = 
          this.voices.find(v => v.lang === 'hi-IN' || v.lang === 'hi_IN' || v.lang.startsWith('hi')) ||
          this.voices.find(v => v.name.toLowerCase().includes('hindi') || v.name.toLowerCase().includes('india')) ||
          null;

        // Find best English voice
        this.selectedEnglishVoice =
          this.voices.find(v => (v.lang === 'en-IN' || v.lang === 'en-US' || v.lang.startsWith('en')) && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Samantha'))) ||
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
      /\bkripya\b/i, /\btheek\b/i, /\bbolo\b/i, /\bsuno\b/i
    ];
    return hinglishKeywords.some(regex => regex.test(text));
  }

  public cleanTextForSpeech(rawText: string): string {
    if (!rawText) return '';

    // Convert digital time patterns like 7:34, 07:34:20, 7:34 PM, 7:34 AM into spoken Hindi words
    // so TTS engine never mispronounces them as "घंटे" (colons) or skips AM/PM
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

    return normalizedTimeText
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
      // Remove emojis or special tech symbols for cleaner pronunciation
      .replace(/[\u{1F300}-\u{1F9FF}]/gu, '')
      .replace(/[\u{2600}-\u{26FF}]/gu, '')
      .replace(/[\u{2700}-\u{27BF}]/gu, '')
      // Clean duplicate whitespace
      .replace(/\s+/g, ' ')
      .trim();
  }

  public speak(text: string, force: boolean = false): void {
    if ((!this.isTtsEnabled && !force) || typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return;
    }

    const clean = this.cleanTextForSpeech(text);
    if (!clean) return;

    try {
      // Cancel previous speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(clean);
      const isHindi = this.isHindiText(text);

      if (isHindi) {
        utterance.lang = 'hi-IN';
        if (this.selectedHindiVoice) {
          utterance.voice = this.selectedHindiVoice;
        }
        utterance.rate = 0.95; // Slightly measured rate for crystal-clear Hindi pronunciation
        utterance.pitch = 1.05;
      } else {
        utterance.lang = 'en-US';
        if (this.selectedEnglishVoice) {
          utterance.voice = this.selectedEnglishVoice;
        }
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
      }

      utterance.onstart = () => {
        this.setSpeaking(true);
      };

      utterance.onend = () => {
        this.setSpeaking(false);
      };

      utterance.onerror = () => {
        // Speech interrupted or canceled is expected behavior
        this.setSpeaking(false);
      };

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('Speech synthesis error:', err);
      this.setSpeaking(false);
    }
  }

  public stopSpeaking(): void {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      this.setSpeaking(false);
    }
  }

  public toggleTts(): boolean {
    this.isTtsEnabled = !this.isTtsEnabled;
    try {
      localStorage.setItem('tara_tts_enabled', JSON.stringify(this.isTtsEnabled));
    } catch {}

    if (!this.isTtsEnabled) {
      this.stopSpeaking();
    } else {
      this.speak('नमस्ते, मैं तारा हूँ। आपकी आवाज़ सहायक सक्रिय है।', true);
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
    this.isSpeaking = state;
    this.speakingListeners.forEach(cb => cb(state));
  }
}

export const speechEngine = new SpeechEngine();
