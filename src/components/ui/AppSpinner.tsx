import './loader.css';

/** Unified App Spinner - Single ring with prominent Mindsprint logo */
export default function AppSpinner() {
  return (
    <div className="sca-loader-orb-wrap" role="status" aria-label="Loading">
      <div className="sca-loader-glow-ambient" />
      <div className="sca-loader-ring" />
      <div className="sca-loader-logo-core">
        <img
          src="/img/logo/mindsprint-icon.png"
          className="sca-loader-logo-img"
          alt="Mindsprint"
        />
      </div>
    </div>
  );
}
