/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { FabricationRatesConfig, FabricationServiceItem } from '../types';

export const INITIAL_FABRICATION_CONFIG: FabricationRatesConfig = {
  businessName: 'Mohan Vishwas Fabrication',
  businessNameHi: 'मोहन विश्वास फैब्रिकेशन',
  ownerName: 'Mr. Brijmohan Kumar',
  tagline: 'विश्वसनीय स्टील, शेड्स एवं मॉडर्न फैब्रिकेशन वर्क्स',
  phone: '+91 98765 43210',
  whatsapp: '+919876543210',
  address: 'मेन इंडस्ट्रियल रोड, वर्कशॉप कॉम्प्लेक्स',
  city: 'भारत',
  lastModified: new Date().toISOString(),
  services: [
    {
      id: 'shed-standard',
      name: 'Industrial & Domestic Sheds',
      nameHi: 'शेड्स निर्माण (फैक्ट्री, छत व पार्किंग शेड)',
      category: 'shed',
      unit: 'sq ft',
      rateMin: 180,
      rateMax: 220,
      description: 'हैवी आयरन ट्रस/पाइप स्ट्रक्चर, कलर-कोटेड प्रोफाइल शीट/जिंक शीट या फाइबर रूफिंग सहित कम्प्लीट इंस्टॉलेशन।',
      material: 'टाटा / जिंदल कलर-कोटेड शीट, हेवी एमएस ट्यूबलर पाइप व एंटी-रस्ट प्राइमर',
      warranty: '10 वर्ष लीकेज व स्ट्रक्चरल वारंटी',
      popular: true,
      isActive: true,
      lastUpdated: '2026-09-30',
    },
    {
      id: 'railing-steel',
      name: 'SS Steel Railings',
      nameHi: 'स्टील रेलिंग (सीढ़ी व बालकनी रेलिंग)',
      category: 'railing',
      unit: 'running ft',
      rateMin: 450,
      rateMax: 450,
      description: 'प्योर SS-304 स्टेनलेस स्टील, ग्लास क्लैम्प, डिज़ाइनर पिलर, मिरर ग्लॉसी/मैट फिनिश व मजबूत वेल्डिंग।',
      material: 'SS-304 ग्रेड हाई-पॉलिश स्टेनलेस स्टील (1.5mm - 2mm थिकनेस)',
      warranty: 'लाइफटाइम रस्ट-फ्री गारंटी',
      popular: true,
      isActive: true,
      lastUpdated: '2026-09-30',
    },
    {
      id: 'gate-designer',
      name: 'Designer Main Entrance Gates',
      nameHi: 'आधुनिक मुख्य द्वार व गेट्स (स्लाइडिंग/स्विंग गेट)',
      category: 'gate',
      unit: 'sq ft',
      rateMin: 280,
      rateMax: 380,
      description: 'मॉडर्न सीएनसी लेजर-कट डिज़ाइन्स, हैवी एमएस चौखट, बीयरिंग हिंग्स, सेफ्टी लॉक प्रोविजन एवं ऑटोमेशन रेडी।',
      material: 'प्राइम ग्रेड एमएस शीट, हेवी पाइप फ्रेम, लेजर कटिंग व एपॉक्सी कोटिंग',
      warranty: '5 वर्ष फ्री सर्विसिंग वारंटी',
      popular: true,
      isActive: true,
      lastUpdated: '2026-09-30',
    },
    {
      id: 'grill-safety',
      name: 'Window & Balcony Safety Grills',
      nameHi: 'खिड़की व बालकनी सेफ्टी ग्रिल्स',
      category: 'grill',
      unit: 'sq ft',
      rateMin: 130,
      rateMax: 180,
      description: 'मजबूत स्क्वायर बार व फ्लैट स्ट्रिप ग्रिल्स, मॉडर्न ज्यामितीय पैटर्न, एंटी-बर्गलर डिज़ाइन व रेड-ऑक्साइड कोटिंग।',
      material: '10mm/12mm सॉलिड एमएस स्क्वायर बार, हेवी एंगल फ्रेम',
      warranty: '3 वर्ष एंटी-रस्ट कोटिंग वारंटी',
      popular: true,
      isActive: true,
      lastUpdated: '2026-09-30',
    },
    {
      id: 'shutter-rolling',
      name: 'Heavy Duty Rolling Shutters',
      nameHi: 'दुकान व गोदाम रोलिंग शटर',
      category: 'shutter',
      unit: 'sq ft',
      rateMin: 160,
      rateMax: 210,
      description: 'स्प्रिंग-लोडेड स्मूथ रोलिंग शटर, इंटरलॉकिंग स्टील स्लैट्स, हैवी साइड गाइड्स व सेंट्रल लॉक सिस्टम।',
      material: 'सीआरसी / जीआई स्टील स्लैट्स, हाई-टेंसाइल स्प्रिंग मैकेनिज्म',
      warranty: '2 वर्ष स्प्रिंग रिप्लेसमेंट वारंटी',
      popular: false,
      isActive: true,
      lastUpdated: '2026-09-30',
    },
    {
      id: 'stairs-spiral',
      name: 'Spiral & Designer Metal Stairs',
      nameHi: 'स्पाइरल (घुमावदार) व मेटल सीढ़ियां',
      category: 'stairs',
      unit: 'step',
      rateMin: 1200,
      rateMax: 1800,
      description: 'कम जगह में लगने वाली खूबसूरत घुमावदार लोहे व स्टील की सीढ़ियां, चेकर प्लेट स्टेप्स व सेफ्टी हैंडरेल।',
      material: 'सेंट्रल हेवी पाइप, चेकर एंटी-स्लिप एमएस शीट व सेफ्टी रेलिंग',
      warranty: '10 वर्ष स्ट्रक्चरल लोड वारंटी',
      popular: false,
      isActive: true,
      lastUpdated: '2026-09-30',
    },
  ],
};

const FABRICATION_STORAGE_KEY = 'tara_mohan_vishwas_fabrication_rates';

export function loadFabricationConfig(): FabricationRatesConfig {
  if (typeof window === 'undefined') return INITIAL_FABRICATION_CONFIG;
  try {
    const saved = localStorage.getItem(FABRICATION_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && Array.isArray(parsed.services) && parsed.services.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to load fabrication config from localStorage:', e);
  }
  return INITIAL_FABRICATION_CONFIG;
}

export function saveFabricationConfig(config: FabricationRatesConfig): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(FABRICATION_STORAGE_KEY, JSON.stringify(config));
    // Also broadcast to other components
    window.dispatchEvent(new CustomEvent('fabrication-rates-updated', { detail: config }));
  } catch (e) {
    console.warn('Failed to save fabrication config to localStorage:', e);
  }
}

/**
 * Format rate display in rupees:
 * e.g. "₹180 - ₹220 / sq ft" or "₹450 / running ft"
 */
export function formatRateDisplay(item: FabricationServiceItem): string {
  if (item.rateMax && item.rateMax !== item.rateMin) {
    return `₹${item.rateMin.toLocaleString('en-IN')} - ₹${item.rateMax.toLocaleString('en-IN')} / ${item.unit}`;
  }
  return `₹${item.rateMin.toLocaleString('en-IN')} / ${item.unit}`;
}
