import { Link } from 'react-router-dom';
import CountUp from 'react-countup';

export default function SubjectsSection() {
  const exams = [
    { title: 'CAT', sub: 'MBA Entrance Exam', href: '/exams', borderColor: '#3861fb' },
    { title: 'JEE', sub: 'Main & Advanced', href: '/exams', borderColor: '#9333ea' },
    { title: 'UPSC', sub: 'Civil Services', href: '/exams', borderColor: '#ea580c' },
    { title: 'Banking', sub: 'IBPS | SBI | RBI', href: '/exams', borderColor: '#2563eb' },
    { title: 'SSC', sub: 'Government Jobs', href: '/exams', borderColor: '#10b981' },
    { title: 'GATE', sub: 'Post Graduate', href: '/exams', borderColor: '#7c3aed' },
    { title: 'CLAT', sub: 'Law Entrance', href: '/exams', borderColor: '#06b6d4' },
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
      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        <div className="d-flex justify-content-between align-items-end flex-wrap gap-3 mb-4" data-aos="fade-up">
          <div>
            <h2 className="ms-sec-title">
              Explore Our <span style={{ color: 'var(--ms-primary)' }}>Exams</span>
            </h2>
            <p className="ms-sec-subtitle">
              Choose your target exam and start preparing with confidence.
            </p>
          </div>

         
        </div>

        <div className="row g-3 eduleb-exam-cats-row">
          {exams.map((ex, idx) => (
            <div key={ex.title} className="col-xl col-lg-3 col-md-4 col-sm-6 col-6" data-aos="fade-up" data-aos-delay={idx * 50}>
              <Link
                to={ex.href}
                className="ms-exam-card-color eduleb-exam-cat-card"
                style={{ borderBottom: `4px solid ${ex.borderColor}` }}
              >
                <div className="eduleb-exam-cat-title">{ex.title}</div>
                <div className="eduleb-exam-cat-sub">{ex.sub}</div>
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
