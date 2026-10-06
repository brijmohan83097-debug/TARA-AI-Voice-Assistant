/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { HotLead, FabricationRatesConfig, FabricationServiceItem } from '../types';
import { loadFabricationConfig } from './fabricationData';

export const INITIAL_HOT_LEADS: HotLead[] = [
  {
    id: 'lead-1',
    customerName: 'राजेश शर्मा (Rajesh Sharma)',
    phoneNumber: '+91 98234 56789',
    serviceType: 'shed',
    serviceName: 'इंडस्ट्रियल वेयरहाउस शेड (Factory Shed)',
    approxSize: '1,200 sq ft',
    priceRangeMin: 216000,
    priceRangeMax: 264000,
    customerQuery: 'नमस्ते, मुझे 1200 sq ft फैक्ट्री छत के लिए शेड बनवाना है। टाटा शीट और मजबूत पाइप स्ट्रक्चर चाहिए। क्या रेट पड़ेगा?',
    generatedHindiResponse: `नमस्ते श्री राजेश शर्मा जी! 🙏
*मोहन विश्वास फैब्रिकेशन* में संपर्क करने के लिए धन्यवाद।

आपके *1,200 sq ft फैक्ट्री शेड* का अधिकृत कोटेशन विवरण:
💰 *अनुमानित खर्च:* ₹2,16,000 - ₹2,64,000 (दर: ₹180 - ₹220 / sq ft)
🏗️ *मटीरियल:* टाटा/जिंदल कलर-कोटेड प्रोफाइल शीट, हेवी एमएस ट्यूबलर पाइप स्ट्रक्चर व एंटी-रस्ट प्राइमर।
🛡️ *वारंटी:* 10 वर्ष लीकेज व स्ट्रक्चरल वारंटी।

📍 *फ़्री साइट विज़िट व नाप:*
सटीक नाप और अंतिम कोटेशन हेतु कृपया अपना पूरा पता (Site Location/Address) और पिनकोड यहाँ शेयर करें।

📞 संपर्क: श्री बृजमोहन कुमार | +91 98765 43210`,
    siteAddress: 'प्लॉट नं. 45, सेक्टर-18 इंडस्ट्रियल एरिया',
    status: 'hot',
    createdAt: '2026-09-30T09:15:00.000Z',
    notes: 'क्लाइंट को अगले 15 दिन में काम शुरू करवाना है। बहुत गंभीर ग्राहक।',
    source: 'whatsapp_inquiry',
  },
  {
    id: 'lead-2',
    customerName: 'अमित पटेल (Amit Patel)',
    phoneNumber: '+91 98111 22334',
    serviceType: 'railing',
    serviceName: 'SS-304 स्टेनलेस स्टील रेलिंग (Balcony Railing)',
    approxSize: '65 running ft',
    priceRangeMin: 29250,
    priceRangeMax: 29250,
    customerQuery: 'बालकनी और सीढ़ियों के लिए 65 रनिंग फुट स्टील रेलिंग लगवानी है। एसएस 304 का रेट क्या है?',
    generatedHindiResponse: `नमस्ते श्री अमित पटेल जी! 🙏
*मोहन विश्वास फैब्रिकेशन* में संपर्क करने के लिए धन्यवाद।

आपके *65 running ft SS-304 स्टील रेलिंग* का अधिकृत कोटेशन विवरण:
💰 *अनुमानित खर्च:* ₹29,250 (दर: ₹450 / running ft)
✨ *मटीरियल:* प्योर SS-304 ग्रेड हाई-पॉलिश स्टेनलेस स्टील, ग्लास क्लैम्प व डिज़ाइनर मास्टर पिलर।
🛡️ *वारंटी:* लाइफटाइम रस्ट-फ्री गारंटी।

📍 *फ़्री साइट विज़िट व नाप:*
सटीक नाप और डिज़ाइन कैटलॉग देखने हेतु कृपया अपना पूरा पता (Site Location/Address) और पिनकोड यहाँ शेयर करें।

📞 संपर्क: श्री बृजमोहन कुमार | +91 98765 43210`,
    siteAddress: 'फ्लैट 302, ग्रीन वैली अपार्टमेंट्स, रिंग रोड',
    status: 'site_visit',
    createdAt: '2026-09-30T10:45:00.000Z',
    notes: 'साइट विज़िट कल दोपहर 3 बजे तय है। सैंपल पाइप दिखाना है।',
    source: 'whatsapp_inquiry',
  },
  {
    id: 'lead-3',
    customerName: 'विकास यादव (Vikas Yadav)',
    phoneNumber: '+91 97555 44332',
    serviceType: 'gate',
    serviceName: 'मॉडर्न सीएनसी लेजर-कट मेन गेट',
    approxSize: '80 sq ft (10x8 ft)',
    priceRangeMin: 22400,
    priceRangeMax: 30400,
    customerQuery: 'घर के मेन एंट्रेंस के लिए 10x8 फुट का स्लाइडिंग गेट बनवाना है। लेजर कटिंग डिज़ाइन के साथ।',
    generatedHindiResponse: `नमस्ते श्री विकास यादव जी! 🙏
*मोहन विश्वास फैब्रिकेशन* में संपर्क करने के लिए धन्यवाद।

आपके *10x8 फुट (80 sq ft) सीएनसी लेजर-कट मेन गेट* का अधिकृत कोटेशन विवरण:
💰 *अनुमानित खर्च:* ₹22,400 - ₹30,400 (दर: ₹280 - ₹380 / sq ft)
🎨 *मटीरियल:* प्राइम ग्रेड एमएस शीट, हेवी पाइप फ्रेम, बीयरिंग हिंग्स एवं वेदर-प्रूफ एपॉक्सी कोटिंग।
🛡️ *वारंटी:* 5 वर्ष फ्री सर्विसिंग वारंटी।

📍 *फ़्री साइट विज़िट व नाप:*
सटीक फ्रेम साइज और डिज़ाइन चयन हेतु कृपया अपना पूरा पता (Site Location/Address) और पिनकोड यहाँ शेयर करें।

📞 संपर्क: श्री बृजमोहन कुमार | +91 98765 43210`,
    siteAddress: 'हाउस नं. 112, सैनिक कॉलोनी',
    status: 'quote_sent',
    createdAt: '2026-09-29T16:20:00.000Z',
    notes: 'डिजाइन कैटलॉग पीडीएफ भेज दिया गया है। 2 दिन में फाइनल करेंगे।',
    source: 'whatsapp_inquiry',
  },
  {
    id: 'lead-4',
    customerName: 'सुनील वर्मा (Sunil Verma)',
    phoneNumber: '+91 98760 12345',
    serviceType: 'grill',
    serviceName: 'विंडो व बालकनी सेफ्टी ग्रिल्स (12mm Square Bar)',
    approxSize: '150 sq ft (5 खिड़कियां)',
    priceRangeMin: 19500,
    priceRangeMax: 27000,
    customerQuery: 'नई बिल्डिंग में 5 खिड़कियों के लिए सेफ्टी ग्रिल चाहिए, लगभग 150 वर्ग फुट। रेट बताएं।',
    generatedHindiResponse: `नमस्ते श्री सुनील वर्मा जी! 🙏
*मोहन विश्वास फैब्रिकेशन* में संपर्क करने के लिए धन्यवाद।

आपके *150 sq ft विंडो सेफ्टी ग्रिल्स* का अधिकृत कोटेशन विवरण:
💰 *अनुमानित खर्च:* ₹19,500 - ₹27,000 (दर: ₹130 - ₹180 / sq ft)
🔒 *मटीरियल:* 10mm/12mm सॉलिड एमएस स्क्वायर बार, हेवी एंगल फ्रेम व रेड-ऑक्साइड प्राइमर कोटिंग।
🛡️ *वारंटी:* 3 वर्ष एंटी-रस्ट कोटिंग वारंटी।

📍 *फ़्री साइट विज़िट व नाप:*
सटीक फ्रेम नाप हेतु कृपया अपना पूरा पता (Site Location/Address) और पिनकोड यहाँ शेयर करें।

📞 संपर्क: श्री बृजमोहन कुमार | +91 98765 43210`,
    siteAddress: 'वर्मा विला, सिविल लाइन्स',
    status: 'deal_closed',
    createdAt: '2026-09-28T14:10:00.000Z',
    notes: 'एडवांस जमा हो गया है। काम वर्कशॉप में शुरू हो चुका है।',
    source: 'whatsapp_inquiry',
  },
];

