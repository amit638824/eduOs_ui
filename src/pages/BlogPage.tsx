import Breadcrumb from '@/components/ui/Breadcrumb';
import { Link } from 'react-router-dom';
import { siteContent } from '@/data/siteContent';

export default function BlogPage() {
  const { blog } = siteContent;

  return (
    <>
      <Breadcrumb title="Blog" />
      <div className="blogarea sp_top_100 sp_bottom_100">
        <div className="container">
          <div className="row">
            {blog.posts.map((post) => (
              <div key={post.slug} className="col-xl-4 col-lg-6 sp_bottom_30">
                <div className="blogarea__content__wraper">
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
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
