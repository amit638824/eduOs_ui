import { tokenStorage } from '@/lib/storage';
import { setSelectedOrganizationId } from '@/lib/orgScope';
import { flashToast } from '@/lib/toast';

let redirectingToLogin = false;

/** Clear session and send the user to login (used when refresh/access token is invalid). */
export function forceSessionExpiredLogout(
  reason: 'expired' | 'unauthorized' = 'expired',
  message?: string,
) {
  tokenStorage.clear();
  setSelectedOrganizationId(null);

  if (typeof window === 'undefined') return;
  const path = window.location.pathname;
  if (path === '/login' || path.startsWith('/login/')) return;
  if (redirectingToLogin) return;

  if (message?.trim()) flashToast(message.trim());
  redirectingToLogin = true;
  const params = new URLSearchParams();
  params.set('session', reason);
  window.location.assign(`/login?${params.toString()}`);
}
