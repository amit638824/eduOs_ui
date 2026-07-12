import { env } from '@/config/env';

export function resolveImageUrl(path?: string | null): string {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('/')) {
    return path;
  }
  const base = env.imageBaseUrl?.replace(/\/$/, '') ?? '';
  return `${base}/${path.replace(/^\//, '')}`;
}
