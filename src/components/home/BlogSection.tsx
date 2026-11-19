import type { HomepageContent } from '@/types/homepage';

const fallbackPosts = [
  {
    img: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=600&q=80',
    date: 'Oct 28, 2026',
    category: 'Exam Prep',
    title: 'Top Strategies to Crack Computer & IT Certification Exams in First Attempt',
    href: '/blog',
  },
  {
    img: '/eduleb/img/blog/b1.jpg',
    date: 'Oct 25, 2026',
    category: 'Online CBT',
    title: 'How AI Proctoring & Timed Mock Tests Boost Real Exam Performance',
    href: '/blog',
  },
  {
    img: '/eduleb/img/blog/b2.jpg',
    date: 'Oct 20, 2026',
    category: 'Govt IT',
    title: 'Complete Guide to CCC & O Level Syllabus, Question Pattern & Mock Papers',
    href: '/blog',
  },
];

export default function BlogSection({ content }: { content?: HomepageContent['blog'] }) {
  const posts = content?.items?.length ? content.items : fallbackPosts;
  return (
    <section id="blog" className="blog_area section-padding">
      <div className="container">
        <div className="section-title text-center" data-aos="fade-up">
          <h2 data-aos="fade-up" data-aos-delay="100">{content?.title || 'Latest Examination News & Study Insights'}</h2>
          <p data-aos="fade-up" data-aos-delay="150">
            {content?.description ||
              'Expert preparation guides, exam pattern breakdowns, and digital assessment strategies to help you excel.'}
          </p>
        </div>
        <div className="row g-4 align-items-stretch">
          {posts.map((post, idx) => (
            <div
              key={post.title}
              className="col-lg-4 col-sm-6 col-xs-12 d-flex"
              data-aos="fade-up"
              data-aos-delay={idx * 120}
            >
              <div className="single_blog eduleb-hover-lift w-100 d-flex flex-column">
                <div
                  data-aos="zoom-in"
                  data-aos-delay={idx * 120 + 80}
                  style={{
                    height: '210px',
                    width: '100%',
                    overflow: 'hidden',
                    flexShrink: 0,
                  }}
                >
                  <img
                    src={post.img}
                    className="img-fluid"
                    alt={post.title}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block',
                    }}
                  />
                </div>
                <div
                  className="content_box d-flex flex-column flex-grow-1"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    flex: '1 1 auto',
                    padding: '18px 20px',
                  }}
                >
                  <span style={{ marginBottom: '8px', fontSize: '12.5px', color: '#718096' }}>
                    {post.date} | <a href="#" onClick={(e) => e.preventDefault()} style={{ fontWeight: 600 }}>{post.category}</a>
                  </span>
                  <h2
                    style={{
                      fontSize: '17px',
                      lineHeight: 1.35,
                      fontWeight: 700,
                      margin: '0 0 12px',
                      minHeight: '44px',
                    }}
                  >
                    <a href="#" onClick={(e) => e.preventDefault()} style={{ color: '#14213d', display: 'inline', marginBottom: 0 }}>
                      {post.title}
                    </a>
                  </h2>
                  <div style={{ marginTop: 'auto', paddingTop: '4px' }}>
                    <a className="btn_one" href="#" onClick={(e) => e.preventDefault()} style={{ padding: '9px 18px', fontSize: '13px' }}>
                      Read More <i className="ti-arrow-top-right" />
                    </a>
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
