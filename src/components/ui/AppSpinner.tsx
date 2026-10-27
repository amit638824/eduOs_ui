import './loader.css';
import { siteContent } from '@/data/siteContent';

/** Unified App Spinner - Single ring with prominent Techwagger logo */
export default function AppSpinner() {
  return (
    <div className="sca-loader-orb-wrap" role="status" aria-label="Loading">
      <div className="sca-loader-glow-ambient" />
      <div className="sca-loader-ring" />
      <div className="sca-loader-logo-core">
        <img
          src={siteContent.brand.logo}
          className="sca-loader-logo-img"
          alt="Techwagger"
        />
      </div>
    </div>
  );
}
