import { Link } from 'react-router-dom';
import { siteContent } from '@/data/siteContent';
import SectionTitle from '@/components/ui/SectionTitle';

export default function BlogSection() {
  const { blog } = siteContent;
  const [featured, ...rest] = blog.posts;

  return (
    <div className="blogarea sp_bottom_70 sp_top_100">
      <div className="container">
        <div className="row" data-aos="fade-up">
          <div className="col-xl-12">
            <SectionTitle badge={blog.badge} title={blog.title} centered />
          </div>
        </div>
        <div className="row">
          {featured && (
            <div className="col-xl-8 col-lg-8" data-aos="fade-up">
              <div className="blogarea__content__wraper">
                <div className="blogarea__img">
                  <Link to={`/blog/${featured.slug}`}>
                    <img loading="lazy" src={featured.image} alt={featured.title} />
                  </Link>
                  <div className="blogarea__date">
                    {featured.date}
                    <span>{featured.month}</span>
                  </div>
                </div>
                <div className="blogarea__text__wraper">
                  <h3>
                    <Link to={`/blog/${featured.slug}`}>{featured.title}</Link>
                  </h3>
                  {featured.excerpt && (
                    <div className="blogarea__para">
                      <p>{featured.excerpt}</p>
                    </div>
                  )}
                  {featured.author && (
                    <div className="blogarea__icon">
                      <div className="blogarea__person">
                        <div className="blogarea__img">
                          <img loading="lazy" src="/img/blog/blog_2.png" alt="" />
                        </div>
                        <div className="blogarea__name">
                          <span>{featured.author}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="col-xl-4 col-lg-4" data-aos="fade-up">
            {rest.map((post) => (
              <div key={post.slug} className="blogarea__content__wraper">
                <div className="blogarea__img">
                  <Link to={`/blog/${post.slug}`}>
                    <img loading="lazy" src={post.image} alt={post.title} />
                  </Link>
                  <div className="blogarea__date small__date">
                    {post.date}
                    <span>{post.month}</span>
                  </div>
                </div>
                <div className="blogarea__text__wraper blogarea__text__wraper__2">
                  <h3>
                    <Link to={`/blog/${post.slug}`}>{post.title}</Link>
                  </h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
