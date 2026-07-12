import { Link } from 'react-router-dom';
import { siteContent } from '@/data/siteContent';

export default function Footer() {
  const { brand, footer, social } = siteContent;

  return (
    <div className="footerarea">
      <div className="container">
        <div className="footerarea__newsletter__wraper">
          <div className="row">
            <div className="col-xl-6 col-lg-6 col-md-6 col-sm-12 col-12" data-aos="fade-up">
              <div className="footerarea__text">
                <h3>
                  Still Need Our <span>Support</span>?
                </h3>
                <p>Our US-based support team is ready to help with exam setup, proctoring, and account questions.</p>
              </div>
            </div>
            <div className="col-xl-6 col-lg-6 col-md-6 col-sm-12 col-12" data-aos="fade-up">
              <div className="footerarea__newsletter">
                <div className="footerarea__newsletter__input">
                  <form onSubmit={(e) => e.preventDefault()}>
                    <input type="email" placeholder="Enter your email here" />
                    <div className="footerarea__newsletter__button">
                      <button type="submit" className="default__button">
                        Subscribe <i className="icofont-long-arrow-right" />
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="footerarea__wrapper footerarea__wrapper__2">
          <div className="row">
            <div className="col-xl-4 col-lg-4 col-md-6 col-sm-12" data-aos="fade-up">
              <div className="footerarea__inner footerarea__about__us">
                <div className="footerarea__heading">
                  <h3>About {brand.name}</h3>
                </div>
                <div className="footerarea__content">
                  <p>{footer.about}</p>
                </div>
                <div className="foter__bottom__text">
                  <div className="footer__bottom__icon">
                    <i className="icofont-clock-time" />
                  </div>
                  <div className="footer__bottom__content">
                    <h6>{footer.hours.title}</h6>
                    <span>{footer.hours.weekdays}</span>
                    <span>{footer.hours.weekend}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-xl-2 col-lg-2 col-md-6 col-sm-6" data-aos="fade-up">
              <div className="footerarea__inner">
                <div className="footerarea__heading">
                  <h3>Useful Links</h3>
                </div>
                <div className="footerarea__list">
                  <ul>
                    {footer.usefulLinks.map((link) => (
                      <li key={link.href}>
                        <Link to={link.href}>{link.label}</Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="col-xl-3 col-lg-3 col-md-6 col-sm-6" data-aos="fade-up">
              <div className="footerarea__inner footerarea__padding__left">
                <div className="footerarea__heading">
                  <h3>Exam Categories</h3>
                </div>
                <div className="footerarea__list">
                  <ul>
                    {footer.examLinks.map((link) => (
                      <li key={link.href}>
                        <Link to={link.href}>{link.label}</Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="col-xl-3 col-lg-3 col-md-6 col-sm-12" data-aos="fade-up">
              <div className="footerarea__right__wraper footerarea__inner">
                <div className="footerarea__heading">
                  <h3>Recent Updates</h3>
                </div>
                <div className="footerarea__right__list">
                  <ul>
                    {siteContent.blog.posts.slice(0, 3).map((post) => (
                      <li key={post.title}>
                        <a href="#">
                          <div className="footerarea__right__img">
                            <img loading="lazy" src={post.image} alt="" />
                          </div>
                          <div className="footerarea__right__content">
                            <span>
                              {post.date} {post.month} 2026
                            </span>
                            <h6>{post.title}</h6>
                          </div>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="footerarea__copyright__wrapper footerarea__copyright__wrapper__2">
          <div className="row">
            <div className="col-xl-3 col-lg-3">
              <div className="copyright__logo">
                <Link to="/">
                  <img loading="lazy" src={brand.logoFooter} alt={brand.name} />
                </Link>
              </div>
            </div>
            <div className="col-xl-6 col-lg-6">
              <div className="footerarea__copyright__content footerarea__copyright__content__2">
                <p>{footer.copyright}</p>
              </div>
            </div>
            <div className="col-xl-3 col-lg-3">
              <div className="footerarea__icon footerarea__icon__2">
                <ul>
                  {social.map((item) => (
                    <li key={item.platform}>
                      <a href={item.href} target="_blank" rel="noreferrer">
                        <i className={item.icon} />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
