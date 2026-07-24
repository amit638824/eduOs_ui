export function parsePositiveIntInput(raw: string): number | null {
  const trimmed = raw.trim();
  if (trimmed === '') return null;
  const n = Number(trimmed);
  if (!Number.isFinite(n)) return null;
  return Math.floor(n);
}

export function normalizePositiveIntInput(raw: string, fallback = 1): string {
  const parsed = parsePositiveIntInput(raw);
  return String(parsed != null && parsed >= 1 ? parsed : fallback);
}
