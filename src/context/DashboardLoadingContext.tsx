import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

interface DashboardLoadingContextValue {
  loading: boolean;
  setLoading: (id: string, active: boolean) => void;
}

const DashboardLoadingContext = createContext<DashboardLoadingContextValue | null>(null);

export function DashboardLoadingProvider({ children }: { children: ReactNode }) {
  const [pending, setPending] = useState<Set<string>>(() => new Set());

  const setLoading = useCallback((id: string, active: boolean) => {
    setPending((prev) => {
      const has = prev.has(id);
      if (active && has) return prev;
      if (!active && !has) return prev;
      const next = new Set(prev);
      if (active) next.add(id);
      else next.delete(id);
      return next;
    });
  }, []);

  const loading = pending.size > 0;

  const value = useMemo(() => ({ loading, setLoading }), [loading, setLoading]);

  return (
    <DashboardLoadingContext.Provider value={value}>{children}</DashboardLoadingContext.Provider>
  );
}

export function useDashboardLoading() {
  const ctx = useContext(DashboardLoadingContext);
  if (!ctx) {
    throw new Error('useDashboardLoading must be used within DashboardLoadingProvider');
  }
  return ctx;
}

/** Sync a boolean loading flag with the dashboard inner loader */
export function useDashboardLoadingEffect(loading: boolean) {
  const id = useId();
  const { setLoading } = useDashboardLoading();

  useEffect(() => {
    setLoading(id, loading);
    return () => setLoading(id, false);
  }, [id, loading, setLoading]);
}

/** Wrap any async API call with the dashboard inner loader */
export function useDashboardLoader() {
  const id = useId();
  const { setLoading } = useDashboardLoading();

  return useCallback(
    async <T,>(fn: () => Promise<T>): Promise<T> => {
      setLoading(id, true);
      try {
        return await fn();
      } finally {
        setLoading(id, false);
      }
    },
    [id, setLoading],
  );
}
