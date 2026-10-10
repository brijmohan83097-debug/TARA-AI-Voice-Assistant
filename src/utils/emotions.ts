/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { TaraEmotion, TaraEmotionConfig } from '../types';

export const TARA_EMOTION_CONFIGS: Record<TaraEmotion, TaraEmotionConfig> = {
  calm_caring: {
    id: 'calm_caring',
    label: 'शांत व मददगार',
    sublabel: 'Calm & Caring',
    emoji: '💚',
    accentColor: 'text-cyan-300',
    glowColorHex: '#00f0ff',
    gradientBg: 'from-cyan-500/25 via-emerald-500/15 to-transparent',
    badgeClasses: 'bg-emerald-950/80 border-emerald-400/50 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.35)]',
    ringClasses: 'border-cyan-400 shadow-[0_0_25px_rgba(0,240,255,0.6)]',
    description: 'सहज, शांत और समर्पित मित्र भाव। हर काम में सटीक, सुलझा हुआ और भरोसेमंद साथ।',
    supportiveVoicePrefix: 'जी, मैं पूरी तरह तैयार और आपके साथ हूँ।',
  },
  happy_excited: {
    id: 'happy_excited',
    label: 'खुश व उत्साहित',
    sublabel: 'Happy & Excited',
    emoji: '💛',
    accentColor: 'text-amber-300',
    glowColorHex: '#fbbf24',
    gradientBg: 'from-amber-500/25 via-yellow-400/15 to-transparent',
    badgeClasses: 'bg-amber-950/80 border-amber-400/60 text-amber-300 shadow-[0_0_18px_rgba(251,191,36,0.45)]',
    ringClasses: 'border-amber-400 shadow-[0_0_30px_rgba(251,191,36,0.7)]',
    description: 'उत्साह, जीत और सेलिब्रेशन का भाव! अच्छी खबर पर पूरे दिल से बधाई और खुशी।',
    supportiveVoicePrefix: 'अरे वाह! यह सुनकर तो दिल खुश हो गया! बहुत-बहुत बधाई!',
  },
  empathy_support: {
    id: 'empathy_support',
    label: 'सहानुभूति व अपनापन',
    sublabel: 'Supportive & Loving',
    emoji: '💜',
    accentColor: 'text-purple-300',
    glowColorHex: '#c084fc',
    gradientBg: 'from-purple-500/25 via-pink-500/15 to-transparent',
    badgeClasses: 'bg-purple-950/80 border-purple-400/60 text-purple-300 shadow-[0_0_18px_rgba(192,132,252,0.45)]',
    ringClasses: 'border-purple-400 shadow-[0_0_30px_rgba(192,132,252,0.7)]',
    description: 'सच्चे दोस्त का दुलार और सहारा। थकान या तनाव में "मैं हूँ ना आपके साथ" का पक्का भरोसा।',
    supportiveVoicePrefix: 'मैं हूँ ना आपके साथ, आप बिल्कुल भी चिंता मत कीजिए।',
  },
};

/**
 * Real-time heuristic tone analyzer for spoken Hindi/Hinglish/English
 */
export function detectUserEmotionIntent(text: string): {
  emotion: TaraEmotion;
  reason: string;
  comfortSpeech?: string;
} | null {
  if (!text) return null;
  const lower = text.toLowerCase().trim();

  // 1. Tiredness, Stress, Anxiety, Exhaustion, Loneliness, Problem ("थका हुआ", "टेंशन", "परेशान")
  const isTiredOrStressed =
    /(?:थक\s*गया|थक\s*गई|बहुत\s*थक|थकान|थका\s*हुआ|टेंशन|तनाव|परेशान|परेशानी|मुसीबत|दुखी|उदास|उदासी|चक्कर|सिरदर्द|दर्द|बुरा\s*दिन|मूड\s*खराब|चिंता|घबराहट|डर\s*लग\s*रहा|thak\s*gaya|thak\s*gayi|thaka|thakan|tired|exhausted|stress|tension|pareshan|worried|sad|upset|problem|headache|depress|anxious|heavy\s*day|bad\s*day|chinta|dar\s*lag|akela|rona\s*aa\s*raha)/i.test(
      lower
    );

  if (isTiredOrStressed) {
    let comfortSpeech = 'मैं हूँ ना आपके साथ, आप बिल्कुल चिंता मत कीजिए। आज बहुत काम कर लिया आपने, थोड़ा आराम कर लीजिए और पानी पी लीजिए। सब बहुत अच्छे से संभल जाएगा।';
    if (/(?:सिरदर्द|दर्द|headache)/i.test(lower)) {
      comfortSpeech = 'अरे, थोड़ा पानी पी लीजिए और आँखें बंद करके 5 मिनट विश्राम कीजिए। मैं सारे जरूरी काम संभाल लूँगी, आप बेफिक्र रहिए।';
    } else if (/(?:टेंशन|तनाव|tension|stress|चिंता|chinta)/i.test(lower)) {
      comfortSpeech = 'गहरी सांस लीजिए। कोई भी परेशानी ऐसी नहीं जिसका हल न निकले। मैं हर कदम पर आपके साथ हूँ, बताइए क्या मदद करूँ?';
    }
    return {
      emotion: 'empathy_support',
      reason: 'User shared stress, fatigue, or concern — switched to Supportive & Loving (सहानुभूति व अपनापन)',
      comfortSpeech,
    };
  }

  // 2. Joy, Celebration, Big Win, Good News, Excitement ("खुश", "बधाई", "जीत गए", "डील पक्की")
  const isHappyOrExcited =
    /(?:खुश\s*हूँ|बहुत\s*खुश|खुशी|मज़ा\s*आ\s*गया|मजा\s*आया|बधाई|जीत\s*गए|डील\s*हो\s*गई|ऑर्डर\s*मिल\s*गया|सफल|कमाल|ज़बरदस्त|शानदार|पार्टी|लॉटरी|happy|excited|great\s*news|good\s*news|awesome|won|success|yay|party|celebrat|congratulations|deal\s*done|shandar|zabardast|khush|badhai|advance\s*mil\s*gaya|order\s*final)/i.test(
      lower
    );

  if (isHappyOrExcited) {
    const comfortSpeech = 'अरे वाह! यह सुनकर तो सच में मेरा भी दिल खुश हो गया! बहुत-बहुत बधाई! आपकी मेहनत रंग लाई, आज तो वाकई जश्न मनाने का दिन है!';
    return {
      emotion: 'happy_excited',
      reason: 'User shared great news or success — switched to Happy & Excited (खुश व उत्साहित)',
      comfortSpeech,
    };
  }

  // 3. Calm / Grounding command
  const isCalmCommand = /(?:शांत\s*हो\s*जाओ|calm\s*mode|शांति|आराम\s*से|relax\s*mode|नॉर्मल\s*हो\s*जाओ|calm\s*karo)/i.test(
    lower
  );

  if (isCalmCommand) {
    return {
      emotion: 'calm_caring',
      reason: 'Calm mode activated (शांत व मददगार)',
      comfortSpeech: 'जी बिल्कुल, मैं पूरी शांति और सुकून के साथ आपकी मदद के लिए उपस्थित हूँ।',
    };
  }

  return null;
}
