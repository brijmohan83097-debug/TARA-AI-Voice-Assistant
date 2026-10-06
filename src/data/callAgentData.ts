/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BossCallAlert, CallCategory } from '../types';

export const SPAM_KEYWORDS = [
  'loan',
  'लोन',
  'पर्सनल लोन',
  'क्रेडिट कार्ड',
  'credit card',
  'insurance',
  'बीमा',
  'पॉलिसी',
  'lottery',
  'लॉटरी',
  'mutual fund',
  'शेयर मार्केट',
  'ट्रेडिंग',
  'प्रॉपर्टी इन्वेस्टमेंट',
  'real estate offer',
  'telemarketer',
  'कस्टमर केयर ऑफर',
  'बोनस',
  'रमी',
  'कैसीनो',
  'फ्री गिफ्ट',
];

export function checkIsSpam(text: string): { isSpam: boolean; reason?: string } {
  const lower = text.toLowerCase();
  for (const kw of SPAM_KEYWORDS) {
    if (lower.includes(kw.toLowerCase())) {
      return {
        isSpam: true,
        reason: `स्पैम/प्रमोशनल कॉल पहचान: "${kw}" संबंधित अवांछित कॉल`,
      };
    }
  }
  return { isSpam: false };
}

export const INITIAL_BOSS_ALERTS: BossCallAlert[] = [
  {
    id: 'alert-1',
    callId: 'call-sample-1',
    callerName: 'अमित भार्गव (Amit Bhargava)',
    callerNumber: '+91 98222 33445',
    serviceCategory: 'Shed (शेड्स निर्माण)',
    urgency: 'urgent',
    summary: 'ग्राहक को 1,500 sq ft वेयरहाउस शेड का निर्माण 3 दिन में शुरू कराना है। बजट लगभग ₹2.7L - ₹3.3L है। साइट विज़िट तुरंत अपेक्षित है।',
    customerDemand: '1500 sq ft छत पर हेवी पाइप और टाटा कलर कोटेड शीट का शेड चाहिए। तुरंत नाप लेने आ सकते हैं क्या?',
    siteLocation: 'प्लॉट नं. 18, फेस-2 इंडस्ट्रियल एस्टेट',
    timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    estimatedBudget: '₹2,70,000 - ₹3,30,000',
    status: 'pending',
  },
  {
    id: 'alert-2',
    callId: 'call-sample-2',
    callerName: 'संजय रावत (Sanjay Rawat)',
    callerNumber: '+91 98450 11223',
    serviceCategory: 'Gate (सीएनसी लेजर कट गेट)',
    urgency: 'high',
    summary: 'नए बंगले के लिए 12x8 फुट स्लाइडिंग मेन गेट का डिजाइन कैटलॉग व दर चाहिए। क्लाइंट आज शाम तक बात करना चाहते हैं।',
    customerDemand: 'मॉडर्न सीएनसी लेजर कटिंग वाला 12x8 ft गेट चाहिए। क्या रेट लगेगा और कितने दिन में तैयार होगा?',
    siteLocation: 'सेक्टर-9, डिफेंस एन्क्लेव',
    timestamp: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
    estimatedBudget: '₹28,000 - ₹38,000',
    status: 'pending',
  },
  {
    id: 'alert-3',
    callId: 'call-sample-3',
    callerName: 'पूजा मल्होत्रा (Pooja Malhotra)',
    callerNumber: '+91 99100 88776',
    serviceCategory: 'Railing (SS-304 स्टील रेलिंग)',
    urgency: 'normal',
    summary: '65 रनिंग फुट सीढ़ी व बालकनी रेलिंग के लिए पूछताछ। मास्टर पिलर और 2mm थिकनेस की मांग।',
    customerDemand: 'घर में 65 फुट SS-304 रेलिंग लगवानी है। ₹450 रेट कन्फर्म करना चाहती हैं।',
    siteLocation: 'ग्रीन एवेन्यू, रोड नं. 4',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    estimatedBudget: '₹29,250',
    status: 'reviewed',
  },
];

export interface CallSimulationPreset {
  id: string;
  name: string;
  number: string;
  category: CallCategory;
  categoryLabel: string;
  urgency: 'urgent' | 'high' | 'normal' | 'low';
  firstCustomerStatement: string;
  requirementDetails: string;
  estimatedBudget: string;
  location: string;
  isSpam: boolean;
  spamReason?: string;
}

