import { Link } from 'react-router-dom';

export default function BlogSection() {
  const posts = [
    {
      slug: 'cat-2026-guide',
      category: 'Study Tips',
      title: 'How to Prepare for CAT 2026: A Complete Guide',
      img: '/img/blog/blog_1.png',
    },
    {
      slug: 'jee-time-management',
      category: 'Exam Strategy',
      title: '5 Proven Time Management Tips for JEE Aspirants',
      img: '/img/blog/blog_3.png',
    },
    {
      slug: 'mistakes-in-mock-tests',
      category: 'General',
      title: 'Mistakes to Avoid in Mock Tests',
      img: '/img/blog/blog_4.png',
    },
    {
      slug: 'choose-right-coaching',
      category: 'Guidance',
      title: 'How to Choose the Right Coaching for You',
      img: '/img/blog/blog_15.png',
    },
  ];

  return (
    <section className="ms-blog-exact">
      <div className="container">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-end flex-wrap gap-3 mb-4" data-aos="fade-up">
          <div>
            <h2 className="ms-sec-title">Latest From MindSprint</h2>
            <p className="ms-sec-subtitle">
              Tips, strategies and study resources to help you prepare better.
            </p>
          </div>

          <Link to="/blog" className="ms-view-link">
            <span>View All Articles</span>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </Link>
        </div>

        {/* 4 Blog Cards Grid */}
        <div className="row g-4">
          {posts.map((post, idx) => (
            <div key={post.slug} className="col-xl-3 col-lg-3 col-md-6 col-12" data-aos="fade-up" data-aos-delay={idx * 70}>
              <div className="ms-article-card-exact">
                {/* Thumbnail */}
                <div style={{ position: 'relative', aspectRatio: '16 / 10', overflow: 'hidden', background: '#f1f5f9' }}>
                  <Link to={`/blog/${post.slug}`}>
                    <img
                      src={post.img}
                      alt={post.title}
                      loading="lazy"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </Link>
                </div>

                {/* Content */}
                <div className="p-3 d-flex flex-column flex-grow-1">
                  <div className="mb-2">
                    <span
                      style={{
                        display: 'inline-block',
                        background: '#eff6ff',
                        color: 'var(--ms-primary)',
                        fontSize: '0.725rem',
                        fontWeight: 700,
                        padding: '3px 10px',
                        borderRadius: '6px',
                      }}
                    >
                      {post.category}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '0.925rem', fontWeight: 700, lineHeight: 1.4, margin: 0, marginBottom: '14px', flexGrow: 1 }}>
                    <Link
                      to={`/blog/${post.slug}`}
                      style={{ color: 'var(--ms-dark)', textDecoration: 'none' }}
                      className="ms-blog-title-link"
                    >
                      {post.title}
                    </Link>
                  </h3>

                  <Link
                    to={`/blog/${post.slug}`}
                    className="d-inline-flex align-items-center gap-1 mt-auto"
                    style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--ms-primary)', textDecoration: 'none' }}
                  >
                    <span>Read More</span>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
