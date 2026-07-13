import './loaderInner.css';
import { siteContent } from '@/data/siteContent';

/** Dashboard main-content loader — sidebar & top bar stay visible */
export default function LoaderInner() {
  return (
    <div className="sca-loader-inner" role="status" aria-label="Loading">
      <div className="sca-loader-inner__wrap">
        <div className="sca-loader-inner__spinner" />
        <img src={siteContent.brand.logo} className="sca-loader-inner__logo" alt="" />
      </div>
    </div>
  );
}
