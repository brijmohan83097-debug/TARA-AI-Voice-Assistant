/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type EmotionState = 'calm' | 'happy' | 'empathy';

export interface EmotionProfile {
  id: EmotionState;
  labelHi: string;
  labelEn: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  dotColor: string;
  glowColor: string;
  ringGradient: string;
  speechRate: number;
  speechPitch: number;
  description: string;
}

export const EMOTION_PROFILES: Record<EmotionState, EmotionProfile> = {
  calm: {
    id: 'calm',
    labelHi: 'शांत व मददगार',
    labelEn: 'Calm & Caring',
    badgeBg: 'bg-emerald-950/80',
    badgeBorder: 'border-emerald-500/40',
    badgeText: 'text-emerald-300',
    dotColor: 'bg-emerald-400',
    glowColor: 'rgba(16, 185, 129, 0.55)',
    ringGradient: 'from-emerald-500 via-teal-400 to-cyan-400',
    speechRate: 1.0,
    speechPitch: 1.02,
    description: 'सहज, शांत और मददगार मित्रवत अंदाज़',
  },
  happy: {
    id: 'happy',
    labelHi: 'खुश व उत्साहित',
    labelEn: 'Happy & Joyful',
    badgeBg: 'bg-amber-950/80',
    badgeBorder: 'border-amber-500/50',
    badgeText: 'text-amber-300',
    dotColor: 'bg-amber-400',
    glowColor: 'rgba(245, 158, 11, 0.65)',
    ringGradient: 'from-amber-500 via-yellow-400 to-orange-400',
    speechRate: 1.04,
    speechPitch: 1.06,
    description: 'उत्साह, उत्सव और चेहरे पर मुस्कान',
  },
  empathy: {
    id: 'empathy',
    labelHi: 'हमदर्द व दोस्त',
    labelEn: 'Supportive & Loving',
    badgeBg: 'bg-purple-950/80',
    badgeBorder: 'border-pink-500/50',
    badgeText: 'text-pink-300',
    dotColor: 'bg-pink-400',
    glowColor: 'rgba(236, 72, 153, 0.65)',
    ringGradient: 'from-pink-500 via-purple-500 to-rose-400',
    speechRate: 0.94,
    speechPitch: 0.98,
    description: 'सच्चा अपनापन, हौसला और आत्मीय दिलासा',
  },
};

/**
 * Detect user emotional tone from speech text
 */
export function detectEmotionFromText(text: string, current: EmotionState = 'calm'): EmotionState {
  if (!text) return current;
  const lower = text.toLowerCase();

  // 1. Sadness, Exhaustion, Stress, Pain, Worry -> Empathy & Caring
  if (
    /(?:थक\s*गया|थक\s*गई|थका\s*हुआ|थकान|टेंशन|tension|परेशान|pareshan|चिंता|chinta|तनाव|दर्द|sir\s*dard|सिर\s*दर्द|मूड\s*खराब|उदास|sad|dukhi|दुखी|हिम्मत\s*नहीं|मुश्किल|problem|मुसीबत|हालत\s*खराब|बेहाल|अकेला|lonely|रो\s*रहा|upset|exhausted|tired)/i.test(
      lower
    )
  ) {
    return 'empathy';
  }

  // 2. Happiness, Excitement, Victory, Praise, Celebration -> Happy & Joyful
  if (
    /(?:खुश|happy|मज़ा\s*आ\s*गया|जीत\s*गए|congrats|बधाई|party|पार्टी|कमाल|शानदार|shaandar|बढ़िया|badhiya|सुपर|superb|डील\s*पक्की|एडवांस\s*मिल\s*गया|hurray|अरे\s*वाह|wah|मस्त|लव\s*यू|love\s*you|great|awesome|excited|उत्सुक|खुशखबरी)/i.test(
      lower
    )
  ) {
    return 'happy';
  }

  // 3. Calming, friendly, normal queries -> Calm
  if (/(?:शांत|calm|normal|relax|आराम|theek|सब\s*ठीक)/i.test(lower)) {
    return 'calm';
  }

  // Otherwise retain or stay in calm
  return current;
}
