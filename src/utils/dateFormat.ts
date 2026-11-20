export type DateInput = string | Date | null | undefined;

function parseDate(value: DateInput): Date | null {
  if (value == null || value === '') return null;
  const d = value instanceof Date ? value : new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** Formats date as DD/MM/YYYY (e.g. 02/01/2026) */
export function formatDate(value: DateInput): string {
  const d = parseDate(value);
  if (!d) return '—';
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

/** Formats time as hh:mm AM/PM (e.g. 03:45 PM) */
export function formatTime(value: DateInput): string {
  const d = parseDate(value);
  if (!d) return '—';
  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours %= 12;
  if (hours === 0) hours = 12;
  const hoursStr = String(hours).padStart(2, '0');
  return `${hoursStr}:${minutes} ${ampm}`;
}

/** Formats datetime as DD/MM/YYYY, hh:mm AM/PM (e.g. 02/01/2026, 03:45 PM) */
export function formatDateTime(value: DateInput): string {
  const d = parseDate(value);
  if (!d) return '—';
  return `${formatDate(d)}, ${formatTime(d)}`;
}

/** Relative time for activity feeds; falls back to DD/MM/YYYY after 7 days. */
export function formatRelativeDate(value: DateInput): string {
  const d = parseDate(value);
  if (!d) return '—';

  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 60) return `${Math.max(mins, 1)} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
  return formatDate(d);
}
