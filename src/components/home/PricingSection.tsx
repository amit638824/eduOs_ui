import { Link } from 'react-router-dom';

export default function PricingSection() {
  const plans = [
    {
      name: 'Free',
      desc: 'For beginners who want to try',
      price: '₹0',
      period: '/ month',
      features: [
        '1 free mock test',
        'Limited study resources',
        'Community support',
      ],
      popular: false,
      cta: 'Get Started',
      href: '/register',
    },
    {
      name: 'Student',
      desc: 'For serious exam aspirants',
      price: '₹499',
      period: '/ month',
      features: [
        'Unlimited mock tests',
        'All courses & resources',
        'Priority support',
      ],
      popular: true,
      cta: 'Get Started',
      href: '/register',
    },
    {
      name: 'Institution',
      desc: 'For coaching centers & schools',
      price: '₹999',
      period: '/ month',
      features: [
        'Bulk access for students',
        'Advanced analytics',
        'Dedicated account manager',
      ],
      popular: false,
      cta: 'Contact Sales',
      href: '/schools',
    },
  ];

  return (
    <section className="ms-pricing-exact">
      <div className="container">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-end flex-wrap gap-3 mb-5" data-aos="fade-up">
          <div>
            <h2 className="ms-sec-title">Affordable Plans For Every Learner</h2>
            <p className="ms-sec-subtitle">
              Choose a plan that fits your goals and start your preparation today.
            </p>
          </div>

          <Link to="/pricing" className="ms-view-link">
            <span>View All Plans</span>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </Link>
        </div>

        {/* 3 Pricing Cards */}
        <div className="row g-4 align-items-stretch">
          {plans.map((p, idx) => (
            <div key={p.name} className="col-lg-4 col-md-6 col-12" data-aos="fade-up" data-aos-delay={idx * 80}>
              <div className={`ms-pricing-box-clean ${p.popular ? 'featured' : ''}`}>
                {p.popular && (
                  <div className="ms-popular-tag-clean">
                    Most Popular
                  </div>
                )}

                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--ms-dark)', marginBottom: '4px' }}>
                  {p.name}
                </div>

                <div style={{ fontSize: '0.825rem', color: 'var(--ms-muted)', marginBottom: '18px' }}>
                  {p.desc}
                </div>

                <div style={{ fontSize: '2.75rem', fontWeight: 900, color: 'var(--ms-dark)', lineHeight: 1, marginBottom: '24px' }}>
                  {p.price}
                  <span style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--ms-muted)' }}> {p.period}</span>
                </div>

                <ul className="list-unstyled mb-4 flex-grow-1" style={{ padding: 0 }}>
                  {p.features.map((feat) => (
                    <li key={feat} className="d-flex align-items-center gap-2 mb-2" style={{ fontSize: '0.875rem', color: 'var(--ms-gray)' }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--ms-primary)', flexShrink: 0 }}>
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  to={p.href}
                  className={`w-100 ${p.popular ? 'ms-btn-royal' : 'ms-btn-outline-clean'}`}
                  style={{ justifyContent: 'center' }}
                >
                  <span>{p.cta}</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
