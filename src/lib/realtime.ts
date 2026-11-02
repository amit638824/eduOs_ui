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
      notify.info(item.body || item.title, {
        title: item.title || 'Notification',
        count: payload.unreadCount,
      });
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
