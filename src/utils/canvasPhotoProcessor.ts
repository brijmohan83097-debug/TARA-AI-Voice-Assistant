/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ProcessedPhotoResult {
  dataUrl: string;
  summary: string;
  downloadFileName: string;
}

/**
 * Loads an image from a data URL or blob URL safely.
 */
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Image load failed'));
    img.src = src;
  });
}

/**
 * Helper to wrap text into multiple lines for Canvas rendering
 */
function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let currentLine = '';

  for (let i = 0; i < words.length; i++) {
    const testLine = currentLine ? `${currentLine} ${words[i]}` : words[i];
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = words[i];
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) {
    lines.push(currentLine);
  }
  return lines;
}

/**
 * Canvas Image Processor for Tara Voice Assistant
 * Enhances, clarifies, and overlays typography quote cards on existing photos.
 */
export async function processPhotoWithCanvas(
  imageSrc: string,
  instruction: string,
  suggestedQuote?: string
): Promise<ProcessedPhotoResult> {
  const img = await loadImage(imageSrc);

  // Maintain original aspect ratio, scaled to crisp modern resolution (max 1200px)
  let width = img.naturalWidth || 800;
  let height = img.naturalHeight || 800;
  const maxDim = 1200;

  if (width > maxDim || height > maxDim) {
    if (width > height) {
      height = Math.round((height * maxDim) / width);
      width = maxDim;
    } else {
      width = Math.round((width * maxDim) / height);
      height = maxDim;
    }
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas 2D context unavailable');
  }

  const lowerInst = instruction.toLowerCase();
  const isEnhance = /enhance|clear|साफ|सुधार|bright|clarity|hd|sharp|क्लीन/i.test(lowerInst);
  const isQuote = /quote|text|सुविचार|लिख|शायरी|poster|कार्ड|विचार|thought/i.test(lowerInst) || Boolean(suggestedQuote);
  const isCyber = /cyber|glow|साइबर|blue|neon|futuristic/i.test(lowerInst);

  // 1. Draw base photo with appropriate filters
  ctx.save();
  if (isEnhance) {
    // Contrast boost, brightness normalization, saturation enhancement
    ctx.filter = 'contrast(1.22) brightness(1.06) saturate(1.15)';
  } else if (isCyber) {
    ctx.filter = 'contrast(1.2) brightness(1.05) saturate(1.25) hue-rotate(10deg)';
  } else {
    ctx.filter = 'contrast(1.08) brightness(1.02)';
  }
  ctx.drawImage(img, 0, 0, width, height);
  ctx.restore();

  // 2. Optical clarity & contrast sharpening pass
  if (isEnhance) {
    const vignette = ctx.createRadialGradient(
      width / 2,
      height / 2,
      Math.min(width, height) * 0.35,
      width / 2,
      height / 2,
      Math.max(width, height) * 0.8
    );
    vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
    vignette.addColorStop(1, 'rgba(0, 0, 0, 0.38)');
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, width, height);
  }

  let summary = 'फ़ोटो को उन्नत एवं स्पष्ट (Enhanced) किया गया है।';
  let downloadFileName = 'tara-enhanced-photo.png';

  // 3. Render Quote / Text Overlay if requested
  if (isQuote) {
    const quoteText =
      suggestedQuote ||
      (instruction.length > 10 && !instruction.includes('add quote')
        ? instruction
        : '“सफलता का रहस्य अपने लक्ष्य के प्रति निरंतर समर्पित रहना है।”');

    // Bottom dark gradient scrim for 100% typography legibility
    const scrimHeight = Math.round(height * 0.42);
    const scrim = ctx.createLinearGradient(0, height - scrimHeight, 0, height);
    scrim.addColorStop(0, 'rgba(3, 8, 20, 0)');
    scrim.addColorStop(0.35, 'rgba(4, 12, 28, 0.75)');
    scrim.addColorStop(1, 'rgba(2, 6, 16, 0.95)');
    ctx.fillStyle = scrim;
    ctx.fillRect(0, height - scrimHeight, width, scrimHeight);

    // Subtle Cyan Accent Line
    const accentY = height - scrimHeight + 40;
    const lineGrad = ctx.createLinearGradient(width * 0.1, accentY, width * 0.9, accentY);
    lineGrad.addColorStop(0, 'rgba(0, 240, 255, 0)');
    lineGrad.addColorStop(0.5, 'rgba(0, 240, 255, 0.85)');
    lineGrad.addColorStop(1, 'rgba(0, 240, 255, 0)');
    ctx.fillStyle = lineGrad;
    ctx.fillRect(width * 0.1, accentY, width * 0.8, 2);

    // Decorative Quote Mark
    ctx.fillStyle = 'rgba(0, 240, 255, 0.6)';
    ctx.font = `bold ${Math.round(width * 0.065)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('“', width / 2, accentY + 45);

    // Quote Typography (Hindi & English compatible)
    const fontSize = Math.max(18, Math.min(32, Math.round(width * 0.038)));
    ctx.font = `600 ${fontSize}px "Noto Sans Devanagari", "Segoe UI", system-ui, sans-serif`;
    ctx.fillStyle = '#f8fafc';
    ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.85)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 2;

    const maxTextWidth = width * 0.82;
    const lines = wrapText(ctx, quoteText.replace(/^[“"]|[”"]$/g, '').trim(), maxTextWidth);
    const lineHeight = fontSize * 1.45;
    const startY = accentY + 80;

    lines.slice(0, 4).forEach((line, idx) => {
      ctx.fillText(line, width / 2, startY + idx * lineHeight);
    });

    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;

    // Signature Badge
    ctx.font = `500 ${Math.max(11, Math.round(width * 0.022))}px monospace`;
    ctx.fillStyle = '#38bdf8';
    ctx.textAlign = 'center';
    ctx.fillText('⚡ TARA AI • CREATOR EDITION', width / 2, height - 25);

    summary = 'फ़ोटो पर सुंदर सुविचार एवं कलात्मक फ़ॉर्मेटिंग जोड़ी गई है।';
    downloadFileName = 'tara-quote-card.png';
  } else if (isEnhance) {
    ctx.font = `500 ${Math.max(10, Math.round(width * 0.02))}px monospace`;
    ctx.fillStyle = 'rgba(0, 240, 255, 0.7)';
    ctx.textAlign = 'right';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
    ctx.shadowBlur = 4;
    ctx.fillText('TARA ENHANCED HD', width - 20, height - 20);
    ctx.shadowColor = 'transparent';
  }

  const dataUrl = canvas.toDataURL('image/png', 0.94);
  return {
    dataUrl,
    summary,
    downloadFileName,
  };
}

/**
 * Extracts a candidate brand name or subject from the user's prompt or AI response.
 */
function extractBrandOrTitle(prompt: string, aiText?: string): string {
  // Check for common patterns: "logo for [Name]", "create a logo for [Name]", "[Name] ka logo", etc.
  const forMatch = prompt.match(/(?:logo|graphic|poster|design)\s+(?:for|of|named)\s+["']?([A-Za-z0-9\s\u0900-\u097F]{2,24})["']?/i);
  if (forMatch && forMatch[1]) {
    return forMatch[1].trim().toUpperCase();
  }

  const kaMatch = prompt.match(/["']?([A-Za-z0-9\s\u0900-\u097F]{2,20})["']?\s+(?:ka|ki|ke)\s+logo/i);
  if (kaMatch && kaMatch[1]) {
    return kaMatch[1].trim().toUpperCase();
  }

  // If user prompt mentions "Tara" or "Tara AI"
  if (/tara/i.test(prompt)) {
    return 'TARA AI';
  }

  // Check if AI response has a bold title or quoted brand name: **BRAND NAME**
  if (aiText) {
    const aiBoldMatch = aiText.match(/\*\*([A-Za-z0-9\s\u0900-\u097F]{2,20})\*\*/);
    if (aiBoldMatch && aiBoldMatch[1] && !aiBoldMatch[1].toLowerCase().includes('logo') && !aiBoldMatch[1].toLowerCase().includes('image')) {
      return aiBoldMatch[1].trim().toUpperCase();
    }
  }

  // Fallback brand
  return 'TARA AI';
}

/**
 * Client-Side Visual Graphic & Logo Synthesizer
 * Generates actual high-resolution (1200x1200px) logos, brand identity badges, and quote posters
 * directly in the browser canvas. Never makes text excuses!
 */
export async function generateVisualGraphicOrLogo(
  prompt: string,
  aiResponseText?: string
): Promise<ProcessedPhotoResult> {
  const width = 1200;
  const height = 1200;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas 2D context unavailable');
  }

  const lower = prompt.toLowerCase();
  const isQuote = /quote|सुविचार|विचार|thought|शायरी|poster|कार्ड|प्रेरणा/i.test(lower);

  if (isQuote) {
    // ==========================================
    // 1. HIGH-RESOLUTION QUOTE / SUVICHAR POSTER
    // ==========================================
    // Background: Deep cosmic twilight gradient
    const bgGrad = ctx.createRadialGradient(
      width / 2,
      height * 0.45,
      100,
      width / 2,
      height / 2,
      width * 0.75
    );
    bgGrad.addColorStop(0, '#0f2444');
    bgGrad.addColorStop(0.4, '#07152b');
    bgGrad.addColorStop(0.8, '#030a16');
    bgGrad.addColorStop(1, '#01040a');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Ambient floating light particles
    for (let i = 0; i < 45; i++) {
      const px = Math.random() * width;
      const py = Math.random() * height;
      const pr = Math.random() * 2.5 + 0.8;
      ctx.beginPath();
      ctx.arc(px, py, pr, 0, Math.PI * 2);
      ctx.fillStyle = i % 2 === 0 ? 'rgba(0, 240, 255, 0.45)' : 'rgba(251, 191, 36, 0.4)';
      ctx.fill();
    }

    // Outer aesthetic glowing border
    const margin = 50;
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.35)';
    ctx.lineWidth = 2;
    ctx.strokeRect(margin, margin, width - margin * 2, height - margin * 2);

    // Inner thin border with golden corner accents
    const innerMargin = 68;
    ctx.strokeStyle = 'rgba(251, 191, 36, 0.3)';
    ctx.lineWidth = 1;
    ctx.strokeRect(innerMargin, innerMargin, width - innerMargin * 2, height - innerMargin * 2);

    // Corner Ornaments
    const corners = [
      [innerMargin, innerMargin],
      [width - innerMargin, innerMargin],
      [innerMargin, height - innerMargin],
      [width - innerMargin, height - innerMargin],
    ];
    ctx.fillStyle = '#fbbf24';
    corners.forEach(([cx, cy]) => {
      ctx.beginPath();
      ctx.arc(cx, cy, 4, 0, Math.PI * 2);
      ctx.fill();
    });

    // Top Category Pill
    ctx.fillStyle = 'rgba(0, 240, 255, 0.12)';
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.6)';
    ctx.lineWidth = 1.5;
    const pillW = 280;
    const pillH = 42;
    const pillX = (width - pillW) / 2;
    const pillY = 130;
    ctx.beginPath();
    ctx.roundRect(pillX, pillY, pillW, pillH, 21);
    ctx.fill();
    ctx.stroke();

    ctx.font = 'bold 15px "Courier New", monospace';
    ctx.fillStyle = '#38bdf8';
    ctx.textAlign = 'center';
    ctx.fillText('✦ दैनिक सुविचार • TARA DAILY ✦', width / 2, pillY + 26);

    // Huge Decorative Quote Mark
    ctx.fillStyle = 'rgba(0, 240, 255, 0.25)';
    ctx.font = 'bold 180px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('“', width / 2, 380);

    // Extract or formulate quote text
    let quoteStr = '“कर्म करो तो फल मिलता है, आज नहीं तो कल मिलता है। जितना गहरा अधिक हो कुआं, उतना मीठा जल मिलता है।”';
    if (aiResponseText) {
      const match = aiResponseText.match(/["“]([^"”]{10,220})["”]/);
      if (match && match[1]) {
        quoteStr = match[1].trim();
      }
    }

    // Main Quote Body Typography
    const fontSize = 42;
    ctx.font = `600 ${fontSize}px "Noto Sans Devanagari", "Segoe UI", system-ui, sans-serif`;
    ctx.fillStyle = '#f8fafc';
    ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(0, 240, 255, 0.4)';
    ctx.shadowBlur = 12;

    const wrappedLines = wrapText(ctx, quoteStr.replace(/^[“"]|[”"]$/g, ''), width * 0.76);
    const lineHeight = fontSize * 1.6;
    const startY = height / 2 - (wrappedLines.length * lineHeight) / 2 + 50;

    wrappedLines.slice(0, 6).forEach((line, i) => {
      ctx.fillText(line, width / 2, startY + i * lineHeight);
    });

    ctx.shadowBlur = 0;

    // Glowing Divider
    const divY = startY + wrappedLines.length * lineHeight + 50;
    const divGrad = ctx.createLinearGradient(width * 0.25, divY, width * 0.75, divY);
    divGrad.addColorStop(0, 'rgba(0, 240, 255, 0)');
    divGrad.addColorStop(0.5, 'rgba(251, 191, 36, 0.85)');
    divGrad.addColorStop(1, 'rgba(0, 240, 255, 0)');
    ctx.fillStyle = divGrad;
    ctx.fillRect(width * 0.25, divY, width * 0.5, 3);

    // Footer Signature
    ctx.font = 'bold 16px "Courier New", monospace';
    ctx.fillStyle = '#94a3b8';
    ctx.textAlign = 'center';
    ctx.fillText('⚡ TARA AI ASSISTANT • CREATED BY BRIJMOHAN KUMAR', width / 2, height - 100);

    return {
      dataUrl: canvas.toDataURL('image/png', 0.95),
      summary: 'सुविचार पोस्टर (Inspirational Quote Poster) उच्च रिज़ॉल्यूशन में तैयार किया गया है।',
      downloadFileName: 'tara-quote-poster.png',
    };
  }

  // ==========================================
  // 2. HIGH-RESOLUTION LOGO & BRAND IDENTITY
  // ==========================================
  const brandName = extractBrandOrTitle(prompt, aiResponseText);
  const initialChar = brandName.charAt(0) || 'T';

  // Background: Rich Deep Tech Radial Gradient
  const bgGrad = ctx.createRadialGradient(
    width / 2,
    height * 0.46,
    80,
    width / 2,
    height / 2,
    width * 0.72
  );
  bgGrad.addColorStop(0, '#0b1e38');
  bgGrad.addColorStop(0.35, '#061326');
  bgGrad.addColorStop(0.75, '#020914');
  bgGrad.addColorStop(1, '#00040a');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // Subtle Cyber Grid Lines in background
  ctx.strokeStyle = 'rgba(0, 240, 255, 0.05)';
  ctx.lineWidth = 1;
  const gridSize = 60;
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

  // Ambient Center Glow
  const centerGlow = ctx.createRadialGradient(width / 2, 460, 20, width / 2, 460, 320);
  centerGlow.addColorStop(0, 'rgba(0, 240, 255, 0.28)');
  centerGlow.addColorStop(0.5, 'rgba(37, 99, 235, 0.15)');
  centerGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = centerGlow;
  ctx.beginPath();
  ctx.arc(width / 2, 460, 320, 0, Math.PI * 2);
  ctx.fill();

  // Outer Hexagon / Shield Emblem Geometry
  const centerX = width / 2;
  const centerY = 460;
  const radius = 210;

  // Draw 2 concentric glowing orbital rings
  ctx.save();
  ctx.strokeStyle = 'rgba(0, 240, 255, 0.25)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius + 40, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([8, 12]);
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius + 20, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  // Draw Main Outer Hexagon Shield
  const hexPoints: [number, number][] = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 6;
    const hx = centerX + radius * Math.cos(angle);
    const hy = centerY + radius * Math.sin(angle);
    hexPoints.push([hx, hy]);
  }

  // Fill Hexagon Shield with Glassmorphic Gradient
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(hexPoints[0][0], hexPoints[0][1]);
  for (let i = 1; i < 6; i++) {
    ctx.lineTo(hexPoints[i][0], hexPoints[i][1]);
  }
  ctx.closePath();

  const hexGrad = ctx.createLinearGradient(centerX - radius, centerY - radius, centerX + radius, centerY + radius);
  hexGrad.addColorStop(0, 'rgba(8, 28, 58, 0.85)');
  hexGrad.addColorStop(0.5, 'rgba(4, 18, 38, 0.9)');
  hexGrad.addColorStop(1, 'rgba(2, 9, 20, 0.95)');
  ctx.fillStyle = hexGrad;
  ctx.fill();

  // Hexagon Border with Neon Cyan Stroke & Shadow
  ctx.shadowColor = '#00f0ff';
  ctx.shadowBlur = 24;
  ctx.strokeStyle = '#00f0ff';
  ctx.lineWidth = 6;
  ctx.stroke();
  ctx.restore();

  // Inner Geometric Gem Crest
  const innerRadius = radius * 0.72;
  ctx.save();
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 6;
    const hx = centerX + innerRadius * Math.cos(angle);
    const hy = centerY + innerRadius * Math.sin(angle);
    if (i === 0) ctx.moveTo(hx, hy);
    else ctx.lineTo(hx, hy);
  }
  ctx.closePath();
  ctx.strokeStyle = 'rgba(251, 191, 36, 0.8)'; // Golden inner trim
  ctx.lineWidth = 2.5;
  ctx.shadowColor = '#fbbf24';
  ctx.shadowBlur = 10;
  ctx.stroke();
  ctx.restore();

  // Central Emblem Monogram Lettermark
  ctx.save();
  ctx.font = 'bold 150px "Montserrat", "Segoe UI", system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const letterGrad = ctx.createLinearGradient(centerX, centerY - 90, centerX, centerY + 90);
  letterGrad.addColorStop(0, '#ffffff');
  letterGrad.addColorStop(0.4, '#e0f2fe');
  letterGrad.addColorStop(0.8, '#38bdf8');
  letterGrad.addColorStop(1, '#0284c7');

  ctx.shadowColor = 'rgba(0, 240, 255, 0.8)';
  ctx.shadowBlur = 30;
  ctx.fillStyle = letterGrad;
  ctx.fillText(initialChar, centerX, centerY + 8);
  ctx.restore();

  // Crown Star / Diamond at top of emblem
  ctx.fillStyle = '#00f0ff';
  ctx.shadowColor = '#00f0ff';
  ctx.shadowBlur = 15;
  ctx.beginPath();
  const starY = centerY - radius - 22;
  ctx.moveTo(centerX, starY - 14);
  ctx.lineTo(centerX + 12, starY);
  ctx.lineTo(centerX, starY + 14);
  ctx.lineTo(centerX - 12, starY);
  ctx.closePath();
  ctx.fill();
  ctx.shadowBlur = 0;

  // Primary Brand Typography
  ctx.save();
  ctx.font = 'bold 64px "Montserrat", "Segoe UI", system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffffff';
  ctx.shadowColor = 'rgba(0, 240, 255, 0.5)';
  ctx.shadowBlur = 18;
  ctx.fillText(brandName, centerX, 810);
  ctx.restore();

  // Sleek Glowing Divider Line
  const lineY = 855;
  const lineGrad = ctx.createLinearGradient(centerX - 240, lineY, centerX + 240, lineY);
  lineGrad.addColorStop(0, 'rgba(0, 240, 255, 0)');
  lineGrad.addColorStop(0.3, 'rgba(0, 240, 255, 0.8)');
  lineGrad.addColorStop(0.5, 'rgba(251, 191, 36, 0.9)');
  lineGrad.addColorStop(0.7, 'rgba(0, 240, 255, 0.8)');
  lineGrad.addColorStop(1, 'rgba(0, 240, 255, 0)');
  ctx.fillStyle = lineGrad;
  ctx.fillRect(centerX - 240, lineY, 480, 3);

  // Subtitle / Brand Category Pill
  ctx.font = '600 20px "Courier New", monospace';
  ctx.fillStyle = '#38bdf8';
  ctx.textAlign = 'center';
  ctx.letterSpacing = '6px';
  ctx.fillText('✦ OFFICIAL BRAND IDENTITY ✦', centerX, 905);

  // Bottom Signature & Verification Seal
  ctx.font = '500 15px "Courier New", monospace';
  ctx.fillStyle = '#64748b';
  ctx.textAlign = 'center';
  ctx.fillText('DESIGNED BY TARA AI • CREATOR BRIJMOHAN KUMAR', centerX, 1120);

  // Corner Technical Bracket Marks
  const bracketLen = 32;
  const pad = 40;
  ctx.strokeStyle = 'rgba(0, 240, 255, 0.4)';
  ctx.lineWidth = 2;

  // Top-Left
  ctx.beginPath();
  ctx.moveTo(pad, pad + bracketLen);
  ctx.lineTo(pad, pad);
  ctx.lineTo(pad + bracketLen, pad);
  ctx.stroke();

  // Top-Right
  ctx.beginPath();
  ctx.moveTo(width - pad - bracketLen, pad);
  ctx.lineTo(width - pad, pad);
  ctx.lineTo(width - pad, pad + bracketLen);
  ctx.stroke();

  // Bottom-Left
  ctx.beginPath();
  ctx.moveTo(pad, height - pad - bracketLen);
  ctx.lineTo(pad, height - pad);
  ctx.lineTo(pad + bracketLen, height - pad);
  ctx.stroke();

  // Bottom-Right
  ctx.beginPath();
  ctx.moveTo(width - pad - bracketLen, height - pad);
  ctx.lineTo(width - pad, height - pad);
  ctx.lineTo(width - pad, height - pad - bracketLen);
  ctx.stroke();

  const dataUrl = canvas.toDataURL('image/png', 0.95);
  const cleanFileName = `tara-${brandName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-logo.png`;

  return {
    dataUrl,
    summary: `आधिकारिक लोगो (${brandName}) उच्च-रिज़ॉल्यूशन में जनरेट किया गया है।`,
    downloadFileName: cleanFileName,
  };
}
