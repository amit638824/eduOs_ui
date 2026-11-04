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

/** Exact `message` string from an API JSON body. */
export function readApiMessage(payload: unknown): string {
  if (!payload || typeof payload !== 'object') return '';
  const data = payload as { message?: unknown; error?: unknown };
  if (Array.isArray(data.message)) {
    return data.message.map(String).join('; ');
  }
  if (typeof data.message === 'string' && data.message.trim()) {
    return data.message.trim();
  }
  if (typeof data.error === 'string' && data.error.trim()) {
    return data.error.trim();
  }
  return '';
}

/** The API `message` only. Empty when the response has no message. */
export function parseApiError(error: unknown): string {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    return readApiMessage(error.response?.data);
  }
  return '';
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
