import { Link } from 'react-router-dom';
import PageBanner from '@/components/eduleb/PageBanner';

export default function EdulebNotFoundPage() {
  return (
    <>
      <PageBanner title="404" crumb="404" />
      <section className="section-padding text-center">
        <div className="container">
          <img src="/eduleb/img/404.svg" alt="404" style={{ maxWidth: 420, width: '100%' }} />
          <h2 style={{ marginTop: 24 }}>Page Not Found</h2>
          <p>The page you are looking for might have been removed or is temporarily unavailable.</p>
          <Link to="/" className="btn_one">
            Back to Home <i className="ti-arrow-top-right" />
          </Link>
        </div>
      </section>
    </>
  );
}
