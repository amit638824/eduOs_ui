import { Link } from 'react-router-dom';
import PageBanner from '@/components/eduleb/PageBanner';

const posts = [
  {
    img: '/eduleb/img/blog/1.jpg',
    date: 'May 10, 2024',
    category: 'Education',
    title: 'Professional Mobile Painting and Sculpting',
    slug: 'professional-mobile-painting',
  },
  {
    img: '/eduleb/img/blog/2.jpg',
    date: 'May 16, 2024',
    category: 'Education',
    title: 'Professional Ceramic Moulding for Beginner',
    slug: 'professional-ceramic-moulding',
  },
  {
    img: '/eduleb/img/blog/3.jpg',
    date: 'May 18, 2024',
    category: 'Programing',
    title: 'Education Is About Create Leaders For Tomorrow',
    slug: 'education-leaders-tomorrow',
  },
  {
    img: '/eduleb/img/blog/4.jpg',
    date: 'May 10, 2024',
    category: 'Education',
    title: 'Professional Mobile Painting and Sculpting',
    slug: 'mobile-painting-advanced',
  },
  {
    img: '/eduleb/img/blog/5.jpg',
    date: 'May 16, 2024',
    category: 'Education',
    title: 'Professional Ceramic Moulding for Beginner',
    slug: 'ceramic-moulding-2',
  },
  {
    img: '/eduleb/img/blog/6.jpg',
    date: 'May 18, 2024',
    category: 'Programing',
    title: 'Education Is About Create Leaders For Tomorrow',
    slug: 'leaders-for-tomorrow-2',
  },
];

export default function BlogPage() {
  return (
    <>
      <PageBanner title="Our Blog" crumb="Blog" />

      <section id="blog" className="blog_area section-padding">
        <div className="container">
          <div className="row">
            {posts.map((post, index) => (
              <div
                key={post.slug}
                className="col-lg-4 col-sm-4 col-xs-12"
                data-aos="fade-up"
                data-aos-delay={(index % 3) * 100}
              >
                <div className="single_blog eduleb-hover-lift">
                  <img src={post.img} className="img-fluid" alt={post.title} />
                  <div className="content_box">
                    <span>
                      {post.date} | <Link to={`/blog/${post.slug}`}>{post.category}</Link>
                    </span>
                    <h2>
                      <Link to={`/blog/${post.slug}`}>{post.title}</Link>
                    </h2>
                    <Link className="btn_one" to={`/blog/${post.slug}`}>
                      Read More <i className="ti-arrow-top-right" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
