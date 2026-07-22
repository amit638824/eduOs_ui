import axios from 'axios';
import type { ApiErrorResponse } from '@/types/api';

export class ApiError extends Error {
  code: string;
  status: number;
  details?: unknown;

  constructor(message: string, code = 'API_ERROR', status = 500, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

/** camelCase / snake_case → "New password" */
function humanizeFieldName(field: string): string {
  const spaced = field
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .trim()
    .toLowerCase();
  if (!spaced) return 'Field';
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

function ensureSentence(text: string): string {
  const trimmed = text.trim();
  if (!trimmed) return '';
  const capped = trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
  return /[.!?]$/.test(capped) ? capped : `${capped}.`;
}

/** Turn Zod/API field errors into plain English (no camelCase keys). */
function toUserFieldMessage(field: string, message: string): string {
  let msg = message.trim().replace(/^[a-zA-Z0-9_]+:\s*/, '');
  // Replace any leftover camelCase tokens inside the message
  msg = msg.replace(/\b([a-z]+[A-Z][a-zA-Z0-9]*)\b/g, (_, key: string) =>
    humanizeFieldName(key).toLowerCase(),
  );

  const label = humanizeFieldName(field);
  const lower = msg.toLowerCase();

  if (!msg || /^required$/i.test(msg)) {
    return ensureSentence(`${label} is required`);
  }
  if (/^invalid( email)?$/i.test(msg) || /^invalid (string|input|type|uuid)$/i.test(msg)) {
    return ensureSentence(`Please enter a valid ${label.toLowerCase()}`);
  }
  if (/^too small|^too big|^expected /i.test(msg)) {
    return ensureSentence(`Please check your ${label.toLowerCase()}`);
  }
  // Avoid "Password: Password must…"
  if (lower.startsWith(label.toLowerCase())) {
    return ensureSentence(msg);
  }
  return ensureSentence(msg);
}

export function parseApiError(error: unknown): string {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    const payload = error.response?.data;
    if (payload?.details && typeof payload.details === 'object') {
      const details = payload.details as {
        formErrors?: string[];
        fieldErrors?: Record<string, string[] | undefined>;
      };
      const fieldMsgs = Object.entries(details.fieldErrors ?? {}).flatMap(([field, msgs]) =>
        (msgs ?? []).map((m) => toUserFieldMessage(field, m)),
      );
      const formMsgs = (details.formErrors ?? [])
        .map((m) => ensureSentence(m))
        .filter(Boolean);
      const combined = [...formMsgs, ...fieldMsgs].filter(Boolean);
      if (combined.length) {
        return combined.join(' ');
      }
    }
    if (payload?.message) return ensureSentence(String(payload.message));
    if (error.message) return ensureSentence(error.message);
  }
  if (error instanceof Error) return ensureSentence(error.message);
  return 'Something went wrong. Please try again.';
}

export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    const payload = error.response?.data;
    return new ApiError(
      payload?.message ?? error.message,
      payload?.code ?? 'API_ERROR',
      error.response?.status ?? 500,
      payload?.details,
    );
  }
  return new ApiError(error instanceof Error ? error.message : 'Unknown error');
}
