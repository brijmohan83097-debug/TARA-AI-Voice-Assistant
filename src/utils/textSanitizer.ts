/**
 * Utility to sanitize chat messages, blocking all raw JSON, action blocks, and conversational fluff.
 */

export function sanitizeChatBubbleText(text: string): string {
  if (!text) return '';
  let cleaned = text;

  // 1. Remove markdown code blocks containing json_actions, json_prompts, or json
  cleaned = cleaned.replace(/```(?:json_actions|json_prompts|json)?[\s\S]*?```/gi, '');

  // 2. Remove raw JSON objects with action/type/command/appName
  cleaned = cleaned.replace(/\{[\s\r\n]*"(?:action|type|intent|command|name|appName)"[\s\S]*?\}/gi, '');
  cleaned = cleaned.replace(/\[[\s\r\n]*\{[\s\S]*?\}[\s\r\n]*\]/gi, '');

  // 3. Remove inline JSON keys like {"action": "edit_background", ...} or {"type": ...}
  cleaned = cleaned.replace(/\{"action"\s*:\s*"[^"]*"[\s\S]*?\}/gi, '');
  cleaned = cleaned.replace(/\{"type"\s*:\s*"[^"]*"[\s\S]*?\}/gi, '');

  // 4. If string starts or ends with JSON brackets and contains "action": or "type":
  if (/(?:\{|"action":|"edit_background"|"type":)/.test(cleaned) && (cleaned.trim().startsWith('{') || cleaned.trim().endsWith('}'))) {
    cleaned = cleaned.replace(/\{[\s\S]*?\}/g, '');
  }

  // 5. Remove fake markdown download links like [डाउनलोड इमेज]
  cleaned = cleaned
    .replace(/\[\s*(डाउनलोड\s*इमेज|download\s*image|इमेज\s*डाउनलोड)\s*\](?:\([^)]*\))?/gi, '')
    .replace(/\(\s*(डाउनलोड\s*इमेज|download\s*image)\s*\)/gi, '');

  // 6. Remove conversational fluff phrases like "Poochne ke liye dhanyavad"
  cleaned = cleaned.replace(/(?:मुझसे\s*)?पूछने\s*के\s*लिए\s*धन्यवाद[!,.]?/gi, '');

  return cleaned.trim();
}

export function cleanTextLooksLikeJson(t: string): boolean {
  if (!t) return false;
  const trimmed = t.trim();
  return (
    (trimmed.startsWith('{') && trimmed.endsWith('}')) ||
    (trimmed.startsWith('[') && trimmed.endsWith(']')) ||
    trimmed.includes('{"action"') ||
    trimmed.includes('{"type"') ||
    /"action":|"edit_background"|"appName":|"type":|"details":|"iconType":/i.test(trimmed)
  );
}
