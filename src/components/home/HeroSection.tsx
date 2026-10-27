import { Link } from 'react-router-dom';
import { TypeAnimation } from 'react-type-animation';

export default function HeroSection() {
  return (
    <section className="ms-hero-exact eduleb-ms-hero">
      <div className="container">
        <div className="row align-items-center g-4 g-xl-5">
          <div className="col-xl-6 col-lg-6 col-12" data-aos="fade-up">
            <div className="ms-mission-badge">PRACTICE TODAY, PERFORM TOMORROW</div>

            <h1 className="ms-hero-heading-exact">
              Online Mock Tests for{' '}
              <span className="eduleb-ms-typed">
                <TypeAnimation
                  sequence={[
                    'Every Exam',
                    2400,
                    'CAT & MBA',
                    2400,
                    'JEE & NEET',
                    2400,
                    'Banking & SSC',
                    2400,
                  ]}
                  speed={50}
                  deletionSpeed={55}
                  repeat={Infinity}
                  cursor
                  preRenderFirstString
                  style={{ color: '#3861fb', display: 'inline-block', minWidth: '9ch' }}
                />
              </span>
            </h1>

            <p className="ms-hero-sub-exact">
              Realistic test experience, detailed analysis and personalized insights to help you crack
              your dream exam.
            </p>

            <div className="d-flex align-items-center flex-wrap gap-3 mb-4">
              <Link to="/exams" className="ms-btn-coral">
                <span>Explore Mock Tests</span>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </Link>
              <a href="#video" className="ms-btn-outline-clean">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
                <span>Watch Demo</span>
              </a>
            </div>

            <div className="eduleb-ms-trust d-flex align-items-center flex-wrap gap-4 pt-3">
              <div className="d-flex align-items-center gap-2">
                <span className="eduleb-ms-trust-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                </span>
                <div>
                  <div className="eduleb-ms-trust-label">Trusted by</div>
                  <div className="eduleb-ms-trust-value">50,000+ learners</div>
                </div>
              </div>
              <div className="d-flex align-items-center gap-2">
                <span className="eduleb-ms-trust-icon star">★</span>
                <div>
                  <div className="eduleb-ms-trust-value">4.8/5</div>
                  <div className="eduleb-ms-trust-label">average rating</div>
                </div>
              </div>
              <div className="d-flex align-items-center gap-2">
                <span className="eduleb-ms-trust-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </span>
                <div>
                  <div className="eduleb-ms-trust-value">Secure &amp;</div>
                  <div className="eduleb-ms-trust-label">reliable platform</div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-xl-6 col-lg-6 col-12" data-aos="fade-left">
            <div className="ms-hero-photo-wrap">
              <div className="ms-hero-pastel-blob" />
              <div className="eduleb-ms-blob-orange" />
              <img
                src="/eduleb/img/home-img2.png"
                alt="Student preparing for online mock exams"
                className="ms-hero-student-photo"
              />

              <div className="ms-float-score-box eduleb-hover-lift">
                <div className="eduleb-ms-score-title">Your Last Test Score</div>
                <div className="d-flex align-items-center gap-3 mb-3">
                  <div className="ms-score-ring-circle">82%</div>
                  <div>
                    <div className="eduleb-ms-score-num">164 / 200</div>
                    <div className="eduleb-ms-score-good">Excellent!</div>
                  </div>
                </div>
                {[
                  { label: 'Quantitative Aptitude', pct: 85 },
                  { label: 'Reasoning', pct: 78 },
                  { label: 'English', pct: 82 },
                ].map((row) => (
                  <div key={row.label} className="mb-2">
                    <div className="d-flex justify-content-between eduleb-ms-bar-label">
                      <span>{row.label}</span>
                      <span>{row.pct}%</span>
                    </div>
                    <div className="eduleb-ms-bar-track">
                      <div className="eduleb-ms-bar-fill" style={{ width: `${row.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>

              <div className="eduleb-ms-tip-card eduleb-hover-lift">
                <span className="eduleb-ms-tip-icon">📈</span>
                <span>Improve your weak topics with personalized analysis</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
