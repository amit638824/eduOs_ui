import { useEffect, useState } from 'react';

export default function Preloader() {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setHidden(true), 1000);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div id="back__preloader" style={hidden ? { display: 'none' } : undefined}>
      <div id="back__circle_loader" />
      <div className="back__loader_logo">
        <img loading="lazy" src="/img/logo/sca-logo.png" alt="Loading" />
      </div>
    </div>
  );
}