const LEADS_STORAGE_KEY = 'tara_hot_leads_data';

export function loadHotLeads(): HotLead[] {
  if (typeof window === 'undefined') return INITIAL_HOT_LEADS;
  try {
    const saved = localStorage.getItem(LEADS_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to load hot leads from localStorage:', e);
  }
  return INITIAL_HOT_LEADS;
}

export function saveHotLeads(leads: HotLead[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LEADS_STORAGE_KEY, JSON.stringify(leads));
    window.dispatchEvent(new CustomEvent('hot-leads-updated', { detail: leads }));
    // Also sync to backend API if available
    fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(leads),
    }).catch(() => {
      // non-blocking
    });
  } catch (e) {
    console.warn('Failed to save hot leads:', e);
  }
}

export interface GenerateQuotationParams {
  customerName: string;
  phoneNumber: string;
  serviceType: 'shed' | 'railing' | 'gate' | 'grill' | 'shutter' | 'stairs' | 'custom';
  approxQuantity?: number;
  unit?: string;
  customNotes?: string;
  config?: FabricationRatesConfig;
}

export interface GeneratedQuotationResult {
  serviceItem: FabricationServiceItem;
  quantity: number;
  unit: string;
  priceMin: number;
  priceMax: number;
  hindiResponse: string;
  whatsappUrl: string;
}

