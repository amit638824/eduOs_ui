import { useCallback, useEffect, useRef, useState } from 'react';
import type { PaginatedResponse, PaginationMeta } from '@/types/api';
import { parseApiError } from '@/lib/errors';
import { DEFAULT_PAGE_LIMIT, paginationFromMeta } from '@/components/ui/Pagination';

export type ServerListFetcher<T> = (params: {
  page: number;
  limit: number;
  search: string;
}) => Promise<PaginatedResponse<T> | { data: T[]; pagination: PaginationMeta }>;

interface UseServerListOptions<T> {
  fetcher: ServerListFetcher<T>;
  defaultLimit?: number;
  debounceMs?: number;
  /** Extra deps that should reset page and refetch (e.g. role, status filter) */
  deps?: unknown[];
  enabled?: boolean;
}

export function useServerList<T>({
  fetcher,
  defaultLimit = DEFAULT_PAGE_LIMIT,
  debounceMs = 350,
  deps = [],
  enabled = true,
}: UseServerListOptions<T>) {
  const [items, setItems] = useState<T[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>({
    page: 1,
    limit: defaultLimit,
    total: 0,
    totalPages: 0,
  });
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(defaultLimit);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const requestId = useRef(0);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  useEffect(() => {
    const t = window.setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, debounceMs);
    return () => window.clearTimeout(t);
  }, [searchInput, debounceMs]);

  const depsKey = JSON.stringify(deps);
  const prevDepsKey = useRef(depsKey);
  useEffect(() => {
    if (prevDepsKey.current !== depsKey) {
      prevDepsKey.current = depsKey;
      setPage(1);
    }
  }, [depsKey]);

  const load = useCallback(async () => {
    if (!enabled) return;
    const id = ++requestId.current;
    setLoading(true);
    setError('');
    try {
      const res = await fetcherRef.current({ page, limit, search });
      if (id !== requestId.current) return;
      setItems(res.data ?? []);
      const meta = paginationFromMeta(res.pagination);
      setPagination(meta);
      if (meta.totalPages > 0 && page > meta.totalPages) {
        setPage(meta.totalPages);
      }
    } catch (err) {
      if (id !== requestId.current) return;
      setItems([]);
      setPagination({ page, limit, total: 0, totalPages: 0 });
      setError(parseApiError(err));
    } finally {
      if (id === requestId.current) setLoading(false);
    }
  }, [enabled, page, limit, search, ...deps]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    void load();
  }, [load]);

  const onPageChange = (next: number) => {
    setPage(Math.max(1, next));
  };

  const onLimitChange = (next: number) => {
    setLimit(next);
    setPage(1);
  };

  const setSearchQuery = (value: string) => {
    setSearchInput(value);
  };

  const clearSearch = () => {
    setSearchInput('');
    setSearch('');
    setPage(1);
  };

  const refresh = () => load();

  return {
    items,
    pagination,
    page,
    limit,
    searchQuery: searchInput,
    search,
    loading,
    error,
    setError,
    setSearchQuery,
    clearSearch,
    onPageChange,
    onLimitChange,
    refresh,
    setPage,
  };
}
