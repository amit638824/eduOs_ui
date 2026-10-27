import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { ExamCategorySlug } from '@/utils/routes';

interface ExamGridSectionProps {
  activeCategory?: ExamCategorySlug;
}

export default function ExamGridSection({ activeCategory: _activeCategory }: ExamGridSectionProps = {}) {
  const [activeTab, setActiveTab] = useState('All');

  const tabs = ['All', 'CAT', 'JEE', 'Banking', 'UPSC', 'SSC', 'Others'];

  const testCards = [
    {
      id: 'cat-full-length',
      category: 'CAT',
      badgeBg: '#ea580c',
      title: 'CAT Full Length Mock Test',
      sub: 'Sectional + Overall | 120 Questions | 2 hrs',
      rating: 4.8,
      reviews: '12.4k',
      price: '₹299',
      img: '/img/grid/grid_1.png',
    },
    {
      id: 'jee-main-practice',
      category: 'JEE',
      badgeBg: '#2563eb',
      title: 'JEE Main Practice Test',
      sub: 'Physics + Chemistry + Maths | 90 Questions | 3 hrs',
      rating: 4.7,
      reviews: '9.8k',
      price: '₹249',
      img: '/img/grid/grid_2.png',
    },
    {
      id: 'ibps-po-mock',
      category: 'Banking',
      badgeBg: '#7c3aed',
      title: 'IBPS PO Mock Test',
      sub: 'Quant + Reasoning + English | 100 Questions | 2 hrs',
      rating: 4.6,
      reviews: '7.2k',
      price: '₹199',
      img: '/img/grid/grid_3.png',
    },
    {
      id: 'upsc-prelims-mock',
      category: 'UPSC',
      badgeBg: '#0d9488',
      title: 'UPSC Prelims Mock Test',
      sub: 'GS + CSAT | 120 Questions | 2.5 hrs',
      rating: 4.9,
      reviews: '5.3k',
      price: '₹349',
      img: '/img/grid/grid_4.png',
    },
  ];

  const filtered = activeTab === 'All'
    ? testCards
    : testCards.filter((t) => t.category === activeTab);

  return (
    <section className="ms-popular-tests-exact">
      <div className="container">
        {/* Header and Filter Tabs */}
        <div className="d-flex justify-content-between align-items-end flex-wrap gap-3 mb-4" data-aos="fade-up">
          <div>
            <h2 className="ms-sec-title">Popular Mock Tests</h2>
            <p className="ms-sec-subtitle">
              Attempt the most popular tests and boost your preparation level.
            </p>
          </div>

          <div className="d-flex align-items-center flex-wrap gap-2">
            {tabs.map((tab) => (
              <button
                key={tab}
                type="button"
                className={`ms-test-tab-pill ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* 4 Cards Grid */}
        <div className="row g-4">
          {(filtered.length > 0 ? filtered : testCards).map((test, idx) => (
            <div key={test.id} className="col-xl-3 col-lg-6 col-md-6 col-12" data-aos="fade-up" data-aos-delay={idx * 70}>
              <div className="ms-mock-card-exact">
                <div className="ms-mock-thumb-box">
                  <Link to={`/exams/${test.id}`}>
                    <img loading="lazy" src={test.img} alt={test.title} />
                  </Link>
                  <span className="ms-mock-pill-badge" style={{ background: test.badgeBg }}>
                    {test.category}
                  </span>
                </div>

                <div className="p-3 d-flex flex-column flex-grow-1">
                  <Link to={`/exams/${test.id}`} style={{ fontSize: '1.025rem', fontWeight: 700, color: 'var(--ms-dark)', lineHeight: 1.35, textDecoration: 'none', marginBottom: '6px' }}>
                    {test.title}
                  </Link>

                  <div style={{ fontSize: '0.8rem', color: 'var(--ms-muted)', marginBottom: '12px' }}>
                    {test.sub}
                  </div>

                  <div className="d-flex align-items-center gap-1 mb-3" style={{ fontSize: '0.8rem', color: 'var(--ms-muted)' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="#f59e0b" stroke="#f59e0b">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                    <span style={{ fontWeight: 700, color: 'var(--ms-dark)' }}>{test.rating}</span>
                    <span>({test.reviews} reviews)</span>
                  </div>

                  <div className="d-flex align-items-center justify-content-between pt-3 border-top mt-auto" style={{ borderColor: 'var(--ms-border-light)' }}>
                    <div style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--ms-dark)' }}>
                      {test.price}
                    </div>

                    <Link to={`/exams/${test.id}`} className="ms-mock-circle-btn" aria-label={`Attempt ${test.title}`}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="5" y1="12" x2="19" y2="12" />
                        <polyline points="12 5 19 12 12 19" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
