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

export function parseApiError(error: unknown): string {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    const payload = error.response?.data;
    if (payload?.details && typeof payload.details === 'object') {
      const details = payload.details as {
        formErrors?: string[];
        fieldErrors?: Record<string, string[] | undefined>;
      };
      const fieldMsgs = Object.entries(details.fieldErrors ?? {})
        .flatMap(([field, msgs]) => (msgs ?? []).map((m) => `${field}: ${m}`));
      const formMsgs = details.formErrors ?? [];
      const combined = [...formMsgs, ...fieldMsgs].filter(Boolean);
      if (combined.length) {
        return combined.join(' · ');
      }
    }
    if (payload?.message) return payload.message;
    if (error.message) return error.message;
  }
  if (error instanceof Error) return error.message;
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
