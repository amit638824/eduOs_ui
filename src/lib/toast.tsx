import { toast, type ToastOptions } from 'react-toastify';
import axios, { type AxiosResponse } from 'axios';
import { parseApiError, readApiMessage } from '@/lib/errors';
import type { ApiErrorResponse } from '@/types/api';

type ToastTone = 'success' | 'error' | 'info' | 'warning';

type ToastExtra = {
  title?: string;
  status?: number;
  code?: string;
  count?: number;
};

const DEDUPE_MS = 4000;
const recent: { text: string; at: number }[] = [];

const suppressedPatterns: { pattern: RegExp | string; expiresAt: number }[] = [];

/**
 * Suppress any popup toasts matching keyword or regex for durationMs.
 * Used during user-initiated actions (e.g. changing password, updating profile)
 * where the form already presents inline feedback.
 */
export function suppressToast(pattern: RegExp | string, durationMs = 6000): void {
  suppressedPatterns.push({ pattern, expiresAt: Date.now() + durationMs });
}

function isToastSuppressed(message: string): boolean {
  const now = Date.now();
  for (let i = suppressedPatterns.length - 1; i >= 0; i -= 1) {
    if (now > suppressedPatterns[i].expiresAt) {
      suppressedPatterns.splice(i, 1);
    }
  }
  const text = message.toLowerCase();
  return suppressedPatterns.some(({ pattern }) => {
    if (typeof pattern === 'string') return text.includes(pattern.toLowerCase());
    return pattern.test(text);
  });
}

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function wordsSet(text: string): Set<string> {
  const stopWords = new Set(['the', 'a', 'an', 'is', 'in', 'on', 'at', 'to', 'for', 'of', 'and', 'or', 'you', 'your', 'if', 'not', 'do', 'this', 'immediately']);
  return new Set(
    normalizeText(text)
      .split(' ')
      .filter((w) => w.length > 2 && !stopWords.has(w)),
  );
}

function overlaps(a: string, b: string): boolean {
  if (a === b) return true;
  const normA = normalizeText(a);
  const normB = normalizeText(b);
  if (normA === normB) return true;

  // Direct substring check
  const short = normA.length < normB.length ? normA : normB;
  const long = normA.length < normB.length ? normB : normA;
  if (short.length >= 10 && long.includes(short)) return true;

  const wordsA = wordsSet(normA);
  const wordsB = wordsSet(normB);

  // Semantic topic: password operations
  if (wordsA.has('password') && wordsB.has('password')) {
    const changeWords = ['update', 'updated', 'change', 'changed', 'reset'];
    const aHasChange = changeWords.some((w) => wordsA.has(w));
    const bHasChange = changeWords.some((w) => wordsB.has(w));
    if (aHasChange && bHasChange) return true;

    const errWords = ['incorrect', 'invalid', 'wrong', 'fail', 'failed', 'error'];
    const aHasErr = errWords.some((w) => wordsA.has(w));
    const bHasErr = errWords.some((w) => wordsB.has(w));
    if (aHasErr && bHasErr) return true;
  }

  // Semantic topic: profile operations
  if (wordsA.has('profile') && wordsB.has('profile')) {
    const actWords = ['update', 'updated', 'saved', 'save', 'success', 'successful'];
    const aHasAct = actWords.some((w) => wordsA.has(w));
    const bHasAct = actWords.some((w) => wordsB.has(w));
    if (aHasAct && bHasAct) return true;
  }

  // General word overlap (> 50% shared keywords)
  if (wordsA.size > 0 && wordsB.size > 0) {
    const smaller = wordsA.size < wordsB.size ? wordsA : wordsB;
    const larger = wordsA.size < wordsB.size ? wordsB : wordsA;
    let shared = 0;
    smaller.forEach((w) => {
      if (larger.has(w)) shared += 1;
    });
    if (shared / smaller.size >= 0.5) return true;
  }

  return false;
}

function claim(message: string): boolean {
  if (isToastSuppressed(message)) return false;
  const now = Date.now();
  const text = message.trim();
  for (let i = recent.length - 1; i >= 0; i -= 1) {
    if (now - recent[i].at > DEDUPE_MS) recent.splice(i, 1);
  }
  const hit = recent.find((item) => overlaps(item.text, text));
  if (hit && now - hit.at < DEDUPE_MS) return false;
  recent.push({ text, at: now });
  return true;
}

let lastSuccessAt = 0;

