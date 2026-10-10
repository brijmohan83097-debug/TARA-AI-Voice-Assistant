import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) {
      c = (c >>> 1) ^ (-(c & 1) & 0xedb88320);
    }
  }
  return (c ^ 0xffffffff) >>> 0;
}

function makeChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crcBuf = Buffer.alloc(4);
  const crcVal = crc32(Buffer.concat([typeBuf, data]));
  crcBuf.writeUInt32BE(crcVal, 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

function generatePng(width, height, pixelFn) {
  const sig = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // 8-bit
  ihdr[9] = 6; // RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const rawRows = [];
  for (let y = 0; y < height; y++) {
    const row = Buffer.alloc(1 + width * 4);
    row[0] = 0; // Filter: None
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = pixelFn(x, y, width, height);
      const offset = 1 + x * 4;
      row[offset] = Math.min(255, Math.max(0, Math.round(r)));
      row[offset + 1] = Math.min(255, Math.max(0, Math.round(g)));
      row[offset + 2] = Math.min(255, Math.max(0, Math.round(b)));
      row[offset + 3] = Math.min(255, Math.max(0, Math.round(a)));
    }
    rawRows.push(row);
  }

  const rawData = Buffer.concat(rawRows);
  const compressed = zlib.deflateSync(rawData);

  return Buffer.concat([
    sig,
    makeChunk('IHDR', ihdr),
    makeChunk('IDAT', compressed),
    makeChunk('IEND', Buffer.alloc(0))
  ]);
}

// Procedural Sci-Fi TARA Core Icon Generator
function taraPixelShader(x, y, w, h, isMaskable = false) {
  // Normalize to -1.0 .. 1.0 centered
  const nx = (x - w / 2) / (w / 2);
  const ny = (y - h / 2) / (h / 2);
  const dist = Math.sqrt(nx * nx + ny * ny);
  const angle = Math.atan2(ny, nx);

  // Background deep sci-fi navy: #050b14 -> (5, 11, 20)
  let r = 5;
  let g = 11;
  let b = 20;
  let a = 255;

  // Background subtle radial glow
  const bgGlow = Math.max(0, 1 - dist * 0.9);
  r += 0 * bgGlow;
  g += 30 * bgGlow;
  b += 50 * bgGlow;

  // If not maskable, round corners or smooth circular badge boundary if desired
  if (!isMaskable && dist > 0.98) {
    const edgeFade = Math.max(0, Math.min(1, (1 - dist) / 0.02));
    a = 255 * edgeFade;
  }

  // Scale for maskable safe zone (keep within dist <= 0.8)
  const s = isMaskable ? 0.78 : 0.90;
  const sd = dist / s;

  if (sd <= 1.05) {
    // Outer cyber ring
    if (sd >= 0.88 && sd <= 0.96) {
      // 8 segment notches
      const segment = Math.sin(angle * 8);
      if (segment > -0.7) {
        const ringGlow = Math.sin((sd - 0.88) / 0.08 * Math.PI);
        r += 0 * ringGlow;
        g += 200 * ringGlow;
        b += 255 * ringGlow;
      }
    }

    // Secondary mid ring
    if (sd >= 0.74 && sd <= 0.78) {
      const midGlow = Math.sin((sd - 0.74) / 0.04 * Math.PI);
      r += 0;
      g += 180 * midGlow;
      b += 255 * midGlow;
    }

    // Inner rotating-style segmented arc
    if (sd >= 0.58 && sd <= 0.64) {
      const arc = Math.cos(angle * 4 + 0.5);
      if (arc > 0) {
        r += 30;
        g += 230;
        b += 255;
      }
    }

    // Glowing Reactor Center Iris (sd <= 0.45)
    if (sd < 0.45) {
      const coreIntensity = Math.pow(Math.max(0, 1 - sd / 0.45), 1.8);
      r += 100 * coreIntensity;
      g += 240 * coreIntensity;
      b += 255 * coreIntensity;
    }

    // Center Core Hotspot (sd < 0.18)
    if (sd < 0.18) {
      const hotspot = Math.max(0, 1 - sd / 0.18);
      r = Math.min(255, r + 200 * hotspot);
      g = Math.min(255, g + 255 * hotspot);
      b = Math.min(255, b + 255 * hotspot);
    }

    // Sharp cross-hair lines (cyber HUD markers)
    const crossWidth = 0.02;
    if ((Math.abs(nx / s) < crossWidth && sd > 0.45 && sd < 0.92) ||
        (Math.abs(ny / s) < crossWidth && sd > 0.45 && sd < 0.92)) {
      g = Math.min(255, g + 160);
      b = Math.min(255, b + 230);
    }
  }

  return [r, g, b, a];
}

