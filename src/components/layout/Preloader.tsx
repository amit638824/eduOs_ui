import { useEffect, useState } from 'react';

export default function Preloader() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setVisible(false), 1000);
    return () => window.clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div id="back__preloader">
      <div id="back__circle_loader" />
      <div className="back__loader_logo">
        <img loading="lazy" src="/img/pre.png" alt="Preload" />
      </div>
    </div>
  );
}
