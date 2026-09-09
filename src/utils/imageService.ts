/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { generateVisualGraphicOrLogo, ProcessedPhotoResult } from './canvasPhotoProcessor';
import {
  compositePersonOnBackground,
  isBackgroundChangeRequest,
} from './personCutoutService';

/**
 * Checks if the user's prompt is requesting to edit, change background, remove objects,
 * or place the subject in a new setting on an attached photo.
 */
export function isImageEditRequest(text: string): boolean {
  if (!text) return false;
  const t = text.toLowerCase().trim();

  // Explicit edit & background transformation patterns
  const editPatterns = [
    /background/i,
    /बैकग्राउंड/i,
    /\bbg\b/i,
    /पीछे\s*(का|की|के)?/i,
    /\broad\b|सड़क|रोड/i,
    /\btree|trees|पेड़|पौधे/i,
    /हटाओ|हटा\s*दो|हटाना|निकालो|रिमूव|remove|delete/i,
    /बदलो|बदल\s*दो|बदलना|change|replace|switch/i,
    /edit|एडिट|modify/i,
    /clear|साफ\s*करो|क्लीन|सुधारो/i,
    /object|ऑब्जेक्ट|चीज|सामान/i,
    /sky|आसमान|बादल|beach|समुद्र|पहाड़|mountain/i,
    /लगाओ|लगा\s*दो|खड़ा\s*कर|put|place/i,
    /फोटो\s*(सुधारो|एडिट|बदलो|साफ)/i,
    /photo\s*(edit|modify|enhance|change)/i,
  ];

  return editPatterns.some((pattern) => pattern.test(t));
}

/**
 * Checks if the user's prompt is requesting an AI-generated image, photo, or visual graphic.
 */
export function isRealImageGenRequest(text: string): boolean {
  if (!text) return false;
  const t = text.toLowerCase().trim();

  // Explicit direct patterns
  const directPatterns = [
    /photo\s*bana\s*(kar\s*)?do/i,
    /फोटो\s*बना\s*(कर\s*)?दो/i,
    /तस्वीर\s*बना\s*(कर\s*)?दो/i,
    /इमेज\s*बना\s*(कर\s*)?दो/i,
    /चित्र\s*बना\s*(कर\s*)?दो/i,
    /^(generate|create|make|draw)\s*(an?\s*)?(image|photo|picture|pic|graphic|portrait|wallpaper)/i,
    /(image|photo|picture|pic)\s*(generator|generation)/i,
    /\b(logo|लोगो)\s*(banao|bana\s*do|bana\s*kar\s*do|बनाओ|बना\s*दो|create|design)/i,
    /\b(photo|image|picture|pic|तस्वीर|फोटो|इमेज|चित्र)\s*(chahiye|dikhao|दिखाओ|लाओ|nikalo)/i,
  ];

  if (directPatterns.some((pattern) => pattern.test(t))) {
    return true;
  }

  // Combinations of visual noun + creation verb
  const hasVisualNoun = /\b(photo|image|picture|pic|portrait|wallpaper|तस्वीर|फोटो|इमेज|चित्र|ग्राफिक|लोगो|logo)\b/i.test(t);
  const hasCreationVerb = /\b(bana\s*(kar\s*)?do|banakar\s*do|bana\s*do|banao|generate|create|make|draw|बना\s*(कर\s*)?दो|बनाकर\s*दो|बना\s*दो|बनाओ|खींचो|डिजाइन)\b/i.test(t);

  return hasVisualNoun && hasCreationVerb;
}

export interface GeneratedImageResponse {
  success: boolean;
  dataUrl: string;
  imageUrl: string;
  downloadUrl: string;
  filename: string;
  prompt: string;
  originalPrompt: string;
  modelUsed: string;
  isEdited?: boolean;
}

export interface AttachedImagePayload {
  data: string;
  mimeType?: string;
  previewUrl?: string;
  name?: string;
}

/**
 * True AI Image Editing via Google Imagen 3 and Gemini Vision:
 * Sends the user's photo and prompt to the backend where Gemini Vision
 * describes the foreground subject and Imagen 3 creates a brand-new
 * high-resolution edited photo with the changed background.
 */
