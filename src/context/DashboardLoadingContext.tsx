import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useLocation } from 'react-router-dom';

interface DashboardLoadingContextValue {
  loading: boolean;
  setLoading: (id: string, active: boolean) => void;
  clearAll: () => void;
}

const DashboardLoadingContext = createContext<DashboardLoadingContextValue | null>(null);

export function DashboardLoadingProvider({ children }: { children: ReactNode }) {
  const [pending, setPending] = useState<Set<string>>(() => new Set());
  const location = useLocation();

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

  const clearAll = useCallback(() => {
    setPending((prev) => (prev.size === 0 ? prev : new Set()));
  }, []);

  // Drop any stuck loaders when navigating between dashboard pages
  useEffect(() => {
    clearAll();
  }, [location.pathname, clearAll]);

  const loading = pending.size > 0;

  const value = useMemo(
    () => ({ loading, setLoading, clearAll }),
    [loading, setLoading, clearAll],
  );

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

/**
 * Wrap async API work with the dashboard loader.
 * Always finishes (finally) — keep SweetAlert / confirm dialogs OUTSIDE this wrapper
 * so the spinner does not stay up while the user reads a popup.
 */
export function useDashboardLoader() {
  const { setLoading } = useDashboardLoading();
  const activeIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    return () => {
      activeIds.current.forEach((id) => setLoading(id, false));
      activeIds.current.clear();
    };
  }, [setLoading]);

  return useCallback(
    async <T,>(fn: () => Promise<T>): Promise<T> => {
      const id = `job-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      activeIds.current.add(id);
      setLoading(id, true);
      try {
        return await fn();
      } finally {
        activeIds.current.delete(id);
        setLoading(id, false);
      }
    },
    [setLoading],
  );
}