const iconsDir = path.resolve('public/icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

console.log('Generating PWA icons...');

// 1. icon-192.png
const p192 = generatePng(192, 192, (x, y, w, h) => taraPixelShader(x, y, w, h, false));
fs.writeFileSync(path.join(iconsDir, 'icon-192.png'), p192);
fs.writeFileSync(path.resolve('public/icon-192.png'), p192);

// 2. icon-512.png
const p512 = generatePng(512, 512, (x, y, w, h) => taraPixelShader(x, y, w, h, false));
fs.writeFileSync(path.join(iconsDir, 'icon-512.png'), p512);
fs.writeFileSync(path.resolve('public/icon-512.png'), p512);

// 3. icon-maskable-192.png & icon-maskable-512.png
const pm192 = generatePng(192, 192, (x, y, w, h) => taraPixelShader(x, y, w, h, true));
fs.writeFileSync(path.join(iconsDir, 'icon-maskable-192.png'), pm192);
fs.writeFileSync(path.resolve('public/icon-maskable-192.png'), pm192);

const pm512 = generatePng(512, 512, (x, y, w, h) => taraPixelShader(x, y, w, h, true));
fs.writeFileSync(path.join(iconsDir, 'icon-maskable-512.png'), pm512);
fs.writeFileSync(path.resolve('public/icon-maskable-512.png'), pm512);

// 4. apple-touch-icon.png (180x180)
const pApple = generatePng(180, 180, (x, y, w, h) => taraPixelShader(x, y, w, h, false));
fs.writeFileSync(path.join(iconsDir, 'apple-touch-icon.png'), pApple);
fs.writeFileSync(path.resolve('public/apple-touch-icon.png'), pApple);

// 5. SVG vector icon
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <radialGradient id="bgGrad" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#0a1a2f"/>
      <stop offset="100%" stop-color="#050b14"/>
    </radialGradient>
    <radialGradient id="coreGrad" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="25%" stop-color="#00f0ff"/>
      <stop offset="70%" stop-color="#0080ff"/>
      <stop offset="100%" stop-color="transparent"/>
    </radialGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="8" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
  </defs>
  <!-- Background -->
  <rect width="512" height="512" rx="100" fill="url(#bgGrad)"/>
  
  <!-- Outer Cyber Rings -->
  <circle cx="256" cy="256" r="210" fill="none" stroke="#00f0ff" stroke-width="3" stroke-opacity="0.3" stroke-dasharray="16 12"/>
  <circle cx="256" cy="256" r="180" fill="none" stroke="#00f0ff" stroke-width="4" stroke-opacity="0.8" filter="url(#glow)"/>
  <circle cx="256" cy="256" r="145" fill="none" stroke="#00f0ff" stroke-width="2" stroke-opacity="0.5" stroke-dasharray="40 20"/>
  <circle cx="256" cy="256" r="110" fill="none" stroke="#00f0ff" stroke-width="3" stroke-opacity="0.7"/>

  <!-- Crosshair Guides -->
  <line x1="256" y1="46" x2="256" y2="100" stroke="#00f0ff" stroke-width="2" stroke-opacity="0.8"/>
  <line x1="256" y1="412" x2="256" y2="466" stroke="#00f0ff" stroke-width="2" stroke-opacity="0.8"/>
  <line x1="46" y1="256" x2="100" y2="256" stroke="#00f0ff" stroke-width="2" stroke-opacity="0.8"/>
  <line x1="412" y1="256" x2="466" y2="256" stroke="#00f0ff" stroke-width="2" stroke-opacity="0.8"/>

  <!-- Center Core Glow -->
  <circle cx="256" cy="256" r="85" fill="url(#coreGrad)"/>

  <!-- TARA Branding Glyph -->
  <text x="256" y="278" font-family="'Chakra Petch', 'JetBrains Mono', sans-serif" font-weight="900" font-size="64" fill="#ffffff" text-anchor="middle" letter-spacing="4">TARA</text>
  <text x="256" y="308" font-family="'JetBrains Mono', monospace" font-weight="600" font-size="14" fill="#00f0ff" text-anchor="middle" letter-spacing="6">AI CORE</text>
</svg>`;

fs.writeFileSync(path.join(iconsDir, 'icon.svg'), svgContent);
fs.writeFileSync(path.resolve('public/icon.svg'), svgContent);

console.log('Successfully generated all PWA icons (192, 512, maskable, apple-touch, and svg)!');
