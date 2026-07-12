import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="errorarea sp_top_150 sp_bottom_150">
      <div className="container">
        <div className="row">
          <div className="col-xl-12 text-center" data-aos="fade-up">
            <div className="error__inner">
              <h1>404</h1>
              <h2>Page Not Found</h2>
              <p>The page you are looking for doesn&apos;t exist or has been moved.</p>
              <Link className="default__button" to="/">
                Back to Home
                <i className="icofont-long-arrow-right" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
