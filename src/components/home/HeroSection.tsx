import { Link } from 'react-router-dom';
import { TypeAnimation } from 'react-type-animation';
import type { HomepageContent } from '@/types/homepage';

const fallbackPhrases = ['Every Exam', 'CAT & MBA', 'JEE & NEET', 'Banking & SSC'];

export default function HeroSection({ content }: { content?: HomepageContent['hero'] }) {
  const phrases = content?.phrases?.length ? content.phrases : fallbackPhrases;
  const sequence = phrases.flatMap((phrase) => [phrase, 2400] as [string, number]);
  const bars = content?.score.bars?.length
    ? content.score.bars
    : [
        { label: 'Quantitative Aptitude', pct: 85 },
        { label: 'Reasoning', pct: 78 },
        { label: 'English', pct: 82 },
      ];
  const trust = content?.trust?.length
    ? content.trust
    : [
        { label: 'Trusted by', value: '50,000+ learners' },
        { label: 'average rating', value: '4.8/5' },
        { label: 'reliable platform', value: 'Secure &' },
      ];

  return (
    <section className="ms-hero-exact eduleb-ms-hero">
      <div className="container">
        <div className="row align-items-center g-4 g-xl-5">
          <div className="col-xl-6 col-lg-6 col-12">
            <div className="ms-mission-badge" data-aos="fade-down" data-aos-duration="900" data-aos-delay="100">
              {content?.badge || 'PRACTICE TODAY, PERFORM TOMORROW'}
            </div>

            <h1 className="ms-hero-heading-exact" data-aos="fade-up" data-aos-duration="900" data-aos-delay="150">
              {content?.titleBefore || 'Online Mock Tests for'}{' '}
              <span className="eduleb-ms-typed">
                <TypeAnimation
                  key={phrases.join('|')}
                  sequence={sequence}
                  speed={50}
                  deletionSpeed={55}
                  repeat={Infinity}
                  cursor
                  preRenderFirstString
                  style={{ color: '#3861fb', display: 'inline-block', minWidth: '9ch' }}
                />
              </span>
            </h1>

            <p className="ms-hero-sub-exact" data-aos="fade-up" data-aos-duration="900" data-aos-delay="220">
              {content?.description ||
                'Realistic test experience, detailed analysis and personalized insights to help you crack your dream exam.'}
            </p>

            <div className="d-flex align-items-center flex-wrap gap-3 mb-4" data-aos="fade-up" data-aos-duration="900" data-aos-delay="300">
              <Link to={content?.primaryCta.href || '/exams'} className="ms-btn-coral">
                <span>{content?.primaryCta.label || 'Explore Mock Tests'}</span>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </Link>
              <a href={content?.secondaryCta.href || '#video'} className="ms-btn-outline-clean">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
                <span>{content?.secondaryCta.label || 'Watch Demo'}</span>
              </a>
            </div>

            <div className="eduleb-ms-trust d-flex align-items-center flex-wrap gap-4 pt-3" data-aos="fade-up" data-aos-duration="900" data-aos-delay="380">
              <div className="d-flex align-items-center gap-2">
                <span className="eduleb-ms-trust-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                </span>
                <div>
                  <div className="eduleb-ms-trust-label">{trust[0]?.label || 'Trusted by'}</div>
                  <div className="eduleb-ms-trust-value">{trust[0]?.value || '50,000+ learners'}</div>
                </div>
              </div>
              <div className="d-flex align-items-center gap-2">
                <span className="eduleb-ms-trust-icon star">★</span>
                <div>
                  <div className="eduleb-ms-trust-value">{trust[1]?.value || '4.8/5'}</div>
                  <div className="eduleb-ms-trust-label">{trust[1]?.label || 'average rating'}</div>
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
                  <div className="eduleb-ms-trust-value">{trust[2]?.value || 'Secure &'}</div>
                  <div className="eduleb-ms-trust-label">{trust[2]?.label || 'reliable platform'}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-xl-6 col-lg-6 col-12">
            <div className="ms-hero-photo-wrap">
              <div className="ms-hero-pastel-blob" />
              <div className="eduleb-ms-blob-orange" />
              <img
                src={content?.image || '/eduleb/img/home-img2.png'}
                alt="Student preparing for online mock exams"
                className="ms-hero-student-photo"
                data-aos="fade-left"
                data-aos-duration="900"
                data-aos-delay="200"
              />

              <div className="ms-float-score-box eduleb-hover-lift" data-aos="fade-up" data-aos-duration="900" data-aos-delay="350">
                <div className="eduleb-ms-score-title">{content?.score.title || 'Your Last Test Score'}</div>
                <div className="d-flex align-items-center gap-3 mb-3">
                  <div className="ms-score-ring-circle">{content?.score.percent || '82%'}</div>
                  <div>
                    <div className="eduleb-ms-score-num">{content?.score.marks || '164 / 200'}</div>
                    <div className="eduleb-ms-score-good">{content?.score.remark || 'Excellent!'}</div>
                  </div>
                </div>
                {bars.map((row) => (
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

              <div className="eduleb-ms-tip-card eduleb-hover-lift" data-aos="fade-up" data-aos-duration="900" data-aos-delay="450">
                <span className="eduleb-ms-tip-icon">📈</span>
                <span>{content?.tip || 'Improve your weak topics with personalized analysis'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
