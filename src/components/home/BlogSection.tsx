import { Link } from 'react-router-dom';
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
        <div className="row">
          {posts.map((post, idx) => (
            <div
              key={post.title}
              className="col-lg-4 col-sm-4 col-xs-12"
              data-aos="fade-up"
              data-aos-delay={idx * 120}
            >
              <div className="single_blog eduleb-hover-lift">
                <div data-aos="zoom-in" data-aos-delay={idx * 120 + 80}>
                  <img src={post.img} className="img-fluid" alt={post.title} />
                </div>
                <div className="content_box">
                  <span>
                    {post.date} | <Link to={post.href || '/blog'}>{post.category}</Link>
                  </span>
                  <h2>
                    <Link to={post.href || '/blog'}>{post.title}</Link>
                  </h2>
                  <Link className="btn_one" to={post.href || '/blog'}>
                    Read More <i className="ti-arrow-top-right" />
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
