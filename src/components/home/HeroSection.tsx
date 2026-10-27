import { Link } from 'react-router-dom';

export default function HeroSection() {
  return (
    <section className="ms-hero-exact">
      <div className="container">
        <div className="row align-items-center g-5">
          {/* Left Column: Heading, Subtitle, Actions, Trust */}
          <div className="col-xl-6 col-lg-6 col-12" data-aos="fade-up">
            <div className="ms-mission-badge">
              <span>⭐</span>
              <span>Your Success, Our Mission</span>
            </div>

            <h1 className="ms-hero-heading-exact">
              Prepare Smarter.<br />
              <span style={{ color: 'var(--ms-primary)' }}>Score Higher.</span>
            </h1>

            <p className="ms-hero-sub-exact">
              Take online mock tests, practice with real exam pattern and get detailed performance analysis. Build your confidence and achieve your dream.
            </p>

            <div className="d-flex align-items-center flex-wrap gap-3 mb-4">
              <Link to="/exams" className="ms-btn-royal">
                <span>Explore Mock Tests</span>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </Link>

              <Link to="/exams" className="ms-btn-outline-clean">
                <span>View Courses</span>
              </Link>
            </div>

            {/* Trust row */}
            <div className="d-flex align-items-center flex-wrap gap-4 pt-3 border-top" style={{ borderColor: 'var(--ms-border-light)' }}>
              <div className="d-flex align-items-center gap-2">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--ms-primary)' }}>
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                <div>
                  <div style={{ fontSize: '0.785rem', color: 'var(--ms-muted)' }}>Trusted by</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--ms-dark)' }}>50,000+ learners</div>
                </div>
              </div>

              <div className="d-flex align-items-center gap-2">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#f59e0b" stroke="#f59e0b" strokeWidth="1">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--ms-dark)' }}>4.8/5</div>
                  <div style={{ fontSize: '0.785rem', color: 'var(--ms-muted)' }}>average rating</div>
                </div>
              </div>

              <div className="d-flex align-items-center gap-2">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#10b981' }}>
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--ms-dark)' }}>Secure &amp;</div>
                  <div style={{ fontSize: '0.785rem', color: 'var(--ms-muted)' }}>reliable platform</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Student Image + Floating Score Card */}
          <div className="col-xl-6 col-lg-6 col-12" data-aos="fade-left">
            <div className="ms-hero-photo-wrap">
              <div className="ms-hero-pastel-blob" />

              <img
                src="/img/herobanner/hero_student.png"
                alt="Student taking online mock exams"
                className="ms-hero-student-photo"
              />

              {/* Floating Test Score Card */}
              <div className="ms-float-score-box">
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--ms-muted)', marginBottom: '12px' }}>
                  Mock Test Score
                </div>

                <div className="d-flex align-items-center gap-3 mb-3">
                  <div className="ms-score-ring-circle">
                    92%
                  </div>
                  <div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 850, color: 'var(--ms-dark)' }}>
                      184 / 200
                    </div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#16a34a' }}>
                      Excellent!
                    </div>
                  </div>
                </div>

                {/* Progress bars */}
                <div className="d-flex flex-column gap-2">
                  <div>
                    <div className="d-flex justify-content-between" style={{ fontSize: '0.725rem', fontWeight: 600, color: 'var(--ms-muted)' }}>
                      <span>Quantitative Aptitude</span>
                      <span style={{ color: 'var(--ms-dark)', fontWeight: 700 }}>92%</span>
                    </div>
                    <div style={{ width: '100%', height: '5px', background: '#f1f5f9', borderRadius: '999px', overflow: 'hidden', marginTop: '4px' }}>
                      <div style={{ width: '92%', height: '100%', background: 'var(--ms-primary)', borderRadius: '999px' }} />
                    </div>
                  </div>

                  <div>
                    <div className="d-flex justify-content-between" style={{ fontSize: '0.725rem', fontWeight: 600, color: 'var(--ms-muted)' }}>
                      <span>Reasoning</span>
                      <span style={{ color: 'var(--ms-dark)', fontWeight: 700 }}>88%</span>
                    </div>
                    <div style={{ width: '100%', height: '5px', background: '#f1f5f9', borderRadius: '999px', overflow: 'hidden', marginTop: '4px' }}>
                      <div style={{ width: '88%', height: '100%', background: 'var(--ms-primary)', borderRadius: '999px' }} />
                    </div>
                  </div>

                  <div>
                    <div className="d-flex justify-content-between" style={{ fontSize: '0.725rem', fontWeight: 600, color: 'var(--ms-muted)' }}>
                      <span>English</span>
                      <span style={{ color: 'var(--ms-dark)', fontWeight: 700 }}>94%</span>
                    </div>
                    <div style={{ width: '100%', height: '5px', background: '#f1f5f9', borderRadius: '999px', overflow: 'hidden', marginTop: '4px' }}>
                      <div style={{ width: '94%', height: '100%', background: 'var(--ms-primary)', borderRadius: '999px' }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Doodle note */}
              <div className="ms-doodle-better">
                Better Every Day ↗
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
