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
  const message = (payload as { message?: unknown }).message;
  return typeof message === 'string' ? message.trim() : '';
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
