import './loaderInner.css';
import { siteContent } from '@/data/siteContent';

/** Dashboard main-content loader */
export default function LoaderInner() {
  return (
    <div className="sca-loader-inner" role="status" aria-label="Loading">
      <div className="sca-loader-orb-wrap">
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
    </div>
  );
}
