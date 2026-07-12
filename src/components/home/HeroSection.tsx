import { Link } from 'react-router-dom';
import { siteContent } from '@/data/siteContent';

export default function HeroSection() {
  const { hero } = siteContent;

  return (
    <div className="herobannerarea herobannerarea__box">
      <div className="container">
        <div className="row">
          <div className="col-xl-6 col-lg-6 col-md-12 col-sm-12 col-12" data-aos="fade-up">
            <div className="herobannerarea__content__wraper">
              <div className="herobannerarea__title">
                <div className="herobannerarea__small__title">
                  <span>{hero.badge}</span>
                </div>
                <div className="herobannerarea__title__heading__2">
                  <h2>{hero.title}</h2>
                </div>
              </div>
              <div className="herobannerarea__text">
                <p>{hero.description}</p>
              </div>
              <div className="hreobannerarea__button">
                <Link className="herobannerarea__button__1" to={hero.primaryCta.href}>
                  {hero.primaryCta.label}
                </Link>
                <Link className="herobannerarea__button__2" to={hero.secondaryCta.href}>
                  {hero.secondaryCta.label}
                  <i className="icofont-long-arrow-right" />
                </Link>
              </div>
            </div>
          </div>
          <div className="col-xl-6 col-lg-6 col-md-12 col-sm-12 col-12" data-aos="fade-up">
            <div className="aboutarea__img__inner text-center">
              <div className="aboutarea__img" data-tilt>
                <img loading="lazy" className="aboutimg__1" src="/img/about/about_8.png" alt="Online exam platform" />
                <img loading="lazy" className="aboutimg__2" src="/img/about/about_1.png" alt="Student taking test" />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="herobannerarea__icon">
        <img loading="lazy" className="hero__icon__1" src="/img/register/register__2.png" alt="" />
        <img loading="lazy" className="hero__icon__2" src="/img/herobanner/herobanner__6.png" alt="" />
        <img loading="lazy" className="hero__icon__3" src="/img/herobanner/herobanner__7.png" alt="" />
        <img loading="lazy" className="hero__icon__4" src="/img/herobanner/herobanner__7.png" alt="" />
      </div>
    </div>
  );
}
