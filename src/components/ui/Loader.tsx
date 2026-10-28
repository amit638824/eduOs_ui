import './loader.css';
import AppSpinner from './AppSpinner';

/** Full-page loader */
export default function Loader() {
  return (
    <div className="sca-loader-full" role="status" aria-label="Loading">
      <AppSpinner />
    </div>
  );
}
