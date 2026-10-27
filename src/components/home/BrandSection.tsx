import { Link } from 'react-router-dom';

export default function BrandSection() {
  const bodies = [
    {
      title: 'CAT',
      badge: 'MBA Entrance',
      sub: 'IIMs & Top B-Schools',
      tagColor: '#3861fb',
      tagBg: '#eff6ff',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#3861fb" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
          <path d="M6 12v5c3 3 9 3 12 0v-5" />
        </svg>
      ),
    },
    {
      title: 'JEE',
      badge: 'Engineering',
      sub: 'Main & Advanced (IITs)',
      tagColor: '#9333ea',
      tagBg: '#faf5ff',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#9333ea" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10 2v7.31M14 2v7.31M8.5 2h7M14 9.3a6.5 6.5 0 1 1-4 0" />
        </svg>
      ),
    },
    {
      title: 'UPSC',
      badge: 'Civil Services',
      sub: 'IAS | IPS | IFS Exam',
      tagColor: '#ea580c',
      tagBg: '#fff7ed',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ea580c" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 21h18M5 21V7l7-4 7 4v14M9 10v6M15 10v6" />
        </svg>
      ),
    },
    {
      title: 'Banking',
      badge: 'IBPS | SBI | RBI',
      sub: 'PO & Clerk Exams',
      tagColor: '#2563eb',
      tagBg: '#eff6ff',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      ),
    },
    {
      title: 'SSC',
      badge: 'Govt Jobs',
      sub: 'CGL | CHSL | CPO',
      tagColor: '#10b981',
      tagBg: '#ecfdf5',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      ),
    },
    {
      title: 'GATE',
      badge: 'Post Graduate',
      sub: 'IITs, IISc & PSUs',
      tagColor: '#7c3aed',
      tagBg: '#f5f3ff',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      ),
    },
    {
      title: 'CLAT',
      badge: 'Law Entrance',
      sub: '24+ National Law Univs',
      tagColor: '#06b6d4',
      tagBg: '#ecfeff',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3v18M6 8l6-5 6 5M6 8l-4 8h8l-4-8zM18 8l-4 8h8l-4-8z" />
        </svg>
      ),
    },
  ];

  return (
    <section className="ms-trusted-strip-exact">
      <div className="container">
        <div className="text-center mb-4" data-aos="fade-up">
          <div className="d-inline-flex align-items-center gap-2 px-3 py-1 rounded-pill mb-2" style={{ background: '#e0effe', color: '#1d4ed8', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em' }}>
            <span>⭐</span>
            <span>TRUSTED BY TOP INSTITUTIONS &amp; EXAM BODIES</span>
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--ms-muted)', margin: 0 }}>
            Mock tests tailored to actual patterns approved by premier examination authorities
          </p>
        </div>

        <div className="row g-3 justify-content-center">
          {bodies.map((b, idx) => (
            <div key={b.title} className="col-xl col-lg-3 col-md-4 col-sm-6 col-6" data-aos="fade-up" data-aos-delay={idx * 40}>
              <Link to="/exams" className="ms-brand-card-item">
                <div className="ms-brand-icon-box" style={{ background: b.tagBg, color: b.tagColor }}>
                  {b.icon}
                </div>
                <div style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--ms-dark)', letterSpacing: '0.02em' }}>
                  {b.title}
                </div>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: b.tagColor, background: b.tagBg, padding: '2px 8px', borderRadius: '4px', margin: '4px 0 3px' }}>
                  {b.badge}
                </div>
                <div style={{ fontSize: '0.725rem', color: 'var(--ms-muted)', textAlign: 'center', lineHeight: 1.3 }}>
                  {b.sub}
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
