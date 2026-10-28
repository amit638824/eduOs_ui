import { Link } from 'react-router-dom';
import CountUp from 'react-countup';

export default function SubjectsSection() {
  const exams = [
    {
      title: 'CAT',
      sub: 'MBA Entrance Exam',
      href: '/exams',
      borderColor: '#3861fb',
      iconColor: '#3861fb',
      iconBg: '#eff6ff',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3861fb" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
          <path d="M6 12v5c3 3 9 3 12 0v-5" />
        </svg>
      ),
    },
    {
      title: 'JEE',
      sub: 'Main & Advanced',
      href: '/exams',
      borderColor: '#9333ea',
      iconColor: '#9333ea',
      iconBg: '#faf5ff',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9333ea" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10 2v7.31M14 2v7.31M8.5 2h7M14 9.3a6.5 6.5 0 1 1-4 0" />
        </svg>
      ),
    },
    {
      title: 'UPSC',
      sub: 'Civil Services',
      href: '/exams',
      borderColor: '#ea580c',
      iconColor: '#ea580c',
      iconBg: '#fff7ed',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ea580c" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 21h18M5 21V7l7-4 7 4v14M9 10v6M15 10v6" />
        </svg>
      ),
    },
    {
      title: 'Banking',
      sub: 'IBPS | SBI | RBI',
      href: '/exams',
      borderColor: '#2563eb',
      iconColor: '#2563eb',
      iconBg: '#eff6ff',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="5" width="20" height="14" rx="2" />
          <line x1="2" y1="10" x2="22" y2="10" />
        </svg>
      ),
    },
    {
      title: 'SSC',
      sub: 'Government Jobs',
      href: '/exams',
      borderColor: '#10b981',
      iconColor: '#10b981',
      iconBg: '#ecfdf5',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
    },
    {
      title: 'GATE',
      sub: 'Post Graduate',
      href: '/exams',
      borderColor: '#7c3aed',
      iconColor: '#7c3aed',
      iconBg: '#f5f3ff',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      ),
    },
    {
      title: 'CLAT',
      sub: 'Law Entrance',
      href: '/exams',
      borderColor: '#06b6d4',
      iconColor: '#06b6d4',
      iconBg: '#ecfeff',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3v18M6 8l6-5 6 5M6 8l-4 8h8l-4-8zM18 8l-4 8h8l-4-8z" />
        </svg>
      ),
    },
  ];

  const stats = [
    {
      num: 50000,
      suffix: '+',
      label: 'Active Learners',
      isStar: false,
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
    },
    {
      num: 300,
      suffix: '+',
      label: 'Mock Tests Available',
      isStar: false,
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
        </svg>
      ),
    },
    {
      num: 75,
      suffix: '+',
      label: 'Courses & Study Resources',
      isStar: false,
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
      ),
    },
    {
      num: 4.8,
      suffix: '/5',
      decimals: 1,
      label: 'Average Learner Rating',
      isStar: true,
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="#f59e0b" stroke="#f59e0b" strokeWidth="1">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ),
    },
  ];

  return (
    <section className="ms-explore-section-exact">
      {/* Decorative Dot Grid in Top Right */}
      <div style={{ position: 'absolute', top: '18px', right: '28px', pointerEvents: 'none', opacity: 0.35 }}>
        <svg width="110" height="60" viewBox="0 0 110 60" fill="none">
          {Array.from({ length: 5 }).map((_, r) =>
            Array.from({ length: 9 }).map((_, c) => (
              <circle key={`${r}-${c}`} cx={c * 12 + 6} cy={r * 12 + 6} r="2" fill="#3861fb" />
            ))
          )}
        </svg>
      </div>

      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        {/* Header with Badge & Title */}
        <div className="d-flex justify-content-between align-items-end flex-wrap gap-3 mb-4" data-aos="fade-up">
          <div>
            <div className="ms-badge-pill-exact">
              <span>🎓</span>
              <span>TRUSTED BY 50,000+ LEARNERS</span>
            </div>

            <h2 className="ms-sec-title" style={{ fontSize: '2.5rem', fontWeight: 800 }}>
              Explore Our <span style={{ color: 'var(--ms-primary)' }}>Exams</span>
            </h2>

            <p className="ms-sec-subtitle">
              Choose your target exam and start preparing with confidence.
            </p>
          </div>

          <Link to="/exams" className="ms-view-link">
            <span>View All Exams</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </Link>
        </div>

        {/* 7 Exam Cards Grid with Bottom Border Accent */}
        <div className="row g-3">
          {exams.map((ex, idx) => (
            <div key={ex.title} className="col-xl col-lg-3 col-md-4 col-sm-6 col-6" data-aos="fade-up" data-aos-delay={idx * 50}>
              <Link
                to={ex.href}
                className="ms-exam-card-color"
                style={{ borderBottom: `4px solid ${ex.borderColor}` }}
              >
                <div className="ms-exam-circle-icon" style={{ background: ex.iconBg }}>
                  {ex.icon}
                </div>

                <div style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--ms-dark)', marginBottom: '4px' }}>
                  {ex.title}
                </div>

                <div style={{ fontSize: '0.8rem', color: 'var(--ms-muted)', lineHeight: 1.35, marginBottom: '16px', flexGrow: 1 }}>
                  {ex.sub}
                </div>

                <div className="ms-exam-circle-btn" style={{ color: ex.borderColor }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </div>
              </Link>
            </div>
          ))}
        </div>

        {/* 4 Metrics Strip matching Image 5 Bottom */}
        <div className="ms-metrics-card-exact" data-aos="fade-up" data-aos-delay="200">
          <div className="row g-4 justify-content-between align-items-center">
            {stats.map((s) => (
              <div key={s.label} className="col-lg-3 col-sm-6 col-12">
                <div className="d-flex align-items-center gap-3">
                  <div className={`ms-metric-icon-circle ${s.isStar ? 'star' : ''}`}>
                    {s.icon}
                  </div>
                  <div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--ms-dark)', lineHeight: 1.1 }}>
                      <CountUp
                        end={s.num}
                        decimals={s.decimals || 0}
                        duration={2}
                        separator=","
                        enableScrollSpy
                        scrollSpyOnce
                      />
                      <span>{s.suffix}</span>
                    </div>
                    <div style={{ fontSize: '0.825rem', color: 'var(--ms-muted)', fontWeight: 500, marginTop: '2px' }}>
                      {s.label}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