/**
 * Generates an instant professional Hindi WhatsApp response
 * with price range, address request, and complete contact details.
 */
export function generateInstantHindiQuotation(params: GenerateQuotationParams): GeneratedQuotationResult {
  const config = params.config || loadFabricationConfig();
  
  // Find matching service item or fallback to first
  let item = config.services.find((s) => s.category === params.serviceType && s.isActive);
  if (!item) {
    item = config.services[0] || {
      id: 'custom',
      name: 'Custom Fabrication',
      nameHi: 'कस्टम फैब्रिकेशन कार्य',
      category: 'custom',
      unit: 'sq ft',
      rateMin: 180,
      rateMax: 220,
      description: 'उच्च गुणवत्ता एमएस व एसएस स्टील फैब्रिकेशन वर्क।',
      material: 'प्राइम ग्रेड स्टील व प्रोटेक्टिव कोटिंग',
      warranty: '5 वर्ष वारंटी',
      isActive: true,
    };
  }

  // Determine quantity
  const qty = params.approxQuantity && params.approxQuantity > 0 ? params.approxQuantity : 100;
  const unit = item.unit || 'sq ft';

  const priceMin = Math.round(qty * item.rateMin);
  const priceMax = Math.round(qty * (item.rateMax || item.rateMin));

  const cleanName = params.customerName.trim() || 'ग्राहक (Customer)';
  const formattedRateStr = item.rateMax && item.rateMax !== item.rateMin
    ? `₹${item.rateMin.toLocaleString('en-IN')} - ₹${item.rateMax.toLocaleString('en-IN')} / ${unit}`
    : `₹${item.rateMin.toLocaleString('en-IN')} / ${unit}`;

  const formattedTotalStr = priceMin === priceMax
    ? `₹${priceMin.toLocaleString('en-IN')}`
    : `₹${priceMin.toLocaleString('en-IN')} - ₹${priceMax.toLocaleString('en-IN')}`;

  const businessName = config.businessNameHi || config.businessName || 'मोहन विश्वास फैब्रिकेशन';
  const ownerName = config.ownerName || 'मिस्टर बृजमोहन कुमार';
  const phone = config.phone || '+91 98765 43210';

  const hindiResponse = `नमस्ते श्री/सुश्री ${cleanName} जी! 🙏
*${businessName}* में संपर्क करने के लिए हार्दिक धन्यवाद।

आपके *${qty.toLocaleString('en-IN')} ${unit} ${item.nameHi || item.name}* के लिए कोटेशन विवरण निम्नलिखित है:

💰 *अनुमानित खर्च (Estimated Price Range):*
• कुल लागत: *${formattedTotalStr}*
• अधिकृत दर: ${formattedRateStr}

🏗️ *मटीरियल एवं गुणवत्ता:*
• ${item.material || 'हैवी स्ट्रक्चरल ग्रेड स्टील व एंटी-रस्ट कोटिंग'}
• ${item.description || 'मजबूत वेल्डिंग एवं फिनिशिंग'}
${item.warranty ? `🛡️ *वारंटी:* ${item.warranty}` : ''}

📍 *फ़्री साइट विज़िट व सटीक नाप हेतु आवश्यक जानकारी:*
सटीक नाप (Site Measurement) और साइट इंस्पेक्शन के लिए *कृपया अपना कार्यस्थल का पूरा पता (Site Location/Address), लैंडमार्क एवं पिनकोड यहाँ मैसेज करें*। हमारी टीम 24 घंटे के भीतर आपसे संपर्क करेगी।

📞 *डायरेक्ट संपर्क:*
${ownerName}
फोन / व्हाट्सएप: ${phone}
*मोहन विश्वास फैब्रिकेशन - मजबूती और विश्वास की पहचान*`;

  // WhatsApp click-to-chat URL
  const digitsOnly = params.phoneNumber.replace(/\D/g, '');
  const cleanPhone = digitsOnly.length === 10 ? `91${digitsOnly}` : digitsOnly;
  const whatsappUrl = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(hindiResponse)}`;

  return {
    serviceItem: item,
    quantity: qty,
    unit,
    priceMin,
    priceMax,
    hindiResponse,
    whatsappUrl,
  };
}
