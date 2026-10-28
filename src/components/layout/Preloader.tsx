import { useEffect, useState } from 'react';
import Loader from '@/components/ui/Loader';

/**
 * Initial page load preloader.
 * Uses the exact same unified Loader component as the rest of the application.
 */
export default function Preloader() {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setHidden(true), 600);
    return () => window.clearTimeout(timer);
  }, []);

  if (hidden) return null;

  return <Loader />;
}
