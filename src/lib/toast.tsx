import { toast, type ToastOptions } from 'react-toastify';
import axios, { type AxiosResponse } from 'axios';
import { parseApiError, toApiError } from '@/lib/errors';
import type { ApiErrorResponse } from '@/types/api';

type ToastTone = 'success' | 'error' | 'info' | 'warning';

type ToastExtra = {
  title?: string;
  status?: number;
  code?: string;
};

const DEDUPE_MS = 4000;
const recent: { text: string; at: number }[] = [];

function overlaps(a: string, b: string): boolean {
  if (a === b) return true;
  const short = a.length < b.length ? a : b;
  const long = a.length < b.length ? b : a;
  return short.length >= 24 && long.includes(short);
}

function claim(message: string): boolean {
  const now = Date.now();
  const text = message.trim().toLowerCase();
  for (let i = recent.length - 1; i >= 0; i -= 1) {
    if (now - recent[i].at > DEDUPE_MS) recent.splice(i, 1);
  }
  const hit = recent.find((item) => overlaps(item.text, text));
  const windowMs = text.length < 24 && hit?.text === text ? 800 : DEDUPE_MS;
  if (hit && now - hit.at < windowMs) return false;
  recent.push({ text, at: now });
  return true;
}

let lastSuccessAt = 0;

function ToastCard({
  title,
  message,
  status,
  code,
}: {
  title?: string;
  message: string;
  status?: number;
  code?: string;
}) {
  const failed = typeof status === 'number' && status >= 400;
  return (
    <div className="ms-toast">
      {typeof status === 'number' ? (
        <span className={`ms-toast__status${failed ? ' ms-toast__status--bad' : ' ms-toast__status--ok'}`}>
          {status}
        </span>
      ) : null}
      <div className="ms-toast__copy">
        {title ? <p className="ms-toast__title">{title}</p> : null}
        <p className="ms-toast__message">{message}</p>
        {code ? <p className="ms-toast__code">{code}</p> : null}
      </div>
    </div>
  );
}

function successText(method: string, status: number): string {
  if (method === 'delete') return 'Deleted successfully';
  if (method === 'put' || method === 'patch') return 'Updated successfully';
  if (status === 201) return 'Created successfully';
  if (status === 202) return 'Request accepted';
  if (status === 204) return 'Completed';
  return 'Success';
}

function push(tone: ToastTone, message: string, extra?: ToastExtra): void {
  const text = message.trim();
  if (!text) return;
  if (tone === 'success' && Date.now() - lastSuccessAt < 700) return;
  if (!claim(text)) return;
  if (tone === 'success') lastSuccessAt = Date.now();
  const options: ToastOptions = {
    autoClose: tone === 'error' ? 6500 : 3200,
    toastId: `${tone}:${text.slice(0, 180)}`,
  };
  const node = (
    <ToastCard title={extra?.title} message={text} status={extra?.status} code={extra?.code} />
  );
  if (tone === 'success') toast.success(node, options);
  else if (tone === 'info') toast.info(node, options);
  else if (tone === 'warning') toast.warning(node, options);
  else toast.error(node, options);
}

function skipToast(config: { skipToast?: boolean } | undefined): boolean {
  return Boolean(config?.skipToast);
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
      const status = error.response?.status;
      const parsed = toApiError(error);
      push('error', parseApiError(error), {
        status,
        code: error.response ? parsed.code : 'NETWORK',
      });
      return;
    }
    push('error', parseApiError(error));
  },
  apiSuccess(response: AxiosResponse) {
    if (skipToast(response.config)) return;
    const method = (response.config.method ?? 'get').toLowerCase();
    if (method === 'get' || method === 'head' || method === 'options') return;
    const status = response.status;
    if (status < 200 || status >= 300) return;
    const body =
      response.data && typeof response.data === 'object'
        ? (response.data as { message?: unknown })
        : undefined;
    const serverMessage = typeof body?.message === 'string' ? body.message.trim() : '';
    push('success', serverMessage || successText(method, status), { status });
  },
};
