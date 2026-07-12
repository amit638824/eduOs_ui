import { siteContent } from '@/data/siteContent';

export default function AboutSection() {
  const { about } = siteContent;

  return (
    <div className="aboutarea__2 sp_top_30">
      <div className="container">
        <div className="row">
          <div className="col-xl-6 col-lg-6 col-md-12 col-sm-12 col-12" data-aos="fade-up">
            <div className="about__right__wraper__2">
              <div className="educationarea__img" data-tilt>
                <img loading="lazy" className="aboutarea__2__img__1" src="/img/about/about_2.png" alt="education" />
                <img loading="lazy" className="aboutarea__2__img__2" src="/img/about/about_3.png" alt="education" />
                <img loading="lazy" className="aboutarea__2__img__3" src="/img/about/about_4.png" alt="education" />
                <img loading="lazy" className="aboutarea__2__img__4" src="/img/about/about_11.png" alt="education" />
              </div>
              <div className="aboutarea__2__text">
                <div className="aboutarea__counter">
                  <span className="counter">{about.experienceYears}</span> +
                </div>
                <p>YEARS SERVING US EDUCATORS</p>
              </div>
            </div>
          </div>
          <div className="col-xl-6 col-lg-6 col-md-12 col-sm-12 col-12" data-aos="fade-up">
            <div className="aboutarea__content__wraper">
              <div className="aboutarea__button">
                <div className="default__small__button">{about.badge}</div>
              </div>
              <div className="aboutarea__headding heading__underline">
                <h2>
                  {about.title} <span>{about.highlight}</span> Center
                </h2>
              </div>
              <div className="aboutarea__para aboutarea__para__2">
                <p>{about.description}</p>
              </div>
              <div className="aboutarea__list__2">
                <ul>
                  {about.features.map((feature) => (
                    <li key={feature}>
                      <i className="icofont-check" /> {feature}
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
