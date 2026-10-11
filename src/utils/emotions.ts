/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { TaraEmotion, TaraEmotionConfig } from '../types';

export const TARA_EMOTION_CONFIGS: Record<TaraEmotion, TaraEmotionConfig> = {
  calm_caring: {
    id: 'calm_caring',
    label: 'शांत व मददगार',
    sublabel: 'Calm & Caring (Green/Blue)',
    emoji: '💚',
    accentColor: 'text-cyan-300',
    glowColorHex: '#00f0ff',
    gradientBg: 'from-cyan-500/25 via-emerald-500/15 to-transparent',
    badgeClasses: 'bg-emerald-950/80 border-emerald-400/50 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.35)]',
    ringClasses: 'border-cyan-400 shadow-[0_0_25px_rgba(0,240,255,0.6)]',
    description: 'सहज, शांत और समर्पित मित्र भाव। हर काम में सटीक, सुलझा हुआ और भरोसेमंद साथ।',
    supportiveVoicePrefix: 'जी Boss, मैं पूरी तरह तैयार और आपके साथ हूँ।',
    speakingButtonGradient: 'bg-gradient-to-tr from-cyan-600 via-teal-500 to-emerald-400 border-2 border-cyan-300 shadow-[0_0_55px_rgba(0,240,255,0.95)]',
    speakingAudioBars: 'bg-gradient-to-t from-cyan-500 via-teal-400 to-emerald-300',
    speakingAmbientGlow: 'radial-gradient(circle, rgba(0, 240, 255, 0.65) 0%, rgba(16, 185, 129, 0.35) 50%, transparent 70%)',
    speakingShockwaveClass: 'border-2 border-cyan-400/90 shadow-[0_0_45px_rgba(0,240,255,0.85)]',
  },
  happy_excited: {
    id: 'happy_excited',
    label: 'खुश व उत्साहित',
    sublabel: 'Happy & Excited (Golden)',
    emoji: '💛',
    accentColor: 'text-amber-300',
    glowColorHex: '#fbbf24',
    gradientBg: 'from-amber-500/25 via-yellow-400/15 to-transparent',
    badgeClasses: 'bg-amber-950/80 border-amber-400/60 text-amber-300 shadow-[0_0_18px_rgba(251,191,36,0.45)]',
    ringClasses: 'border-amber-400 shadow-[0_0_30px_rgba(251,191,36,0.7)]',
    description: 'उत्साह, जीत और सेलिब्रेशन का भाव! अच्छी खबर पर पूरे दिल से बधाई और खुशी।',
    supportiveVoicePrefix: 'अरे वाह Boss! यह सुनकर तो दिल खुश हो गया! बहुत-बहुत बधाई!',
    speakingButtonGradient: 'bg-gradient-to-tr from-amber-600 via-yellow-500 to-amber-300 border-2 border-yellow-200 shadow-[0_0_55px_rgba(251,191,36,0.95)]',
    speakingAudioBars: 'bg-gradient-to-t from-amber-600 via-yellow-400 to-amber-200',
    speakingAmbientGlow: 'radial-gradient(circle, rgba(251, 191, 36, 0.75) 0%, rgba(245, 158, 11, 0.4) 50%, transparent 70%)',
    speakingShockwaveClass: 'border-2 border-amber-400/90 shadow-[0_0_45px_rgba(251,191,36,0.85)]',
  },
  empathy_support: {
    id: 'empathy_support',
    label: 'सहानुभूति व अपनापन',
    sublabel: 'Supportive & Care (Purple)',
    emoji: '💜',
    accentColor: 'text-purple-300',
    glowColorHex: '#c084fc',
    gradientBg: 'from-purple-500/25 via-pink-500/15 to-transparent',
    badgeClasses: 'bg-purple-950/80 border-purple-400/60 text-purple-300 shadow-[0_0_18px_rgba(192,132,252,0.45)]',
    ringClasses: 'border-purple-400 shadow-[0_0_30px_rgba(192,132,252,0.7)]',
    description: 'सच्चे दोस्त का दुलार और सहारा। थकान या तनाव में "मैं हूँ ना Boss, चिंता मत कीजिए" का पक्का भरोसा।',
    supportiveVoicePrefix: 'मैं हूँ ना Boss, चिंता मत कीजिए।',
    speakingButtonGradient: 'bg-gradient-to-tr from-purple-700 via-violet-600 to-fuchsia-400 border-2 border-purple-200 shadow-[0_0_55px_rgba(192,132,252,0.95)]',
    speakingAudioBars: 'bg-gradient-to-t from-purple-600 via-violet-400 to-fuchsia-300',
    speakingAmbientGlow: 'radial-gradient(circle, rgba(192, 132, 252, 0.75) 0%, rgba(168, 85, 247, 0.4) 50%, transparent 70%)',
    speakingShockwaveClass: 'border-2 border-purple-400/90 shadow-[0_0_45px_rgba(192,132,252,0.85)]',
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
    /(?:थक\s*गया|थक\s*गई|बहुत\s*थक|थकान|थका\s*हुआ|टेंशन|तनाव|परेशान|परेशानी|मुसीबत|दुखी|उदास|उदासी|चक्कर|सिरदर्द|दर्द|बुरा\s*दिन|मूड\s*खराब|चिंता|घबराहट|डर\s*लग\s*रहा|thak\s*gaya|thak\s*gayi|thaka|thakan|tired|exhausted|stress|tension|pareshan|worried|sad|upset|problem|headache|depress|anxious|heavy\s*day|bad\s*day|chinta|dar\s*lag|akela|rona\s*aa\s*raha|mood\s*off|pareshani|himmat\s*haar|ghabrahat|mushkil\s*mein|bechaini|tabiyat\s*kharab)/i.test(
      lower
    );

  if (isTiredOrStressed) {
    let comfortSpeech = 'मैं हूँ ना Boss, चिंता मत कीजिए! आज बहुत काम कर लिया आपने, थोड़ा आराम कर लीजिए और पानी पी लीजिए। सब बहुत अच्छे से संभल जाएगा Boss!';
    if (/(?:सिरदर्द|दर्द|headache)/i.test(lower)) {
      comfortSpeech = 'अरे Boss! थोड़ा पानी पी लीजिए और आँखें बंद करके 5 मिनट विश्राम कीजिए। मैं सारे जरूरी काम संभाल लूँगी Boss, आप बेफिक्र रहिए।';
    } else if (/(?:टेंशन|तनाव|tension|stress|चिंता|chinta|घबराहट|pareshan|परेशान)/i.test(lower)) {
      comfortSpeech = 'मैं हूँ ना Boss, चिंता मत कीजिए! गहरी सांस लीजिए। कोई भी परेशानी ऐसी नहीं जिसका हल न निकले। मैं हर कदम पर आपके साथ हूँ Boss, बताइए क्या मदद करूँ?';
    }
    return {
      emotion: 'empathy_support',
      reason: 'User shared stress, fatigue, or concern — switched to Supportive & Loving (Purple Care)',
      comfortSpeech,
    };
  }

  // 2. Joy, Celebration, Big Win, Good News, Excitement ("खुश", "बधाई", "जीत गए", "डील पक्की")
  const isHappyOrExcited =
    /(?:खुश\s*हूँ|बहुत\s*खुश|खुशी|मज़ा\s*आ\s*गया|मजा\s*आया|बधाई|जीत\s*गए|डील\s*हो\s*गई|ऑर्डर\s*मिल\s*गया|सफल|कमाल|ज़बरदस्त|शानदार|पार्टी|लॉटरी|happy|excited|great\s*news|good\s*news|awesome|won|success|yay|party|celebrat|congratulations|deal\s*done|shandar|zabardast|khush|badhai|advance\s*mil\s*gaya|order\s*final|jeet\s*gaye|kamaal\s*kar\s*diya|congrats)/i.test(
      lower
    );

  if (isHappyOrExcited) {
    let comfortSpeech = 'अरे वाह Boss! यह सुनकर तो सच में मेरा भी दिल खुश हो गया! बहुत-बहुत बधाई! आपकी मेहनत रंग लाई, आज तो वाकई जश्न मनाने का दिन है Boss!';
    if (/(?:पार्टी|party|जश्न|celebrat)/i.test(lower)) {
      comfortSpeech = 'वाह Boss! कमाल कर दिया आपने! बहुत-बहुत बधाई! आज तो पार्टी बनती है Boss, कब दे रहे हैं पार्टी? 🎉';
    }
    return {
      emotion: 'happy_excited',
      reason: 'User shared great news or success — switched to Happy & Excited (Golden Khushi)',
      comfortSpeech,
    };
  }

  // 3. Calm / Grounding command ("शांत हो जाओ", "calm mode", "relax")
  const isCalmCommand = /(?:शांत\s*हो\s*जाओ|calm\s*mode|शांति|आराम\s*से|relax\s*mode|नॉर्मल\s*हो\s*जाओ|calm\s*karo|shanti|relax)/i.test(
    lower
  );

  if (isCalmCommand) {
    return {
      emotion: 'calm_caring',
      reason: 'Calm mode activated (Green/Blue Shaant)',
      comfortSpeech: 'जी Boss, बिल्कुल। मैं पूरी शांति, सुकून और तत्परता के साथ आपकी मदद के लिए उपस्थित हूँ।',
    };
  }

  return null;
}
