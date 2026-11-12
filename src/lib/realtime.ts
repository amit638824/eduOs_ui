import { io, type Socket } from 'socket.io-client';
import { env } from '@/config/env';
import { tokenStorage } from '@/lib/storage';
import { notify } from '@/lib/toast';

export const REALTIME_NOTIFICATION_EVENT = 'ms-realtime-notification';

export interface RealtimeNotification {
  id: string;
  title: string;
  body: string;
  is_read?: boolean | number;
  created_at?: string;
  channel?: string;
}

export interface RealtimeNotificationDetail {
  notification?: RealtimeNotification;
  unreadCount?: number;
}

let socket: Socket | null = null;

const suppressedPatterns: { pattern: RegExp | string; expiresAt: number }[] = [];

const defaultSuppressedKeywords = [
  'password',
  'profile',
  'exam started',
  'you started',
  'exam submitted',
  'exam auto-submitted',
  'marked as read',
];

/**
 * Suppress popup toast for incoming realtime socket notifications matching keyword or pattern.
 * Used during actions initiated by the user in this session (e.g. changing password),
 * so they don't receive a redundant socket toast on top of the form's own feedback.
 * The notification badge/list still updates via publish().
 */
export function suppressRealtimeNotification(pattern: RegExp | string, durationMs = 8000): void {
  suppressedPatterns.push({ pattern, expiresAt: Date.now() + durationMs });
}

function isNotificationSuppressed(title?: string, body?: string): boolean {
  const now = Date.now();
  for (let i = suppressedPatterns.length - 1; i >= 0; i -= 1) {
    if (now > suppressedPatterns[i].expiresAt) {
      suppressedPatterns.splice(i, 1);
    }
  }
  const text = `${title || ''} ${body || ''}`.toLowerCase();
  if (defaultSuppressedKeywords.some((keyword) => text.includes(keyword))) {
    return true;
  }
  return suppressedPatterns.some(({ pattern }) => {
    if (typeof pattern === 'string') {
      return text.includes(pattern.toLowerCase());
    }
    return pattern.test(text);
  });
}

function apiOrigin(): string {
  try {
    return new URL(env.apiBaseUrl).origin;
  } catch {
    return window.location.origin;
  }
}

function publish(detail: RealtimeNotificationDetail) {
  window.dispatchEvent(new CustomEvent(REALTIME_NOTIFICATION_EVENT, { detail }));
}

export function connectRealtime() {
  const token = tokenStorage.getAccessToken();
  if (!token) {
    disconnectRealtime();
    return;
  }

  if (socket) {
    socket.auth = { token };
    if (!socket.connected) socket.connect();
    return;
  }

  socket = io(apiOrigin(), {
    path: '/socket.io',
    auth: { token },
    transports: ['websocket', 'polling'],
    autoConnect: true,
  });

  socket.on('notification', (payload: RealtimeNotificationDetail) => {
    const item = payload?.notification;
    if (item?.title || item?.body) {
      if (!isNotificationSuppressed(item.title, item.body)) {
        notify.info(item.body || item.title, {
          title: item.title || 'Notification',
          count: payload.unreadCount,
        });
      }
    }
    publish(payload ?? {});
  });

  socket.on('notification:count', (payload: RealtimeNotificationDetail) => {
    publish(payload ?? {});
  });
}

export function disconnectRealtime() {
  if (!socket) return;
  socket.removeAllListeners();
  socket.disconnect();
  socket = null;
}
