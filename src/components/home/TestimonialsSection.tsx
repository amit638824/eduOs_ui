import { Link } from 'react-router-dom';

export default function TestimonialsSection() {
  const reviews = [
    {
      name: 'Priya Sharma',
      role: 'JEE Aspirant',
      quote: 'MindSprint mock tests are really close to the actual exam pattern. My confidence has grown a lot',
      avatar: '/img/grid/grid_small_1.jpg',
    },
    {
      name: 'Rohit Verma',
      role: 'CAT Aspirant',
      quote: 'Detailed analysis and subject-wise reports helped me identify my weak areas. Highly recommended!',
      avatar: '/img/grid/grid_small_2.jpg',
    },
    {
      name: 'Neha Singh',
      role: 'Banking Aspirant',
      quote: 'The platform is simple to use and very helpful. I cleared my IBPS exam with their tests.',
      avatar: '/img/grid/grid_small_3.jpg',
    },
  ];

  return (
    <section className="ms-testimonials-exact">
      <div className="container">
        <div className="row align-items-center g-4 g-xl-5">
          {/* Left Column: Heading, Subtitle, CTA */}
          <div className="col-xl-3 col-lg-4 col-12" data-aos="fade-up">
            <div style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--ms-muted)', marginBottom: '8px' }}>
              What Our Students Say
            </div>

            <h2 className="ms-sec-title" style={{ fontSize: '1.95rem', marginBottom: '14px' }}>
              Real Stories. Real Progress.
            </h2>

            <p className="ms-sec-subtitle" style={{ marginBottom: '24px' }}>
              Join thousands of students who have achieved their goals with MindSprint.
            </p>

            <Link to="/about" className="ms-btn-royal">
              <span>Read More Reviews</span>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </Link>
          </div>

          {/* Right Column: 3 Cards */}
          <div className="col-xl-9 col-lg-8 col-12">
            <div className="row g-3">
              {reviews.map((rev, idx) => (
                <div key={rev.name} className="col-md-4 col-12" data-aos="fade-up" data-aos-delay={idx * 80}>
                  <div className="ms-testimonial-card-exact">
                    {/* Student Info Top */}
                    <div className="d-flex align-items-center gap-3 mb-3">
                      <img
                        src={rev.avatar}
                        alt={rev.name}
                        className="ms-quote-avatar"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                      <div>
                        <div style={{ fontSize: '0.925rem', fontWeight: 700, color: 'var(--ms-dark)', lineHeight: 1.2 }}>
                          {rev.name}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--ms-muted)', marginTop: '2px' }}>
                          {rev.role}
                        </div>
                      </div>
                    </div>

                    {/* Quote text */}
                    <p style={{ fontSize: '0.825rem', color: 'var(--ms-gray)', lineHeight: 1.55, margin: 0, marginBottom: '16px', flexGrow: 1 }}>
                      &ldquo;{rev.quote}&rdquo;
                    </p>

                    {/* 5 Stars */}
                    <div className="d-flex align-items-center gap-1" style={{ color: '#f59e0b' }}>
                      {Array.from({ length: 5 }).map((_, i) => (
                        <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill="#f59e0b" stroke="#f59e0b">
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
