import './loader.css';
import { siteContent } from '@/data/siteContent';

/** Full-page loader (login, auth, public pages) */
export default function Loader() {
  return (
    <div className="sca-loader-full" role="status" aria-label="Loading">
      <div className="sca-loader-full__wrap">
        <div className="sca-loader-full__spinner" />
        <img src={siteContent.brand.logo} className="sca-loader-full__logo" alt="" />
      </div>
    </div>
  );
}
