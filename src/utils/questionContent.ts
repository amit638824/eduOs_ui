/** MariaDB/mysql2 often returns JSON columns as strings, buffers, or double-encoded JSON — normalize before UI use. */

export type QuestionContent = {
  text?: string;
  html?: string;
  stem?: string;
  value?: number | string;
  [key: string]: unknown;
};

/**
 * Safely parse JSON values, handling:
 * 1. Express/Node serialized Buffers: { type: 'Buffer', data: [...] }
 * 2. Nested/double-encoded JSON strings: '"{\"text\":\"...\"}"'
 * 3. Already-parsed objects or primitive values
 */
export function parseJsonSafely(val: unknown): unknown {
  if (val == null) return null;
  let curr = val;

  // Handle serialized Node.js Buffer: { type: 'Buffer', data: number[] }
  if (
    curr &&
    typeof curr === 'object' &&
    (curr as { type?: unknown }).type === 'Buffer' &&
    Array.isArray((curr as { data?: unknown }).data)
  ) {
    try {
      curr = new TextDecoder('utf-8').decode(new Uint8Array((curr as { data: number[] }).data));
    } catch {
      try {
        const arr = (curr as { data: number[] }).data;
        curr = String.fromCharCode.apply(null, arr);
      } catch {
        // ignore
      }
    }
  }

  // Iterate up to 3 times to unwrap double/triple stringified JSON
  for (let i = 0; i < 3; i++) {
    if (typeof curr !== 'string') break;
    const trimmed = curr.trim();
    if (!trimmed) break;
    if (
      (trimmed.startsWith('{') && trimmed.endsWith('}')) ||
      (trimmed.startsWith('[') && trimmed.endsWith(']')) ||
      (trimmed.startsWith('"') && trimmed.endsWith('"'))
    ) {
      try {
        curr = JSON.parse(trimmed);
      } catch {
        break;
      }
    } else {
      break;
    }
  }
  return curr;
}

export function parseJsonValue<T = unknown>(value: unknown): T | unknown {
  return parseJsonSafely(value) as T;
}

export function parseQuestionContent(content: unknown): QuestionContent {
  const parsed = parseJsonSafely(content);
  if (parsed == null) return {};
  if (typeof parsed === 'string') return { text: parsed };
  if (typeof parsed === 'object' && !Array.isArray(parsed)) {
    return parsed as QuestionContent;
  }
  return { text: String(parsed) };
}

export function getQuestionText(content: unknown, fallback = 'Question'): string {
  if (content == null) return fallback;

  let target: unknown = content;
  // If an entire question object was passed: { content: ..., text?: ... }
  if (typeof target === 'object' && target !== null && 'content' in target) {
    const rec = target as Record<string, unknown>;
    if (typeof rec.text === 'string' && rec.text.trim()) {
      return rec.text.trim();
    }
    if (rec.content != null) {
      target = rec.content;
    }
  }

  const parsed = parseJsonSafely(target);
  if (parsed == null) return fallback;

  if (typeof parsed === 'string') {
    const trimmed = parsed.trim();
    return trimmed || fallback;
  }

  if (typeof parsed === 'object' && !Array.isArray(parsed)) {
    const obj = parsed as Record<string, unknown>;
    for (const key of ['text', 'stem', 'question', 'question_text', 'questionText', 'title']) {
      const val = obj[key];
      if (typeof val === 'string' && val.trim()) return val.trim();
    }
    if (typeof obj.html === 'string' && obj.html.trim()) {
      const stripped = obj.html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      if (stripped) return stripped;
    }
  }

  return fallback;
}

export function getOptionText(content: unknown): string {
  if (content == null) return '—';

  let target: unknown = content;
  // If an entire option row/object was passed: { id, content: ..., is_correct: ... }
  if (typeof target === 'object' && target !== null && 'content' in target) {
    const rec = target as Record<string, unknown>;
    if (typeof rec.text === 'string' && rec.text.trim()) {
      return rec.text.trim();
    }
    if (typeof rec.option_text === 'string' && rec.option_text.trim()) {
      return rec.option_text.trim();
    }
    if (rec.content != null) {
      target = rec.content;
    }
  }

  const parsed = parseJsonSafely(target);
  if (parsed == null) return '—';

  if (typeof parsed === 'string') {
    const trimmed = parsed.trim();
    return trimmed || '—';
  }

  if (typeof parsed === 'number' && Number.isFinite(parsed)) {
    return String(parsed);
  }

  if (typeof parsed === 'object' && !Array.isArray(parsed)) {
    const obj = parsed as Record<string, unknown>;
    for (const key of ['text', 'option_text', 'optionText', 'stem', 'label', 'val']) {
      const val = obj[key];
      if (typeof val === 'string' && val.trim()) return val.trim();
      if (typeof val === 'number' && Number.isFinite(val)) return String(val);
    }
    if (obj.value != null) {
      if (typeof obj.value === 'string' && obj.value.trim()) return obj.value.trim();
      if (typeof obj.value === 'number' && Number.isFinite(obj.value)) return String(obj.value);
    }
    if (typeof obj.html === 'string' && obj.html.trim()) {
      const stripped = obj.html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      if (stripped) return stripped;
    }
  }

  return '—';
}