export const CALL_PRESETS: CallSimulationPreset[] = [
  {
    id: 'preset-shed-urgent',
    name: 'मनोज खंडेलवाल (Manoj Khandelwal)',
    number: '+91 98290 77112',
    category: 'shed',
    categoryLabel: '🏭 शेड्स निर्माण (Shed)',
    urgency: 'urgent',
    firstCustomerStatement: 'नमस्ते, मुझे 1,800 sq ft फैक्ट्री शेड का काम करवाना है। क्या तुरंत बात हो सकती है?',
    requirementDetails: '1800 sq ft हेवी आयरन ट्रस स्ट्रक्चर, जिंदल शीट, 10 वर्ष वारंटी। काम इसी हफ्ते शुरू होना है।',
    estimatedBudget: '₹3,24,000 - ₹3,96,000',
    location: 'प्लॉट 88, ट्रांसपोर्ट नगर',
    isSpam: false,
  },
  {
    id: 'preset-railing-high',
    name: 'रोहित वर्मा (Rohit Verma)',
    number: '+91 98101 22334',
    category: 'railing',
    categoryLabel: '✨ स्टील रेलिंग (SS Railing)',
    urgency: 'high',
    firstCustomerStatement: 'नमस्ते तारा, मुझे सीढ़ियों और बालकनी के लिए 80 रनिंग फुट SS-304 स्टील रेलिंग लगवानी है।',
    requirementDetails: '80 running ft SS-304 फूड-ग्रेड स्टेनलेस स्टील, ग्लास क्लैम्प व डिज़ाइनर पिलर।',
    estimatedBudget: '₹36,000',
    location: 'हाउस 402, सूर्य विहार',
    isSpam: false,
  },
  {
    id: 'preset-gate-urgent',
    name: 'विक्रम राठौड़ (Vikram Rathore)',
    number: '+91 97722 55667',
    category: 'gate',
    categoryLabel: '🚪 मुख्य गेट (Designer Gate)',
    urgency: 'urgent',
    firstCustomerStatement: 'नमस्ते, 12x7 फुट का भारी स्लाइडिंग मेन गेट बनवाना है, लेजर कटिंग डिज़ाइन के साथ।',
    requirementDetails: '12x7 ft (84 sq ft) हैवी एमएस फ्रेम, सीएनसी कटिंग, बीयरिंग हिंग्स। गृह प्रवेश 10 दिन में है।',
    estimatedBudget: '₹25,000 - ₹32,000',
    location: 'विहार कॉलोनी, मेन रोड',
    isSpam: false,
  },
  {
    id: 'preset-grill-normal',
    name: 'दिनेश गुप्ता (Dinesh Gupta)',
    number: '+91 98990 44332',
    category: 'grill',
    categoryLabel: '🔒 विंडो सेफ्टी ग्रिल (Grill)',
    urgency: 'normal',
    firstCustomerStatement: 'नमस्ते, 8 खिड़कियों के लिए स्क्वायर बार सेफ्टी ग्रिल का कोटेशन चाहिए।',
    requirementDetails: 'लगभग 140 sq ft 12mm सॉलिड एमएस स्क्वायर बार ग्रिल्स।',
    estimatedBudget: '₹18,200 - ₹25,200',
    location: 'शांति नगर, गली नं. 3',
    isSpam: false,
  },
  {
    id: 'preset-spam-loan',
    name: 'रोहित कुमार (फाइनेंस एजेंट)',
    number: '+91 80012 34567',
    category: 'spam',
    categoryLabel: '🚫 स्पैम कॉल (लोन ऑफर)',
    urgency: 'low',
    firstCustomerStatement: 'हेलो सर, आपको एचडीएफसी से 10 लाख का प्री-अप्रूव्ड पर्सनल लोन मिल रहा है कम ब्याज दर पर...',
    requirementDetails: 'अनचाहा टेलीमार्केटिंग व पर्सनल लोन ऑफर।',
    estimatedBudget: '₹0 (Spam)',
    location: 'अज्ञात (टेलीकॉलर)',
    isSpam: true,
    spamReason: 'पहचाना गया: पर्सनल लोन टेलीमार्केटिंग स्पैम कॉल',
  },
  {
    id: 'preset-spam-creditcard',
    name: 'क्रेडिट कार्ड टेलीमार्केटिंग',
    number: '+91 79900 11223',
    category: 'spam',
    categoryLabel: '🚫 स्पैम कॉल (क्रेडिट कार्ड)',
    urgency: 'low',
    firstCustomerStatement: 'सर, आपका लाइफटाइम फ्री क्रेडिट कार्ड अप्रूव हो गया है, ओटीपी शेयर कर दीजिए...',
    requirementDetails: 'फर्जी क्रेडिट कार्ड ऑफर व टेलीमार्केटिंग।',
    estimatedBudget: '₹0 (Spam)',
    location: 'अज्ञात (Spam)',
    isSpam: true,
    spamReason: 'पहचाना गया: फर्जी क्रेडिट कार्ड / अनचाहा प्रचार',
  },
];

const BOSS_ALERTS_KEY = 'tara_boss_call_alerts_data';

export function loadBossAlerts(): BossCallAlert[] {
  if (typeof window === 'undefined') return INITIAL_BOSS_ALERTS;
  try {
    const saved = localStorage.getItem(BOSS_ALERTS_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to load boss alerts:', e);
  }
  return INITIAL_BOSS_ALERTS;
}

export function saveBossAlerts(alerts: BossCallAlert[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(BOSS_ALERTS_KEY, JSON.stringify(alerts));
    window.dispatchEvent(new CustomEvent('boss-alerts-updated', { detail: alerts }));
  } catch (e) {
    console.warn('Failed to save boss alerts:', e);
  }
}
