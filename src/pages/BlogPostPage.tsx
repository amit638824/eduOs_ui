import { Link, Navigate, useParams } from 'react-router-dom';
import Breadcrumb from '@/components/ui/Breadcrumb';
import { siteContent } from '@/data/siteContent';

export default function BlogPostPage() {
  const { slug = '' } = useParams();
  const post = siteContent.blog.posts.find((item) => item.slug === slug);

  if (!post) {
    return <Navigate to="/blog" replace />;
  }

  return (
    <>
      <Breadcrumb title={post.title} items={[{ label: 'Home', href: '/' }, { label: 'Blog', href: '/blog' }]} />
      <div className="blogarea sp_top_100 sp_bottom_100">
        <div className="container">
          <div className="row">
            <div className="col-xl-8 offset-xl-2">
              <div className="blogarea__content__wraper">
                <div className="blogarea__img">
                  <img loading="lazy" src={post.image} alt={post.title} />
                  <div className="blogarea__date">
                    {post.date}
                    <span>{post.month}</span>
                  </div>
                </div>
                <div className="blogarea__text__wraper">
                  <h3>{post.title}</h3>
                  {post.author && <p>{post.author}</p>}
                  <p>
                    {post.excerpt ??
                      'Read the latest news, online exam updates, and IT training tips from Super Computer Academy.'}
                  </p>
                  <Link className="default__button sp_top_20" to="/blog">
                    Back to Blog
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
