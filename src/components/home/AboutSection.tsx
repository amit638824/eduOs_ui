import { Link } from 'react-router-dom';

export default function AboutSection() {
  return (
    <section className="container" data-aos="fade-up">
      <div className="ms-progress-card-exact">
        <div className="row align-items-center g-4">
          {/* Left: Illustration */}
          <div className="col-xl-4 col-lg-4 col-md-5 col-12 text-center">
            <img
              src="/img/about/analysis_student.png"
              alt="Student tracking progress"
              style={{ maxWidth: '100%', maxHeight: '240px', objectFit: 'contain', borderRadius: '16px' }}
            />
          </div>

          {/* Center: Content & CTA */}
          <div className="col-xl-4 col-lg-4 col-md-7 col-12">
            <div className="d-inline-flex align-items-center px-3 py-1 rounded-pill mb-3" style={{ background: '#dbeafe', color: 'var(--ms-primary)', fontSize: '0.8rem', fontWeight: 600 }}>
              Track Your Progress
            </div>

            <h2 style={{ fontSize: '1.95rem', fontWeight: 800, color: 'var(--ms-dark)', lineHeight: 1.25, marginBottom: '14px' }}>
              Get Detailed Analysis &amp; Improve Faster
            </h2>

            <p style={{ fontSize: '0.925rem', color: 'var(--ms-muted)', lineHeight: 1.6, marginBottom: '22px' }}>
              Know your strengths and weaknesses with comprehensive performance reports.
            </p>

            <Link to="/exams" className="ms-btn-royal">
              <span>View Performance Report</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </Link>
          </div>

          {/* Right: Floating Progress Card */}
          <div className="col-xl-4 col-lg-4 col-md-12 col-12">
            <div className="ms-progress-floating-box">
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--ms-muted)', marginBottom: '14px' }}>
                Your Progress
              </div>

              <div className="d-flex align-items-center gap-3 mb-3">
                <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: '#eff6ff', border: '3.5px solid var(--ms-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.95rem', color: 'var(--ms-primary)' }}>
                  68%
                </div>
                <div>
                  <div style={{ fontSize: '0.785rem', color: 'var(--ms-muted)' }}>Overall Score</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--ms-dark)' }}>
                    136 / 200
                  </div>
                </div>
              </div>

              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--ms-muted)', marginBottom: '8px' }}>
                Subject-wise Performance
              </div>

              <div className="d-flex flex-column gap-2">
                <div>
                  <div className="d-flex justify-content-between" style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--ms-muted)' }}>
                    <span>Quantitative Aptitude</span>
                    <span style={{ color: 'var(--ms-dark)', fontWeight: 700 }}>78%</span>
                  </div>
                  <div style={{ width: '100%', height: '5px', background: '#f1f5f9', borderRadius: '999px', overflow: 'hidden', marginTop: '3px' }}>
                    <div style={{ width: '78%', height: '100%', background: 'var(--ms-primary)', borderRadius: '999px' }} />
                  </div>
                </div>

                <div>
                  <div className="d-flex justify-content-between" style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--ms-muted)' }}>
                    <span>Reasoning</span>
                    <span style={{ color: 'var(--ms-dark)', fontWeight: 700 }}>65%</span>
                  </div>
                  <div style={{ width: '100%', height: '5px', background: '#f1f5f9', borderRadius: '999px', overflow: 'hidden', marginTop: '3px' }}>
                    <div style={{ width: '65%', height: '100%', background: 'var(--ms-primary)', borderRadius: '999px' }} />
                  </div>
                </div>

                <div>
                  <div className="d-flex justify-content-between" style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--ms-muted)' }}>
                    <span>English</span>
                    <span style={{ color: 'var(--ms-dark)', fontWeight: 700 }}>72%</span>
                  </div>
                  <div style={{ width: '100%', height: '5px', background: '#f1f5f9', borderRadius: '999px', overflow: 'hidden', marginTop: '3px' }}>
                    <div style={{ width: '72%', height: '100%', background: 'var(--ms-primary)', borderRadius: '999px' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