function ToastCard({
  title,
  message,
  count,
}: {
  title?: string;
  message: string;
  count?: number;
}) {
  const showCount = typeof count === 'number' && count > 0;
  return (
    <div className="ms-toast">
      {showCount ? (
        <span className="ms-toast__count" aria-label={`${count} unread notifications`}>
          {count > 99 ? '99+' : count}
        </span>
      ) : null}
      <div className="ms-toast__copy">
        {title ? <p className="ms-toast__title">{title}</p> : null}
        <p className="ms-toast__message">{message}</p>
      </div>
    </div>
  );
}

function push(tone: ToastTone, message: string, extra?: ToastExtra): void {
  const text = message.trim();
  if (!text) return;
  if (tone === 'success' && Date.now() - lastSuccessAt < 1200) return;
  if (!claim(text)) return;
  if (tone === 'success') lastSuccessAt = Date.now();
  const options: ToastOptions = {
    autoClose: tone === 'error' ? 6500 : 3200,
    toastId: `toast:${normalizeText(text).slice(0, 100)}`,
  };
  const node = <ToastCard title={extra?.title} message={text} count={extra?.count} />;
  if (tone === 'success') toast.success(node, options);
  else if (tone === 'info') toast.info(node, options);
  else if (tone === 'warning') toast.warning(node, options);
  else toast.error(node, options);
}

export function skipToast(config: { skipToast?: boolean; url?: string } | undefined): boolean {
  if (config?.skipToast) return true;
  if (!config?.url) return false;
  const path = config.url.split('?')[0];
  return (
    path.endsWith('/auth/login') ||
    path.endsWith('/auth/mfa/verify-login') ||
    path.endsWith('/auth/change-password') ||
    path.endsWith('/auth/reset-password') ||
    path.endsWith('/auth/forgot-password') ||
    path.endsWith('/auth/register') ||
    path.endsWith('/auth/logout') ||
    path.endsWith('/users/me') ||
    (path.includes('/tests/') && path.endsWith('/start')) ||
    (path.includes('/attempts/') &&
      (path.endsWith('/answers') ||
        path.endsWith('/submit') ||
        path.endsWith('/proctoring') ||
        path.endsWith('/proctoring-review'))) ||
    path.includes('/notifications/') ||
    path.endsWith('/settings')
  );
}

const FLASH_KEY = 'ms-toast-flash';

export function flashToast(message: string, extra?: ToastExtra & { tone?: ToastTone }): void {
  sessionStorage.setItem(
    FLASH_KEY,
    JSON.stringify({ message, tone: extra?.tone ?? 'error', status: extra?.status, code: extra?.code, title: extra?.title }),
  );
}

export function showFlashedToast(): void {
  const raw = sessionStorage.getItem(FLASH_KEY);
  if (!raw) return;
  sessionStorage.removeItem(FLASH_KEY);
  try {
    const data = JSON.parse(raw) as ToastExtra & { message?: string; tone?: ToastTone };
    if (!data.message) return;
    push(data.tone ?? 'error', data.message, data);
  } catch {
    sessionStorage.removeItem(FLASH_KEY);
  }
}

/** Call from any screen. Server message, HTTP status and error code render in one toast. */
export const notify = {
  success(message: string, extra?: ToastExtra) {
    push('success', message, extra);
  },
  error(message: string, extra?: ToastExtra) {
    push('error', message, extra);
  },
  info(message: string, extra?: ToastExtra) {
    push('info', message, extra);
  },
  warning(message: string, extra?: ToastExtra) {
    push('warning', message, extra);
  },
  apiError(error: unknown) {
    if (axios.isCancel(error)) return;
    if (axios.isAxiosError<ApiErrorResponse>(error)) {
      if (skipToast(error.config)) return;
      const method = (error.config?.method ?? 'get').toLowerCase();
      // Background GET/HEAD/OPTIONS requests must NEVER pop up global error toasts.
      // Pages handle their own loading, empty, and fallback states locally.
      if (method === 'get' || method === 'head' || method === 'options') return;
    }
    const message = parseApiError(error);
    if (message) push('error', message);
  },
  apiSuccess(response: AxiosResponse) {
    if (skipToast(response.config)) return;
    const method = (response.config.method ?? 'get').toLowerCase();
    if (method === 'get' || method === 'head' || method === 'options') return;
    if (response.status < 200 || response.status >= 300) return;
    const message = readApiMessage(response.data);
    if (message) push('success', message);
  },
};
