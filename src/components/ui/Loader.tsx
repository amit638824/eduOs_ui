import './loader.css';
import { siteContent } from '@/data/siteContent';

/** Full-page loader */
export default function Loader() {
  return (
    <div className="sca-loader-full" role="status" aria-label="Loading">
      <div className="sca-loader-full__orb-wrap">
        <div className="sca-loader-full__glow-ambient" />
        <div className="sca-loader-full__ring" />
        <div className="sca-loader-full__logo-core">
          <img
            src={siteContent.brand.logo}
            className="sca-loader-full__logo-img"
            alt="Techwagger"
          />
        </div>
      </div>
    </div>
  );
}
