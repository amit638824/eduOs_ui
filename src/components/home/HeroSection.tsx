import { Link } from 'react-router-dom';
import { TypeAnimation } from 'react-type-animation';
import type { HomepageContent } from '@/types/homepage';

const fallbackPhrases = [
  'Competitive Exams',
  'Schools & Colleges',
  'Govt IT & Certifications',
  'Skill Assessments',
  'CBT Mock Tests',
];

export default function HeroSection({ content }: { content?: HomepageContent['hero'] }) {
  const phrases = content?.phrases?.length ? content.phrases : fallbackPhrases;
  const sequence = phrases.flatMap((phrase) => [phrase, 2400] as [string, number]);
  const trust = content?.trust?.length
    ? content.trust
    : [
        { label: 'Trusted by', value: '50,000+ candidates' },
        { label: 'average rating', value: '4.9/5' },
        { label: 'reliable platform', value: 'AI Proctored &' },
      ];

  return (
    <section className="ms-hero-exact eduleb-ms-hero">
      <div className="container">
        <div className="row align-items-center g-4 g-xl-5">
          <div className="col-xl-6 col-lg-6 col-12">
            <div className="ms-mission-badge" data-aos="fade-down" data-aos-duration="900" data-aos-delay="100">
              {content?.badge || 'AI-POWERED ONLINE EXAMINATION & ASSESSMENT PLATFORM'}
            </div>

            <h1 className="ms-hero-heading-exact" data-aos="fade-up" data-aos-duration="900" data-aos-delay="150">
              {content?.titleBefore || 'Smart Online Examination Platform for'}{' '}
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
                'Empower your institution and learners with AI-proctored online exams, comprehensive question banks, instant auto-evaluation, and verified digital certificates.'}
            </p>

            <div className="d-flex align-items-center flex-wrap gap-3 mb-4" data-aos="fade-up" data-aos-duration="900" data-aos-delay="300">
              <Link to={content?.primaryCta?.href || '/exams'} className="ms-btn-coral">
                <span>{content?.primaryCta?.label || 'Explore Mock Tests'}</span>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </Link>
              <a href={content?.secondaryCta?.href || '#video'} className="ms-btn-outline-clean">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
                <span>{content?.secondaryCta?.label || 'Watch Demo'}</span>
              </a>
            </div>

            <div className="eduleb-ms-trust" data-aos="fade-up" data-aos-duration="900" data-aos-delay="380">
              <div className="eduleb-ms-trust-item">
                <span className="eduleb-ms-trust-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                </span>
                <div className="eduleb-ms-trust-copy">
                  <div className="eduleb-ms-trust-label">{trust[0]?.label || 'Trusted by'}</div>
                  <div className="eduleb-ms-trust-value">{trust[0]?.value || '50,000+ candidates'}</div>
                </div>
              </div>
              <div className="eduleb-ms-trust-item">
                <span className="eduleb-ms-trust-icon star">★</span>
                <div className="eduleb-ms-trust-copy">
                  <div className="eduleb-ms-trust-value">{trust[1]?.value || '4.9/5'}</div>
                  <div className="eduleb-ms-trust-label">{trust[1]?.label || 'average rating'}</div>
                </div>
              </div>
              <div className="eduleb-ms-trust-item">
                <span className="eduleb-ms-trust-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </span>
                <div className="eduleb-ms-trust-copy">
                  <div className="eduleb-ms-trust-value">{trust[2]?.value || 'AI Proctored &'}</div>
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

              <div className="eduleb-ms-tip-card eduleb-hover-lift" data-aos="fade-up" data-aos-duration="900" data-aos-delay="450">
                <span className="eduleb-ms-tip-icon">📈</span>
                <span>{content?.tip || 'AI Analytics: Focus on weak topics to maximize your examination score'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
