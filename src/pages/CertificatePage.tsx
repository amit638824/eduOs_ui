import { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';

import '@/styles/certificate.css';

import {
  getCertificate,
  type Certificate,
} from '@/services/examination.service';

function formatCertificateDate(value?: string): string {
  if (!value) {
    return '—';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export default function CertificatePage() {
  const { id } = useParams<{ id?: string }>();
  const [searchParams] = useSearchParams();

  const [certificate, setCertificate] =
    useState<Certificate | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  /*
   * Certificate ID can come from:
   *
   * /certificate/:id
   *
   * or:
   *
   * /certificate?id=certificate-id
   */
  const certificateId = id || searchParams.get('id');

  useEffect(() => {
    let cancelled = false;

    async function loadCertificate() {
      if (!certificateId) {
        setError(
          'Certificate ID is missing. Please open the certificate from your exam result.',
        );
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError('');

        const result = await getCertificate(certificateId);

        if (cancelled) {
          return;
        }

        if (!result) {
          setError('Certificate not found.');
          setCertificate(null);
          return;
        }

        setCertificate(result);
      } catch (err) {
        if (cancelled) {
          return;
        }

        console.error('Failed to load certificate:', err);

        setCertificate(null);

        setError(
          'Unable to load this certificate. Please check the certificate ID and try again.',
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadCertificate();

    return () => {
      cancelled = true;
    };
  }, [certificateId]);

  /*
   * Loading state
   */
  if (loading) {
    return (
      <main className="certificate-page">
        <div className="certificate-actions">
          <Link
            to="/"
            className="certificate-back-btn"
          >
            Back
          </Link>
        </div>

        <section
          className="certificate-loading"
          aria-live="polite"
        >
          <h2>Loading Certificate...</h2>
          <p>
            Please wait while we retrieve your certificate.
          </p>
        </section>
      </main>
    );
  }

  /*
   * Error state
   */
  if (error || !certificate) {
    return (
      <main className="certificate-page">
        <div className="certificate-actions">
          <Link
            to="/"
            className="certificate-back-btn"
          >
            Back
          </Link>
        </div>

        <section
          className="certificate-error"
          role="alert"
        >
          <h2>Certificate Not Available</h2>

          <p>
            {error || 'The requested certificate could not be found.'}
          </p>

          <Link
            to="/"
            className="certificate-back-btn"
          >
            Go Home
          </Link>
        </section>
      </main>
    );
  }

  /*
   * Certificate data comes ONLY from the backend.
   */
  const studentName =
    certificate.student_name || 'Student';

  const projectName =
    certificate.test_title || 'Examination';

  const organizationName =
    certificate.org_name || 'TechWagger';

  const certificateNo =
    certificate.certificate_no;

  const certificateDate =
    formatCertificateDate(certificate.issued_at);

  /*
   * Revoked certificate
   */
  if (certificate.status === 'revoked') {
    return (
      <main className="certificate-page">
        <div className="certificate-actions">
          <Link
            to="/"
            className="certificate-back-btn"
          >
            Back
          </Link>
        </div>

        <section
          className="certificate-error"
          role="alert"
        >
          <h2>Certificate Revoked</h2>

          <p>
            This certificate has been revoked and is no longer valid.
          </p>

          <div className="certificate-meta">
            <div className="certificate-meta-label">
              CERTIFICATE NO.
            </div>

            <div className="certificate-meta-value certificate-number">
              {certificateNo}
            </div>
          </div>

          <Link
            to="/"
            className="certificate-back-btn"
          >
            Go Home
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="certificate-page">
      {/* ACTION BUTTONS */}
      <div className="certificate-actions">
        <button
          type="button"
          className="certificate-print-btn"
          onClick={() => window.print()}
        >
          Download / Print Certificate
        </button>

        <Link
          to="/"
          className="certificate-back-btn"
        >
          Back
        </Link>
      </div>

      {/* CERTIFICATE */}
      <section
        className="certificate"
        aria-label="Certificate of Appreciation"
      >
        {/* DECORATIVE CORNERS */}
        <div className="certificate-corner certificate-corner-top-right" />

        <div className="certificate-corner certificate-corner-bottom-left" />

        <div className="certificate-border">
          <div className="certificate-inner-border">

            {/* =====================================================
                HEADER
            ===================================================== */}

            <header className="certificate-header">

              {/* LEFT SIDE LOGO */}
              <div className="brand">
                <div className="brand-logo">
                  <img
                    src="/img/logo/techwagger-logo.png"
                    alt="TechWagger"
                  />
                </div>

                <div className="brand-text">
                  <div className="brand-name">
                    {organizationName}
                  </div>

                  <div className="brand-tagline">
                    IDEAS&nbsp; | &nbsp;SOLUTIONS&nbsp; | &nbsp;IMPACT
                  </div>
                </div>
              </div>

              {/* RIGHT SIDE MESSAGE */}
              <div className="header-message">
                <div>PEOPLE</div>
                <div>IDEAS</div>
                <div>TECHNOLOGY</div>
                <div>A BRIGHTER TOMORROW</div>
                <span />
              </div>
            </header>

            {/* =====================================================
                TITLE
            ===================================================== */}

            <section className="certificate-title-section">
              <h1>
                CERTIFICATE
              </h1>

              <div className="title-subtitle">
                <span />

                <strong>
                  OF APPRECIATION
                </strong>

                <span />
              </div>
            </section>

            {/* =====================================================
                STUDENT
            ===================================================== */}

            <section className="presented-section">
              <div className="presented-text">
                PROUDLY PRESENTED TO
              </div>

              <div
                className="student-name"
                title={studentName}
              >
                {studentName}
              </div>

              <div className="student-name-line" />
            </section>

            {/* =====================================================
                DESCRIPTION
            ===================================================== */}

            <section className="certificate-description">
              <p>
                In sincere appreciation of your successful completion of{' '}
                <strong>
                  {projectName}
                </strong>{' '}
                and your dedication, effort, and commitment to excellence.
              </p>

              <p>
                Your hard work and achievement have been recognized through
                this certificate of appreciation.
              </p>

              <p>
                Thank you for your valuable contribution to{' '}
                <strong>
                  {organizationName}
                </strong>.
              </p>

              <p className="keep-inspiring">
                Keep learning, keep creating, keep inspiring!
              </p>
            </section>

            {/* =====================================================
                CERTIFICATE INFORMATION
            ===================================================== */}

            <section className="certificate-info">

              {/* ISSUE DATE */}
              <div className="certificate-meta">
                <div className="certificate-meta-label">
                  CERTIFICATE ISSUE
                </div>

                <div className="certificate-meta-value">
                  {certificateDate}
                </div>
              </div>

              <div className="certificate-meta-divider" />

              {/* CERTIFICATE NUMBER */}
              <div className="certificate-meta">
                <div className="certificate-meta-label">
                  CERTIFICATE NO.
                </div>

                <div className="certificate-meta-value certificate-number">
                  {certificateNo}
                </div>
              </div>
            </section>

            {/* =====================================================
                BOTTOM AREA
            ===================================================== */}

            <section className="certificate-bottom">

              {/* GOLDEN SEAL */}
              <div className="certificate-seal">
                <div className="seal-outer">
                  <div className="seal-inner">

                    <div className="seal-logo">
                      Tw
                    </div>

                    <div className="seal-text">
                      IDEAS
                    </div>

                    <div className="seal-text">
                      PEOPLE
                    </div>

                    <div className="seal-text">
                      IMPACT
                    </div>

                  </div>
                </div>
              </div>

              {/* SIGNATURE */}
              <div className="organization-signature">
                <div className="organization-line" />

                <strong>
                  {organizationName}
                </strong>

                <span>
                  Certificate Authority
                </span>
              </div>
            </section>

            {/* =====================================================
                FOOTER
            ===================================================== */}

            <footer className="certificate-footer">
              <span />

              <strong>
                INNOVATION INTO REALITY
              </strong>

              <span />
            </footer>

          </div>
        </div>
      </section>
    </main>
  );
}