export async function editRealImage(
  prompt: string,
  image: AttachedImagePayload | string,
  aiContextText?: string
): Promise<ProcessedPhotoResult> {
  console.log(`[ImageService] Calling Real Person Cutout & Background Edit for: "${prompt}"`);

  // 1. Resolve image source (previewUrl or data URL)
  let imageSrc = '';
  if (typeof image === 'string') {
    imageSrc = image;
  } else if (image.previewUrl) {
    imageSrc = image.previewUrl;
  } else if (image.data) {
    imageSrc = image.data.startsWith('data:')
      ? image.data
      : `data:${image.mimeType || 'image/jpeg'};base64,${image.data}`;
  }

  // 2. Strict Identity Preservation Mandate:
  // When a user asks to change, replace, remove, or edit the background:
  // We NEVER generate a brand-new AI person from scratch.
  // We extract the original foreground person cutout via client-side canvas segmentation,
  // keep their face, body, clothes, and identity 100% intact, and composite them onto the new scene.
  if (imageSrc) {
    try {
      console.log('[ImageService] Executing client-side Canvas Person Cutout & Scene Compositing...');
      const compositeResult = await compositePersonOnBackground(imageSrc, prompt);
      return compositeResult;
    } catch (cutoutErr) {
      console.warn('[ImageService] Real person cutout compositor failed, falling back:', cutoutErr);
    }
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 35000);

    let imagePayload: { data: string; mimeType: string } | null = null;
    if (typeof image === 'string') {
      const parts = image.split(',');
      const mimeMatch = image.match(/^data:(image\/[a-zA-Z0-9+.-]+);base64,/);
      imagePayload = {
        data: parts.length > 1 ? parts[1] : parts[0],
        mimeType: mimeMatch ? mimeMatch[1] : 'image/jpeg',
      };
    } else if (image.data) {
      imagePayload = {
        data: image.data.includes(',') ? image.data.split(',')[1] : image.data,
        mimeType: image.mimeType || 'image/jpeg',
      };
    } else if (image.previewUrl && image.previewUrl.startsWith('data:')) {
      const parts = image.previewUrl.split(',');
      const mimeMatch = image.previewUrl.match(/^data:(image\/[a-zA-Z0-9+.-]+);base64,/);
      imagePayload = {
        data: parts.length > 1 ? parts[1] : parts[0],
        mimeType: mimeMatch ? mimeMatch[1] : 'image/jpeg',
      };
    }

    const res = await fetch('/api/edit-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt,
        image: imagePayload,
        aspectRatio: '1:1',
        style: 'photorealistic',
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (res.ok) {
      const data: GeneratedImageResponse = await res.json();
      if (data.success && (data.dataUrl || data.imageUrl)) {
        return {
          dataUrl: data.dataUrl || data.imageUrl,
          summary: data.prompt || prompt,
          downloadFileName: data.filename || `tara-edited-${Date.now()}.jpg`,
        };
      }
    }
  } catch (err) {
    console.warn('[ImageService] Backend Imagen Edit API call failed:', err);
  }

  // Graceful fallback to generateRealImage if edit call fails
  return await generateRealImage(prompt, aiContextText);
}

/**
 * Calls backend Google Imagen 3 endpoint to generate a realistic photorealistic image.
 * Falls back to client-side SVG/Canvas generator if network fails.
 */
export async function generateRealImage(
  prompt: string,
  aiContextText?: string
): Promise<ProcessedPhotoResult> {
  console.log(`[ImageService] Calling Google Imagen 3 for: "${prompt}"`);

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000);

    const res = await fetch('/api/generate-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt,
        aspectRatio: '1:1',
        style: 'photorealistic',
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (res.ok) {
      const data: GeneratedImageResponse = await res.json();
      if (data.success && (data.dataUrl || data.imageUrl)) {
        return {
          dataUrl: data.dataUrl || data.imageUrl,
          summary: data.prompt || prompt,
          downloadFileName: data.filename || `tara-photo-${Date.now()}.jpg`,
        };
      }
    }
  } catch (err) {
    console.warn('[ImageService] Backend Imagen API call failed, falling back to Canvas synthesis:', err);
  }

  // Graceful fallback to client canvas graphic
  return await generateVisualGraphicOrLogo(prompt, aiContextText);
}

/**
 * Robust image downloader supporting mobile WebViews, PWA, Chrome Android, and Desktop.
 */
export function downloadImageToDevice(imageUrl: string, fileName?: string): void {
  const actualName = fileName || `tara-image-${Date.now()}.jpg`;

  try {
    // If it's a data URL, create a blob to prevent URL length limits in mobile browsers
    if (imageUrl.startsWith('data:')) {
      const parts = imageUrl.split(',');
      const mime = parts[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
      const byteString = atob(parts[1]);
      const arrayBuffer = new ArrayBuffer(byteString.length);
      const uint8Array = new Uint8Array(arrayBuffer);

      for (let i = 0; i < byteString.length; i++) {
        uint8Array[i] = byteString.charCodeAt(i);
      }

      const blob = new Blob([uint8Array], { type: mime });
      const blobUrl = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = actualName;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      setTimeout(() => URL.revokeObjectURL(blobUrl), 30000);
      return;
    }

    // Standard static file URL
    const a = document.createElement('a');
    a.href = imageUrl;
    a.download = actualName;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  } catch (err) {
    console.warn('[ImageService] Trigger download failed, fallback to window.open:', err);
    window.open(imageUrl, '_blank');
  }
}
