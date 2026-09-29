/** MariaDB/mysql2 often returns JSON columns as strings — normalize before UI use. */

export type QuestionContent = {
  text?: string;
  html?: string;
  stem?: string;
  value?: number;
  [key: string]: unknown;
};

export function parseJsonValue<T = unknown>(value: unknown): T | unknown {
  if (value == null) return value;
  if (typeof value !== 'string') return value;
  const trimmed = value.trim();
  if (!trimmed || (trimmed[0] !== '{' && trimmed[0] !== '[')) return value;
  try {
    return JSON.parse(trimmed) as T;
  } catch {
    return value;
  }
}

export function parseQuestionContent(content: unknown): QuestionContent {
  const parsed = parseJsonValue<QuestionContent>(content);
  if (parsed == null) return {};
  if (typeof parsed === 'string') return { text: parsed };
  if (typeof parsed === 'object' && !Array.isArray(parsed)) {
    return parsed as QuestionContent;
  }
  return { text: String(parsed) };
}

export function getQuestionText(content: unknown, fallback = 'Question'): string {
  const c = parseQuestionContent(content);
  if (typeof c.text === 'string' && c.text.trim()) return c.text.trim();
  if (typeof c.stem === 'string' && c.stem.trim()) return c.stem.trim();
  if (typeof c.html === 'string' && c.html.trim()) {
    return c.html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() || fallback;
  }
  return fallback;
}

export function getOptionText(content: unknown): string {
  const c = parseQuestionContent(content);
  if (typeof c.text === 'string' && c.text.trim()) return c.text.trim();
  if (c.value != null && Number.isFinite(Number(c.value))) return String(c.value);
  return '—';
}
