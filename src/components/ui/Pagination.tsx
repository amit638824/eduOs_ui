import type { PaginationMeta } from '@/types/api';

export const DEFAULT_PAGE_LIMIT = 10;
export const PAGE_LIMIT_OPTIONS = [10, 20, 50, 100] as const;

export interface PaginationProps {
  page: number;
  limit: number;
  total: number;
  totalPages?: number;
  onPageChange: (page: number) => void;
  onLimitChange?: (limit: number) => void;
  limitOptions?: readonly number[];
  disabled?: boolean;
  className?: string;
}

function buildPageItems(current: number, totalPages: number): Array<number | 'ellipsis'> {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const items: Array<number | 'ellipsis'> = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(totalPages - 1, current + 1);

  if (start > 2) items.push('ellipsis');
  for (let p = start; p <= end; p += 1) items.push(p);
  if (end < totalPages - 1) items.push('ellipsis');
  items.push(totalPages);
  return items;
}

export function getPaginationRange(page: number, limit: number, total: number) {
  if (total <= 0) return { from: 0, to: 0 };
  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);
  return { from, to };
}

export function Pagination({
  page,
  limit,
  total,
  totalPages: totalPagesProp,
  onPageChange,
  onLimitChange,
  limitOptions = PAGE_LIMIT_OPTIONS,
  disabled = false,
  className = '',
}: PaginationProps) {
  const totalPages = Math.max(1, totalPagesProp ?? Math.ceil(Math.max(total, 0) / Math.max(limit, 1)));
  const safePage = Math.min(Math.max(page, 1), totalPages);
  const { from, to } = getPaginationRange(safePage, limit, total);
  const pages = buildPageItems(safePage, totalPages);
  const canPrev = safePage > 1 && !disabled;
  const canNext = safePage < totalPages && !disabled;

  if (total <= 0 && !onLimitChange) return null;

  return (
    <div className={`edtp-pagination ${className}`.trim()} role="navigation" aria-label="Pagination">
      <div className="edtp-pagination__left">
        {onLimitChange ? (
          <label className="edtp-pagination__per-page">
            <span>Result per page</span>
            <select
              className="edtp-pagination__select"
              value={limit}
              disabled={disabled}
              onChange={(e) => onLimitChange(Number(e.target.value))}
              aria-label="Results per page"
            >
              {limitOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </label>
        ) : null}
        <span className="edtp-pagination__range" aria-live="polite">
          {total <= 0 ? '0 of 0' : `${from}-${to} of ${total.toLocaleString()}`}
        </span>
      </div>

      <div className="edtp-pagination__pages">
        <button
          type="button"
          className="edtp-pagination__btn edtp-pagination__btn--nav"
          disabled={!canPrev}
          onClick={() => onPageChange(safePage - 1)}
          aria-label="Previous page"
        >
          ‹
        </button>

        {pages.map((item, idx) =>
          item === 'ellipsis' ? (
            <span key={`e-${idx}`} className="edtp-pagination__ellipsis" aria-hidden>
              …
            </span>
          ) : (
            <button
              key={item}
              type="button"
              className={`edtp-pagination__btn${
                item === safePage ? ' edtp-pagination__btn--active' : ''
              }`}
              disabled={disabled}
              aria-current={item === safePage ? 'page' : undefined}
              onClick={() => onPageChange(item)}
            >
              {item}
            </button>
          ),
        )}

        <button
          type="button"
          className="edtp-pagination__btn edtp-pagination__btn--nav"
          disabled={!canNext}
          onClick={() => onPageChange(safePage + 1)}
          aria-label="Next page"
        >
          ›
        </button>
      </div>
    </div>
  );
}

export function paginationFromMeta(meta?: PaginationMeta | null): PaginationMeta {
  return {
    page: meta?.page ?? 1,
    limit: meta?.limit ?? DEFAULT_PAGE_LIMIT,
    total: meta?.total ?? 0,
    totalPages: meta?.totalPages ?? 0,
  };
}
