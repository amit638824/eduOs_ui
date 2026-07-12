import { Link } from 'react-router-dom';
import { siteContent } from '@/data/siteContent';

export default function FooterMain() {
  const { footer } = siteContent;

  return (
    <div className="footerarea__wrapper footerarea__wrapper__2">
      <div className="row">
        {/* About */}
        <div className="col-xl-4 col-lg-4 col-md-6 col-sm-12" data-aos="fade-up">
          <div className="footerarea__inner footerarea__about__us">
            <div className="footerarea__heading">
              <h3>About us</h3>
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

        {/* Useful Links */}
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

        {/* Exam Categories */}
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

        {/* Recent Posts */}
        <div className="col-xl-3 col-lg-3 col-md-6 col-sm-12" data-aos="fade-up">
          <div className="footerarea__right__wraper footerarea__inner">
            <div className="footerarea__heading">
              <h3>Recent Post</h3>
            </div>
            <div className="footerarea__right__list">
              <ul>
                {footer.recentPosts.map((post) => (
                  <li key={post.href}>
                    <Link to={post.href}>
                      <div className="footerarea__right__img">
                        <img loading="lazy" src={post.image} alt={post.title} width={60} height={60} />
                      </div>
                      <div className="footerarea__right__content">
                        <span>{post.date}</span>
                        <h6>{post.title}</h6>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
