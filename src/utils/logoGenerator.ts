/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { LogoGraphicData } from '../types';

export interface LogoOptions {
  appName: string;
  tagline?: string;
  category?: string;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  iconType?: string;
}

export interface GeneratedLogoResult {
  dataUrl: string;
  downloadFileName: string;
  summary: string;
  logoDetails: LogoGraphicData;
}

/**
 * Parses brand name, category, and icon type from user prompt or action details.
 */
export function extractBrandInfoFromPrompt(prompt: string, details?: any): LogoOptions {
  let appName = details?.appName || details?.title || '';
  let category = details?.category || '';
  let tagline = details?.tagline || '';
  let iconType = details?.iconType || '';
  let primaryColor = details?.primaryColor || '';
  let secondaryColor = details?.secondaryColor || '';

  const cleanPrompt = prompt.trim();

  // If appName not provided in details, extract from prompt
  if (!appName) {
    // 0. Explicit check for Tara
    if (/tara|तारा/i.test(cleanPrompt)) {
      appName = 'Tara AI';
    }

    // 1. "Savari app ke liye logo", "Zomato app ka logo"
    if (!appName) {
      const appKeLiyeMatch = cleanPrompt.match(/([A-Za-z0-9\u0900-\u097F]+(?:\s+[A-Za-z0-9\u0900-\u097F]+)?)\s+(?:app|एप्लिकेशन)\s+(?:ke\s+liye|ka|ki|ke|ko|par)\s+(?:logo|photo|design|लोगो)/i);
      if (appKeLiyeMatch && appKeLiyeMatch[1]) {
        appName = appKeLiyeMatch[1].trim();
      }
    }

    // 2. "[Name] ke liye ... logo" (e.g. "Tara ke liye ek naya modern logo bana do", "savari ke liye logo")
    if (!appName) {
      const keLiyeMatch = cleanPrompt.match(/([A-Za-z0-9\u0900-\u097F]+)\s+(?:ke\s+liye|ka|ki|ke)\s+(?:[\w\u0900-\u097F]+\s+)*?(?:logo|लोगो|photo|icon|प्रतीक)/i);
      if (keLiyeMatch && keLiyeMatch[1] && !/kisi|sab|mere|apne|kripya|ek/i.test(keLiyeMatch[1])) {
        appName = keLiyeMatch[1].trim();
      }
    }

    // 3. "logo for [Name] app" or "logo of [Name]"
    if (!appName) {
      const forMatch = cleanPrompt.match(/(?:logo|icon|graphic)\s+(?:for|of|named)\s+["']?([A-Za-z0-9\u0900-\u097F]+(?:\s+[A-Za-z0-9\u0900-\u097F]+)?)["']?/i);
      if (forMatch && forMatch[1]) {
        appName = forMatch[1].trim();
      }
    }

    // 4. "savari app logo" or "savari logo"
    if (!appName) {
      const directMatch = cleanPrompt.match(/([A-Za-z0-9\u0900-\u097F]+)\s+(?:app\s+)?(?:logo|लोगो)/i);
      if (directMatch && directMatch[1] && !/kisi|new|create|make|bana/i.test(directMatch[1])) {
        appName = directMatch[1].trim();
      }
    }
  }

  // Clean common noise words from brand name
  if (appName) {
    appName = appName.replace(/\b(app|application|ka|ki|ke|liye|photo|image|bana|do|karo)\b/gi, '').trim();
    if (appName.length > 0) {
      appName = appName.charAt(0).toUpperCase() + appName.slice(1);
    }
  }

  // Specific fallback check if Savari or Tara is mentioned anywhere
  if (!appName || appName.length < 2) {
    if (/tara|तारा/i.test(cleanPrompt)) {
      appName = 'Tara AI';
    } else if (/savari|सवारी/i.test(cleanPrompt)) {
      appName = 'Savari';
    } else {
      appName = 'Tara AI';
    }
  }

  const lowerPrompt = (cleanPrompt + ' ' + appName).toLowerCase();

  // Determine category, iconType, and color palette based on brand context
  if (/tara|तारा|voice\s*assistant|ai\s*assistant|voice\s*ai|neural/i.test(lowerPrompt) || appName.toLowerCase().includes('tara')) {
    category = category || 'INDIAN AI VOICE ASSISTANT';
    tagline = tagline || 'बुद्धिमान भारतीय AI साथी • Next-Gen Voice Intelligence';
    iconType = 'tara_ai';
    primaryColor = primaryColor || '#00f0ff'; // Neon Cyan
    secondaryColor = secondaryColor || '#6366f1'; // Deep Indigo
  } else if (/savari|सवारी|cab|taxi|ride|car|travel|auto|driver|यात्रा|गाड़ी|गाड़ी|सड़क/i.test(lowerPrompt)) {
    category = category || 'CAB & RIDE SHARING APP';
    tagline = tagline || 'आपकी अपनी सवारी • Fast & Reliable Rides';
    iconType = 'car';
    primaryColor = primaryColor || '#10b981'; // Emerald Green
    secondaryColor = secondaryColor || '#06b6d4'; // Cyan
  } else if (/food|restaurant|khana|swiggy|zomato|dining|भोजन|खाना|किचन|नाश्ता/i.test(lowerPrompt)) {
    category = category || 'CAB & RIDE SHARING APP';
    tagline = tagline || 'आपकी अपनी सवारी • Fast & Reliable Rides';
    iconType = 'car';
    primaryColor = primaryColor || '#10b981'; // Emerald Green
    secondaryColor = secondaryColor || '#06b6d4'; // Cyan
  } else if (/food|restaurant|khana|swiggy|zomato|dining|भोजन|खाना|किचन|नाश्ता/i.test(lowerPrompt)) {
    category = category || 'FOOD DELIVERY & DINING';
    tagline = tagline || 'स्वादिष्ट भोजन • Fast Doorstep Delivery';
    iconType = 'food';
    primaryColor = primaryColor || '#f59e0b'; // Amber
    secondaryColor = secondaryColor || '#ef4444'; // Red
  } else if (/pay|money|wallet|bank|finance|cash|रुपये|पैसे|भुगतान|वॉलेट/i.test(lowerPrompt)) {
    category = category || 'DIGITAL PAYMENTS & FINTECH';
    tagline = tagline || 'सुरक्षित डिजिटल भुगतान • Instant & Secure';
    iconType = 'finance';
    primaryColor = primaryColor || '#6366f1'; // Indigo
    secondaryColor = secondaryColor || '#8b5cf6'; // Violet
  } else if (/fit|health|gym|yoga|workout|सेहत|स्वास्थ्य|कसरत/i.test(lowerPrompt)) {
    category = category || 'HEALTH & FITNESS TRACKER';
    tagline = tagline || 'स्वस्थ जीवन • Everyday Vitality';
    iconType = 'fitness';
    primaryColor = primaryColor || '#06b6d4'; // Cyan
    secondaryColor = secondaryColor || '#3b82f6'; // Blue
  } else if (/chat|social|message|talk|चैट|बात|दोस्त/i.test(lowerPrompt)) {
    category = category || 'MESSAGING & SOCIAL NETWORK';
    tagline = tagline || 'अपनों से जुड़ें • Stay Connected Always';
    iconType = 'chat';
    primaryColor = primaryColor || '#ec4899'; // Pink
    secondaryColor = secondaryColor || '#f43f5e'; // Rose
  } else {
    category = category || 'SMART DIGITAL PLATFORM';
    tagline = tagline || 'आधुनिक अनुभव • Modern & Reliable';
    iconType = iconType || 'shield';
    primaryColor = primaryColor || '#00f0ff'; // Neon Cyan
    secondaryColor = secondaryColor || '#3b82f6'; // Bright Blue
  }

  return {
    appName,
    tagline,
    category,
    primaryColor,
    secondaryColor,
    iconType,
  };
}

/**
 * Renders a high-resolution (1024x1024) professional Vector App Logo Card
 * onto a client HTML5 Canvas with modern squircle mockup, dynamic iconography,
 * glossy glass reflection, and brand typography.
 */
export async function generateBrandLogoGraphic(options: LogoOptions): Promise<GeneratedLogoResult> {
  const width = 1024;
  const height = 1024;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas 2D context unavailable');
  }

  const {
    appName,
    tagline = 'Modern Digital Platform',
    category = 'OFFICIAL APP LOGO',
    primaryColor = '#10b981',
    secondaryColor = '#06b6d4',
    iconType = 'car',
  } = options;

  // 1. Studio Background: Deep luxury dark carbon gradient
  const bgGrad = ctx.createRadialGradient(
    width / 2,
    440,
    100,
    width / 2,
    height / 2,
    width * 0.8
  );
  bgGrad.addColorStop(0, '#0a1628');
  bgGrad.addColorStop(0.4, '#050c18');
  bgGrad.addColorStop(0.75, '#02060d');
  bgGrad.addColorStop(1, '#000205');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // 2. Subtle Precision Grid
  ctx.save();
  ctx.strokeStyle = 'rgba(0, 240, 255, 0.04)';
  ctx.lineWidth = 1;
  const gridSize = 48;
  for (let x = 0; x < width; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = 0; y < height; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
  ctx.restore();

  // 3. Ambient Atmospheric Colorful Glow behind the icon
  const iconCenterX = width / 2;
  const iconCenterY = 410;
  const iconSize = 420;
  const iconRadius = 92;

  ctx.save();
  const auraGlow = ctx.createRadialGradient(
    iconCenterX,
    iconCenterY,
    60,
    iconCenterX,
    iconCenterY,
    360
  );
  auraGlow.addColorStop(0, `${primaryColor}40`);
  auraGlow.addColorStop(0.45, `${secondaryColor}25`);
  auraGlow.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = auraGlow;
  ctx.beginPath();
  ctx.arc(iconCenterX, iconCenterY, 360, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 4. Concentric Orbital Rings
  ctx.save();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(iconCenterX, iconCenterY, 280, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = `${primaryColor}30`;
  ctx.lineWidth = 1;
  ctx.setLineDash([8, 12]);
  ctx.beginPath();
  ctx.arc(iconCenterX, iconCenterY, 260, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  // 5. Draw App Icon Mockup (Squircle)
  const iconLeft = iconCenterX - iconSize / 2;
  const iconTop = iconCenterY - iconSize / 2;

  // Outer 3D Drop Shadow
  ctx.save();
  ctx.shadowColor = `${primaryColor}66`;
  ctx.shadowBlur = 50;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 18;

  // Squircle Path
  ctx.beginPath();
  ctx.roundRect(iconLeft, iconTop, iconSize, iconSize, iconRadius);

  // Gradient Fill for the Icon Base
  const iconGrad = ctx.createLinearGradient(
    iconLeft,
    iconTop,
    iconLeft + iconSize,
    iconTop + iconSize
  );
  iconGrad.addColorStop(0, primaryColor);
  iconGrad.addColorStop(0.55, secondaryColor);
  iconGrad.addColorStop(1, '#042f2e');
  ctx.fillStyle = iconGrad;
  ctx.fill();
  ctx.restore();

  // Inner border highlight
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(iconLeft, iconTop, iconSize, iconSize, iconRadius);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.restore();

  // 6. Glossy Specular Glass Sheen across upper portion
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(iconLeft, iconTop, iconSize, iconSize, iconRadius);
  ctx.clip();

  const glossGrad = ctx.createLinearGradient(iconLeft, iconTop, iconLeft, iconTop + iconSize * 0.55);
  glossGrad.addColorStop(0, 'rgba(255, 255, 255, 0.38)');
  glossGrad.addColorStop(0.65, 'rgba(255, 255, 255, 0.08)');
  glossGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = glossGrad;
  ctx.beginPath();
  ctx.ellipse(iconCenterX, iconTop + 60, iconSize * 0.75, iconSize * 0.45, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 7. Render Central Iconography according to iconType
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(iconLeft, iconTop, iconSize, iconSize, iconRadius);
  ctx.clip();

  if (iconType === 'car') {
    // DRAW MODERN CAB / RIDE-SHARING CAR EMBLEM (SAVARI APP)
    const cy = iconCenterY + 10;
    const cx = iconCenterX;

    // A. Ground speed perspective lines & road curve
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.28)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(cx - 150, cy + 120);
    ctx.lineTo(cx + 150, cy + 120);
    ctx.stroke();

    // Road dash center
    ctx.strokeStyle = '#fef08a';
    ctx.lineWidth = 5;
    ctx.setLineDash([20, 16]);
    ctx.beginPath();
    ctx.moveTo(cx - 110, cy + 120);
    ctx.lineTo(cx + 110, cy + 120);
    ctx.stroke();
    ctx.restore();

    // B. Car Shadow
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.beginPath();
    ctx.ellipse(cx, cy + 98, 120, 16, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // C. Car Body (Aerodynamic Modern Front Profile)
    // Cabin Roof
    ctx.save();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(cx - 72, cy - 25);
    ctx.quadraticCurveTo(cx - 50, cy - 88, cx, cy - 90);
    ctx.quadraticCurveTo(cx + 50, cy - 88, cx + 72, cy - 25);
    ctx.closePath();
    ctx.fill();

    // Windshield (Cyan tinted glass)
    const glassGrad = ctx.createLinearGradient(cx, cy - 85, cx, cy - 25);
    glassGrad.addColorStop(0, '#083344');
    glassGrad.addColorStop(1, '#0e7490');
    ctx.fillStyle = glassGrad;
    ctx.beginPath();
    ctx.moveTo(cx - 62, cy - 26);
    ctx.quadraticCurveTo(cx - 42, cy - 80, cx, cy - 82);
    ctx.quadraticCurveTo(cx + 42, cy - 80, cx + 62, cy - 26);
    ctx.closePath();
    ctx.fill();

    // Windshield reflection streak
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(cx - 28, cy - 75);
    ctx.lineTo(cx - 12, cy - 35);
    ctx.stroke();

    // Main Hood & Bumper Chassis
    const hoodGrad = ctx.createLinearGradient(cx, cy - 25, cx, cy + 85);
    hoodGrad.addColorStop(0, '#ffffff');
    hoodGrad.addColorStop(0.65, '#f1f5f9');
    hoodGrad.addColorStop(1, '#cbd5e1');
    ctx.fillStyle = hoodGrad;

    ctx.beginPath();
    ctx.roundRect(cx - 118, cy - 25, 236, 105, [28, 28, 38, 38]);
    ctx.fill();

    // Front Grille & Air Dam
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.roundRect(cx - 68, cy + 38, 136, 32, 12);
    ctx.fill();

    // Grille chrome horizontal slats
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx - 55, cy + 48);
    ctx.lineTo(cx + 55, cy + 48);
    ctx.moveTo(cx - 55, cy + 58);
    ctx.lineTo(cx + 55, cy + 58);
    ctx.stroke();

    // Center Savari Brand Emblem on Grille (Golden 'S')
    ctx.fillStyle = '#fbbf24';
    ctx.shadowColor = '#fbbf24';
    ctx.shadowBlur = 8;
    ctx.font = 'bold 22px "Montserrat", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('S', cx, cy + 53);
    ctx.shadowBlur = 0;

    // Glowing LED Headlights
    // Left Light
    ctx.fillStyle = '#38bdf8';
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 18;
    ctx.beginPath();
    ctx.moveTo(cx - 104, cy + 8);
    ctx.lineTo(cx - 62, cy + 18);
    ctx.lineTo(cx - 68, cy + 30);
    ctx.lineTo(cx - 108, cy + 24);
    ctx.closePath();
    ctx.fill();

    // Right Light
    ctx.beginPath();
    ctx.moveTo(cx + 104, cy + 8);
    ctx.lineTo(cx + 62, cy + 18);
    ctx.lineTo(cx + 68, cy + 30);
    ctx.lineTo(cx + 108, cy + 24);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;

    // Side Mirrors
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.roundRect(cx - 128, cy - 14, 22, 14, 6);
    ctx.roundRect(cx + 106, cy - 14, 22, 14, 6);
    ctx.fill();

    // Roof Cab Indicator / Beacon
    ctx.fillStyle = '#fbbf24';
    ctx.shadowColor = '#fbbf24';
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.roundRect(cx - 30, cy - 105, 60, 16, 6);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.restore();
  } else if (iconType === 'food') {
    // CLOCHE & CULINARY CREST
    const cy = iconCenterY;
    const cx = iconCenterX;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(cx, cy, 90, Math.PI, 0);
    ctx.lineTo(cx + 110, cy);
    ctx.lineTo(cx - 110, cy);
    ctx.closePath();
    ctx.fill();

    // Cloche knob
    ctx.beginPath();
    ctx.arc(cx, cy - 105, 18, 0, Math.PI * 2);
    ctx.fill();

    // Plate base
    ctx.beginPath();
    ctx.roundRect(cx - 125, cy + 8, 250, 20, 10);
    ctx.fill();
  } else if (iconType === 'tara_ai') {
    // TARA AI: FUTURISTIC POLARIS STAR + NEURAL AUDIO WAVEFORM ORBITS
    const cy = iconCenterY;
    const cx = iconCenterX;

    ctx.save();

    // 1. Orbital Acoustic Waveform Rings (Rotating concentric sound rings)
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.45)';
    ctx.lineWidth = 3;
    ctx.setLineDash([14, 10]);
    ctx.beginPath();
    ctx.arc(cx, cy, 140, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(99, 102, 241, 0.6)';
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 8]);
    ctx.beginPath();
    ctx.arc(cx, cy, 110, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]); // reset dash

    // Satellite pulse nodes on orbits
    const nodeAngles = [0, Math.PI * 0.5, Math.PI, Math.PI * 1.5];
    nodeAngles.forEach((ang) => {
      const nx = cx + 140 * Math.cos(ang);
      const ny = cy + 140 * Math.sin(ang);
      ctx.fillStyle = '#00f0ff';
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 14;
      ctx.beginPath();
      ctx.arc(nx, ny, 6, 0, Math.PI * 2);
      ctx.fill();
    });

    // 2. Glowing 8-Point Stella Nova AI Star
    ctx.shadowColor = '#00f0ff';
    ctx.shadowBlur = 35;
    const starGrad = ctx.createRadialGradient(cx, cy, 10, cx, cy, 105);
    starGrad.addColorStop(0, '#ffffff');
    starGrad.addColorStop(0.3, '#67e8f9'); // Light Cyan
    starGrad.addColorStop(0.7, '#00f0ff'); // Neon Cyan
    starGrad.addColorStop(1, '#6366f1'); // Deep Indigo

    ctx.fillStyle = starGrad;
    ctx.beginPath();
    const points = 8;
    const outerR = 100;
    const innerR = 42;
    for (let i = 0; i < points * 2; i++) {
      const r = i % 2 === 0 ? outerR : innerR;
      const angle = (Math.PI / points) * i - Math.PI / 2;
      const sx = cx + r * Math.cos(angle);
      const sy = cy + r * Math.sin(angle);
      if (i === 0) ctx.moveTo(sx, sy);
      else ctx.lineTo(sx, sy);
    }
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;

    // 3. Central Golden Diamond Core with 'T' Monogram
    const coreGrad = ctx.createLinearGradient(cx - 30, cy - 30, cx + 30, cy + 30);
    coreGrad.addColorStop(0, '#fef08a');
    coreGrad.addColorStop(0.5, '#fbbf24');
    coreGrad.addColorStop(1, '#d97706');

    ctx.fillStyle = coreGrad;
    ctx.shadowColor = '#fbbf24';
    ctx.shadowBlur = 18;
    ctx.beginPath();
    ctx.moveTo(cx, cy - 36);
    ctx.lineTo(cx + 36, cy);
    ctx.lineTo(cx, cy + 36);
    ctx.lineTo(cx - 36, cy);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;

    // Center 'T' Emblem in deep midnight navy
    ctx.fillStyle = '#090d16';
    ctx.font = 'bold 36px "Montserrat", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('T', cx, cy + 1);

    // 4. Equalizer Voice Pulse Bars below Star
    const barWidth = 6;
    const barSpacing = 6;
    const barHeights = [14, 26, 36, 48, 36, 26, 14];
    const totalBarsW = barHeights.length * (barWidth + barSpacing) - barSpacing;
    const barStartX = cx - totalBarsW / 2;
    const barY = cy + 120;

    barHeights.forEach((h, bIdx) => {
      const bx = barStartX + bIdx * (barWidth + barSpacing);
      const bGrad = ctx.createLinearGradient(bx, barY - h / 2, bx, barY + h / 2);
      bGrad.addColorStop(0, '#00f0ff');
      bGrad.addColorStop(1, '#818cf8');
      ctx.fillStyle = bGrad;
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.roundRect(bx, barY - h / 2, barWidth, h, 3);
      ctx.fill();
    });

    ctx.restore();
  } else {
    // SHIELD / GEOMETRIC MONOGRAM (TARA & GENERAL)
    const cy = iconCenterY;
    const cx = iconCenterX;
    const initial = appName.charAt(0).toUpperCase() || 'S';

    // Hexagon Shield
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 6;
    ctx.shadowColor = primaryColor;
    ctx.shadowBlur = 25;
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i - Math.PI / 6;
      const hx = cx + 130 * Math.cos(angle);
      const hy = cy + 130 * Math.sin(angle);
      if (i === 0) ctx.moveTo(hx, hy);
      else ctx.lineTo(hx, hy);
    }
    ctx.closePath();
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Stylized Lettermark
    ctx.font = 'bold 150px "Montserrat", system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
    ctx.shadowBlur = 24;
    ctx.fillText(initial, cx, cy + 10);
    ctx.restore();
  }
  ctx.restore();

  // 8. Brand Name Display Typography below App Icon
  const textStartY = 715;

  ctx.save();
  ctx.font = 'bold 62px "Montserrat", "Segoe UI", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Crisp White Gradient with soft glow
  const titleGrad = ctx.createLinearGradient(width / 2, textStartY - 30, width / 2, textStartY + 30);
  titleGrad.addColorStop(0, '#ffffff');
  titleGrad.addColorStop(0.7, '#f8fafc');
  titleGrad.addColorStop(1, '#94a3b8');
  ctx.fillStyle = titleGrad;
  ctx.shadowColor = `${primaryColor}80`;
  ctx.shadowBlur = 20;
  ctx.fillText(appName.toUpperCase(), width / 2, textStartY);
  ctx.restore();

  // 9. Category Pill Badge
  const pillW = 340;
  const pillH = 38;
  const pillX = (width - pillW) / 2;
  const pillY = 765;

  ctx.save();
  ctx.beginPath();
  ctx.roundRect(pillX, pillY, pillW, pillH, 19);
  ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
  ctx.fill();
  ctx.strokeStyle = `${primaryColor}60`;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.font = 'bold 14px "Courier New", monospace';
  ctx.letterSpacing = '3px';
  ctx.fillStyle = '#38bdf8';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(`✦ ${category.toUpperCase()} ✦`, width / 2, pillY + pillH / 2);
  ctx.restore();

  // 10. Tagline in Hindi / English
  ctx.save();
  ctx.font = '500 20px "Segoe UI", system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#cbd5e1';
  ctx.fillText(tagline, width / 2, 835);
  ctx.restore();

  // 11. Glowing Divider Line
  const divY = 875;
  const lineGrad = ctx.createLinearGradient(width * 0.2, divY, width * 0.8, divY);
  lineGrad.addColorStop(0, 'rgba(0, 240, 255, 0)');
  lineGrad.addColorStop(0.3, `${primaryColor}80`);
  lineGrad.addColorStop(0.5, '#fbbf24');
  lineGrad.addColorStop(0.7, `${secondaryColor}80`);
  lineGrad.addColorStop(1, 'rgba(0, 240, 255, 0)');
  ctx.fillStyle = lineGrad;
  ctx.fillRect(width * 0.2, divY, width * 0.6, 2.5);

  // 12. Technical Corner Alignment Brackets & Metadata
  const bracketSize = 28;
  const margin = 45;
  ctx.save();
  ctx.strokeStyle = 'rgba(0, 240, 255, 0.35)';
  ctx.lineWidth = 2;

  // Top-Left
  ctx.beginPath();
  ctx.moveTo(margin, margin + bracketSize);
  ctx.lineTo(margin, margin);
  ctx.lineTo(margin + bracketSize, margin);
  ctx.stroke();

  // Top-Right
  ctx.beginPath();
  ctx.moveTo(width - margin - bracketSize, margin);
  ctx.lineTo(width - margin, margin);
  ctx.lineTo(width - margin, margin + bracketSize);
  ctx.stroke();

  // Bottom-Left
  ctx.beginPath();
  ctx.moveTo(margin, height - margin - bracketSize);
  ctx.lineTo(margin, height - margin);
  ctx.lineTo(margin + bracketSize, height - margin);
  ctx.stroke();

  // Bottom-Right
  ctx.beginPath();
  ctx.moveTo(width - margin - bracketSize, height - margin);
  ctx.lineTo(width - margin, height - margin);
  ctx.lineTo(width - margin, height - margin - bracketSize);
  ctx.stroke();

  // Top Technical Specs
  ctx.font = 'bold 12px "Courier New", monospace';
  ctx.fillStyle = '#64748b';
  ctx.textAlign = 'left';
  ctx.fillText('1024 × 1024 HD • VECTOR APP ICON SPEC', margin + 36, margin + 14);

  ctx.textAlign = 'right';
  ctx.fillText('RGB ULTRA COLOR • HIGH RESOLUTION', width - margin - 36, margin + 14);

  // Footer Signature
  ctx.textAlign = 'center';
  ctx.font = 'bold 13px "Courier New", monospace';
  ctx.fillStyle = '#64748b';
  ctx.fillText('DESIGNED BY TARA AI ASSISTANT • CREATOR BRIJMOHAN KUMAR', width / 2, height - 38);
  ctx.restore();

  const dataUrl = canvas.toDataURL('image/png', 0.95);
  const cleanFileName = `${appName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-app-logo.png`;

  const logoDetails: LogoGraphicData = {
    appName,
    tagline,
    category,
    primaryColor,
    secondaryColor,
    iconType,
    dataUrl,
    downloadFileName: cleanFileName,
  };

  const isTaraBrand = appName.toLowerCase().includes('tara') || /tara|तारा/i.test(appName);
  const friendlySummary = isTaraBrand
    ? `मैंने तारा (Tara AI) के लिए एक नया और मॉडर्न लोगो तैयार कर दिया है! इसमें ऑरा-स्टार और वॉयस वेवफॉर्म का खूबसूरत संयोजन है। आप इसे नीचे देख सकते हैं और डाउनलोड बटन से तुरंत अपने डिवाइस में सहेज सकते हैं।`
    : `मैंने ${appName} ऐप के लिए मॉडर्न लोगो तैयार कर दिया है, आप इसे नीचे देख सकते हैं और डाउनलोड बटन से सीधे सहेज सकते हैं।`;

  return {
    dataUrl,
    downloadFileName: cleanFileName,
    summary: friendlySummary,
    logoDetails,
  };
}
