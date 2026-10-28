import './loaderInner.css';
import AppSpinner from './AppSpinner';

/** Dashboard main-content loader */
export default function LoaderInner() {
  return (
    <div className="sca-loader-inner" role="status" aria-label="Loading">
      <AppSpinner />
    </div>
  );
}
