import { Link } from 'react-router-dom';

const posts = [
  {
    img: '/eduleb/img/blog/1.jpg',
    date: 'May 10, 2024',
    category: 'Education',
    title: 'Professional Mobile Painting and Sculpting',
  },
  {
    img: '/eduleb/img/blog/2.jpg',
    date: 'May 16, 2024',
    category: 'Education',
    title: 'Professional Ceramic Moulding for Beginner',
  },
  {
    img: '/eduleb/img/blog/3.jpg',
    date: 'May 18, 2024',
    category: 'Programing',
    title: 'Education Is About Create Leaders For Tomorrow ',
  },
];

export default function BlogSection() {
  return (
    <section id="blog" className="blog_area section-padding">
      <div className="container">
        <div className="section-title text-center" data-aos="fade-up">
          <h2 data-aos="fade-up" data-aos-delay="100">Latest Blog &amp; news</h2>
          <p data-aos="fade-up" data-aos-delay="150">
            We offer a brand new approach to the most basic learning paradigms. Choose from a wide
            range of learning options and gain new skills! Our school is know.
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
                  <img src={post.img} className="img-fluid" alt="image" />
                </div>
                <div className="content_box">
                  <span>
                    {post.date} | <Link to="/blog">{post.category}</Link>
                  </span>
                  <h2>
                    <Link to="/blog">{post.title}</Link>
                  </h2>
                  <Link className="btn_one" to="/blog">
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
